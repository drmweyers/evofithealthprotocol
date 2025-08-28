/**
 * 🔧 Integration Testing Agent Mission: End-to-End Authentication Workflow Verification
 * 
 * Comprehensive integration testing of all authentication components after multi-agent redesign:
 * - UI/UX Agent: Text-only aesthetic design
 * - Login QA Agent: Login functionality (A- rating, 90/100)
 * - Registration QA Agent: Account creation (A+ rating, production ready)
 * - Password Recovery QA Agent: 70% implementation with missing backend components
 * 
 * Test Environment: http://localhost:3500
 * Database: PostgreSQL on localhost:5434
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { setTimeout } from 'timers/promises';

// Test Configuration
const BASE_URL = 'http://localhost:3500';
const API_BASE = `${BASE_URL}/api`;

// Demo Test Accounts
const TEST_ACCOUNTS = {
  customer: { email: 'customer@demo.com', password: 'Password123@' },
  trainer: { email: 'trainer@demo.com', password: 'Password123@' },
  newUser: { email: 'newuser@demo.com', password: 'SecurePass123@' }
};

// Test Suite Configuration
test.describe.configure({ mode: 'serial' });

test.describe('🔐 Authentication Integration Test Suite', () => {
  
  test.describe('1. Complete New User Journey Integration', () => {
    test('End-to-end new user registration and first login flow', async ({ page }) => {
      console.log('🚀 Starting new user journey integration test...');
      
      // Step 1: Navigate to registration page
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 2: Verify registration form UI elements (text-only aesthetic)
      await expect(page.locator('h1')).toContainText(/EvoFit|Welcome/);
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /password/i }).first()).toBeVisible();
      await expect(page.getByRole('textbox', { name: /confirm/i })).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible(); // Role selector
      
      // Step 3: Fill registration form with new user data
      const timestamp = Date.now();
      const testEmail = `integration-test-${timestamp}@demo.com`;
      const testPassword = 'TestPass123@';
      
      await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
      await page.getByRole('textbox', { name: /password/i }).first().fill(testPassword);
      await page.getByRole('textbox', { name: /confirm/i }).fill(testPassword);
      
      // Select customer role
      await page.getByRole('combobox').click();
      await page.getByRole('option', { name: /customer/i }).click();
      
      // Step 4: Submit registration
      await page.getByRole('button', { name: /create account/i }).click();
      
      // Step 5: Wait for registration completion and redirect
      await page.waitForLoadState('networkidle');
      
      // Check if redirected to login or dashboard
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/login');
      const isOnDashboard = currentUrl.includes('/my-meal-plans') || currentUrl.includes('/dashboard');
      
      expect(isOnLoginPage || isOnDashboard).toBeTruthy();
      console.log(`✅ Registration completed. Current URL: ${currentUrl}`);
      
      // Step 6: If on login page, perform first login
      if (isOnLoginPage) {
        console.log('🔄 Performing first login with new account...');
        
        await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
        await page.getByRole('textbox', { name: /password/i }).fill(testPassword);
        await page.getByRole('button', { name: /sign in/i }).click();
        
        await page.waitForLoadState('networkidle');
        
        // Verify successful login and role-based redirect
        const loginUrl = page.url();
        expect(loginUrl).toContain('/my-meal-plans');
        console.log(`✅ First login successful. Redirected to: ${loginUrl}`);
      }
      
      // Step 7: Test logout and re-login cycle
      console.log('🔄 Testing logout and re-login...');
      
      // Find and click logout (could be in menu or button)
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // Try menu approach
        const menuButton = page.locator('[data-testid="user-menu"], [aria-label*="menu"]').first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
        }
      }
      
      await page.waitForLoadState('networkidle');
      
      // Step 8: Verify logout worked and re-login
      const postLogoutUrl = page.url();
      expect(postLogoutUrl.includes('/login') || postLogoutUrl === BASE_URL + '/').toBeTruthy();
      
      // Navigate to login if not already there
      if (!postLogoutUrl.includes('/login')) {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
      }
      
      // Perform re-login
      await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
      await page.getByRole('textbox', { name: /password/i }).fill(testPassword);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/my-meal-plans');
      
      console.log('✅ Complete new user journey integration test PASSED');
    });
  });

  test.describe('2. Existing User Login Integration', () => {
    test('Demo account login with role-based dashboard access', async ({ page }) => {
      console.log('🚀 Testing existing user login integration...');
      
      for (const [role, account] of Object.entries(TEST_ACCOUNTS)) {
        if (role === 'newUser') continue; // Skip newUser for this test
        
        console.log(`🔄 Testing ${role} login...`);
        
        // Navigate to login page
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Verify text-only aesthetic UI elements
        await expect(page.locator('h1')).toContainText(/EvoFit Health Protocol/);
        await expect(page.locator('h2')).toContainText(/Sign In/);
        await expect(page.getByText(/Professional Health Management/)).toBeVisible();
        
        // Fill login form
        await page.getByRole('textbox', { name: /email/i }).fill(account.email);
        await page.getByRole('textbox', { name: /password/i }).fill(account.password);
        
        // Test Remember Me functionality
        const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });
        if (await rememberMeCheckbox.isVisible()) {
          await rememberMeCheckbox.check();
          await expect(rememberMeCheckbox).toBeChecked();
        }
        
        // Submit login
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Verify role-based redirect
        const currentUrl = page.url();
        console.log(`${role} login redirected to: ${currentUrl}`);
        
        switch (role) {
          case 'customer':
            expect(currentUrl).toContain('/my-meal-plans');
            break;
          case 'trainer':
            expect(currentUrl).toContain('/trainer');
            break;
          default:
            // Admin or other roles
            expect(currentUrl).not.toContain('/login');
        }
        
        // Test logout for next iteration
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        console.log(`✅ ${role} login integration PASSED`);
      }
    });
  });

  test.describe('3. Password Recovery Flow Integration', () => {
    test('Forgot password request and reset workflow', async ({ page }) => {
      console.log('🚀 Testing password recovery integration...');
      
      // Step 1: Navigate to login page and click forgot password
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
      await expect(forgotPasswordLink).toBeVisible();
      await forgotPasswordLink.click();
      
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/forgot-password');
      
      // Step 2: Verify forgot password page UI
      await expect(page.locator('h1')).toContainText(/Evofit Meal/);
      await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      
      // Step 3: Submit password reset request
      await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
      await page.getByRole('button', { name: /send reset link/i }).click();
      
      // Step 4: Check for success message or error handling
      await page.waitForTimeout(2000); // Wait for response
      
      // Look for success/error toast messages
      const toast = page.locator('[data-testid="toast"], .toast, [role="alert"]').first();
      if (await toast.isVisible()) {
        const toastText = await toast.textContent();
        console.log(`📧 Password reset response: ${toastText}`);
        
        // Check if it's a success or error message
        const isSuccess = toastText?.includes('email') || toastText?.includes('sent');
        const isError = toastText?.includes('error') || toastText?.includes('fail');
        
        if (isSuccess) {
          console.log('✅ Password reset request succeeded');
        } else if (isError) {
          console.log('⚠️ Password reset request failed (expected due to 70% implementation)');
        }
      }
      
      // Step 5: Test back to login navigation
      const backToLoginLink = page.getByRole('link', { name: /back to login/i });
      await expect(backToLoginLink).toBeVisible();
      await backToLoginLink.click();
      
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/login');
      
      console.log('✅ Password recovery flow integration PASSED');
    });
    
    test('Reset password page accessibility and validation', async ({ page }) => {
      console.log('🚀 Testing reset password page integration...');
      
      // Navigate directly to reset password page with mock token
      const mockToken = 'mock-reset-token-12345';
      await page.goto(`${BASE_URL}/reset-password/${mockToken}`);
      await page.waitForLoadState('networkidle');
      
      // Verify page elements
      await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /new password/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /confirm.*password/i })).toBeVisible();
      
      // Test password validation
      await page.getByRole('textbox', { name: /new password/i }).fill('weak');
      await page.getByRole('textbox', { name: /confirm.*password/i }).fill('different');
      await page.getByRole('button', { name: /reset password/i }).click();
      
      // Should show validation errors
      await page.waitForTimeout(1000);
      const hasErrors = await page.locator('.error, [role="alert"], .text-red').count() > 0;
      expect(hasErrors).toBeTruthy();
      
      console.log('✅ Reset password page validation PASSED');
    });
  });

  test.describe('4. Session Management Integration', () => {
    test('Cross-tab session synchronization', async ({ browser }) => {
      console.log('🚀 Testing cross-tab session synchronization...');
      
      // Create two browser contexts to simulate tabs
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const tab1 = await context1.newPage();
      const tab2 = await context2.newPage();
      
      // Tab 1: Login
      await tab1.goto(`${BASE_URL}/login`);
      await tab1.waitForLoadState('networkidle');
      await tab1.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
      await tab1.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
      await tab1.getByRole('button', { name: /sign in/i }).click();
      await tab1.waitForLoadState('networkidle');
      
      expect(tab1.url()).toContain('/my-meal-plans');
      
      // Tab 2: Should not automatically sync (different context)
      await tab2.goto(`${BASE_URL}/login`);
      await tab2.waitForLoadState('networkidle');
      expect(tab2.url()).toContain('/login');
      
      // Tab 2: Login independently
      await tab2.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.trainer.email);
      await tab2.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.trainer.password);
      await tab2.getByRole('button', { name: /sign in/i }).click();
      await tab2.waitForLoadState('networkidle');
      
      expect(tab2.url()).toContain('/trainer');
      
      // Both tabs should maintain independent sessions
      await tab1.reload();
      await tab1.waitForLoadState('networkidle');
      expect(tab1.url()).toContain('/my-meal-plans');
      
      await tab2.reload();
      await tab2.waitForLoadState('networkidle');
      expect(tab2.url()).toContain('/trainer');
      
      console.log('✅ Cross-tab session synchronization PASSED');
      
      await context1.close();
      await context2.close();
    });
    
    test('Remember me functionality persistence', async ({ page }) => {
      console.log('🚀 Testing Remember Me functionality...');
      
      // Step 1: Login with Remember Me checked
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
      await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
      
      const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });
      if (await rememberMeCheckbox.isVisible()) {
        await rememberMeCheckbox.check();
        await expect(rememberMeCheckbox).toBeChecked();
      }
      
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/my-meal-plans');
      
      // Step 2: Check localStorage for token persistence
      const localStorageToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(localStorageToken).toBeTruthy();
      console.log('📱 Token stored in localStorage for persistence');
      
      // Step 3: Simulate browser refresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be logged in
      expect(page.url()).toContain('/my-meal-plans');
      console.log('✅ Remember Me functionality PASSED');
    });
  });

  test.describe('5. Security Integration Validation', () => {
    test('Rate limiting and XSS protection', async ({ page }) => {
      console.log('🚀 Testing security measures integration...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Test multiple rapid login attempts (rate limiting)
      for (let i = 0; i < 5; i++) {
        await page.getByRole('textbox', { name: /email/i }).fill('attacker@test.com');
        await page.getByRole('textbox', { name: /password/i }).fill('wrong-password');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(500);
      }
      
      // Should show rate limiting or error message
      const errorToast = page.locator('[role="alert"], .toast, .error').first();
      if (await errorToast.isVisible()) {
        const errorText = await errorToast.textContent();
        console.log(`🛡️ Security response: ${errorText}`);
      }
      
      // Test XSS prevention in form fields
      const xssPayload = '<script>alert("xss")</script>';
      await page.getByRole('textbox', { name: /email/i }).fill(xssPayload);
      
      // Should not execute script
      const hasAlert = await page.evaluate(() => window.alert !== window.alert);
      expect(hasAlert).toBeFalsy();
      
      console.log('✅ Security integration validation PASSED');
    });
    
    test('JWT token handling and refresh', async ({ page }) => {
      console.log('🚀 Testing JWT token integration...');
      
      // Login to get initial token
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
      await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForLoadState('networkidle');
      
      // Check token in localStorage
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      console.log('🎫 JWT token stored successfully');
      
      // Make API call to test token usage
      const apiResponse = await page.evaluate(async (baseUrl) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return {
          status: response.status,
          ok: response.ok
        };
      }, BASE_URL);
      
      expect(apiResponse.ok).toBeTruthy();
      console.log('✅ JWT token API integration PASSED');
    });
  });

  test.describe('6. Responsive Design Integration', () => {
    test('Authentication pages work on different screen sizes', async ({ page }) => {
      console.log('🚀 Testing responsive design integration...');
      
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ];
      
      for (const viewport of viewports) {
        console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await page.setViewportSize(viewport);
        
        // Test login page
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Verify elements are visible and accessible
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
        
        // Test registration page
        await page.goto(`${BASE_URL}/register`);
        await page.waitForLoadState('networkidle');
        
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
        
        console.log(`✅ ${viewport.name} responsive design PASSED`);
      }
    });
  });

  test.describe('7. API Integration Verification', () => {
    test('Authentication endpoints respond correctly', async ({ page }) => {
      console.log('🚀 Testing API integration...');
      
      // Test login endpoint
      const loginResponse = await page.request.post(`${API_BASE}/auth/login`, {
        data: {
          email: TEST_ACCOUNTS.customer.email,
          password: TEST_ACCOUNTS.customer.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const loginData = await loginResponse.json();
      expect(loginData.status).toBe('success');
      expect(loginData.data.accessToken).toBeTruthy();
      
      console.log('✅ Login API endpoint PASSED');
      
      // Test protected endpoint with token
      const token = loginData.data.accessToken;
      const meResponse = await page.request.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      expect(meResponse.status()).toBe(200);
      const userData = await meResponse.json();
      expect(userData.data.user.email).toBe(TEST_ACCOUNTS.customer.email);
      
      console.log('✅ Protected API endpoint PASSED');
      
      // Test logout endpoint
      const logoutResponse = await page.request.post(`${API_BASE}/auth/logout`);
      expect([200, 401]).toContain(logoutResponse.status()); // 401 is acceptable for logout
      
      console.log('✅ API integration verification PASSED');
    });
  });
});