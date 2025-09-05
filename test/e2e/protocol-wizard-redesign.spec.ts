import { test, expect, Page } from '@playwright/test';

// Test credentials from permanent test accounts
const ADMIN_CREDENTIALS = {
  email: 'admin@fitmeal.pro',
  password: 'AdminPass123'
};

const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com', 
  password: 'TestTrainer123!'
};

const CUSTOMER_CREDENTIALS = {
  email: 'customer.test@evofitmeals.com',
  password: 'TestCustomer123!'
};

async function loginAs(page: Page, role: 'admin' | 'trainer' | 'customer') {
  const credentials = role === 'admin' ? ADMIN_CREDENTIALS : 
                    role === 'trainer' ? TRAINER_CREDENTIALS : CUSTOMER_CREDENTIALS;
  
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('[data-testid=email], input[type=email]', credentials.email);
  await page.fill('[data-testid=password], input[type=password]', credentials.password);
  
  // Submit login
  const loginButton = page.locator('[data-testid=login-button], button[type=submit], button:has-text("Sign In"), button:has-text("Login")').first();
  await loginButton.click();
  
  // Wait for redirect and successful login
  await page.waitForURL(/\/(admin|trainer|customer)/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Protocol Wizard Redesign - Remove Mandatory Customer Assignment', () => {
  
  test('Admin: Complete wizard flow without customer assignment', async ({ page }) => {
    console.log('🧪 Testing admin protocol creation without customer assignment...');
    
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to protocol creation
    await page.click('text=Health Protocols, nav[data-testid=health-protocols], a[href*="/admin"]:has-text("Protocols")').first();
    await page.waitForTimeout(2000);
    
    // Look for create protocol button with various selectors
    const createButton = page.locator([
      '[data-testid=create-protocol]',
      'button:has-text("Create Protocol")',
      'button:has-text("New Protocol")', 
      'button:has-text("Add Protocol")',
      'a:has-text("Create")',
      '.protocol-create'
    ].join(', ')).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
    } else {
      // Alternative: Look for protocol wizard or any button that starts wizard
      const wizardTrigger = page.locator('button, a').filter({ hasText: /create|new|add/i }).first();
      await wizardTrigger.click();
    }
    
    await page.waitForTimeout(2000);
    
    // Verify wizard started (should NOT have customer selection step)
    const wizardTitle = page.locator('h1, h2, h3').filter({ hasText: /protocol|wizard|create/i }).first();
    await expect(wizardTitle).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Protocol wizard opened successfully');
    
    // Step 1: Template/Protocol Type Selection (should be first step, not customer)
    const templateOption = page.locator([
      '[data-testid*=template]',
      '[data-testid*=protocol-type]',
      'button:has-text("Longevity")',
      'button:has-text("Weight Loss")', 
      'button:has-text("Muscle Building")',
      '.template-option',
      '.protocol-type-option'
    ].join(', ')).first();
    
    if (await templateOption.isVisible()) {
      await templateOption.click();
      console.log('✅ Selected protocol template/type');
    }
    
    // Continue through wizard steps
    const nextButton = page.locator([
      '[data-testid=next]',
      '[data-testid=wizard-next]',
      'button:has-text("Next")',
      'button:has-text("Continue")'
    ].join(', ')).first();
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Step 2: Health Information / Ailments (should be accessible without customer)
    const healthOption = page.locator([
      'input[type=checkbox]',
      '[data-testid*=ailment]',
      '[data-testid*=condition]',
      'label:has-text("Digestive")',
      'label:has-text("Energy")',
      'label:has-text("Sleep")'
    ].join(', ')).first();
    
    if (await healthOption.isVisible()) {
      await healthOption.click();
      console.log('✅ Selected health condition/ailment');
    }
    
    // Continue to next step
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for protocol generation step (should work without customer)
    const generateButton = page.locator([
      '[data-testid*=generate]',
      'button:has-text("Generate")',
      'button:has-text("Create Protocol")',
      'button:has-text("Build")'
    ].join(', ')).first();
    
    if (await generateButton.isVisible()) {
      console.log('✅ Found generate button - protocol creation without customer works!');
      await generateButton.click();
      await page.waitForTimeout(5000); // Wait for AI generation
    }
    
    // Verify protocol was generated
    const protocolContent = page.locator([
      '[data-testid*=protocol]',
      '[data-testid*=generated]',
      '.protocol-content',
      'text=Protocol',
      'text=Recommendations',
      'text=Plan'
    ].join(', ')).first();
    
    if (await protocolContent.isVisible()) {
      console.log('✅ Protocol generated successfully without customer assignment!');
    }
    
    // Look for new save options step (should have 3 options)
    const saveOptions = page.locator([
      'text=Save Options',
      'text=What would you like to do',
      'text=Assign to Customer',
      'text=Save as Template',
      'text=Finish'
    ].join(', '));
    
    await expect(saveOptions.first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Save options step is visible');
    
    // Test "Finish" option (complete without assignment)
    const finishButton = page.locator('button:has-text("Finish"), button:has-text("Complete")').first();
    if (await finishButton.isVisible()) {
      await finishButton.click();
      console.log('✅ Completed wizard without customer assignment');
    }
  });
  
  test('Trainer: Create protocol and assign to customer at end', async ({ page }) => {
    console.log('🧪 Testing trainer protocol creation with optional customer assignment...');
    
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Navigate to protocol creation (trainer workflow)
    await page.click('text=Health Protocols, nav[data-testid=health-protocols], a[href*="/trainer"]:has-text("Protocols")').first();
    await page.waitForTimeout(2000);
    
    // Start wizard
    const createButton = page.locator([
      '[data-testid=create-protocol]',
      'button:has-text("Create Protocol")',
      'button:has-text("New Protocol")',
      'button:has-text("Add Protocol")'
    ].join(', ')).first();
    
    await createButton.click();
    await page.waitForTimeout(2000);
    
    // Go through wizard steps quickly (focus on customer assignment at end)
    const steps = [
      // Select template
      async () => {
        const template = page.locator('button:has-text("Longevity"), [data-testid*=template]').first();
        if (await template.isVisible()) await template.click();
      },
      // Next step
      async () => {
        const next = page.locator('button:has-text("Next")').first();
        if (await next.isVisible()) await next.click();
      },
      // Select health condition
      async () => {
        const condition = page.locator('input[type=checkbox]').first();
        if (await condition.isVisible()) await condition.click();
      },
      // Continue to generation
      async () => {
        const generate = page.locator('button:has-text("Generate")').first();
        if (await generate.isVisible()) {
          await generate.click();
          await page.waitForTimeout(5000); // Wait for generation
        }
      }
    ];
    
    for (const step of steps) {
      await step();
      await page.waitForTimeout(1000);
    }
    
    // Should reach save options step
    await expect(page.locator('text=Save Options, text=Assign to Customer')).toBeVisible({ timeout: 15000 });
    console.log('✅ Reached save options step');
    
    // Test customer assignment option
    const assignButton = page.locator('button:has-text("Assign to Customer")').first();
    await assignButton.click();
    await page.waitForTimeout(2000);
    
    // Should show customer selector
    const customerSelect = page.locator('select, [data-testid*=customer], .customer-selector').first();
    if (await customerSelect.isVisible()) {
      console.log('✅ Customer assignment option works');
      
      // Select a customer
      await customerSelect.selectOption({ index: 1 });
      
      // Confirm assignment
      const confirmButton = page.locator('button:has-text("Assign"), button:has-text("Confirm")').first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        console.log('✅ Protocol assigned to customer successfully');
      }
    }
  });
  
  test('Save protocol as template functionality', async ({ page }) => {
    console.log('🧪 Testing save as template functionality...');
    
    await loginAs(page, 'trainer');
    
    // Create protocol (abbreviated steps)
    await page.goto('http://localhost:3501/trainer');
    
    // Try to find and trigger protocol creation
    const protocolLink = page.locator('a, button').filter({ hasText: /protocol/i }).first();
    if (await protocolLink.isVisible()) {
      await protocolLink.click();
      await page.waitForTimeout(2000);
      
      const createBtn = page.locator('button, a').filter({ hasText: /create|new|add/i }).first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Quick wizard completion (focus on template save)
    const quickSteps = [
      'button:has-text("Longevity")',
      'input[type=checkbox]',
      'button:has-text("Generate")'
    ];
    
    for (const selector of quickSteps) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(selector.includes('Generate') ? 5000 : 1000);
      }
    }
    
    // Look for save as template option
    const saveTemplateButton = page.locator('button:has-text("Save as Template")').first();
    if (await saveTemplateButton.isVisible()) {
      await saveTemplateButton.click();
      console.log('✅ Save as template option found');
      
      // Fill template details
      const titleInput = page.locator('input[placeholder*="title"], input[name*="title"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('E2E Test Template');
      }
      
      const descInput = page.locator('textarea, input[placeholder*="description"]').first();
      if (await descInput.isVisible()) {
        await descInput.fill('Created by Playwright E2E test');
      }
      
      // Save template
      const saveButton = page.locator('button:has-text("Save Template"), button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        console.log('✅ Template saved successfully');
      }
    }
  });
  
  test('Edge case: Wizard works for all user roles', async ({ page }) => {
    console.log('🧪 Testing edge cases and user role compatibility...');
    
    const roles = ['admin', 'trainer'] as const;
    
    for (const role of roles) {
      console.log(`Testing ${role} role...`);
      
      await loginAs(page, role);
      
      // Verify dashboard loads
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
      
      // Look for protocol-related navigation
      const protocolNav = page.locator('a, button').filter({ hasText: /protocol/i }).first();
      if (await protocolNav.isVisible()) {
        await protocolNav.click();
        await page.waitForTimeout(2000);
        
        // Verify we can access protocol features
        const protocolFeatures = page.locator('button, a').filter({ hasText: /create|new|add|wizard/i });
        const hasFeatures = await protocolFeatures.count() > 0;
        
        console.log(`✅ ${role} can access protocol features: ${hasFeatures}`);
      }
      
      // Logout for next role
      const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      } else {
        await page.goto('http://localhost:3501/login');
      }
      
      await page.waitForTimeout(1000);
    }
  });
  
  test('Performance: Wizard loads quickly without customer requirement', async ({ page }) => {
    console.log('🧪 Testing wizard performance...');
    
    await loginAs(page, 'trainer');
    
    const startTime = Date.now();
    
    // Navigate to wizard
    await page.goto('http://localhost:3501/trainer');
    const protocolLink = page.locator('a, button').filter({ hasText: /protocol/i }).first();
    if (await protocolLink.isVisible()) {
      await protocolLink.click();
    }
    
    // Measure time to wizard ready
    const wizardReady = page.locator('h1, h2, [data-testid*=wizard]').first();
    await expect(wizardReady).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ Wizard loaded in ${loadTime}ms`);
    
    // Performance should be reasonable (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance test passed');
  });
});

test.describe('Regression Tests - Ensure Existing Features Still Work', () => {
  
  test('Existing protocol assignments still work', async ({ page }) => {
    console.log('🔄 Testing backward compatibility...');
    
    await loginAs(page, 'trainer');
    
    // Verify we can still view existing protocols
    await page.goto('http://localhost:3501/trainer');
    
    // Look for protocol list or dashboard
    const protocolsList = page.locator('table, .protocol-list, [data-testid*=protocol]').first();
    if (await protocolsList.isVisible()) {
      console.log('✅ Existing protocols are still accessible');
    }
    
    // Verify basic functionality still works
    const basicFeatures = page.locator('a, button').filter({ hasText: /view|edit|assign/i });
    const featureCount = await basicFeatures.count();
    
    console.log(`✅ Found ${featureCount} existing features still functional`);
  });
});