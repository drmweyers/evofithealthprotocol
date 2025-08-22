import OpenAI from "openai";
import {
  createHealthProtocolSchema,
  type CreateHealthProtocol,
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * Generate a personalized health protocol using AI
 */
export async function generateHealthProtocol(
  options: ProtocolGenerationOptions = {}
): Promise<GeneratedHealthProtocol> {
  const systemPrompt = `You are an expert functional medicine practitioner and health optimization specialist.
Generate a personalized health protocol based on the user's requirements.
${options.protocolType ? `Focus on a ${options.protocolType.replace('_', ' ')} protocol.` : ''}
${options.intensity ? `Use ${options.intensity} intensity approach.` : ''}
${options.duration ? `Design for ${options.duration} days duration.` : ''}

IMPORTANT: Respond with a single JSON object that strictly follows this TypeScript interface:
interface GeneratedHealthProtocol {
  name: string;
  description: string;
  type: 'longevity' | 'parasite_cleanse';
  duration: number; // in days
  intensity: 'gentle' | 'moderate' | 'intensive';
  config: any; // Protocol-specific configuration object
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

Ensure the protocol is safe, evidence-based, and includes appropriate warnings.
ALWAYS include disclaimers about consulting healthcare providers.
Ensure the final JSON is perfectly valid and complete. Do not omit any fields.`;

  const contextLines = [];
  if (options.naturalLanguagePrompt) {
    contextLines.push(`User requirements: "${options.naturalLanguagePrompt}"`);
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
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Use the robust JSON parser
    const parsedJson = parsePartialJson(content);

    // Validate the protocol structure
    if (!parsedJson.name || !parsedJson.type || !parsedJson.recommendations) {
      throw new Error("Invalid protocol structure received from OpenAI");
    }

    return parsedJson as GeneratedHealthProtocol;

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