import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateHealthProtocol } from '../../../server/services/openai';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

// Mock schema imports
vi.mock('@shared/schema', () => ({
  createHealthProtocolSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe('Protocol Generation Service', () => {
  let mockOpenAI: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get the mocked OpenAI constructor
    const OpenAI = (await import('openai')).default;
    mockOpenAI = new (OpenAI as any)();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateHealthProtocol', () => {
    const mockLongevityRequest = {
      protocolType: 'longevity' as const,
      intensity: 'moderate' as const,
      duration: 30,
      userAge: 45,
      healthConditions: ['hypertension'],
      experience: 'intermediate' as const,
      fastingProtocol: '16:8',
      primaryGoals: ['anti_aging', 'metabolic_health'],
      culturalPreferences: [],
      dailyCalorieTarget: 1800,
      clientName: 'Test Client',
    };

    const mockParasiteCleanseRequest = {
      protocolType: 'parasite_cleanse' as const,
      intensity: 'gentle' as const,
      duration: 14,
      experience: 'first_time' as const,
      supplementTolerance: 'moderate',
      currentSymptoms: ['bloating', 'fatigue'],
      medicalConditions: [],
      pregnancyOrBreastfeeding: false,
      healthcareProviderConsent: true,
      clientName: 'Test Client',
    };

    const mockSuccessfulResponse = {
      name: 'Longevity Protocol - Test',
      description: 'Comprehensive anti-aging protocol',
      type: 'longevity',
      duration: 30,
      intensity: 'moderate',
      config: {
        fastingSchedule: '16:8',
        calorieRestriction: 0.15,
        macroDistribution: {
          protein: 0.25,
          carbs: 0.40,
          fat: 0.35,
        },
      },
      tags: ['anti-aging', 'longevity', 'fasting'],
      recommendations: {
        supplements: [
          {
            name: 'Resveratrol',
            dosage: '250mg',
            timing: 'Morning',
            purpose: 'Antioxidant and longevity support',
          },
          {
            name: 'NMN',
            dosage: '500mg',
            timing: 'Morning on empty stomach',
            purpose: 'NAD+ precursor for cellular energy',
          },
        ],
        dietaryGuidelines: [
          {
            category: 'Vegetables',
            instruction: 'Consume 7-9 servings of colorful vegetables daily',
            importance: 'high' as const,
          },
          {
            category: 'Protein',
            instruction: 'Include high-quality protein with each meal',
            importance: 'high' as const,
          },
          {
            category: 'Processed Foods',
            instruction: 'Eliminate processed and ultra-processed foods',
            importance: 'high' as const,
          },
        ],
        lifestyleChanges: [
          {
            change: 'Implement 16:8 intermittent fasting',
            rationale: 'Promotes autophagy and metabolic flexibility',
            difficulty: 'moderate' as const,
          },
          {
            change: 'Practice stress reduction techniques daily',
            rationale: 'Chronic stress accelerates aging processes',
            difficulty: 'easy' as const,
          },
        ],
        precautions: [
          {
            warning: 'Monitor blood pressure regularly due to hypertension history',
            severity: 'warning' as const,
          },
          {
            warning: 'Consult healthcare provider before starting supplements',
            severity: 'info' as const,
          },
        ],
      },
    };

    it('generates longevity protocol successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSuccessfulResponse),
            },
          },
        ],
      });

      const result = await generateHealthProtocol(mockLongevityRequest);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('health protocol expert'),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('longevity'),
          }),
        ]),
        temperature: 0.7,
        max_tokens: 4000,
      });

      expect(result).toEqual(mockSuccessfulResponse);
    });

    it('generates parasite cleanse protocol successfully', async () => {
      const parasiteResponse = {
        ...mockSuccessfulResponse,
        name: 'Parasite Cleanse Protocol - Test',
        description: 'Gentle parasite elimination protocol',
        type: 'parasite_cleanse',
        duration: 14,
        intensity: 'gentle',
        config: {
          phases: [
            { name: 'preparation', duration: 3, focus: 'gut preparation' },
            { name: 'elimination', duration: 7, focus: 'active cleansing' },
            { name: 'restoration', duration: 4, focus: 'microbiome restoration' },
          ],
        },
        recommendations: {
          supplements: [
            {
              name: 'Oregano Oil',
              dosage: '2 drops',
              timing: 'With meals',
              purpose: 'Natural antimicrobial',
            },
          ],
          dietaryGuidelines: [
            {
              category: 'Anti-Parasitic Foods',
              instruction: 'Include garlic, pumpkin seeds, and oregano daily',
              importance: 'high' as const,
            },
            {
              category: 'Avoid',
              instruction: 'Eliminate sugar and refined carbohydrates',
              importance: 'high' as const,
            },
          ],
          lifestyleChanges: [
            {
              change: 'Increase fiber intake gradually',
              rationale: 'Supports elimination of parasites',
              difficulty: 'easy' as const,
            },
          ],
          precautions: [
            {
              warning: 'May experience detox symptoms in first week',
              severity: 'info' as const,
            },
            {
              warning: 'Stop if severe reactions occur',
              severity: 'critical' as const,
            },
          ],
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(parasiteResponse),
            },
          },
        ],
      });

      const result = await generateHealthProtocol(mockParasiteCleanseRequest);

      expect(result).toEqual(parasiteResponse);
      expect(result.type).toBe('parasite_cleanse');
      expect(result.duration).toBe(14);
    });

    it('includes user-specific information in the prompt', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('45 years old');
      expect(userMessage.content).toContain('hypertension');
      expect(userMessage.content).toContain('intermediate experience');
      expect(userMessage.content).toContain('16:8');
      expect(userMessage.content).toContain('1800 calories');
    });

    it('adapts protocol based on intensity level', async () => {
      const intensiveRequest = {
        ...mockLongevityRequest,
        intensity: 'intensive' as const,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(intensiveRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('intensive');
    });

    it('includes medical conditions in safety considerations', async () => {
      const medicalConditionsRequest = {
        ...mockLongevityRequest,
        healthConditions: ['diabetes', 'hypertension', 'hypothyroidism'],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(medicalConditionsRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('diabetes');
      expect(userMessage.content).toContain('hypertension');
      expect(userMessage.content).toContain('hypothyroidism');
    });

    it('handles pregnancy considerations for parasite cleanse', async () => {
      const pregnancyRequest = {
        ...mockParasiteCleanseRequest,
        pregnancyOrBreastfeeding: true,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(pregnancyRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('pregnant');
      expect(userMessage.content).toContain('gentle');
    });

    it('requires healthcare provider consent for parasite cleanse', async () => {
      const noConsentRequest = {
        ...mockParasiteCleanseRequest,
        healthcareProviderConsent: false,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(noConsentRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('healthcare provider consent');
    });

    it('throws error when OpenAI API fails', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow('API Error');
    });

    it('throws error when response is not valid JSON', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow();
    });

    it('throws error when response has no choices', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [],
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow();
    });

    it('validates protocol data structure', async () => {
      const invalidResponse = {
        name: 'Test Protocol',
        // Missing required fields
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(invalidResponse) } }],
      });

      // Should validate using schema
      const { createHealthProtocolSchema } = await import('@shared/schema');
      createHealthProtocolSchema.parse.mockImplementation(() => {
        throw new Error('Invalid protocol structure');
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow(
        'Invalid protocol structure'
      );
    });

    it('uses appropriate model temperature', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7, // Balanced creativity and consistency
        })
      );
    });

    it('sets appropriate token limits', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4000, // Sufficient for detailed protocols
        })
      );
    });

    it('includes cultural preferences in protocol generation', async () => {
      const culturalRequest = {
        ...mockLongevityRequest,
        culturalPreferences: ['Mediterranean', 'Plant-based'],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(culturalRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('Mediterranean');
      expect(userMessage.content).toContain('Plant-based');
    });

    it('generates age-appropriate recommendations', async () => {
      const elderlyRequest = {
        ...mockLongevityRequest,
        userAge: 75,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(elderlyRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('75');
      expect(userMessage.content).toContain('elderly');
    });

    it('adapts to experience level', async () => {
      const beginnerRequest = {
        ...mockLongevityRequest,
        experience: 'beginner' as const,
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(beginnerRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('beginner');
    });

    it('handles current medications in safety warnings', async () => {
      const medicationRequest = {
        ...mockLongevityRequest,
        currentMedications: ['metformin', 'lisinopril'],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(medicationRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('metformin');
      expect(userMessage.content).toContain('lisinopril');
    });

    it('includes supplement tolerance for parasite cleanse', async () => {
      const lowToleranceRequest = {
        ...mockParasiteCleanseRequest,
        supplementTolerance: 'low',
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(lowToleranceRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('low supplement tolerance');
    });

    it('accounts for current symptoms in protocol design', async () => {
      const symptomsRequest = {
        ...mockParasiteCleanseRequest,
        currentSymptoms: ['digestive issues', 'brain fog', 'fatigue'],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(symptomsRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('digestive issues');
      expect(userMessage.content).toContain('brain fog');
      expect(userMessage.content).toContain('fatigue');
    });

    it('generates protocols with proper safety hierarchies', async () => {
      const response = {
        ...mockSuccessfulResponse,
        recommendations: {
          ...mockSuccessfulResponse.recommendations,
          precautions: [
            {
              warning: 'Critical: Stop immediately if severe reactions occur',
              severity: 'critical' as const,
            },
            {
              warning: 'Warning: Monitor blood pressure weekly',
              severity: 'warning' as const,
            },
            {
              warning: 'Info: Stay hydrated during fasting periods',
              severity: 'info' as const,
            },
          ],
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(response) } }],
      });

      const result = await generateHealthProtocol(mockLongevityRequest);

      expect(result.recommendations.precautions).toHaveLength(3);
      expect(result.recommendations.precautions[0].severity).toBe('critical');
      expect(result.recommendations.precautions[1].severity).toBe('warning');
      expect(result.recommendations.precautions[2].severity).toBe('info');
    });

    it('includes difficulty ratings for lifestyle changes', async () => {
      const response = {
        ...mockSuccessfulResponse,
        recommendations: {
          ...mockSuccessfulResponse.recommendations,
          lifestyleChanges: [
            {
              change: 'Daily meditation practice',
              rationale: 'Reduces stress and promotes longevity',
              difficulty: 'easy' as const,
            },
            {
              change: 'Advanced intermittent fasting (20:4)',
              rationale: 'Maximum autophagy benefits',
              difficulty: 'challenging' as const,
            },
          ],
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(response) } }],
      });

      const result = await generateHealthProtocol(mockLongevityRequest);

      const difficulties = result.recommendations.lifestyleChanges.map(
        (change) => change.difficulty
      );
      expect(difficulties).toContain('easy');
      expect(difficulties).toContain('challenging');
    });

    it('prioritizes dietary guidelines by importance', async () => {
      const response = {
        ...mockSuccessfulResponse,
        recommendations: {
          ...mockSuccessfulResponse.recommendations,
          dietaryGuidelines: [
            {
              category: 'Hydration',
              instruction: 'Drink 8-10 glasses of water daily',
              importance: 'high' as const,
            },
            {
              category: 'Treats',
              instruction: 'Limit desserts to once per week',
              importance: 'low' as const,
            },
            {
              category: 'Timing',
              instruction: 'Eat largest meal at midday',
              importance: 'medium' as const,
            },
          ],
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(response) } }],
      });

      const result = await generateHealthProtocol(mockLongevityRequest);

      const importanceLevels = result.recommendations.dietaryGuidelines.map(
        (guideline) => guideline.importance
      );
      expect(importanceLevels).toContain('high');
      expect(importanceLevels).toContain('medium');
      expect(importanceLevels).toContain('low');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing required fields gracefully', async () => {
      const incompleteRequest = {
        // Missing required fields
      } as any;

      await expect(generateHealthProtocol(incompleteRequest)).rejects.toThrow();
    });

    it('handles network timeouts', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow(
        'Request timeout'
      );
    });

    it('handles API rate limiting', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('handles malformed API responses', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: '{"incomplete": "json"', // Malformed JSON
            },
          },
        ],
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow();
    });

    it('handles empty API responses', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow();
    });

    it('validates protocol completeness', async () => {
      const incompleteProtocol = {
        name: 'Test Protocol',
        description: 'Test Description',
        // Missing other required fields
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(incompleteProtocol) } }],
      });

      const { createHealthProtocolSchema } = await import('@shared/schema');
      createHealthProtocolSchema.parse.mockImplementation(() => {
        throw new Error('Missing required fields');
      });

      await expect(generateHealthProtocol(mockLongevityRequest)).rejects.toThrow(
        'Missing required fields'
      );
    });
  });

  describe('Performance and Optimization', () => {
    it('uses efficient token limits', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(callArgs.max_tokens).toBeLessThanOrEqual(4000);
    });

    it('uses appropriate model for task complexity', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-4'); // Uses GPT-4 for complex medical protocols
    });

    it('balances creativity and consistency with temperature', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockSuccessfulResponse) } }],
      });

      await generateHealthProtocol(mockLongevityRequest);

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(callArgs.temperature).toBe(0.7); // Balanced for medical protocols
    });
  });
});