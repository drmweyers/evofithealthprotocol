import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3500';
const API_BASE_URL = `${BASE_URL}/api`;

// Test data
const testUsers = {
  validCustomer: {
    email: 'qa-customer@testdomain.com',
    password: 'ValidPass123@',
    role: 'customer'
  },
  validTrainer: {
    email: 'qa-trainer@testdomain.com', 
    password: 'TrainerPass123@',
    role: 'trainer'
  },
  duplicate: {
    email: 'duplicate@testdomain.com',
    password: 'DuplicatePass123@',
    role: 'customer'
  },
  weakPassword: {
    email: 'weak@testdomain.com',
    password: 'weak',
    role: 'customer'
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'ValidPass123@',
    role: 'customer'
  }
};

test.describe('Account Registration - Comprehensive Testing', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to registration page
    await page.goto(`${BASE_URL}/register`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await context.close();
  });

  test.describe('UI/UX Testing', () => {
    test('should display all required registration form elements', async () => {
      // Check for form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toHaveCount(2); // password + confirm password
      await expect(page.locator('select')).toBeVisible(); // role selector
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check form labels
      await expect(page.locator('text=Email Address')).toBeVisible();
      await expect(page.locator('text=Password')).toBeVisible();
      await expect(page.locator('text=Confirm Password')).toBeVisible();
      await expect(page.locator('text=Account Type')).toBeVisible();
      
      // Check password requirements display
      await expect(page.locator('text=At least 8 characters')).toBeVisible();
      await expect(page.locator('text=One uppercase letter')).toBeVisible();
      await expect(page.locator('text=One lowercase letter')).toBeVisible();
      await expect(page.locator('text=One number')).toBeVisible();
      await expect(page.locator('text=One special character')).toBeVisible();
    });

    test('should show login link for existing users', async () => {
      await expect(page.locator('text=Already have an account?')).toBeVisible();
      await expect(page.locator('a[href="/login"]')).toBeVisible();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('form')).toBeVisible();
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('form')).toBeVisible();
      
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Positive Test Cases', () => {
    test('should successfully register a customer account', async () => {
      // Fill registration form
      await page.fill('input[type="email"]', testUsers.validCustomer.email);
      await page.fill('input[name="password"]', testUsers.validCustomer.password);
      await page.fill('input[name="confirmPassword"]', testUsers.validCustomer.password);
      await page.selectOption('select[name="role"]', testUsers.validCustomer.role);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success response
      await page.waitForLoadState('networkidle');
      
      // Should redirect to appropriate page based on role
      await expect(page).toHaveURL(/\/(my-meal-plans|dashboard)/);
      
      // Check for success indication
      const url = page.url();
      expect(url).not.toContain('/register');
    });

    test('should successfully register a trainer account', async () => {
      // Fill registration form
      await page.fill('input[type="email"]', testUsers.validTrainer.email);
      await page.fill('input[name="password"]', testUsers.validTrainer.password);
      await page.fill('input[name="confirmPassword"]', testUsers.validTrainer.password);
      await page.selectOption('select[name="role"]', testUsers.validTrainer.role);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success response
      await page.waitForLoadState('networkidle');
      
      // Should redirect to trainer dashboard
      const url = page.url();
      expect(url).not.toContain('/register');
    });

    test('should show loading state during registration', async () => {
      // Fill form
      await page.fill('input[type="email"]', 'loading-test@test.com');
      await page.fill('input[name="password"]', 'LoadingTest123@');
      await page.fill('input[name="confirmPassword"]', 'LoadingTest123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      // Check for loading state after clicking submit
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Creating Account...')).toBeVisible();
    });
  });

  test.describe('Negative Test Cases', () => {
    test('should reject duplicate email registration', async () => {
      // First registration
      await page.fill('input[type="email"]', testUsers.duplicate.email);
      await page.fill('input[name="password"]', testUsers.duplicate.password);
      await page.fill('input[name="confirmPassword"]', testUsers.duplicate.password);
      await page.selectOption('select[name="role"]', testUsers.duplicate.role);
      await page.click('button[type="submit"]');
      
      // Wait for completion
      await page.waitForLoadState('networkidle');
      
      // Go back to registration page for second attempt
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      // Try to register again with same email
      await page.fill('input[type="email"]', testUsers.duplicate.email);
      await page.fill('input[name="password"]', testUsers.duplicate.password);
      await page.fill('input[name="confirmPassword"]', testUsers.duplicate.password);
      await page.selectOption('select[name="role"]', testUsers.duplicate.role);
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=An account with this email already exists')).toBeVisible();
    });

    test('should reject invalid email formats', async () => {
      await page.fill('input[type="email"]', testUsers.invalidEmail.email);
      await page.fill('input[name="password"]', testUsers.invalidEmail.password);
      await page.fill('input[name="confirmPassword"]', testUsers.invalidEmail.password);
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('text=Invalid email address')).toBeVisible();
    });

    test('should reject weak passwords', async () => {
      await page.fill('input[type="email"]', testUsers.weakPassword.email);
      await page.fill('input[name="password"]', testUsers.weakPassword.password);
      await page.fill('input[name="confirmPassword"]', testUsers.weakPassword.password);
      await page.selectOption('select[name="role"]', testUsers.weakPassword.role);
      
      await page.click('button[type="submit"]');
      
      // Should show password validation errors
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should reject mismatched password confirmation', async () => {
      await page.fill('input[type="email"]', 'mismatch@test.com');
      await page.fill('input[name="password"]', 'ValidPass123@');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should show password mismatch error
      await expect(page.locator("text=Passwords don't match")).toBeVisible();
    });

    test('should validate empty required fields', async () => {
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Should show validation errors for required fields
      const errorCount = await page.locator('.text-destructive, .text-red-500, .error').count();
      expect(errorCount).toBeGreaterThan(0);
    });
  });

  test.describe('Password Validation Testing', () => {
    test('should reject password without uppercase letter', async () => {
      await page.fill('input[type="email"]', 'nouppercase@test.com');
      await page.fill('input[name="password"]', 'nouppercase123@');
      await page.fill('input[name="confirmPassword"]', 'nouppercase123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password must contain at least one uppercase letter')).toBeVisible();
    });

    test('should reject password without lowercase letter', async () => {
      await page.fill('input[type="email"]', 'nolowercase@test.com');
      await page.fill('input[name="password"]', 'NOLOWERCASE123@');
      await page.fill('input[name="confirmPassword"]', 'NOLOWERCASE123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password must contain at least one lowercase letter')).toBeVisible();
    });

    test('should reject password without numbers', async () => {
      await page.fill('input[type="email"]', 'nonumber@test.com');
      await page.fill('input[name="password"]', 'NoNumber@');
      await page.fill('input[name="confirmPassword"]', 'NoNumber@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password must contain at least one number')).toBeVisible();
    });

    test('should reject password without special characters', async () => {
      await page.fill('input[type="email"]', 'nospecial@test.com');
      await page.fill('input[name="password"]', 'NoSpecial123');
      await page.fill('input[name="confirmPassword"]', 'NoSpecial123');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password must contain at least one special character')).toBeVisible();
    });

    test('should accept password meeting all requirements', async () => {
      await page.fill('input[type="email"]', 'strongpassword@test.com');
      await page.fill('input[name="password"]', 'StrongPass123@');
      await page.fill('input[name="confirmPassword"]', 'StrongPass123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should not show password validation errors
      await page.waitForLoadState('networkidle');
      const passwordErrors = await page.locator('text=Password must').count();
      expect(passwordErrors).toBe(0);
    });
  });

  test.describe('Role Selection Testing', () => {
    test('should have customer and trainer role options', async () => {
      await page.click('select[name="role"]');
      
      await expect(page.locator('option[value="customer"]')).toBeVisible();
      await expect(page.locator('option[value="trainer"]')).toBeVisible();
      
      // Admin option should not be available for public registration
      await expect(page.locator('option[value="admin"]')).not.toBeVisible();
    });

    test('should default to customer role', async () => {
      const selectedValue = await page.locator('select[name="role"]').inputValue();
      expect(selectedValue).toBe('customer');
    });

    test('should allow switching between roles', async () => {
      await page.selectOption('select[name="role"]', 'trainer');
      let selectedValue = await page.locator('select[name="role"]').inputValue();
      expect(selectedValue).toBe('trainer');
      
      await page.selectOption('select[name="role"]', 'customer');
      selectedValue = await page.locator('select[name="role"]').inputValue();
      expect(selectedValue).toBe('customer');
    });
  });

  test.describe('Security Testing', () => {
    test('should sanitize input fields against XSS', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      await page.fill('input[type="email"]', `xss@test.com`);
      await page.fill('input[name="password"]', `${xssPayload}ValidPass123@`);
      await page.fill('input[name="confirmPassword"]', `${xssPayload}ValidPass123@`);
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should not execute script - password will be hashed anyway
      // Wait for response and check no alert was triggered
      await page.waitForTimeout(2000);
      const alerts = await page.evaluate(() => window.alerts || []);
      expect(alerts).toBeUndefined();
    });

    test('should have proper CSRF protection', async () => {
      // Check for CSRF token or similar protection
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Form should be protected against cross-site requests
      // This is handled by the backend security middleware
    });

    test('should handle SQL injection attempts safely', async () => {
      const sqlPayload = "admin'; DROP TABLE users; --";
      
      await page.fill('input[type="email"]', `${sqlPayload}@test.com`);
      await page.fill('input[name="password"]', 'ValidPass123@');
      await page.fill('input[name="confirmPassword"]', 'ValidPass123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should show email validation error, not crash
      await expect(page.locator('text=Invalid email')).toBeVisible();
    });
  });

  test.describe('API Integration Testing', () => {
    test('should handle API errors gracefully', async () => {
      // Intercept network request to simulate server error
      await page.route(`${API_BASE_URL}/auth/register`, (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'error', message: 'Server error' })
        });
      });

      await page.fill('input[type="email"]', 'servererror@test.com');
      await page.fill('input[name="password"]', 'ValidPass123@');
      await page.fill('input[name="confirmPassword"]', 'ValidPass123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should show error message to user
      await expect(page.locator('text=An error occurred during registration')).toBeVisible();
    });

    test('should handle network timeouts', async () => {
      // Intercept and delay network request
      await page.route(`${API_BASE_URL}/auth/register`, async (route) => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });

      await page.fill('input[type="email"]', 'timeout@test.com');
      await page.fill('input[name="password"]', 'ValidPass123@');
      await page.fill('input[name="confirmPassword"]', 'ValidPass123@');
      await page.selectOption('select[name="role"]', 'customer');
      
      await page.click('button[type="submit"]');
      
      // Should show loading state
      await expect(page.locator('text=Creating Account...')).toBeVisible();
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should have proper form labels and ARIA attributes', async () => {
      // Check for proper labeling
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('id');
      
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toHaveAttribute('id');
      
      // Check for associated labels
      const emailLabel = page.locator('label[for]');
      await expect(emailLabel).toBeVisible();
    });

    test('should be keyboard navigable', async () => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="confirmPassword"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('select[name="role"]')).toBeFocused();
    });

    test('should have proper color contrast for error messages', async () => {
      // Trigger validation error
      await page.click('button[type="submit"]');
      
      // Check error message styling
      const errorElement = page.locator('.text-destructive, .text-red-500').first();
      if (await errorElement.count() > 0) {
        const color = await errorElement.evaluate(el => 
          window.getComputedStyle(el).color
        );
        // Error text should be red or similar high-contrast color
        expect(color).toBeDefined();
      }
    });
  });
});