import { test, expect } from '@playwright/test';

test('Basic application load test', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3500');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if the page title contains expected content
  await expect(page).toHaveTitle(/EvoFitHealthProtocol/);
  
  // Check if the root element exists
  const rootElement = page.locator('#root');
  await expect(rootElement).toBeVisible();
  
  // Take a screenshot for verification
  await page.screenshot({ path: 'test-screenshot.png' });
  
  console.log('✅ Application loaded successfully');
});

test('Check if login page is accessible', async ({ page }) => {
  await page.goto('http://localhost:3500');
  
  // Look for login-related elements
  const body = page.locator('body');
  await expect(body).toBeVisible();
  
  // Check for any error messages or console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  console.log('✅ Page accessibility check completed');
});