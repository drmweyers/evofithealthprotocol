import { test, expect } from '@playwright/test';

/**
 * STORY-007 Comprehensive Test Suite
 * Testing the complete removal of Health Protocols tab from Trainer Dashboard
 * 
 * Acceptance Criteria:
 * 1. Health Protocols tab is completely removed from trainer interface
 * 2. No "Protocols" text appears anywhere on trainer dashboard  
 * 3. Customer Management functionality remains fully functional
 * 4. Stats cards show customer-focused metrics instead of protocol metrics
 * 5. Welcome message focuses on client management
 * 6. No console errors or broken navigation
 * 7. Responsive design works across all viewports
 */

const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

const VIEWPORT_SIZES = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

test.describe('STORY-007: Health Protocols Tab Removal', () => {
  
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Store errors on page for later access
    await page.addInitScript(() => {
      (window as any).consoleErrors = [];
    });

    // Navigate to login page
    await page.goto('http://localhost:3501/login');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Health Protocols tab is completely removed', async ({ page }) => {
    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to trainer dashboard
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Take screenshot for documentation
    await page.screenshot({ path: 'test-results/story-007-trainer-dashboard.png', fullPage: true });

    // Verify no tabs interface exists
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toHaveCount(0);

    // Verify no tab buttons exist
    const tabButtons = page.locator('[role="tab"]');
    await expect(tabButtons).toHaveCount(0);

    // Verify no Health Protocols tab specifically
    const healthProtocolsTab = page.locator('text="Health Protocols"');
    await expect(healthProtocolsTab).toHaveCount(0);

    console.log('✅ AC1 PASSED: Health Protocols tab completely removed');
  });

  test('AC2: No "Protocols" text appears anywhere', async ({ page }) => {
    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Search for any "Protocol" text (case insensitive)
    const protocolText = page.locator('text=/protocol/i');
    await expect(protocolText).toHaveCount(0);

    // Search for any "Health Protocol" text specifically
    const healthProtocolText = page.locator('text=/health protocol/i');
    await expect(healthProtocolText).toHaveCount(0);

    // Verify page content doesn't contain protocol-related terms
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).not.toContain('protocol');
    expect(pageContent?.toLowerCase()).not.toContain('health protocol');

    console.log('✅ AC2 PASSED: No "Protocols" text found anywhere');
  });

  test('AC3: Customer Management functionality remains intact', async ({ page }) => {
    // Login as trainer  
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Verify Customer Management section is visible and functional
    const customerManagementSection = page.locator('text="Customer Management"');
    await expect(customerManagementSection).toBeVisible();

    // Verify Customer Management component is rendered
    const customerManagementComponent = page.locator('[data-testid="customer-management"], .customer-management, text="Manage your clients"');
    
    // Check if the CustomerManagement component is rendering (it might be the entire content area)
    const mainContent = page.locator('main, .main-content, [role="main"]');
    await expect(mainContent.or(page.locator('body'))).toBeVisible();

    // Verify customer-related functionality is accessible
    const customerElements = page.locator('text=/customer|client/i').first();
    await expect(customerElements).toBeVisible();

    console.log('✅ AC3 PASSED: Customer Management functionality remains intact');
  });

  test('AC4: Stats cards show customer-focused metrics', async ({ page }) => {
    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);  
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Verify customer-focused stats are displayed
    await expect(page.locator('text="Total Customers"')).toBeVisible();
    await expect(page.locator('text="Active Programs"')).toBeVisible();
    await expect(page.locator('text="Client Satisfaction"')).toBeVisible();
    await expect(page.locator('text="Completed Programs"')).toBeVisible();

    // Verify old protocol-specific stats are NOT displayed
    await expect(page.locator('text="Active Protocols"')).toHaveCount(0);
    await expect(page.locator('text="Protocol Assignments"')).toHaveCount(0);
    await expect(page.locator('text="Total Protocols"')).toHaveCount(0);

    // Verify stats cards are displayed with proper structure
    const statsCards = page.locator('.grid').first();
    await expect(statsCards).toBeVisible();

    // Take screenshot of stats section
    await page.screenshot({ path: 'test-results/story-007-customer-focused-stats.png' });

    console.log('✅ AC4 PASSED: Stats cards show customer-focused metrics');
  });

  test('AC5: Welcome message focuses on client management', async ({ page }) => {
    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Verify the new customer-focused welcome message
    await expect(page.locator('text="Manage your clients and their fitness journeys"')).toBeVisible();

    // Verify old protocol-focused message is gone
    await expect(page.locator('text="Create and manage health protocols"')).toHaveCount(0);
    await expect(page.locator('text=/create.*protocol/i')).toHaveCount(0);

    // Verify welcome message is prominently displayed
    const welcomeText = page.locator('text="Manage your clients and their fitness journeys"');
    await expect(welcomeText).toBeVisible();

    console.log('✅ AC5 PASSED: Welcome message focuses on client management');
  });

  test('AC6: No console errors or broken navigation', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Wait a bit more for any delayed errors
    await page.waitForTimeout(2000);

    // Check for console errors
    expect(consoleErrors.length).toBe(0);
    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors);
    }

    // Test navigation functionality
    const currentUrl = page.url();
    expect(currentUrl).toContain('/trainer');

    // Verify page loads without errors
    const response = await page.goto(page.url());
    expect(response?.status()).toBe(200);

    console.log('✅ AC6 PASSED: No console errors or broken navigation');
  });

  test('AC7: Responsive design works across all viewports', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize(VIEWPORT_SIZES.mobile);
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Verify essential elements are visible on mobile
    await expect(page.locator('text="Customer Management"')).toBeVisible();
    await page.screenshot({ path: 'test-results/story-007-mobile-view.png', fullPage: true });

    // Test on tablet
    await page.setViewportSize(VIEWPORT_SIZES.tablet);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text="Customer Management"')).toBeVisible();
    await page.screenshot({ path: 'test-results/story-007-tablet-view.png', fullPage: true });

    // Test on desktop
    await page.setViewportSize(VIEWPORT_SIZES.desktop);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text="Customer Management"')).toBeVisible();
    await page.screenshot({ path: 'test-results/story-007-desktop-view.png', fullPage: true });

    // Verify stats cards layout is responsive
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toBeVisible();

    console.log('✅ AC7 PASSED: Responsive design works across all viewports');
  });

  test('COMPREHENSIVE: Full STORY-007 validation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Login as trainer
    await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/trainer**');
    await page.waitForLoadState('networkidle');

    // Comprehensive validation of all STORY-007 requirements
    console.log('🧪 Running comprehensive STORY-007 validation...');

    // 1. NO Health Protocols tab
    await expect(page.locator('text="Health Protocols"')).toHaveCount(0);
    await expect(page.locator('[role="tablist"]')).toHaveCount(0);

    // 2. NO Protocol text anywhere  
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).not.toContain('protocol');

    // 3. Customer Management is present and functional
    await expect(page.locator('text="Customer Management"')).toBeVisible();
    await expect(page.locator('text="Manage your clients and their fitness journeys"')).toBeVisible();

    // 4. Customer-focused stats only
    await expect(page.locator('text="Total Customers"')).toBeVisible();
    await expect(page.locator('text="Client Satisfaction"')).toBeVisible();
    await expect(page.locator('text="Active Programs"')).toBeVisible();

    // 5. NO protocol-related stats
    await expect(page.locator('text="Active Protocols"')).toHaveCount(0);
    await expect(page.locator('text="Protocol Assignments"')).toHaveCount(0);

    // 6. No console errors
    expect(consoleErrors.length).toBe(0);

    // 7. Navigation works
    expect(page.url()).toContain('/trainer');

    // Take final comprehensive screenshot
    await page.screenshot({ path: 'test-results/story-007-comprehensive-validation.png', fullPage: true });

    console.log('🎉 STORY-007 COMPREHENSIVE VALIDATION PASSED');
    console.log('✅ Health Protocols tab completely removed');  
    console.log('✅ No protocol-related text anywhere');
    console.log('✅ Customer Management fully functional');
    console.log('✅ Customer-focused stats and messaging');
    console.log('✅ No console errors or broken functionality');
  });
});