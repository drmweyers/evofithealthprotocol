/**
 * Evidence-Based Parasite Cleanse Protocols Database
 * Based on traditional medicine, clinical research, and integrative approaches
 * 
 * IMPORTANT: These protocols are for educational purposes only.
 * Always consult with a healthcare provider before starting any cleanse protocol.
 */

export interface ParasiteProtocol {
  id: string;
  name: string;
  category: 'traditional' | 'ayurvedic' | 'modern' | 'combination';
  targetParasites: string[];
  primaryHerbs: HerbDetail[];
  supportingHerbs: HerbDetail[];
  duration: {
    minimum: number; // days
    recommended: number; // days
    maximum: number; // days
  };
  intensity: 'gentle' | 'moderate' | 'intensive';
  ailmentTargets: string[];
  contraindications: string[];
  evidence: 'traditional' | 'anecdotal' | 'clinical_studies' | 'who_approved';
  description: string;
  protocol: ProtocolPhase[];
  effectiveness: {
    protozoa: number; // 0-100
    helminths: number; // 0-100
    flukes: number; // 0-100
  };
  sideEffects: string[];
  regionalAvailability: string[];
}

export interface HerbDetail {
  name: string;
  latinName: string;
  dosage: string;
  timing: string;
  activeCompounds: string[];
  mechanism: string;
  preparations: string[];
}

export interface ProtocolPhase {
  phase: number;
  name: string;
  duration: number; // days
  herbs: string[];
  dietaryRestrictions: string[];
  supportiveMeasures: string[];
  objective: string;
}

export const parasiteCleanseProtocols: ParasiteProtocol[] = [
  {
    id: 'traditional-triple',
    name: 'Traditional Triple Herb Protocol (Clark Protocol)',
    category: 'traditional',
    targetParasites: ['roundworms', 'pinworms', 'tapeworms', 'flukes'],
    primaryHerbs: [
      {
        name: 'Black Walnut Hull',
        latinName: 'Juglans nigra',
        dosage: '250-500mg',
        timing: '3x daily before meals',
        activeCompounds: ['juglone', 'tannins', 'iodine'],
        mechanism: 'Disrupts parasite metabolism and egg production',
        preparations: ['tincture', 'capsules', 'fresh hull extract']
      },
      {
        name: 'Wormwood',
        latinName: 'Artemisia absinthium',
        dosage: '200-400mg',
        timing: '2x daily with meals',
        activeCompounds: ['artemisinin', 'thujone', 'absinthin'],
        mechanism: 'Damages parasite cell membranes and nervous system',
        preparations: ['dried herb', 'tincture', 'capsules']
      },
      {
        name: 'Cloves',
        latinName: 'Syzygium aromaticum',
        dosage: '500mg',
        timing: '3x daily with meals',
        activeCompounds: ['eugenol', 'caryophyllene'],
        mechanism: 'Destroys parasite eggs and larvae',
        preparations: ['ground powder', 'oil', 'capsules']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 14,
      recommended: 30,
      maximum: 90
    },
    intensity: 'moderate',
    ailmentTargets: ['digestive_issues', 'bloating', 'fatigue', 'skin_problems'],
    contraindications: ['pregnancy', 'nursing', 'liver_disease', 'seizure_disorders'],
    evidence: 'traditional',
    description: 'The classic Dr. Hulda Clark protocol, used worldwide for comprehensive parasite cleansing',
    protocol: [
      {
        phase: 1,
        name: 'Initial Cleanse',
        duration: 14,
        herbs: ['Black Walnut Hull', 'Wormwood', 'Cloves'],
        dietaryRestrictions: ['no sugar', 'no processed foods', 'no alcohol'],
        supportiveMeasures: ['probiotics', 'fiber supplements', 'hydration'],
        objective: 'Eliminate adult parasites and begin egg destruction'
      },
      {
        phase: 2,
        name: 'Maintenance',
        duration: 16,
        herbs: ['Black Walnut Hull', 'Cloves'],
        dietaryRestrictions: ['limited sugar', 'whole foods diet'],
        supportiveMeasures: ['liver support', 'digestive enzymes'],
        objective: 'Prevent reinfection and support healing'
      }
    ],
    effectiveness: {
      protozoa: 60,
      helminths: 85,
      flukes: 70
    },
    sideEffects: ['die-off symptoms', 'nausea', 'headaches', 'fatigue'],
    regionalAvailability: ['north_america', 'europe', 'australia']
  },
  {
    id: 'ayurvedic-comprehensive',
    name: 'Ayurvedic Panchakarma-Inspired Protocol',
    category: 'ayurvedic',
    targetParasites: ['all_types'],
    primaryHerbs: [
      {
        name: 'Neem',
        latinName: 'Azadirachta indica',
        dosage: '500mg',
        timing: '2x daily on empty stomach',
        activeCompounds: ['azadirachtin', 'nimbin', 'nimbidin'],
        mechanism: 'Broad-spectrum antiparasitic with immunomodulation',
        preparations: ['leaf powder', 'extract', 'oil']
      },
      {
        name: 'Vidanga',
        latinName: 'Embelia ribes',
        dosage: '300mg',
        timing: '2x daily with warm water',
        activeCompounds: ['embelin', 'volatile oils'],
        mechanism: 'Specific for tapeworms and roundworms',
        preparations: ['powder', 'decoction']
      },
      {
        name: 'Kutki',
        latinName: 'Picrorhiza kurroa',
        dosage: '250mg',
        timing: '2x daily before meals',
        activeCompounds: ['kutkin', 'picroside'],
        mechanism: 'Hepatoprotective and antiparasitic',
        preparations: ['root powder', 'extract']
      }
    ],
    supportingHerbs: [
      {
        name: 'Triphala',
        latinName: 'Three fruit combination',
        dosage: '1000mg',
        timing: 'At bedtime',
        activeCompounds: ['tannins', 'gallic acid', 'chebulinic acid'],
        mechanism: 'Bowel cleansing and detoxification',
        preparations: ['powder', 'tablets']
      }
    ],
    duration: {
      minimum: 21,
      recommended: 45,
      maximum: 90
    },
    intensity: 'gentle',
    ailmentTargets: ['digestive_weakness', 'malabsorption', 'chronic_fatigue', 'immune_dysfunction'],
    contraindications: ['pregnancy', 'severe_debility', 'acute_illness'],
    evidence: 'traditional',
    description: 'Traditional Ayurvedic approach focusing on digestive fire and elimination',
    protocol: [
      {
        phase: 1,
        name: 'Preparation (Purvakarma)',
        duration: 7,
        herbs: ['Triphala', 'Ginger'],
        dietaryRestrictions: ['vegetarian', 'no cold foods', 'easy to digest'],
        supportiveMeasures: ['oil pulling', 'warm water', 'meditation'],
        objective: 'Prepare digestive system and loosen toxins'
      },
      {
        phase: 2,
        name: 'Main Cleanse (Pradhanakarma)',
        duration: 21,
        herbs: ['Neem', 'Vidanga', 'Kutki'],
        dietaryRestrictions: ['kitchari diet', 'no dairy', 'no meat'],
        supportiveMeasures: ['yoga', 'pranayama', 'castor oil packs'],
        objective: 'Eliminate parasites and toxins'
      },
      {
        phase: 3,
        name: 'Rejuvenation (Paschatkarma)',
        duration: 17,
        herbs: ['Ashwagandha', 'Guduchi', 'Triphala'],
        dietaryRestrictions: ['gradual food reintroduction'],
        supportiveMeasures: ['rasayana herbs', 'meditation'],
        objective: 'Rebuild strength and prevent reinfection'
      }
    ],
    effectiveness: {
      protozoa: 70,
      helminths: 75,
      flukes: 65
    },
    sideEffects: ['mild digestive upset', 'temporary weakness', 'detox symptoms'],
    regionalAvailability: ['india', 'asia', 'specialty_stores_worldwide']
  },
  {
    id: 'modern-berberine',
    name: 'Modern Berberine-Based Protocol',
    category: 'modern',
    targetParasites: ['giardia', 'blastocystis', 'entamoeba', 'cryptosporidium'],
    primaryHerbs: [
      {
        name: 'Berberine',
        latinName: 'Multiple sources',
        dosage: '500mg',
        timing: '3x daily with meals',
        activeCompounds: ['berberine HCl'],
        mechanism: 'Disrupts parasite DNA and energy metabolism',
        preparations: ['standardized extract', 'capsules']
      },
      {
        name: 'Oregano Oil',
        latinName: 'Origanum vulgare',
        dosage: '150mg',
        timing: '2x daily with meals',
        activeCompounds: ['carvacrol', 'thymol'],
        mechanism: 'Damages parasite cell walls',
        preparations: ['enteric-coated capsules', 'emulsified oil']
      },
      {
        name: 'Grapefruit Seed Extract',
        latinName: 'Citrus paradisi',
        dosage: '250mg',
        timing: '3x daily between meals',
        activeCompounds: ['flavonoids', 'limonoids'],
        mechanism: 'Broad-spectrum antimicrobial',
        preparations: ['liquid extract', 'capsules']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 10,
      recommended: 20,
      maximum: 30
    },
    intensity: 'moderate',
    ailmentTargets: ['traveler_diarrhea', 'IBS', 'SIBO', 'chronic_diarrhea'],
    contraindications: ['pregnancy', 'hypoglycemia', 'low_blood_pressure'],
    evidence: 'clinical_studies',
    description: 'Research-backed protocol using compounds with proven antiparasitic activity',
    protocol: [
      {
        phase: 1,
        name: 'Loading Phase',
        duration: 5,
        herbs: ['Berberine', 'Oregano Oil'],
        dietaryRestrictions: ['low sugar', 'no alcohol'],
        supportiveMeasures: ['probiotics 2 hours apart', 'electrolytes'],
        objective: 'Achieve therapeutic levels'
      },
      {
        phase: 2,
        name: 'Treatment Phase',
        duration: 15,
        herbs: ['Berberine', 'Oregano Oil', 'Grapefruit Seed Extract'],
        dietaryRestrictions: ['anti-parasitic diet', 'high fiber'],
        supportiveMeasures: ['S. boulardii', 'L-glutamine'],
        objective: 'Eliminate parasites and heal gut'
      }
    ],
    effectiveness: {
      protozoa: 90,
      helminths: 40,
      flukes: 30
    },
    sideEffects: ['digestive upset', 'headaches', 'temporary constipation'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'gentle-food-based',
    name: 'Gentle Food-Based Protocol',
    category: 'combination',
    targetParasites: ['general_prevention', 'mild_infections'],
    primaryHerbs: [
      {
        name: 'Pumpkin Seeds',
        latinName: 'Cucurbita pepo',
        dosage: '1 cup raw seeds',
        timing: 'Morning on empty stomach',
        activeCompounds: ['cucurbitacin', 'fatty acids'],
        mechanism: 'Paralyzes worms for easy elimination',
        preparations: ['raw seeds', 'seed butter', 'oil']
      },
      {
        name: 'Papaya Seeds',
        latinName: 'Carica papaya',
        dosage: '1 tablespoon',
        timing: 'With papaya fruit',
        activeCompounds: ['carpaine', 'benzyl isothiocyanate'],
        mechanism: 'Proteolytic enzymes digest worms',
        preparations: ['fresh seeds', 'dried powder']
      },
      {
        name: 'Garlic',
        latinName: 'Allium sativum',
        dosage: '3-4 cloves (3g)',
        timing: 'Throughout day with meals',
        activeCompounds: ['allicin', 'ajoene'],
        mechanism: 'Antimicrobial and immune boosting',
        preparations: ['fresh crushed', 'aged extract']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 7,
      recommended: 14,
      maximum: 30
    },
    intensity: 'gentle',
    ailmentTargets: ['mild_digestive_issues', 'prevention', 'children_safe'],
    contraindications: ['severe_allergies'],
    evidence: 'traditional',
    description: 'Safe, food-based approach suitable for sensitive individuals and children',
    protocol: [
      {
        phase: 1,
        name: 'Preparation',
        duration: 3,
        herbs: ['Garlic', 'Ginger'],
        dietaryRestrictions: ['reduce sugar', 'increase fiber'],
        supportiveMeasures: ['warm lemon water', 'rest'],
        objective: 'Prepare digestive system'
      },
      {
        phase: 2,
        name: 'Active Cleanse',
        duration: 11,
        herbs: ['Pumpkin Seeds', 'Papaya Seeds', 'Garlic'],
        dietaryRestrictions: ['whole foods', 'fermented foods'],
        supportiveMeasures: ['probiotics', 'coconut oil'],
        objective: 'Gentle parasite elimination'
      }
    ],
    effectiveness: {
      protozoa: 40,
      helminths: 60,
      flukes: 30
    },
    sideEffects: ['mild gas', 'garlic breath'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'artemisinin-clinical',
    name: 'Artemisinin Clinical Protocol',
    category: 'modern',
    targetParasites: ['malaria', 'babesia', 'toxoplasma', 'schistosomiasis'],
    primaryHerbs: [
      {
        name: 'Artemisinin',
        latinName: 'Artemisia annua extract',
        dosage: '200mg',
        timing: '2x daily, pulsed schedule',
        activeCompounds: ['artemisinin', 'dihydroartemisinin'],
        mechanism: 'Free radical damage to parasites',
        preparations: ['standardized extract', 'prescription forms']
      },
      {
        name: 'Sweet Wormwood',
        latinName: 'Artemisia annua',
        dosage: '500mg whole herb',
        timing: '3x daily with meals',
        activeCompounds: ['artemisinin', 'flavonoids', 'terpenoids'],
        mechanism: 'Synergistic antiparasitic effects',
        preparations: ['whole herb', 'tea', 'tincture']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 5,
      recommended: 10,
      maximum: 20
    },
    intensity: 'intensive',
    ailmentTargets: ['severe_parasitic_infections', 'treatment_resistant_cases'],
    contraindications: ['pregnancy', 'G6PD_deficiency', 'liver_disease'],
    evidence: 'who_approved',
    description: 'WHO-recognized treatment, Nobel Prize-winning discovery',
    protocol: [
      {
        phase: 1,
        name: 'Pulsed Treatment',
        duration: 10,
        herbs: ['Artemisinin', 'Sweet Wormwood'],
        dietaryRestrictions: ['no iron supplements', 'low iron foods during treatment'],
        supportiveMeasures: ['liver support', 'antioxidants'],
        objective: 'Maximum parasite elimination'
      }
    ],
    effectiveness: {
      protozoa: 95,
      helminths: 50,
      flukes: 70
    },
    sideEffects: ['nausea', 'dizziness', 'temporary anemia'],
    regionalAvailability: ['worldwide_with_prescription', 'specialty_suppliers']
  },
  {
    id: 'mimosa-pudica-protocol',
    name: 'Mimosa Pudica Seed Protocol',
    category: 'traditional',
    targetParasites: ['intestinal_worms', 'rope_worms', 'biofilm'],
    primaryHerbs: [
      {
        name: 'Mimosa Pudica Seed',
        latinName: 'Mimosa pudica',
        dosage: '1000mg',
        timing: '2x daily on empty stomach',
        activeCompounds: ['mimosine', 'mucilage', 'tannins'],
        mechanism: 'Binds to parasites and pulls them out',
        preparations: ['seed powder', 'capsules']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 30,
      recommended: 60,
      maximum: 90
    },
    intensity: 'gentle',
    ailmentTargets: ['chronic_constipation', 'biofilm_issues', 'gut_dysbiosis'],
    contraindications: ['intestinal_obstruction'],
    evidence: 'traditional',
    description: 'Gentle gut scrubber that binds and removes parasites',
    protocol: [
      {
        phase: 1,
        name: 'Gut Scrubbing',
        duration: 60,
        herbs: ['Mimosa Pudica Seed'],
        dietaryRestrictions: ['high fiber', 'adequate hydration'],
        supportiveMeasures: ['magnesium', 'vitamin C'],
        objective: 'Continuous gentle elimination'
      }
    ],
    effectiveness: {
      protozoa: 50,
      helminths: 70,
      flukes: 40
    },
    sideEffects: ['temporary constipation', 'bloating'],
    regionalAvailability: ['specialty_stores', 'online']
  },
  {
    id: 'diatomaceous-earth',
    name: 'Diatomaceous Earth Protocol',
    category: 'modern',
    targetParasites: ['intestinal_parasites', 'candida'],
    primaryHerbs: [
      {
        name: 'Diatomaceous Earth',
        latinName: 'Fossil shell flour',
        dosage: '1-2 teaspoons',
        timing: 'Morning in water',
        activeCompounds: ['silica', 'minerals'],
        mechanism: 'Mechanical damage to parasite exoskeletons',
        preparations: ['food grade powder']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 10,
      recommended: 30,
      maximum: 90
    },
    intensity: 'gentle',
    ailmentTargets: ['general_detox', 'heavy_metals', 'digestive_issues', 'bloating'],
    contraindications: ['respiratory_issues'],
    evidence: 'clinical_studies',
    description: 'Mechanical elimination through microscopic sharp edges',
    protocol: [
      {
        phase: 1,
        name: 'Gradual Introduction',
        duration: 30,
        herbs: ['Diatomaceous Earth'],
        dietaryRestrictions: ['plenty of water'],
        supportiveMeasures: ['electrolytes', 'minerals'],
        objective: 'Physical elimination of parasites'
      }
    ],
    effectiveness: {
      protozoa: 30,
      helminths: 60,
      flukes: 20
    },
    sideEffects: ['constipation if not enough water', 'dry skin'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'olive-leaf-protocol',
    name: 'Olive Leaf Extract Protocol',
    category: 'modern',
    targetParasites: ['viral_coinfections', 'bacterial_parasites', 'fungi'],
    primaryHerbs: [
      {
        name: 'Olive Leaf Extract',
        latinName: 'Olea europaea',
        dosage: '500mg (20% oleuropein)',
        timing: '3x daily with meals',
        activeCompounds: ['oleuropein', 'hydroxytyrosol'],
        mechanism: 'Disrupts pathogen replication',
        preparations: ['standardized extract', 'liquid']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 14,
      recommended: 30,
      maximum: 60
    },
    intensity: 'moderate',
    ailmentTargets: ['chronic_infections', 'immune_dysfunction'],
    contraindications: ['low_blood_pressure'],
    evidence: 'clinical_studies',
    description: 'Broad-spectrum antimicrobial with immune support',
    protocol: [
      {
        phase: 1,
        name: 'Antimicrobial Phase',
        duration: 30,
        herbs: ['Olive Leaf Extract'],
        dietaryRestrictions: ['Mediterranean diet'],
        supportiveMeasures: ['vitamin D', 'zinc'],
        objective: 'Eliminate pathogens and boost immunity'
      }
    ],
    effectiveness: {
      protozoa: 60,
      helminths: 40,
      flukes: 30
    },
    sideEffects: ['die-off reactions', 'temporary fatigue'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'turpentine-protocol',
    name: 'Traditional Turpentine Protocol',
    category: 'traditional',
    targetParasites: ['candida', 'biofilm', 'resistant_parasites'],
    primaryHerbs: [
      {
        name: 'Pure Gum Turpentine',
        latinName: 'Pinus palustris',
        dosage: '1/4 - 1 teaspoon',
        timing: 'With sugar cube, 2x weekly',
        activeCompounds: ['alpha-pinene', 'beta-pinene'],
        mechanism: 'Solvent action on biofilms',
        preparations: ['100% pure gum spirits']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 4,
      recommended: 8,
      maximum: 12
    },
    intensity: 'intensive',
    ailmentTargets: ['biofilm_infections', 'candida_overgrowth'],
    contraindications: ['kidney_disease', 'pregnancy', 'children'],
    evidence: 'traditional',
    description: 'Historical remedy requiring extreme caution',
    protocol: [
      {
        phase: 1,
        name: 'Careful Administration',
        duration: 8,
        herbs: ['Pure Gum Turpentine'],
        dietaryRestrictions: ['no alcohol', 'light diet'],
        supportiveMeasures: ['castor oil', 'activated charcoal'],
        objective: 'Biofilm disruption'
      }
    ],
    effectiveness: {
      protozoa: 70,
      helminths: 50,
      flukes: 40
    },
    sideEffects: ['nausea', 'kidney stress', 'dizziness'],
    regionalAvailability: ['specialty_suppliers']
  },
  {
    id: 'mebendazole-herbal-combo',
    name: 'Pharmaceutical-Herbal Combination',
    category: 'combination',
    targetParasites: ['pinworms', 'roundworms', 'hookworms', 'whipworms'],
    primaryHerbs: [
      {
        name: 'Pharmaceutical Support',
        latinName: 'With medical supervision',
        dosage: '200mg as prescribed',
        timing: 'Per medical guidance',
        activeCompounds: ['prescription medication'],
        mechanism: 'Inhibits glucose uptake in worms',
        preparations: ['prescription only']
      },
      {
        name: 'Milk Thistle',
        latinName: 'Silybum marianum',
        dosage: '300mg',
        timing: '3x daily',
        activeCompounds: ['silymarin'],
        mechanism: 'Liver protection during treatment',
        preparations: ['standardized extract']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 3,
      recommended: 7,
      maximum: 14
    },
    intensity: 'intensive',
    ailmentTargets: ['confirmed_parasitic_infections'],
    contraindications: ['pregnancy', 'liver_disease'],
    evidence: 'clinical_studies',
    description: 'Medical treatment with herbal liver support',
    protocol: [
      {
        phase: 1,
        name: 'Medical Treatment',
        duration: 7,
        herbs: ['Pharmaceutical Support', 'Milk Thistle'],
        dietaryRestrictions: ['as directed by physician'],
        supportiveMeasures: ['medical monitoring'],
        objective: 'Eliminate confirmed parasites'
      }
    ],
    effectiveness: {
      protozoa: 30,
      helminths: 95,
      flukes: 60
    },
    sideEffects: ['as per medication insert'],
    regionalAvailability: ['prescription_required']
  },
  {
    id: 'tribulus-terrestris',
    name: 'Tribulus Terrestris Protocol',
    category: 'ayurvedic',
    targetParasites: ['urinary_parasites', 'kidney_flukes'],
    primaryHerbs: [
      {
        name: 'Tribulus Terrestris',
        latinName: 'Tribulus terrestris',
        dosage: '500mg',
        timing: '2x daily',
        activeCompounds: ['saponins', 'flavonoids'],
        mechanism: 'Urinary tract cleansing',
        preparations: ['standardized extract', 'powder']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 14,
      recommended: 30,
      maximum: 45
    },
    intensity: 'gentle',
    ailmentTargets: ['UTI', 'kidney_stones', 'urinary_parasites'],
    contraindications: ['pregnancy', 'hormone_sensitive_conditions'],
    evidence: 'traditional',
    description: 'Specialized for urinary system parasites',
    protocol: [
      {
        phase: 1,
        name: 'Urinary Cleanse',
        duration: 30,
        herbs: ['Tribulus Terrestris'],
        dietaryRestrictions: ['increase water intake'],
        supportiveMeasures: ['cranberry extract', 'D-mannose'],
        objective: 'Clear urinary system'
      }
    ],
    effectiveness: {
      protozoa: 40,
      helminths: 30,
      flukes: 50
    },
    sideEffects: ['stomach upset', 'insomnia'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'goldenseal-barberry',
    name: 'Goldenseal-Barberry Protocol',
    category: 'traditional',
    targetParasites: ['giardia', 'entamoeba', 'bacterial_coinfections'],
    primaryHerbs: [
      {
        name: 'Goldenseal',
        latinName: 'Hydrastis canadensis',
        dosage: '250mg',
        timing: '3x daily',
        activeCompounds: ['berberine', 'hydrastine'],
        mechanism: 'Antimicrobial and mucous membrane healing',
        preparations: ['root extract', 'tincture']
      },
      {
        name: 'Barberry',
        latinName: 'Berberis vulgaris',
        dosage: '250mg',
        timing: '3x daily',
        activeCompounds: ['berberine', 'berbamine'],
        mechanism: 'Antiparasitic and liver support',
        preparations: ['bark extract', 'tincture']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 10,
      recommended: 20,
      maximum: 30
    },
    intensity: 'moderate',
    ailmentTargets: ['traveler_diarrhea', 'digestive_infections'],
    contraindications: ['pregnancy', 'hypertension'],
    evidence: 'clinical_studies',
    description: 'North American traditional remedy with proven efficacy',
    protocol: [
      {
        phase: 1,
        name: 'Antimicrobial Phase',
        duration: 20,
        herbs: ['Goldenseal', 'Barberry'],
        dietaryRestrictions: ['no dairy', 'no sugar'],
        supportiveMeasures: ['probiotics', 'glutamine'],
        objective: 'Eliminate pathogens'
      }
    ],
    effectiveness: {
      protozoa: 85,
      helminths: 45,
      flukes: 35
    },
    sideEffects: ['digestive upset', 'headaches'],
    regionalAvailability: ['north_america', 'europe']
  },
  {
    id: 'black-seed-protocol',
    name: 'Black Seed (Nigella Sativa) Protocol',
    category: 'traditional',
    targetParasites: ['tapeworms', 'roundworms', 'protozoa'],
    primaryHerbs: [
      {
        name: 'Black Seed',
        latinName: 'Nigella sativa',
        dosage: '1-2 teaspoons oil or 500mg extract',
        timing: '2x daily with meals',
        activeCompounds: ['thymoquinone', 'thymohydroquinone'],
        mechanism: 'Antiparasitic and immunomodulation',
        preparations: ['cold-pressed oil', 'seed powder', 'extract']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 14,
      recommended: 30,
      maximum: 60
    },
    intensity: 'gentle',
    ailmentTargets: ['immune_dysfunction', 'allergies', 'parasites'],
    contraindications: ['pregnancy', 'bleeding_disorders'],
    evidence: 'clinical_studies',
    description: 'The blessed seed with multiple health benefits',
    protocol: [
      {
        phase: 1,
        name: 'Immune Building',
        duration: 30,
        herbs: ['Black Seed'],
        dietaryRestrictions: ['anti-inflammatory diet'],
        supportiveMeasures: ['honey combination', 'vitamin D'],
        objective: 'Eliminate parasites while building immunity'
      }
    ],
    effectiveness: {
      protozoa: 65,
      helminths: 70,
      flukes: 50
    },
    sideEffects: ['mild nausea', 'allergic reactions rare'],
    regionalAvailability: ['middle_east', 'worldwide']
  },
  {
    id: 'pau-darco-protocol',
    name: 'Pau D\'Arco Amazonian Protocol',
    category: 'traditional',
    targetParasites: ['candida', 'parasites', 'viral_coinfections'],
    primaryHerbs: [
      {
        name: 'Pau D\'Arco',
        latinName: 'Tabebuia impetiginosa',
        dosage: '1-2g bark or 500mg extract',
        timing: '3x daily as tea or capsules',
        activeCompounds: ['lapachol', 'beta-lapachone'],
        mechanism: 'Antimicrobial and immune stimulation',
        preparations: ['inner bark tea', 'tincture', 'extract']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 14,
      recommended: 30,
      maximum: 45
    },
    intensity: 'moderate',
    ailmentTargets: ['candida_overgrowth', 'chronic_infections'],
    contraindications: ['blood_thinners', 'pregnancy'],
    evidence: 'traditional',
    description: 'Rainforest remedy with broad antimicrobial spectrum',
    protocol: [
      {
        phase: 1,
        name: 'Antimicrobial Phase',
        duration: 30,
        herbs: ['Pau D\'Arco'],
        dietaryRestrictions: ['no sugar', 'no yeast'],
        supportiveMeasures: ['probiotics', 'caprylic acid'],
        objective: 'Eliminate parasites and fungal overgrowth'
      }
    ],
    effectiveness: {
      protozoa: 55,
      helminths: 50,
      flukes: 40
    },
    sideEffects: ['nausea at high doses', 'dizziness'],
    regionalAvailability: ['south_america', 'specialty_stores']
  },
  {
    id: 'andrographis-protocol',
    name: 'Andrographis Immune Protocol',
    category: 'ayurvedic',
    targetParasites: ['bacterial_parasites', 'protozoa', 'liver_flukes'],
    primaryHerbs: [
      {
        name: 'Andrographis',
        latinName: 'Andrographis paniculata',
        dosage: '400mg standardized',
        timing: '3x daily before meals',
        activeCompounds: ['andrographolide', 'neoandrographolide'],
        mechanism: 'Immune enhancement and direct antimicrobial',
        preparations: ['standardized extract', 'whole herb']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 7,
      recommended: 14,
      maximum: 21
    },
    intensity: 'moderate',
    ailmentTargets: ['acute_infections', 'liver_parasites'],
    contraindications: ['pregnancy', 'autoimmune_diseases'],
    evidence: 'clinical_studies',
    description: 'King of bitters for acute parasitic infections',
    protocol: [
      {
        phase: 1,
        name: 'Acute Treatment',
        duration: 14,
        herbs: ['Andrographis'],
        dietaryRestrictions: ['light diet', 'no alcohol'],
        supportiveMeasures: ['rest', 'hydration'],
        objective: 'Rapid parasite elimination'
      }
    ],
    effectiveness: {
      protozoa: 75,
      helminths: 40,
      flukes: 65
    },
    sideEffects: ['bitter taste', 'GI upset', 'headache'],
    regionalAvailability: ['asia', 'specialty_stores']
  },
  {
    id: 'cat-claw-protocol',
    name: 'Cat\'s Claw Amazonian Protocol',
    category: 'traditional',
    targetParasites: ['intestinal_parasites', 'candida', 'bacteria'],
    primaryHerbs: [
      {
        name: 'Cat\'s Claw',
        latinName: 'Uncaria tomentosa',
        dosage: '500mg',
        timing: '2x daily',
        activeCompounds: ['pentacyclic oxindole alkaloids', 'glycosides'],
        mechanism: 'Immune modulation and antimicrobial',
        preparations: ['inner bark extract', 'tea', 'tincture']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 30,
      recommended: 60,
      maximum: 90
    },
    intensity: 'gentle',
    ailmentTargets: ['chronic_fatigue', 'autoimmune_issues', 'parasites'],
    contraindications: ['pregnancy', 'organ_transplant'],
    evidence: 'traditional',
    description: 'Sacred vine of the rainforest for deep immune support',
    protocol: [
      {
        phase: 1,
        name: 'Immune Restoration',
        duration: 60,
        herbs: ['Cat\'s Claw'],
        dietaryRestrictions: ['anti-inflammatory diet'],
        supportiveMeasures: ['meditation', 'stress reduction'],
        objective: 'Long-term immune building and parasite elimination'
      }
    ],
    effectiveness: {
      protozoa: 60,
      helminths: 55,
      flukes: 45
    },
    sideEffects: ['mild dizziness', 'diarrhea at high doses'],
    regionalAvailability: ['south_america', 'worldwide']
  },
  {
    id: 'thyme-protocol',
    name: 'Thyme Essential Oil Protocol',
    category: 'traditional',
    targetParasites: ['intestinal_worms', 'protozoa', 'fungi'],
    primaryHerbs: [
      {
        name: 'Thyme',
        latinName: 'Thymus vulgaris',
        dosage: '2-3 drops essential oil or 500mg herb',
        timing: '3x daily with meals',
        activeCompounds: ['thymol', 'carvacrol', 'linalool'],
        mechanism: 'Antimicrobial and anthelmintic',
        preparations: ['essential oil capsules', 'tea', 'tincture']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 10,
      recommended: 20,
      maximum: 30
    },
    intensity: 'moderate',
    ailmentTargets: ['digestive_issues', 'digestive_parasites', 'respiratory_infections'],
    contraindications: ['pregnancy', 'hypertension'],
    evidence: 'traditional',
    description: 'Mediterranean herb with potent antiparasitic properties',
    protocol: [
      {
        phase: 1,
        name: 'Antimicrobial Treatment',
        duration: 20,
        herbs: ['Thyme'],
        dietaryRestrictions: ['Mediterranean diet'],
        supportiveMeasures: ['probiotics', 'digestive enzymes'],
        objective: 'Eliminate parasites and support digestion'
      }
    ],
    effectiveness: {
      protozoa: 65,
      helminths: 60,
      flukes: 40
    },
    sideEffects: ['heartburn', 'skin sensitivity'],
    regionalAvailability: ['worldwide']
  },
  {
    id: 'tansy-protocol',
    name: 'Traditional Tansy Protocol',
    category: 'traditional',
    targetParasites: ['roundworms', 'pinworms', 'giardia'],
    primaryHerbs: [
      {
        name: 'Tansy',
        latinName: 'Tanacetum vulgare',
        dosage: '100-200mg',
        timing: '2x daily for 3 days only',
        activeCompounds: ['thujone', 'camphor', 'parthenolide'],
        mechanism: 'Neurotoxic to parasites',
        preparations: ['dried herb', 'tincture diluted']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 3,
      recommended: 3,
      maximum: 7
    },
    intensity: 'intensive',
    ailmentTargets: ['acute_worm_infections'],
    contraindications: ['pregnancy', 'children', 'seizure_disorders'],
    evidence: 'traditional',
    description: 'Powerful but potentially toxic - use with extreme caution',
    protocol: [
      {
        phase: 1,
        name: 'Short Intensive',
        duration: 3,
        herbs: ['Tansy'],
        dietaryRestrictions: ['light diet'],
        supportiveMeasures: ['activated charcoal', 'milk thistle'],
        objective: 'Rapid worm expulsion'
      }
    ],
    effectiveness: {
      protozoa: 60,
      helminths: 80,
      flukes: 50
    },
    sideEffects: ['nausea', 'vomiting', 'seizures at high doses'],
    regionalAvailability: ['europe', 'north_america']
  },
  {
    id: 'quassia-protocol',
    name: 'Quassia Wood Protocol',
    category: 'traditional',
    targetParasites: ['pinworms', 'threadworms', 'amoebas'],
    primaryHerbs: [
      {
        name: 'Quassia',
        latinName: 'Quassia amara',
        dosage: '250mg',
        timing: '3x daily before meals',
        activeCompounds: ['quassin', 'neoquassin'],
        mechanism: 'Toxic to parasites, stimulates digestion',
        preparations: ['wood chips tea', 'tincture', 'extract']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 7,
      recommended: 14,
      maximum: 21
    },
    intensity: 'moderate',
    ailmentTargets: ['pinworm_infections', 'poor_digestion'],
    contraindications: ['pregnancy', 'stomach_ulcers'],
    evidence: 'traditional',
    description: 'Bitter wood from the Amazon, specific for pinworms',
    protocol: [
      {
        phase: 1,
        name: 'Antiparasitic Phase',
        duration: 14,
        herbs: ['Quassia'],
        dietaryRestrictions: ['no sugar', 'high fiber'],
        supportiveMeasures: ['enemas for pinworms', 'hygiene measures'],
        objective: 'Eliminate threadworms and pinworms'
      }
    ],
    effectiveness: {
      protozoa: 55,
      helminths: 75,
      flukes: 35
    },
    sideEffects: ['nausea', 'stomach cramps'],
    regionalAvailability: ['central_america', 'specialty_stores']
  },
  {
    id: 'epazote-protocol',
    name: 'Mexican Epazote Protocol',
    category: 'traditional',
    targetParasites: ['intestinal_worms', 'amoebas', 'giardia'],
    primaryHerbs: [
      {
        name: 'Epazote',
        latinName: 'Dysphania ambrosioides',
        dosage: '1-2g herb or 5-10 drops oil',
        timing: '2x daily with meals',
        activeCompounds: ['ascaridole', 'limonene', 'p-cymene'],
        mechanism: 'Paralyzes and expels worms',
        preparations: ['fresh herb', 'tea', 'essential oil diluted']
      }
    ],
    supportingHerbs: [],
    duration: {
      minimum: 3,
      recommended: 7,
      maximum: 14
    },
    intensity: 'moderate',
    ailmentTargets: ['intestinal_worms', 'gas', 'bloating', 'digestive_issues'],
    contraindications: ['pregnancy', 'kidney_disease'],
    evidence: 'traditional',
    description: 'Traditional Mexican remedy for intestinal parasites',
    protocol: [
      {
        phase: 1,
        name: 'Worm Expulsion',
        duration: 7,
        herbs: ['Epazote'],
        dietaryRestrictions: ['beans with epazote', 'high fiber'],
        supportiveMeasures: ['pumpkin seeds', 'garlic'],
        objective: 'Traditional worm elimination'
      }
    ],
    effectiveness: {
      protozoa: 60,
      helminths: 70,
      flukes: 40
    },
    sideEffects: ['nausea', 'dizziness', 'headache'],
    regionalAvailability: ['mexico', 'central_america', 'specialty_stores']
  }
];

// Helper functions for protocol selection
export function getProtocolsByAilment(ailment: string | null | undefined): ParasiteProtocol[] {
  if (!ailment) return [];
  return parasiteCleanseProtocols.filter(protocol => 
    protocol.ailmentTargets.includes(ailment.toLowerCase())
  );
}

export function getProtocolsByIntensity(intensity: 'gentle' | 'moderate' | 'intensive'): ParasiteProtocol[] {
  return parasiteCleanseProtocols.filter(protocol => 
    protocol.intensity === intensity
  );
}

export function getProtocolsByEvidence(evidenceLevel: string): ParasiteProtocol[] {
  return parasiteCleanseProtocols.filter(protocol => 
    protocol.evidence === evidenceLevel
  );
}

export function getProtocolsByRegion(region: string): ParasiteProtocol[] {
  return parasiteCleanseProtocols.filter(protocol => 
    protocol.regionalAvailability.includes(region) || 
    protocol.regionalAvailability.includes('worldwide')
  );
}

export function getProtocolRecommendations(conditions: string[], region: string = 'worldwide'): {
  protocol: ParasiteProtocol;
  matchScore: number;
  reasoning: string;
}[] {
  const recommendations = parasiteCleanseProtocols
    .filter(protocol => 
      protocol.regionalAvailability.includes(region) || 
      protocol.regionalAvailability.includes('worldwide')
    )
    .map(protocol => {
      const matchingConditions = conditions.filter(condition => 
        protocol.ailmentTargets.includes(condition.toLowerCase())
      );
      
      const matchScore = (matchingConditions.length / conditions.length) * 100;
      
      const reasoning = matchingConditions.length > 0
        ? `Targets ${matchingConditions.join(', ')}`
        : 'General parasite cleanse protocol';
      
      return {
        protocol,
        matchScore,
        reasoning
      };
    })
    .filter(rec => rec.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}

// Export helper function for component usage
export function getProtocolById(id: string): ParasiteProtocol | undefined {
  return parasiteCleanseProtocols.find(protocol => protocol.id === id);
}