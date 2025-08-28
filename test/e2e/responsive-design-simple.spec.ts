/**
 * Simple Responsive Design Test
 * 
 * Tests authentication pages across different viewports
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';

test.describe('📱 Responsive Design Verification', () => {
  
  test('Login page works on mobile viewport', async ({ page }) => {
    console.log('📱 Testing mobile viewport (375x667)...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test/screenshots/mobile-login.png', fullPage: true });
    
    // Check elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Test touch interaction
    await page.getByRole('textbox', { name: /email/i }).tap();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeFocused();
    
    console.log('✅ Mobile viewport test PASSED');
  });
  
  test('Login page works on tablet viewport', async ({ page }) => {
    console.log('📱 Testing tablet viewport (768x1024)...');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test/screenshots/tablet-login.png', fullPage: true });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    console.log('✅ Tablet viewport test PASSED');
  });
  
  test('Login page works on desktop viewport', async ({ page }) => {
    console.log('💻 Testing desktop viewport (1920x1080)...');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test/screenshots/desktop-login.png', fullPage: true });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Test text-only aesthetic
    const headerText = await page.locator('h1').textContent();
    expect(headerText).toContain('EvoFit');
    
    console.log('✅ Desktop viewport test PASSED');
  });
  
  test('Registration page responsive across viewports', async ({ page }) => {
    console.log('📱 Testing registration page responsiveness...');
    
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: `test/screenshots/register-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Check form elements are accessible
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      
      const passwordFields = await page.locator('input[type="password"]').count();
      expect(passwordFields).toBeGreaterThan(0);
      
      console.log(`✅ Registration ${viewport.name} viewport PASSED`);
    }
  });
  
  test('Text readability and scaling', async ({ page }) => {
    console.log('📖 Testing text readability across screen sizes...');
    
    const sizes = [
      { width: 320, height: 568 }, // Small mobile
      { width: 1440, height: 900 }  // Large desktop
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Verify text content is readable
      const heading = await page.locator('h1').textContent();
      expect(heading).toBeTruthy();
      expect(heading!.length).toBeGreaterThan(5);
      
      // Check that form fields are properly sized
      const emailField = page.getByRole('textbox', { name: /email/i });
      const fieldBox = await emailField.boundingBox();
      
      expect(fieldBox).toBeTruthy();
      expect(fieldBox!.width).toBeGreaterThan(100); // Reasonable minimum width
      expect(fieldBox!.height).toBeGreaterThan(20);  // Reasonable minimum height
    }
    
    console.log('✅ Text readability test PASSED');
  });
});