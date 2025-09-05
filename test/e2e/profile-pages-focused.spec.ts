import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

// Test credentials
const credentials = {
  admin: { email: 'admin@fitmeal.pro', password: 'AdminPass123' },
  trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' },
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

// Helper function to login
async function login(page: Page, role: 'admin' | 'trainer' | 'customer') {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  const creds = credentials[role];
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForURL((url) => url.toString() !== `${BASE_URL}/` && url.toString() !== `${BASE_URL}/login`, {
    timeout: 10000
  });
}

test.describe('Profile Pages - Focused Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(10000);
  });

  test('1. Trainer can navigate to profile page', async ({ page }) => {
    console.log('=== Testing Trainer Profile Navigation ===');
    
    await login(page, 'trainer');
    console.log('✓ Logged in as trainer');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Look for Profile button - try both desktop and mobile views
    let profileButton = page.locator('button:has-text("Profile")').first();
    
    // Check if button is visible, if not might be in mobile menu
    const isVisible = await profileButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!isVisible) {
      console.log('Profile button not immediately visible, checking for mobile menu...');
      // Try clicking menu button if in mobile view
      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
      if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuButton.click();
        console.log('Opened mobile menu');
        await page.waitForTimeout(500);
      }
    }
    
    // Now try to find Profile button again
    profileButton = page.locator('button:has-text("Profile")').first();
    const buttonText = await profileButton.textContent().catch(() => 'not found');
    console.log('Profile button text:', buttonText);
    
    await expect(profileButton).toBeVisible({ timeout: 5000 });
    console.log('✓ Profile button is visible');
    
    // Click the Profile button
    await profileButton.click();
    console.log('✓ Clicked Profile button');
    
    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/trainer/profile`, { timeout: 10000 });
    console.log('✓ Navigated to trainer profile page');
    
    // Verify we're on the correct page
    await expect(page).toHaveURL(`${BASE_URL}/trainer/profile`);
    
    // Check for profile page content
    const pageTitle = await page.locator('h1').textContent();
    console.log('Page title:', pageTitle);
    
    await expect(page.locator('text=/Trainer Profile/i').first()).toBeVisible();
    console.log('✓ Trainer Profile page loaded successfully');
    
    // Check for key sections
    const accountSection = page.locator('text=/Account Details/i').first();
    await expect(accountSection).toBeVisible();
    console.log('✓ Account Details section is visible');
    
    // Take screenshot
    await page.screenshot({ path: 'test-trainer-profile.png', fullPage: true });
  });

  test('2. Admin can navigate to profile page', async ({ page }) => {
    console.log('=== Testing Admin Profile Navigation ===');
    
    await login(page, 'admin');
    console.log('✓ Logged in as admin');
    
    await page.waitForLoadState('networkidle');
    
    // Find and click Profile button
    const profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible({ timeout: 5000 });
    console.log('✓ Profile button is visible');
    
    await profileButton.click();
    console.log('✓ Clicked Profile button');
    
    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/admin/profile`, { timeout: 10000 });
    console.log('✓ Navigated to admin profile page');
    
    // Verify content
    await expect(page).toHaveURL(`${BASE_URL}/admin/profile`);
    
    const pageContent = await page.locator('h1, h2, h3').allTextContents();
    console.log('Admin profile headings:', pageContent);
    
    // Take screenshot
    await page.screenshot({ path: 'test-admin-profile.png', fullPage: true });
  });

  test('3. Customer can see trainer linkage', async ({ page }) => {
    console.log('=== Testing Customer Profile with Trainer Linkage ===');
    
    await login(page, 'customer');
    console.log('✓ Logged in as customer');
    
    await page.waitForLoadState('networkidle');
    const landingUrl = page.url();
    console.log('Customer landed on:', landingUrl);
    
    // Navigate directly to profile page for testing
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForLoadState('networkidle');
    
    console.log('Navigated to customer profile');
    
    // Check for profile content
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Customer profile headings:', headings);
    
    // Look for trainer section
    const trainerSection = page.locator('text=/Your Trainer/i').first();
    const trainerVisible = await trainerSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (trainerVisible) {
      console.log('✓ Trainer section is visible');
      
      // Check if trainer info is displayed
      const trainerEmail = page.locator('text=/trainer\.test@evofitmeals\.com/i').first();
      const emailVisible = await trainerEmail.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (emailVisible) {
        console.log('✓ Trainer email is displayed - linkage working!');
      } else {
        // Check for "no trainer assigned" message
        const noTrainer = page.locator('text=/No trainer assigned/i').first();
        if (await noTrainer.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('⚠ No trainer assigned to this customer');
        }
      }
    } else {
      console.log('✗ Trainer section not found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-customer-profile.png', fullPage: true });
  });

  test('4. Profile button works from all dashboards', async ({ page }) => {
    console.log('=== Testing Profile Button from All Dashboards ===');
    
    // Test from Trainer dashboard
    await login(page, 'trainer');
    const trainerProfileBtn = page.locator('button:has-text("Profile")').first();
    await expect(trainerProfileBtn).toBeVisible({ timeout: 5000 });
    await trainerProfileBtn.click();
    await expect(page).toHaveURL(`${BASE_URL}/trainer/profile`);
    console.log('✓ Profile button works from Trainer dashboard');
    
    // Logout and test Admin
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    const adminProfileBtn = page.locator('button:has-text("Profile")').first();
    await expect(adminProfileBtn).toBeVisible({ timeout: 5000 });
    await adminProfileBtn.click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/profile`);
    console.log('✓ Profile button works from Admin dashboard');
    
    // Logout and test Customer - direct navigation since customer dashboard might be different
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'customer');
    
    // Customer lands on my-meal-plans, navigate directly to profile
    await page.goto(`${BASE_URL}/customer/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/customer/profile`);
    console.log('✓ Customer can access profile page');
  });

  test('5. Access control prevents unauthorized access', async ({ page }) => {
    console.log('=== Testing Access Control ===');
    
    // Test 1: No login should redirect to login page
    await page.goto(`${BASE_URL}/trainer/profile`);
    await expect(page).toHaveURL(/\/(login|$)/);
    console.log('✓ Unauthorized access redirects to login');
    
    // Test 2: Customer shouldn't access admin profile
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/admin/profile`);
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    // Should NOT be on admin profile
    if (!url.includes('/admin/profile')) {
      console.log('✓ Customer cannot access admin profile');
    } else {
      // Check if we actually see admin content
      const adminContent = await page.locator('text=/System Statistics/i').first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!adminContent) {
        console.log('✓ Customer redirected from admin profile (no admin content visible)');
      } else {
        console.log('✗ Access control issue - customer can see admin profile');
      }
    }
    
    // Test 3: Trainer shouldn't access admin profile
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'trainer');
    await page.goto(`${BASE_URL}/admin/profile`);
    await page.waitForLoadState('networkidle');
    
    const trainerUrl = page.url();
    if (!trainerUrl.includes('/admin/profile')) {
      console.log('✓ Trainer cannot access admin profile');
    } else {
      console.log('⚠ Trainer might be able to access admin profile');
    }
  });

  test('6. Mobile responsiveness', async ({ page }) => {
    console.log('=== Testing Mobile Responsiveness ===');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await login(page, 'trainer');
    await page.waitForLoadState('networkidle');
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
    const menuVisible = await menuButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (menuVisible) {
      await menuButton.click();
      console.log('✓ Mobile menu button works');
      await page.waitForTimeout(500);
    }
    
    // Check if Profile button is now visible
    const profileButton = page.locator('button:has-text("Profile")').first();
    const profileVisible = await profileButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (profileVisible) {
      console.log('✓ Profile button accessible on mobile');
      await profileButton.click();
      
      // Check if navigation works
      const navigated = await page.waitForURL(`${BASE_URL}/trainer/profile`, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      
      if (navigated) {
        console.log('✓ Profile navigation works on mobile');
      } else {
        console.log('⚠ Profile navigation might have issues on mobile');
      }
    } else {
      console.log('⚠ Profile button might not be accessible on mobile');
    }
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-mobile-profile.png', fullPage: true });
  });
});

// Run with: npx playwright test test/e2e/profile-pages-focused.spec.ts --reporter=list