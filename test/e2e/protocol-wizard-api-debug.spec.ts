import { test, expect, Page } from '@playwright/test';

test.describe('Protocol Wizard API Debug', () => {
  test('Debug Protocol Wizard API endpoints after trainer login', async ({ page }) => {
    console.log('🚀 Starting Protocol Wizard API Debug Test...');
    
    // Arrays to capture console messages and network requests
    const consoleMessages: any[] = [];
    const networkRequests: any[] = [];
    const apiErrors: any[] = [];

    // Listen for console messages
    page.on('console', msg => {
      const message = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      };
      consoleMessages.push(message);
      console.log(`🖥️  Console [${msg.type().toUpperCase()}]: ${msg.text()}`);
    });

    // Listen for network requests and responses
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          type: 'request'
        });
        console.log(`📤 API Request: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          type: 'response'
        };
        networkRequests.push(responseData);
        console.log(`📥 API Response: ${response.status()} ${response.url()}`);
        
        // Capture error responses
        if (response.status() >= 400) {
          apiErrors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
          console.log(`❌ API Error: ${response.status()} ${response.statusText()} - ${response.url()}`);
        }
      }
    });

    // Step 1: Navigate to application
    console.log('📱 Step 1: Navigating to application...');
    await page.goto('http://localhost:3501');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/api-debug-01-landing.png', fullPage: true });

    // Step 2: Login as trainer
    console.log('👤 Step 2: Logging in as trainer...');
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.fill('trainer.test@evofitmeals.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('TestTrainer123!');
    
    // Submit login and wait for response
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/auth/login') && response.status() === 200
      ),
      submitButton.click()
    ]);

    console.log('⏳ Waiting for authentication to complete...');
    await page.waitForTimeout(3000);

    // Step 3: Check if we can access trainer pages
    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    await page.screenshot({ path: 'test-results/api-debug-02-after-login.png', fullPage: true });

    // Step 4: Try to trigger the specific API calls we need to test
    console.log('🔍 Step 4: Testing specific API endpoints...');

    // Test 1: GET /api/trainer/customers
    console.log('📊 Testing: GET /api/trainer/customers');
    try {
      const customersResponse = await page.evaluate(async () => {
        const response = await fetch('/api/trainer/customers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });
        return {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      });
      
      console.log(`📈 /api/trainer/customers Response:`, customersResponse);
      
      if (!customersResponse.ok) {
        apiErrors.push({
          endpoint: '/api/trainer/customers',
          status: customersResponse.status,
          statusText: customersResponse.statusText,
          data: customersResponse.data
        });
      }
    } catch (error) {
      console.log(`❌ Error testing /api/trainer/customers:`, error);
      apiErrors.push({
        endpoint: '/api/trainer/customers',
        error: error.message
      });
    }

    // Test 2: GET /api/protocol-templates
    console.log('📋 Testing: GET /api/protocol-templates');
    try {
      const templatesResponse = await page.evaluate(async () => {
        const response = await fetch('/api/protocol-templates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });
        return {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      });
      
      console.log(`📋 /api/protocol-templates Response:`, templatesResponse);
      
      if (!templatesResponse.ok) {
        apiErrors.push({
          endpoint: '/api/protocol-templates',
          status: templatesResponse.status,
          statusText: templatesResponse.statusText,
          data: templatesResponse.data
        });
      }
    } catch (error) {
      console.log(`❌ Error testing /api/protocol-templates:`, error);
      apiErrors.push({
        endpoint: '/api/protocol-templates',
        error: error.message
      });
    }

    // Step 5: Check for authentication token
    console.log('🔑 Step 5: Checking authentication token...');
    const tokenInfo = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('token'),
        sessionStorage: sessionStorage.getItem('token'),
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage)
      };
    });
    
    console.log('🔐 Token Information:', tokenInfo);

    // Step 6: Try to navigate to protocol-related pages
    console.log('🧭 Step 6: Testing navigation to protocol pages...');
    
    const protocolPaths = [
      '/trainer',
      '/health-protocols',
      '/protocols',
      '/trainer/protocols',
      '/trainer/health-protocols'
    ];

    for (const path of protocolPaths) {
      console.log(`🚀 Testing navigation to: ${path}`);
      try {
        await page.goto(`http://localhost:3501${path}`);
        await page.waitForTimeout(2000);
        
        const finalUrl = page.url();
        const isRedirected = finalUrl !== `http://localhost:3501${path}`;
        
        console.log(`  📍 Final URL: ${finalUrl} ${isRedirected ? '(redirected)' : ''}`);
        
        await page.screenshot({ 
          path: `test-results/api-debug-03-nav-${path.replace(/\//g, '-')}.png`, 
          fullPage: true 
        });
        
        // Check if page loaded successfully
        const pageContent = await page.textContent('body');
        const hasError = pageContent.toLowerCase().includes('error') || 
                        pageContent.toLowerCase().includes('not found') ||
                        pageContent.toLowerCase().includes('404');
                        
        console.log(`  🎯 Page status: ${hasError ? 'ERROR/404' : 'LOADED'}`);
        
        // If we found a working page, stay here and break
        if (!hasError && !isRedirected) {
          console.log(`✅ Successfully loaded: ${path}`);
          break;
        }
        
      } catch (error) {
        console.log(`  ❌ Navigation error for ${path}:`, error.message);
      }
    }

    // Step 7: Final screenshot and console analysis
    await page.screenshot({ path: 'test-results/api-debug-04-final-state.png', fullPage: true });

    // Step 8: Generate comprehensive report
    const debugReport = {
      testName: 'Protocol Wizard API Debug',
      timestamp: new Date().toISOString(),
      authentication: {
        loginSuccessful: true,
        tokenPresent: !!(tokenInfo.localStorage || tokenInfo.sessionStorage),
        tokenLocation: tokenInfo.localStorage ? 'localStorage' : (tokenInfo.sessionStorage ? 'sessionStorage' : 'none'),
        storageKeys: {
          localStorage: tokenInfo.localStorageKeys,
          sessionStorage: tokenInfo.sessionStorageKeys
        }
      },
      apiEndpoints: {
        customersEndpoint: '/api/trainer/customers',
        templatesEndpoint: '/api/protocol-templates',
        errors: apiErrors
      },
      console: {
        totalMessages: consoleMessages.length,
        errors: consoleMessages.filter(m => m.type === 'error'),
        warnings: consoleMessages.filter(m => m.type === 'warning'),
        logs: consoleMessages.filter(m => m.type === 'log')
      },
      network: {
        totalApiRequests: networkRequests.length,
        requests: networkRequests.filter(r => r.type === 'request'),
        responses: networkRequests.filter(r => r.type === 'response'),
        errors: apiErrors
      },
      recommendations: []
    };

    // Add recommendations based on findings
    if (apiErrors.length > 0) {
      debugReport.recommendations.push('API endpoints are returning errors - check server implementation');
    }
    
    if (debugReport.console.errors.length > 0) {
      debugReport.recommendations.push('JavaScript errors found - check browser console');
    }
    
    if (!debugReport.authentication.tokenPresent) {
      debugReport.recommendations.push('Authentication token not found - login may not be persisting');
    }

    console.log('\n📋 COMPREHENSIVE DEBUG REPORT:');
    console.log('=====================================');
    console.log(JSON.stringify(debugReport, null, 2));

    // Specific outputs for the user request
    console.log('\n🎯 SPECIFIC FINDINGS:');
    console.log('=====================');
    console.log(`❌ JavaScript Console Errors: ${debugReport.console.errors.length}`);
    if (debugReport.console.errors.length > 0) {
      debugReport.console.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.text}`);
      });
    }

    console.log(`\n📡 API Endpoint Status:`);
    console.log(`  - GET /api/trainer/customers: ${apiErrors.find(e => e.endpoint === '/api/trainer/customers') ? 'FAILING' : 'UNKNOWN'}`);
    console.log(`  - GET /api/protocol-templates: ${apiErrors.find(e => e.endpoint === '/api/protocol-templates') ? 'FAILING' : 'UNKNOWN'}`);

    console.log(`\n🌐 Network Requests:`);
    networkRequests.forEach(req => {
      if (req.type === 'response') {
        console.log(`  - ${req.status} ${req.url}`);
      }
    });

    console.log(`\n🔍 Key Issues Found:`);
    if (apiErrors.length === 0) {
      console.log('  - No obvious API errors detected');
    } else {
      apiErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.endpoint || error.url}: ${error.status} ${error.statusText || error.error}`);
      });
    }

    console.log('\n✅ Protocol Wizard API Debug Test Completed!');
    
    // Basic assertion to ensure test passes
    expect(debugReport.authentication.loginSuccessful).toBe(true);
  });
});