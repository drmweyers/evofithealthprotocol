/**
 * Specialized Ingredient Selector Component
 * 
 * Provides ingredient selection for specialized health protocols
 * including Longevity Mode and Parasite Cleanse protocols.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Search, 
  Leaf, 
  Shield, 
  AlertCircle,
  Plus,
  X,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface IngredientOption {
  id: string;
  name: string;
  category: 'longevity' | 'parasite-cleanse' | 'both';
  benefits: string[];
  description?: string;
  recommended?: boolean;
}

const SPECIALIZED_INGREDIENTS: IngredientOption[] = [
  // Longevity Mode Ingredients
  {
    id: 'turmeric',
    name: 'Turmeric',
    category: 'longevity',
    benefits: ['Anti-inflammatory', 'Antioxidant', 'Brain health'],
    description: 'Powerful anti-inflammatory spice with curcumin',
    recommended: true
  },
  {
    id: 'green-tea',
    name: 'Green Tea',
    category: 'longevity',
    benefits: ['Antioxidants', 'EGCG', 'Metabolism support'],
    description: 'Rich in catechins and polyphenols'
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    category: 'longevity',
    benefits: ['Anthocyanins', 'Brain health', 'Anti-aging'],
    description: 'High in antioxidants and phytonutrients',
    recommended: true
  },
  {
    id: 'salmon',
    name: 'Wild Salmon',
    category: 'longevity',
    benefits: ['Omega-3', 'Protein', 'Vitamin D'],
    description: 'Rich in omega-3 fatty acids'
  },
  {
    id: 'olive-oil',
    name: 'Extra Virgin Olive Oil',
    category: 'longevity',
    benefits: ['Healthy fats', 'Polyphenols', 'Heart health'],
    description: 'Mediterranean diet staple',
    recommended: true
  },
  
  // Parasite Cleanse Ingredients
  {
    id: 'garlic',
    name: 'Garlic',
    category: 'parasite-cleanse',
    benefits: ['Antimicrobial', 'Antiparasitic', 'Immune support'],
    description: 'Natural antimicrobial and antiparasitic properties',
    recommended: true
  },
  {
    id: 'pumpkin-seeds',
    name: 'Pumpkin Seeds',
    category: 'parasite-cleanse',
    benefits: ['Antiparasitic', 'Zinc', 'Magnesium'],
    description: 'Traditional antiparasitic food'
  },
  {
    id: 'papaya-seeds',
    name: 'Papaya Seeds',
    category: 'parasite-cleanse',
    benefits: ['Digestive enzymes', 'Antiparasitic', 'Gut health'],
    description: 'Contains papain enzyme'
  },
  {
    id: 'coconut',
    name: 'Coconut',
    category: 'parasite-cleanse',
    benefits: ['Lauric acid', 'Antimicrobial', 'MCT'],
    description: 'Contains lauric acid with antimicrobial properties',
    recommended: true
  },
  {
    id: 'oregano',
    name: 'Oregano',
    category: 'parasite-cleanse',
    benefits: ['Antimicrobial', 'Antifungal', 'Antiparasitic'],
    description: 'Powerful antimicrobial herb'
  },
  
  // Both Categories
  {
    id: 'ginger',
    name: 'Ginger',
    category: 'both',
    benefits: ['Anti-inflammatory', 'Digestive health', 'Antimicrobial'],
    description: 'Supports both longevity and cleansing',
    recommended: true
  },
  {
    id: 'apple-cider-vinegar',
    name: 'Apple Cider Vinegar',
    category: 'both',
    benefits: ['Digestive health', 'Blood sugar', 'Antimicrobial'],
    description: 'Fermented with beneficial properties'
  },
  {
    id: 'fermented-foods',
    name: 'Fermented Foods',
    category: 'both',
    benefits: ['Probiotics', 'Gut health', 'Immune support'],
    description: 'Kimchi, sauerkraut, kefir, etc.'
  }
];

interface SpecializedIngredientSelectorProps {
  selectedIngredients: string[];
  onSelectionChange: (ingredients: string[]) => void;
  protocolType: 'longevity' | 'parasite-cleanse' | 'both';
  maxSelections?: number;
  showCategories?: boolean;
  disabled?: boolean;
}

const SpecializedIngredientSelector: React.FC<SpecializedIngredientSelectorProps> = ({
  selectedIngredients,
  onSelectionChange,
  protocolType,
  maxSelections = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'longevity' | 'parasite-cleanse'>('all');

  const filteredIngredients = SPECIALIZED_INGREDIENTS.filter(ingredient => {
    // Filter by protocol type
    if (protocolType !== 'both' && ingredient.category !== 'both' && ingredient.category !== protocolType) {
      return false;
    }
    
    // Filter by active category
    if (activeCategory !== 'all' && ingredient.category !== 'both' && ingredient.category !== activeCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        ingredient.name.toLowerCase().includes(search) ||
        ingredient.benefits.some(b => b.toLowerCase().includes(search)) ||
        ingredient.description?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const handleIngredientToggle = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      onSelectionChange(selectedIngredients.filter(id => id !== ingredientId));
    } else if (selectedIngredients.length < maxSelections) {
      onSelectionChange([...selectedIngredients, ingredientId]);
    }
  };

  const handleSelectRecommended = () => {
    const recommended = SPECIALIZED_INGREDIENTS
      .filter(i => i.recommended && 
        (protocolType === 'both' || i.category === 'both' || i.category === protocolType))
      .map(i => i.id)
      .slice(0, maxSelections);
    onSelectionChange(recommended);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Specialized Ingredients
        </CardTitle>
        <CardDescription>
          Select ingredients to enhance your {protocolType === 'both' ? 'combined protocols' : protocolType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectRecommended}
              disabled={selectedIngredients.length >= maxSelections}
            >
              <Plus className="h-4 w-4 mr-1" />
              Recommended
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedIngredients.length === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        {protocolType === 'both' && (
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="longevity">Longevity</TabsTrigger>
              <TabsTrigger value="parasite-cleanse">Cleanse</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Selection Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Selected {selectedIngredients.length} of {maxSelections} ingredients.
            {selectedIngredients.length >= maxSelections && ' Maximum reached.'}
          </AlertDescription>
        </Alert>

        {/* Ingredients List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.includes(ingredient.id);
              const isDisabled = !isSelected && selectedIngredients.length >= maxSelections;
              
              return (
                <div
                  key={ingredient.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={ingredient.id}
                      checked={isSelected}
                      onCheckedChange={() => handleIngredientToggle(ingredient.id)}
                      disabled={isDisabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={ingredient.id}
                        className={`font-medium cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {ingredient.name}
                          {ingredient.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                          {ingredient.category !== 'both' && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                ingredient.category === 'longevity' 
                                  ? 'border-blue-500 text-blue-700' 
                                  : 'border-green-500 text-green-700'
                              }`}
                            >
                              {ingredient.category === 'longevity' ? 'Longevity' : 'Cleanse'}
                            </Badge>
                          )}
                        </div>
                      </Label>
                      {ingredient.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {ingredient.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ingredient.benefits.map((benefit, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No ingredients found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecializedIngredientSelector;