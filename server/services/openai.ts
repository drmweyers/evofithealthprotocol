import OpenAI from "openai";
import {
  createHealthProtocolSchema,
  type CreateHealthProtocol,
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache for protocol generation (in production, use Redis)
interface CacheEntry {
  key: string;
  result: any;
  timestamp: number;
  expiresAt: number;
}

class ProtocolCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  generateKey(options: any): string {
    // Create a stable key from the generation options
    const keyData = {
      type: options.protocolType,
      intensity: options.intensity,
      duration: options.duration,
      conditions: options.healthConditions?.sort(),
      goals: options.specificGoals?.sort(),
      experience: options.experience,
      // Hash the natural language prompt for consistency
      promptHash: options.naturalLanguagePrompt ? 
        this.hashString(options.naturalLanguagePrompt) : null
    };
    return JSON.stringify(keyData);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  set(key: string, result: any, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    this.cache.set(key, entry);
    
    // Simple cleanup: remove expired entries when cache gets large
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  stats(): { size: number; entries: Array<{ key: string; age: number; ttl: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.values()).map(entry => ({
      key: entry.key.slice(0, 50) + '...',
      age: Math.floor((now - entry.timestamp) / 1000),
      ttl: Math.floor((entry.expiresAt - now) / 1000)
    }));
    
    return { size: this.cache.size, entries };
  }
}

const protocolCache = new ProtocolCache();

export interface GeneratedHealthProtocol {
  name: string;
  description: string;
  type: 'longevity' | 'parasite_cleanse';
  duration: number; // in days
  intensity: 'gentle' | 'moderate' | 'intensive';
  config: any; // Protocol-specific configuration
  tags: string[];
  recommendations: {
    supplements: Array<{
      name: string;
      dosage: string;
      timing: string;
      purpose: string;
    }>;
    dietaryGuidelines: Array<{
      category: string;
      instruction: string;
      importance: 'high' | 'medium' | 'low';
    }>;
    lifestyleChanges: Array<{
      change: string;
      rationale: string;
      difficulty: 'easy' | 'moderate' | 'challenging';
    }>;
    precautions: Array<{
      warning: string;
      severity: 'info' | 'warning' | 'critical';
    }>;
  };
}

interface ProtocolGenerationOptions {
  protocolType?: 'longevity' | 'parasite_cleanse';
  intensity?: 'gentle' | 'moderate' | 'intensive';
  duration?: number; // in days
  userAge?: number;
  healthConditions?: string[];
  currentMedications?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced';
  specificGoals?: string[];
  naturalLanguagePrompt?: string;
}

/**
 * Clean up and parse potentially incomplete JSON from OpenAI
 */
function parsePartialJson(jsonString: string): any {
  try {
    // First, try to parse it as is
    return JSON.parse(jsonString);
  } catch (e) {
    // If it fails, it might be an incomplete JSON.
    // Let's try to repair it by finding the last complete object.
    const lastValidJsonEnd = Math.max(
      jsonString.lastIndexOf('}'), 
      jsonString.lastIndexOf(']')
    );

    if (lastValidJsonEnd === -1) {
      throw new Error("No valid JSON structures found in the response.");
    }
    
    // Trim to the last complete structure
    let potentialJson = jsonString.substring(0, lastValidJsonEnd + 1);

    // If it's a list of objects, it needs to be closed with a ']'
    if (potentialJson.lastIndexOf('[') > potentialJson.lastIndexOf('{')) {
       // It's likely an unclosed array
       if (potentialJson.endsWith(',')) {
         potentialJson = potentialJson.slice(0, -1); // remove trailing comma
       }
       potentialJson += ']';
    }
    
    // If the top-level is an object, find its opening and closing
    const jsonStart = potentialJson.indexOf('{');
    const jsonEnd = potentialJson.lastIndexOf('}');
    potentialJson = potentialJson.substring(jsonStart, jsonEnd + 1);

    try {
      // Try parsing the repaired string
      const parsed = JSON.parse(potentialJson);
      return parsed;
    } catch (finalError) {
      // If all attempts fail, throw a specific error
      console.error("Original failing JSON:", jsonString);
      throw new Error(`Failed to parse or repair JSON response: ${finalError}`);
    }
  }
}

/**
 * Enhanced system prompts for different protocol types
 */
const SYSTEM_PROMPTS = {
  longevity: `You are a world-renowned longevity researcher and functional medicine expert with 20+ years of experience in anti-aging protocols. 

Generate a comprehensive, evidence-based longevity protocol that integrates the latest scientific research on cellular health, autophagy, hormone optimization, and metabolic enhancement.

CORE LONGEVITY PRINCIPLES TO INCORPORATE:
- Cellular senescence reduction strategies
- Autophagy enhancement through precise timing
- Mitochondrial optimization protocols
- Hormetic stress application (controlled stressors)
- Circadian rhythm optimization
- Inflammaging reduction (age-related inflammation)
- Telomere health preservation
- Gut microbiome optimization for longevity

EVIDENCE-BASED INTERVENTIONS:
- Time-restricted eating with optimal feeding windows
- Specific longevity-promoting compounds (resveratrol, NAD+ precursors, etc.)
- Cold/heat therapy protocols
- Optimized sleep architecture
- Stress management with measurable biomarkers
- Exercise protocols for longevity (strength + cardio + mobility)

PERSONALIZATION FACTORS:
- Age-specific interventions (different for 30s, 40s, 50s+)
- Gender-specific hormone considerations
- Genetic polymorphism accommodations (APOE, MTHFR, etc.)
- Current health status and biomarker optimization`,

  parasite_cleanse: `You are a clinical parasitologist and naturopathic doctor with expertise in safe, evidence-based parasite elimination protocols.

Generate a comprehensive parasite cleanse protocol that balances effectiveness with safety, incorporating both traditional antimicrobial approaches and modern gut restoration techniques.

CLINICAL APPROACH:
- Phase 1: Preparation and biofilm disruption
- Phase 2: Active antimicrobial intervention
- Phase 3: Gut restoration and microbiome rebuilding
- Phase 4: Maintenance and prevention

EVIDENCE-BASED ANTIMICROBIALS:
- Herbal compounds: Artemisia, berberine, allicin, oregano oil
- Food-based antiparasitics: Raw garlic, pumpkin seeds, papaya seeds
- Biofilm disruptors: N-acetylcysteine, serrapeptase
- Elimination support: Bentonite clay, activated charcoal

SAFETY PROTOCOLS:
- Die-off reaction management (Herxheimer response)
- Liver and kidney support during cleansing
- Electrolyte and hydration optimization
- Contraindication screening (pregnancy, medications, conditions)
- Progressive intensity scaling

GUT RESTORATION:
- Selective probiotic strains for post-cleanse
- Prebiotic foods for beneficial bacteria
- Intestinal barrier repair (L-glutamine, zinc carnosine)
- Digestive enzyme support during recovery`,

  therapeutic: `You are a clinical nutritionist and functional medicine practitioner specializing in therapeutic nutrition protocols for chronic conditions.

Generate an evidence-based therapeutic nutrition protocol that addresses specific health conditions through targeted nutritional interventions, supplement protocols, and lifestyle modifications.

THERAPEUTIC APPROACH:
- Root cause analysis through nutrition
- Anti-inflammatory protocol design
- Nutrient density optimization
- Bioavailability enhancement strategies
- Therapeutic food timing and combinations
- Symptom tracking and protocol adjustment

CONDITION-SPECIFIC INTERVENTIONS:
- Autoimmune: Elimination diets, gut healing, immune modulation
- Metabolic: Blood sugar optimization, insulin sensitivity, weight management
- Cardiovascular: Lipid optimization, blood pressure support, circulation
- Digestive: Gut healing, SIBO protocols, microbiome restoration
- Neurological: Brain-supportive nutrients, neuroinflammation reduction

EVIDENCE-BASED PROTOCOLS:
- Mediterranean, AIP, Ketogenic, GAPS, Elimination diets
- Targeted supplementation based on lab testing
- Meal timing for therapeutic effect
- Food sensitivity accommodation
- Nutrient-drug interaction management`,

  general: `You are an integrative health coach and nutrition expert specializing in sustainable wellness protocols.

Generate a balanced, practical health protocol that promotes overall wellness while being sustainable for long-term adherence.

HOLISTIC WELLNESS APPROACH:
- Sustainable nutrition principles
- Realistic lifestyle integration
- Gradual habit formation
- Stress management integration
- Sleep optimization
- Movement and exercise balance
- Social and emotional health support

FOUNDATIONAL ELEMENTS:
- Whole foods nutrition with variety
- Hydration optimization
- Circadian rhythm support
- Moderate exercise protocols
- Mindfulness and stress reduction
- Social connection promotion
- Personal goal alignment`
};

/**
 * Generate a personalized health protocol using AI with caching
 */
export async function generateHealthProtocol(
  options: ProtocolGenerationOptions = {}
): Promise<GeneratedHealthProtocol> {
  // Check cache first
  const cacheKey = protocolCache.generateKey(options);
  const cachedResult = protocolCache.get(cacheKey);
  
  if (cachedResult) {
    console.log('🎯 Returning cached protocol result');
    return cachedResult;
  }
  
  console.log('🔄 Generating new protocol with AI...');
  
  // Get appropriate system prompt based on protocol type
  const protocolType = options.protocolType || 'general';
  const baseSystemPrompt = SYSTEM_PROMPTS[protocolType] || SYSTEM_PROMPTS.general;
  
  const systemPrompt = `${baseSystemPrompt}

${options.intensity ? `INTENSITY LEVEL: ${options.intensity.toUpperCase()}` : ''}
${options.duration ? `PROTOCOL DURATION: ${options.duration} days` : ''}

CRITICAL: Respond ONLY with a valid JSON object that strictly follows this interface:

interface GeneratedHealthProtocol {
  name: string;
  description: string;
  type: 'longevity' | 'parasite_cleanse' | 'therapeutic' | 'ailments_based';
  duration: number; // in days
  intensity: 'gentle' | 'moderate' | 'intensive';
  config: {
    meals: Array<{
      day: number;
      mealType: string;
      name: string;
      description: string;
      ingredients: string[];
      instructions: string;
      nutritionalBenefits: string[];
      timing?: string;
    }>;
    dailySchedule?: {
      wakeTime: string;
      mealTimes: string[];
      supplementTimes: string[];
      activityTimes: string[];
      bedTime: string;
    };
    shoppingList?: {
      proteins: string[];
      vegetables: string[];
      fruits: string[];
      grains: string[];
      supplements: string[];
      spices: string[];
      other: string[];
    };
    weeklyGoals?: Array<{
      week: number;
      focus: string;
      goals: string[];
      expectedOutcomes: string[];
    }>;
  };
  tags: string[];
  recommendations: {
    supplements: Array<{
      name: string;
      dosage: string;
      timing: string;
      purpose: string;
      priority: 'essential' | 'recommended' | 'optional';
    }>;
    dietaryGuidelines: Array<{
      category: string;
      instruction: string;
      importance: 'high' | 'medium' | 'low';
      rationale: string;
    }>;
    lifestyleChanges: Array<{
      change: string;
      rationale: string;
      difficulty: 'easy' | 'moderate' | 'challenging';
      timeframe: string;
      successMetrics: string[];
    }>;
    precautions: Array<{
      warning: string;
      severity: 'info' | 'warning' | 'critical';
      conditions: string[];
      recommendation: string;
    }>;
    monitoring: Array<{
      metric: string;
      frequency: string;
      targetRange: string;
      method: string;
    }>;
  };
}

QUALITY REQUIREMENTS:
- Include 7-21 days of detailed meal plans in config.meals
- Provide specific, actionable recommendations
- Include comprehensive safety warnings and contraindications
- Ensure all supplements have evidence-based dosages
- Include monitoring guidelines for key health markers
- Make all recommendations culturally sensitive and adaptable

SAFETY MANDATES:
- Always include healthcare provider consultation warnings
- Specify contraindications for pregnancy, medications, conditions
- Include emergency contact recommendations for severe symptoms
- Provide clear guidance on when to discontinue the protocol

Ensure the final JSON is perfectly valid, complete, and ready for immediate use.`;

  const contextLines = [];
  if (options.naturalLanguagePrompt) {
    contextLines.push(`SPECIFIC USER REQUIREMENTS: "${options.naturalLanguagePrompt}"`);
  }
  if (options.protocolType) {
    contextLines.push(`Protocol type: ${options.protocolType}`);
  }
  if (options.intensity) {
    contextLines.push(`Intensity level: ${options.intensity}`);
  }
  if (options.duration) {
    contextLines.push(`Duration: ${options.duration} days`);
  }
  if (options.userAge) {
    contextLines.push(`User age: ${options.userAge} years`);
  }
  if (options.healthConditions?.length) {
    contextLines.push(`Health conditions: ${options.healthConditions.join(", ")}`);
  }
  if (options.currentMedications?.length) {
    contextLines.push(`Current medications: ${options.currentMedications.join(", ")}`);
  }
  if (options.experience) {
    contextLines.push(`Experience level: ${options.experience}`);
  }
  if (options.specificGoals?.length) {
    contextLines.push(`Specific goals: ${options.specificGoals.join(", ")}`);
  }

  const userPrompt = `Generate a health protocol with the following specifications:
${contextLines.length > 0 ? contextLines.join('\n') : 'No specific requirements - create a safe, effective protocol.'}

Focus on evidence-based approaches and include appropriate safety warnings.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 4000, // Ensure sufficient space for detailed protocols
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Use the robust JSON parser
    const parsedJson = parsePartialJson(content);

    // Enhanced validation of protocol structure
    const validationErrors = validateProtocolStructure(parsedJson);
    if (validationErrors.length > 0) {
      console.error('Protocol validation errors:', validationErrors);
      throw new Error(`Invalid protocol structure: ${validationErrors.join(', ')}`);
    }

    // Enhance the protocol with additional metadata
    const enhancedProtocol = enhanceProtocolWithMetadata(parsedJson, options);

    // Cache the result
    protocolCache.set(cacheKey, enhancedProtocol);
    console.log('✅ Protocol generated and cached successfully');

    return enhancedProtocol as GeneratedHealthProtocol;

  } catch (error) {
    console.error("Full error in generateHealthProtocol:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate health protocol: ${errorMessage}`);
  }
}

/**
 * Parse natural language input for health protocol generation
 */
export async function parseNaturalLanguageForHealthProtocol(
  naturalLanguageInput: string,
): Promise<Partial<CreateHealthProtocol & ProtocolGenerationOptions>> {
  const systemPrompt = `
You are an intelligent assistant for a health protocol application.
A user has provided a natural language request to create a health protocol.
Your task is to parse this request and extract the key parameters into a structured JSON object.
The JSON object should include fields like:
- name: string (suggested protocol name)
- description: string (brief description)
- type: 'longevity' | 'parasite_cleanse'
- duration: number (in days)
- intensity: 'gentle' | 'moderate' | 'intensive'
- tags: array of strings
- userAge: number (if mentioned)
- healthConditions: array of strings
- currentMedications: array of strings
- experience: 'beginner' | 'intermediate' | 'advanced'
- specificGoals: array of strings

If a value isn't mentioned, omit the key from the JSON object.
Be smart about interpreting flexible language (e.g., "for a month" means 30 days).
The output MUST be a single, valid JSON object. Do not include any other text or explanations.
`;

  const userPrompt = `Parse the following health protocol request: "${naturalLanguageInput}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedJson = parsePartialJson(content);
    return parsedJson as Partial<CreateHealthProtocol & ProtocolGenerationOptions>;

  } catch (error) {
    console.error("Full error in parseNaturalLanguageForHealthProtocol:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to parse natural language for health protocol: ${errorMessage}`);
  }
}

/**
 * Generate educational content about health protocols
 */
export async function generateProtocolEducation(
  protocolType: 'longevity' | 'parasite_cleanse',
  topic?: string
): Promise<{
  title: string;
  content: string;
  keyPoints: string[];
  references: string[];
}> {
  const systemPrompt = `You are an expert in functional medicine and health optimization.
Generate educational content about ${protocolType.replace('_', ' ')} protocols.
${topic ? `Focus specifically on: ${topic}` : ''}

Provide evidence-based information that helps users understand the science and benefits.
Include key points and credible references where possible.

Respond with a JSON object containing:
- title: string (educational article title)
- content: string (detailed educational content)
- keyPoints: string[] (main takeaways)
- references: string[] (credible sources/studies)`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate educational content about ${protocolType} protocols${topic ? ` focusing on ${topic}` : ''}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return parsePartialJson(content);

  } catch (error) {
    console.error("Full error in generateProtocolEducation:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate protocol education: ${errorMessage}`);
  }
}

/**
 * Analyze potential interactions between protocols and medications
 */
export async function analyzeProtocolInteractions(
  protocolConfig: any,
  medications: string[],
  healthConditions: string[]
): Promise<{
  safetyRating: 'safe' | 'caution' | 'warning' | 'contraindicated';
  interactions: Array<{
    type: 'medication' | 'condition';
    item: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  generalRecommendations: string[];
}> {
  const systemPrompt = `You are a clinical pharmacist and functional medicine expert.
Analyze potential interactions between health protocols and user's medications/conditions.
Provide a safety assessment and specific interaction warnings.

IMPORTANT: Always err on the side of caution and recommend consulting healthcare providers.
Respond with a JSON object following the specified structure.`;

  const userPrompt = `Analyze interactions for:
Protocol: ${JSON.stringify(protocolConfig)}
Medications: ${medications.join(', ')}
Health Conditions: ${healthConditions.join(', ')}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for safety analysis
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return parsePartialJson(content);

  } catch (error) {
    console.error("Full error in analyzeProtocolInteractions:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to analyze protocol interactions: ${errorMessage}`);
  }
}

/**
 * Validate generated protocol structure
 */
function validateProtocolStructure(protocol: any): string[] {
  const errors: string[] = [];
  
  // Check required top-level fields
  if (!protocol.name || typeof protocol.name !== 'string') {
    errors.push('Missing or invalid name field');
  }
  
  if (!protocol.description || typeof protocol.description !== 'string') {
    errors.push('Missing or invalid description field');
  }
  
  if (!protocol.type || !['longevity', 'parasite_cleanse', 'therapeutic', 'ailments_based'].includes(protocol.type)) {
    errors.push('Missing or invalid type field');
  }
  
  if (!protocol.duration || typeof protocol.duration !== 'number' || protocol.duration < 1 || protocol.duration > 365) {
    errors.push('Missing or invalid duration field (must be 1-365 days)');
  }
  
  if (!protocol.intensity || !['gentle', 'moderate', 'intensive'].includes(protocol.intensity)) {
    errors.push('Missing or invalid intensity field');
  }
  
  if (!protocol.config || typeof protocol.config !== 'object') {
    errors.push('Missing or invalid config field');
  } else {
    // Validate config structure
    if (!Array.isArray(protocol.config.meals)) {
      errors.push('Config must contain meals array');
    } else if (protocol.config.meals.length === 0) {
      errors.push('Config meals array cannot be empty');
    }
  }
  
  if (!Array.isArray(protocol.tags)) {
    errors.push('Tags must be an array');
  }
  
  if (!protocol.recommendations || typeof protocol.recommendations !== 'object') {
    errors.push('Missing or invalid recommendations field');
  } else {
    const rec = protocol.recommendations;
    if (!Array.isArray(rec.supplements)) {
      errors.push('Recommendations must contain supplements array');
    }
    if (!Array.isArray(rec.dietaryGuidelines)) {
      errors.push('Recommendations must contain dietaryGuidelines array');
    }
    if (!Array.isArray(rec.lifestyleChanges)) {
      errors.push('Recommendations must contain lifestyleChanges array');
    }
    if (!Array.isArray(rec.precautions)) {
      errors.push('Recommendations must contain precautions array');
    }
  }
  
  return errors;
}

/**
 * Enhance protocol with additional metadata and computed fields
 */
function enhanceProtocolWithMetadata(protocol: any, options: ProtocolGenerationOptions): any {
  const enhanced = { ...protocol };
  
  // Add generation metadata
  enhanced.metadata = {
    generatedAt: new Date().toISOString(),
    version: '2.0',
    generationOptions: {
      protocolType: options.protocolType,
      intensity: options.intensity,
      duration: options.duration,
      experience: options.experience
    },
    features: []
  };
  
  // Add computed features
  const features: string[] = [];
  
  if (enhanced.config.meals?.length >= 14) {
    features.push('comprehensive-meal-planning');
  }
  
  if (enhanced.recommendations.supplements?.length > 0) {
    features.push('supplement-protocol');
  }
  
  if (enhanced.config.dailySchedule) {
    features.push('structured-daily-schedule');
  }
  
  if (enhanced.recommendations.monitoring?.length > 0) {
    features.push('progress-monitoring');
  }
  
  if (enhanced.recommendations.precautions?.some((p: any) => p.severity === 'critical')) {
    features.push('high-safety-awareness');
  }
  
  enhanced.metadata.features = features;
  
  // Add difficulty score
  let difficultyScore = 0;
  
  if (enhanced.intensity === 'intensive') difficultyScore += 3;
  else if (enhanced.intensity === 'moderate') difficultyScore += 2;
  else difficultyScore += 1;
  
  if (enhanced.config.meals?.length > 21) difficultyScore += 2;
  else if (enhanced.config.meals?.length > 14) difficultyScore += 1;
  
  if (enhanced.recommendations.supplements?.length > 5) difficultyScore += 2;
  else if (enhanced.recommendations.supplements?.length > 2) difficultyScore += 1;
  
  enhanced.metadata.difficultyScore = Math.min(10, difficultyScore);
  
  // Ensure critical safety warnings are present
  if (!enhanced.recommendations.precautions.some((p: any) => p.warning.toLowerCase().includes('healthcare provider'))) {
    enhanced.recommendations.precautions.unshift({
      warning: 'Consult with a qualified healthcare provider before starting this protocol',
      severity: 'critical',
      conditions: ['all'],
      recommendation: 'Schedule a consultation to review this protocol with your doctor, especially if you have existing health conditions, take medications, or are pregnant/nursing.'
    });
  }
  
  // Add estimated costs if not present
  if (!enhanced.metadata.estimatedCosts) {
    enhanced.metadata.estimatedCosts = estimateProtocolCosts(enhanced);
  }
  
  return enhanced;
}

/**
 * Estimate protocol costs for budgeting
 */
function estimateProtocolCosts(protocol: any): {
  supplements: { min: number; max: number };
  specialFoods: { min: number; max: number };
  total: { min: number; max: number };
} {
  const supplements = protocol.recommendations.supplements || [];
  const meals = protocol.config.meals || [];
  
  // Rough cost estimation (in USD)
  const supplementCostPerItem = { min: 15, max: 45 }; // per month
  const specialFoodCostPerDay = { min: 5, max: 15 }; // additional cost over regular food
  
  const supplementCosts = {
    min: supplements.length * supplementCostPerItem.min,
    max: supplements.length * supplementCostPerItem.max
  };
  
  // Estimate special food costs based on protocol duration
  const duration = protocol.duration || 30;
  const specialFoodCosts = {
    min: duration * specialFoodCostPerDay.min * 0.3, // Not every meal requires special ingredients
    max: duration * specialFoodCostPerDay.max * 0.7
  };
  
  return {
    supplements: supplementCosts,
    specialFoods: specialFoodCosts,
    total: {
      min: supplementCosts.min + specialFoodCosts.min,
      max: supplementCosts.max + specialFoodCosts.max
    }
  };
}

/**
 * Get cache statistics
 */
export function getCacheStats(): any {
  return protocolCache.stats();
}

/**
 * Clear protocol cache
 */
export function clearCache(): void {
  protocolCache.clear();
}

/**
 * Batch generate protocols for templates
 */
export async function batchGenerateProtocols(
  requests: ProtocolGenerationOptions[]
): Promise<GeneratedHealthProtocol[]> {
  const results: GeneratedHealthProtocol[] = [];
  const batchSize = 3; // Process in batches to avoid rate limits
  
  console.log(`🔄 Batch generating ${requests.length} protocols in batches of ${batchSize}`);
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        console.log(`📋 Processing batch item ${i + index + 1}/${requests.length}`);
        return await generateHealthProtocol(request);
      } catch (error) {
        console.error(`❌ Failed to generate protocol ${i + index + 1}:`, error);
        throw error;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Brief pause between batches
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`✅ Batch generation completed: ${results.length}/${requests.length} protocols generated`);
  return results;
}