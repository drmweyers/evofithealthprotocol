/**
 * Medical Safety Validation Service
 * 
 * Provides AI-powered safety validation for health protocols
 * against medications, health conditions, and allergies.
 */

import { db } from '../db';
import { 
  medicalSafetyValidations,
  protocolAssignments,
  trainerHealthProtocols,
  type MedicalSafetyValidation,
  type InsertMedicalSafetyValidation
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { analyzeProtocolInteractions } from './openai';

export interface SafetyValidationRequest {
  protocolId: string;
  customerId: string;
  medications?: string[];
  healthConditions?: string[];
  allergies?: string[];
  forceRevalidation?: boolean;
}

export interface SafetyValidationResult {
  id: string;
  safetyRating: 'safe' | 'caution' | 'warning' | 'contraindicated';
  interactions: Array<{
    type: 'medication' | 'condition' | 'allergy';
    item: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  generalRecommendations: string[];
  validatedAt: Date;
  expiresAt: Date | null;
  requiresHealthcareApproval: boolean;
  canProceedWithCaution: boolean;
}

export interface DrugInteractionDatabase {
  [medication: string]: {
    interactions: Array<{
      substance: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }>;
    contraindications: string[];
    warnings: string[];
  };
}

/**
 * Basic drug interaction database
 * In production, this would connect to a comprehensive medical database
 */
const DRUG_INTERACTION_DATABASE: DrugInteractionDatabase = {
  'warfarin': {
    interactions: [
      {
        substance: 'garlic',
        severity: 'medium',
        description: 'Garlic may increase the anticoagulant effect of warfarin',
        recommendation: 'Monitor INR closely if consuming large amounts of garlic'
      },
      {
        substance: 'turmeric',
        severity: 'medium', 
        description: 'Turmeric may enhance the anticoagulant effect',
        recommendation: 'Avoid high doses of turmeric supplements'
      },
      {
        substance: 'ginger',
        severity: 'low',
        description: 'Ginger may have mild anticoagulant effects',
        recommendation: 'Use moderate amounts, monitor for bleeding'
      }
    ],
    contraindications: ['active bleeding', 'severe liver disease'],
    warnings: ['Monitor INR regularly', 'Avoid alcohol excess', 'Report unusual bleeding']
  },
  'insulin': {
    interactions: [
      {
        substance: 'chromium',
        severity: 'medium',
        description: 'Chromium may enhance insulin sensitivity',
        recommendation: 'Monitor blood glucose closely'
      },
      {
        substance: 'cinnamon',
        severity: 'low',
        description: 'Cinnamon may lower blood glucose',
        recommendation: 'Monitor blood sugar when using cinnamon supplements'
      }
    ],
    contraindications: ['hypoglycemia'],
    warnings: ['Monitor blood glucose regularly', 'Adjust dosing as needed']
  },
  'metformin': {
    interactions: [
      {
        substance: 'berberine',
        severity: 'medium',
        description: 'Berberine may enhance glucose-lowering effects',
        recommendation: 'Monitor blood glucose closely'
      }
    ],
    contraindications: ['severe kidney disease', 'severe liver disease'],
    warnings: ['Monitor kidney function', 'Stop before contrast procedures']
  },
  'lisinopril': {
    interactions: [
      {
        substance: 'potassium',
        severity: 'high',
        description: 'ACE inhibitors can increase potassium levels',
        recommendation: 'Avoid high-potassium supplements and foods'
      }
    ],
    contraindications: ['pregnancy', 'angioedema history'],
    warnings: ['Monitor kidney function and potassium levels']
  },
  'synthroid': {
    interactions: [
      {
        substance: 'soy',
        severity: 'medium',
        description: 'Soy may interfere with thyroid hormone absorption',
        recommendation: 'Take thyroid medication 4 hours before soy consumption'
      },
      {
        substance: 'calcium',
        severity: 'medium',
        description: 'Calcium can reduce thyroid hormone absorption',
        recommendation: 'Take thyroid medication 4 hours before calcium supplements'
      }
    ],
    contraindications: ['untreated adrenal insufficiency'],
    warnings: ['Take on empty stomach', 'Monitor thyroid function']
  }
};

/**
 * Validate protocol safety for a specific customer
 */
export async function validateProtocolSafety(
  request: SafetyValidationRequest
): Promise<SafetyValidationResult> {
  try {
    // Check for existing valid validation
    if (!request.forceRevalidation) {
      const existingValidation = await getExistingValidation(
        request.protocolId,
        request.customerId
      );
      
      if (existingValidation && 
          (!existingValidation.expiresAt || existingValidation.expiresAt > new Date())) {
        return formatValidationResult(existingValidation);
      }
    }
    
    // Get protocol details
    const [protocol] = await db
      .select()
      .from(trainerHealthProtocols)
      .where(eq(trainerHealthProtocols.id, request.protocolId))
      .limit(1);
    
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Perform basic safety checks
    const basicSafetyCheck = performBasicSafetyChecks(request);
    
    // Perform AI-powered interaction analysis
    const aiAnalysis = await analyzeProtocolInteractions(
      protocol.config,
      request.medications || [],
      request.healthConditions || []
    );
    
    // Combine basic and AI analysis
    const combinedAnalysis = combineAnalysisResults(basicSafetyCheck, aiAnalysis);
    
    // Calculate expiration (medications may change)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 months validity
    
    // Save validation result
    const [savedValidation] = await db
      .insert(medicalSafetyValidations)
      .values({
        protocolId: request.protocolId,
        customerId: request.customerId,
        medications: request.medications || [],
        healthConditions: request.healthConditions || [],
        allergies: request.allergies || [],
        safetyRating: combinedAnalysis.safetyRating,
        interactions: combinedAnalysis.interactions,
        recommendations: combinedAnalysis.generalRecommendations,
        expiresAt,
        validatedBy: 'system',
      })
      .returning();
    
    return formatValidationResult(savedValidation);
    
  } catch (error) {
    console.error('Error validating protocol safety:', error);
    throw new Error('Failed to validate protocol safety');
  }
}

/**
 * Get existing validation for protocol and customer
 */
async function getExistingValidation(
  protocolId: string,
  customerId: string
): Promise<MedicalSafetyValidation | null> {
  try {
    const [validation] = await db
      .select()
      .from(medicalSafetyValidations)
      .where(
        and(
          eq(medicalSafetyValidations.protocolId, protocolId),
          eq(medicalSafetyValidations.customerId, customerId),
          eq(medicalSafetyValidations.isActive, true)
        )
      )
      .orderBy(desc(medicalSafetyValidations.validatedAt))
      .limit(1);
    
    return validation || null;
  } catch (error) {
    console.error('Error fetching existing validation:', error);
    return null;
  }
}

/**
 * Perform basic safety checks using local drug database
 */
function performBasicSafetyChecks(request: SafetyValidationRequest): {
  safetyRating: 'safe' | 'caution' | 'warning' | 'contraindicated';
  interactions: Array<{
    type: 'medication' | 'condition' | 'allergy';
    item: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  generalRecommendations: string[];
} {
  const interactions: any[] = [];
  const recommendations: string[] = [];
  let maxSeverity: 'low' | 'medium' | 'high' = 'low';
  let hasContraindications = false;
  
  // Check medication interactions
  if (request.medications?.length) {
    for (const medication of request.medications) {
      const drugData = DRUG_INTERACTION_DATABASE[medication.toLowerCase()];
      if (drugData) {
        // Add drug-specific interactions
        for (const interaction of drugData.interactions) {
          interactions.push({
            type: 'medication' as const,
            item: medication,
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation
          });
          
          if (interaction.severity === 'high') maxSeverity = 'high';
          else if (interaction.severity === 'medium' && maxSeverity !== 'high') maxSeverity = 'medium';
        }
        
        // Add general warnings
        recommendations.push(...drugData.warnings.map(warning => 
          `${medication}: ${warning}`
        ));
        
        // Check contraindications
        if (drugData.contraindications.length > 0) {
          hasContraindications = true;
          recommendations.push(`${medication}: Check for contraindications - ${drugData.contraindications.join(', ')}`);
        }
      }
    }
  }
  
  // Check health condition considerations
  if (request.healthConditions?.length) {
    for (const condition of request.healthConditions) {
      const conditionCheck = checkHealthCondition(condition);
      if (conditionCheck) {
        interactions.push({
          type: 'condition' as const,
          item: condition,
          severity: conditionCheck.severity,
          description: conditionCheck.description,
          recommendation: conditionCheck.recommendation
        });
        
        if (conditionCheck.severity === 'high') maxSeverity = 'high';
        else if (conditionCheck.severity === 'medium' && maxSeverity !== 'high') maxSeverity = 'medium';
      }
    }
  }
  
  // Determine overall safety rating
  let safetyRating: 'safe' | 'caution' | 'warning' | 'contraindicated';
  if (hasContraindications || interactions.some(i => i.severity === 'high')) {
    safetyRating = 'contraindicated';
  } else if (maxSeverity === 'high') {
    safetyRating = 'warning';
  } else if (maxSeverity === 'medium' || interactions.length > 0) {
    safetyRating = 'caution';
  } else {
    safetyRating = 'safe';
  }
  
  // Add general recommendations
  recommendations.push(
    'Consult with your healthcare provider before starting this protocol',
    'Monitor for any unusual symptoms or side effects',
    'Inform your healthcare provider of any changes in medications'
  );
  
  return {
    safetyRating,
    interactions,
    generalRecommendations: recommendations
  };
}

/**
 * Check specific health conditions for protocol considerations
 */
function checkHealthCondition(condition: string): {
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
} | null {
  const conditionLower = condition.toLowerCase();
  
  const conditionChecks: { [key: string]: any } = {
    'pregnancy': {
      severity: 'high' as const,
      description: 'Many protocol components are not safe during pregnancy',
      recommendation: 'Avoid detox and cleanse protocols during pregnancy. Focus on gentle, pregnancy-safe nutrition.'
    },
    'breastfeeding': {
      severity: 'high' as const,
      description: 'Cleanse protocols can affect breast milk quality',
      recommendation: 'Avoid intensive protocols while breastfeeding. Focus on gentle, nourishing foods.'
    },
    'kidney disease': {
      severity: 'high' as const,
      description: 'Kidney disease requires careful monitoring of protein and electrolyte intake',
      recommendation: 'Require healthcare provider approval. Monitor kidney function closely.'
    },
    'liver disease': {
      severity: 'high' as const,
      description: 'Liver disease affects detoxification and supplement metabolism',
      recommendation: 'Require healthcare provider approval. Avoid detox protocols.'
    },
    'diabetes': {
      severity: 'medium' as const,
      description: 'Dietary changes can affect blood sugar control',
      recommendation: 'Monitor blood glucose closely. Adjust medications as needed with healthcare provider.'
    },
    'heart disease': {
      severity: 'medium' as const,
      description: 'Heart conditions may be affected by dietary and supplement changes',
      recommendation: 'Monitor cardiovascular symptoms. Ensure adequate nutrition.'
    },
    'high blood pressure': {
      severity: 'medium' as const,
      description: 'Some protocol components may affect blood pressure',
      recommendation: 'Monitor blood pressure regularly. Be cautious with sodium and supplements.'
    }
  };
  
  for (const [key, check] of Object.entries(conditionChecks)) {
    if (conditionLower.includes(key)) {
      return check;
    }
  }
  
  return null;
}

/**
 * Combine basic safety checks with AI analysis
 */
function combineAnalysisResults(
  basicCheck: any,
  aiAnalysis: any
): {
  safetyRating: 'safe' | 'caution' | 'warning' | 'contraindicated';
  interactions: any[];
  generalRecommendations: string[];
} {
  // Combine interactions
  const combinedInteractions = [
    ...basicCheck.interactions,
    ...aiAnalysis.interactions
  ];
  
  // Combine recommendations
  const combinedRecommendations = [
    ...basicCheck.generalRecommendations,
    ...aiAnalysis.generalRecommendations
  ].filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates
  
  // Determine most conservative safety rating
  const ratings = ['safe', 'caution', 'warning', 'contraindicated'];
  const basicRatingIndex = ratings.indexOf(basicCheck.safetyRating);
  const aiRatingIndex = ratings.indexOf(aiAnalysis.safetyRating);
  const finalRatingIndex = Math.max(basicRatingIndex, aiRatingIndex);
  const finalRating = ratings[finalRatingIndex] as any;
  
  return {
    safetyRating: finalRating,
    interactions: combinedInteractions,
    generalRecommendations: combinedRecommendations
  };
}

/**
 * Format validation result for API response
 */
function formatValidationResult(validation: MedicalSafetyValidation): SafetyValidationResult {
  return {
    id: validation.id,
    safetyRating: validation.safetyRating as any,
    interactions: validation.interactions as any,
    generalRecommendations: validation.recommendations,
    validatedAt: validation.validatedAt,
    expiresAt: validation.expiresAt,
    requiresHealthcareApproval: validation.safetyRating === 'contraindicated' || 
                               validation.safetyRating === 'warning',
    canProceedWithCaution: validation.safetyRating === 'safe' || 
                          validation.safetyRating === 'caution'
  };
}

/**
 * Get safety validation history for a customer
 */
export async function getCustomerSafetyHistory(customerId: string): Promise<SafetyValidationResult[]> {
  try {
    const validations = await db
      .select()
      .from(medicalSafetyValidations)
      .where(eq(medicalSafetyValidations.customerId, customerId))
      .orderBy(desc(medicalSafetyValidations.validatedAt))
      .limit(10);
    
    return validations.map(formatValidationResult);
  } catch (error) {
    console.error('Error fetching customer safety history:', error);
    throw new Error('Failed to fetch customer safety history');
  }
}

/**
 * Update customer medical information and revalidate protocols
 */
export async function updateCustomerMedicalInfo(
  customerId: string,
  medicalInfo: {
    medications?: string[];
    healthConditions?: string[];
    allergies?: string[];
  }
): Promise<SafetyValidationResult[]> {
  try {
    // Get all active protocol assignments for customer
    const assignments = await db
      .select({ protocolId: protocolAssignments.protocolId })
      .from(protocolAssignments)
      .where(
        and(
          eq(protocolAssignments.customerId, customerId),
          eq(protocolAssignments.status, 'active')
        )
      );
    
    const revalidationResults: SafetyValidationResult[] = [];
    
    // Revalidate each active protocol
    for (const assignment of assignments) {
      const validationResult = await validateProtocolSafety({
        protocolId: assignment.protocolId,
        customerId,
        ...medicalInfo,
        forceRevalidation: true
      });
      
      revalidationResults.push(validationResult);
    }
    
    return revalidationResults;
  } catch (error) {
    console.error('Error updating customer medical info:', error);
    throw new Error('Failed to update customer medical information');
  }
}