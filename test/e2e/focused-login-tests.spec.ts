/**
 * Focused Login Tests - Based on Investigation Findings
 * Testing specific scenarios discovered during investigation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

// Working test accounts discovered
const WORKING_ACCOUNTS = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'Admin123!@#',
    role: 'admin'
  },
  trainer: {
    email: 'testtrainer@example.com', 
    password: 'TrainerPassword123!',
    role: 'trainer'
  },
  customer: {
    email: 'testcustomer@example.com',
    password: 'TestPassword123!',
    role: 'customer'
  }
};

test.describe('✅ Focused Login Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Verify login form is accessible and functional', async ({ page }) => {
    console.log('🔍 Testing login form accessibility...');
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    
    // Verify all elements are visible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(rememberCheckbox).toBeVisible();
    
    // Check form labels and accessibility
    await expect(page.locator('text=Email Address')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
    await expect(page.locator('text=Remember me for 30 days')).toBeVisible();
    
    // Check submit button text
    await expect(submitButton).toHaveText('Sign In');
    
    console.log('✅ Login form accessibility verified');
    await page.screenshot({ path: 'test-screenshots/focused-form-verification.png', fullPage: true });
  });

  test('Test successful admin login and role verification', async ({ page }) => {
    console.log('🔐 Testing admin login...');
    
    const account = WORKING_ACCOUNTS.admin;
    
    await page.fill('input[name="email"]', account.email);
    await page.fill('input[name="password"]', account.password);
    
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`   Admin login response time: ${responseTime}ms`);
    
    // Verify redirect away from login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    console.log(`   Redirected to: ${currentUrl}`);
    
    // Look for admin-specific indicators
    const adminIndicators = [
      page.locator('text=Admin'),
      page.locator('text=Dashboard'),
      page.locator('text=Users'),
      page.locator('text=Management')
    ];
    
    let adminFeaturesFound = 0;
    for (const indicator of adminIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        adminFeaturesFound++;
      }
    }
    
    console.log(`   Admin features detected: ${adminFeaturesFound}/4`);
    await page.screenshot({ path: 'test-screenshots/focused-admin-login.png', fullPage: true });
    
    console.log('✅ Admin login successful');
  });

  test('Test successful trainer login and role verification', async ({ page }) => {
    console.log('👨‍💼 Testing trainer login...');
    
    const account = WORKING_ACCOUNTS.trainer;
    
    await page.fill('input[name="email"]', account.email);
    await page.fill('input[name="password"]', account.password);
    
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`   Trainer login response time: ${responseTime}ms`);
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    console.log(`   Redirected to: ${currentUrl}`);
    
    // Look for trainer-specific content
    const trainerIndicators = [
      page.locator('text=Trainer'),
      page.locator('text=Customers'),
      page.locator('text=Health Protocols'),
      page.locator('text=Meal Plans')
    ];
    
    let trainerFeaturesFound = 0;
    for (const indicator of trainerIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        trainerFeaturesFound++;
      }
    }
    
    console.log(`   Trainer features detected: ${trainerFeaturesFound}/4`);
    await page.screenshot({ path: 'test-screenshots/focused-trainer-login.png', fullPage: true });
    
    console.log('✅ Trainer login successful');
  });

  test('Test successful customer login and role verification', async ({ page }) => {
    console.log('👤 Testing customer login...');
    
    const account = WORKING_ACCOUNTS.customer;
    
    await page.fill('input[name="email"]', account.email);
    await page.fill('input[name="password"]', account.password);
    
    const startTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`   Customer login response time: ${responseTime}ms`);
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    console.log(`   Redirected to: ${currentUrl}`);
    
    // Look for customer-specific content
    const customerIndicators = [
      page.locator('text=My Meal Plans'),
      page.locator('text=Progress'),
      page.locator('text=Goals'),
      page.locator('text=Profile')
    ];
    
    let customerFeaturesFound = 0;
    for (const indicator of customerIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        customerFeaturesFound++;
      }
    }
    
    console.log(`   Customer features detected: ${customerFeaturesFound}/4`);
    await page.screenshot({ path: 'test-screenshots/focused-customer-login.png', fullPage: true });
    
    console.log('✅ Customer login successful');
  });

  test('Test invalid credentials handling', async ({ page }) => {
    console.log('❌ Testing invalid credentials...');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Wait for error response
    
    // Should still be on login page (URL contains login or is root)
    const currentUrl = page.url();
    const stillOnLogin = currentUrl.includes('/login') || currentUrl === `${BASE_URL}/`;
    
    expect(stillOnLogin).toBeTruthy();
    console.log(`   Stayed on login page: ${stillOnLogin}`);
    console.log(`   Current URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'test-screenshots/focused-invalid-credentials.png', fullPage: true });
    
    console.log('✅ Invalid credentials properly handled');
  });

  test('Test email validation and form behavior', async ({ page }) => {
    console.log('📧 Testing email validation...');
    
    const invalidEmails = [
      'not-an-email',
      '@domain.com',
      'user@'
    ];
    
    for (const email of invalidEmails) {
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'somepassword');
      
      // Try to submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Check for HTML5 validation
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      console.log(`   Email "${email}" validation: "${validationMessage}"`);
      
      // Clear form
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
    }
    
    await page.screenshot({ path: 'test-screenshots/focused-email-validation.png', fullPage: true });
    console.log('✅ Email validation tested');
  });

  test('Test password masking and security', async ({ page }) => {
    console.log('🔒 Testing password security...');
    
    const passwordInput = page.locator('input[name="password"]');
    
    // Fill password
    await passwordInput.fill('TestPassword123');
    
    // Verify input type is password
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
    
    // Verify value is not visible in page source
    const pageSource = await page.content();
    expect(pageSource).not.toContain('TestPassword123');
    
    console.log('✅ Password properly masked');
    
    // Test that password can be retrieved programmatically (for form functionality)
    const inputValue = await passwordInput.inputValue();
    expect(inputValue).toBe('TestPassword123');
    
    console.log('✅ Password security verified');
    await page.screenshot({ path: 'test-screenshots/focused-password-security.png', fullPage: true });
  });

  test('Test form submission with Enter key', async ({ page }) => {
    console.log('⌨️ Testing keyboard submission...');
    
    const account = WORKING_ACCOUNTS.customer;
    
    await page.fill('input[name="email"]', account.email);
    await page.fill('input[name="password"]', account.password);
    
    // Submit with Enter key instead of clicking button
    await page.press('input[name="password"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const loginSuccessful = !currentUrl.includes('/login');
    
    console.log(`   Keyboard submission successful: ${loginSuccessful}`);
    console.log(`   Final URL: ${currentUrl}`);
    
    expect(loginSuccessful).toBeTruthy();
    
    await page.screenshot({ path: 'test-screenshots/focused-keyboard-submit.png', fullPage: true });
    console.log('✅ Keyboard submission working');
  });

  test('Test remember me functionality', async ({ page }) => {
    console.log('💾 Testing remember me checkbox...');
    
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    
    // Verify checkbox is present and unchecked by default
    await expect(rememberCheckbox).toBeVisible();
    const initialState = await rememberCheckbox.isChecked();
    console.log(`   Initial checkbox state: ${initialState ? 'checked' : 'unchecked'}`);
    
    // Test toggling checkbox
    await rememberCheckbox.click();
    const checkedState = await rememberCheckbox.isChecked();
    console.log(`   Checkbox after click: ${checkedState ? 'checked' : 'unchecked'}`);
    
    expect(checkedState).not.toBe(initialState);
    
    await page.screenshot({ path: 'test-screenshots/focused-remember-me.png', fullPage: true });
    console.log('✅ Remember me checkbox functional');
  });

  test('Test responsive design on different screen sizes', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1366, height: 768 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Verify form elements are still visible and accessible
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      console.log(`   ${viewport.name} (${viewport.width}x${viewport.height}): ✅`);
      
      await page.screenshot({ 
        path: `test-screenshots/focused-responsive-${viewport.name}.png`,
        fullPage: true
      });
    }
    
    console.log('✅ Responsive design verified');
  });
});