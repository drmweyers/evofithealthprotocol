import { test, expect, Page } from '@playwright/test';

// Test credentials
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

// Helper to login as trainer
async function loginAsTrainer(page: Page) {
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to protocols page (actual app behavior)
  await page.waitForURL('**/protocols', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test('Debug: Check what elements are actually on the page', async ({ page }) => {
  await loginAsTrainer(page);
  
  // Wait a bit for content to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Get all text content on the page
  const allText = await page.textContent('body');
  console.log('=== PAGE TEXT CONTENT ===');
  console.log(allText);
  
  // Get all buttons
  const buttons = await page.$$eval('button', elements => 
    elements.map(el => ({ text: el.textContent?.trim(), className: el.className }))
  );
  console.log('=== BUTTONS ===');
  console.log(JSON.stringify(buttons, null, 2));
  
  // Get all elements with "wizard" in text or class
  const wizardElements = await page.$$eval('*', elements =>
    elements
      .filter(el => 
        el.textContent?.toLowerCase().includes('wizard') || 
        el.className?.toLowerCase().includes('wizard')
      )
      .map(el => ({ 
        tag: el.tagName, 
        text: el.textContent?.trim(), 
        className: el.className 
      }))
  );
  console.log('=== WIZARD ELEMENTS ===');
  console.log(JSON.stringify(wizardElements, null, 2));
  
  // Check if specific text exists
  const hasEnhancedWizard = await page.locator('text=/Enhanced Protocol Wizard/i').count();
  console.log('=== Enhanced Protocol Wizard found:', hasEnhancedWizard);
  
  const hasProtocolWizard = await page.locator('text=/Protocol Wizard/i').count();
  console.log('=== Protocol Wizard found:', hasProtocolWizard);
});