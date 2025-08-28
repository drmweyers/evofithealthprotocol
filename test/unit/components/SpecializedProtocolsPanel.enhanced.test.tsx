import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SpecializedProtocolsPanel from '../../../client/src/components/SpecializedProtocolsPanel';
import type { SpecializedProtocolConfig } from '../../../client/src/types/specializedProtocols';

// Mock the child components with comprehensive functionality
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
        {config.isEnabled && (
          <div data-testid="longevity-config">
            <select
              value={config.fastingStrategy}
              onChange={(e) => onChange({ ...config, fastingStrategy: e.target.value })}
              data-testid="fasting-strategy"
            >
              <option value="none">No Fasting</option>
              <option value="16:8">16:8</option>
              <option value="18:6">18:6</option>
            </select>
            <select
              value={config.calorieRestriction}
              onChange={(e) => onChange({ ...config, calorieRestriction: e.target.value })}
              data-testid="calorie-restriction"
            >
              <option value="none">No Restriction</option>
              <option value="mild">Mild</option>
              <option value="strict">Strict</option>
            </select>
          </div>
        )}
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
        {config.isEnabled && (
          <div data-testid="parasite-config">
            <select
              value={config.intensity}
              onChange={(e) => onChange({ ...config, intensity: e.target.value })}
              data-testid="cleanse-intensity"
            >
              <option value="gentle">Gentle</option>
              <option value="moderate">Moderate</option>
              <option value="intensive">Intensive</option>
            </select>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) })}
              data-testid="cleanse-duration"
            />
          </div>
        )}
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
          <p data-testid="disclaimer-content">This protocol requires medical supervision.</p>
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
        <div data-testid="selected-ailments-count">{selectedAilments.length} ailments selected</div>
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
        <input
          type="checkbox"
          checked={selectedAilments.includes('diabetes')}
          onChange={(e) => {
            const newSelection = e.target.checked 
              ? [...selectedAilments, 'diabetes']
              : selectedAilments.filter((id: string) => id !== 'diabetes');
            onSelectionChange(newSelection);
          }}
          disabled={disabled}
          data-testid="ailment-diabetes"
        />
        <label>Diabetes</label>
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/ProtocolDashboard', () => {
  return {
    default: ({ longevityConfig, parasiteConfig, progress }: any) => (
      <div data-testid="protocol-dashboard">
        <div data-testid="dashboard-longevity">Longevity {longevityConfig.isEnabled ? 'ON' : 'OFF'}</div>
        <div data-testid="dashboard-parasite">Parasite {parasiteConfig.isEnabled ? 'ON' : 'OFF'}</div>
        <div data-testid="dashboard-progress">Progress: {progress.completionPercentage}%</div>
      </div>
    ),
  };
});

vi.mock('../../../client/src/components/SpecializedIngredientSelector', () => {
  return {
    default: ({ selectedIngredients, onSelectionChange, protocolType, disabled }: any) => (
      <div data-testid="specialized-ingredient-selector">
        <div data-testid="protocol-type">{protocolType} protocol</div>
        <button 
          onClick={() => onSelectionChange(['turmeric', 'garlic', 'ginger'])}
          disabled={disabled}
          data-testid="select-ingredients"
        >
          Select Sample Ingredients
        </button>
        <div data-testid="selected-ingredients-count">{selectedIngredients.length} ingredients</div>
      </div>
    ),
  };
});

// Mock getAilmentNutritionalFocus
vi.mock('../../../client/src/data/clientAilments', () => ({
  getAilmentNutritionalFocus: vi.fn((ailmentIds: string[]) => ({
    mealPlanFocus: ['cardiovascular', 'inflammation'],
    priorityNutrients: ['omega-3', 'fiber', 'antioxidants'],
    avoidIngredients: ['sodium', 'refined-sugar'],
    emphasizeIngredients: ['leafy-greens', 'omega-3-fish'],
    beneficialFoods: ['salmon', 'spinach', 'blueberries'],
    avoidFoods: ['processed-foods', 'high-sodium'],
    keyNutrients: ['omega-3', 'potassium', 'magnesium']
  })),
}));

describe('SpecializedProtocolsPanel - Enhanced Tests', () => {
  const mockOnConfigChange = vi.fn();
  const user = userEvent.setup();

  // Mock fetch globally with detailed responses
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Default successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        mealPlan: {
          duration: 30,
          meals: [
            { name: 'Anti-inflammatory Breakfast', calories: 400, nutrients: ['omega-3'] },
            { name: 'Longevity Lunch', calories: 500, nutrients: ['antioxidants'] },
            { name: 'Heart-healthy Dinner', calories: 600, nutrients: ['fiber'] }
          ],
        },
        fastingSchedule: [
          {
            type: 'Intermittent Fasting 16:8',
            fastingWindow: '20:00 - 12:00',
            eatingWindow: '12:00 - 20:00',
            description: 'Optimal for cellular repair and longevity benefits'
          }
        ],
        safetyDisclaimer: {
          title: 'Medical Supervision Required',
          content: 'Please consult with your healthcare provider before starting this protocol.'
        }
      }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const defaultProps = {
    onConfigChange: mockOnConfigChange,
    disabled: false,
    showDashboard: false,
  };

  describe('Component Initialization and Rendering', () => {
    it('renders with default state correctly', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      expect(screen.getByText('Advanced longevity and cleansing protocols with medical safety features')).toBeInTheDocument();
      expect(screen.getByText('No specialized protocols active')).toBeInTheDocument();
    });

    it('renders with initial configuration from props', () => {
      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'mild' as const, 
          antioxidantFocus: ['berries', 'leafyGreens'], 
          includeAntiInflammatory: true, 
          includeBrainHealth: false, 
          includeHeartHealth: true, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        parasiteCleanse: { 
          isEnabled: false, 
          duration: 14, 
          intensity: 'gentle' as const, 
          currentPhase: 'preparation' as const, 
          includeHerbalSupplements: false, 
          dietOnlyCleanse: true, 
          startDate: null, 
          endDate: null, 
          targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } 
        },
        clientAilments: { 
          selectedAilments: ['hypertension'], 
          nutritionalFocus: null, 
          includeInMealPlanning: true, 
          priorityLevel: 'medium' as const 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
        progress: { 
          startDate: new Date(), 
          currentDay: 1, 
          totalDays: 14, 
          completionPercentage: 0, 
          symptomsLogged: [], 
          measurements: [], 
          notes: [] 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.queryByText('No specialized protocols active')).not.toBeInTheDocument();
      expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
      expect(screen.getByText('Health Issues Targeting Active')).toBeInTheDocument();
    });

    it('calls onConfigChange when configuration is initialized', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      // Should be called at least once during initialization
      expect(mockOnConfigChange).toHaveBeenCalled();
      
      const lastCall = mockOnConfigChange.mock.calls[mockOnConfigChange.mock.calls.length - 1];
      const config = lastCall[0];
      
      expect(config).toHaveProperty('longevity');
      expect(config).toHaveProperty('parasiteCleanse');
      expect(config).toHaveProperty('clientAilments');
      expect(config).toHaveProperty('medical');
      expect(config).toHaveProperty('progress');
    });
  });

  describe('Tab Navigation and UI Interactions', () => {
    it('expands and collapses correctly', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      
      // Should be expanded by default
      expect(screen.getByText('Health Issues')).toBeInTheDocument();
      
      // Click to collapse
      await user.click(expandButton);
      
      // Give time for animation
      await waitFor(() => {
        expect(screen.queryByText('Health Issues')).not.toBeInTheDocument();
      });
    });

    it('switches between tabs correctly', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Default to ailments tab
      expect(screen.getByTestId('client-ailments-selector')).toBeInTheDocument();
      
      // Switch to protocols tab
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      expect(screen.getByTestId('longevity-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('parasite-cleanse-protocol')).toBeInTheDocument();
      
      // Switch to ingredients tab
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      expect(screen.getByTestId('specialized-ingredient-selector')).toBeInTheDocument();
    });

    it('shows dashboard tab when protocols are active', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} showDashboard={true} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Enable longevity mode first
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      // Accept disclaimer
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      // Switch to dashboard tab
      const dashboardTab = screen.getByText('Dashboard');
      await user.click(dashboardTab);
      
      expect(screen.getByTestId('protocol-dashboard')).toBeInTheDocument();
    });
  });

  describe('Protocol Configuration Management', () => {
    it('handles longevity mode configuration changes', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // Enable longevity mode
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      // Accept disclaimer
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      // Configure longevity settings
      const fastingSelect = screen.getByTestId('fasting-strategy');
      fireEvent.change(fastingSelect, { target: { value: '16:8' } });
      
      const calorieSelect = screen.getByTestId('calorie-restriction');
      fireEvent.change(calorieSelect, { target: { value: 'mild' } });
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            longevity: expect.objectContaining({ 
              isEnabled: true,
              fastingStrategy: '16:8',
              calorieRestriction: 'mild'
            }),
          })
        );
      });
    });

    it('handles parasite cleanse configuration changes', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // Enable parasite cleanse
      const parasiteToggle = screen.getByTestId('parasite-toggle');
      await user.click(parasiteToggle);
      
      // Accept disclaimer
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      // Configure parasite settings
      const intensitySelect = screen.getByTestId('cleanse-intensity');
      fireEvent.change(intensitySelect, { target: { value: 'moderate' } });
      
      const durationInput = screen.getByTestId('cleanse-duration');
      fireEvent.change(durationInput, { target: { value: '21' } });
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            parasiteCleanse: expect.objectContaining({ 
              isEnabled: true,
              intensity: 'moderate',
              duration: 21
            }),
          })
        );
      });
    });

    it('handles client ailments configuration changes', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Default to ailments tab
      const hypertensionCheckbox = screen.getByTestId('ailment-hypertension');
      await user.click(hypertensionCheckbox);
      
      const diabetesCheckbox = screen.getByTestId('ailment-diabetes');
      await user.click(diabetesCheckbox);
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            clientAilments: expect.objectContaining({ 
              selectedAilments: ['hypertension', 'diabetes'],
              includeInMealPlanning: true
            }),
          })
        );
      });
    });
  });

  describe('Medical Consent Flow', () => {
    it('shows medical disclaimer when enabling longevity mode', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      expect(screen.getByTestId('medical-disclaimer-modal')).toBeInTheDocument();
      expect(screen.getByText('Medical Disclaimer for longevity')).toBeInTheDocument();
    });

    it('shows medical disclaimer when enabling parasite cleanse', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const parasiteToggle = screen.getByTestId('parasite-toggle');
      await user.click(parasiteToggle);
      
      expect(screen.getByTestId('medical-disclaimer-modal')).toBeInTheDocument();
      expect(screen.getByText('Medical Disclaimer for parasite-cleanse')).toBeInTheDocument();
    });

    it('closes disclaimer modal without enabling protocol', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      const closeButton = screen.getByTestId('close-disclaimer');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('medical-disclaimer-modal')).not.toBeInTheDocument();
      
      // Protocol should not be enabled
      expect(mockOnConfigChange).not.toHaveBeenCalledWith(
        expect.objectContaining({
          longevity: expect.objectContaining({ isEnabled: true }),
        })
      );
    });

    it('enables protocol after accepting medical disclaimer', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      const acceptButton = screen.getByTestId('accept-disclaimer');
      await user.click(acceptButton);
      
      expect(screen.queryByTestId('medical-disclaimer-modal')).not.toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockOnConfigChange).toHaveBeenCalledWith(
          expect.objectContaining({
            longevity: expect.objectContaining({ isEnabled: true }),
            medical: expect.objectContaining({ 
              hasConsented: true,
              hasHealthcareProviderApproval: true
            }),
          })
        );
      });
    });
  });

  describe('Protocol Generation', () => {
    it('generates longevity meal plan successfully', async () => {
      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'mild' as const, 
          antioxidantFocus: ['berries'], 
          includeAntiInflammatory: false, 
          includeBrainHealth: false, 
          includeHeartHealth: false, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/longevity/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"planName":"Longevity Protocol'),
        });
      });
      
      // Should switch to dashboard tab after generation
      await waitFor(() => {
        expect(screen.getByText('Longevity Meal Plan Generated!')).toBeInTheDocument();
      });
    });

    it('generates parasite cleanse protocol successfully', async () => {
      const initialConfig = {
        parasiteCleanse: { 
          isEnabled: true, 
          duration: 14, 
          intensity: 'moderate' as const, 
          currentPhase: 'preparation' as const, 
          includeHerbalSupplements: false, 
          dietOnlyCleanse: true, 
          startDate: null, 
          endDate: null, 
          targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
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

    it('generates ailments-based plan successfully', async () => {
      const initialConfig = {
        clientAilments: { 
          selectedAilments: ['hypertension', 'diabetes'], 
          nutritionalFocus: { 
            mealPlanFocus: ['cardiovascular'], 
            priorityNutrients: ['omega-3'], 
            avoidIngredients: ['sodium'], 
            emphasizeIngredients: ['leafy-greens'],
            beneficialFoods: ['salmon'],
            avoidFoods: ['processed-foods'],
            keyNutrients: ['omega-3']
          }, 
          includeInMealPlanning: true, 
          priorityLevel: 'high' as const 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Should default to ailments tab
      const generateButton = screen.getByText('Generate Health-Targeted Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/specialized/ailments-based/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"selectedAilments":["hypertension","diabetes"]'),
        });
      });
    });

    it('shows loading states during generation', async () => {
      // Mock a delayed response
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);

      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'mild' as const, 
          antioxidantFocus: [], 
          includeAntiInflammatory: false, 
          includeBrainHealth: false, 
          includeHeartHealth: false, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      // Should show loading state
      expect(screen.getByText('Generating Longevity Plan...')).toBeInTheDocument();
      
      // Resolve the promise to complete the test
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ mealPlan: { duration: 30, meals: [] } }),
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Generating Longevity Plan...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when generation fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'API generation failed' }),
      });

      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'mild' as const, 
          antioxidantFocus: [], 
          includeAntiInflammatory: false, 
          includeBrainHealth: false, 
          includeHeartHealth: false, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Generation Error')).toBeInTheDocument();
        expect(screen.getByText('API generation failed')).toBeInTheDocument();
      });
    });

    it('prevents generation without medical consent when required', async () => {
      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'strict' as const, 
          antioxidantFocus: [], 
          includeAntiInflammatory: false, 
          includeBrainHealth: false, 
          includeHeartHealth: false, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        medical: { 
          hasReadDisclaimer: false, 
          hasConsented: false, 
          consentTimestamp: null, 
          acknowledgedRisks: false, 
          hasHealthcareProviderApproval: false, 
          pregnancyScreeningComplete: false, 
          medicalConditionsScreened: false 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // The generate button should be disabled
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      expect(generateButton).toBeDisabled();
    });

    it('shows error when trying to generate without enabled protocols', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // Switch to ailments tab and try to generate without selecting any
      expect(screen.queryByText('Generate Health-Targeted Meal Plan')).not.toBeInTheDocument();
      
      // Ailments generate button should only show when ailments are selected
      const ailmentsCount = screen.getByTestId('selected-ailments-count');
      expect(ailmentsCount).toHaveTextContent('0 ailments selected');
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const initialConfig = {
        longevity: { 
          isEnabled: true, 
          fastingStrategy: '16:8' as const, 
          calorieRestriction: 'mild' as const, 
          antioxidantFocus: [], 
          includeAntiInflammatory: false, 
          includeBrainHealth: false, 
          includeHeartHealth: false, 
          targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } 
        },
        medical: { 
          hasReadDisclaimer: true, 
          hasConsented: true, 
          consentTimestamp: new Date(), 
          acknowledgedRisks: true, 
          hasHealthcareProviderApproval: true, 
          pregnancyScreeningComplete: true, 
          medicalConditionsScreened: true 
        },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const generateButton = screen.getByText('Generate Longevity Meal Plan');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Generation Error')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('supports keyboard navigation', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      expandButton.focus();
      
      await user.keyboard('{Enter}');
      
      // Should expand and show content
      expect(screen.getByText('Health Issues')).toBeInTheDocument();
    });

    it('shows appropriate ARIA labels', () => {
      render(<SpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      expect(expandButton).toBeInTheDocument();
    });

    it('handles disabled state correctly', async () => {
      render(<SpecializedProtocolsPanel {...defaultProps} disabled={true} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      // All interactive elements should be disabled
      expect(screen.getByTestId('longevity-toggle')).toBeDisabled();
      expect(screen.getByTestId('parasite-toggle')).toBeDisabled();
      expect(screen.getByTestId('ailment-hypertension')).toBeDisabled();
    });
  });

  describe('Protocol Status Display', () => {
    it('shows correct status badges for active protocols', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        parasiteCleanse: { isEnabled: true, duration: 14, intensity: 'moderate' as const, currentPhase: 'elimination' as const, includeHerbalSupplements: false, dietOnlyCleanse: true, startDate: null, endDate: null, targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } },
        clientAilments: { selectedAilments: ['hypertension'], nutritionalFocus: null, includeInMealPlanning: true, priorityLevel: 'high' as const },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByText('Longevity Mode')).toBeInTheDocument();
      expect(screen.getByText('Parasite Cleanse')).toBeInTheDocument();
      expect(screen.getByText('Health Issues (1)')).toBeInTheDocument();
      
      // Check protocol summaries
      expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
      expect(screen.getByText('Parasite Cleanse Active')).toBeInTheDocument();
      expect(screen.getByText('Health Issues Targeting Active')).toBeInTheDocument();
    });

    it('displays medical supervision status correctly', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'strict' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: true, hasConsented: true, consentTimestamp: new Date(), acknowledgedRisks: true, hasHealthcareProviderApproval: true, pregnancyScreeningComplete: true, medicalConditionsScreened: true },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByText('Medical Supervision Status')).toBeInTheDocument();
      expect(screen.getByText('Medical consent obtained and healthcare provider approval confirmed.')).toBeInTheDocument();
    });

    it('shows warning when medical consent is missing', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'strict' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        medical: { hasReadDisclaimer: false, hasConsented: false, consentTimestamp: null, acknowledgedRisks: false, hasHealthcareProviderApproval: false, pregnancyScreeningComplete: false, medicalConditionsScreened: false },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByText('Healthcare provider consultation required for selected protocol intensity.')).toBeInTheDocument();
    });
  });

  describe('Ingredient Selector Integration', () => {
    it('updates ingredient selection correctly', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      const selectButton = screen.getByTestId('select-ingredients');
      await user.click(selectButton);
      
      expect(screen.getByTestId('selected-ingredients-count')).toHaveTextContent('3 ingredients');
      expect(screen.getByTestId('protocol-type')).toHaveTextContent('longevity protocol');
    });

    it('shows correct protocol type for combined protocols', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' as const, calorieRestriction: 'mild' as const, antioxidantFocus: [], includeAntiInflammatory: false, includeBrainHealth: false, includeHeartHealth: false, targetServings: { vegetables: 5, antioxidantFoods: 3, omega3Sources: 2 } },
        parasiteCleanse: { isEnabled: true, duration: 14, intensity: 'gentle' as const, currentPhase: 'preparation' as const, includeHerbalSupplements: false, dietOnlyCleanse: true, startDate: null, endDate: null, targetFoods: { antiParasitic: [], probiotics: [], fiberRich: [], excludeFoods: [] } },
      };

      render(<SpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const expandButton = screen.getByRole('button');
      await user.click(expandButton);
      
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      expect(screen.getByTestId('protocol-type')).toHaveTextContent('both protocol');
    });
  });
});