import { test, expect } from '@playwright/test';

test.describe('🔬 Wizard Ailments Step - Deep Investigation', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Navigate to ailments step and interact with it', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔬 TESTING WIZARD AILMENTS STEP INTERACTION');
    console.log('This test will navigate TO the ailments step and interact with it');
    console.log('='.repeat(80) + '\n');
    
    // Capture all errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ JS Error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log('❌ Page Error:', err.message);
    });
    
    // Login
    console.log('📋 Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Navigate to protocols
    console.log('📋 Opening wizard...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Verify initial state
    const initialContent = await page.locator('[role="dialog"]').textContent();
    console.log(`Initial dialog content length: ${initialContent?.length || 0} characters`);
    
    // STEP 1: Client Selection
    console.log('📋 STEP 1: CLIENT SELECTION');
    console.log('-'.repeat(40));
    
    // Look for client selection elements
    const clientSelectionVisible = await page.locator('text="Select Client"').isVisible();
    console.log(`"Select Client" visible: ${clientSelectionVisible}`);
    
    // Try to select a client
    // First, look for client dropdowns or cards
    const clientDropdown = page.locator('[role="dialog"] [role="combobox"], [role="dialog"] select').first();
    const hasDropdown = await clientDropdown.count() > 0;
    
    if (hasDropdown) {
      console.log('Found client dropdown, attempting to open...');
      await clientDropdown.click();
      await page.waitForTimeout(500);
      
      // Look for dropdown options
      const options = page.locator('[role="option"], [role="listbox"] > *');
      const optionCount = await options.count();
      console.log(`Found ${optionCount} options`);
      
      if (optionCount > 0) {
        await options.first().click();
        console.log('✅ Selected first client option');
      }
    } else {
      // Look for client cards
      const clientCards = page.locator('[role="dialog"] .border.rounded-lg, [role="dialog"] [data-testid*="client"]');
      const cardCount = await clientCards.count();
      console.log(`Found ${cardCount} client cards`);
      
      if (cardCount > 0) {
        await clientCards.first().click();
        console.log('✅ Clicked first client card');
      } else {
        console.log('⚠️  No client selection method found');
      }
    }
    
    // Wait and then click Next
    await page.waitForTimeout(1000);
    
    // Check if Next button is enabled now
    const nextButton = page.locator('[role="dialog"] button:has-text("Next")').first();
    const nextEnabled = await nextButton.isEnabled();
    console.log(`Next button enabled: ${nextEnabled}`);
    
    if (!nextEnabled) {
      console.log('⚠️  Next button still disabled, trying to select client differently...');
      
      // Try clicking on any clickable element that might be a client
      const anyClickable = page.locator('[role="dialog"] [role="button"], [role="dialog"] .cursor-pointer').first();
      if (await anyClickable.count() > 0) {
        await anyClickable.click();
        await page.waitForTimeout(500);
        console.log('Clicked on a clickable element');
      }
    }
    
    // Try to click Next
    try {
      await nextButton.click({ timeout: 5000 });
      console.log('✅ Clicked Next\n');
    } catch (err) {
      console.log('❌ Could not click Next - button might be disabled');
      console.log('Attempting to force navigation...');
      
      // Take screenshot to see current state
      await page.screenshot({ path: 'stuck-on-client-selection.png' });
      console.log('📸 Screenshot saved: stuck-on-client-selection.png');
      
      // Try to manually select a client if we can find one
      const allTexts = await page.locator('[role="dialog"] *').allTextContents();
      console.log('Dialog contains:', allTexts.slice(0, 10));
      
      throw new Error('Cannot proceed past client selection');
    }
    
    // Wait for navigation
    await page.waitForTimeout(1500);
    
    // STEP 2: Template Selection
    console.log('📋 STEP 2: TEMPLATE SELECTION');
    console.log('-'.repeat(40));
    
    const onTemplateStep = await page.locator('text=/Template|Goal/i').isVisible();
    console.log(`On template step: ${onTemplateStep}`);
    
    if (onTemplateStep) {
      // Select a template
      const templateButtons = page.locator('[role="dialog"] button').filter({ hasText: /Weight Loss|Muscle|Energy|General/i });
      const templateCount = await templateButtons.count();
      console.log(`Found ${templateCount} template buttons`);
      
      if (templateCount > 0) {
        await templateButtons.first().click();
        console.log('✅ Selected template');
      }
      
      // Click Next
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      console.log('✅ Clicked Next\n');
      await page.waitForTimeout(1500);
    }
    
    // STEP 3: Health Information (CRITICAL - This is where it might break)
    console.log('📋 STEP 3: HEALTH INFORMATION (CRITICAL)');
    console.log('-'.repeat(40));
    
    // Check current dialog state BEFORE interacting
    const beforeAilmentsContent = await page.locator('[role="dialog"]').textContent();
    console.log(`Dialog content before ailments: ${beforeAilmentsContent?.length || 0} characters`);
    
    // Look for health/medical/ailments indicators
    const healthIndicators = {
      'Health Information': await page.locator('text="Health Information"').count(),
      'Medical Conditions': await page.locator('text=/Medical Conditions/i').count(),
      'Health Conditions': await page.locator('text=/Health Conditions/i').count(),
      'Ailments': await page.locator('text=/Ailments/i').count(),
      'Current Medications': await page.locator('text=/Current Medications/i').count(),
    };
    
    console.log('Health step indicators:');
    for (const [text, count] of Object.entries(healthIndicators)) {
      console.log(`  ${text}: ${count}`);
    }
    
    // Try to find and interact with ailment checkboxes
    const checkboxes = page.locator('[role="dialog"] input[type="checkbox"], [role="dialog"] [role="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Found ${checkboxCount} checkboxes`);
    
    if (checkboxCount > 0) {
      console.log('Selecting ailments...');
      // Click first two checkboxes
      for (let i = 0; i < Math.min(2, checkboxCount); i++) {
        await checkboxes.nth(i).click();
        console.log(`  ✅ Clicked checkbox ${i + 1}`);
        await page.waitForTimeout(500);
      }
    } else {
      // Look for labels that might be clickable
      const labels = page.locator('[role="dialog"] label').filter({ hasText: /Diabetes|Hypertension|Arthritis|Asthma|Heart/i });
      const labelCount = await labels.count();
      console.log(`Found ${labelCount} medical condition labels`);
      
      if (labelCount > 0) {
        for (let i = 0; i < Math.min(2, labelCount); i++) {
          await labels.nth(i).click();
          const labelText = await labels.nth(i).textContent();
          console.log(`  ✅ Selected: ${labelText}`);
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Check dialog state AFTER selecting ailments
    console.log('\n🔍 Checking dialog state after selecting ailments...');
    const afterAilmentsContent = await page.locator('[role="dialog"]').textContent();
    console.log(`Dialog content after ailments: ${afterAilmentsContent?.length || 0} characters`);
    
    if (!afterAilmentsContent || afterAilmentsContent.length < 50) {
      console.log('❌❌❌ CRITICAL: Dialog became blank after selecting ailments!');
      await page.screenshot({ path: 'blank-after-ailments.png' });
      console.log('📸 Screenshot saved: blank-after-ailments.png');
      throw new Error('Dialog is blank after selecting ailments');
    }
    
    // Try to click Next to advance from Health Information
    console.log('\n🔄 Attempting to advance from Health Information...');
    const nextFromHealth = page.locator('[role="dialog"] button:has-text("Next")').first();
    
    try {
      await nextFromHealth.click({ timeout: 5000 });
      console.log('✅ Clicked Next from Health Information');
    } catch (err) {
      console.log('❌ Could not click Next from Health Information');
      console.log('Error:', err.message);
    }
    
    // Wait and check what happens
    await page.waitForTimeout(2000);
    
    // CRITICAL CHECK: Is dialog still visible and has content?
    const dialogStillVisible = await page.locator('[role="dialog"]').isVisible();
    const finalContent = await page.locator('[role="dialog"]').textContent();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 FINAL STATE CHECK');
    console.log('='.repeat(80));
    console.log(`Dialog still visible: ${dialogStillVisible}`);
    console.log(`Final content length: ${finalContent?.length || 0} characters`);
    
    if (!dialogStillVisible) {
      console.log('❌ CRITICAL: Dialog disappeared!');
    } else if (!finalContent || finalContent.length < 50) {
      console.log('❌ CRITICAL: Dialog is blank!');
      console.log(`Content: "${finalContent}"`);
    } else {
      console.log('✅ Dialog still has content');
      
      // Check if we advanced to next step
      const onCustomization = await page.locator('text=/Customization/i').isVisible();
      const stillOnHealth = await page.locator('text="Health Information"').isVisible();
      
      if (onCustomization) {
        console.log('✅✅✅ Successfully advanced to Customization step!');
      } else if (stillOnHealth) {
        console.log('⚠️  Still on Health Information step - navigation blocked');
      } else {
        const currentText = finalContent.substring(0, 100);
        console.log(`Current dialog text: "${currentText}..."`);
      }
    }
    
    // Final screenshots
    await page.screenshot({ path: 'wizard-final-ailments-test.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: wizard-final-ailments-test.png');
    
    // Error summary
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors Found:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    // Final verdict
    const wizardWorking = dialogStillVisible && finalContent && finalContent.length > 100;
    
    if (!wizardWorking) {
      throw new Error('Wizard is NOT working correctly - see diagnostics above');
    } else {
      console.log('\n✅ Wizard appears to be working');
    }
  });
});