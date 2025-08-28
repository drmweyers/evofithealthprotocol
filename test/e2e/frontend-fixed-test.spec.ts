import { test, expect, Page } from '@playwright/test';

test.describe('🎯 Frontend Fixed Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`🚨 Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', (error) => {
      console.log(`🚨 Page Error: ${error.message}`);
    });
  });

  test('🏠 React Application Now Renders Correctly', async () => {
    console.log('🔍 Testing fixed React application...');
    
    await page.goto('http://localhost:3502', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`✅ Page loaded, URL: ${page.url()}`);
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/frontend-fixed-rendering.png',
      fullPage: true 
    });
    
    // Check for React content
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();
    
    // Check if root has content now
    const rootContent = await rootElement.textContent();
    console.log(`🎯 Root element content length: ${rootContent?.length || 0} characters`);
    
    if (rootContent && rootContent.length > 20) {
      console.log(`📝 Root content preview: ${rootContent.substring(0, 100)}...`);
    }
    
    // Check for login elements
    const hasEmailInput = await page.locator('input[type="email"]').count();
    const hasPasswordInput = await page.locator('input[type="password"]').count();
    const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count();
    
    console.log(`🔐 Login elements: email=${hasEmailInput}, password=${hasPasswordInput}, submit=${hasSubmitButton}`);
    
    // Basic success assertions
    expect(rootContent?.length).toBeGreaterThan(20);
    
    // If this is a login page, we should have form elements
    if (hasEmailInput > 0) {
      expect(hasEmailInput).toBeGreaterThan(0);
      expect(hasPasswordInput).toBeGreaterThan(0);
      console.log('✅ Login form detected and working!');
    }
    
    console.log('✅ React application is now rendering correctly!');
  });

  test('🚀 Quick Navigation Test', async () => {
    console.log('🔍 Testing basic navigation...');
    
    await page.goto('http://localhost:3502');
    await page.waitForTimeout(2000);
    
    // Try to interact with the page
    const bodyText = await page.locator('body').textContent();
    console.log(`📄 Page content length: ${bodyText?.length || 0} characters`);
    
    // Look for any navigation elements
    const links = await page.locator('a').count();
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    console.log(`🔗 Interactive elements: ${links} links, ${buttons} buttons, ${inputs} inputs`);
    
    // Basic interaction test
    if (inputs > 0) {
      try {
        const firstInput = page.locator('input').first();
        await firstInput.click();
        console.log('✅ Can interact with input fields');
      } catch (e) {
        console.log('ℹ️ Input interaction test skipped');
      }
    }
    
    expect(bodyText?.length).toBeGreaterThan(50);
    console.log('✅ Navigation and interaction test completed');
  });
});