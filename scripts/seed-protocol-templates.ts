/**
 * Protocol Templates Seeder Script
 * 
 * Seeds the database with sample protocol templates for different health categories
 * and creates test customer data for the trainer.test@evofitmeals.com trainer.
 * 
 * Usage: npx tsx scripts/seed-protocol-templates.ts
 */

// Set up environment variables BEFORE any imports that require them
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

// Override DATABASE_URL to use the correct database name
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
process.env.NODE_ENV = 'development';

// Import dependencies
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { InsertProtocolTemplate, InsertUser } from '../shared/schema';

const BCRYPT_SALT_ROUNDS = 12;

// Protocol template data with comprehensive configurations
const templateData = [
  // Weight Loss Templates
  {
    name: "Beginner Weight Loss Protocol",
    description: "A gentle introduction to weight loss for newcomers, focusing on sustainable habits and moderate calorie reduction.",
    category: "weight_loss",
    templateType: "ailments_based",
    defaultDuration: 90, // 90 days
    defaultIntensity: "gentle",
    baseConfig: {
      calorieDeficit: 500,
      macroRatio: { protein: 25, carbs: 45, fat: 30 },
      exerciseFrequency: "3-4 times per week",
      supplementation: ["multivitamin", "omega-3"],
      restrictions: ["processed_foods", "sugary_drinks"],
      allowedFoods: ["lean_proteins", "vegetables", "fruits", "whole_grains"],
      hydrationGoal: "2.5L daily",
      sleepTarget: "7-8 hours"
    },
    targetAudience: ["beginners", "sedentary_lifestyle"],
    healthFocus: ["weight_management", "metabolism", "energy_levels"],
    tags: ["beginner-friendly", "sustainable", "moderate-deficit"]
  },
  {
    name: "Advanced Fat Loss Protocol",
    description: "Intensive fat loss protocol for experienced individuals with structured nutrition and training plans.",
    category: "weight_loss",
    templateType: "ailments_based",
    defaultDuration: 60,
    defaultIntensity: "intensive",
    baseConfig: {
      calorieDeficit: 750,
      macroRatio: { protein: 35, carbs: 25, fat: 40 },
      exerciseFrequency: "6 times per week",
      supplementation: ["whey_protein", "l_carnitine", "green_tea_extract", "multivitamin"],
      restrictions: ["refined_carbs", "processed_foods", "alcohol", "high_sodium_foods"],
      allowedFoods: ["lean_proteins", "fibrous_vegetables", "healthy_fats", "complex_carbs"],
      hydrationGoal: "3L daily",
      sleepTarget: "7-9 hours",
      intermittentFasting: "16:8",
      carbCycling: true
    },
    targetAudience: ["advanced", "experienced_dieters"],
    healthFocus: ["fat_loss", "muscle_preservation", "metabolic_flexibility"],
    tags: ["advanced", "intensive", "carb-cycling", "intermittent-fasting"]
  },

  // Muscle Gain Templates
  {
    name: "Lean Muscle Building Protocol",
    description: "Structured muscle building program with optimized nutrition for lean mass gains without excess fat.",
    category: "muscle_gain",
    templateType: "ailments_based",
    defaultDuration: 120,
    defaultIntensity: "moderate",
    baseConfig: {
      calorieSurplus: 300,
      macroRatio: { protein: 30, carbs: 40, fat: 30 },
      exerciseFrequency: "5-6 times per week",
      supplementation: ["whey_protein", "creatine", "multivitamin", "vitamin_d"],
      restrictions: ["excessive_cardio", "ultra_processed_foods"],
      allowedFoods: ["lean_proteins", "complex_carbs", "healthy_fats", "vegetables"],
      hydrationGoal: "3L daily",
      sleepTarget: "8-9 hours",
      mealFrequency: "5-6 meals daily",
      preWorkoutNutrition: true,
      postWorkoutNutrition: true
    },
    targetAudience: ["intermediate", "muscle_building_focused"],
    healthFocus: ["muscle_growth", "strength", "recovery"],
    tags: ["muscle-building", "lean-gains", "structured-nutrition"]
  },
  {
    name: "Hardgainer Mass Protocol",
    description: "High-calorie protocol designed for individuals who struggle to gain weight and muscle mass.",
    category: "muscle_gain",
    templateType: "ailments_based",
    defaultDuration: 150,
    defaultIntensity: "intensive",
    baseConfig: {
      calorieSurplus: 800,
      macroRatio: { protein: 25, carbs: 50, fat: 25 },
      exerciseFrequency: "4-5 times per week",
      supplementation: ["mass_gainer", "creatine", "digestive_enzymes", "multivitamin"],
      restrictions: ["excessive_cardio", "skipping_meals"],
      allowedFoods: ["all_proteins", "starchy_carbs", "nuts", "oils", "calorie_dense_foods"],
      hydrationGoal: "3.5L daily",
      sleepTarget: "8-10 hours",
      mealFrequency: "6-8 meals daily",
      liquidCalories: true
    },
    targetAudience: ["hardgainers", "underweight"],
    healthFocus: ["weight_gain", "muscle_mass", "digestive_health"],
    tags: ["hardgainer", "high-calorie", "frequent-meals"]
  },

  // General Wellness Templates
  {
    name: "Metabolic Health Optimization",
    description: "Comprehensive protocol focused on optimizing metabolic health, blood sugar regulation, and overall vitality.",
    category: "general",
    templateType: "ailments_based",
    defaultDuration: 120,
    defaultIntensity: "moderate",
    baseConfig: {
      nutritionFocus: "metabolic_health",
      macroRatio: { protein: 25, carbs: 35, fat: 40 },
      exerciseFrequency: "4-5 times per week",
      supplementation: ["omega_3", "magnesium", "vitamin_d", "chromium", "berberine"],
      restrictions: ["refined_sugars", "trans_fats", "processed_foods"],
      allowedFoods: ["whole_foods", "fiber_rich_vegetables", "lean_proteins", "healthy_fats"],
      hydrationGoal: "2.5L daily",
      sleepTarget: "7-9 hours",
      stressManagement: ["meditation", "yoga", "deep_breathing"],
      glucoseMonitoring: true
    },
    targetAudience: ["metabolic_syndrome", "prediabetes", "insulin_resistance"],
    healthFocus: ["metabolic_health", "blood_sugar", "inflammation"],
    tags: ["metabolic-health", "blood-sugar", "anti-inflammatory"]
  },
  {
    name: "Anti-Aging Longevity Protocol",
    description: "Evidence-based longevity protocol incorporating caloric restriction, antioxidants, and cellular health optimization.",
    category: "longevity",
    templateType: "longevity",
    defaultDuration: 180,
    defaultIntensity: "moderate",
    baseConfig: {
      caloricRestriction: 15,
      macroRatio: { protein: 25, carbs: 30, fat: 45 },
      exerciseFrequency: "5-6 times per week",
      supplementation: ["resveratrol", "nmn", "quercetin", "omega_3", "vitamin_d", "multivitamin"],
      restrictions: ["processed_foods", "excess_sugar", "trans_fats", "excessive_alcohol"],
      allowedFoods: ["antioxidant_rich_foods", "omega_3_fish", "cruciferous_vegetables", "berries"],
      hydrationGoal: "2.5L daily",
      sleepTarget: "7-8 hours",
      intermittentFasting: "14:10",
      stressManagement: ["meditation", "yoga"],
      periodicFasting: "monthly 24-hour fast"
    },
    targetAudience: ["health_conscious", "longevity_focused", "middle_aged"],
    healthFocus: ["longevity", "cellular_health", "cognitive_function"],
    tags: ["longevity", "anti-aging", "cellular-health", "caloric-restriction"]
  },

  // Cardiovascular Health Templates
  {
    name: "Heart Health Optimization Protocol",
    description: "Comprehensive cardiovascular health protocol focusing on heart disease prevention and arterial health.",
    category: "cardiovascular",
    templateType: "ailments_based",
    defaultDuration: 120,
    defaultIntensity: "moderate",
    baseConfig: {
      nutritionFocus: "cardiovascular_health",
      macroRatio: { protein: 20, carbs: 45, fat: 35 },
      exerciseFrequency: "5-6 times per week",
      supplementation: ["omega_3", "coq10", "magnesium", "potassium", "vitamin_k2"],
      restrictions: ["trans_fats", "excess_sodium", "refined_sugars", "processed_meats"],
      allowedFoods: ["fatty_fish", "nuts", "olive_oil", "vegetables", "whole_grains"],
      hydrationGoal: "2.5L daily",
      sleepTarget: "7-8 hours",
      stressManagement: ["meditation", "breathing_exercises"],
      bloodPressureMonitoring: true,
      cholesterolFocus: true
    },
    targetAudience: ["cardiovascular_risk", "hypertension", "high_cholesterol"],
    healthFocus: ["heart_health", "blood_pressure", "cholesterol"],
    tags: ["heart-health", "cardiovascular", "blood-pressure"]
  },

  // Detox Templates
  {
    name: "Gentle Detox Protocol",
    description: "Mild detoxification protocol supporting liver function and eliminating toxins through natural processes.",
    category: "detox",
    templateType: "ailments_based",
    defaultDuration: 30,
    defaultIntensity: "gentle",
    baseConfig: {
      detoxFocus: "liver_support",
      macroRatio: { protein: 20, carbs: 50, fat: 30 },
      exerciseFrequency: "3-4 times per week",
      supplementation: ["milk_thistle", "dandelion_root", "vitamin_c", "glutathione_support"],
      restrictions: ["alcohol", "processed_foods", "caffeine", "sugar"],
      allowedFoods: ["cruciferous_vegetables", "citrus_fruits", "green_tea", "fiber_rich_foods"],
      hydrationGoal: "3L daily",
      sleepTarget: "8-9 hours",
      saunaTherapy: "3 times per week",
      lymphaticDrainage: "dry_brushing"
    },
    targetAudience: ["detox_beginners", "liver_support_needed"],
    healthFocus: ["detoxification", "liver_health", "elimination"],
    tags: ["detox", "liver-support", "gentle-cleanse"]
  },

  // Parasite Cleanse Template
  {
    name: "Comprehensive Parasite Cleanse",
    description: "Systematic parasite elimination protocol using natural antimicrobials and gut health restoration.",
    category: "therapeutic",
    templateType: "parasite_cleanse",
    defaultDuration: 60,
    defaultIntensity: "intensive",
    baseConfig: {
      phases: [
        {
          name: "preparation",
          duration: 14,
          supplements: ["digestive_enzymes", "probiotics", "magnesium"]
        },
        {
          name: "elimination",
          duration: 30,
          supplements: ["wormwood", "black_walnut", "cloves", "oregano_oil", "garlic"]
        },
        {
          name: "restoration",
          duration: 16,
          supplements: ["probiotics", "l_glutamine", "zinc", "vitamin_d"]
        }
      ],
      dietaryRestrictions: ["sugar", "refined_carbs", "dairy", "gluten"],
      allowedFoods: ["anti_parasitic_herbs", "fiber_rich_vegetables", "coconut_oil", "pumpkin_seeds"],
      hydrationGoal: "3L daily",
      supplementation: ["comprehensive_parasite_formula", "probiotics", "digestive_support"],
      monitoring: ["stool_analysis", "symptom_tracking"]
    },
    targetAudience: ["parasite_symptoms", "digestive_issues", "immune_compromised"],
    healthFocus: ["parasite_elimination", "gut_health", "immune_system"],
    tags: ["parasite-cleanse", "gut-health", "antimicrobial", "three-phase"]
  },

  // Energy & Vitality Template
  {
    name: "Energy Enhancement Protocol",
    description: "Protocol designed to boost energy levels, combat fatigue, and enhance overall vitality.",
    category: "energy",
    templateType: "ailments_based",
    defaultDuration: 90,
    defaultIntensity: "moderate",
    baseConfig: {
      energyFocus: "mitochondrial_support",
      macroRatio: { protein: 25, carbs: 40, fat: 35 },
      exerciseFrequency: "4-5 times per week",
      supplementation: ["coq10", "b_complex", "iron", "vitamin_d", "adaptogenic_herbs"],
      restrictions: ["caffeine_excess", "refined_sugars", "alcohol"],
      allowedFoods: ["nutrient_dense_foods", "iron_rich_foods", "complex_carbs"],
      hydrationGoal: "2.5L daily",
      sleepTarget: "7-9 hours",
      stressManagement: ["adaptogenic_herbs", "meditation"],
      bloodWork: ["iron_panel", "thyroid_function", "b12_levels"]
    },
    targetAudience: ["chronic_fatigue", "low_energy", "adrenal_fatigue"],
    healthFocus: ["energy_levels", "mitochondrial_health", "adrenal_support"],
    tags: ["energy", "fatigue", "mitochondrial", "adaptogens"]
  }
];

// Test customers data for trainer.test@evofitmeals.com
const testCustomersData = [
  {
    email: 'customer1@test.com',
    name: 'Alice Johnson',
    password: 'Customer123!',
    role: 'customer'
  },
  {
    email: 'customer2@test.com',
    name: 'Bob Smith',
    password: 'Customer123!',
    role: 'customer'
  },
  {
    email: 'customer3@test.com',
    name: 'Carol Davis',
    password: 'Customer123!',
    role: 'customer'
  },
  {
    email: 'customer4@test.com',
    name: 'David Wilson',
    password: 'Customer123!',
    role: 'customer'
  },
  {
    email: 'customer5@test.com',
    name: 'Emma Brown',
    password: 'Customer123!',
    role: 'customer'
  }
];

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function createTestTrainer(db: any, users: any) {
  console.log('🧑‍🏫 Creating test trainer...');
  
  const trainerData = {
    email: 'trainer.test@evofitmeals.com',
    name: 'Test Trainer',
    password: 'Trainer123!',
    role: 'trainer'
  };
  
  try {
    // Check if trainer already exists
    const existingTrainer = await db.select()
      .from(users)
      .where(eq(users.email, trainerData.email))
      .limit(1);
    
    let trainerId;
    
    if (existingTrainer.length > 0) {
      console.log(`Trainer ${trainerData.email} already exists, updating...`);
      const hashedPassword = await hashPassword(trainerData.password);
      await db.update(users)
        .set({ 
          password: hashedPassword,
          name: trainerData.name,
          updatedAt: new Date()
        })
        .where(eq(users.email, trainerData.email));
      trainerId = existingTrainer[0].id;
    } else {
      console.log('Creating new trainer...');
      const hashedPassword = await hashPassword(trainerData.password);
      const [newTrainer] = await db.insert(users).values({
        email: trainerData.email,
        password: hashedPassword,
        role: trainerData.role,
        name: trainerData.name,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      trainerId = newTrainer.id;
    }
    
    console.log(`✅ Trainer created/updated: ${trainerData.email}`);
    return trainerId;
    
  } catch (error) {
    console.error('❌ Error creating trainer:', error);
    throw error;
  }
}

async function createTestCustomers(db: any, users: any, trainerId: string) {
  console.log('👥 Creating test customers...');
  
  try {
    const createdCustomers = [];
    
    for (const customerData of testCustomersData) {
      // Check if customer already exists
      const existingCustomer = await db.select()
        .from(users)
        .where(eq(users.email, customerData.email))
        .limit(1);
      
      let customerId;
      
      if (existingCustomer.length > 0) {
        console.log(`Customer ${customerData.email} already exists, updating...`);
        const hashedPassword = await hashPassword(customerData.password);
        await db.update(users)
          .set({ 
            password: hashedPassword,
            name: customerData.name,
            updatedAt: new Date()
          })
          .where(eq(users.email, customerData.email));
        customerId = existingCustomer[0].id;
      } else {
        console.log(`Creating customer: ${customerData.email}`);
        const hashedPassword = await hashPassword(customerData.password);
        const [newCustomer] = await db.insert(users).values({
          email: customerData.email,
          password: hashedPassword,
          role: customerData.role,
          name: customerData.name,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        customerId = newCustomer.id;
      }
      
      createdCustomers.push({
        id: customerId,
        email: customerData.email,
        name: customerData.name
      });
      
      console.log(`✅ Customer created/updated: ${customerData.email}`);
    }
    
    return createdCustomers;
    
  } catch (error) {
    console.error('❌ Error creating customers:', error);
    throw error;
  }
}

async function seedProtocolTemplates(db: any, protocolTemplates: any) {
  console.log('🌱 Seeding protocol templates...');
  
  try {
    for (const template of templateData) {
      // Check if template already exists (by name and category)
      const existing = await db.select()
        .from(protocolTemplates)
        .where(and(
          eq(protocolTemplates.name, template.name),
          eq(protocolTemplates.category, template.category)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`Template "${template.name}" already exists, updating...`);
        await db.update(protocolTemplates)
          .set({
            description: template.description,
            templateType: template.templateType,
            defaultDuration: template.defaultDuration,
            defaultIntensity: template.defaultIntensity,
            baseConfig: template.baseConfig,
            targetAudience: template.targetAudience,
            healthFocus: template.healthFocus,
            tags: template.tags,
            updatedAt: new Date()
          })
          .where(eq(protocolTemplates.id, existing[0].id));
      } else {
        console.log(`Creating template: "${template.name}"`);
        await db.insert(protocolTemplates).values({
          name: template.name,
          description: template.description,
          category: template.category,
          templateType: template.templateType,
          defaultDuration: template.defaultDuration,
          defaultIntensity: template.defaultIntensity,
          baseConfig: template.baseConfig,
          targetAudience: template.targetAudience || [],
          healthFocus: template.healthFocus || [],
          tags: template.tags || [],
          isActive: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log(`✅ Template processed: "${template.name}"`);
    }
    
    console.log('🎉 All protocol templates seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding protocol templates:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting protocol templates seeder...');
  console.log('='.repeat(50));
  
  try {
    // Dynamic imports to ensure environment variables are set first
    console.log('📦 Loading database connection and schema...');
    const { db } = await import('../server/db');
    const { protocolTemplates, users, customerInvitations } = await import('../shared/schema');
    
    console.log('✅ Database and schema loaded successfully');
    
    // Create test trainer
    const trainerId = await createTestTrainer(db, users);
    
    // Create test customers
    const customers = await createTestCustomers(db, users, trainerId);
    
    // Seed protocol templates
    await seedProtocolTemplates(db, protocolTemplates);
    
    console.log('='.repeat(50));
    console.log('🎉 Seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Protocol templates: ${templateData.length} processed`);
    console.log(`- Test trainer: trainer.test@evofitmeals.com`);
    console.log(`- Test customers: ${customers.length} created/updated`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('Trainer: trainer.test@evofitmeals.com / Trainer123!');
    customers.forEach((customer: any) => {
      console.log(`Customer: ${customer.email} / Customer123!`);
    });
    
    console.log('\n📊 Protocol Template Categories:');
    const categoryCounts = templateData.reduce((acc: any, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} templates`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Process interrupted. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Process terminated. Exiting gracefully...');
  process.exit(0);
});

// Run the seeder
main().then(() => {
  console.log('✨ Seeder process completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeder process failed:', error);
  process.exit(1);
});

export { main, seedProtocolTemplates, createTestTrainer, createTestCustomers };