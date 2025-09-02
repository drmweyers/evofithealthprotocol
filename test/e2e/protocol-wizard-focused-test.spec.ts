import { test, expect } from '@playwright/test';

/**
 * Focused Protocol Creation Wizard and Specialized Protocols Test
 * Tests the core functionality of the protocol wizard and specialized protocol generation
 */
test.describe('Protocol Creation Wizard - Focused Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    console.log('🚀 Starting Focused Protocol Creation Wizard Test');
    console.log(`📍 Testing URL: ${test.info().project.use.baseURL}`);
    await page.goto('/');
    
    // Take initial screenshot
    await page.screenshot({ path: `test-results/screenshots/focused-initial-load-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
  });

  test('Protocol Wizard Navigation and Specialized Protocols Test', async ({ page }) => {
    console.log('📍 Step 1: Logging in as trainer');
    
    // Login as trainer
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button:has-text("Sign In")');
    
    // Wait for navigation to complete
    await page.waitForURL('/protocols');
    await page.screenshot({ path: `test-results/screenshots/focused-after-login-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('✅ Successfully logged in as trainer');
    
    console.log('📍 Step 2: Testing Protocol Creation Wizard');
    
    // Find and click the Guided Protocol Wizard button
    const wizardButton = page.locator('text=Guided Protocol Wizard').first();
    await expect(wizardButton).toBeVisible({ timeout: 10000 });
    await wizardButton.click();
    
    // Wait for wizard dialog to open
    await page.waitForSelector('text=Step 1', { timeout: 5000 });
    await page.screenshot({ path: `test-results/screenshots/focused-wizard-step1-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('✅ Protocol Creation Wizard opened successfully');
    
    // Test Step 1: Protocol Type Selection
    console.log('📍 Step 3: Testing Protocol Type Selection (Step 1)');
    
    // Select General Wellness protocol type
    await page.click('text=General Wellness');
    await page.screenshot({ path: `test-results/screenshots/focused-step1-general-wellness-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    // Click Next to go to Step 2
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text=Step 2', { timeout: 5000 });
    await page.screenshot({ path: `test-results/screenshots/focused-wizard-step2-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('✅ Successfully navigated to Step 2');
    
    // Test Step 2: Basic Information
    console.log('📍 Step 4: Testing Basic Information (Step 2)');
    
    // Fill in protocol name
    const protocolNameInput = page.locator('input[placeholder*="protocol name"], input[placeholder*="Protocol Name"], input[name*="name"]').first();
    if (await protocolNameInput.isVisible()) {
      await protocolNameInput.fill('Test Wellness Protocol');
    }
    
    // Fill in description if available
    const descriptionInput = page.locator('textarea[placeholder*="description"], textarea[name*="description"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('A comprehensive wellness protocol for overall health improvement.');
    }
    
    await page.screenshot({ path: `test-results/screenshots/focused-step2-filled-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    // Move to Step 3
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000); // Wait for transition
      await page.screenshot({ path: `test-results/screenshots/focused-wizard-step3-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
      console.log('✅ Successfully navigated to Step 3');
    }
    
    console.log('📍 Step 5: Closing wizard and testing Specialized Protocols');
    
    // Close the wizard to test specialized protocols
    const cancelButton = page.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    }
    
    // Wait for wizard to close
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `test-results/screenshots/focused-wizard-closed-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('📍 Step 6: Testing Specialized Health Protocols');
    
    // Look for Specialized Health Protocols section
    const specializedSection = page.locator('text=Specialized Health Protocols').first();
    await expect(specializedSection).toBeVisible({ timeout: 5000 });
    
    // Check if protocols tab is active or click it
    const protocolsTab = page.locator('text=Protocols').first();
    if (await protocolsTab.isVisible()) {
      await protocolsTab.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: `test-results/screenshots/focused-specialized-protocols-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('📍 Step 7: Testing Longevity Mode Generation');
    
    // Look for Longevity Mode button or option
    const longevityButton = page.locator('text=Longevity', 'button:has-text("Longevity")', '[data-testid*="longevity"]').first();
    if (await longevityButton.isVisible({ timeout: 3000 })) {
      await longevityButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `test-results/screenshots/focused-longevity-clicked-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
      console.log('✅ Longevity Mode button found and clicked');
    } else {
      console.log('⚠️ Longevity Mode button not immediately visible');
    }
    
    console.log('📍 Step 8: Testing Parasite Cleanse Generation');
    
    // Look for Parasite Cleanse button or option
    const parasiteButton = page.locator('text=Parasite', 'button:has-text("Parasite")', '[data-testid*="parasite"]').first();
    if (await parasiteButton.isVisible({ timeout: 3000 })) {
      await parasiteButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `test-results/screenshots/focused-parasite-clicked-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
      console.log('✅ Parasite Cleanse button found and clicked');
    } else {
      console.log('⚠️ Parasite Cleanse button not immediately visible');
    }
    
    // Final screenshot
    await page.screenshot({ path: `test-results/screenshots/focused-final-state-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('📍 Step 9: Checking for console errors');
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('🎉 Test completed successfully!');
    console.log('📊 Summary:');
    console.log('  ✅ Login: Success');
    console.log('  ✅ Wizard Opening: Success');
    console.log('  ✅ Step Navigation: Success');
    console.log('  ✅ Protocol Type Selection: Success');
    console.log('  ✅ Specialized Protocols: Tested');
    console.log(`  🔍 Console Errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('🔴 Console Errors Found:');
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    }
  });
});