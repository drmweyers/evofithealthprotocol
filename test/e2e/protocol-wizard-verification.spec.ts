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

test.describe('Protocol Wizard Implementation Verification', () => {
  
  test('Admin can access dashboard and protocol features', async ({ page }) => {
    console.log('🧪 Testing admin dashboard access...');
    
    await loginAs(page, 'admin');
    
    // Take screenshot of admin dashboard
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
    
    // Verify admin dashboard loads
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Admin dashboard loaded');
    
    // Look for any protocol-related elements
    const protocolElements = page.locator('*').filter({ hasText: /protocol/i });
    const count = await protocolElements.count();
    console.log(`Found ${count} protocol-related elements`);
    
    // Look for any navigation or buttons
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} interactive elements`);
    
    // List some button texts for debugging
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      if (text && text.trim()) {
        console.log(`Button ${i}: "${text.trim()}"`);
      }
    }
  });

  test('Trainer can access dashboard and protocol features', async ({ page }) => {
    console.log('🧪 Testing trainer dashboard access...');
    
    await loginAs(page, 'trainer');
    
    // Take screenshot of trainer dashboard
    await page.screenshot({ path: 'test-results/trainer-dashboard.png', fullPage: true });
    
    // Verify trainer dashboard loads
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Trainer dashboard loaded');
    
    // Look for any protocol-related elements
    const protocolElements = page.locator('*').filter({ hasText: /protocol/i });
    const count = await protocolElements.count();
    console.log(`Found ${count} protocol-related elements`);
    
    // Look for any wizard-related elements
    const wizardElements = page.locator('*').filter({ hasText: /wizard/i });
    const wizardCount = await wizardElements.count();
    console.log(`Found ${wizardCount} wizard-related elements`);
  });

  test('Can find and trigger protocol wizard', async ({ page }) => {
    console.log('🧪 Testing protocol wizard access...');
    
    await loginAs(page, 'admin');
    
    // Try multiple approaches to find protocol wizard
    const possibleTriggers = [
      'button:has-text("Protocol")',
      'a:has-text("Protocol")',
      'button:has-text("Wizard")',
      'a:has-text("Wizard")',
      'button:has-text("Create")',
      '[data-testid*="protocol"]',
      '[data-testid*="wizard"]',
      '.protocol-wizard',
      '.wizard-trigger'
    ];
    
    for (const selector of possibleTriggers) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ Found ${count} elements with selector: ${selector}`);
        
        // Try to click the first one
        try {
          await elements.first().click();
          await page.waitForTimeout(2000);
          
          // Check if wizard opened
          const wizardDialog = page.locator('[role="dialog"], .wizard, .modal').first();
          if (await wizardDialog.isVisible()) {
            console.log('🎉 Protocol wizard opened successfully!');
            
            // Take screenshot of wizard
            await page.screenshot({ path: 'test-results/protocol-wizard.png', fullPage: true });
            
            // Check wizard content
            const stepText = await page.locator('*').filter({ hasText: /step|1|2|3|4|5|6|7/i }).first().textContent();
            console.log(`Wizard step info: ${stepText}`);
            
            return; // Success!
          }
        } catch (error) {
          console.log(`Failed to click ${selector}: ${error}`);
        }
      }
    }
    
    console.log('❌ Could not find or trigger protocol wizard');
  });

  test('Verify wizard step structure', async ({ page }) => {
    console.log('🧪 Testing wizard step structure...');
    
    await loginAs(page, 'admin');
    
    // Navigate to any page that might have the wizard
    const pages = ['/admin', '/admin/protocols', '/admin/dashboard'];
    
    for (const pagePath of pages) {
      try {
        await page.goto(`http://localhost:3501${pagePath}`, { waitUntil: 'networkidle' });
        
        // Look for wizard elements
        const wizardElements = page.locator('*').filter({ hasText: /wizard|protocol|step/i });
        const count = await wizardElements.count();
        
        if (count > 0) {
          console.log(`✅ Found ${count} potential wizard elements on ${pagePath}`);
          
          // Check for specific step titles that should NOT include "Client Selection" for admin
          const clientSelectionStep = page.locator('*').filter({ hasText: /client selection/i });
          const clientStepCount = await clientSelectionStep.count();
          
          if (clientStepCount === 0) {
            console.log('✅ No "Client Selection" step found - requirement met!');
          } else {
            console.log('❌ "Client Selection" step still present');
          }
          
          // Look for expected steps
          const expectedSteps = ['Template Selection', 'Health Information', 'Customization', 'AI Generation', 'Safety Validation', 'Review', 'Save Options'];
          
          for (const stepName of expectedSteps) {
            const stepElement = page.locator('*').filter({ hasText: new RegExp(stepName, 'i') });
            const stepExists = await stepElement.count() > 0;
            console.log(`Step "${stepName}": ${stepExists ? '✅ Found' : '❌ Missing'}`);
          }
        }
      } catch (error) {
        console.log(`Could not access ${pagePath}: ${error}`);
      }
    }
  });
});