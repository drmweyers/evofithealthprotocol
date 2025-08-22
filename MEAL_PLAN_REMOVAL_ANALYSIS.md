# Meal Plan Removal Analysis Report

## Executive Summary

This report provides a comprehensive analysis of all meal plan related components in the EvoFitHealthProtocol codebase that need to be removed as part of the refactoring to focus solely on Health Protocol features (parasite cleanse and longevity protocols).

**Analysis Date:** 2025-01-21  
**Project:** EvoFitHealthProtocol  
**Objective:** Identify all meal plan, recipe, and nutrition-related code for removal while preserving Health Protocol functionality

## Overview

The codebase currently contains extensive meal planning functionality that needs to be removed to focus exclusively on health protocols. The analysis reveals meal plan features are deeply integrated throughout the application across frontend components, backend services, database schema, and testing infrastructure.

---

## Database Schema Analysis

### Tables to Remove Completely

1. **`recipes`** - Core recipe storage table
   - Location: `shared/schema.ts` lines 147-186
   - Contains: Recipe data, nutritional information, ingredients, cooking instructions
   - Dependencies: Referenced by `personalized_recipes`, meal plan generation

2. **`personalized_recipes`** - Recipe assignments from trainers to customers  
   - Location: `shared/schema.ts` lines 188-200
   - Dependencies: Links to `recipes`, `users` tables

3. **`personalized_meal_plans`** - Meal plan assignments to customers
   - Location: `shared/schema.ts` lines 209-219
   - Contains: JSONB meal plan data, trainer-customer relationships

4. **`trainer_meal_plans`** - Trainer's saved meal plans
   - Location: `shared/schema.ts` lines 227-240
   - Contains: Meal plan library, templates, tags

5. **`meal_plan_assignments`** - Links meal plans to customers
   - Location: `shared/schema.ts` lines 248-264
   - Dependencies: Links `trainer_meal_plans` to customers

### Schema Types to Remove

**Type Definitions (shared/schema.ts):**
- `InsertRecipe`, `UpdateRecipe`, `Recipe` (lines 339-342)
- `RecipeFilter` (line 342)
- `MealPlanGeneration` (line 385)
- `MealPlan` (line 478)
- `InsertPersonalizedMealPlan`, `PersonalizedMealPlan` (lines 481-482)
- `CustomerMealPlan` (lines 485-494)
- `InsertTrainerMealPlan`, `TrainerMealPlan` (lines 497-498)
- `InsertMealPlanAssignment`, `MealPlanAssignment` (lines 501-502)
- `TrainerMealPlanWithAssignments` (lines 505-512)

**Validation Schemas:**
- `insertRecipeSchema` (lines 274-296)
- `updateRecipeSchema` (line 299)
- `recipeFilterSchema` (lines 307-336)
- `mealPlanGenerationSchema` (lines 353-383)
- `mealPlanSchema` (lines 397-476)

---

## Frontend Components Analysis

### React Components to Remove Completely

**Meal Plan Components:**
- `client/src/components/MealPlanAssignment.tsx`
- `client/src/components/MealPlanCard.tsx`
- `client/src/components/MealPlanModal.tsx`
- `client/src/components/TrainerMealPlans.tsx`
- `client/src/pages/MealPlanGenerator.tsx`

**Recipe Components:**
- `client/src/components/AdminRecipeGenerator.tsx`
- `client/src/components/AdminRecipeGrid.tsx`
- `client/src/components/RecipeAssignment.tsx`
- `client/src/components/RecipeCardWithAssignment.tsx`
- `client/src/components/RecipeDetailModal.tsx`
- `client/src/components/RecipeFilters.tsx`
- `client/src/components/RecipeGenerationModal.tsx`
- `client/src/components/RecipeListItem.tsx`
- `client/src/components/RecipeListItemWithAssignment.tsx`
- `client/src/components/RecipeModal.tsx`

**Search and Filter Components:**
- `client/src/components/SearchFilters.tsx`
- `client/src/components/SpecializedIngredientSelector.tsx`

**Meal Prep Components:**
- `client/src/components/MealPrepDisplay.tsx`

### Components Requiring Modification

**Admin Pages:**
- `client/src/pages/Admin.tsx` - Remove recipe/meal plan management tabs
- `client/src/pages/AdminProfile.tsx` - Remove meal plan related features
- `client/src/components/AdminTable.tsx` - Remove recipe management

**Trainer Pages:**
- `client/src/pages/Trainer.tsx` - Remove meal plan tabs, keep only Health Protocols
- `client/src/pages/TrainerProfile.tsx` - Remove meal plan features

**Customer Pages:**
- `client/src/pages/CustomerProfile.tsx` - Remove meal plan viewing/assignment features

**PDF Export Components:**
- `client/src/components/EvoFitPDFExport.tsx` - Remove meal plan PDF export, adapt for health protocols only
- `client/src/components/PDFExportButton.tsx` - Modify for protocols only

---

## Backend Services and Routes Analysis

### Files to Remove Completely

**Services:**
- `server/services/mealPlanGenerator.ts`
- `server/services/recipeGenerator.ts`
- `server/services/specializedMealPlans.ts`
- `server/services/utils/RecipeCache.ts`

**Routes:**
- `server/recipeRoutes.ts`
- `server/routes/mealPlan.ts`
- `server/routes/recipes.ts`
- `server/routes/specializedMealPlans.ts`

### Files Requiring Modification

**Main Routes File:**
- `server/routes.ts` - Remove meal plan generation endpoints (lines 117-263)
  - Remove: `/api/meal-plan/generate`
  - Remove: `/api/meal-plan/parse-natural-language`
  - Remove: `/api/generate-meal-plan`
  - Remove: `/api/admin/parse-recipe-requirements`
  - Remove: Recipe search endpoints (lines 56-114)

**Admin Routes:**
- `server/routes/adminRoutes.ts` - Remove recipe management endpoints

**Trainer Routes:**
- `server/routes/trainerRoutes.ts` - Remove meal plan management, keep only health protocol features

**Customer Routes:**
- `server/routes/customerRoutes.ts` - Remove meal plan viewing endpoints

**PDF Routes:**
- `server/routes/pdf.ts` - Remove meal plan PDF generation, keep health protocol PDF only

**PDF Controller:**
- `server/controllers/exportPdfController.ts` - Remove meal plan export logic

**Storage:**
- `server/storage.ts` - Remove recipe search and meal plan storage methods

### OpenAI Service Modifications

**OpenAI Service:**
- `server/services/openai.ts` - Remove meal plan and recipe generation functions:
  - Remove: `parseNaturalLanguageMealPlan`
  - Remove: `parseNaturalLanguageRecipeRequirements`
  - Keep only health protocol related AI functions

---

## Utility Files Analysis

### Files to Remove

**Client Utils:**
- `client/src/utils/mealPlanHelpers.ts`
- `client/src/hooks/useSafeMealPlan.ts`

### Files Requiring Modification

**PDF Export Utils:**
- `client/src/utils/pdfExport.ts` - Remove meal plan PDF logic, keep health protocol export
- `server/utils/pdfTemplate.ts` - Remove meal plan templates
- `server/utils/pdfValidation.ts` - Remove meal plan validation
- `server/views/pdfTemplate.ejs` - Remove meal plan sections

**API Utils:**
- `client/src/utils/api.ts` - Remove meal plan related API calls

**Cache Utils:**
- `client/src/lib/cacheUtils.ts` - Remove meal plan cache logic
- `client/src/lib/queryClient.ts` - Remove meal plan query configurations

---

## Database Migration Files

### Migration Files to Create

**New Migration for Cleanup:**
Create `migrations/XXXX_remove_meal_plan_tables.sql` to:

1. Drop foreign key constraints:
   - `meal_plan_assignments` foreign keys
   - `personalized_meal_plans` foreign keys  
   - `personalized_recipes` foreign keys

2. Drop indexes:
   - `meal_plan_assignments_meal_plan_id_idx`
   - `meal_plan_assignments_customer_id_idx`
   - `trainer_meal_plans_trainer_id_idx`
   - Recipe-related indexes from `idx_recipes_*`

3. Drop tables:
   - `meal_plan_assignments`
   - `trainer_meal_plans`
   - `personalized_meal_plans`
   - `personalized_recipes`
   - `recipes`

### Migration Files Affected

**Existing migrations that reference meal plans:**
- `migrations/0000_left_crusher_hogan.sql` - Contains recipes table
- `migrations/0001_tricky_king_cobra.sql` - Contains meal plan tables
- `migrations/0002_create_personalized_recipes.sql`
- `migrations/0003_create_personalized_meal_plans.sql`

---

## Test Files Analysis

### Test Files to Remove Completely

**Unit Tests:**
- `test/unit/mealPlanHelpers.test.ts`
- `test/unit/mealPrepDisplay.test.tsx`
- `test/unit/mealPrepGeneration.test.ts`
- `test/unit/mealPrepPdfExport.test.ts`
- `test/unit/recipeDetailModal.test.tsx`
- `test/unit/recipeGeneration.test.ts`
- `test/unit/ingredientLimitation.test.ts`
- `test/unit/TrainerMealPlanAssignment.test.tsx`
- `test/unit/TrainerMealPlanAssignmentModal.test.tsx`
- `test/unit/trainerMealPlans.test.ts`

**Integration Tests:**
- `test/integration/CustomerMealPlans.test.tsx`
- `test/integration/trainerMealPlanManagement.test.ts`
- `test/api/trainerMealPlans.test.ts`

**E2E Tests:**
- `test/e2e/meal-plan-workflows.spec.ts`
- `test/gui/specs/meal-plan-generation.test.ts`
- `test/gui/specs/recipe-management.test.ts`

**Page Objects:**
- `test/page-objects/MealPlanPage.ts`

### Test Files Requiring Modification

**Component Tests:**
- `test/unit/components.test.tsx` - Remove meal plan component tests
- `test/components.test.tsx` - Remove meal plan component tests

**API Tests:**
- `test/api.test.ts` - Remove meal plan API tests
- `test/trainer-api.test.ts` - Remove meal plan endpoints
- `test/meal-plan-saving.test.ts` - Remove completely

**Database Tests:**
- `test/database.test.ts` - Remove recipe/meal plan schema tests

**Integration Tests:**
- `test/integration.test.ts` - Remove meal plan integration tests

**PDF Tests:**
- `test/pdf-*.test.ts` files - Remove meal plan PDF test cases

---

## Script Files Analysis

### Scripts to Remove

**Recipe Generation Scripts:**
- `scripts/addTestRecipes.js`
- `scripts/generateRecipes.js`
- `scripts/addTestMealPlanAssignments.js`

### Scripts Requiring Modification

**Test Data Scripts:**
- `scripts/generate-test-data.js` - Remove meal plan test data generation
- `scripts/enhance-test-data.js` - Remove recipe/meal plan enhancements
- `scripts/enhance-customer-profile.js` - Remove meal plan profile data
- `scripts/update-test-accounts.js` - Remove meal plan related account data

**Migration Scripts:**
- `scripts/migrate-trainer-meal-plans.sql` - Remove (no longer needed)

---

## Configuration and Documentation

### Files to Update

**Package Dependencies:**
Review and potentially remove:
- Recipe/nutrition related npm packages
- Meal planning specific dependencies

**Documentation:**
- `README.md` - Remove meal planning features from description
- `API_DOCUMENTATION.md` - Remove meal plan API endpoints
- `DATABASE_SCHEMA.md` - Remove recipe/meal plan schema documentation

**Environment Configuration:**
- Remove meal plan related environment variables
- Remove recipe generation API keys if not used for health protocols

---

## Shared Code Analysis

### Features to Preserve

**User Management:**
- User authentication and roles (Admin, Trainer, Customer)
- Customer invitation system
- Trainer-customer relationships

**Health Protocol Features:**
- `client/src/components/HealthProtocolDashboard.tsx` ✅ Keep
- `client/src/components/ProtocolDashboard.tsx` ✅ Keep
- `client/src/components/TrainerHealthProtocols.tsx` ✅ Keep
- `client/src/components/SpecializedProtocolsPanel.tsx` ✅ Keep
- `client/src/components/ParasiteCleanseProtocol.tsx` ✅ Keep
- `client/src/components/LongevityModeToggle.tsx` ✅ Keep
- `client/src/components/MinimalSpecializedPanel.tsx` ✅ Keep

**Progress Tracking:**
- `client/src/components/ProgressTracking.tsx` ✅ Keep
- Progress measurement tables and functionality ✅ Keep

**Profile Management:**
- `client/src/components/ProfileImageUpload.tsx` ✅ Keep
- User profile pages ✅ Keep (minus meal plan features)

---

## Risk Assessment

### High Risk Areas

1. **Database Migration** - Dropping tables with foreign key relationships requires careful ordering
2. **PDF Export** - Shared template system needs careful separation of meal plan vs health protocol logic
3. **User Interface** - Navigation and tab systems need restructuring after removing meal plan tabs
4. **API Authentication** - Ensure health protocol endpoints maintain proper authentication

### Medium Risk Areas

1. **Shared Components** - Some UI components may be used by both meal plans and health protocols
2. **Caching Logic** - Query invalidation and cache management may need updates
3. **Error Handling** - Remove meal plan specific error handling without breaking health protocols

### Low Risk Areas

1. **Test Files** - Safe to remove meal plan tests
2. **Static Assets** - Remove meal plan related images/icons
3. **Documentation** - Update without affecting functionality

---

## Implementation Checklist

### Phase 1: Database Cleanup
- [ ] Create migration to drop meal plan tables
- [ ] Update schema.ts to remove meal plan types
- [ ] Test database migration in development
- [ ] Update storage.ts to remove meal plan methods

### Phase 2: Backend Cleanup
- [ ] Remove meal plan routes and services
- [ ] Update main routes.ts file
- [ ] Remove recipe generation services
- [ ] Update OpenAI service
- [ ] Modify PDF generation for health protocols only

### Phase 3: Frontend Cleanup
- [ ] Remove meal plan React components
- [ ] Remove recipe management components
- [ ] Update admin/trainer/customer pages
- [ ] Update navigation and routing
- [ ] Modify PDF export components

### Phase 4: Test Cleanup
- [ ] Remove meal plan test files
- [ ] Update remaining tests
- [ ] Remove test scripts
- [ ] Update test data generation

### Phase 5: Final Cleanup
- [ ] Update documentation
- [ ] Remove unused dependencies
- [ ] Update configuration files
- [ ] Clean up imports and references

---

## Conclusion

The meal plan removal requires careful coordination across all application layers. The analysis reveals extensive integration of meal planning functionality that must be systematically removed while preserving the core health protocol features.

**Estimated Effort:** 40-60 hours  
**Risk Level:** Medium-High (due to database changes)  
**Recommended Approach:** Implement in phases with thorough testing at each stage

**Key Success Factors:**
1. Maintain data backup before database migrations
2. Test health protocol functionality after each phase
3. Ensure proper authentication and authorization remain intact
4. Verify PDF export works correctly for health protocols
5. Maintain trainer-customer relationship functionality

This analysis provides the foundation for a systematic approach to refactoring the codebase to focus exclusively on health protocols while maintaining all essential user management and protocol features.