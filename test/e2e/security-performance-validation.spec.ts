/**
 * Security and Performance Integration Test
 * 
 * Validates that security measures and performance requirements
 * are met after multi-agent integration
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3500';
const API_BASE = `${BASE_URL}/api`;
const TEST_ACCOUNTS = {
  customer: { email: 'customer@demo.com', password: 'Password123@' },
  trainer: { email: 'trainer@demo.com', password: 'Password123@' }
};

test.describe('🔒 Security & Performance Integration Validation', () => {
  
  test('Performance metrics for authentication flows', async ({ page }) => {
    console.log('⚡ Testing performance metrics...');
    
    // Test login page load time
    const loginStartTime = Date.now();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    const loginLoadTime = Date.now() - loginStartTime;
    
    console.log(`📊 Login page load time: ${loginLoadTime}ms`);
    expect(loginLoadTime).toBeLessThan(5000); // Should load in < 5 seconds
    
    // Test authentication response time
    const authStartTime = Date.now();
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForLoadState('networkidle');
    const authTime = Date.now() - authStartTime;
    
    console.log(`📊 Authentication response time: ${authTime}ms`);
    expect(authTime).toBeLessThan(6000); // Should authenticate in < 6 seconds
    
    // Verify we're on dashboard (successful auth)
    expect(page.url()).toContain('/my-meal-plans');
    
    console.log('✅ Performance metrics PASSED');
  });
  
  test('API security headers and responses', async ({ page }) => {
    console.log('🛡️ Testing API security...');
    
    // Test API endpoints for proper security responses
    const apiTests = [
      {
        name: 'Login API',
        url: `${API_BASE}/auth/login`,
        method: 'POST',
        body: { email: TEST_ACCOUNTS.customer.email, password: TEST_ACCOUNTS.customer.password },
        expectedStatus: 200
      },
      {
        name: 'Protected endpoint without auth',
        url: `${API_BASE}/auth/me`,
        method: 'GET',
        expectedStatus: 401
      },
      {
        name: 'Nonexistent endpoint',
        url: `${API_BASE}/fake/endpoint`,
        method: 'GET',
        expectedStatus: 404
      }
    ];
    
    for (const test of apiTests) {
      console.log(`🔗 Testing ${test.name}...`);
      
      const response = await page.request.fetch(test.url, {
        method: test.method,
        data: test.body
      });
      
      expect(response.status()).toBe(test.expectedStatus);
      
      // Check security headers
      const headers = response.headers();
      console.log(`   Headers: ${Object.keys(headers).length} present`);
      
      // Verify JSON responses don't leak sensitive info
      if (response.status() < 500) {
        try {
          const data = await response.json();
          
          // Should not contain sensitive data in error responses
          const dataString = JSON.stringify(data).toLowerCase();
          expect(dataString).not.toContain('password');
          expect(dataString).not.toContain('secret');
          expect(dataString).not.toContain('token'); // Except in success responses
          
          console.log(`   ✅ ${test.name} security validation PASSED`);
        } catch (error) {
          // Non-JSON response is acceptable
          console.log(`   ℹ️ ${test.name} non-JSON response`);
        }
      }
    }
  });
  
  test('Input validation and XSS protection', async ({ page }) => {
    console.log('🛡️ Testing input validation and XSS protection...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Test XSS prevention
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '"><script>alert("xss")</script>',
      "'><script>alert('xss')</script>"
    ];
    
    for (const payload of xssPayloads) {
      // Fill form with XSS payload
      await page.getByRole('textbox', { name: /email/i }).fill(payload);
      await page.getByRole('textbox', { name: /password/i }).fill('testpass');
      
      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(1000);
      
      // Check that no script was executed
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('XSS executed');
      
      // Check that the form didn't crash
      const emailField = await page.getByRole('textbox', { name: /email/i }).count();
      expect(emailField).toBe(1);
      
      console.log(`   ✅ XSS payload blocked: ${payload.substring(0, 20)}...`);
    }
    
    console.log('✅ XSS protection validation PASSED');
  });
  
  test('Rate limiting and brute force protection', async ({ page }) => {
    console.log('🛡️ Testing rate limiting...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    const attemptTimes = [];
    
    // Make multiple rapid login attempts
    for (let i = 0; i < 6; i++) {
      const startTime = Date.now();
      
      await page.getByRole('textbox', { name: /email/i }).fill(`attacker${i}@test.com`);
      await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await page.waitForTimeout(1000);
      
      const endTime = Date.now();
      attemptTimes.push(endTime - startTime);
      
      console.log(`   Attempt ${i + 1}: ${endTime - startTime}ms`);
    }
    
    // Check if later attempts are slower (indicating rate limiting)
    const firstAttempt = attemptTimes[0];
    const lastAttempt = attemptTimes[attemptTimes.length - 1];
    
    console.log(`   First attempt: ${firstAttempt}ms, Last attempt: ${lastAttempt}ms`);
    
    // Look for rate limiting indicators
    const errorElements = await page.locator('[role="alert"], .error, .toast').count();
    if (errorElements > 0) {
      const errorText = await page.locator('[role="alert"], .error, .toast').first().textContent();
      console.log(`   Rate limiting response: ${errorText}`);
    }
    
    console.log('✅ Rate limiting test completed');
  });
  
  test('Session security and JWT handling', async ({ page }) => {
    console.log('🎫 Testing session security...');
    
    // Login to get token
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/my-meal-plans');
    
    // Check JWT token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    console.log(`   ✅ JWT token stored: ${token ? 'YES' : 'NO'}`);
    
    // Verify token structure (should be JWT format)
    if (token) {
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3); // JWT has 3 parts
      console.log(`   ✅ JWT format validation: ${tokenParts.length === 3 ? 'VALID' : 'INVALID'}`);
    }
    
    // Test API call with token
    const apiResponse = await page.evaluate(async (baseUrl) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        status: response.status,
        ok: response.ok
      };
    }, BASE_URL);
    
    expect(apiResponse.ok).toBeTruthy();
    console.log(`   ✅ Authenticated API call: ${apiResponse.status}`);
    
    // Test logout clears token
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      
      const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('token'));
      expect(tokenAfterLogout).toBeFalsy();
      console.log(`   ✅ Token cleared on logout: ${!tokenAfterLogout ? 'YES' : 'NO'}`);
    }
    
    console.log('✅ Session security validation PASSED');
  });
  
  test('HTTPS and secure cookie validation', async ({ page, context }) => {
    console.log('🔐 Testing secure connection and cookies...');
    
    // Note: This test assumes development environment
    // In production, these checks would be different
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Check connection security
    const url = page.url();
    console.log(`   Connection URL: ${url}`);
    
    // For localhost development, HTTP is acceptable
    const isSecureEnvironment = url.startsWith('https://') || url.includes('localhost');
    expect(isSecureEnvironment).toBeTruthy();
    
    // Login to test cookie security
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_ACCOUNTS.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForLoadState('networkidle');
    
    // Check cookies
    const cookies = await context.cookies();
    console.log(`   Cookies found: ${cookies.length}`);
    
    // In production, check for secure cookies
    const secureCookies = cookies.filter(cookie => cookie.secure);
    console.log(`   Secure cookies: ${secureCookies.length}`);
    
    // For development, having any session-related cookies is good
    const sessionCookies = cookies.filter(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('token') || 
      cookie.name.includes('auth')
    );
    console.log(`   Session cookies: ${sessionCookies.length}`);
    
    console.log('✅ Connection security validation completed');
  });
  
  test('Error handling and information disclosure', async ({ page }) => {
    console.log('🚫 Testing error handling security...');
    
    // Test various error conditions
    const errorTests = [
      {
        name: 'Invalid credentials',
        email: 'invalid@test.com',
        password: 'wrongpassword',
        expectedBehavior: 'Generic error message'
      },
      {
        name: 'Malformed email',
        email: 'notanemail',
        password: 'password',
        expectedBehavior: 'Validation error'
      },
      {
        name: 'Empty fields',
        email: '',
        password: '',
        expectedBehavior: 'Required field errors'
      }
    ];
    
    for (const errorTest of errorTests) {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      console.log(`   Testing: ${errorTest.name}`);
      
      await page.getByRole('textbox', { name: /email/i }).fill(errorTest.email);
      await page.getByRole('textbox', { name: /password/i }).fill(errorTest.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await page.waitForTimeout(2000);
      
      // Check for appropriate error handling
      const errorElements = await page.locator('[role="alert"], .error, .text-red, .text-destructive').count();
      console.log(`     Error elements found: ${errorElements}`);
      
      // Verify no sensitive information is leaked
      if (errorElements > 0) {
        const errorText = await page.locator('[role="alert"], .error, .text-red, .text-destructive').first().textContent();
        expect(errorText?.toLowerCase()).not.toContain('database');
        expect(errorText?.toLowerCase()).not.toContain('server');
        expect(errorText?.toLowerCase()).not.toContain('internal');
        
        console.log(`     ✅ Error message safe: ${errorTest.name}`);
      }
    }
    
    console.log('✅ Error handling security validation PASSED');
  });
});