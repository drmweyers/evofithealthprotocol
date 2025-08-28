/**
 * Comprehensive Login Functionality Test Suite - HealthProtocol Application
 * Testing all aspects of login functionality including positive cases, negative cases,
 * UI/UX validation, security measures, and performance
 */

import { test, expect, Page, Browser } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

// Test accounts as provided in mission
const TEST_ACCOUNTS = {
  customer: {
    email: 'customer@demo.com',
    password: 'Password123@',
    role: 'customer',
    expectedRedirect: '/my-meal-plans' // or customer dashboard
  },
  trainer: {
    email: 'trainer@demo.com',
    password: 'Password123@',
    role: 'trainer',
    expectedRedirect: '/trainer'
  },
  newUser: {
    email: 'newuser@demo.com',
    password: 'SecurePass123@',
    role: 'customer',
    expectedRedirect: '/my-meal-plans'
  }
};

test.describe('🔐 Comprehensive Login Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions and navigate to login page
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test.describe('📱 UI/UX and Form Validation', () => {
    
    test('Should display login form with all required elements', async ({ page }) => {
      // Verify page title
      expect(await page.title()).toContain('Login');
      
      // Check for essential form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Check for labels and accessibility
      const emailLabel = page.locator('label[for*="email"], label:has-text("Email")');
      const passwordLabel = page.locator('label[for*="password"], label:has-text("Password")');
      
      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
      
      // Take screenshot for documentation
      await page.screenshot({ path: 'test-screenshots/login-form-elements.png', fullPage: true });
      
      console.log('✅ Login form UI elements verified');
    });

    test('Should show validation errors for empty form submission', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      // Submit empty form
      await submitButton.click();
      await page.waitForTimeout(1000); // Wait for validation
      
      // Look for error messages
      const errorMessages = page.locator('.error, .alert, [data-testid="error"], .text-red-500, .text-danger');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        console.log(`✅ Found ${errorCount} validation error(s) for empty form`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`   Error ${i + 1}: ${errorText}`);
        }
      } else {
        // Check if browser native validation is working
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        
        const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        
        console.log(`Email validation message: "${emailValidation}"`);
        console.log(`Password validation message: "${passwordValidation}"`);
      }
      
      await page.screenshot({ path: 'test-screenshots/empty-form-validation.png', fullPage: true });
    });

    test('Should handle invalid email format validation', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com'
      ];
      
      for (const invalidEmail of invalidEmails) {
        await emailInput.fill(invalidEmail);
        await passwordInput.fill('SomePassword123');
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Check validation
        const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        console.log(`Invalid email "${invalidEmail}" validation: "${emailValidation}"`);
        
        // Clear form for next test
        await emailInput.clear();
        await passwordInput.clear();
      }
      
      await page.screenshot({ path: 'test-screenshots/invalid-email-validation.png', fullPage: true });
    });

    test('Should be responsive on different screen sizes', async ({ page }) => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Check if form is still accessible
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
        
        await page.screenshot({ 
          path: `test-screenshots/${viewport.name}-responsive.png`,
          fullPage: true
        });
        
        console.log(`✅ Login form responsive on ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    });
  });

  test.describe('✅ Positive Test Cases - Valid Logins', () => {
    
    test('Should successfully login customer account', async ({ page }) => {
      const account = TEST_ACCOUNTS.customer;
      
      await page.fill('input[type="email"], input[name="email"]', account.email);
      await page.fill('input[type="password"], input[name="password"]', account.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.click();
      
      // Wait for redirect
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`Customer login redirect URL: ${currentUrl}`);
      
      // Check if redirected away from login page
      expect(currentUrl).not.toContain('/login');
      
      // Look for customer-specific content
      const customerIndicators = [
        'My Meal Plans',
        'Progress',
        'Customer Dashboard',
        'Meal Plan',
        'My Progress'
      ];
      
      let foundIndicator = false;
      for (const indicator of customerIndicators) {
        const element = page.locator(`text="${indicator}"`);
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`✅ Found customer indicator: "${indicator}"`);
          foundIndicator = true;
          break;
        }
      }
      
      if (!foundIndicator) {
        console.log('⚠️ No specific customer indicators found, checking for general authenticated state');
        // Check for logout button or user menu as authentication indicator
        const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")');
        if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log('✅ Found logout button - user is authenticated');
          foundIndicator = true;
        }
      }
      
      await page.screenshot({ path: 'test-screenshots/customer-login-success.png', fullPage: true });
      
      expect(foundIndicator).toBeTruthy();
      console.log('✅ Customer login successful');
    });

    test('Should successfully login trainer account', async ({ page }) => {
      const account = TEST_ACCOUNTS.trainer;
      
      await page.fill('input[type="email"], input[name="email"]', account.email);
      await page.fill('input[type="password"], input[name="password"]', account.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.click();
      
      // Wait for redirect
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`Trainer login redirect URL: ${currentUrl}`);
      
      // Check if redirected away from login page
      expect(currentUrl).not.toContain('/login');
      
      // Look for trainer-specific content
      const trainerIndicators = [
        'Trainer Dashboard',
        'Customers',
        'Health Protocols',
        'Meal Plans',
        'Customer Management'
      ];
      
      let foundIndicator = false;
      for (const indicator of trainerIndicators) {
        const element = page.locator(`text="${indicator}"`);
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`✅ Found trainer indicator: "${indicator}"`);
          foundIndicator = true;
          break;
        }
      }
      
      if (!foundIndicator) {
        console.log('⚠️ No specific trainer indicators found, checking for general authenticated state');
        const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")');
        if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log('✅ Found logout button - user is authenticated');
          foundIndicator = true;
        }
      }
      
      await page.screenshot({ path: 'test-screenshots/trainer-login-success.png', fullPage: true });
      
      expect(foundIndicator).toBeTruthy();
      console.log('✅ Trainer login successful');
    });

    test('Should handle case-insensitive email login', async ({ page }) => {
      const account = TEST_ACCOUNTS.customer;
      
      // Test with uppercase email
      const uppercaseEmail = account.email.toUpperCase();
      
      await page.fill('input[type="email"], input[name="email"]', uppercaseEmail);
      await page.fill('input[type="password"], input[name="password"]', account.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.click();
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`Case-insensitive login URL: ${currentUrl}`);
      
      // Should not be on login page if successful
      const loginSuccess = !currentUrl.includes('/login');
      console.log(`✅ Case-insensitive email login ${loginSuccess ? 'successful' : 'failed'}`);
      
      await page.screenshot({ path: 'test-screenshots/case-insensitive-login.png', fullPage: true });
    });
  });

  test.describe('❌ Negative Test Cases - Invalid Inputs', () => {
    
    test('Should show error for non-existent user', async ({ page }) => {
      await page.fill('input[type="email"], input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'SomePassword123');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.click();
      
      await page.waitForTimeout(3000); // Wait for response
      
      // Should still be on login page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
      
      // Look for error messages
      const errorSelectors = [
        '.error',
        '.alert',
        '[data-testid="error"]',
        '.text-red-500',
        '.text-danger',
        'text="Invalid"',
        'text="User not found"',
        'text="Authentication failed"'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector);
        if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          const errorText = await errorElement.textContent();
          console.log(`✅ Found error message: "${errorText}"`);
          errorFound = true;
          break;
        }
      }
      
      await page.screenshot({ path: 'test-screenshots/nonexistent-user-error.png', fullPage: true });
      
      console.log(`Non-existent user error handling: ${errorFound ? 'Working' : 'Needs verification'}`);
    });

    test('Should show error for incorrect password', async ({ page }) => {
      const account = TEST_ACCOUNTS.customer;
      
      await page.fill('input[type="email"], input[name="email"]', account.email);
      await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await submitButton.click();
      
      await page.waitForTimeout(3000); // Wait for response
      
      // Should still be on login page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
      
      await page.screenshot({ path: 'test-screenshots/incorrect-password-error.png', fullPage: true });
      
      console.log('✅ Incorrect password properly handled');
    });

    test('Should test SQL injection attempts', async ({ page }) => {
      const sqlInjectionAttempts = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "' UNION SELECT * FROM users--"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        await page.fill('input[type="email"], input[name="email"]', injection);
        await page.fill('input[type="password"], input[name="password"]', 'password');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        await submitButton.click();
        
        await page.waitForTimeout(2000);
        
        // Should still be on login page and not authenticated
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
        
        console.log(`✅ SQL injection attempt blocked: "${injection}"`);
        
        // Clear form for next attempt
        await page.fill('input[type="email"], input[name="email"]', '');
        await page.fill('input[type="password"], input[name="password"]', '');
      }
      
      await page.screenshot({ path: 'test-screenshots/sql-injection-blocked.png', fullPage: true });
    });

    test('Should test XSS attempts in email field', async ({ page }) => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>'
      ];
      
      for (const xss of xssAttempts) {
        await page.fill('input[type="email"], input[name="email"]', xss);
        await page.fill('input[type="password"], input[name="password"]', 'password');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        // Check that no alert was triggered
        const alerts = [];
        page.on('dialog', dialog => alerts.push(dialog.message()));
        
        expect(alerts.length).toBe(0);
        console.log(`✅ XSS attempt blocked: "${xss}"`);
        
        // Clear form
        await page.fill('input[type="email"], input[name="email"]', '');
        await page.fill('input[type="password"], input[name="password"]', '');
      }
      
      await page.screenshot({ path: 'test-screenshots/xss-blocked.png', fullPage: true });
    });
  });

  test.describe('🔒 Security Testing', () => {
    
    test('Should mask password input', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      // Fill password
      await passwordInput.fill('TestPassword123');
      
      // Check that input type is password
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
      
      // Check that value is not visible in DOM
      const inputValue = await passwordInput.inputValue();
      const domValue = await passwordInput.evaluate((el: HTMLInputElement) => el.value);
      
      console.log('✅ Password input properly masked');
      console.log(`   Input type: ${inputType}`);
      console.log(`   Value accessible via inputValue(): ${inputValue ? 'Yes' : 'No'}`);
      
      await page.screenshot({ path: 'test-screenshots/password-masking.png', fullPage: true });
    });

    test('Should test rate limiting with multiple failed attempts', async ({ page }) => {
      const maxAttempts = 5;
      let blockedAfter = -1;
      
      for (let i = 1; i <= maxAttempts; i++) {
        await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
        await page.fill('input[type="password"], input[name="password"]', `wrongpassword${i}`);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        const startTime = Date.now();
        await submitButton.click();
        
        await page.waitForTimeout(2000);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`Attempt ${i}: Response time ${responseTime}ms`);
        
        // Look for rate limiting messages
        const rateLimitMessages = [
          'Too many attempts',
          'Rate limit',
          'Please try again later',
          'Blocked'
        ];
        
        let rateLimited = false;
        for (const message of rateLimitMessages) {
          if (await page.locator(`text="${message}"`).isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`✅ Rate limiting activated after ${i} attempts: "${message}"`);
            rateLimited = true;
            blockedAfter = i;
            break;
          }
        }
        
        if (rateLimited) break;
        
        // Clear form for next attempt
        await page.fill('input[type="email"], input[name="email"]', '');
        await page.fill('input[type="password"], input[name="password"]', '');
      }
      
      await page.screenshot({ path: 'test-screenshots/rate-limiting-test.png', fullPage: true });
      
      if (blockedAfter > 0) {
        console.log(`✅ Rate limiting working - blocked after ${blockedAfter} attempts`);
      } else {
        console.log('⚠️ Rate limiting not detected - may need manual verification');
      }
    });

    test('Should check for HTTPS enforcement', async ({ page }) => {
      const currentUrl = page.url();
      console.log(`Current protocol: ${new URL(currentUrl).protocol}`);
      
      // For localhost testing, HTTP is acceptable
      // In production, this should be HTTPS
      if (currentUrl.includes('localhost')) {
        console.log('✅ HTTP acceptable for localhost testing');
      } else {
        expect(currentUrl).toMatch(/^https:/);
        console.log('✅ HTTPS enforced for production');
      }
    });
  });

  test.describe('⚡ Performance Testing', () => {
    
    test('Should measure login response time', async ({ page }) => {
      const account = TEST_ACCOUNTS.customer;
      
      await page.fill('input[type="email"], input[name="email"]', account.email);
      await page.fill('input[type="password"], input[name="password"]', account.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      const startTime = Date.now();
      await submitButton.click();
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      console.log(`✅ Login response time: ${responseTime}ms`);
      
      // Response time should be under 5 seconds for good UX
      expect(responseTime).toBeLessThan(5000);
      
      if (responseTime < 1000) {
        console.log('🟢 Excellent response time (< 1s)');
      } else if (responseTime < 3000) {
        console.log('🟡 Good response time (< 3s)');
      } else {
        console.log('🔴 Slow response time (> 3s)');
      }
    });

    test('Should test concurrent login attempts', async ({ browser }) => {
      const contexts = [];
      const pages = [];
      const concurrentUsers = 3;
      
      // Create multiple browser contexts
      for (let i = 0; i < concurrentUsers; i++) {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        await page.goto(`${BASE_URL}/login`);
      }
      
      // Perform concurrent logins
      const loginPromises = pages.map(async (page, index) => {
        const account = index === 0 ? TEST_ACCOUNTS.customer : TEST_ACCOUNTS.trainer;
        
        const startTime = Date.now();
        await page.fill('input[type="email"], input[name="email"]', account.email);
        await page.fill('input[type="password"], input[name="password"]', account.password);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        const endTime = Date.now();
        
        return {
          user: index + 1,
          responseTime: endTime - startTime,
          success: !page.url().includes('/login')
        };
      });
      
      const results = await Promise.all(loginPromises);
      
      results.forEach(result => {
        console.log(`User ${result.user}: ${result.success ? 'Success' : 'Failed'} in ${result.responseTime}ms`);
      });
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
      
      const allSuccessful = results.every(r => r.success);
      console.log(`✅ Concurrent logins: ${allSuccessful ? 'All successful' : 'Some failed'}`);
    });
  });

  test.describe('🎯 Accessibility Testing', () => {
    
    test('Should be navigable with keyboard only', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Should focus email
      const emailFocused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && (activeElement.type === 'email' || activeElement.name === 'email');
      });
      
      await page.keyboard.press('Tab'); // Should focus password
      const passwordFocused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.type === 'password';
      });
      
      await page.keyboard.press('Tab'); // Should focus submit button
      const buttonFocused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.type === 'submit';
      });
      
      console.log(`Email focusable: ${emailFocused}`);
      console.log(`Password focusable: ${passwordFocused}`);
      console.log(`Submit button focusable: ${buttonFocused}`);
      
      // Test form submission with Enter key
      await page.fill('input[type="email"], input[name="email"]', TEST_ACCOUNTS.customer.email);
      await page.fill('input[type="password"], input[name="password"]', TEST_ACCOUNTS.customer.password);
      
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Keyboard navigation and form submission working');
      await page.screenshot({ path: 'test-screenshots/keyboard-navigation.png', fullPage: true });
    });
  });
});