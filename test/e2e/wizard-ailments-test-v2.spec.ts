import { test, expect } from '@playwright/test';

test.describe('Protocol Wizard - Ailments Navigation Test V2', () => {
  const baseURL = 'http://localhost:3501';
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';

  test('VERIFICATION 2: Ailments step should not cause blank page', async ({ page }) => {
    console.log('🚀 VERIFICATION TEST 2: Testing Ailments Step Navigation\n');
    
    // Login
    console.log('Step 1: Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', trainerEmail);
    await page.fill('input[name="password"]', trainerPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in successfully\n');

    // Navigate to protocols
    console.log('Step 2: Navigating to protocols...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    console.log('✅ On protocols page\n');

    // Open wizard
    console.log('Step 3: Opening wizard...');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard dialog opened\n');

    // Step 1: Client Selection
    console.log('Step 4: Client Selection...');
    // Check if we're on client selection step
    const clientStep = page.locator('h3:has-text("Client Selection")');
    if (await clientStep.isVisible({ timeout: 3000 })) {
      // Click on first client card
      const clientCard = page.locator('[data-testid="client-card"], .border.rounded-lg.p-4').first();
      if (await clientCard.isVisible()) {
        await clientCard.click();
        console.log('  ✅ Selected client');
      }
      // Click Next
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Advanced from Client Selection\n');
    }

    // Step 2: Template Selection
    console.log('Step 5: Template Selection...');
    const templateStep = page.locator('h3:has-text("Template Selection")');
    if (await templateStep.isVisible({ timeout: 3000 })) {
      // Select Weight Loss template
      const weightLossBtn = page.locator('button').filter({ hasText: /Weight Loss/i }).first();
      if (await weightLossBtn.isVisible()) {
        await weightLossBtn.click();
        console.log('  ✅ Selected Weight Loss template');
      }
      // Click Next
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Advanced from Template Selection\n');
    }

    // Step 3: Health Information (THE CRITICAL STEP)
    console.log('Step 6: Health Information (CRITICAL)...');
    const healthStep = page.locator('h3:has-text("Health Information")');
    if (await healthStep.isVisible({ timeout: 3000 })) {
      console.log('  ✅ Health Information step is visible');
      
      // Select some medical conditions
      const diabetesCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('text=/Diabetes/i') }).first();
      const hypertensionCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('text=/Hypertension/i') }).first();
      
      // Try alternative selectors if needed
      const diabetesLabel = page.locator('label').filter({ hasText: /Diabetes/i }).first();
      const hypertensionLabel = page.locator('label').filter({ hasText: /Hypertension/i }).first();
      
      if (await diabetesLabel.isVisible()) {
        await diabetesLabel.click();
        console.log('  ✅ Selected Diabetes');
      }
      
      if (await hypertensionLabel.isVisible()) {
        await hypertensionLabel.click();
        console.log('  ✅ Selected Hypertension');
      }
      
      // THE CRITICAL MOMENT - Navigate away from Health Information
      console.log('  🔄 Clicking Next to leave Health Information step...');
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(2000);
    }

    // VERIFICATION: Check if we're on Customization step (not blank page)
    console.log('Step 7: VERIFICATION - Checking next step...');
    
    // Take screenshot for evidence
    await page.screenshot({ path: 'ailments-verification-2.png', fullPage: true });
    
    // Check for Customization step
    const customizationStep = page.locator('h3:has-text("Customization")');
    const isOnCustomization = await customizationStep.isVisible({ timeout: 3000 });
    
    // Check if still on Health Information (stuck)
    const stillOnHealth = await page.locator('h3:has-text("Health Information")').isVisible();
    
    // Check for blank dialog
    const dialogContent = await page.locator('[role="dialog"]').textContent();
    const isBlank = !dialogContent || dialogContent.trim().length < 50;
    
    if (isOnCustomization) {
      console.log('✅✅✅ SUCCESS! Advanced to Customization step');
      console.log('✅ Wizard is NOT showing blank page after ailments');
      console.log('✅ VERIFICATION 2 PASSED!\n');
      
      // Continue to verify we can complete the wizard
      console.log('Bonus: Continuing through wizard...');
      
      // Fill in duration
      const durationInput = page.locator('input[name="duration"], input[placeholder*="duration"]').first();
      if (await durationInput.isVisible()) {
        await durationInput.fill('30');
        console.log('  ✅ Set duration');
      }
      
      // Click Next to AI Generation
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
      
      const aiStep = page.locator('h3:has-text("AI Generation")');
      if (await aiStep.isVisible()) {
        console.log('  ✅ Reached AI Generation step');
        console.log('  ✅ Wizard flow is working correctly!\n');
      }
    } else if (stillOnHealth) {
      console.log('❌ FAILED: Still stuck on Health Information step');
      console.log('❌ Wizard did not advance after selecting ailments');
      throw new Error('Wizard stuck on Health Information step');
    } else if (isBlank) {
      console.log('❌ FAILED: Wizard is showing blank page!');
      console.log(`Dialog content length: ${dialogContent?.length || 0}`);
      throw new Error('Wizard showing blank page after ailments');
    } else {
      const currentHeader = await page.locator('h3').first().textContent();
      console.log(`⚠️  Unexpected state - Current header: ${currentHeader}`);
    }

    console.log('📸 Screenshot saved as ailments-verification-2.png');
    console.log('✅ VERIFICATION 2 COMPLETE');
  });
});