import { test, expect, Page } from '@playwright/test';

const TEST_ACCOUNTS = {
  trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' }
};

const BASE_URL = 'http://localhost:3500';

test.describe('Manual Health Protocol Testing', () => {
  test('Manual Login Flow Investigation', async ({ page }) => {
    console.log('🔍 Manual investigation of login flow...');
    
    // Step 1: Go to home page
    console.log('Step 1: Navigate to home page');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/manual-01-home.png', fullPage: true });
    
    // Step 2: Find login form
    console.log('Step 2: Look for login form');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Step 3: Fill credentials slowly
    console.log('Step 3: Fill credentials');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.waitForTimeout(500);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/manual-02-filled.png', fullPage: true });
    
    // Step 4: Submit and wait
    console.log('Step 4: Submit form and wait');
    
    // Listen for all network requests
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Listen for console logs
    page.on('console', msg => {
      console.log(`Browser: ${msg.type()}: ${msg.text()}`);
    });
    
    await page.click('button[type="submit"]');
    
    // Wait and observe what happens
    console.log('Waiting 5 seconds to observe behavior...');
    await page.waitForTimeout(5000);
    
    console.log(`URL after submit: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/manual-03-after-submit.png', fullPage: true });
    
    // Check local storage for tokens
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log(`Token in localStorage: ${token ? 'Present' : 'Not found'}`);
    
    // Check if we can manually navigate to /protocols
    console.log('Step 5: Try manual navigation to /protocols');
    await page.goto(`${BASE_URL}/protocols`);
    await page.waitForTimeout(3000);
    console.log(`URL after manual navigation: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/manual-04-manual-protocols.png', fullPage: true });
    
    // Check page content
    const bodyText = await page.locator('body').innerText();
    console.log('Page content preview:');
    console.log(bodyText.substring(0, 500) + (bodyText.length > 500 ? '...' : ''));
  });

  test('Check Available Routes', async ({ page }) => {
    console.log('🔍 Testing available routes...');
    
    const routes = ['/', '/protocols', '/admin', '/login', '/register'];
    
    for (const route of routes) {
      try {
        console.log(`Testing route: ${route}`);
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const title = await page.title();
        
        console.log(`  ${route} -> ${currentUrl} (Title: ${title})`);
        await page.screenshot({ path: `screenshots/route-${route.replace('/', 'root')}.png`, fullPage: true });
        
      } catch (e) {
        console.log(`  ${route} -> ERROR: ${e.message}`);
      }
    }
  });

  test('Authentication State Test', async ({ page }) => {
    console.log('🔍 Testing authentication state...');
    
    // First login manually
    await page.goto(BASE_URL);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check authentication state
    const authState = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        cookies: document.cookie,
        url: window.location.href
      };
    });
    
    console.log('Authentication state:', authState);
    
    // Try to access each protected route
    const protectedRoutes = ['/protocols', '/admin'];
    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(2000);
      console.log(`${route} redirected to: ${page.url()}`);
    }
  });
});