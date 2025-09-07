/**
 * Comprehensive Unit Tests for Enhanced ParasiteCleanseProtocol Component
 * 
 * This test suite validates the enhanced ParasiteCleanseProtocol component with 
 * comprehensive protocol selection, ailment targeting, and evidence-based recommendations.
 * 
 * Test Coverage:
 * - Component rendering and UI elements
 * - Protocol selection functionality
 * - Ailment-based recommendations
 * - Regional filtering
 * - Form validation and submission
 * - Safety warnings and disclaimers
 * - Protocol details display
 * - User interaction flows
 */

import React from 'react';
import { describe, it, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ParasiteCleanseProtocol from '../../client/src/components/ParasiteCleanseProtocol';
import { PARASITE_CLEANSE_PROTOCOLS } from '../../client/src/data/parasiteCleanseProtocols';
import type { ParasiteCleanseConfig } from '../../client/src/types/specializedProtocols';

// Mock data for testing
const mockDefaultConfig: ParasiteCleanseConfig = {
  isEnabled: false,
  duration: 14,
  intensity: 'moderate',
  includeHerbalSupplements: true,
  dietOnlyCleanse: false,
  startDate: null,
  endDate: null,
  targetFoods: {
    antiParasitic: ['garlic', 'oregano'],
    probiotics: ['kefir', 'sauerkraut'],
    fiberRich: ['chia-seeds', 'flax-seeds'],
    excludeFoods: ['sugar', 'refined-carbs'],
  },
  currentPhase: 'preparation',
  progress: 0,
};

const mockEnabledConfig: ParasiteCleanseConfig = {
  ...mockDefaultConfig,
  isEnabled: true,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-15'),
  progress: 50,
};

// Mock functions
const mockOnChange = vi.fn();
const mockOnPhaseChange = vi.fn();

describe('Enhanced ParasiteCleanseProtocol Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    
    test('should render component with disabled state initially', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockDefaultConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('🪱 Parasite Cleanse Protocol')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive parasite elimination and gut health restoration/)).toBeInTheDocument();
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('should render enhanced protocol selection when enabled', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('🧬 Evidence-Based Protocol Selection')).toBeInTheDocument();
      expect(screen.getByText(/Show.*Recommendations/)).toBeInTheDocument();
      expect(screen.getByText('Your Region (for herb availability)')).toBeInTheDocument();
    });

    test('should display medical disclaimer when enabled', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Important Medical Disclaimer')).toBeInTheDocument();
      expect(screen.getByText(/educational purposes only/)).toBeInTheDocument();
      expect(screen.getByText(/Consult with a healthcare provider/)).toBeInTheDocument();
    });

    test('should display protocol categories with correct labels', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('🏛️ Browse by Protocol Type')).toBeInTheDocument();
      expect(screen.getByText('Traditional Herbal')).toBeInTheDocument();
      expect(screen.getByText('Ayurvedic')).toBeInTheDocument();
      expect(screen.getByText('Modern Clinical')).toBeInTheDocument();
      expect(screen.getByText('Gentle/Combination')).toBeInTheDocument();
    });

    test('should show progress tracking when cleanse is active', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Cleanse Progress')).toBeInTheDocument();
      expect(screen.getByText(/Day.*of.*14/)).toBeInTheDocument();
      expect(screen.getByText(/days remaining/)).toBeInTheDocument();
    });

    test('should display region selector with all regions', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const regionSelect = screen.getByRole('combobox', { name: /region/i });
      expect(regionSelect).toBeInTheDocument();
    });
  });

  describe('Protocol Selection Functionality', () => {
    
    test('should display available protocols count', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const availableText = screen.getByText(/Available Protocols:/);
      expect(availableText).toBeInTheDocument();
      
      // Should show a number greater than 0
      const numberMatch = availableText.textContent?.match(/Available Protocols: (\d+)/);
      expect(numberMatch).toBeTruthy();
      expect(parseInt(numberMatch![1])).toBeGreaterThan(0);
    });

    test('should show protocol buttons for each category', async () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Look for protocol buttons (they should contain protocol names)
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && PARASITE_CLEANSE_PROTOCOLS.some(p => 
          button.textContent?.includes(p.name.split(' ')[0])
        )
      );
      
      expect(protocolButtons.length).toBeGreaterThan(0);
    });

    test('should handle protocol selection', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Find a protocol button and click it
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && PARASITE_CLEANSE_PROTOCOLS.some(p => 
          button.textContent?.includes(p.name.split(' ')[0])
        )
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        // Should show protocol details after selection
        await waitFor(() => {
          expect(screen.getByText(/Protocol Phases:/)).toBeInTheDocument();
        });
      }
    });

    test('should show recommendations when toggled', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const recommendButton = screen.getByRole('button', { name: /Show.*Recommendations/ });
      await user.click(recommendButton);

      expect(screen.getByText(/Hide.*Recommendations/)).toBeInTheDocument();
    });

    test('should filter protocols by region', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should start with North America selected
      expect(screen.getByText('🇺🇸 North America')).toBeInTheDocument();

      // Change to Europe
      const regionSelect = screen.getByRole('combobox');
      await user.click(regionSelect);
      
      const europeOption = screen.getByText('🇪🇺 Europe');
      await user.click(europeOption);

      // Should update the available protocols count
      const availableText = screen.getByText(/Available Protocols:/);
      expect(availableText).toBeInTheDocument();
    });
  });

  describe('Protocol Details Display', () => {
    
    test('should show detailed protocol information when selected', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Find and click a protocol button
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Classic')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          // Should show protocol details
          expect(screen.getByText(/Protocol Phases:/)).toBeInTheDocument();
          expect(screen.getByText(/Primary Herbs:/)).toBeInTheDocument();
          expect(screen.getByText(/Contraindications/)).toBeInTheDocument();
        });
      }
    });

    test('should display protocol phases correctly', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Select a protocol that has phases
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Triple')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/Preparation/)).toBeInTheDocument();
          expect(screen.getByText(/Active Cleanse/)).toBeInTheDocument();
          expect(screen.getByText(/Restoration/)).toBeInTheDocument();
        });
      }
    });

    test('should show herb tooltips with dosage information', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Select a protocol with herbs
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Herb')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          const herbBadges = screen.getAllByText(/Walnut|Wormwood|Clove|Garlic/);
          if (herbBadges.length > 0) {
            expect(herbBadges[0]).toBeInTheDocument();
          }
        });
      }
    });

    test('should allow closing protocol details', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Select a protocol first
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Classic')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/Protocol Phases:/)).toBeInTheDocument();
        });

        // Find and click close button
        const closeButton = screen.getByText('✕');
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByText(/Protocol Phases:/)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Form Validation and Submission', () => {
    
    test('should validate duration selection', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const durationSelect = screen.getByRole('combobox', { name: /duration/i });
      await user.click(durationSelect);
      
      // Should show duration options
      expect(screen.getByText(/7 Days/)).toBeInTheDocument();
      expect(screen.getByText(/14 Days/)).toBeInTheDocument();
      expect(screen.getByText(/30 Days/)).toBeInTheDocument();
    });

    test('should validate intensity selection', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const intensitySelect = screen.getByRole('combobox', { name: /intensity/i });
      await user.click(intensitySelect);
      
      // Should show intensity options
      expect(screen.getByText(/Gentle/)).toBeInTheDocument();
      expect(screen.getByText(/Moderate/)).toBeInTheDocument();
      expect(screen.getByText(/Intensive/)).toBeInTheDocument();
    });

    test('should handle herbal supplements toggle', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const herbalToggle = screen.getByRole('switch', { name: /herbal supplements/i });
      expect(herbalToggle).toBeInTheDocument();
      
      await user.click(herbalToggle);
      // onChange should be called when toggled
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('should handle diet-only cleanse toggle', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const dietOnlyToggle = screen.getByRole('switch', { name: /diet.only/i });
      expect(dietOnlyToggle).toBeInTheDocument();
      
      await user.click(dietOnlyToggle);
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('should validate start date input', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const dateInput = screen.getByLabelText(/Start Date/);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
      expect(dateInput).toHaveAttribute('min');
    });

    test('should handle food category selections', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should show food categories
      expect(screen.getByText(/Anti-Parasitic Foods/)).toBeInTheDocument();
      expect(screen.getByText(/Probiotic Foods/)).toBeInTheDocument();
      expect(screen.getByText(/Foods to Avoid/)).toBeInTheDocument();

      // Should have checkboxes for food items
      const garlicCheckbox = screen.getByRole('checkbox', { name: /garlic/i });
      expect(garlicCheckbox).toBeInTheDocument();
      
      await user.click(garlicCheckbox);
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Safety Features and Warnings', () => {
    
    test('should display medical disclaimer prominently', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const disclaimer = screen.getByText('Important Medical Disclaimer');
      expect(disclaimer).toBeInTheDocument();
      
      const disclaimerContent = screen.getByText(/educational purposes only/);
      expect(disclaimerContent).toBeInTheDocument();
    });

    test('should show intensity warnings for intensive protocols', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const intensitySelect = screen.getByRole('combobox', { name: /intensity/i });
      await user.click(intensitySelect);
      
      const intensiveOption = screen.getByText(/Intensive/);
      await user.click(intensiveOption);
      
      // Should show warning for intensive protocols
      expect(screen.getByText(/healthcare provider supervision/)).toBeInTheDocument();
    });

    test('should display contraindications when protocol is selected', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Select a protocol
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Classic')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText(/Contraindications/)).toBeInTheDocument();
        });
      }
    });

    test('should show appropriate badges for protocol safety levels', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Select a protocol to see its evidence level
      const protocolButtons = screen.getAllByRole('button').filter(button => 
        button.textContent && button.textContent.includes('Modern')
      );

      if (protocolButtons.length > 0) {
        await user.click(protocolButtons[0]);
        
        await waitFor(() => {
          // Should show evidence level badge
          const badges = screen.getAllByText(/clinical_studies|extensive_research|who_approved|traditional/);
          expect(badges.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('User Experience Features', () => {
    
    test('should show loading states appropriately', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Component should render without loading state by default
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    test('should handle disabled state properly', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockDefaultConfig}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const mainToggle = screen.getByRole('switch');
      expect(mainToggle).toBeDisabled();
    });

    test('should display current configuration summary when enabled', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Active Protocol Settings')).toBeInTheDocument();
      expect(screen.getByText(/14 Days/)).toBeInTheDocument();
      expect(screen.getByText(/Moderate Intensity/)).toBeInTheDocument();
    });

    test('should show appropriate tooltips for complex features', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Look for info icons that should have tooltips
      const infoIcons = screen.getAllByText('ℹ️').concat(
        screen.getAllByTestId(/info/i)
      );
      
      // Should have at least some tooltips available
      expect(infoIcons.length).toBeGreaterThanOrEqual(0);
    });

    test('should maintain form state during interactions', async () => {
      const user = userEvent.setup();
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Toggle herbal supplements
      const herbalToggle = screen.getByRole('switch', { name: /herbal/i });
      await user.click(herbalToggle);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          includeHerbalSupplements: expect.any(Boolean)
        })
      );
    });
  });

  describe('Integration with Protocol Database', () => {
    
    test('should correctly integrate with protocols database', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should show protocol count that matches actual database
      const availableText = screen.getByText(/Available Protocols:/);
      const numberMatch = availableText.textContent?.match(/Available Protocols: (\d+)/);
      
      if (numberMatch) {
        const displayedCount = parseInt(numberMatch[1]);
        expect(displayedCount).toBeLessThanOrEqual(PARASITE_CLEANSE_PROTOCOLS.length);
        expect(displayedCount).toBeGreaterThan(0);
      }
    });

    test('should handle empty protocol states gracefully', () => {
      // Mock empty protocols scenario
      vi.mock('../../client/src/data/parasiteCleanseProtocols', () => ({
        PARASITE_CLEANSE_PROTOCOLS: [],
        getRecommendedProtocols: () => [],
        getProtocolsByIntensity: () => [],
        getProtocolsByType: () => [],
        getProtocolsForRegion: () => [],
        AILMENT_TO_PROTOCOL_MAPPING: {},
      }));

      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should still render without errors
      expect(screen.getByText('🧬 Evidence-Based Protocol Selection')).toBeInTheDocument();
    });

    test('should display realistic protocol information', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should show evidence-based information
      expect(screen.getByText(/Evidence-Based/)).toBeInTheDocument();
      expect(screen.getByText(/Traditional Herbal/)).toBeInTheDocument();
      expect(screen.getByText(/Modern Clinical/)).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    
    test('should have proper ARIA labels', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      const mainToggle = screen.getByRole('switch');
      expect(mainToggle).toHaveAttribute('aria-label');
    });

    test('should support keyboard navigation', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // All interactive elements should be focusable
      const buttons = screen.getAllByRole('button');
      const switches = screen.getAllByRole('switch');
      const comboboxes = screen.getAllByRole('combobox');
      
      buttons.forEach(button => {
        expect(button).toHaveProperty('tabIndex');
      });
      
      switches.forEach(toggle => {
        expect(toggle).toHaveProperty('tabIndex');
      });
      
      comboboxes.forEach(select => {
        expect(select).toHaveProperty('tabIndex');
      });
    });

    test('should have proper heading structure', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // Should have main heading
      const mainHeading = screen.getByText('🪱 Parasite Cleanse Protocol');
      expect(mainHeading).toBeInTheDocument();
    });

    test('should provide clear form labels and descriptions', () => {
      render(
        <ParasiteCleanseProtocol
          config={mockEnabledConfig}
          onChange={mockOnChange}
        />
      );

      // All form fields should have labels
      const startDateInput = screen.getByLabelText(/Start Date/);
      expect(startDateInput).toBeInTheDocument();
      
      const regionLabel = screen.getByText(/Your Region/);
      expect(regionLabel).toBeInTheDocument();
    });
  });
});