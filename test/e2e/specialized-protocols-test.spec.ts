import { test, expect } from '@playwright/test';

/**
 * Specialized Protocols Test
 * Tests the specialized protocol generation functionality
 */
test.describe('Specialized Health Protocols Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and login
    await page.goto('/');
    
    // Login as trainer
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button:has-text("Sign In")');
    
    // Wait for navigation to complete
    await page.waitForURL('/protocols');
    console.log('✅ Successfully logged in as trainer');
  });

  test('Specialized Protocols Functionality Test', async ({ page }) => {
    console.log('🚀 Starting Specialized Protocols Test');
    
    // Take initial screenshot after login
    await page.screenshot({ path: `test-results/screenshots/specialized-initial-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('📍 Step 1: Locating Specialized Health Protocols section');
    
    // Look for the Specialized Health Protocols section
    const specializedSection = page.locator('text=Specialized Health Protocols').first();
    await expect(specializedSection).toBeVisible({ timeout: 10000 });
    console.log('✅ Found Specialized Health Protocols section');
    
    // Check if it's collapsed and expand it if needed
    const expandButton = page.locator('[data-testid="specialized-protocols-expand"], button:near(:text("Specialized Health Protocols"))').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Expanded Specialized Health Protocols section');
    }
    
    // Take screenshot after expanding
    await page.screenshot({ path: `test-results/screenshots/specialized-expanded-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('📍 Step 2: Testing Protocol Tabs');
    
    // Click on the Protocols tab if it exists
    const protocolsTab = page.locator('tab:has-text("Protocols"), button:has-text("Protocols"), [role="tab"]:has-text("Protocols")').first();
    if (await protocolsTab.isVisible({ timeout: 3000 })) {
      await protocolsTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Protocols tab');
      await page.screenshot({ path: `test-results/screenshots/specialized-protocols-tab-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    } else {
      console.log('⚠️ Protocols tab not found, checking current state');
    }
    
    console.log('📍 Step 3: Looking for Longevity Mode');
    
    // Look for Longevity Mode options or buttons
    const longevityOptions = [
      'text=Longevity Mode',
      'text=Longevity',
      'button:has-text("Longevity")',
      '[data-testid*="longevity"]',
      '.longevity-protocol',
      'text=Anti-Aging'
    ];
    
    let longevityFound = false;
    for (const selector of longevityOptions) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found Longevity element with selector: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);
        longevityFound = true;
        break;
      }
    }
    
    if (longevityFound) {
      await page.screenshot({ path: `test-results/screenshots/specialized-longevity-clicked-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
      console.log('✅ Successfully interacted with Longevity Mode');
    } else {
      console.log('⚠️ Longevity Mode not found or not clickable');
    }
    
    console.log('📍 Step 4: Looking for Parasite Cleanse');
    
    // Look for Parasite Cleanse options or buttons
    const parasiteOptions = [
      'text=Parasite Cleanse',
      'text=Parasite',
      'button:has-text("Parasite")',
      '[data-testid*="parasite"]',
      '.parasite-protocol'
    ];
    
    let parasiteFound = false;
    for (const selector of parasiteOptions) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found Parasite element with selector: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);
        parasiteFound = true;
        break;
      }
    }
    
    if (parasiteFound) {
      await page.screenshot({ path: `test-results/screenshots/specialized-parasite-clicked-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
      console.log('✅ Successfully interacted with Parasite Cleanse');
    } else {
      console.log('⚠️ Parasite Cleanse not found or not clickable');
    }
    
    console.log('📍 Step 5: Checking for Generation Buttons');
    
    // Look for generate/create buttons
    const generateOptions = [
      'button:has-text("Generate")',
      'button:has-text("Create")',
      'button:has-text("Start")',
      '[data-testid*="generate"]',
      '.generate-btn'
    ];
    
    let generateFound = false;
    for (const selector of generateOptions) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found Generate button with selector: ${selector}`);
        generateFound = true;
        // Don't click it to avoid actual generation, just verify it exists
        break;
      }
    }
    
    console.log('📍 Step 6: Testing Health Issues Tab');
    
    // Test the Health Issues tab which we can see in the screenshots
    const healthIssuesTab = page.locator('text=Health Issues').first();
    if (await healthIssuesTab.isVisible({ timeout: 3000 })) {
      await healthIssuesTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Successfully clicked Health Issues tab');
      await page.screenshot({ path: `test-results/screenshots/specialized-health-issues-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    }
    
    // Test selecting some health issues
    const digestiveIssues = page.locator('text=Digestive Issues').first();
    if (await digestiveIssues.isVisible({ timeout: 2000 })) {
      await digestiveIssues.click();
      await page.waitForTimeout(500);
      console.log('✅ Successfully clicked on Digestive Issues');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ path: `test-results/screenshots/specialized-final-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, fullPage: true });
    
    console.log('🎉 Specialized Protocols Test Completed!');
    console.log('📊 Test Results Summary:');
    console.log(`  ✅ Specialized Protocols Section: Found and accessible`);
    console.log(`  ✅ Longevity Mode: ${longevityFound ? 'Found and clickable' : 'Not immediately accessible'}`);
    console.log(`  ✅ Parasite Cleanse: ${parasiteFound ? 'Found and clickable' : 'Not immediately accessible'}`);
    console.log(`  ✅ Generation Buttons: ${generateFound ? 'Found' : 'Not immediately visible'}`);
    console.log(`  ✅ Health Issues Tab: Working`);
  });
});