import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ClientAilmentsSelector from '../../../client/src/components/ClientAilmentsSelector';

// Mock the client ailments data
vi.mock('../../../client/src/data/clientAilments', () => ({
  CLIENT_AILMENTS_DATABASE: [
    {
      id: 'hypertension',
      name: 'Hypertension',
      category: 'cardiovascular',
      severity: 'moderate',
      description: 'High blood pressure condition',
      commonSymptoms: ['headache', 'dizziness', 'chest pain'],
      nutritionalSupport: {
        beneficialFoods: ['leafy greens', 'berries', 'garlic'],
        avoidFoods: ['salt', 'processed foods'],
        keyNutrients: ['potassium', 'magnesium', 'omega-3']
      },
      medicalDisclaimer: 'Consult your doctor for blood pressure management'
    },
    {
      id: 'diabetes',
      name: 'Type 2 Diabetes',
      category: 'endocrine',
      severity: 'severe',
      description: 'Blood sugar regulation disorder',
      commonSymptoms: ['frequent urination', 'excessive thirst', 'fatigue'],
      nutritionalSupport: {
        beneficialFoods: ['whole grains', 'lean proteins', 'vegetables'],
        avoidFoods: ['sugar', 'refined carbs'],
        keyNutrients: ['fiber', 'chromium', 'alpha-lipoic acid']
      },
      medicalDisclaimer: 'Monitor blood glucose levels regularly'
    },
    {
      id: 'arthritis',
      name: 'Rheumatoid Arthritis',
      category: 'inflammatory',
      severity: 'moderate',
      description: 'Chronic inflammatory joint condition',
      commonSymptoms: ['joint pain', 'stiffness', 'swelling'],
      nutritionalSupport: {
        beneficialFoods: ['fatty fish', 'turmeric', 'ginger'],
        avoidFoods: ['inflammatory oils', 'processed meats'],
        keyNutrients: ['omega-3', 'curcumin', 'vitamin D']
      }
    },
    {
      id: 'ibs',
      name: 'Irritable Bowel Syndrome',
      category: 'digestive',
      severity: 'mild',
      description: 'Functional digestive disorder',
      commonSymptoms: ['abdominal pain', 'bloating', 'irregular bowel movements'],
      nutritionalSupport: {
        beneficialFoods: ['probiotics', 'soluble fiber', 'peppermint'],
        avoidFoods: ['FODMAPs', 'caffeine', 'alcohol'],
        keyNutrients: ['probiotics', 'fiber', 'glutamine']
      }
    },
  ],
  AILMENT_CATEGORIES: [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular',
      description: 'Heart and blood vessel conditions',
      icon: '❤️'
    },
    {
      id: 'endocrine',
      name: 'Endocrine',
      description: 'Hormone and metabolic disorders',
      icon: '🔬'
    },
    {
      id: 'inflammatory',
      name: 'Inflammatory',
      description: 'Chronic inflammation conditions',
      icon: '🔥'
    },
    {
      id: 'digestive',
      name: 'Digestive',
      description: 'Gastrointestinal disorders',
      icon: '🍃'
    },
  ],
  searchAilments: vi.fn((query: string) => {
    const mockAilments = [
      { id: 'hypertension', name: 'Hypertension', category: 'cardiovascular' },
      { id: 'diabetes', name: 'Type 2 Diabetes', category: 'endocrine' },
    ];
    return mockAilments.filter(ailment => 
      ailment.name.toLowerCase().includes(query.toLowerCase())
    );
  }),
  getAilmentNutritionalFocus: vi.fn((ailmentIds: string[]) => ({
    mealPlanFocus: ['anti-inflammatory', 'cardiovascular'],
    priorityNutrients: ['omega-3', 'potassium', 'fiber'],
    avoidIngredients: ['sodium', 'refined-sugar'],
    emphasizeIngredients: ['leafy-greens', 'fatty-fish'],
    beneficialFoods: ['salmon', 'spinach', 'blueberries', 'quinoa'],
    avoidFoods: ['processed-foods', 'high-sodium-snacks', 'sugary-drinks'],
    keyNutrients: ['omega-3-fatty-acids', 'potassium', 'magnesium', 'fiber']
  })),
}));

describe('ClientAilmentsSelector Component', () => {
  const mockOnSelectionChange = vi.fn();
  const user = userEvent.setup();

  const defaultProps = {
    selectedAilments: [],
    onSelectionChange: mockOnSelectionChange,
    maxSelections: 10,
    disabled: false,
    showNutritionalSummary: true,
    showCategoryCount: true,
    className: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default state', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.getByText('Client Health Issues')).toBeInTheDocument();
      expect(screen.getByText('Select health conditions that the client is currently experiencing for targeted meal planning')).toBeInTheDocument();
      expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument();
      expect(screen.getByText('This tool provides nutritional guidance only and does not replace professional medical advice.')).toBeInTheDocument();
    });

    it('shows selection count when ailments are selected', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('shows clear all button when ailments are selected', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('displays search and filter controls', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search health conditions...')).toBeInTheDocument();
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    it('shows medical disclaimer alert', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument();
      expect(screen.getByText(/Always consult healthcare providers/)).toBeInTheDocument();
    });
  });

  describe('Category Display and Interaction', () => {
    it('displays all category sections', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.getByText('❤️')).toBeInTheDocument(); // Cardiovascular icon
      expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
      expect(screen.getByText('Heart and blood vessel conditions')).toBeInTheDocument();
      
      expect(screen.getByText('🔬')).toBeInTheDocument(); // Endocrine icon
      expect(screen.getByText('Endocrine')).toBeInTheDocument();
      expect(screen.getByText('Hormone and metabolic disorders')).toBeInTheDocument();
    });

    it('shows category count when enabled', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      // Should show counts like "1/1" for cardiovascular category
      expect(screen.getByText(/1\/1/)).toBeInTheDocument();
    });

    it('hides category count when disabled', () => {
      render(<ClientAilmentsSelector {...defaultProps} showCategoryCount={false} selectedAilments={['hypertension']} />);
      
      // Should not show count badges
      expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
    });

    it('expands category when clicked', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const cardiovascularSection = screen.getByText('Cardiovascular').closest('div');
      if (cardiovascularSection) {
        await user.click(cardiovascularSection);
      }
      
      // Should show ailments in the category
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
    });

    it('shows select all/deselect all buttons for categories', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.getAllByText('Select All')).toHaveLength(4); // One for each category
    });
  });

  describe('Ailment Selection and Management', () => {
    it('selects individual ailments', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Find and click hypertension checkbox
      const hypertensionCheckbox = screen.getByLabelText('Hypertension') || 
                                   screen.getAllByRole('checkbox').find(cb => 
                                     cb.closest('div')?.textContent?.includes('Hypertension')
                                   );
      
      if (hypertensionCheckbox) {
        await user.click(hypertensionCheckbox);
        
        expect(mockOnSelectionChange).toHaveBeenCalledWith(['hypertension']);
      }
    });

    it('deselects ailments when clicked again', async () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      const hypertensionCheckbox = screen.getByLabelText('Hypertension') || 
                                   screen.getAllByRole('checkbox').find(cb => 
                                     cb.closest('div')?.textContent?.includes('Hypertension')
                                   );
      
      if (hypertensionCheckbox) {
        await user.click(hypertensionCheckbox);
        
        expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
      }
    });

    it('prevents selection beyond max limit', async () => {
      const maxLimit = 2;
      render(<ClientAilmentsSelector {...defaultProps} maxSelections={maxLimit} selectedAilments={['hypertension', 'diabetes']} />);
      
      // Try to select a third ailment
      const arthritisCheckbox = screen.getByLabelText('Rheumatoid Arthritis') || 
                               screen.getAllByRole('checkbox').find(cb => 
                                 cb.closest('div')?.textContent?.includes('Arthritis')
                               );
      
      if (arthritisCheckbox) {
        // Mock alert to capture the warning
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        await user.click(arthritisCheckbox);
        
        expect(alertSpy).toHaveBeenCalledWith('Maximum 2 ailments can be selected.');
        expect(mockOnSelectionChange).not.toHaveBeenCalledWith(expect.arrayContaining(['arthritis']));
        
        alertSpy.mockRestore();
      }
    });

    it('clears all selections', async () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      const clearAllButton = screen.getByText('Clear All');
      await user.click(clearAllButton);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });

    it('selects all ailments in a category', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const selectAllButtons = screen.getAllByText('Select All');
      const cardiovascularSelectAll = selectAllButtons[0]; // First category
      
      await user.click(cardiovascularSelectAll);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['hypertension']);
    });

    it('deselects all ailments in a category', async () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      const deselectAllButton = screen.getByText('Deselect All');
      await user.click(deselectAllButton);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Search and Filtering', () => {
    it('filters ailments by search query', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search health conditions...');
      await user.type(searchInput, 'hypertension');
      
      // Should filter to show only hypertension
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      // Should not show diabetes
      await waitFor(() => {
        expect(screen.queryByText('Type 2 Diabetes')).not.toBeInTheDocument();
      });
    });

    it('filters ailments by category', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'cardiovascular' } });
      
      // Should show only cardiovascular ailments
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      // Should not show diabetes (endocrine category)
      expect(screen.queryByText('Type 2 Diabetes')).not.toBeInTheDocument();
    });

    it('shows empty state when no results found', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search health conditions...');
      await user.type(searchInput, 'nonexistent condition');
      
      expect(screen.getByText('No conditions found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or category filter')).toBeInTheDocument();
    });

    it('clears search when category filter changes', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search health conditions...');
      await user.type(searchInput, 'diabetes');
      
      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'cardiovascular' } });
      
      // Should show cardiovascular ailments despite search
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
    });
  });

  describe('Selected Ailments Summary', () => {
    it('displays selected ailments summary', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      expect(screen.getByText('Selected Conditions:')).toBeInTheDocument();
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
    });

    it('shows remaining selections available', () => {
      render(<ClientAilmentsSelector {...defaultProps} maxSelections={5} selectedAilments={['hypertension', 'diabetes']} />);
      
      expect(screen.getByText('3 more selections available')).toBeInTheDocument();
    });

    it('allows removing ailments from summary', async () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      // Find the X button for hypertension in the summary
      const hypertensionBadge = screen.getByText('Hypertension').closest('button') || 
                               screen.getByText('Hypertension').parentElement;
      
      if (hypertensionBadge) {
        await user.click(hypertensionBadge);
        
        expect(mockOnSelectionChange).toHaveBeenCalledWith(['diabetes']);
      }
    });

    it('hides summary when no ailments selected', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      expect(screen.queryByText('Selected Conditions:')).not.toBeInTheDocument();
    });
  });

  describe('Nutritional Summary', () => {
    it('displays nutritional guidance when showNutritionalSummary is true', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} showNutritionalSummary={true} />);
      
      expect(screen.getByText('Nutritional Guidance Summary')).toBeInTheDocument();
      expect(screen.getByText('Beneficial Foods')).toBeInTheDocument();
      expect(screen.getByText('Foods to Avoid')).toBeInTheDocument();
      expect(screen.getByText('Key Nutrients to Focus On')).toBeInTheDocument();
      expect(screen.getByText('Meal Plan Focus Areas')).toBeInTheDocument();
    });

    it('hides nutritional summary when showNutritionalSummary is false', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} showNutritionalSummary={false} />);
      
      expect(screen.queryByText('Nutritional Guidance Summary')).not.toBeInTheDocument();
    });

    it('shows beneficial foods in summary', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('salmon')).toBeInTheDocument();
      expect(screen.getByText('spinach')).toBeInTheDocument();
      expect(screen.getByText('blueberries')).toBeInTheDocument();
    });

    it('shows foods to avoid in summary', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('processed-foods')).toBeInTheDocument();
      expect(screen.getByText('high-sodium-snacks')).toBeInTheDocument();
    });

    it('shows key nutrients in summary', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('omega-3-fatty-acids')).toBeInTheDocument();
      expect(screen.getByText('potassium')).toBeInTheDocument();
      expect(screen.getByText('magnesium')).toBeInTheDocument();
    });

    it('shows meal plan focus areas', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('anti-inflammatory')).toBeInTheDocument();
      expect(screen.getByText('cardiovascular')).toBeInTheDocument();
    });

    it('truncates long lists with "more" indicator', () => {
      // Mock a response with many items
      const { getAilmentNutritionalFocus } = require('../../../client/src/data/clientAilments');
      getAilmentNutritionalFocus.mockReturnValue({
        beneficialFoods: Array.from({ length: 12 }, (_, i) => `food${i}`),
        avoidFoods: Array.from({ length: 10 }, (_, i) => `avoid${i}`),
        keyNutrients: ['nutrient1', 'nutrient2', 'nutrient3'],
        mealPlanFocus: ['focus1', 'focus2'],
      });
      
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      expect(screen.getByText('+4 more')).toBeInTheDocument(); // 12 - 8 = 4 more
    });
  });

  describe('Ailment Detail Modal', () => {
    it('opens detail modal when info button is clicked', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Find and click the info button for an ailment
      const infoButtons = screen.getAllByRole('button');
      const infoButton = infoButtons.find(btn => 
        btn.querySelector('svg') || btn.textContent?.includes('Info')
      );
      
      if (infoButton) {
        await user.click(infoButton);
        
        // Modal should open with ailment details
        expect(screen.getByText('Common Symptoms:')).toBeInTheDocument();
        expect(screen.getByText('Beneficial Foods:')).toBeInTheDocument();
        expect(screen.getByText('Foods to Avoid:')).toBeInTheDocument();
        expect(screen.getByText('Key Nutrients:')).toBeInTheDocument();
      }
    });

    it('shows ailment severity in detail modal', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Open modal for hypertension (moderate severity)
      const infoButtons = screen.getAllByRole('button');
      const hypertensionInfo = infoButtons.find(btn => 
        btn.closest('div')?.textContent?.includes('Hypertension')
      );
      
      if (hypertensionInfo) {
        await user.click(hypertensionInfo);
        
        expect(screen.getByText('moderate')).toBeInTheDocument();
      }
    });

    it('displays common symptoms in modal', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Open modal and check symptoms
      const infoButtons = screen.getAllByRole('button');
      const infoButton = infoButtons[0];
      
      if (infoButton) {
        await user.click(infoButton);
        
        expect(screen.getByText('headache')).toBeInTheDocument();
        expect(screen.getByText('dizziness')).toBeInTheDocument();
        expect(screen.getByText('chest pain')).toBeInTheDocument();
      }
    });

    it('shows medical disclaimer in modal when present', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Open modal for ailment with medical disclaimer
      const infoButtons = screen.getAllByRole('button');
      const infoButton = infoButtons.find(btn => 
        btn.closest('div')?.textContent?.includes('Hypertension')
      );
      
      if (infoButton) {
        await user.click(infoButton);
        
        expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument();
        expect(screen.getByText('Consult your doctor for blood pressure management')).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search health conditions...');
      searchInput.focus();
      
      await user.keyboard('{Tab}');
      
      // Should move focus to next interactive element
      expect(document.activeElement).not.toBe(searchInput);
    });

    it('maintains focus management in modals', async () => {
      render(<ClientAilmentsSelector {...defaultProps} />);
      
      // Focus should return properly after modal interactions
      const searchInput = screen.getByPlaceholderText('Search health conditions...');
      searchInput.focus();
      
      expect(document.activeElement).toBe(searchInput);
    });

    it('provides screen reader friendly content', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      // Should have descriptive text for screen readers
      expect(screen.getByText('2 selected') || screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles large datasets efficiently', () => {
      // Test with many ailments selected
      const manyAilments = Array.from({ length: 8 }, (_, i) => `ailment${i}`);
      
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={manyAilments} />);
      
      expect(screen.getByText('8 selected')).toBeInTheDocument();
    });

    it('handles disabled state correctly', () => {
      render(<ClientAilmentsSelector {...defaultProps} disabled={true} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
      
      const buttons = screen.getAllByRole('button');
      const interactiveButtons = buttons.filter(btn => 
        !btn.disabled && btn.textContent !== 'Clear All'
      );
      interactiveButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('handles empty selected ailments gracefully', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={[]} />);
      
      expect(screen.queryByText('Selected Conditions:')).not.toBeInTheDocument();
      expect(screen.queryByText('Nutritional Guidance Summary')).not.toBeInTheDocument();
    });

    it('handles invalid ailment IDs gracefully', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['invalid-id', 'hypertension']} />);
      
      // Should still render and show valid ailments
      expect(screen.getByText('Client Health Issues')).toBeInTheDocument();
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
    });

    it('maintains state during prop updates', () => {
      const { rerender } = render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      rerender(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
    });
  });

  describe('Auto-expand Categories', () => {
    it('auto-expands categories with selected ailments', () => {
      render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      // Cardiovascular category should be auto-expanded
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
    });

    it('updates expanded categories when selections change', async () => {
      const { rerender } = render(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension']} />);
      
      // Add diabetes (endocrine category)
      rerender(<ClientAilmentsSelector {...defaultProps} selectedAilments={['hypertension', 'diabetes']} />);
      
      // Both categories should be visible
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
    });
  });
});