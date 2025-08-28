import { test, expect, Page } from '@playwright/test';

// Test accounts created for this comprehensive test
const TEST_ACCOUNTS = {
  admin: { email: 'admin@fitmeal.pro', password: 'AdminPass123' },
  trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' },
  customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
};

const BASE_URL = 'http://localhost:3500';

// Helper function to login
async function login(page: Page, email: string, password: string, role: string, expectedRoute: string) {
  console.log(`🔐 Logging in as ${role}: ${email}`);
  
  await page.goto(`${BASE_URL}/`);
  
  // Wait for login form to be visible
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect to expected route
  await page.waitForURL(`**${expectedRoute}`, { timeout: 15000 });
  
  console.log(`✅ Successfully logged in as ${role} and redirected to ${expectedRoute}`);
}

// Helper function to take screenshot with timestamp
async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `screenshots/health-protocol-corrected-${name}-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
}

// Helper function to wait and interact with elements
async function tryInteractWithElements(page: Page, selectors: string[], action: 'click' | 'check' | 'fill', value?: string) {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found element: ${selector}`);
        
        if (action === 'click') {
          await element.click();
          await page.waitForTimeout(1000); // Wait for any animations/responses
        } else if (action === 'check') {
          await element.check();
        } else if (action === 'fill' && value) {
          await element.fill(value);
        }
        
        return true;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  return false;
}

test.describe('Health Protocol Comprehensive Feature Test - Corrected', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for complex operations
    test.setTimeout(180000);
  });

  test('Complete Health Protocol Workflow - Trainer', async ({ page }) => {
    console.log('🚀 Starting comprehensive health protocol test - TRAINER WORKFLOW...');
    
    // ===== STEP 1: TRAINER LOGIN =====
    await test.step('Trainer Login', async () => {
      await login(page, TEST_ACCOUNTS.trainer.email, TEST_ACCOUNTS.trainer.password, 'trainer', '/protocols');
      await takeScreenshot(page, 'trainer-protocols-dashboard');
    });

    // ===== STEP 2: EXPLORE HEALTH PROTOCOL DASHBOARD =====
    await test.step('Explore Health Protocol Dashboard', async () => {
      console.log('📋 Exploring health protocol dashboard...');
      
      // Look for main dashboard elements
      const dashboardElements = [
        'h1', 'h2', 'h3', // Look for headings
        '[data-testid="dashboard"]',
        '.dashboard',
        '.health-protocols',
        'text=Health Protocol',
        'text=Protocol',
        'text=Dashboard',
        'button',
        '.card',
        '[role="main"]'
      ];
      
      console.log('🔍 Available elements on dashboard:');
      for (const selector of dashboardElements) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`  - Found ${elements.length} ${selector} element(s)`);
            
            // For buttons and headings, get their text content
            if (selector === 'button' || selector.includes('h1') || selector.includes('text=')) {
              for (let i = 0; i < Math.min(5, elements.length); i++) {
                try {
                  const text = await elements[i].innerText({ timeout: 500 });
                  if (text && text.trim()) {
                    console.log(`    * "${text.trim()}"`);
                  }
                } catch (e) {
                  // Skip this element
                }
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'dashboard-exploration');
    });

    // ===== STEP 3: TRY TO CREATE HEALTH PROTOCOL =====
    await test.step('Attempt to Create Health Protocol', async () => {
      console.log('🏥 Attempting to create health protocol...');
      
      const createSelectors = [
        'button:has-text("Create")',
        'button:has-text("New")',
        'button:has-text("Generate")',
        'button:has-text("Add")',
        '[data-testid="create-protocol"]',
        '[data-testid="new-protocol"]',
        '.create-btn',
        '.new-protocol-btn',
        'text=Create Protocol',
        'text=New Protocol',
        'text=Generate Protocol'
      ];
      
      const found = await tryInteractWithElements(page, createSelectors, 'click');
      
      if (found) {
        console.log('✅ Successfully clicked create button');
        await page.waitForTimeout(2000);
        
        // Look for protocol creation form
        const formSelectors = [
          'form',
          '[data-testid="protocol-form"]',
          '.protocol-form',
          'input',
          'select',
          'textarea'
        ];
        
        console.log('🔍 Looking for protocol creation form...');
        for (const selector of formSelectors) {
          try {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
              console.log(`  - Found ${elements.length} ${selector} element(s)`);
            }
          } catch (e) {
            // Continue
          }
        }
        
      } else {
        console.log('❌ Could not find create protocol button');
      }
      
      await takeScreenshot(page, 'protocol-creation-attempt');
    });

    // ===== STEP 4: LOOK FOR SPECIALIZED PROTOCOLS =====
    await test.step('Look for Specialized Protocols', async () => {
      console.log('🌟 Looking for specialized protocols...');
      
      const specializedSelectors = [
        'text=Longevity',
        'text=Parasite',
        'text=Cleanse',
        'text=Specialized',
        '[data-testid="longevity"]',
        '[data-testid="parasite"]',
        '.longevity',
        '.parasite',
        '.specialized-protocols',
        'button:has-text("Longevity")',
        'button:has-text("Parasite")'
      ];
      
      console.log('🔍 Specialized protocol elements found:');
      for (const selector of specializedSelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`  - Found ${elements.length} ${selector} element(s)`);
            
            // Try to interact with the first one
            try {
              const text = await elements[0].innerText({ timeout: 500 });
              console.log(`    * Text: "${text}"`);
            } catch (e) {
              // Skip text extraction
            }
          }
        } catch (e) {
          // Continue
        }
      }
      
      await tryInteractWithElements(page, specializedSelectors, 'click');
      await takeScreenshot(page, 'specialized-protocols-search');
    });

    // ===== STEP 5: TEST PDF EXPORT (if available) =====
    await test.step('Test PDF Export Features', async () => {
      console.log('📄 Looking for PDF export functionality...');
      
      const pdfSelectors = [
        'button:has-text("PDF")',
        'button:has-text("Export")',
        'button:has-text("Download")',
        'text=PDF',
        'text=Export',
        '[data-testid="pdf"]',
        '[data-testid="export"]',
        '.pdf-btn',
        '.export-btn'
      ];
      
      const found = await tryInteractWithElements(page, pdfSelectors, 'click');
      
      if (found) {
        console.log('✅ Found PDF export functionality');
        
        // Set up download handling
        page.on('download', download => {
          console.log(`📥 Download started: ${download.suggestedFilename()}`);
        });
        
        await page.waitForTimeout(3000); // Wait for any download
      } else {
        console.log('❌ No PDF export functionality found');
      }
      
      await takeScreenshot(page, 'pdf-export-test');
    });

    // ===== STEP 6: LOOK FOR CUSTOMER ASSIGNMENT =====
    await test.step('Look for Customer Assignment Features', async () => {
      console.log('👥 Looking for customer assignment features...');
      
      const assignSelectors = [
        'button:has-text("Assign")',
        'text=Customer',
        'text=Assign',
        'select[name*="customer"]',
        '[data-testid="assign"]',
        '[data-testid="customer"]',
        '.customer-selector',
        '.assign-btn'
      ];
      
      await tryInteractWithElements(page, assignSelectors, 'click');
      await takeScreenshot(page, 'customer-assignment-search');
    });

    console.log('✅ Trainer workflow exploration completed!');
  });

  test('Customer Workflow Test', async ({ page }) => {
    console.log('🚀 Starting customer workflow test...');
    
    await test.step('Customer Login', async () => {
      await login(page, TEST_ACCOUNTS.customer.email, TEST_ACCOUNTS.customer.password, 'customer', '/protocols');
      await takeScreenshot(page, 'customer-protocols-dashboard');
    });

    await test.step('Explore Customer Dashboard', async () => {
      console.log('👤 Exploring customer dashboard...');
      
      // Look for customer-specific elements
      const customerElements = [
        'text=Protocol',
        'text=Health',
        'text=Plan',
        'text=Your',
        'text=Assigned',
        '.protocol-card',
        '.assigned-protocol',
        '[data-testid="customer-protocol"]',
        'button',
        'h1', 'h2', 'h3'
      ];
      
      console.log('🔍 Customer dashboard elements:');
      for (const selector of customerElements) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`  - Found ${elements.length} ${selector} element(s)`);
            
            if (selector === 'button' || selector.includes('h') || selector.includes('text=')) {
              for (let i = 0; i < Math.min(3, elements.length); i++) {
                try {
                  const text = await elements[i].innerText({ timeout: 500 });
                  if (text && text.trim()) {
                    console.log(`    * "${text.trim()}"`);
                  }
                } catch (e) {
                  // Skip
                }
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'customer-dashboard-exploration');
    });

    console.log('✅ Customer workflow exploration completed!');
  });

  test('Admin Workflow Test', async ({ page }) => {
    console.log('🚀 Starting admin workflow test...');
    
    await test.step('Admin Login', async () => {
      await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password, 'admin', '/admin');
      await takeScreenshot(page, 'admin-dashboard');
    });

    await test.step('Explore Admin Dashboard', async () => {
      console.log('👑 Exploring admin dashboard...');
      
      const adminElements = [
        'text=Admin',
        'text=Management',
        'text=Users',
        'text=Dashboard',
        'button',
        '.admin',
        '[data-testid="admin"]',
        'h1', 'h2', 'h3'
      ];
      
      console.log('🔍 Admin dashboard elements:');
      for (const selector of adminElements) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`  - Found ${elements.length} ${selector} element(s)`);
          }
        } catch (e) {
          // Continue
        }
      }
      
      await takeScreenshot(page, 'admin-dashboard-exploration');
    });

    console.log('✅ Admin workflow exploration completed!');
  });

  test('Responsive Design Test', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, TEST_ACCOUNTS.trainer.email, TEST_ACCOUNTS.trainer.password, 'trainer', '/protocols');
    await takeScreenshot(page, 'mobile-responsive');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await takeScreenshot(page, 'tablet-responsive');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await takeScreenshot(page, 'desktop-responsive');
    
    console.log('✅ Responsive design test completed!');
  });

  test('Error Handling Test', async ({ page }) => {
    console.log('🧪 Testing error handling...');
    
    await test.step('Invalid Login Test', async () => {
      await page.goto(`${BASE_URL}/`);
      await page.fill('input[type="email"]', 'invalid@email.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'invalid-login-error');
      
      // Look for error messages
      const errorSelectors = [
        '.error',
        '.alert-danger',
        '[data-testid="error"]',
        'text=Invalid',
        'text=Error',
        'text=Failed'
      ];
      
      for (const selector of errorSelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`❌ Error message found: ${selector}`);
            const text = await elements[0].innerText({ timeout: 500 });
            console.log(`   Text: "${text}"`);
          }
        } catch (e) {
          // Continue
        }
      }
    });

    console.log('✅ Error handling test completed!');
  });
});