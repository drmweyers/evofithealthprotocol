import { test, expect, Page } from '@playwright/test';

const TEST_ACCOUNTS = {
  trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' },
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

const BASE_URL = 'http://localhost:3500';

test.describe('Health Protocol Login Debug', () => {
  test('Debug Trainer Login Flow', async ({ page }) => {
    console.log('🔍 Debugging trainer login flow...');
    
    // Step 1: Go to login page
    console.log('📍 Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login`);
    await page.screenshot({ path: 'screenshots/debug-01-login-page.png', fullPage: true });
    
    // Step 2: Check page loaded
    console.log('📍 Step 2: Wait for login form');
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Login form found');
    
    // Step 3: Fill credentials
    console.log('📍 Step 3: Fill in credentials');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    await page.screenshot({ path: 'screenshots/debug-02-credentials-filled.png', fullPage: true });
    
    // Step 4: Submit form
    console.log('📍 Step 4: Submit login form');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Step 5: Wait and see what happens
    console.log('📍 Step 5: Wait for response (10 seconds max)');
    try {
      // Wait for any navigation or response
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Take screenshot to see current state
      await page.screenshot({ path: 'screenshots/debug-03-after-submit.png', fullPage: true });
      
      // Check for any error messages
      const errorElements = await page.locator('.error, .alert-danger, [data-testid="error"]').all();
      if (errorElements.length > 0) {
        for (const element of errorElements) {
          const errorText = await element.innerText();
          console.log(`❌ Error found: ${errorText}`);
        }
      }
      
      // Check for success indicators
      const successElements = await page.locator('.success, .alert-success, [data-testid="success"]').all();
      if (successElements.length > 0) {
        for (const element of successElements) {
          const successText = await element.innerText();
          console.log(`✅ Success found: ${successText}`);
        }
      }
      
      // Check if we're on trainer page
      if (currentUrl.includes('/trainer')) {
        console.log('✅ Successfully redirected to trainer page');
        
        // Look for trainer-specific content
        const trainerElements = await page.locator('text="Trainer", text="Dashboard", text="Health Protocol"').all();
        console.log(`Found ${trainerElements.length} trainer-specific elements`);
        
        for (const element of trainerElements) {
          try {
            const text = await element.innerText();
            console.log(`  - Found: "${text}"`);
          } catch (e) {
            // Skip this element
          }
        }
        
        await page.screenshot({ path: 'screenshots/debug-04-trainer-dashboard.png', fullPage: true });
      } else {
        console.log(`❌ Not redirected to trainer page. Current: ${currentUrl}`);
      }
      
    } catch (e) {
      console.log(`⚠️ Timeout waiting for response: ${e.message}`);
      await page.screenshot({ path: 'screenshots/debug-03-timeout.png', fullPage: true });
    }
    
    // Step 6: Check browser console for errors
    console.log('📍 Step 6: Checking browser console...');
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Wait a bit more to see console logs
    await page.waitForTimeout(2000);
    
    if (consoleLogs.length > 0) {
      console.log('Browser Console Messages:');
      consoleLogs.forEach(log => console.log(`  ${log}`));
    }
    
    // Step 7: Check network requests
    console.log('📍 Step 7: Checking network activity...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    if (responses.length > 0) {
      console.log('Network Responses:');
      responses.forEach(resp => {
        console.log(`  ${resp.status} ${resp.statusText} - ${resp.url}`);
      });
    }
    
    console.log('🔍 Login debug completed');
  });

  test('Test Direct Navigation to Trainer Page', async ({ page }) => {
    console.log('🔍 Testing direct navigation to trainer page...');
    
    try {
      await page.goto(`${BASE_URL}/trainer`);
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
      const currentUrl = page.url();
      console.log(`📍 Current URL after direct navigation: ${currentUrl}`);
      
      await page.screenshot({ path: 'screenshots/debug-direct-trainer-nav.png', fullPage: true });
      
      if (currentUrl.includes('/login')) {
        console.log('✅ Correctly redirected to login (authentication working)');
      } else if (currentUrl.includes('/trainer')) {
        console.log('⚠️ Accessed trainer page without authentication');
      }
      
    } catch (e) {
      console.log(`❌ Error in direct navigation: ${e.message}`);
    }
  });

  test('Test Customer Login Flow', async ({ page }) => {
    console.log('🔍 Testing customer login flow...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('form', { timeout: 10000 });
    
    await page.fill('input[type="email"]', TEST_ACCOUNTS.customer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.customer.password);
    
    await page.screenshot({ path: 'screenshots/debug-customer-login.png', fullPage: true });
    
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const currentUrl = page.url();
      console.log(`📍 Customer login result URL: ${currentUrl}`);
      
      await page.screenshot({ path: 'screenshots/debug-customer-result.png', fullPage: true });
      
      if (currentUrl.includes('/customer')) {
        console.log('✅ Customer login successful');
      }
    } catch (e) {
      console.log(`❌ Customer login timeout: ${e.message}`);
    }
  });
});