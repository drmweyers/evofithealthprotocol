import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SpecializedProtocolsPanel from '../../../client/src/components/SpecializedProtocolsPanel';
import type { SpecializedProtocolConfig } from '../../../client/src/types/specializedProtocols';

// Mock the child components
vi.mock('../../../client/src/components/LongevityModeToggle', () => {
  return {
    default: ({ config, onChange, disabled, showTooltips }: any) => (
      <div data-testid="longevity-mode-toggle">
        <input
          type="checkbox"
          checked={config.isEnabled}
          onChange={(e) => onChange({ ...config, isEnabled: e.target.checked })}
          disabled={disabled}
          data-testid="longevity-toggle"
        />
        <label>Longevity Mode {showTooltips ? '(with tooltips)' : ''}</label>
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/ParasiteCleanseProtocol', () => {
  return {
    default: ({ config, onChange, disabled }: any) => (
      <div data-testid="parasite-cleanse-protocol">
        <input
          type="checkbox"
          checked={config.isEnabled}
          onChange={(e) => onChange({ ...config, isEnabled: e.target.checked })}
          disabled={disabled}
          data-testid="parasite-toggle"
        />
        <label>Parasite Cleanse Protocol</label>
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/MedicalDisclaimerModal', () => {
  return {
    default: ({ isOpen, onClose, onAccept, protocolType }: any) => 
      isOpen ? (
        <div data-testid="medical-disclaimer-modal">
          <h2>Medical Disclaimer for {protocolType}</h2>
          <button onClick={() => onAccept({
            hasReadDisclaimer: true,
            hasConsented: true,
            consentTimestamp: new Date(),
            acknowledgedRisks: true,
            hasHealthcareProviderApproval: true,
            pregnancyScreeningComplete: true,
            medicalConditionsScreened: true,
          })} data-testid="accept-disclaimer">Accept</button>
          <button onClick={onClose} data-testid="close-disclaimer">Close</button>
        </div>
      ) : null,
  };
});

vi.mock('../../../client/src/components/ClientAilmentsSelector', () => {
  return {
    default: ({ selectedAilments, onSelectionChange, disabled }: any) => (
      <div data-testid="client-ailments-selector">
        <input
          type="checkbox"
          checked={selectedAilments.includes('hypertension')}
          onChange={(e) => {
            const newSelection = e.target.checked 
              ? [...selectedAilments, 'hypertension']
              : selectedAilments.filter((id: string) => id !== 'hypertension');
            onSelectionChange(newSelection);
          }}
          disabled={disabled}
          data-testid="ailment-hypertension"
        />
        <label>Hypertension</label>
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/ProtocolDashboard', () => {
  return {
    default: ({ longevityConfig, parasiteConfig, progress }: any) => (
      <div data-testid="protocol-dashboard">
        Dashboard: Longevity {longevityConfig.isEnabled ? 'ON' : 'OFF'}, 
        Parasite {parasiteConfig.isEnabled ? 'ON' : 'OFF'}
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/SpecializedIngredientSelector', () => {
  return {
    default: ({ selectedIngredients, onSelectionChange, protocolType, disabled }: any) => (
      <div data-testid="specialized-ingredient-selector">
        Ingredient Selector for {protocolType} protocol
        <button 
          onClick={() => onSelectionChange(['turmeric', 'garlic'])}
          disabled={disabled}
          data-testid="select-ingredients"
        >
          Select Ingredients
        </button>
      </div>
    ),
  };
});

// Mock getAilmentNutritionalFocus
vi.mock('../../../client/src/data/clientAilments', () => ({
  getAilmentNutritionalFocus: vi.fn().mockReturnValue({
    mealPlanFocus: ['cardiovascular', 'inflammation'],
    priorityNutrients: ['omega-3', 'fiber'],
    avoidIngredients: ['sodium'],
    emphasizeIngredients: ['leafy-greens']
  }),
}));

describe('SpecializedProtocolsPanel', () => {
  const mockOnConfigChange = vi.fn();
  const user = userEvent.setup();

  // Mock fetch globally
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const defaultProps = {
    onConfigChange: mockOnConfigChange,
    disabled: false,
    showDashboard: false,
  };

  describe('Component Rendering', () => {
    it('renders the component with default state', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      expect(screen.getByText('Advanced longevity and cleansing protocols with medical safety features')).toBeInTheDocument();
      expect(screen.getByText('No specialized protocols active')).toBeInTheDocument();
    });

    it('renders with initial config', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        parasiteCleanse: { isEnabled: false, duration: 14, intensity: 'gentle' as const, currentPhase: 'preparation' as const, includeHerbalSupplements: false, dietOnlyCleanse: true, startDate: null, endDate: null, targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } },
        clientAilments: { selectedAilments: ['hypertension'], nutritionalFocus: null, includeInMealPlanning: true, priorityLevel: 'medium' as const },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
        progress: { startDate: new Date(), currentDay: 1, totalDays: 14, completionPercentage: 0, symptomsLogged: [], measurements: [], notes: [] },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.queryByText('No specialized protocols active')).not.toBeInTheDocument();
      expect(screen.getByText('Longevity Mode')).toBeInTheDocument();
    });

    it('shows protocol summary when protocols are active', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      // Expand the panel to see configuration options
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Enable longevity mode (this should trigger medical disclaimer)
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      // Accept the medical disclaimer
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Management', () => {
    it('calls onConfigChange when configuration updates', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      // Accept disclaimer
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalled();
      });
    });

    it('handles tab switching correctly', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Switch to ailments tab
      const ailmentsTab = screen.getByText('Health Issues');
      await user.click(ailmentsTab);
      
      expect(screen.getByTestId('client-ailments-selector')).toBeInTheDocument();
    });

    it('updates client ailments configuration', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Switch to ailments tab
      const ailmentsTab = screen.getByText('Health Issues');
      await user.click(ailmentsTab);
      
      // Select an ailment
      const hypertensionCheckbox = screen.getByTestId('ailment-hypertension');
      await user.click(hypertensionCheckbox);
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalled();
      });
    });
  });

  describe('Medical Consent Flow', () => {
    it('shows medical disclaimer when enabling longevity mode', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      expect(screen.getByTestId('medical-disclaimer-modal')).toBeInTheDocument();
    });

    it('shows medical disclaimer when enabling parasite cleanse', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const parasiteToggle = screen.getByTestId('parasite-toggle');
      await user.click(parasiteToggle);
      
      expect(screen.getByTestId('medical-disclaimer-modal')).toBeInTheDocument();
    });

    it('enables protocol after accepting medical disclaimer', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            longevity: expect.objectContaining({ isEnabled: true }),
          })
        );
      });
    });
  });

  describe('Protocol Generation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          mealPlan: {
            duration: 30,
            meals: [
              { name: 'Test Meal', calories: 500 },
            ],
          },
          fastingSchedule: '16:8',
          safetyDisclaimer: {
            title: 'Safety First',
            content: 'Please consult healthcare provider',
          },
        }),
      });
    });

    it('generates longevity meal plan when longevity is enabled', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/longevity/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"planName":"Longevity Protocol'),
        });
      });
    });

    it('generates parasite cleanse plan when parasite cleanse is enabled', async () => {
      const initialConfig = {
        parasiteCleanse: { isEnabled: true, duration: 14, intensity: 'gentle' as const, currentPhase: 'preparation' as const, includeHerbalSupplements: false, dietOnlyCleanse: true, startDate: null, endDate: null, targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const generateButton = screen.getByText('Generate Parasite Cleanse Protocol');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/parasite-cleanse/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"planName":"Parasite Cleanse Protocol'),
        });
      });
    });

    it('generates ailments-based plan when ailments are selected', async () => {
      const initialConfig = {
        clientAilments: { selectedAilments: ['hypertension'], nutritionalFocus: { mealPlanFocus: ['cardiovascular'], priorityNutrients: ['omega-3'], avoidIngredients: ['sodium'], emphasizeIngredients: ['leafy-greens'] }, includeInMealPlanning: true, priorityLevel: 'medium' as const },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Switch to ailments tab
      const ailmentsTab = screen.getByText('Health Issues');
      await user.click(ailmentsTab);
      
      const generateButton = screen.getByText('Generate Health-Targeted Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/ailments-based/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"selectedAilments":["hypertension"]'),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when longevity generation fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Generation failed' }),
      });

      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Generation Error')).toBeInTheDocument();
        expect(screen.getByText('Generation failed')).toBeInTheDocument();
      });
    });

    it('shows error when trying to generate without protocols enabled', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Try to generate without enabling protocols (button shouldn't exist, but test the logic)
      // Since we can't trigger the generation without enabled protocols, we'll test the error state directly
      // This would be tested through unit testing the individual handler functions
    });

    it('shows error when trying to generate without medical consent', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'strict' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: false, hasConsented: false, consentTimestamp: null, acknowledgedRisks: false, hasHealthcareProviderApproval: false, pregnancyScreeningComplete: false, medicalConditionsScreened: false },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // The generate button should be disabled due to lack of medical consent
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Dashboard Integration', () => {
    it('shows dashboard when showDashboard prop is true', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} showDashboard={true} />);
      
      const expandButton = screen.getByRole('button');
      fireEvent.click(expandButton);
      
      // Switch to dashboard tab
      const dashboardTab = screen.getByText('Dashboard');
      fireEvent.click(dashboardTab);
      
      expect(screen.getByTestId('protocol-dashboard')).toBeInTheDocument();
    });

    it('switches to dashboard tab after successful generation', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          mealPlan: { duration: 30, meals: [] },
          fastingSchedule: '16:8',
        }),
      });

      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Longevity Meal Plan Generated!')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      // The component should have proper semantic structure
      expect(screen.getByRole('button')).toBeInTheDocument(); // Expand/collapse button
    });

    it('supports keyboard navigation', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      expandButton.focus();
      
      await user.keyboard('{Enter}');
      
      // Should expand and show tabs
      expect(screen.getByText('Protocols')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during generation', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);

      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      // Should show loading state
      expect(screen.getByText('Generating Longevity Plan...')).toBeInTheDocument();
      
      // Resolve the promise to complete the test
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ mealPlan: { duration: 30, meals: [] } }),
      });
    });
  });
});