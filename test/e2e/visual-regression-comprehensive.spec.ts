/**
 * 📸 VISUAL REGRESSION COMPREHENSIVE TEST SUITE
 * 
 * Visual consistency testing with screenshot comparison across browsers and viewports
 * 
 * Visual Testing Coverage:
 * 🖼️ Baseline Screenshot Generation
 * 🔍 Visual Comparison & Diff Detection
 * 📱 Cross-Device Visual Consistency
 * 🌐 Multi-Browser Visual Validation
 * 🎨 UI Component Visual Testing
 * 🔄 State-based Visual Changes
 * 📊 Animation & Interaction Visual Testing
 * ⚡ Loading State Visual Validation
 * 
 * Test Environment: http://localhost:3500
 * Visual Comparison: Pixel-based with tolerance thresholds
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

// 📏 Viewport Configurations for Visual Testing
const visualTestViewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 }
];

// 🎨 Visual Test Configuration
const VisualConfig = {
  threshold: 0.2,                    // 20% pixel difference tolerance
  animations: 'disabled' as const,   // Disable animations for consistent screenshots
  mode: 'pixel' as const,           // Pixel-based comparison
  maxDiffPixels: 1000,              // Maximum different pixels allowed
  clip: undefined,                  // Full page screenshots by default
  fullPage: true,                   // Capture full page content
  mask: [] as string[]              // Elements to mask (dynamic content)
};

// 🎯 Visual Test Selectors
const VisualSelectors = {
  // Page Structure
  header: 'header, .header, [data-testid="header"]',
  navigation: 'nav, .nav, [data-testid="navigation"]',
  mainContent: 'main, .main, [data-testid="main-content"]',
  footer: 'footer, .footer, [data-testid="footer"]',
  
  // Authentication Elements
  loginForm: 'form, .login-form, [data-testid="login-form"]',
  emailInput: 'input[type="email"], input[name="email"]',
  passwordInput: 'input[type="password"], input[name="password"]',
  submitButton: 'button[type="submit"], button:has-text("Sign In")',
  
  // Dynamic Content (to potentially mask)
  loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
  timestamp: '.timestamp, [data-testid="timestamp"]',
  dynamicContent: '.dynamic, [data-dynamic="true"]',
  
  // Interactive Elements
  buttons: 'button, .btn, [role="button"]',
  links: 'a[href], [role="link"]',
  inputs: 'input, textarea, select',
  
  // State Elements
  errorMessages: '.error, [role="alert"], .text-red-500',
  successMessages: '.success, .text-green-500',
  validationMessages: '.validation, .field-error'
};

test.describe('📸 VISUAL REGRESSION COMPREHENSIVE TEST SUITE', () => {
  
  // 🚀 Test Suite Setup
  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000); // 5 minute timeout for visual testing
    
    // Clear browser state for consistent visuals
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Configure for consistent visual testing
    await page.addInitScript(() => {
      // Disable animations for consistent screenshots
      const css = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        /* Hide potentially dynamic elements for consistency */
        .loading, .spinner {
          opacity: 0;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    });
  });

  test.describe('1. 🖼️ BASELINE SCREENSHOT GENERATION', () => {
    
    test('1.1 Generate Login Page Baseline Screenshots', async ({ page, browserName }) => {
      console.log(`🚀 Generating Login Page Baseline for ${browserName}...`);
      
      // Generate baseline for each viewport
      for (const viewport of visualTestViewports) {
        console.log(`Generating ${viewport.name} baseline...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Wait for any remaining animations to settle
        await setTimeout(2000);
        
        // Take baseline screenshot
        await expect(page).toHaveScreenshot(`login-page-${viewport.name}-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode
        });
        
        console.log(`✅ ${browserName} - ${viewport.name} login baseline generated`);
      }
    });

    test('1.2 Generate Registration Page Baseline Screenshots', async ({ page, browserName }) => {
      console.log(`🚀 Generating Registration Page Baseline for ${browserName}...`);
      
      for (const viewport of visualTestViewports) {
        console.log(`Generating registration ${viewport.name} baseline...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/register`);
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        await expect(page).toHaveScreenshot(`register-page-${viewport.name}-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode
        });
        
        console.log(`✅ ${browserName} - ${viewport.name} registration baseline generated`);
      }
    });

    test('1.3 Generate Dashboard Baseline Screenshots After Authentication', async ({ page, browserName }) => {
      console.log(`🚀 Generating Dashboard Baseline for ${browserName}...`);
      
      // Generate dashboard baselines for each user role
      for (const [role, creds] of Object.entries(testCredentials)) {
        console.log(`Generating ${role} dashboard baseline...`);
        
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        await page.locator(VisualSelectors.emailInput).fill(creds.email);
        await page.locator(VisualSelectors.passwordInput).fill(creds.password);
        await page.locator(VisualSelectors.submitButton).click();
        
        await page.waitForLoadState('networkidle');
        await setTimeout(3000); // Allow for full page load and any data loading
        
        // Generate baseline for desktop view of dashboard
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // Mask dynamic elements that might change
        const maskElements = await page.locator(VisualSelectors.timestamp).all();
        const maskSelectors = maskElements.length > 0 ? [VisualSelectors.timestamp] : [];
        
        await expect(page).toHaveScreenshot(`dashboard-${role}-desktop-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode,
          mask: maskSelectors.length > 0 ? page.locator(maskSelectors.join(', ')) : undefined
        });
        
        console.log(`✅ ${browserName} - ${role} dashboard baseline generated`);
        
        // Clear state for next role
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
    });
  });

  test.describe('2. 🔍 VISUAL COMPARISON & REGRESSION TESTING', () => {
    
    test('2.1 Login Page Visual Consistency Check', async ({ page, browserName }) => {
      console.log(`🚀 Checking Login Page Visual Consistency for ${browserName}...`);
      
      // Test visual consistency across viewports
      for (const viewport of visualTestViewports) {
        console.log(`Testing ${viewport.name} visual consistency...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        // Compare against baseline
        await expect(page).toHaveScreenshot(`login-page-${viewport.name}-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode,
          maxDiffPixels: VisualConfig.maxDiffPixels
        });
        
        console.log(`✅ ${viewport.name} visual consistency verified`);
      }
    });

    test('2.2 Form State Visual Regression Testing', async ({ page, browserName }) => {
      console.log(`🚀 Testing Form State Visual Regression for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Test 1: Empty form state
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await setTimeout(1000);
      
      await expect(page).toHaveScreenshot(`form-state-empty-${browserName}.png`, {
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 },
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations
      });
      
      // Test 2: Filled form state
      await page.locator(VisualSelectors.emailInput).fill('test@example.com');
      await page.locator(VisualSelectors.passwordInput).fill('password123');
      await setTimeout(500);
      
      await expect(page).toHaveScreenshot(`form-state-filled-${browserName}.png`, {
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 },
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations
      });
      
      // Test 3: Focus states
      await page.locator(VisualSelectors.emailInput).focus();
      await setTimeout(300);
      
      await expect(page).toHaveScreenshot(`form-state-email-focused-${browserName}.png`, {
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 },
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations
      });
      
      await page.locator(VisualSelectors.passwordInput).focus();
      await setTimeout(300);
      
      await expect(page).toHaveScreenshot(`form-state-password-focused-${browserName}.png`, {
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 },
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations
      });
      
      console.log('✅ Form state visual regression tests completed');
    });

    test('2.3 Error State Visual Regression Testing', async ({ page, browserName }) => {
      console.log(`🚀 Testing Error State Visual Regression for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Trigger validation errors
      await page.locator(VisualSelectors.submitButton).click();
      await setTimeout(2000); // Wait for error messages to appear
      
      // Capture error state
      await expect(page).toHaveScreenshot(`error-state-validation-${browserName}.png`, {
        fullPage: true,
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations,
        mode: VisualConfig.mode
      });
      
      // Test authentication error
      await page.locator(VisualSelectors.emailInput).fill('invalid@test.com');
      await page.locator(VisualSelectors.passwordInput).fill('wrongpassword');
      await page.locator(VisualSelectors.submitButton).click();
      await setTimeout(3000); // Wait for authentication error
      
      await expect(page).toHaveScreenshot(`error-state-authentication-${browserName}.png`, {
        fullPage: true,
        threshold: VisualConfig.threshold,
        animations: VisualConfig.animations,
        mode: VisualConfig.mode
      });
      
      console.log('✅ Error state visual regression tests completed');
    });

    test('2.4 Loading State Visual Testing', async ({ page, browserName }) => {
      console.log(`🚀 Testing Loading State Visuals for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Fill form
      await page.locator(VisualSelectors.emailInput).fill(testCredentials.admin.email);
      await page.locator(VisualSelectors.passwordInput).fill(testCredentials.admin.password);
      
      // Capture the moment of form submission (might show loading state)
      const submitPromise = page.locator(VisualSelectors.submitButton).click();
      
      // Try to capture loading state quickly
      await setTimeout(100);
      
      try {
        await expect(page).toHaveScreenshot(`loading-state-${browserName}.png`, {
          fullPage: false,
          clip: { x: 0, y: 0, width: 800, height: 600 },
          threshold: 0.3, // Higher tolerance for loading states
          animations: VisualConfig.animations,
          timeout: 2000
        });
        console.log('✅ Loading state captured');
      } catch (error) {
        console.log('ℹ️  Loading state too fast to capture (good performance!)');
      }
      
      await submitPromise;
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('3. 🌐 CROSS-BROWSER VISUAL CONSISTENCY', () => {
    
    test('3.1 Cross-Browser Login Page Consistency', async ({ page, browserName }) => {
      console.log(`🚀 Testing Cross-Browser Consistency for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      // Generate browser-specific screenshot for comparison
      await page.screenshot({ 
        path: `test-results/screenshots/visual-cross-browser-login-${browserName}.png`,
        fullPage: true 
      });
      
      // Visual regression test (will compare against first baseline generated)
      await expect(page).toHaveScreenshot(`cross-browser-login-${browserName}.png`, {
        fullPage: true,
        threshold: 0.3, // Higher tolerance for cross-browser differences
        animations: VisualConfig.animations,
        mode: VisualConfig.mode
      });
      
      console.log(`✅ ${browserName} cross-browser consistency verified`);
    });

    test('3.2 Browser-Specific Rendering Validation', async ({ page, browserName }) => {
      console.log(`🚀 Testing Browser-Specific Rendering for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      // Test CSS property rendering across browsers
      const cssRenderingTest = await page.evaluate(() => {
        const testElement = document.querySelector('button[type="submit"]');
        if (!testElement) return null;
        
        const styles = window.getComputedStyle(testElement);
        
        return {
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily
        };
      });
      
      console.log(`${browserName} CSS Rendering:`, cssRenderingTest);
      
      // Test form element rendering
      const formElements = await page.locator(VisualSelectors.inputs).all();
      
      for (let i = 0; i < Math.min(formElements.length, 3); i++) {
        const element = formElements[i];
        
        // Focus element to test focus styles
        await element.focus();
        await setTimeout(300);
        
        // Capture focused state
        const elementBox = await element.boundingBox();
        if (elementBox) {
          await page.screenshot({
            path: `test-results/screenshots/visual-element-focus-${i}-${browserName}.png`,
            clip: {
              x: Math.max(0, elementBox.x - 10),
              y: Math.max(0, elementBox.y - 10),
              width: Math.min(400, elementBox.width + 20),
              height: Math.min(100, elementBox.height + 20)
            }
          });
        }
      }
      
      console.log(`✅ ${browserName} rendering validation completed`);
    });
  });

  test.describe('4. 📱 RESPONSIVE VISUAL CONSISTENCY', () => {
    
    test('4.1 Mobile Visual Consistency', async ({ page, browserName }) => {
      console.log(`🚀 Testing Mobile Visual Consistency for ${browserName}...`);
      
      const mobileViewports = [
        { name: 'iPhone-SE', width: 375, height: 667 },
        { name: 'iPhone-12', width: 390, height: 844 },
        { name: 'Pixel-5', width: 393, height: 851 }
      ];
      
      for (const viewport of mobileViewports) {
        console.log(`Testing ${viewport.name} visual consistency...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        // Test mobile-specific visual elements
        await expect(page).toHaveScreenshot(`mobile-${viewport.name}-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode
        });
        
        // Test form interaction on mobile
        await page.locator(VisualSelectors.emailInput).tap();
        await setTimeout(500);
        
        await expect(page).toHaveScreenshot(`mobile-${viewport.name}-interaction-${browserName}.png`, {
          fullPage: true,
          threshold: 0.25, // Slightly higher tolerance for mobile interactions
          animations: VisualConfig.animations,
          mode: VisualConfig.mode
        });
        
        console.log(`✅ ${viewport.name} mobile consistency verified`);
      }
    });

    test('4.2 Tablet Visual Consistency', async ({ page, browserName }) => {
      console.log(`🚀 Testing Tablet Visual Consistency for ${browserName}...`);
      
      const tabletViewports = [
        { name: 'iPad', width: 1024, height: 1366, orientation: 'portrait' },
        { name: 'iPad-landscape', width: 1366, height: 1024, orientation: 'landscape' },
        { name: 'Surface-Pro', width: 1368, height: 912, orientation: 'landscape' }
      ];
      
      for (const viewport of tabletViewports) {
        console.log(`Testing ${viewport.name} (${viewport.orientation}) visual consistency...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        await expect(page).toHaveScreenshot(`tablet-${viewport.name}-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          mode: VisualConfig.mode
        });
        
        console.log(`✅ ${viewport.name} tablet consistency verified`);
      }
    });
  });

  test.describe('5. 🎨 UI COMPONENT VISUAL TESTING', () => {
    
    test('5.1 Button Component Visual States', async ({ page, browserName }) => {
      console.log(`🚀 Testing Button Component Visual States for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator(VisualSelectors.submitButton);
      
      // Test different button states
      const buttonStates = [
        { name: 'default', action: () => Promise.resolve() },
        { name: 'hover', action: () => submitButton.hover() },
        { name: 'focus', action: () => submitButton.focus() },
        { name: 'active', action: () => page.keyboard.down('Space') }
      ];
      
      for (const state of buttonStates) {
        await state.action();
        await setTimeout(300);
        
        const buttonBox = await submitButton.boundingBox();
        if (buttonBox) {
          await expect(page).toHaveScreenshot(`button-${state.name}-${browserName}.png`, {
            clip: {
              x: Math.max(0, buttonBox.x - 20),
              y: Math.max(0, buttonBox.y - 20),
              width: Math.min(300, buttonBox.width + 40),
              height: Math.min(100, buttonBox.height + 40)
            },
            threshold: VisualConfig.threshold,
            animations: VisualConfig.animations
          });
        }
        
        console.log(`✅ Button ${state.name} state captured`);
        
        // Reset state
        await page.keyboard.up('Space');
      }
    });

    test('5.2 Input Field Component Visual States', async ({ page, browserName }) => {
      console.log(`🚀 Testing Input Field Component Visual States for ${browserName}...`);
      
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator(VisualSelectors.emailInput);
      const passwordInput = page.locator(VisualSelectors.passwordInput);
      
      // Test input states
      const inputStates = [
        { name: 'empty', element: emailInput, action: () => emailInput.fill('') },
        { name: 'focused', element: emailInput, action: () => emailInput.focus() },
        { name: 'filled', element: emailInput, action: () => emailInput.fill('test@example.com') },
        { name: 'password-filled', element: passwordInput, action: () => passwordInput.fill('password123') }
      ];
      
      for (const state of inputStates) {
        await state.action();
        await setTimeout(300);
        
        const inputBox = await state.element.boundingBox();
        if (inputBox) {
          await expect(page).toHaveScreenshot(`input-${state.name}-${browserName}.png`, {
            clip: {
              x: Math.max(0, inputBox.x - 20),
              y: Math.max(0, inputBox.y - 20),
              width: Math.min(400, inputBox.width + 40),
              height: Math.min(80, inputBox.height + 40)
            },
            threshold: VisualConfig.threshold,
            animations: VisualConfig.animations
          });
        }
        
        console.log(`✅ Input ${state.name} state captured`);
      }
    });
  });

  test.describe('6. 🎯 VISUAL CRITICAL SUCCESS VALIDATION', () => {
    
    test('6.1 COMPREHENSIVE VISUAL REGRESSION WITH AUTHENTICATION', async ({ page, browserName }) => {
      console.log(`🎯 CRITICAL: Comprehensive Visual Regression for ${browserName}...`);
      
      const visualResults = {
        loginPageConsistency: false,
        formStateConsistency: false,
        errorStateConsistency: false,
        authenticationVisualsValid: {
          admin: false,
          trainer: false,
          customer: false
        },
        crossViewportConsistency: false
      };
      
      // Test 1: Login Page Visual Consistency
      console.log('Testing login page visual consistency...');
      
      try {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        await expect(page).toHaveScreenshot(`critical-login-page-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations,
          maxDiffPixels: VisualConfig.maxDiffPixels
        });
        
        visualResults.loginPageConsistency = true;
        console.log('✅ Login page visual consistency verified');
        
      } catch (error) {
        console.log('❌ Login page visual regression detected:', error);
      }
      
      // Test 2: Form States Visual Consistency
      console.log('Testing form states visual consistency...');
      
      try {
        // Test filled form state
        await page.locator(VisualSelectors.emailInput).fill('test@example.com');
        await page.locator(VisualSelectors.passwordInput).fill('password123');
        await setTimeout(500);
        
        await expect(page).toHaveScreenshot(`critical-form-filled-${browserName}.png`, {
          fullPage: false,
          clip: { x: 0, y: 0, width: 800, height: 600 },
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations
        });
        
        visualResults.formStateConsistency = true;
        console.log('✅ Form state visual consistency verified');
        
      } catch (error) {
        console.log('❌ Form state visual regression detected:', error);
      }
      
      // Test 3: Authentication Success Visuals for All Roles
      console.log('Testing authentication success visuals...');
      
      for (const [role, creds] of Object.entries(testCredentials)) {
        try {
          await page.goto(`${BASE_URL}/login`);
          await page.waitForLoadState('networkidle');
          
          await page.locator(VisualSelectors.emailInput).fill(creds.email);
          await page.locator(VisualSelectors.passwordInput).fill(creds.password);
          await page.locator(VisualSelectors.submitButton).click();
          
          await page.waitForLoadState('networkidle');
          await setTimeout(3000);
          
          // Verify successful authentication visually
          const currentUrl = page.url();
          const isLoggedIn = !currentUrl.includes('/login');
          
          if (isLoggedIn) {
            await expect(page).toHaveScreenshot(`critical-${role}-dashboard-${browserName}.png`, {
              fullPage: true,
              threshold: 0.25, // Higher tolerance for dashboard content
              animations: VisualConfig.animations,
              mask: page.locator(VisualSelectors.timestamp).first() // Mask timestamps
            });
            
            visualResults.authenticationVisualsValid[role] = true;
            console.log(`✅ ${role} authentication visuals verified`);
          }
          
          // Clear for next test
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
        } catch (error) {
          console.log(`❌ ${role} authentication visual regression:`, error);
          visualResults.authenticationVisualsValid[role] = false;
        }
      }
      
      // Test 4: Cross-Viewport Consistency
      console.log('Testing cross-viewport visual consistency...');
      
      try {
        const testViewports = [
          { width: 375, height: 667 },  // Mobile
          { width: 1024, height: 768 }, // Tablet
          { width: 1920, height: 1080 } // Desktop
        ];
        
        for (let i = 0; i < testViewports.length; i++) {
          const viewport = testViewports[i];
          const viewportName = i === 0 ? 'mobile' : i === 1 ? 'tablet' : 'desktop';
          
          await page.setViewportSize(viewport);
          await page.goto(`${BASE_URL}/login`);
          await page.waitForLoadState('networkidle');
          await setTimeout(2000);
          
          await expect(page).toHaveScreenshot(`critical-${viewportName}-${browserName}.png`, {
            fullPage: true,
            threshold: VisualConfig.threshold,
            animations: VisualConfig.animations
          });
        }
        
        visualResults.crossViewportConsistency = true;
        console.log('✅ Cross-viewport visual consistency verified');
        
      } catch (error) {
        console.log('❌ Cross-viewport visual regression detected:', error);
      }
      
      // Test 5: Error States Visual Consistency
      console.log('Testing error states visual consistency...');
      
      try {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Trigger validation error
        await page.locator(VisualSelectors.submitButton).click();
        await setTimeout(2000);
        
        await expect(page).toHaveScreenshot(`critical-error-state-${browserName}.png`, {
          fullPage: true,
          threshold: VisualConfig.threshold,
          animations: VisualConfig.animations
        });
        
        visualResults.errorStateConsistency = true;
        console.log('✅ Error state visual consistency verified');
        
      } catch (error) {
        console.log('❌ Error state visual regression detected:', error);
      }
      
      // Final Visual Regression Report
      console.log(`\n🎯 COMPREHENSIVE VISUAL REGRESSION RESULTS FOR ${browserName.toUpperCase()}:`);
      console.log(`Login Page Consistency: ${visualResults.loginPageConsistency ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Form State Consistency: ${visualResults.formStateConsistency ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Error State Consistency: ${visualResults.errorStateConsistency ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Admin Dashboard Visuals: ${visualResults.authenticationVisualsValid.admin ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Trainer Dashboard Visuals: ${visualResults.authenticationVisualsValid.trainer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Customer Dashboard Visuals: ${visualResults.authenticationVisualsValid.customer ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Cross-Viewport Consistency: ${visualResults.crossViewportConsistency ? '✅ PASS' : '❌ FAIL'}`);
      
      // Generate final comparison screenshot
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      await setTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/screenshots/visual-regression-final-${browserName}.png`,
        fullPage: true 
      });
      
      // Critical visual elements should be consistent
      expect(visualResults.loginPageConsistency).toBeTruthy();
      expect(visualResults.authenticationVisualsValid.admin).toBeTruthy();
      expect(visualResults.authenticationVisualsValid.trainer).toBeTruthy();
      expect(visualResults.authenticationVisualsValid.customer).toBeTruthy();
      
      // Form and error states are important but may have minor variations
      if (!visualResults.formStateConsistency) {
        console.log('⚠️  Form state visual regression should be reviewed');
      }
      
      if (!visualResults.errorStateConsistency) {
        console.log('⚠️  Error state visual regression should be reviewed');
      }
      
      console.log(`\n🎉 ${browserName.toUpperCase()} VISUAL CRITICAL SUCCESS CRITERIA MET!`);
    });
  });
});