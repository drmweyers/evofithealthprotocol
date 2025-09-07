import { test, expect } from '@playwright/test';

test.describe('🔍 TEMPLATE CLICK TEST', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Test template selection click behavior', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 TESTING TEMPLATE SELECTION CLICK BEHAVIOR');
    console.log('='.repeat(80) + '\n');
    
    // Login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Open wizard
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Select customer
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    await customerCards.first().click();
    console.log('✅ Customer selected\n');
    
    // Click Next to go to template selection
    const nextButton = page.locator('[role="dialog"] button:has-text("Next")');
    await nextButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Advanced to template selection\n');
    
    // Analyze template selection state
    console.log('📋 ANALYZING TEMPLATE SELECTION');
    console.log('-'.repeat(40));
    
    // Check Next button initial state
    const nextDisabledBefore = await nextButton.isDisabled();
    console.log(`Next button disabled before selection: ${nextDisabledBefore}\n`);
    
    // Find templates using different selectors
    const templateSelectors = [
      '[role="dialog"] div.cursor-pointer',
      '[role="dialog"] [class*="card"].cursor-pointer',
      '[role="dialog"] div[class*="border"][class*="rounded"]'
    ];
    
    let templateClicked = false;
    
    for (const selector of templateSelectors) {
      const templates = page.locator(selector);
      const count = await templates.count();
      
      if (count > 0) {
        console.log(`Found ${count} templates with selector: ${selector}`);
        
        // Get the first template text
        const firstTemplate = templates.first();
        const templateText = await firstTemplate.textContent();
        console.log(`First template: ${templateText?.substring(0, 50)}...`);
        
        // Click the template
        console.log('Clicking template...');
        await firstTemplate.click();
        await page.waitForTimeout(1000);
        
        // Check if template got selected (visual feedback)
        const hasSelectedClass = await firstTemplate.evaluate(el => {
          return el.classList.contains('bg-primary/5') || 
                 el.classList.contains('border-primary') ||
                 el.style.backgroundColor !== '';
        });
        console.log(`Template shows selected state: ${hasSelectedClass}`);
        
        // Check if check mark appears
        const checkMark = await firstTemplate.locator('svg').count();
        console.log(`Check mark visible: ${checkMark > 0}`);
        
        templateClicked = true;
        break;
      }
    }
    
    if (!templateClicked) {
      console.log('❌ Could not find any clickable templates');
    }
    
    // Check Next button state after clicking template
    console.log('\n📋 CHECKING NEXT BUTTON STATE');
    console.log('-'.repeat(40));
    
    await page.waitForTimeout(500);
    const nextDisabledAfter = await nextButton.isDisabled();
    console.log(`Next button disabled after selection: ${nextDisabledAfter}`);
    
    if (!nextDisabledAfter) {
      console.log('✅✅✅ Template selection is working!');
      
      // Try to advance to next step
      await nextButton.click();
      await page.waitForTimeout(1500);
      
      const dialogContent = await page.locator('[role="dialog"]').textContent();
      const stepMatch = dialogContent?.match(/Step (\d+) of (\d+)/);
      if (stepMatch) {
        console.log(`✅ Advanced to Step ${stepMatch[1]} of ${stepMatch[2]}`);
      }
    } else {
      console.log('❌❌❌ Template selection not working - Next still disabled');
      
      // Try alternative click methods
      console.log('\n📋 TRYING ALTERNATIVE CLICK METHODS');
      console.log('-'.repeat(40));
      
      // Try clicking the Card component directly
      const cards = page.locator('[role="dialog"] div[class*="rounded"][class*="border"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        console.log(`Found ${cardCount} card elements`);
        
        // Try force clicking
        await cards.first().click({ force: true });
        await page.waitForTimeout(1000);
        
        const nextStillDisabled = await nextButton.isDisabled();
        console.log(`After force click - Next disabled: ${nextStillDisabled}`);
        
        if (!nextStillDisabled) {
          console.log('✅ Force click worked!');
        } else {
          // Try dispatching click event
          await cards.first().dispatchEvent('click');
          await page.waitForTimeout(1000);
          
          const finalDisabled = await nextButton.isDisabled();
          console.log(`After dispatch event - Next disabled: ${finalDisabled}`);
        }
      }
    }
    
    // Check browser console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️ Browser console errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Final diagnosis
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DIAGNOSIS');
    console.log('='.repeat(80));
    
    if (!nextDisabledAfter) {
      console.log('✅ Template selection is functional');
      console.log('✅ Click handlers are working');
      console.log('✅ State management is correct');
    } else {
      console.log('❌ Template click handler not updating state');
      console.log('   Possible issues:');
      console.log('   - onClick event not firing');
      console.log('   - State update not happening');
      console.log('   - Validation logic issue');
      console.log('   - Wrong TemplateSelectionStep component being used');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'template-selection-state.png' });
    console.log('\n📸 Screenshot saved: template-selection-state.png');
  });
});