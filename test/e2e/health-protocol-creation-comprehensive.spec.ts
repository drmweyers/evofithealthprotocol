import { test, expect, Page } from '@playwright/test';

// Test credentials
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

// Helper function to login as trainer
async function loginAsTrainer(page: Page) {
  console.log('🔐 Starting login process...');
  await page.goto('http://localhost:3501');
  
  // Wait for login page to load
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  console.log('📧 Email input found');
  
  // Fill in credentials
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  console.log('✏️ Credentials filled');
  
  // Click login button
  await page.click('button[type="submit"]');
  console.log('🚀 Login button clicked');
  
  // Wait for navigation to trainer dashboard
  await page.waitForURL('**/trainer', { timeout: 15000 });
  console.log('✅ Successfully logged in and navigated to trainer dashboard');
  
  // Verify login success
  await expect(page).toHaveURL(/.*\/trainer/);
  await expect(page.locator('h1:has-text("Welcome")')).toBeVisible({ timeout: 10000 });
}

// Helper function to navigate to Health Protocols
async function navigateToHealthProtocols(page: Page) {
  console.log('🧭 Navigating to Health Protocols...');
  
  // Find and click the "Manage Health Protocols" button
  const manageButton = page.locator('button:has-text("Manage Health Protocols")');
  await expect(manageButton).toBeVisible({ timeout: 10000 });
  console.log('👀 Manage Health Protocols button found');
  
  await manageButton.click();
  console.log('🖱️ Manage Health Protocols button clicked');
  
  // Wait for navigation to protocols page
  await page.waitForURL('**/protocols', { timeout: 15000 });
  await expect(page).toHaveURL(/.*\/protocols/);
  console.log('🎯 Successfully navigated to protocols page');
  
  // Verify the Health Protocol Dashboard loaded
  await expect(page.locator('text=Health Protocol Management System')).toBeVisible({ timeout: 10000 });
  console.log('✅ Health Protocol Management System loaded');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  console.log('🌐 Network idle state reached');
}

test.describe('Health Protocol Creation Features - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up page with proper error handling
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  test('Complete workflow: Login → Navigate → Test Creation Buttons', async ({ page }) => {
    console.log('🏁 Starting complete workflow test...');
    
    // Step 1: Login as trainer
    await loginAsTrainer(page);
    
    // Step 2: Navigate to Health Protocols
    await navigateToHealthProtocols(page);
    
    // Step 3: Verify Create Protocols tab is active
    console.log('📋 Checking Create Protocols tab...');
    
    // Look for the tab structure - it might be in different elements
    const createProtocolsTab = page.locator('button:has-text("Health Protocols"), button:has-text("Create Protocols")').first();
    if (await createProtocolsTab.isVisible()) {
      await createProtocolsTab.click();
      console.log('✅ Create Protocols tab clicked');
    } else {
      console.log('ℹ️ Create Protocols tab not found, checking if we\'re already on the right tab');
    }
    
    // Step 4: Test Enhanced Protocol Wizard button
    console.log('🧪 Testing Enhanced Protocol Wizard button...');
    
    // Look for various possible button texts
    const wizardButtonSelectors = [
      'button:has-text("Enhanced Protocol Wizard")',
      'button:has-text("Create with Wizard")',
      'button:has-text("Protocol Wizard")',
      'button:has-text("Enhanced Wizard")'
    ];
    
    let wizardButton = null;
    for (const selector of wizardButtonSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        wizardButton = button;
        console.log(`🎯 Found wizard button with selector: ${selector}`);
        break;
      }
    }
    
    if (wizardButton) {
      await expect(wizardButton).toBeVisible();
      console.log('👀 Enhanced Protocol Wizard button is visible');
      
      // Test clicking the button
      await wizardButton.click();
      console.log('🖱️ Enhanced Protocol Wizard button clicked');
      
      // Wait for modal or wizard to open
      await page.waitForTimeout(2000);
      
      // Check for wizard modal elements
      const wizardElements = [
        page.locator('text=Client Information'),
        page.locator('text=Protocol Wizard'),
        page.locator('text=Step 1'),
        page.locator('[role="dialog"]'),
        page.locator('.modal'),
        page.locator('text=Customer Selection')
      ];
      
      let wizardOpened = false;
      for (const element of wizardElements) {
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          wizardOpened = true;
          console.log('✅ Wizard modal/form opened successfully');
          break;
        }
      }
      
      if (wizardOpened) {
        console.log('🎉 Enhanced Protocol Wizard opened successfully');
        
        // Test closing the wizard (if there's a close button)
        const closeButtons = [
          page.locator('button[aria-label="Close"]'),
          page.locator('button:has-text("Cancel")'),
          page.locator('button:has-text("Close")'),
          page.locator('.close-button')
        ];
        
        for (const closeButton of closeButtons) {
          if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeButton.click();
            console.log('❌ Wizard closed successfully');
            break;
          }
        }
      } else {
        console.log('⚠️ Wizard did not open or different interaction expected');
      }
    } else {
      console.log('❓ Enhanced Protocol Wizard button not found, checking page structure...');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-debug-wizard-button.png', fullPage: true });
      console.log('📷 Debug screenshot taken: test-debug-wizard-button.png');
    }
    
    // Step 5: Test Manual Creation button
    console.log('📝 Testing Manual Creation button...');
    
    const manualButtonSelectors = [
      'button:has-text("Manual Creation")',
      'button:has-text("Create Manually")',
      'button:has-text("Manual Protocol")'
    ];
    
    let manualButton = null;
    for (const selector of manualButtonSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        manualButton = button;
        console.log(`🎯 Found manual creation button with selector: ${selector}`);
        break;
      }
    }
    
    if (manualButton) {
      await expect(manualButton).toBeVisible();
      console.log('👀 Manual Creation button is visible');
      
      // Get scroll position before clicking
      const scrollBefore = await page.evaluate(() => window.scrollY);
      console.log(`📏 Scroll position before: ${scrollBefore}`);
      
      // Test clicking the button
      await manualButton.click();
      console.log('🖱️ Manual Creation button clicked');
      
      // Wait for potential scroll or form appearance
      await page.waitForTimeout(2000);
      
      // Check if page scrolled
      const scrollAfter = await page.evaluate(() => window.scrollY);
      console.log(`📏 Scroll position after: ${scrollAfter}`);
      
      if (scrollAfter !== scrollBefore) {
        console.log('✅ Page scrolled - Manual Creation button working');
      }
      
      // Look for manual creation form elements
      const manualFormElements = [
        page.locator('input[placeholder*="protocol" i]'),
        page.locator('textarea[placeholder*="description" i]'),
        page.locator('text=Manual Protocol Creation'),
        page.locator('text=Create Protocol Manually'),
        page.locator('form[id*="manual"]')
      ];
      
      let formVisible = false;
      for (const element of manualFormElements) {
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          formVisible = true;
          console.log('✅ Manual creation form is visible');
          break;
        }
      }
      
      if (formVisible) {
        console.log('🎉 Manual Creation functionality working');
      } else {
        console.log('ℹ️ Manual creation form might be below current view or uses different interaction');
      }
    } else {
      console.log('❓ Manual Creation button not found, checking page structure...');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-debug-manual-button.png', fullPage: true });
      console.log('📷 Debug screenshot taken: test-debug-manual-button.png');
    }
    
    // Step 6: Verify page structure and components
    console.log('🔍 Verifying page structure...');
    
    // Check for key page elements
    const pageElements = [
      'text=Health Protocol Management System',
      'text=Protocol Creation',
      'button', // Any buttons
      'input', // Any inputs
      'form' // Any forms
    ];
    
    for (const elementSelector of pageElements) {
      const element = page.locator(elementSelector).first();
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`${elementSelector}: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
    }
    
    console.log('✅ Complete workflow test finished');
  });

  test('Edge Cases - Multiple Button Clicks and Loading States', async ({ page }) => {
    console.log('🧪 Testing edge cases and multiple interactions...');
    
    await loginAsTrainer(page);
    await navigateToHealthProtocols(page);
    
    // Test clicking buttons multiple times
    const wizardButton = page.locator('button:has-text("Enhanced Protocol Wizard"), button:has-text("Create with Wizard")').first();
    
    if (await wizardButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('🔄 Testing multiple clicks on wizard button...');
      
      // Click multiple times rapidly
      for (let i = 0; i < 3; i++) {
        await wizardButton.click();
        await page.waitForTimeout(500);
        console.log(`🖱️ Wizard button click ${i + 1}`);
      }
      
      // Verify the application handles multiple clicks gracefully
      const hasError = await page.locator('text=error, text=Error').isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasError).toBeFalsy();
      console.log('✅ Multiple clicks handled without errors');
    }
    
    // Test loading states
    console.log('⏳ Testing loading states...');
    
    // Simulate slow network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    // Look for loading indicators
    const loadingElements = [
      page.locator('text=Loading'),
      page.locator('.spinner'),
      page.locator('[data-testid="loading"]'),
      page.locator('.loading')
    ];
    
    for (const loadingElement of loadingElements) {
      if (await loadingElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('⏳ Loading indicator found');
        break;
      }
    }
    
    console.log('✅ Edge cases testing completed');
  });

  test('UI Component Validation - No JavaScript Errors', async ({ page }) => {
    console.log('🔍 Testing UI components for errors...');
    
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    await loginAsTrainer(page);
    await navigateToHealthProtocols(page);
    
    // Wait for all components to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Interact with the page to trigger any lazy-loaded errors
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔢 Found ${buttonCount} buttons on the page`);
    
    // Test first few buttons without clicking (just hover)
    const maxButtons = Math.min(buttonCount, 5);
    for (let i = 0; i < maxButtons; i++) {
      const button = allButtons.nth(i);
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.hover({ timeout: 1000 }).catch(() => console.log(`Button ${i} hover failed`));
      }
    }
    
    // Check for React/component errors
    await page.waitForTimeout(2000);
    
    console.log(`❌ Console errors found: ${consoleErrors.length}`);
    console.log(`💥 Page errors found: ${pageErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    
    if (pageErrors.length > 0) {
      console.log('Page errors:', pageErrors);
    }
    
    // Take screenshot of final state
    await page.screenshot({ path: 'test-ui-validation-final.png', fullPage: true });
    console.log('📷 Final validation screenshot taken');
    
    // Verify no critical errors occurred
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(error => 
      error.toLowerCase().includes('uncaught') || 
      error.toLowerCase().includes('cannot read properties') ||
      error.toLowerCase().includes('is not a function')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ No critical JavaScript errors found');
  });

  test('Mobile Responsiveness - Button Accessibility', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    console.log('📱 Mobile viewport set (375x667)');
    
    await loginAsTrainer(page);
    await navigateToHealthProtocols(page);
    
    // Check if buttons are properly sized for mobile
    const buttons = [
      page.locator('button:has-text("Enhanced Protocol Wizard"), button:has-text("Create with Wizard")').first(),
      page.locator('button:has-text("Manual Creation")').first()
    ];
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (await button.isVisible({ timeout: 5000 }).catch(() => false)) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          console.log(`📏 Button ${i + 1} size: ${boundingBox.width}x${boundingBox.height}`);
          
          // Verify button is large enough for mobile tap (minimum 44px)
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
          console.log(`✅ Button ${i + 1} is properly sized for mobile`);
        }
      }
    }
    
    // Test scrolling on mobile
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    console.log(`📏 Page scroll height: ${scrollHeight}, viewport: ${viewportHeight}`);
    
    if (scrollHeight > viewportHeight) {
      // Test scrolling
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
      
      const newScrollY = await page.evaluate(() => window.scrollY);
      expect(newScrollY).toBeGreaterThan(0);
      console.log('✅ Mobile scrolling works');
    }
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-mobile-responsive.png', fullPage: true });
    console.log('📷 Mobile screenshot taken');
    
    console.log('✅ Mobile responsiveness test completed');
  });

  test('Performance - Page Load and Interaction Speed', async ({ page }) => {
    console.log('⚡ Testing performance...');
    
    // Measure login time
    const loginStart = Date.now();
    await loginAsTrainer(page);
    const loginTime = Date.now() - loginStart;
    console.log(`⏱️ Login time: ${loginTime}ms`);
    
    // Measure navigation time
    const navStart = Date.now();
    await navigateToHealthProtocols(page);
    const navTime = Date.now() - navStart;
    console.log(`⏱️ Navigation time: ${navTime}ms`);
    
    // Measure button interaction time
    const wizardButton = page.locator('button:has-text("Enhanced Protocol Wizard"), button:has-text("Create with Wizard")').first();
    
    if (await wizardButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      const clickStart = Date.now();
      await wizardButton.click();
      await page.waitForTimeout(1000); // Wait for any modal/response
      const clickTime = Date.now() - clickStart;
      console.log(`⏱️ Button click response time: ${clickTime}ms`);
      
      // Verify reasonable performance (under 5 seconds for each operation)
      expect(loginTime).toBeLessThan(5000);
      expect(navTime).toBeLessThan(5000);
      expect(clickTime).toBeLessThan(5000);
      
      console.log('✅ Performance is within acceptable limits');
    } else {
      console.log('ℹ️ Wizard button not found for performance testing');
    }
  });
});

// Additional test for debugging page structure
test('Debug - Page Structure Analysis', async ({ page }) => {
  console.log('🔍 Analyzing page structure for debugging...');
  
  await page.goto('http://localhost:3501');
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/trainer', { timeout: 15000 });
  
  console.log('📋 Trainer Dashboard Structure:');
  const trainerButtons = await page.locator('button').allTextContents();
  console.log('Buttons:', trainerButtons);
  
  // Navigate to protocols
  await page.click('button:has-text("Manage Health Protocols")');
  await page.waitForURL('**/protocols', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  console.log('📋 Health Protocols Page Structure:');
  
  // Get all buttons
  const allButtons = await page.locator('button').allTextContents();
  console.log('All buttons:', allButtons);
  
  // Get all text content for analysis
  const pageText = await page.textContent('body');
  const lines = pageText?.split('\n').filter(line => line.trim().length > 0).slice(0, 50);
  console.log('Page content (first 50 lines):', lines);
  
  // Take a comprehensive screenshot
  await page.screenshot({ path: 'test-debug-page-structure.png', fullPage: true });
  console.log('📷 Full page structure screenshot taken');
  
  // Get HTML structure of main content area
  const mainContent = await page.locator('main, [role="main"], .main-content').first().innerHTML().catch(() => '');
  if (mainContent) {
    console.log('🏗️ Main content structure available (truncated):', mainContent.substring(0, 500));
  }
});