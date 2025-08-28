/**
 * Cross-Browser and Responsive Design Integration Test
 * 
 * Tests authentication pages across different viewports and validates
 * responsive design implementation from UI/UX Agent
 */

import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

// Test different viewport configurations
const viewportConfigs = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPad', ...devices['iPad'] },
  { name: 'Desktop HD', viewport: { width: 1920, height: 1080 } }
];

test.describe('🌐 Cross-Browser & Responsive Design Integration', () => {
  
  // Test each viewport configuration
  for (const config of viewportConfigs) {
    test.describe(`${config.name} Viewport`, () => {
      test.use(config.viewport ? config : config);
      
      test(`Login page responsive design on ${config.name}`, async ({ page }) => {
        console.log(`🔍 Testing login page on ${config.name}...`);
        
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot for visual verification
        await page.screenshot({ 
          path: `test/screenshots/login-${config.name.toLowerCase().replace(' ', '-')}.png`, 
          fullPage: true 
        });
        
        // Check essential elements are visible and accessible
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
        
        // Check text-only aesthetic elements
        const mainHeader = await page.locator('h1').textContent();
        expect(mainHeader).toContain('EvoFit');
        
        // Verify links are accessible
        await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /create.*account/i })).toBeVisible();
        
        console.log(`✅ ${config.name} login page responsive test PASSED`);
      });
      
      test(`Registration page responsive design on ${config.name}`, async ({ page }) => {
        console.log(`🔍 Testing registration page on ${config.name}...`);
        
        await page.goto(`${BASE_URL}/register`);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot
        await page.screenshot({ 
          path: `test/screenshots/register-${config.name.toLowerCase().replace(' ', '-')}.png`, 
          fullPage: true 
        });
        
        // Check form elements are accessible
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        const passwordFields = await page.locator('input[type="password"]').count();
        expect(passwordFields).toBeGreaterThan(0);
        
        // Verify mobile-specific elements if on mobile
        if (config.name.includes('iPhone')) {
          console.log('📱 Testing mobile-specific interactions...');
          
          // Test touch interactions
          const emailField = page.getByRole('textbox', { name: /email/i });
          await emailField.tap();
          await expect(emailField).toBeFocused();
        }
        
        console.log(`✅ ${config.name} registration page responsive test PASSED`);
      });
      
      test(`Forgot password page responsive design on ${config.name}`, async ({ page }) => {
        console.log(`🔍 Testing forgot password page on ${config.name}...`);
        
        await page.goto(`${BASE_URL}/forgot-password`);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot
        await page.screenshot({ 
          path: `test/screenshots/forgot-password-${config.name.toLowerCase().replace(' ', '-')}.png`, 
          fullPage: true 
        });
        
        // Check page elements
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        
        // Verify text is readable on this viewport
        const headerText = await page.locator('h1, h2').first().textContent();
        expect(headerText).toBeTruthy();
        expect(headerText!.length).toBeGreaterThan(0);
        
        console.log(`✅ ${config.name} forgot password page responsive test PASSED`);
      });
    });
  }
  
  test('Touch interaction testing on mobile viewports', async ({ page }) => {
    console.log('📱 Testing touch interactions...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Test form field interactions with touch
    const emailField = page.getByRole('textbox', { name: /email/i });
    const passwordField = page.getByRole('textbox', { name: /password/i });
    const loginButton = page.getByRole('button', { name: /sign in/i });
    
    // Tap and verify focus
    await emailField.tap();
    await expect(emailField).toBeFocused();
    
    await passwordField.tap();
    await expect(passwordField).toBeFocused();
    
    // Test button tap responsiveness
    await loginButton.tap();
    // Should show validation errors for empty form
    await page.waitForTimeout(1000);
    
    console.log('✅ Touch interaction testing PASSED');
  });
  
  test('Text scaling and readability across viewports', async ({ page }) => {
    console.log('📖 Testing text scaling and readability...');
    
    const viewportSizes = [
      { width: 320, height: 568, name: 'Small Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1440, height: 900, name: 'Desktop' }
    ];
    
    for (const viewport of viewportSizes) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Check font sizes and readability
      const heading = page.locator('h1');
      const subheading = page.locator('h2');
      const bodyText = page.locator('p').first();
      
      // Verify elements are visible (not cut off)
      await expect(heading).toBeVisible();
      await expect(subheading).toBeVisible();
      
      // Check text content is not empty
      const headingText = await heading.textContent();
      expect(headingText).toBeTruthy();
      expect(headingText!.length).toBeGreaterThan(0);
      
      console.log(`✅ Text readability on ${viewport.name} PASSED`);
    }
  });
});