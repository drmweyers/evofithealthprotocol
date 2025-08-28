/**
 * Protocol Template API Routes
 * 
 * Provides endpoints for managing and using protocol templates
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { 
  getProtocolTemplates,
  getProtocolTemplate, 
  createProtocolTemplate,
  generateProtocolFromTemplate,
  saveProtocolFromTemplate,
  getPopularTemplateCategories,
  searchProtocolTemplates,
  getTemplateRecommendations
} from '../services/protocolTemplateEngine';
import { 
  createProtocolTemplateSchema,
  medicalSafetyValidationSchema,
  type CreateProtocolTemplate
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Validation schemas
const templateCustomizationSchema = z.object({
  duration: z.number().min(7).max(365).optional(),
  intensity: z.enum(['gentle', 'moderate', 'intensive']).optional(),
  personalizations: z.object({
    age: z.number().min(18).max(120).optional(),
    healthConditions: z.array(z.string()).optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    goals: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    culturalPreferences: z.array(z.string()).optional(),
  }).optional(),
  customConfig: z.record(z.any()).optional(),
});

const generateFromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  customization: templateCustomizationSchema,
  protocolName: z.string().optional(),
});

const saveFromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  customization: templateCustomizationSchema,
  protocolName: z.string().min(1).max(255),
});

/**
 * GET /api/protocol-templates
 * Get all available protocol templates with optional filtering
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      category,
      templateType,
      targetAudience,
      healthFocus,
      tags,
      isActive = 'true'
    } = req.query;

    const filters: any = {};
    
    if (category) filters.category = category as string;
    if (templateType) filters.templateType = templateType as string;
    if (targetAudience) filters.targetAudience = targetAudience as string;
    if (healthFocus) {
      filters.healthFocus = typeof healthFocus === 'string' 
        ? healthFocus.split(',') 
        : healthFocus as string[];
    }
    if (tags) {
      filters.tags = typeof tags === 'string' 
        ? tags.split(',') 
        : tags as string[];
    }
    filters.isActive = isActive === 'true';

    const templates = await getProtocolTemplates(filters);
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching protocol templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/protocol-templates/categories
 * Get popular template categories with usage statistics
 */
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const categories = await getPopularTemplateCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching template categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template categories'
    });
  }
});

/**
 * GET /api/protocol-templates/search
 * Search protocol templates by keyword
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q, category, templateType, difficulty } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const filters: any = {};
    if (category) filters.category = category as string;
    if (templateType) filters.templateType = templateType as string;
    if (difficulty) filters.difficulty = difficulty as string;
    
    const templates = await searchProtocolTemplates(q, filters);
    
    res.json({
      success: true,
      data: templates,
      query: q,
      count: templates.length
    });
  } catch (error) {
    console.error('Error searching protocol templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search protocol templates'
    });
  }
});

/**
 * GET /api/protocol-templates/recommendations
 * Get template recommendations for user profile
 */
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const {
      age,
      healthConditions,
      experience,
      goals,
      preferences
    } = req.query;
    
    const userProfile: any = {};
    
    if (age) userProfile.age = parseInt(age as string);
    if (healthConditions) {
      userProfile.healthConditions = typeof healthConditions === 'string' 
        ? healthConditions.split(',') 
        : healthConditions as string[];
    }
    if (experience) userProfile.experience = experience as string;
    if (goals) {
      userProfile.goals = typeof goals === 'string' 
        ? goals.split(',') 
        : goals as string[];
    }
    if (preferences) {
      userProfile.preferences = typeof preferences === 'string' 
        ? preferences.split(',') 
        : preferences as string[];
    }
    
    const recommendations = await getTemplateRecommendations(userProfile);
    
    res.json({
      success: true,
      data: recommendations,
      userProfile,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting template recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get template recommendations'
    });
  }
});

/**
 * GET /api/protocol-templates/:id
 * Get a specific protocol template by ID
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await getProtocolTemplate(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Protocol template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching protocol template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol template'
    });
  }
});

/**
 * POST /api/protocol-templates
 * Create a new protocol template (Admin/Trainer only)
 */
router.post('/', requireAuth, requireRole(['admin', 'trainer']), async (req, res) => {
  try {
    const templateData = createProtocolTemplateSchema.parse(req.body);
    const createdBy = req.user!.id;
    
    const template = await createProtocolTemplate(templateData, createdBy);
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Protocol template created successfully'
    });
  } catch (error) {
    console.error('Error creating protocol template:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create protocol template'
    });
  }
});

/**
 * POST /api/protocol-templates/:id/generate
 * Generate a customized protocol from a template
 */
router.post('/:id/generate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { customization } = generateFromTemplateSchema.parse({
      templateId: id,
      ...req.body
    });
    
    const trainerId = req.user!.id;
    
    const customizedProtocol = await generateProtocolFromTemplate(
      id,
      customization,
      trainerId
    );
    
    res.json({
      success: true,
      data: customizedProtocol,
      message: 'Protocol generated from template successfully'
    });
  } catch (error) {
    console.error('Error generating protocol from template:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customization data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate protocol from template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/protocol-templates/:id/save
 * Generate and save a customized protocol from a template
 */
router.post('/:id/save', requireAuth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { customization, protocolName } = saveFromTemplateSchema.parse({
      templateId: id,
      ...req.body
    });
    
    const trainerId = req.user!.id;
    
    // Generate the customized protocol
    const customizedProtocol = await generateProtocolFromTemplate(
      id,
      customization,
      trainerId
    );
    
    // Save it as a new trainer protocol
    const savedProtocol = await saveProtocolFromTemplate(
      customizedProtocol,
      trainerId,
      protocolName
    );
    
    res.status(201).json({
      success: true,
      data: {
        protocol: savedProtocol,
        customization: customizedProtocol
      },
      message: 'Protocol generated and saved successfully'
    });
  } catch (error) {
    console.error('Error saving protocol from template:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocol data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to save protocol from template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;