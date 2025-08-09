/**
 * HEALTH PROTOCOL AILMENTS DEBUG TEST
 * Focus: Debug specific ailment checkbox rendering issue
 */

import { test, expect } from '@playwright/test';

test.describe('Health Protocol Ailments Debug', () => {
  test('debug ailment checkbox rendering', async ({ page }) => {
    // Login as trainer
    await page.goto('http://localhost:4000');
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer');
    
    console.log('✅ Trainer logged in successfully');

    // Navigate to Health Protocols
    await page.click('button:has-text("Health Protocols")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Navigated to Health Protocols page');

    // Wait for the page to fully load
    await page.waitForSelector('text=Health Issues', { timeout: 10000 });
    
    console.log('✅ Health Issues section found');

    // Look for tab triggers first
    const tabTriggers = await page.locator('[role="tab"]').count();
    console.log(`Found ${tabTriggers} tab triggers`);

    if (tabTriggers > 0) {
      const allTabTexts = await page.locator('[role="tab"]').allTextContents();
      console.log('Tab texts:', allTabTexts);
    }

    // Click on Health Issues tab to make sure it's active
    try {
      // Try multiple selectors for the Health Issues tab
      const healthIssuesSelectors = [
        '[role="tab"]:has-text("Health Issues")',
        'button:has-text("Health Issues")',
        '[data-state="active"]:has-text("Health Issues")',
        'text=Health Issues'
      ];

      let tabClicked = false;
      for (const selector of healthIssuesSelectors) {
        try {
          const tabElement = page.locator(selector);
          if (await tabElement.isVisible({ timeout: 2000 })) {
            await tabElement.click();
            await page.waitForTimeout(2000);
            console.log(`✅ Clicked Health Issues tab with selector: ${selector}`);
            tabClicked = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      if (!tabClicked) {
        console.log('⚠️ Could not find Health Issues tab to click');
      }
    } catch (error) {
      console.log('⚠️ Error clicking Health Issues tab:', error);
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'test/screenshots/ailments-debug-before.png' });

    // Look for specific ailments we just added
    console.log('🔍 Looking for specific ailments...');
    
    const diabetesFound = await page.locator('text=diabetes').count();
    const hypertensionFound = await page.locator('text=hypertension').count();
    const type2DiabetesFound = await page.locator('text=Type 2 Diabetes').count();
    
    console.log(`Found diabetes references: ${diabetesFound}`);
    console.log(`Found hypertension references: ${hypertensionFound}`);
    console.log(`Found "Type 2 Diabetes" references: ${type2DiabetesFound}`);

    // Look for any checkboxes on the page
    const allCheckboxes = await page.locator('input[type="checkbox"]').count();
    const visibleCheckboxes = await page.locator('input[type="checkbox"]:visible').count();
    
    console.log(`Total checkboxes on page: ${allCheckboxes}`);
    console.log(`Visible checkboxes: ${visibleCheckboxes}`);

    // If checkboxes exist, try to interact with them
    if (visibleCheckboxes > 0) {
      console.log('✅ Found visible checkboxes, trying to click first one...');
      
      const firstCheckbox = page.locator('input[type="checkbox"]:visible').first();
      const checkboxParent = firstCheckbox.locator('..');
      
      // Get the label or text near the checkbox
      const nearbyText = await checkboxParent.textContent();
      console.log(`First checkbox is near text: "${nearbyText}"`);
      
      await firstCheckbox.click();
      console.log('✅ Successfully clicked first checkbox');
      
      // Wait a moment and check if selection changed anything
      await page.waitForTimeout(1000);
      
      const isChecked = await firstCheckbox.isChecked();
      console.log(`First checkbox is now checked: ${isChecked}`);
      
    } else {
      console.log('❌ No visible checkboxes found');
      
      // Try to look for the ailment categories to see if they need expanding
      const categoryHeaders = await page.locator('[role="button"], .cursor-pointer').count();
      console.log(`Found ${categoryHeaders} potential category headers`);
      
      if (categoryHeaders > 0) {
        console.log('🔄 Trying to expand first category...');
        await page.locator('[role="button"], .cursor-pointer').first().click();
        await page.waitForTimeout(2000);
        
        const checkboxesAfterExpand = await page.locator('input[type="checkbox"]:visible').count();
        console.log(`Visible checkboxes after expanding category: ${checkboxesAfterExpand}`);
      }
    }

    // Look for the ClientAilmentsSelector component specifically
    const ailmentsSelectorFound = await page.locator('[class*="ClientAilment"], [data-testid="ailments-selector"]').count();
    console.log(`ClientAilmentsSelector components found: ${ailmentsSelectorFound}`);

    // Check for any error messages or loading states
    const loadingElements = await page.locator('text=Loading, text=loading, [class*="loading"], [class*="spinner"]').count();
    console.log(`Loading indicators found: ${loadingElements}`);

    const errorElements = await page.locator('text=Error, text=error, [class*="error"]').count();
    console.log(`Error indicators found: ${errorElements}`);

    // Final screenshot
    await page.screenshot({ path: 'test/screenshots/ailments-debug-after.png' });

    console.log('🔍 Debug test completed');
  });
});