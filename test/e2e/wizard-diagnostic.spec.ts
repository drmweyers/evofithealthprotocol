import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3501';

test.describe('Protocol Wizard Diagnostic', () => {
  test.setTimeout(60000);
  
  test('Diagnose wizard opening issue', async ({ page }) => {
    console.log('\n🔍 DIAGNOSING PROTOCOL WIZARD ISSUE\n');
    
    // Enable all console messages
    page.on('console', msg => console.log(`Browser: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error('Page error:', err));
    page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`HTTP ${response.status()} - ${response.url()}`);
      }
    });
    
    // Login
    console.log('1. Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(trainer|protocols)/, { timeout: 10000 });
    console.log(`✓ Logged in - URL: ${page.url()}`);
    
    // Navigate to protocols
    console.log('\n2. Navigating to protocols page...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    console.log(`✓ On protocols page - URL: ${page.url()}`);
    
    // Take screenshot
    await page.screenshot({ path: 'diagnostic-protocols-page.png', fullPage: true });
    
    // List all buttons on the page
    console.log('\n3. Finding all buttons on page...');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      const isDisabled = await buttons[i].isDisabled();
      console.log(`  Button ${i+1}: "${text?.trim()}" - Visible: ${isVisible}, Disabled: ${isDisabled}`);
    }
    
    // Look for wizard-related elements
    console.log('\n4. Looking for wizard-related elements...');
    const wizardSelectors = [
      'button:has-text("Open Protocol Wizard")',
      'button:has-text("Create Protocol")',
      'button:has-text("New Protocol")',
      'button:has-text("Protocol Wizard")',
      '[data-testid*="wizard"]',
      '[id*="wizard"]',
      'button[aria-label*="wizard"]'
    ];
    
    for (const selector of wizardSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          console.log(`  Found: ${selector} - Visible: ${isVisible}, Text: "${text?.trim()}"`);
        }
      } catch (e) {
        // Ignore errors for non-existent selectors
      }
    }
    
    // Check for any dialogs or modals already open
    console.log('\n5. Checking for dialogs/modals...');
    const dialogs = await page.locator('[role="dialog"]').count();
    const modals = await page.locator('.modal, [class*="modal"]').count();
    console.log(`  Dialogs: ${dialogs}, Modals: ${modals}`);
    
    // Try to find and click the wizard button
    console.log('\n6. Attempting to open wizard...');
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")').first();
    
    if (await wizardButton.count() > 0) {
      console.log('  Found wizard button!');
      const buttonState = {
        visible: await wizardButton.isVisible(),
        enabled: await wizardButton.isEnabled(),
        disabled: await wizardButton.isDisabled()
      };
      console.log(`  Button state:`, buttonState);
      
      if (buttonState.visible && buttonState.enabled) {
        console.log('  Clicking wizard button...');
        await wizardButton.click();
        
        // Wait a moment
        await page.waitForTimeout(3000);
        
        // Check what happened
        const dialogAfter = await page.locator('[role="dialog"]').count();
        const currentUrl = page.url();
        console.log(`  After click - Dialogs: ${dialogAfter}, URL: ${currentUrl}`);
        
        // Take screenshot
        await page.screenshot({ path: 'diagnostic-after-click.png', fullPage: true });
        
        // Check if wizard opened
        if (dialogAfter > 0) {
          console.log('✅ WIZARD OPENED SUCCESSFULLY!');
          
          // Get wizard content
          const wizardContent = await page.locator('[role="dialog"]').textContent();
          console.log(`  Wizard content preview: ${wizardContent?.substring(0, 200)}...`);
        } else {
          console.log('❌ WIZARD DID NOT OPEN');
          
          // Check for error messages
          const errors = await page.locator('.error, .alert, [role="alert"]').all();
          for (const error of errors) {
            const errorText = await error.textContent();
            console.log(`  Error: ${errorText}`);
          }
        }
      } else {
        console.log('❌ Wizard button is not clickable!');
      }
    } else {
      console.log('❌ No wizard button found!');
      
      // Get page text to see what's there
      const pageText = await page.locator('body').textContent();
      console.log('\nPage content preview:');
      console.log(pageText?.substring(0, 500));
    }
    
    console.log('\n7. Final diagnostics...');
    // Check React errors
    const reactRoot = await page.evaluate(() => {
      const root = document.querySelector('#root');
      return root ? root.innerHTML.substring(0, 500) : 'No root element';
    });
    console.log('React root HTML:', reactRoot);
  });
});