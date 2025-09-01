import { test, expect, Page } from '@playwright/test';

test.describe('Debug Login and Protocol Wizard', () => {
  test('Debug login process and find wizard', async ({ page }) => {
    console.log('🔍 Starting debug test...');
    
    // Navigate to application
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/debug-01-landing.png', fullPage: true });
    
    console.log('📝 Attempting login...');
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ timeout: 5000 });
    await emailInput.fill('trainer.test@evofitmeals.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('TestTrainer123!');
    
    await page.screenshot({ path: 'test-results/debug-02-form-filled.png', fullPage: true });
    
    // Submit login
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login")').first();
    await loginButton.click();
    
    console.log('⏳ Waiting for login to complete...');
    
    // Wait for navigation or success indicator
    try {
      // Wait for either a redirect or success message
      await Promise.race([
        page.waitForURL(/.*\/dashboard|.*\/trainer|.*\/health-protocols/, { timeout: 10000 }),
        page.waitForSelector('.success, .dashboard, [data-testid="dashboard"]', { timeout: 10000 }),
        page.waitForTimeout(8000) // Fallback timeout
      ]);
    } catch (error) {
      console.log('⚠️ Login completion timeout, continuing...');
    }
    
    await page.screenshot({ path: 'test-results/debug-03-after-login.png', fullPage: true });
    
    // Check current URL and page content
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Look for any error messages
    const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').all();
    if (errorMessages.length > 0) {
      for (const error of errorMessages) {
        const errorText = await error.textContent();
        console.log(`❌ Error found: ${errorText}`);
      }
    }
    
    // Try to find any navigation elements or buttons
    console.log('🔍 Looking for navigation elements...');
    
    // Check for common navigation patterns
    const navElements = await page.locator('nav, .nav, .navigation, .sidebar, .menu').all();
    console.log(`Found ${navElements.length} navigation elements`);
    
    // Look for any buttons or links that might lead to protocols
    const protocolButtons = await page.locator('button, a, [role="button"]').all();
    console.log(`Found ${protocolButtons.length} clickable elements`);
    
    // Take a full page screenshot to see the current state
    await page.screenshot({ path: 'test-results/debug-04-current-state.png', fullPage: true });
    
    // Try to find protocol-related elements
    const protocolElements = page.locator(':has-text("Protocol"), :has-text("Wizard"), :has-text("Health"), :has-text("Create")');
    const protocolCount = await protocolElements.count();
    console.log(`Found ${protocolCount} elements with protocol-related text`);
    
    if (protocolCount > 0) {
      for (let i = 0; i < Math.min(protocolCount, 5); i++) {
        const element = protocolElements.nth(i);
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        console.log(`Protocol element ${i}: ${tagName} - "${text}"`);
      }
    }
    
    // Look specifically for wizard-related elements
    const wizardElements = page.locator(':has-text("Wizard"), :has-text("Guided"), [data-testid*="wizard"], [class*="wizard"]');
    const wizardCount = await wizardElements.count();
    console.log(`Found ${wizardCount} wizard-related elements`);
    
    if (wizardCount > 0) {
      console.log('🎯 Found wizard elements!');
      for (let i = 0; i < wizardCount; i++) {
        const element = wizardElements.nth(i);
        const text = await element.textContent();
        const isVisible = await element.isVisible();
        console.log(`Wizard element ${i}: "${text}" - Visible: ${isVisible}`);
      }
      
      // Try clicking the first visible wizard element
      const firstVisibleWizard = wizardElements.first();
      if (await firstVisibleWizard.isVisible()) {
        console.log('🎯 Attempting to click wizard element...');
        await firstVisibleWizard.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/debug-05-wizard-clicked.png', fullPage: true });
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/debug-06-final-state.png', fullPage: true });
    
    console.log('✅ Debug test completed');
  });
});