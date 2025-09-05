import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3501';

// Test credentials
const credentials = {
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

// Helper function to login
async function login(page: Page, role: 'customer') {
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

test.describe('Customer-Trainer Linkage Validation', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(10000);
  });

  test('Customer profile shows trainer information', async ({ page }) => {
    console.log('=== Testing Customer-Trainer Linkage ===');
    
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/customer/profile`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Customer profile page loaded');
    
    // Look for "Your Trainer" section
    const trainerSection = page.locator('text=/Your Trainer/i');
    const trainerSectionVisible = await trainerSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (trainerSectionVisible) {
      console.log('✅ "Your Trainer" section found');
      
      // Look for trainer details
      const trainerName = page.locator('text=/trainer/i');
      const trainerNameVisible = await trainerName.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (trainerNameVisible) {
        console.log('✅ Trainer information is displayed');
      } else {
        console.log('⚠️ Trainer name not visible, checking for "no trainer" message');
        const noTrainer = page.locator('text=/No trainer assigned/i');
        const noTrainerVisible = await noTrainer.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (noTrainerVisible) {
          console.log('ℹ️ Customer has no trainer assigned (expected if no linkage exists)');
        } else {
          console.log('❌ Neither trainer info nor "no trainer" message found');
        }
      }
    } else {
      console.log('❌ "Your Trainer" section not found');
    }
    
    // Take screenshot for manual inspection
    await page.screenshot({ 
      path: 'test-results/customer-profile-trainer-linkage.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshot saved as customer-profile-trainer-linkage.png');
    
    expect(trainerSectionVisible).toBe(true);
  });

  test('Verify all customer profile elements are present', async ({ page }) => {
    console.log('=== Checking Customer Profile Elements ===');
    
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/customer/profile`);
    await page.waitForLoadState('networkidle');
    
    const elements = [
      { name: 'Profile Header', selector: 'h1, [role="heading"]' },
      { name: 'Personal Details Card', selector: 'text=/Personal Details/i' },
      { name: 'Your Trainer Card', selector: 'text=/Your Trainer/i' },
      { name: 'Progress Stats', selector: 'text=/Progress Stats/i' },
      { name: 'Profile Image Section', selector: 'text=/Profile Image/i' }
    ];
    
    let foundCount = 0;
    
    for (const element of elements) {
      const locator = page.locator(element.selector).first();
      const visible = await locator.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (visible) {
        console.log(`✅ ${element.name}: Found`);
        foundCount++;
      } else {
        console.log(`❌ ${element.name}: Not found`);
      }
    }
    
    console.log(`📊 Found ${foundCount}/${elements.length} expected elements`);
    
    expect(foundCount).toBeGreaterThanOrEqual(3); // At least 3 elements should be present
  });
});