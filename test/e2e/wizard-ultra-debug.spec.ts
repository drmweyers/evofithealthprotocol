import { test, expect } from '@playwright/test';

test.describe('🔬 ULTRA DEBUG: Protocol Wizard Blank Screen Investigation', () => {
  const baseURL = 'http://localhost:3501';
  
  test('COMPREHENSIVE WIZARD DEBUG - Find the blank screen issue', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔬 ULTRA COMPREHENSIVE WIZARD DEBUG');
    console.log('='.repeat(80) + '\n');
    
    // Enable ALL console messages and errors
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        console.log('❌ JS ERROR:', msg.text());
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.log('❌ PAGE ERROR:', err.message);
      errors.push(err.message);
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    // STEP 1: Login
    console.log('📋 STEP 1: LOGIN');
    console.log('-'.repeat(40));
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // STEP 2: Navigate to protocols
    console.log('📋 STEP 2: NAVIGATE TO PROTOCOLS');
    console.log('-'.repeat(40));
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    const protocolsUrl = page.url();
    console.log(`Current URL: ${protocolsUrl}`);
    console.log('✅ On protocols page\n');
    
    // STEP 3: Find and click wizard button
    console.log('📋 STEP 3: FIND WIZARD BUTTON');
    console.log('-'.repeat(40));
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'before-wizard-click.png', fullPage: true });
    
    // Find all buttons and their text
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);
    
    // Find the wizard button
    const wizardButton = page.locator('button:has-text("Open Protocol Wizard")').first();
    const buttonExists = await wizardButton.count() > 0;
    
    if (!buttonExists) {
      console.log('❌ CRITICAL: "Open Protocol Wizard" button not found!');
      const allButtonTexts = await Promise.all(buttons.map(b => b.textContent()));
      console.log('Available buttons:', allButtonTexts);
      throw new Error('Wizard button not found');
    }
    
    const buttonVisible = await wizardButton.isVisible();
    const buttonEnabled = await wizardButton.isEnabled();
    console.log(`Button state: Visible=${buttonVisible}, Enabled=${buttonEnabled}`);
    
    // Click the button
    console.log('Clicking wizard button...');
    await wizardButton.click();
    console.log('✅ Button clicked\n');
    
    // STEP 4: Check if dialog opened
    console.log('📋 STEP 4: CHECK DIALOG STATE');
    console.log('-'.repeat(40));
    
    // Wait a moment for dialog to appear
    await page.waitForTimeout(2000);
    
    // Check for dialog
    const dialogCount = await page.locator('[role="dialog"]').count();
    console.log(`Dialog count: ${dialogCount}`);
    
    if (dialogCount === 0) {
      console.log('❌ CRITICAL: No dialog found after clicking button!');
      await page.screenshot({ path: 'no-dialog-found.png', fullPage: true });
      throw new Error('Dialog did not open');
    }
    
    // STEP 5: Analyze dialog content
    console.log('📋 STEP 5: ANALYZE DIALOG CONTENT');
    console.log('-'.repeat(40));
    
    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible();
    console.log(`Dialog visible: ${dialogVisible}`);
    
    // Get dialog content
    const dialogText = await dialog.textContent();
    console.log(`Dialog content length: ${dialogText?.length || 0} characters`);
    
    if (!dialogText || dialogText.trim().length === 0) {
      console.log('❌ CRITICAL: Dialog is completely empty!');
    } else if (dialogText.length < 50) {
      console.log('⚠️  WARNING: Dialog has minimal content');
      console.log(`Content: "${dialogText}"`);
    } else {
      console.log('✅ Dialog has content');
      console.log(`First 200 chars: "${dialogText.substring(0, 200)}..."`);
    }
    
    // STEP 6: Check for wizard component
    console.log('\n📋 STEP 6: CHECK FOR WIZARD COMPONENT');
    console.log('-'.repeat(40));
    
    // Look for wizard-specific elements
    const wizardElements = {
      'Step indicator': await page.locator('text=/Step \\d+ of \\d+/').count(),
      'Enhanced Protocol Wizard title': await page.locator('text="Enhanced Protocol Wizard"').count(),
      'Client Selection': await page.locator('text="Client Selection"').count(),
      'Select Client': await page.locator('text="Select Client"').count(),
      'Next button': await page.locator('[role="dialog"] button:has-text("Next")').count(),
      'Cancel button': await page.locator('[role="dialog"] button:has-text("Cancel")').count(),
      'Any h3 heading': await page.locator('[role="dialog"] h3').count(),
      'Any form': await page.locator('[role="dialog"] form').count(),
      'Any input': await page.locator('[role="dialog"] input').count(),
      'Any button': await page.locator('[role="dialog"] button').count(),
    };
    
    console.log('Wizard element counts:');
    for (const [element, count] of Object.entries(wizardElements)) {
      const status = count > 0 ? '✅' : '❌';
      console.log(`  ${status} ${element}: ${count}`);
    }
    
    // STEP 7: Check dialog dimensions
    console.log('\n📋 STEP 7: CHECK DIALOG DIMENSIONS');
    console.log('-'.repeat(40));
    
    const dialogBox = await dialog.boundingBox();
    if (dialogBox) {
      console.log(`Dialog dimensions: ${dialogBox.width}x${dialogBox.height}`);
      console.log(`Dialog position: (${dialogBox.x}, ${dialogBox.y})`);
      
      if (dialogBox.width < 100 || dialogBox.height < 100) {
        console.log('⚠️  WARNING: Dialog is very small!');
      }
    } else {
      console.log('❌ Could not get dialog dimensions');
    }
    
    // STEP 8: Check for render errors
    console.log('\n📋 STEP 8: CHECK FOR RENDER ERRORS');
    console.log('-'.repeat(40));
    
    // Check if wizard component exists but is hidden
    const wizardComponent = page.locator('.protocol-wizard, [data-testid="protocol-wizard"], #protocol-wizard').first();
    const wizardExists = await wizardComponent.count() > 0;
    
    if (wizardExists) {
      const wizardVisible = await wizardComponent.isVisible();
      console.log(`Wizard component exists: ${wizardExists}, Visible: ${wizardVisible}`);
      
      if (!wizardVisible) {
        // Check computed styles
        const styles = await wizardComponent.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            zIndex: computed.zIndex,
            width: computed.width,
            height: computed.height
          };
        });
        console.log('Component styles:', styles);
      }
    }
    
    // STEP 9: Try to interact with wizard
    console.log('\n📋 STEP 9: TRY TO INTERACT');
    console.log('-'.repeat(40));
    
    // Try to find any clickable element in dialog
    const clickableInDialog = await page.locator('[role="dialog"] button, [role="dialog"] [role="button"], [role="dialog"] input').count();
    console.log(`Clickable elements in dialog: ${clickableInDialog}`);
    
    if (clickableInDialog > 0) {
      // Try to click first button
      try {
        const firstButton = page.locator('[role="dialog"] button').first();
        const buttonText = await firstButton.textContent();
        console.log(`Attempting to click button: "${buttonText}"`);
        await firstButton.click({ timeout: 5000 });
        console.log('✅ Button clicked successfully');
        
        // Check if dialog content changed
        await page.waitForTimeout(1000);
        const newDialogText = await dialog.textContent();
        if (newDialogText !== dialogText) {
          console.log('✅ Dialog content changed after interaction');
        } else {
          console.log('⚠️  Dialog content unchanged after interaction');
        }
      } catch (err) {
        console.log('❌ Could not interact with dialog elements:', err.message);
      }
    }
    
    // STEP 10: Final screenshots
    console.log('\n📋 STEP 10: CAPTURE EVIDENCE');
    console.log('-'.repeat(40));
    
    await page.screenshot({ path: 'wizard-final-state.png', fullPage: true });
    console.log('📸 Screenshot saved: wizard-final-state.png');
    
    // Take dialog-only screenshot if possible
    if (dialogCount > 0) {
      await dialog.screenshot({ path: 'dialog-only.png' });
      console.log('📸 Dialog screenshot saved: dialog-only.png');
    }
    
    // STEP 11: Console error summary
    console.log('\n📋 STEP 11: ERROR SUMMARY');
    console.log('-'.repeat(40));
    
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} JavaScript errors:`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // STEP 12: Diagnosis
    console.log('\n' + '='.repeat(80));
    console.log('🔬 DIAGNOSIS');
    console.log('='.repeat(80));
    
    if (dialogCount === 0) {
      console.log('❌ PROBLEM: Dialog is not opening at all');
      console.log('LIKELY CAUSE: Dialog wrapper not properly implemented');
    } else if (!dialogText || dialogText.length < 50) {
      console.log('❌ PROBLEM: Dialog opens but is blank/minimal');
      console.log('LIKELY CAUSES:');
      console.log('  1. Wizard component not rendering');
      console.log('  2. Conditional rendering failing');
      console.log('  3. Component error preventing render');
      console.log('  4. CSS hiding the content');
    } else if (wizardElements['Step indicator'] === 0) {
      console.log('⚠️  PROBLEM: Dialog has content but wizard not properly loaded');
      console.log('LIKELY CAUSE: ProtocolWizardEnhanced component issue');
    } else {
      console.log('✅ Wizard appears to be working');
    }
    
    // Final assertion
    const wizardWorking = dialogCount > 0 && dialogText && dialogText.length > 100 && wizardElements['Step indicator'] > 0;
    
    if (!wizardWorking) {
      console.log('\n❌❌❌ WIZARD IS NOT WORKING PROPERLY ❌❌❌');
      throw new Error('Wizard is not functioning correctly - see diagnosis above');
    } else {
      console.log('\n✅✅✅ WIZARD IS WORKING ✅✅✅');
    }
  });
});