@echo off
echo ================================================
echo Cleaning up HealthProtocol App - Removing unnecessary files
echo ================================================
echo.

echo WARNING: This will delete meal planning and recipe related files!
echo Make sure you're in the HealthProtocol folder before running this.
echo.
pause

echo.
echo Removing meal/recipe components from client...

REM Remove meal and recipe components
del /Q client\src\components\RecipeManager.tsx 2>nul
del /Q client\src\components\RecipeForm.tsx 2>nul
del /Q client\src\components\RecipeList.tsx 2>nul
del /Q client\src\components\RecipeCard.tsx 2>nul
del /Q client\src\components\MealPlanGenerator.tsx 2>nul
del /Q client\src\components\MealPlanDisplay.tsx 2>nul
del /Q client\src\components\CustomerMealPlans.tsx 2>nul
del /Q client\src\components\PendingRecipesTable.tsx 2>nul
del /Q client\src\components\IngredientSelector.tsx 2>nul
del /Q client\src\components\MacroDisplay.tsx 2>nul
del /Q client\src\components\MealPlanPDF.tsx 2>nul
del /Q client\src\components\CustomerInvite.tsx 2>nul
del /Q client\src\components\CustomerList.tsx 2>nul
del /Q client\src\components\CustomerProfile.tsx 2>nul
del /Q client\src\components\WeeklyMealPlan.tsx 2>nul

echo Removed meal/recipe components
echo.

echo Removing meal/recipe routes from server...

REM Remove server routes
del /Q server\routes\recipeRoutes.ts 2>nul
del /Q server\routes\mealPlanRoutes.ts 2>nul
del /Q server\routes\ingredientRoutes.ts 2>nul
del /Q server\routes\customerRoutes.ts 2>nul

echo Removed meal/recipe routes
echo.

echo Removing meal/recipe pages...

REM Remove pages
del /Q client\src\pages\Recipes.tsx 2>nul
del /Q client\src\pages\MealPlans.tsx 2>nul
del /Q client\src\pages\Customer.tsx 2>nul

echo Removed meal/recipe pages
echo.

echo ================================================
echo Cleanup completed!
echo.
echo Next steps:
echo 1. Copy the new configuration files
echo 2. Update server/index.ts to remove meal/recipe routes
echo 3. Update database schema (remove meal/recipe tables)
echo 4. Run: docker-compose --profile dev up -d
echo ================================================

pause