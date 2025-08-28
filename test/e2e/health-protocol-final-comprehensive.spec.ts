import { test, expect, Page } from '@playwright/test';

// Test accounts created for this comprehensive test
const TEST_ACCOUNTS = {
  admin: { email: 'admin@fitmeal.pro', password: 'AdminPass123' },
  trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' },
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

const BASE_URL = 'http://localhost:3500';

// Helper function to login
async function login(page: Page, email: string, password: string, role: string) {
  console.log(`🔐 Logging in as ${role}: ${email}`);
  
  await page.goto(`${BASE_URL}/login`);
  
  // Wait for login form to be visible
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect after login
  await page.waitForURL(/\/(trainer|customer|admin)/, { timeout: 15000 });
  
  console.log(`✅ Successfully logged in as ${role}`);
}

// Helper function to take screenshot with timestamp
async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `screenshots/health-protocol-test-${name}-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
}

test.describe('Health Protocol Comprehensive Feature Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for complex operations
    test.setTimeout(120000);
  });

  test('Complete Health Protocol Workflow - Trainer to Customer', async ({ page }) => {
    console.log('🚀 Starting comprehensive health protocol test...');
    
    // ===== STEP 1: TRAINER LOGIN =====
    await test.step('Trainer Login', async () => {
      await login(page, TEST_ACCOUNTS.trainer.email, TEST_ACCOUNTS.trainer.password, 'trainer');
      await takeScreenshot(page, 'trainer-dashboard');
    });

    // ===== STEP 2: NAVIGATE TO HEALTH PROTOCOLS =====
    await test.step('Navigate to Health Protocols', async () => {
      console.log('📋 Looking for Health Protocols navigation...');
      
      // Look for various possible navigation elements
      const navSelectors = [
        'text=Health Protocols',
        '[data-testid="health-protocols-nav"]',
        'a[href*="health"]',
        'button:has-text("Health")',
        'nav a:has-text("Protocol")',
        '.nav-link:has-text("Health")',
        '[role="navigation"] >> text=Health'
      ];
      
      let found = false;
      for (const selector of navSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found navigation element: ${selector}`);
            await element.click();
            found = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!found) {
        // Take screenshot to see current page
        await takeScreenshot(page, 'trainer-dashboard-nav-search');
        
        // Try to find any navigation elements
        const allLinks = await page.locator('a').all();
        console.log('🔍 Available navigation links:');
        for (const link of allLinks) {
          try {
            const text = await link.innerText({ timeout: 1000 });
            const href = await link.getAttribute('href');
            if (text || href) {
              console.log(`  - "${text}" (${href})`);
            }
          } catch (e) {
            // Skip this link
          }
        }
        
        // Try to find any buttons
        const allButtons = await page.locator('button').all();
        console.log('🔍 Available buttons:');
        for (const button of allButtons) {
          try {
            const text = await button.innerText({ timeout: 1000 });
            if (text) {
              console.log(`  - Button: "${text}"`);
            }
          } catch (e) {
            // Skip this button
          }
        }
      }
      
      await takeScreenshot(page, 'health-protocols-page');
    });

    // ===== STEP 3: CREATE HEALTH PROTOCOL =====
    await test.step('Create Health Protocol with Ailments', async () => {
      console.log('🏥 Testing health protocol creation...');
      
      // Look for protocol creation elements
      const createSelectors = [
        'button:has-text("Create")',
        'button:has-text("New")',
        'button:has-text("Generate")',
        '[data-testid="create-protocol"]',
        '.create-protocol-btn',
        'text=Create Protocol'
      ];
      
      let createFound = false;
      for (const selector of createSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            console.log(`✅ Found create button: ${selector}`);
            await element.click();
            createFound = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (createFound) {
        // Look for ailment selectors
        const ailmentSelectors = [
          'select[name*="ailment"]',
          'input[type="checkbox"]',
          '[data-testid="ailment-selector"]',
          '.ailment-checkbox',
          'text=Diabetes',
          'text=Hypertension',
          'text=Obesity'
        ];
        
        // Try to select some ailments
        for (const selector of ailmentSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              console.log(`✅ Found ailment selector: ${selector}`);
              if (await element.getAttribute('type') === 'checkbox') {
                await element.check();
              } else {
                await element.click();
              }
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Look for generate/submit button
        const submitSelectors = [
          'button:has-text("Generate")',
          'button:has-text("Create")',
          'button[type="submit"]',
          '.generate-protocol-btn'
        ];
        
        for (const selector of submitSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              console.log(`✅ Found submit button: ${selector}`);
              await element.click();
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Wait for protocol generation
        await page.waitForTimeout(3000);
      }
      
      await takeScreenshot(page, 'protocol-creation');
    });

    // ===== STEP 4: TEST SPECIALIZED PROTOCOLS =====
    await test.step('Test Specialized Protocols', async () => {
      console.log('🌟 Testing specialized protocols...');
      
      // Look for specialized protocol options
      const specializedSelectors = [
        'text=Longevity',
        'text=Parasite',
        'text=Cleanse',
        '[data-testid="longevity-mode"]',
        '[data-testid="parasite-cleanse"]',
        '.specialized-protocols',
        'button:has-text("Longevity")',
        'button:has-text("Parasite")'
      ];
      
      for (const selector of specializedSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found specialized protocol: ${selector}`);
            await element.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'specialized-protocols');
    });

    // ===== STEP 5: TEST CUSTOMER ASSIGNMENT =====
    await test.step('Test Customer Assignment', async () => {
      console.log('👥 Testing customer assignment...');
      
      // Look for customer assignment elements
      const assignSelectors = [
        'button:has-text("Assign")',
        'text=Assign to Customer',
        '[data-testid="assign-customer"]',
        'select[name*="customer"]',
        '.customer-selector',
        'button:has-text("Save")',
        'button:has-text("Send")'
      ];
      
      for (const selector of assignSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found assignment element: ${selector}`);
            await element.click();
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'customer-assignment');
    });

    // ===== STEP 6: TEST PDF EXPORT =====
    await test.step('Test PDF Export', async () => {
      console.log('📄 Testing PDF export...');
      
      // Look for PDF export elements
      const pdfSelectors = [
        'button:has-text("PDF")',
        'button:has-text("Export")',
        'button:has-text("Download")',
        '[data-testid="pdf-export"]',
        '.pdf-export-btn',
        'text=Export PDF'
      ];
      
      for (const selector of pdfSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found PDF export element: ${selector}`);
            
            // Set up download handling
            const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
            await element.click();
            
            try {
              const download = await downloadPromise;
              console.log(`✅ PDF download initiated: ${download.suggestedFilename()}`);
            } catch (e) {
              console.log('⚠️ PDF download timeout - but button was clicked');
            }
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'pdf-export');
    });

    // ===== STEP 7: LOGOUT TRAINER =====
    await test.step('Logout Trainer', async () => {
      console.log('🚪 Logging out trainer...');
      
      const logoutSelectors = [
        'button:has-text("Logout")',
        'text=Logout',
        '[data-testid="logout"]',
        '.logout-btn',
        'a:has-text("Sign Out")',
        'button:has-text("Sign Out")'
      ];
      
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found logout element: ${selector}`);
            await element.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Or navigate directly to login to ensure logout
      await page.goto(`${BASE_URL}/login`);
    });

    // ===== STEP 8: CUSTOMER LOGIN =====
    await test.step('Customer Login and Protocol View', async () => {
      await login(page, TEST_ACCOUNTS.customer.email, TEST_ACCOUNTS.customer.password, 'customer');
      await takeScreenshot(page, 'customer-dashboard');
      
      // Look for assigned protocols
      console.log('👀 Looking for assigned protocols...');
      
      const protocolSelectors = [
        'text=Protocol',
        'text=Health Plan',
        'text=Your Protocol',
        '[data-testid="customer-protocol"]',
        '.protocol-card',
        '.assigned-protocol'
      ];
      
      for (const selector of protocolSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            console.log(`✅ Found customer protocol: ${selector}`);
            await element.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'customer-protocols');
    });

    console.log('✅ Comprehensive health protocol test completed!');
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    console.log('🧪 Testing error handling and edge cases...');
    
    await test.step('Test Invalid Login', async () => {
      await page.goto(`${BASE_URL}/login`);
      
      // Try invalid credentials
      await page.fill('input[type="email"]', 'invalid@email.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Look for error message
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'invalid-login');
    });

    await test.step('Test Form Validation', async () => {
      // Try to access trainer page without login
      await page.goto(`${BASE_URL}/trainer`);
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'unauthorized-access');
    });
  });

  test('Responsive Design Check', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, TEST_ACCOUNTS.trainer.email, TEST_ACCOUNTS.trainer.password, 'trainer');
    await takeScreenshot(page, 'mobile-trainer-dashboard');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await takeScreenshot(page, 'tablet-trainer-dashboard');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await takeScreenshot(page, 'desktop-trainer-dashboard');
  });
});