import { test, expect } from '@playwright/test';

test('Debug - Find Protocol Wizard Access Point', async ({ page }) => {
  const baseURL = 'http://localhost:3501';
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';

  console.log('🔍 DEBUG: Finding Protocol Wizard Access Point\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  await page.goto(baseURL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', trainerEmail);
  await page.fill('input[type="password"]', trainerPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/trainer/, { timeout: 10000 });
  console.log('   ✅ Logged in\n');

  // Step 2: Navigate to health protocols directly
  console.log('2️⃣ Navigating to /trainer/health-protocols...');
  await page.goto(`${baseURL}/trainer/health-protocols`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-health-protocols-page.png', fullPage: true });
  
  // Step 3: List all visible buttons and tabs
  console.log('3️⃣ Listing all visible buttons and tabs:\n');
  
  // Find all buttons
  const buttons = await page.locator('button:visible').all();
  console.log(`   Found ${buttons.length} visible buttons:`);
  for (let i = 0; i < Math.min(20, buttons.length); i++) {
    const text = await buttons[i].textContent();
    if (text && text.trim()) {
      console.log(`     - Button ${i + 1}: "${text.trim()}"`);
    }
  }
  
  // Find all tabs
  console.log('\n   Looking for tabs:');
  const tabs = await page.locator('[role="tab"], button[role="tab"], .tab, [class*="tab"]').all();
  console.log(`   Found ${tabs.length} potential tabs:`);
  for (let i = 0; i < Math.min(10, tabs.length); i++) {
    const text = await tabs[i].textContent();
    if (text && text.trim()) {
      console.log(`     - Tab ${i + 1}: "${text.trim()}"`);
    }
  }
  
  // Step 4: Look for any wizard-related elements
  console.log('\n4️⃣ Looking for wizard-related elements:');
  
  const wizardSelectors = [
    'text=/protocol.*wizard/i',
    'text=/create.*protocol/i',
    'text=/new.*protocol/i',
    '.protocol-wizard',
    '[data-testid*="wizard"]',
    '.wizard',
    'button:has-text("Wizard")',
    'button:has-text("Create")',
    'button:has-text("New")',
    '.card:has-text("Protocol")',
    '.card:has-text("Create")'
  ];
  
  for (const selector of wizardSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await element.textContent();
      console.log(`   ✅ Found element with selector "${selector}": "${text?.trim()}"`);
    }
  }
  
  // Step 5: Check page content
  console.log('\n5️⃣ Checking page content:');
  const pageText = await page.textContent('body');
  
  if (pageText.includes('Protocol')) {
    console.log('   ✅ Page contains "Protocol"');
  }
  if (pageText.includes('Wizard')) {
    console.log('   ✅ Page contains "Wizard"');
  }
  if (pageText.includes('Create')) {
    console.log('   ✅ Page contains "Create"');
  }
  if (pageText.includes('Health')) {
    console.log('   ✅ Page contains "Health"');
  }
  
  // Step 6: Try alternative navigation
  console.log('\n6️⃣ Trying /protocols route instead:');
  await page.goto(`${baseURL}/protocols`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'debug-protocols-page.png', fullPage: true });
  
  // Check this page for wizard access
  const protocolsButtons = await page.locator('button:visible').all();
  console.log(`   Found ${protocolsButtons.length} visible buttons on /protocols:`);
  for (let i = 0; i < Math.min(20, protocolsButtons.length); i++) {
    const text = await protocolsButtons[i].textContent();
    if (text && text.trim()) {
      console.log(`     - "${text.trim()}"`);
    }
  }
  
  console.log('\n✅ Debug complete - check screenshots');
});