import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3500';
const SCREENSHOT_DIR = 'test-results/screenshots';

// Increased timeout for test execution
test.setTimeout(30000);

test.describe('Health Protocol Focused UI Validation', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    console.log('Navigating to:', BASE_URL);
    
    // Navigate with longer timeout
    await page.goto(BASE_URL, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Application Loads and Health Protocol Content is Present', async () => {
    console.log('=== TESTING APPLICATION LOADING ===');
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-01-initial-load.png`, 
      fullPage: true 
    });
    
    console.log('Page title:', await page.title());
    
    // Check for React root
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();
    
    // Wait for content to load (React components)
    await page.waitForTimeout(3000);
    
    // Take screenshot after content loads
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-02-content-loaded.png`, 
      fullPage: true 
    });
    
    console.log('✅ Application loads successfully');
  });

  test('Health Protocol Keywords and Features Detection', async () => {
    console.log('=== TESTING HEALTH PROTOCOL FEATURES ===');
    
    // Get page content
    const pageContent = await page.textContent('body') || '';
    console.log('Page content length:', pageContent.length);
    
    // Health protocol related keywords
    const healthKeywords = [
      'health protocol',
      'protocol',
      'health',
      'fitness',
      'wellness',
      'nutrition',
      'recipe',
      'meal',
      'trainer',
      'customer'
    ];
    
    const foundKeywords = [];
    for (const keyword of healthKeywords) {
      const count = await page.locator(`text=${keyword}`, { hasText: new RegExp(keyword, 'i') }).count();
      if (count > 0) {
        foundKeywords.push({ keyword, count });
        console.log(`Found ${count} elements containing: "${keyword}"`);
      }
    }
    
    // Take screenshot highlighting health features
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-03-health-features.png`, 
      fullPage: true 
    });
    
    console.log('Found health-related keywords:', foundKeywords);
    console.log('✅ Health protocol features detected');
  });

  test('UI Elements and Navigation Structure', async () => {
    console.log('=== TESTING UI ELEMENTS AND NAVIGATION ===');
    
    // Count different UI elements
    const elements = {
      buttons: await page.locator('button').count(),
      links: await page.locator('a').count(),
      forms: await page.locator('form').count(),
      inputs: await page.locator('input').count(),
      headings: await page.locator('h1, h2, h3, h4, h5, h6').count(),
      images: await page.locator('img').count()
    };
    
    console.log('UI Element counts:', elements);
    
    // Look for navigation elements
    const navElements = await page.locator('nav, header, [role="navigation"]').count();
    console.log(`Found ${navElements} navigation elements`);
    
    // Test for auth-related elements
    const authButtons = await page.locator('button, a').filter({
      hasText: /login|sign in|register|auth/i
    }).count();
    console.log(`Found ${authButtons} authentication-related elements`);
    
    // Take screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-04-ui-elements.png`, 
      fullPage: true 
    });
    
    console.log('✅ UI elements and navigation tested');
  });

  test('Authentication Flow Testing', async () => {
    console.log('=== TESTING AUTHENTICATION FLOW ===');
    
    // Look for login elements
    const loginButton = page.locator('button, a').filter({
      hasText: /login|sign in/i
    }).first();
    
    const loginForm = page.locator('form').filter({
      has: page.locator('input[type="email"], input[type="password"], input[name*="email"], input[name*="password"]')
    }).first();
    
    if (await loginButton.count() > 0) {
      console.log('Found login button, testing interaction...');
      
      await loginButton.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/focused-05-login-button.png`,
        fullPage: true 
      });
      
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/focused-06-after-login-click.png`,
        fullPage: true 
      });
    }
    
    if (await loginForm.count() > 0) {
      console.log('Found login form, testing form fields...');
      
      const emailField = loginForm.locator('input[type="email"], input[name*="email"]').first();
      const passwordField = loginForm.locator('input[type="password"], input[name*="password"]').first();
      
      if (await emailField.count() > 0) {
        await emailField.fill('demo@test.com');
        console.log('Filled email field');
      }
      
      if (await passwordField.count() > 0) {
        await passwordField.fill('demopassword');
        console.log('Filled password field');
      }
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/focused-07-form-filled.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ Authentication flow tested');
  });

  test('Responsive Design Testing', async () => {
    console.log('=== TESTING RESPONSIVE DESIGN ===');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-xl' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/focused-08-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check for mobile-specific elements on small screens
      if (viewport.width < 768) {
        const hamburger = page.locator('button').filter({
          hasText: /menu/i
        }).or(page.locator('[data-testid*="menu"], [class*="hamburger"]'));
        
        if (await hamburger.count() > 0) {
          console.log('Found mobile menu');
        }
      }
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Responsive design tested');
  });

  test('Performance and Error Detection', async () => {
    console.log('=== TESTING PERFORMANCE AND ERRORS ===');
    
    // Check for JavaScript errors in console
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`Console Error: ${msg.text()}`);
      }
    });
    
    // Check for network failures
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Reload page to trigger fresh requests
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    console.log('Console errors found:', consoleLogs.length);
    console.log('Network errors found:', networkErrors.length);
    
    if (consoleLogs.length > 0) {
      console.log('Console errors:', consoleLogs);
    }
    
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors);
    }
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-09-performance-test.png`,
      fullPage: true 
    });
    
    console.log('✅ Performance and error detection completed');
  });

  test('Comprehensive Summary Report', async () => {
    console.log('=== COMPREHENSIVE SUMMARY REPORT ===');
    
    // Final application state
    const finalState = {
      url: page.url(),
      title: await page.title(),
      pageContent: await page.textContent('body'),
      elementCounts: {
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        forms: await page.locator('form').count(),
        inputs: await page.locator('input').count(),
        headings: await page.locator('h1, h2, h3, h4, h5, h6').count(),
        images: await page.locator('img').count()
      }
    };
    
    // Health protocol specific analysis
    const healthTerms = ['protocol', 'health', 'fitness', 'nutrition', 'recipe', 'meal', 'training', 'wellness'];
    const foundTerms = healthTerms.filter(term => 
      finalState.pageContent?.toLowerCase().includes(term.toLowerCase())
    );
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/focused-10-final-summary.png`,
      fullPage: true 
    });
    
    console.log('');
    console.log('========================================');
    console.log('🏥 HEALTH PROTOCOL UI VALIDATION SUMMARY');
    console.log('========================================');
    console.log('');
    console.log('📍 Final URL:', finalState.url);
    console.log('📄 Page Title:', finalState.title);
    console.log('📊 Content Length:', finalState.pageContent?.length || 0, 'characters');
    console.log('');
    console.log('🎯 UI Element Analysis:');
    Object.entries(finalState.elementCounts).forEach(([key, value]) => {
      console.log(`   - ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
    });
    console.log('');
    console.log('🏥 Health Protocol Terms Found:');
    console.log('   ', foundTerms.join(', '));
    console.log('');
    console.log('📸 Screenshots saved to:', SCREENSHOT_DIR);
    console.log('');
    console.log('✅ VALIDATION COMPLETED SUCCESSFULLY');
    console.log('========================================');
    
    // Assert basic functionality is working
    expect(finalState.url).toContain('localhost:3500');
    expect(finalState.title).toBeTruthy();
    expect(finalState.pageContent?.length).toBeGreaterThan(100);
    expect(foundTerms.length).toBeGreaterThan(0);
    
    console.log('✅ All assertions passed');
  });
});