import { test, expect } from '@playwright/test';

test('Simple Health Protocol Tab Test', async ({ page }) => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:4000';

  // Login
  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', trainerEmail);
  await page.fill('input[type="password"]', trainerPassword);
  await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
  
  // Wait for login
  await page.waitForURL((url) => {
    return url.pathname.includes('/trainer') || url.pathname === '/';
  }, { timeout: 10000 });
  
  // Go to trainer page
  await page.goto(`${baseURL}/trainer`);
  await page.waitForLoadState('networkidle');
  
  // Find Health Protocol tab by text and click it
  const healthProtocolTab = page.getByText('Health Protocols', { exact: false });
  await expect(healthProtocolTab).toBeVisible();
  
  // Click the tab
  await healthProtocolTab.click();
  await page.waitForTimeout(1000);
  
  // Check URL changed
  expect(page.url()).toBe(`${baseURL}/trainer/health-protocols`);
  
  // Check that the Health Protocol content is visible
  await expect(page.getByText('Specialized Health Protocols')).toBeVisible();
  await expect(page.getByText('Create Protocols')).toBeVisible();
});