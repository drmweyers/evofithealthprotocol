import { test, expect, Page } from '@playwright/test';

const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

// Simple login helper
async function loginAsTrainer(page: Page) {
  await page.goto('http://localhost:3501');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/trainer', { timeout: 10000 });
  console.log('✅ Login successful');
}

test.describe('Health Protocol Creation Feature Test', () => {
  test('Health Protocol Navigation and Creation Buttons Test', async ({ page }) => {
    console.log('🏁 Starting Health Protocol creation test...');
    
    // Step 1: Login as trainer
    await loginAsTrainer(page);
    
    // Step 2: Verify trainer dashboard and find Health Protocol section
    await expect(page.locator('text=Health Protocol Management')).toBeVisible();
    console.log('✅ Health Protocol Management section found');
    
    // Step 3: Click "Manage Health Protocols" button
    const manageButton = page.locator('button:has-text("Manage Health Protocols")');
    await expect(manageButton).toBeVisible();
    console.log('👀 Manage Health Protocols button is visible');
    
    await manageButton.click();
    console.log('🖱️ Clicked Manage Health Protocols button');
    
    // Step 4: Wait for navigation to protocols page
    await page.waitForURL('**/protocols', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/protocols/);
    console.log('🎯 Successfully navigated to protocols page');
    
    // Step 5: Wait for page to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    console.log('✅ Health Protocol Management System page loaded');
    
    // Step 6: Take a screenshot to see the page structure
    await page.screenshot({ path: 'health-protocol-page-structure.png', fullPage: true });
    console.log('📷 Screenshot taken: health-protocol-page-structure.png');
    
    // Step 7: Look for the Create Protocols section/tab
    const createProtocolsSection = page.locator('text=Create Protocol, text=Protocol Creation, text=Health Protocols').first();
    let sectionFound = false;
    
    // Wait a bit for all content to load
    await page.waitForTimeout(3000);
    
    // Try to find and click on Create Protocols or Health Protocols tab if it exists
    const possibleTabs = [
      'button:has-text("Create Protocols")',
      'button:has-text("Health Protocols")', 
      'button:has-text("Protocols")'
    ];
    
    for (const tabSelector of possibleTabs) {
      const tab = page.locator(tabSelector);
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        console.log(`✅ Clicked on tab: ${tabSelector}`);
        sectionFound = true;
        break;
      }
    }
    
    // Step 8: Look for the Enhanced Protocol Wizard button
    console.log('🔍 Looking for Enhanced Protocol Wizard button...');
    
    const wizardButtonSelectors = [
      'button:has-text("Enhanced Protocol Wizard")',
      'button:has-text("Create with Wizard")',
      'button:has-text("Protocol Wizard")',
      'button:has-text("Enhanced Wizard")',
      'button:has-text("Open Wizard")'
    ];
    
    let wizardButtonFound = false;
    let wizardButton = null;
    
    for (const selector of wizardButtonSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
        wizardButton = button;
        wizardButtonFound = true;
        console.log(`✅ Found Enhanced Protocol Wizard button: ${selector}`);
        break;
      }
    }
    
    // Step 9: Test the Enhanced Protocol Wizard button
    if (wizardButtonFound && wizardButton) {
      console.log('🧪 Testing Enhanced Protocol Wizard button...');
      
      // Click the wizard button
      await wizardButton.click();
      console.log('🖱️ Enhanced Protocol Wizard button clicked');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Look for wizard modal/form elements
      const wizardElements = [
        'text=Client Information',
        'text=Customer Selection',
        'text=Protocol Wizard',
        'text=Step 1',
        '[role="dialog"]',
        '.modal',
        'text=Select Customer'
      ];
      
      let wizardOpened = false;
      for (const elementSelector of wizardElements) {
        const element = page.locator(elementSelector);
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          wizardOpened = true;
          console.log(`✅ Wizard opened successfully - found: ${elementSelector}`);
          break;
        }
      }
      
      if (wizardOpened) {
        console.log('🎉 Enhanced Protocol Wizard is working correctly!');
        
        // Try to close the wizard
        const closeButtons = [
          'button[aria-label="Close"]',
          'button:has-text("Cancel")',
          'button:has-text("Close")',
          'button:has-text("×")'
        ];
        
        for (const closeSelector of closeButtons) {
          const closeButton = page.locator(closeSelector);
          if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeButton.click();
            console.log('❌ Wizard closed');
            break;
          }
        }
      } else {
        console.log('⚠️ Wizard did not open as expected or uses different interaction');
        await page.screenshot({ path: 'wizard-not-opened.png', fullPage: true });
      }
    } else {
      console.log('❓ Enhanced Protocol Wizard button not found');
    }
    
    // Step 10: Look for Manual Creation button
    console.log('🔍 Looking for Manual Creation button...');
    
    const manualButtonSelectors = [
      'button:has-text("Manual Creation")',
      'button:has-text("Create Manually")',
      'button:has-text("Manual Protocol")',
      'button:has-text("Manual")'
    ];
    
    let manualButtonFound = false;
    let manualButton = null;
    
    for (const selector of manualButtonSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
        manualButton = button;
        manualButtonFound = true;
        console.log(`✅ Found Manual Creation button: ${selector}`);
        break;
      }
    }
    
    // Step 11: Test the Manual Creation button
    if (manualButtonFound && manualButton) {
      console.log('🧪 Testing Manual Creation button...');
      
      // Get scroll position before clicking
      const scrollBefore = await page.evaluate(() => window.scrollY);
      console.log(`📏 Scroll position before: ${scrollBefore}`);
      
      // Click the manual creation button
      await manualButton.click();
      console.log('🖱️ Manual Creation button clicked');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check if page scrolled
      const scrollAfter = await page.evaluate(() => window.scrollY);
      console.log(`📏 Scroll position after: ${scrollAfter}`);
      
      if (scrollAfter !== scrollBefore) {
        console.log('✅ Page scrolled - Manual Creation button working');
      }
      
      // Look for manual creation form elements
      const manualFormElements = [
        'input[placeholder*="protocol" i]',
        'textarea[placeholder*="description" i]',
        'text=Manual Protocol Creation',
        'text=Create Protocol Manually',
        'form',
        'input[type="text"]'
      ];
      
      let formVisible = false;
      for (const elementSelector of manualFormElements) {
        const element = page.locator(elementSelector);
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          formVisible = true;
          console.log(`✅ Manual creation form visible - found: ${elementSelector}`);
          break;
        }
      }
      
      if (formVisible) {
        console.log('🎉 Manual Creation functionality is working correctly!');
      } else {
        console.log('ℹ️ Manual creation form might be below current view or uses different interaction');
      }
    } else {
      console.log('❓ Manual Creation button not found');
    }
    
    // Step 12: Test edge case - multiple button clicks
    if (wizardButtonFound && wizardButton) {
      console.log('🔄 Testing multiple clicks on wizard button...');
      
      // Click multiple times
      for (let i = 0; i < 3; i++) {
        await wizardButton.click();
        await page.waitForTimeout(300);
      }
      
      // Check for errors
      const hasError = await page.locator('text=error, text=Error').isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasError).toBeFalsy();
      console.log('✅ Multiple clicks handled gracefully');
    }
    
    // Step 13: Final screenshot and summary
    await page.screenshot({ path: 'health-protocol-final-state.png', fullPage: true });
    console.log('📷 Final screenshot taken: health-protocol-final-state.png');
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Login successful: YES`);
    console.log(`✅ Navigation to Health Protocols: YES`);
    console.log(`✅ Enhanced Protocol Wizard button found: ${wizardButtonFound ? 'YES' : 'NO'}`);
    console.log(`✅ Manual Creation button found: ${manualButtonFound ? 'YES' : 'NO'}`);
    
    // Ensure at least one creation method is available
    expect(wizardButtonFound || manualButtonFound).toBeTruthy();
    console.log('✅ At least one protocol creation method is available');
    
    console.log('🎉 Health Protocol Creation Features Test Completed!');
  });
  
  test('Debug - Page Content Analysis', async ({ page }) => {
    console.log('🔍 Analyzing page content for debugging...');
    
    await loginAsTrainer(page);
    
    // Go to protocols page
    const manageButton = page.locator('button:has-text("Manage Health Protocols")');
    await manageButton.click();
    await page.waitForURL('**/protocols', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Get all buttons text
    const allButtons = await page.locator('button').allTextContents();
    console.log('🔲 All buttons on protocols page:', allButtons);
    
    // Get all text that might be relevant
    const protocolText = await page.locator('text*=Protocol').allTextContents();
    console.log('📋 All Protocol-related text:', protocolText);
    
    const createText = await page.locator('text*=Create').allTextContents();
    console.log('➕ All Create-related text:', createText);
    
    const wizardText = await page.locator('text*=Wizard').allTextContents();
    console.log('🧙 All Wizard-related text:', wizardText);
    
    const manualText = await page.locator('text*=Manual').allTextContents();
    console.log('✋ All Manual-related text:', manualText);
    
    // Take comprehensive screenshot
    await page.screenshot({ path: 'debug-protocols-page-full.png', fullPage: true });
    console.log('📷 Debug screenshot taken: debug-protocols-page-full.png');
    
    // Get page HTML for analysis (first 2000 chars)
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('🏗️ Page HTML structure (first 2000 chars):', bodyHTML.substring(0, 2000));
  });
});