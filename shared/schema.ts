/**
 * FitMeal Pro Database Schema
 *
 * This file defines the complete database schema for the FitMeal Pro application
 * using Drizzle ORM with PostgreSQL. It includes tables for user management,
 * recipe storage, and validation schemas for API endpoints.
 *
 * Key Components:
 * - Authentication tables (users, password_reset_tokens)
 * - Recipe management (recipes table with nutritional data)
 * - Type definitions and validation schemas
 * - Meal plan generation schemas
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "trainer",
  "customer",
]);

/**
 * Users Table
 *
 * Stores user profile information for authentication.
 *
 * Fields:
 * - id: Unique user identifier (UUID)
 * - email: User's email address (unique, not null)
 * - password: Hashed password
 * - role: User's role (admin, trainer, customer)
 * - createdAt/updatedAt: Automatic timestamps
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").unique().notNull(),
  password: text("password"), // Now optional for Google OAuth users
  role: userRoleEnum("role").default("customer").notNull(),
  googleId: varchar("google_id").unique(),
  name: varchar("name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Password Reset Tokens Table
 *
 * Stores tokens for the "forgot password" feature.
 *
 * Fields:
 * - id: Unique token identifier (UUID)
 * - user_id: Foreign key to the users table
 * - token: The reset token
 * - expires_at: Token expiration timestamp
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/**
 * Refresh Tokens Table
 *
 * Stores refresh tokens for persistent user sessions.
 *
 * Fields:
 * - id: Unique token identifier (UUID)
 * - user_id: Foreign key to the users table
 * - token: The refresh token
 * - expires_at: Token expiration timestamp
 */
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/**
 * Customer Invitation Tokens Table
 *
 * Stores invitation tokens that trainers send to customers.
 * Customers can use these tokens to register and automatically
 * be linked to the trainer who invited them.
 *
 * Fields:
 * - id: Unique token identifier (UUID)
 * - trainer_id: Foreign key to the trainer who sent the invitation
 * - customer_email: Email address of the invited customer
 * - token: Secure invitation token
 * - expires_at: Token expiration timestamp (typically 7 days)
 * - used_at: Timestamp when the invitation was used (null if unused)
 * - created_at: When the invitation was created
 */
export const customerInvitations = pgTable("customer_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type definitions for user operations
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

/**
 * Recipes Table
 *
 * Core table storing all recipe data including nutritional information,
 * cooking instructions, and metadata. Supports advanced filtering and
 * search capabilities for meal plan generation.
 *
 * Key Features:
 * - UUID primary keys for global uniqueness
 * - JSONB arrays for flexible tagging (meal types, dietary restrictions)
 * - Structured ingredient storage with amounts and units
 * - Comprehensive nutritional data (calories, macros)
 * - Approval workflow for content moderation
 * - Automatic timestamp management
 */
export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Flexible categorization using JSONB arrays
  mealTypes: jsonb("meal_types").$type<string[]>().default([]), // breakfast, lunch, dinner, snack
  dietaryTags: jsonb("dietary_tags").$type<string[]>().default([]), // vegan, keto, gluten-free, etc.
  mainIngredientTags: jsonb("main_ingredient_tags")
    .$type<string[]>()
    .default([]), // chicken, rice, etc.

  // Structured ingredient data with flexible units
  ingredientsJson: jsonb("ingredients_json")
    .$type<{ name: string; amount: string; unit?: string }[]>()
    .notNull(),

  // Cooking instructions as plain text (newline-separated steps)
  instructionsText: text("instructions_text").notNull(),

  // Time and serving information
  prepTimeMinutes: integer("prep_time_minutes").notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servings: integer("servings").notNull(),

  // Nutritional data (precision 5, scale 2 allows up to 999.99g)
  caloriesKcal: integer("calories_kcal").notNull(),
  proteinGrams: decimal("protein_grams", { precision: 5, scale: 2 }).notNull(),
  carbsGrams: decimal("carbs_grams", { precision: 5, scale: 2 }).notNull(),
  fatGrams: decimal("fat_grams", { precision: 5, scale: 2 }).notNull(),

  // Optional fields
  imageUrl: varchar("image_url", { length: 500 }), // Generated or uploaded images
  sourceReference: varchar("source_reference", { length: 255 }), // Attribution for imported recipes

  // Metadata and workflow
  creationTimestamp: timestamp("creation_timestamp").defaultNow(),
  lastUpdatedTimestamp: timestamp("last_updated_timestamp").defaultNow(),
  isApproved: boolean("is_approved").default(false), // Content moderation flag
});

export const personalizedRecipes = pgTable("personalized_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  recipeId: uuid("recipe_id")
    .references(() => recipes.id, { onDelete: "cascade" })
    .notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

/**
 * Personalized Meal Plans Table
 *
 * Stores meal plan assignments from trainers to customers.
 * Unlike recipes, meal plans are stored with their complete structure
 * as JSONB to preserve the exact meal plan generated at assignment time.
 */
export const personalizedMealPlans = pgTable("personalized_meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  mealPlanData: jsonb("meal_plan_data").$type<MealPlan>().notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

/**
 * Trainer Meal Plans Table
 *
 * Stores all meal plans generated by trainers, whether assigned or not.
 * This allows trainers to save, manage, and reuse meal plans.
 */
export const trainerMealPlans = pgTable("trainer_meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  mealPlanData: jsonb("meal_plan_data").$type<MealPlan>().notNull(),
  isTemplate: boolean("is_template").default(false), // Mark as reusable template
  tags: jsonb("tags").$type<string[]>().default([]), // For categorization
  notes: text("notes"), // Trainer's notes about the plan
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  trainerIdIdx: index("trainer_meal_plans_trainer_id_idx").on(table.trainerId),
}));

/**
 * Meal Plan Customer Assignments Table
 *
 * Tracks which saved meal plans have been assigned to which customers.
 * Allows reusing the same meal plan for multiple customers.
 */
export const mealPlanAssignments = pgTable("meal_plan_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealPlanId: uuid("meal_plan_id")
    .references(() => trainerMealPlans.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assignedBy: uuid("assigned_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"), // Assignment-specific notes
}, (table) => ({
  mealPlanIdx: index("meal_plan_assignments_meal_plan_id_idx").on(table.mealPlanId),
  customerIdx: index("meal_plan_assignments_customer_id_idx").on(table.customerId),
}));

/**
 * Recipe Validation Schemas
 *
 * These schemas provide runtime validation for recipe data coming from
 * API endpoints, ensuring data integrity and proper typing.
 */

// Schema for creating new recipes (excludes auto-generated fields)
export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  creationTimestamp: true,
  lastUpdatedTimestamp: true,
});

// Schema for updating existing recipes (all fields optional)
export const updateRecipeSchema = insertRecipeSchema.partial();

/**
 * Recipe Filter Schema
 *
 * Comprehensive filtering system for recipe search and meal plan generation.
 * Supports text search, categorical filters, nutritional ranges, and pagination.
 */
export const recipeFilterSchema = z.object({
  // Text-based search
  search: z.string().optional(), // Searches name and description

  // Categorical filters
  mealType: z.string().optional(), // Single meal type filter
  dietaryTag: z.string().optional(), // Single dietary restriction filter

  // Time-based filters
  maxPrepTime: z.number().optional(), // Maximum preparation time in minutes

  // Nutritional range filters
  maxCalories: z.number().optional(),
  minCalories: z.number().optional(),
  minProtein: z.number().optional(),
  maxProtein: z.number().optional(),
  minCarbs: z.number().optional(),
  maxCarbs: z.number().optional(),
  minFat: z.number().optional(),
  maxFat: z.number().optional(),

  // Ingredient-based filters
  includeIngredients: z.array(z.string()).optional(), // Must contain these ingredients
  excludeIngredients: z.array(z.string()).optional(), // Must not contain these ingredients

  // Pagination and admin controls
  page: z.number().default(1),
  limit: z.number().default(12),
  approved: z.boolean().optional(), // Filter by approval status (admin only)
});

// Type exports for use throughout the application
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type UpdateRecipe = z.infer<typeof updateRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type RecipeFilter = z.infer<typeof recipeFilterSchema>;

/**
 * Meal Plan Generation Schema
 *
 * Defines the input parameters for generating personalized meal plans.
 * Supports both basic requirements (calories, duration) and advanced
 * filtering for specific dietary needs and preferences.
 *
 * Used by the AI-powered meal plan generator and natural language parser.
 */
export const mealPlanGenerationSchema = z.object({
  // Basic meal plan information
  planName: z.string().min(1, "Plan name is required"),
  fitnessGoal: z.string().min(1, "Fitness goal is required"), // weight_loss, muscle_gain, etc.
  description: z.string().optional(),

  // Core parameters
  dailyCalorieTarget: z.number().min(800).max(5001), // Reasonable calorie range
  days: z.number().min(1).max(30), // Plan duration (1-30 days)
  mealsPerDay: z.number().min(1).max(6).default(3), // Typically 3-6 meals

  // Optional client information
  clientName: z.string().optional(), // For personal trainers/nutritionists

  // NEW FEATURES
  maxIngredients: z.number().min(5).max(50).optional(), // Limit ingredient variety across the entire plan
  generateMealPrep: z.boolean().default(true), // Whether to generate meal prep instructions

  // Recipe filtering constraints (inherited from recipeFilterSchema)
  mealType: z.string().optional(),
  dietaryTag: z.string().optional(),
  maxPrepTime: z.number().optional(),
  maxCalories: z.number().optional(),
  minCalories: z.number().optional(),
  minProtein: z.number().optional(),
  maxProtein: z.number().optional(),
  minCarbs: z.number().optional(),
  maxCarbs: z.number().optional(),
  minFat: z.number().optional(),
  maxFat: z.number().optional(),
});

export type MealPlanGeneration = z.infer<typeof mealPlanGenerationSchema>;

/**
 * Meal Plan Output Schema
 *
 * Defines the structure of generated meal plans returned by the API.
 * Includes complete meal scheduling with recipe assignments and
 * metadata for tracking and personalization.
 *
 * Note: This schema represents the generated output, not stored data.
 * Meal plans are generated on-demand and not persisted to the database.
 */
export const mealPlanSchema = z.object({
  // Plan metadata
  id: z.string(), // Temporary ID for the session
  planName: z.string(),
  fitnessGoal: z.string(),
  description: z.string().optional(),
  dailyCalorieTarget: z.number(),
  clientName: z.string().optional(),

  // Plan structure
  days: z.number(),
  mealsPerDay: z.number(),
  generatedBy: z.string(), // User ID who generated the plan
  createdAt: z.date(),

  // NEW FEATURE: Start of week meal prep instructions
  startOfWeekMealPrep: z.object({
    totalPrepTime: z.number(), // Estimated total prep time in minutes
    shoppingList: z.array(
      z.object({
        ingredient: z.string(),
        totalAmount: z.string(),
        unit: z.string(),
        usedInRecipes: z.array(z.string()), // Recipe names that use this ingredient
      })
    ),
    prepInstructions: z.array(
      z.object({
        step: z.number(),
        instruction: z.string(),
        estimatedTime: z.number(), // Time in minutes
        ingredients: z.array(z.string()), // Ingredients involved in this step
      })
    ),
    storageInstructions: z.array(
      z.object({
        ingredient: z.string(),
        method: z.string(), // How to store (refrigerate, freeze, pantry, etc.)
        duration: z.string(), // How long it will last
      })
    ),
  }).optional(),

  // Meal schedule with assigned recipes
  meals: z.array(
    z.object({
      day: z.number(), // Day 1, 2, 3, etc.
      mealNumber: z.number(), // Meal 1, 2, 3 within the day
      mealType: z.string(), // breakfast, lunch, dinner, snack

      // Complete recipe data for meal plan display
      recipe: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        caloriesKcal: z.number(),
        proteinGrams: z.string(), // Stored as string in database
        carbsGrams: z.string(),
        fatGrams: z.string(),
        prepTimeMinutes: z.number(),
        cookTimeMinutes: z.number().optional(),
        servings: z.number(),
        mealTypes: z.array(z.string()),
        dietaryTags: z.array(z.string()).optional(),
        mainIngredientTags: z.array(z.string()).optional(),
        ingredientsJson: z
          .array(
            z.object({
              name: z.string(),
              amount: z.string(),
              unit: z.string().optional(),
            }),
          )
          .optional(),
        instructionsText: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    }),
  ),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;

// Type definitions for meal plan assignment operations
export type InsertPersonalizedMealPlan = typeof personalizedMealPlans.$inferInsert;
export type PersonalizedMealPlan = typeof personalizedMealPlans.$inferSelect;

// Frontend-specific type that combines database record with nested meal plan data
export type CustomerMealPlan = PersonalizedMealPlan & {
  // Add flattened access to commonly used meal plan properties
  planName?: string;
  fitnessGoal?: string;
  dailyCalorieTarget?: number;
  totalDays?: number;
  mealsPerDay?: number;
  isActive?: boolean;
  description?: string;
};

// Type definitions for trainer meal plans
export type InsertTrainerMealPlan = typeof trainerMealPlans.$inferInsert;
export type TrainerMealPlan = typeof trainerMealPlans.$inferSelect;

// Type definitions for meal plan assignments
export type InsertMealPlanAssignment = typeof mealPlanAssignments.$inferInsert;
export type MealPlanAssignment = typeof mealPlanAssignments.$inferSelect;

// Extended type for trainer meal plans with assignment info
export type TrainerMealPlanWithAssignments = TrainerMealPlan & {
  assignments?: Array<{
    customerId: string;
    customerEmail: string;
    assignedAt: Date;
  }>;
  assignmentCount?: number;
};

// Type definitions for customer invitation operations
export type InsertCustomerInvitation = typeof customerInvitations.$inferInsert;
export type CustomerInvitation = typeof customerInvitations.$inferSelect;

/**
 * Customer Invitation Schema
 *
 * Validation schema for creating customer invitations.
 * Used when trainers send invitations to customers.
 */
export const createInvitationSchema = z.object({
  customerEmail: z.string().email('Invalid email format'),
  message: z.string().max(500).optional(), // Optional personal message from trainer
});

/**
 * Accept Invitation Schema
 *
 * Validation schema for customers accepting invitations.
 * Used during customer registration with invitation token.
 */
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

export type CreateInvitation = z.infer<typeof createInvitationSchema>;
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;

/**
 * Progress Measurements Table
 * 
 * Stores customer body measurements and weight tracking over time.
 * Allows customers to track their physical changes and progress.
 */
export const progressMeasurements = pgTable("progress_measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  measurementDate: timestamp("measurement_date").notNull(),
  
  // Weight tracking
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }), // Up to 999.99 kg
  weightLbs: decimal("weight_lbs", { precision: 6, scale: 2 }), // Up to 9999.99 lbs
  
  // Body measurements in centimeters
  neckCm: decimal("neck_cm", { precision: 4, scale: 1 }),
  shouldersCm: decimal("shoulders_cm", { precision: 5, scale: 1 }),
  chestCm: decimal("chest_cm", { precision: 5, scale: 1 }),
  waistCm: decimal("waist_cm", { precision: 5, scale: 1 }),
  hipsCm: decimal("hips_cm", { precision: 5, scale: 1 }),
  bicepLeftCm: decimal("bicep_left_cm", { precision: 4, scale: 1 }),
  bicepRightCm: decimal("bicep_right_cm", { precision: 4, scale: 1 }),
  thighLeftCm: decimal("thigh_left_cm", { precision: 4, scale: 1 }),
  thighRightCm: decimal("thigh_right_cm", { precision: 4, scale: 1 }),
  calfLeftCm: decimal("calf_left_cm", { precision: 4, scale: 1 }),
  calfRightCm: decimal("calf_right_cm", { precision: 4, scale: 1 }),
  
  // Body composition
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 1 }),
  muscleMassKg: decimal("muscle_mass_kg", { precision: 5, scale: 2 }),
  
  // Additional metrics
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  customerIdIdx: index("progress_measurements_customer_id_idx").on(table.customerId),
  measurementDateIdx: index("progress_measurements_date_idx").on(table.measurementDate),
}));

/**
 * Progress Photos Table
 * 
 * Stores progress photo metadata for visual tracking.
 * Actual images are stored in S3 or similar service.
 */
export const progressPhotos = pgTable("progress_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  photoDate: timestamp("photo_date").notNull(),
  photoUrl: text("photo_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  photoType: varchar("photo_type", { length: 50 }).notNull(), // front, side, back, other
  caption: text("caption"),
  isPrivate: boolean("is_private").default(true), // Customer privacy control
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  customerIdIdx: index("progress_photos_customer_id_idx").on(table.customerId),
  photoDateIdx: index("progress_photos_date_idx").on(table.photoDate),
}));

/**
 * Customer Goals Table
 * 
 * Stores fitness and health goals set by customers.
 * Supports various goal types with target dates and achievement tracking.
 */
export const customerGoals = pgTable("customer_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // weight_loss, muscle_gain, body_fat, performance
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Goal targets (flexible based on goal type)
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  targetUnit: varchar("target_unit", { length: 20 }), // kg, lbs, %, reps, minutes, etc.
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  startingValue: decimal("starting_value", { precision: 10, scale: 2 }),
  
  // Timeline
  startDate: timestamp("start_date").notNull(),
  targetDate: timestamp("target_date"),
  achievedDate: timestamp("achieved_date"),
  
  // Status tracking
  status: varchar("status", { length: 20 }).default("active"), // active, achieved, paused, abandoned
  progressPercentage: integer("progress_percentage").default(0),
  
  // Additional fields
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  customerIdIdx: index("customer_goals_customer_id_idx").on(table.customerId),
  statusIdx: index("customer_goals_status_idx").on(table.status),
}));

/**
 * Goal Milestones Table
 * 
 * Tracks milestone achievements within larger goals.
 * Allows breaking down big goals into smaller, achievable steps.
 */
export const goalMilestones = pgTable("goal_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id")
    .references(() => customerGoals.id, { onDelete: "cascade" })
    .notNull(),
  milestoneName: varchar("milestone_name", { length: 255 }).notNull(),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  achievedValue: decimal("achieved_value", { precision: 10, scale: 2 }),
  achievedDate: timestamp("achieved_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  goalIdIdx: index("goal_milestones_goal_id_idx").on(table.goalId),
}));

// Type exports for progress tracking
export type InsertProgressMeasurement = typeof progressMeasurements.$inferInsert;
export type ProgressMeasurement = typeof progressMeasurements.$inferSelect;

export type InsertProgressPhoto = typeof progressPhotos.$inferInsert;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;

export type InsertCustomerGoal = typeof customerGoals.$inferInsert;
export type CustomerGoal = typeof customerGoals.$inferSelect;

export type InsertGoalMilestone = typeof goalMilestones.$inferInsert;
export type GoalMilestone = typeof goalMilestones.$inferSelect;

// Validation schemas for progress tracking
export const createMeasurementSchema = z.object({
  measurementDate: z.string().datetime(),
  weightKg: z.number().optional(),
  weightLbs: z.number().optional(),
  neckCm: z.number().optional(),
  shouldersCm: z.number().optional(),
  chestCm: z.number().optional(),
  waistCm: z.number().optional(),
  hipsCm: z.number().optional(),
  bicepLeftCm: z.number().optional(),
  bicepRightCm: z.number().optional(),
  thighLeftCm: z.number().optional(),
  thighRightCm: z.number().optional(),
  calfLeftCm: z.number().optional(),
  calfRightCm: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
  muscleMassKg: z.number().optional(),
  notes: z.string().optional(),
});

export const createGoalSchema = z.object({
  goalType: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'body_fat', 'performance', 'other']),
  goalName: z.string().min(1).max(255),
  description: z.string().optional(),
  targetValue: z.number(),
  targetUnit: z.string(),
  currentValue: z.number().optional(),
  startingValue: z.number().optional(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const uploadProgressPhotoSchema = z.object({
  photoDate: z.string().datetime(),
  photoType: z.enum(['front', 'side', 'back', 'other']),
  caption: z.string().optional(),
  isPrivate: z.boolean().default(true),
});

export type CreateMeasurement = z.infer<typeof createMeasurementSchema>;
export type CreateGoal = z.infer<typeof createGoalSchema>;
export type UploadProgressPhoto = z.infer<typeof uploadProgressPhotoSchema>;

/**
 * Trainer Health Protocols Table
 * 
 * Stores specialized health protocols created by trainers.
 * These include longevity and parasite cleanse protocols.
 */
export const trainerHealthProtocols = pgTable("trainer_health_protocols", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'longevity' or 'parasite_cleanse'
  duration: integer("duration").notNull(), // Duration in days
  intensity: varchar("intensity", { length: 20 }).notNull(), // 'gentle', 'moderate', 'intensive'
  config: jsonb("config").notNull(), // Protocol configuration (LongevityModeConfig or ParasiteCleanseConfig)
  isTemplate: boolean("is_template").default(false), // Can be used as template
  tags: jsonb("tags").$type<string[]>().default([]), // For categorization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  trainerIdIdx: index("trainer_health_protocols_trainer_id_idx").on(table.trainerId),
  typeIdx: index("trainer_health_protocols_type_idx").on(table.type),
}));

/**
 * Protocol Assignments Table
 * 
 * Tracks which health protocols have been assigned to which customers.
 * Allows tracking progress and status of protocol implementations.
 */
export const protocolAssignments = pgTable("protocol_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolId: uuid("protocol_id")
    .references(() => trainerHealthProtocols.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: uuid("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'completed', 'paused', 'cancelled'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"), // Calculated based on protocol duration
  completedDate: timestamp("completed_date"),
  notes: text("notes"), // Assignment-specific notes
  progressData: jsonb("progress_data").default({}), // Track progress metrics
  assignedAt: timestamp("assigned_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  protocolIdx: index("protocol_assignments_protocol_id_idx").on(table.protocolId),
  customerIdx: index("protocol_assignments_customer_id_idx").on(table.customerId),
  trainerIdx: index("protocol_assignments_trainer_id_idx").on(table.trainerId),
  statusIdx: index("protocol_assignments_status_idx").on(table.status),
}));

// Type exports for health protocols
export type InsertTrainerHealthProtocol = typeof trainerHealthProtocols.$inferInsert;
export type TrainerHealthProtocol = typeof trainerHealthProtocols.$inferSelect;

export type InsertProtocolAssignment = typeof protocolAssignments.$inferInsert;
export type ProtocolAssignment = typeof protocolAssignments.$inferSelect;

// Health Protocol validation schemas
export const createHealthProtocolSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['longevity', 'parasite_cleanse']),
  duration: z.number().min(1).max(365), // 1 day to 1 year
  intensity: z.enum(['gentle', 'moderate', 'intensive']),
  config: z.record(z.any()), // Protocol-specific configuration
  tags: z.array(z.string()).optional(),
});

export const assignProtocolSchema = z.object({
  protocolId: z.string().uuid(),
  clientIds: z.array(z.string().uuid()),
  notes: z.string().optional(),
  startDate: z.string().datetime().optional(),
});

export type CreateHealthProtocol = z.infer<typeof createHealthProtocolSchema>;
export type AssignProtocol = z.infer<typeof assignProtocolSchema>;
