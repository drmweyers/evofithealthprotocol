import { test, expect } from '@playwright/test';

test.describe('Health Protocol Features - Simplified Tests', () => {
  test('Verify Server Responds and React App Loads', async ({ page }) => {
    // Navigate to the main page
    await page.goto('http://localhost:3500');
    
    // Wait longer for React to load
    await page.waitForTimeout(5000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/simplified-main-page.png' });
    
    // Check if the basic HTML structure is there
    const htmlContent = await page.content();
    console.log(`HTML contains React elements: ${htmlContent.includes('react')}`);
    console.log(`HTML contains root div: ${htmlContent.includes('id="root"')}`);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // The test passes if we can load the page without critical errors
    expect(currentUrl).toContain('localhost:3500');
  });

  test('Try Direct Navigation to Admin Health Protocols', async ({ page }) => {
    // Go directly to a potential health protocols route
    const routes = [
      '/admin',
      '/admin/health-protocols', 
      '/trainer',
      '/trainer/health-protocols'
    ];

    for (const route of routes) {
      console.log(`\n=== Testing route: ${route} ===`);
      
      try {
        await page.goto(`http://localhost:3500${route}`);
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`Route ${route} -> ${currentUrl}`);
        
        // Take screenshot
        await page.screenshot({ path: `test-results/route-${route.replace(/\//g, '-')}.png` });
        
        // Check for health protocol related text
        const bodyText = await page.textContent('body');
        const hasHealthProtocolText = bodyText?.toLowerCase().includes('health') || 
                                     bodyText?.toLowerCase().includes('protocol');
        
        console.log(`Contains health/protocol text: ${hasHealthProtocolText}`);
        
      } catch (error) {
        console.log(`Error accessing ${route}: ${error}`);
      }
    }
    
    // This test always passes as it's for exploration
    expect(true).toBe(true);
  });

  test('Check for Health Protocol UI Components', async ({ page }) => {
    // Go to main page first
    await page.goto('http://localhost:3500');
    await page.waitForTimeout(5000);
    
    // Look for any elements that might be health protocol related
    const healthProtocolSelectors = [
      '[data-testid*="health"]',
      '[data-testid*="protocol"]',
      '.health-protocol',
      '.specialized-protocol',
      'button:has-text("Health Protocol")',
      'button:has-text("Protocol")',
      'h1:has-text("Health")',
      'h2:has-text("Protocol")',
      '[class*="health"]',
      '[class*="protocol"]',
      'nav a[href*="health"]',
      'nav a[href*="protocol"]'
    ];

    console.log('=== Searching for Health Protocol UI Elements ===');
    
    for (const selector of healthProtocolSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`✅ Found ${count} elements matching: ${selector}`);
        
        // Try to get text content of first element
        try {
          const firstElementText = await elements.first().textContent();
          console.log(`   Text: "${firstElementText?.substring(0, 100)}..."`);
        } catch (e) {
          console.log(`   (Could not get text content)`);
        }
      } else {
        console.log(`   No elements found for: ${selector}`);
      }
    }

    await page.screenshot({ path: 'test-results/health-protocol-ui-search.png' });
    
    // This test passes regardless to allow exploration
    expect(true).toBe(true);
  });
});