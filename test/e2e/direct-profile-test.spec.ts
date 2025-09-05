import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

test('Direct navigation to customer profile', async ({ page }) => {
  test.setTimeout(30000);
  
  // Login as customer
  await page.goto(BASE_URL);
  await page.click('text=Sign In');
  await page.fill('input[type="email"]', 'customer.test@evofitmeals.com');
  await page.fill('input[type="password"]', 'TestCustomer123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for login to complete
  await page.waitForLoadState('networkidle');
  console.log('✓ Logged in');
  
  // Navigate directly to customer profile
  await page.goto(`${BASE_URL}/customer/profile`);
  await page.waitForLoadState('networkidle');
  
  const url = page.url();
  console.log(`Current URL: ${url}`);
  
  // Check page content
  const pageContent = await page.content();
  const hasProfileHeader = pageContent.includes('Profile') || pageContent.includes('profile');
  console.log(`Page contains profile content: ${hasProfileHeader}`);
  
  // Try generic profile route
  await page.goto(`${BASE_URL}/profile`);
  await page.waitForLoadState('networkidle');
  
  const profileUrl = page.url();
  console.log(`Profile redirect URL: ${profileUrl}`);
  
  // Look for specific elements
  const h2Elements = await page.locator('h2').all();
  for (const h2 of h2Elements) {
    const text = await h2.textContent();
    console.log(`H2 element: ${text}`);
  }
  
  // Check network requests
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API call: ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  // Wait for any profile API calls
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'direct-profile-nav.png', fullPage: true });
  console.log('Screenshot saved as direct-profile-nav.png');
});