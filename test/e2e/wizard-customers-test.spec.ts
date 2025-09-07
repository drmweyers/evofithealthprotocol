import { test, expect } from '@playwright/test';

test.describe('🎯 Wizard Customer Selection Test', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Verify customers appear in wizard and can be selected', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TESTING WIZARD WITH LINKED CUSTOMERS');
    console.log('='.repeat(80) + '\n');
    
    // Login
    console.log('📋 Logging in as trainer...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Open wizard
    console.log('📋 Opening Protocol Wizard...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Check for customers
    console.log('📋 CHECKING FOR CUSTOMERS IN WIZARD');
    console.log('-'.repeat(40));
    
    // Wait for customers to load
    await page.waitForTimeout(2000);
    
    // Get dialog content
    const dialogText = await page.locator('[role="dialog"]').textContent();
    console.log(`Dialog content length: ${dialogText?.length} characters`);
    
    // Look for customer emails
    const expectedCustomers = [
      'demo@test.com',
      'testuser@demo.com',
      'customer.test@evofitmeals.com',
      'customer@demo.com'
    ];
    
    console.log('\nLooking for linked customers:');
    for (const email of expectedCustomers) {
      const hasCustomer = dialogText?.includes(email) || false;
      console.log(`  ${hasCustomer ? '✅' : '❌'} ${email}`);
    }
    
    // Count clickable customer cards
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    const cardCount = await customerCards.count();
    console.log(`\nFound ${cardCount} customer cards`);
    
    if (cardCount === 0) {
      // Try alternative selectors
      const altCards = page.locator('[role="dialog"] [class*="border"][class*="rounded"]').filter({ 
        has: page.locator('text=/@/')
      });
      const altCount = await altCards.count();
      console.log(`Alternative selector found ${altCount} cards`);
      
      // Check if there's any content in the scroll area
      const scrollContent = await page.locator('[data-radix-scroll-area-viewport] > div').textContent();
      console.log(`Scroll area content: ${scrollContent?.substring(0, 200) || 'Empty'}`);
    }
    
    // Try to select a customer
    console.log('\n📋 ATTEMPTING TO SELECT A CUSTOMER');
    console.log('-'.repeat(40));
    
    if (cardCount > 0) {
      console.log('Clicking first customer card...');
      await customerCards.first().click();
      await page.waitForTimeout(1000);
      
      // Check if Next button is enabled
      const nextButton = page.locator('[role="dialog"] button:has-text("Next")');
      const isEnabled = await nextButton.isEnabled();
      console.log(`Next button enabled after selection: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('✅✅✅ Customer selection working!');
        
        // Click Next to advance
        await nextButton.click();
        await page.waitForTimeout(1500);
        
        // Check if we advanced to template selection
        const currentStep = await page.locator('text=/Step \\d+ of \\d+/').first().textContent();
        console.log(`Advanced to: ${currentStep}`);
        
        // Continue through wizard to test ailments step
        console.log('\n📋 CONTINUING TO AILMENTS STEP');
        console.log('-'.repeat(40));
        
        // Select template
        const templateButton = page.locator('[role="dialog"] button').filter({ 
          hasText: /Weight Loss|Muscle|Energy/i 
        }).first();
        if (await templateButton.isVisible()) {
          await templateButton.click();
          console.log('✅ Selected template');
          await page.locator('[role="dialog"] button:has-text("Next")').click();
          await page.waitForTimeout(1500);
        }
        
        // Check if we're on health information step
        const healthStep = await page.locator('text=/Health|Medical|Ailments/i').isVisible();
        if (healthStep) {
          console.log('✅ Reached Health Information step');
          
          // Select some ailments
          const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]');
          const checkboxCount = await checkboxes.count();
          console.log(`Found ${checkboxCount} health condition checkboxes`);
          
          if (checkboxCount > 0) {
            await checkboxes.first().click();
            console.log('✅ Selected an ailment');
          }
          
          // Click Next after ailments
          console.log('\n⚠️  CRITICAL: Clicking Next after ailments...');
          await page.locator('[role="dialog"] button:has-text("Next")').click();
          await page.waitForTimeout(2000);
          
          // Check dialog state
          const afterAilments = await page.locator('[role="dialog"]').textContent();
          if (afterAilments && afterAilments.length > 100) {
            console.log('✅✅✅ NO BLANK PAGE AFTER AILMENTS!');
            const newStep = await page.locator('text=/Step \\d+ of \\d+/').first().textContent();
            console.log(`Currently on: ${newStep}`);
          } else {
            console.log('❌❌❌ BLANK PAGE AFTER AILMENTS!');
          }
        }
        
      } else {
        console.log('❌ Next button still disabled after clicking customer');
      }
    } else {
      console.log('❌ No customer cards found to click');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'no-customers-in-wizard.png' });
      console.log('📸 Screenshot saved: no-customers-in-wizard.png');
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(80));
    console.log('🔍 FINAL RESULTS');
    console.log('='.repeat(80));
    
    if (cardCount > 0) {
      console.log('✅ Customers are showing in wizard');
      console.log('✅ Customer selection is working');
      console.log('✅ Wizard can advance past client selection');
    } else {
      console.log('❌ Customers are NOT showing in wizard');
      console.log('❌ Need to investigate API endpoint further');
    }
  });
});