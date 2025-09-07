import { test, expect } from '@playwright/test';

test('Debug - Check actual page content after login', async ({ page }) => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:3501';

  console.log('🔍 Debugging actual page content...');

  // Login
  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', trainerEmail);
  await page.fill('input[type="password"]', trainerPassword);
  await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
  
  // Wait for login
  await page.waitForURL((url) => {
    return url.pathname.includes('/trainer') || url.pathname === '/';
  }, { timeout: 10000 });
  
  console.log('✅ Logged in successfully, current URL:', page.url());

  // Take screenshot of post-login page
  await page.screenshot({ path: 'debug-post-login.png', fullPage: true });
  console.log('📸 Screenshot saved: debug-post-login.png');

  // Try different potential protocol page URLs
  const urlsToTry = [
    `${baseURL}/trainer/health-protocols`,
    `${baseURL}/protocols`,
    `${baseURL}/health-protocols`,
    `${baseURL}/trainer/protocols`,
    `${baseURL}/dashboard`
  ];

  for (const url of urlsToTry) {
    try {
      console.log(`\n🔍 Trying URL: ${url}`);
      await page.goto(url);
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
      // Get all headings on the page
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      console.log('📝 Headings found:', headings);
      
      // Get all button texts
      const buttons = await page.locator('button').allTextContents();
      console.log('🔘 Buttons found:', buttons);
      
      // Look for key words in page content
      const content = await page.textContent('body');
      const keyWords = ['protocol', 'health', 'specialized', 'parasite', 'cleanse', 'longevity'];
      const foundWords = keyWords.filter(word => content?.toLowerCase().includes(word));
      console.log('🔑 Key words found:', foundWords);
      
      // Take screenshot
      const filename = `debug-${url.split('/').pop() || 'root'}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`📸 Screenshot saved: ${filename}`);
      
      // If we find protocol-related content, this might be the right page
      if (foundWords.length > 2) {
        console.log(`✅ Found promising content at ${url}`);
        
        // Look for any clickable elements that might be protocol-related
        const protocolLinks = await page.locator('text*=protocol, text*=Protocol, text*=health, text*=Health').allTextContents();
        console.log('🔗 Protocol-related clickable elements:', protocolLinks);
      }
      
    } catch (error) {
      console.log(`❌ Failed to load ${url}:`, error.message);
    }
  }
  
  console.log('\n🎯 Debug complete! Check screenshots for visual verification.');
});