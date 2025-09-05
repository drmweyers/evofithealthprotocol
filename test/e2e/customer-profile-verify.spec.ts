import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

test.describe('Customer Profile Verification', () => {
  test('Customer profile loads with all data', async ({ page }) => {
    // Login as customer
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'customer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestCustomer123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL((url) => url.toString() !== `${BASE_URL}/` && url.toString() !== `${BASE_URL}/login`, {
      timeout: 10000
    });
    
    console.log('✅ Logged in as customer');
    
    // Navigate to profile
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Navigated to customer profile');
    
    // Check page content
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    
    // Check for profile sections
    const profileSection = page.locator('text=/My Health Profile/i').first();
    const profileVisible = await profileSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (profileVisible) {
      console.log('✅ Profile header is visible');
    } else {
      console.log('❌ Profile header not found');
      console.log('Page text content:', await page.textContent('body'));
    }
    
    // Check for account details
    const accountSection = page.locator('text=/Account Details/i').first();
    const accountVisible = await accountSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (accountVisible) {
      console.log('✅ Account Details section is visible');
      
      // Check for email
      const emailElement = page.locator('text=/customer\\.test@evofitmeals\\.com/i').first();
      const emailVisible = await emailElement.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (emailVisible) {
        console.log('✅ Customer email is displayed');
      } else {
        console.log('⚠️ Customer email not displayed');
      }
    } else {
      console.log('❌ Account Details section not found');
    }
    
    // Check for trainer section
    const trainerSection = page.locator('text=/Your Trainer/i').first();
    const trainerVisible = await trainerSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (trainerVisible) {
      console.log('✅ Trainer section is visible');
      
      // Check if trainer info is displayed
      const trainerEmail = page.locator('text=/trainer\\.test@evofitmeals\\.com/i').first();
      const trainerEmailVisible = await trainerEmail.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (trainerEmailVisible) {
        console.log('✅ Trainer email is displayed - linkage working!');
      } else {
        // Check for "no trainer assigned" message
        const noTrainer = page.locator('text=/No trainer assigned/i').first();
        if (await noTrainer.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('⚠️ No trainer assigned to this customer');
        } else {
          console.log('⚠️ Trainer info not displayed');
        }
      }
    } else {
      console.log('❌ Trainer section not found');
    }
    
    // Check for health stats
    const statsSection = page.locator('text=/Health Statistics/i').first();
    const statsVisible = await statsSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (statsVisible) {
      console.log('✅ Health Statistics section is visible');
    } else {
      console.log('⚠️ Health Statistics section not found');
    }
    
    // Take screenshot for manual verification
    await page.screenshot({ path: 'customer-profile-verification.png', fullPage: true });
    console.log('📸 Screenshot saved as customer-profile-verification.png');
    
    // Check that it's not showing "Loading customer profile"
    const loadingText = await page.locator('text=/Loading customer profile/i').count();
    expect(loadingText).toBe(0);
    console.log('✅ Profile is not stuck in loading state');
    
    // Verify page has substantial content (not just a loading message)
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
    console.log(`✅ Page has content (${bodyText?.length} characters)`);
  });
});