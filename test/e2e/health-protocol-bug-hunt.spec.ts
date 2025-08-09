/**
 * HEALTH PROTOCOL BUG HUNTING TEST
 * Focus: Identify specific issues with health protocol generation and display
 * Agent: Bug Detective & Fixer #6
 */

import { test, expect } from '@playwright/test';

test.describe('Health Protocol Bug Hunt', () => {
  test('health protocol navigation and generation flow', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warn') {
        warnings.push(msg.text());
      }
    });

    // Login as trainer
    await page.goto('http://localhost:4000');
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer');
    
    console.log('✅ Trainer login successful');
    await page.screenshot({ path: 'test/screenshots/trainer-dashboard.png' });

    // Look for Health Protocols navigation
    try {
      // Try multiple selectors for Health Protocols
      const healthProtocolSelectors = [
        'a:has-text("Health Protocols")',
        'button:has-text("Health Protocols")', 
        '[data-testid="health-protocols"]',
        'text=Health Protocols',
        '.nav-link:has-text("Health Protocols")',
        '[href*="health-protocol"]'
      ];

      let healthProtocolFound = false;
      for (const selector of healthProtocolSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found Health Protocols navigation with selector: ${selector}`);
          await element.click();
          healthProtocolFound = true;
          break;
        }
      }

      if (!healthProtocolFound) {
        console.log('❌ Health Protocols navigation not found. Available navigation:');
        const navElements = await page.locator('nav a, .nav-link, button').allTextContents();
        console.log('Navigation elements:', navElements);
        
        await page.screenshot({ path: 'test/screenshots/no-health-protocols-nav.png' });
        throw new Error('Health Protocols navigation not found');
      }

    } catch (error) {
      console.log('❌ Error navigating to Health Protocols:', error);
      await page.screenshot({ path: 'test/screenshots/health-protocol-nav-error.png' });
      throw error;
    }

    // Wait for health protocols page to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test/screenshots/health-protocols-page.png' });

    // Look for health protocol generation interface
    console.log('🔍 Looking for health protocol generation interface...');
    
    const pageContent = await page.textContent('body');
    console.log('Page contains the following text (first 500 chars):', pageContent?.substring(0, 500));

    // Check for specific health protocol elements
    const protocolElements = await page.locator('text=Health Issues, text=Protocols, text=Generate, text=Ailments, text=Diabetes, text=Hypertension').count();
    console.log(`Found ${protocolElements} health protocol related elements`);

    if (protocolElements === 0) {
      console.log('❌ No health protocol elements found');
      const allText = await page.locator('body').textContent();
      console.log('Full page text:', allText?.substring(0, 1000));
    } else {
      console.log('✅ Health protocol elements found');
    }

    // Try to configure ailments
    try {
      // Look for ailments configuration
      const ailmentCheckboxes = await page.locator('input[type="checkbox"]').count();
      console.log(`Found ${ailmentCheckboxes} checkboxes`);

      if (ailmentCheckboxes > 0) {
        // Try to click first checkbox
        await page.locator('input[type="checkbox"]').first().click();
        console.log('✅ Clicked first ailment checkbox');
      }

      // Look for generate button
      const generateButtons = await page.locator('button:has-text("Generate")').count();
      console.log(`Found ${generateButtons} generate buttons`);

      if (generateButtons > 0) {
        console.log('✅ Generate button found');
        // Don't actually click yet, just verify it exists
      }

    } catch (error) {
      console.log('❌ Error configuring ailments:', error);
    }

    // Log any console errors/warnings
    console.log('Console errors during health protocol flow:', errors);
    console.log('Console warnings during health protocol flow:', warnings);

    // Final screenshot
    await page.screenshot({ path: 'test/screenshots/health-protocol-final-state.png' });
  });

  test('admin panel health protocol visibility', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:4000');
    await page.fill('input[type="email"]', 'admin@fitmeal.pro');
    await page.fill('input[type="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');
    
    // Wait for admin dashboard
    await page.waitForTimeout(5000);
    console.log('Current URL after admin login:', page.url());
    await page.screenshot({ path: 'test/screenshots/admin-dashboard.png' });

    // Look for health protocol management
    try {
      // Check if we're on admin page
      const pageText = await page.textContent('body');
      console.log('Admin page contains:', pageText?.substring(0, 500));

      // Look for admin navigation
      const adminNavElements = await page.locator('a, button, .nav-link').allTextContents();
      console.log('Admin navigation elements:', adminNavElements);

      // Try to find health protocols section
      const healthProtocolCount = await page.locator('text=Health Protocol').count();
      console.log(`Found ${healthProtocolCount} "Health Protocol" references`);

      if (healthProtocolCount > 0) {
        console.log('✅ Health Protocols section found in admin');
        await page.locator('text=Health Protocol').first().click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test/screenshots/admin-health-protocols.png' });
      } else {
        console.log('❌ No Health Protocols section found in admin panel');
      }

    } catch (error) {
      console.log('❌ Error in admin health protocol check:', error);
      await page.screenshot({ path: 'test/screenshots/admin-health-protocol-error.png' });
    }
  });

  test('database protocol count verification', async ({ page }) => {
    // This test will check if protocols exist in the database by checking the UI

    // Login as trainer
    await page.goto('http://localhost:4000');
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer');

    console.log('🔍 Checking for existing health protocols...');

    // Navigate to any protocols list if available
    try {
      const protocolsText = await page.locator('text=protocol, text=Protocol').count();
      console.log(`Found ${protocolsText} protocol-related text elements`);

      // Look for protocol counts or lists
      const numbers = await page.locator('text=/\\d+/', ':text-is("0"), :text-is("1"), :text-is("2")').allTextContents();
      console.log('Numbers found on page (may include protocol counts):', numbers);

      // Check if there's any indication of protocol data
      const pageContent = await page.textContent('body');
      const hasProtocolData = pageContent?.includes('protocol') || pageContent?.includes('Protocol');
      
      console.log(`Page contains protocol-related content: ${hasProtocolData}`);

      if (hasProtocolData) {
        console.log('✅ Some protocol data found');
      } else {
        console.log('❌ No protocol data found - this may indicate the bug');
      }

    } catch (error) {
      console.log('❌ Error checking protocol data:', error);
    }

    await page.screenshot({ path: 'test/screenshots/protocol-data-check.png' });
  });
});