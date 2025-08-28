"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protocolEffectivenessUpdateSchema = exports.medicalSafetyValidationSchema = exports.createProtocolTemplateSchema = exports.protocolAnalytics = exports.protocolEffectiveness = exports.medicalSafetyValidations = exports.protocolVersions = exports.protocolTemplates = exports.assignProtocolSchema = exports.createHealthProtocolSchema = exports.protocolAssignments = exports.trainerHealthProtocols = exports.uploadProgressPhotoSchema = exports.createGoalSchema = exports.createMeasurementSchema = exports.goalMilestones = exports.customerGoals = exports.progressPhotos = exports.progressMeasurements = exports.acceptInvitationSchema = exports.createInvitationSchema = exports.customerInvitations = exports.refreshTokens = exports.passwordResetTokens = exports.users = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const zod_1 = require("zod");
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", [
    "admin",
    "trainer",
    "customer",
]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)("email").unique().notNull(),
    password: (0, pg_core_1.text)("password"),
    role: (0, exports.userRoleEnum)("role").default("customer").notNull(),
    googleId: (0, pg_core_1.varchar)("google_id").unique(),
    name: (0, pg_core_1.varchar)("name"),
    profilePicture: (0, pg_core_1.text)("profile_picture"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.passwordResetTokens = (0, pg_core_1.pgTable)("password_reset_tokens", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    token: (0, pg_core_1.text)("token").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
});
exports.refreshTokens = (0, pg_core_1.pgTable)("refresh_tokens", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    token: (0, pg_core_1.text)("token").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
});
exports.customerInvitations = (0, pg_core_1.pgTable)("customer_invitations", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    trainerId: (0, pg_core_1.uuid)("trainer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    customerEmail: (0, pg_core_1.varchar)("customer_email", { length: 255 }).notNull(),
    token: (0, pg_core_1.text)("token").unique().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    usedAt: (0, pg_core_1.timestamp)("used_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.createInvitationSchema = zod_1.z.object({
    customerEmail: zod_1.z.string().email('Invalid email format'),
    message: zod_1.z.string().max(500).optional(),
});
exports.acceptInvitationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Invitation token is required'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
});
exports.progressMeasurements = (0, pg_core_1.pgTable)("progress_measurements", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    measurementDate: (0, pg_core_1.timestamp)("measurement_date").notNull(),
    weightKg: (0, pg_core_1.decimal)("weight_kg", { precision: 5, scale: 2 }),
    weightLbs: (0, pg_core_1.decimal)("weight_lbs", { precision: 6, scale: 2 }),
    neckCm: (0, pg_core_1.decimal)("neck_cm", { precision: 4, scale: 1 }),
    shouldersCm: (0, pg_core_1.decimal)("shoulders_cm", { precision: 5, scale: 1 }),
    chestCm: (0, pg_core_1.decimal)("chest_cm", { precision: 5, scale: 1 }),
    waistCm: (0, pg_core_1.decimal)("waist_cm", { precision: 5, scale: 1 }),
    hipsCm: (0, pg_core_1.decimal)("hips_cm", { precision: 5, scale: 1 }),
    bicepLeftCm: (0, pg_core_1.decimal)("bicep_left_cm", { precision: 4, scale: 1 }),
    bicepRightCm: (0, pg_core_1.decimal)("bicep_right_cm", { precision: 4, scale: 1 }),
    thighLeftCm: (0, pg_core_1.decimal)("thigh_left_cm", { precision: 4, scale: 1 }),
    thighRightCm: (0, pg_core_1.decimal)("thigh_right_cm", { precision: 4, scale: 1 }),
    calfLeftCm: (0, pg_core_1.decimal)("calf_left_cm", { precision: 4, scale: 1 }),
    calfRightCm: (0, pg_core_1.decimal)("calf_right_cm", { precision: 4, scale: 1 }),
    bodyFatPercentage: (0, pg_core_1.decimal)("body_fat_percentage", { precision: 4, scale: 1 }),
    muscleMassKg: (0, pg_core_1.decimal)("muscle_mass_kg", { precision: 5, scale: 2 }),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => ({
    customerIdIdx: (0, pg_core_1.index)("progress_measurements_customer_id_idx").on(table.customerId),
    measurementDateIdx: (0, pg_core_1.index)("progress_measurements_date_idx").on(table.measurementDate),
}));
exports.progressPhotos = (0, pg_core_1.pgTable)("progress_photos", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    photoDate: (0, pg_core_1.timestamp)("photo_date").notNull(),
    photoUrl: (0, pg_core_1.text)("photo_url").notNull(),
    thumbnailUrl: (0, pg_core_1.text)("thumbnail_url"),
    photoType: (0, pg_core_1.varchar)("photo_type", { length: 50 }).notNull(),
    caption: (0, pg_core_1.text)("caption"),
    isPrivate: (0, pg_core_1.boolean)("is_private").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => ({
    customerIdIdx: (0, pg_core_1.index)("progress_photos_customer_id_idx").on(table.customerId),
    photoDateIdx: (0, pg_core_1.index)("progress_photos_date_idx").on(table.photoDate),
}));
exports.customerGoals = (0, pg_core_1.pgTable)("customer_goals", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    goalType: (0, pg_core_1.varchar)("goal_type", { length: 50 }).notNull(),
    goalName: (0, pg_core_1.varchar)("goal_name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    targetValue: (0, pg_core_1.decimal)("target_value", { precision: 10, scale: 2 }),
    targetUnit: (0, pg_core_1.varchar)("target_unit", { length: 20 }),
    currentValue: (0, pg_core_1.decimal)("current_value", { precision: 10, scale: 2 }),
    startingValue: (0, pg_core_1.decimal)("starting_value", { precision: 10, scale: 2 }),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    targetDate: (0, pg_core_1.timestamp)("target_date"),
    achievedDate: (0, pg_core_1.timestamp)("achieved_date"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("active"),
    progressPercentage: (0, pg_core_1.integer)("progress_percentage").default(0),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    customerIdIdx: (0, pg_core_1.index)("customer_goals_customer_id_idx").on(table.customerId),
    statusIdx: (0, pg_core_1.index)("customer_goals_status_idx").on(table.status),
}));
exports.goalMilestones = (0, pg_core_1.pgTable)("goal_milestones", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    goalId: (0, pg_core_1.uuid)("goal_id")
        .references(() => exports.customerGoals.id, { onDelete: "cascade" })
        .notNull(),
    milestoneName: (0, pg_core_1.varchar)("milestone_name", { length: 255 }).notNull(),
    targetValue: (0, pg_core_1.decimal)("target_value", { precision: 10, scale: 2 }).notNull(),
    achievedValue: (0, pg_core_1.decimal)("achieved_value", { precision: 10, scale: 2 }),
    achievedDate: (0, pg_core_1.timestamp)("achieved_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => ({
    goalIdIdx: (0, pg_core_1.index)("goal_milestones_goal_id_idx").on(table.goalId),
}));
exports.createMeasurementSchema = zod_1.z.object({
    measurementDate: zod_1.z.string().datetime(),
    weightKg: zod_1.z.number().optional(),
    weightLbs: zod_1.z.number().optional(),
    neckCm: zod_1.z.number().optional(),
    shouldersCm: zod_1.z.number().optional(),
    chestCm: zod_1.z.number().optional(),
    waistCm: zod_1.z.number().optional(),
    hipsCm: zod_1.z.number().optional(),
    bicepLeftCm: zod_1.z.number().optional(),
    bicepRightCm: zod_1.z.number().optional(),
    thighLeftCm: zod_1.z.number().optional(),
    thighRightCm: zod_1.z.number().optional(),
    calfLeftCm: zod_1.z.number().optional(),
    calfRightCm: zod_1.z.number().optional(),
    bodyFatPercentage: zod_1.z.number().optional(),
    muscleMassKg: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
exports.createGoalSchema = zod_1.z.object({
    goalType: zod_1.z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'body_fat', 'performance', 'other']),
    goalName: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    targetValue: zod_1.z.number(),
    targetUnit: zod_1.z.string(),
    currentValue: zod_1.z.number().optional(),
    startingValue: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime(),
    targetDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
});
exports.uploadProgressPhotoSchema = zod_1.z.object({
    photoDate: zod_1.z.string().datetime(),
    photoType: zod_1.z.enum(['front', 'side', 'back', 'other']),
    caption: zod_1.z.string().optional(),
    isPrivate: zod_1.z.boolean().default(true),
});
exports.trainerHealthProtocols = (0, pg_core_1.pgTable)("trainer_health_protocols", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    trainerId: (0, pg_core_1.uuid)("trainer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(),
    intensity: (0, pg_core_1.varchar)("intensity", { length: 20 }).notNull(),
    config: (0, pg_core_1.jsonb)("config").notNull(),
    isTemplate: (0, pg_core_1.boolean)("is_template").default(false),
    tags: (0, pg_core_1.jsonb)("tags").$type().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    trainerIdIdx: (0, pg_core_1.index)("trainer_health_protocols_trainer_id_idx").on(table.trainerId),
    typeIdx: (0, pg_core_1.index)("trainer_health_protocols_type_idx").on(table.type),
}));
exports.protocolAssignments = (0, pg_core_1.pgTable)("protocol_assignments", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    protocolId: (0, pg_core_1.uuid)("protocol_id")
        .references(() => exports.trainerHealthProtocols.id, { onDelete: "cascade" })
        .notNull(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    trainerId: (0, pg_core_1.uuid)("trainer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("active"),
    startDate: (0, pg_core_1.timestamp)("start_date").defaultNow(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    completedDate: (0, pg_core_1.timestamp)("completed_date"),
    notes: (0, pg_core_1.text)("notes"),
    progressData: (0, pg_core_1.jsonb)("progress_data").default({}),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    protocolIdx: (0, pg_core_1.index)("protocol_assignments_protocol_id_idx").on(table.protocolId),
    customerIdx: (0, pg_core_1.index)("protocol_assignments_customer_id_idx").on(table.customerId),
    trainerIdx: (0, pg_core_1.index)("protocol_assignments_trainer_id_idx").on(table.trainerId),
    statusIdx: (0, pg_core_1.index)("protocol_assignments_status_idx").on(table.status),
}));
exports.createHealthProtocolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['longevity', 'parasite_cleanse', 'therapeutic', 'ailments_based']),
    duration: zod_1.z.number().min(1).max(365),
    intensity: zod_1.z.enum(['gentle', 'moderate', 'intensive']),
    config: zod_1.z.record(zod_1.z.any()),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.assignProtocolSchema = zod_1.z.object({
    protocolId: zod_1.z.string().uuid(),
    clientIds: zod_1.z.array(zod_1.z.string().uuid()),
    notes: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
});
exports.protocolTemplates = (0, pg_core_1.pgTable)("protocol_templates", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 50 }).notNull(),
    templateType: (0, pg_core_1.varchar)("template_type", { length: 50 }).notNull(),
    defaultDuration: (0, pg_core_1.integer)("default_duration").notNull(),
    defaultIntensity: (0, pg_core_1.varchar)("default_intensity", { length: 20 }).notNull(),
    baseConfig: (0, pg_core_1.jsonb)("base_config").notNull(),
    targetAudience: (0, pg_core_1.jsonb)("target_audience").$type().default([]),
    healthFocus: (0, pg_core_1.jsonb)("health_focus").$type().default([]),
    tags: (0, pg_core_1.jsonb)("tags").$type().default([]),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    createdBy: (0, pg_core_1.uuid)("created_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    categoryIdx: (0, pg_core_1.index)("protocol_templates_category_idx").on(table.category),
    templateTypeIdx: (0, pg_core_1.index)("protocol_templates_type_idx").on(table.templateType),
    activeIdx: (0, pg_core_1.index)("protocol_templates_active_idx").on(table.isActive),
}));
exports.protocolVersions = (0, pg_core_1.pgTable)("protocol_versions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    protocolId: (0, pg_core_1.uuid)("protocol_id")
        .references(() => exports.trainerHealthProtocols.id, { onDelete: "cascade" })
        .notNull(),
    versionNumber: (0, pg_core_1.varchar)("version_number", { length: 20 }).notNull(),
    versionName: (0, pg_core_1.varchar)("version_name", { length: 255 }),
    changelog: (0, pg_core_1.text)("changelog").notNull(),
    config: (0, pg_core_1.jsonb)("config").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(false),
    createdBy: (0, pg_core_1.uuid)("created_by")
        .references(() => exports.users.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => ({
    protocolVersionIdx: (0, pg_core_1.index)("protocol_versions_protocol_id_idx").on(table.protocolId),
    activeVersionIdx: (0, pg_core_1.index)("protocol_versions_active_idx").on(table.isActive, table.protocolId),
}));
exports.medicalSafetyValidations = (0, pg_core_1.pgTable)("medical_safety_validations", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    protocolId: (0, pg_core_1.uuid)("protocol_id")
        .references(() => exports.trainerHealthProtocols.id, { onDelete: "cascade" })
        .notNull(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    medications: (0, pg_core_1.jsonb)("medications").$type().default([]),
    healthConditions: (0, pg_core_1.jsonb)("health_conditions").$type().default([]),
    allergies: (0, pg_core_1.jsonb)("allergies").$type().default([]),
    safetyRating: (0, pg_core_1.varchar)("safety_rating", { length: 20 }).notNull(),
    interactions: (0, pg_core_1.jsonb)("interactions").notNull(),
    recommendations: (0, pg_core_1.jsonb)("recommendations").$type().default([]),
    validatedAt: (0, pg_core_1.timestamp)("validated_at").defaultNow(),
    validatedBy: (0, pg_core_1.varchar)("validated_by", { length: 50 }).default("system"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
}, (table) => ({
    protocolCustomerIdx: (0, pg_core_1.index)("safety_validations_protocol_customer_idx").on(table.protocolId, table.customerId),
    safetyRatingIdx: (0, pg_core_1.index)("safety_validations_rating_idx").on(table.safetyRating),
    activeIdx: (0, pg_core_1.index)("safety_validations_active_idx").on(table.isActive),
}));
exports.protocolEffectiveness = (0, pg_core_1.pgTable)("protocol_effectiveness", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    protocolId: (0, pg_core_1.uuid)("protocol_id")
        .references(() => exports.trainerHealthProtocols.id, { onDelete: "cascade" })
        .notNull(),
    assignmentId: (0, pg_core_1.uuid)("assignment_id")
        .references(() => exports.protocolAssignments.id, { onDelete: "cascade" })
        .notNull(),
    customerId: (0, pg_core_1.uuid)("customer_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    baselineMetrics: (0, pg_core_1.jsonb)("baseline_metrics").default({}),
    weeklyProgress: (0, pg_core_1.jsonb)("weekly_progress").$type().default([]),
    finalMetrics: (0, pg_core_1.jsonb)("final_metrics").default({}),
    overallEffectiveness: (0, pg_core_1.decimal)("overall_effectiveness", { precision: 4, scale: 2 }),
    clientSatisfaction: (0, pg_core_1.integer)("client_satisfaction"),
    wouldRecommend: (0, pg_core_1.boolean)("would_recommend"),
    goalsAchieved: (0, pg_core_1.integer)("goals_achieved").default(0),
    totalGoals: (0, pg_core_1.integer)("total_goals").default(0),
    completionRate: (0, pg_core_1.decimal)("completion_rate", { precision: 4, scale: 2 }),
    successFactors: (0, pg_core_1.jsonb)("success_factors").$type().default([]),
    challenges: (0, pg_core_1.jsonb)("challenges").$type().default([]),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    protocolIdx: (0, pg_core_1.index)("protocol_effectiveness_protocol_idx").on(table.protocolId),
    customerIdx: (0, pg_core_1.index)("protocol_effectiveness_customer_idx").on(table.customerId),
    assignmentIdx: (0, pg_core_1.index)("protocol_effectiveness_assignment_idx").on(table.assignmentId),
    completedIdx: (0, pg_core_1.index)("protocol_effectiveness_completed_idx").on(table.isCompleted),
}));
exports.protocolAnalytics = (0, pg_core_1.pgTable)("protocol_analytics", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    protocolId: (0, pg_core_1.uuid)("protocol_id")
        .references(() => exports.trainerHealthProtocols.id, { onDelete: "cascade" })
        .notNull(),
    totalAssignments: (0, pg_core_1.integer)("total_assignments").default(0),
    activeAssignments: (0, pg_core_1.integer)("active_assignments").default(0),
    completedAssignments: (0, pg_core_1.integer)("completed_assignments").default(0),
    averageEffectiveness: (0, pg_core_1.decimal)("average_effectiveness", { precision: 4, scale: 2 }),
    averageSatisfaction: (0, pg_core_1.decimal)("average_satisfaction", { precision: 3, scale: 2 }),
    averageCompletionRate: (0, pg_core_1.decimal)("average_completion_rate", { precision: 4, scale: 2 }),
    recommendationRate: (0, pg_core_1.decimal)("recommendation_rate", { precision: 4, scale: 2 }),
    effectiveDemographics: (0, pg_core_1.jsonb)("effective_demographics").default({}),
    commonSuccessFactors: (0, pg_core_1.jsonb)("common_success_factors").$type().default([]),
    commonChallenges: (0, pg_core_1.jsonb)("common_challenges").$type().default([]),
    optimizationSuggestions: (0, pg_core_1.jsonb)("optimization_suggestions").$type().default([]),
    lastCalculated: (0, pg_core_1.timestamp)("last_calculated").defaultNow(),
    dataPoints: (0, pg_core_1.integer)("data_points").default(0),
}, (table) => ({
    protocolIdx: (0, pg_core_1.index)("protocol_analytics_protocol_idx").on(table.protocolId),
    lastCalculatedIdx: (0, pg_core_1.index)("protocol_analytics_calculated_idx").on(table.lastCalculated),
}));
exports.createProtocolTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['weight_loss', 'muscle_gain', 'detox', 'energy', 'longevity', 'therapeutic', 'general']),
    templateType: zod_1.z.enum(['longevity', 'parasite_cleanse', 'ailments_based', 'general']),
    defaultDuration: zod_1.z.number().min(1).max(365),
    defaultIntensity: zod_1.z.enum(['gentle', 'moderate', 'intensive']),
    baseConfig: zod_1.z.record(zod_1.z.any()),
    targetAudience: zod_1.z.array(zod_1.z.string()).optional(),
    healthFocus: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.medicalSafetyValidationSchema = zod_1.z.object({
    protocolId: zod_1.z.string().uuid(),
    medications: zod_1.z.array(zod_1.z.string()).optional(),
    healthConditions: zod_1.z.array(zod_1.z.string()).optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.protocolEffectivenessUpdateSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().uuid(),
    weeklyProgress: zod_1.z.object({
        week: zod_1.z.number(),
        date: zod_1.z.string(),
        metrics: zod_1.z.record(zod_1.z.any()),
        notes: zod_1.z.string().optional(),
        adherence: zod_1.z.number().min(0).max(100),
    }).optional(),
    finalMetrics: zod_1.z.record(zod_1.z.any()).optional(),
    clientSatisfaction: zod_1.z.number().min(1).max(5).optional(),
    wouldRecommend: zod_1.z.boolean().optional(),
    goalsAchieved: zod_1.z.number().optional(),
    totalGoals: zod_1.z.number().optional(),
});
//# sourceMappingURL=schema.js.map