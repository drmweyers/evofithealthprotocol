/**
 * 🌍 GLOBAL E2E TEST SETUP
 * 
 * Comprehensive setup for multi-browser E2E testing suite
 * Ensures test environment is ready before any tests run
 */

import { chromium, FullConfig } from '@playwright/test';
import { setTimeout } from 'timers/promises';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting comprehensive E2E test environment setup...');
  
  const baseURL = 'http://localhost:3500';
  
  // Step 1: Verify server is responding
  console.log('🔍 Verifying server availability...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let retries = 0;
  const maxRetries = 30; // 30 seconds to wait for server
  
  while (retries < maxRetries) {
    try {
      const response = await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 5000 });
      if (response && response.status() === 200) {
        console.log('✅ Server is responding successfully');
        break;
      }
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('❌ Server not responding after 30 seconds');
        console.error('Please ensure Docker dev server is running: docker-compose --profile dev up -d');
        throw new Error('Server not available for testing');
      }
      console.log(`⏳ Waiting for server... (${retries}/${maxRetries})`);
      await setTimeout(1000);
    }
  }
  
  // Step 2: Verify test credentials can authenticate
  console.log('🔐 Verifying test credentials...');
  const testCredentials = {
    admin: { email: 'admin@fitmeal.pro', password: 'AdminPass123!' },
    trainer: { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!' },
    customer: { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!' }
  };
  
  for (const [role, creds] of Object.entries(testCredentials)) {
    try {
      await page.goto(`${baseURL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('textbox', { name: /email/i }).fill(creds.email);
      await page.getByRole('textbox', { name: /password/i }).fill(creds.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('/login');
      
      if (isLoggedIn) {
        console.log(`✅ ${role} credentials verified (${creds.email})`);
        
        // Logout to clean up for next test
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      } else {
        console.warn(`⚠️  ${role} credentials may need verification (${creds.email})`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not verify ${role} credentials: ${error}`);
    }
  }
  
  // Step 3: Create test output directories
  console.log('📁 Creating test output directories...');
  
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/reports'
  ];
  
  for (const dir of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
  
  // Step 4: Clear any previous test artifacts
  console.log('🧹 Cleaning previous test artifacts...');
  try {
    if (fs.existsSync('test-results/screenshots')) {
      const files = fs.readdirSync('test-results/screenshots');
      files.forEach((file: string) => {
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
          fs.unlinkSync(path.join('test-results/screenshots', file));
        }
      });
    }
  } catch (error) {
    console.log('⚠️  Could not clean previous artifacts (this is OK)');
  }
  
  await browser.close();
  
  console.log('🎯 Global setup completed successfully!');
  console.log('🚀 Ready to execute comprehensive E2E test suite');
  
  // Store global test state
  const globalState = {
    setupTime: new Date().toISOString(),
    baseURL,
    testCredentials,
    serverVerified: true
  };
  
  fs.writeFileSync('test-results/global-setup-state.json', JSON.stringify(globalState, null, 2));
}

export default globalSetup;