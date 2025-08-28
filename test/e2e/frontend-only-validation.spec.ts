import { test, expect, Page } from '@playwright/test';

test.describe('🎯 Frontend-Only Validation', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Enable console logging
    page.on('console', (msg) => {
      console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', (error) => {
      console.log(`🚨 Page Error: ${error.message}`);
    });
  });

  test('🏠 React Application Renders on Frontend Server', async () => {
    console.log('🔍 Testing React application rendering on frontend-only server...');
    
    try {
      await page.goto('http://localhost:3501', { 
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log(`✅ Page loaded, URL: ${page.url()}`);
      
      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);
      
      // Wait a bit more for React to render
      await page.waitForTimeout(3000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/frontend-only-rendering.png',
        fullPage: true 
      });
      
      // Check if React has rendered content
      const bodyText = await page.locator('body').textContent();
      console.log(`📝 Body content length: ${bodyText?.length || 0} characters`);
      
      if (bodyText && bodyText.length > 50) {
        console.log(`📝 Body content preview: ${bodyText.substring(0, 200)}...`);
      }
      
      // Check for React root element
      const rootElement = page.locator('#root');
      await expect(rootElement).toBeVisible();
      
      // Check if root has content
      const rootContent = await rootElement.textContent();
      console.log(`🎯 Root element content length: ${rootContent?.length || 0} characters`);
      
      // Look for common React app elements
      const hasLoginElements = await page.locator('input[type="email"], input[type="password"], button:has-text("Login")').count();
      console.log(`🔐 Found ${hasLoginElements} login-related elements`);
      
      // Check for any error messages
      const errorMessages = await page.locator('text=/error/i, text=/failed/i, text=/not found/i').count();
      console.log(`❌ Found ${errorMessages} potential error messages`);
      
      // Basic assertions
      expect(title).toBeTruthy();
      expect(bodyText?.length).toBeGreaterThan(20);
      
    } catch (error) {
      console.log(`❌ Error during frontend test: ${error}`);
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'test-results/frontend-only-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('🎨 CSS and Styling Verification', async () => {
    console.log('🔍 Testing CSS and styling...');
    
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(3000);
    
    // Check if elements are styled
    const styledElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.color !== 'rgb(0, 0, 0)' || 
               style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
               style.padding !== '0px' ||
               style.margin !== '0px';
      }).length;
    });
    
    console.log(`🎨 Found ${styledElements} styled elements`);
    
    // Check for CSS frameworks
    const tailwindClasses = await page.locator('[class*="flex"], [class*="p-"], [class*="m-"], [class*="bg-"], [class*="text-"]').count();
    console.log(`🎨 Found ${tailwindClasses} Tailwind-style classes`);
    
    expect(styledElements).toBeGreaterThan(5);
  });

  test('⚛️ React Component Health Check', async () => {
    console.log('🔍 Testing React component health...');
    
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(3000);
    
    // Check for React components
    const reactHealth = await page.evaluate(() => {
      // Check if React has rendered anything
      const root = document.getElementById('root');
      const hasContent = root && root.children.length > 0;
      
      // Check for common React patterns
      const hasReactElements = document.querySelectorAll('[data-reactroot], [class*="react"]').length > 0;
      
      // Check for component-like structures
      const hasComponents = document.querySelectorAll('div[class], button, input, form').length > 0;
      
      return {
        hasContent,
        hasReactElements,
        hasComponents,
        rootChildren: root ? root.children.length : 0,
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log(`⚛️ React health check:`, reactHealth);
    
    expect(reactHealth.hasContent).toBe(true);
    expect(reactHealth.rootChildren).toBeGreaterThan(0);
    expect(reactHealth.totalElements).toBeGreaterThan(10);
  });

  test('🔍 Console Error Analysis', async () => {
    console.log('🔍 Analyzing console errors...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(5000);
    
    // Navigate around a bit to trigger any lazy-loaded components
    try {
      await page.click('body');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);
    } catch {
      // Continue if interaction fails
    }
    
    // Report findings
    console.log(`🔍 Analysis complete:`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   ⚠️ Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('🚨 Errors found:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ Warnings found:');
      warnings.slice(0, 3).forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    // Allow some errors but not too many
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('📱 Basic Responsiveness Check', async () => {
    console.log('🔍 Testing basic responsiveness...');
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/frontend-desktop-view.png',
      fullPage: true 
    });
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/frontend-tablet-view.png',
      fullPage: true 
    });
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/frontend-mobile-view.png',
      fullPage: true 
    });
    
    console.log('✅ Responsiveness screenshots captured');
  });
});