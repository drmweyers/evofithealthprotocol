import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

test('Test navigation to customer profile', async ({ page }) => {
  test.setTimeout(30000);
  
  // Go to home
  await page.goto(BASE_URL);
  console.log('✓ Navigated to home');
  
  // Click sign in
  await page.click('text=Sign In');
  console.log('✓ Clicked Sign In');
  
  // Login
  await page.fill('input[type="email"]', 'customer.test@evofitmeals.com');
  await page.fill('input[type="password"]', 'TestCustomer123!');
  await page.click('button:has-text("Sign In")');
  console.log('✓ Submitted login form');
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  const url = page.url();
  console.log(`Current URL: ${url}`);
  
  // Look for profile button
  const profileButtons = await page.locator('button').all();
  console.log(`Found ${profileButtons.length} buttons`);
  
  for (const button of profileButtons) {
    const text = await button.textContent().catch(() => '');
    if (text.includes('Profile')) {
      console.log(`Found profile button: "${text}"`);
      await button.click();
      console.log('✓ Clicked profile button');
      break;
    }
  }
  
  // Wait a bit for navigation
  await page.waitForTimeout(2000);
  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);
  
  // Check what's on the page
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);
  
  // Look for any h2 elements
  const h2Elements = await page.locator('h2').all();
  for (const h2 of h2Elements) {
    const text = await h2.textContent();
    console.log(`H2: ${text}`);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'navigation-test.png', fullPage: true });
  console.log('Screenshot saved');
});