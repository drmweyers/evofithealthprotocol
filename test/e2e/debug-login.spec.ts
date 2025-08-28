import { test, expect } from '@playwright/test';

test('Debug App Loading and Navigation', async ({ page }) => {
  // Set up console and error logging
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
  page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  console.log('=== Navigating to main page ===');
  await page.goto('http://localhost:3500');
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // Take a screenshot to see the current state
  await page.screenshot({ path: 'debug-main-page.png' });
  
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // Check HTML content
  const htmlContent = await page.content();
  console.log(`HTML length: ${htmlContent.length}`);
  console.log(`Contains React: ${htmlContent.includes('react')}`);
  console.log(`Contains div#root: ${htmlContent.includes('id="root"')}`);
  
  // Check if React app loaded
  const rootDiv = page.locator('#root');
  const rootContent = await rootDiv.textContent();
  console.log(`Root div content length: ${rootContent?.length || 0}`);
  
  // Try navigating to /login explicitly
  console.log('=== Navigating to /login ===');
  await page.goto('http://localhost:3500/login');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.screenshot({ path: 'debug-login-route.png' });
  
  console.log(`Login page URL: ${page.url()}`);
  
  // Check for login elements on /login
  const loginSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'form',
    '.login',
    '[data-testid*="login"]'
  ];
  
  for (const selector of loginSelectors) {
    const element = page.locator(selector);
    const count = await element.count();
    console.log(`${selector}: ${count} elements found`);
  }
  
  // Try other routes
  console.log('=== Trying /admin route ===');
  await page.goto('http://localhost:3500/admin');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.screenshot({ path: 'debug-admin-route.png' });
  console.log(`Admin page URL: ${page.url()}`);
  
  console.log('=== Trying /trainer route ===');
  await page.goto('http://localhost:3500/trainer');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.screenshot({ path: 'debug-trainer-route.png' });
  console.log(`Trainer page URL: ${page.url()}`);
});