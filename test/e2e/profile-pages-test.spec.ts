import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

test.describe('Profile Pages - Complete Test Suite', () => {
  
  test('Admin Profile Page - Access and Functionality', async ({ page }) => {
    console.log('🧪 Testing Admin Profile Page...');
    
    // Login as admin
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'admin@fitmeal.pro');
    await page.fill('input[type="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Admin logged in successfully');
    
    // Navigate to profile using the profile button
    const profileButton = page.locator('[aria-label="User profile"]');
    await expect(profileButton).toBeVisible();
    await profileButton.click();
    console.log('✅ Clicked profile button');
    
    // Verify admin profile page loaded
    await expect(page.url()).toContain('/admin/profile');
    await expect(page.locator('text=System Administrator')).toBeVisible();
    await expect(page.locator('text=admin@fitmeal.pro')).toBeVisible();
    console.log('✅ Admin profile page loaded correctly');
    
    // Verify only one H1 element
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    console.log(`✅ Correct number of H1 elements: ${h1Count}`);
  });
  
  test('Trainer Profile Page - Access and Functionality', async ({ page }) => {
    console.log('🧪 Testing Trainer Profile Page...');
    
    // Login as trainer
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Trainer logged in successfully');
    
    // Navigate to profile using the profile button
    const profileButton = page.locator('[aria-label="User profile"]');
    await expect(profileButton).toBeVisible();
    await profileButton.click();
    console.log('✅ Clicked profile button');
    
    // Verify trainer profile page loaded
    await expect(page.url()).toContain('/trainer/profile');
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('text=trainer.test@evofitmeals.com')).toBeVisible();
    console.log('✅ Trainer profile page loaded correctly');
    
    // Verify only one H1 element
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    console.log(`✅ Correct number of H1 elements: ${h1Count}`);
  });
  
  test('Customer Profile Page - Access and Functionality', async ({ page }) => {
    console.log('🧪 Testing Customer Profile Page...');
    
    // Login as customer
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'customer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestCustomer123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Customer logged in successfully');
    
    // Navigate to profile using the profile button
    const profileButton = page.locator('[aria-label="User profile"]');
    await expect(profileButton).toBeVisible();
    await profileButton.click();
    console.log('✅ Clicked profile button');
    
    // Verify customer profile page loaded
    await expect(page.url()).toContain('/customer/profile');
    await expect(page.locator('text=My Health Profile')).toBeVisible();
    await expect(page.locator('text=customer.test@evofitmeals.com')).toBeVisible();
    console.log('✅ Customer profile page loaded correctly');
    
    // Verify only one H1 element
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    console.log(`✅ Correct number of H1 elements: ${h1Count}`);
  });
  
  test('Access Control - Role-Based Restrictions', async ({ page }) => {
    console.log('🧪 Testing Access Control...');
    
    // Login as trainer
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Trainer logged in');
    
    // Try to access admin profile directly
    await page.goto(`${BASE_URL}/admin/profile`);
    await page.waitForTimeout(1000);
    
    // Should be redirected to trainer dashboard
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/profile');
    console.log(`✅ Trainer blocked from admin profile, redirected to: ${currentUrl}`);
    
    // Try to access customer profile
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForTimeout(1000);
    
    // Should be redirected
    const customerUrl = page.url();
    expect(customerUrl).not.toContain('/customer/profile');
    console.log(`✅ Trainer blocked from customer profile, redirected to: ${customerUrl}`);
  });
  
  test('Profile Navigation - Responsive Header', async ({ page }) => {
    console.log('🧪 Testing Responsive Header Navigation...');
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Login as admin
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'admin@fitmeal.pro');
    await page.fill('input[type="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Logged in on desktop viewport');
    
    // Check header visibility
    const header = page.locator('nav').first();
    await expect(header).toBeVisible();
    console.log('✅ Desktop header visible');
    
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Header should still be visible (responsive, not hidden)
    await expect(header).toBeVisible();
    console.log('✅ Mobile header visible (responsive)');
    
    // Profile button should be accessible
    const profileButton = page.locator('[aria-label="User profile"]');
    await expect(profileButton).toBeVisible();
    console.log('✅ Profile button accessible on mobile');
  });
  
  test('Complete User Journey - All Roles', async ({ page }) => {
    console.log('🧪 Testing Complete User Journey...');
    
    const testRoles = [
      { email: 'admin@fitmeal.pro', password: 'AdminPass123', profileUrl: '/admin/profile', profileText: 'System Administrator' },
      { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!', profileUrl: '/trainer/profile', profileText: 'My Profile' },
      { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!', profileUrl: '/customer/profile', profileText: 'My Health Profile' }
    ];
    
    for (const role of testRoles) {
      console.log(`\n📋 Testing ${role.email}...`);
      
      // Login
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', role.email);
      await page.fill('input[type="password"]', role.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await expect(page.locator('h1')).toBeVisible();
      console.log('  ✅ Logged in successfully');
      
      // Navigate to profile
      const profileButton = page.locator('[aria-label="User profile"]');
      await expect(profileButton).toBeVisible();
      await profileButton.click();
      
      // Verify correct profile page
      await expect(page.url()).toContain(role.profileUrl);
      await expect(page.locator(`text=${role.profileText}`)).toBeVisible();
      console.log(`  ✅ Profile page loaded: ${role.profileUrl}`);
      
      // Logout
      await page.click('button:has-text("Logout")');
      await expect(page.url()).toContain('/login');
      console.log('  ✅ Logged out successfully');
    }
    
    console.log('\n🎉 All user journeys completed successfully!');
  });
});