import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';
const SCREENSHOT_DIR = 'test-results/screenshots';

test.setTimeout(45000);

test.describe('Health Protocol Dashboard Deep Dive', () => {
  test('Login and Explore Health Protocol Dashboard', async ({ page }) => {
    console.log('=== LOGGING IN AND EXPLORING DASHBOARD ===');
    
    // Navigate to application
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/dashboard-01-login-page.png`, 
      fullPage: true 
    });
    
    // Try logging in as trainer first
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first();
    const signInButton = page.locator('button:has-text("Sign In")').first();
    
    console.log('Attempting to login as Trainer...');
    
    // Use trainer credentials from the visible test credentials
    await emailField.fill('trainer.test@evofitmeals.com');
    await passwordField.fill('TestTrainer123!');
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/dashboard-02-credentials-filled.png`, 
      fullPage: true 
    });
    
    await signInButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/dashboard-03-after-login-click.png`, 
      fullPage: true 
    });
    
    // Check if we're redirected to dashboard or if there's an error
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Look for dashboard elements or error messages
    const errorMessage = await page.locator('.error, [role="alert"], .alert-danger').count();
    const dashboardElements = await page.locator('nav, .dashboard, main, [data-testid*="dashboard"]').count();
    
    console.log(`Found ${errorMessage} error messages`);
    console.log(`Found ${dashboardElements} dashboard elements`);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/dashboard-04-post-login-state.png`, 
      fullPage: true 
    });
    
    // If login successful, explore dashboard features
    if (currentUrl !== BASE_URL && errorMessage === 0) {
      console.log('Login appears successful, exploring dashboard...');
      
      // Look for health protocol specific elements
      const protocolElements = await page.locator('text=/protocol/i').count();
      const healthElements = await page.locator('text=/health/i').count();
      const navigationItems = await page.locator('nav a, [role="navigation"] a').count();
      
      console.log(`Found ${protocolElements} protocol-related elements`);
      console.log(`Found ${healthElements} health-related elements`);
      console.log(`Found ${navigationItems} navigation items`);
      
      // Try to find and click on health protocol features
      const protocolLinks = page.locator('a, button').filter({ hasText: /protocol|health/i });
      const protocolCount = await protocolLinks.count();
      
      if (protocolCount > 0) {
        console.log(`Found ${protocolCount} protocol-related links/buttons`);
        
        // Click on the first protocol-related element
        const firstProtocolElement = protocolLinks.first();
        await firstProtocolElement.scrollIntoViewIfNeeded();
        await firstProtocolElement.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/dashboard-05-protocol-feature-clicked.png`, 
          fullPage: true 
        });
      }
      
      // Look for specialized protocol features mentioned in the codebase
      const specializedProtocols = [
        'longevity', 'parasite cleanse', 'specialized protocol',
        'meal plan', 'recipe', 'nutrition'
      ];
      
      for (const protocol of specializedProtocols) {
        const count = await page.locator(`text=${protocol}`, { hasText: new RegExp(protocol, 'i') }).count();
        if (count > 0) {
          console.log(`Found ${count} "${protocol}" related elements`);
        }
      }
      
      // Test form interactions if any forms are present
      const forms = await page.locator('form').count();
      if (forms > 0) {
        console.log(`Found ${forms} forms on dashboard`);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/dashboard-06-forms-found.png`, 
          fullPage: true 
        });
        
        // Look for protocol generation forms
        const protocolForms = page.locator('form').filter({
          has: page.locator('input, textarea, select')
        });
        
        if (await protocolForms.count() > 0) {
          console.log('Found protocol-related forms, testing interaction...');
          
          // Fill out any text inputs with health-related test data
          const textInputs = protocolForms.first().locator('input[type="text"], textarea');
          const inputCount = await textInputs.count();
          
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = textInputs.nth(i);
            const placeholder = await input.getAttribute('placeholder') || '';
            
            if (placeholder.toLowerCase().includes('name')) {
              await input.fill('John Doe');
            } else if (placeholder.toLowerCase().includes('goal')) {
              await input.fill('Weight loss and muscle gain');
            } else {
              await input.fill('Test health protocol data');
            }
          }
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/dashboard-07-form-filled.png`, 
            fullPage: true 
          });
        }
      }
      
    } else {
      console.log('Login may have failed or resulted in error');
      
      // Try with admin credentials
      console.log('Trying admin credentials...');
      
      await page.goto(BASE_URL);
      await page.waitForTimeout(1000);
      
      const adminEmailField = page.locator('input[type="email"], input[name*="email"]').first();
      const adminPasswordField = page.locator('input[type="password"], input[name*="password"]').first();
      const adminSignInButton = page.locator('button:has-text("Sign In")').first();
      
      await adminEmailField.fill('admin@fitmeals.pro');
      await adminPasswordField.fill('AdminPass123!');
      await adminSignInButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/dashboard-08-admin-login-attempt.png`, 
        fullPage: true 
      });
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/dashboard-09-final-dashboard-state.png`, 
      fullPage: true 
    });
    
    // Get final page analysis
    const finalContent = await page.textContent('body') || '';
    const finalUrl = page.url();
    
    console.log('');
    console.log('=== DASHBOARD EXPLORATION SUMMARY ===');
    console.log('Final URL:', finalUrl);
    console.log('Page content length:', finalContent.length);
    console.log('Health protocol terms in content:');
    
    const healthTerms = ['protocol', 'health', 'meal plan', 'recipe', 'nutrition', 'fitness', 'wellness'];
    healthTerms.forEach(term => {
      const count = (finalContent.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      if (count > 0) {
        console.log(`  - ${term}: ${count} occurrences`);
      }
    });
    
    console.log('✅ Dashboard exploration completed');
  });
});