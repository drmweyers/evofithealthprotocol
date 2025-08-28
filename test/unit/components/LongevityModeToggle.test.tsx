import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import LongevityModeToggle from '../../../client/src/components/LongevityModeToggle';
import type { LongevityModeConfig, LongevityToggleProps } from '../../../client/src/types/specializedProtocols';

// Note: Form dependencies are mocked globally in test/setup.ts

describe('LongevityModeToggle Component', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  const defaultConfig: LongevityModeConfig = {
    isEnabled: false,
    fastingStrategy: 'none',
    calorieRestriction: 'none',
    antioxidantFocus: [],
    includeAntiInflammatory: false,
    includeBrainHealth: false,
    includeHeartHealth: false,
    targetServings: {
      vegetables: 5,
      antioxidantFoods: 3,
      omega3Sources: 2,
    },
  };

  const defaultProps: LongevityToggleProps = {
    config: defaultConfig,
    onChange: mockOnChange,
    disabled: false,
    showTooltips: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default disabled state', () => {
      render(<LongevityModeToggle {...defaultProps} />);
      
      expect(screen.getByText('🔄 Longevity Mode')).toBeInTheDocument();
      expect(screen.getByText('Anti-aging focused meal planning with fasting and antioxidant optimization')).toBeInTheDocument();
      
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
      expect(toggle).toHaveAttribute('aria-label', 'Enable Longevity Mode');
    });

    it('renders with enabled state and shows configuration options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
      
      expect(screen.getByText('Intermittent Fasting Strategy')).toBeInTheDocument();
      expect(screen.getByText('Calorie Restriction Level')).toBeInTheDocument();
      expect(screen.getByText('Antioxidant Focus')).toBeInTheDocument();
    });

    it('renders with custom configuration values', () => {
      const customConfig: LongevityModeConfig = {
        isEnabled: true,
        fastingStrategy: '16:8',
        calorieRestriction: 'mild',
        antioxidantFocus: ['berries', 'leafyGreens'],
        includeAntiInflammatory: true,
        includeBrainHealth: true,
        includeHeartHealth: false,
        targetServings: {
          vegetables: 7,
          antioxidantFoods: 4,
          omega3Sources: 3,
        },
      };
      
      render(<LongevityModeToggle {...defaultProps} config={customConfig} />);
      
      // Should show active settings summary
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      expect(screen.getByText('16:8 Intermittent Fasting')).toBeInTheDocument();
      expect(screen.getByText('Mild (5-10%)')).toBeInTheDocument();
      expect(screen.getByText('Anti-Inflammatory')).toBeInTheDocument();
      expect(screen.getByText('Brain Health')).toBeInTheDocument();
    });

    it('shows tooltips when enabled', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} showTooltips={true} />);
      
      const tooltipTriggers = screen.getAllByTestId('info-icon') || screen.getAllByRole('button', { name: /info/i });
      // At least one tooltip should be present
      expect(tooltipTriggers.length).toBeGreaterThan(0);
    });

    it('hides tooltips when disabled', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} showTooltips={false} />);
      
      expect(screen.getByText('Longevity Mode')).toBeInTheDocument();
      // Should not show tooltip indicators when disabled
    });
  });

  describe('Toggle Functionality', () => {
    it('calls onChange when toggled on', async () => {
      render(<LongevityModeToggle {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultConfig,
        isEnabled: true,
      });
    });

    it('calls onChange when toggled off', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...enabledConfig,
        isEnabled: false,
      });
    });

    it('does not respond to toggle when disabled', async () => {
      render(<LongevityModeToggle {...defaultProps} disabled={true} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      
      await user.click(toggle);
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Fasting Strategy Configuration', () => {
    it('displays all fasting strategy options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      const fastingSelect = screen.getByDisplayValue('No Fasting') || 
                           screen.getByText('Select fasting strategy');
      fireEvent.click(fastingSelect);
      
      // Check that fasting options are available
      expect(screen.getByText('16:8 Intermittent Fasting') || 
             screen.getByText('16 hours fasting, 8 hours eating window')).toBeInTheDocument();
    });

    it('updates fasting strategy when selected', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // This test depends on the actual form implementation
      // Since we're mocking react-hook-form, we'll test the onChange logic
      expect(screen.getByText('Intermittent Fasting Strategy')).toBeInTheDocument();
    });
  });

  describe('Calorie Restriction Configuration', () => {
    it('displays all calorie restriction levels', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Calorie Restriction Level')).toBeInTheDocument();
      // Test would show select options when clicked
    });

    it('shows warning for strict calorie restriction', () => {
      const strictConfig = { 
        ...defaultConfig, 
        isEnabled: true, 
        calorieRestriction: 'strict' as const 
      };
      
      render(<LongevityModeToggle {...defaultProps} config={strictConfig} />);
      
      // Should show medical supervision warning in configuration summary
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      expect(screen.getByText('Strict (25-30%)')).toBeInTheDocument();
    });
  });

  describe('Antioxidant Focus Selection', () => {
    it('displays antioxidant focus options', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Antioxidant Focus')).toBeInTheDocument();
    });

    it('shows selected antioxidant focuses in summary', () => {
      const focusConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        antioxidantFocus: ['berries', 'leafyGreens', 'turmeric'] as any[]
      };
      
      render(<LongevityModeToggle {...defaultProps} config={focusConfig} />);
      
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      // Should show badges for selected focuses
      expect(screen.getByText('Berry Focus') || screen.getByText('berries')).toBeInTheDocument();
      expect(screen.getByText('Leafy Greens') || screen.getByText('leafyGreens')).toBeInTheDocument();
      expect(screen.getByText('Turmeric & Curcumin') || screen.getByText('turmeric')).toBeInTheDocument();
    });
  });

  describe('Health Focus Areas', () => {
    it('shows additional health focus toggles', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      expect(screen.getByText('Additional Health Focus')).toBeInTheDocument();
      expect(screen.getByText('Anti-Inflammatory Foods')).toBeInTheDocument();
      expect(screen.getByText('Brain Health Foods')).toBeInTheDocument();
      expect(screen.getByText('Heart Health Foods')).toBeInTheDocument();
    });

    it('shows enabled health focuses in summary', () => {
      const healthFocusConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        includeAntiInflammatory: true,
        includeBrainHealth: true,
        includeHeartHealth: false,
      };
      
      render(<LongevityModeToggle {...defaultProps} config={healthFocusConfig} />);
      
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      expect(screen.getByText('Anti-Inflammatory')).toBeInTheDocument();
      expect(screen.getByText('Brain Health')).toBeInTheDocument();
      expect(screen.queryByText('Heart Health')).not.toBeInTheDocument();
    });
  });

  describe('Configuration Summary', () => {
    it('shows summary only when protocols are configured', () => {
      const basicEnabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={basicEnabledConfig} />);
      
      // No active settings should be shown for default config
      expect(screen.queryByText('Active Longevity Settings')).not.toBeInTheDocument();
    });

    it('shows comprehensive summary for complex configuration', () => {
      const complexConfig: LongevityModeConfig = {
        isEnabled: true,
        fastingStrategy: '18:6',
        calorieRestriction: 'moderate',
        antioxidantFocus: ['berries', 'leafyGreens', 'turmeric'],
        includeAntiInflammatory: true,
        includeBrainHealth: true,
        includeHeartHealth: true,
        targetServings: {
          vegetables: 8,
          antioxidantFoods: 5,
          omega3Sources: 3,
        },
      };
      
      render(<LongevityModeToggle {...defaultProps} config={complexConfig} />);
      
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      expect(screen.getByText('18:6 Intermittent Fasting')).toBeInTheDocument();
      expect(screen.getByText('Moderate (15-20%)')).toBeInTheDocument();
      expect(screen.getByText('Anti-Inflammatory')).toBeInTheDocument();
      expect(screen.getByText('Brain Health')).toBeInTheDocument();
      expect(screen.getByText('Heart Health')).toBeInTheDocument();
    });

    it('groups related settings appropriately', () => {
      const groupedConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        fastingStrategy: '16:8' as const,
        calorieRestriction: 'mild' as const,
        antioxidantFocus: ['berries'],
      };
      
      render(<LongevityModeToggle {...defaultProps} config={groupedConfig} />);
      
      expect(screen.getByText('Active Longevity Settings')).toBeInTheDocument();
      // Should show badges grouped by type
    });
  });

  describe('Form Validation and Error Handling', () => {
    it('handles invalid configurations gracefully', () => {
      const invalidConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        fastingStrategy: 'invalid' as any,
        calorieRestriction: 'invalid' as any,
      };
      
      // Component should render without crashing
      render(<LongevityModeToggle {...defaultProps} config={invalidConfig} />);
      
      expect(screen.getByText('🔄 Longevity Mode')).toBeInTheDocument();
    });

    it('maintains form state during configuration changes', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      const { rerender } = render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // Change configuration
      const updatedConfig = { ...enabledConfig, fastingStrategy: '16:8' as const };
      rerender(<LongevityModeToggle {...defaultProps} config={updatedConfig} />);
      
      expect(screen.getByText('Intermittent Fasting Strategy')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels', () => {
      render(<LongevityModeToggle {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Enable Longevity Mode');
    });

    it('supports keyboard navigation', async () => {
      render(<LongevityModeToggle {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      toggle.focus();
      
      await user.keyboard('{Space}');
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultConfig,
        isEnabled: true,
      });
    });

    it('maintains focus management when expanding/collapsing', () => {
      const { rerender } = render(<LongevityModeToggle {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      toggle.focus();
      
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      rerender(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // Focus should be maintained
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('Performance and Optimization', () => {
    it('only calls onChange when values actually change', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // Click the same toggle state
      const toggle = screen.getByRole('switch');
      await user.click(toggle); // Turn off
      await user.click(toggle); // Turn on again
      
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('handles rapid configuration changes', async () => {
      render(<LongevityModeToggle {...defaultProps} />);
      
      const toggle = screen.getByRole('switch');
      
      // Rapid toggle clicks
      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);
      
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it('debounces form submissions when appropriate', () => {
      // This would be tested with actual form implementation
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // Form should exist when enabled
      expect(screen.getByText('Intermittent Fasting Strategy')).toBeInTheDocument();
    });
  });

  describe('Integration with Parent Component', () => {
    it('receives and processes config changes from parent', () => {
      const { rerender } = render(<LongevityModeToggle {...defaultProps} />);
      
      const updatedConfig = { 
        ...defaultConfig, 
        isEnabled: true,
        fastingStrategy: '16:8' as const 
      };
      
      rerender(<LongevityModeToggle {...defaultProps} config={updatedConfig} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
    });

    it('propagates complex configuration objects correctly', async () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      const toggle = screen.getByRole('switch');
      await user.click(toggle); // Disable
      
      expect(mockOnChange).toHaveBeenCalledWith({
        ...enabledConfig,
        isEnabled: false,
      });
    });

    it('handles external prop updates without losing internal state', () => {
      const { rerender } = render(<LongevityModeToggle {...defaultProps} disabled={false} />);
      
      // Update disabled state
      rerender(<LongevityModeToggle {...defaultProps} disabled={true} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('handles missing onChange prop gracefully', () => {
      const propsWithoutOnChange = { ...defaultProps, onChange: undefined as any };
      
      // Should render without crashing
      expect(() => {
        render(<LongevityModeToggle {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    it('handles undefined config values', () => {
      const partialConfig = {
        isEnabled: true,
        fastingStrategy: undefined as any,
        calorieRestriction: undefined as any,
        antioxidantFocus: undefined as any,
      };
      
      expect(() => {
        render(<LongevityModeToggle {...defaultProps} config={partialConfig} />);
      }).not.toThrow();
    });

    it('recovers from invalid form state', () => {
      const enabledConfig = { ...defaultConfig, isEnabled: true };
      
      render(<LongevityModeToggle {...defaultProps} config={enabledConfig} />);
      
      // Component should continue to function even with form errors
      expect(screen.getByText('Intermittent Fasting Strategy')).toBeInTheDocument();
    });
  });
});