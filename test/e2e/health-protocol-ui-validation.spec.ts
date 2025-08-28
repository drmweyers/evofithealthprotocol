import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:3500';
const SCREENSHOT_DIR = 'test-results/screenshots';

test.describe('Health Protocol UI Validation', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set a reasonable viewport size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to the application
    console.log('Navigating to:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('1. Application Loading and Initial State', async () => {
    console.log('Testing application loading...');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/01-initial-load.png`, 
      fullPage: true 
    });
    
    // Check if the page title is set
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toBeTruthy();
    
    // Check for basic page structure
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for React root or main container
    const reactRoot = page.locator('#root, [data-reactroot], main, .app');
    await expect(reactRoot.first()).toBeVisible();
    
    console.log('✅ Application loads successfully');
  });

  test('2. Navigation and Header Elements', async () => {
    console.log('Testing navigation and header elements...');
    
    // Look for common navigation elements
    const navElements = [
      'nav',
      'header', 
      '[role="navigation"]',
      'a[href]',
      'button'
    ];
    
    for (const selector of navElements) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`Found ${elements} elements with selector: ${selector}`);
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/02-navigation-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
          fullPage: true 
        });
        break;
      }
    }
    
    // Check for login/auth related elements
    const authElements = await page.locator('button, a, input').filter({
      hasText: /login|sign in|register|auth/i
    }).count();
    
    if (authElements > 0) {
      console.log('Found authentication elements');
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/02-auth-elements.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ Navigation elements identified');
  });

  test('3. Health Protocol Features Discovery', async () => {
    console.log('Discovering health protocol features...');
    
    // Look for health protocol related text and elements
    const healthProtocolKeywords = [
      'health protocol',
      'protocol',
      'health',
      'fitness',
      'wellness',
      'nutrition',
      'recipe',
      'meal plan',
      'trainer',
      'customer'
    ];
    
    const foundKeywords: string[] = [];
    
    for (const keyword of healthProtocolKeywords) {
      const elements = await page.locator(`text=${keyword}`, { hasText: new RegExp(keyword, 'i') }).count();
      if (elements > 0) {
        foundKeywords.push(keyword);
        console.log(`Found ${elements} elements containing: "${keyword}"`);
      }
    }
    
    // Take screenshot showing discovered content
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/03-health-protocol-discovery.png`,
      fullPage: true 
    });
    
    // Look for specific health protocol components
    const protocolComponents = [
      '[data-testid*="protocol"]',
      '[class*="protocol"]',
      '[id*="protocol"]',
      'button:has-text("Create")',
      'button:has-text("Generate")',
      'form',
      'input[type="text"]',
      'textarea'
    ];
    
    for (const selector of protocolComponents) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
      }
    }
    
    console.log('✅ Health protocol features discovered');
    console.log('Found keywords:', foundKeywords);
  });

  test('4. Authentication Flow Testing', async () => {
    console.log('Testing authentication flow...');
    
    // Look for login button or form
    const loginButton = page.locator('button, a').filter({
      hasText: /login|sign in/i
    }).first();
    
    const loginForm = page.locator('form').filter({
      has: page.locator('input[type="email"], input[type="password"], input[name*="email"], input[name*="password"]')
    }).first();
    
    if (await loginButton.count() > 0) {
      console.log('Found login button, testing click...');
      await loginButton.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/04-login-button-found.png`,
        fullPage: true 
      });
      
      await loginButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/04-after-login-click.png`,
        fullPage: true 
      });
    }
    
    if (await loginForm.count() > 0) {
      console.log('Found login form, testing form interaction...');
      
      // Try to find email and password fields
      const emailField = loginForm.locator('input[type="email"], input[name*="email"], input[placeholder*="email" i]').first();
      const passwordField = loginForm.locator('input[type="password"], input[name*="password"], input[placeholder*="password" i]').first();
      
      if (await emailField.count() > 0 && await passwordField.count() > 0) {
        // Test form interaction with demo credentials
        await emailField.fill('demo@example.com');
        await passwordField.fill('demopassword');
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/04-login-form-filled.png`,
          fullPage: true 
        });
        
        // Look for submit button
        const submitButton = loginForm.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        
        if (await submitButton.count() > 0) {
          console.log('Testing form submission...');
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/04-after-login-submit.png`,
            fullPage: true 
          });
          
          // Check if login was successful or if there are error messages
          const errorMessages = await page.locator('.error, [role="alert"], .alert-danger, .text-red').count();
          if (errorMessages > 0) {
            console.log('Found error messages after login attempt');
          }
        }
      }
    }
    
    console.log('✅ Authentication flow tested');
  });

  test('5. Health Protocol Generation Testing', async () => {
    console.log('Testing health protocol generation features...');
    
    // First check if we need to be logged in
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/05-current-state.png`,
      fullPage: true 
    });
    
    // Look for protocol-related buttons and forms
    const createButtons = page.locator('button').filter({
      hasText: /create|generate|new|add/i
    });
    
    const protocolForms = page.locator('form').filter({
      has: page.locator('input, textarea, select')
    });
    
    console.log(`Found ${await createButtons.count()} create/generate buttons`);
    console.log(`Found ${await protocolForms.count()} forms`);
    
    // Test clicking create/generate buttons
    if (await createButtons.count() > 0) {
      const firstCreateButton = createButtons.first();
      console.log('Testing create button click...');
      
      await firstCreateButton.scrollIntoViewIfNeeded();
      await firstCreateButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/05-after-create-click.png`,
        fullPage: true 
      });
    }
    
    // Test form interactions if available
    if (await protocolForms.count() > 0) {
      const firstForm = protocolForms.first();
      console.log('Testing form interactions...');
      
      // Find input fields in the form
      const textInputs = firstForm.locator('input[type="text"], input:not([type]), textarea');
      const selects = firstForm.locator('select');
      const checkboxes = firstForm.locator('input[type="checkbox"]');
      
      // Fill out text inputs
      for (let i = 0; i < Math.min(await textInputs.count(), 3); i++) {
        const input = textInputs.nth(i);
        const placeholder = await input.getAttribute('placeholder') || '';
        const name = await input.getAttribute('name') || '';
        
        let testValue = 'Test Value';
        if (placeholder.toLowerCase().includes('name') || name.toLowerCase().includes('name')) {
          testValue = 'John Doe';
        } else if (placeholder.toLowerCase().includes('email') || name.toLowerCase().includes('email')) {
          testValue = 'john@example.com';
        } else if (placeholder.toLowerCase().includes('age') || name.toLowerCase().includes('age')) {
          testValue = '30';
        }
        
        await input.fill(testValue);
      }
      
      // Select from dropdowns
      for (let i = 0; i < Math.min(await selects.count(), 2); i++) {
        const select = selects.nth(i);
        const options = await select.locator('option').count();
        if (options > 1) {
          await select.selectOption({ index: 1 });
        }
      }
      
      // Check some checkboxes
      for (let i = 0; i < Math.min(await checkboxes.count(), 2); i++) {
        await checkboxes.nth(i).check();
      }
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/05-form-filled.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ Health protocol generation features tested');
  });

  test('6. UI Responsiveness Testing', async () => {
    console.log('Testing UI responsiveness...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow time for responsive changes
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/06-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check for mobile menu or hamburger button on smaller screens
      if (viewport.width < 768) {
        const hamburger = page.locator('button').filter({
          hasText: /menu|☰|≡/
        }).or(page.locator('[data-testid*="menu"], [class*="hamburger"], [class*="menu-toggle"]'));
        
        if (await hamburger.count() > 0) {
          console.log('Found mobile menu button');
          await hamburger.first().click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/06-mobile-menu-${viewport.name}.png`,
            fullPage: true 
          });
        }
      }
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ UI responsiveness tested');
  });

  test('7. Error Handling and Edge Cases', async () => {
    console.log('Testing error handling and edge cases...');
    
    // Test invalid form submissions
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const firstForm = forms.first();
      
      // Try to submit empty form
      const submitButton = firstForm.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        console.log('Testing empty form submission...');
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/07-empty-form-submit.png`,
          fullPage: true 
        });
        
        // Check for validation messages
        const validationMessages = await page.locator('.error, [role="alert"], .invalid-feedback, .text-red, .text-danger').count();
        console.log(`Found ${validationMessages} validation messages`);
      }
    }
    
    // Test navigation to non-existent pages
    const currentUrl = page.url();
    const testUrls = [
      `${BASE_URL}/non-existent-page`,
      `${BASE_URL}/404-test`,
      `${BASE_URL}/invalid-route`
    ];
    
    for (const testUrl of testUrls) {
      try {
        console.log(`Testing navigation to: ${testUrl}`);
        await page.goto(testUrl);
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/07-404-test-${testUrl.split('/').pop()}.png`,
          fullPage: true 
        });
        
        // Check if 404 page or error page is shown
        const errorContent = await page.locator('text=/404|not found|error/i').count();
        console.log(`Found ${errorContent} error-related content elements`);
      } catch (error) {
        console.log(`Error navigating to ${testUrl}:`, error);
      }
    }
    
    // Return to original page
    await page.goto(currentUrl);
    
    console.log('✅ Error handling tested');
  });

  test('8. Interactive Elements and User Workflows', async () => {
    console.log('Testing interactive elements and user workflows...');
    
    // Test all clickable elements
    const clickableElements = page.locator('button, a, [role="button"], input[type="button"], input[type="submit"]');
    const elementCount = await clickableElements.count();
    console.log(`Found ${elementCount} clickable elements`);
    
    // Test first few interactive elements
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = clickableElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent() || '';
      const isVisible = await element.isVisible();
      
      console.log(`Element ${i}: ${tagName} - "${text.slice(0, 30)}" - Visible: ${isVisible}`);
      
      if (isVisible && text.toLowerCase() !== 'delete' && !text.toLowerCase().includes('remove')) {
        try {
          await element.scrollIntoViewIfNeeded();
          await element.click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/08-interaction-${i}-${tagName.toLowerCase()}.png`,
            fullPage: true 
          });
        } catch (error) {
          console.log(`Could not click element ${i}:`, error);
        }
      }
    }
    
    // Test keyboard navigation
    console.log('Testing keyboard navigation...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/08-keyboard-navigation.png`,
      fullPage: true 
    });
    
    console.log('✅ Interactive elements tested');
  });

  test('9. Performance and Loading States', async () => {
    console.log('Testing performance and loading states...');
    
    // Measure page load performance
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        networkLatency: navigation.responseEnd - navigation.requestStart
      };
    });
    
    console.log('Performance metrics:', performanceEntries);
    
    // Check for loading indicators
    const loadingIndicators = await page.locator('.loading, .spinner, [role="progressbar"], .skeleton').count();
    console.log(`Found ${loadingIndicators} loading indicators`);
    
    // Test slow network conditions (if applicable)
    const context = page.context();
    await context.route('**/*', (route) => {
      // Add small delay to simulate slower network
      setTimeout(() => route.continue(), 100);
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/09-performance-test.png`,
      fullPage: true 
    });
    
    console.log('✅ Performance testing completed');
  });

  test('10. Comprehensive Summary and Validation', async () => {
    console.log('Creating comprehensive summary...');
    
    // Take final screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/10-final-state.png`,
      fullPage: true 
    });
    
    // Gather all page content for analysis
    const pageContent = await page.textContent('body') || '';
    const pageTitle = await page.title();
    const currentUrl = page.url();
    
    // Count different types of elements
    const elementCounts = {
      buttons: await page.locator('button').count(),
      links: await page.locator('a').count(),
      forms: await page.locator('form').count(),
      inputs: await page.locator('input').count(),
      images: await page.locator('img').count(),
      headings: await page.locator('h1, h2, h3, h4, h5, h6').count()
    };
    
    console.log('=== HEALTH PROTOCOL UI VALIDATION SUMMARY ===');
    console.log(`Final URL: ${currentUrl}`);
    console.log(`Page Title: ${pageTitle}`);
    console.log('Element Counts:', elementCounts);
    console.log(`Page Content Length: ${pageContent.length} characters`);
    console.log('Screenshots saved to:', SCREENSHOT_DIR);
    
    // Check for common health protocol terms in content
    const healthTerms = ['protocol', 'health', 'fitness', 'nutrition', 'recipe', 'meal', 'training'];
    const foundTerms = healthTerms.filter(term => 
      pageContent.toLowerCase().includes(term.toLowerCase())
    );
    console.log('Health-related terms found:', foundTerms);
    
    console.log('✅ Comprehensive validation completed');
  });
});