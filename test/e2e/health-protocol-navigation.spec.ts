import { test, expect, Page } from '@playwright/test';

// Test credentials
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

const ADMIN_CREDENTIALS = {
  email: 'admin@fitmeal.pro',
  password: 'AdminPass123'
};

// Helper function to login
async function loginAs(page: Page, role: 'trainer' | 'admin') {
  const credentials = role === 'trainer' ? TRAINER_CREDENTIALS : ADMIN_CREDENTIALS;
  
  await page.goto('http://localhost:3501');
  
  // Wait for login page to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL(role === 'trainer' ? '**/trainer' : '**/admin', { timeout: 10000 });
}

test.describe('Health Protocol Navigation', () => {
  test('Trainer can navigate to Health Protocols from dashboard', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Verify we're on the trainer dashboard
    await expect(page).toHaveURL(/.*\/trainer/);
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Find the Health Protocol Management section
    const protocolSection = page.locator('text=Health Protocol Management').first();
    await expect(protocolSection).toBeVisible();
    
    // Find and click the "Manage Health Protocols" button
    const manageButton = page.locator('button:has-text("Manage Health Protocols")');
    await expect(manageButton).toBeVisible();
    await manageButton.click();
    
    // Verify navigation to protocols page
    await page.waitForURL('**/protocols', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/protocols/);
    
    // Verify the Health Protocol Dashboard loaded
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    
    // Verify the tabs are visible
    await expect(page.locator('button:has-text("Health Protocols")')).toBeVisible();
    await expect(page.locator('button:has-text("Assignments")')).toBeVisible();
    
    // Verify the TrainerHealthProtocols component loaded
    await expect(page.locator('text=Protocol Creation Wizard')).toBeVisible({ timeout: 10000 });
  });

  test('Admin can navigate to Health Protocols from dashboard', async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    
    // Verify we're on the admin dashboard
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Find the Health Protocol section
    const protocolSection = page.locator('text=Health Protocol System').first();
    await expect(protocolSection).toBeVisible();
    
    // Find and click the "Open Protocol Wizard" button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")');
    await expect(wizardButton).toBeVisible();
    await wizardButton.click();
    
    // Verify navigation to protocols page
    await page.waitForURL('**/protocols', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/protocols/);
    
    // Verify the Health Protocol Dashboard loaded
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
  });

  test('Protocol Wizard functionality is accessible', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Navigate to protocols
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    // Verify the Protocol Creation Wizard section is visible
    const wizardSection = page.locator('text=Protocol Creation Wizard').first();
    await expect(wizardSection).toBeVisible();
    
    // Check for "Create with Wizard" button
    const createWizardButton = page.locator('button:has-text("Create with Wizard")');
    await expect(createWizardButton).toBeVisible();
    
    // Check for "Manual Creation" button
    const manualButton = page.locator('button:has-text("Manual Creation")');
    await expect(manualButton).toBeVisible();
    
    // Test clicking the wizard button
    await createWizardButton.click();
    
    // Verify wizard opens (look for wizard-specific elements)
    await expect(page.locator('text=Client Information')).toBeVisible({ timeout: 10000 });
  });

  test('Can switch between tabs in Health Protocol Dashboard', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Navigate to protocols
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    // Verify Health Protocols tab is active by default
    const protocolsTab = page.locator('button:has-text("Health Protocols")').first();
    await expect(protocolsTab).toHaveClass(/bg-white text-blue-600/);
    
    // Click on Assignments tab
    const assignmentsTab = page.locator('button:has-text("Assignments")').first();
    await assignmentsTab.click();
    
    // Verify Assignments tab is now active
    await expect(assignmentsTab).toHaveClass(/bg-white text-blue-600/);
    await expect(page.locator('text=Protocol Assignments coming soon')).toBeVisible();
    
    // Switch back to Health Protocols tab
    await protocolsTab.click();
    
    // Verify we're back on Health Protocols tab
    await expect(protocolsTab).toHaveClass(/bg-white text-blue-600/);
    await expect(page.locator('text=Protocol Creation Wizard')).toBeVisible();
  });

  test('Navigation persists after page refresh', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Navigate to protocols
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the protocols page
    await expect(page).toHaveURL(/.*\/protocols/);
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Verify we're still on the protocols page after refresh
    await expect(page).toHaveURL(/.*\/protocols/);
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    await expect(page.locator('text=Protocol Creation Wizard')).toBeVisible({ timeout: 10000 });
  });

  test('Unauthorized users cannot access protocols page', async ({ page }) => {
    // Try to access protocols page without logging in
    await page.goto('http://localhost:3501/protocols');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/(login|$)/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Protocol list loads correctly', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Navigate to protocols
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    // Check if the protocols list section exists
    const protocolsList = page.locator('text=Your Protocols').first();
    
    // It might show "No protocols created yet" or actual protocols
    const noProtocols = page.locator('text=No protocols created yet');
    const protocolItems = page.locator('[data-testid="protocol-item"]');
    
    // Either no protocols message or protocol items should be visible
    const hasNoProtocols = await noProtocols.isVisible().catch(() => false);
    const hasProtocolItems = await protocolItems.count() > 0;
    
    expect(hasNoProtocols || hasProtocolItems).toBeTruthy();
  });

  test('Mobile responsiveness of navigation button', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Verify the Health Protocol Management section is visible on mobile
    const protocolSection = page.locator('text=Health Protocol Management').first();
    await expect(protocolSection).toBeVisible();
    
    // Find and click the button (should be responsive)
    const manageButton = page.locator('button:has-text("Manage Health Protocols")');
    await expect(manageButton).toBeVisible();
    
    // Verify button is properly sized for mobile
    const buttonBox = await manageButton.boundingBox();
    expect(buttonBox).toBeTruthy();
    if (buttonBox) {
      // Button should be reasonably sized for mobile tap
      expect(buttonBox.height).toBeGreaterThanOrEqual(40);
    }
    
    // Click and navigate
    await manageButton.click();
    await page.waitForURL('**/protocols', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/protocols/);
  });
});

test.describe('Edge Cases and Error Handling', () => {
  test('Handles network errors gracefully', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Intercept API calls to simulate network error
    await page.route('**/api/trainer/protocols', route => {
      route.abort('failed');
    });
    
    // Navigate to protocols
    await page.goto('http://localhost:3501/protocols');
    
    // Page should still load even if API fails
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
  });

  test('Quick navigation between trainer dashboard and protocols', async ({ page }) => {
    // Login as trainer
    await loginAs(page, 'trainer');
    
    // Quick back and forth navigation
    for (let i = 0; i < 3; i++) {
      // Go to protocols
      await page.click('button:has-text("Manage Health Protocols")');
      await expect(page).toHaveURL(/.*\/protocols/);
      
      // Go back using browser back button
      await page.goBack();
      await expect(page).toHaveURL(/.*\/trainer/);
    }
    
    // Verify everything still works after multiple navigations
    await page.click('button:has-text("Manage Health Protocols")');
    await expect(page).toHaveURL(/.*\/protocols/);
    await expect(page.locator('text=Protocol Creation Wizard')).toBeVisible();
  });
});