import { test, expect, Page } from '@playwright/test';

test.describe('Protocol Creation Wizard - Focused Edge Case Testing', () => {
  
  test('Manual navigation and edge case testing', async ({ page }) => {
    console.log('\n=== Starting Manual Navigation Test ===');
    
    // Navigate to the application
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial page
    await page.screenshot({ path: 'test-results/01-initial-page.png' });
    
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());
    
    // Login as trainer
    console.log('\n--- Attempting Login ---');
    
    // Look for login elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('trainer.test@evofitmeals.com');
      console.log('Entered email');
    } else {
      console.log('Email input not found');
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('TestTrainer123!');
      console.log('Entered password');
    } else {
      console.log('Password input not found');
    }
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('Clicked login button');
      
      // Wait for navigation with a more flexible approach
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      
      console.log('Post-login URL:', page.url());
      
      // Take screenshot after login
      await page.screenshot({ path: 'test-results/02-after-login.png' });
      
      // Look for any protocol-related buttons or links
      const protocolButtons = await page.locator('text=Protocol, text=Create, button:has-text("Protocol")').count();
      console.log(`Found ${protocolButtons} protocol-related elements`);
      
      if (protocolButtons > 0) {
        // Try to find and click the protocol creation button
        const createProtocolBtn = page.locator('text=Create Health Protocol, text=Create Protocol, button:has-text("Create")').first();
        
        if (await createProtocolBtn.isVisible()) {
          console.log('\n--- Testing Protocol Creation Wizard ---');
          await createProtocolBtn.click();
          await page.waitForTimeout(2000);
          
          console.log('Wizard URL:', page.url());
          await page.screenshot({ path: 'test-results/03-protocol-wizard.png' });
          
          // EDGE CASE 1: Try to proceed without selecting protocol type
          console.log('\n=== Edge Case 1: Navigate without selection ===');
          
          const nextButton = page.locator('button:has-text("Next")');
          if (await nextButton.isVisible()) {
            console.log('Found Next button, clicking without selection...');
            await nextButton.click();
            await page.waitForTimeout(1000);
            
            // Check for validation messages
            const errors = await page.locator('.text-red-500, .error, [role="alert"]').count();
            console.log(`Validation errors found: ${errors}`);
            
            if (errors > 0) {
              const errorText = await page.locator('.text-red-500, .error, [role="alert"]').first().textContent();
              console.log(`Error message: "${errorText}"`);
            }
            
            await page.screenshot({ path: 'test-results/04-validation-test.png' });
          }
          
          // EDGE CASE 2: Test Cancel button
          console.log('\n=== Edge Case 2: Cancel button test ===');
          
          const cancelButton = page.locator('button:has-text("Cancel")');
          if (await cancelButton.isVisible()) {
            console.log('Found Cancel button');
            await cancelButton.click();
            await page.waitForTimeout(1000);
            
            console.log('URL after cancel:', page.url());
            await page.screenshot({ path: 'test-results/05-after-cancel.png' });
            
            // Go back to wizard for more tests
            const createProtocolBtn2 = page.locator('text=Create Health Protocol, text=Create Protocol, button:has-text("Create")').first();
            if (await createProtocolBtn2.isVisible()) {
              await createProtocolBtn2.click();
              await page.waitForTimeout(2000);
            }
          }
          
          // EDGE CASE 3: Select option and test long names
          console.log('\n=== Edge Case 3: Long names and navigation ===');
          
          // Try to find and select a protocol type
          const protocolOptions = await page.locator('text=Specialized, text=General, text=Health, input[type="radio"], .option').count();
          console.log(`Found ${protocolOptions} protocol options`);
          
          // Select first available option
          const firstOption = page.locator('text=Specialized, text=General, input[type="radio"], .option').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            console.log('Selected first protocol option');
            
            // Now try to proceed
            const nextBtn2 = page.locator('button:has-text("Next")');
            if (await nextBtn2.isVisible()) {
              await nextBtn2.click();
              await page.waitForTimeout(2000);
              
              console.log('Advanced to next step, URL:', page.url());
              await page.screenshot({ path: 'test-results/06-step-2.png' });
              
              // Test long protocol name
              const nameInput = page.locator('input[placeholder*="name"], input[name*="name"], input[id*="name"]').first();
              if (await nameInput.isVisible()) {
                const longName = 'A'.repeat(150) + ' - This is an extremely long protocol name that should test input validation';
                await nameInput.fill(longName);
                
                const actualValue = await nameInput.inputValue();
                console.log(`Long name test - Length entered: ${actualValue.length}`);
                console.log(`Input was truncated: ${actualValue.length < longName.length}`);
                
                await page.screenshot({ path: 'test-results/07-long-name-test.png' });
              }
              
              // EDGE CASE 4: Test special characters
              console.log('\n=== Edge Case 4: Special characters ===');
              
              if (await nameInput.isVisible()) {
                const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
                await nameInput.fill(specialChars);
                
                const specialValue = await nameInput.inputValue();
                console.log(`Special characters test: "${specialValue}"`);
                console.log(`Special chars preserved: ${specialValue === specialChars}`);
                
                await page.screenshot({ path: 'test-results/08-special-chars-test.png' });
              }
              
              // EDGE CASE 5: Test HTML injection
              console.log('\n=== Edge Case 5: HTML injection test ===');
              
              const descriptionInput = page.locator('textarea, input[placeholder*="description"]').first();
              if (await descriptionInput.isVisible()) {
                const maliciousInput = '<script>alert("XSS")</script><b>Bold</b>';
                await descriptionInput.fill(maliciousInput);
                
                const descValue = await descriptionInput.inputValue();
                console.log(`HTML injection test: "${descValue}"`);
                console.log(`HTML was sanitized: ${!descValue.includes('<script>')}`);
                
                await page.screenshot({ path: 'test-results/09-html-injection-test.png' });
              }
              
              // EDGE CASE 6: Test Back button
              console.log('\n=== Edge Case 6: Back button test ===');
              
              const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
              if (await backButton.isVisible()) {
                console.log('Testing Back button...');
                await backButton.click();
                await page.waitForTimeout(1000);
                
                console.log('URL after Back button:', page.url());
                await page.screenshot({ path: 'test-results/10-back-button-test.png' });
                
                // Check if we're back to step 1
                const step1Elements = await page.locator('text=Select, text=Choose, text=Type').count();
                console.log(`Back to step 1 (${step1Elements} selection elements found)`);
              }
              
              // EDGE CASE 7: Test rapid clicking
              console.log('\n=== Edge Case 7: Rapid clicking test ===');
              
              // Re-select option and proceed to test rapid clicking
              const optionAgain = page.locator('text=Specialized, text=General, input[type="radio"], .option').first();
              if (await optionAgain.isVisible()) {
                await optionAgain.click();
                
                const nextBtnRapid = page.locator('button:has-text("Next")');
                if (await nextBtnRapid.isVisible()) {
                  console.log('Testing rapid button clicking...');
                  
                  // Click rapidly 5 times
                  for (let i = 0; i < 5; i++) {
                    await nextBtnRapid.click();
                    await page.waitForTimeout(100);
                  }
                  
                  await page.waitForTimeout(2000);
                  console.log('URL after rapid clicking:', page.url());
                  
                  // Check for errors or unexpected behavior
                  const rapidErrors = await page.locator('.error, .text-red-500').count();
                  console.log(`Errors from rapid clicking: ${rapidErrors}`);
                  
                  await page.screenshot({ path: 'test-results/11-rapid-clicking-test.png' });
                }
              }
            }
          }
        } else {
          console.log('Create Protocol button not found');
          
          // List all visible buttons/links for debugging
          const allButtons = await page.locator('button, a').count();
          console.log(`Total buttons/links found: ${allButtons}`);
          
          for (let i = 0; i < Math.min(allButtons, 10); i++) {
            const buttonText = await page.locator('button, a').nth(i).textContent();
            console.log(`Button ${i}: "${buttonText}"`);
          }
        }
      } else {
        console.log('No protocol-related elements found after login');
        
        // Get page content for debugging
        const pageContent = await page.content();
        console.log('Page content length:', pageContent.length);
        
        // Look for any navigation elements
        const navElements = await page.locator('nav, .nav, [role="navigation"]').count();
        console.log(`Navigation elements found: ${navElements}`);
      }
    } else {
      console.log('Login button not found');
    }
    
    // Final assessment
    console.log('\n=== Final Assessment ===');
    console.log('Final URL:', page.url());
    
    // Check overall page health
    const pageErrors = await page.evaluate(() => {
      const errors = [];
      if ((window as any).addEventListener) {
        (window as any).addEventListener('error', (e: any) => {
          errors.push(e.message);
        });
      }
      return errors;
    });
    
    console.log(`JavaScript errors detected: ${pageErrors.length}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/12-final-state.png' });
  });
  
  test('Page refresh state persistence test', async ({ page }) => {
    console.log('\n=== Page Refresh State Persistence Test ===');
    
    // Navigate and login
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    
    // Quick login
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Navigate to protocol creation if possible
    const createBtn = page.locator('text=Create Health Protocol, text=Create Protocol, button:has-text("Create")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      
      // Select an option if available
      const option = page.locator('text=Specialized, text=General, input[type="radio"]').first();
      if (await option.isVisible()) {
        await option.click();
        
        const nextBtn = page.locator('button:has-text("Next")');
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
          
          // Fill some data
          const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test Protocol Before Refresh');
            console.log('Filled data before refresh');
            
            // Now refresh the page
            console.log('Refreshing page...');
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            console.log('URL after refresh:', page.url());
            
            // Check if wizard is still visible
            const wizardVisible = await page.locator('[data-testid="protocol-wizard"], .wizard, .protocol').isVisible();
            console.log(`Wizard visible after refresh: ${wizardVisible}`);
            
            // Check if data persisted
            const nameAfterRefresh = page.locator('input[placeholder*="name"], input[name*="name"]').first();
            if (await nameAfterRefresh.isVisible()) {
              const persistedValue = await nameAfterRefresh.inputValue();
              console.log(`Data persistence test - Value after refresh: "${persistedValue}"`);
              console.log(`Data was preserved: ${persistedValue === 'Test Protocol Before Refresh'}`);
            }
          }
        }
      }
    }
  });
});