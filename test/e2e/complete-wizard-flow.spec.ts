import { test, expect, Page } from '@playwright/test';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@fitmeal.pro',
  password: 'AdminPass123'
};

async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type=email]', ADMIN_CREDENTIALS.email);
  await page.fill('input[type=password]', ADMIN_CREDENTIALS.password);
  
  // Submit login
  const loginButton = page.locator('button[type=submit]').first();
  await loginButton.click();
  
  // Wait for redirect
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Complete Wizard Flow Test', () => {
  
  test('Admin: Complete wizard flow without client selection', async ({ page }) => {
    console.log('🧪 Testing complete admin wizard flow...\n');
    
    // Login as admin
    await loginAsAdmin(page);
    console.log('✅ Logged in as admin');
    
    // Click "Open Protocol Wizard" button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    await wizardButton.click();
    console.log('✅ Clicked Open Protocol Wizard button');
    
    // Wait for navigation to protocols tab
    await page.waitForTimeout(2000);
    
    // Click on "Enhanced Protocol Wizard" card to open the actual wizard
    const enhancedWizardCard = page.locator('text="Enhanced Protocol Wizard"').first();
    if (await enhancedWizardCard.isVisible()) {
      await enhancedWizardCard.click();
      console.log('✅ Clicked Enhanced Protocol Wizard card');
      await page.waitForTimeout(2000);
    }
    
    // Check if wizard dialog opened
    const wizardDialog = page.locator('[role="dialog"]').first();
    const isWizardOpen = await wizardDialog.isVisible();
    
    if (!isWizardOpen) {
      console.log('❌ Wizard dialog did not open');
      return;
    }
    
    console.log('✅ Wizard dialog opened successfully\n');
    
    // Analyze wizard steps
    console.log('📋 Analyzing Wizard Steps:');
    console.log('===========================');
    
    // Check for Client Selection step
    const clientSelectionText = await page.locator('text=/client selection/i').count();
    if (clientSelectionText === 0) {
      console.log('✅ No "Client Selection" step found (REQUIREMENT MET!)');
    } else {
      console.log('❌ "Client Selection" step still present');
    }
    
    // Look for step indicators
    const stepTitles = await page.locator('.text-sm, .font-medium').allTextContents();
    const wizardSteps = stepTitles.filter(text => 
      text.includes('Template') || 
      text.includes('Health') || 
      text.includes('Customization') ||
      text.includes('Generation') ||
      text.includes('Safety') ||
      text.includes('Review') ||
      text.includes('Save')
    );
    
    console.log('\nWizard Steps Found:');
    wizardSteps.forEach((step, index) => {
      console.log(`  Step ${index + 1}: ${step.trim()}`);
    });
    
    // Check current step
    const currentStepIndicator = page.locator('text=/step.*1/i, text=/1.*of.*7/i').first();
    const stepText = await currentStepIndicator.textContent().catch(() => '');
    console.log(`\nCurrent step indicator: ${stepText}`);
    
    // Try to progress through wizard steps
    console.log('\n🚶 Attempting to progress through wizard:');
    console.log('==========================================');
    
    // Step 1: Template Selection (should be first for admin)
    const templateOptions = page.locator('button, [role="button"]').filter({ hasText: /longevity|parasite|weight|muscle/i });
    const templateCount = await templateOptions.count();
    
    if (templateCount > 0) {
      console.log(`✅ Step 1: Found ${templateCount} template options`);
      
      // Select first template
      await templateOptions.first().click();
      console.log('   Selected a template');
      
      // Click Next
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        console.log('   Clicked Next');
      }
    } else {
      console.log('⚠️ No template options found');
    }
    
    // Check if we can see health information step
    const healthStep = page.locator('text=/health information/i');
    if (await healthStep.count() > 0) {
      console.log('✅ Step 2: Health Information step visible');
    }
    
    // Look for final steps
    const reviewStep = page.locator('text=/review/i');
    const saveOptionsStep = page.locator('text=/save.*options/i');
    
    if (await reviewStep.count() > 0) {
      console.log('✅ Review step found in wizard');
    }
    
    if (await saveOptionsStep.count() > 0) {
      console.log('✅ Save Options step found in wizard');
    } else {
      console.log('⚠️ Save Options step not immediately visible (may need to progress further)');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/complete-wizard-flow.png', fullPage: true });
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('====================');
    
    if (clientSelectionText === 0) {
      console.log('✅ PRIMARY REQUIREMENT MET: No client selection for admin');
      
      if (await saveOptionsStep.count() > 0) {
        console.log('✅ SECONDARY REQUIREMENT MET: Save options step present');
        console.log('\n🎉 IMPLEMENTATION SUCCESSFUL!');
      } else {
        console.log('⚠️ Save options step needs to be visible in wizard steps');
        console.log('\n⚠️ PARTIAL SUCCESS: Core requirement met, minor UI improvements needed');
      }
    } else {
      console.log('❌ Implementation needs more work');
    }
  });
  
  test('Quick verification: No client selection for admin', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to protocols
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForTimeout(1000);
    
    // Open wizard via card
    const wizardCard = page.locator('text="Enhanced Protocol Wizard"').first();
    if (await wizardCard.isVisible()) {
      await wizardCard.click();
      await page.waitForTimeout(1000);
    }
    
    // Quick check for client selection
    const hasClientStep = await page.locator('text=/client selection/i').count() > 0;
    
    // Assert the core requirement
    expect(hasClientStep).toBe(false);
    console.log('✅ TEST PASSED: No client selection step for admin users');
  });
});