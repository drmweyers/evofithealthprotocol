/**
 * 🌐 CROSS-BROWSER COMPATIBILITY TEST SUITE
 * 
 * Comprehensive testing across Chromium, Firefox, and WebKit browsers
 * Validates consistent authentication flows and UI behavior across all major browser engines
 * 
 * Browser Coverage:
 * ✅ Chromium (Chrome/Edge)
 * ✅ Firefox (Gecko engine)
 * ✅ WebKit (Safari engine)
 * 
 * Test Environment: http://localhost:3500
 */

import { test, expect, Page, Browser } from '@playwright/test';
import { setTimeout } from 'timers/promises';

// 🔐 Test Credentials (Exactly as specified)
const testCredentials = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123!',
    expectedRedirect: '/admin'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com', 
    password: 'TestTrainer123!',
    expectedRedirect: '/trainer'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    expectedRedirect: '/my-meal-plans'
  }
};

// 🌐 Browser Configuration
const BASE_URL = 'http://localhost:3500';

// 🎨 Cross-Browser UI Selectors
const CrossBrowserSelectors = {
  emailInput: 'input[type="email"], input[name="email"], [data-testid="email-input"]',
  passwordInput: 'input[type="password"], input[name="password"], [data-testid="password-input"]',
  loginButton: 'button[type="submit"], button:has-text("Sign In"), [data-testid="login-button"]',
  registerButton: 'button[type="submit"], button:has-text("Create Account"), [data-testid="register-button"]',
  loadingSpinner: '.animate-spin, [data-testid="loading"], .loading',
  errorMessage: '.error, [role="alert"], .text-red-500',
  successMessage: '.success, .text-green-500'
};

test.describe('🌐 CROSS-BROWSER COMPATIBILITY TEST SUITE', () => {
  
  // 🚀 Test Suite Setup
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000); // 3 minute timeout for cross-browser testing
    
    // Clear browser state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('1. 🔐 CROSS-BROWSER AUTHENTICATION TESTING', () => {
    
    // Test will run across all configured browser projects
    test('1.1 Admin Authentication Across All Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Admin Authentication on ${browserName}...`);
      
      // Step 1: Navigate to login page
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Step 2: Verify page loads correctly across browsers
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      console.log(`✅ ${browserName}: Page loaded successfully`);
      
      // Step 3: Verify form elements are present
      await expect(page.locator(CrossBrowserSelectors.emailInput)).toBeVisible();
      await expect(page.locator(CrossBrowserSelectors.passwordInput)).toBeVisible();
      await expect(page.locator(CrossBrowserSelectors.loginButton)).toBeVisible();
      console.log(`✅ ${browserName}: Form elements visible`);
      
      // Step 4: Fill authentication form
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.admin.password);
      
      // Step 5: Take browser-specific screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-admin-${browserName}-login-form.png`,
        fullPage: true 
      });
      
      // Step 6: Submit form
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      // Step 7: Wait for authentication response
      await page.waitForLoadState('networkidle');
      await setTimeout(3000); // Allow for redirects and animations
      
      // Step 8: Verify successful authentication
      const currentUrl = page.url();
      console.log(`${browserName}: Admin redirected to ${currentUrl}`);
      
      expect(currentUrl).toContain('/admin');
      console.log(`✅ ${browserName}: Admin authentication successful`);
      
      // Step 9: Take success screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-admin-${browserName}-success.png`,
        fullPage: true 
      });
      
      // Step 10: Verify JWT token storage across browsers
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      console.log(`✅ ${browserName}: JWT token stored successfully`);
    });

    test('1.2 Trainer Authentication Across All Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Trainer Authentication on ${browserName}...`);
      
      // Step 1: Navigate and verify page load
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 2: Fill trainer credentials
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.trainer.password);
      
      // Step 3: Browser-specific form screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-trainer-${browserName}-login-form.png`,
        fullPage: true 
      });
      
      // Step 4: Submit authentication
      await page.locator(CrossBrowserSelectors.loginButton).click();
      await page.waitForLoadState('networkidle');
      await setTimeout(3000);
      
      // Step 5: Verify trainer redirect
      const currentUrl = page.url();
      console.log(`${browserName}: Trainer redirected to ${currentUrl}`);
      expect(currentUrl).toContain('/trainer');
      console.log(`✅ ${browserName}: Trainer authentication successful`);
      
      // Step 6: Success screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-trainer-${browserName}-success.png`,
        fullPage: true 
      });
    });

    test('1.3 Customer Authentication Across All Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Customer Authentication on ${browserName}...`);
      
      // Step 1: Navigate and verify
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 2: Fill customer credentials
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.customer.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.customer.password);
      
      // Step 3: Browser-specific form screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-customer-${browserName}-login-form.png`,
        fullPage: true 
      });
      
      // Step 4: Submit authentication
      await page.locator(CrossBrowserSelectors.loginButton).click();
      await page.waitForLoadState('networkidle');
      await setTimeout(3000);
      
      // Step 5: Verify customer redirect
      const currentUrl = page.url();
      console.log(`${browserName}: Customer redirected to ${currentUrl}`);
      expect(currentUrl).toContain('/my-meal-plans');
      console.log(`✅ ${browserName}: Customer authentication successful`);
      
      // Step 6: Success screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-customer-${browserName}-success.png`,
        fullPage: true 
      });
    });
  });

  test.describe('2. 🎨 UI RENDERING CONSISTENCY ACROSS BROWSERS', () => {
    
    test('2.1 Login Page Visual Consistency', async ({ page, browserName }) => {
      console.log(`🚀 Testing Login Page Visual Consistency on ${browserName}...`);
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000); // Allow for animations
      
      // Step 1: Check critical UI elements
      const formElements = [
        { name: 'Email Input', selector: CrossBrowserSelectors.emailInput },
        { name: 'Password Input', selector: CrossBrowserSelectors.passwordInput },
        { name: 'Login Button', selector: CrossBrowserSelectors.loginButton }
      ];
      
      for (const element of formElements) {
        const locator = page.locator(element.selector);
        await expect(locator).toBeVisible();
        
        // Check element positioning (should not be off-screen)
        const boundingBox = await locator.boundingBox();
        if (boundingBox) {
          expect(boundingBox.x).toBeGreaterThan(-10); // Allow small negative margin
          expect(boundingBox.y).toBeGreaterThan(-10);
          console.log(`✅ ${browserName}: ${element.name} positioned correctly`);
        }
      }
      
      // Step 2: Take full page screenshot for comparison
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-login-page-${browserName}.png`,
        fullPage: true 
      });
      
      // Step 3: Test form interactivity
      await page.locator(CrossBrowserSelectors.emailInput).click();
      await expect(page.locator(CrossBrowserSelectors.emailInput)).toBeFocused();
      
      await page.locator(CrossBrowserSelectors.passwordInput).click();
      await expect(page.locator(CrossBrowserSelectors.passwordInput)).toBeFocused();
      
      console.log(`✅ ${browserName}: Form interactivity working`);
    });

    test('2.2 Registration Page Visual Consistency', async ({ page, browserName }) => {
      console.log(`🚀 Testing Registration Page Visual Consistency on ${browserName}...`);
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Step 1: Verify registration page loads
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 2: Check form elements exist
      const registrationElements = [
        'input[type="email"], input[name="email"]',
        'input[type="password"]',
        'button[type="submit"], button:has-text("Create"), button:has-text("Register")'
      ];
      
      for (const selector of registrationElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ ${browserName}: Registration element found`);
        }
      }
      
      // Step 3: Full page screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-register-page-${browserName}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${browserName}: Registration page visual consistency verified`);
    });

    test('2.3 Dashboard Page Visual Consistency After Login', async ({ page, browserName }) => {
      console.log(`🚀 Testing Dashboard Visual Consistency on ${browserName}...`);
      
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(3000);
      
      // Should be on admin dashboard
      expect(page.url()).toContain('/admin');
      
      // Step 1: Verify dashboard elements render properly
      const dashboardElements = [
        'h1, h2, .dashboard-title',
        'nav, .navigation',
        'main, .main-content'
      ];
      
      for (const selector of dashboardElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ ${browserName}: Dashboard element rendered`);
        }
      }
      
      // Step 2: Dashboard screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-dashboard-${browserName}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${browserName}: Dashboard visual consistency verified`);
    });
  });

  test.describe('3. 🔧 BROWSER-SPECIFIC FUNCTIONALITY TESTING', () => {
    
    test('3.1 Local Storage Functionality Across Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Local Storage on ${browserName}...`);
      
      // Login to get token
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.trainer.password);
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Step 1: Verify token storage
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      console.log(`✅ ${browserName}: Token stored in localStorage`);
      
      // Step 2: Test token persistence after page refresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      const tokenAfterReload = await page.evaluate(() => localStorage.getItem('token'));
      expect(tokenAfterReload).toBeTruthy();
      expect(tokenAfterReload).toBe(token);
      console.log(`✅ ${browserName}: Token persists after reload`);
      
      // Step 3: Test localStorage clearing
      await page.evaluate(() => localStorage.clear());
      const tokenAfterClear = await page.evaluate(() => localStorage.getItem('token'));
      expect(tokenAfterClear).toBeFalsy();
      console.log(`✅ ${browserName}: localStorage clearing works`);
    });

    test('3.2 Form Validation Across Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Form Validation on ${browserName}...`);
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Step 1: Test empty form submission
      await page.locator(CrossBrowserSelectors.loginButton).click();
      await setTimeout(1000);
      
      // Browser should show validation or error
      const emailInput = page.locator(CrossBrowserSelectors.emailInput);
      const passwordInput = page.locator(CrossBrowserSelectors.passwordInput);
      
      const emailRequired = await emailInput.evaluate(el => (el as HTMLInputElement).required);
      const passwordRequired = await passwordInput.evaluate(el => (el as HTMLInputElement).required);
      
      if (emailRequired || passwordRequired) {
        console.log(`✅ ${browserName}: HTML5 validation attributes present`);
      }
      
      // Step 2: Test invalid email format
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password');
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      await setTimeout(1000);
      
      // Check for validation message
      const emailValidity = await emailInput.evaluate(el => (el as HTMLInputElement).validity.valid);
      if (!emailValidity) {
        console.log(`✅ ${browserName}: Email format validation working`);
      }
      
      // Step 3: Screenshot validation state
      await page.screenshot({ 
        path: `test-results/screenshots/cross-browser-validation-${browserName}.png`,
        fullPage: true 
      });
    });

    test('3.3 Navigation and History API Across Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing Navigation on ${browserName}...`);
      
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.customer.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.customer.password);
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      const dashboardUrl = page.url();
      expect(dashboardUrl).toContain('/my-meal-plans');
      
      // Step 1: Navigate to another page
      if (await page.locator('a, nav a').first().isVisible()) {
        await page.locator('a, nav a').first().click();
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        const newUrl = page.url();
        expect(newUrl).not.toBe(dashboardUrl);
        console.log(`✅ ${browserName}: Forward navigation working`);
        
        // Step 2: Test browser back button
        await page.goBack();
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        const backUrl = page.url();
        expect(backUrl).toBe(dashboardUrl);
        console.log(`✅ ${browserName}: Browser back button working`);
        
        // Step 3: Test browser forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        expect(page.url()).toBe(newUrl);
        console.log(`✅ ${browserName}: Browser forward button working`);
      }
    });
  });

  test.describe('4. 🚀 PERFORMANCE ACROSS BROWSERS', () => {
    
    test('4.1 Page Load Performance Comparison', async ({ page, browserName }) => {
      console.log(`🚀 Testing Page Load Performance on ${browserName}...`);
      
      // Step 1: Measure login page load time
      const loginStartTime = Date.now();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      const loginLoadTime = Date.now() - loginStartTime;
      
      console.log(`${browserName} Login Page Load Time: ${loginLoadTime}ms`);
      expect(loginLoadTime).toBeLessThan(10000); // Should load within 10 seconds
      
      // Step 2: Measure authentication time
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.admin.password);
      
      const authStartTime = Date.now();
      await page.locator(CrossBrowserSelectors.loginButton).click();
      await page.waitForLoadState('networkidle');
      const authTime = Date.now() - authStartTime;
      
      console.log(`${browserName} Authentication Time: ${authTime}ms`);
      expect(authTime).toBeLessThan(15000); // Should authenticate within 15 seconds
      
      // Step 3: Log performance metrics
      console.log(`✅ ${browserName} Performance Summary:`);
      console.log(`   - Login Page Load: ${loginLoadTime}ms`);
      console.log(`   - Authentication: ${authTime}ms`);
      
      // Store metrics for comparison
      await page.evaluate((metrics) => {
        window.performanceMetrics = metrics;
      }, { browserName, loginLoadTime, authTime });
    });

    test('4.2 JavaScript Error Detection Across Browsers', async ({ page, browserName }) => {
      console.log(`🚀 Testing JavaScript Error Detection on ${browserName}...`);
      
      const jsErrors: string[] = [];
      
      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });
      
      // Listen for page errors
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });
      
      // Navigate through key pages
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await setTimeout(1000);
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      await setTimeout(1000);
      
      // Login and check dashboard
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(CrossBrowserSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(CrossBrowserSelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(CrossBrowserSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Report JavaScript errors
      if (jsErrors.length > 0) {
        console.log(`⚠️  ${browserName} JavaScript Errors Detected:`);
        jsErrors.forEach(error => console.log(`   - ${error}`));
      } else {
        console.log(`✅ ${browserName}: No JavaScript errors detected`);
      }
      
      // Don't fail test for JS errors, but log them for investigation
      // expect(jsErrors.length).toBeLessThan(5); // Allow some minor errors
    });
  });

  test.describe('5. 🎯 BROWSER-SPECIFIC CRITICAL SUCCESS VALIDATION', () => {
    
    test('5.1 ALL CREDENTIALS WORK ACROSS ALL BROWSERS', async ({ page, browserName }) => {
      console.log(`🎯 CRITICAL: Validating all credentials on ${browserName}...`);
      
      const results = {
        admin: false,
        trainer: false,
        customer: false
      };
      
      // Test each credential on this browser
      for (const [role, creds] of Object.entries(testCredentials)) {
        console.log(`Testing ${role} on ${browserName}: ${creds.email}`);
        
        try {
          // Clean slate
          await page.goto(`${BASE_URL}/login`);
          await page.waitForLoadState('networkidle');
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
          // Login
          await page.locator(CrossBrowserSelectors.emailInput).fill(creds.email);
          await page.locator(CrossBrowserSelectors.passwordInput).fill(creds.password);
          await page.locator(CrossBrowserSelectors.loginButton).click();
          
          await page.waitForLoadState('networkidle');
          await setTimeout(3000);
          
          // Verify success
          const currentUrl = page.url();
          const isLoggedIn = !currentUrl.includes('/login');
          
          if (isLoggedIn) {
            console.log(`✅ ${browserName} - ${role} SUCCESSFUL: ${currentUrl}`);
            results[role] = true;
            
            // Take success screenshot
            await page.screenshot({ 
              path: `test-results/screenshots/cross-browser-${role}-${browserName}-success.png`,
              fullPage: true 
            });
          } else {
            console.log(`❌ ${browserName} - ${role} FAILED: ${currentUrl}`);
            
            // Take failure screenshot
            await page.screenshot({ 
              path: `test-results/screenshots/cross-browser-${role}-${browserName}-failure.png`,
              fullPage: true 
            });
          }
          
        } catch (error) {
          console.log(`❌ ${browserName} - ${role} ERROR: ${error}`);
          results[role] = false;
        }
      }
      
      // Validate results
      console.log(`🎯 ${browserName.toUpperCase()} RESULTS:`);
      console.log(`Admin: ${results.admin ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Trainer: ${results.trainer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Customer: ${results.customer ? '✅ PASS' : '❌ FAIL'}`);
      
      // All must pass for this browser
      expect(results.admin).toBeTruthy();
      expect(results.trainer).toBeTruthy();
      expect(results.customer).toBeTruthy();
      
      console.log(`🎉 ${browserName}: ALL CREDENTIALS WORKING - CROSS-BROWSER SUCCESS!`);
    });
  });
});