/**
 * Comprehensive Parasite Cleanse Protocols Database
 * 
 * Evidence-based parasite cleanse protocols targeting specific parasites and ailments.
 * Includes traditional herbal approaches, Ayurvedic methods, and modern integrative medicine.
 * 
 * Research Sources:
 * - Traditional herbal medicine databases
 * - Clinical studies on antiparasitic compounds
 * - Ayurvedic texts and modern research
 * - Integrative medicine protocols
 * - WHO antimalarial guidelines
 */

export interface ParasiteCleanseProtocol {
  id: string;
  name: string;
  type: 'traditional' | 'ayurvedic' | 'modern' | 'combination';
  description: string;
  targetParasites: string[];
  targetAilments: string[]; // Maps to clientAilments.ts IDs
  intensity: 'gentle' | 'moderate' | 'intensive';
  duration: {
    min: number;
    max: number;
    recommended: number;
  };
  phases: ProtocolPhase[];
  herbs: HerbComponent[];
  supportingSupplements: SupportingSupplement[];
  dietaryGuidelines: DietaryGuideline[];
  contraindications: string[];
  sideEffects: string[];
  monitoringRequirements: string[];
  evidenceLevel: 'traditional' | 'clinical_studies' | 'extensive_research' | 'who_approved';
  successRate?: string;
  regionalAvailability: {
    northAmerica: boolean;
    europe: boolean;
    asia: boolean;
    latinAmerica: boolean;
    africa: boolean;
  };
}

export interface ProtocolPhase {
  name: string;
  duration: number;
  description: string;
  objectives: string[];
  keyActions: string[];
}

export interface HerbComponent {
  name: string;
  latinName: string;
  activeCompounds: string[];
  mechanism: string;
  dosage: {
    amount: string;
    frequency: string;
    timing: string;
  };
  form: 'capsule' | 'tincture' | 'powder' | 'tea' | 'oil' | 'fresh';
  priority: 'primary' | 'secondary' | 'optional';
  evidenceLevel: string;
}

export interface SupportingSupplement {
  name: string;
  purpose: string;
  dosage: string;
  timing: string;
  optional: boolean;
}

export interface DietaryGuideline {
  category: 'include' | 'avoid' | 'limit';
  foods: string[];
  reasoning: string;
}

// Main protocols database
export const PARASITE_CLEANSE_PROTOCOLS: ParasiteCleanseProtocol[] = [
  {
    id: 'classic_triple_herb',
    name: 'Classic Triple Herb Protocol',
    type: 'traditional',
    description: 'The foundational Western herbal parasite cleanse using black walnut, wormwood, and cloves - targets all life stages of parasites',
    targetParasites: ['roundworms', 'pinworms', 'tapeworms', 'liver_flukes', 'candida'],
    targetAilments: ['bloating', 'chronic_fatigue', 'brain_fog', 'ibs'],
    intensity: 'moderate',
    duration: {
      min: 21,
      max: 42,
      recommended: 30
    },
    phases: [
      {
        name: 'Preparation Phase',
        duration: 7,
        description: 'Prepare digestive system and support liver function',
        objectives: ['Optimize digestion', 'Support liver detox', 'Begin biofilm disruption'],
        keyActions: ['Start digestive enzymes', 'Increase fiber gradually', 'Begin liver support herbs']
      },
      {
        name: 'Active Cleanse',
        duration: 21,
        description: 'Full antiparasitic herb protocol targeting all parasite life stages',
        objectives: ['Kill adult parasites', 'Eliminate larvae', 'Destroy eggs'],
        keyActions: ['Triple herb daily dosing', 'Monitor for die-off reactions', 'Support elimination']
      },
      {
        name: 'Restoration Phase',
        duration: 14,
        description: 'Restore gut health and prevent reinfection',
        objectives: ['Heal gut lining', 'Restore microbiome', 'Strengthen immunity'],
        keyActions: ['Probiotic recolonization', 'Gut healing nutrients', 'Immune support']
      }
    ],
    herbs: [
      {
        name: 'Black Walnut Hull',
        latinName: 'Juglans nigra',
        activeCompounds: ['Juglone', 'Tannins', 'Organic iodine'],
        mechanism: 'Oxygenates blood, kills adult parasites, antifungal properties',
        dosage: {
          amount: '500-1000mg',
          frequency: '2x daily',
          timing: 'Between meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'Traditional use + antimicrobial studies'
      },
      {
        name: 'Wormwood',
        latinName: 'Artemisia absinthium',
        activeCompounds: ['Artemisinin', 'Absinthin', 'Thujone'],
        mechanism: 'Disrupts parasite cell membranes, crosses blood-brain barrier',
        dosage: {
          amount: '200-300mg',
          frequency: '2x daily',
          timing: 'With meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'WHO-approved antimalarial compound'
      },
      {
        name: 'Cloves',
        latinName: 'Syzygium aromaticum',
        activeCompounds: ['Eugenol', 'Caryophyllene'],
        mechanism: 'Kills parasite eggs and larvae stages',
        dosage: {
          amount: '500mg ground',
          frequency: '3x daily',
          timing: 'With meals'
        },
        form: 'powder',
        priority: 'primary',
        evidenceLevel: 'Strong antimicrobial documentation'
      }
    ],
    supportingSupplements: [
      {
        name: 'Digestive Enzymes',
        purpose: 'Break down biofilms, improve nutrient absorption',
        dosage: '2-4 capsules with meals',
        timing: 'With each meal',
        optional: false
      },
      {
        name: 'Milk Thistle',
        purpose: 'Liver protection during detox',
        dosage: '200-400mg standardized extract',
        timing: '2x daily',
        optional: false
      },
      {
        name: 'Activated Charcoal',
        purpose: 'Bind toxins from parasite die-off',
        dosage: '500-1000mg',
        timing: '2 hours away from herbs/medications',
        optional: true
      }
    ],
    dietaryGuidelines: [
      {
        category: 'avoid',
        foods: ['Refined sugar', 'Processed foods', 'Alcohol', 'Dairy products', 'High-glycemic fruits'],
        reasoning: 'These foods feed parasites and promote inflammation'
      },
      {
        category: 'include',
        foods: ['Garlic', 'Onions', 'Pumpkin seeds', 'Papaya seeds', 'Coconut oil', 'Fermented vegetables'],
        reasoning: 'Natural antiparasitic properties and gut health support'
      }
    ],
    contraindications: [
      'Pregnancy and breastfeeding',
      'Seizure disorders (wormwood)',
      'Blood thinning medications (cloves)',
      'Tree nut allergies (black walnut)',
      'Severe liver disease'
    ],
    sideEffects: [
      'Herxheimer reaction (die-off symptoms)',
      'Digestive upset',
      'Headaches',
      'Fatigue',
      'Skin breakouts'
    ],
    monitoringRequirements: [
      'Weekly symptom assessment',
      'Liver function monitoring if history of liver issues',
      'Hydration status',
      'Bowel movement quality and frequency'
    ],
    evidenceLevel: 'extensive_research',
    successRate: '70-85% symptom improvement in traditional use',
    regionalAvailability: {
      northAmerica: true,
      europe: true,
      asia: false,
      latinAmerica: true,
      africa: false
    }
  },

  {
    id: 'ayurvedic_comprehensive',
    name: 'Ayurvedic Comprehensive Cleanse',
    type: 'ayurvedic',
    description: 'Traditional Ayurvedic approach using time-tested herbs for gentle yet effective parasite elimination',
    targetParasites: ['intestinal_worms', 'liver_parasites', 'blood_parasites'],
    targetAilments: ['digestive_disorders', 'liver_congestion', 'chronic_infections', 'bloating'],
    intensity: 'gentle',
    duration: {
      min: 14,
      max: 84,
      recommended: 30
    },
    phases: [
      {
        name: 'Ama Digestion (Toxin Clearing)',
        duration: 14,
        description: 'Clear accumulated toxins and strengthen digestive fire',
        objectives: ['Enhance digestion', 'Clear ama (toxins)', 'Balance doshas'],
        keyActions: ['Triphala for elimination', 'Digestive spices', 'Simple diet']
      },
      {
        name: 'Krimi Nashana (Parasite Destruction)',
        duration: 21,
        description: 'Active antiparasitic phase using traditional Ayurvedic herbs',
        objectives: ['Eliminate parasites', 'Support liver function', 'Maintain balance'],
        keyActions: ['Primary antiparasitic herbs', 'Liver support', 'Constitutional balancing']
      },
      {
        name: 'Rasayana (Rejuvenation)',
        duration: 21,
        description: 'Rejuvenate tissues and restore optimal health',
        objectives: ['Rebuild strength', 'Enhance immunity', 'Prevent reinfection'],
        keyActions: ['Rejuvenative herbs', 'Ojas building foods', 'Lifestyle optimization']
      }
    ],
    herbs: [
      {
        name: 'Vidanga',
        latinName: 'Embelia ribes',
        activeCompounds: ['Embelin', 'Christembine'],
        mechanism: 'Primary Ayurvedic anthelmintic, carminative properties',
        dosage: {
          amount: '1-2g powder',
          frequency: '2x daily',
          timing: 'Before meals'
        },
        form: 'powder',
        priority: 'primary',
        evidenceLevel: 'Classical texts + clinical studies'
      },
      {
        name: 'Neem',
        latinName: 'Azadirachta indica',
        activeCompounds: ['Azadirachtin', 'Nimbidin', 'Quercetin'],
        mechanism: 'Broad spectrum antimicrobial, immune enhancement',
        dosage: {
          amount: '500mg leaf extract',
          frequency: '2x daily',
          timing: 'With meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'Extensive modern research'
      },
      {
        name: 'Kutki',
        latinName: 'Picrorhiza kurroa',
        activeCompounds: ['Kutkoside', 'Picroside'],
        mechanism: 'Hepatoprotective, liver detoxification, choleretic action',
        dosage: {
          amount: '250-500mg extract',
          frequency: '2x daily',
          timing: 'After meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'Liver protective effects documented'
      },
      {
        name: 'Kalmegh',
        latinName: 'Andrographis paniculata',
        activeCompounds: ['Andrographolide'],
        mechanism: 'Antimicrobial, hepatoprotective, immune support',
        dosage: {
          amount: '400-800mg standardized',
          frequency: '2x daily',
          timing: 'With meals'
        },
        form: 'capsule',
        priority: 'secondary',
        evidenceLevel: 'Extensive clinical research'
      }
    ],
    supportingSupplements: [
      {
        name: 'Triphala',
        purpose: 'Digestive support, regularity, detoxification',
        dosage: '1-2g powder or 500-1000mg extract',
        timing: 'Before bed or morning empty stomach',
        optional: false
      },
      {
        name: 'Ashwagandha',
        purpose: 'Stress adaptation, immune support during cleanse',
        dosage: '300-500mg standardized extract',
        timing: '2x daily with meals',
        optional: true
      }
    ],
    dietaryGuidelines: [
      {
        category: 'include',
        foods: ['Kitchari', 'Cooked vegetables', 'Digestive spices', 'Herbal teas', 'Ghee (small amounts)'],
        reasoning: 'Easy to digest, supports agni (digestive fire), balances doshas'
      },
      {
        category: 'avoid',
        foods: ['Raw foods', 'Cold foods/drinks', 'Heavy/oily foods', 'Processed foods', 'Excessive sweet/sour'],
        reasoning: 'These can weaken digestion and create ama (toxins)'
      }
    ],
    contraindications: [
      'Pregnancy (especially neem)',
      'Autoimmune conditions (kalmegh)',
      'Hypoglycemia (kutki)',
      'Severe debility without supervision'
    ],
    sideEffects: [
      'Mild digestive upset initially',
      'Temporary fatigue as body adjusts',
      'Possible changes in bowel patterns'
    ],
    monitoringRequirements: [
      'Constitutional assessment',
      'Digestive strength monitoring',
      'Energy and sleep patterns',
      'Tongue and pulse examination'
    ],
    evidenceLevel: 'traditional',
    successRate: '60-80% improvement in traditional practice',
    regionalAvailability: {
      northAmerica: true,
      europe: true,
      asia: true,
      latinAmerica: false,
      africa: false
    }
  },

  {
    id: 'modern_integrative',
    name: 'Modern Integrative Protocol',
    type: 'modern',
    description: 'Science-based protocol using clinically researched compounds with proven antiparasitic activity',
    targetParasites: ['giardia', 'cryptosporidium', 'blastocystis', 'candida_overgrowth'],
    targetAilments: ['ibs', 'sibo', 'chronic_diarrhea', 'digestive_inflammation'],
    intensity: 'moderate',
    duration: {
      min: 14,
      max: 28,
      recommended: 21
    },
    phases: [
      {
        name: 'Biofilm Disruption',
        duration: 5,
        description: 'Break down protective biofilms harboring organisms',
        objectives: ['Disrupt biofilms', 'Enhance herb penetration', 'Prepare for elimination'],
        keyActions: ['Enzyme therapy', 'NAC supplementation', 'Lactoferrin']
      },
      {
        name: 'Active Treatment',
        duration: 14,
        description: 'Targeted antimicrobial therapy with research-backed compounds',
        objectives: ['Eliminate pathogens', 'Minimize resistance', 'Support gut barrier'],
        keyActions: ['Berberine complex', 'Oregano oil', 'Grapefruit seed extract']
      },
      {
        name: 'Microbiome Restoration',
        duration: 7,
        description: 'Rebuild healthy gut microbiome and barrier function',
        objectives: ['Restore beneficial bacteria', 'Heal gut lining', 'Prevent recolonization'],
        keyActions: ['Targeted probiotics', 'Prebiotic fiber', 'L-glutamine']
      }
    ],
    herbs: [
      {
        name: 'Berberine Complex',
        latinName: 'Berberis vulgaris (and others)',
        activeCompounds: ['Berberine HCl', 'Palmatine'],
        mechanism: 'Disrupts bacterial/parasitic cell walls, metabolic effects',
        dosage: {
          amount: '500mg',
          frequency: '3x daily',
          timing: '30 minutes before meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'Extensive clinical trials'
      },
      {
        name: 'Oregano Oil',
        latinName: 'Origanum vulgare',
        activeCompounds: ['Carvacrol', 'Thymol'],
        mechanism: 'Broad spectrum antimicrobial, biofilm disruption',
        dosage: {
          amount: '150-300mg standardized',
          frequency: '2x daily',
          timing: 'With meals'
        },
        form: 'capsule',
        priority: 'primary',
        evidenceLevel: 'Multiple antimicrobial studies'
      },
      {
        name: 'Grapefruit Seed Extract',
        latinName: 'Citrus paradisi',
        activeCompounds: ['Naringin', 'Limonene', 'Citric acid'],
        mechanism: 'Membrane disruption, broad antimicrobial activity',
        dosage: {
          amount: '100-200mg',
          frequency: '2-3x daily',
          timing: 'Between meals'
        },
        form: 'capsule',
        priority: 'secondary',
        evidenceLevel: 'Antimicrobial activity documented'
      }
    ],
    supportingSupplements: [
      {
        name: 'N-Acetylcysteine (NAC)',
        purpose: 'Biofilm disruption, antioxidant support',
        dosage: '600mg 2x daily',
        timing: 'Away from meals',
        optional: false
      },
      {
        name: 'Lactoferrin',
        purpose: 'Iron sequestration, antimicrobial support',
        dosage: '200-400mg',
        timing: 'Empty stomach',
        optional: true
      },
      {
        name: 'Saccharomyces boulardii',
        purpose: 'Competitive exclusion, gut barrier support',
        dosage: '5-10 billion CFU',
        timing: 'Away from antimicrobials',
        optional: false
      }
    ],
    dietaryGuidelines: [
      {
        category: 'avoid',
        foods: ['Simple sugars', 'Refined carbohydrates', 'Alcohol', 'High-iron foods during active phase'],
        reasoning: 'Reduces pathogen fuel sources and optimizes treatment'
      },
      {
        category: 'include',
        foods: ['Low-glycemic vegetables', 'Lean proteins', 'Healthy fats', 'Prebiotic fiber (after active phase)'],
        reasoning: 'Supports treatment efficacy and gut barrier function'
      }
    ],
    contraindications: [
      'Pregnancy and breastfeeding',
      'Diabetes medications (berberine interactions)',
      'Blood thinning medications',
      'Severe immunocompromised states'
    ],
    sideEffects: [
      'GI upset (especially initial days)',
      'Possible blood sugar changes (berberine)',
      'Herxheimer-like reactions',
      'Temporary digestive changes'
    ],
    monitoringRequirements: [
      'Blood glucose monitoring (if diabetic)',
      'Liver function (if history of issues)',
      'Symptom severity tracking',
      'Stool analysis pre/post treatment'
    ],
    evidenceLevel: 'clinical_studies',
    successRate: '75-90% in clinical studies for targeted pathogens',
    regionalAvailability: {
      northAmerica: true,
      europe: true,
      asia: true,
      latinAmerica: true,
      africa: true
    }
  },

  // Additional specialized protocols...
  {
    id: 'gentle_digestive_cleanse',
    name: 'Gentle Digestive Cleanse',
    type: 'combination',
    description: 'Mild approach suitable for sensitive individuals or those with existing digestive issues',
    targetParasites: ['mild_overgrowths', 'candida', 'minor_parasites'],
    targetAilments: ['bloating', 'mild_ibs', 'digestive_sensitivity'],
    intensity: 'gentle',
    duration: {
      min: 14,
      max: 42,
      recommended: 30
    },
    phases: [
      {
        name: 'Gentle Preparation',
        duration: 10,
        description: 'Very gradual preparation focusing on digestive support',
        objectives: ['Strengthen digestion', 'Reduce sensitivity', 'Gentle detox support'],
        keyActions: ['Digestive bitters', 'Gentle fiber increase', 'Stress reduction']
      },
      {
        name: 'Mild Cleansing',
        duration: 14,
        description: 'Gentle antiparasitic approach with minimal die-off reactions',
        objectives: ['Gradual organism reduction', 'Maintain comfort', 'Support elimination'],
        keyActions: ['Mild antiparasitic foods', 'Supportive herbs', 'Careful monitoring']
      },
      {
        name: 'Digestive Strengthening',
        duration: 16,
        description: 'Focus on rebuilding digestive strength and resilience',
        objectives: ['Strengthen digestion', 'Build tolerance', 'Prevent recurrence'],
        keyActions: ['Digestive support', 'Probiotic building', 'Stress management']
      }
    ],
    herbs: [
      {
        name: 'Garlic',
        latinName: 'Allium sativum',
        activeCompounds: ['Allicin', 'Ajoene'],
        mechanism: 'Gentle antimicrobial, immune support',
        dosage: {
          amount: '1-2 fresh cloves or 300mg extract',
          frequency: '2x daily',
          timing: 'With meals'
        },
        form: 'fresh',
        priority: 'primary',
        evidenceLevel: 'Broad research on antimicrobial activity'
      },
      {
        name: 'Ginger',
        latinName: 'Zingiber officinale',
        activeCompounds: ['Gingerol', 'Shogaol'],
        mechanism: 'Digestive support, mild antimicrobial, anti-nausea',
        dosage: {
          amount: '500mg extract or 1g fresh',
          frequency: '2-3x daily',
          timing: 'With meals'
        },
        form: 'fresh',
        priority: 'primary',
        evidenceLevel: 'Extensive digestive support research'
      },
      {
        name: 'Pumpkin Seeds',
        latinName: 'Cucurbita pepo',
        activeCompounds: ['Cucurbitacin'],
        mechanism: 'Gentle antiparasitic, nutrient dense',
        dosage: {
          amount: '25-30g raw seeds',
          frequency: 'Daily',
          timing: 'As snack or with meals'
        },
        form: 'fresh',
        priority: 'secondary',
        evidenceLevel: 'Traditional use + clinical studies'
      }
    ],
    supportingSupplements: [
      {
        name: 'Digestive Bitters',
        purpose: 'Stimulate digestive function, liver support',
        dosage: '10-15 drops in water',
        timing: '15 minutes before meals',
        optional: false
      },
      {
        name: 'Slippery Elm',
        purpose: 'Soothe digestive tract, protect gut lining',
        dosage: '1-2 tsp powder in water',
        timing: 'Between meals',
        optional: true
      }
    ],
    dietaryGuidelines: [
      {
        category: 'include',
        foods: ['Cooked vegetables', 'Bone broth', 'Herbal teas', 'Easily digestible proteins', 'Anti-parasitic spices'],
        reasoning: 'Gentle on digestion while providing natural antiparasitic compounds'
      },
      {
        category: 'avoid',
        foods: ['Raw foods (initially)', 'Cold foods', 'Difficult-to-digest foods', 'Excessive fiber initially'],
        reasoning: 'Prevents digestive stress during sensitive cleansing period'
      }
    ],
    contraindications: [
      'Severe digestive disorders without supervision',
      'Blood thinning medications (garlic)',
      'Gallbladder disease (bitter herbs)'
    ],
    sideEffects: [
      'Minimal due to gentle approach',
      'Possible mild digestive changes',
      'Temporary garlic breath/odor'
    ],
    monitoringRequirements: [
      'Daily comfort assessment',
      'Digestive function tracking',
      'Energy levels monitoring'
    ],
    evidenceLevel: 'traditional',
    successRate: '60-75% improvement with high tolerability',
    regionalAvailability: {
      northAmerica: true,
      europe: true,
      asia: true,
      latinAmerica: true,
      africa: true
    }
  }
];

// Protocol selection helper functions
export const getProtocolsForAilments = (ailmentIds: string[]): ParasiteCleanseProtocol[] => {
  return PARASITE_CLEANSE_PROTOCOLS.filter(protocol => 
    protocol.targetAilments.some(ailment => ailmentIds.includes(ailment))
  );
};

export const getProtocolsByIntensity = (intensity: 'gentle' | 'moderate' | 'intensive'): ParasiteCleanseProtocol[] => {
  return PARASITE_CLEANSE_PROTOCOLS.filter(protocol => protocol.intensity === intensity);
};

export const getProtocolsByType = (type: 'traditional' | 'ayurvedic' | 'modern' | 'combination'): ParasiteCleanseProtocol[] => {
  return PARASITE_CLEANSE_PROTOCOLS.filter(protocol => protocol.type === type);
};

export const getProtocolsForRegion = (region: keyof ParasiteCleanseProtocol['regionalAvailability']): ParasiteCleanseProtocol[] => {
  return PARASITE_CLEANSE_PROTOCOLS.filter(protocol => protocol.regionalAvailability[region]);
};

// Ailment mapping for protocol recommendations
export const AILMENT_TO_PROTOCOL_MAPPING: Record<string, string[]> = {
  'ibs': ['modern_integrative', 'gentle_digestive_cleanse'],
  'bloating': ['gentle_digestive_cleanse', 'ayurvedic_comprehensive'],
  'chronic_fatigue': ['classic_triple_herb', 'ayurvedic_comprehensive'],
  'brain_fog': ['classic_triple_herb', 'modern_integrative'],
  'constipation': ['ayurvedic_comprehensive', 'gentle_digestive_cleanse'],
  'acid_reflux': ['gentle_digestive_cleanse'],
  'liver_congestion': ['ayurvedic_comprehensive', 'classic_triple_herb'],
  'frequent_infections': ['ayurvedic_comprehensive', 'modern_integrative'],
  'skin_issues': ['classic_triple_herb', 'ayurvedic_comprehensive'],
  'digestive_general': ['gentle_digestive_cleanse', 'modern_integrative']
};

// Get recommended protocols based on selected ailments
export const getRecommendedProtocols = (ailmentIds: string[]): {
  protocol: ParasiteCleanseProtocol;
  matchScore: number;
  reasoning: string;
}[] => {
  const recommendations: Map<string, { protocol: ParasiteCleanseProtocol; matches: number; ailments: string[] }> = new Map();
  
  ailmentIds.forEach(ailmentId => {
    const protocolIds = AILMENT_TO_PROTOCOL_MAPPING[ailmentId] || [];
    protocolIds.forEach(protocolId => {
      const protocol = PARASITE_CLEANSE_PROTOCOLS.find(p => p.id === protocolId);
      if (protocol) {
        if (!recommendations.has(protocolId)) {
          recommendations.set(protocolId, {
            protocol,
            matches: 0,
            ailments: []
          });
        }
        const current = recommendations.get(protocolId)!;
        current.matches += 1;
        current.ailments.push(ailmentId);
      }
    });
  });
  
  return Array.from(recommendations.values())
    .map(({ protocol, matches, ailments }) => ({
      protocol,
      matchScore: Math.round((matches / ailmentIds.length) * 100),
      reasoning: `Matches ${matches}/${ailmentIds.length} selected conditions: ${ailments.join(', ')}`
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};

export default PARASITE_CLEANSE_PROTOCOLS;