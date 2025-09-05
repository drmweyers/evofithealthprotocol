import { test, expect } from '@playwright/test';

test('Simple Health Protocol Navigation Test', async ({ page }) => {
  console.log('🚀 Starting Health Protocol Navigation Test');
  
  // Go to application
  await page.goto('http://localhost:3501');
  
  // Take screenshot of login page
  await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });
  console.log('📸 Screenshot: Login page');
  
  // Login as trainer
  await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
  await page.fill('input[name="password"]', 'TestTrainer123!');
  await page.screenshot({ path: 'test-results/02-login-filled.png', fullPage: true });
  console.log('📸 Screenshot: Login form filled');
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation and take screenshot of trainer dashboard
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/03-trainer-dashboard.png', fullPage: true });
  console.log('📸 Screenshot: Trainer dashboard');
  
  // Look for the Manage Health Protocols button
  const manageButton = page.locator('button:has-text("Manage Health Protocols"), a:has-text("Manage Health Protocols")');
  const buttonVisible = await manageButton.isVisible();
  console.log(`🔍 Manage Health Protocols button visible: ${buttonVisible}`);
  
  if (buttonVisible) {
    // Click the button
    await manageButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot of protocols page
    await page.screenshot({ path: 'test-results/04-protocols-page.png', fullPage: true });
    console.log('📸 Screenshot: Health Protocols page');
    
    // Look for the two navigation buttons
    const wizardButton = page.locator('text=Enhanced Protocol Wizard');
    const manualButton = page.locator('text=Manual Creation');
    
    const wizardVisible = await wizardButton.isVisible();
    const manualVisible = await manualButton.isVisible();
    
    console.log(`🔍 Enhanced Protocol Wizard button visible: ${wizardVisible}`);
    console.log(`🔍 Manual Creation button visible: ${manualVisible}`);
    
    if (wizardVisible) {
      // Click Enhanced Protocol Wizard
      await wizardButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/05-wizard-opened.png', fullPage: true });
      console.log('📸 Screenshot: After clicking Enhanced Protocol Wizard');
      
      // Try to close modal/wizard
      const closeSelector = 'button:has-text("Cancel"), button:has-text("Close"), button[aria-label*="Close"]';
      const closeButton = page.locator(closeSelector).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Successfully closed wizard modal');
      }
    }
    
    if (manualVisible) {
      // Click Manual Creation
      await manualButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/06-manual-creation.png', fullPage: true });
      console.log('📸 Screenshot: After clicking Manual Creation');
      
      // Look for form inputs
      const nameInput = page.locator('input[id="protocol-name"], input[placeholder*="protocol"], input[placeholder*="Protocol"]');
      const descInput = page.locator('textarea[id="protocol-description"], textarea[placeholder*="description"]');
      
      if (await nameInput.isVisible() && await descInput.isVisible()) {
        await nameInput.fill('Test Protocol Name');
        await descInput.fill('This is a test protocol description');
        
        await page.screenshot({ path: 'test-results/07-form-filled.png', fullPage: true });
        console.log('✅ Successfully filled manual creation form');
        console.log('📸 Screenshot: Manual creation form filled');
      }
    }
    
    // Test tab navigation
    const tabs = ['Create Protocols', 'Manage Protocols', 'Client Assignments'];
    for (let i = 0; i < tabs.length; i++) {
      const tab = page.locator(`text=${tabs[i]}`);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: `test-results/08-tab-${i + 1}-${tabs[i].toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });
        console.log(`📸 Screenshot: ${tabs[i]} tab`);
        console.log(`✅ Successfully navigated to ${tabs[i]} tab`);
      }
    }
    
  } else {
    console.log('❌ Manage Health Protocols button not found on trainer dashboard');
  }
  
  console.log('🎉 Health Protocol Navigation Test Complete! Check test-results/ folder for screenshots.');
});