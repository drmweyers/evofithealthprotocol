import { test, expect } from '@playwright/test';

// Test credentials
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer'
  }
};

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3500');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/EvoFit/);
    
    // Check if login form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for brand elements
    await expect(page.locator('text=EvoFit Health Protocol')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should show test credentials in development', async ({ page }) => {
    // Check if test credentials hint is shown in development
    await expect(page.locator('text=Test Credentials')).toBeVisible();
    await expect(page.locator('text=admin@fitmeal.pro')).toBeVisible();
    await expect(page.locator('text=trainer.test@evofitmeals.com')).toBeVisible();
    await expect(page.locator('text=customer.test@evofitmeals.com')).toBeVisible();
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    // Fill in admin credentials
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation and check success
    await expect(page).toHaveURL(/admin/);
    
    // Verify we're logged in (look for logout option or user info)
    await expect(page.locator('body')).not.toContain('Welcome Back');
  });

  test('should successfully login with trainer credentials', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    
    await page.click('button[type="submit"]');
    
    // Trainer should redirect to protocols page
    await expect(page).toHaveURL(/protocols/);
    await expect(page.locator('body')).not.toContain('Welcome Back');
  });

  test('should successfully login with customer credentials', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNTS.customer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.customer.password);
    
    await page.click('button[type="submit"]');
    
    // Customer should redirect to protocols page  
    await expect(page).toHaveURL(/protocols/);
    await expect(page.locator('body')).not.toContain('Welcome Back');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Login failed')).toBeVisible();
    
    // Should stay on login page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'somepassword');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should require password field', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    // Leave password empty
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.fill('input[type="password"]', 'testpassword');
    
    // Password should be hidden initially
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the eye icon to show password
    await page.click('[aria-label*="password"], button:has(svg)');
    
    // Password should now be visible
    const passwordInputVisible = page.locator('input[type="text"]');
    await expect(passwordInputVisible).toBeVisible();
  });

  test('should handle loading state during login', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    
    // Click submit and immediately check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading spinner/text briefly
    await expect(page.locator('text=Signing in')).toBeVisible({ timeout: 1000 });
  });

  test('should remember me checkbox work', async ({ page }) => {
    // Check the remember me checkbox
    await page.check('input[type="checkbox"]');
    
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    
    await page.click('button[type="submit"]');
    
    // Should successfully log in
    await expect(page).toHaveURL(/protocols/);
  });
});

test.describe('Navigation and Routing', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('http://localhost:3500/protocols');
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3500/');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should redirect unauthenticated users from admin route', async ({ page }) => {
    await page.goto('http://localhost:3500/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3500/');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should prevent unauthorized access to admin routes', async ({ page }) => {
    // Login as trainer first
    await page.goto('http://localhost:3500');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.trainer.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.trainer.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page).toHaveURL(/protocols/);
    
    // Try to access admin route
    await page.goto('http://localhost:3500/admin');
    
    // Should redirect back to protocols (not admin)
    await expect(page).toHaveURL(/protocols/);
  });
});
