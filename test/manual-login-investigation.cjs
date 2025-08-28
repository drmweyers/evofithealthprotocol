/**
 * Manual Login Investigation - Debug Login Functionality Issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3500';
const DEMO_ACCOUNTS = {
  customer: { email: 'customer@demo.com', password: 'Password123@' },
  trainer: { email: 'trainer@demo.com', password: 'Password123@' },
  newUser: { email: 'newuser@demo.com', password: 'SecurePass123@' }
};

async function investigateLoginPage() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized'] 
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  try {
    console.log('🔍 Investigating login functionality...');
    
    // Step 1: Navigate to application root
    console.log('1. Navigating to application root...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    const rootTitle = await page.title();
    console.log(`   Root page title: "${rootTitle}"`);
    await page.screenshot({ path: 'test-screenshots/investigation-root-page.png', fullPage: true });
    
    // Step 2: Check what's visible on the page
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('   Page content preview:', pageText.substring(0, 200) + '...');
    
    // Step 3: Look for login-related elements or navigation
    const loginLink = await page.$('a[href*="login"], button:contains("Login"), a:contains("Login")');
    if (loginLink) {
      console.log('   Found login link/button, clicking it...');
      await loginLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('   No login link found, trying to navigate directly to /login');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(3000);
    }
    
    // Step 4: Check login page
    const loginTitle = await page.title();
    console.log(`   Login page title: "${loginTitle}"`);
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'test-screenshots/investigation-login-page.png', fullPage: true });
    
    // Step 5: Look for form elements
    const formElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return {
        inputs: inputs.map(input => ({ 
          type: input.type, 
          name: input.name, 
          id: input.id, 
          placeholder: input.placeholder 
        })),
        buttons: buttons.map(button => ({ 
          type: button.type, 
          textContent: button.textContent, 
          className: button.className 
        }))
      };
    });
    
    console.log('   Form elements found:');
    console.log('   Inputs:', JSON.stringify(formElements.inputs, null, 2));
    console.log('   Buttons:', JSON.stringify(formElements.buttons, null, 2));
    
    // Step 6: Try to find and fill login form
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Login"), button:contains("Sign")');
    
    if (emailInput && passwordInput && submitButton) {
      console.log('✅ Login form elements found!');
      
      // Step 7: Test with demo customer account
      console.log('2. Testing with demo customer account...');
      await emailInput.type(DEMO_ACCOUNTS.customer.email);
      await passwordInput.type(DEMO_ACCOUNTS.customer.password);
      
      console.log(`   Filled email: ${DEMO_ACCOUNTS.customer.email}`);
      console.log(`   Filled password: [REDACTED]`);
      
      await page.screenshot({ path: 'test-screenshots/investigation-form-filled.png', fullPage: true });
      
      // Step 8: Submit form and observe
      console.log('3. Submitting form...');
      await submitButton.click();
      await page.waitForTimeout(5000); // Wait for response
      
      const afterSubmitUrl = page.url();
      const afterSubmitTitle = await page.title();
      
      console.log(`   URL after submit: ${afterSubmitUrl}`);
      console.log(`   Title after submit: "${afterSubmitTitle}"`);
      
      await page.screenshot({ path: 'test-screenshots/investigation-after-submit.png', fullPage: true });
      
      // Step 9: Check for success/error indicators
      const successIndicators = [
        'dashboard', 'welcome', 'meal plans', 'logout', 'profile',
        'My Meal Plans', 'Customer Dashboard', 'Trainer Dashboard'
      ];
      
      let loginSuccessful = false;
      for (const indicator of successIndicators) {
        try {
          const element = await page.waitForSelector(`text=${indicator}`, { timeout: 1000 });
          if (element) {
            console.log(`✅ Login successful! Found indicator: "${indicator}"`);
            loginSuccessful = true;
            break;
          }
        } catch (e) {
          // Continue checking other indicators
        }
      }
      
      if (!loginSuccessful) {
        console.log('❌ Login may have failed or no success indicators found');
        
        // Check for error messages
        const errorSelectors = ['.error', '.alert', '.text-red-500', '[role="alert"]'];
        for (const selector of errorSelectors) {
          try {
            const errorElement = await page.$(selector);
            if (errorElement) {
              const errorText = await page.evaluate(el => el.textContent, errorElement);
              console.log(`   Error message found: "${errorText}"`);
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      // Step 10: Check network activity
      console.log('4. Checking recent network activity...');
      
    } else {
      console.log('❌ Login form elements not found!');
      console.log(`   Email input: ${emailInput ? 'Found' : 'NOT FOUND'}`);
      console.log(`   Password input: ${passwordInput ? 'Found' : 'NOT FOUND'}`);
      console.log(`   Submit button: ${submitButton ? 'Found' : 'NOT FOUND'}`);
    }
    
  } catch (error) {
    console.error('Error during investigation:', error);
    await page.screenshot({ path: 'test-screenshots/investigation-error.png', fullPage: true });
  } finally {
    console.log('\n📝 Investigation complete. Check test-screenshots/ for visual evidence.');
    await browser.close();
  }
}

// Run investigation
investigateLoginPage().catch(console.error);