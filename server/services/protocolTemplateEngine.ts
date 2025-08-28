/**
 * Protocol Template Engine Service
 * 
 * Provides functionality for managing reusable protocol templates
 * and generating customized protocols from templates.
 */

import { db } from '../db';
import { 
  protocolTemplates, 
  trainerHealthProtocols,
  type ProtocolTemplate,
  type InsertProtocolTemplate,
  type CreateHealthProtocol,
  type CreateProtocolTemplate 
} from '@shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { generateHealthProtocol, type GeneratedHealthProtocol } from './openai';

export interface TemplateCustomization {
  duration?: number;
  intensity?: 'gentle' | 'moderate' | 'intensive';
  personalizations?: {
    age?: number;
    healthConditions?: string[];
    experience?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
    dietaryRestrictions?: string[];
    culturalPreferences?: string[];
  };
  customConfig?: Record<string, any>;
}

export interface CustomizedProtocolFromTemplate {
  templateId: string;
  templateName: string;
  customization: TemplateCustomization;
  generatedProtocol: GeneratedHealthProtocol;
  estimatedDuration: number;
  recommendedIntensity: string;
  personalizedFeatures: string[];
}

/**
 * Get all available protocol templates
 */
export async function getProtocolTemplates(filters?: {
  category?: string;
  templateType?: string;
  targetAudience?: string;
  healthFocus?: string[];
  tags?: string[];
  isActive?: boolean;
}): Promise<ProtocolTemplate[]> {
  try {
    let query = db.select().from(protocolTemplates);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(protocolTemplates.isActive, filters.isActive));
    }
    
    if (filters?.category) {
      conditions.push(eq(protocolTemplates.category, filters.category));
    }
    
    if (filters?.templateType) {
      conditions.push(eq(protocolTemplates.templateType, filters.templateType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const templates = await query.orderBy(desc(protocolTemplates.usageCount));
    
    // Additional filtering for JSONB fields (done in memory for simplicity)
    let filteredTemplates = templates;
    
    if (filters?.targetAudience) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.targetAudience?.includes(filters.targetAudience!)
      );
    }
    
    if (filters?.healthFocus?.length) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.healthFocus && filters.healthFocus!.some(focus => template.healthFocus.includes(focus))
      );
    }
    
    if (filters?.tags?.length) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.tags && filters.tags!.some(tag => template.tags.includes(tag))
      );
    }
    
    return filteredTemplates;
  } catch (error) {
    console.error('Error fetching protocol templates:', error);
    throw new Error('Failed to fetch protocol templates');
  }
}

/**
 * Get a specific protocol template by ID
 */
export async function getProtocolTemplate(templateId: string): Promise<ProtocolTemplate | null> {
  try {
    const [template] = await db
      .select()
      .from(protocolTemplates)
      .where(and(
        eq(protocolTemplates.id, templateId),
        eq(protocolTemplates.isActive, true)
      ))
      .limit(1);
    
    return template || null;
  } catch (error) {
    console.error('Error fetching protocol template:', error);
    throw new Error('Failed to fetch protocol template');
  }
}

/**
 * Create a new protocol template
 */
export async function createProtocolTemplate(
  templateData: CreateProtocolTemplate,
  createdBy: string
): Promise<ProtocolTemplate> {
  try {
    const [template] = await db
      .insert(protocolTemplates)
      .values({
        ...templateData,
        createdBy,
      })
      .returning();
    
    return template;
  } catch (error) {
    console.error('Error creating protocol template:', error);
    throw new Error('Failed to create protocol template');
  }
}

/**
 * Generate a customized protocol from a template
 */
export async function generateProtocolFromTemplate(
  templateId: string,
  customization: TemplateCustomization,
  trainerId: string
): Promise<CustomizedProtocolFromTemplate> {
  try {
    // Get the template
    const template = await getProtocolTemplate(templateId);
    if (!template) {
      throw new Error('Protocol template not found');
    }
    
    // Increment usage count
    await db
      .update(protocolTemplates)
      .set({ 
        usageCount: sql`${protocolTemplates.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(protocolTemplates.id, templateId));
    
    // Merge template config with customizations
    const mergedConfig = {
      ...(template.baseConfig || {}),
      ...(customization.customConfig || {}),
    };
    
    // Determine final parameters
    const duration = customization.duration || template.defaultDuration;
    const intensity = customization.intensity || template.defaultIntensity;
    
    // Build personalized prompt based on template and customizations
    const personalizedPrompt = buildPersonalizedPrompt(template, customization, mergedConfig);
    
    // Generate protocol using AI
    const generatedProtocol = await generateHealthProtocol({
      protocolType: template.templateType as any,
      intensity: intensity as "gentle" | "moderate" | "intensive",
      duration,
      userAge: customization.personalizations?.age,
      healthConditions: customization.personalizations?.healthConditions || [],
      currentMedications: [],
      experience: customization.personalizations?.experience || 'beginner',
      specificGoals: customization.personalizations?.goals || [],
      naturalLanguagePrompt: personalizedPrompt
    });
    
    // Identify personalized features
    const personalizedFeatures = identifyPersonalizedFeatures(template, customization);
    
    return {
      templateId,
      templateName: template.name,
      customization,
      generatedProtocol,
      estimatedDuration: duration,
      recommendedIntensity: intensity,
      personalizedFeatures
    };
    
  } catch (error) {
    console.error('Error generating protocol from template:', error);
    throw new Error('Failed to generate protocol from template');
  }
}

/**
 * Save a generated protocol from template as a new trainer protocol
 */
export async function saveProtocolFromTemplate(
  customizedProtocol: CustomizedProtocolFromTemplate,
  trainerId: string,
  protocolName?: string
): Promise<any> {
  try {
    const protocolData = {
      name: protocolName || `${customizedProtocol.templateName} (Customized)`,
      description: customizedProtocol.generatedProtocol.description,
      type: customizedProtocol.generatedProtocol.type,
      duration: customizedProtocol.estimatedDuration,
      intensity: customizedProtocol.recommendedIntensity as any,
      config: {
        ...customizedProtocol.generatedProtocol.config,
        templateId: customizedProtocol.templateId,
        customization: customizedProtocol.customization,
        personalizedFeatures: customizedProtocol.personalizedFeatures,
        generatedRecommendations: customizedProtocol.generatedProtocol.recommendations
      },
      tags: [
        ...customizedProtocol.generatedProtocol.tags,
        'template-generated',
        `template-${customizedProtocol.templateId.slice(0, 8)}`
      ],
    };
    
    const [savedProtocol] = await db
      .insert(trainerHealthProtocols)
      .values({
        ...protocolData,
        trainerId,
      })
      .returning();
    
    return savedProtocol;
  } catch (error) {
    console.error('Error saving protocol from template:', error);
    throw new Error('Failed to save protocol from template');
  }
}

/**
 * Get popular template categories
 */
export async function getPopularTemplateCategories(): Promise<Array<{
  category: string;
  count: number;
  totalUsage: number;
  avgRating?: number;
}>> {
  try {
    const result = await db
      .select({
        category: protocolTemplates.category,
        count: sql<number>`count(*)`,
        totalUsage: sql<number>`sum(${protocolTemplates.usageCount})`,
      })
      .from(protocolTemplates)
      .where(eq(protocolTemplates.isActive, true))
      .groupBy(protocolTemplates.category)
      .orderBy(sql`sum(${protocolTemplates.usageCount}) desc`);
    
    return result;
  } catch (error) {
    console.error('Error fetching popular template categories:', error);
    throw new Error('Failed to fetch popular template categories');
  }
}

/**
 * Search templates by keyword
 */
export async function searchProtocolTemplates(
  searchQuery: string,
  filters?: {
    category?: string;
    templateType?: string;
    difficulty?: string;
  }
): Promise<ProtocolTemplate[]> {
  try {
    const searchTerm = `%${searchQuery.toLowerCase()}%`;
    
    // Apply additional filters
    const conditions = [
      eq(protocolTemplates.isActive, true),
      sql`(
        lower(${protocolTemplates.name}) LIKE ${searchTerm} OR
        lower(${protocolTemplates.description}) LIKE ${searchTerm} OR
        ${protocolTemplates.tags}::text ILIKE ${searchTerm}
      )`
    ];
    
    if (filters?.category) {
      conditions.push(eq(protocolTemplates.category, filters.category));
    }
    
    if (filters?.templateType) {
      conditions.push(eq(protocolTemplates.templateType, filters.templateType));
    }
    
    const templates = await db
      .select()
      .from(protocolTemplates)
      .where(and(...conditions))
      .orderBy(desc(protocolTemplates.usageCount))
      .limit(20);
    
    return templates;
  } catch (error) {
    console.error('Error searching protocol templates:', error);
    throw new Error('Failed to search protocol templates');
  }
}

/**
 * Build personalized prompt based on template and customizations
 */
function buildPersonalizedPrompt(
  template: ProtocolTemplate,
  customization: TemplateCustomization,
  mergedConfig: any
): string {
  const parts = [
    `Generate a personalized ${template.templateType.replace('_', ' ')} protocol based on the "${template.name}" template.`,
    `Template Description: ${template.description}`,
  ];
  
  if (customization.personalizations?.age) {
    parts.push(`Client Age: ${customization.personalizations.age} years`);
  }
  
  if (customization.personalizations?.healthConditions?.length) {
    parts.push(`Health Conditions: ${customization.personalizations.healthConditions.join(', ')}`);
  }
  
  if (customization.personalizations?.experience) {
    parts.push(`Experience Level: ${customization.personalizations.experience}`);
  }
  
  if (customization.personalizations?.goals?.length) {
    parts.push(`Personal Goals: ${customization.personalizations.goals.join(', ')}`);
  }
  
  if (customization.personalizations?.dietaryRestrictions?.length) {
    parts.push(`Dietary Restrictions: ${customization.personalizations.dietaryRestrictions.join(', ')}`);
  }
  
  if (customization.personalizations?.culturalPreferences?.length) {
    parts.push(`Cultural Preferences: ${customization.personalizations.culturalPreferences.join(', ')}`);
  }
  
  parts.push(`Duration: ${customization.duration || template.defaultDuration} days`);
  parts.push(`Intensity: ${customization.intensity || template.defaultIntensity}`);
  
  parts.push(`Template Configuration: ${JSON.stringify(mergedConfig, null, 2)}`);
  
  parts.push(`
REQUIREMENTS:
- Maintain the core principles of the ${template.name} template
- Adapt the protocol based on the personal customizations provided
- Ensure the protocol is safe and appropriate for the client's profile
- Include detailed meal plans, schedules, and implementation guidance
- Provide clear safety disclaimers and healthcare provider consultation recommendations
  `);
  
  return parts.join('\n\n');
}

/**
 * Identify personalized features applied to the template
 */
function identifyPersonalizedFeatures(
  template: ProtocolTemplate,
  customization: TemplateCustomization
): string[] {
  const features: string[] = [];
  
  if (customization.duration && customization.duration !== template.defaultDuration) {
    features.push(`Custom duration: ${customization.duration} days (default: ${template.defaultDuration})`);
  }
  
  if (customization.intensity && customization.intensity !== template.defaultIntensity) {
    features.push(`Custom intensity: ${customization.intensity} (default: ${template.defaultIntensity})`);
  }
  
  if (customization.personalizations?.age) {
    features.push(`Age-adapted for ${customization.personalizations.age} years old`);
  }
  
  if (customization.personalizations?.healthConditions?.length) {
    features.push(`Adapted for health conditions: ${customization.personalizations.healthConditions.join(', ')}`);
  }
  
  if (customization.personalizations?.dietaryRestrictions?.length) {
    features.push(`Accommodates dietary restrictions: ${customization.personalizations.dietaryRestrictions.join(', ')}`);
  }
  
  if (customization.personalizations?.culturalPreferences?.length) {
    features.push(`Includes cultural preferences: ${customization.personalizations.culturalPreferences.join(', ')}`);
  }
  
  if (customization.personalizations?.experience) {
    features.push(`Tailored for ${customization.personalizations.experience} experience level`);
  }
  
  if (customization.personalizations?.goals?.length) {
    features.push(`Focused on goals: ${customization.personalizations.goals.join(', ')}`);
  }
  
  return features;
}

/**
 * Get template recommendations for a user profile
 */
export async function getTemplateRecommendations(userProfile: {
  age?: number;
  healthConditions?: string[];
  experience?: string;
  goals?: string[];
  preferences?: string[];
}): Promise<ProtocolTemplate[]> {
  try {
    const templates = await getProtocolTemplates({ isActive: true });
    
    // Score templates based on user profile match
    const scoredTemplates = templates.map(template => {
      let score = 0;
      
      // Match target audience with experience
      if (userProfile.experience && template.targetAudience?.includes(userProfile.experience)) {
        score += 3;
      }
      
      // Match health focus with conditions/goals
      if (userProfile.healthConditions?.length && template.healthFocus) {
        const matchingFocus = template.healthFocus.filter(focus => 
          userProfile.healthConditions!.some(condition => 
            focus.toLowerCase().includes(condition.toLowerCase()) ||
            condition.toLowerCase().includes(focus.toLowerCase())
          )
        );
        score += matchingFocus.length * 2;
      }
      
      if (userProfile.goals?.length && template.healthFocus) {
        const matchingFocus = template.healthFocus.filter(focus => 
          userProfile.goals!.some(goal => 
            focus.toLowerCase().includes(goal.toLowerCase()) ||
            goal.toLowerCase().includes(focus.toLowerCase())
          )
        );
        score += matchingFocus.length * 2;
      }
      
      // Boost popular templates
      score += Math.min((template.usageCount || 0) / 10, 5);
      
      return { template, score };
    });
    
    // Return top 5 recommendations
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ template }) => template);
    
  } catch (error) {
    console.error('Error getting template recommendations:', error);
    throw new Error('Failed to get template recommendations');
  }
}