import { test, expect } from '@playwright/test';

test('Debug Navigation Issue', async ({ page }) => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:3501';

  console.log('🐛 Debug navigation issue...\n');

  // Step 1: Go to application and login
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', trainerEmail);
  await page.fill('input[type="password"]', trainerPassword);
  await page.click('button[type="submit"]');
  
  // Wait for trainer dashboard
  await page.waitForURL(/\/trainer/, { timeout: 10000 });
  console.log('✅ On trainer dashboard at:', page.url());

  // Step 2: Find the Health Protocols button
  const healthProtocolsButton = page.locator('button:has-text("Health Protocols")');
  console.log('✅ Health Protocols button exists:', await healthProtocolsButton.isVisible());

  // Step 3: Click the button and see what happens
  console.log('🔄 Clicking Health Protocols button...');
  await healthProtocolsButton.click();
  
  // Wait a moment for any navigation
  await page.waitForTimeout(3000);
  console.log('🌐 Current URL after click:', page.url());

  // Step 4: Check what content is visible
  console.log('📄 Current page title:', await page.title());
  
  // Look for signs that we're on the health protocols page
  const protocolManagement = page.locator('text=Health Protocol Management');
  console.log('🔍 Health Protocol Management header visible:', await protocolManagement.isVisible());

  const createProtocolsTab = page.locator('button:has-text("Create Protocols")');
  console.log('🔍 Create Protocols tab visible:', await createProtocolsTab.isVisible());

  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-navigation.png', fullPage: true });
  console.log('📸 Screenshot saved as debug-navigation.png');
});