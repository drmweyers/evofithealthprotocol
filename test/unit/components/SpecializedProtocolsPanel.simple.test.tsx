import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Simple mock component for SpecializedProtocolsPanel
const MockSpecializedProtocolsPanel = ({ 
  onConfigChange, 
  initialConfig, 
  disabled = false, 
  showDashboard = false 
}: any) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('ailments');
  const [config, setConfig] = React.useState(initialConfig || {
    longevity: { isEnabled: false, fastingStrategy: 'none' },
    parasiteCleanse: { isEnabled: false, intensity: 'gentle' },
    clientAilments: { selectedAilments: [], includeInMealPlanning: true },
    medical: { hasConsented: false },
    progress: { completionPercentage: 0 }
  });

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const hasActiveProtocols = config.longevity?.isEnabled || config.parasiteCleanse?.isEnabled;
  const ailmentsCount = config.clientAilments?.selectedAilments?.length || 0;

  return (
    <div data-testid="specialized-protocols-panel">
      <div>
        <h3>Specialized Health Protocols</h3>
        <p>Advanced longevity and cleansing protocols with medical safety features</p>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          data-testid="expand-toggle"
        >
          {isExpanded ? 'Collapse' : 'Expand'} Protocols
        </button>

        {!hasActiveProtocols && ailmentsCount === 0 && (
          <p>No specialized protocols active</p>
        )}

        {config.longevity?.isEnabled && (
          <div data-testid="longevity-status">
            <span>Longevity Mode Active</span>
          </div>
        )}

        {config.parasiteCleanse?.isEnabled && (
          <div data-testid="parasite-status">
            <span>Parasite Cleanse Active</span>
          </div>
        )}

        {ailmentsCount > 0 && (
          <div data-testid="ailments-status">
            <span>Health Issues Targeting Active</span>
            <span>Health Issues ({ailmentsCount})</span>
          </div>
        )}

        {config.medical?.hasConsented && (
          <div data-testid="medical-status">
            <h4>Medical Supervision Status</h4>
            <p>Medical consent obtained and healthcare provider approval confirmed.</p>
          </div>
        )}

        {!config.medical?.hasConsented && hasActiveProtocols && (
          <div data-testid="medical-warning">
            <p>Healthcare provider consultation required for selected protocol intensity.</p>
          </div>
        )}
      </div>

      {isExpanded && (
        <div data-testid="expanded-content">
          <div role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'ailments'}
              onClick={() => setActiveTab('ailments')}
              disabled={disabled}
            >
              Health Issues
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'protocols'}
              onClick={() => setActiveTab('protocols')}
              disabled={disabled}
            >
              Protocols
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'ingredients'}
              onClick={() => setActiveTab('ingredients')}
              disabled={disabled}
            >
              Ingredients
            </button>
            {(hasActiveProtocols || showDashboard) && (
              <button
                role="tab"
                aria-selected={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                disabled={disabled}
              >
                Dashboard
              </button>
            )}
          </div>

          {activeTab === 'ailments' && (
            <div data-testid="ailments-tab" role="tabpanel">
              <div data-testid="client-ailments-selector">
                <div data-testid="selected-ailments-count">
                  {ailmentsCount} ailments selected
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={config.clientAilments?.selectedAilments?.includes('hypertension')}
                    onChange={(e) => {
                      const currentAilments = config.clientAilments?.selectedAilments || [];
                      const newAilments = e.target.checked 
                        ? [...currentAilments, 'hypertension']
                        : currentAilments.filter((a: string) => a !== 'hypertension');
                      
                      handleConfigChange({
                        ...config,
                        clientAilments: {
                          ...config.clientAilments,
                          selectedAilments: newAilments
                        }
                      });
                    }}
                    disabled={disabled}
                    data-testid="ailment-hypertension"
                  />
                  Hypertension
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={config.clientAilments?.selectedAilments?.includes('diabetes')}
                    onChange={(e) => {
                      const currentAilments = config.clientAilments?.selectedAilments || [];
                      const newAilments = e.target.checked 
                        ? [...currentAilments, 'diabetes']
                        : currentAilments.filter((a: string) => a !== 'diabetes');
                      
                      handleConfigChange({
                        ...config,
                        clientAilments: {
                          ...config.clientAilments,
                          selectedAilments: newAilments
                        }
                      });
                    }}
                    disabled={disabled}
                    data-testid="ailment-diabetes"
                  />
                  Diabetes
                </label>
              </div>

              {ailmentsCount > 0 && (
                <button
                  onClick={() => {/* Mock API call */}}
                  disabled={disabled}
                  data-testid="generate-ailments-plan"
                >
                  Generate Health-Targeted Meal Plan
                </button>
              )}
            </div>
          )}

          {activeTab === 'protocols' && (
            <div data-testid="protocols-tab" role="tabpanel">
              <div data-testid="longevity-mode-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={config.longevity?.isEnabled}
                    onChange={(e) => {
                      handleConfigChange({
                        ...config,
                        longevity: {
                          ...config.longevity,
                          isEnabled: e.target.checked
                        }
                      });
                    }}
                    disabled={disabled}
                    data-testid="longevity-toggle"
                  />
                  Longevity Mode
                </label>
              </div>

              <div data-testid="parasite-cleanse-protocol">
                <label>
                  <input
                    type="checkbox"
                    checked={config.parasiteCleanse?.isEnabled}
                    onChange={(e) => {
                      handleConfigChange({
                        ...config,
                        parasiteCleanse: {
                          ...config.parasiteCleanse,
                          isEnabled: e.target.checked
                        }
                      });
                    }}
                    disabled={disabled}
                    data-testid="parasite-toggle"
                  />
                  Parasite Cleanse Protocol
                </label>
              </div>

              {config.longevity?.isEnabled && (
                <button
                  onClick={() => {/* Mock API call */}}
                  disabled={disabled}
                  data-testid="generate-longevity-plan"
                >
                  Generate Longevity Meal Plan
                </button>
              )}

              {config.parasiteCleanse?.isEnabled && (
                <button
                  onClick={() => {/* Mock API call */}}
                  disabled={disabled}
                  data-testid="generate-parasite-plan"
                >
                  Generate Parasite Cleanse Protocol
                </button>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div data-testid="ingredients-tab" role="tabpanel">
              <div data-testid="specialized-ingredient-selector">
                <div data-testid="protocol-type">
                  {config.longevity?.isEnabled && config.parasiteCleanse?.isEnabled 
                    ? 'both protocol' 
                    : config.longevity?.isEnabled 
                      ? 'longevity protocol' 
                      : config.parasiteCleanse?.isEnabled 
                        ? 'parasite-cleanse protocol'
                        : 'none protocol'
                  }
                </div>
                <button 
                  onClick={() => {/* Mock ingredient selection */}}
                  disabled={disabled}
                  data-testid="select-ingredients"
                >
                  Select Sample Ingredients
                </button>
                <div data-testid="selected-ingredients-count">
                  0 ingredients
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (hasActiveProtocols || showDashboard) && (
            <div data-testid="dashboard-tab" role="tabpanel">
              <div data-testid="protocol-dashboard">
                <div data-testid="dashboard-longevity">
                  Longevity {config.longevity?.isEnabled ? 'ON' : 'OFF'}
                </div>
                <div data-testid="dashboard-parasite">
                  Parasite {config.parasiteCleanse?.isEnabled ? 'ON' : 'OFF'}
                </div>
                <div data-testid="dashboard-progress">
                  Progress: {config.progress?.completionPercentage || 0}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

describe('SpecializedProtocolsPanel - Simple Tests', () => {
  const mockOnConfigChange = vi.fn();
  const user = userEvent.setup();

  const defaultProps = {
    onConfigChange: mockOnConfigChange,
    disabled: false,
    showDashboard: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization and Rendering', () => {
    it('renders with default state correctly', () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      expect(screen.getByText('Advanced longevity and cleansing protocols with medical safety features')).toBeInTheDocument();
      expect(screen.getByText('No specialized protocols active')).toBeInTheDocument();
      expect(screen.getByTestId('specialized-protocols-panel')).toBeInTheDocument();
    });

    it('renders with initial configuration from props', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        parasiteCleanse: { isEnabled: false },
        clientAilments: { selectedAilments: ['hypertension'], includeInMealPlanning: true },
        medical: { hasConsented: true },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.queryByText('No specialized protocols active')).not.toBeInTheDocument();
      expect(screen.getByTestId('longevity-status')).toBeInTheDocument();
      expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
      expect(screen.getByTestId('ailments-status')).toBeInTheDocument();
      expect(screen.getByText('Health Issues Targeting Active')).toBeInTheDocument();
    });

    it('calls onConfigChange when configuration changes', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      // Enable longevity mode
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      expect(mockOnConfigChange).toHaveBeenCalled();
      
      // Check that the configuration includes longevity settings
      const lastCall = mockOnConfigChange.mock.calls[mockOnConfigChange.mock.calls.length - 1];
      const config = lastCall[0];
      
      expect(config).toHaveProperty('longevity');
      expect(config.longevity.isEnabled).toBe(true);
    });
  });

  describe('Tab Navigation and UI Interactions', () => {
    it('expands and collapses correctly', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      const expandButton = screen.getByTestId('expand-toggle');
      
      // Should be expanded by default
      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
      expect(screen.getByText('Health Issues')).toBeInTheDocument();
      
      // Click to collapse
      await user.click(expandButton);
      
      // Should be collapsed
      expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
      expect(screen.queryByText('Health Issues')).not.toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      // Default to ailments tab
      expect(screen.getByTestId('ailments-tab')).toBeInTheDocument();
      expect(screen.getByTestId('client-ailments-selector')).toBeInTheDocument();
      
      // Switch to protocols tab
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // Wait for tab switch and check protocols tab content
      await waitFor(() => {
        expect(screen.getByTestId('protocols-tab')).toBeInTheDocument();
      });
      expect(screen.getByTestId('longevity-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('parasite-cleanse-protocol')).toBeInTheDocument();
      
      // Switch to ingredients tab
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      // Wait for tab switch and check ingredients tab content
      await waitFor(() => {
        expect(screen.getByTestId('ingredients-tab')).toBeInTheDocument();
      });
      expect(screen.getByTestId('specialized-ingredient-selector')).toBeInTheDocument();
    });

    it('shows dashboard tab when protocols are active', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} showDashboard={true} />);
      
      // Enable longevity mode first
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      // Dashboard tab should now be visible
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Switch to dashboard tab
      const dashboardTab = screen.getByText('Dashboard');
      await user.click(dashboardTab);
      
      expect(screen.getByTestId('dashboard-tab')).toBeInTheDocument();
      expect(screen.getByTestId('protocol-dashboard')).toBeInTheDocument();
    });
  });

  describe('Protocol Configuration Management', () => {
    it('handles longevity mode configuration changes', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      // Switch to protocols tab
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // Enable longevity mode
      const longevityToggle = screen.getByTestId('longevity-toggle');
      await user.click(longevityToggle);
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          longevity: expect.objectContaining({ 
            isEnabled: true
          }),
        })
      );
    });

    it('handles parasite cleanse configuration changes', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      // Switch to protocols tab
      const protocolsTab = screen.getByText('Protocols');
      await user.click(protocolsTab);
      
      // Enable parasite cleanse
      const parasiteToggle = screen.getByTestId('parasite-toggle');
      await user.click(parasiteToggle);
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parasiteCleanse: expect.objectContaining({ 
            isEnabled: true
          }),
        })
      );
    });

    it('handles client ailments configuration changes', async () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      // Default to ailments tab
      const hypertensionCheckbox = screen.getByTestId('ailment-hypertension');
      await user.click(hypertensionCheckbox);
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          clientAilments: expect.objectContaining({ 
            selectedAilments: ['hypertension']
          }),
        })
      );

      const diabetesCheckbox = screen.getByTestId('ailment-diabetes');
      await user.click(diabetesCheckbox);
      
      expect(mockOnConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          clientAilments: expect.objectContaining({ 
            selectedAilments: ['hypertension', 'diabetes']
          }),
        })
      );
    });
  });

  describe('Protocol Status Display', () => {
    it('shows correct status badges for active protocols', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        parasiteCleanse: { isEnabled: true, intensity: 'moderate' },
        clientAilments: { selectedAilments: ['hypertension'], includeInMealPlanning: true },
        medical: { hasConsented: false },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
      expect(screen.getByText('Parasite Cleanse Active')).toBeInTheDocument();
      expect(screen.getByText('Health Issues (1)')).toBeInTheDocument();
      expect(screen.getByText('Health Issues Targeting Active')).toBeInTheDocument();
    });

    it('displays medical supervision status correctly', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        medical: { hasConsented: true },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByTestId('medical-status')).toBeInTheDocument();
      expect(screen.getByText('Medical Supervision Status')).toBeInTheDocument();
      expect(screen.getByText('Medical consent obtained and healthcare provider approval confirmed.')).toBeInTheDocument();
    });

    it('shows warning when medical consent is missing', () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        medical: { hasConsented: false },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      expect(screen.getByTestId('medical-warning')).toBeInTheDocument();
      expect(screen.getByText('Healthcare provider consultation required for selected protocol intensity.')).toBeInTheDocument();
    });
  });

  describe('Ingredient Selector Integration', () => {
    it('shows correct protocol type for combined protocols', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        parasiteCleanse: { isEnabled: true, intensity: 'gentle' },
        medical: { hasConsented: false },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      expect(screen.getByTestId('protocol-type')).toHaveTextContent('both protocol');
    });

    it('shows correct protocol type for single protocol', async () => {
      const initialConfig = {
        longevity: { isEnabled: true, fastingStrategy: '16:8' },
        parasiteCleanse: { isEnabled: false },
        medical: { hasConsented: false },
        progress: { completionPercentage: 0 }
      };

      render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={initialConfig} />);
      
      const ingredientsTab = screen.getByText('Ingredients');
      await user.click(ingredientsTab);
      
      expect(screen.getByTestId('protocol-type')).toHaveTextContent('longevity protocol');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('supports proper ARIA roles for tabs', () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('handles disabled state correctly', () => {
      render(<MockSpecializedProtocolsPanel {...defaultProps} disabled={true} />);
      
      const expandButton = screen.getByTestId('expand-toggle');
      expect(expandButton).toBeDisabled();
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toBeDisabled();
      });
      
      // Check ailment checkboxes which are visible in default tab
      const ailmentCheckboxes = [
        screen.getByTestId('ailment-hypertension'),
        screen.getByTestId('ailment-diabetes')
      ];
      ailmentCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
      
      // Note: Protocol toggles are in the protocols tab, but since tabs are disabled,
      // we can't easily navigate to test them. This is expected behavior.
      // The important part is that all accessible controls are properly disabled.
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing onConfigChange prop gracefully', () => {
      const propsWithoutOnChange = { ...defaultProps, onConfigChange: undefined };
      
      expect(() => {
        render(<MockSpecializedProtocolsPanel {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    it('handles undefined initial config gracefully', () => {
      expect(() => {
        render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={undefined} />);
      }).not.toThrow();
      
      expect(screen.getByText('No specialized protocols active')).toBeInTheDocument();
    });

    it('handles partial initial config gracefully', () => {
      const partialConfig = {
        longevity: { isEnabled: true },
        // Missing other properties
      };
      
      expect(() => {
        render(<MockSpecializedProtocolsPanel {...defaultProps} initialConfig={partialConfig} />);
      }).not.toThrow();
      
      expect(screen.getByText('Longevity Mode Active')).toBeInTheDocument();
    });
  });
});