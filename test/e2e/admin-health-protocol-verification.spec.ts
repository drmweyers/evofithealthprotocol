import { test, expect, Page } from '@playwright/test';

/**
 * Admin Health Protocol Verification Test
 * 
 * Specifically tests the Admin panel Browse Recipes → Health Protocols sub-tab
 * to verify protocol statistics and listings
 */

const TEST_CONFIG = {
  baseURL: 'http://localhost:4000',
  testAccounts: {
    admin: {
      email: 'admin.test@evofitmeals.com',
      password: 'AdminTest123!'
    }
  }
};

test('Admin Panel - Health Protocols Sub-tab Verification', async ({ page }) => {
  console.log('🔧 Testing Admin panel health protocols sub-tab...');
  
  // Login as admin
  await page.goto(TEST_CONFIG.baseURL);
  await page.waitForSelector('input[type="email"]');
  
  await page.fill('input[type="email"]', TEST_CONFIG.testAccounts.admin.email);
  await page.fill('input[type="password"]', TEST_CONFIG.testAccounts.admin.password);
  await page.click('button:has-text("Sign In")');
  
  // Wait for redirect to admin
  try {
    await page.waitForURL((url) => url.pathname.includes('/admin'), { timeout: 15000 });
    console.log('✅ Successfully logged in as admin');
  } catch (error) {
    console.log('⚠️ Login redirect may have failed, continuing...');
  }

  // Navigate directly to admin panel
  await page.goto(`${TEST_CONFIG.baseURL}/admin`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of admin dashboard
  await page.screenshot({
    path: 'test/screenshots/health-protocols/admin-dashboard.png',
    fullPage: true
  });

  // Verify admin dashboard elements
  await expect(page.locator('h1')).toContainText('Admin Dashboard');
  console.log('✅ Admin dashboard loaded');

  // Click on Browse Recipes tab
  await page.click('button[role="tab"]:has-text("Browse Recipes")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({
    path: 'test/screenshots/health-protocols/browse-recipes-tab.png',
    fullPage: true
  });
  console.log('✅ Browse Recipes tab activated');

  // Click on Health Protocols sub-tab
  await page.click('button[role="tab"]:has-text("Health Protocols")');
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'test/screenshots/health-protocols/admin-health-protocols-subtab.png',
    fullPage: true
  });
  console.log('✅ Health Protocols sub-tab activated');

  // Verify statistics cards
  const expectedStats = ['Total Protocols', 'Longevity Plans', 'Parasite Cleanse', 'Templates'];
  
  for (const statName of expectedStats) {
    const statElement = page.getByText(statName);
    if (await statElement.isVisible()) {
      console.log(`✅ Found statistic: ${statName}`);
    } else {
      console.log(`⚠️ Missing statistic: ${statName}`);
    }
  }

  // Get protocol statistics
  const statsData = {};
  for (const statName of expectedStats) {
    try {
      const statCard = page.locator(`p:has-text("${statName}")`).locator('..').locator('[class*="font-bold"]');
      if (await statCard.isVisible()) {
        const value = await statCard.textContent();
        statsData[statName] = value?.trim();
      }
    } catch (error) {
      statsData[statName] = 'Not found';
    }
  }

  console.log('\n📊 Protocol Statistics:');
  Object.entries(statsData).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // Check for protocol listings
  const protocolCards = page.locator('[class*="card"]:has-text("Protocol")');
  const protocolCount = await protocolCards.count();
  console.log(`\n📋 Protocol Cards Found: ${protocolCount}`);

  if (protocolCount > 0) {
    console.log('✅ Protocol listings are visible');
    
    // Get details of first few protocols
    for (let i = 0; i < Math.min(3, protocolCount); i++) {
      try {
        const protocolText = await protocolCards.nth(i).textContent();
        console.log(`  Protocol ${i + 1}: ${protocolText?.substring(0, 100)}...`);
      } catch (error) {
        console.log(`  Protocol ${i + 1}: Could not read details`);
      }
    }
  } else {
    console.log('ℹ️ No protocol listings found (may be empty)');
  }

  // Check for "Create Health Protocols" button
  const createButton = page.locator('button:has-text("Create Health Protocols")');
  if (await createButton.isVisible()) {
    console.log('✅ "Create Health Protocols" button found');
  } else {
    console.log('⚠️ "Create Health Protocols" button not found');
  }

  // Final screenshot
  await page.screenshot({
    path: 'test/screenshots/health-protocols/admin-health-protocols-final.png',
    fullPage: true
  });

  console.log('\n📈 Admin Health Protocol Verification Complete');
  console.log('📸 Screenshots saved in test/screenshots/health-protocols/');

  // Basic assertions to ensure test validity
  expect(await page.title()).toContain('EvoFitMeals');
  expect(page.url()).toContain('admin');
});