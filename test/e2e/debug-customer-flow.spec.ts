import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

// Test credentials
const credentials = {
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

test.describe('Debug Customer Flow', () => {
  test('Trace customer login and navigation', async ({ page }) => {
    console.log('=== Debugging Customer Login Flow ===');
    
    // Go to home page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log(`✅ Loaded home page: ${page.url()}`);
    
    // Fill login form
    await page.fill('input[type="email"]', credentials.customer.email);
    await page.fill('input[type="password"]', credentials.customer.password);
    console.log('✅ Filled login form');
    
    // Submit form and track navigation
    await page.click('button[type="submit"]');
    console.log('✅ Clicked login button');
    
    // Wait for navigation with extended timeout
    try {
      await page.waitForURL((url) => url.toString() !== `${BASE_URL}/` && url.toString() !== `${BASE_URL}/login`, {
        timeout: 15000
      });
      console.log(`✅ Navigated after login to: ${page.url()}`);
    } catch (error) {
      console.log(`❌ Navigation timeout. Current URL: ${page.url()}`);
    }
    
    // Take screenshot of where customer lands
    await page.screenshot({ 
      path: 'test-results/customer-after-login.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as customer-after-login.png');
    
    // Now try to navigate to profile
    console.log('=== Attempting to Navigate to Profile ===');
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForLoadState('networkidle');
    console.log(`✅ Navigated to profile: ${page.url()}`);
    
    // Get page content
    const bodyText = await page.textContent('body');
    console.log('📄 Page content length:', bodyText?.length || 0);
    
    if (bodyText && bodyText.length > 100) {
      console.log('📄 Page content preview:', bodyText.substring(0, 200));
    }
    
    // Take screenshot of profile page
    await page.screenshot({ 
      path: 'test-results/customer-profile-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as customer-profile-page.png');
    
    // Check for any error messages
    const errorElements = await page.locator('text=/error|Error|fail|Fail/i').all();
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} potential error messages`);
      for (let i = 0; i < Math.min(3, errorElements.length); i++) {
        const errorText = await errorElements[i].textContent();
        console.log(`   Error ${i+1}: ${errorText}`);
      }
    }
    
    // Check if we're actually on the right page
    const isProfilePage = page.url().includes('/customer/profile');
    console.log(`✅ On customer profile URL: ${isProfilePage}`);
    
    expect(isProfilePage).toBe(true);
  });
});