import { test, expect } from '@playwright/test';

test.describe('Health Protocol Tab Debug', () => {
  const trainerEmail = 'trainer.test@evofitmeals.com';
  const trainerPassword = 'TestTrainer123!';
  const baseURL = 'http://localhost:4000';

  test('Debug Health Protocol tab rendering', async ({ page }) => {
    // Navigate to login page
    await page.goto(baseURL);
    
    // Login as trainer
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', trainerEmail);
    await page.fill('input[type="password"]', trainerPassword);
    await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL((url) => {
      return url.pathname.includes('/trainer') || 
             url.pathname.includes('/dashboard') ||
             url.pathname === '/';
    }, { timeout: 10000 });
    
    console.log('After login URL:', page.url());
    
    // Navigate directly to health protocols URL
    await page.goto(`${baseURL}/trainer/health-protocols`);
    await page.waitForLoadState('networkidle');
    
    console.log('Health Protocol URL:', page.url());
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'health-protocol-debug.png', fullPage: true });
    
    // Check if Health Protocol tab exists and is active
    const healthProtocolTab = page.locator('[value="health-protocols"]');
    await expect(healthProtocolTab).toBeVisible();
    
    // Check if tab is active
    const isTabActive = await healthProtocolTab.getAttribute('data-state');
    console.log('Health Protocol tab state:', isTabActive);
    
    // Check if TrainerHealthProtocols content is visible
    const protocolContent = page.locator('text=Specialized Health Protocols');
    await expect(protocolContent).toBeVisible();
    
    // Check for any error messages in console
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait and check for errors
    await page.waitForTimeout(2000);
    
    if (logs.length > 0) {
      console.log('Console errors:', logs);
    }
    
    // Check if component is actually rendering
    const createProtocolButton = page.locator('text=Create Protocols');
    if (await createProtocolButton.isVisible()) {
      console.log('✅ TrainerHealthProtocols component is rendering');
    } else {
      console.log('❌ TrainerHealthProtocols component is NOT rendering');
      
      // Check what content is actually there
      const bodyContent = await page.locator('body').textContent();
      console.log('Page content includes:', bodyContent?.substring(0, 500));
    }
  });

  test('Check tab navigation works', async ({ page }) => {
    // Navigate to login page
    await page.goto(baseURL);
    
    // Login as trainer
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', trainerEmail);
    await page.fill('input[type="password"]', trainerPassword);
    await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
    
    // Wait for successful login and go to trainer dashboard
    await page.waitForURL((url) => {
      return url.pathname.includes('/trainer') || 
             url.pathname.includes('/dashboard') ||
             url.pathname === '/';
    }, { timeout: 10000 });
    
    // Navigate to /trainer to see the tabs
    await page.goto(`${baseURL}/trainer`);
    await page.waitForLoadState('networkidle');
    
    console.log('Trainer dashboard URL:', page.url());
    
    // Look for Health Protocol tab
    const healthProtocolTab = page.locator('[value="health-protocols"]');
    if (await healthProtocolTab.isVisible()) {
      console.log('✅ Health Protocol tab is visible');
      
      // Click the tab
      await healthProtocolTab.click();
      await page.waitForTimeout(1000);
      
      console.log('After clicking tab URL:', page.url());
      
      // Check if content loaded
      const protocolContent = page.locator('text=Specialized Health Protocols');
      if (await protocolContent.isVisible()) {
        console.log('✅ Health Protocol content loaded after tab click');
      } else {
        console.log('❌ Health Protocol content NOT loaded after tab click');
      }
    } else {
      console.log('❌ Health Protocol tab is NOT visible');
      
      // List all visible tabs
      const allTabs = page.locator('[role="tab"]');
      const tabCount = await allTabs.count();
      console.log(`Found ${tabCount} tabs:`);
      
      for (let i = 0; i < tabCount; i++) {
        const tabText = await allTabs.nth(i).textContent();
        const tabValue = await allTabs.nth(i).getAttribute('value');
        console.log(`Tab ${i}: "${tabText}" (value: ${tabValue})`);
      }
    }
  });
});