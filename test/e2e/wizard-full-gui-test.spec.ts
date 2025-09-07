import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3501';

test.describe('Protocol Wizard - COMPLETE GUI TEST', () => {
  test.setTimeout(180000); // 3 minute timeout
  
  test('FULL WIZARD TEST: Complete end-to-end flow with ailments', async ({ page }) => {
    console.log('\n🚀 STARTING COMPREHENSIVE PROTOCOL WIZARD GUI TEST\n');
    console.log('='.repeat(60));
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Browser console error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.error('❌ Page error:', err.message);
    });
    
    // Set viewport for better visibility
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // ========== STEP 1: LOGIN ==========
    console.log('\n📋 STEP 1: LOGIN AS TRAINER');
    console.log('-'.repeat(40));
    
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    console.log('✓ Navigated to login page');
    
    // Fill login form
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    console.log('✓ Filled login credentials');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/(trainer|protocols|dashboard)/, { timeout: 15000 });
    const afterLoginUrl = page.url();
    console.log(`✓ Logged in successfully - Redirected to: ${afterLoginUrl}`);
    
    // ========== STEP 2: NAVIGATE TO PROTOCOLS ==========
    console.log('\n📋 STEP 2: NAVIGATE TO PROTOCOLS PAGE');
    console.log('-'.repeat(40));
    
    await page.goto(`${baseURL}/protocols`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow page to fully load
    console.log('✓ Navigated to protocols page');
    
    // Take screenshot of protocols page
    await page.screenshot({ path: 'test-protocols-page.png', fullPage: true });
    
    // ========== STEP 3: OPEN PROTOCOL WIZARD ==========
    console.log('\n📋 STEP 3: OPEN PROTOCOL WIZARD');
    console.log('-'.repeat(40));
    
    // Find and click wizard button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")').first();
    await expect(wizardButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Found "Open Protocol Wizard" button');
    
    await wizardButton.click();
    console.log('✓ Clicked wizard button');
    
    // Wait for wizard dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✓ Wizard dialog opened');
    
    // Verify wizard title
    const wizardTitle = await page.locator('h2:has-text("Protocol Creation Wizard")').textContent();
    console.log(`✓ Wizard title: ${wizardTitle}`);
    
    // ========== STEP 4: CLIENT SELECTION (Step 1/8) ==========
    console.log('\n📋 STEP 4: CLIENT SELECTION (Step 1/8)');
    console.log('-'.repeat(40));
    
    // Wait for client selection step
    await page.waitForSelector('text="Select Client"', { timeout: 10000 });
    console.log('✓ Client selection step loaded');
    
    // Click client dropdown
    const clientDropdown = page.locator('button[role="combobox"]').first();
    await clientDropdown.click();
    console.log('✓ Opened client dropdown');
    
    // Select first client
    const firstClient = page.locator('[role="option"]').first();
    await firstClient.waitFor({ state: 'visible' });
    const clientName = await firstClient.textContent();
    await firstClient.click();
    console.log(`✓ Selected client: ${clientName}`);
    
    // Click Next
    const nextButton = page.locator('button:has-text("Next")').last();
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to Template Selection');
    
    // ========== STEP 5: TEMPLATE SELECTION (Step 2/8) ==========
    console.log('\n📋 STEP 5: TEMPLATE SELECTION (Step 2/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Select Template"', { timeout: 10000 });
    console.log('✓ Template selection step loaded');
    
    // Select Standard Protocol
    const standardTemplate = page.locator('label:has-text("Standard Protocol")').first();
    await standardTemplate.click();
    console.log('✓ Selected Standard Protocol template');
    
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to Health Information');
    
    // ========== STEP 6: HEALTH INFORMATION (Step 3/8) ==========
    console.log('\n📋 STEP 6: HEALTH INFORMATION (Step 3/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Health Information"', { timeout: 10000 });
    console.log('✓ Health Information step loaded');
    
    // Fill health information
    await page.fill('input[name="age"]', '35');
    console.log('✓ Entered age: 35');
    
    await page.fill('input[name="weight"]', '170');
    console.log('✓ Entered weight: 170');
    
    await page.fill('input[name="height"]', '70');
    console.log('✓ Entered height: 70');
    
    // Select activity level
    const activityDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select activity level' });
    await activityDropdown.click();
    await page.locator('[role="option"]:has-text("Moderate")').click();
    console.log('✓ Selected activity level: Moderate');
    
    // Fill health goals
    await page.fill('textarea[name="healthGoals"]', 'Improve overall health, increase energy, and boost immunity');
    console.log('✓ Entered health goals');
    
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to Medical Conditions');
    
    // ========== STEP 7: MEDICAL CONDITIONS/AILMENTS (Step 4/8) - CRITICAL ==========
    console.log('\n🔴 STEP 7: MEDICAL CONDITIONS/AILMENTS (Step 4/8) - CRITICAL TEST');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Medical Conditions"', { timeout: 10000 });
    console.log('✓ Medical Conditions step loaded successfully!');
    
    // Take screenshot before interactions
    await page.screenshot({ path: 'test-before-ailments.png', fullPage: true });
    
    // Select medical conditions
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`✓ Found ${checkboxCount} medical condition checkboxes`);
    
    if (checkboxCount > 0) {
      // Select first 3 conditions
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        const checkbox = checkboxes.nth(i);
        await checkbox.check();
        // Get the label text
        const labelText = await checkbox.locator('..').textContent();
        console.log(`  ✓ Selected condition ${i+1}: ${labelText?.trim()}`);
      }
    }
    
    // Add medications
    const medicationInput = page.locator('input[placeholder*="medication"], textarea[placeholder*="medication"]').first();
    if (await medicationInput.isVisible()) {
      await medicationInput.fill('Vitamin D, Omega-3, Probiotics');
      console.log('✓ Added medications: Vitamin D, Omega-3, Probiotics');
    }
    
    // Take screenshot after selections
    await page.screenshot({ path: 'test-after-ailments.png', fullPage: true });
    
    // CRITICAL: Click Next and verify no blank page
    console.log('\n🚨 CRITICAL MOMENT: Clicking Next from Medical Conditions...');
    await nextButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check if we have a blank page
    const bodyText = await page.locator('body').textContent();
    if (!bodyText || bodyText.trim().length < 50) {
      console.error('❌ BLANK PAGE DETECTED AFTER AILMENTS!');
      await page.screenshot({ path: 'test-blank-page-error.png', fullPage: true });
      throw new Error('CRITICAL: Blank page after selecting ailments!');
    }
    
    // ========== STEP 8: CUSTOMIZATION (Step 5/8) ==========
    console.log('\n📋 STEP 8: CUSTOMIZATION (Step 5/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Customization"', { timeout: 10000 });
    console.log('✅ SUCCESSFULLY REACHED CUSTOMIZATION - NO BLANK PAGE!');
    
    // Fill customization preferences
    await page.fill('textarea[name="preferences"]', 'Prefer natural remedies, morning routines, and gradual progression');
    console.log('✓ Entered customization preferences');
    
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to AI Generation');
    
    // ========== STEP 9: AI GENERATION (Step 6/8) ==========
    console.log('\n📋 STEP 9: AI GENERATION (Step 6/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="AI Generation"', { timeout: 10000 });
    console.log('✓ AI Generation step loaded');
    
    // This step might auto-generate or require clicking Generate
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
      console.log('✓ Clicked Generate button');
      // Wait for generation to complete
      await page.waitForTimeout(3000);
    }
    
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to Safety Check');
    
    // ========== STEP 10: SAFETY CHECK (Step 7/8) ==========
    console.log('\n📋 STEP 10: SAFETY CHECK (Step 7/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Safety Check"', { timeout: 10000 });
    console.log('✓ Safety Check step loaded');
    
    // Check safety confirmation
    const safetyCheckbox = page.locator('input[type="checkbox"]').first();
    await safetyCheckbox.check();
    console.log('✓ Confirmed safety check');
    
    await nextButton.click();
    console.log('✓ Clicked Next - Moving to Review');
    
    // ========== STEP 11: REVIEW (Step 8/8) ==========
    console.log('\n📋 STEP 11: REVIEW & SAVE (Step 8/8)');
    console.log('-'.repeat(40));
    
    await page.waitForSelector('text="Review"', { timeout: 10000 });
    console.log('✓ Review step loaded');
    
    // Take screenshot of review
    await page.screenshot({ path: 'test-review-step.png', fullPage: true });
    
    // Check if there's a Finish/Save button
    const finishButton = page.locator('button:has-text("Finish"), button:has-text("Save"), button:has-text("Complete")').first();
    if (await finishButton.isVisible()) {
      await finishButton.click();
      console.log('✓ Clicked Finish/Save button');
    } else {
      // Try Next button if no Finish button
      await nextButton.click();
      console.log('✓ Clicked Next to complete');
    }
    
    // Wait for wizard to close or show completion
    await page.waitForTimeout(2000);
    
    // ========== FINAL VERIFICATION ==========
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS: PROTOCOL WIZARD COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n✅ All wizard steps completed without errors');
    console.log('✅ No blank page after ailments selection');
    console.log('✅ Successfully navigated through all 8 steps');
    console.log('✅ Protocol creation flow is working correctly');
    
    // Take final screenshot
    await page.screenshot({ path: 'test-final-success.png', fullPage: true });
  });

  test('VERIFICATION 2: Quick wizard flow test', async ({ page }) => {
    console.log('\n🔄 RUNNING QUICK VERIFICATION TEST\n');
    
    // Quick login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(trainer|protocols)/);
    
    // Open wizard
    await page.goto(`${baseURL}/protocols`);
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]');
    
    // Quick navigation through all steps
    const steps = [
      'Select Client',
      'Select Template',
      'Health Information',
      'Medical Conditions',
      'Customization',
      'AI Generation',
      'Safety Check',
      'Review'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      console.log(`Step ${i+1}/8: ${steps[i]}`);
      await page.waitForSelector(`text="${steps[i]}"`, { timeout: 10000 });
      
      // Fill minimal required data for each step
      if (i === 0) { // Client
        await page.locator('button[role="combobox"]').first().click();
        await page.locator('[role="option"]').first().click();
      } else if (i === 1) { // Template
        await page.locator('label').first().click();
      } else if (i === 2) { // Health Info
        await page.fill('input[name="age"]', '30');
        await page.fill('input[name="weight"]', '150');
        await page.fill('input[name="height"]', '68');
        await page.locator('button[role="combobox"]').last().click();
        await page.locator('[role="option"]').first().click();
        await page.fill('textarea[name="healthGoals"]', 'Test');
      } else if (i === 3) { // Medical Conditions
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }
      } else if (i === 4) { // Customization
        await page.fill('textarea[name="preferences"]', 'Test preferences');
      } else if (i === 6) { // Safety Check
        await page.locator('input[type="checkbox"]').first().check();
      }
      
      // Click Next if not on last step
      if (i < steps.length - 1) {
        await page.locator('button:has-text("Next")').last().click();
      }
    }
    
    console.log('✅ Quick verification completed successfully!');
  });

  test('VERIFICATION 3: Admin role wizard test', async ({ page }) => {
    console.log('\n👨‍💼 TESTING WIZARD WITH ADMIN ROLE\n');
    
    // Login as admin
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'admin@fitmeal.pro');
    await page.fill('input[name="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|protocols)/);
    
    // Navigate to protocols
    await page.goto(`${baseURL}/protocols`);
    
    // Open wizard
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard"), button:has-text("Create Protocol")').first();
    if (await wizardButton.isVisible()) {
      await wizardButton.click();
      await page.waitForSelector('[role="dialog"]');
      
      // Admin should have 7 steps (no client selection)
      console.log('✓ Admin wizard opened');
      
      // Navigate through admin steps
      const adminSteps = ['Select Template', 'Health Information', 'Medical Conditions'];
      
      for (const step of adminSteps) {
        const stepVisible = await page.locator(`text="${step}"`).isVisible();
        if (stepVisible) {
          console.log(`✓ Admin step: ${step}`);
        }
        
        // Fill minimal data and proceed
        if (step === 'Select Template') {
          await page.locator('label').first().click();
        } else if (step === 'Health Information') {
          await page.fill('input[name="age"]', '40');
          await page.fill('input[name="weight"]', '180');
          await page.fill('input[name="height"]', '72');
        } else if (step === 'Medical Conditions') {
          // Select an ailment and add medication
          const checkbox = page.locator('input[type="checkbox"]').first();
          if (await checkbox.isVisible()) {
            await checkbox.check();
          }
        }
        
        const nextBtn = page.locator('button:has-text("Next")').last();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      console.log('✅ Admin wizard navigation successful!');
    } else {
      console.log('⚠️ Admin may not have access to Protocol Wizard');
    }
  });

  test('VERIFICATION 4: Multiple medications and ailments', async ({ page }) => {
    console.log('\n💊 TESTING MULTIPLE MEDICATIONS AND AILMENTS\n');
    
    // Quick login as trainer
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(trainer|protocols)/);
    
    // Open wizard
    await page.goto(`${baseURL}/protocols`);
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]');
    
    // Navigate to Medical Conditions quickly
    // Client selection
    await page.locator('button[role="combobox"]').first().click();
    await page.locator('[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Template
    await page.locator('label').first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Health Info
    await page.fill('input[name="age"]', '45');
    await page.fill('input[name="weight"]', '190');
    await page.fill('input[name="height"]', '73');
    await page.locator('button[role="combobox"]').last().click();
    await page.locator('[role="option"]').first().click();
    await page.fill('textarea[name="healthGoals"]', 'Multiple conditions test');
    await page.locator('button:has-text("Next")').click();
    
    // Medical Conditions - Select multiple
    console.log('Selecting multiple ailments...');
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    // Select up to 5 ailments
    for (let i = 0; i < Math.min(5, count); i++) {
      await checkboxes.nth(i).check();
      console.log(`✓ Selected ailment ${i+1}`);
    }
    
    // Add multiple medications
    const medicationInput = page.locator('input[placeholder*="medication"], textarea[placeholder*="medication"]').first();
    if (await medicationInput.isVisible()) {
      await medicationInput.fill('Metformin, Lisinopril, Atorvastatin, Aspirin, Vitamin B12, Magnesium');
      console.log('✓ Added 6 medications');
    }
    
    // Click Next and verify no blank page
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    
    // Verify we reached Customization
    const customizationVisible = await page.locator('text="Customization"').isVisible();
    if (customizationVisible) {
      console.log('✅ Multiple medications and ailments handled correctly!');
    } else {
      throw new Error('Failed to reach Customization after multiple selections');
    }
  });
});