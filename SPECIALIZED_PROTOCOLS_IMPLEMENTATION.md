# Specialized Protocols Implementation Guide

**Document Type:** Technical Implementation Guide  
**Version:** 1.0  
**Created:** August 25, 2025  
**Purpose:** Detailed implementation guidance for Longevity Mode and Parasite Cleanse features  

---

## 1. Longevity (Anti-Aging) Feature Implementation

### 1.1 AI Prompt Engineering

#### Base Prompt Template for Longevity Mode
```
Generate a comprehensive longevity-focused meal plan with the following specifications:

CORE PRINCIPLES:
- Implement caloric restriction: {intensity_level} ({calorie_percentage} reduction from baseline)
- Eating window: {eating_window} hours (to support intermittent fasting)
- Focus on nutrient-dense, whole foods with anti-aging properties
- Minimize added sugars and ultra-processed items
- Prioritize plant-based meals with lean proteins and healthy fats

REQUIRED COMPONENTS:
1. Antioxidant-rich ingredients in every meal (berries, leafy greens, colorful vegetables)
2. Anti-inflammatory spices (turmeric, ginger, cinnamon)
3. Omega-3 sources (fish, walnuts, flax seeds)
4. Longevity-promoting beverages (green tea, herbal teas)

MEAL STRUCTURE:
- Breakfast: Within first 2 hours of eating window
- Lunch: Mid-day, substantial portion
- Dinner: Light, completed 3 hours before sleep
- Snacks: Only within eating window, focused on nuts/seeds

SPECIAL INSTRUCTIONS:
- Include brief explanations of why each ingredient supports longevity
- Suggest timing for optimal cellular repair
- Note any recommended supplements (resveratrol, omega-3, etc.)
- Provide lifestyle tips aligned with longevity (sleep, stress management)

USER PREFERENCES:
- Dietary restrictions: {dietary_restrictions}
- Cuisine preference: {cuisine_type}
- Region: {user_region}
```

#### Prompt Variables
- `intensity_level`: "mild" | "moderate" | "intensive"
- `calorie_percentage`: 5-10% (mild), 15-20% (moderate), 25-30% (intensive)
- `eating_window`: 8 | 10 | 12 hours
- `dietary_restrictions`: From user profile
- `cuisine_type`: From user preferences
- `user_region`: For ingredient availability

### 1.2 Frontend Implementation

#### Component Structure
```typescript
interface LongevityModeConfig {
  enabled: boolean;
  intensity: 'mild' | 'moderate' | 'intensive';
  strategies: {
    caloricRestriction: boolean;
    intermittentFasting: boolean;
    highAntioxidant: boolean;
    supplements: boolean;
  };
  eatingWindow: number; // 8, 10, or 12 hours
  startTime: string; // "08:00" format
}
```

#### UI Components

##### 1. Toggle Component
```tsx
<div className="longevity-mode-toggle">
  <Switch 
    id="longevity-mode"
    checked={longevityConfig.enabled}
    onCheckedChange={(checked) => updateLongevityMode(checked)}
  />
  <label htmlFor="longevity-mode" className="flex items-center gap-2">
    <Hourglass className="w-4 h-4" />
    Longevity Mode (Anti-Aging)
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Optimizes meal plans for healthy aging through caloric restriction,
          intermittent fasting, and nutrient-dense foods</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </label>
</div>
```

##### 2. Strategy Selector
```tsx
<div className="longevity-strategies">
  <h4>Longevity Focus Options</h4>
  <div className="space-y-2">
    <Checkbox 
      id="caloric-restriction"
      checked={strategies.caloricRestriction}
      onCheckedChange={(checked) => updateStrategy('caloricRestriction', checked)}
    />
    <label htmlFor="caloric-restriction">Caloric Restriction</label>
    
    <Checkbox 
      id="intermittent-fasting"
      checked={strategies.intermittentFasting}
      onCheckedChange={(checked) => updateStrategy('intermittentFasting', checked)}
    />
    <label htmlFor="intermittent-fasting">Intermittent Fasting</label>
    
    <Checkbox 
      id="high-antioxidant"
      checked={strategies.highAntioxidant}
      onCheckedChange={(checked) => updateStrategy('highAntioxidant', checked)}
    />
    <label htmlFor="high-antioxidant">High Antioxidant Focus</label>
    
    <Checkbox 
      id="supplements"
      checked={strategies.supplements}
      onCheckedChange={(checked) => updateStrategy('supplements', checked)}
    />
    <label htmlFor="supplements">Include Supplement Recommendations</label>
  </div>
</div>
```

##### 3. Intensity Selector
```tsx
<div className="intensity-selector">
  <label>Calorie Restriction Level</label>
  <RadioGroup value={intensity} onValueChange={setIntensity}>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="mild" id="mild" />
      <label htmlFor="mild">Mild (5-10% reduction)</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="moderate" id="moderate" />
      <label htmlFor="moderate">Moderate (15-20% reduction)</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="intensive" id="intensive" />
      <label htmlFor="intensive">Intensive (25-30% reduction)</label>
    </div>
  </RadioGroup>
</div>
```

### 1.3 Key Longevity Ingredients Database

```javascript
const LONGEVITY_INGREDIENTS = {
  antioxidants: {
    fruits: ['blueberries', 'pomegranate', 'acai', 'goji berries', 'raspberries', 'blackberries'],
    vegetables: ['kale', 'spinach', 'broccoli', 'brussels sprouts', 'red cabbage', 'beets'],
    beverages: ['green tea', 'matcha', 'oolong tea', 'white tea']
  },
  antiInflammatory: {
    spices: ['turmeric', 'ginger', 'cinnamon', 'cayenne', 'black pepper', 'garlic'],
    oils: ['extra virgin olive oil', 'avocado oil', 'flaxseed oil']
  },
  omega3Sources: ['salmon', 'mackerel', 'sardines', 'walnuts', 'chia seeds', 'flax seeds'],
  supplements: [
    { name: 'resveratrol', dosage: '150-500mg', timing: 'with breakfast' },
    { name: 'omega-3', dosage: '1-2g EPA/DHA', timing: 'with meals' },
    { name: 'collagen', dosage: '10-20g', timing: 'morning or evening' },
    { name: 'NAD+ precursors', dosage: 'as directed', timing: 'morning' }
  ]
};
```

---

## 2. Parasite Cleanse Feature Implementation

### 2.1 AI Prompt Engineering

#### Base Prompt Template for Parasite Cleanse
```
Generate a comprehensive {duration}-day parasite cleanse protocol following these specifications:

PROTOCOL STRUCTURE:
1. Herbal supplement regimen (if enabled: {include_herbs})
2. Anti-parasitic foods in every meal
3. Strict dietary restrictions to create unfavorable environment for parasites

DIETARY RULES:
- ELIMINATE: All refined sugars, processed foods, alcohol, dairy
- MINIMIZE: High-glycemic fruits, grains, starchy vegetables
- EMPHASIZE: High-fiber foods, fermented foods, anti-parasitic ingredients

REQUIRED ANTI-PARASITIC FOODS:
- Daily inclusion: garlic, onions, pumpkin seeds
- Regular rotation: papaya seeds, coconut, ginger, turmeric
- Herbs/spices: cloves, oregano, thyme, wormwood (if available)

MEAL STRUCTURE:
- Morning: Light, cleansing foods (lemon water, green juice)
- Midday: Substantial meal with anti-parasitic ingredients
- Evening: Light, easy-to-digest foods
- Between meals: Herbal teas (if applicable)

HERBAL PROTOCOL (if enabled):
- Week 1-2: Initial cleanse phase
  - Wormwood: {wormwood_dosage}
  - Black walnut: {blackwalnut_dosage}
  - Cloves: {clove_dosage}
- Week 3-4: Maintenance phase (reduced dosages)

OUTPUT FORMAT:
- Day-by-day protocol outline
- Specific meal recommendations with recipes
- Supplement timing chart
- Shopping list organized by category
- Safety notes and medical disclaimers

SAFETY NOTE: Include disclaimer about consulting healthcare provider for confirmed infections

USER CONTEXT:
- Region: {user_region} (for ingredient availability)
- Dietary restrictions: {dietary_restrictions}
- Intensity preference: {cleanse_intensity}
```

#### Prompt Variables
- `duration`: 7 | 14 | 30 | 90 days
- `include_herbs`: true | false
- `cleanse_intensity`: "gentle" | "moderate" | "intensive"
- `user_region`: For local ingredient availability

### 2.2 Frontend Implementation

#### Component Structure
```typescript
interface ParasiteCleanseConfig {
  enabled: boolean;
  duration: 7 | 14 | 30 | 90;
  includeHerbs: boolean;
  intensity: 'gentle' | 'moderate' | 'intensive';
  dietOnly: boolean;
  includeConventionalAdvice: boolean;
}
```

#### UI Components

##### 1. Cleanse Mode Toggle
```tsx
<div className="parasite-cleanse-toggle">
  <Switch 
    id="parasite-cleanse"
    checked={cleanseConfig.enabled}
    onCheckedChange={(checked) => updateCleanseMode(checked)}
  />
  <label htmlFor="parasite-cleanse" className="flex items-center gap-2">
    <Bug className="w-4 h-4" />
    Parasite Cleanse Protocol
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="w-3 h-3" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>Generates a specialized meal plan and protocol to support digestive 
          health and eliminate parasites. Includes anti-parasitic foods, herbs, 
          and dietary guidelines. Not a substitute for medical treatment.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </label>
</div>
```

##### 2. Duration Selector
```tsx
<div className="duration-selector">
  <label>Cleanse Duration</label>
  <Select value={duration} onValueChange={setDuration}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7">7 Days (Quick Cleanse)</SelectItem>
      <SelectItem value="14">14 Days (Standard)</SelectItem>
      <SelectItem value="30">30 Days (Thorough)</SelectItem>
      <SelectItem value="90">90 Days (Complete Protocol)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

##### 3. Approach Options
```tsx
<div className="approach-options space-y-2">
  <h4>Cleanse Options</h4>
  
  <div className="flex items-center space-x-2">
    <Checkbox 
      id="include-herbs"
      checked={includeHerbs}
      defaultChecked={true}
      onCheckedChange={setIncludeHerbs}
    />
    <label htmlFor="include-herbs">
      Include Herbal Supplement Regimen
    </label>
  </div>
  
  <div className="flex items-center space-x-2">
    <Checkbox 
      id="diet-only"
      checked={dietOnly}
      onCheckedChange={setDietOnly}
    />
    <label htmlFor="diet-only">
      Diet-Only Cleanse (No Supplements)
    </label>
  </div>
  
  <div className="flex items-center space-x-2">
    <Checkbox 
      id="conventional-advice"
      checked={includeConventionalAdvice}
      onCheckedChange={setIncludeConventionalAdvice}
    />
    <label htmlFor="conventional-advice">
      Include Conventional Medical Advice
    </label>
  </div>
</div>
```

### 2.3 Anti-Parasitic Foods & Herbs Database

```javascript
const ANTIPARASITIC_DATABASE = {
  foods: {
    primary: [
      { name: 'garlic', compounds: 'allicin, ajoene', usage: 'raw, 2-3 cloves daily' },
      { name: 'pumpkin seeds', compounds: 'cucurbitacin', usage: '1/4 cup daily' },
      { name: 'papaya seeds', compounds: 'carpaine', usage: '1 tsp ground daily' },
      { name: 'coconut', compounds: 'lauric acid', usage: '2-3 tbsp oil or fresh' }
    ],
    secondary: [
      'onions', 'ginger', 'turmeric', 'oregano', 'thyme', 'cloves',
      'cinnamon', 'cayenne pepper', 'black pepper', 'fennel seeds'
    ],
    supportive: [
      'fermented foods', 'apple cider vinegar', 'lemon', 'pineapple',
      'carrots', 'sweet potatoes', 'beets', 'cabbage'
    ]
  },
  herbs: {
    primary: [
      { 
        name: 'wormwood', 
        latin: 'Artemisia absinthium',
        dosage: '200-300mg', 
        duration: '2-4 weeks',
        contraindications: ['pregnancy', 'nursing', 'seizure disorders']
      },
      { 
        name: 'black walnut', 
        latin: 'Juglans nigra',
        dosage: '250-500mg hull extract', 
        duration: '2-4 weeks',
        contraindications: ['tree nut allergies']
      },
      { 
        name: 'cloves', 
        latin: 'Syzygium aromaticum',
        dosage: '500mg ground', 
        duration: '2-4 weeks',
        contraindications: ['blood thinning medications']
      }
    ],
    supportive: [
      'oregano oil', 'grapefruit seed extract', 'berberine', 
      'neem', 'pau d\'arco', 'goldenseal'
    ]
  },
  avoidFoods: [
    'refined sugars', 'artificial sweeteners', 'processed foods',
    'alcohol', 'dairy products', 'gluten (optional)', 'pork'
  ]
};
```

---

## 3. Global Audience Considerations

### 3.1 Localization Implementation

```typescript
interface LocalizationConfig {
  region: string;
  measurementSystem: 'metric' | 'imperial';
  availableIngredients: string[];
  culturalDietaryPreferences: string[];
  language: string;
}

const REGIONAL_ADAPTATIONS = {
  'north-america': {
    alternativeHerbs: {
      'wormwood': 'artemisia or mugwort',
      'neem': 'pau d\'arco or oregano oil'
    },
    commonStores: ['Whole Foods', 'health food stores', 'Amazon']
  },
  'europe': {
    alternativeHerbs: {
      'black walnut': 'green walnut tincture',
      'pau d\'arco': 'cat\'s claw'
    },
    commonStores: ['bio shops', 'pharmacies', 'herbalists']
  },
  'asia': {
    alternativeHerbs: {
      'wormwood': 'sweet wormwood (qing hao)',
      'black walnut': 'betel nut (controlled)'
    },
    commonStores: ['traditional medicine shops', 'wet markets']
  },
  'latin-america': {
    alternativeHerbs: {
      'black walnut': 'nogal negro',
      'cloves': 'clavo de olor'
    },
    commonStores: ['mercados', 'herbolarias']
  }
};
```

### 3.2 Cultural Dietary Adaptations

```javascript
const CULTURAL_ADAPTATIONS = {
  mediterranean: {
    longevity: {
      emphasis: ['olive oil', 'fish', 'legumes', 'red wine (moderate)'],
      meals: ['Greek salads', 'fish with herbs', 'legume stews']
    },
    cleanse: {
      emphasis: ['garlic', 'oregano', 'olive oil', 'lemon'],
      avoid: ['pasta', 'bread during cleanse']
    }
  },
  asian: {
    longevity: {
      emphasis: ['green tea', 'soy (fermented)', 'seaweed', 'mushrooms'],
      meals: ['miso soup', 'vegetable stir-fries', 'herbal teas']
    },
    cleanse: {
      emphasis: ['ginger', 'garlic', 'bitter melon', 'herbal soups'],
      avoid: ['white rice', 'sweet sauces']
    }
  },
  indian: {
    longevity: {
      emphasis: ['turmeric', 'dal', 'vegetables', 'spices'],
      meals: ['lentil dal', 'vegetable curries', 'kitchari']
    },
    cleanse: {
      emphasis: ['neem', 'turmeric', 'ginger', 'bitter foods'],
      avoid: ['dairy', 'heavy foods', 'sweets']
    }
  },
  'latin-american': {
    longevity: {
      emphasis: ['beans', 'avocado', 'cilantro', 'lime'],
      meals: ['bean soups', 'vegetable stews', 'fresh salsas']
    },
    cleanse: {
      emphasis: ['papaya', 'pumpkin seeds', 'epazote', 'garlic'],
      avoid: ['tortillas', 'cheese', 'fried foods']
    }
  }
};
```

### 3.3 UI Localization Components

```tsx
// Region Selector
<div className="region-selector">
  <label>Your Region (for ingredient availability)</label>
  <Select value={region} onValueChange={setRegion}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="north-america">North America</SelectItem>
      <SelectItem value="europe">Europe</SelectItem>
      <SelectItem value="asia">Asia</SelectItem>
      <SelectItem value="latin-america">Latin America</SelectItem>
      <SelectItem value="africa">Africa</SelectItem>
      <SelectItem value="oceania">Oceania</SelectItem>
    </SelectContent>
  </Select>
</div>

// Measurement System Toggle
<div className="measurement-toggle">
  <label>Measurement System</label>
  <RadioGroup value={measurementSystem} onValueChange={setMeasurementSystem}>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="metric" id="metric" />
      <label htmlFor="metric">Metric (g, ml, cm)</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="imperial" id="imperial" />
      <label htmlFor="imperial">Imperial (oz, cups, inches)</label>
    </div>
  </RadioGroup>
</div>
```

---

## 4. Implementation Checklist

### Backend Requirements
- [ ] Create specialized protocol API endpoints
- [ ] Implement prompt template system with variable substitution
- [ ] Add protocol validation logic
- [ ] Create ingredient availability checker by region
- [ ] Implement safety disclaimer system
- [ ] Add protocol versioning for updates

### Frontend Requirements
- [ ] Implement all UI components as specified
- [ ] Add state management for protocol configurations
- [ ] Create protocol preview functionality
- [ ] Implement progress tracking for cleanse protocols
- [ ] Add educational tooltips and modals
- [ ] Ensure mobile responsiveness

### Database Schema Updates
- [ ] Add `specialized_protocols` table
- [ ] Add `protocol_configurations` for user preferences
- [ ] Add `regional_ingredients` mapping table
- [ ] Add `protocol_progress` tracking table

### Testing Requirements
- [ ] Unit tests for prompt generation
- [ ] Integration tests for protocol creation
- [ ] UI tests for all new components
- [ ] Regional adaptation tests
- [ ] Safety disclaimer display tests

### Documentation Requirements
- [ ] API documentation for new endpoints
- [ ] User guide for specialized protocols
- [ ] Safety and medical disclaimer documentation
- [ ] Regional ingredient substitution guide

---

## 5. Safety and Compliance

### Medical Disclaimers
All protocol outputs must include:
```
IMPORTANT: This protocol is for educational purposes only and is not intended 
to diagnose, treat, cure, or prevent any disease. Consult with a qualified 
healthcare provider before beginning any cleanse or making significant dietary 
changes, especially if you have existing health conditions or take medications.
```

### Contraindication Warnings
System must check and warn for:
- Pregnancy and nursing
- Medication interactions
- Allergies (especially tree nuts for black walnut)
- Chronic health conditions
- Age restrictions (not for children)

---

_This implementation guide should be used in conjunction with the PRD and technical architecture documents._
