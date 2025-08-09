import { test, expect } from '@playwright/test';

test('Health Protocol Tab - Success Verification', async ({ page }) => {
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
  
  // Take a screenshot for manual verification
  await page.screenshot({ path: 'health-protocol-success.png', fullPage: true });
  
  console.log('Health Protocol URL:', page.url());
  console.log('✅ Successfully navigated to Health Protocol page');
  
  // Basic checks - just verify the main structure is there
  await expect(page.locator('h2').filter({ hasText: 'Specialized Health Protocols' }).first()).toBeVisible();
  await expect(page.getByText('Create Protocols')).toBeVisible();
  
  console.log('✅ Health Protocol tab is rendering correctly!');
  console.log('📸 Screenshot saved as health-protocol-success.png for manual verification');
});