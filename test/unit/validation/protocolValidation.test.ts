import { describe, it, expect, vi, beforeEach } from 'vitest';

// Protocol validation functions based on the SpecializedProtocolsPanel implementation
const createProtocolValidators = () => {
  const hasActiveProtocols = (longevityConfig: any, parasiteConfig: any, clientAilmentsConfig: any): boolean => {
    return longevityConfig.isEnabled || 
           parasiteConfig.isEnabled || 
           (clientAilmentsConfig.includeInMealPlanning && clientAilmentsConfig.selectedAilments.length > 0);
  };

  const requiresMedicalConsent = (longevityConfig: any, parasiteConfig: any): boolean => {
    return (
      (longevityConfig.isEnabled && longevityConfig.calorieRestriction !== 'none') ||
      (parasiteConfig.isEnabled && parasiteConfig.intensity !== 'gentle')
    );
  };

  const hasValidMedicalConsent = (medicalDisclaimer: any, longevityConfig: any, parasiteConfig: any): boolean => {
    if (!requiresMedicalConsent(longevityConfig, parasiteConfig)) return true;
    return medicalDisclaimer.hasConsented && medicalDisclaimer.hasHealthcareProviderApproval;
  };

  const validateLongevityConfig = (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config) {
      errors.push('Longevity configuration is required');
      return { isValid: false, errors };
    }

    if (!config.isEnabled) {
      errors.push('Longevity mode must be enabled');
    }

    if (config.isEnabled) {
      if (!config.fastingStrategy) {
        errors.push('Fasting strategy is required');
      }

      if (!config.calorieRestriction) {
        errors.push('Calorie restriction level is required');
      }

      if (!config.targetServings) {
        errors.push('Target servings configuration is required');
      } else {
        if (typeof config.targetServings.vegetables !== 'number' || config.targetServings.vegetables < 1) {
          errors.push('Vegetable servings must be a positive number');
        }
        if (typeof config.targetServings.antioxidantFoods !== 'number' || config.targetServings.antioxidantFoods < 1) {
          errors.push('Antioxidant food servings must be a positive number');
        }
        if (typeof config.targetServings.omega3Sources !== 'number' || config.targetServings.omega3Sources < 1) {
          errors.push('Omega-3 source servings must be a positive number');
        }
      }

      // Validate combinations
      if (config.calorieRestriction === 'strict' && config.fastingStrategy === 'none') {
        errors.push('Strict calorie restriction should be combined with intermittent fasting');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateParasiteConfig = (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config) {
      errors.push('Parasite cleanse configuration is required');
      return { isValid: false, errors };
    }

    if (!config.isEnabled) {
      errors.push('Parasite cleanse must be enabled');
    }

    if (config.isEnabled) {
      if (typeof config.duration !== 'number' || config.duration < 7 || config.duration > 30) {
        errors.push('Duration must be between 7 and 30 days');
      }

      if (!['gentle', 'moderate', 'intensive'].includes(config.intensity)) {
        errors.push('Intensity must be gentle, moderate, or intensive');
      }

      if (!['preparation', 'active-cleanse', 'recovery'].includes(config.currentPhase)) {
        errors.push('Current phase must be preparation, active-cleanse, or recovery');
      }

      if (config.intensity === 'intensive' && config.duration < 14) {
        errors.push('Intensive cleanses require minimum 14 days duration');
      }

      if (config.startDate && config.endDate && config.endDate <= config.startDate) {
        errors.push('End date must be after start date');
      }

      // Validate target foods structure
      if (config.targetFoods) {
        const requiredArrays = ['antiParasitic', 'probiotics', 'fiberRich', 'excludeFoods'];
        for (const array of requiredArrays) {
          if (!Array.isArray(config.targetFoods[array])) {
            errors.push(`${array} must be an array`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateClientAilmentsConfig = (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config) {
      errors.push('Client ailments configuration is required');
      return { isValid: false, errors };
    }

    if (!Array.isArray(config.selectedAilments)) {
      errors.push('Selected ailments must be an array');
    } else {
      if (config.includeInMealPlanning && config.selectedAilments.length === 0) {
        errors.push('At least one ailment must be selected when meal planning integration is enabled');
      }

      if (config.selectedAilments.length > 15) {
        errors.push('Maximum 15 ailments can be selected');
      }

      // Validate ailment IDs format (should be strings)
      const invalidAilments = config.selectedAilments.filter((ailment: any) => typeof ailment !== 'string');
      if (invalidAilments.length > 0) {
        errors.push('All ailment IDs must be strings');
      }
    }

    if (!['low', 'medium', 'high'].includes(config.priorityLevel)) {
      errors.push('Priority level must be low, medium, or high');
    }

    if (typeof config.includeInMealPlanning !== 'boolean') {
      errors.push('Include in meal planning must be a boolean');
    }

    // Validate nutritional focus if present
    if (config.nutritionalFocus && config.selectedAilments.length > 0) {
      if (!config.nutritionalFocus.mealPlanFocus || !Array.isArray(config.nutritionalFocus.mealPlanFocus)) {
        errors.push('Nutritional focus must include meal plan focus array');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateMedicalDisclaimer = (disclaimer: any, longevityConfig: any, parasiteConfig: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!disclaimer) {
      errors.push('Medical disclaimer is required');
      return { isValid: false, errors };
    }

    if (requiresMedicalConsent(longevityConfig, parasiteConfig)) {
      if (!disclaimer.hasReadDisclaimer) {
        errors.push('Medical disclaimer must be read');
      }

      if (!disclaimer.hasConsented) {
        errors.push('Medical consent is required');
      }

      if (!disclaimer.acknowledgedRisks) {
        errors.push('Risk acknowledgment is required');
      }

      if (!disclaimer.hasHealthcareProviderApproval) {
        errors.push('Healthcare provider approval is required for this protocol intensity');
      }

      if (!disclaimer.pregnancyScreeningComplete) {
        errors.push('Pregnancy screening must be completed');
      }

      if (!disclaimer.medicalConditionsScreened) {
        errors.push('Medical conditions screening must be completed');
      }

      if (!disclaimer.consentTimestamp) {
        errors.push('Consent timestamp is required');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  return {
    hasActiveProtocols,
    requiresMedicalConsent,
    hasValidMedicalConsent,
    validateLongevityConfig,
    validateParasiteConfig,
    validateClientAilmentsConfig,
    validateMedicalDisclaimer
  };
};

describe('Protocol Validation Tests', () => {
  const validators = createProtocolValidators();

  describe('Active Protocols Detection', () => {
    it('detects when longevity protocol is active', () => {
      const longevityConfig = { isEnabled: true };
      const parasiteConfig = { isEnabled: false };
      const clientAilmentsConfig = { includeInMealPlanning: false, selectedAilments: [] };

      const result = validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig);

      expect(result).toBe(true);
    });

    it('detects when parasite cleanse protocol is active', () => {
      const longevityConfig = { isEnabled: false };
      const parasiteConfig = { isEnabled: true };
      const clientAilmentsConfig = { includeInMealPlanning: false, selectedAilments: [] };

      const result = validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig);

      expect(result).toBe(true);
    });

    it('detects when client ailments protocol is active', () => {
      const longevityConfig = { isEnabled: false };
      const parasiteConfig = { isEnabled: false };
      const clientAilmentsConfig = { includeInMealPlanning: true, selectedAilments: ['hypertension'] };

      const result = validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig);

      expect(result).toBe(true);
    });

    it('detects when no protocols are active', () => {
      const longevityConfig = { isEnabled: false };
      const parasiteConfig = { isEnabled: false };
      const clientAilmentsConfig = { includeInMealPlanning: false, selectedAilments: [] };

      const result = validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig);

      expect(result).toBe(false);
    });

    it('detects when multiple protocols are active', () => {
      const longevityConfig = { isEnabled: true };
      const parasiteConfig = { isEnabled: true };
      const clientAilmentsConfig = { includeInMealPlanning: true, selectedAilments: ['diabetes'] };

      const result = validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig);

      expect(result).toBe(true);
    });
  });

  describe('Medical Consent Requirements', () => {
    it('requires consent for longevity with calorie restriction', () => {
      const longevityConfig = { isEnabled: true, calorieRestriction: 'strict' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.requiresMedicalConsent(longevityConfig, parasiteConfig);

      expect(result).toBe(true);
    });

    it('requires consent for intensive parasite cleanse', () => {
      const longevityConfig = { isEnabled: false };
      const parasiteConfig = { isEnabled: true, intensity: 'intensive' };

      const result = validators.requiresMedicalConsent(longevityConfig, parasiteConfig);

      expect(result).toBe(true);
    });

    it('does not require consent for gentle protocols', () => {
      const longevityConfig = { isEnabled: true, calorieRestriction: 'none' };
      const parasiteConfig = { isEnabled: true, intensity: 'gentle' };

      const result = validators.requiresMedicalConsent(longevityConfig, parasiteConfig);

      expect(result).toBe(false);
    });

    it('validates medical consent when required', () => {
      const medicalDisclaimer = {
        hasConsented: true,
        hasHealthcareProviderApproval: true
      };
      const longevityConfig = { isEnabled: true, calorieRestriction: 'strict' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.hasValidMedicalConsent(medicalDisclaimer, longevityConfig, parasiteConfig);

      expect(result).toBe(true);
    });

    it('invalidates consent when healthcare provider approval is missing', () => {
      const medicalDisclaimer = {
        hasConsented: true,
        hasHealthcareProviderApproval: false
      };
      const longevityConfig = { isEnabled: true, calorieRestriction: 'moderate' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.hasValidMedicalConsent(medicalDisclaimer, longevityConfig, parasiteConfig);

      expect(result).toBe(false);
    });
  });

  describe('Longevity Configuration Validation', () => {
    it('validates a complete longevity configuration', () => {
      const config = {
        isEnabled: true,
        fastingStrategy: '16:8',
        calorieRestriction: 'moderate',
        antioxidantFocus: ['polyphenols'],
        includeAntiInflammatory: true,
        includeBrainHealth: false,
        includeHeartHealth: true,
        targetServings: {
          vegetables: 7,
          antioxidantFoods: 4,
          omega3Sources: 2
        }
      };

      const result = validators.validateLongevityConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation for missing configuration', () => {
      const result = validators.validateLongevityConfig(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longevity configuration is required');
    });

    it('fails validation when not enabled', () => {
      const config = { isEnabled: false };

      const result = validators.validateLongevityConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longevity mode must be enabled');
    });

    it('fails validation for invalid target servings', () => {
      const config = {
        isEnabled: true,
        fastingStrategy: '16:8',
        calorieRestriction: 'moderate',
        targetServings: {
          vegetables: 0,
          antioxidantFoods: -1,
          omega3Sources: 'invalid'
        }
      };

      const result = validators.validateLongevityConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Vegetable servings must be a positive number');
      expect(result.errors).toContain('Antioxidant food servings must be a positive number');
      expect(result.errors).toContain('Omega-3 source servings must be a positive number');
    });

    it('validates problematic protocol combinations', () => {
      const config = {
        isEnabled: true,
        fastingStrategy: 'none',
        calorieRestriction: 'strict',
        targetServings: {
          vegetables: 5,
          antioxidantFoods: 3,
          omega3Sources: 2
        }
      };

      const result = validators.validateLongevityConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Strict calorie restriction should be combined with intermittent fasting');
    });
  });

  describe('Parasite Cleanse Configuration Validation', () => {
    it('validates a complete parasite cleanse configuration', () => {
      const config = {
        isEnabled: true,
        duration: 14,
        intensity: 'moderate',
        currentPhase: 'preparation',
        includeHerbalSupplements: true,
        dietOnlyCleanse: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        targetFoods: {
          antiParasitic: ['garlic', 'oregano'],
          probiotics: ['kefir'],
          fiberRich: ['psyllium'],
          excludeFoods: ['sugar', 'dairy']
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation for invalid duration range', () => {
      const config = {
        isEnabled: true,
        duration: 5, // Too short
        intensity: 'gentle',
        currentPhase: 'preparation',
        targetFoods: {
          antiParasitic: [],
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duration must be between 7 and 30 days');
    });

    it('fails validation for invalid intensity level', () => {
      const config = {
        isEnabled: true,
        duration: 14,
        intensity: 'extreme',
        currentPhase: 'preparation',
        targetFoods: {
          antiParasitic: [],
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Intensity must be gentle, moderate, or intensive');
    });

    it('fails validation for invalid phase', () => {
      const config = {
        isEnabled: true,
        duration: 14,
        intensity: 'moderate',
        currentPhase: 'invalid-phase',
        targetFoods: {
          antiParasitic: [],
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current phase must be preparation, active-cleanse, or recovery');
    });

    it('validates intensive cleanse duration requirements', () => {
      const config = {
        isEnabled: true,
        duration: 10,
        intensity: 'intensive',
        currentPhase: 'preparation',
        targetFoods: {
          antiParasitic: [],
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Intensive cleanses require minimum 14 days duration');
    });

    it('validates date consistency', () => {
      const config = {
        isEnabled: true,
        duration: 14,
        intensity: 'moderate',
        currentPhase: 'preparation',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-10'), // End before start
        targetFoods: {
          antiParasitic: [],
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const result = validators.validateParasiteConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });
  });

  describe('Client Ailments Configuration Validation', () => {
    it('validates a complete client ailments configuration', () => {
      const config = {
        selectedAilments: ['hypertension', 'diabetes'],
        nutritionalFocus: {
          mealPlanFocus: ['cardiovascular', 'glucose-control'],
          priorityNutrients: ['fiber', 'omega-3'],
          avoidIngredients: ['sodium'],
          emphasizeIngredients: ['leafy-greens']
        },
        includeInMealPlanning: true,
        priorityLevel: 'high'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation when meal planning is enabled but no ailments selected', () => {
      const config = {
        selectedAilments: [],
        includeInMealPlanning: true,
        priorityLevel: 'medium'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one ailment must be selected when meal planning integration is enabled');
    });

    it('fails validation for too many selected ailments', () => {
      const config = {
        selectedAilments: Array.from({ length: 16 }, (_, i) => `ailment-${i}`),
        includeInMealPlanning: true,
        priorityLevel: 'medium'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 15 ailments can be selected');
    });

    it('fails validation for invalid ailment ID types', () => {
      const config = {
        selectedAilments: ['hypertension', 123, null, 'diabetes'],
        includeInMealPlanning: true,
        priorityLevel: 'medium'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All ailment IDs must be strings');
    });

    it('fails validation for invalid priority level', () => {
      const config = {
        selectedAilments: ['hypertension'],
        includeInMealPlanning: true,
        priorityLevel: 'extreme'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Priority level must be low, medium, or high');
    });

    it('fails validation for invalid boolean fields', () => {
      const config = {
        selectedAilments: ['hypertension'],
        includeInMealPlanning: 'yes',
        priorityLevel: 'medium'
      };

      const result = validators.validateClientAilmentsConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Include in meal planning must be a boolean');
    });
  });

  describe('Medical Disclaimer Validation', () => {
    it('validates complete medical disclaimer when consent is required', () => {
      const disclaimer = {
        hasReadDisclaimer: true,
        hasConsented: true,
        consentTimestamp: new Date(),
        acknowledgedRisks: true,
        hasHealthcareProviderApproval: true,
        pregnancyScreeningComplete: true,
        medicalConditionsScreened: true
      };
      const longevityConfig = { isEnabled: true, calorieRestriction: 'strict' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.validateMedicalDisclaimer(disclaimer, longevityConfig, parasiteConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('passes validation when medical consent is not required', () => {
      const disclaimer = {}; // Minimal disclaimer
      const longevityConfig = { isEnabled: true, calorieRestriction: 'none' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.validateMedicalDisclaimer(disclaimer, longevityConfig, parasiteConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation when required consent fields are missing', () => {
      const disclaimer = {
        hasReadDisclaimer: false,
        hasConsented: false,
        acknowledgedRisks: false,
        hasHealthcareProviderApproval: false,
        pregnancyScreeningComplete: false,
        medicalConditionsScreened: false
      };
      const longevityConfig = { isEnabled: true, calorieRestriction: 'moderate' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.validateMedicalDisclaimer(disclaimer, longevityConfig, parasiteConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Medical disclaimer must be read');
      expect(result.errors).toContain('Medical consent is required');
      expect(result.errors).toContain('Risk acknowledgment is required');
      expect(result.errors).toContain('Healthcare provider approval is required for this protocol intensity');
      expect(result.errors).toContain('Pregnancy screening must be completed');
      expect(result.errors).toContain('Medical conditions screening must be completed');
      expect(result.errors).toContain('Consent timestamp is required');
    });

    it('fails validation when disclaimer is null', () => {
      const longevityConfig = { isEnabled: true, calorieRestriction: 'strict' };
      const parasiteConfig = { isEnabled: false };

      const result = validators.validateMedicalDisclaimer(null, longevityConfig, parasiteConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Medical disclaimer is required');
    });
  });

  describe('Comprehensive Validation Scenarios', () => {
    it('validates complex multi-protocol configuration', () => {
      const longevityConfig = {
        isEnabled: true,
        fastingStrategy: '18:6',
        calorieRestriction: 'moderate',
        targetServings: { vegetables: 8, antioxidantFoods: 5, omega3Sources: 3 }
      };

      const parasiteConfig = {
        isEnabled: true,
        duration: 21,
        intensity: 'moderate',
        currentPhase: 'active-cleanse',
        targetFoods: {
          antiParasitic: ['garlic'],
          probiotics: ['kefir'],
          fiberRich: ['psyllium'],
          excludeFoods: ['sugar']
        }
      };

      const clientAilmentsConfig = {
        selectedAilments: ['hypertension', 'diabetes', 'arthritis'],
        includeInMealPlanning: true,
        priorityLevel: 'high',
        nutritionalFocus: {
          mealPlanFocus: ['cardiovascular', 'inflammation'],
          priorityNutrients: ['omega-3'],
          avoidIngredients: ['sodium'],
          emphasizeIngredients: ['leafy-greens']
        }
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

      const longevityResult = validators.validateLongevityConfig(longevityConfig);
      const parasiteResult = validators.validateParasiteConfig(parasiteConfig);
      const ailmentsResult = validators.validateClientAilmentsConfig(clientAilmentsConfig);
      const disclaimerResult = validators.validateMedicalDisclaimer(medicalDisclaimer, longevityConfig, parasiteConfig);

      expect(longevityResult.isValid).toBe(true);
      expect(parasiteResult.isValid).toBe(true);
      expect(ailmentsResult.isValid).toBe(true);
      expect(disclaimerResult.isValid).toBe(true);

      expect(validators.hasActiveProtocols(longevityConfig, parasiteConfig, clientAilmentsConfig)).toBe(true);
      expect(validators.hasValidMedicalConsent(medicalDisclaimer, longevityConfig, parasiteConfig)).toBe(true);
    });

    it('identifies validation failures in complex scenarios', () => {
      const longevityConfig = {
        isEnabled: true,
        fastingStrategy: 'invalid',
        calorieRestriction: 'strict',
        targetServings: { vegetables: 0, antioxidantFoods: -5, omega3Sources: 'none' }
      };

      const parasiteConfig = {
        isEnabled: true,
        duration: 45, // Too long
        intensity: 'unknown',
        currentPhase: 'invalid-phase',
        targetFoods: {
          antiParasitic: 'not-an-array',
          probiotics: [],
          fiberRich: [],
          excludeFoods: []
        }
      };

      const clientAilmentsConfig = {
        selectedAilments: Array.from({ length: 20 }, (_, i) => i), // Too many + wrong type
        includeInMealPlanning: 'maybe',
        priorityLevel: 'maximum'
      };

      const longevityResult = validators.validateLongevityConfig(longevityConfig);
      const parasiteResult = validators.validateParasiteConfig(parasiteConfig);
      const ailmentsResult = validators.validateClientAilmentsConfig(clientAilmentsConfig);

      expect(longevityResult.isValid).toBe(false);
      expect(parasiteResult.isValid).toBe(false);
      expect(ailmentsResult.isValid).toBe(false);

      // Each should have multiple validation errors
      expect(longevityResult.errors.length).toBeGreaterThan(1);
      expect(parasiteResult.errors.length).toBeGreaterThan(1);
      expect(ailmentsResult.errors.length).toBeGreaterThan(1);
    });
  });
});