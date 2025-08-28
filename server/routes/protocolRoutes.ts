import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { 
  trainerHealthProtocols, 
  protocolTemplates, 
  protocolVersions, 
  medicalSafetyValidations,
  protocolEffectiveness,
  users 
} from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Cache for AI responses (simple in-memory cache for demo)
const aiCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * STORY-004: Health Protocol Generation Optimization API Endpoints
 */

// Protocol Templates API
router.get('/templates', requireAuth, async (req: Request, res: Response) => {
  try {
    const templates = await db.select().from(protocolTemplates);
    
    res.json({
      status: 'success',
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching protocol templates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch protocol templates'
    });
  }
});

// Get specific template by ID
router.get('/templates/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await db.select()
      .from(protocolTemplates)
      .where(eq(protocolTemplates.id, id))
      .limit(1);
    
    if (template.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }
    
    res.json({
      status: 'success',
      data: template[0]
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch template'
    });
  }
});

// Create Protocol (with AI generation)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, templateId, clientAge, healthGoals, customizations, generateWithAI } = req.body;
    const userId = (req as any).user.id;
    
    if (!name || !templateId) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and template ID are required'
      });
    }
    
    // Get template
    const template = await db.select()
      .from(protocolTemplates)
      .where(eq(protocolTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }
    
    let protocolContent = template[0].content;
    
    // Generate with AI if requested
    if (generateWithAI && openai) {
      const cacheKey = JSON.stringify({ templateId, clientAge, healthGoals });
      const cached = aiCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        protocolContent = cached.response;
      } else {
        try {
          const prompt = `
            Based on the ${template[0].name} template, create a personalized health protocol for:
            - Age: ${clientAge}
            - Health Goals: ${JSON.stringify(healthGoals)}
            - Customizations: ${JSON.stringify(customizations)}
            
            Template Content: ${template[0].content}
            
            Please provide a detailed, personalized protocol with specific recommendations.
          `;
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a professional health protocol advisor. Create safe, evidence-based health recommendations.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000
          });
          
          protocolContent = completion.choices[0]?.message?.content || protocolContent;
          
          // Cache the response
          aiCache.set(cacheKey, {
            response: protocolContent,
            timestamp: Date.now()
          });
        } catch (aiError) {
          console.error('OpenAI generation failed:', aiError);
          // Continue with template content as fallback
        }
      }
    }
    
    // Create protocol
    const [protocol] = await db.insert(trainerHealthProtocols).values({
      id: crypto.randomUUID(),
      name,
      templateId,
      content: protocolContent,
      createdBy: userId,
      status: 'draft',
      version: 1,
      clientAge: clientAge || null,
      healthGoals: healthGoals || null,
      customizations: customizations || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json({
      status: 'success',
      data: protocol
    });
  } catch (error) {
    console.error('Error creating protocol:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create protocol'
    });
  }
});

// Medical Safety Validation
router.post('/safety-check', async (req: Request, res: Response) => {
  try {
    const { medications, conditions, age, protocolType, pregnancy } = req.body;
    
    // Simple drug interaction database (expanded version)
    const drugInteractions = {
      'warfarin': {
        interactsWith: ['aspirin', 'ibuprofen', 'turmeric', 'ginkgo', 'garlic supplements'],
        riskLevel: 'high',
        warning: 'Blood thinning medications may interact with supplements'
      },
      'metformin': {
        interactsWith: ['berberine', 'chromium'],
        riskLevel: 'moderate',
        warning: 'May enhance blood sugar lowering effects'
      },
      'levothyroxine': {
        interactsWith: ['iron', 'calcium', 'soy', 'coffee'],
        riskLevel: 'moderate',
        warning: 'May interfere with thyroid medication absorption'
      }
    };
    
    const validationResult = {
      overallRisk: 'low',
      interactions: [],
      contraindications: [],
      recommendations: [],
      requiresApproval: false
    };
    
    // Check drug interactions
    if (medications && Array.isArray(medications)) {
      medications.forEach((med: string) => {
        const medLower = med.toLowerCase();
        if (drugInteractions[medLower as keyof typeof drugInteractions]) {
          const interaction = drugInteractions[medLower as keyof typeof drugInteractions];
          validationResult.interactions.push({
            medication: med,
            riskLevel: interaction.riskLevel,
            warning: interaction.warning,
            interactsWith: interaction.interactsWith
          });
          
          if (interaction.riskLevel === 'high') {
            validationResult.overallRisk = 'high';
            validationResult.requiresApproval = true;
          }
        }
      });
    }
    
    // Age-based risk assessment
    if (age) {
      if (age > 65) {
        validationResult.recommendations.push('Consult healthcare provider due to age considerations');
        if (protocolType === 'parasite-cleanse') {
          validationResult.requiresApproval = true;
        }
      }
      
      if (age < 18) {
        validationResult.contraindications.push('Protocol not suitable for minors without medical supervision');
        validationResult.requiresApproval = true;
      }
    }
    
    // Pregnancy check
    if (pregnancy) {
      validationResult.contraindications.push('Protocol not recommended during pregnancy');
      validationResult.overallRisk = 'high';
      validationResult.requiresApproval = true;
    }
    
    // Condition-specific checks
    if (conditions && Array.isArray(conditions)) {
      conditions.forEach((condition: string) => {
        if (condition.toLowerCase().includes('diabetes') && protocolType === 'parasite-cleanse') {
          validationResult.recommendations.push('Monitor blood sugar closely during protocol');
        }
        
        if (condition.toLowerCase().includes('heart') && protocolType === 'detox-protocol') {
          validationResult.requiresApproval = true;
          validationResult.recommendations.push('Cardiovascular monitoring recommended');
        }
      });
    }
    
    // Store validation result
    if ((req as any).user?.id) {
      await db.insert(medicalSafetyValidations).values({
        id: crypto.randomUUID(),
        userId: (req as any).user.id,
        protocolType,
        medications: JSON.stringify(medications || []),
        conditions: JSON.stringify(conditions || []),
        age: age || null,
        riskLevel: validationResult.overallRisk,
        interactions: JSON.stringify(validationResult.interactions),
        requiresApproval: validationResult.requiresApproval,
        validatedAt: new Date()
      });
    }
    
    res.json({
      status: 'success',
      data: validationResult
    });
  } catch (error) {
    console.error('Error in safety validation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate safety'
    });
  }
});

// Protocol Versioning
router.get('/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const versions = await db.select()
      .from(protocolVersions)
      .where(eq(protocolVersions.protocolId, id))
      .orderBy(desc(protocolVersions.version));
    
    res.json({
      status: 'success',
      data: versions,
      count: versions.length
    });
  } catch (error) {
    console.error('Error fetching protocol versions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch protocol versions'
    });
  }
});

// Create new protocol version
router.post('/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, changelog } = req.body;
    const userId = (req as any).user.id;
    
    // Get current highest version
    const currentVersions = await db.select()
      .from(protocolVersions)
      .where(eq(protocolVersions.protocolId, id))
      .orderBy(desc(protocolVersions.version))
      .limit(1);
    
    const newVersion = currentVersions.length > 0 ? currentVersions[0].version + 1 : 1;
    
    const [version] = await db.insert(protocolVersions).values({
      id: crypto.randomUUID(),
      protocolId: id,
      version: newVersion,
      content,
      changelog: changelog || 'Updated protocol content',
      createdBy: userId,
      createdAt: new Date()
    }).returning();
    
    // Update main protocol
    await db.update(trainerHealthProtocols)
      .set({ 
        content, 
        version: newVersion, 
        updatedAt: new Date() 
      })
      .where(eq(trainerHealthProtocols.id, id));
    
    res.status(201).json({
      status: 'success',
      data: version
    });
  } catch (error) {
    console.error('Error creating protocol version:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create protocol version'
    });
  }
});

// Protocol Effectiveness Analytics
router.get('/analytics/effectiveness', requireAuth, async (req: Request, res: Response) => {
  try {
    const effectiveness = await db.select()
      .from(protocolEffectiveness)
      .orderBy(desc(protocolEffectiveness.createdAt));
    
    // Calculate aggregate statistics
    const totalProtocols = effectiveness.length;
    const avgSatisfaction = effectiveness.length > 0 
      ? effectiveness.reduce((sum, item) => sum + (item.satisfactionScore || 0), 0) / totalProtocols
      : 0;
    const avgAdherence = effectiveness.length > 0
      ? effectiveness.reduce((sum, item) => sum + (item.adherenceRate || 0), 0) / totalProtocols
      : 0;
    
    const analytics = {
      summary: {
        totalProtocols,
        averageSatisfactionScore: Math.round(avgSatisfaction * 10) / 10,
        averageAdherenceRate: Math.round(avgAdherence * 10) / 10,
        successRate: effectiveness.filter(item => (item.satisfactionScore || 0) >= 7).length / totalProtocols * 100
      },
      protocols: effectiveness.slice(0, 20), // Latest 20 for performance
      recommendations: [
        {
          category: 'Duration Optimization',
          suggestion: avgAdherence < 70 ? 'Consider shorter protocol durations to improve adherence' : 'Current durations appear optimal'
        },
        {
          category: 'Satisfaction Improvement',
          suggestion: avgSatisfaction < 7 ? 'Review protocols with low satisfaction scores for improvement opportunities' : 'Satisfaction levels are good'
        }
      ]
    };
    
    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching effectiveness analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch effectiveness analytics'
    });
  }
});

// Progress Correlation
router.post('/progress-correlation', requireAuth, async (req: Request, res: Response) => {
  try {
    const { protocolId, clientProgress } = req.body;
    
    if (!protocolId || !clientProgress) {
      return res.status(400).json({
        status: 'error',
        message: 'Protocol ID and client progress are required'
      });
    }
    
    // Store progress correlation data
    const [correlation] = await db.insert(protocolEffectiveness).values({
      id: crypto.randomUUID(),
      protocolId,
      clientId: (req as any).user.id,
      satisfactionScore: clientProgress.satisfaction || null,
      adherenceRate: clientProgress.adherence || null,
      progressMetrics: JSON.stringify(clientProgress.metrics || {}),
      weekNumber: clientProgress.week || 1,
      createdAt: new Date()
    }).returning();
    
    res.status(201).json({
      status: 'success',
      data: correlation,
      message: 'Progress correlation recorded successfully'
    });
  } catch (error) {
    console.error('Error recording progress correlation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record progress correlation'
    });
  }
});

// AI Generation Endpoint
router.post('/generate-ai', requireAuth, async (req: Request, res: Response) => {
  try {
    const { template, clientProfile } = req.body;
    
    if (!openai) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service not available'
      });
    }
    
    if (!template || !clientProfile) {
      return res.status(400).json({
        status: 'error',
        message: 'Template and client profile are required'
      });
    }
    
    // Check cache first
    const cacheKey = JSON.stringify({ template, clientProfile });
    const cached = aiCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return res.json({
        status: 'success',
        data: {
          content: cached.response,
          cached: true,
          generatedAt: new Date(cached.timestamp).toISOString()
        }
      });
    }
    
    // Generate with AI
    const prompt = `Create a personalized health protocol based on:
    - Template: ${template}
    - Client Age: ${clientProfile.age}
    - Activity Level: ${clientProfile.activityLevel}
    - Health Goals: ${JSON.stringify(clientProfile.healthGoals)}
    
    Provide specific, actionable recommendations with timeline and safety considerations.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional health protocol advisor. Create safe, evidence-based, personalized health recommendations.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }
    
    // Cache the response
    aiCache.set(cacheKey, {
      response: content,
      timestamp: Date.now()
    });
    
    res.json({
      status: 'success',
      data: {
        content,
        cached: false,
        generatedAt: new Date().toISOString(),
        tokensUsed: completion.usage?.total_tokens || 0
      }
    });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI content'
    });
  }
});

// AI Cache Status
router.get('/ai-cache/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const cacheStats = {
      totalEntries: aiCache.size,
      cacheHitRate: 0, // Would need to track this properly in production
      oldestEntry: null as string | null,
      newestEntry: null as string | null,
      totalSize: 0
    };
    
    if (aiCache.size > 0) {
      let oldestTime = Infinity;
      let newestTime = 0;
      let totalSize = 0;
      
      aiCache.forEach((value, key) => {
        totalSize += JSON.stringify(value).length;
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          cacheStats.oldestEntry = new Date(value.timestamp).toISOString();
        }
        if (value.timestamp > newestTime) {
          newestTime = value.timestamp;
          cacheStats.newestEntry = new Date(value.timestamp).toISOString();
        }
      });
      
      cacheStats.totalSize = totalSize;
    }
    
    res.json({
      status: 'success',
      data: {
        cache: cacheStats,
        config: {
          cacheDuration: CACHE_DURATION,
          aiServiceAvailable: !!openai
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cache status'
    });
  }
});

// Clear AI cache (admin only)
router.delete('/ai-cache', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Simple admin check (in production, use proper role-based auth)
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }
    
    const sizeBefore = aiCache.size;
    aiCache.clear();
    
    res.json({
      status: 'success',
      message: `Cache cleared. Removed ${sizeBefore} entries.`,
      data: {
        entriesRemoved: sizeBefore
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache'
    });
  }
});

export default router;