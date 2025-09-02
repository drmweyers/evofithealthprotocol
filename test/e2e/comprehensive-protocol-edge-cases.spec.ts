import { test, expect, Page } from '@playwright/test';

test.describe('Health Protocol Creation - Comprehensive Edge Case Testing', () => {
  
  test('Complete edge case testing of protocol creation features', async ({ page }) => {
    console.log('\n🧪 === COMPREHENSIVE EDGE CASE TESTING ===');
    
    // Navigate and login
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Successfully logged in as trainer');
    console.log('📍 Current URL:', page.url());
    
    // ========================================
    // EDGE CASE 1: Test Guided Protocol Wizard
    // ========================================
    console.log('\n🎯 === EDGE CASE 1: Guided Protocol Wizard Navigation ===');
    
    // Click on Guided Protocol Wizard
    const guidedWizardCard = page.locator('text=Guided Protocol Wizard').locator('..');
    if (await guidedWizardCard.isVisible()) {
      await guidedWizardCard.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      
      console.log('📍 Wizard URL:', page.url());
      await page.screenshot({ path: 'test-results/wizard-01-initial.png' });
      
      // Test navigation without selection
      console.log('\n🚨 Testing: Navigate without protocol type selection');
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors
        const errorElements = await page.locator('.text-red-500, .text-destructive, [role="alert"], .error').count();
        const warningElements = await page.locator('.text-yellow-500, .text-warning').count();
        
        console.log(`❌ Validation errors found: ${errorElements}`);
        console.log(`⚠️ Warnings found: ${warningElements}`);
        
        if (errorElements > 0) {
          const errorText = await page.locator('.text-red-500, .text-destructive, [role="alert"], .error').first().textContent();
          console.log(`🔍 Error message: "${errorText}"`);
        }
        
        await page.screenshot({ path: 'test-results/wizard-02-validation-error.png' });
      }
      
      // Look for protocol type options
      console.log('\n🔍 Searching for protocol type options...');
      const protocolOptions = await page.locator('input[type="radio"], .option, .card, .protocol-type').count();
      console.log(`📋 Found ${protocolOptions} protocol type elements`);
      
      // Select Specialized Health Protocols if available
      const specializedOption = page.locator('text=Specialized Health Protocol, text=Specialized Protocol').first();
      const longevityOption = page.locator('text=Longevity, text=Longevity Mode').first();
      const parasiteOption = page.locator('text=Parasite, text=Parasite Cleanse').first();
      
      let selectedOption = null;
      
      if (await specializedOption.isVisible()) {
        await specializedOption.click();
        selectedOption = 'Specialized Health Protocol';
        console.log('✅ Selected: Specialized Health Protocol');
      } else if (await longevityOption.isVisible()) {
        await longevityOption.click();
        selectedOption = 'Longevity Mode';
        console.log('✅ Selected: Longevity Mode');
      } else if (await parasiteOption.isVisible()) {
        await parasiteOption.click();
        selectedOption = 'Parasite Cleanse';
        console.log('✅ Selected: Parasite Cleanse');
      } else {
        // Try to find any selectable option
        const anyOption = page.locator('input[type="radio"], .selectable, [data-testid*="option"]').first();
        if (await anyOption.isVisible()) {
          await anyOption.click();
          selectedOption = 'Generic option';
          console.log('✅ Selected: First available option');
        }
      }
      
      if (selectedOption) {
        // Proceed to next step
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle');
          
          console.log('📍 Advanced to step 2, URL:', page.url());
          await page.screenshot({ path: 'test-results/wizard-03-step-2.png' });
          
          // ========================================
          // EDGE CASE 2: Test form inputs with edge cases
          // ========================================
          console.log('\n🎯 === EDGE CASE 2: Form Input Edge Cases ===');
          
          // Test protocol name with very long input
          console.log('\n📝 Testing: Very long protocol name (150+ characters)');
          const protocolNameInput = page.locator('input[placeholder*="name"], input[name*="name"], input[id*="name"]').first();
          
          if (await protocolNameInput.isVisible()) {
            const longName = 'A'.repeat(150) + ' - This is an extremely long protocol name designed to test input validation, character limits, and how the system handles extended text that exceeds normal expectations for protocol naming conventions';
            
            await protocolNameInput.fill(longName);
            const actualValue = await protocolNameInput.inputValue();
            
            console.log(`📊 Original length: ${longName.length}`);
            console.log(`📊 Actual length: ${actualValue.length}`);
            console.log(`🔍 Input truncated: ${actualValue.length < longName.length ? 'YES' : 'NO'}`);
            
            await page.screenshot({ path: 'test-results/wizard-04-long-name.png' });
            
            // Test special characters
            console.log('\n🔣 Testing: Special characters in protocol name');
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
            await protocolNameInput.fill(specialChars);
            
            const specialValue = await protocolNameInput.inputValue();
            console.log(`🔍 Special chars input: "${specialChars}"`);
            console.log(`🔍 Special chars stored: "${specialValue}"`);
            console.log(`🔍 Characters preserved: ${specialValue === specialChars ? 'YES' : 'NO'}`);
            
            await page.screenshot({ path: 'test-results/wizard-05-special-chars.png' });
            
            // Test HTML/Script injection
            console.log('\n🚨 Testing: HTML/Script injection in protocol name');
            const maliciousName = '<script>alert("XSS Test")</script><img src="x" onerror="console.log(\'XSS\')"><b>Bold</b>';
            await protocolNameInput.fill(maliciousName);
            
            const sanitizedName = await protocolNameInput.inputValue();
            console.log(`🔍 Malicious input: "${maliciousName}"`);
            console.log(`🔍 Sanitized output: "${sanitizedName}"`);
            console.log(`🛡️ Script tags removed: ${!sanitizedName.includes('<script>') ? 'YES' : 'NO'}`);
            
            await page.screenshot({ path: 'test-results/wizard-06-injection-test.png' });
            
            // Reset to valid name for further testing
            await protocolNameInput.fill('Test Protocol for Edge Cases');
          }
          
          // Test description field if available
          const descriptionInput = page.locator('textarea[placeholder*="description"], textarea[name*="description"], input[placeholder*="description"]').first();
          
          if (await descriptionInput.isVisible()) {
            console.log('\n📝 Testing: Description field with HTML injection');
            
            const htmlContent = '<script>alert("XSS in description")</script><h1>Header</h1><p>Paragraph with <a href="javascript:alert()">malicious link</a></p>';
            await descriptionInput.fill(htmlContent);
            
            const descValue = await descriptionInput.inputValue();
            console.log(`🔍 HTML content sanitized: ${!descValue.includes('<script>') ? 'YES' : 'NO'}`);
            console.log(`🔍 Description length: ${descValue.length}`);
            
            await page.screenshot({ path: 'test-results/wizard-07-description-test.png' });
          }
          
          // ========================================
          // EDGE CASE 3: Test health conditions/ailments selection
          // ========================================
          console.log('\n🎯 === EDGE CASE 3: Health Conditions Edge Cases ===');
          
          // Look for health condition checkboxes
          const healthCheckboxes = await page.locator('input[type="checkbox"]').count();
          console.log(`🔍 Found ${healthCheckboxes} checkboxes for health conditions`);
          
          if (healthCheckboxes > 0) {
            console.log('\n🚨 Testing: Select ALL health conditions simultaneously');
            
            // Select all checkboxes
            for (let i = 0; i < healthCheckboxes; i++) {
              const checkbox = page.locator('input[type="checkbox"]').nth(i);
              if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
                await checkbox.check();
                
                // Get the label text for this checkbox
                const labelText = await checkbox.locator('..').textContent();
                console.log(`✅ Selected: ${labelText?.trim()}`);
              }
            }
            
            await page.screenshot({ path: 'test-results/wizard-08-all-conditions.png' });
            
            // Test for conflict warnings
            console.log('\n⚠️ Checking for conflicting condition warnings...');
            const warningElements = await page.locator('.text-yellow-500, .text-warning, [role="alert"]:has-text("warning"), [role="alert"]:has-text("conflict")').count();
            console.log(`⚠️ Conflict warnings found: ${warningElements}`);
            
            if (warningElements > 0) {
              const warningText = await page.locator('.text-yellow-500, .text-warning, [role="alert"]').first().textContent();
              console.log(`🔍 Warning message: "${warningText}"`);
            }
          }
          
          // ========================================
          // EDGE CASE 4: Test medical consent and generation
          // ========================================
          console.log('\n🎯 === EDGE CASE 4: Medical Consent and Generation ===');
          
          // Look for consent checkbox
          const consentCheckbox = page.locator('input[type="checkbox"]:near(:text("consent")), input[type="checkbox"]:near(:text("medical")), input[type="checkbox"]:near(:text("agree"))').first();
          const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Protocol"), button:has-text("Save")');
          
          if (await generateButton.isVisible()) {
            console.log('\n🚨 Testing: Generate without medical consent');
            await generateButton.click();
            await page.waitForTimeout(2000);
            
            // Check for consent-related errors
            const consentErrors = await page.locator(':text("consent"), :text("medical consent"), .text-red-500').count();
            console.log(`❌ Consent errors found: ${consentErrors}`);
            
            if (consentErrors > 0) {
              const consentErrorText = await page.locator(':text("consent"), :text("medical consent"), .text-red-500').first().textContent();
              console.log(`🔍 Consent error: "${consentErrorText}"`);
            }
            
            await page.screenshot({ path: 'test-results/wizard-09-consent-error.png' });
            
            // Now check consent and try again
            if (await consentCheckbox.isVisible()) {
              console.log('✅ Checking medical consent');
              await consentCheckbox.check();
              
              console.log('\n🚀 Testing: Protocol generation with consent');
              await generateButton.click();
              await page.waitForTimeout(5000); // Give more time for generation
              
              // Check if generation started
              const loadingIndicator = page.locator('.loading, .spinner, :text("generating"), :text("creating")');
              const isGenerating = await loadingIndicator.isVisible();
              console.log(`⏳ Generation in progress: ${isGenerating ? 'YES' : 'NO'}`);
              
              await page.screenshot({ path: 'test-results/wizard-10-generation.png' });
              
              // Wait for completion or timeout
              await page.waitForTimeout(10000);
              
              const finalUrl = page.url();
              console.log(`📍 Final URL after generation: ${finalUrl}`);
              
              // Check for success or error messages
              const successElements = await page.locator('.text-green-500, .success, :text("successfully"), :text("created")').count();
              const errorElements = await page.locator('.text-red-500, .error, :text("error"), :text("failed")').count();
              
              console.log(`✅ Success indicators: ${successElements}`);
              console.log(`❌ Error indicators: ${errorElements}`);
              
              await page.screenshot({ path: 'test-results/wizard-11-final-result.png' });
            }
          }
          
          // ========================================
          // EDGE CASE 5: Test Cancel and Back buttons
          // ========================================
          console.log('\n🎯 === EDGE CASE 5: Navigation Control Testing ===');
          
          const cancelButton = page.locator('button:has-text("Cancel")');
          const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
          
          if (await backButton.isVisible()) {
            console.log('\n⬅️ Testing: Back button functionality');
            await backButton.click();
            await page.waitForTimeout(1000);
            
            const urlAfterBack = page.url();
            console.log(`📍 URL after Back: ${urlAfterBack}`);
            
            // Check if we're back to step 1
            const step1Elements = await page.locator('text=Select, text=Choose, text=Protocol Type').count();
            console.log(`🔍 Back to step 1: ${step1Elements > 0 ? 'YES' : 'NO'}`);
            
            await page.screenshot({ path: 'test-results/wizard-12-back-button.png' });
          }
          
          if (await cancelButton.isVisible()) {
            console.log('\n❌ Testing: Cancel button functionality');
            await cancelButton.click();
            await page.waitForTimeout(1000);
            
            const urlAfterCancel = page.url();
            console.log(`📍 URL after Cancel: ${urlAfterCancel}`);
            
            // Check if we're back to main protocols page
            const backToMain = urlAfterCancel.includes('/protocols');
            console.log(`🔍 Back to main page: ${backToMain ? 'YES' : 'NO'}`);
            
            await page.screenshot({ path: 'test-results/wizard-13-cancel-button.png' });
          }
        }
      }
    }
    
    // ========================================
    // EDGE CASE 6: Test Manual Protocol Creation
    // ========================================
    console.log('\n🎯 === EDGE CASE 6: Manual Protocol Creation ===');
    
    // Go back to main page and test manual creation
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    // Test manual protocol form at the bottom
    const manualNameInput = page.locator('input[placeholder*="30-Day Longevity Protocol"], input[placeholder*="name"]').last();
    const manualDescInput = page.locator('textarea[placeholder*="Brief description"], textarea[placeholder*="description"]').last();
    
    if (await manualNameInput.isVisible()) {
      console.log('\n📝 Testing: Manual protocol creation edge cases');
      
      // Test empty submission
      const createButton = page.locator('button:has-text("Create Protocol")').last();
      if (await createButton.isVisible()) {
        console.log('🚨 Testing: Empty form submission');
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const emptyErrors = await page.locator('.text-red-500, .error').count();
        console.log(`❌ Empty form errors: ${emptyErrors}`);
        
        await page.screenshot({ path: 'test-results/manual-01-empty-form.png' });
      }
      
      // Test with edge case inputs
      console.log('🔣 Testing: Manual form with edge case inputs');
      
      const edgeCaseName = '<script>alert("manual XSS")</script>Edge Case Manual Protocol';
      const edgeCaseDesc = 'Description with "quotes" and \'apostrophes\' and <b>HTML</b> tags & special chars: !@#$%^&*()';
      
      await manualNameInput.fill(edgeCaseName);
      await manualDescInput.fill(edgeCaseDesc);
      
      const manualNameValue = await manualNameInput.inputValue();
      const manualDescValue = await manualDescInput.inputValue();
      
      console.log(`🔍 Manual name sanitized: ${!manualNameValue.includes('<script>') ? 'YES' : 'NO'}`);
      console.log(`🔍 Manual description length: ${manualDescValue.length}`);
      
      await page.screenshot({ path: 'test-results/manual-02-edge-inputs.png' });
      
      // Try to create the manual protocol
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(3000);
        
        // Check for results
        const manualSuccess = await page.locator('.text-green-500, .success').count();
        const manualErrors = await page.locator('.text-red-500, .error').count();
        
        console.log(`✅ Manual creation success: ${manualSuccess}`);
        console.log(`❌ Manual creation errors: ${manualErrors}`);
        
        await page.screenshot({ path: 'test-results/manual-03-creation-result.png' });
      }
    }
    
    // ========================================
    // EDGE CASE 7: Test Rapid Clicking and Race Conditions
    // ========================================
    console.log('\n🎯 === EDGE CASE 7: Rapid Clicking and Race Conditions ===');
    
    // Go back to wizard for rapid clicking test
    const guidedWizardCardAgain = page.locator('text=Guided Protocol Wizard').locator('..');
    if (await guidedWizardCardAgain.isVisible()) {
      await guidedWizardCardAgain.click();
      await page.waitForTimeout(1000);
      
      // Select an option quickly
      const quickOption = page.locator('text=Specialized, text=Longevity, input[type="radio"]').first();
      if (await quickOption.isVisible()) {
        await quickOption.click();
        
        // Test rapid next button clicking
        console.log('🚨 Testing: Rapid Next button clicking');
        const rapidNextButton = page.locator('button:has-text("Next")');
        
        if (await rapidNextButton.isVisible()) {
          // Click rapidly 10 times
          for (let i = 0; i < 10; i++) {
            await rapidNextButton.click();
            await page.waitForTimeout(50); // Very short delay
          }
          
          await page.waitForTimeout(3000);
          
          // Check what state we're in
          const finalRapidUrl = page.url();
          console.log(`📍 URL after rapid clicking: ${finalRapidUrl}`);
          
          const rapidErrors = await page.locator('.error, .text-red-500').count();
          console.log(`❌ Errors from rapid clicking: ${rapidErrors}`);
          
          await page.screenshot({ path: 'test-results/rapid-clicking.png' });
        }
      }
    }
    
    // ========================================
    // FINAL ASSESSMENT
    // ========================================
    console.log('\n🎯 === FINAL ROBUSTNESS ASSESSMENT ===');
    
    // Test overall application health
    await page.goto('http://localhost:3501/protocols');
    await page.waitForLoadState('networkidle');
    
    const finalHealth = await page.isVisible('text=Create New Health Protocol');
    console.log(`🏥 Application still healthy: ${finalHealth ? 'YES' : 'NO'}`);
    
    // Check for JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return {
        errorCount: (window as any)._testErrorCount || 0,
        hasConsoleErrors: !!(window as any)._hasConsoleErrors
      };
    });
    
    console.log(`🔍 JavaScript errors: ${jsErrors.errorCount}`);
    console.log(`🔍 Console errors detected: ${jsErrors.hasConsoleErrors ? 'YES' : 'NO'}`);
    
    // Test one final normal workflow
    console.log('\n✅ Testing: Normal workflow after all edge cases');
    const finalWizardTest = page.locator('text=Guided Protocol Wizard').locator('..');
    if (await finalWizardTest.isVisible()) {
      await finalWizardTest.click();
      await page.waitForTimeout(2000);
      
      const normalFlowWorks = await page.isVisible('text=Specialized, text=Longevity');
      console.log(`✅ Normal workflow still functional: ${normalFlowWorks ? 'YES' : 'NO'}`);
    }
    
    await page.screenshot({ path: 'test-results/final-assessment.png' });
    
    console.log('\n🎉 === COMPREHENSIVE EDGE CASE TESTING COMPLETE ===');
  });
  
  test('Page refresh state persistence comprehensive test', async ({ page }) => {
    console.log('\n🔄 === PAGE REFRESH STATE PERSISTENCE TEST ===');
    
    // Login and navigate to wizard
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Go to wizard
    const wizardCard = page.locator('text=Guided Protocol Wizard').locator('..');
    if (await wizardCard.isVisible()) {
      await wizardCard.click();
      await page.waitForTimeout(2000);
      
      // Select option and proceed
      const option = page.locator('text=Specialized, text=Longevity').first();
      if (await option.isVisible()) {
        await option.click();
        
        const nextBtn = page.locator('button:has-text("Next")');
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
          
          // Fill form data
          const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Protocol Before Refresh Test');
            console.log('💾 Filled data before refresh');
            
            const urlBeforeRefresh = page.url();
            console.log(`📍 URL before refresh: ${urlBeforeRefresh}`);
            
            // Refresh the page
            console.log('🔄 Refreshing page...');
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            
            const urlAfterRefresh = page.url();
            console.log(`📍 URL after refresh: ${urlAfterRefresh}`);
            
            // Check session persistence
            const stillLoggedIn = await page.locator('text=Welcome, trainer').isVisible();
            console.log(`👤 Still logged in: ${stillLoggedIn ? 'YES' : 'NO'}`);
            
            // Check wizard state
            const wizardStillVisible = await page.locator('[data-testid="protocol-wizard"], .wizard').isVisible();
            console.log(`🧙 Wizard state preserved: ${wizardStillVisible ? 'YES' : 'NO'}`);
            
            // Check if form data persisted
            const nameAfterRefresh = page.locator('input[placeholder*="name"], input[name*="name"]').first();
            if (await nameAfterRefresh.isVisible()) {
              const persistedValue = await nameAfterRefresh.inputValue();
              console.log(`💾 Data persistence: "${persistedValue}"`);
              console.log(`✅ Data preserved: ${persistedValue === 'Protocol Before Refresh Test' ? 'YES' : 'NO'}`);
            } else {
              console.log('❌ Form inputs not found after refresh - wizard likely reset');
            }
            
            await page.screenshot({ path: 'test-results/refresh-persistence.png' });
          }
        }
      }
    }
  });
});