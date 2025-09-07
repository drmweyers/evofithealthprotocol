import { test, expect } from '@playwright/test';

test.describe('🎯 COMPLETE WIZARD FLOW TEST', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Complete wizard flow from start to finish', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 TESTING COMPLETE WIZARD FLOW');
    console.log('='.repeat(80) + '\n');
    
    // Step 1: Login
    console.log('📋 Step 1: Logging in as trainer...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Step 2: Open wizard
    console.log('📋 Step 2: Opening Protocol Wizard...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Step 3: Select customer
    console.log('📋 Step 3: Selecting customer...');
    await page.waitForTimeout(1000);
    
    // Count customer cards
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    const cardCount = await customerCards.count();
    console.log(`  Found ${cardCount} customers`);
    
    if (cardCount > 0) {
      // Click first customer
      await customerCards.first().click();
      console.log('  ✅ Selected first customer');
      
      // Click Next
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      await page.waitForTimeout(1500);
      
      // Verify we advanced
      const step = await page.locator('[role="dialog"]').textContent();
      if (step?.includes('Step 2')) {
        console.log('  ✅ Advanced to Step 2\n');
      }
    }
    
    // Step 4: Select template
    console.log('📋 Step 4: Selecting protocol template...');
    await page.waitForTimeout(1000);
    
    // Look for template buttons
    const templateButtons = page.locator('[role="dialog"] button.p-4');
    const templateCount = await templateButtons.count();
    console.log(`  Found ${templateCount} template options`);
    
    if (templateCount > 0) {
      // Click first template
      await templateButtons.first().click();
      console.log('  ✅ Selected template');
      
      // Click Next
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      await page.waitForTimeout(1500);
      
      const step = await page.locator('[role="dialog"]').textContent();
      if (step?.includes('Step 3')) {
        console.log('  ✅ Advanced to Step 3\n');
      }
    }
    
    // Step 5: Health Information
    console.log('📋 Step 5: Health Information (Ailments)...');
    console.log('⚠️  CRITICAL STEP - This is where blank page was reported');
    await page.waitForTimeout(1000);
    
    // Check if we have checkboxes for ailments
    const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`  Found ${checkboxCount} health condition checkboxes`);
    
    if (checkboxCount > 0) {
      // Select first ailment
      await checkboxes.first().click();
      console.log('  ✅ Selected an ailment');
    }
    
    // Click Next after ailments
    console.log('  🔍 Clicking Next after ailments...');
    await page.locator('[role="dialog"] button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    
    // CRITICAL CHECK: Is the dialog still visible and has content?
    const dialogVisible = await page.locator('[role="dialog"]').isVisible();
    const dialogContent = await page.locator('[role="dialog"]').textContent();
    
    if (dialogVisible && dialogContent && dialogContent.length > 100) {
      console.log('  ✅✅✅ NO BLANK PAGE! Dialog still has content');
      const currentStep = await page.locator('[role="dialog"]').textContent();
      if (currentStep?.includes('Step 4')) {
        console.log('  ✅ Successfully advanced to Step 4\n');
      }
    } else {
      console.log('  ❌❌❌ BLANK PAGE DETECTED after ailments!');
      console.log(`  Dialog visible: ${dialogVisible}`);
      console.log(`  Content length: ${dialogContent?.length || 0}`);
    }
    
    // Step 6: Try to continue through remaining steps
    console.log('📋 Step 6: Attempting to complete remaining steps...');
    
    // Check current step number
    const stepMatch = dialogContent?.match(/Step (\d+) of (\d+)/);
    if (stepMatch) {
      const currentStepNum = parseInt(stepMatch[1]);
      const totalSteps = parseInt(stepMatch[2]);
      console.log(`  Currently on Step ${currentStepNum} of ${totalSteps}`);
      
      // Try to advance through remaining steps
      for (let i = currentStepNum; i < totalSteps; i++) {
        try {
          const nextButton = page.locator('[role="dialog"] button:has-text("Next")');
          const generateButton = page.locator('[role="dialog"] button:has-text("Generate")');
          
          if (await generateButton.isVisible({ timeout: 1000 })) {
            console.log(`  Step ${i}: Found Generate button - likely on final step`);
            break;
          } else if (await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForTimeout(1500);
            console.log(`  ✅ Advanced from Step ${i}`);
          } else {
            console.log(`  ⚠️ Next button disabled on Step ${i}`);
            break;
          }
        } catch (err) {
          console.log(`  ⚠️ Could not advance from Step ${i}`);
          break;
        }
      }
    }
    
    // Final check
    console.log('\n' + '='.repeat(80));
    console.log('🔍 FINAL WIZARD STATUS');
    console.log('='.repeat(80));
    
    const finalDialog = await page.locator('[role="dialog"]').isVisible();
    const finalContent = await page.locator('[role="dialog"]').textContent();
    
    if (finalDialog && finalContent && finalContent.length > 100) {
      console.log('✅ Wizard is still functioning');
      console.log('✅ No blank page encountered');
      
      // Check if we can see Generate button (final step)
      const hasGenerate = await page.locator('[role="dialog"] button:has-text("Generate")').isVisible({ timeout: 1000 }).catch(() => false);
      if (hasGenerate) {
        console.log('✅ Reached protocol generation step!');
      }
    } else {
      console.log('❌ Wizard has blank page or closed unexpectedly');
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'wizard-final-state.png' });
    console.log('\n📸 Screenshot saved: wizard-final-state.png');
  });
});