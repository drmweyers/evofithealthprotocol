import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3501';

test.describe('Protocol Wizard - Ailments Step Blank Page Issue', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000);
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('CRITICAL: Wizard should NOT show blank page after selecting ailments', async ({ page }) => {
    console.log('\n=== TESTING AILMENTS STEP - BLANK PAGE ISSUE ===\n');
    
    // Step 1: Login as trainer
    console.log('Step 1: Logging in as trainer...');
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState('domcontentloaded');
    
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/\/(protocols|trainer)/, { timeout: 10000 });
    console.log('✅ Logged in successfully');
    
    // Step 2: Navigate to protocols page
    console.log('Step 2: Navigating to protocols page...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    
    // Step 3: Open Protocol Wizard
    console.log('Step 3: Opening Protocol Wizard...');
    const openWizardButton = page.locator('button:has-text("Open Protocol Wizard")').first();
    await openWizardButton.waitFor({ state: 'visible', timeout: 10000 });
    await openWizardButton.click();
    
    // Verify wizard opened
    await page.waitForSelector('text="Protocol Creation Wizard"', { timeout: 10000 });
    console.log('✅ Wizard opened successfully');
    
    // Step 4: Select a client (Step 1)
    console.log('Step 4: Selecting client...');
    const clientSelect = page.locator('button[role="combobox"]').first();
    await clientSelect.click();
    
    // Select first available client
    const firstClient = page.locator('[role="option"]').first();
    await firstClient.waitFor({ state: 'visible' });
    const clientName = await firstClient.textContent();
    console.log(`Selecting client: ${clientName}`);
    await firstClient.click();
    
    // Click Next
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    console.log('✅ Client selected, moved to next step');
    
    // Step 5: Select template (Step 2)
    console.log('Step 5: Selecting template...');
    await page.waitForSelector('text="Select Template"', { timeout: 10000 });
    
    // Select Standard Protocol
    const standardTemplate = page.locator('label:has-text("Standard Protocol")').first();
    await standardTemplate.click();
    await nextButton.click();
    console.log('✅ Template selected, moved to next step');
    
    // Step 6: Fill Health Information (Step 3)
    console.log('Step 6: Filling health information...');
    await page.waitForSelector('text="Health Information"', { timeout: 10000 });
    
    // Fill in required fields
    await page.fill('input[name="age"]', '35');
    await page.fill('input[name="weight"]', '170');
    await page.fill('input[name="height"]', '70');
    
    // Select activity level
    const activitySelect = page.locator('button[role="combobox"]').filter({ hasText: 'Select activity level' });
    await activitySelect.click();
    await page.locator('[role="option"]:has-text("Moderate")').click();
    
    // Fill health goals
    await page.fill('textarea[name="healthGoals"]', 'Improve overall health and wellness');
    
    await nextButton.click();
    console.log('✅ Health information filled, moved to next step');
    
    // Step 7: CRITICAL - Medical Conditions/Ailments (Step 4)
    console.log('\n🔴 CRITICAL STEP: Medical Conditions/Ailments Selection...');
    
    // Wait for the Medical Conditions step to load
    await page.waitForSelector('text="Medical Conditions"', { timeout: 10000 });
    console.log('Medical Conditions step loaded');
    
    // Take a screenshot before selecting ailments
    await page.screenshot({ path: 'before-ailments-selection.png', fullPage: true });
    
    // Check what's on the page
    const pageContent = await page.content();
    console.log('Page has Medical Conditions step:', pageContent.includes('Medical Conditions'));
    
    // Try to select some ailments
    const ailmentCheckboxes = page.locator('input[type="checkbox"]');
    const ailmentCount = await ailmentCheckboxes.count();
    console.log(`Found ${ailmentCount} ailment checkboxes`);
    
    if (ailmentCount > 0) {
      // Select first 2 ailments
      for (let i = 0; i < Math.min(2, ailmentCount); i++) {
        await ailmentCheckboxes.nth(i).check();
        const label = await ailmentCheckboxes.nth(i).locator('..').textContent();
        console.log(`Selected ailment: ${label}`);
      }
    }
    
    // Add medications
    const medicationInput = page.locator('input[placeholder*="medication"]');
    if (await medicationInput.isVisible()) {
      await medicationInput.fill('Aspirin');
      console.log('Added medication: Aspirin');
    }
    
    // Take screenshot after selections
    await page.screenshot({ path: 'after-ailments-selection.png', fullPage: true });
    
    // Click Next to move to the next step
    console.log('Clicking Next to proceed from Medical Conditions...');
    await nextButton.click();
    
    // CRITICAL CHECK: Verify we don't get a blank page
    console.log('\n🔍 CHECKING FOR BLANK PAGE ISSUE...');
    
    // Wait a moment for any navigation
    await page.waitForTimeout(2000);
    
    // Check if page is blank
    const bodyText = await page.locator('body').textContent();
    const isBlank = !bodyText || bodyText.trim().length < 50;
    
    if (isBlank) {
      console.error('❌ BLANK PAGE DETECTED AFTER AILMENTS STEP!');
      await page.screenshot({ path: 'blank-page-error.png', fullPage: true });
      
      // Try to debug what's happening
      const currentURL = page.url();
      console.log('Current URL:', currentURL);
      
      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);
      
      const htmlContent = await page.content();
      console.log('HTML Content Length:', htmlContent.length);
      console.log('First 500 chars of HTML:', htmlContent.substring(0, 500));
      
      throw new Error('CRITICAL: Blank page after ailments selection!');
    }
    
    // Verify we moved to the next step (Customization)
    try {
      await page.waitForSelector('text="Customization"', { timeout: 10000 });
      console.log('✅ Successfully moved to Customization step - NO BLANK PAGE!');
    } catch (e) {
      // Check what step we're on
      const currentStepText = await page.locator('.step-indicator, h2, h3').first().textContent();
      console.log('Current step text:', currentStepText);
      
      await page.screenshot({ path: 'unexpected-step.png', fullPage: true });
      throw new Error(`Did not reach Customization step. Current content: ${currentStepText}`);
    }
    
    // Continue through rest of wizard to ensure it completes
    console.log('\nStep 8: Continuing through rest of wizard...');
    
    // Customization step
    await page.fill('textarea[name="preferences"]', 'No specific preferences');
    await nextButton.click();
    console.log('✅ Customization completed');
    
    // AI Generation step
    await page.waitForSelector('text="AI Generation"', { timeout: 10000 });
    await nextButton.click();
    console.log('✅ AI Generation step completed');
    
    // Safety Check step
    await page.waitForSelector('text="Safety Check"', { timeout: 10000 });
    const safetyCheckbox = page.locator('input[type="checkbox"]').first();
    await safetyCheckbox.check();
    await nextButton.click();
    console.log('✅ Safety check completed');
    
    // Review step
    await page.waitForSelector('text="Review"', { timeout: 10000 });
    console.log('✅ Reached Review step');
    
    // Save Options step
    await nextButton.click();
    await page.waitForSelector('text="Save Options"', { timeout: 10000 });
    console.log('✅ Reached Save Options - Wizard completed successfully!');
    
    console.log('\n🎉 SUCCESS: Wizard completed without blank page issue!');
  });

  test('Verify wizard handles multiple medications correctly', async ({ page }) => {
    console.log('\n=== TESTING MULTIPLE MEDICATIONS ===\n');
    
    // Quick login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(protocols|trainer)/);
    
    // Open wizard
    await page.goto(`${baseURL}/protocols`);
    const openWizardButton = page.locator('button:has-text("Open Protocol Wizard")').first();
    await openWizardButton.click();
    
    // Navigate to Medical Conditions step quickly
    // Step 1: Client
    await page.locator('button[role="combobox"]').first().click();
    await page.locator('[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Step 2: Template
    await page.locator('label:has-text("Standard Protocol")').click();
    await page.locator('button:has-text("Next")').click();
    
    // Step 3: Health Info
    await page.fill('input[name="age"]', '40');
    await page.fill('input[name="weight"]', '180');
    await page.fill('input[name="height"]', '72');
    await page.locator('button[role="combobox"]').filter({ hasText: 'Select activity level' }).click();
    await page.locator('[role="option"]:has-text("Active")').click();
    await page.fill('textarea[name="healthGoals"]', 'Test multiple medications');
    await page.locator('button:has-text("Next")').click();
    
    // Step 4: Medical Conditions - Add multiple medications
    console.log('Adding multiple medications...');
    await page.waitForSelector('text="Medical Conditions"');
    
    // Add multiple medications
    const medicationInput = page.locator('input[placeholder*="medication"]');
    if (await medicationInput.isVisible()) {
      await medicationInput.fill('Aspirin, Metformin, Lisinopril');
      console.log('Added multiple medications');
    }
    
    // Select some conditions
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await checkboxes.nth(i).check();
    }
    
    // Click Next and verify no blank page
    await page.locator('button:has-text("Next")').click();
    
    // Verify we reach Customization
    await page.waitForSelector('text="Customization"', { timeout: 10000 });
    console.log('✅ Multiple medications handled correctly - no blank page!');
  });

  test('Verify wizard handles no ailments selection', async ({ page }) => {
    console.log('\n=== TESTING NO AILMENTS SELECTED ===\n');
    
    // Quick login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(protocols|trainer)/);
    
    // Open wizard and navigate to Medical Conditions
    await page.goto(`${baseURL}/protocols`);
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    
    // Quick navigation through steps
    await page.locator('button[role="combobox"]').first().click();
    await page.locator('[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();
    
    await page.locator('label:has-text("Standard Protocol")').click();
    await page.locator('button:has-text("Next")').click();
    
    await page.fill('input[name="age"]', '30');
    await page.fill('input[name="weight"]', '160');
    await page.fill('input[name="height"]', '68');
    await page.locator('button[role="combobox"]').filter({ hasText: 'Select activity level' }).click();
    await page.locator('[role="option"]:has-text("Light")').click();
    await page.fill('textarea[name="healthGoals"]', 'Test no ailments');
    await page.locator('button:has-text("Next")').click();
    
    // Don't select any ailments, just click Next
    console.log('Skipping ailments selection...');
    await page.waitForSelector('text="Medical Conditions"');
    await page.locator('button:has-text("Next")').click();
    
    // Verify we reach Customization
    await page.waitForSelector('text="Customization"', { timeout: 10000 });
    console.log('✅ No ailments handled correctly - no blank page!');
  });

  test('Complete wizard end-to-end verification', async ({ page }) => {
    console.log('\n=== FINAL END-TO-END VERIFICATION ===\n');
    
    // Login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(protocols|trainer)/);
    
    // Open wizard
    await page.goto(`${baseURL}/protocols`);
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    
    console.log('Step-by-step verification:');
    
    // Step 1: Client Selection
    await page.locator('button[role="combobox"]').first().click();
    await page.locator('[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 1: Client Selection - OK');
    
    // Step 2: Template
    await page.locator('label:has-text("Standard Protocol")').click();
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 2: Template Selection - OK');
    
    // Step 3: Health Info
    await page.fill('input[name="age"]', '45');
    await page.fill('input[name="weight"]', '185');
    await page.fill('input[name="height"]', '71');
    await page.locator('button[role="combobox"]').filter({ hasText: 'Select activity level' }).click();
    await page.locator('[role="option"]:has-text("Very Active")').click();
    await page.fill('textarea[name="healthGoals"]', 'Complete health transformation');
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 3: Health Information - OK');
    
    // Step 4: CRITICAL - Medical Conditions
    await page.waitForSelector('text="Medical Conditions"');
    
    // Select conditions and add medications
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().check();
    }
    
    const medicationInput = page.locator('input[placeholder*="medication"]');
    if (await medicationInput.isVisible()) {
      await medicationInput.fill('Vitamin D, Omega-3');
    }
    
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 4: Medical Conditions - OK (NO BLANK PAGE!)');
    
    // Step 5: Customization
    await page.waitForSelector('text="Customization"');
    await page.fill('textarea[name="preferences"]', 'Focus on natural remedies');
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 5: Customization - OK');
    
    // Step 6: AI Generation
    await page.waitForSelector('text="AI Generation"');
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 6: AI Generation - OK');
    
    // Step 7: Safety Check
    await page.waitForSelector('text="Safety Check"');
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 7: Safety Check - OK');
    
    // Step 8: Review
    await page.waitForSelector('text="Review"');
    await page.locator('button:has-text("Next")').click();
    console.log('✅ Step 8: Review - OK');
    
    // Step 9: Save Options
    await page.waitForSelector('text="Save Options"');
    console.log('✅ Step 9: Save Options - OK');
    
    console.log('\n🎉 COMPLETE SUCCESS: All wizard steps working perfectly!');
    console.log('NO BLANK PAGE ISSUE FOUND!');
  });
});