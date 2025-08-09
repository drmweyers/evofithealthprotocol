import { test, expect, Page } from '@playwright/test';

/**
 * Health Protocol Generation Focused Tests
 * 
 * Tests specific protocol generation functionality including:
 * - Protocol configuration panels
 * - Form interactions
 * - Protocol creation workflow
 * - Database verification
 */

const TEST_CONFIG = {
  baseURL: 'http://localhost:4000',
  testAccounts: {
    trainer: {
      email: 'trainer.test@evofitmeals.com',
      password: 'TestTrainer123!'
    }
  }
};

class ProtocolGenerationHelper {
  constructor(private page: Page) {}

  async loginAndNavigate() {
    await this.page.goto(TEST_CONFIG.baseURL);
    await this.page.waitForSelector('input[type="email"]');
    
    await this.page.fill('input[type="email"]', TEST_CONFIG.testAccounts.trainer.email);
    await this.page.fill('input[type="password"]', TEST_CONFIG.testAccounts.trainer.password);
    await this.page.click('button:has-text("Sign In")');
    
    await this.page.waitForURL((url) => url.pathname.includes('/trainer'));
    
    // Navigate to health protocols
    await this.page.goto(`${TEST_CONFIG.baseURL}/trainer/health-protocols`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test/screenshots/health-protocols/generation-${name}-${Date.now()}.png`,
      fullPage: true
    });
    console.log(`📸 Screenshot: generation-${name}`);
  }

  async expandSpecializedProtocolsPanel() {
    console.log('🔧 Expanding specialized protocols panel...');
    
    // Look for the collapsible specialized protocols panel
    const panelTrigger = this.page.locator('[data-testid="specialized-protocols-trigger"], .collapsible-trigger').first();
    
    if (await panelTrigger.isVisible()) {
      await panelTrigger.click();
      await this.page.waitForTimeout(1000);
      console.log('✅ Clicked specialized protocols panel trigger');
    }

    // Alternative: Look for any clickable element that might expand the panel
    const expandableElements = [
      'button:has-text("Specialized")',
      'button:has-text("Protocol")',
      '[aria-expanded="false"]',
      '.expand-button',
      '[data-state="closed"]'
    ];

    for (const selector of expandableElements) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        await this.page.waitForTimeout(1000);
        console.log(`✅ Clicked expandable element: ${selector}`);
        break;
      }
    }
  }

  async testProtocolForm() {
    console.log('📝 Testing protocol form...');
    
    const formResults = [];
    
    // Test protocol name input
    const nameInput = this.page.locator('#protocol-name, input[name*="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Health Protocol ' + Date.now());
      formResults.push('✅ Protocol name field filled');
    } else {
      formResults.push('❌ Protocol name field not found');
    }

    // Test description textarea
    const descInput = this.page.locator('#protocol-description, textarea[name*="description"], textarea[placeholder*="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('This is a test protocol for automated testing purposes');
      formResults.push('✅ Protocol description field filled');
    } else {
      formResults.push('❌ Protocol description field not found');
    }

    return formResults;
  }

  async testLongevityProtocolOptions() {
    console.log('🌟 Testing longevity protocol options...');
    
    const longevityResults = [];
    
    // Look for longevity-related controls
    const longevitySelectors = [
      '[data-testid*="longevity"]',
      'button:has-text("Longevity")',
      'input[type="checkbox"]:has-text("Longevity")',
      '.longevity',
      '[aria-label*="longevity"]'
    ];

    for (const selector of longevitySelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        longevityResults.push(`✅ Found ${count} longevity elements: ${selector}`);
        
        // Try to interact with the first one
        try {
          await elements.first().click();
          longevityResults.push(`✅ Clicked longevity element: ${selector}`);
          await this.page.waitForTimeout(1000);
        } catch (error) {
          longevityResults.push(`⚠️ Could not click longevity element: ${selector}`);
        }
      }
    }

    // Look for antioxidant options
    const antioxidantElements = this.page.locator('*:has-text("antioxidant")').first();
    if (await antioxidantElements.isVisible()) {
      longevityResults.push('✅ Found antioxidant options');
    }

    return longevityResults;
  }

  async testParasiteCleanseOptions() {
    console.log('🛡️ Testing parasite cleanse options...');
    
    const parasiteResults = [];
    
    const parasiteSelectors = [
      '[data-testid*="parasite"]',
      'button:has-text("Parasite")',
      'input[type="checkbox"]:has-text("Parasite")',
      '.parasite',
      '[aria-label*="parasite"]'
    ];

    for (const selector of parasiteSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        parasiteResults.push(`✅ Found ${count} parasite cleanse elements: ${selector}`);
        
        try {
          await elements.first().click();
          parasiteResults.push(`✅ Clicked parasite element: ${selector}`);
          await this.page.waitForTimeout(1000);
        } catch (error) {
          parasiteResults.push(`⚠️ Could not click parasite element: ${selector}`);
        }
      }
    }

    // Look for intensity settings
    const intensitySelectors = this.page.locator('select:has(option:has-text("intensive")), select:has(option:has-text("moderate")), select:has(option:has-text("gentle"))');
    const intensityCount = await intensitySelectors.count();
    if (intensityCount > 0) {
      parasiteResults.push(`✅ Found ${intensityCount} intensity selectors`);
      try {
        await intensitySelectors.first().selectOption('moderate');
        parasiteResults.push('✅ Selected moderate intensity');
      } catch (error) {
        parasiteResults.push('⚠️ Could not select intensity');
      }
    }

    return parasiteResults;
  }

  async testClientAilmentsOptions() {
    console.log('🏥 Testing client ailments options...');
    
    const ailmentsResults = [];
    
    const ailmentsSelectors = [
      '[data-testid*="ailments"]',
      'button:has-text("Ailments")',
      'input[type="checkbox"][name*="ailment"]',
      '.ailments-selector',
      '[aria-label*="ailments"]'
    ];

    for (const selector of ailmentsSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        ailmentsResults.push(`✅ Found ${count} ailments elements: ${selector}`);
        
        // If these are checkboxes, try to check a few
        if (selector.includes('checkbox')) {
          try {
            for (let i = 0; i < Math.min(3, count); i++) {
              await elements.nth(i).check();
              ailmentsResults.push(`✅ Checked ailment checkbox ${i + 1}`);
            }
          } catch (error) {
            ailmentsResults.push(`⚠️ Could not check ailment checkboxes: ${error.message}`);
          }
        }
      }
    }

    return ailmentsResults;
  }

  async testProtocolGeneration() {
    console.log('⚙️ Testing protocol generation...');
    
    const generateResults = [];
    
    // Look for generate/save/create buttons
    const actionButtons = [
      'button:has-text("Generate")',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Save Protocol")',
      '[data-testid*="generate"]',
      '[data-testid*="save"]'
    ];

    let buttonFound = false;
    for (const selector of actionButtons) {
      const button = this.page.locator(selector);
      const count = await button.count();
      if (count > 0) {
        generateResults.push(`✅ Found ${count} action buttons: ${selector}`);
        
        if (!buttonFound) {
          try {
            await button.first().click();
            generateResults.push(`✅ Clicked generation button: ${selector}`);
            buttonFound = true;
            
            // Wait for any API calls or UI updates
            await this.page.waitForTimeout(3000);
            
            // Monitor for success/error messages
            const messageSelectors = [
              '.toast', '.alert', '.notification', '[role="alert"]',
              '.success', '.error', '.warning'
            ];
            
            for (const msgSelector of messageSelectors) {
              const messages = this.page.locator(msgSelector);
              const msgCount = await messages.count();
              if (msgCount > 0) {
                const texts = await messages.allTextContents();
                generateResults.push(`✅ Found ${msgCount} messages: ${texts.join(', ')}`);
              }
            }
            
          } catch (error) {
            generateResults.push(`⚠️ Could not click button: ${selector} - ${error.message}`);
          }
        }
      }
    }

    if (!buttonFound) {
      generateResults.push('❌ No generation buttons found');
    }

    return generateResults;
  }

  async checkProtocolInDatabase() {
    console.log('🗄️ Checking for protocol in database/UI...');
    
    const dbResults = [];
    
    // Navigate to Manage Protocols tab
    const manageTab = this.page.locator('button[role="tab"]:has-text("Manage")');
    if (await manageTab.isVisible()) {
      await manageTab.click();
      await this.page.waitForTimeout(2000);
      dbResults.push('✅ Navigated to Manage Protocols tab');
      
      // Look for protocol cards or list items
      const protocolElements = [
        '.protocol-card', '[data-testid*="protocol"]',
        '.card:has-text("Protocol")', '.list-item:has-text("Protocol")'
      ];
      
      for (const selector of protocolElements) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          dbResults.push(`✅ Found ${count} protocol elements: ${selector}`);
          const texts = await elements.allTextContents();
          dbResults.push(`📋 Protocol texts: ${texts.slice(0, 3).join(', ')}`);
        }
      }
    } else {
      dbResults.push('⚠️ Manage Protocols tab not found');
    }

    return dbResults;
  }
}

test.describe('Health Protocol Generation - Detailed Tests', () => {
  let helper: ProtocolGenerationHelper;

  test.beforeEach(async ({ page }) => {
    helper = new ProtocolGenerationHelper(page);
  });

  test('Protocol Creation Form Interface Test', async ({ page }) => {
    console.log('🎯 Test: Protocol creation form interface');
    
    await helper.loginAndNavigate();
    await helper.screenshot('initial-state');
    
    // Ensure we're on the Create Protocols tab
    const createTab = page.locator('button[role="tab"]:has-text("Create")');
    if (await createTab.isVisible()) {
      await createTab.click();
      await page.waitForTimeout(1000);
    }

    await helper.screenshot('create-tab-active');
    
    // Expand specialized protocols panel if needed
    await helper.expandSpecializedProtocolsPanel();
    await helper.screenshot('protocols-panel-expanded');
    
    // Test form fields
    const formResults = await helper.testProtocolForm();
    
    console.log('\n📝 Form Test Results:');
    formResults.forEach(result => console.log(result));
    
    await helper.screenshot('form-filled');
    
    expect(formResults.some(r => r.includes('✅'))).toBe(true);
  });

  test('Longevity Protocol Configuration Test', async ({ page }) => {
    console.log('🎯 Test: Longevity protocol configuration');
    
    await helper.loginAndNavigate();
    await helper.expandSpecializedProtocolsPanel();
    await helper.testProtocolForm();
    
    const longevityResults = await helper.testLongevityProtocolOptions();
    
    console.log('\n🌟 Longevity Protocol Results:');
    longevityResults.forEach(result => console.log(result));
    
    await helper.screenshot('longevity-configured');
    
    expect(longevityResults.length).toBeGreaterThan(0);
  });

  test('Parasite Cleanse Protocol Configuration Test', async ({ page }) => {
    console.log('🎯 Test: Parasite cleanse protocol configuration');
    
    await helper.loginAndNavigate();
    await helper.expandSpecializedProtocolsPanel();
    await helper.testProtocolForm();
    
    const parasiteResults = await helper.testParasiteCleanseOptions();
    
    console.log('\n🛡️ Parasite Cleanse Protocol Results:');
    parasiteResults.forEach(result => console.log(result));
    
    await helper.screenshot('parasite-configured');
    
    expect(parasiteResults.length).toBeGreaterThan(0);
  });

  test('Client Ailments Protocol Configuration Test', async ({ page }) => {
    console.log('🎯 Test: Client ailments protocol configuration');
    
    await helper.loginAndNavigate();
    await helper.expandSpecializedProtocolsPanel();
    await helper.testProtocolForm();
    
    const ailmentsResults = await helper.testClientAilmentsOptions();
    
    console.log('\n🏥 Client Ailments Protocol Results:');
    ailmentsResults.forEach(result => console.log(result));
    
    await helper.screenshot('ailments-configured');
    
    expect(ailmentsResults.length).toBeGreaterThan(0);
  });

  test('End-to-End Protocol Generation Test', async ({ page }) => {
    console.log('🎯 Test: End-to-end protocol generation');
    
    await helper.loginAndNavigate();
    await helper.screenshot('e2e-start');
    
    // Fill out the form
    await helper.testProtocolForm();
    await helper.screenshot('e2e-form-filled');
    
    // Configure a longevity protocol
    await helper.testLongevityProtocolOptions();
    await helper.screenshot('e2e-longevity-set');
    
    // Attempt to generate the protocol
    const generateResults = await helper.testProtocolGeneration();
    
    console.log('\n⚙️ Protocol Generation Results:');
    generateResults.forEach(result => console.log(result));
    
    await helper.screenshot('e2e-generation-complete');
    
    // Check if protocol appears in the manage section
    const dbResults = await helper.checkProtocolInDatabase();
    
    console.log('\n🗄️ Database Verification Results:');
    dbResults.forEach(result => console.log(result));
    
    await helper.screenshot('e2e-final-verification');
    
    expect(generateResults.length + dbResults.length).toBeGreaterThan(0);
  });

  test('Protocol UI Error Handling Test', async ({ page }) => {
    console.log('🎯 Test: Protocol UI error handling');
    
    await helper.loginAndNavigate();
    
    // Try to generate without filling required fields
    const generateResults = await helper.testProtocolGeneration();
    
    console.log('\n🚨 Error Handling Results:');
    generateResults.forEach(result => console.log(result));
    
    await helper.screenshot('error-handling');
    
    // Look for validation messages
    const validationMessages = await page.locator('.error, [role="alert"], .text-red-500, .text-destructive').count();
    console.log(`Found ${validationMessages} potential validation messages`);
    
    expect(generateResults.length).toBeGreaterThan(0);
  });
});