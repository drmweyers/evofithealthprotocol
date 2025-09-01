import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing Mobile Breakpoint Detection...');
    
    // Navigate to the site
    await page.goto('http://localhost:3501', { waitUntil: 'networkidle' });
    
    // Login as trainer
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Test breakpoint detection
    const viewportInfo = await page.evaluate(() => {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isMobileBased768: window.innerWidth < 768,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent
      };
    });
    
    console.log('📱 Viewport Information:');
    console.log(`  Window size: ${viewportInfo.innerWidth}x${viewportInfo.innerHeight}`);
    console.log(`  Should be mobile (< 768): ${viewportInfo.isMobileBased768}`);
    console.log(`  Device pixel ratio: ${viewportInfo.devicePixelRatio}`);
    console.log(`  User agent: ${viewportInfo.userAgent}`);
    
    // Test for ResponsiveHeader specifically
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('nav.bg-white.shadow-sm.border-b');
      if (!header) return { found: false };
      
      const mobileNav = header.querySelector('[aria-label="Open navigation menu"]');
      const isSticky = header.classList.contains('sticky');
      const hasZIndex = header.classList.contains('z-40');
      
      return {
        found: true,
        hasMobileNav: !!mobileNav,
        mobileNavVisible: mobileNav ? window.getComputedStyle(mobileNav).display !== 'none' : false,
        headerClasses: header.className,
        headerHTML: header.outerHTML.substring(0, 500) + '...',
        isSticky,
        hasZIndex
      };
    });
    
    console.log('🧭 Header Analysis:');
    console.log(`  Header found: ${headerInfo.found}`);
    if (headerInfo.found) {
      console.log(`  Has mobile navigation: ${headerInfo.hasMobileNav}`);
      console.log(`  Mobile nav visible: ${headerInfo.mobileNavVisible}`);
      console.log(`  Header classes: "${headerInfo.headerClasses}"`);
      console.log(`  Is sticky: ${headerInfo.isSticky}`);
      console.log(`  Has z-index: ${headerInfo.hasZIndex}`);
    }
    
    // Test for any hidden elements or CSS issues
    const hiddenElements = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('button');
      const hiddenButtons = [];
      
      allButtons.forEach(btn => {
        const computedStyle = window.getComputedStyle(btn);
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' || 
            computedStyle.opacity === '0' ||
            btn.getAttribute('aria-label')?.includes('menu')) {
          hiddenButtons.push({
            ariaLabel: btn.getAttribute('aria-label'),
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            classes: btn.className,
            innerHTML: btn.innerHTML?.substring(0, 100)
          });
        }
      });
      
      return hiddenButtons;
    });
    
    console.log('🔍 Hidden/Invisible Elements:');
    hiddenElements.forEach((el, i) => {
      console.log(`  Element ${i + 1}:`);
      console.log(`    Aria Label: ${el.ariaLabel || 'none'}`);
      console.log(`    Display: ${el.display}`);
      console.log(`    Visibility: ${el.visibility}`);
      console.log(`    Opacity: ${el.opacity}`);
      console.log(`    Classes: ${el.classes}`);
      console.log(`    Content: ${el.innerHTML}`);
    });
    
    // Test by actually looking for the mobile menu button with different selectors
    const mobileButtonSearch = await page.evaluate(() => {
      const selectors = [
        'button[aria-label="Open navigation menu"]',
        'button:has(.lucide-menu)',
        'button:has(svg)',
        '.mobile-navigation button',
        '[data-testid="mobile-menu-button"]'
      ];
      
      const results = {};
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          results[selector] = {
            count: elements.length,
            visible: Array.from(elements).map(el => window.getComputedStyle(el).display !== 'none')
          };
        } catch (e) {
          results[selector] = { error: e.message };
        }
      });
      
      return results;
    });
    
    console.log('🔎 Mobile Button Search Results:');
    Object.entries(mobileButtonSearch).forEach(([selector, result]) => {
      console.log(`  "${selector}": ${JSON.stringify(result)}`);
    });
    
    // Take final screenshot
    await page.screenshot({ path: 'mobile-breakpoint-debug.png', fullPage: true });
    console.log('📸 Screenshot saved: mobile-breakpoint-debug.png');
    
    console.log('✅ Mobile breakpoint analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'mobile-breakpoint-error.png', fullPage: true });
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser staying open for inspection...');
})();