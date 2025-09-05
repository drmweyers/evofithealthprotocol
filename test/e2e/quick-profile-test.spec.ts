import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

test('Quick customer profile check', async ({ page }) => {
  test.setTimeout(30000);
  
  // Login as customer
  await page.goto(BASE_URL);
  await page.click('text=Sign In');
  await page.fill('input[type="email"]', 'customer.test@evofitmeals.com');
  await page.fill('input[type="password"]', 'TestCustomer123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for dashboard (customer redirects to /my-meal-plans)
  await page.waitForURL(/\/my-meal-plans/, { timeout: 10000 });
  console.log('✓ Logged in as customer');
  
  // Click profile button
  const profileButton = page.locator('button:has-text("Profile")');
  await profileButton.click();
  console.log('✓ Clicked profile button');
  
  // Wait for profile page
  await page.waitForSelector('h2:has-text("My Health Profile")', { timeout: 10000 });
  console.log('✓ Profile page loaded');
  
  // Check for trainer section
  const trainerSection = await page.locator('text=Your Trainer').isVisible();
  console.log(`Trainer section visible: ${trainerSection}`);
  
  // Check if API call is made
  const response = await page.waitForResponse(
    response => response.url().includes('/api/customer/profile'),
    { timeout: 5000 }
  ).catch(() => null);
  
  if (response) {
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  }
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'customer-profile.png', fullPage: true });
  console.log('Screenshot saved as customer-profile.png');
});