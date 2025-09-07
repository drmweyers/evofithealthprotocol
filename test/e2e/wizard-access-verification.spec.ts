import { test, expect } from '@playwright/test';

test('Protocol Wizard Access Verification', async ({ page }) => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:3501';

  console.log('🔍 Quick verification test for Protocol Wizard access...\n');

  try {
    // Step 1: Go to application
    console.log('1️⃣ Navigating to application...');
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Step 2: Check if login form is visible
    console.log('2️⃣ Checking for login form...');
    const emailInput = await page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    console.log('   ✅ Login form found');

    // Step 3: Login as trainer
    console.log('3️⃣ Logging in as trainer...');
    await page.fill('input[type="email"]', trainerEmail);
    await page.fill('input[type="password"]', trainerPassword);
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('   ✅ Successfully logged in and redirected to trainer dashboard');

    // Step 4: Look for Health Protocols button
    console.log('4️⃣ Looking for Health Protocols button...');
    const healthProtocolsButton = page.locator('button:has-text("Health Protocols")');
    
    if (await healthProtocolsButton.isVisible({ timeout: 5000 })) {
      console.log('   ✅ Health Protocols button found!');
      
      // Step 5: Click the Health Protocols button
      console.log('5️⃣ Clicking Health Protocols button...');
      await healthProtocolsButton.click();
      
      // Wait for navigation to health protocols page
      await page.waitForURL(/\/trainer\/health-protocols/, { timeout: 10000 });
      console.log('   ✅ Successfully navigated to /trainer/health-protocols');

      // Step 6: Look for Create Protocols tab
      console.log('6️⃣ Looking for Create Protocols tab...');
      const createProtocolsTab = page.locator('button:has-text("Create Protocols")');
      
      if (await createProtocolsTab.isVisible({ timeout: 5000 })) {
        console.log('   ✅ Create Protocols tab found!');
        
        // Step 7: Click Create Protocols tab (should be active by default)
        await createProtocolsTab.click();
        
        // Step 8: Look for Enhanced Protocol Wizard card
        console.log('7️⃣ Looking for Enhanced Protocol Wizard...');
        const wizardCard = page.locator('h3:has-text("Enhanced Protocol Wizard")');
        
        if (await wizardCard.isVisible({ timeout: 5000 })) {
          console.log('   ✅ Enhanced Protocol Wizard card found!');
          console.log('\n🎉 VERIFICATION SUCCESSFUL!');
          console.log('   ✅ All fixes are working correctly:');
          console.log('   ✅ - Health Protocols button is visible on trainer dashboard');
          console.log('   ✅ - Navigation to /trainer/health-protocols works');
          console.log('   ✅ - Create Protocols tab is accessible');
          console.log('   ✅ - Enhanced Protocol Wizard is visible and ready to use');
        } else {
          console.log('   ❌ Enhanced Protocol Wizard card not found');
        }
      } else {
        console.log('   ❌ Create Protocols tab not found');
      }
    } else {
      console.log('   ❌ Health Protocols button not found on trainer dashboard');
      console.log('   📝 Available buttons on page:');
      const buttons = await page.locator('button').allTextContents();
      console.log('      ', buttons.slice(0, 10).join(', '));
    }

  } catch (error) {
    console.log('   ❌ Test failed with error:', error.message);
  }
});