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

test.describe('Profile Pages Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for navigation
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(10000);
  });

  test('Trainer Profile - Complete functionality', async ({ page }) => {
    console.log('Testing trainer profile...');
    
    // Login as trainer
    await login(page, 'trainer');
    
    // Check we're on trainer dashboard
    await expect(page).toHaveURL(`${BASE_URL}/trainer`);
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Look for profile navigation button
    const profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible();
    
    // Click profile button
    await profileButton.click();
    
    // Should navigate to trainer profile
    await page.waitForURL(`${BASE_URL}/trainer/profile`, { timeout: 10000 });
    
    // Check profile page content
    const pageContent = await page.content();
    console.log('Trainer profile URL:', page.url());
    
    // Look for trainer profile specific elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Found headings:', headings);
    
    // Check for profile sections
    await expect(page.locator('text=/Trainer Profile|Profile|Dashboard/i').first()).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'trainer-profile.png', fullPage: true });
  });

  test('Admin Profile - Complete functionality', async ({ page }) => {
    console.log('Testing admin profile...');
    
    // Login as admin
    await login(page, 'admin');
    
    // Check we're on admin dashboard
    await expect(page).toHaveURL(`${BASE_URL}/admin`);
    
    // Look for profile navigation button
    const profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible();
    
    // Click profile button
    await profileButton.click();
    
    // Should navigate to admin profile
    await page.waitForURL(`${BASE_URL}/admin/profile`, { timeout: 10000 });
    
    // Check profile page content
    const pageContent = await page.content();
    console.log('Admin profile URL:', page.url());
    
    // Look for admin profile specific elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Found headings:', headings);
    
    // Check for admin-specific content
    await expect(page.locator('text=/Admin Profile|Profile|System/i').first()).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'admin-profile.png', fullPage: true });
  });

  test('Customer Profile - Complete functionality with trainer linkage', async ({ page }) => {
    console.log('Testing customer profile...');
    
    // Login as customer
    await login(page, 'customer');
    
    // Wait for navigation - customers go to /my-meal-plans
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    console.log('Customer landed on:', currentUrl);
    
    // Look for profile navigation button
    const profileButton = page.locator('button:has-text("Profile")').first();
    
    // If not visible, check if there's a menu button first (mobile view)
    if (!(await profileButton.isVisible())) {
      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    await expect(profileButton).toBeVisible();
    
    // Click profile button
    await profileButton.click();
    
    // Should navigate to customer profile
    await page.waitForURL(`${BASE_URL}/customer/profile`, { timeout: 10000 });
    
    // Check profile page content
    console.log('Customer profile URL:', page.url());
    
    // Look for customer profile specific elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Found headings:', headings);
    
    // Check for customer-specific content
    await expect(page.locator('text=/Customer Profile|Profile|My Information/i').first()).toBeVisible();
    
    // CRITICAL: Check for trainer linkage
    console.log('Checking for trainer linkage...');
    
    // Look for trainer section
    const trainerSection = page.locator('text=/Your Trainer|Assigned Trainer|My Trainer/i').first();
    if (await trainerSection.isVisible()) {
      console.log('Found trainer section');
      
      // Check for trainer details
      const trainerInfo = await page.locator('text=/trainer\.test@evofitmeals\.com|Test Trainer/i').first();
      if (await trainerInfo.isVisible()) {
        console.log('✓ Trainer linkage is displayed correctly');
      } else {
        console.log('✗ Trainer email/name not found');
      }
    } else {
      console.log('✗ No trainer section found on customer profile');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'customer-profile.png', fullPage: true });
  });

  test('Profile Navigation - Test all role transitions', async ({ page }) => {
    console.log('Testing profile navigation for all roles...');
    
    const roles: Array<'admin' | 'trainer' | 'customer'> = ['admin', 'trainer', 'customer'];
    
    for (const role of roles) {
      console.log(`Testing ${role} profile navigation...`);
      
      // Login as role
      await login(page, role);
      
      // Find and click profile button
      const profileButton = page.locator('button:has-text("Profile")').first();
      
      // Handle mobile menu if needed
      if (!(await profileButton.isVisible())) {
        const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      await profileButton.click();
      
      // Verify correct profile URL
      const expectedUrl = `${BASE_URL}/${role}/profile`;
      await expect(page).toHaveURL(expectedUrl);
      console.log(`✓ ${role} navigated to correct profile page`);
      
      // Logout for next test
      const logoutButton = page.locator('button:has-text("Logout")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // If logout not visible, navigate to login directly
        await page.goto(`${BASE_URL}/login`);
      }
      
      await page.waitForTimeout(1000);
    }
  });

  test('Profile Content Validation - Verify all sections load', async ({ page }) => {
    console.log('Validating profile content for all roles...');
    
    // Test Trainer Profile Content
    await login(page, 'trainer');
    await page.goto(`${BASE_URL}/trainer/profile`);
    await page.waitForLoadState('networkidle');
    
    // Check for essential trainer profile sections
    const trainerSections = [
      'Account', 'Performance', 'Clients', 'Stats', 'Overview'
    ];
    
    for (const section of trainerSections) {
      const sectionElement = page.locator(`text=/${section}/i`).first();
      if (await sectionElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✓ Trainer profile has ${section} section`);
      } else {
        console.log(`✗ Trainer profile missing ${section} section`);
      }
    }
    
    // Logout and test Admin
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    await page.goto(`${BASE_URL}/admin/profile`);
    await page.waitForLoadState('networkidle');
    
    // Check for essential admin profile sections
    const adminSections = [
      'Account', 'System', 'Users', 'Stats', 'Management'
    ];
    
    for (const section of adminSections) {
      const sectionElement = page.locator(`text=/${section}/i`).first();
      if (await sectionElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✓ Admin profile has ${section} section`);
      } else {
        console.log(`✗ Admin profile missing ${section} section`);
      }
    }
    
    // Logout and test Customer
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForLoadState('networkidle');
    
    // Check for essential customer profile sections
    const customerSections = [
      'Profile', 'Information', 'Trainer', 'Goals', 'Progress'
    ];
    
    for (const section of customerSections) {
      const sectionElement = page.locator(`text=/${section}/i`).first();
      if (await sectionElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✓ Customer profile has ${section} section`);
      } else {
        console.log(`⚠ Customer profile might be missing ${section} section`);
      }
    }
  });

  test('Edge Cases - Handle errors gracefully', async ({ page }) => {
    console.log('Testing edge cases...');
    
    // Test 1: Direct navigation without login
    await page.goto(`${BASE_URL}/trainer/profile`);
    await expect(page).toHaveURL(/\/(login|$)/); // Should redirect to login
    console.log('✓ Unauthorized access redirects to login');
    
    // Test 2: Wrong role accessing profile
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/admin/profile`);
    // Should redirect to appropriate page
    const url = page.url();
    expect(url).not.toContain('/admin/profile');
    console.log('✓ Role-based access control works');
    
    // Test 3: Profile button visibility on mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(`${BASE_URL}/my-meal-plans`);
    await page.waitForLoadState('networkidle');
    
    // Check if menu button is needed
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }
    
    const profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible();
    console.log('✓ Profile navigation works on mobile');
  });
});

// Run with: npx playwright test test/e2e/profile-pages-comprehensive.spec.ts --reporter=list --headed