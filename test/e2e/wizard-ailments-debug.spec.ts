import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3501';

test.describe('Protocol Wizard - Debug Ailments Blank Page', () => {
  test.setTimeout(120000); // 2 minute timeout for entire test
  
  test('Debug: Find and fix blank page after ailments', async ({ page }) => {
    console.log('\n🔍 DEBUGGING AILMENTS BLANK PAGE ISSUE\n');
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.error('Page error:', err.message);
    });
    
    // Step 1: Navigate to login
    console.log('1. Navigating to login page...');
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Check if login page loaded
    const loginTitle = await page.locator('h1, h2').first().textContent();
    console.log(`Login page title: ${loginTitle}`);
    
    // Step 2: Perform login
    console.log('2. Logging in as trainer...');
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    
    // Take screenshot before login
    await page.screenshot({ path: 'debug-before-login.png' });
    
    // Click login with retry
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await loginButton.click();
    
    // Wait for navigation
    try {
      await page.waitForURL(/\/(protocols|trainer|dashboard)/, { timeout: 15000 });
      console.log(`✅ Logged in, redirected to: ${page.url()}`);
    } catch (e) {
      console.log(`Current URL after login attempt: ${page.url()}`);
      await page.screenshot({ path: 'debug-after-login-failed.png' });
      throw new Error('Login navigation failed');
    }
    
    // Step 3: Navigate to protocols page
    console.log('3. Navigating to protocols page...');
    await page.goto(`${baseURL}/protocols`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Give page time to fully load
    
    // Step 4: Find and click wizard button
    console.log('4. Looking for Protocol Wizard button...');
    
    // Try multiple selectors
    const wizardSelectors = [
      'button:has-text("Open Protocol Wizard")',
      'button:has-text("Create Protocol")',
      'button:has-text("New Protocol")',
      'button:has-text("Protocol Wizard")',
      'a:has-text("Protocol Wizard")'
    ];
    
    let wizardButton = null;
    for (const selector of wizardSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        wizardButton = element;
        console.log(`Found wizard button with selector: ${selector}`);
        break;
      }
    }
    
    if (!wizardButton) {
      // List all buttons on the page
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on page:`);
      for (const btn of buttons) {
        const text = await btn.textContent();
        console.log(`  - Button: "${text}"`);
      }
      await page.screenshot({ path: 'debug-no-wizard-button.png' });
      throw new Error('Could not find Protocol Wizard button');
    }
    
    await wizardButton.click();
    console.log('✅ Clicked wizard button');
    
    // Wait for wizard to open
    await page.waitForSelector('text="Protocol Creation Wizard"', { timeout: 10000 });
    console.log('✅ Wizard opened');
    
    // Step 5: Navigate through wizard steps
    console.log('5. Navigating through wizard steps...');
    
    // Step 1: Client selection
    console.log('  Step 1: Selecting client...');
    const clientCombo = page.locator('button[role="combobox"]').first();
    await clientCombo.click();
    await page.locator('[role="option"]').first().click();
    
    let nextButton = page.locator('button:has-text("Next")').last();
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Template selection
    console.log('  Step 2: Selecting template...');
    const templateRadio = page.locator('input[type="radio"][value="standard"]');
    if (await templateRadio.isVisible()) {
      await templateRadio.click();
    } else {
      await page.locator('label:has-text("Standard")').first().click();
    }
    
    nextButton = page.locator('button:has-text("Next")').last();
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 3: Health Information
    console.log('  Step 3: Filling health information...');
    await page.fill('input[name="age"]', '35');
    await page.fill('input[name="weight"]', '170');
    await page.fill('input[name="height"]', '70');
    
    // Activity level
    const activityCombo = page.locator('button[role="combobox"]').last();
    await activityCombo.click();
    await page.locator('[role="option"]:has-text("Moderate")').click();
    
    await page.fill('textarea[name="healthGoals"]', 'Test health goals');
    
    nextButton = page.locator('button:has-text("Next")').last();
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 4: CRITICAL - Medical Conditions/Ailments
    console.log('\n🔴 CRITICAL: Now at Medical Conditions step...');
    
    // Check current page state
    const currentContent = await page.locator('body').textContent();
    console.log('Page contains "Medical Conditions":', currentContent.includes('Medical Conditions'));
    
    // Take screenshot before interaction
    await page.screenshot({ path: 'debug-before-ailments.png', fullPage: true });
    
    // Try to find ailment checkboxes
    const ailmentCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await ailmentCheckboxes.count();
    console.log(`Found ${checkboxCount} checkboxes`);
    
    if (checkboxCount > 0) {
      // Select first ailment
      await ailmentCheckboxes.first().check();
      console.log('Checked first ailment');
    }
    
    // Try to add medication
    const medicationInputs = [
      'input[placeholder*="medication"]',
      'input[placeholder*="Medication"]',
      'textarea[placeholder*="medication"]',
      'input[name="medications"]',
      'textarea[name="medications"]'
    ];
    
    let medicationAdded = false;
    for (const selector of medicationInputs) {
      const input = page.locator(selector).first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill('Test medication');
        console.log(`Added medication using selector: ${selector}`);
        medicationAdded = true;
        break;
      }
    }
    
    if (!medicationAdded) {
      console.log('No medication input found');
    }
    
    // Take screenshot after selections
    await page.screenshot({ path: 'debug-after-ailments-selection.png', fullPage: true });
    
    // Now click Next and see what happens
    console.log('\n🚨 Clicking Next from Medical Conditions...');
    nextButton = page.locator('button:has-text("Next")').last();
    
    // Get current URL before clicking
    const urlBefore = page.url();
    console.log(`URL before Next: ${urlBefore}`);
    
    await nextButton.click();
    
    // Wait a moment
    await page.waitForTimeout(3000);
    
    // Check what happened
    const urlAfter = page.url();
    console.log(`URL after Next: ${urlAfter}`);
    
    // Check page content
    const bodyText = await page.locator('body').textContent();
    const isBlank = !bodyText || bodyText.trim().length < 50;
    
    if (isBlank) {
      console.error('\n❌ BLANK PAGE DETECTED!');
      console.log('Page HTML:', await page.content());
      
      // Check for any error messages
      const errors = await page.locator('.error, .alert, [role="alert"]').all();
      for (const error of errors) {
        console.log('Error found:', await error.textContent());
      }
      
      await page.screenshot({ path: 'debug-blank-page.png', fullPage: true });
      
      // Try to get React errors
      const reactErrors = await page.evaluate(() => {
        const errorElement = document.querySelector('#root');
        return errorElement ? errorElement.textContent : 'No root element';
      });
      console.log('React root content:', reactErrors);
      
      throw new Error('BLANK PAGE AFTER AILMENTS!');
    } else {
      // Check what step we're on
      const headers = await page.locator('h1, h2, h3').all();
      console.log('\nPage headers found:');
      for (const header of headers) {
        const text = await header.textContent();
        console.log(`  - ${text}`);
      }
      
      // Check if we reached Customization
      if (bodyText.includes('Customization')) {
        console.log('✅ Successfully reached Customization step!');
      } else {
        console.log('⚠️ Did not reach Customization, current content:', bodyText.substring(0, 200));
        await page.screenshot({ path: 'debug-unexpected-step.png', fullPage: true });
      }
    }
    
    console.log('\n📊 Test complete - see screenshots for details');
  });
});