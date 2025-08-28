/**
 * Simple Login Investigation - Document Current State
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

test.describe('🔍 Login Investigation & Documentation', () => {
  
  test('Document current application state and login flow', async ({ page }) => {
    console.log('🔍 Starting login investigation...');
    
    // Step 1: Navigate to root
    console.log('1. Navigating to application root');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const rootTitle = await page.title();
    const rootUrl = page.url();
    console.log(`   Root URL: ${rootUrl}`);
    console.log(`   Root title: "${rootTitle}"`);
    
    await page.screenshot({ path: 'test-screenshots/investigation-01-root.png', fullPage: true });
    
    // Step 2: Try to navigate to /login
    console.log('2. Navigating to /login');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    const loginUrl = page.url();
    const loginTitle = await page.title();
    console.log(`   Login URL: ${loginUrl}`);
    console.log(`   Login title: "${loginTitle}"`);
    
    await page.screenshot({ path: 'test-screenshots/investigation-02-login-page.png', fullPage: true });
    
    // Step 3: Analyze page content
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText.substring(0, 500),
        hasEmailInput: !!document.querySelector('input[type="email"], input[name="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"], input[name="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"], input[type="submit"]'),
        allInputs: Array.from(document.querySelectorAll('input')).map(input => ({
          type: input.type,
          name: input.name,
          placeholder: input.placeholder,
          id: input.id
        })),
        allButtons: Array.from(document.querySelectorAll('button')).map(button => ({
          type: button.type,
          textContent: button.textContent?.trim(),
          className: button.className
        }))
      };
    });
    
    console.log('3. Page analysis:');
    console.log(`   Has email input: ${pageContent.hasEmailInput}`);
    console.log(`   Has password input: ${pageContent.hasPasswordInput}`);
    console.log(`   Has submit button: ${pageContent.hasSubmitButton}`);
    console.log('   All inputs:', JSON.stringify(pageContent.allInputs, null, 2));
    console.log('   All buttons:', JSON.stringify(pageContent.allButtons, null, 2));
    console.log(`   Page text preview: ${pageContent.bodyText.substring(0, 200)}...`);
    
    // Step 4: Try with existing test accounts
    const testAccounts = [
      { email: 'admin@fitmeal.pro', password: 'Admin123!@#', role: 'admin' },
      { email: 'testtrainer@example.com', password: 'TrainerPassword123!', role: 'trainer' },
      { email: 'testcustomer@example.com', password: 'TestPassword123!', role: 'customer' }
    ];
    
    if (pageContent.hasEmailInput && pageContent.hasPasswordInput && pageContent.hasSubmitButton) {
      console.log('4. Testing with existing test accounts...');
      
      for (const account of testAccounts) {
        console.log(`   Testing ${account.role}: ${account.email}`);
        
        // Fill form
        await page.fill('input[type="email"], input[name="email"]', account.email);
        await page.fill('input[type="password"], input[name="password"]', account.password);
        
        await page.screenshot({ 
          path: `test-screenshots/investigation-03-${account.role}-form-filled.png`, 
          fullPage: true 
        });
        
        // Submit
        const submitButton = page.locator('button[type="submit"], input[type="submit"]');
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        const afterSubmitUrl = page.url();
        const afterSubmitTitle = await page.title();
        
        console.log(`     After submit URL: ${afterSubmitUrl}`);
        console.log(`     After submit title: "${afterSubmitTitle}"`);
        
        const loginSuccessful = !afterSubmitUrl.includes('/login');
        console.log(`     Login successful: ${loginSuccessful}`);
        
        await page.screenshot({ 
          path: `test-screenshots/investigation-04-${account.role}-after-submit.png`, 
          fullPage: true 
        });
        
        if (loginSuccessful) {
          // Document what success looks like
          const successContent = await page.evaluate(() => ({
            pageText: document.body.innerText.substring(0, 300),
            hasLogoutButton: !!document.querySelector('button:contains("Logout"), a:contains("Logout"), button:contains("Sign Out")')
          }));
          
          console.log(`     Success page content: ${successContent.pageText}`);
          console.log(`     Has logout button: ${successContent.hasLogoutButton}`);
          
          // Try to logout and return to login
          const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")');
          if (await logoutButton.isVisible().catch(() => false)) {
            await logoutButton.click();
            await page.waitForLoadState('networkidle');
            console.log(`     Logout successful, URL: ${page.url()}`);
          }
          
          break; // Found working account, no need to test others
        } else {
          // Check for error messages
          const errorElements = await page.locator('.error, .alert, .text-red-500').all();
          if (errorElements.length > 0) {
            for (const element of errorElements) {
              const errorText = await element.textContent();
              console.log(`     Error message: "${errorText}"`);
            }
          }
        }
        
        // Navigate back to login for next test
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
      }
    } else {
      console.log('4. ❌ Login form elements not found - cannot test login');
    }
    
    // Step 5: API Health Check
    console.log('5. Checking API health...');
    try {
      const apiResponse = await page.request.get(`${BASE_URL}/api/health`);
      console.log(`   API health status: ${apiResponse.status()}`);
      
      if (apiResponse.ok()) {
        const apiBody = await apiResponse.text();
        console.log(`   API response: ${apiBody}`);
      }
    } catch (error) {
      console.log(`   API health check failed: ${error.message}`);
    }
    
    // Step 6: Check authentication endpoint
    console.log('6. Testing authentication endpoint...');
    try {
      const authResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'testcustomer@example.com',
          password: 'TestPassword123!'
        }
      });
      
      console.log(`   Auth API status: ${authResponse.status()}`);
      console.log(`   Auth API headers: ${JSON.stringify(Object.fromEntries(authResponse.headers()), null, 2)}`);
      
      if (authResponse.ok()) {
        const authBody = await authResponse.text();
        console.log(`   Auth API response: ${authBody.substring(0, 200)}...`);
      } else {
        const errorBody = await authResponse.text();
        console.log(`   Auth API error: ${errorBody}`);
      }
    } catch (error) {
      console.log(`   Auth API test failed: ${error.message}`);
    }
    
    console.log('✅ Investigation complete!');
  });
});