import { test, expect } from '@playwright/test';

test('Health Protocol Tab - Final Test', async ({ page }) => {
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
  
  // Navigate to Health Protocols URL directly
  await page.goto(`${baseURL}/trainer/health-protocols`);
  await page.waitForLoadState('networkidle');
  
  // Check URL is correct
  expect(page.url()).toBe(`${baseURL}/trainer/health-protocols`);
  
  // Check that Health Protocol content is visible (use first occurrence)
  await expect(page.locator('h2').filter({ hasText: 'Specialized Health Protocols' }).first()).toBeVisible();
  
  // Check for key Health Protocol features
  await expect(page.getByText('Create Protocols')).toBeVisible();
  await expect(page.getByText('Manage Protocols')).toBeVisible();
  await expect(page.getByText('Client Assignments')).toBeVisible();
  
  // Check for Longevity and Parasite Cleanse tabs
  await expect(page.getByText('Longevity Mode')).toBeVisible();
  await expect(page.getByText('Parasite Cleanse')).toBeVisible();
  
  console.log('✅ Health Protocol tab is fully functional!');
});