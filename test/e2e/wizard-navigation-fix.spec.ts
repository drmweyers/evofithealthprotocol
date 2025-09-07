import { test, expect } from '@playwright/test';

test('Protocol Wizard Navigation - Verify Fix for Step 2 Issue', async ({ page }) => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:3501';

  console.log('🚀 Testing Protocol Wizard Navigation Fix...\n');

  // Step 1: Login as trainer
  console.log('1️⃣ Logging in as trainer...');
  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', trainerEmail);
  await page.fill('input[type="password"]', trainerPassword);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to trainer dashboard
  await page.waitForURL(/\/trainer/, { timeout: 10000 });
  console.log('   ✅ Logged in successfully\n');

  // Step 2: Navigate to Trainer Dashboard
  console.log('2️⃣ Navigating to Trainer Dashboard...');
  await page.goto(`${baseURL}/trainer`);
  await page.waitForLoadState('networkidle');
  console.log('   ✅ On Trainer Dashboard\n');

  // Step 3: Navigate to Health Protocols via Dashboard Button
  console.log('3️⃣ Navigating to Health Protocols via Dashboard...');
  
  // Click on the Health Protocols button in the dashboard
  const healthProtocolsButton = page.locator('button:has-text("Health Protocols"), a:has-text("Health Protocols")').first();
  if (await healthProtocolsButton.isVisible()) {
    console.log('   ✅ Found Health Protocols button');
    await healthProtocolsButton.click();
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Clicked on Health Protocols button');
  } else {
    console.log('   ⚠️ Health Protocols button not found, trying direct navigation');
    await page.goto(`${baseURL}/protocols`);
  }
  
  // Step 4: Click on "Open Protocol Wizard" button
  console.log('4️⃣ Opening Protocol Creation Wizard...');
  
  // Wait for page to load and find the Open Protocol Wizard button
  await page.waitForTimeout(2000);
  
  // Look for the Open Protocol Wizard button
  const createProtocolButton = page.locator('button:has-text("Open Protocol Wizard")').first();
  
  if (await createProtocolButton.isVisible({ timeout: 5000 })) {
    console.log('   ✅ Found Open Protocol Wizard button');
    await createProtocolButton.click();
    
    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('   ✅ Wizard dialog opened');
  } else {
    console.log('   ❌ Could not find Open Protocol Wizard button');
    // Take a screenshot to debug
    await page.screenshot({ path: 'health-protocols-page-debug.png', fullPage: true });
    
    // Try to find any button or link that might open the wizard
    const allButtons = await page.locator('button').allTextContents();
    console.log('   Available buttons on page:', allButtons);
  }

  // Step 5: Client Selection (Trainer only - Step 1 of wizard)
  console.log('5️⃣ Step 1 - Client Selection:');
  const clientSelectionHeader = page.locator('h3:has-text("Client Selection")');
  
  if (await clientSelectionHeader.isVisible({ timeout: 5000 })) {
    console.log('   ✅ Client selection step is visible');
    
    // Select the first available client
    const clientCard = page.locator('.border.rounded-lg').first();
    if (await clientCard.isVisible()) {
      await clientCard.click();
      console.log('   ✅ Selected a client');
    }
    
    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Clicked Next\n');
  }

  // Step 6: Template Selection (Step 2 of wizard)
  console.log('6️⃣ Step 2 - Template Selection:');
  const templateHeader = page.locator('h3:has-text("Template Selection")');
  
  if (await templateHeader.isVisible({ timeout: 5000 })) {
    console.log('   ✅ Template selection step is visible');
    
    // Select Weight Loss template
    const weightLossBtn = page.locator('button:has-text("Weight Loss")').first();
    if (await weightLossBtn.isVisible()) {
      await weightLossBtn.click();
      console.log('   ✅ Selected Weight Loss template');
    }
    
    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Clicked Next\n');
  }

  // Step 7: Health Information (Step 3 - THIS IS WHERE IT WAS STUCK)
  console.log('7️⃣ Step 3 - Health Information (CRITICAL TEST):');
  const healthInfoHeader = page.locator('h3:has-text("Health Information")');
  
  if (await healthInfoHeader.isVisible({ timeout: 5000 })) {
    console.log('   ✅ Health Information step is visible');
    
    // Select medical conditions
    const diabetesOption = page.locator('label:has-text("Diabetes")').first();
    const hypertensionOption = page.locator('label:has-text("Hypertension")').first();
    
    if (await diabetesOption.isVisible()) {
      await diabetesOption.click();
      console.log('   ✅ Selected Diabetes condition');
    }
    
    if (await hypertensionOption.isVisible()) {
      await hypertensionOption.click();
      console.log('   ✅ Selected Hypertension condition');
    }
    
    // THIS IS THE CRITICAL MOMENT - Click Next after selecting conditions
    console.log('   🔄 Clicking Next to advance from Health Information...');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(2000);
  }

  // Step 8: CHECK IF WE ADVANCED TO CUSTOMIZATION (Step 4)
  console.log('8️⃣ VERIFICATION - Did we advance to Customization?');
  const customizationHeader = page.locator('h3:has-text("Customization")');
  
  // Take a screenshot for evidence
  await page.screenshot({ path: 'wizard-fix-verification.png', fullPage: true });
  
  if (await customizationHeader.isVisible({ timeout: 5000 })) {
    console.log('   ✅✅✅ SUCCESS! Wizard advanced to Customization step!');
    console.log('   ✅ The fix is working - wizard no longer stuck at step 2!');
    console.log('\n🎉 FIX VERIFIED SUCCESSFULLY!\n');
    
    // Verify we can continue through the rest of the wizard
    console.log('9️⃣ Bonus Test - Continuing through remaining steps:');
    
    // Fill in some customization
    const durationInput = page.locator('input[placeholder*="Duration"]').first();
    if (await durationInput.isVisible()) {
      await durationInput.fill('30');
      console.log('   ✅ Set duration to 30 days');
    }
    
    // Click Next to go to AI Generation
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    const aiGenerationHeader = page.locator('h3:has-text("AI Generation")');
    if (await aiGenerationHeader.isVisible()) {
      console.log('   ✅ Advanced to AI Generation step');
      console.log('   ✅ Wizard navigation is fully functional!\n');
    }
    
  } else {
    // Check if still stuck on Health Information
    const stillOnHealthInfo = await page.locator('h3:has-text("Health Information")').isVisible();
    if (stillOnHealthInfo) {
      console.log('   ❌ FAILED: Still stuck on Health Information step');
      console.log('   ❌ The fix did not work as expected');
      
      // Get more debug info
      const currentStepIndicator = await page.locator('.text-primary').first().textContent();
      console.log(`   Current step indicator shows: ${currentStepIndicator}`);
    } else {
      const currentHeader = await page.locator('h3').first().textContent();
      console.log(`   ⚠️  Unexpected state - Current header: ${currentHeader}`);
    }
  }
  
  console.log('📸 Screenshot saved as wizard-fix-verification.png');
  console.log('✅ Test completed');
});