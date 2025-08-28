import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';
const API_URL = 'http://localhost:3501';

test.describe('Health Protocol Direct Token Test', () => {
  test('Bypass Login and Test Features Directly', async ({ page }) => {
    console.log('🔧 Testing health protocol features with direct token injection...');
    
    // Step 1: Get a valid token from the backend
    console.log('Step 1: Obtaining valid authentication token...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'trainer.test@evofitmeals.com',
        password: 'TestTrainer123!'
      }),
    });
    
    if (!loginResponse.ok) {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.data?.accessToken;
    const user = loginData.data?.user;
    
    if (!token || !user) {
      console.log('❌ No token or user data received');
      return;
    }
    
    console.log(`👤 User: ${user.email} (${user.role})`);
    
    // Step 2: Navigate to the application and inject token
    console.log('Step 2: Injecting token into frontend...');
    await page.goto(BASE_URL);
    
    // Inject token and user data into localStorage
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token);
      // Store user data for React Query
      localStorage.setItem('user', JSON.stringify(data.user));
    }, { token, user });
    
    await page.screenshot({ path: 'screenshots/token-01-injected.png', fullPage: true });
    
    // Step 3: Navigate to protocols page
    console.log('Step 3: Navigating to protocols page...');
    await page.goto(`${BASE_URL}/protocols`);
    await page.waitForTimeout(3000);
    
    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/token-02-protocols.png', fullPage: true });
    
    // Step 4: Explore the health protocol interface
    console.log('Step 4: Exploring health protocol interface...');
    
    // Look for key elements
    const elements = await page.locator('*').all();
    console.log(`Found ${elements.length} total elements on page`);
    
    // Get page text content
    const bodyText = await page.locator('body').innerText();
    console.log('\n=== PAGE CONTENT ===');
    console.log(bodyText.substring(0, 1000) + (bodyText.length > 1000 ? '...' : ''));
    
    // Look for specific health protocol elements
    const searchTerms = [
      'health', 'protocol', 'create', 'generate', 'longevity', 'parasite',
      'dashboard', 'client', 'customer', 'ailment', 'specialized'
    ];
    
    console.log('\n=== SEARCH FOR KEY TERMS ===');
    for (const term of searchTerms) {
      const found = bodyText.toLowerCase().includes(term.toLowerCase());
      console.log(`${found ? '✅' : '❌'} "${term}": ${found ? 'Found' : 'Not found'}`);
    }
    
    // Step 5: Look for interactive elements
    console.log('\nStep 5: Analyzing interactive elements...');
    
    const buttons = await page.locator('button').all();
    console.log(`\n📌 Found ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(10, buttons.length); i++) {
      try {
        const text = await buttons[i].innerText({ timeout: 1000 });
        const visible = await buttons[i].isVisible();
        if (text && text.trim()) {
          console.log(`  ${i + 1}. "${text.trim()}" ${visible ? '(visible)' : '(hidden)'}`);
        }
      } catch (e) {
        console.log(`  ${i + 1}. [Button ${i + 1} - text extraction failed]`);
      }
    }
    
    const links = await page.locator('a').all();
    console.log(`\n🔗 Found ${links.length} links:`);
    for (let i = 0; i < Math.min(10, links.length); i++) {
      try {
        const text = await links[i].innerText({ timeout: 1000 });
        const href = await links[i].getAttribute('href');
        if (text && text.trim()) {
          console.log(`  ${i + 1}. "${text.trim()}" -> ${href || 'no href'}`);
        }
      } catch (e) {
        console.log(`  ${i + 1}. [Link ${i + 1} - text extraction failed]`);
      }
    }
    
    // Step 6: Test any health protocol functionality we can find
    console.log('\nStep 6: Testing available functionality...');
    
    // Try clicking the first few visible buttons
    for (let i = 0; i < Math.min(3, buttons.length); i++) {
      try {
        const button = buttons[i];
        const visible = await button.isVisible();
        const enabled = await button.isEnabled();
        const text = await button.innerText({ timeout: 1000 });
        
        if (visible && enabled && text && !text.toLowerCase().includes('logout')) {
          console.log(`🖱️ Trying to click: "${text.trim()}"`);
          await button.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: `screenshots/token-03-clicked-${i + 1}.png`, 
            fullPage: true 
          });
          
          // Check if anything changed
          const newUrl = page.url();
          console.log(`  After click: ${newUrl}`);
        }
      } catch (e) {
        console.log(`  ❌ Failed to click button ${i + 1}: ${e.message}`);
      }
    }
    
    // Step 7: Final summary
    console.log('\nStep 7: Test Summary');
    await page.screenshot({ path: 'screenshots/token-04-final.png', fullPage: true });
    
    console.log('✅ Direct token test completed!');
  });
  
  test('Test API Endpoints Directly', async ({ page }) => {
    console.log('🔧 Testing health protocol API endpoints directly...');
    
    // Get authentication token
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'trainer.test@evofitmeals.com',
        password: 'TestTrainer123!'
      }),
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Could not get authentication token');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data?.accessToken;
    
    if (!token) {
      console.log('❌ No token received');
      return;
    }
    
    console.log('✅ Got authentication token');
    
    // Test various API endpoints
    const endpoints = [
      '/api/health-protocols',
      '/api/specialized-protocols',
      '/api/customers',
      '/api/meals',
      '/api/recipes'
    ];
    
    console.log('\n=== API ENDPOINT TESTING ===');
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const status = response.status;
        const statusText = response.statusText;
        
        console.log(`${status < 400 ? '✅' : '❌'} ${endpoint}: ${status} ${statusText}`);
        
        if (status < 400) {
          try {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log(`  └─ Returned ${data.length} items`);
            } else if (typeof data === 'object' && data !== null) {
              console.log(`  └─ Returned object with keys: ${Object.keys(data).join(', ')}`);
            }
          } catch (e) {
            console.log(`  └─ Response parsing failed`);
          }
        }
      } catch (e) {
        console.log(`❌ ${endpoint}: Network error - ${e.message}`);
      }
    }
    
    console.log('\n✅ API endpoint testing completed!');
  });
});