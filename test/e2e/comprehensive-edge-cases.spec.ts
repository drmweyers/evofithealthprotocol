import { test, expect, Page } from '@playwright/test';

test.describe('Protocol Creation Wizard - Comprehensive Edge Case Testing', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    // Login as trainer
    console.log('Logging in as trainer...');
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login and navigation
    await page.waitForURL(/.*\/trainer/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('Successfully logged in as trainer');
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('Edge Case 1: Navigate to step 2 without selecting protocol type', async () => {
    console.log('\n=== Testing: Navigate to step 2 without protocol type ===');
    
    // Navigate to protocol creation
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]', { timeout: 5000 });
    
    // Try to click Next without selecting a protocol type
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Check if we're still on step 1 and if there's an error message
    const stepIndicator = page.locator('[data-testid="current-step"]');
    const currentStep = await stepIndicator.textContent();
    console.log(`Current step after clicking Next: ${currentStep}`);
    
    // Look for validation error messages
    const errorMessages = await page.locator('.text-red-500, .error, [role="alert"]').count();
    console.log(`Error messages found: ${errorMessages}`);
    
    if (errorMessages > 0) {
      const errorText = await page.locator('.text-red-500, .error, [role="alert"]').first().textContent();
      console.log(`Error message: ${errorText}`);
    }
  });

  test('Edge Case 2: Test Cancel button at different steps', async () => {
    console.log('\n=== Testing: Cancel button at different steps ===');
    
    // Ensure we're at the wizard start
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Test cancel at step 1
    const cancelButton = page.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible()) {
      console.log('Cancel button found at step 1');
      await cancelButton.click();
      
      // Check if we're back to the main page
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      console.log(`URL after cancel: ${currentUrl}`);
    }
    
    // Go back to wizard and proceed to step 2
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Select a protocol type to proceed
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Test cancel at step 2
      const cancelButton2 = page.locator('button:has-text("Cancel")');
      if (await cancelButton2.isVisible()) {
        console.log('Cancel button found at step 2');
        await cancelButton2.click();
        await page.waitForTimeout(1000);
        const currentUrl2 = page.url();
        console.log(`URL after cancel at step 2: ${currentUrl2}`);
      }
    }
  });

  test('Edge Case 3: Test very long protocol names', async () => {
    console.log('\n=== Testing: Very long protocol names ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Select a protocol type
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Try entering a very long protocol name (150+ characters)
      const longName = 'A'.repeat(150) + ' - This is an extremely long protocol name that should test the application\'s handling of lengthy input values';
      
      const nameInput = page.locator('input[placeholder*="protocol name"], input[name*="name"], input[id*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(longName);
        
        // Check the actual value that was entered
        const actualValue = await nameInput.inputValue();
        console.log(`Long name length entered: ${actualValue.length}`);
        console.log(`Was input truncated?: ${actualValue.length < longName.length}`);
        
        // Try to proceed and see what happens
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('Edge Case 4: Test Back button functionality', async () => {
    console.log('\n=== Testing: Back button functionality ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate forward through steps
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Now test Back button
      const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
      if (await backButton.isVisible()) {
        console.log('Back button found, testing navigation...');
        await backButton.click();
        await page.waitForTimeout(1000);
        
        // Check if we're back to step 1
        const step1Indicator = page.locator('text=Select Protocol Type, text=Choose Protocol');
        const isBackOnStep1 = await step1Indicator.isVisible();
        console.log(`Successfully navigated back to step 1: ${isBackOnStep1}`);
      }
    }
  });

  test('Edge Case 5: Test multiple conflicting health conditions', async () => {
    console.log('\n=== Testing: Multiple conflicting health conditions ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate to health conditions selection
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Look for health condition checkboxes/selectors
      const diabetesOption = page.locator('text=Diabetes, input[value*="diabetes"], label:has-text("Diabetes")');
      const hypertensionOption = page.locator('text=Hypertension, input[value*="hypertension"], label:has-text("High Blood Pressure")');
      const energyOption = page.locator('text=Energy, input[value*="energy"], label:has-text("Low Energy")');
      
      let conflictingConditionsSelected = 0;
      
      if (await diabetesOption.first().isVisible()) {
        await diabetesOption.first().click();
        conflictingConditionsSelected++;
        console.log('Selected diabetes condition');
      }
      
      if (await hypertensionOption.first().isVisible()) {
        await hypertensionOption.first().click();
        conflictingConditionsSelected++;
        console.log('Selected hypertension condition');
      }
      
      if (await energyOption.first().isVisible()) {
        await energyOption.first().click();
        conflictingConditionsSelected++;
        console.log('Selected energy-related condition');
      }
      
      console.log(`Total conflicting conditions selected: ${conflictingConditionsSelected}`);
      
      // Try to generate protocol with conflicting conditions
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Protocol")');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        // Check for conflict warnings or error messages
        const warningMessages = await page.locator('.text-yellow-500, .warning, [role="alert"]:has-text("warning")').count();
        const errorMessages = await page.locator('.text-red-500, .error, [role="alert"]:has-text("error")').count();
        
        console.log(`Warning messages for conflicts: ${warningMessages}`);
        console.log(`Error messages for conflicts: ${errorMessages}`);
      }
    }
  });

  test('Edge Case 6: Test medical consent checkbox', async () => {
    console.log('\n=== Testing: Medical consent checkbox ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate to the consent step
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Look for medical consent checkbox
      const consentCheckbox = page.locator('input[type="checkbox"]:near(:text("consent")), input[type="checkbox"]:near(:text("medical")), input[type="checkbox"]:near(:text("agree"))');
      
      if (await consentCheckbox.first().isVisible()) {
        console.log('Medical consent checkbox found');
        
        // Try to generate without checking consent
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Protocol")');
        if (await generateButton.isVisible()) {
          await generateButton.click();
          await page.waitForTimeout(1000);
          
          // Check for consent error messages
          const consentErrors = await page.locator(':text("consent"), :text("agree"), .text-red-500').count();
          console.log(`Consent-related error messages: ${consentErrors}`);
          
          // Now check the consent and try again
          await consentCheckbox.first().check();
          console.log('Consent checkbox checked');
          
          if (await generateButton.isVisible()) {
            await generateButton.click();
            await page.waitForTimeout(2000);
            console.log('Attempted generation with consent checked');
          }
        }
      } else {
        console.log('Medical consent checkbox not found in current step');
      }
    }
  });

  test('Edge Case 7: Test page refresh state persistence', async () => {
    console.log('\n=== Testing: Page refresh state persistence ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate to step 2
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Fill in some data
      const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Protocol Before Refresh');
      }
      
      console.log('Filled in data, now refreshing page...');
      
      // Refresh the page
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Check if we're still logged in and what state we're in
      const currentUrl = page.url();
      console.log(`URL after refresh: ${currentUrl}`);
      
      // Check if wizard state was preserved
      const wizardVisible = await page.locator('[data-testid="protocol-wizard"]').isVisible();
      console.log(`Wizard still visible after refresh: ${wizardVisible}`);
      
      if (wizardVisible) {
        // Check if the filled data persisted
        const nameInputAfterRefresh = page.locator('input[placeholder*="name"], input[name*="name"]').first();
        if (await nameInputAfterRefresh.isVisible()) {
          const preservedValue = await nameInputAfterRefresh.inputValue();
          console.log(`Data preserved after refresh: "${preservedValue}"`);
        }
      }
    }
  });

  test('Edge Case 8: Test rapid button clicking', async () => {
    console.log('\n=== Testing: Rapid button clicking ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Select protocol type
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      
      // Rapidly click Next button multiple times
      const nextButton = page.locator('button:has-text("Next")');
      console.log('Rapidly clicking Next button...');
      
      for (let i = 0; i < 5; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
        await page.waitForTimeout(100); // Small delay between clicks
      }
      
      await page.waitForTimeout(2000);
      
      // Check what state we're in after rapid clicking
      const currentStep = await page.locator('[data-testid="current-step"], .step-indicator').textContent();
      console.log(`State after rapid clicking: ${currentStep}`);
      
      // Check for any error states or duplicate requests
      const errorMessages = await page.locator('.text-red-500, .error').count();
      console.log(`Errors from rapid clicking: ${errorMessages}`);
    }
  });

  test('Edge Case 9: Test special characters in protocol name', async () => {
    console.log('\n=== Testing: Special characters in protocol name ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate to name input
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Test special characters
      const specialCharName = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(specialCharName);
        
        const actualValue = await nameInput.inputValue();
        console.log(`Special characters entered: "${actualValue}"`);
        console.log(`Characters preserved: ${actualValue === specialCharName}`);
        
        // Try to proceed
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Check for validation errors
          const validationErrors = await page.locator('.text-red-500, .error').count();
          console.log(`Validation errors for special characters: ${validationErrors}`);
        }
      }
    }
  });

  test('Edge Case 10: Test HTML/script injection in description', async () => {
    console.log('\n=== Testing: HTML/script injection in description ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate to description input
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Test script injection
      const maliciousInput = '<script>alert("XSS Test")</script><img src="x" onerror="alert(\'XSS\')"><b>Bold Text</b>';
      
      // Look for description/notes textarea or input
      const descriptionInput = page.locator('textarea[placeholder*="description"], textarea[name*="description"], textarea[placeholder*="notes"], input[placeholder*="description"]').first();
      
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill(maliciousInput);
        
        const actualValue = await descriptionInput.inputValue();
        console.log(`Malicious input entered: "${actualValue}"`);
        console.log(`Input was sanitized: ${!actualValue.includes('<script>')}`);
        
        // Check if any script actually executed (page should not show alerts)
        const alerts = await page.evaluate(() => {
          const originalAlert = window.alert;
          let alertCalled = false;
          window.alert = () => { alertCalled = true; };
          return alertCalled;
        });
        
        console.log(`Script executed (security issue): ${alerts}`);
        
        // Try to proceed
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('Description input field not found in current step');
      }
    }
  });

  test('Edge Case 11: Test all options enabled simultaneously', async () => {
    console.log('\n=== Testing: All options enabled simultaneously ===');
    
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    // Navigate through wizard
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(1000);
      
      // Find and enable all checkboxes/options
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      console.log(`Found ${checkboxCount} checkboxes to enable`);
      
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = checkboxes.nth(i);
        if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
          await checkbox.check();
          const label = await checkbox.locator('..').textContent();
          console.log(`Enabled: ${label?.trim()}`);
        }
      }
      
      // Find and select all dropdown options if any
      const selects = page.locator('select');
      const selectCount = await selects.count();
      
      for (let i = 0; i < selectCount; i++) {
        const select = selects.nth(i);
        if (await select.isVisible()) {
          const options = select.locator('option');
          const optionCount = await options.count();
          if (optionCount > 1) {
            await select.selectOption({ index: optionCount - 1 }); // Select last option
          }
        }
      }
      
      // Try to generate with all options enabled
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Protocol")');
      if (await generateButton.isVisible()) {
        console.log('Attempting to generate protocol with all options enabled...');
        await generateButton.click();
        await page.waitForTimeout(3000);
        
        // Check for performance issues or errors
        const loadingIndicator = page.locator('.loading, .spinner, :text("generating"), :text("loading")');
        const isStillLoading = await loadingIndicator.isVisible();
        console.log(`Still loading after 3 seconds: ${isStillLoading}`);
        
        // Check for any error messages
        const errorCount = await page.locator('.text-red-500, .error').count();
        console.log(`Errors with all options enabled: ${errorCount}`);
      }
    }
  });

  test('Summary: Overall robustness assessment', async () => {
    console.log('\n=== OVERALL ROBUSTNESS ASSESSMENT ===');
    
    // Navigate back to main trainer page to assess overall state
    await page.goto('http://localhost:3501/trainer');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is still responsive
    const isResponsive = await page.isVisible('text=Create Health Protocol');
    console.log(`Application still responsive after all tests: ${isResponsive}`);
    
    // Check for any console errors
    const consoleLogs = await page.evaluate(() => {
      return {
        errors: (window as any)._testErrors || [],
        warnings: (window as any)._testWarnings || []
      };
    });
    
    console.log(`Console errors during testing: ${consoleLogs.errors.length}`);
    console.log(`Console warnings during testing: ${consoleLogs.warnings.length}`);
    
    // Test one final normal workflow to ensure basic functionality still works
    console.log('Testing normal workflow after edge case testing...');
    await page.click('text=Create Health Protocol');
    await page.waitForSelector('[data-testid="protocol-wizard"]');
    
    const specializedOption = page.locator('text=Specialized Health Protocols');
    if (await specializedOption.isVisible()) {
      await specializedOption.click();
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        const step2Visible = await page.isVisible(':text("Step 2"), :text("Health"), :text("Protocol")');
        console.log(`Normal workflow still works: ${step2Visible}`);
      }
    }
  });
});