/**
 * Manual Authentication Verification Test
 * 
 * This test will verify the current state of authentication components
 * and provide detailed feedback on what works and what needs attention.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';
const TEST_ACCOUNTS = {
  customer: { email: 'customer@demo.com', password: 'Password123@' },
  trainer: { email: 'trainer@demo.com', password: 'Password123@' }
};

test.describe('🔍 Authentication Manual Verification', () => {
  
  test('Verify login page UI and functionality', async ({ page }) => {
    console.log('🚀 Starting login page verification...');
    
    // Step 1: Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Step 2: Take screenshot for verification
    await page.screenshot({ path: 'test/screenshots/login-page-verification.png', fullPage: true });
    
    // Step 3: Check page title and headers
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Step 4: Verify main UI elements exist
    const elements = {
      mainHeader: await page.locator('h1').count(),
      signInHeader: await page.locator('h2').count(),
      emailField: await page.getByRole('textbox', { name: /email/i }).count(),
      passwordField: await page.getByRole('textbox', { name: /password/i }).count(),
      loginButton: await page.getByRole('button', { name: /sign in/i }).count(),
      forgotPasswordLink: await page.getByRole('link', { name: /forgot.*password/i }).count(),
      registerLink: await page.getByRole('link', { name: /create account/i }).count()
    };
    
    console.log('🔍 UI Elements Found:');
    Object.entries(elements).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} element(s)`);
    });
    
    // Step 5: Check for text-only aesthetic
    const mainText = await page.locator('h1').textContent();
    const hasEvoFitBranding = mainText?.includes('EvoFit') || false;
    console.log(`🎨 EvoFit branding present: ${hasEvoFitBranding}`);
    
    expect(elements.emailField).toBeGreaterThan(0);
    expect(elements.passwordField).toBeGreaterThan(0);
    expect(elements.loginButton).toBeGreaterThan(0);
    
    console.log('✅ Login page verification PASSED');
  });

  test('Verify registration page UI and structure', async ({ page }) => {
    console.log('🚀 Starting registration page verification...');
    
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test/screenshots/registration-page-verification.png', fullPage: true });
    
    // Check all form fields
    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const selects = Array.from(document.querySelectorAll('select'));
      return {
        inputs: inputs.map(input => ({
          type: input.type,
          name: input.name,
          placeholder: input.placeholder,
          id: input.id
        })),
        selects: selects.map(select => ({
          name: select.name,
          id: select.id
        }))
      };
    });
    
    console.log('📝 Registration Form Structure:');
    console.log('  Input fields:', JSON.stringify(formFields.inputs, null, 2));
    console.log('  Select fields:', JSON.stringify(formFields.selects, null, 2));
    
    // Verify basic elements
    const emailFieldExists = await page.getByRole('textbox', { name: /email/i }).count();
    const passwordFieldExists = await page.locator('input[type="password"]').count();
    const submitButtonExists = await page.getByRole('button', { name: /create.*account/i }).count();
    
    console.log(`✅ Email field: ${emailFieldExists > 0 ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ Password fields: ${passwordFieldExists} found`);
    console.log(`✅ Submit button: ${submitButtonExists > 0 ? 'FOUND' : 'MISSING'}`);
    
    expect(emailFieldExists).toBeGreaterThan(0);
    expect(passwordFieldExists).toBeGreaterThan(0);
    
    console.log('✅ Registration page verification PASSED');
  });

  test('Test customer login functionality', async ({ page }) => {
    console.log('🚀 Testing customer login...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for response and check result
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give extra time for redirects
    
    const finalUrl = page.url();
    console.log(`📍 Post-login URL: ${finalUrl}`);
    
    // Take screenshot of result
    await page.screenshot({ path: 'test/screenshots/customer-login-result.png', fullPage: true });
    
    // Check for success indicators
    const isOnDashboard = finalUrl.includes('/my-meal-plans') || finalUrl.includes('/customer');
    const isStillOnLogin = finalUrl.includes('/login');
    
    console.log(`✅ Login successful: ${isOnDashboard ? 'YES' : 'NO'}`);
    console.log(`❌ Still on login: ${isStillOnLogin ? 'YES' : 'NO'}`);
    
    // Look for any error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red, .text-destructive').count();
    if (errorElements > 0) {
      const errorText = await page.locator('[role="alert"], .error, .text-red, .text-destructive').first().textContent();
      console.log(`❌ Error message found: ${errorText}`);
    }
    
    if (isOnDashboard) {
      console.log('✅ Customer login test PASSED');
    } else {
      console.log('⚠️ Customer login test NEEDS ATTENTION');
    }
  });

  test('Test trainer login functionality', async ({ page }) => {
    console.log('🚀 Testing trainer login...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.trainer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.trainer.password);
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for response
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    console.log(`📍 Post-login URL: ${finalUrl}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test/screenshots/trainer-login-result.png', fullPage: true });
    
    const isOnTrainerDashboard = finalUrl.includes('/trainer');
    const isStillOnLogin = finalUrl.includes('/login');
    
    console.log(`✅ Trainer login successful: ${isOnTrainerDashboard ? 'YES' : 'NO'}`);
    console.log(`❌ Still on login: ${isStillOnLogin ? 'YES' : 'NO'}`);
    
    // Check for errors
    const errorElements = await page.locator('[role="alert"], .error, .text-red, .text-destructive').count();
    if (errorElements > 0) {
      const errorText = await page.locator('[role="alert"], .error, .text-red, .text-destructive').first().textContent();
      console.log(`❌ Error message found: ${errorText}`);
    }
    
    if (isOnTrainerDashboard) {
      console.log('✅ Trainer login test PASSED');
    } else {
      console.log('⚠️ Trainer login test NEEDS ATTENTION');
    }
  });

  test('Test forgot password page accessibility', async ({ page }) => {
    console.log('🚀 Testing forgot password functionality...');
    
    // Start from login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
    const linkExists = await forgotPasswordLink.count();
    
    console.log(`📍 Forgot password link exists: ${linkExists > 0 ? 'YES' : 'NO'}`);
    
    if (linkExists > 0) {
      await forgotPasswordLink.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`📍 Forgot password page URL: ${currentUrl}`);
      
      // Take screenshot
      await page.screenshot({ path: 'test/screenshots/forgot-password-page.png', fullPage: true });
      
      // Check page elements
      const emailField = await page.getByRole('textbox', { name: /email/i }).count();
      const submitButton = await page.getByRole('button', { name: /send.*reset/i }).count();
      const backToLoginLink = await page.getByRole('link', { name: /back.*login/i }).count();
      
      console.log(`✅ Email field: ${emailField > 0 ? 'FOUND' : 'MISSING'}`);
      console.log(`✅ Submit button: ${submitButton > 0 ? 'FOUND' : 'MISSING'}`);
      console.log(`✅ Back to login link: ${backToLoginLink > 0 ? 'FOUND' : 'MISSING'}`);
      
      // Test functionality
      if (emailField > 0) {
        await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
        await page.getByRole('button', { name: /send.*reset/i }).click();
        
        await page.waitForTimeout(3000); // Wait for response
        
        // Look for success or error messages
        const alertElements = await page.locator('[role="alert"], .toast, .error, .success').count();
        if (alertElements > 0) {
          const alertText = await page.locator('[role="alert"], .toast, .error, .success').first().textContent();
          console.log(`📧 Password reset response: ${alertText}`);
        } else {
          console.log('📧 No response message found (may indicate backend not implemented)');
        }
      }
    }
    
    console.log('✅ Forgot password test completed');
  });

  test('Check overall authentication system health', async ({ page }) => {
    console.log('🚀 Performing overall system health check...');
    
    // Test API endpoints directly
    const apiTests = [
      {
        name: 'Login API',
        url: `${BASE_URL}/api/auth/login`,
        method: 'POST',
        body: { email: TEST_ACCOUNTS.customer.email, password: TEST_ACCOUNTS.customer.password }
      },
      {
        name: 'Me API (without token)',
        url: `${BASE_URL}/api/auth/me`,
        method: 'GET'
      }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await page.request.fetch(test.url, {
          method: test.method,
          data: test.body
        });
        
        console.log(`🔗 ${test.name}: Status ${response.status()}`);
        
        if (response.status() < 500) {
          const data = await response.json().catch(() => null);
          if (data) {
            console.log(`   Response structure: ${JSON.stringify(Object.keys(data), null, 2)}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error}`);
      }
    }
    
    // Check if app is running
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.title();
    const pageText = await page.locator('body').textContent();
    
    console.log(`🏠 Home page title: ${pageTitle}`);
    console.log(`🏠 App appears to be running: ${pageText ? pageText.length > 100 : false}`);
    
    console.log('✅ System health check completed');
  });
});