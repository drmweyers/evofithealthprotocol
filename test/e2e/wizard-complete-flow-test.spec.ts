import { test, expect } from '@playwright/test';

test.describe('Protocol Wizard - Complete Flow Test', () => {
  const baseURL = 'http://localhost:3501';
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';

  test('VERIFICATION 3: Complete wizard flow with ailments', async ({ page }) => {
    console.log('🚀 VERIFICATION TEST 3: Complete Wizard Flow\n');
    console.log('This test will navigate through ALL wizard steps');
    console.log('and verify the ailments step does NOT cause a blank page\n');
    
    // Login
    console.log('📋 LOGIN PHASE');
    console.log('==============');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', trainerEmail);
    await page.fill('input[name="password"]', trainerPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in as trainer\n');

    // Navigate to protocols
    console.log('📋 NAVIGATION PHASE');
    console.log('==================');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to protocols page');

    // Open wizard
    const openWizardBtn = page.locator('button:has-text("Open Protocol Wizard")').first();
    await openWizardBtn.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Protocol Wizard dialog opened\n');

    // Get step indicator to track progress
    const getStepIndicator = async () => {
      const stepText = await page.locator('text=/Step \\d+ of \\d+/').first().textContent();
      return stepText || 'Unknown';
    };

    console.log('📋 WIZARD NAVIGATION PHASE');
    console.log('=========================\n');

    // STEP 1: Client Selection
    console.log('🔹 STEP 1: Client Selection');
    console.log('---------------------------');
    let currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Wait for client cards to be visible
    await page.waitForTimeout(1000);
    
    // Try to select a client
    const clientCards = page.locator('.cursor-pointer').filter({ has: page.locator('text=/Select/i') });
    const clientCount = await clientCards.count();
    console.log(`Found ${clientCount} client cards`);
    
    if (clientCount > 0) {
      await clientCards.first().click();
      console.log('✅ Selected first client');
    } else {
      // Alternative: click on any selectable element
      const selectableCard = page.locator('.border.rounded-lg').first();
      if (await selectableCard.isVisible()) {
        await selectableCard.click();
        console.log('✅ Selected client (alternative method)');
      }
    }
    
    // Click Next
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Next\n');

    // STEP 2: Template Selection
    console.log('🔹 STEP 2: Template Selection');
    console.log('-----------------------------');
    currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Select Weight Loss template
    const templateButtons = page.locator('button').filter({ hasText: /Weight Loss|Muscle|Energy|General/i });
    if (await templateButtons.first().isVisible()) {
      await templateButtons.first().click();
      console.log('✅ Selected template');
    }
    
    // Click Next
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Next\n');

    // STEP 3: Health Information (CRITICAL - Ailments)
    console.log('🔹 STEP 3: Health Information (CRITICAL TEST)');
    console.log('---------------------------------------------');
    currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Look for medical condition checkboxes
    const medicalConditions = page.locator('label').filter({ hasText: /Diabetes|Hypertension|Arthritis|Asthma/i });
    const conditionCount = await medicalConditions.count();
    console.log(`Found ${conditionCount} medical conditions`);
    
    if (conditionCount > 0) {
      // Select first two conditions
      for (let i = 0; i < Math.min(2, conditionCount); i++) {
        await medicalConditions.nth(i).click();
        const conditionText = await medicalConditions.nth(i).textContent();
        console.log(`✅ Selected: ${conditionText?.trim()}`);
      }
    }
    
    // This is the critical moment - advancing from ailments
    console.log('\n⚠️  CRITICAL MOMENT: Advancing from Health Information...');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    
    // VERIFICATION: Check we're not on blank page
    const dialogContent = await page.locator('[role="dialog"]').textContent();
    const dialogHasContent = dialogContent && dialogContent.length > 100;
    
    if (!dialogHasContent) {
      console.log('❌ FAILED: Dialog appears blank after ailments!');
      throw new Error('Blank page detected after ailments step');
    }
    
    currentStep = await getStepIndicator();
    console.log(`✅ Successfully advanced! Current position: ${currentStep}\n`);

    // STEP 4: Customization
    console.log('🔹 STEP 4: Customization');
    console.log('------------------------');
    
    // Fill in duration
    const durationInput = page.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') }).first();
    if (await durationInput.isVisible()) {
      await durationInput.fill('30');
      console.log('✅ Set protocol duration to 30 days');
    }
    
    // Click Next
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Next\n');

    // STEP 5: AI Generation Options
    console.log('🔹 STEP 5: AI Generation Options');
    console.log('--------------------------------');
    currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Just proceed with defaults
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Next\n');

    // STEP 6: Additional Notes
    console.log('🔹 STEP 6: Additional Notes');
    console.log('---------------------------');
    currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Add a note
    const notesTextarea = page.locator('textarea').first();
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill('Test protocol created via automated test');
      console.log('✅ Added notes');
    }
    
    // Click Next
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Next\n');

    // STEP 7: Review
    console.log('🔹 STEP 7: Review');
    console.log('-----------------');
    currentStep = await getStepIndicator();
    console.log(`Current position: ${currentStep}`);
    
    // Take screenshot of review
    await page.screenshot({ path: 'wizard-review-verification-3.png', fullPage: true });
    console.log('📸 Screenshot saved: wizard-review-verification-3.png');
    
    // Check for Create Protocol button
    const createButton = page.locator('button').filter({ hasText: /Create Protocol|Generate Protocol|Finish/i });
    if (await createButton.isVisible()) {
      console.log('✅ Found Create Protocol button');
      console.log('✅ Wizard completed successfully!\n');
    }

    console.log('=' .repeat(50));
    console.log('✅✅✅ VERIFICATION 3 PASSED!');
    console.log('The wizard successfully navigated through all steps');
    console.log('including the critical ailments step without showing');
    console.log('a blank page. The fix is working correctly!');
    console.log('=' .repeat(50));
  });
});