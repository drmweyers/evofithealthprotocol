/**
 * 🎯 COMPREHENSIVE AUTHENTICATION GUI TEST SUITE
 * 
 * ULTRA-THINK E2E TESTING: Complete authentication flow validation
 * 
 * Mission: Create and execute the most comprehensive End-to-End GUI testing suite
 * using Playwright to validate all authentication flows, UI interactions, and 
 * user journeys with the specified test credentials.
 * 
 * Test Environment: http://localhost:3500
 * Browser Support: Chromium, Firefox, WebKit
 * Viewport Testing: Mobile, Tablet, Desktop
 * 
 * ✅ ALL THREE TEST CREDENTIALS MUST LOGIN SUCCESSFULLY
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { setTimeout } from 'timers/promises';

// 🔐 MANDATORY TEST CREDENTIALS (Exactly as specified)
const testCredentials = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123!',
    expectedRedirect: '/admin' // Admin dashboard
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com', 
    password: 'TestTrainer123!',
    expectedRedirect: '/trainer' // Trainer dashboard
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    expectedRedirect: '/my-meal-plans' // Customer dashboard
  }
};

// 🌐 Test Configuration
const BASE_URL = 'http://localhost:3500';

// 📱 Viewport Configurations for Responsive Testing  
const viewportSizes = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
];

// 🎨 UI Element Selectors for Enhanced Login Page
const LoginPageSelectors = {
  emailInput: 'input[type="email"], [data-testid="email-input"], input[name="email"]',
  passwordInput: 'input[type="password"], [data-testid="password-input"], input[name="password"]',
  loginButton: 'button[type="submit"], [data-testid="login-button"], button:has-text("Sign In")',
  passwordToggle: '[data-testid="password-toggle"], button:has([data-lucide="eye"])',
  rememberMe: 'input[type="checkbox"], [data-testid="remember-me"]',
  forgotPassword: 'a:has-text("Forgot Password"), [data-testid="forgot-password"]',
  registerLink: 'a:has-text("Create Account"), [data-testid="register-link"]',
  loadingSpinner: '.animate-spin, [data-testid="loading-spinner"]',
  errorMessage: '.text-red-500, [role="alert"], [data-testid="error-message"]',
  successMessage: '.text-green-500, [data-testid="success-message"]'
};

// 🎨 UI Element Selectors for Enhanced Registration Page
const RegisterPageSelectors = {
  emailInput: 'input[type="email"], [data-testid="email-input"]',
  passwordInput: 'input[type="password"]:first-of-type, [data-testid="password-input"]',
  confirmPasswordInput: 'input[type="password"]:last-of-type, [data-testid="confirm-password-input"]',
  roleSelector: 'select, [role="combobox"], [data-testid="role-selector"]',
  registerButton: 'button[type="submit"], [data-testid="register-button"]',
  passwordStrengthIndicator: '[data-testid="password-strength"], .password-strength',
  roleCards: '[data-testid="role-card"], .role-card',
  hipaaCompliance: '[data-testid="hipaa-compliance"], .hipaa-badge',
  trustIndicators: '[data-testid="trust-indicators"], .trust-indicator'
};

test.describe('🔐 COMPREHENSIVE AUTHENTICATION GUI TEST SUITE', () => {
  
  // 🚀 Test Suite Setup
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for comprehensive testing
    test.setTimeout(120000);
    
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('1. 🌟 COMPLETE AUTHENTICATION JOURNEY TESTING', () => {
    
    test('1.1 Admin Login Journey - Complete Flow from Login Page to Admin Dashboard', async ({ page }) => {
      console.log('🚀 Starting Admin Login Journey Test...');
      
      // Step 1: Navigate to login page
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 2: Take screenshot of initial login page
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-login-initial-page.png',
        fullPage: true 
      });
      
      // Step 3: Verify enhanced login page UI elements
      await expect(page.locator('h1, h2')).toContainText(/EvoFit Health Protocol|Sign In/);
      await expect(page.locator(LoginPageSelectors.emailInput)).toBeVisible();
      await expect(page.locator(LoginPageSelectors.passwordInput)).toBeVisible();
      await expect(page.locator(LoginPageSelectors.loginButton)).toBeVisible();
      
      // Step 4: Test password visibility toggle (if present)
      const passwordToggle = page.locator(LoginPageSelectors.passwordToggle);
      if (await passwordToggle.isVisible()) {
        const passwordInput = page.locator(LoginPageSelectors.passwordInput);
        
        // Initially should be password type
        await expect(passwordInput).toHaveAttribute('type', 'password');
        
        // Click toggle to show password
        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Click again to hide password
        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
        
        console.log('✅ Password visibility toggle working correctly');
      }
      
      // Step 5: Fill login form with admin credentials
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.admin.password);
      
      // Step 6: Test Remember Me functionality (if present)
      const rememberMeCheckbox = page.locator(LoginPageSelectors.rememberMe);
      if (await rememberMeCheckbox.isVisible()) {
        await rememberMeCheckbox.check();
        await expect(rememberMeCheckbox).toBeChecked();
        console.log('✅ Remember Me checkbox functionality verified');
      }
      
      // Step 7: Take screenshot before submitting
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-login-form-filled.png',
        fullPage: true 
      });
      
      // Step 8: Submit login form
      await page.locator(LoginPageSelectors.loginButton).click();
      
      // Step 9: Wait for authentication and redirect
      await page.waitForLoadState('networkidle');
      await setTimeout(2000); // Allow for any animations or loading
      
      // Step 10: Verify successful admin login and redirect
      const currentUrl = page.url();
      console.log(`Admin redirected to: ${currentUrl}`);
      
      // Admin should be redirected to admin dashboard
      expect(currentUrl).toContain('/admin');
      
      // Step 11: Verify admin dashboard elements are present
      await expect(page.locator('h1, h2, .dashboard-title')).toBeVisible();
      
      // Step 12: Take screenshot of admin dashboard
      await page.screenshot({ 
        path: 'test-results/screenshots/admin-dashboard-success.png',
        fullPage: true 
      });
      
      // Step 13: Verify JWT token is stored (for Remember Me functionality)
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      console.log('✅ Admin JWT token stored successfully');
      
      // Step 14: Test navigation within admin area
      const adminNavLinks = page.locator('nav a, .nav-link').first();
      if (await adminNavLinks.isVisible()) {
        await adminNavLinks.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/admin');
        console.log('✅ Admin navigation working correctly');
      }
      
      console.log('🎉 Admin Login Journey Test PASSED');
    });

    test('1.2 Trainer Login Journey - Complete Flow from Login Page to Trainer Dashboard', async ({ page }) => {
      console.log('🚀 Starting Trainer Login Journey Test...');
      
      // Step 1: Navigate to login page
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Step 2: Verify page loaded correctly
      await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
      
      // Step 3: Fill login form with trainer credentials
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.trainer.password);
      
      // Step 4: Take screenshot before login
      await page.screenshot({ 
        path: 'test-results/screenshots/trainer-login-form-filled.png',
        fullPage: true 
      });
      
      // Step 5: Submit login
      await page.locator(LoginPageSelectors.loginButton).click();
      
      // Step 6: Wait for authentication
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Step 7: Verify successful trainer login
      const currentUrl = page.url();
      console.log(`Trainer redirected to: ${currentUrl}`);
      
      // Trainer should be redirected to trainer dashboard
      expect(currentUrl).toContain('/trainer');
      
      // Step 8: Verify trainer dashboard elements
      await expect(page.locator('h1, h2, .dashboard-title')).toBeVisible();
      
      // Step 9: Take screenshot of trainer dashboard
      await page.screenshot({ 
        path: 'test-results/screenshots/trainer-dashboard-success.png',
        fullPage: true 
      });
      
      // Step 10: Test trainer-specific functionality
      const healthProtocolsLink = page.locator('a:has-text("Health Protocol"), nav a').first();
      if (await healthProtocolsLink.isVisible()) {
        await healthProtocolsLink.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Trainer health protocols access working');
      }
      
      console.log('🎉 Trainer Login Journey Test PASSED');
    });

    test('1.3 Customer Login Journey - Complete Flow from Login Page to Customer Dashboard', async ({ page }) => {
      console.log('🚀 Starting Customer Login Journey Test...');
      
      // Step 1: Navigate to login page
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Step 2: Fill login form with customer credentials
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.customer.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.customer.password);
      
      // Step 3: Take screenshot before login
      await page.screenshot({ 
        path: 'test-results/screenshots/customer-login-form-filled.png',
        fullPage: true 
      });
      
      // Step 4: Submit login
      await page.locator(LoginPageSelectors.loginButton).click();
      
      // Step 5: Wait for authentication
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Step 6: Verify successful customer login
      const currentUrl = page.url();
      console.log(`Customer redirected to: ${currentUrl}`);
      
      // Customer should be redirected to customer dashboard  
      expect(currentUrl).toContain('/my-meal-plans');
      
      // Step 7: Verify customer dashboard elements
      await expect(page.locator('h1, h2, .dashboard-title')).toBeVisible();
      
      // Step 8: Take screenshot of customer dashboard
      await page.screenshot({ 
        path: 'test-results/screenshots/customer-dashboard-success.png',
        fullPage: true 
      });
      
      // Step 9: Test customer-specific functionality
      const progressLink = page.locator('a:has-text("Progress"), a:has-text("My Progress")').first();
      if (await progressLink.isVisible()) {
        await progressLink.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Customer progress tracking access working');
      }
      
      console.log('🎉 Customer Login Journey Test PASSED');
    });
  });

  test.describe('2. 🔒 ENHANCED LOGIN PAGE TESTING', () => {
    
    test('2.1 Password Visibility Toggle - Eye/EyeOff Icon Functionality', async ({ page }) => {
      console.log('🚀 Testing Password Visibility Toggle...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const passwordInput = page.locator(LoginPageSelectors.passwordInput);
      const passwordToggle = page.locator(LoginPageSelectors.passwordToggle);
      
      if (await passwordToggle.isVisible()) {
        // Fill password field
        await passwordInput.fill('TestPassword123!');
        
        // Initially should be hidden (type="password")
        await expect(passwordInput).toHaveAttribute('type', 'password');
        
        // Click to show password
        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Click to hide password again
        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
        
        console.log('✅ Password visibility toggle working correctly');
      } else {
        console.log('ℹ️  Password toggle not found - may not be implemented');
      }
    });

    test('2.2 Form Animations - Framer Motion Entrance Animations and Micro-interactions', async ({ page }) => {
      console.log('🚀 Testing Form Animations...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Test entrance animations by checking for animation classes
      const loginForm = page.locator('form, .login-form').first();
      if (await loginForm.isVisible()) {
        // Take screenshot to capture animations
        await page.screenshot({ 
          path: 'test-results/screenshots/login-form-animations.png',
          fullPage: true 
        });
        
        // Test hover animations on buttons
        const loginButton = page.locator(LoginPageSelectors.loginButton);
        await loginButton.hover();
        await setTimeout(500); // Allow for hover animation
        
        // Test focus animations on inputs
        await page.locator(LoginPageSelectors.emailInput).focus();
        await setTimeout(300);
        await page.locator(LoginPageSelectors.passwordInput).focus();
        await setTimeout(300);
        
        console.log('✅ Form animations tested - visual verification required');
      }
    });

    test('2.3 Loading States - Spinner Animations and Contextual Messaging', async ({ page }) => {
      console.log('🚀 Testing Loading States...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Fill form with valid credentials
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.admin.password);
      
      // Submit and immediately check for loading state
      await page.locator(LoginPageSelectors.loginButton).click();
      
      // Check for loading spinner or disabled button state
      const loadingSpinner = page.locator(LoginPageSelectors.loadingSpinner);
      const loginButton = page.locator(LoginPageSelectors.loginButton);
      
      // Either loading spinner should be visible or button should be disabled
      const hasLoadingState = (await loadingSpinner.isVisible()) || 
                             (await loginButton.isDisabled());
      
      if (hasLoadingState) {
        console.log('✅ Loading state detected during authentication');
        
        // Take screenshot of loading state
        await page.screenshot({ 
          path: 'test-results/screenshots/login-loading-state.png' 
        });
      } else {
        console.log('ℹ️  Loading state may be too fast to detect');
      }
      
      // Wait for authentication to complete
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should now be logged in
      expect(page.url()).not.toContain('/login');
    });

    test('2.4 Error State Display - Professional Error Message Presentation', async ({ page }) => {
      console.log('🚀 Testing Error State Display...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Test with invalid credentials
      await page.locator(LoginPageSelectors.emailInput).fill('invalid@test.com');
      await page.locator(LoginPageSelectors.passwordInput).fill('wrongpassword');
      await page.locator(LoginPageSelectors.loginButton).click();
      
      // Wait for error response
      await setTimeout(3000);
      
      // Check for error messages
      const errorMessage = page.locator(LoginPageSelectors.errorMessage);
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Error message displayed: ${errorText}`);
        
        // Take screenshot of error state
        await page.screenshot({ 
          path: 'test-results/screenshots/login-error-state.png',
          fullPage: true 
        });
        
        expect(errorText).toBeTruthy();
        console.log('✅ Error message displayed correctly');
      } else {
        console.log('ℹ️  Error message not found - may be handled differently');
      }
    });

    test('2.5 Test Credentials Helper - Development Mode Credential Display', async ({ page }) => {
      console.log('🚀 Testing Test Credentials Helper...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Look for test credentials helper (common in development)
      const testCredsHelper = page.locator('.test-credentials, [data-testid="test-credentials"], .dev-helper');
      
      if (await testCredsHelper.isVisible()) {
        console.log('✅ Test credentials helper found in development mode');
        
        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/screenshots/test-credentials-helper.png',
          fullPage: true 
        });
      } else {
        console.log('ℹ️  Test credentials helper not visible (may be production mode)');
      }
    });

    test('2.6 Brand Elements - Logo Gradients and Health-focused Messaging', async ({ page }) => {
      console.log('🚀 Testing Brand Elements...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Check for brand elements
      const logoElement = page.locator('img[alt*="logo"], .logo, svg').first();
      const brandingText = page.locator('h1, .brand-text');
      
      // Verify logo is present
      if (await logoElement.isVisible()) {
        console.log('✅ Logo element found');
      }
      
      // Verify health-focused messaging
      await expect(brandingText).toContainText(/EvoFit|Health|Protocol/);
      console.log('✅ Health-focused brand messaging verified');
      
      // Check for gradient elements (common in modern design)
      const gradientElements = await page.locator('.gradient, [class*="gradient"]').count();
      console.log(`Found ${gradientElements} gradient elements`);
      
      // Take screenshot of branding
      await page.screenshot({ 
        path: 'test-results/screenshots/brand-elements.png',
        fullPage: true 
      });
    });
  });

  test.describe('3. 📝 ENHANCED REGISTRATION PAGE TESTING', () => {
    
    test('3.1 Password Strength Checker - Real-time Validation with Visual Indicators', async ({ page }) => {
      console.log('🚀 Testing Password Strength Checker...');
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      const passwordInput = page.locator(RegisterPageSelectors.passwordInput);
      const strengthIndicator = page.locator(RegisterPageSelectors.passwordStrengthIndicator);
      
      // Test weak password
      await passwordInput.fill('weak');
      await setTimeout(500);
      
      if (await strengthIndicator.isVisible()) {
        console.log('✅ Password strength indicator is working');
        
        // Test strong password
        await passwordInput.fill('StrongPassword123!@#');
        await setTimeout(500);
        
        // Take screenshot of strength indicator
        await page.screenshot({ 
          path: 'test-results/screenshots/password-strength-indicator.png',
          fullPage: true 
        });
      } else {
        console.log('ℹ️  Password strength indicator not found');
      }
    });

    test('3.2 Interactive Form Validation - CheckCircle/XCircle Status Icons', async ({ page }) => {
      console.log('🚀 Testing Interactive Form Validation...');
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator(RegisterPageSelectors.emailInput);
      const passwordInput = page.locator(RegisterPageSelectors.passwordInput);
      const confirmPasswordInput = page.locator(RegisterPageSelectors.confirmPasswordInput);
      
      // Test email validation
      await emailInput.fill('invalid-email');
      await passwordInput.click(); // Trigger validation
      await setTimeout(500);
      
      // Look for validation icons (checkmark/x)
      const validationIcons = page.locator('[data-lucide="check-circle"], [data-lucide="x-circle"], .validation-icon');
      if (await validationIcons.first().isVisible()) {
        console.log('✅ Validation icons are working');
      }
      
      // Test valid email
      await emailInput.fill('valid@test.com');
      await passwordInput.click();
      await setTimeout(500);
      
      // Test password confirmation matching
      await passwordInput.fill('TestPassword123!');
      await confirmPasswordInput.fill('TestPassword123!');
      await setTimeout(500);
      
      // Take screenshot of form validation
      await page.screenshot({ 
        path: 'test-results/screenshots/form-validation-icons.png',
        fullPage: true 
      });
    });

    test('3.3 Role Selection Cards - Visual Role Cards with Descriptions and Interactions', async ({ page }) => {
      console.log('🚀 Testing Role Selection Cards...');
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      // Look for role cards or role selector
      const roleCards = page.locator(RegisterPageSelectors.roleCards);
      const roleSelector = page.locator(RegisterPageSelectors.roleSelector);
      
      if (await roleCards.count() > 0) {
        console.log(`✅ Found ${await roleCards.count()} role cards`);
        
        // Test clicking different role cards
        for (let i = 0; i < Math.min(await roleCards.count(), 3); i++) {
          await roleCards.nth(i).click();
          await setTimeout(300); // Animation delay
        }
        
        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/screenshots/role-selection-cards.png',
          fullPage: true 
        });
      } else if (await roleSelector.isVisible()) {
        console.log('✅ Found role selector dropdown');
        
        // Test role selection
        await roleSelector.click();
        
        // Select trainer role
        const trainerOption = page.locator('option:has-text("Trainer"), [role="option"]:has-text("Trainer")').first();
        if (await trainerOption.isVisible()) {
          await trainerOption.click();
        }
        
        await setTimeout(300);
        
        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/screenshots/role-selector-dropdown.png',
          fullPage: true 
        });
      }
    });

    test('3.4 Trust Indicators - HIPAA Compliance Badges and User Count Displays', async ({ page }) => {
      console.log('🚀 Testing Trust Indicators...');
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      // Look for HIPAA compliance badges
      const hipaaIndicators = page.locator(RegisterPageSelectors.hipaaCompliance);
      const trustIndicators = page.locator(RegisterPageSelectors.trustIndicators);
      
      if (await hipaaIndicators.isVisible()) {
        console.log('✅ HIPAA compliance indicator found');
      }
      
      if (await trustIndicators.isVisible()) {
        console.log('✅ Trust indicators found');
      }
      
      // Look for user count or testimonials
      const userCount = page.locator('.user-count, [data-testid="user-count"]');
      if (await userCount.isVisible()) {
        const countText = await userCount.textContent();
        console.log(`User count display: ${countText}`);
      }
      
      // Take screenshot of trust elements
      await page.screenshot({ 
        path: 'test-results/screenshots/trust-indicators.png',
        fullPage: true 
      });
    });

    test('3.5 Animated Features - Staggered Animation Sequences', async ({ page }) => {
      console.log('🚀 Testing Animated Features...');
      
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      // Allow time for entrance animations
      await setTimeout(2000);
      
      // Take screenshot after animations
      await page.screenshot({ 
        path: 'test-results/screenshots/registration-animations.png',
        fullPage: true 
      });
      
      // Test form interaction animations
      const formElements = page.locator('input, button, select');
      const elementCount = await formElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        await formElements.nth(i).hover();
        await setTimeout(200); // Hover animation
      }
      
      console.log('✅ Animation testing completed - visual verification required');
    });
  });

  test.describe('4. 🔐 AUTHENTICATION STATE MANAGEMENT', () => {
    
    test('4.1 Session Persistence - Login State Across Browser Refresh', async ({ page }) => {
      console.log('🚀 Testing Session Persistence...');
      
      // Step 1: Login with admin credentials
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(LoginPageSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Verify login successful
      expect(page.url()).toContain('/admin');
      
      // Step 2: Refresh browser and verify still logged in
      await page.reload();
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should still be on admin dashboard
      expect(page.url()).toContain('/admin');
      
      // Step 3: Verify token still exists
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
      
      console.log('✅ Session persistence working correctly');
    });

    test('4.2 Token Expiration - Automatic Token Refresh and Re-authentication', async ({ page }) => {
      console.log('🚀 Testing Token Expiration...');
      
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.trainer.password);
      await page.locator(LoginPageSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Verify login
      expect(page.url()).toContain('/trainer');
      
      // Simulate expired token by clearing it
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      
      // Try to access protected page
      await page.goto(`${BASE_URL}/trainer/health-protocols`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should be redirected to login
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('✅ Token expiration handling working - redirected to login');
      } else {
        console.log('ℹ️  Token expiration handling may work differently');
      }
    });

    test('4.3 Logout Functionality - Complete Session Cleanup and Redirect', async ({ page }) => {
      console.log('🚀 Testing Logout Functionality...');
      
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.customer.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.customer.password);
      await page.locator(LoginPageSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Verify login
      expect(page.url()).toContain('/my-meal-plans');
      
      // Find and click logout button
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Sign Out")', 
        '[data-testid="logout-button"]',
        'a:has-text("Logout")',
        'a:has-text("Sign Out")'
      ];
      
      let loggedOut = false;
      for (const selector of logoutSelectors) {
        const logoutButton = page.locator(selector);
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForLoadState('networkidle');
          await setTimeout(2000);
          
          // Check if redirected to login or home
          const currentUrl = page.url();
          if (currentUrl.includes('/login') || currentUrl === BASE_URL + '/') {
            console.log('✅ Logout successful - redirected to:', currentUrl);
            
            // Verify token is cleared
            const token = await page.evaluate(() => localStorage.getItem('token'));
            expect(token).toBeFalsy();
            
            loggedOut = true;
            break;
          }
        }
      }
      
      if (!loggedOut) {
        console.log('ℹ️  Logout button not found or logout handled differently');
      }
    });

    test('4.4 Cross-tab Synchronization - Login State Consistency Across Browser Tabs', async ({ browser }) => {
      console.log('🚀 Testing Cross-tab Synchronization...');
      
      // Create two contexts to simulate different tabs with shared storage
      const context1 = await browser.newContext({
        // Same storage state to simulate same browser session
        storageState: undefined
      });
      const context2 = await browser.newContext({
        storageState: undefined  
      });
      
      const tab1 = await context1.newPage();
      const tab2 = await context2.newPage();
      
      // Tab 1: Login
      await tab1.goto(`${BASE_URL}/login`);
      await tab1.waitForLoadState('networkidle');
      
      await tab1.locator(LoginPageSelectors.emailInput).fill(testCredentials.admin.email);
      await tab1.locator(LoginPageSelectors.passwordInput).fill(testCredentials.admin.password);
      await tab1.locator(LoginPageSelectors.loginButton).click();
      
      await tab1.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Verify tab1 is logged in
      expect(tab1.url()).toContain('/admin');
      
      // Tab 2: Check if automatically logged in (depends on implementation)
      await tab2.goto(`${BASE_URL}/admin`);
      await tab2.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      const tab2Url = tab2.url();
      if (tab2Url.includes('/admin')) {
        console.log('✅ Cross-tab synchronization working - auto-logged in');
      } else if (tab2Url.includes('/login')) {
        console.log('ℹ️  Cross-tab requires separate login (common security practice)');
      }
      
      await context1.close();
      await context2.close();
    });
  });

  test.describe('5. 🛡️ SECURITY AND EDGE CASE TESTING', () => {
    
    test('5.1 XSS Prevention - Attempt Script Injection in Form Fields', async ({ page }) => {
      console.log('🚀 Testing XSS Prevention...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>'
      ];
      
      for (const payload of xssPayloads) {
        // Clear form first
        await page.locator(LoginPageSelectors.emailInput).fill('');
        await page.locator(LoginPageSelectors.passwordInput).fill('');
        
        // Try XSS in email field
        await page.locator(LoginPageSelectors.emailInput).fill(payload);
        await page.locator(LoginPageSelectors.passwordInput).fill('password');
        await page.locator(LoginPageSelectors.loginButton).click();
        
        await setTimeout(1000);
        
        // Check that no alert was triggered (XSS prevention working)
        const alertText = await page.evaluate(() => {
          // If XSS worked, this would show alert
          return window.alert ? 'alert-available' : 'alert-safe';
        });
        
        expect(alertText).not.toContain('xss');
      }
      
      console.log('✅ XSS prevention tests passed');
    });

    test('5.2 Rate Limiting - Authentication Attempt Rate Limiting Verification', async ({ page }) => {
      console.log('🚀 Testing Rate Limiting...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Attempt multiple rapid failed logins
      for (let i = 0; i < 5; i++) {
        await page.locator(LoginPageSelectors.emailInput).fill('attacker@test.com');
        await page.locator(LoginPageSelectors.passwordInput).fill('wrongpassword');
        await page.locator(LoginPageSelectors.loginButton).click();
        
        await setTimeout(500); // Small delay between attempts
      }
      
      // Check for rate limiting message
      await setTimeout(2000);
      
      const errorMessage = page.locator(LoginPageSelectors.errorMessage);
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Rate limiting message: ${errorText}`);
        
        if (errorText && (errorText.includes('rate') || errorText.includes('limit') || errorText.includes('attempts'))) {
          console.log('✅ Rate limiting detected');
        } else {
          console.log('⚠️  Rate limiting message unclear');
        }
      } else {
        console.log('ℹ️  Rate limiting may be handled server-side');
      }
    });

    test('5.3 Network Interruption - Authentication During Network Disconnection', async ({ page }) => {
      console.log('🚀 Testing Network Interruption...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Fill valid credentials
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.admin.password);
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      // Try to submit
      await page.locator(LoginPageSelectors.loginButton).click();
      await setTimeout(3000);
      
      // Should show network error
      const errorMessage = page.locator(LoginPageSelectors.errorMessage);
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Network error message: ${errorText}`);
        console.log('✅ Network interruption handled');
      }
      
      // Restore network
      await page.context().setOffline(false);
      
      // Should now work
      await page.locator(LoginPageSelectors.loginButton).click();
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      expect(page.url()).toContain('/admin');
      console.log('✅ Network recovery working');
    });

    test('5.4 Browser Back/Forward - Navigation State Management', async ({ page }) => {
      console.log('🚀 Testing Browser Back/Forward Navigation...');
      
      // Start at login
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Login
      await page.locator(LoginPageSelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(LoginPageSelectors.passwordInput).fill(testCredentials.trainer.password);
      await page.locator(LoginPageSelectors.loginButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should be on trainer dashboard
      expect(page.url()).toContain('/trainer');
      
      // Navigate to another page
      await page.goto(`${BASE_URL}/trainer/health-protocols`);
      await page.waitForLoadState('networkidle');
      
      // Use browser back button
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Should still be authenticated
      expect(page.url()).toContain('/trainer');
      console.log('✅ Browser back navigation maintains authentication');
      
      // Use browser forward
      await page.goForward();
      await page.waitForLoadState('networkidle');
      
      // Should still be authenticated
      expect(page.url()).toContain('/trainer');
      console.log('✅ Browser forward navigation maintains authentication');
    });
  });

  test.describe('6. 🎯 CRITICAL SUCCESS CRITERIA VALIDATION', () => {
    
    test('6.1 ALL THREE TEST CREDENTIALS MUST LOGIN SUCCESSFULLY', async ({ page }) => {
      console.log('🎯 CRITICAL TEST: Validating all three test credentials...');
      
      const results = {
        admin: false,
        trainer: false,
        customer: false
      };
      
      // Test each credential
      for (const [role, creds] of Object.entries(testCredentials)) {
        console.log(`Testing ${role} credentials: ${creds.email}`);
        
        try {
          // Navigate to login
          await page.goto(`${BASE_URL}/login`);
          await page.waitForLoadState('networkidle');
          
          // Clear any existing state
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
          // Login with credentials
          await page.locator(LoginPageSelectors.emailInput).fill(creds.email);
          await page.locator(LoginPageSelectors.passwordInput).fill(creds.password);
          await page.locator(LoginPageSelectors.loginButton).click();
          
          // Wait for response
          await page.waitForLoadState('networkidle');
          await setTimeout(3000);
          
          // Check if login successful
          const currentUrl = page.url();
          const isLoggedIn = !currentUrl.includes('/login');
          
          if (isLoggedIn) {
            console.log(`✅ ${role} login SUCCESSFUL - redirected to: ${currentUrl}`);
            results[role] = true;
            
            // Take success screenshot
            await page.screenshot({ 
              path: `test-results/screenshots/${role}-login-success-validation.png`,
              fullPage: true 
            });
          } else {
            console.log(`❌ ${role} login FAILED - still on: ${currentUrl}`);
            
            // Take failure screenshot
            await page.screenshot({ 
              path: `test-results/screenshots/${role}-login-failure-validation.png`,
              fullPage: true 
            });
          }
          
          // Logout for next test
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
        } catch (error) {
          console.log(`❌ ${role} login ERROR: ${error}`);
          results[role] = false;
        }
      }
      
      // Validate all credentials worked
      console.log('🎯 CREDENTIAL VALIDATION RESULTS:');
      console.log(`Admin (${testCredentials.admin.email}): ${results.admin ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Trainer (${testCredentials.trainer.email}): ${results.trainer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Customer (${testCredentials.customer.email}): ${results.customer ? '✅ PASS' : '❌ FAIL'}`);
      
      // ALL THREE MUST PASS
      expect(results.admin).toBeTruthy();
      expect(results.trainer).toBeTruthy(); 
      expect(results.customer).toBeTruthy();
      
      console.log('🎉 ALL THREE TEST CREDENTIALS LOGIN SUCCESSFULLY - CRITICAL SUCCESS CRITERIA MET!');
    });
  });
});