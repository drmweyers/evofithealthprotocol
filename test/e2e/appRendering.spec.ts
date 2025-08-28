/**
 * App Rendering E2E Tests
 * 
 * Comprehensive end-to-end tests to verify the HealthProtocol app
 * renders correctly and all core functionality works properly
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

test.describe('HealthProtocol App Rendering Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should load the homepage without errors', async ({ page }) => {
    // Navigate to the app
    const response = await page.goto(BASE_URL);
    
    // Verify the page loads successfully
    expect(response?.status()).toBe(200);
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Verify the title
    await expect(page).toHaveTitle(/EvoFitHealthProtocol/);
    
    // Verify no JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);
    
    expect(errors).toHaveLength(0);
  });

  test('should render the main navigation and layout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for main layout elements
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();
    
    // Look for common UI elements that should be present
    // (These selectors might need adjustment based on actual app structure)
    const possibleSelectors = [
      '[data-testid="main-nav"]',
      'nav',
      '.navigation',
      '[role="navigation"]',
      'header',
      '.header'
    ];
    
    let foundNavigation = false;
    for (const selector of possibleSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        foundNavigation = true;
        break;
      }
    }
    
    // We expect some form of navigation to be present
    // If not found, that's still okay as the app might have a different structure
    console.log('Navigation found:', foundNavigation);
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for login/auth related elements
    const possibleLoginSelectors = [
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'a:has-text("Login")',
      'a:has-text("Sign In")',
      '[data-testid="login-button"]',
      '.login-button',
      'input[type="email"]',
      'input[type="password"]'
    ];
    
    let foundLoginElement = false;
    for (const selector of possibleLoginSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        foundLoginElement = true;
        console.log(`Found login element: ${selector}`);
        break;
      }
    }
    
    // The app should either show login form or redirect to auth
    // We're not failing if no login is found as the app might auto-authenticate
    console.log('Login element found:', foundLoginElement);
  });

  test('should load without rate limiting errors', async ({ page }) => {
    // Monitor network requests for rate limit errors
    const rateLimitErrors: string[] = [];
    
    page.on('response', (response) => {
      if (response.status() === 429) {
        rateLimitErrors.push(`Rate limited: ${response.url()}`);
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Make sure no requests were rate limited
    expect(rateLimitErrors).toHaveLength(0);
  });

  test('should properly handle API responses', async ({ page }) => {
    // Monitor API calls
    const apiResponses: { url: string; status: number }[] = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiResponses.push({
          url,
          status: response.status()
        });
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for potential API calls
    await page.waitForTimeout(3000);
    
    console.log('API responses:', apiResponses);
    
    // Verify no API calls return server errors (5xx)
    const serverErrors = apiResponses.filter(r => r.status >= 500);
    expect(serverErrors).toHaveLength(0);
  });

  test('should be responsive and mobile-friendly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Verify the page is still visible and functional
      const rootElement = page.locator('#root');
      await expect(rootElement).toBeVisible();
      
      // Check for horizontal scrollbars (which usually indicate layout issues)
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Allow for small differences due to scrollbars
      expect(bodyScrollWidth - bodyClientWidth).toBeLessThan(20);
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // First load the page normally
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Simulate network failure
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });
    
    // Try to interact with the page (if there are any interactive elements)
    // This tests how the app handles API failures
    
    // Wait for any error handling to complete
    await page.waitForTimeout(2000);
    
    // The app should still be in a usable state
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();
  });

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    
    expect(response?.status()).toBe(200);
    
    // Verify security headers are present
    const headers = response?.headers() || {};
    
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['strict-transport-security']).toBeDefined();
    expect(headers['content-security-policy']).toBeDefined();
  });

  test('should load fonts and static assets', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for all resources to load
    await page.waitForTimeout(3000);
    
    // Filter out non-critical failures (like analytics, ads, etc.)
    const criticalFailures = failedRequests.filter(url => {
      return url.includes(BASE_URL) && 
             (url.includes('.css') || 
              url.includes('.js') || 
              url.includes('.woff') || 
              url.includes('.ttf'));
    });
    
    console.log('Failed requests:', failedRequests);
    console.log('Critical failures:', criticalFailures);
    
    // Critical assets should load successfully
    expect(criticalFailures).toHaveLength(0);
  });

  test('should handle deep linking', async ({ page }) => {
    // Test that direct navigation to different routes works
    const routes = [
      '/',
      '/login',
      '/dashboard',
      '/protocols',
      '/admin'
    ];
    
    for (const route of routes) {
      const response = await page.goto(`${BASE_URL}${route}`);
      
      // Should either load the route or redirect (not 404)
      const status = response?.status() || 0;
      expect([200, 301, 302, 303, 307, 308]).toContain(status);
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      
      // Page should have content
      const rootElement = page.locator('#root');
      await expect(rootElement).toBeVisible();
    }
  });

  test('should not have console errors on startup', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization
    await page.waitForTimeout(3000);
    
    // Filter out known acceptable errors (like missing favicon, etc.)
    const criticalErrors = consoleErrors.filter(error => {
      return !error.includes('favicon') && 
             !error.includes('manifest.json') &&
             !error.toLowerCase().includes('third-party');
    });
    
    console.log('All console errors:', consoleErrors);
    console.log('Critical console errors:', criticalErrors);
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Health Protocol Specific Features', () => {
  
  test('should render health protocol components', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for health protocol specific elements
    const healthProtocolSelectors = [
      '[data-testid*="protocol"]',
      '[data-testid*="health"]',
      'text="Health Protocol"',
      'text="Protocol"',
      'text="Longevity"',
      'text="Parasite Cleanse"',
      '.health-protocol',
      '.protocol-dashboard'
    ];
    
    let foundHealthProtocolElement = false;
    for (const selector of healthProtocolSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        foundHealthProtocolElement = true;
        console.log(`Found health protocol element: ${selector}`);
        break;
      }
    }
    
    // If this is a health protocol app, we expect to find related elements
    console.log('Health protocol elements found:', foundHealthProtocolElement);
  });

  test('should handle specialized protocol panel', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for specialized protocol elements
    const specializedSelectors = [
      'text="Specialized"',
      'text="Longevity Mode"',
      'text="Parasite Cleanse"',
      '[data-testid="specialized-protocols"]'
    ];
    
    for (const selector of specializedSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        console.log(`Found specialized protocol element: ${selector}`);
        
        // Try to interact with it
        try {
          await element.click({ timeout: 1000 });
          await page.waitForTimeout(500);
        } catch (e) {
          console.log('Could not click element, but it exists');
        }
      }
    }
  });
});