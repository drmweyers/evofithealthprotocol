/**
 * Specialized Health Protocol Routes
 * 
 * This file contains API endpoints for specialized health protocols:
 * - Longevity Mode protocols (anti-aging, fasting, caloric restriction)  
 * - Parasite Cleanse protocols (detox, anti-parasitic foods, herbal supplements)
 * - Ailments-based protocols (condition-specific nutritional targeting)
 * 
 * All endpoints follow the API specifications defined in SPECIALIZED_PROTOCOLS_API_SPECS.md
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateHealthProtocol } from '../services/openai';
import { z } from 'zod';

const specializedRouter = Router();

// Validation schemas
const longevityProtocolSchema = z.object({
  planName: z.string().min(1),
  duration: z.number().min(7).max(365),
  fastingProtocol: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  primaryGoals: z.array(z.string()),
  culturalPreferences: z.array(z.string()).default([]),
  currentAge: z.number().min(18).max(120).optional(),
  dailyCalorieTarget: z.number().min(1000).max(4000).default(2000),
  clientName: z.string().default('Current User'),
});

const parasiteCleanseSchema = z.object({
  planName: z.string().min(1),
  duration: z.string(),
  intensity: z.enum(['gentle', 'moderate', 'intensive']).default('gentle'),
  experienceLevel: z.enum(['first_time', 'experienced', 'advanced']).default('first_time'),
  culturalPreferences: z.array(z.string()).default([]),
  supplementTolerance: z.enum(['low', 'moderate', 'high']).default('moderate'),
  currentSymptoms: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
  pregnancyOrBreastfeeding: z.boolean().default(false),
  healthcareProviderConsent: z.boolean().default(false),
  clientName: z.string().default('Current User'),
});

const ailmentsBasedSchema = z.object({
  planName: z.string().min(1),
  duration: z.number().min(7).max(365).default(30),
  selectedAilments: z.array(z.string()),
  nutritionalFocus: z.any().optional(),
  priorityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  dailyCalorieTarget: z.number().min(1000).max(4000).default(2000),
  clientName: z.string().default('Current User'),
});

/**
 * Generate Longevity Mode Protocol
 * POST /api/specialized/longevity/generate
 * 
 * Creates a longevity-focused meal plan with anti-aging properties,
 * intermittent fasting protocols, and caloric restriction options.
 */
specializedRouter.post('/longevity/generate', requireAuth, async (req, res) => {
  console.log('🚀 Longevity protocol generation started');
  
  try {
    const requestData = longevityProtocolSchema.parse(req.body);
    console.log('✅ Request validation passed:', { 
      planName: requestData.planName, 
      duration: requestData.duration,
      goals: requestData.primaryGoals 
    });
    
    // Build AI prompt for longevity protocol
    const aiPrompt = `Generate a comprehensive ${requestData.duration}-day longevity and anti-aging meal plan with the following specifications:

CORE LONGEVITY PRINCIPLES:
- Focus on nutrient-dense, whole foods with anti-aging properties
- Implement ${requestData.fastingProtocol || '16:8'} intermittent fasting protocol
- Daily calorie target: ${requestData.dailyCalorieTarget} calories
- Emphasize antioxidant-rich ingredients in every meal

PRIMARY GOALS: ${requestData.primaryGoals.join(', ')}

REQUIRED COMPONENTS:
1. High-antioxidant foods (berries, leafy greens, colorful vegetables)
2. Anti-inflammatory spices (turmeric, ginger, cinnamon)
3. Omega-3 rich foods (fatty fish, walnuts, flax seeds)
4. Longevity-promoting beverages (green tea, herbal teas)

MEAL STRUCTURE:
- Design meals within the fasting window
- Include brief explanations of longevity benefits for key ingredients
- Suggest optimal meal timing for cellular repair
- Include supplement recommendations when appropriate

EXPERIENCE LEVEL: ${requestData.experienceLevel}
CLIENT AGE: ${requestData.currentAge || 'Not specified'}
CLIENT NAME: ${requestData.clientName}

OUTPUT FORMAT:
- Detailed meal plan with recipes
- Fasting schedule with timing recommendations
- Shopping list organized by category
- Longevity benefits explanation for each meal
- Safety guidelines and medical disclaimers

SAFETY NOTE: Include disclaimer about consulting healthcare provider for any health conditions.`;

    console.log('📝 AI prompt prepared for longevity protocol');
    
    // Generate protocol using OpenAI
    const generatedProtocol = await generateHealthProtocol({
      protocolType: 'longevity',
      intensity: 'moderate',
      duration: requestData.duration,
      userAge: requestData.currentAge,
      healthConditions: [],
      currentMedications: [],
      experience: requestData.experienceLevel,
      specificGoals: requestData.primaryGoals,
      naturalLanguagePrompt: aiPrompt
    });

    console.log('🎯 AI generation completed successfully');
    
    // Format response according to API spec
    const response = {
      success: true,
      protocolId: `lng_${Date.now()}`,
      type: 'longevity',
      generatedAt: new Date().toISOString(),
      mealPlan: {
        duration: requestData.duration,
        totalCalories: requestData.dailyCalorieTarget,
        fastingProtocol: requestData.fastingProtocol || '16:8',
        meals: generatedProtocol.config?.meals || [],
      },
      fastingSchedule: generatedProtocol.config?.fastingSchedule || generatedProtocol.recommendations || 'Fasting protocol details included in meal plan',
      shoppingList: generatedProtocol.config?.shoppingList || {
        produce: ['Antioxidant-rich fruits and vegetables'],
        supplements: ['Omega-3', 'Resveratrol', 'Green Tea Extract']
      },
      lifestyleTips: [
        'Maintain consistent meal timing within your eating window',
        'Stay hydrated during fasting periods with water and herbal teas',
        'Focus on nutrient density rather than calorie counting',
        'Get adequate sleep for cellular repair and longevity'
      ],
      safetyDisclaimer: {
        title: 'Medical Disclaimer - Longevity Protocol',
        content: 'This longevity protocol is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Consult with a qualified healthcare provider before beginning this protocol, especially if you have existing health conditions, take medications, or are pregnant or nursing. Intermittent fasting may not be suitable for everyone.'
      },
      recommendations: generatedProtocol.recommendations || 'Follow the meal plan consistently and track your energy levels and wellbeing.'
    };

    console.log('✅ Longevity protocol generation completed successfully');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Longevity protocol generation failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate longevity protocol',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Generate Parasite Cleanse Protocol
 * POST /api/specialized/parasite-cleanse/generate
 * 
 * Creates a parasite cleanse protocol with anti-parasitic foods,
 * elimination diet principles, and optional herbal supplements.
 */
specializedRouter.post('/parasite-cleanse/generate', requireAuth, async (req, res) => {
  console.log('🚀 Parasite cleanse protocol generation started');
  
  try {
    const requestData = parasiteCleanseSchema.parse(req.body);
    console.log('✅ Request validation passed:', { 
      planName: requestData.planName, 
      duration: requestData.duration,
      intensity: requestData.intensity 
    });
    
    // Safety check - require healthcare provider consent for intensive protocols
    if (requestData.intensity === 'intensive' && !requestData.healthcareProviderConsent) {
      return res.status(400).json({
        success: false,
        error: 'Healthcare provider consent required for intensive cleanse protocols',
        code: 'MEDICAL_CONSENT_REQUIRED'
      });
    }
    
    // Safety check - pregnancy screening
    if (requestData.pregnancyOrBreastfeeding) {
      return res.status(400).json({
        success: false,
        error: 'Parasite cleanse protocols are not recommended during pregnancy or breastfeeding',
        code: 'PREGNANCY_CONTRAINDICATION'
      });
    }
    
    // Build AI prompt for parasite cleanse protocol
    const aiPrompt = `Generate a comprehensive ${requestData.duration}-day parasite cleanse protocol with the following specifications:

PROTOCOL INTENSITY: ${requestData.intensity.toUpperCase()}
EXPERIENCE LEVEL: ${requestData.experienceLevel}

CORE CLEANSE PRINCIPLES:
- Eliminate: All refined sugars, processed foods, alcohol, dairy products
- Minimize: High-glycemic fruits, grains, starchy vegetables  
- Emphasize: High-fiber foods, fermented foods, anti-parasitic ingredients

REQUIRED ANTI-PARASITIC FOODS:
- Daily inclusion: raw garlic (2-3 cloves), onions, pumpkin seeds (1/4 cup)
- Regular rotation: papaya seeds, coconut oil, ginger, turmeric
- Herbs/spices: cloves, oregano, thyme, wormwood (where available)

MEAL STRUCTURE:
- Morning: Light cleansing foods (lemon water, green juice)
- Midday: Substantial meal with anti-parasitic ingredients
- Evening: Light, easily digestible foods
- Between meals: Herbal teas (ginger, pau d'arco, cloves)

SUPPLEMENT TOLERANCE: ${requestData.supplementTolerance}
CURRENT SYMPTOMS: ${requestData.currentSymptoms.join(', ') || 'None specified'}
MEDICAL CONDITIONS: ${requestData.medicalConditions.join(', ') || 'None specified'}

CLEANSE PHASES:
- Days 1-7: Initial elimination and preparation
- Days 8-14: Intensive anti-parasitic phase
- Days 15+: Maintenance and gut rebuilding (if applicable)

CLIENT NAME: ${requestData.clientName}

OUTPUT FORMAT:
- Day-by-day protocol with detailed schedules
- Anti-parasitic meal recommendations with recipes
- Supplement timing chart (if applicable)
- Shopping list organized by category
- Progress tracking guidelines
- Safety notes and medical disclaimers

CRITICAL SAFETY REQUIREMENTS:
- Include comprehensive medical disclaimers
- Warn about potential detox symptoms
- Emphasize healthcare provider consultation
- Note contraindications for pregnancy/nursing
- Include emergency contact recommendations`;

    console.log('📝 AI prompt prepared for parasite cleanse protocol');
    
    // Generate protocol using OpenAI
    const generatedProtocol = await generateHealthProtocol({
      protocolType: 'parasite_cleanse',
      intensity: requestData.intensity,
      duration: parseInt(requestData.duration),
      userAge: undefined,
      healthConditions: requestData.medicalConditions,
      currentMedications: [],
      experience: requestData.experienceLevel,
      specificGoals: ['parasite_elimination', 'digestive_health', 'gut_microbiome_restoration'],
      naturalLanguagePrompt: aiPrompt
    });

    console.log('🎯 AI generation completed successfully');
    
    // Format response according to API spec
    const response = {
      success: true,
      protocolId: `prc_${Date.now()}`,
      type: 'parasite-cleanse',
      generatedAt: new Date().toISOString(),
      protocol: {
        duration: parseInt(requestData.duration),
        intensity: requestData.intensity,
        phases: ['Initial Cleanse (Days 1-7)', 'Intensive Phase (Days 8-14)', 'Maintenance (Days 15+)']
      },
      dailySchedules: generatedProtocol.config?.dailySchedules || generatedProtocol.recommendations || 'Daily protocol schedule included in meal plan',
      mealPlan: {
        duration: parseInt(requestData.duration),
        meals: generatedProtocol.config?.meals || [],
        avoidFoods: ['refined sugars', 'processed foods', 'alcohol', 'dairy', 'high-glycemic fruits']
      },
      antiParasiticFoods: [
        { name: 'Raw Garlic', usage: '2-3 cloves daily', timing: 'morning on empty stomach' },
        { name: 'Pumpkin Seeds', usage: '1/4 cup daily', timing: 'as snack or meal topping' },
        { name: 'Papaya Seeds', usage: '1 tsp ground daily', timing: 'with breakfast' },
        { name: 'Coconut Oil', usage: '2-3 tbsp daily', timing: 'with meals' }
      ],
      shoppingList: generatedProtocol.config?.shoppingList || {
        'anti-parasitic': ['garlic', 'onions', 'pumpkin seeds', 'papaya', 'coconut oil'],
        'herbs': ['ginger', 'turmeric', 'cloves', 'oregano', 'thyme'],
        'vegetables': ['leafy greens', 'carrots', 'beets', 'cabbage', 'broccoli'],
        'fermented': ['sauerkraut', 'kimchi', 'kefir', 'apple cider vinegar']
      },
      progressTracking: [
        'Track daily compliance with food restrictions',
        'Monitor energy levels and digestive symptoms', 
        'Record any detox symptoms (headaches, fatigue)',
        'Note improvements in digestive health'
      ],
      safetyDisclaimer: {
        title: 'Critical Medical Disclaimer - Parasite Cleanse',
        content: `IMPORTANT: This parasite cleanse protocol is for educational purposes only and is NOT a substitute for professional medical diagnosis or treatment.

⚠️ MANDATORY REQUIREMENTS:
- Consult a healthcare provider before starting this protocol
- Do NOT use if pregnant, nursing, or trying to conceive
- Discontinue if you experience severe symptoms
- Seek immediate medical attention for persistent symptoms

⚠️ POTENTIAL SIDE EFFECTS:
- Digestive upset, headaches, fatigue (detox symptoms)
- Interactions with medications
- Not suitable for children under 18

⚠️ WHEN TO STOP:
- Severe abdominal pain or cramping
- Persistent nausea or vomiting  
- Signs of dehydration
- Any concerning symptoms

This protocol does not diagnose, treat, cure, or prevent parasitic infections. Confirmed parasitic infections require medical treatment.`
      },
      recommendations: generatedProtocol.recommendations || 'Follow the protocol consistently and maintain close communication with your healthcare provider.'
    };

    console.log('✅ Parasite cleanse protocol generation completed successfully');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Parasite cleanse protocol generation failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate parasite cleanse protocol',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Generate Ailments-Based Protocol
 * POST /api/specialized/ailments-based/generate
 * 
 * Creates a health-targeted meal plan based on specific client ailments
 * and nutritional focus areas for therapeutic nutrition support.
 */
specializedRouter.post('/ailments-based/generate', requireAuth, async (req, res) => {
  console.log('🚀 Ailments-based protocol generation started');
  
  try {
    const requestData = ailmentsBasedSchema.parse(req.body);
    console.log('✅ Request validation passed:', { 
      planName: requestData.planName, 
      ailments: requestData.selectedAilments,
      priorityLevel: requestData.priorityLevel 
    });
    
    if (!requestData.selectedAilments || requestData.selectedAilments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one health condition must be selected',
        code: 'NO_AILMENTS_SELECTED'
      });
    }
    
    // Build AI prompt for ailments-based protocol
    const aiPrompt = `Generate a comprehensive ${requestData.duration}-day therapeutic meal plan targeting specific health conditions:

TARGET HEALTH CONDITIONS: ${requestData.selectedAilments.join(', ')}
PRIORITY LEVEL: ${requestData.priorityLevel.toUpperCase()}
DAILY CALORIE TARGET: ${requestData.dailyCalorieTarget} calories

THERAPEUTIC NUTRITION PRINCIPLES:
- Focus on evidence-based foods that support healing for each condition
- Include anti-inflammatory ingredients for all conditions
- Emphasize nutrient density over calorie restriction
- Incorporate functional foods with therapeutic properties

CONDITION-SPECIFIC REQUIREMENTS:
${requestData.selectedAilments.map(ailment => {
  // Map common ailments to nutritional focuses
  const ailmentFocus = {
    'diabetes': 'Low glycemic foods, fiber-rich vegetables, lean proteins, healthy fats',
    'hypertension': 'DASH diet principles, potassium-rich foods, low sodium',
    'arthritis': 'Anti-inflammatory foods, omega-3 fatty acids, antioxidants',
    'depression': 'Mood-supporting nutrients, omega-3s, B vitamins, magnesium',
    'anxiety': 'Magnesium-rich foods, adaptogenic herbs, stable blood sugar',
    'insomnia': 'Tryptophan-rich foods, magnesium, melatonin precursors',
    'digestive_issues': 'Gut-healing foods, probiotics, digestive enzymes',
    'heart_disease': 'Heart-healthy fats, fiber, antioxidants, low sodium',
    'obesity': 'Portion control, high-fiber foods, protein-rich meals',
    'osteoporosis': 'Calcium-rich foods, vitamin D, bone-supporting nutrients'
  };
  return `- ${ailment}: ${ailmentFocus[ailment] || 'Anti-inflammatory, nutrient-dense foods'}`;
}).join('\n')}

MEAL STRUCTURE:
- Breakfast: Energizing, blood sugar stabilizing
- Lunch: Substantial, nutrient-dense with therapeutic foods
- Dinner: Light, easily digestible, healing-focused
- Snacks: Condition-specific therapeutic options

NUTRITIONAL FOCUS AREAS:
${requestData.nutritionalFocus ? JSON.stringify(requestData.nutritionalFocus, null, 2) : 'Focus on the selected health conditions'}

CLIENT NAME: ${requestData.clientName}

OUTPUT FORMAT:
- Detailed meal plan with therapeutic rationale for each meal
- Specific ingredient benefits for each health condition
- Shopping list organized by therapeutic categories
- Supplement recommendations (if applicable)
- Lifestyle modifications to support healing
- Progress tracking guidelines
- Medical disclaimers and healthcare provider consultation notes

SAFETY REQUIREMENTS:
- Include medical disclaimers for all therapeutic claims
- Emphasize that food is complementary to, not replacement for, medical treatment
- Recommend healthcare provider consultation
- Note potential interactions with medications
- Provide guidance on monitoring symptoms`;

    console.log('📝 AI prompt prepared for ailments-based protocol');
    
    // Generate protocol using OpenAI
    const generatedProtocol = await generateHealthProtocol({
      protocolType: 'therapeutic',
      intensity: requestData.priorityLevel === 'high' ? 'intensive' : requestData.priorityLevel === 'low' ? 'gentle' : 'moderate',
      duration: requestData.duration,
      userAge: undefined,
      healthConditions: requestData.selectedAilments,
      currentMedications: [],
      experience: 'beginner',
      specificGoals: requestData.selectedAilments.map(ailment => `manage_${ailment}`),
      naturalLanguagePrompt: aiPrompt
    });

    console.log('🎯 AI generation completed successfully');
    
    // Format response according to API spec
    const response = {
      success: true,
      protocolId: `ail_${Date.now()}`,
      type: 'ailments-based',
      generatedAt: new Date().toISOString(),
      targetedConditions: requestData.selectedAilments,
      priorityLevel: requestData.priorityLevel,
      mealPlan: {
        duration: requestData.duration,
        totalCalories: requestData.dailyCalorieTarget,
        meals: generatedProtocol.config?.meals || [],
        therapeuticFocus: requestData.selectedAilments
      },
      therapeuticBenefits: requestData.selectedAilments.map(ailment => ({
        condition: ailment,
        keyFoods: ['Anti-inflammatory ingredients', 'Nutrient-dense whole foods'],
        benefits: 'Targeted nutritional support for symptom management and healing'
      })),
      shoppingList: generatedProtocol.config?.shoppingList || {
        'therapeutic-foods': ['Leafy greens', 'Colorful vegetables', 'Anti-inflammatory spices'],
        'proteins': ['Lean proteins', 'Plant-based proteins', 'Omega-3 rich fish'],
        'healthy-fats': ['Avocados', 'Nuts', 'Seeds', 'Olive oil'],
        'supplements': ['Based on individual needs and healthcare provider recommendations']
      },
      lifestyleRecommendations: [
        'Maintain consistent meal timing to support metabolic health',
        'Stay hydrated with water and herbal teas',
        'Practice stress management techniques',
        'Get adequate sleep for healing and recovery',
        'Monitor symptoms and track improvements',
        'Work closely with healthcare providers'
      ],
      progressTracking: [
        'Track symptom improvements weekly',
        'Monitor energy levels and mood',
        'Record any food sensitivities or reactions',
        'Note improvements in specific health markers'
      ],
      safetyDisclaimer: {
        title: 'Medical Disclaimer - Therapeutic Nutrition Protocol',
        content: `IMPORTANT: This therapeutic nutrition protocol is for educational and supportive purposes only.

⚠️ NOT A MEDICAL TREATMENT:
- This protocol does not diagnose, treat, cure, or prevent any medical condition
- It is designed to complement, not replace, professional medical care
- Continue all prescribed medications and treatments as directed by your healthcare provider

⚠️ MANDATORY REQUIREMENTS:
- Consult your healthcare provider before starting this protocol
- Inform your doctor about dietary changes, especially if you have serious health conditions
- Monitor your health conditions regularly with appropriate medical testing
- Do not discontinue medications without medical supervision

⚠️ WHEN TO SEEK MEDICAL ATTENTION:
- Worsening of symptoms
- New or concerning symptoms
- Suspected food allergies or intolerances
- Any adverse reactions

This protocol provides nutritional support that may help manage symptoms but should never replace proper medical diagnosis and treatment.`
      },
      recommendations: generatedProtocol.recommendations || 'Follow the meal plan consistently while maintaining regular communication with your healthcare team.'
    };

    console.log('✅ Ailments-based protocol generation completed successfully');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Ailments-based protocol generation failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate ailments-based protocol',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Get Available Longevity Ingredients
 * GET /api/specialized/longevity/ingredients
 * 
 * Returns database of longevity-promoting ingredients with regional availability.
 */
specializedRouter.get('/longevity/ingredients', requireAuth, async (req, res) => {
  try {
    const { category, region } = req.query;
    
    const longevityIngredients = {
      antioxidants: {
        fruits: [
          { 
            name: 'blueberries', 
            compounds: ['anthocyanins', 'vitamin C'], 
            benefits: ['brain health', 'cellular repair'],
            availability: region ? getRegionalAvailability('blueberries', region as string) : undefined
          },
          { 
            name: 'pomegranate', 
            compounds: ['punicalagins', 'ellagic acid'], 
            benefits: ['heart health', 'anti-inflammatory'],
            availability: region ? getRegionalAvailability('pomegranate', region as string) : undefined
          },
          { 
            name: 'acai', 
            compounds: ['anthocyanins', 'omega fatty acids'], 
            benefits: ['antioxidant protection', 'energy'],
            availability: region ? getRegionalAvailability('acai', region as string) : undefined
          }
        ],
        vegetables: [
          { 
            name: 'kale', 
            compounds: ['vitamin K', 'lutein', 'beta-carotene'], 
            benefits: ['bone health', 'eye health'],
            availability: region ? getRegionalAvailability('kale', region as string) : undefined
          },
          { 
            name: 'broccoli', 
            compounds: ['sulforaphane', 'vitamin C'], 
            benefits: ['detoxification', 'immune support'],
            availability: region ? getRegionalAvailability('broccoli', region as string) : undefined
          }
        ]
      },
      antiInflammatory: {
        spices: [
          { 
            name: 'turmeric', 
            compounds: ['curcumin'], 
            benefits: ['inflammation reduction', 'joint health'],
            availability: region ? getRegionalAvailability('turmeric', region as string) : undefined
          },
          { 
            name: 'ginger', 
            compounds: ['gingerol'], 
            benefits: ['digestive health', 'anti-inflammatory'],
            availability: region ? getRegionalAvailability('ginger', region as string) : undefined
          }
        ]
      },
      omega3Sources: [
        { 
          name: 'salmon', 
          compounds: ['EPA', 'DHA'], 
          benefits: ['brain health', 'heart health'],
          availability: region ? getRegionalAvailability('salmon', region as string) : undefined
        },
        { 
          name: 'walnuts', 
          compounds: ['alpha-linolenic acid'], 
          benefits: ['cognitive function', 'heart health'],
          availability: region ? getRegionalAvailability('walnuts', region as string) : undefined
        }
      ]
    };
    
    let filteredIngredients = longevityIngredients;
    
    if (category) {
      filteredIngredients = {
        [category as string]: longevityIngredients[category as keyof typeof longevityIngredients]
      } as any;
    }
    
    res.json({
      success: true,
      data: {
        ingredients: filteredIngredients,
        totalCount: Object.values(filteredIngredients).flat().length
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch longevity ingredients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch longevity ingredients'
    });
  }
});

/**
 * Get Anti-Parasitic Foods Database
 * GET /api/specialized/parasite-cleanse/foods
 * 
 * Returns database of anti-parasitic foods and herbs with usage guidelines.
 */
specializedRouter.get('/parasite-cleanse/foods', requireAuth, async (req, res) => {
  try {
    const { region } = req.query;
    
    const antiParasiticFoods = {
      primary: [
        { 
          name: 'garlic', 
          compounds: ['allicin', 'ajoene'], 
          usage: 'raw, 2-3 cloves daily',
          timing: 'morning on empty stomach',
          availability: region ? getRegionalAvailability('garlic', region as string) : undefined
        },
        { 
          name: 'pumpkin seeds', 
          compounds: ['cucurbitacin'], 
          usage: '1/4 cup daily',
          timing: 'as snack or meal addition',
          availability: region ? getRegionalAvailability('pumpkin seeds', region as string) : undefined
        },
        { 
          name: 'papaya seeds', 
          compounds: ['carpaine'], 
          usage: '1 tsp ground daily',
          timing: 'with breakfast',
          availability: region ? getRegionalAvailability('papaya seeds', region as string) : undefined
        }
      ],
      herbs: [
        { 
          name: 'wormwood', 
          latin: 'Artemisia absinthium',
          compounds: ['artemisinin'],
          dosage: '200-300mg (consult healthcare provider)',
          contraindications: ['pregnancy', 'nursing', 'seizure disorders'],
          availability: region ? getRegionalAvailability('wormwood', region as string) : undefined
        },
        { 
          name: 'cloves', 
          latin: 'Syzygium aromaticum',
          compounds: ['eugenol'],
          usage: 'as spice or tea, 500mg supplement',
          contraindications: ['blood thinning medications'],
          availability: region ? getRegionalAvailability('cloves', region as string) : undefined
        }
      ],
      avoidFoods: [
        'refined sugars', 'artificial sweeteners', 'processed foods',
        'alcohol', 'dairy products', 'high-glycemic fruits'
      ]
    };
    
    res.json({
      success: true,
      data: {
        antiParasiticFoods,
        safetyNote: 'Always consult with a healthcare provider before using herbs for therapeutic purposes, especially during pregnancy or if taking medications.'
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch anti-parasitic foods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch anti-parasitic foods database'
    });
  }
});

// Helper function for regional availability
function getRegionalAvailability(ingredient: string, region: string) {
  const availabilityData: { [key: string]: { [key: string]: any } } = {
    'blueberries': {
      'north-america': { available: true, seasonal: 'May-September', alternatives: ['frozen blueberries'] },
      'europe': { available: true, seasonal: 'June-August', alternatives: ['imported', 'frozen'] },
      'asia': { available: false, seasonal: null, alternatives: ['blackberries', 'dark grapes'] },
      'default': { available: true, seasonal: 'varies', alternatives: ['frozen or dried versions'] }
    },
    'garlic': {
      'default': { available: true, seasonal: 'year-round', alternatives: [] }
    },
    'turmeric': {
      'default': { available: true, seasonal: 'year-round', alternatives: ['turmeric powder', 'supplements'] }
    }
  };
  
  return availabilityData[ingredient]?.[region] || availabilityData[ingredient]?.default || {
    available: true,
    seasonal: 'varies by region',
    alternatives: ['check local health food stores']
  };
}

export default specializedRouter;