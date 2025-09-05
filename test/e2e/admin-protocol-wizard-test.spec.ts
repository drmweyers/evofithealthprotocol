import { test, expect } from '@playwright/test';

/**
 * Admin Protocol Wizard Test Suite
 * 
 * Tests the enhanced protocol wizard for admin users who can create protocols
 * without selecting a customer first. Verifies that:
 * 1. Admin can access the protocol wizard
 * 2. Customer selection step is skipped for admin users
 * 3. Admin can complete the entire wizard flow
 * 4. Protocol is saved to database correctly
 * 5. All validation works properly
 */

test.describe('Admin Protocol Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('http://localhost:3501');
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', 'admin@fitmeal.pro');
    await page.fill('input[type="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin');
    
    // Verify we're on the admin dashboard
    await expect(page.locator('h1, h2')).toContainText(['Admin Dashboard', 'EvoFit Health Protocol']);
  });

  test('should skip customer selection for admin and start with template selection', async ({ page }) => {
    // Click on Open Protocol Wizard button (visible in admin dashboard)
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    
    // Wait for protocols page to load and then click Enhanced Protocol Wizard card
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    
    // Wait for the wizard dialog to open
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Check that we start with Template Selection as first step (no client selection step)
    await expect(page.locator('text="Template Selection"')).toBeVisible();
    
    // Verify the step counter shows Step 1 of 7
    const stepCounter = page.locator('text=/Step \\d+ of \\d+/');
    await expect(stepCounter).toContainText('Step 1 of 7');
    
    // Verify the admin can proceed without selecting a customer first
    // This is the core requirement - admin should not be forced to select customer upfront
    await expect(page.locator('text="Choose Protocol Template"')).toBeVisible();
  });

  test('should complete the entire admin protocol wizard flow', async ({ page }) => {
    // Start the wizard
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Step 1: Template Selection
    await expect(page.locator('h2, h3').filter({ hasText: /Template Selection/ })).toBeVisible();
    
    // Select a template (look for any clickable template option)
    const templateOption = page.locator('.cursor-pointer, [data-testid="template-option"], button').filter({ hasText: /Longevity|Parasite|General|Template/ });
    await templateOption.first().click();
    
    // Click Next
    await page.locator('button:has-text("Next")').click();
    
    // Step 2: Health Information
    await expect(page.locator('h2, h3').filter({ hasText: /Health Information|Step 2/ })).toBeVisible();
    
    // Add some health information (conditions or goals)
    const conditionInput = page.locator('input[placeholder*="condition"], input[placeholder*="health"], textarea[placeholder*="condition"]').first();
    if (await conditionInput.isVisible()) {
      await conditionInput.fill('General wellness protocol');
    } else {
      // Try to find checkboxes or other health input methods
      const healthCheckbox = page.locator('input[type="checkbox"]').first();
      if (await healthCheckbox.isVisible()) {
        await healthCheckbox.check();
      }
    }
    
    await page.locator('button:has-text("Next")').click();
    
    // Step 3: Customization
    await expect(page.locator('h2, h3').filter({ hasText: /Customization|Step 3/ })).toBeVisible();
    
    // Select at least one health goal
    const goalCheckbox = page.locator('input[type="checkbox"]').first();
    if (await goalCheckbox.isVisible()) {
      await goalCheckbox.check();
    }
    
    await page.locator('button:has-text("Next")').click();
    
    // Step 4: AI Generation
    await expect(page.locator('h2, h3').filter({ hasText: /AI Generation|Step 4/ })).toBeVisible();
    
    // Wait for generation to complete (this step should auto-proceed)
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(3000); // Give AI generation time
    
    // Step 5: Safety Validation
    await expect(page.locator('h2, h3').filter({ hasText: /Safety|Step 5/ })).toBeVisible();
    
    await page.locator('button:has-text("Next")').click();
    
    // Step 6: Review & Finalize
    await expect(page.locator('h2, h3').filter({ hasText: /Review|Finalize|Step 6/ })).toBeVisible();
    
    // Verify we can see protocol details
    await expect(page.locator('text=/Template|Protocol/i')).toBeVisible();
    
    await page.locator('button:has-text("Next")').click();
    
    // Step 7: Save Options (new final step)
    await expect(page.locator('h2, h3').filter({ hasText: /Save Options|Step 7/ })).toBeVisible();
    
    // Admin should be able to save as template without assigning to customer
    await page.locator('button:has-text("Save as Template"), button:has-text("Finish Protocol")').click();
    
    // Wait for success message
    await expect(page.locator('text=/Success|created|saved|template/i')).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields at each step', async ({ page }) => {
    // Start the wizard
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Try to proceed without selecting a template
    await page.locator('button:has-text("Next")').click();
    
    // Should show validation error
    await expect(page.locator('text=/required|select/i')).toBeVisible();
    
    // Select a template
    const templateOption = page.locator('.cursor-pointer, [data-testid="template-option"], button').filter({ hasText: /Longevity|Parasite|General|Template/ });
    await templateOption.first().click();
    
    // Now Next should work
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('h2, h3').filter({ hasText: /Health Information|Step 2/ })).toBeVisible();
  });

  test('should show correct step navigation for admin (7 steps total)', async ({ page }) => {
    // Start the wizard
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Check step indicators - should show 7 steps total for all users now
    const stepIndicators = page.locator('.w-10.h-10, [data-testid="step-indicator"], .step-indicator');
    
    // Should have 7 step indicators (client assignment moved to Save Options step)
    await expect(stepIndicators).toHaveCount(7);
    
    // Verify step names in order - Template Selection comes first, no Client Selection
    await expect(page.locator('text=Template Selection')).toBeVisible();
    
    // The key requirement: Admin users don't have mandatory client selection as first step
    // Instead they can save as template at the end (Save Options step)
  });

  test('should save protocol to database and redirect properly', async ({ page }) => {
    // Complete a quick protocol creation flow
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Quick flow through the wizard
    // Step 1: Select template
    const templateOption = page.locator('.cursor-pointer, button').filter({ hasText: /Longevity|General|Template/ });
    await templateOption.first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Step 2: Health info (add minimal info)
    const healthInput = page.locator('input, textarea, [type="checkbox"]').first();
    if (await healthInput.isVisible()) {
      if (await healthInput.getAttribute('type') === 'checkbox') {
        await healthInput.check();
      } else {
        await healthInput.fill('Basic health protocol for admin testing');
      }
    }
    await page.locator('button:has-text("Next")').click();
    
    // Step 3: Goals (select at least one)
    const goalCheckbox = page.locator('input[type="checkbox"]').first();
    if (await goalCheckbox.isVisible()) {
      await goalCheckbox.check();
    }
    await page.locator('button:has-text("Next")').click();
    
    // Step 4-6: Auto-proceed through AI generation, safety, and review
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Next")').click();
    
    // Step 7: Save Options - save as template
    await page.locator('button:has-text("Save as Template"), button:has-text("Finish Protocol")').click();
    
    // Should redirect back to admin dashboard and show success
    await page.waitForURL('**/admin', { timeout: 10000 });
    await expect(page.locator('text=/Success|created/i')).toBeVisible();
    
    // Verify we're back on the admin dashboard
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should handle back navigation correctly', async ({ page }) => {
    // Start the wizard
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Back button should be disabled on first step
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeDisabled();
    
    // Select template and go to next step
    const templateOption = page.locator('.cursor-pointer, button').filter({ hasText: /Longevity|General|Template/ });
    await templateOption.first().click();
    await page.locator('button:has-text("Next")').click();
    
    // Now back button should be enabled
    await expect(backButton).toBeEnabled();
    
    // Click back
    await backButton.click();
    
    // Should be back on template selection
    await expect(page.locator('h2, h3').filter({ hasText: /Template Selection|Step 1/ }).first()).toBeVisible();
  });

  test('should display admin-specific messaging', async ({ page }) => {
    // Start the wizard  
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Complete the flow to see final messaging
    const templateOption = page.locator('.cursor-pointer, button').filter({ hasText: /Longevity|General|Template/ });
    await templateOption.first().click();
    
    // Navigate through steps quickly
    for (let i = 0; i < 6; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(1000);
    }
    
    // On final step (Save Options), should show admin-specific save options
    await expect(page.locator('text=/Save Options|Save as Template|template.*created/i')).toBeVisible();
  });
});

test.describe('Admin Protocol Wizard Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3501');
    await page.fill('input[type="email"]', 'admin@fitmeal.pro');
    await page.fill('input[type="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
  });

  test('should handle wizard cancellation gracefully', async ({ page }) => {
    // Start the wizard
    await page.locator('button:has-text("Open Protocol Wizard")').click();
    await page.waitForSelector('text="Enhanced Protocol Wizard"');
    await page.locator('text="Enhanced Protocol Wizard"').click();
    await page.waitForSelector('text="Protocol Creation Wizard"');
    
    // Click Cancel
    await page.locator('button:has-text("Cancel")').click();
    
    // Should return to admin dashboard
    await page.waitForURL('**/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });
});