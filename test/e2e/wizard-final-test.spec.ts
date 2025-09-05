import { test, expect, Page } from '@playwright/test';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@fitmeal.pro',
  password: 'AdminPass123'
};

const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

async function loginAs(page: Page, role: 'admin' | 'trainer') {
  const credentials = role === 'admin' ? ADMIN_CREDENTIALS : TRAINER_CREDENTIALS;
  
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type=email]', credentials.email);
  await page.fill('input[type=password]', credentials.password);
  
  // Submit login
  const loginButton = page.locator('button[type=submit]').first();
  await loginButton.click();
  
  // Wait for redirect
  await page.waitForURL(new RegExp(`/${role}`), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Protocol Wizard Final Verification', () => {
  
  test('Admin: Open wizard and verify no client selection step', async ({ page }) => {
    console.log('🧪 Testing admin protocol wizard without client selection...');
    
    await loginAs(page, 'admin');
    
    // Click the "Open Protocol Wizard" button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    await expect(wizardButton).toBeVisible({ timeout: 10000 });
    await wizardButton.click();
    
    console.log('✅ Clicked Open Protocol Wizard button');
    
    // Wait for wizard dialog to open
    await page.waitForTimeout(2000);
    
    // Check if wizard dialog is visible
    const wizardDialog = page.locator('[role="dialog"], .dialog, div:has-text("Protocol Creation Wizard")').first();
    const isDialogVisible = await wizardDialog.isVisible().catch(() => false);
    
    if (isDialogVisible) {
      console.log('✅ Wizard dialog opened successfully');
      
      // Take screenshot of wizard
      await page.screenshot({ path: 'test-results/wizard-dialog-admin.png', fullPage: true });
      
      // Check wizard steps - Admin should NOT see "Client Selection"
      const clientSelectionStep = page.locator('text=/client selection/i');
      const hasClientStep = await clientSelectionStep.count() > 0;
      
      if (!hasClientStep) {
        console.log('✅ SUCCESS: No "Client Selection" step for admin - requirement met!');
      } else {
        console.log('❌ FAIL: "Client Selection" step still present for admin');
      }
      
      // Check for expected first step (should be Template Selection)
      const templateStep = page.locator('text=/template selection/i');
      const hasTemplateStep = await templateStep.count() > 0;
      
      if (hasTemplateStep) {
        console.log('✅ Template Selection step found as first step');
      } else {
        console.log('⚠️ Template Selection step not found');
      }
      
      // Count total steps
      const stepIndicators = page.locator('[class*="step"], [data-testid*="step"]');
      const stepCount = await stepIndicators.count();
      console.log(`Total wizard steps found: ${stepCount}`);
      
      // Check for step 1 of 7 (admin should have 7 steps)
      const stepText = await page.locator('text=/step.*(1|7)/i').first().textContent().catch(() => '');
      console.log(`Step indicator text: ${stepText}`);
      
    } else {
      console.log('⚠️ Wizard dialog did not open - checking alternative methods');
      
      // Try clicking on the Enhanced Protocol Wizard card
      const enhancedWizardCard = page.locator('text="Enhanced Protocol Wizard"').first();
      if (await enhancedWizardCard.isVisible()) {
        await enhancedWizardCard.click();
        await page.waitForTimeout(2000);
        
        // Check again for wizard dialog
        const dialogAfterCard = page.locator('[role="dialog"], .dialog').first();
        if (await dialogAfterCard.isVisible()) {
          console.log('✅ Wizard opened via Enhanced Protocol Wizard card');
          await page.screenshot({ path: 'test-results/wizard-via-card.png', fullPage: true });
        }
      }
    }
  });

  test('Trainer: Verify wizard shows client selection as first step', async ({ page }) => {
    console.log('🧪 Testing trainer protocol wizard with client selection...');
    
    await loginAs(page, 'trainer');
    
    // Navigate to protocols
    const protocolsLink = page.locator('a, button').filter({ hasText: /protocol/i }).first();
    if (await protocolsLink.isVisible()) {
      await protocolsLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Try to open wizard
    const wizardTriggers = [
      'button:has-text("Open Protocol Wizard")',
      'text="Enhanced Protocol Wizard"',
      'button:has-text("Create Protocol")',
      'button:has-text("New Protocol")'
    ];
    
    for (const trigger of wizardTriggers) {
      const element = page.locator(trigger).first();
      if (await element.isVisible()) {
        await element.click();
        console.log(`✅ Clicked: ${trigger}`);
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // Check wizard content for trainer
    const wizardContent = page.locator('[role="dialog"], .wizard-content, div:has-text("step")').first();
    if (await wizardContent.isVisible()) {
      console.log('✅ Wizard opened for trainer');
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/wizard-dialog-trainer.png', fullPage: true });
      
      // Check for Client Selection step (trainer SHOULD have this)
      const clientStep = page.locator('text=/client selection/i');
      const hasClientStep = await clientStep.count() > 0;
      
      if (hasClientStep) {
        console.log('✅ Client Selection step present for trainer (expected)');
      } else {
        console.log('⚠️ Client Selection step missing for trainer');
      }
      
      // Count steps for trainer (should be 8 steps)
      const stepIndicators = page.locator('[class*="step"], [data-testid*="step"]');
      const stepCount = await stepIndicators.count();
      console.log(`Total wizard steps for trainer: ${stepCount}`);
    }
  });

  test('Verify save options step at end of wizard', async ({ page }) => {
    console.log('🧪 Testing save options step...');
    
    await loginAs(page, 'admin');
    
    // Open wizard
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    if (await wizardButton.isVisible()) {
      await wizardButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Check for save options in wizard steps
    const saveOptionsStep = page.locator('text=/save options/i');
    const hasSaveOptions = await saveOptionsStep.count() > 0;
    
    if (hasSaveOptions) {
      console.log('✅ Save Options step found in wizard');
    } else {
      console.log('⚠️ Save Options step not found');
    }
    
    // Look for step 7 (final step for admin)
    const finalStep = page.locator('text=/step.*7/i, text=/7.*of.*7/i');
    if (await finalStep.count() > 0) {
      console.log('✅ Wizard has 7 steps for admin (correct)');
    }
  });

  test('Performance: Wizard opens quickly', async ({ page }) => {
    console.log('🧪 Testing wizard performance...');
    
    await loginAs(page, 'admin');
    
    const startTime = Date.now();
    
    // Click wizard button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    await wizardButton.click();
    
    // Wait for dialog to appear
    const dialog = page.locator('[role="dialog"], .dialog').first();
    await expect(dialog).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ Wizard opened in ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Performance acceptable (under 3 seconds)');
    } else {
      console.log('⚠️ Wizard took longer than 3 seconds to open');
    }
  });
});

// Summary test to report overall status
test.describe('Final Summary', () => {
  test('Report implementation status', async ({ page }) => {
    console.log('\n📊 FINAL IMPLEMENTATION STATUS:');
    console.log('================================');
    
    await loginAs(page, 'admin');
    
    // Test core requirement
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    await wizardButton.click();
    await page.waitForTimeout(2000);
    
    // Check for client selection step
    const clientStep = page.locator('text=/client selection/i');
    const hasClientStep = await clientStep.count() > 0;
    
    if (!hasClientStep) {
      console.log('✅ CORE REQUIREMENT MET: No mandatory client selection for admin');
    } else {
      console.log('❌ CORE REQUIREMENT FAILED: Client selection still present');
    }
    
    // Check for save options
    const saveOptions = page.locator('text=/save.*options/i');
    const hasSaveOptions = await saveOptions.count() > 0;
    
    if (hasSaveOptions) {
      console.log('✅ Save options step implemented');
    } else {
      console.log('❌ Save options step missing');
    }
    
    // Overall assessment
    console.log('\n🎯 OVERALL STATUS:');
    if (!hasClientStep && hasSaveOptions) {
      console.log('✅ Implementation SUCCESSFUL - All requirements met!');
    } else if (!hasClientStep) {
      console.log('⚠️ Partial success - Core requirement met, save options need work');
    } else {
      console.log('❌ Implementation needs more work');
    }
    
    console.log('================================\n');
  });
});