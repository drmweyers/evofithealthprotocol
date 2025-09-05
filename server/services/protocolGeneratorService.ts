import { db } from '../db.js';
import { 
  trainerHealthProtocols,
  protocolAssignments,
  InsertTrainerHealthProtocol,
  InsertProtocolAssignment
} from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Generate a health protocol from a saved protocol plan
 */
export async function generateProtocolFromPlan(
  wizardConfiguration: {
    protocolType: string;
    name: string;
    description: string;
    duration: number;
    intensity: string;
    category: string;
    targetAudience: string[];
    healthFocus: string[];
    experienceLevel: string;
    personalizations: {
      ageRange?: { min: number; max: number };
      healthConditions?: string[];
      dietaryRestrictions?: string[];
      culturalPreferences?: string[];
      specificGoals?: string[];
    };
    safetyValidation: {
      requiresHealthcareApproval: boolean;
      contraindications: string[];
      drugInteractions: string[];
      pregnancySafe: boolean;
      intensityWarnings: string[];
    };
    advancedOptions: {
      enableVersioning: boolean;
      enableEffectivenessTracking: boolean;
      allowCustomerModifications: boolean;
      includeProgressMilestones: boolean;
    };
  },
  customerId: string,
  trainerId: string
): Promise<any> {
  try {
    // Extract configuration from wizard data
    const {
      protocolType,
      name,
      description,
      duration,
      intensity,
      category,
      targetAudience,
      healthFocus,
      personalizations,
      safetyValidation,
      advancedOptions
    } = wizardConfiguration;

    // Create the health protocol
    const protocolData: InsertTrainerHealthProtocol = {
      trainerId,
      type: mapProtocolType(protocolType),
      name,
      description,
      duration,
      config: {
        intensity,
        category,
        targetAudience,
        healthFocus,
        experienceLevel: wizardConfiguration.experienceLevel,
        personalizations,
        safetySettings: safetyValidation,
        advancedSettings: advancedOptions,
        createdFromPlan: true,
      },
      isActive: true,
    };

    const [protocol] = await db.insert(trainerHealthProtocols)
      .values(protocolData)
      .returning()
      .execute();

    // Create protocol assignment for the customer
    const assignmentData: InsertProtocolAssignment = {
      protocolId: protocol.id,
      customerId,
      trainerId,
      status: 'active',
      startDate: new Date(),
      endDate: calculateEndDate(new Date(), duration),
      notes: `Generated from saved protocol plan`,
      progressData: {},
    };

    const [assignment] = await db.insert(protocolAssignments)
      .values(assignmentData)
      .returning()
      .execute();

    // Generate specialized content based on protocol type
    if (protocolType === 'longevity' || protocolType === 'parasite_cleanse') {
      await generateSpecializedProtocolContent(protocol.id, protocolType, wizardConfiguration);
    }

    // Generate ailments-based customizations if applicable
    if (protocolType === 'ailments_based' && personalizations.healthConditions) {
      await generateAilmentBasedCustomizations(protocol.id, personalizations.healthConditions);
    }

    // Generate progress milestones if enabled
    if (advancedOptions.includeProgressMilestones) {
      await generateProgressMilestones(protocol.id, duration);
    }

    return {
      ...protocol,
      assignment,
    };
  } catch (error) {
    console.error('Error generating protocol from plan:', error);
    throw new Error('Failed to generate protocol from plan');
  }
}

/**
 * Map wizard protocol type to database enum value
 */
function mapProtocolType(wizardType: string): string {
  const typeMap: Record<string, string> = {
    'general': 'general',
    'longevity': 'longevity',
    'parasite_cleanse': 'parasite_cleanse',
    'ailments_based': 'ailments_based',
  };
  
  return typeMap[wizardType] || 'general';
}

/**
 * Calculate end date based on start date and duration
 */
function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}

/**
 * Generate specialized protocol content for longevity or parasite cleanse protocols
 */
async function generateSpecializedProtocolContent(
  protocolId: string,
  protocolType: string,
  config: any
): Promise<void> {
  // This would integrate with your existing specialized protocol logic
  // For now, we'll just log that this would happen
  console.log(`Would generate ${protocolType} content for protocol ${protocolId}`);
  
  // In a real implementation, this would:
  // 1. Generate supplement recommendations
  // 2. Create phase-based instructions
  // 3. Set up tracking metrics
  // 4. Generate educational content
}

/**
 * Generate ailment-based customizations for the protocol
 */
async function generateAilmentBasedCustomizations(
  protocolId: string,
  healthConditions: string[]
): Promise<void> {
  // This would integrate with your existing ailments logic
  console.log(`Would generate ailment customizations for protocol ${protocolId}`, healthConditions);
  
  // In a real implementation, this would:
  // 1. Look up condition-specific recommendations
  // 2. Adjust protocol parameters based on conditions
  // 3. Add safety warnings and contraindications
  // 4. Generate condition-specific tracking metrics
}

/**
 * Generate progress milestones for the protocol
 */
async function generateProgressMilestones(
  protocolId: string,
  duration: number
): Promise<void> {
  // Generate weekly or bi-weekly milestones based on duration
  const milestoneInterval = duration <= 30 ? 7 : 14; // Weekly for short protocols, bi-weekly for longer
  const numberOfMilestones = Math.floor(duration / milestoneInterval);
  
  console.log(`Would generate ${numberOfMilestones} milestones for protocol ${protocolId}`);
  
  // In a real implementation, this would:
  // 1. Create milestone records in the database
  // 2. Set up automatic reminders
  // 3. Generate milestone-specific assessments
  // 4. Create progress tracking templates
}

/**
 * Validate that a wizard configuration has all required fields
 */
export function validateWizardConfiguration(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required fields validation
  if (!config.protocolType) {
    errors.push('Protocol type is required');
  }
  
  if (!config.name || config.name.trim() === '') {
    errors.push('Protocol name is required');
  }
  
  if (!config.duration || config.duration < 7 || config.duration > 365) {
    errors.push('Duration must be between 7 and 365 days');
  }
  
  if (!config.intensity) {
    errors.push('Intensity level is required');
  }
  
  if (!config.targetAudience || config.targetAudience.length === 0) {
    errors.push('At least one target audience is required');
  }
  
  if (!config.healthFocus || config.healthFocus.length === 0) {
    errors.push('At least one health focus area is required');
  }
  
  // Validate nested objects exist
  if (!config.personalizations) {
    errors.push('Personalizations configuration is required');
  }
  
  if (!config.safetyValidation) {
    errors.push('Safety validation configuration is required');
  }
  
  if (!config.advancedOptions) {
    errors.push('Advanced options configuration is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}