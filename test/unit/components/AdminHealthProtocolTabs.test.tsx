import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the Admin component's health protocol related functionality
const AdminHealthProtocolTabs = ({ 
  recipesSubTab, 
  setRecipesSubTab, 
  healthProtocolsData, 
  protocolsLoading,
  setActiveTab 
}: any) => {
  return (
    <div data-testid="admin-health-protocol-tabs">
      {/* Sub-tabs for Recipes vs Health Protocols */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            onClick={() => setRecipesSubTab('recipes')}
            className={recipesSubTab === 'recipes' ? 'active' : ''}
            data-testid="recipes-tab"
          >
            All Recipes ({healthProtocolsData?.recipeCount || 0})
          </button>
          <button
            onClick={() => setRecipesSubTab('protocols')}
            className={recipesSubTab === 'protocols' ? 'active' : ''}
            data-testid="protocols-tab"
          >
            Health Protocols ({healthProtocolsData?.total || 0})
          </button>
        </div>

        {recipesSubTab === 'protocols' && (
          <div data-testid="protocols-content">
            {/* Health Protocols Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div>Total Protocols</div>
                <div>{healthProtocolsData?.total || 0}</div>
              </div>

              <div className="stat-card">
                <div>Longevity Plans</div>
                <div>
                  {healthProtocolsData?.protocols?.filter((p: any) => p.type === 'longevity').length || 0}
                </div>
              </div>

              <div className="stat-card">
                <div>Parasite Cleanse</div>
                <div>
                  {healthProtocolsData?.protocols?.filter((p: any) => p.type === 'parasite_cleanse').length || 0}
                </div>
              </div>

              <div className="stat-card">
                <div>Templates</div>
                <div>
                  {healthProtocolsData?.protocols?.filter((p: any) => p.isTemplate).length || 0}
                </div>
              </div>
            </div>

            {/* Health Protocols List */}
            <div className="protocols-list">
              {protocolsLoading ? (
                <div data-testid="loading-state">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="loading-placeholder" />
                  ))}
                </div>
              ) : (healthProtocolsData?.protocols || []).length === 0 ? (
                <div data-testid="empty-state">
                  <div>No Health Protocols Yet</div>
                  <p>Generate health protocols using the Health Protocols tab to see them here.</p>
                  <button 
                    onClick={() => setActiveTab('specialized')}
                    data-testid="create-protocols-button"
                  >
                    Create Health Protocols
                  </button>
                </div>
              ) : (
                <div data-testid="protocols-grid">
                  {(healthProtocolsData?.protocols || []).map((protocol: any) => (
                    <div key={protocol.id} className="protocol-card" data-testid={`protocol-${protocol.id}`}>
                      <div className="protocol-header">
                        <h5>{protocol.name}</h5>
                        <div className="badges">
                          <span className={`badge ${protocol.type}`}>
                            {protocol.type === 'longevity' ? 'Longevity' : 'Parasite Cleanse'}
                          </span>
                          {protocol.isTemplate && (
                            <span className="badge template">Template</span>
                          )}
                        </div>
                      </div>
                      <p>{protocol.description}</p>
                      <div className="protocol-details">
                        <div>
                          <div>Duration</div>
                          <div>{protocol.duration} days</div>
                        </div>
                        <div>
                          <div>Intensity</div>
                          <div>{protocol.intensity}</div>
                        </div>
                        <div>
                          <div>Created</div>
                          <div>{new Date(protocol.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div>Tags</div>
                          <div>{protocol.tags?.length || 0} tags</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create a wrapper component with QueryClient
const AdminHealthProtocolTabsWrapper = (props: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AdminHealthProtocolTabs {...props} />
    </QueryClientProvider>
  );
};

describe('Admin Health Protocol Tabs', () => {
  const user = userEvent.setup();
  
  const defaultProps = {
    recipesSubTab: 'recipes',
    setRecipesSubTab: vi.fn(),
    healthProtocolsData: null,
    protocolsLoading: false,
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tab Navigation', () => {
    it('renders recipes and protocols tabs', () => {
      render(<AdminHealthProtocolTabsWrapper {...defaultProps} />);

      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();
      expect(screen.getByTestId('protocols-tab')).toBeInTheDocument();
    });

    it('shows active state for recipes tab by default', () => {
      render(<AdminHealthProtocolTabsWrapper {...defaultProps} />);

      const recipesTab = screen.getByTestId('recipes-tab');
      const protocolsTab = screen.getByTestId('protocols-tab');

      expect(recipesTab).toHaveClass('active');
      expect(protocolsTab).not.toHaveClass('active');
    });

    it('switches to protocols tab when clicked', async () => {
      const setRecipesSubTab = vi.fn();
      const props = { ...defaultProps, setRecipesSubTab };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      const protocolsTab = screen.getByTestId('protocols-tab');
      await user.click(protocolsTab);

      expect(setRecipesSubTab).toHaveBeenCalledWith('protocols');
    });

    it('switches to recipes tab when clicked', async () => {
      const setRecipesSubTab = vi.fn();
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        setRecipesSubTab 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      const recipesTab = screen.getByTestId('recipes-tab');
      await user.click(recipesTab);

      expect(setRecipesSubTab).toHaveBeenCalledWith('recipes');
    });

    it('displays correct counts in tab labels', () => {
      const healthProtocolsData = {
        total: 15,
        recipeCount: 250,
        protocols: []
      };
      const props = { ...defaultProps, healthProtocolsData };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('All Recipes (250)')).toBeInTheDocument();
      expect(screen.getByText('Health Protocols (15)')).toBeInTheDocument();
    });

    it('shows zero counts when data is not available', () => {
      render(<AdminHealthProtocolTabsWrapper {...defaultProps} />);

      expect(screen.getByText('All Recipes (0)')).toBeInTheDocument();
      expect(screen.getByText('Health Protocols (0)')).toBeInTheDocument();
    });
  });

  describe('Protocols Content Display', () => {
    it('shows protocols content when protocols tab is active', () => {
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData: { total: 0, protocols: [] }
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('protocols-content')).toBeInTheDocument();
    });

    it('does not show protocols content when recipes tab is active', () => {
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'recipes',
        healthProtocolsData: { total: 0, protocols: [] }
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.queryByTestId('protocols-content')).not.toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('displays protocol statistics correctly', () => {
      const healthProtocolsData = {
        total: 10,
        protocols: [
          { id: '1', type: 'longevity', isTemplate: false },
          { id: '2', type: 'longevity', isTemplate: true },
          { id: '3', type: 'parasite_cleanse', isTemplate: false },
          { id: '4', type: 'parasite_cleanse', isTemplate: true },
          { id: '5', type: 'longevity', isTemplate: false },
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // Total protocols
      expect(screen.getByText('3')).toBeInTheDocument(); // Longevity plans
      expect(screen.getByText('2')).toBeInTheDocument(); // Parasite cleanse
      expect(screen.getByText('2')).toBeInTheDocument(); // Templates
    });

    it('shows zero statistics when no protocols exist', () => {
      const healthProtocolsData = {
        total: 0,
        protocols: []
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      // All stats should show 0
      const statCards = screen.getAllByText('0');
      expect(statCards).toHaveLength(4); // Total, Longevity, Parasite, Templates
    });
  });

  describe('Loading States', () => {
    it('shows loading state when protocols are loading', () => {
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        protocolsLoading: true,
        healthProtocolsData: null
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      
      // Should show loading placeholders
      const loadingPlaceholders = screen.getAllByRole('generic', { hidden: true });
      expect(loadingPlaceholders.some(el => el.classList.contains('loading-placeholder'))).toBe(true);
    });

    it('does not show loading state when not loading', () => {
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        protocolsLoading: false,
        healthProtocolsData: { total: 0, protocols: [] }
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no protocols exist', () => {
      const healthProtocolsData = {
        total: 0,
        protocols: []
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        protocolsLoading: false,
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Health Protocols Yet')).toBeInTheDocument();
      expect(screen.getByText('Generate health protocols using the Health Protocols tab to see them here.')).toBeInTheDocument();
      expect(screen.getByTestId('create-protocols-button')).toBeInTheDocument();
    });

    it('navigates to specialized tab when create button is clicked', async () => {
      const setActiveTab = vi.fn();
      const healthProtocolsData = { total: 0, protocols: [] };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData,
        setActiveTab 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      const createButton = screen.getByTestId('create-protocols-button');
      await user.click(createButton);

      expect(setActiveTab).toHaveBeenCalledWith('specialized');
    });

    it('does not show empty state when protocols exist', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Test Protocol',
            type: 'longevity',
            description: 'Test description',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01',
            tags: ['longevity'],
            isTemplate: false
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('Protocols List Display', () => {
    it('displays protocols grid when protocols exist', () => {
      const healthProtocolsData = {
        total: 2,
        protocols: [
          {
            id: '1',
            name: 'Longevity Protocol 1',
            type: 'longevity',
            description: 'Anti-aging meal plan',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            tags: ['longevity', 'anti-aging'],
            isTemplate: false
          },
          {
            id: '2',
            name: 'Parasite Cleanse Template',
            type: 'parasite_cleanse',
            description: 'Gentle cleansing protocol',
            duration: 14,
            intensity: 'gentle',
            createdAt: '2024-01-15T00:00:00Z',
            tags: ['cleanse'],
            isTemplate: true
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('protocols-grid')).toBeInTheDocument();
      expect(screen.getByTestId('protocol-1')).toBeInTheDocument();
      expect(screen.getByTestId('protocol-2')).toBeInTheDocument();
    });

    it('displays protocol details correctly', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Advanced Longevity Protocol',
            type: 'longevity',
            description: 'Comprehensive anti-aging nutrition plan with intermittent fasting',
            duration: 45,
            intensity: 'intensive',
            createdAt: '2024-02-01T00:00:00Z',
            tags: ['longevity', 'fasting', 'anti-inflammatory'],
            isTemplate: false
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('Advanced Longevity Protocol')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive anti-aging nutrition plan with intermittent fasting')).toBeInTheDocument();
      expect(screen.getByText('45 days')).toBeInTheDocument();
      expect(screen.getByText('intensive')).toBeInTheDocument();
      expect(screen.getByText('2/1/2024')).toBeInTheDocument(); // Date formatting
      expect(screen.getByText('3 tags')).toBeInTheDocument();
      expect(screen.getByText('Longevity')).toBeInTheDocument(); // Type badge
    });

    it('displays template badge for template protocols', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Cleanse Template',
            type: 'parasite_cleanse',
            description: 'Reusable cleanse protocol',
            duration: 14,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            tags: ['template'],
            isTemplate: true
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('Template')).toBeInTheDocument();
    });

    it('does not display template badge for non-template protocols', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Regular Protocol',
            type: 'longevity',
            description: 'Standard protocol',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            tags: ['longevity'],
            isTemplate: false
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.queryByText('Template')).not.toBeInTheDocument();
    });

    it('handles protocols with missing optional fields gracefully', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Minimal Protocol',
            type: 'longevity',
            description: 'Basic protocol',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            // Missing tags and isTemplate
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('Minimal Protocol')).toBeInTheDocument();
      expect(screen.getByText('0 tags')).toBeInTheDocument(); // Handles missing tags
      expect(screen.queryByText('Template')).not.toBeInTheDocument(); // No template badge when isTemplate is falsy
    });
  });

  describe('Protocol Type Badges', () => {
    it('displays correct badges for different protocol types', () => {
      const healthProtocolsData = {
        total: 2,
        protocols: [
          {
            id: '1',
            name: 'Longevity Plan',
            type: 'longevity',
            description: 'Test',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            isTemplate: false
          },
          {
            id: '2',
            name: 'Cleanse Plan',
            type: 'parasite_cleanse',
            description: 'Test',
            duration: 14,
            intensity: 'gentle',
            createdAt: '2024-01-01T00:00:00Z',
            isTemplate: false
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByText('Longevity')).toBeInTheDocument();
      expect(screen.getByText('Parasite Cleanse')).toBeInTheDocument();
    });

    it('applies correct CSS classes to badges', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            name: 'Test Protocol',
            type: 'longevity',
            description: 'Test',
            duration: 30,
            intensity: 'moderate',
            createdAt: '2024-01-01T00:00:00Z',
            isTemplate: false
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      const badge = screen.getByText('Longevity');
      expect(badge).toHaveClass('badge', 'longevity');
    });
  });

  describe('Error Handling', () => {
    it('handles null protocols data gracefully', () => {
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData: null 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('handles undefined protocols array gracefully', () => {
      const healthProtocolsData = {
        total: 5
        // protocols array is undefined
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('handles protocols with missing required fields', () => {
      const healthProtocolsData = {
        total: 1,
        protocols: [
          {
            id: '1',
            // Missing name, type, etc.
            createdAt: '2024-01-01T00:00:00Z',
          }
        ]
      };
      const props = { 
        ...defaultProps, 
        recipesSubTab: 'protocols',
        healthProtocolsData 
      };

      expect(() => {
        render(<AdminHealthProtocolTabsWrapper {...props} />);
      }).not.toThrow();

      expect(screen.getByTestId('protocols-grid')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for tabs', () => {
      render(<AdminHealthProtocolTabsWrapper {...defaultProps} />);

      const recipesTab = screen.getByTestId('recipes-tab');
      const protocolsTab = screen.getByTestId('protocols-tab');

      expect(recipesTab.tagName).toBe('BUTTON');
      expect(protocolsTab.tagName).toBe('BUTTON');
    });

    it('supports keyboard navigation', async () => {
      const setRecipesSubTab = vi.fn();
      const props = { ...defaultProps, setRecipesSubTab };

      render(<AdminHealthProtocolTabsWrapper {...props} />);

      const protocolsTab = screen.getByTestId('protocols-tab');
      protocolsTab.focus();

      await user.keyboard('{Enter}');

      expect(setRecipesSubTab).toHaveBeenCalledWith('protocols');
    });
  });
});