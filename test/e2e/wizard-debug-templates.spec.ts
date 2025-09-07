import { test, expect } from '@playwright/test';

test.describe('🔍 WIZARD TEMPLATE DEBUG', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Debug why templates are not showing', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEBUGGING WIZARD TEMPLATE SELECTION');
    console.log('='.repeat(80) + '\n');
    
    // Login
    console.log('📋 Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Open wizard
    console.log('📋 Opening wizard...');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Select customer
    console.log('📋 Selecting customer...');
    await page.waitForTimeout(1000);
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    await customerCards.first().click();
    console.log('✅ Customer selected\n');
    
    // Click Next to go to template selection
    await page.locator('[role="dialog"] button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    
    // Analyze Step 2 - Template Selection
    console.log('📋 ANALYZING STEP 2 - TEMPLATE SELECTION');
    console.log('-'.repeat(40));
    
    // Get dialog content
    const dialogContent = await page.locator('[role="dialog"]').textContent();
    console.log(`Dialog content length: ${dialogContent?.length} characters\n`);
    
    // Check what step we're on
    const stepMatch = dialogContent?.match(/Step (\d+) of (\d+)/);
    if (stepMatch) {
      console.log(`Currently on: Step ${stepMatch[1]} of ${stepMatch[2]}\n`);
    }
    
    // Look for template-related text
    console.log('Looking for template indicators:');
    const hasTemplateText = dialogContent?.includes('Template') || dialogContent?.includes('template');
    const hasChooseText = dialogContent?.includes('Choose') || dialogContent?.includes('Select');
    const hasProtocolType = dialogContent?.includes('Weight Loss') || 
                           dialogContent?.includes('Muscle') || 
                           dialogContent?.includes('Energy');
    
    console.log(`  Has "Template" text: ${hasTemplateText}`);
    console.log(`  Has "Choose/Select" text: ${hasChooseText}`);
    console.log(`  Has protocol types: ${hasProtocolType}\n`);
    
    // Look for different button selectors
    console.log('Searching for template selection elements:');
    
    // Try various selectors for template buttons
    const selectors = [
      '[role="dialog"] button.p-4',
      '[role="dialog"] button.border',
      '[role="dialog"] button[class*="rounded"]',
      '[role="dialog"] div.cursor-pointer',
      '[role="dialog"] [class*="card"]',
      '[role="dialog"] [class*="template"]',
      '[role="dialog"] button:not(:has-text("Next")):not(:has-text("Back"))',
    ];
    
    for (const selector of selectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  ✅ Found ${count} elements with selector: ${selector}`);
        
        // Get text from first element
        const firstText = await elements.first().textContent();
        console.log(`     First element text: ${firstText?.substring(0, 50)}...`);
      }
    }
    
    // Check for loading indicators
    console.log('\nChecking for loading states:');
    const hasSpinner = await page.locator('[role="dialog"] [class*="spinner"]').count();
    const hasLoading = dialogContent?.includes('Loading') || dialogContent?.includes('loading');
    console.log(`  Spinner elements: ${hasSpinner}`);
    console.log(`  Loading text: ${hasLoading}`);
    
    // Check for error messages
    console.log('\nChecking for errors:');
    const hasError = dialogContent?.includes('Error') || dialogContent?.includes('error');
    const hasFailed = dialogContent?.includes('Failed') || dialogContent?.includes('failed');
    console.log(`  Error text: ${hasError}`);
    console.log(`  Failed text: ${hasFailed}`);
    
    // Try to find any clickable elements
    console.log('\nAll visible buttons in dialog:');
    const allButtons = page.locator('[role="dialog"] button:visible');
    const buttonCount = await allButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await allButtons.nth(i).textContent();
      const isEnabled = await allButtons.nth(i).isEnabled();
      console.log(`  ${i + 1}. "${buttonText?.trim()}" (Enabled: ${isEnabled})`);
    }
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('\n⚠️ Browser console error:', msg.text());
      }
    });
    
    // Wait a bit to catch any console errors
    await page.waitForTimeout(2000);
    
    // Try to manually select a template if possible
    console.log('\n📋 ATTEMPTING MANUAL TEMPLATE SELECTION');
    console.log('-'.repeat(40));
    
    // Look for any clickable area that might be a template
    const clickableAreas = page.locator('[role="dialog"] div.p-4, [role="dialog"] div.border');
    const clickableCount = await clickableAreas.count();
    
    if (clickableCount > 0) {
      console.log(`Found ${clickableCount} potential template areas`);
      
      // Try clicking the first one
      await clickableAreas.first().click();
      await page.waitForTimeout(1000);
      
      // Check if Next button is now enabled
      const nextButton = page.locator('[role="dialog"] button:has-text("Next")');
      const isNextEnabled = await nextButton.isEnabled();
      console.log(`Next button enabled after click: ${isNextEnabled}`);
      
      if (isNextEnabled) {
        console.log('✅ Template selection worked!');
        
        // Try to advance
        await nextButton.click();
        await page.waitForTimeout(1500);
        
        const newContent = await page.locator('[role="dialog"]').textContent();
        const newStep = newContent?.match(/Step (\d+)/)?.[1];
        console.log(`Advanced to Step ${newStep}`);
      }
    } else {
      console.log('❌ No clickable template areas found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'wizard-template-debug.png', fullPage: true });
    console.log('\n📸 Screenshot saved: wizard-template-debug.png');
    
    // Final diagnosis
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DIAGNOSIS');
    console.log('='.repeat(80));
    
    if (buttonCount <= 2) {
      console.log('❌ PROBLEM: No template buttons are rendering');
      console.log('   Only navigation buttons (Next/Back) are present');
      console.log('   The template selection UI is not loading');
    } else if (!hasProtocolType) {
      console.log('❌ PROBLEM: Template content is not loading');
      console.log('   The step container is present but empty');
    } else {
      console.log('⚠️ Templates may be present but not interactive');
    }
  });
});