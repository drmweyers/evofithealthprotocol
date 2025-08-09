import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the saveProtocolToDatabase function since it's embedded in the component
// We'll extract and test its logic separately
const saveProtocolToDatabase = async (type: string, generatedData: any, requestData: any) => {
  try {
    // Validate required data before attempting save
    if (!generatedData || !requestData) {
      console.warn('Skipping database save: missing required data');
      return;
    }

    const protocolData = {
      name: requestData.planName || `${type} Protocol - ${new Date().toLocaleDateString()}`,
      description: `Generated ${type} protocol with ${generatedData.mealPlan?.meals?.length || 0} meals`,
      type: type === 'ailments-based' ? 'longevity' : type, // Map ailments-based to longevity type in DB
      duration: generatedData.mealPlan?.duration || requestData.duration || 30,
      intensity: type === 'parasite_cleanse' ? requestData.intensity : 'moderate',
      config: {
        originalRequest: requestData,
        generatedPlan: generatedData,
        mealPlan: generatedData.mealPlan,
        ...generatedData
      },
      tags: type === 'ailments-based' && requestData.selectedAilments ? requestData.selectedAilments : [type]
    };

    const response = await fetch('/api/trainer/health-protocols', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(protocolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save protocol to database:', response.status, errorText);
      // Don't throw error - generation succeeded, saving is just for persistence
    } else {
      console.log('Protocol successfully saved to database');
    }
  } catch (error) {
    console.error('Error saving protocol to database:', error);
    // Don't throw error - generation succeeded, saving is just for persistence
  }
};

describe('saveProtocolToDatabase', () => {
  const mockFetch = vi.fn();
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    consoleSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful Database Saves', () => {
    it('saves longevity protocol successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: '123', message: 'Protocol saved' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = {
        mealPlan: {
          duration: 30,
          meals: [
            { name: 'Breakfast', calories: 400 },
            { name: 'Lunch', calories: 500 },
            { name: 'Dinner', calories: 600 }
          ]
        },
        fastingSchedule: '16:8',
        safetyDisclaimer: { title: 'Safety First', content: 'Consult your doctor' }
      };

      const requestData = {
        planName: 'Test Longevity Plan',
        duration: 30,
        fastingProtocol: '16:8',
        primaryGoals: ['anti_aging']
      };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Longevity Plan',
          description: 'Generated longevity protocol with 3 meals',
          type: 'longevity',
          duration: 30,
          intensity: 'moderate',
          config: {
            originalRequest: requestData,
            generatedPlan: generatedData,
            mealPlan: generatedData.mealPlan,
            ...generatedData
          },
          tags: ['longevity']
        })
      });

      expect(consoleSpy).toHaveBeenCalledWith('Protocol successfully saved to database');
    });

    it('saves parasite cleanse protocol successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: '456', message: 'Protocol saved' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = {
        mealPlan: {
          duration: 14,
          meals: [
            { name: 'Anti-parasitic Breakfast', ingredients: ['garlic', 'turmeric'] }
          ]
        },
        dailySchedules: ['Phase 1: Preparation', 'Phase 2: Cleanse'],
        safetyDisclaimer: { title: 'Medical Warning', content: 'Consult healthcare provider' }
      };

      const requestData = {
        planName: 'Parasite Cleanse Protocol',
        duration: '14',
        intensity: 'gentle',
        healthcareProviderConsent: true
      };

      await saveProtocolToDatabase('parasite_cleanse', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Parasite Cleanse Protocol',
          description: 'Generated parasite_cleanse protocol with 1 meals',
          type: 'parasite_cleanse',
          duration: 14,
          intensity: 'gentle',
          config: {
            originalRequest: requestData,
            generatedPlan: generatedData,
            mealPlan: generatedData.mealPlan,
            ...generatedData
          },
          tags: ['parasite_cleanse']
        })
      });

      expect(consoleSpy).toHaveBeenCalledWith('Protocol successfully saved to database');
    });

    it('saves ailments-based protocol successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: '789', message: 'Protocol saved' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = {
        mealPlan: {
          duration: 30,
          meals: [
            { name: 'Heart-healthy Breakfast', focus: 'cardiovascular' },
            { name: 'Anti-inflammatory Lunch', focus: 'inflammation' }
          ]
        }
      };

      const requestData = {
        planName: 'Hypertension Management Plan',
        selectedAilments: ['hypertension', 'diabetes'],
        nutritionalFocus: { mealPlanFocus: ['cardiovascular', 'blood-sugar'] },
        priorityLevel: 'high'
      };

      await saveProtocolToDatabase('ailments-based', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hypertension Management Plan',
          description: 'Generated ailments-based protocol with 2 meals',
          type: 'longevity', // ailments-based maps to longevity in DB
          duration: 30, // default when not specified
          intensity: 'moderate',
          config: {
            originalRequest: requestData,
            generatedPlan: generatedData,
            mealPlan: generatedData.mealPlan,
            ...generatedData
          },
          tags: ['hypertension', 'diabetes']
        })
      });

      expect(consoleSpy).toHaveBeenCalledWith('Protocol successfully saved to database');
    });
  });

  describe('Data Validation', () => {
    it('skips save when generatedData is missing', async () => {
      const requestData = { planName: 'Test Plan' };

      await saveProtocolToDatabase('longevity', null, requestData);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping database save: missing required data');
    });

    it('skips save when requestData is missing', async () => {
      const generatedData = { mealPlan: { meals: [] } };

      await saveProtocolToDatabase('longevity', generatedData, null);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping database save: missing required data');
    });

    it('skips save when both data parameters are missing', async () => {
      await saveProtocolToDatabase('longevity', null, null);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Skipping database save: missing required data');
    });

    it('uses default values when plan name is missing', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = {}; // No planName

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"name":"longevity Protocol -')
      });
    });

    it('uses default duration when not specified', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } }; // No duration
      const requestData = { planName: 'Test Plan' }; // No duration

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"duration":30')
      });
    });

    it('handles missing meal count gracefully', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: {} }; // No meals array
      const requestData = { planName: 'Test Plan' };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"description":"Generated longevity protocol with 0 meals"')
      });
    });
  });

  describe('Error Handling', () => {
    it('handles HTTP error responses gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Test Plan' };

      // Should not throw an error
      await expect(saveProtocolToDatabase('longevity', generatedData, requestData)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save protocol to database:',
        500,
        'Internal Server Error'
      );
    });

    it('handles network errors gracefully', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValue(networkError);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Test Plan' };

      // Should not throw an error
      await expect(saveProtocolToDatabase('longevity', generatedData, requestData)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving protocol to database:', networkError);
    });

    it('handles JSON parsing errors in error response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request - Invalid JSON')
      };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Test Plan' };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save protocol to database:',
        400,
        'Bad Request - Invalid JSON'
      );
    });

    it('handles fetch rejection gracefully', async () => {
      mockFetch.mockImplementation(() => {
        throw new Error('Fetch failed');
      });

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Test Plan' };

      await expect(saveProtocolToDatabase('longevity', generatedData, requestData)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving protocol to database:',
        expect.any(Error)
      );
    });
  });

  describe('Protocol Type Mapping', () => {
    it('maps ailments-based type to longevity in database', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Ailments Plan' };

      await saveProtocolToDatabase('ailments-based', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"type":"longevity"')
      });
    });

    it('preserves longevity type as-is', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Longevity Plan' };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"type":"longevity"')
      });
    });

    it('preserves parasite_cleanse type as-is', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Cleanse Plan' };

      await saveProtocolToDatabase('parasite_cleanse', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"type":"parasite_cleanse"')
      });
    });
  });

  describe('Tags Generation', () => {
    it('uses selectedAilments as tags for ailments-based protocols', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { 
        planName: 'Health Plan',
        selectedAilments: ['hypertension', 'diabetes', 'arthritis']
      };

      await saveProtocolToDatabase('ailments-based', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"tags":["hypertension","diabetes","arthritis"]')
      });
    });

    it('uses protocol type as tag when no ailments specified', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'General Plan' };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"tags":["longevity"]')
      });
    });

    it('uses protocol type as tag for non-ailments protocols', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = { mealPlan: { meals: [] } };
      const requestData = { planName: 'Cleanse Plan' };

      await saveProtocolToDatabase('parasite_cleanse', generatedData, requestData);

      expect(mockFetch).toHaveBeenCalledWith('/api/trainer/health-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"tags":["parasite_cleanse"]')
      });
    });
  });

  describe('Configuration Structure', () => {
    it('includes all required configuration fields', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const generatedData = {
        mealPlan: { meals: [], duration: 21 },
        fastingSchedule: '18:6',
        additionalField: 'test'
      };
      const requestData = { planName: 'Complete Plan', customField: 'value' };

      await saveProtocolToDatabase('longevity', generatedData, requestData);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      
      expect(callBody.config).toEqual({
        originalRequest: requestData,
        generatedPlan: generatedData,
        mealPlan: generatedData.mealPlan,
        ...generatedData // Spread should include all fields
      });

      expect(callBody.config.fastingSchedule).toBe('18:6');
      expect(callBody.config.additionalField).toBe('test');
      expect(callBody.config.customField).toBe('value');
    });
  });
});