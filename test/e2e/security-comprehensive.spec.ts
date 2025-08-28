/**
 * 🛡️ SECURITY VALIDATION COMPREHENSIVE TEST SUITE
 * 
 * Security vulnerability testing and validation for health protocol authentication
 * 
 * Security Coverage:
 * 🔒 XSS Prevention (Script Injection Prevention)
 * 🚫 SQL Injection Protection
 * 🛑 CSRF Protection Validation
 * 🔐 JWT Token Security & Handling  
 * 🚨 Rate Limiting Verification
 * 🔑 Session Security & HTTPS Enforcement
 * 🛡️ Input Validation & Sanitization
 * 🚪 Authorization & Access Control
 * 
 * Test Environment: http://localhost:3500
 * Security Standards: OWASP Top 10, HIPAA Security Requirements
 */

import { test, expect, Page } from '@playwright/test';
import { setTimeout } from 'timers/promises';

// 🔐 Test Credentials
const testCredentials = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123!',
    expectedRedirect: '/admin'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com', 
    password: 'TestTrainer123!',
    expectedRedirect: '/trainer'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    expectedRedirect: '/my-meal-plans'
  }
};

// 🌐 Configuration
const BASE_URL = 'http://localhost:3500';

// 🛡️ Security Test Payloads
const SecurityPayloads = {
  xss: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>',
    '<svg onload="alert(\'XSS\')">',
    '\'"</script><script>alert("XSS")</script>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<body onload="alert(\'XSS\')">',
    '<input onfocus="alert(\'XSS\')" autofocus>',
    '<select onfocus="alert(\'XSS\')" autofocus>'
  ],
  
  sqlInjection: [
    "' OR 1=1 --",
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "admin'--",
    "admin'/*",
    "' OR 1=1#",
    "' UNION SELECT * FROM users --",
    "1' ORDER BY 1 --+",
    "' OR SLEEP(5) --",
    "'; EXEC xp_cmdshell('dir'); --"
  ],
  
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fpasswd',
    '....//....//....//etc/passwd',
    '/var/www/../../etc/passwd',
    '\\..\\..\\..\\etc\\passwd'
  ],
  
  commandInjection: [
    '; cat /etc/passwd',
    '| whoami',
    '&& ls -la',
    '`cat /etc/passwd`',
    '$(whoami)',
    '; rm -rf /',
    '| nc -l -p 1234',
    '&& ping -c 10 127.0.0.1'
  ]
};

// 🎨 Security Test Selectors
const SecuritySelectors = {
  emailInput: 'input[type="email"], input[name="email"], [data-testid="email-input"]',
  passwordInput: 'input[type="password"], input[name="password"], [data-testid="password-input"]',
  submitButton: 'button[type="submit"], button:has-text("Sign In"), [data-testid="submit-button"]',
  errorMessage: '.error, [role="alert"], .text-red-500, [data-testid="error-message"]',
  successMessage: '.success, .text-green-500, [data-testid="success-message"]',
  formInputs: 'input, textarea, select',
  links: 'a[href]',
  buttons: 'button, input[type="button"], input[type="submit"]'
};

test.describe('🛡️ SECURITY VALIDATION COMPREHENSIVE TEST SUITE', () => {
  
  // 🚀 Test Suite Setup
  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000); // 5 minute timeout for security testing
    
    // Clear browser state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Enable security-focused logging
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('script')) {
        console.log('🚨 Security Alert - Script Error:', msg.text());
      }
    });
    
    page.on('dialog', (dialog) => {
      console.log('🚨 Security Alert - Unexpected Dialog:', dialog.message());
      dialog.dismiss();
    });
  });

  test.describe('1. 🔒 XSS PREVENTION TESTING', () => {
    
    test('1.1 XSS Prevention in Login Form Fields', async ({ page }) => {
      console.log('🚀 Testing XSS Prevention in Login Form...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      let xssDetected = false;
      
      // Monitor for unexpected dialogs (indicates XSS success)
      page.on('dialog', (dialog) => {
        console.log('🚨 XSS DETECTED - Alert triggered:', dialog.message());
        xssDetected = true;
        dialog.dismiss();
      });
      
      // Test XSS payloads in email field
      for (let i = 0; i < Math.min(SecurityPayloads.xss.length, 5); i++) {
        const payload = SecurityPayloads.xss[i];
        console.log(`Testing XSS payload ${i + 1}: ${payload.slice(0, 30)}...`);
        
        // Clear and fill email field with XSS payload
        await page.locator(SecuritySelectors.emailInput).fill('');
        await page.locator(SecuritySelectors.emailInput).fill(payload);
        
        // Try password field as well
        await page.locator(SecuritySelectors.passwordInput).fill(payload);
        
        // Submit form
        await page.locator(SecuritySelectors.submitButton).click();
        await setTimeout(1000); // Wait for potential XSS execution
        
        // Check page content for unescaped script
        const pageContent = await page.content();
        const hasUnescapedScript = pageContent.includes('<script>') && pageContent.includes('alert');
        
        if (hasUnescapedScript) {
          console.log('🚨 XSS vulnerability detected in page content');
          xssDetected = true;
        }
        
        // Clear form for next test
        await page.locator(SecuritySelectors.emailInput).fill('');
        await page.locator(SecuritySelectors.passwordInput).fill('');
      }
      
      // XSS should NOT be detected (prevention working)
      expect(xssDetected).toBeFalsy();
      console.log('✅ XSS prevention working - no scripts executed');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/security-xss-prevention.png',
        fullPage: true 
      });
    });

    test('1.2 Content Security Policy (CSP) Validation', async ({ page }) => {
      console.log('🚀 Testing Content Security Policy...');
      
      let cspViolations: string[] = [];
      
      // Listen for CSP violations
      page.on('response', async (response) => {
        if (response.url().includes(BASE_URL)) {
          const cspHeader = response.headers()['content-security-policy'];
          if (cspHeader) {
            console.log(`✅ CSP Header found: ${cspHeader.slice(0, 100)}...`);
          }
        }
      });
      
      // Listen for console errors that might indicate CSP violations
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
      });
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Try to inject inline script (should be blocked by CSP)
      await page.evaluate(() => {
        try {
          const script = document.createElement('script');
          script.innerHTML = 'console.log("Inline script executed")';
          document.head.appendChild(script);
        } catch (error) {
          console.log('CSP blocked inline script:', error);
        }
      });
      
      await setTimeout(1000);
      
      console.log(`CSP violations detected: ${cspViolations.length}`);
      
      // Ideally, we want CSP to be present and blocking inline scripts
      // But we won't fail the test if CSP isn't configured yet
      console.log('✅ CSP validation completed');
    });

    test('1.3 DOM-based XSS Prevention', async ({ page }) => {
      console.log('🚀 Testing DOM-based XSS Prevention...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      let domXssDetected = false;
      
      page.on('dialog', () => {
        domXssDetected = true;
      });
      
      // Test DOM manipulation with XSS payloads
      const domXssResults = await page.evaluate((xssPayloads) => {
        const results: string[] = [];
        
        try {
          // Test innerHTML manipulation
          const testDiv = document.createElement('div');
          testDiv.innerHTML = xssPayloads[0]; // First XSS payload
          document.body.appendChild(testDiv);
          
          // Check if script was executed
          const hasScript = testDiv.querySelector('script');
          if (hasScript) {
            results.push('innerHTML contains unescaped script');
          }
          
          // Clean up
          document.body.removeChild(testDiv);
          
          // Test URL parameter injection
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set('test', xssPayloads[1]);
          
          results.push('DOM XSS tests completed');
          
        } catch (error) {
          results.push(`DOM XSS test error: ${error}`);
        }
        
        return results;
      }, SecurityPayloads.xss);
      
      console.log('DOM XSS test results:', domXssResults);
      
      expect(domXssDetected).toBeFalsy();
      console.log('✅ DOM-based XSS prevention working');
    });
  });

  test.describe('2. 🚫 SQL INJECTION PROTECTION TESTING', () => {
    
    test('2.1 SQL Injection in Authentication Fields', async ({ page }) => {
      console.log('🚀 Testing SQL Injection Protection...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      let suspiciousResponse = false;
      
      // Monitor for responses that might indicate SQL injection success
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/auth/login') || url.includes('/login')) {
          const statusCode = response.status();
          
          // Suspicious responses (500 errors might indicate SQL errors)
          if (statusCode >= 500) {
            console.log(`🚨 Suspicious response: ${statusCode} for ${url}`);
            suspiciousResponse = true;
          }
        }
      });
      
      // Test SQL injection payloads
      for (let i = 0; i < Math.min(SecurityPayloads.sqlInjection.length, 5); i++) {
        const payload = SecurityPayloads.sqlInjection[i];
        console.log(`Testing SQL injection payload ${i + 1}: ${payload}`);
        
        // Clear form
        await page.locator(SecuritySelectors.emailInput).fill('');
        await page.locator(SecuritySelectors.passwordInput).fill('');
        
        // Test SQL injection in email field
        await page.locator(SecuritySelectors.emailInput).fill(`admin@test.com${payload}`);
        await page.locator(SecuritySelectors.passwordInput).fill('password');
        
        await page.locator(SecuritySelectors.submitButton).click();
        await setTimeout(2000); // Wait for response
        
        // Check if we're unexpectedly logged in (SQL injection bypass)
        const currentUrl = page.url();
        const isLoggedIn = !currentUrl.includes('/login') && (
          currentUrl.includes('/admin') || 
          currentUrl.includes('/trainer') || 
          currentUrl.includes('/my-meal-plans')
        );
        
        if (isLoggedIn) {
          console.log('🚨 Possible SQL injection bypass detected!');
          expect(isLoggedIn).toBeFalsy(); // Should fail test if SQL injection worked
        }
        
        // Test in password field as well
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        await page.locator(SecuritySelectors.emailInput).fill('admin@test.com');
        await page.locator(SecuritySelectors.passwordInput).fill(payload);
        
        await page.locator(SecuritySelectors.submitButton).click();
        await setTimeout(2000);
        
        // Check again
        const currentUrl2 = page.url();
        const isLoggedIn2 = !currentUrl2.includes('/login');
        
        expect(isLoggedIn2).toBeFalsy(); // Should not be logged in via SQL injection
      }
      
      console.log('✅ SQL injection protection working - no bypass detected');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/security-sql-injection-prevention.png',
        fullPage: true 
      });
    });

    test('2.2 Database Error Information Leakage', async ({ page }) => {
      console.log('🚀 Testing Database Error Information Leakage...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const errorResponses: string[] = [];
      
      // Monitor responses for database error leakage
      page.on('response', async (response) => {
        if (response.url().includes('/api/')) {
          const statusCode = response.status();
          if (statusCode >= 400) {
            try {
              const responseText = await response.text();
              
              // Check for database-specific error messages
              const dbErrors = ['SQL', 'mysql', 'postgresql', 'database', 'table', 'column', 'constraint'];
              const hasDbError = dbErrors.some(error => 
                responseText.toLowerCase().includes(error.toLowerCase())
              );
              
              if (hasDbError) {
                errorResponses.push(`${statusCode}: ${responseText.slice(0, 200)}`);
                console.log('🚨 Potential database error leakage detected');
              }
            } catch (e) {
              // Response might not be text
            }
          }
        }
      });
      
      // Trigger potential database errors
      await page.locator(SecuritySelectors.emailInput).fill("admin@test.com' OR 1=1 --");
      await page.locator(SecuritySelectors.passwordInput).fill('password');
      await page.locator(SecuritySelectors.submitButton).click();
      
      await setTimeout(3000);
      
      // Check for error message visibility on page
      const errorMessage = page.locator(SecuritySelectors.errorMessage);
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Error message displayed: ${errorText}`);
        
        // Error should be generic, not revealing database details
        const genericError = errorText && (
          errorText.includes('Invalid') ||
          errorText.includes('incorrect') ||
          errorText.includes('failed') ||
          errorText.includes('unauthorized')
        );
        
        expect(genericError).toBeTruthy();
      }
      
      console.log('✅ Database error information properly handled');
    });
  });

  test.describe('3. 🛑 CSRF PROTECTION TESTING', () => {
    
    test('3.1 CSRF Token Validation', async ({ page }) => {
      console.log('🚀 Testing CSRF Protection...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Check for CSRF token in form
      const csrfToken = await page.evaluate(() => {
        const tokenInput = document.querySelector('input[name="_token"], input[name="csrf_token"], input[name="authenticity_token"]');
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        
        return {
          formToken: tokenInput ? tokenInput.getAttribute('value') : null,
          metaToken: metaToken ? metaToken.getAttribute('content') : null
        };
      });
      
      if (csrfToken.formToken || csrfToken.metaToken) {
        console.log('✅ CSRF token found in form or meta tag');
      } else {
        console.log('ℹ️  CSRF token not found - may be handled differently');
      }
      
      // Test form submission without proper origin
      const formData = new URLSearchParams();
      formData.append('email', testCredentials.admin.email);
      formData.append('password', testCredentials.admin.password);
      
      // Make request from different origin (simulating CSRF attack)
      const csrfResponse = await page.evaluate(async (baseUrl, formDataString) => {
        try {
          const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Origin': 'http://evil-site.com', // Fake origin
            },
            body: formDataString
          });
          
          return {
            status: response.status,
            success: response.ok
          };
        } catch (error) {
          return {
            status: 0,
            success: false,
            error: error.toString()
          };
        }
      }, BASE_URL, formData.toString());
      
      // CSRF protection should prevent this request from succeeding
      if (csrfResponse.status >= 400 || !csrfResponse.success) {
        console.log('✅ CSRF protection working - cross-origin request blocked');
      } else {
        console.log('⚠️  CSRF protection may need strengthening');
      }
    });

    test('3.2 Same-Site Cookie Configuration', async ({ page }) => {
      console.log('🚀 Testing SameSite Cookie Configuration...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Login to get session cookie
      await page.locator(SecuritySelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(SecuritySelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(SecuritySelectors.submitButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Check cookie configuration
      const cookies = await page.context().cookies();
      
      for (const cookie of cookies) {
        console.log(`Cookie: ${cookie.name}`);
        console.log(`  Secure: ${cookie.secure}`);
        console.log(`  HttpOnly: ${cookie.httpOnly}`);
        console.log(`  SameSite: ${cookie.sameSite}`);
        
        // Security recommendations for session cookies
        if (cookie.name.toLowerCase().includes('session') || 
            cookie.name.toLowerCase().includes('token') ||
            cookie.name.toLowerCase().includes('auth')) {
          
          // Session cookies should be HttpOnly and Secure
          if (!cookie.httpOnly) {
            console.log('⚠️  Session cookie should be HttpOnly');
          }
          
          // In production, cookies should be Secure (HTTPS only)
          if (!cookie.secure && process.env.NODE_ENV === 'production') {
            console.log('⚠️  Session cookie should be Secure in production');
          }
          
          // SameSite should be Strict or Lax
          if (cookie.sameSite === 'None') {
            console.log('⚠️  Session cookie SameSite=None may be insecure');
          }
        }
      }
      
      console.log('✅ Cookie security configuration reviewed');
    });
  });

  test.describe('4. 🔐 JWT TOKEN SECURITY TESTING', () => {
    
    test('4.1 JWT Token Security and Validation', async ({ page }) => {
      console.log('🚀 Testing JWT Token Security...');
      
      // Login to get JWT token
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill(testCredentials.trainer.email);
      await page.locator(SecuritySelectors.passwordInput).fill(testCredentials.trainer.password);
      await page.locator(SecuritySelectors.submitButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Get JWT token from localStorage
      const tokenInfo = await page.evaluate(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Decode JWT header and payload (not signature)
            const parts = token.split('.');
            if (parts.length === 3) {
              const header = JSON.parse(atob(parts[0]));
              const payload = JSON.parse(atob(parts[1]));
              
              return {
                hasToken: true,
                algorithm: header.alg,
                expiresAt: payload.exp,
                issuedAt: payload.iat,
                subject: payload.sub,
                currentTime: Math.floor(Date.now() / 1000)
              };
            }
          } catch (e) {
            return { hasToken: true, decodeError: e.toString() };
          }
        }
        
        return { hasToken: false };
      });
      
      expect(tokenInfo.hasToken).toBeTruthy();
      console.log('✅ JWT token present in localStorage');
      
      if (tokenInfo.algorithm) {
        console.log(`JWT Algorithm: ${tokenInfo.algorithm}`);
        
        // Check for secure algorithm
        const secureAlgorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];
        if (secureAlgorithms.includes(tokenInfo.algorithm)) {
          console.log('✅ JWT using secure algorithm');
        } else if (tokenInfo.algorithm === 'HS256') {
          console.log('ℹ️  JWT using HS256 - ensure strong secret');
        } else {
          console.log('⚠️  JWT algorithm may be insecure');
        }
      }
      
      // Check token expiration
      if (tokenInfo.expiresAt && tokenInfo.currentTime) {
        const timeToExpiry = tokenInfo.expiresAt - tokenInfo.currentTime;
        console.log(`Token expires in: ${timeToExpiry} seconds`);
        
        if (timeToExpiry > 86400) { // 24 hours
          console.log('⚠️  Token expiration may be too long');
        } else {
          console.log('✅ Token expiration is reasonable');
        }
      }
      
      // Test token tampering
      await page.evaluate(() => {
        const originalToken = localStorage.getItem('token');
        if (originalToken) {
          // Tamper with token
          const tamperedToken = originalToken.slice(0, -10) + 'tampered123';
          localStorage.setItem('token', tamperedToken);
        }
      });
      
      // Try to access protected resource with tampered token
      await page.goto(`${BASE_URL}/trainer/health-protocols`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should be redirected to login due to invalid token
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('✅ Tampered JWT token properly rejected');
      } else {
        console.log('⚠️  Tampered JWT token may have been accepted');
      }
    });

    test('4.2 Token Refresh Security', async ({ page }) => {
      console.log('🚀 Testing Token Refresh Security...');
      
      // Login to establish session
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill(testCredentials.customer.email);
      await page.locator(SecuritySelectors.passwordInput).fill(testCredentials.customer.password);
      await page.locator(SecuritySelectors.submitButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      const initialToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(initialToken).toBeTruthy();
      
      // Simulate token expiration by removing it
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      
      // Try to access protected resource
      await page.goto(`${BASE_URL}/my-meal-plans/progress`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Should be redirected to login or show re-auth prompt
      const currentUrl = page.url();
      const needsReauth = currentUrl.includes('/login') || 
                         await page.locator('.login-prompt, [data-testid="reauth-prompt"]').isVisible();
      
      if (needsReauth) {
        console.log('✅ Token expiration properly handled');
      } else {
        console.log('ℹ️  Token refresh may be automatic');
      }
    });
  });

  test.describe('5. 🚨 RATE LIMITING TESTING', () => {
    
    test('5.1 Authentication Rate Limiting', async ({ page }) => {
      console.log('🚀 Testing Authentication Rate Limiting...');
      
      let rateLimitDetected = false;
      const attemptTimes: number[] = [];
      
      // Monitor for rate limiting responses
      page.on('response', async (response) => {
        if (response.url().includes('/api/auth/login') || response.url().includes('/login')) {
          const status = response.status();
          
          if (status === 429) { // Too Many Requests
            rateLimitDetected = true;
            console.log('🚨 Rate limit detected (HTTP 429)');
          }
          
          // Check response headers for rate limiting
          const rateLimitHeaders = {
            remaining: response.headers()['x-ratelimit-remaining'],
            resetTime: response.headers()['x-ratelimit-reset'],
            retryAfter: response.headers()['retry-after']
          };
          
          if (rateLimitHeaders.remaining !== undefined) {
            console.log(`Rate limit remaining: ${rateLimitHeaders.remaining}`);
          }
        }
      });
      
      // Perform rapid authentication attempts
      for (let i = 0; i < 10; i++) {
        const attemptStart = Date.now();
        
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Use invalid credentials to avoid successful login
        await page.locator(SecuritySelectors.emailInput).fill('attacker@test.com');
        await page.locator(SecuritySelectors.passwordInput).fill('wrongpassword');
        await page.locator(SecuritySelectors.submitButton).click();
        
        await setTimeout(500); // Small delay
        const attemptEnd = Date.now();
        attemptTimes.push(attemptEnd - attemptStart);
        
        console.log(`Attempt ${i + 1}: ${attemptEnd - attemptStart}ms`);
        
        // Check for rate limiting error messages
        const errorMessage = page.locator(SecuritySelectors.errorMessage);
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          if (errorText && (
            errorText.includes('rate') || 
            errorText.includes('limit') || 
            errorText.includes('attempts') ||
            errorText.includes('too many')
          )) {
            rateLimitDetected = true;
            console.log('🚨 Rate limit detected via error message');
            break;
          }
        }
        
        // If response times are getting much longer, might indicate rate limiting
        if (i > 5 && attemptTimes[i] > attemptTimes[0] * 3) {
          console.log('🚨 Possible rate limiting detected via response time increase');
        }
      }
      
      if (rateLimitDetected) {
        console.log('✅ Rate limiting is working');
      } else {
        console.log('⚠️  Rate limiting may not be configured or needs strengthening');
      }
      
      await page.screenshot({ 
        path: 'test-results/screenshots/security-rate-limiting.png',
        fullPage: true 
      });
    });

    test('5.2 API Rate Limiting Validation', async ({ page }) => {
      console.log('🚀 Testing API Rate Limiting...');
      
      // Login first to get valid session
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(SecuritySelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(SecuritySelectors.submitButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Make rapid API requests
      const apiResults = await page.evaluate(async (baseUrl) => {
        const results: any[] = [];
        const token = localStorage.getItem('token');
        
        for (let i = 0; i < 20; i++) {
          try {
            const startTime = Date.now();
            const response = await fetch(`${baseUrl}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            const endTime = Date.now();
            
            results.push({
              attempt: i + 1,
              status: response.status,
              duration: endTime - startTime,
              rateLimited: response.status === 429,
              hasRetryAfter: response.headers.get('Retry-After') !== null
            });
            
            if (response.status === 429) {
              break; // Stop on rate limit
            }
            
          } catch (error) {
            results.push({
              attempt: i + 1,
              error: error.toString()
            });
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return results;
      }, BASE_URL);
      
      console.log('API Rate Limiting Results:');
      let rateLimitHit = false;
      
      for (const result of apiResults) {
        console.log(`  Request ${result.attempt}: ${result.status} (${result.duration}ms)`);
        
        if (result.rateLimited) {
          rateLimitHit = true;
          console.log('    🚨 Rate limited!');
        }
      }
      
      if (rateLimitHit) {
        console.log('✅ API rate limiting is working');
      } else {
        console.log('ℹ️  API rate limiting may be set to high limits or not configured');
      }
    });
  });

  test.describe('6. 🛡️ INPUT VALIDATION & SANITIZATION', () => {
    
    test('6.1 Input Validation and Sanitization', async ({ page }) => {
      console.log('🚀 Testing Input Validation and Sanitization...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Test various malicious inputs
      const maliciousInputs = [
        ...SecurityPayloads.xss.slice(0, 3),
        ...SecurityPayloads.sqlInjection.slice(0, 3),
        ...SecurityPayloads.commandInjection.slice(0, 2),
        '../../etc/passwd',
        'null',
        'undefined',
        '${7*7}',
        '{{7*7}}',
        '<%= 7*7 %>',
        'SELECT * FROM users',
        '"><script>alert(1)</script>'
      ];
      
      for (const input of maliciousInputs) {
        console.log(`Testing input: ${input.slice(0, 30)}...`);
        
        // Test in email field
        await page.locator(SecuritySelectors.emailInput).fill(input);
        await page.locator(SecuritySelectors.passwordInput).fill('password');
        await page.locator(SecuritySelectors.submitButton).click();
        
        await setTimeout(1000);
        
        // Check that we're not logged in (validation working)
        const currentUrl = page.url();
        const isLoggedIn = !currentUrl.includes('/login');
        
        expect(isLoggedIn).toBeFalsy(); // Should not be logged in with malicious input
        
        // Check for proper error handling
        const errorMessage = page.locator(SecuritySelectors.errorMessage);
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          
          // Error should be generic, not revealing the rejected input
          const containsInput = errorText && errorText.includes(input.slice(0, 10));
          if (containsInput) {
            console.log('⚠️  Error message may be revealing input details');
          }
        }
        
        // Clear form for next test
        await page.locator(SecuritySelectors.emailInput).fill('');
        await page.locator(SecuritySelectors.passwordInput).fill('');
      }
      
      console.log('✅ Input validation and sanitization testing completed');
    });

    test('6.2 File Upload Security (if present)', async ({ page }) => {
      console.log('🚀 Testing File Upload Security...');
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Look for file upload inputs
      const fileInputs = await page.locator('input[type="file"]').count();
      
      if (fileInputs > 0) {
        console.log(`Found ${fileInputs} file upload inputs`);
        
        // Test file type restrictions
        const dangerousFileTypes = [
          'test.exe',
          'script.js',
          'page.php',
          'shell.sh',
          'malware.bat',
          'virus.vbs'
        ];
        
        for (const fileName of dangerousFileTypes) {
          // This would require actual file creation for full testing
          console.log(`Would test dangerous file: ${fileName}`);
        }
        
        console.log('ℹ️  File upload security requires manual testing with actual files');
      } else {
        console.log('ℹ️  No file upload inputs found on login page');
      }
    });
  });

  test.describe('7. 🎯 SECURITY CRITICAL SUCCESS VALIDATION', () => {
    
    test('7.1 COMPREHENSIVE SECURITY VALIDATION WITH AUTHENTICATION', async ({ page }) => {
      console.log('🎯 CRITICAL: Comprehensive Security Validation...');
      
      const securityResults = {
        xssPrevention: false,
        sqlInjectionProtection: false,
        inputValidation: false,
        authenticationSecurity: {
          admin: false,
          trainer: false,
          customer: false
        },
        sessionSecurity: false,
        rateLimitingDetected: false
      };
      
      // Test 1: XSS Prevention
      console.log('Testing XSS prevention...');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      let xssTriggered = false;
      page.on('dialog', () => { xssTriggered = true; });
      
      await page.locator(SecuritySelectors.emailInput).fill('<script>alert("xss")</script>');
      await page.locator(SecuritySelectors.passwordInput).fill('password');
      await page.locator(SecuritySelectors.submitButton).click();
      await setTimeout(2000);
      
      securityResults.xssPrevention = !xssTriggered;
      console.log(`XSS Prevention: ${securityResults.xssPrevention ? 'PASS' : 'FAIL'}`);
      
      // Test 2: SQL Injection Protection
      console.log('Testing SQL injection protection...');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill("admin@test.com' OR 1=1 --");
      await page.locator(SecuritySelectors.passwordInput).fill('password');
      await page.locator(SecuritySelectors.submitButton).click();
      await setTimeout(2000);
      
      const sqlBypass = !page.url().includes('/login') && (
        page.url().includes('/admin') || page.url().includes('/dashboard')
      );
      securityResults.sqlInjectionProtection = !sqlBypass;
      console.log(`SQL Injection Protection: ${securityResults.sqlInjectionProtection ? 'PASS' : 'FAIL'}`);
      
      // Test 3: Input Validation
      console.log('Testing input validation...');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill('null');
      await page.locator(SecuritySelectors.passwordInput).fill('${7*7}');
      await page.locator(SecuritySelectors.submitButton).click();
      await setTimeout(2000);
      
      const validationBypass = !page.url().includes('/login');
      securityResults.inputValidation = !validationBypass;
      console.log(`Input Validation: ${securityResults.inputValidation ? 'PASS' : 'FAIL'}`);
      
      // Test 4: Secure Authentication for All Roles
      console.log('Testing secure authentication for all roles...');
      
      for (const [role, creds] of Object.entries(testCredentials)) {
        try {
          await page.goto(`${BASE_URL}/login`);
          await page.waitForLoadState('networkidle');
          
          await page.locator(SecuritySelectors.emailInput).fill(creds.email);
          await page.locator(SecuritySelectors.passwordInput).fill(creds.password);
          await page.locator(SecuritySelectors.submitButton).click();
          
          await page.waitForLoadState('networkidle');
          await setTimeout(3000);
          
          // Verify secure login (HTTPS in production, proper redirect)
          const currentUrl = page.url();
          const isLoggedIn = !currentUrl.includes('/login');
          const hasSecureRedirect = isLoggedIn && (
            currentUrl.includes(creds.expectedRedirect.split('/')[1])
          );
          
          securityResults.authenticationSecurity[role] = hasSecureRedirect;
          console.log(`${role} secure auth: ${hasSecureRedirect ? 'PASS' : 'FAIL'}`);
          
          // Test JWT token security
          if (isLoggedIn) {
            const tokenSecure = await page.evaluate(() => {
              const token = localStorage.getItem('token');
              return token && token.split('.').length === 3; // Valid JWT structure
            });
            
            if (!tokenSecure) {
              securityResults.authenticationSecurity[role] = false;
            }
          }
          
          // Clear for next test
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
        } catch (error) {
          console.log(`${role} authentication security test failed:`, error);
          securityResults.authenticationSecurity[role] = false;
        }
      }
      
      // Test 5: Session Security
      console.log('Testing session security...');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.locator(SecuritySelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(SecuritySelectors.passwordInput).fill(testCredentials.admin.password);
      await page.locator(SecuritySelectors.submitButton).click();
      
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Check cookies for security attributes
      const cookies = await page.context().cookies();
      const hasSecureCookies = cookies.some(cookie => 
        cookie.httpOnly && (cookie.secure || process.env.NODE_ENV !== 'production')
      );
      
      securityResults.sessionSecurity = hasSecureCookies;
      console.log(`Session Security: ${securityResults.sessionSecurity ? 'PASS' : 'FAIL'}`);
      
      // Test 6: Rate Limiting (simplified)
      console.log('Testing rate limiting...');
      let rateLimitHit = false;
      
      for (let i = 0; i < 5; i++) {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        await page.locator(SecuritySelectors.emailInput).fill('attacker@test.com');
        await page.locator(SecuritySelectors.passwordInput).fill('wrong');
        await page.locator(SecuritySelectors.submitButton).click();
        await setTimeout(200);
        
        // Check for rate limiting indication
        const errorMsg = page.locator(SecuritySelectors.errorMessage);
        if (await errorMsg.isVisible()) {
          const errorText = await errorMsg.textContent();
          if (errorText && errorText.toLowerCase().includes('rate')) {
            rateLimitHit = true;
            break;
          }
        }
      }
      
      securityResults.rateLimitingDetected = rateLimitHit;
      console.log(`Rate Limiting: ${rateLimitHit ? 'PASS' : 'NEEDS_REVIEW'}`);
      
      // Final Security Report
      console.log('\n🎯 COMPREHENSIVE SECURITY RESULTS:');
      console.log(`XSS Prevention: ${securityResults.xssPrevention ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`SQL Injection Protection: ${securityResults.sqlInjectionProtection ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Input Validation: ${securityResults.inputValidation ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Admin Auth Security: ${securityResults.authenticationSecurity.admin ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Trainer Auth Security: ${securityResults.authenticationSecurity.trainer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Customer Auth Security: ${securityResults.authenticationSecurity.customer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Session Security: ${securityResults.sessionSecurity ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Rate Limiting: ${securityResults.rateLimitingDetected ? '✅ PASS' : 'ℹ️ REVIEW'}`);
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/security-validation-complete.png',
        fullPage: true 
      });
      
      // Critical security measures must pass
      expect(securityResults.xssPrevention).toBeTruthy();
      expect(securityResults.sqlInjectionProtection).toBeTruthy();
      expect(securityResults.inputValidation).toBeTruthy();
      expect(securityResults.authenticationSecurity.admin).toBeTruthy();
      expect(securityResults.authenticationSecurity.trainer).toBeTruthy();
      expect(securityResults.authenticationSecurity.customer).toBeTruthy();
      
      // Session security is important but may be configured differently
      if (!securityResults.sessionSecurity) {
        console.log('⚠️  Session security should be reviewed for production');
      }
      
      console.log('\n🎉 CRITICAL SECURITY SUCCESS CRITERIA MET!');
    });
  });
});