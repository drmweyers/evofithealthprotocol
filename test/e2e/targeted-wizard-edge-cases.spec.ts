import { test, expect, Page } from '@playwright/test';

test.describe('Protocol Creation Wizard - Targeted Edge Cases', () => {
  
  test('Comprehensive wizard edge case testing with actual UI elements', async ({ page }) => {
    console.log('\n🎯 === TARGETED WIZARD EDGE CASE TESTING ===');
    
    // Login
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Click on Guided Protocol Wizard
    const guidedWizardCard = page.locator('text=Guided Protocol Wizard').locator('..');
    await guidedWizardCard.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Successfully opened Protocol Creation Wizard');
    
    // ========================================
    // EDGE CASE 1: Navigate without selection
    // ========================================
    console.log('\n🚨 EDGE CASE 1: Try to proceed without selecting protocol type');
    
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Check if we're still on step 1
    const step1Still = await page.locator('text=Step 1 of 7').isVisible();
    console.log(`🔍 Still on Step 1 after clicking Next: ${step1Still ? 'YES (Good validation)' : 'NO (Validation failed)'}`);
    
    // Check for error messages
    const errorMessages = await page.locator('.text-red-500, .text-destructive, [role="alert"]').count();
    console.log(`❌ Error messages displayed: ${errorMessages}`);
    
    if (errorMessages > 0) {
      const errorText = await page.locator('.text-red-500, .text-destructive, [role="alert"]').first().textContent();
      console.log(`🔍 Error message: "${errorText}"`);
    }
    
    await page.screenshot({ path: 'test-results/targeted-01-no-selection.png' });
    
    // ========================================
    // EDGE CASE 2: Select Longevity protocol and test navigation
    // ========================================
    console.log('\n✅ EDGE CASE 2: Select Longevity protocol and test navigation');
    
    const longevityOption = page.locator('text=Longevity & Anti-Aging');
    if (await longevityOption.isVisible()) {
      await longevityOption.click();
      console.log('✅ Selected Longevity & Anti-Aging protocol');
      
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we advanced to step 2
      const step2 = await page.locator('text=Step 2 of 7').isVisible();
      console.log(`🔍 Advanced to Step 2: ${step2 ? 'YES' : 'NO'}`);
      
      if (step2) {
        await page.screenshot({ path: 'test-results/targeted-02-step2.png' });
        
        // ========================================
        // EDGE CASE 3: Test form inputs with extreme values
        // ========================================
        console.log('\n🔣 EDGE CASE 3: Test form inputs with extreme values');
        
        // Look for input fields
        const allInputs = await page.locator('input[type="text"], input[type="number"], textarea').count();
        console.log(`🔍 Found ${allInputs} input fields in step 2`);
        
        // Test each input with edge cases
        for (let i = 0; i < allInputs; i++) {
          const input = page.locator('input[type="text"], input[type="number"], textarea').nth(i);
          
          if (await input.isVisible()) {
            const inputType = await input.getAttribute('type');
            const placeholder = await input.getAttribute('placeholder');
            
            console.log(`\n📝 Testing input ${i + 1}: type="${inputType}", placeholder="${placeholder}"`);
            
            if (inputType === 'number') {
              // Test negative numbers
              await input.fill('-999');
              const negativeValue = await input.inputValue();
              console.log(`🔢 Negative number test: "${negativeValue}"`);
              
              // Test very large numbers
              await input.fill('999999999');
              const largeValue = await input.inputValue();
              console.log(`🔢 Large number test: "${largeValue}"`);
              
              // Test decimal places
              await input.fill('123.456789');
              const decimalValue = await input.inputValue();
              console.log(`🔢 Decimal test: "${decimalValue}"`);
              
            } else {
              // Test HTML injection
              const maliciousInput = '<script>alert("XSS")</script><img src="x" onerror="alert(1)"><b>Bold</b>';
              await input.fill(maliciousInput);
              const sanitizedValue = await input.inputValue();
              
              console.log(`🚨 HTML injection test:`);
              console.log(`   Input: "${maliciousInput}"`);
              console.log(`   Output: "${sanitizedValue}"`);
              console.log(`   Sanitized: ${!sanitizedValue.includes('<script>') ? 'YES' : 'NO'}`);
              
              // Test very long input
              const longInput = 'A'.repeat(1000);
              await input.fill(longInput);
              const longValue = await input.inputValue();
              console.log(`📏 Long input test: ${longValue.length} chars (truncated: ${longValue.length < longInput.length ? 'YES' : 'NO'})`);
              
              // Test special characters
              const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
              await input.fill(specialChars);
              const specialValue = await input.inputValue();
              console.log(`🔣 Special chars preserved: ${specialValue === specialChars ? 'YES' : 'NO'}`);
            }
          }
        }
        
        await page.screenshot({ path: 'test-results/targeted-03-input-testing.png' });
        
        // ========================================
        // EDGE CASE 4: Test Back button
        // ========================================
        console.log('\n⬅️ EDGE CASE 4: Test Back button functionality');
        
        const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(1000);
          
          const backToStep1 = await page.locator('text=Step 1 of 7').isVisible();
          console.log(`🔍 Back button works: ${backToStep1 ? 'YES' : 'NO'}`);
          
          // Check if our previous selection is preserved
          const longevitySelected = await page.locator('text=Longevity & Anti-Aging').locator('..').getAttribute('class');
          console.log(`🔍 Previous selection preserved: ${longevitySelected?.includes('selected') || longevitySelected?.includes('active') ? 'YES' : 'NO'}`);
          
          await page.screenshot({ path: 'test-results/targeted-04-back-button.png' });
          
          // Go forward again for more testing
          await nextButton.click();
          await page.waitForTimeout(1000);
        }
        
        // ========================================
        // EDGE CASE 5: Test rapid button clicking
        // ========================================
        console.log('\n🚀 EDGE CASE 5: Test rapid button clicking');
        
        if (await nextButton.isVisible()) {
          console.log('🔥 Rapidly clicking Next button 10 times...');
          
          for (let i = 0; i < 10; i++) {
            await nextButton.click();
            await page.waitForTimeout(50);
          }
          
          await page.waitForTimeout(2000);
          
          // Check what step we're on
          const currentStep = await page.locator('[class*="step"], text=Step').first().textContent();
          console.log(`📍 Current step after rapid clicking: "${currentStep}"`);
          
          // Check for errors
          const rapidErrors = await page.locator('.text-red-500, .error').count();
          console.log(`❌ Errors from rapid clicking: ${rapidErrors}`);
          
          await page.screenshot({ path: 'test-results/targeted-05-rapid-clicking.png' });
        }
        
        // ========================================
        // EDGE CASE 6: Fill form and test Cancel
        // ========================================
        console.log('\n❌ EDGE CASE 6: Fill form data and test Cancel button');
        
        // Fill some data first
        const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Protocol Data Before Cancel');
          console.log('💾 Filled form data');
        }
        
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
          
          const backToMain = page.url().includes('/protocols');
          console.log(`🔍 Cancel returns to main page: ${backToMain ? 'YES' : 'NO'}`);
          
          await page.screenshot({ path: 'test-results/targeted-06-cancel-button.png' });
          
          // Check if we can start wizard again
          const wizardCardAgain = page.locator('text=Guided Protocol Wizard').locator('..');
          if (await wizardCardAgain.isVisible()) {
            await wizardCardAgain.click();
            await page.waitForTimeout(1000);
            
            const freshWizard = await page.locator('text=Step 1 of 7').isVisible();
            console.log(`🔍 Can restart wizard after cancel: ${freshWizard ? 'YES' : 'NO'}`);
          }
        }
      }
    } else {
      console.log('❌ Longevity & Anti-Aging option not found');
      
      // Try General Wellness instead
      const generalOption = page.locator('text=General Wellness');
      if (await generalOption.isVisible()) {
        console.log('✅ Trying General Wellness option instead');
        await generalOption.click();
        await nextButton.click();
        await page.waitForTimeout(2000);
        
        const step2General = await page.locator('text=Step 2 of 7').isVisible();
        console.log(`🔍 Advanced with General Wellness: ${step2General ? 'YES' : 'NO'}`);
      }
    }
    
    console.log('\n🎉 === TARGETED EDGE CASE TESTING COMPLETE ===');
  });
  
  test('Test all protocol types for validation', async ({ page }) => {
    console.log('\n🧪 === PROTOCOL TYPE VALIDATION TEST ===');
    
    // Login and open wizard
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const guidedWizardCard = page.locator('text=Guided Protocol Wizard').locator('..');
    await guidedWizardCard.click();
    await page.waitForTimeout(2000);
    
    // Test each protocol type
    const protocolTypes = [
      'General Wellness',
      'Longevity & Anti-Aging',
      'Weight Management',
      'Athletic Performance',
      'Digestive Health',
      'Mental Clarity'
    ];
    
    for (const protocolType of protocolTypes) {
      console.log(`\n🧪 Testing protocol type: ${protocolType}`);
      
      const typeOption = page.locator(`text=${protocolType}`);
      if (await typeOption.isVisible()) {
        await typeOption.click();
        console.log(`✅ Selected ${protocolType}`);
        
        const nextButton = page.locator('button:has-text("Next")');
        await nextButton.click();
        await page.waitForTimeout(2000);
        
        const step2 = await page.locator('text=Step 2 of 7').isVisible();
        console.log(`🔍 ${protocolType} advances to step 2: ${step2 ? 'YES' : 'NO'}`);
        
        if (step2) {
          // Test one input field with this protocol type
          const firstInput = page.locator('input[type="text"], input[type="number"], textarea').first();
          if (await firstInput.isVisible()) {
            await firstInput.fill(`Test data for ${protocolType}`);
            
            const testValue = await firstInput.inputValue();
            console.log(`📝 Input test for ${protocolType}: "${testValue}"`);
          }
          
          // Go back to try next protocol type
          const backButton = page.locator('button:has-text("Back")');
          if (await backButton.isVisible()) {
            await backButton.click();
            await page.waitForTimeout(1000);
          }
        }
        
        await page.screenshot({ path: `test-results/protocol-type-${protocolType.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png` });
      } else {
        console.log(`❌ Protocol type not found: ${protocolType}`);
      }
    }
    
    console.log('\n🏁 Protocol type validation testing complete');
  });
});