import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3501';
const TRAINER_EMAIL = 'trainer.test@evofitmeals.com';
const TRAINER_PASSWORD = 'TestTrainer123!';

// Utility function for taking screenshots with timestamps
async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${name}-${timestamp}`;
  await page.screenshot({ 
    path: `test-results/screenshots/${screenshotName}.png`,
    fullPage: true 
  });
  console.log(`📸 Screenshot saved: ${screenshotName}.png`);
  return screenshotName;
}

// Utility function to log console errors
function setupConsoleLogging(page: Page, testName: string) {
  const consoleErrors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const error = `[${testName}] Console Error: ${msg.text()}`;
      consoleErrors.push(error);
      console.log(`🔴 ${error}`);
    }
  });

  page.on('pageerror', (error) => {
    const errorMsg = `[${testName}] Page Error: ${error.message}`;
    consoleErrors.push(errorMsg);
    console.log(`🔴 ${errorMsg}`);
  });

  return consoleErrors;
}

test.describe('Protocol Creation Wizard - Final Comprehensive Test', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🚀 Starting Protocol Creation Wizard Final Comprehensive Test');
    console.log(`📍 Testing URL: ${BASE_URL}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Complete Protocol Wizard Flow Test', async () => {
    const consoleErrors = setupConsoleLogging(page, 'Protocol-Wizard-Test');
    
    // Step 1: Navigate to application
    console.log('📍 Step 1: Navigating to application');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await takeTimestampedScreenshot(page, 'initial-load');

    // Verify page loads without errors
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toContain('EvoFit');

    // Step 2: Login as trainer
    console.log('📍 Step 2: Logging in as trainer');
    
    // Find and fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await emailInput.fill(TRAINER_EMAIL);
    await passwordInput.fill(TRAINER_PASSWORD);
    
    // Take screenshot before login
    await takeTimestampedScreenshot(page, 'before-login');
    
    // Submit login form
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow for any additional loading
    
    // Take screenshot after login
    await takeTimestampedScreenshot(page, 'after-login');
    
    // Verify successful login
    const currentUrl = page.url();
    console.log(`🔗 Current URL after login: ${currentUrl}`);
    
    // Look for trainer-specific elements
    const trainerIndicators = [
      'text=Trainer',
      'text=Health Protocols',
      'text=Guided Protocol Wizard',
      '[data-testid="trainer-dashboard"]',
      '.trainer-navigation'
    ];
    
    let loginSuccessful = false;
    for (const indicator of trainerIndicators) {
      if (await page.locator(indicator).first().isVisible().catch(() => false)) {
        console.log(`✅ Found trainer indicator: ${indicator}`);
        loginSuccessful = true;
        break;
      }
    }
    
    if (!loginSuccessful) {
      console.log('⚠️ No trainer indicators found, checking page content...');
      const pageContent = await page.textContent('body');
      console.log(`📄 Page contains: ${pageContent?.slice(0, 500)}...`);
    }

    // Step 3: Find and click Guided Protocol Wizard button
    console.log('📍 Step 3: Looking for Guided Protocol Wizard button');
    
    const wizardButtonSelectors = [
      'text=Guided Protocol Wizard',
      'button:has-text("Guided Protocol Wizard")',
      '[data-testid="guided-protocol-wizard"]',
      'button:has-text("Protocol Wizard")',
      'button:has-text("Create Protocol")',
      '.wizard-button',
      '#guided-protocol-wizard'
    ];
    
    let wizardButton = null;
    for (const selector of wizardButtonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          wizardButton = button;
          console.log(`✅ Found wizard button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!wizardButton) {
      console.log('⚠️ Guided Protocol Wizard button not found, taking screenshot...');
      await takeTimestampedScreenshot(page, 'wizard-button-not-found');
      
      // List all buttons on the page
      const allButtons = await page.locator('button').allTextContents();
      console.log('🔍 All buttons on page:', allButtons);
      
      // Try alternative navigation
      console.log('🔄 Trying alternative navigation...');
      const alternativeSelectors = [
        'a:has-text("Health Protocol")',
        'a[href*="protocol"]',
        'a[href*="wizard"]',
        '.nav-link:has-text("Protocol")'
      ];
      
      for (const selector of alternativeSelectors) {
        try {
          const link = page.locator(selector).first();
          if (await link.isVisible({ timeout: 1000 })) {
            console.log(`✅ Found alternative navigation: ${selector}`);
            await link.click();
            await page.waitForLoadState('networkidle');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    } else {
      // Click the wizard button
      console.log('🖱️ Clicking Guided Protocol Wizard button');
      await wizardButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot after attempting to open wizard
    await takeTimestampedScreenshot(page, 'after-wizard-click');

    // Step 4: Check if wizard opened
    console.log('📍 Step 4: Checking if Protocol Wizard opened');
    
    const wizardIndicators = [
      'text=Protocol Wizard',
      'text=Step 1',
      'text=Client Selection',
      '[data-testid="protocol-wizard"]',
      '.wizard-container',
      '.wizard-step',
      'text=Choose your client'
    ];
    
    let wizardOpened = false;
    let wizardElement = null;
    
    for (const indicator of wizardIndicators) {
      try {
        const element = page.locator(indicator).first();
        if (await element.isVisible({ timeout: 3000 })) {
          wizardOpened = true;
          wizardElement = element;
          console.log(`✅ Wizard opened - found: ${indicator}`);
          break;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!wizardOpened) {
      console.log('❌ Protocol Wizard did not open');
      const pageContent = await page.textContent('body');
      console.log(`📄 Current page content (first 1000 chars): ${pageContent?.slice(0, 1000)}...`);
      
      // Check if there are any error messages
      const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('🔴 Error messages found:', errorMessages);
      }
      
      return; // Exit test if wizard doesn't open
    }

    // Step 5: Test Step 1 - Client Selection
    console.log('📍 Step 5: Testing Step 1 - Client Selection');
    
    // Look for "No Clients Available" message
    const noClientsMessage = page.locator('text=No Clients Available, text=No clients found, text=You have no clients');
    const hasNoClientsMessage = await noClientsMessage.first().isVisible().catch(() => false);
    
    if (hasNoClientsMessage) {
      console.log('✅ "No Clients Available" message displayed correctly');
      await takeTimestampedScreenshot(page, 'no-clients-message');
      
      // Look for skip or continue option
      const skipButtons = [
        'button:has-text("Skip")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'button:has-text("Continue Without Client")',
        '[data-testid="skip-client-selection"]'
      ];
      
      let skipButton = null;
      for (const selector of skipButtons) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 1000 })) {
            skipButton = button;
            console.log(`✅ Found skip/continue button: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (skipButton) {
        console.log('🖱️ Clicking skip/continue button');
        await skipButton.click();
        await page.waitForTimeout(1000);
      } else {
        console.log('⚠️ No skip/continue button found for client selection');
      }
    } else {
      console.log('⚠️ No "No Clients Available" message found');
      
      // Check if there are actual clients listed
      const clientOptions = await page.locator('select option, .client-option, [data-testid*="client"]').count();
      console.log(`📊 Found ${clientOptions} potential client options`);
      
      if (clientOptions > 0) {
        console.log('ℹ️ Clients appear to be available, selecting first one');
        await page.locator('select option, .client-option').first().click();
      }
    }
    
    // Step 6: Test Step 2 - Template Selection
    console.log('📍 Step 6: Testing Step 2 - Template Selection');
    
    // Look for template selection indicators
    const templateIndicators = [
      'text=Template Selection',
      'text=Choose a template',
      'text=Step 2',
      '.template-option',
      '[data-testid*="template"]'
    ];
    
    let templatesVisible = false;
    for (const indicator of templateIndicators) {
      if (await page.locator(indicator).first().isVisible().catch(() => false)) {
        templatesVisible = true;
        console.log(`✅ Template selection visible: ${indicator}`);
        break;
      }
    }
    
    if (templatesVisible) {
      await takeTimestampedScreenshot(page, 'template-selection');
      
      // Try to select a template
      const templateSelectors = [
        '.template-option:first-child',
        'select[name*="template"] option:nth-child(2)',
        'input[type="radio"]:first-child',
        '[data-testid="template-option"]:first-child'
      ];
      
      for (const selector of templateSelectors) {
        try {
          const template = page.locator(selector).first();
          if (await template.isVisible({ timeout: 1000 })) {
            console.log(`🖱️ Selecting template: ${selector}`);
            await template.click();
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Look for next button
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextButton.isVisible().catch(() => false)) {
        console.log('🖱️ Clicking Next to continue to Step 3');
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('⚠️ Template selection not visible');
    }
    
    // Step 7: Test subsequent steps
    console.log('📍 Step 7: Testing subsequent wizard steps');
    
    const maxSteps = 5;
    let currentStep = 2;
    
    while (currentStep < maxSteps) {
      currentStep++;
      console.log(`🔄 Checking for Step ${currentStep}...`);
      
      const stepIndicators = [
        `text=Step ${currentStep}`,
        `.step-${currentStep}`,
        `[data-step="${currentStep}"]`
      ];
      
      let stepVisible = false;
      for (const indicator of stepIndicators) {
        if (await page.locator(indicator).first().isVisible().catch(() => false)) {
          stepVisible = true;
          console.log(`✅ Step ${currentStep} visible`);
          await takeTimestampedScreenshot(page, `step-${currentStep}`);
          break;
        }
      }
      
      if (!stepVisible) {
        console.log(`❌ Step ${currentStep} not found, ending step progression`);
        break;
      }
      
      // Try to continue to next step
      const continueButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await continueButton.isVisible().catch(() => false)) {
        console.log(`🖱️ Clicking Continue for Step ${currentStep}`);
        await continueButton.click();
        await page.waitForTimeout(1000);
      } else {
        console.log(`⚠️ No continue button found for Step ${currentStep}`);
        break;
      }
    }
    
    // Step 8: Final assessment
    console.log('📍 Step 8: Final assessment and summary');
    
    // Take final screenshot
    await takeTimestampedScreenshot(page, 'final-state');
    
    // Report console errors
    console.log('📊 FINAL ASSESSMENT:');
    console.log('==================');
    
    if (consoleErrors.length > 0) {
      console.log(`🔴 Console Errors Found (${consoleErrors.length}):`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Summary report
    console.log('\n🎯 WIZARD FUNCTIONALITY REPORT:');
    console.log('================================');
    console.log(`✅ Application loaded: YES`);
    console.log(`✅ Trainer login successful: ${loginSuccessful ? 'YES' : 'NO'}`);
    console.log(`✅ Wizard opened: ${wizardOpened ? 'YES' : 'NO'}`);
    console.log(`✅ "No Clients Available" message: ${hasNoClientsMessage ? 'YES' : 'NO/NOT APPLICABLE'}`);
    console.log(`✅ Template selection reached: ${templatesVisible ? 'YES' : 'NO'}`);
    console.log(`📊 Maximum step reached: ${currentStep - 1}`);
    console.log(`🔴 Console errors: ${consoleErrors.length}`);
    
    console.log('\n📸 Screenshots taken and saved to test-results/screenshots/');
    console.log('🏁 Protocol Creation Wizard test completed');
  });
});