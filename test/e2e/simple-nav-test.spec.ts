import { test, expect } from '@playwright/test';

test('Simple navigation test - Trainer can click Health Protocol button', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3501');
  
  // Login as trainer
  await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
  await page.fill('input[type="password"]', 'TestTrainer123!');
  await page.click('button[type="submit"]');
  
  // Wait for trainer dashboard
  await page.waitForURL('**/trainer', { timeout: 10000 });
  
  // Take screenshot to see what's on the page
  await page.screenshot({ path: 'trainer-dashboard.png', fullPage: true });
  
  // Look for any button with protocol-related text
  const protocolButtons = await page.getByRole('button').filter({ hasText: /protocol/i }).all();
  console.log(`Found ${protocolButtons.length} protocol-related buttons`);
  
  // Try to find the specific button
  const manageButton = page.getByRole('button', { name: /Manage Health Protocols/i });
  const buttonExists = await manageButton.isVisible().catch(() => false);
  
  if (buttonExists) {
    console.log('Button found! Clicking it...');
    await manageButton.click();
    await page.waitForURL('**/protocols', { timeout: 10000 });
    console.log('Successfully navigated to protocols page!');
  } else {
    console.log('Button not found. Looking for alternative navigation...');
    
    // Check page content
    const pageText = await page.textContent('body');
    console.log('Page contains "Health Protocol":', pageText?.includes('Health Protocol'));
    
    // Try finding the card/section
    const card = page.locator('.bg-gradient-to-r').filter({ hasText: 'Health Protocol' });
    const cardExists = await card.isVisible().catch(() => false);
    console.log('Protocol card exists:', cardExists);
    
    if (cardExists) {
      // Try to find button within the card
      const buttonInCard = card.locator('button').first();
      const buttonInCardExists = await buttonInCard.isVisible().catch(() => false);
      console.log('Button in card exists:', buttonInCardExists);
      
      if (buttonInCardExists) {
        await buttonInCard.click();
        await page.waitForURL('**/protocols', { timeout: 10000 });
        console.log('Successfully navigated via card button!');
      }
    }
  }
  
  // Final check
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  expect(finalUrl).toContain('/protocols');
});