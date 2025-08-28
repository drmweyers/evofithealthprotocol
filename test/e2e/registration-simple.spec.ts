import { test, expect } from '@playwright/test';

const testUser = {
  email: 'simple-qa-test@example.com',
  password: 'SimpleTest123@',
  role: 'customer'
};

test.describe('Registration Simple Tests', () => {
  test('should load registration page', async ({ page }) => {
    await page.goto('/register');
    
    // Check page title
    await expect(page).toHaveTitle(/EvoFit|Registration|Create/);
    
    // Check for key form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show password requirements', async ({ page }) => {
    await page.goto('/register');
    
    // Check for password requirements text
    await expect(page.locator('text=At least 8 characters')).toBeVisible();
    await expect(page.locator('text=One uppercase letter')).toBeVisible();
    await expect(page.locator('text=One number')).toBeVisible();
    await expect(page.locator('text=One special character')).toBeVisible();
  });

  test('should validate empty form submission', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on registration page
    await expect(page).toHaveURL(/\/register/);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');
    
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'ValidPass123@');
    await page.fill('input[name="confirmPassword"]', 'ValidPass123@');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await page.waitForTimeout(1000);
    const hasError = await page.locator('text=Invalid email').count() > 0;
    expect(hasError).toBeTruthy();
  });

  test('should validate weak password', async ({ page }) => {
    await page.goto('/register');
    
    // Fill weak password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show password validation error
    await page.waitForTimeout(1000);
    const hasPasswordError = await page.locator('text=Password must').count() > 0;
    expect(hasPasswordError).toBeTruthy();
  });

  test('should validate password mismatch', async ({ page }) => {
    await page.goto('/register');
    
    // Fill mismatched passwords
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'ValidPass123@');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123@');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show mismatch error
    await page.waitForTimeout(1000);
    const hasMismatchError = await page.locator("text=Passwords don't match").count() > 0;
    expect(hasMismatchError).toBeTruthy();
  });
});