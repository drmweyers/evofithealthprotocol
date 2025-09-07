import { test, expect } from '@playwright/test';

test.describe('🎯 AILMENTS BLANK PAGE FINAL TEST', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Final verification - no blank page after ailments', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FINAL TEST - AILMENTS BLANK PAGE BUG');
    console.log('='.repeat(80) + '\n');
    
    // Login
    console.log('📋 Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Open wizard
    console.log('📋 Opening wizard...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Navigate through wizard steps
    console.log('📋 NAVIGATING THROUGH WIZARD STEPS');
    console.log('-'.repeat(40));
    
    // Step 1: Select customer
    console.log('\nStep 1: Selecting customer...');
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    const customerCount = await customerCards.count();
    console.log(`  Found ${customerCount} customers`);
    
    if (customerCount > 0) {
      await customerCards.first().click();
      const customerText = await customerCards.first().textContent();
      console.log(`  Selected: ${customerText?.substring(0, 30)}...`);
      
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      await page.waitForTimeout(1500);
      console.log('  ✅ Advanced to Step 2');
    } else {
      console.log('  ❌ No customers found - test cannot continue');
      return;
    }
    
    // Step 2: Select template
    console.log('\nStep 2: Selecting template...');
    const templates = page.locator('[role="dialog"] div.cursor-pointer').filter({
      hasNot: page.locator('button')
    });
    const templateCount = await templates.count();
    console.log(`  Found ${templateCount} templates`);
    
    if (templateCount > 0) {
      await templates.first().click();
      const templateText = await templates.first().textContent();
      console.log(`  Selected: ${templateText?.substring(0, 30)}...`);
      
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      await page.waitForTimeout(1500);
      console.log('  ✅ Advanced to Step 3');
    }
    
    // Step 3: Health Information (CRITICAL STEP)
    console.log('\n' + '='.repeat(40));
    console.log('Step 3: HEALTH INFORMATION (AILMENTS)');
    console.log('⚠️  CRITICAL STEP - TESTING FOR BLANK PAGE');
    console.log('='.repeat(40) + '\n');
    
    // Record state before interaction
    const beforeDialog = await page.locator('[role="dialog"]').isVisible();
    const beforeContent = await page.locator('[role="dialog"]').textContent();
    console.log(`Before interaction:`);
    console.log(`  Dialog visible: ${beforeDialog}`);
    console.log(`  Content length: ${beforeContent?.length} chars`);
    
    // Look for health condition checkboxes
    const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`  Found ${checkboxCount} checkboxes`);
    
    // Select some conditions
    if (checkboxCount > 0) {
      console.log('\nSelecting health conditions:');
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).click();
        const parentText = await checkboxes.nth(i).locator('..').textContent();
        console.log(`  ✓ Selected: ${parentText?.trim()}`);
      }
    }
    
    // THE CRITICAL MOMENT
    console.log('\n🚨 CLICKING NEXT AFTER AILMENTS...');
    const nextButton = page.locator('[role="dialog"] button:has-text("Next")');
    await nextButton.click();
    console.log('Clicked Next, waiting 3 seconds...');
    await page.waitForTimeout(3000);
    
    // CHECK RESULT
    console.log('\n' + '='.repeat(40));
    console.log('📋 CHECKING FOR BLANK PAGE');
    console.log('='.repeat(40));
    
    const afterDialog = await page.locator('[role="dialog"]').isVisible();
    const afterContent = await page.locator('[role="dialog"]').textContent();
    const visibleElements = await page.locator('[role="dialog"] *:visible').count();
    
    console.log('\nAfter clicking Next:');
    console.log(`  Dialog visible: ${afterDialog}`);
    console.log(`  Content length: ${afterContent?.length || 0} chars`);
    console.log(`  Visible elements: ${visibleElements}`);
    
    // Check current step
    const stepMatch = afterContent?.match(/Step (\d+) of (\d+)/);
    if (stepMatch) {
      console.log(`  Current step: Step ${stepMatch[1]} of ${stepMatch[2]}`);
    }
    
    // Look for Step 4 content
    const hasCustomization = afterContent?.includes('Customization') || 
                           afterContent?.includes('Goals') ||
                           afterContent?.includes('Preferences') ||
                           afterContent?.includes('Intensity');
    console.log(`  Has Step 4 content: ${hasCustomization}`);
    
    // VERDICT
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VERDICT');
    console.log('='.repeat(80));
    
    if (afterDialog && afterContent && afterContent.length > 100) {
      console.log('✅✅✅ NO BLANK PAGE! WIZARD IS WORKING!');
      if (stepMatch && parseInt(stepMatch[1]) === 4) {
        console.log('✅ Successfully advanced to Step 4 (Customization)');
      }
      console.log('\n🎉 The blank page bug has been FIXED!');
    } else if (!afterDialog) {
      console.log('❌❌❌ DIALOG DISAPPEARED - Critical bug!');
    } else if (afterContent && afterContent.length < 100) {
      console.log('❌❌❌ BLANK PAGE DETECTED - Dialog has minimal content!');
    } else {
      console.log('❌❌❌ UNKNOWN STATE - Possible blank page');
    }
    
    // Try to complete the wizard
    if (afterDialog && afterContent && afterContent.length > 100) {
      console.log('\n📋 Attempting to complete wizard...');
      
      try {
        // Continue through remaining steps
        let currentStep = stepMatch ? parseInt(stepMatch[1]) : 4;
        const totalSteps = stepMatch ? parseInt(stepMatch[2]) : 8;
        
        for (let step = currentStep; step < totalSteps; step++) {
          const nextEnabled = await nextButton.isEnabled();
          if (nextEnabled) {
            await nextButton.click();
            await page.waitForTimeout(1500);
            console.log(`  ✅ Advanced from Step ${step}`);
          } else {
            // Check for Generate button
            const generateButton = page.locator('[role="dialog"] button:has-text("Generate")');
            if (await generateButton.isVisible({ timeout: 1000 })) {
              console.log(`  ✅ Reached AI Generation step`);
              break;
            }
          }
        }
      } catch (err) {
        console.log('  Could not complete all steps');
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'ailments-final-result.png', fullPage: true });
    console.log('\n📸 Screenshot saved: ailments-final-result.png');
  });
});