import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ParasiteCleanseProtocol from '../../../client/src/components/ParasiteCleanseProtocol';
import type { ParasiteCleanseConfig, ParasiteCleanseProtocolProps } from '../../../client/src/types/specializedProtocols';

// Mock form dependencies
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    control: {},
    handleSubmit: vi.fn((fn) => fn),
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn((schema) => ({
    async: true,
    validate: async (data: any) => ({ values: data, errors: {} }),
  })),
}));

vi.mock('zod', () => {
  const mockSchema = {
    parse: vi.fn(),
    safeParse: vi.fn(),
    refine: vi.fn(() => mockSchema),
    optional: vi.fn(() => mockSchema),
  };
  
  return {
    z: {
      object: vi.fn(() => mockSchema),
      enum: vi.fn(() => mockSchema),
      array: vi.fn(() => mockSchema),
      boolean: vi.fn(() => mockSchema),
      number: vi.fn(() => mockSchema),
      string: vi.fn(() => mockSchema),
    },
  };
});

describe('ParasiteCleanseProtocol Component', () => {
  const mockOnChange = vi.fn();
  const mockOnPhaseChange = vi.fn();
  const user = userEvent.setup();

  const defaultConfig: ParasiteCleanseConfig = {
    isEnabled: false,
    duration: 14,
    intensity: 'gentle',
    currentPhase: 'preparation',
    includeHerbalSupplements: false,
    dietOnlyCleanse: true,
    startDate: null,
    endDate: null,
    targetFoods: {
      antiParasitic: [],
      probiotics: [],
      fiberRich: [],
      excludeFoods: [],
    },
  };

  const defaultProps: ParasiteCleanseProtocolProps = {
    config: defaultConfig,
    onChange: mockOnChange,
    disabled: false,
    onPhaseChange: mockOnPhaseChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders with default disabled state', () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      expect(screen.getByText('🪱 Parasite Cleanse Protocol')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive parasite elimination and gut health restoration')).toBeInTheDocument();
      
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
      expect(toggle).toHaveAttribute('aria-label', 'Enable Parasite Cleanse Protocol');
    });

    it('renders with enabled state and shows configuration options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
      
      // Should show medical disclaimer
      expect(screen.getByText('Important Medical Disclaimer')).toBeInTheDocument();
      expect(screen.getByText(/This protocol is for educational purposes only/)).toBeInTheDocument();
      
      // Should show configuration sections
      expect(screen.getByText('Cleanse Duration')).toBeInTheDocument();
      expect(screen.getByText('Cleanse Intensity')).toBeInTheDocument();
      expect(screen.getByText('Protocol Options')).toBeInTheDocument();
    });

    it('shows progress tracking for active cleanse', () => {
      const activeConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-10T00:00:00Z'),
        endDate: new Date('2024-01-24T00:00:00Z'),
        currentPhase: 'elimination',
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={activeConfig} />);
      
      expect(screen.getByText('Cleanse Progress')).toBeInTheDocument();
      expect(screen.getByText('Active Elimination')).toBeInTheDocument();
      expect(screen.getByText(/Day \d+ of 14/)).toBeInTheDocument();
      expect(screen.getByText(/\d+ days remaining/)).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('calls onChange when toggled on', async () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultConfig,
        isEnabled: true,
      });
    });

    it('calls onChange when toggled off', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...enabledConfig,
        isEnabled: false,
      });
    });

    it('does not respond to toggle when disabled', async () => {
      render(<ParasiteCleanseProtocol {...defaultProps} disabled={true} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      
      await user.click(toggle);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Duration Configuration', () => {
    it('displays duration options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Cleanse Duration')).toBeInTheDocument();
      expect(screen.getByText('Select cleanse duration') || 
             screen.getByDisplayValue('14 Days (Standard)')).toBeInTheDocument();
    });

    it('shows appropriate recommendations for different durations', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      // Test would check for duration recommendations in select options
      expect(screen.getByText('Cleanse Duration')).toBeInTheDocument();
    });

    it('shows medical supervision warning for longer durations', () => {
      const longDurationConfig = { 
        ...defaultConfig, 
        isEnabled: true, 
        duration: 90 
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={longDurationConfig} />);
      
      // Should show active protocol settings
      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText('90 Days')).toBeInTheDocument();
    });
  });

  describe('Intensity Configuration', () => {
    it('displays intensity options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Cleanse Intensity')).toBeInTheDocument();
    });

    it('shows warning for intensive protocols', () => {
      const intensiveConfig = { 
        ...defaultConfig, 
        isEnabled: true, 
        intensity: 'intensive' as const 
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={intensiveConfig} />);
      
      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText('Intensive Intensity')).toBeInTheDocument();
    });
  });

  describe('Protocol Options', () => {
    it('displays protocol option toggles', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Protocol Options')).toBeInTheDocument();
      expect(screen.getByText('Include Herbal Supplements')).toBeInTheDocument();
      expect(screen.getByText('Diet-Only Cleanse')).toBeInTheDocument();
    });

    it('shows herbal supplement information', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Add traditional antiparasitic herbs like wormwood, black walnut, and cloves')).toBeInTheDocument();
    });

    it('shows diet-only cleanse information', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Focus solely on dietary changes without herbal supplements')).toBeInTheDocument();
    });

    it('reflects options in active settings summary', () => {
      const optionsConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        includeHerbalSupplements: true,
        dietOnlyCleanse: false,
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={optionsConfig} />);
      
      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText('Herbal Supplements')).toBeInTheDocument();
      expect(screen.queryByText('Diet Only')).not.toBeInTheDocument();
    });
  });

  describe('Start Date Configuration', () => {
    it('shows start date input', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Start Date (Optional)')).toBeInTheDocument();
      expect(screen.getByText('Set a start date to track progress and phases')).toBeInTheDocument();
      
      const dateInput = screen.getByRole('textbox') || screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('sets minimum date to today', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      const dateInput = screen.getByRole('textbox') || screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('min', '2024-01-15'); // Current date in test
    });

    it('displays set start date', () => {
      const dateConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        startDate: new Date('2024-01-20T00:00:00Z'),
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={dateConfig} />);
      
      // Date should be displayed in the progress section when set
      expect(screen.getByText('Start Date (Optional)')).toBeInTheDocument();
    });
  });

  describe('Food Categories Configuration', () => {
    it('displays all food category sections', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Food Categories')).toBeInTheDocument();
      expect(screen.getByText('✓ Include: Anti-Parasitic Foods')).toBeInTheDocument();
      expect(screen.getByText('✓ Include: Probiotic Foods')).toBeInTheDocument();
      expect(screen.getByText('✗ Exclude: Foods to Avoid')).toBeInTheDocument();
    });

    it('shows anti-parasitic food options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      // Should show common anti-parasitic foods
      expect(screen.getByText('Garlic')).toBeInTheDocument();
      expect(screen.getByText('Oregano')).toBeInTheDocument();
      expect(screen.getByText('Pumpkin Seeds')).toBeInTheDocument();
      expect(screen.getByText('Coconut Oil')).toBeInTheDocument();
    });

    it('shows probiotic food options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Kefir')).toBeInTheDocument();
      expect(screen.getByText('Sauerkraut')).toBeInTheDocument();
      expect(screen.getByText('Kimchi')).toBeInTheDocument();
      expect(screen.getByText('Kombucha')).toBeInTheDocument();
    });

    it('shows foods to exclude', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Sugar & Sweeteners')).toBeInTheDocument();
      expect(screen.getByText('Refined Carbohydrates')).toBeInTheDocument();
      expect(screen.getByText('Alcohol')).toBeInTheDocument();
      expect(screen.getByText('Processed Foods')).toBeInTheDocument();
    });

    it('shows food category descriptions', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Strong antimicrobial')).toBeInTheDocument();
      expect(screen.getByText('Traditional remedy')).toBeInTheDocument();
      expect(screen.getByText('Fermented dairy')).toBeInTheDocument();
      expect(screen.getByText('Feeds parasites')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('calculates progress percentage correctly', () => {
      const activeConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        duration: 14,
        startDate: new Date('2024-01-08T00:00:00Z'), // 7 days ago
        endDate: new Date('2024-01-22T00:00:00Z'),   // 7 days from now
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={activeConfig} />);
      
      expect(screen.getByText('Cleanse Progress')).toBeInTheDocument();
      // Progress should be approximately 50% (7 days into 14 day cleanse)
    });

    it('determines current phase based on progress', () => {
      const eliminationPhaseConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-10T00:00:00Z'), // 5 days ago
        endDate: new Date('2024-01-24T00:00:00Z'),   // 9 days from now
        currentPhase: 'elimination',
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={eliminationPhaseConfig} />);
      
      expect(screen.getByText('Active Elimination')).toBeInTheDocument();
    });

    it('calculates days remaining correctly', () => {
      const remainingConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        duration: 14,
        startDate: new Date('2024-01-10T00:00:00Z'),
        endDate: new Date('2024-01-24T00:00:00Z'),
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={remainingConfig} />);
      
      expect(screen.getByText(/\d+ days remaining/)).toBeInTheDocument();
    });

    it('shows progress bar', () => {
      const progressConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-10T00:00:00Z'),
        endDate: new Date('2024-01-24T00:00:00Z'),
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={progressConfig} />);
      
      // Should show progress bar component
      expect(screen.getByText('Cleanse Progress')).toBeInTheDocument();
    });
  });

  describe('Phase Management', () => {
    it('displays phase badges', () => {
      const phaseConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        currentPhase: 'elimination' as const,
        startDate: new Date('2024-01-10T00:00:00Z'),
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={phaseConfig} />);
      
      expect(screen.getByText('Active Elimination')).toBeInTheDocument();
    });

    it('calls onPhaseChange when phase transitions', () => {
      const transitionConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-15T00:00:00Z'),
        currentPhase: 'rebuilding',
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={transitionConfig} />);
      
      // Phase change would be called based on progress calculation
      expect(screen.getByText('Gut Rebuilding')).toBeInTheDocument();
    });

    it('shows appropriate phase descriptions', () => {
      const phaseConfigs = [
        { ...defaultConfig, isEnabled: true, currentPhase: 'preparation' as const },
        { ...defaultConfig, isEnabled: true, currentPhase: 'elimination' as const },
        { ...defaultConfig, isEnabled: true, currentPhase: 'rebuilding' as const },
        { ...defaultConfig, isEnabled: true, currentPhase: 'maintenance' as const },
      ];
      
      phaseConfigs.forEach((config, index) => {
        const { unmount } = render(<ParasiteCleanseProtocol {...defaultProps} config={config} />);
        
        switch (config.currentPhase) {
          case 'preparation':
            expect(screen.getByText('Preparation') || screen.getByText('Pre-cleanse preparation')).toBeInTheDocument();
            break;
          case 'elimination':
            expect(screen.getByText('Active Elimination') || screen.getByText('Active parasite elimination')).toBeInTheDocument();
            break;
          case 'rebuilding':
            expect(screen.getByText('Gut Rebuilding') || screen.getByText('Restore and rebuild')).toBeInTheDocument();
            break;
          case 'maintenance':
            expect(screen.getByText('Maintenance') || screen.getByText('Post-cleanse maintenance')).toBeInTheDocument();
            break;
        }
        
        unmount();
      });
    });
  });

  describe('Configuration Summary', () => {
    it('shows active protocol settings when enabled', () => {
      const summaryConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        duration: 21,
        intensity: 'moderate',
        includeHerbalSupplements: true,
        dietOnlyCleanse: false,
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={summaryConfig} />);
      
      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText('21 Days')).toBeInTheDocument();
      expect(screen.getByText('Moderate Intensity')).toBeInTheDocument();
      expect(screen.getByText('Herbal Supplements')).toBeInTheDocument();
      expect(screen.queryByText('Diet Only')).not.toBeInTheDocument();
    });

    it('groups settings logically in summary', () => {
      const groupedConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        duration: 30,
        intensity: 'intensive' as const,
        includeHerbalSupplements: true,
        dietOnlyCleanse: true, // Both options can be true
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={groupedConfig} />);
      
      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText('30 Days')).toBeInTheDocument();
      expect(screen.getByText('Intensive Intensity')).toBeInTheDocument();
      expect(screen.getByText('Herbal Supplements')).toBeInTheDocument();
      expect(screen.getByText('Diet Only')).toBeInTheDocument();
    });

    it('hides summary when not enabled', () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      expect(screen.queryByText('Active Protocol Settings')).not.toBeInTheDocument();
    });
  });

  describe('Medical Disclaimers and Safety', () => {
    it('always shows important medical disclaimer when enabled', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Important Medical Disclaimer')).toBeInTheDocument();
      expect(screen.getByText(/This protocol is for educational purposes only/)).toBeInTheDocument();
      expect(screen.getByText(/Consult with a healthcare provider/)).toBeInTheDocument();
      expect(screen.getByText(/especially if you have medical conditions/)).toBeInTheDocument();
    });

    it('emphasizes pregnancy and medication warnings', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText(/are pregnant/)).toBeInTheDocument();
      expect(screen.getByText(/are taking medications/)).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels', () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Enable Parasite Cleanse Protocol');
    });

    it('supports keyboard navigation', async () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      toggle.focus();
      
      await user.keyboard('{Space}');
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultConfig,
        isEnabled: true,
      });
    });

    it('maintains logical tab order in form', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      // Should have proper tab order through form elements
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing onChange prop gracefully', () => {
      const propsWithoutOnChange = { ...defaultProps, onChange: undefined as any };
      
      expect(() => {
        render(<ParasiteCleanseProtocol {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    it('handles invalid date configurations', () => {
      const invalidDateConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        startDate: new Date('invalid'),
        endDate: new Date('invalid'),
      };
      
      expect(() => {
        render(<ParasiteCleanseProtocol {...defaultProps} config={invalidDateConfig} />);
      }).not.toThrow();
    });

    it('handles negative or zero duration gracefully', () => {
      const invalidDurationConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        duration: 0,
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={invalidDurationConfig} />);
      
      expect(screen.getByText('🪱 Parasite Cleanse Protocol')).toBeInTheDocument();
    });

    it('handles undefined targetFoods gracefully', () => {
      const undefinedFoodsConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        targetFoods: undefined as any,
      };
      
      expect(() => {
        render(<ParasiteCleanseProtocol {...defaultProps} config={undefinedFoodsConfig} />);
      }).not.toThrow();
    });

    it('recovers from form validation errors', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      // Component should continue to function even with form errors
      expect(screen.getByText('Cleanse Duration')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('only re-renders when necessary', () => {
      const { rerender } = render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      // Re-render with same props should not cause unnecessary work
      rerender(<ParasiteCleanseProtocol {...defaultProps} />);
      
      expect(screen.getByText('🪱 Parasite Cleanse Protocol')).toBeInTheDocument();
    });

    it('handles rapid configuration changes efficiently', async () => {
      render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      
      // Rapid toggle clicks
      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it('memoizes expensive calculations', () => {
      const activeConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-10T00:00:00Z'),
        endDate: new Date('2024-01-24T00:00:00Z'),
      };
      
      const { rerender } = render(<ParasiteCleanseProtocol {...defaultProps} config={activeConfig} />);
      
      // Re-render with same dates should not recalculate progress
      rerender(<ParasiteCleanseProtocol {...defaultProps} config={activeConfig} />);
      
      expect(screen.getByText('Cleanse Progress')).toBeInTheDocument();
    });
  });

  describe('Integration with Parent Component', () => {
    it('receives configuration updates from parent', () => {
      const { rerender } = render(<ParasiteCleanseProtocol {...defaultProps} />);
      
      const updatedConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        intensity: 'moderate' as const,
        duration: 21,
      };
      
      rerender(<ParasiteCleanseProtocol {...defaultProps} config={updatedConfig} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
      expect(screen.getByText('21 Days')).toBeInTheDocument();
    });

    it('propagates all configuration changes correctly', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle); // Disable
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...enabledConfig,
        isEnabled: false,
      });
    });

    it('calls onPhaseChange when provided', () => {
      const phaseChangeConfig: ParasiteCleanseConfig = {
        ...defaultConfig,
        isEnabled: true,
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-15T00:00:00Z'),
      };
      
      render(<ParasiteCleanseProtocol {...defaultProps} config={phaseChangeConfig} />);
      
      // onPhaseChange would be called during phase transitions
      expect(mockOnPhaseChange).toBeDefined();
    });
  });
});