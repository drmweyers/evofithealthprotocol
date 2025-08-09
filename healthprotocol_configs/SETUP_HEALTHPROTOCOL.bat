@echo off
echo ========================================================
echo       HEALTH PROTOCOL APP - COMPLETE SETUP SCRIPT
echo ========================================================
echo.
echo This script will set up your HealthProtocol standalone app
echo Make sure you're in the HealthProtocol folder!
echo.
echo Current directory: %CD%
echo.
echo Press CTRL+C to cancel, or
pause

echo.
echo [1/8] Copying configuration files...
echo ========================================

REM Copy root level files
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\package.json package.json
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\docker-compose.yml docker-compose.yml
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\.env.development .env.development
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\.env.production .env.production
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\drizzle.config.ts drizzle.config.ts

echo Root files copied.

REM Copy client files
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\vite.config.ts vite.config.ts
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\client_package.json client\package.json
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\App.tsx client\src\App.tsx
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\HealthProtocolDashboard.tsx client\src\components\HealthProtocolDashboard.tsx

echo Client files copied.

REM Copy server files
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\server_index.ts server\index.ts
copy /Y ..\FitnessMealPlanner\healthprotocol_configs\schema_index.ts server\db\schema\index.ts

echo Server files copied.
echo.

echo [2/8] Removing meal/recipe components...
echo ========================================

REM Remove unnecessary components
del /Q client\src\components\RecipeManager.tsx 2>nul
del /Q client\src\components\RecipeForm.tsx 2>nul
del /Q client\src\components\RecipeList.tsx 2>nul
del /Q client\src\components\RecipeCard.tsx 2>nul
del /Q client\src\components\MealPlanGenerator.tsx 2>nul
del /Q client\src\components\MealPlanDisplay.tsx 2>nul
del /Q client\src\components\CustomerMealPlans.tsx 2>nul
del /Q client\src\components\PendingRecipesTable.tsx 2>nul
del /Q client\src\components\IngredientSelector.tsx 2>nul
del /Q client\src\components\WeeklyMealPlan.tsx 2>nul

echo Components cleaned up.
echo.

echo [3/8] Removing meal/recipe routes...
echo ========================================

REM Remove server routes
del /Q server\routes\recipeRoutes.ts 2>nul
del /Q server\routes\mealPlanRoutes.ts 2>nul
del /Q server\routes\ingredientRoutes.ts 2>nul

echo Routes cleaned up.
echo.

echo [4/8] Removing meal/recipe pages...
echo ========================================

REM Remove pages
del /Q client\src\pages\Recipes.tsx 2>nul
del /Q client\src\pages\MealPlans.tsx 2>nul
del /Q client\src\pages\Customer.tsx 2>nul

echo Pages cleaned up.
echo.

echo [5/8] Initializing Git repository...
echo ========================================

if exist .git (
    echo Removing existing .git folder...
    rmdir /s /q .git
)
git init
git add .
git commit -m "Initial commit: HealthProtocol standalone app"

echo Git repository initialized.
echo.

echo [6/8] Installing dependencies...
echo ========================================
echo This may take a few minutes...

call npm install

echo Dependencies installed.
echo.

echo [7/8] Installing client dependencies...
echo ========================================

cd client
call npm install
cd ..

echo Client dependencies installed.
echo.

echo [8/8] Starting Docker containers...
echo ========================================

docker-compose --profile dev up -d

echo.
echo ========================================================
echo       SETUP COMPLETE!
echo ========================================================
echo.
echo Your HealthProtocol app is ready!
echo.
echo Access the app at: http://localhost:4001
echo.
echo Login credentials:
echo   Email: trainer.test@evofitmeals.com
echo   Password: TestTrainer123!
echo.
echo Commands:
echo   Start: docker-compose --profile dev up -d
echo   Stop:  docker-compose --profile dev down
echo   Logs:  docker logs healthprotocol-dev -f
echo.
echo ========================================================

pause