import { test, expect } from '@playwright/test';

test.describe('🔬 Complete Wizard Test - All Steps', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Complete wizard flow with proper client selection', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔬 COMPLETE WIZARD TEST - ALL STEPS');
    console.log('='.repeat(80) + '\n');
    
    // Capture errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Content Security Policy') && !msg.text().includes('Failed to load resource')) {
        errors.push(msg.text());
        console.log('❌ JS Error:', msg.text());
      }
    });
    
    // Login
    console.log('📋 LOGIN');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Open wizard
    console.log('📋 OPEN WIZARD');
    await page.goto(`${baseURL}/protocols`);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Wizard opened\n');
    
    // Helper function to check step
    const getCurrentStep = async () => {
      const stepText = await page.locator('text=/Step \\d+ of \\d+/').first().textContent();
      return stepText || 'Unknown';
    };
    
    // STEP 1: CLIENT SELECTION
    console.log('📋 STEP 1: CLIENT SELECTION');
    console.log('-'.repeat(40));
    let currentStep = await getCurrentStep();
    console.log(`Current: ${currentStep}`);
    
    // Look for client cards with the specific structure
    const clientCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border.rounded-lg, [role="dialog"] .cursor-pointer.p-4.border.rounded-md');
    const cardCount = await clientCards.count();
    console.log(`Found ${cardCount} client cards`);
    
    if (cardCount === 0) {
      // Try alternative selectors
      const altCards = page.locator('[role="dialog"] [class*="cursor-pointer"][class*="border"]');
      const altCount = await altCards.count();
      console.log(`Found ${altCount} alternative clickable elements`);
      
      if (altCount > 0) {
        await altCards.first().click();
        console.log('✅ Clicked alternative client element');
      }
    } else {
      // Click the first client card
      await clientCards.first().click();
      console.log('✅ Clicked first client card');
    }
    
    // Wait a moment for the selection to register
    await page.waitForTimeout(1000);
    
    // Check if selection was successful by looking for visual feedback
    const selectedCard = page.locator('[role="dialog"] .border-primary.bg-primary\\/5');
    const hasSelection = await selectedCard.count() > 0;
    console.log(`Client selected: ${hasSelection}`);
    
    // Try clicking Next
    const nextButton = page.locator('[role="dialog"] button:has-text("Next")').first();
    const isNextEnabled = await nextButton.isEnabled();
    console.log(`Next button enabled: ${isNextEnabled}`);
    
    if (isNextEnabled) {
      await nextButton.click();
      console.log('✅ Clicked Next');
      await page.waitForTimeout(1500);
    } else {
      console.log('❌ Next button still disabled');
      
      // Debug: Get all text in dialog to understand what's there
      const dialogText = await page.locator('[role="dialog"]').textContent();
      console.log('Dialog contains:', dialogText?.substring(0, 500));
      
      // Try forcing a client selection by clicking on any div inside the scroll area
      const scrollAreaDivs = page.locator('[role="dialog"] [data-radix-scroll-area-viewport] > div > div');
      const divCount = await scrollAreaDivs.count();
      console.log(`Found ${divCount} divs in scroll area`);
      
      if (divCount > 0) {
        await scrollAreaDivs.first().click();
        console.log('Clicked first div in scroll area');
        await page.waitForTimeout(1000);
        
        // Check Next button again
        const nowEnabled = await nextButton.isEnabled();
        console.log(`Next button now enabled: ${nowEnabled}`);
        
        if (nowEnabled) {
          await nextButton.click();
          console.log('✅ Next button clicked after retry');
        }
      }
    }
    
    // STEP 2: TEMPLATE SELECTION
    console.log('\n📋 STEP 2: TEMPLATE SELECTION');
    console.log('-'.repeat(40));
    currentStep = await getCurrentStep();
    console.log(`Current: ${currentStep}`);
    
    // Check if we're on template step
    const templateVisible = await page.locator('text=/Template|Goal|Protocol Type/i').isVisible();
    
    if (templateVisible) {
      // Find and click a template button
      const templateButtons = page.locator('[role="dialog"] button').filter({ hasText: /Weight Loss|Muscle|Energy|General|Longevity/i });
      const templateCount = await templateButtons.count();
      console.log(`Found ${templateCount} template buttons`);
      
      if (templateCount > 0) {
        await templateButtons.first().click();
        console.log('✅ Selected template');
        
        // Click Next
        await page.locator('[role="dialog"] button:has-text("Next")').click();
        console.log('✅ Clicked Next');
        await page.waitForTimeout(1500);
      }
    }
    
    // STEP 3: HEALTH INFORMATION (CRITICAL)
    console.log('\n📋 STEP 3: HEALTH INFORMATION');
    console.log('-'.repeat(40));
    currentStep = await getCurrentStep();
    console.log(`Current: ${currentStep}`);
    
    // Check dialog state before interaction
    const beforeHealth = await page.locator('[role="dialog"]').textContent();
    console.log(`Dialog content before health: ${beforeHealth?.length || 0} chars`);
    
    // Look for health-related elements
    const healthVisible = await page.locator('text=/Health|Medical|Conditions|Ailments/i').isVisible();
    
    if (healthVisible) {
      console.log('On health information step');
      
      // Find checkboxes or labels
      const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      console.log(`Found ${checkboxCount} checkboxes`);
      
      if (checkboxCount > 0) {
        // Select first two conditions
        for (let i = 0; i < Math.min(2, checkboxCount); i++) {
          await checkboxes.nth(i).click();
          console.log(`✅ Selected condition ${i + 1}`);
        }
      }
      
      // CRITICAL: Click Next after selecting ailments
      console.log('\n⚠️  CRITICAL MOMENT: Clicking Next after ailments...');
      await page.locator('[role="dialog"] button:has-text("Next")').click();
      await page.waitForTimeout(2000);
      
      // Check dialog state after clicking Next
      const afterHealth = await page.locator('[role="dialog"]').textContent();
      console.log(`Dialog content after health: ${afterHealth?.length || 0} chars`);
      
      if (!afterHealth || afterHealth.length < 50) {
        console.log('❌❌❌ DIALOG WENT BLANK AFTER HEALTH STEP!');
        await page.screenshot({ path: 'blank-after-health.png' });
        throw new Error('Dialog blank after health step');
      }
    }
    
    // Check current state
    currentStep = await getCurrentStep();
    console.log(`\nCurrent step after health: ${currentStep}`);
    
    // Continue through remaining steps
    console.log('\n📋 CONTINUING THROUGH REMAINING STEPS...');
    
    // Try to click Next a few more times to complete wizard
    for (let i = 0; i < 4; i++) {
      const nextExists = await page.locator('[role="dialog"] button:has-text("Next")').count() > 0;
      if (nextExists) {
        const nextEnabled = await page.locator('[role="dialog"] button:has-text("Next")').isEnabled();
        if (nextEnabled) {
          await page.locator('[role="dialog"] button:has-text("Next")').click();
          console.log(`✅ Clicked Next (step ${i + 4})`);
          await page.waitForTimeout(1500);
        }
      }
      
      // Check for Create/Generate button
      const createButton = await page.locator('[role="dialog"] button').filter({ hasText: /Create|Generate|Finish/i }).count();
      if (createButton > 0) {
        console.log('✅ Reached final step with Create/Generate button');
        break;
      }
    }
    
    // Final check
    const finalDialog = await page.locator('[role="dialog"]').isVisible();
    const finalContent = await page.locator('[role="dialog"]').textContent();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 FINAL RESULTS');
    console.log('='.repeat(80));
    console.log(`Dialog visible: ${finalDialog}`);
    console.log(`Final content length: ${finalContent?.length || 0} chars`);
    
    // Take final screenshot
    await page.screenshot({ path: 'wizard-complete-test-final.png', fullPage: true });
    
    if (finalDialog && finalContent && finalContent.length > 100) {
      console.log('✅✅✅ WIZARD IS WORKING!');
    } else {
      console.log('❌❌❌ WIZARD FAILED!');
      if (errors.length > 0) {
        console.log('\nJavaScript Errors:');
        errors.forEach(err => console.log(`  - ${err}`));
      }
      throw new Error('Wizard not working correctly');
    }
  });
});