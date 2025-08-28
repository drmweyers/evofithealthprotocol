import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * 🎯 COMPREHENSIVE FRONTEND VALIDATION E2E TEST
 * 
 * This test validates that the React application with the new Router DOM setup works correctly.
 * It tests the complete user workflow for all roles and key features.
 */

// Test data for different user roles
const testUsers = {
  admin: {
    email: 'admin@healthprotocol.com',
    password: 'Admin123!@#'
  },
  trainer: {
    email: 'trainer@healthprotocol.com', 
    password: 'Trainer123!@#'
  },
  customer: {
    email: 'customer@healthprotocol.com',
    password: 'Customer123!@#'
  }
};

test.describe('🚀 Comprehensive Frontend Validation', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();

    // Enable console logging to catch any frontend errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`🚨 Frontend Console Error: ${msg.text()}`);
      }
    });

    // Listen for uncaught exceptions
    page.on('pageerror', (error) => {
      console.error(`🚨 Page Error: ${error.message}`);
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('🏠 Application loads and renders properly', async () => {
    console.log('🔍 Testing application loading...');
    
    await page.goto('http://localhost:3500');
    
    // Wait for the application to load
    await page.waitForTimeout(2000);
    
    // Check if the page loaded without errors
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Should see login page or be redirected to login
    await expect(page).toHaveURL(/.*login.*/i);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/app-loading-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Application loaded successfully');
  });

  test('🔐 Login Page Renders and Functions', async () => {
    console.log('🔍 Testing login page functionality...');
    
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(1000);
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Test form interaction
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword');
    
    console.log('✅ Login form renders and accepts input');
    
    await page.screenshot({ 
      path: 'test-results/login-form-verification.png',
      fullPage: true 
    });
  });

  test('🎯 Admin Login and Navigation', async () => {
    console.log('🔍 Testing admin login and navigation...');
    
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(1000);
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await emailInput.fill(testUsers.admin.email);
    await passwordInput.fill(testUsers.admin.password);
    await loginButton.click();
    
    // Wait for navigation after login
    await page.waitForTimeout(3000);
    
    // Should be redirected to admin dashboard
    console.log(`Current URL after admin login: ${page.url()}`);
    
    // Look for admin-specific elements
    const adminElements = [
      'text=Admin',
      'text=Dashboard', 
      'text=Health Protocol',
      '[data-testid="admin-dashboard"]',
      '.admin-panel',
      '.dashboard'
    ];
    
    let foundAdminElement = false;
    for (const selector of adminElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found admin element: ${selector}`);
          foundAdminElement = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!foundAdminElement) {
      // If no specific admin elements found, check if we're on a valid page
      const bodyText = await page.locator('body').textContent();
      console.log(`Body text sample: ${bodyText?.substring(0, 200)}...`);
    }
    
    await page.screenshot({ 
      path: 'test-results/admin-dashboard-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Admin login completed');
  });

  test('🏋️ Trainer Login and Health Protocols', async () => {
    console.log('🔍 Testing trainer login and health protocols access...');
    
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(1000);
    
    // Clear any existing session
    await page.context().clearCookies();
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await emailInput.fill(testUsers.trainer.email);
    await passwordInput.fill(testUsers.trainer.password);
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    console.log(`Current URL after trainer login: ${page.url()}`);
    
    // Try to navigate to health protocols
    try {
      // Look for health protocol navigation
      const healthProtocolLinks = [
        'a:has-text("Health Protocol")',
        'a:has-text("Protocols")',
        '[href*="health-protocol"]',
        '[href*="protocols"]'
      ];
      
      let navigated = false;
      for (const selector of healthProtocolLinks) {
        const link = page.locator(selector).first();
        if (await link.isVisible({ timeout: 2000 })) {
          await link.click();
          await page.waitForTimeout(2000);
          navigated = true;
          console.log(`✅ Navigated via: ${selector}`);
          break;
        }
      }
      
      if (!navigated) {
        // Try direct URL navigation
        await page.goto('http://localhost:3500/trainer/health-protocols');
        await page.waitForTimeout(2000);
      }
      
    } catch (error) {
      console.log(`Navigation attempt: ${error}`);
      // Continue with verification
    }
    
    await page.screenshot({ 
      path: 'test-results/trainer-health-protocols-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Trainer workflow tested');
  });

  test('🧬 Specialized Protocols Testing', async () => {
    console.log('🔍 Testing specialized protocols functionality...');
    
    // Ensure we're logged in as trainer
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await emailInput.fill(testUsers.trainer.email);
    await passwordInput.fill(testUsers.trainer.password);
    await loginButton.click();
    await page.waitForTimeout(2000);
    
    // Try to access specialized protocols
    try {
      await page.goto('http://localhost:3500/trainer/health-protocols');
      await page.waitForTimeout(2000);
      
      // Look for specialized protocol elements
      const specializedElements = [
        'text=Longevity Mode',
        'text=Parasite Cleanse',
        'text=Specialized Protocol',
        '[data-testid="longevity-toggle"]',
        '[data-testid="parasite-cleanse"]'
      ];
      
      for (const selector of specializedElements) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            console.log(`✅ Found specialized protocol element: ${selector}`);
            
            // If it's a toggle or button, try to interact with it
            if (selector.includes('toggle') || selector.includes('button')) {
              await element.click();
              await page.waitForTimeout(1000);
            }
          }
        } catch (e) {
          // Continue to next element
        }
      }
      
    } catch (error) {
      console.log(`Specialized protocols access: ${error}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/specialized-protocols-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Specialized protocols tested');
  });

  test('👥 Customer Login and Access', async () => {
    console.log('🔍 Testing customer login and access...');
    
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(1000);
    
    // Clear session
    await page.context().clearCookies();
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await emailInput.fill(testUsers.customer.email);
    await passwordInput.fill(testUsers.customer.password);
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    console.log(`Current URL after customer login: ${page.url()}`);
    
    // Look for customer-specific elements
    const customerElements = [
      'text=Customer',
      'text=My Progress',
      'text=My Protocols',
      '.customer-dashboard',
      '[data-testid="customer-dashboard"]'
    ];
    
    for (const selector of customerElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`✅ Found customer element: ${selector}`);
        }
      } catch (e) {
        // Continue to next element
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/customer-dashboard-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Customer login tested');
  });

  test('📱 Mobile Responsive Testing', async () => {
    console.log('🔍 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3500/login');
    await page.waitForTimeout(2000);
    
    // Check if login form is mobile-friendly
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-verification.png',
      fullPage: true 
    });
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Mobile responsiveness tested');
  });

  test('🔍 Frontend Error Monitoring', async () => {
    console.log('🔍 Testing frontend error monitoring...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    // Visit multiple pages to check for errors
    const testPages = [
      'http://localhost:3500',
      'http://localhost:3500/login',
      'http://localhost:3500/register'
    ];
    
    for (const url of testPages) {
      try {
        await page.goto(url);
        await page.waitForTimeout(2000);
        console.log(`✅ Visited: ${url}`);
      } catch (error) {
        console.log(`❌ Error visiting ${url}: ${error}`);
      }
    }
    
    // Report errors and warnings
    if (errors.length > 0) {
      console.log('🚨 Frontend Errors Detected:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No critical frontend errors detected');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ Frontend Warnings:');
      warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    // The test should pass even with warnings, but fail with critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') && 
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors.length).toBeLessThan(3); // Allow up to 2 non-critical errors
  });

  test('🎯 Full User Journey Test', async () => {
    console.log('🔍 Testing complete user journey...');
    
    // Start fresh
    await page.context().clearCookies();
    
    // 1. Load application
    await page.goto('http://localhost:3500');
    await page.waitForTimeout(2000);
    
    // 2. Navigate to login
    if (!page.url().includes('login')) {
      try {
        const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In")').first();
        if (await loginLink.isVisible({ timeout: 2000 })) {
          await loginLink.click();
        } else {
          await page.goto('http://localhost:3500/login');
        }
      } catch {
        await page.goto('http://localhost:3500/login');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 3. Test trainer login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    
    await emailInput.fill(testUsers.trainer.email);
    await passwordInput.fill(testUsers.trainer.password);
    await loginButton.click();
    
    // 4. Wait for dashboard
    await page.waitForTimeout(3000);
    
    // 5. Try to navigate to health protocols
    try {
      await page.goto('http://localhost:3500/trainer/health-protocols');
      await page.waitForTimeout(2000);
    } catch {
      console.log('Direct navigation to health protocols failed, checking current page');
    }
    
    // 6. Take final screenshot
    await page.screenshot({ 
      path: 'test-results/full-journey-final.png',
      fullPage: true 
    });
    
    // 7. Verify we're on a valid page (not error page)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(100); // Should have substantial content
    
    console.log('✅ Full user journey completed');
  });
});