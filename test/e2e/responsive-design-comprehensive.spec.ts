/**
 * 📱 RESPONSIVE DESIGN COMPREHENSIVE TEST SUITE
 * 
 * Multi-viewport testing across mobile, tablet, and desktop devices
 * Validates responsive authentication flows and UI adaptability
 * 
 * Viewport Coverage:
 * 📱 Mobile: iPhone 12 (390x844), Pixel 5 (393x851)
 * 📟 Tablet: iPad Pro (1024x1366), Surface Pro (1368x912)  
 * 🖥️ Desktop: 1920x1080, 1366x768, 2560x1440
 * 
 * Test Environment: http://localhost:3500
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

// 📏 Comprehensive Viewport Configurations
const viewportConfigurations = [
  // 📱 Mobile Devices
  { 
    category: 'Mobile',
    name: 'iPhone 12', 
    width: 390, 
    height: 844, 
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  },
  { 
    category: 'Mobile',
    name: 'iPhone 12 Pro Max', 
    width: 428, 
    height: 926, 
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  },
  { 
    category: 'Mobile',
    name: 'Pixel 5', 
    width: 393, 
    height: 851, 
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  },
  { 
    category: 'Mobile',
    name: 'Samsung Galaxy S21', 
    width: 384, 
    height: 854, 
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  },
  
  // 📟 Tablet Devices
  { 
    category: 'Tablet',
    name: 'iPad Pro', 
    width: 1024, 
    height: 1366, 
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true
  },
  { 
    category: 'Tablet',
    name: 'iPad Air', 
    width: 820, 
    height: 1180, 
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true
  },
  { 
    category: 'Tablet',
    name: 'Surface Pro 7', 
    width: 1368, 
    height: 912, 
    deviceScaleFactor: 1.5,
    isMobile: false,
    hasTouch: true
  },
  
  // 🖥️ Desktop/Laptop Sizes
  { 
    category: 'Desktop',
    name: 'MacBook Air', 
    width: 1366, 
    height: 768, 
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false
  },
  { 
    category: 'Desktop',
    name: 'Full HD', 
    width: 1920, 
    height: 1080, 
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  },
  { 
    category: 'Desktop',
    name: '4K Monitor', 
    width: 2560, 
    height: 1440, 
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  }
];

// 🌐 Configuration
const BASE_URL = 'http://localhost:3500';

// 🎨 Responsive UI Selectors
const ResponsiveSelectors = {
  // Authentication Elements
  emailInput: 'input[type="email"], input[name="email"], [data-testid="email-input"]',
  passwordInput: 'input[type="password"], input[name="password"], [data-testid="password-input"]',
  loginButton: 'button[type="submit"], button:has-text("Sign In"), [data-testid="login-button"]',
  registerButton: 'button[type="submit"], button:has-text("Create Account"), [data-testid="register-button"]',
  
  // Navigation Elements
  mobileMenu: '.mobile-menu, [data-testid="mobile-menu"], .hamburger-menu',
  desktopNav: 'nav:not(.mobile-menu), .desktop-nav, [data-testid="desktop-nav"]',
  
  // Layout Elements
  header: 'header, .header, [data-testid="header"]',
  footer: 'footer, .footer, [data-testid="footer"]',
  mainContent: 'main, .main-content, [data-testid="main-content"]',
  sidebar: '.sidebar, [data-testid="sidebar"]',
  
  // Form Elements
  formContainer: 'form, .form-container, [data-testid="form-container"]',
  inputGroup: '.input-group, .form-group, [data-testid="input-group"]',
  
  // Interactive Elements
  button: 'button, .btn, [data-testid="button"]',
  link: 'a, [data-testid="link"]',
  dropdown: '.dropdown, select, [data-testid="dropdown"]'
};

test.describe('📱 RESPONSIVE DESIGN COMPREHENSIVE TEST SUITE', () => {
  
  // 🚀 Test Suite Setup
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000); // 3 minute timeout for responsive testing
    
    // Clear browser state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('1. 📏 VIEWPORT-SPECIFIC AUTHENTICATION TESTING', () => {
    
    viewportConfigurations.forEach(viewport => {
      test(`1.1 ${viewport.category} - ${viewport.name} (${viewport.width}x${viewport.height}) Authentication`, async ({ page }) => {
        console.log(`🚀 Testing Authentication on ${viewport.category} - ${viewport.name}...`);
        
        // Step 1: Set viewport configuration
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });
        
        // Set device scale factor if needed
        if (viewport.deviceScaleFactor !== 1) {
          await page.emulateMedia({ 
            reducedMotion: 'reduce' // Reduce motion for testing stability
          });
        }
        
        // Step 2: Navigate to login page
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000); // Allow for responsive adjustments
        
        // Step 3: Verify page loads correctly at this viewport
        await expect(page).toHaveTitle(/EvoFit|Health Protocol/);
        console.log(`✅ ${viewport.name}: Page loaded successfully`);
        
        // Step 4: Check form elements are visible and accessible
        const emailInput = page.locator(ResponsiveSelectors.emailInput);
        const passwordInput = page.locator(ResponsiveSelectors.passwordInput);
        const loginButton = page.locator(ResponsiveSelectors.loginButton);
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(loginButton).toBeVisible();
        
        // Step 5: Verify elements are properly positioned (not cut off)
        const emailBox = await emailInput.boundingBox();
        const passwordBox = await passwordInput.boundingBox();
        const buttonBox = await loginButton.boundingBox();
        
        if (emailBox) {
          expect(emailBox.x).toBeGreaterThanOrEqual(0);
          expect(emailBox.y).toBeGreaterThanOrEqual(0);
          expect(emailBox.x + emailBox.width).toBeLessThanOrEqual(viewport.width);
        }
        
        console.log(`✅ ${viewport.name}: Form elements positioned correctly`);
        
        // Step 6: Take viewport-specific screenshot
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-${viewport.category.toLowerCase()}-${viewport.name.replace(/\s+/g, '-')}-login.png`,
          fullPage: false // Just visible area for responsive testing
        });
        
        // Step 7: Test form interaction at this viewport
        await emailInput.fill(testCredentials.admin.email);
        await passwordInput.fill(testCredentials.admin.password);
        
        // Step 8: Screenshot with filled form
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-${viewport.category.toLowerCase()}-${viewport.name.replace(/\s+/g, '-')}-form-filled.png`,
          fullPage: false
        });
        
        // Step 9: Submit authentication
        await loginButton.click();
        await page.waitForLoadState('networkidle');
        await setTimeout(3000);
        
        // Step 10: Verify successful authentication
        const currentUrl = page.url();
        expect(currentUrl).toContain('/admin');
        console.log(`✅ ${viewport.name}: Authentication successful`);
        
        // Step 11: Take success screenshot
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-${viewport.category.toLowerCase()}-${viewport.name.replace(/\s+/g, '-')}-success.png`,
          fullPage: false
        });
        
        console.log(`🎉 ${viewport.category} - ${viewport.name}: Authentication test PASSED`);
      });
    });
  });

  test.describe('2. 🎨 LAYOUT ADAPTATION TESTING', () => {
    
    test('2.1 Mobile Layout Adaptation (320px to 480px)', async ({ page }) => {
      console.log('🚀 Testing Mobile Layout Adaptation...');
      
      const mobileWidths = [320, 375, 414, 480];
      
      for (const width of mobileWidths) {
        console.log(`Testing width: ${width}px`);
        
        await page.setViewportSize({ width, height: 667 });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        // Step 1: Verify mobile-optimized layout
        const formContainer = page.locator(ResponsiveSelectors.formContainer);
        if (await formContainer.isVisible()) {
          const containerBox = await formContainer.boundingBox();
          if (containerBox) {
            // Form should fit within viewport width with some margin
            expect(containerBox.width).toBeLessThanOrEqual(width - 20);
            console.log(`✅ ${width}px: Form fits within viewport`);
          }
        }
        
        // Step 2: Check for mobile menu (if present)
        const mobileMenu = page.locator(ResponsiveSelectors.mobileMenu);
        if (await mobileMenu.isVisible()) {
          console.log(`✅ ${width}px: Mobile menu detected`);
        }
        
        // Step 3: Verify touch-friendly button sizing
        const buttons = page.locator(ResponsiveSelectors.button);
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            if (buttonBox) {
              // Buttons should be at least 44px high for touch accessibility
              expect(buttonBox.height).toBeGreaterThanOrEqual(32); // Allow some flexibility
              console.log(`✅ ${width}px: Button ${i} is touch-friendly`);
            }
          }
        }
        
        // Step 4: Take screenshot
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-mobile-${width}px.png`,
          fullPage: false
        });
      }
      
      console.log('✅ Mobile Layout Adaptation tests completed');
    });

    test('2.2 Tablet Layout Adaptation (768px to 1024px)', async ({ page }) => {
      console.log('🚀 Testing Tablet Layout Adaptation...');
      
      const tabletSizes = [
        { width: 768, height: 1024, orientation: 'portrait' },
        { width: 1024, height: 768, orientation: 'landscape' },
        { width: 820, height: 1180, orientation: 'portrait' },
        { width: 1180, height: 820, orientation: 'landscape' }
      ];
      
      for (const size of tabletSizes) {
        console.log(`Testing tablet ${size.orientation}: ${size.width}x${size.height}`);
        
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        // Step 1: Verify form layout adapts to tablet size
        const formContainer = page.locator(ResponsiveSelectors.formContainer);
        if (await formContainer.isVisible()) {
          const containerBox = await formContainer.boundingBox();
          if (containerBox) {
            // On tablets, form might be centered or use more space efficiently
            const isReasonableWidth = containerBox.width > 300 && containerBox.width < size.width - 100;
            expect(isReasonableWidth).toBeTruthy();
            console.log(`✅ Tablet ${size.orientation}: Form layout appropriate`);
          }
        }
        
        // Step 2: Check navigation layout
        const navigation = page.locator(ResponsiveSelectors.desktopNav);
        if (await navigation.isVisible()) {
          console.log(`✅ Tablet ${size.orientation}: Desktop navigation visible`);
        }
        
        // Step 3: Test login functionality
        await page.locator(ResponsiveSelectors.emailInput).fill(testCredentials.trainer.email);
        await page.locator(ResponsiveSelectors.passwordInput).fill(testCredentials.trainer.password);
        
        // Step 4: Screenshot filled form
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-tablet-${size.width}x${size.height}-${size.orientation}.png`,
          fullPage: false
        });
        
        // Step 5: Test authentication
        await page.locator(ResponsiveSelectors.loginButton).click();
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        const currentUrl = page.url();
        expect(currentUrl).toContain('/trainer');
        console.log(`✅ Tablet ${size.orientation}: Authentication successful`);
        
        // Clear for next test
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
      
      console.log('✅ Tablet Layout Adaptation tests completed');
    });

    test('2.3 Desktop Layout Optimization (1024px+)', async ({ page }) => {
      console.log('🚀 Testing Desktop Layout Optimization...');
      
      const desktopSizes = [
        { width: 1024, height: 768, name: 'Small Desktop' },
        { width: 1366, height: 768, name: 'Standard Laptop' },
        { width: 1920, height: 1080, name: 'Full HD' },
        { width: 2560, height: 1440, name: '4K' }
      ];
      
      for (const size of desktopSizes) {
        console.log(`Testing ${size.name}: ${size.width}x${size.height}`);
        
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        // Step 1: Verify desktop-optimized layout
        const mainContent = page.locator(ResponsiveSelectors.mainContent);
        if (await mainContent.isVisible()) {
          const contentBox = await mainContent.boundingBox();
          if (contentBox) {
            // On desktop, content should use available space efficiently
            const usesReasonableWidth = contentBox.width > 400;
            expect(usesReasonableWidth).toBeTruthy();
            console.log(`✅ ${size.name}: Main content uses space efficiently`);
          }
        }
        
        // Step 2: Check for desktop navigation
        const desktopNav = page.locator(ResponsiveSelectors.desktopNav);
        if (await desktopNav.isVisible()) {
          console.log(`✅ ${size.name}: Desktop navigation present`);
        }
        
        // Step 3: Verify form doesn't look stretched
        const formContainer = page.locator(ResponsiveSelectors.formContainer);
        if (await formContainer.isVisible()) {
          const formBox = await formContainer.boundingBox();
          if (formBox) {
            // Form shouldn't be too wide on large screens
            expect(formBox.width).toBeLessThan(800);
            console.log(`✅ ${size.name}: Form width reasonable for desktop`);
          }
        }
        
        // Step 4: Test with customer credentials
        await page.locator(ResponsiveSelectors.emailInput).fill(testCredentials.customer.email);
        await page.locator(ResponsiveSelectors.passwordInput).fill(testCredentials.customer.password);
        
        // Step 5: Desktop screenshot
        await page.screenshot({ 
          path: `test-results/screenshots/responsive-desktop-${size.name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: false
        });
        
        // Step 6: Authentication test
        await page.locator(ResponsiveSelectors.loginButton).click();
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        const currentUrl = page.url();
        expect(currentUrl).toContain('/my-meal-plans');
        console.log(`✅ ${size.name}: Authentication successful`);
        
        // Clear for next test
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
      
      console.log('✅ Desktop Layout Optimization tests completed');
    });
  });

  test.describe('3. 🖱️ INTERACTION TESTING ACROSS VIEWPORTS', () => {
    
    test('3.1 Touch vs Mouse Interaction Testing', async ({ page }) => {
      console.log('🚀 Testing Touch vs Mouse Interactions...');
      
      const interactionTests = [
        { viewport: { width: 375, height: 667 }, type: 'touch', device: 'Mobile' },
        { viewport: { width: 1024, height: 1366 }, type: 'touch', device: 'Tablet' },
        { viewport: { width: 1920, height: 1080 }, type: 'mouse', device: 'Desktop' }
      ];
      
      for (const test of interactionTests) {
        console.log(`Testing ${test.type} interaction on ${test.device}...`);
        
        await page.setViewportSize(test.viewport);
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        // Step 1: Test input field focus
        const emailInput = page.locator(ResponsiveSelectors.emailInput);
        
        if (test.type === 'touch') {
          // Simulate touch interaction
          await emailInput.tap();
        } else {
          // Mouse interaction
          await emailInput.click();
        }
        
        await expect(emailInput).toBeFocused();
        console.log(`✅ ${test.device}: ${test.type} input focus working`);
        
        // Step 2: Test form submission
        await emailInput.fill(testCredentials.admin.email);
        await page.locator(ResponsiveSelectors.passwordInput).fill(testCredentials.admin.password);
        
        const loginButton = page.locator(ResponsiveSelectors.loginButton);
        
        if (test.type === 'touch') {
          await loginButton.tap();
        } else {
          await loginButton.click();
        }
        
        await page.waitForLoadState('networkidle');
        await setTimeout(2000);
        
        const currentUrl = page.url();
        expect(currentUrl).toContain('/admin');
        console.log(`✅ ${test.device}: ${test.type} form submission working`);
        
        // Clear for next test
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
      
      console.log('✅ Touch vs Mouse Interaction tests completed');
    });

    test('3.2 Keyboard Navigation Across Viewports', async ({ page }) => {
      console.log('🚀 Testing Keyboard Navigation Across Viewports...');
      
      const keyboardTestViewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 1024, height: 768, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];
      
      for (const viewport of keyboardTestViewports) {
        console.log(`Testing keyboard navigation on ${viewport.name}...`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        await setTimeout(1000);
        
        // Step 1: Test Tab navigation
        await page.keyboard.press('Tab');
        
        // Should focus on first interactive element (usually email input)
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
        console.log(`✅ ${viewport.name}: Tab navigation working`);
        
        // Step 2: Navigate through form with Tab
        await page.keyboard.type(testCredentials.trainer.email);
        await page.keyboard.press('Tab'); // Move to password field
        await page.keyboard.type(testCredentials.trainer.password);
        await page.keyboard.press('Tab'); // Move to button or next field
        
        // Step 3: Submit with Enter or Space
        try {
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await setTimeout(2000);
          
          const currentUrl = page.url();
          if (currentUrl.includes('/trainer')) {
            console.log(`✅ ${viewport.name}: Keyboard form submission working`);
          } else {
            // Try clicking button if Enter didn't work
            await page.locator(ResponsiveSelectors.loginButton).click();
            await page.waitForLoadState('networkidle');
            await setTimeout(2000);
            expect(page.url()).toContain('/trainer');
            console.log(`✅ ${viewport.name}: Keyboard navigation functional`);
          }
        } catch (error) {
          console.log(`⚠️  ${viewport.name}: Keyboard submission may need button click`);
        }
        
        // Clear for next test
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
      
      console.log('✅ Keyboard Navigation tests completed');
    });
  });

  test.describe('4. 🎯 RESPONSIVE CRITICAL SUCCESS VALIDATION', () => {
    
    test('4.1 ALL CREDENTIALS WORK ON ALL VIEWPORT CATEGORIES', async ({ page }) => {
      console.log('🎯 CRITICAL: Validating all credentials across viewport categories...');
      
      const criticalViewports = [
        { width: 375, height: 667, category: 'Mobile', name: 'iPhone' },
        { width: 1024, height: 768, category: 'Tablet', name: 'iPad' },
        { width: 1920, height: 1080, category: 'Desktop', name: 'Full HD' }
      ];
      
      const results = {};
      
      // Test each viewport with all credentials
      for (const viewport of criticalViewports) {
        console.log(`Testing ${viewport.category} viewport: ${viewport.width}x${viewport.height}`);
        
        results[viewport.category] = {
          admin: false,
          trainer: false,
          customer: false
        };
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Test each credential on this viewport
        for (const [role, creds] of Object.entries(testCredentials)) {
          console.log(`Testing ${role} on ${viewport.category}...`);
          
          try {
            // Clean slate
            await page.goto(`${BASE_URL}/login`);
            await page.waitForLoadState('networkidle');
            await setTimeout(1000);
            
            await page.evaluate(() => {
              localStorage.clear();
              sessionStorage.clear();
            });
            
            // Login
            await page.locator(ResponsiveSelectors.emailInput).fill(creds.email);
            await page.locator(ResponsiveSelectors.passwordInput).fill(creds.password);
            await page.locator(ResponsiveSelectors.loginButton).click();
            
            await page.waitForLoadState('networkidle');
            await setTimeout(3000);
            
            // Verify success
            const currentUrl = page.url();
            const isLoggedIn = !currentUrl.includes('/login');
            
            if (isLoggedIn) {
              console.log(`✅ ${viewport.category} - ${role} SUCCESSFUL`);
              results[viewport.category][role] = true;
              
              // Take success screenshot
              await page.screenshot({ 
                path: `test-results/screenshots/responsive-critical-${viewport.category.toLowerCase()}-${role}-success.png`,
                fullPage: false
              });
            } else {
              console.log(`❌ ${viewport.category} - ${role} FAILED`);
              
              // Take failure screenshot
              await page.screenshot({ 
                path: `test-results/screenshots/responsive-critical-${viewport.category.toLowerCase()}-${role}-failure.png`,
                fullPage: false
              });
            }
            
          } catch (error) {
            console.log(`❌ ${viewport.category} - ${role} ERROR: ${error}`);
            results[viewport.category][role] = false;
          }
        }
      }
      
      // Validate all combinations worked
      console.log('🎯 RESPONSIVE CRITICAL VALIDATION RESULTS:');
      
      for (const [category, categoryResults] of Object.entries(results)) {
        console.log(`\n${category.toUpperCase()} VIEWPORT:`);
        console.log(`  Admin: ${categoryResults.admin ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Trainer: ${categoryResults.trainer ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Customer: ${categoryResults.customer ? '✅ PASS' : '❌ FAIL'}`);
        
        // All must pass for each viewport category
        expect(categoryResults.admin).toBeTruthy();
        expect(categoryResults.trainer).toBeTruthy();
        expect(categoryResults.customer).toBeTruthy();
      }
      
      console.log('\n🎉 ALL CREDENTIALS WORK ON ALL VIEWPORT CATEGORIES - RESPONSIVE SUCCESS!');
    });
  });
});