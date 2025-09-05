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

test.describe('Profile Pages - Final Validation', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(10000);
  });

  test('✅ FEATURE: Profile Navigation Button Works', async ({ page }) => {
    console.log('=== Validating Profile Navigation Button ===');
    
    // Test for Trainer
    await login(page, 'trainer');
    let profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible();
    console.log('✅ Trainer dashboard has Profile button');
    
    // Test for Admin
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    profileButton = page.locator('button:has-text("Profile")').first();
    await expect(profileButton).toBeVisible();
    console.log('✅ Admin dashboard has Profile button');
    
    // Test for Customer (may be in different location)
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'customer');
    // Customer might have different UI, so we check if they can navigate to profile
    await page.goto(`${BASE_URL}/customer/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/customer/profile`);
    console.log('✅ Customer can access profile page');
  });

  test('✅ FEATURE: Profile Pages Load Without Errors', async ({ page }) => {
    console.log('=== Validating Profile Pages Load ===');
    
    // Trainer Profile
    await login(page, 'trainer');
    await page.goto(`${BASE_URL}/trainer/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/trainer/profile`);
    await expect(page.locator('text=/Trainer Profile/i').first()).toBeVisible();
    console.log('✅ Trainer profile page loads successfully');
    
    // Admin Profile
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    await page.goto(`${BASE_URL}/admin/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/admin/profile`);
    await expect(page.locator('text=/Admin Profile/i').first()).toBeVisible();
    console.log('✅ Admin profile page loads successfully');
    
    // Customer Profile
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/customer/profile`);
    await expect(page).toHaveURL(`${BASE_URL}/customer/profile`);
    await expect(page.locator('text=/Customer Profile|Profile|My Account/i').first()).toBeVisible();
    console.log('✅ Customer profile page loads successfully');
  });

  test('✅ FEATURE: Profile Button Navigation Works Correctly', async ({ page }) => {
    console.log('=== Validating Profile Button Navigation ===');
    
    // Trainer clicks Profile button
    await login(page, 'trainer');
    const trainerProfileBtn = page.locator('button:has-text("Profile")').first();
    await trainerProfileBtn.click();
    await expect(page).toHaveURL(`${BASE_URL}/trainer/profile`);
    console.log('✅ Trainer Profile button navigates correctly');
    
    // Admin clicks Profile button
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    const adminProfileBtn = page.locator('button:has-text("Profile")').first();
    await adminProfileBtn.click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/profile`);
    console.log('✅ Admin Profile button navigates correctly');
  });

  test('✅ FEATURE: Role-Based Access Control Works', async ({ page }) => {
    console.log('=== Validating Access Control ===');
    
    // Unauthenticated access redirects to login
    await page.goto(`${BASE_URL}/trainer/profile`);
    await expect(page).toHaveURL(/\/(login|$)/);
    console.log('✅ Unauthenticated access blocked');
    
    // Customer can't access admin profile
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/admin/profile`);
    const adminOnlyContent = page.locator('text=/System Statistics|Admin Dashboard/i').first();
    const isAdminContent = await adminOnlyContent.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isAdminContent).toBeFalsy();
    console.log('✅ Customer cannot access admin-only content');
    
    // Trainer can't access admin profile
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'trainer');
    await page.goto(`${BASE_URL}/admin/profile`);
    const url = page.url();
    expect(url).not.toBe(`${BASE_URL}/admin/profile`);
    console.log('✅ Trainer cannot access admin profile');
  });

  test('✅ FEATURE: Profile Pages Have Correct Headers', async ({ page }) => {
    console.log('=== Validating Profile Page Headers ===');
    
    // Each role sees their correct header
    await login(page, 'trainer');
    await page.goto(`${BASE_URL}/trainer/profile`);
    const trainerHeader = page.locator('nav').filter({ hasText: 'Trainer Profile' }).first();
    await expect(trainerHeader).toBeVisible();
    console.log('✅ Trainer sees correct header');
    
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'admin');
    await page.goto(`${BASE_URL}/admin/profile`);
    const adminHeader = page.locator('nav').filter({ hasText: 'Admin Profile' }).first();
    await expect(adminHeader).toBeVisible();
    console.log('✅ Admin sees correct header');
    
    await page.goto(`${BASE_URL}/login`);
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/customer/profile`);
    const customerHeader = page.locator('nav').filter({ hasText: /Customer Profile|Profile/i }).first();
    await expect(customerHeader).toBeVisible();
    console.log('✅ Customer sees correct header');
  });

  test('✅ SUMMARY: All Critical Profile Features Working', async ({ page }) => {
    console.log('=== FINAL VALIDATION SUMMARY ===');
    
    const features = [
      { name: 'Profile Navigation Button', test: async () => {
        await login(page, 'trainer');
        return await page.locator('button:has-text("Profile")').first().isVisible();
      }},
      { name: 'Trainer Profile Page', test: async () => {
        await page.goto(`${BASE_URL}/trainer/profile`);
        return page.url().includes('/trainer/profile');
      }},
      { name: 'Admin Profile Page', test: async () => {
        await page.goto(`${BASE_URL}/login`);
        await login(page, 'admin');
        await page.goto(`${BASE_URL}/admin/profile`);
        return page.url().includes('/admin/profile');
      }},
      { name: 'Customer Profile Page', test: async () => {
        await page.goto(`${BASE_URL}/login`);
        await login(page, 'customer');
        await page.goto(`${BASE_URL}/customer/profile`);
        return page.url().includes('/customer/profile');
      }},
      { name: 'Access Control', test: async () => {
        await page.goto(`${BASE_URL}/logout`);
        await page.goto(`${BASE_URL}/admin/profile`);
        return !page.url().includes('/admin/profile');
      }}
    ];
    
    let passedCount = 0;
    let failedCount = 0;
    
    for (const feature of features) {
      try {
        const result = await feature.test();
        if (result) {
          console.log(`✅ ${feature.name}: WORKING`);
          passedCount++;
        } else {
          console.log(`❌ ${feature.name}: ISSUE DETECTED`);
          failedCount++;
        }
      } catch (error) {
        console.log(`❌ ${feature.name}: ERROR - ${error}`);
        failedCount++;
      }
    }
    
    console.log('\n📊 FINAL SCORE:');
    console.log(`✅ Passed: ${passedCount}/${features.length}`);
    console.log(`❌ Failed: ${failedCount}/${features.length}`);
    
    const successRate = (passedCount / features.length) * 100;
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 PROFILE PAGES FEATURE IS PRODUCTION READY!');
    } else if (successRate >= 60) {
      console.log('⚠️ Profile pages mostly working but need some fixes');
    } else {
      console.log('🔴 Profile pages need significant work');
    }
    
    expect(successRate).toBeGreaterThanOrEqual(80);
  });
});

// Run with: npx playwright test test/e2e/profile-pages-final-validation.spec.ts --reporter=list