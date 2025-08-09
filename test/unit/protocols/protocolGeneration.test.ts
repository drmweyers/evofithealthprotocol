import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock protocol generation handlers based on the actual implementation
const createProtocolGenerationHandlers = (setIsGenerating: Function, setGenerationError: Function, setGeneratedMealPlan: Function, setActiveTab: Function) => {
  
  const saveProtocolToDatabase = async (type: string, generatedData: any, requestData: any) => {
    // Mock implementation - in real tests this would be mocked separately
    if (!generatedData || !requestData) return;
    
    const response = await fetch('/api/trainer/health-protocols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: requestData.planName || `${type} Protocol - ${new Date().toLocaleDateString()}`,
        type: type === 'ailments-based' ? 'longevity' : type,
        config: { originalRequest: requestData, generatedPlan: generatedData }
      })
    });
  };

  const handleGenerateLongevityPlan = async (longevityConfig: any, medicalDisclaimer: any) => {
    if (!longevityConfig.isEnabled) {
      setGenerationError('Please enable and configure Longevity Mode first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const requestData = {
        planName: `Longevity Protocol - ${new Date().toLocaleDateString()}`,
        duration: 30,
        fastingProtocol: longevityConfig.fastingStrategy === 'none' ? '16:8' : longevityConfig.fastingStrategy,
        experienceLevel: 'beginner',
        primaryGoals: [
          longevityConfig.includeAntiInflammatory ? 'inflammation_reduction' : null,
          longevityConfig.includeBrainHealth ? 'cognitive_function' : null,
          longevityConfig.includeHeartHealth ? 'metabolic_health' : null,
          'anti_aging',
          'cellular_health'
        ].filter(Boolean),
        culturalPreferences: [],
        currentAge: 35,
        dailyCalorieTarget: longevityConfig.calorieRestriction === 'strict' ? 1400 : 
                           longevityConfig.calorieRestriction === 'moderate' ? 1600 :
                           longevityConfig.calorieRestriction === 'mild' ? 1800 : 2000,
        clientName: 'Current User'
      };

      const response = await fetch('/api/specialized/longevity/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate longevity meal plan');
      }

      const result = await response.json();
      
      await saveProtocolToDatabase('longevity', result, requestData);
      
      setGeneratedMealPlan({ type: 'longevity', data: result });
      setActiveTab('dashboard');
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateParasiteCleansePlan = async (parasiteConfig: any, medicalDisclaimer: any) => {
    if (!parasiteConfig.isEnabled) {
      setGenerationError('Please enable and configure Parasite Cleanse Protocol first.');
      return;
    }

    // Safety check for medical consent
    const hasValidMedicalConsent = medicalDisclaimer.hasConsented && medicalDisclaimer.hasHealthcareProviderApproval;
    if (!hasValidMedicalConsent && parasiteConfig.intensity !== 'gentle') {
      setGenerationError('Medical consent and healthcare provider approval required for parasite cleanse protocol.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const requestData = {
        planName: `Parasite Cleanse Protocol - ${new Date().toLocaleDateString()}`,
        duration: parasiteConfig.duration.toString(),
        intensity: parasiteConfig.intensity,
        experienceLevel: 'first_time',
        culturalPreferences: [],
        supplementTolerance: 'moderate',
        currentSymptoms: [],
        medicalConditions: [],
        pregnancyOrBreastfeeding: false,
        healthcareProviderConsent: medicalDisclaimer.hasHealthcareProviderApproval,
        clientName: 'Current User'
      };

      const response = await fetch('/api/specialized/parasite-cleanse/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate parasite cleanse protocol');
      }

      const result = await response.json();
      
      await saveProtocolToDatabase('parasite_cleanse', result, requestData);
      
      setGeneratedMealPlan({ type: 'parasite-cleanse', data: result });
      setActiveTab('dashboard');
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAilmentsBasedPlan = async (clientAilmentsConfig: any) => {
    if (!clientAilmentsConfig.includeInMealPlanning || clientAilmentsConfig.selectedAilments.length === 0) {
      setGenerationError('Please select health issues and enable meal planning integration first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const requestData = {
        planName: `Health-Targeted Plan - ${new Date().toLocaleDateString()}`,
        duration: 30,
        selectedAilments: clientAilmentsConfig.selectedAilments,
        nutritionalFocus: clientAilmentsConfig.nutritionalFocus,
        priorityLevel: clientAilmentsConfig.priorityLevel,
        dailyCalorieTarget: 2000,
        clientName: 'Current User'
      };

      const response = await fetch('/api/specialized/ailments-based/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate health-targeted meal plan');
      }

      const result = await response.json();
      
      await saveProtocolToDatabase('ailments-based', result, requestData);
      
      setGeneratedMealPlan({ type: 'ailments-based', data: result });
      setActiveTab('dashboard');
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleGenerateLongevityPlan,
    handleGenerateParasiteCleansePlan,
    handleGenerateAilmentsBasedPlan
  };
};

describe('Protocol Generation Tests', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  // Mock state setters
  const setIsGenerating = vi.fn();
  const setGenerationError = vi.fn();
  const setGeneratedMealPlan = vi.fn();
  const setActiveTab = vi.fn();

  const handlers = createProtocolGenerationHandlers(
    setIsGenerating,
    setGenerationError,
    setGeneratedMealPlan,
    setActiveTab
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Longevity Protocol Generation', () => {
    it('generates longevity plan with valid configuration', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          mealPlan: {
            duration: 30,
            meals: [
              { name: 'Anti-aging Breakfast', calories: 450, antioxidants: ['blueberries', 'spinach'] },
              { name: 'Longevity Lunch', calories: 550, omega3: true },
              { name: 'Brain Health Dinner', calories: 600, neuroprotective: true }
            ]
          },
          fastingSchedule: {
            protocol: '16:8',
            eatWindow: '12:00-20:00',
            fastWindow: '20:00-12:00'
          },
          supplementRecommendations: ['vitamin D', 'omega-3', 'resveratrol'],
          safetyDisclaimer: {
            title: 'Longevity Protocol Disclaimer',
            content: 'This protocol is designed for healthy adults. Consult healthcare provider.'
          }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const longevityConfig = {
        isEnabled: true,
        fastingStrategy: '16:8' as const,
        calorieRestriction: 'moderate' as const,
        antioxidantFocus: ['polyphenols', 'anthocyanins'],
        includeAntiInflammatory: true,
        includeBrainHealth: true,
        includeHeartHealth: false,
        targetServings: { vegetables: 7, antioxidantFoods: 4, omega3Sources: 2 }
      };

      const medicalDisclaimer = {
        hasReadDisclaimer: true,
        hasConsented: true,
        consentTimestamp: new Date(),
        acknowledgedRisks: true,
        hasHealthcareProviderApproval: true,
        pregnancyScreeningComplete: true,
        medicalConditionsScreened: true
      };

      await handlers.handleGenerateLongevityPlan(longevityConfig, medicalDisclaimer);

      expect(setIsGenerating).toHaveBeenCalledWith(true);
      expect(setGenerationError).toHaveBeenCalledWith(null);

      expect(mockFetch).toHaveBeenCalledWith('/api/specialized/longevity/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"primaryGoals":["inflammation_reduction","cognitive_function","anti_aging","cellular_health"]')
      });

      expect(setGeneratedMealPlan).toHaveBeenCalledWith({
        type: 'longevity',
        data: expect.objectContaining({
          mealPlan: expect.objectContaining({ duration: 30, meals: expect.any(Array) }),
          fastingSchedule: expect.any(Object)
        })
      });

      expect(setActiveTab).toHaveBeenCalledWith('dashboard');
      expect(setIsGenerating).toHaveBeenLastCalledWith(false);
    });

    it('sets different calorie targets based on restriction level', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) };
      mockFetch.mockResolvedValue(mockResponse);

      const testCases = [
        { restriction: 'strict', expectedCalories: 1400 },
        { restriction: 'moderate', expectedCalories: 1600 },
        { restriction: 'mild', expectedCalories: 1800 },
        { restriction: 'none', expectedCalories: 2000 }
      ];

      for (const testCase of testCases) {
        const config = {
          isEnabled: true,
          fastingStrategy: '16:8' as const,
          calorieRestriction: testCase.restriction as any,
          antioxidantFocus: [],
          includeAntiInflammatory: false,
          includeBrainHealth: false,
          includeHeartHealth: false,
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 }
        };

        await handlers.handleGenerateLongevityPlan(config, { hasConsented: true });

        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/longevity/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(`"dailyCalorieTarget":${testCase.expectedCalories}`)
        });

        mockFetch.mockClear();
      }
    });

    it('fails when longevity mode is not enabled', async () => {
      const longevityConfig = { isEnabled: false };

      await handlers.handleGenerateLongevityPlan(longevityConfig, {});

      expect(setGenerationError).toHaveBeenCalledWith('Please enable and configure Longevity Mode first.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Insufficient data for longevity plan generation' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const longevityConfig = { isEnabled: true, fastingStrategy: '16:8', calorieRestriction: 'none' };

      await handlers.handleGenerateLongevityPlan(longevityConfig, {});

      expect(setGenerationError).toHaveBeenCalledWith('Insufficient data for longevity plan generation');
      expect(setIsGenerating).toHaveBeenCalledWith(false);
    });
  });

  describe('Parasite Cleanse Protocol Generation', () => {
    it('generates parasite cleanse plan with valid configuration', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          mealPlan: {
            duration: 14,
            meals: [
              { name: 'Anti-parasitic Morning Blend', ingredients: ['garlic', 'oregano', 'pumpkin seeds'] },
              { name: 'Cleansing Lunch', ingredients: ['turmeric', 'ginger', 'coconut oil'] },
              { name: 'Healing Dinner', ingredients: ['wormwood tea', 'papaya seeds', 'raw carrots'] }
            ]
          },
          dailySchedules: [
            { day: 1, phase: 'preparation', supplements: ['probiotics'], dietFocus: 'elimination' },
            { day: 7, phase: 'active-cleanse', supplements: ['antimicrobials'], dietFocus: 'anti-parasitic' },
            { day: 14, phase: 'recovery', supplements: ['digestive-enzymes'], dietFocus: 'rebuilding' }
          ],
          supportingProtocols: {
            hydration: '3L filtered water daily',
            exercise: 'light movement only',
            sleep: '8+ hours nightly'
          },
          safetyDisclaimer: {
            title: 'Parasite Cleanse Medical Warning',
            content: 'This protocol requires medical supervision. Discontinue if severe symptoms occur.'
          }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const parasiteConfig = {
        isEnabled: true,
        duration: 14,
        intensity: 'moderate' as const,
        currentPhase: 'preparation' as const,
        includeHerbalSupplements: true,
        dietOnlyCleanse: false,
        startDate: new Date(),
        endDate: null,
        targetFoods: {
          antiParasitic: ['garlic', 'oregano', 'pumpkin-seeds'],
          probiotics: ['kefir', 'sauerkraut'],
          fiberRich: ['psyllium', 'chia-seeds'],
          excludeFoods: ['sugar', 'processed-foods', 'dairy']
        }
      };

      const medicalDisclaimer = {
        hasConsented: true,
        hasHealthcareProviderApproval: true,
        pregnancyScreeningComplete: true,
        medicalConditionsScreened: true
      };

      await handlers.handleGenerateParasiteCleansePlan(parasiteConfig, medicalDisclaimer);

      expect(mockFetch).toHaveBeenCalledWith('/api/specialized/parasite-cleanse/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"intensity":"moderate"')
      });

      expect(setGeneratedMealPlan).toHaveBeenCalledWith({
        type: 'parasite-cleanse',
        data: expect.objectContaining({
          mealPlan: expect.objectContaining({ duration: 14 }),
          dailySchedules: expect.any(Array)
        })
      });
    });

    it('requires medical consent for intensive protocols', async () => {
      const parasiteConfig = {
        isEnabled: true,
        duration: 21,
        intensity: 'intensive' as const,
        currentPhase: 'preparation' as const
      };

      const medicalDisclaimer = {
        hasConsented: false,
        hasHealthcareProviderApproval: false
      };

      await handlers.handleGenerateParasiteCleansePlan(parasiteConfig, medicalDisclaimer);

      expect(setGenerationError).toHaveBeenCalledWith(
        'Medical consent and healthcare provider approval required for parasite cleanse protocol.'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('allows gentle protocols without strict medical consent', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) };
      mockFetch.mockResolvedValue(mockResponse);

      const parasiteConfig = {
        isEnabled: true,
        duration: 7,
        intensity: 'gentle' as const,
        currentPhase: 'preparation' as const
      };

      const medicalDisclaimer = {
        hasConsented: false,
        hasHealthcareProviderApproval: false
      };

      await handlers.handleGenerateParasiteCleansePlan(parasiteConfig, medicalDisclaimer);

      expect(mockFetch).toHaveBeenCalled();
      expect(setGenerationError).not.toHaveBeenCalledWith(expect.stringContaining('Medical consent'));
    });

    it('fails when parasite cleanse is not enabled', async () => {
      const parasiteConfig = { isEnabled: false };

      await handlers.handleGenerateParasiteCleansePlan(parasiteConfig, {});

      expect(setGenerationError).toHaveBeenCalledWith('Please enable and configure Parasite Cleanse Protocol first.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles different duration and intensity combinations', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) };
      mockFetch.mockResolvedValue(mockResponse);

      const testCases = [
        { duration: 7, intensity: 'gentle' },
        { duration: 14, intensity: 'moderate' },
        { duration: 21, intensity: 'intensive' }
      ];

      for (const testCase of testCases) {
        const config = {
          isEnabled: true,
          duration: testCase.duration,
          intensity: testCase.intensity as any,
          currentPhase: 'preparation' as const
        };

        const medicalConsent = { hasConsented: true, hasHealthcareProviderApproval: true };

        await handlers.handleGenerateParasiteCleansePlan(config, medicalConsent);

        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/parasite-cleanse/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(`"duration":"${testCase.duration}"`)
        });

        mockFetch.mockClear();
      }
    });
  });

  describe('Ailments-Based Protocol Generation', () => {
    it('generates ailments-based plan with valid configuration', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          mealPlan: {
            duration: 30,
            meals: [
              { 
                name: 'Heart-Healthy Breakfast', 
                focus: 'cardiovascular',
                ingredients: ['oats', 'blueberries', 'walnuts'],
                nutrients: { fiber: '8g', omega3: '2g' }
              },
              { 
                name: 'Anti-Inflammatory Lunch',
                focus: 'inflammation', 
                ingredients: ['salmon', 'spinach', 'turmeric'],
                nutrients: { omega3: '3g', antioxidants: 'high' }
              },
              { 
                name: 'Blood Sugar Stabilizing Dinner',
                focus: 'glucose-control',
                ingredients: ['quinoa', 'broccoli', 'lean-chicken'],
                nutrients: { fiber: '12g', protein: '35g' }
              }
            ]
          },
          nutritionalAnalysis: {
            ailmentTargeting: {
              hypertension: 'low-sodium, high-potassium approach',
              diabetes: 'low-glycemic index focus',
              arthritis: 'anti-inflammatory compounds emphasized'
            },
            keyNutrients: ['omega-3', 'fiber', 'antioxidants', 'magnesium'],
            avoidanceStrategy: ['excess sodium', 'refined sugars', 'pro-inflammatory oils']
          },
          progressTrackingMetrics: ['blood pressure', 'blood glucose', 'inflammation markers'],
          safetyDisclaimer: {
            title: 'Health-Targeted Nutrition Plan',
            content: 'This plan addresses specific health conditions. Monitor symptoms and consult healthcare providers.'
          }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const clientAilmentsConfig = {
        selectedAilments: ['hypertension', 'diabetes', 'arthritis'],
        nutritionalFocus: {
          mealPlanFocus: ['cardiovascular', 'inflammation', 'glucose-control'],
          priorityNutrients: ['omega-3', 'fiber', 'antioxidants'],
          avoidIngredients: ['sodium', 'refined-sugar'],
          emphasizeIngredients: ['leafy-greens', 'fatty-fish', 'whole-grains']
        },
        includeInMealPlanning: true,
        priorityLevel: 'high' as const
      };

      await handlers.handleGenerateAilmentsBasedPlan(clientAilmentsConfig);

      expect(mockFetch).toHaveBeenCalledWith('/api/specialized/ailments-based/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"selectedAilments":["hypertension","diabetes","arthritis"]')
      });

      expect(setGeneratedMealPlan).toHaveBeenCalledWith({
        type: 'ailments-based',
        data: expect.objectContaining({
          mealPlan: expect.objectContaining({ duration: 30 }),
          nutritionalAnalysis: expect.any(Object)
        })
      });
    });

    it('handles different priority levels', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) };
      mockFetch.mockResolvedValue(mockResponse);

      const priorityLevels = ['low', 'medium', 'high'] as const;

      for (const priority of priorityLevels) {
        const config = {
          selectedAilments: ['hypertension'],
          nutritionalFocus: { mealPlanFocus: ['cardiovascular'] },
          includeInMealPlanning: true,
          priorityLevel: priority
        };

        await handlers.handleGenerateAilmentsBasedPlan(config);

        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/ailments-based/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(`"priorityLevel":"${priority}"`)
        });

        mockFetch.mockClear();
      }
    });

    it('fails when no ailments are selected', async () => {
      const clientAilmentsConfig = {
        selectedAilments: [],
        includeInMealPlanning: false,
        priorityLevel: 'medium' as const
      };

      await handlers.handleGenerateAilmentsBasedPlan(clientAilmentsConfig);

      expect(setGenerationError).toHaveBeenCalledWith(
        'Please select health issues and enable meal planning integration first.'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fails when meal planning integration is disabled', async () => {
      const clientAilmentsConfig = {
        selectedAilments: ['hypertension', 'diabetes'],
        includeInMealPlanning: false,
        priorityLevel: 'medium' as const
      };

      await handlers.handleGenerateAilmentsBasedPlan(clientAilmentsConfig);

      expect(setGenerationError).toHaveBeenCalledWith(
        'Please select health issues and enable meal planning integration first.'
      );
    });

    it('handles multiple ailments with complex nutritional focus', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) };
      mockFetch.mockResolvedValue(mockResponse);

      const complexConfig = {
        selectedAilments: ['hypertension', 'diabetes', 'arthritis', 'high-cholesterol', 'osteoporosis'],
        nutritionalFocus: {
          mealPlanFocus: ['cardiovascular', 'inflammation', 'glucose-control', 'bone-health'],
          priorityNutrients: ['omega-3', 'fiber', 'calcium', 'vitamin-d', 'magnesium'],
          avoidIngredients: ['sodium', 'refined-sugar', 'trans-fats', 'excessive-phosphorus'],
          emphasizeIngredients: ['leafy-greens', 'fatty-fish', 'nuts', 'seeds', 'low-fat-dairy']
        },
        includeInMealPlanning: true,
        priorityLevel: 'high' as const
      };

      await handlers.handleGenerateAilmentsBasedPlan(complexConfig);

      expect(mockFetch).toHaveBeenCalledWith('/api/specialized/ailments-based/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"selectedAilments":["hypertension","diabetes","arthritis","high-cholesterol","osteoporosis"]')
      });
    });
  });

  describe('Error Handling Across All Protocols', () => {
    it('handles network errors for longevity generation', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const config = { isEnabled: true, fastingStrategy: '16:8', calorieRestriction: 'none' };
      
      await handlers.handleGenerateLongevityPlan(config, {});

      expect(setGenerationError).toHaveBeenCalledWith('Network connection failed');
      expect(setIsGenerating).toHaveBeenCalledWith(false);
    });

    it('handles API timeout for parasite cleanse generation', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout'));

      const config = { isEnabled: true, duration: 14, intensity: 'gentle' as const };
      
      await handlers.handleGenerateParasiteCleansePlan(config, { hasConsented: true });

      expect(setGenerationError).toHaveBeenCalledWith('Request timeout');
      expect(setIsGenerating).toHaveBeenCalledWith(false);
    });

    it('handles server errors for ailments-based generation', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Server is temporarily unavailable' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const config = {
        selectedAilments: ['hypertension'],
        includeInMealPlanning: true,
        priorityLevel: 'medium' as const
      };
      
      await handlers.handleGenerateAilmentsBasedPlan(config);

      expect(setGenerationError).toHaveBeenCalledWith('Server is temporarily unavailable');
    });

    it('handles malformed JSON responses', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.reject(new Error('Invalid JSON'))
      };
      mockFetch.mockResolvedValue(mockResponse);

      const config = { isEnabled: true, fastingStrategy: '16:8' };
      
      await handlers.handleGenerateLongevityPlan(config, {});

      expect(setGenerationError).toHaveBeenCalledWith('Invalid JSON');
    });
  });

  describe('State Management During Generation', () => {
    it('properly manages loading state throughout generation lifecycle', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);

      const config = { isEnabled: true, fastingStrategy: '16:8' };
      
      const generationPromise = handlers.handleGenerateLongevityPlan(config, {});

      // Should set loading to true immediately
      expect(setIsGenerating).toHaveBeenCalledWith(true);
      expect(setGenerationError).toHaveBeenCalledWith(null);

      // Resolve the fetch promise
      resolvePromise!({ ok: true, json: () => Promise.resolve({ mealPlan: { meals: [] } }) });
      
      await generationPromise;

      // Should set loading to false at the end
      expect(setIsGenerating).toHaveBeenLastCalledWith(false);
    });
  });
});