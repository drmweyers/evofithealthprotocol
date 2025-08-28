import { test, expect, Page } from '@playwright/test';

test.describe('🔬 Quick Frontend Diagnosis', () => {
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

  test('🏠 Basic application loading test', async () => {
    console.log('🔍 Testing basic application loading...');
    
    try {
      await page.goto('http://localhost:3500', { waitUntil: 'networkidle' });
      console.log(`✅ Page loaded, URL: ${page.url()}`);
      
      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);
      
      // Take a screenshot to see what's actually rendered
      await page.screenshot({ 
        path: 'test-results/diagnosis-page-load.png',
        fullPage: true 
      });
      
      // Get the page content
      const bodyText = await page.locator('body').textContent();
      console.log(`📝 Body content length: ${bodyText?.length || 0} characters`);
      if (bodyText) {
        console.log(`📝 Body content preview: ${bodyText.substring(0, 200)}...`);
      }
      
      // Check for common React elements
      const reactElements = [
        'div[id="root"]',
        'div[id="app"]',
        'div[class*="App"]',
        'form',
        'input',
        'button'
      ];
      
      for (const selector of reactElements) {
        try {
          const element = page.locator(selector);
          const count = await element.count();
          if (count > 0) {
            console.log(`✅ Found ${count} element(s) matching: ${selector}`);
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Check if it's a login page
      const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
      const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
      const hasLoginButton = await page.locator('button:has-text("Login"), button:has-text("Sign In")').count() > 0;
      
      console.log(`🔐 Login form elements found: email=${hasEmailInput}, password=${hasPasswordInput}, button=${hasLoginButton}`);
      
      expect(title).toBeTruthy();
      expect(bodyText?.length).toBeGreaterThan(10);
      
    } catch (error) {
      console.log(`❌ Error during page load: ${error}`);
      
      // Still take a screenshot to see what happened
      await page.screenshot({ 
        path: 'test-results/diagnosis-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('🔗 API endpoint health check', async () => {
    console.log('🔍 Testing API endpoints...');
    
    // Test some basic API endpoints
    const endpoints = [
      '/api/health',
      '/api/auth/verify-token',
      '/api/users/profile'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(`http://localhost:3500${endpoint}`);
        console.log(`📡 ${endpoint}: ${response.status()} ${response.statusText()}`);
      } catch (error) {
        console.log(`📡 ${endpoint}: Error - ${error}`);
      }
    }
  });

  test('🎨 CSS and assets loading', async () => {
    console.log('🔍 Testing CSS and asset loading...');
    
    await page.goto('http://localhost:3500');
    
    // Check if CSS is loaded by looking for styled elements
    const styledElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.color !== 'rgb(0, 0, 0)' || 
               style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
               style.fontSize !== '16px';
      }).length;
    });
    
    console.log(`🎨 Found ${styledElements} styled elements (CSS appears to be working)`);
    
    // Check for common CSS frameworks
    const hasBootstrap = await page.locator('[class*="btn"], [class*="container"], [class*="row"]').count();
    const hasTailwind = await page.locator('[class*="flex"], [class*="grid"], [class*="p-"], [class*="m-"]').count();
    
    console.log(`🎨 CSS frameworks detected: Bootstrap-like=${hasBootstrap}, Tailwind-like=${hasTailwind}`);
  });

  test('⚡ React application health', async () => {
    console.log('🔍 Testing React application health...');
    
    await page.goto('http://localhost:3500');
    
    // Check if React is loaded by looking for React DevTools or React elements
    const reactCheck = await page.evaluate(() => {
      // Check for React on window
      const hasReact = typeof window.React !== 'undefined' || 
                      typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
      
      // Check for React root element
      const rootElement = document.getElementById('root') || document.getElementById('app');
      const hasRootElement = !!rootElement;
      
      // Check if root has children (React has rendered)
      const hasRenderedContent = rootElement && rootElement.children.length > 0;
      
      return {
        hasReact,
        hasRootElement,
        hasRenderedContent,
        rootChildren: rootElement?.children.length || 0
      };
    });
    
    console.log(`⚡ React health check:`, reactCheck);
    
    expect(reactCheck.hasRootElement).toBe(true);
    expect(reactCheck.rootChildren).toBeGreaterThan(0);
  });
});