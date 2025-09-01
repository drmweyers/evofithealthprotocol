import { chromium } from 'playwright';

async function debugMobileNav() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  try {
    console.log('🔗 Navigating to http://localhost:3501...');
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'before-login.png' });
    console.log('📷 Screenshot taken: before-login.png');

    console.log('🔍 Checking initial page state...');
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Check for login form
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found');
      
      // Fill in credentials
      await page.fill('input[type="email"], input[name="email"]', 'trainer.test@evofitmeals.com');
      await page.fill('input[type="password"], input[name="password"]', 'TestTrainer123!');
      
      // Click login button
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      console.log('🔐 Login attempted');
      
      // Wait for navigation or loading
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ No login form found on initial page');
    }

    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login.png' });
    console.log('📷 Screenshot taken: after-login.png');

    console.log('🔍 Analyzing navigation elements...');
    
    // Check all CSS files loaded
    const stylesheets = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(links).map(link => ({
        href: link.href,
        loaded: link.sheet !== null
      }));
    });
    
    console.log('📄 CSS files loaded:');
    stylesheets.forEach(sheet => {
      console.log(`  ${sheet.loaded ? '✅' : '❌'} ${sheet.href}`);
    });

    // Specifically check for responsive.css
    const responsiveCssLoaded = stylesheets.some(sheet => 
      sheet.href.includes('responsive.css') && sheet.loaded
    );
    console.log(`🎨 Responsive.css loaded: ${responsiveCssLoaded ? '✅' : '❌'}`);

    // Check for navigation elements
    console.log('🧭 Navigation analysis:');
    
    // Look for mobile-header and desktop-header classes
    const mobileHeader = await page.$('.mobile-header');
    const desktopHeader = await page.$('.desktop-header');
    
    console.log(`📱 Mobile header (.mobile-header): ${mobileHeader ? '✅ Found' : '❌ Not found'}`);
    console.log(`🖥️  Desktop header (.desktop-header): ${desktopHeader ? '✅ Found' : '❌ Not found'}`);

    // Get all navigation-related elements
    const navElements = await page.evaluate(() => {
      const elements = [];
      
      // Find all nav elements
      const navs = document.querySelectorAll('nav, header, [class*="nav"], [class*="header"], [class*="menu"]');
      
      navs.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          index,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          computedStyle: {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity
          }
        });
      });
      
      return elements;
    });

    console.log('🧭 Found navigation elements:');
    navElements.forEach(el => {
      console.log(`  [${el.index}] ${el.tagName} class="${el.className}" id="${el.id}"`);
      console.log(`      Visible: ${el.visible}, Display: ${el.computedStyle.display}`);
      console.log(`      Position: ${el.position.x}, ${el.position.y} (${el.position.width}x${el.position.height})`);
    });

    // Look for any buttons with Menu icons or in nav area
    const menuButtons = await page.evaluate(() => {
      const buttons = [];
      
      // Find all buttons
      const allButtons = document.querySelectorAll('button, [role="button"], .menu-toggle, .hamburger');
      
      allButtons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect();
        const text = btn.textContent?.trim() || '';
        const hasMenuIcon = btn.querySelector('svg, .icon, [class*="menu"], [class*="hamburger"]');
        
        buttons.push({
          index,
          tagName: btn.tagName,
          className: btn.className,
          id: btn.id,
          text: text.substring(0, 50),
          hasMenuIcon: !!hasMenuIcon,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          computedStyle: {
            display: window.getComputedStyle(btn).display,
            visibility: window.getComputedStyle(btn).visibility
          }
        });
      });
      
      return buttons;
    });

    console.log('🔘 Found buttons:');
    menuButtons.forEach(btn => {
      console.log(`  [${btn.index}] ${btn.tagName} class="${btn.className}" id="${btn.id}"`);
      console.log(`      Text: "${btn.text}"`);
      console.log(`      Has menu icon: ${btn.hasMenuIcon}, Visible: ${btn.visible}`);
      console.log(`      Position: ${btn.position.x}, ${btn.position.y} (${btn.position.width}x${btn.position.height})`);
    });

    // Check CSS media queries
    const mediaQueryInfo = await page.evaluate(() => {
      const info = {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      };
      
      // Test common mobile media queries
      const queries = [
        '(max-width: 768px)',
        '(max-width: 640px)',
        '(max-width: 480px)',
        '(min-width: 769px)'
      ];
      
      info.mediaQueries = {};
      queries.forEach(query => {
        info.mediaQueries[query] = window.matchMedia(query).matches;
      });
      
      return info;
    });

    console.log('📐 Viewport and media query info:');
    console.log(`  Viewport: ${mediaQueryInfo.viewportWidth}x${mediaQueryInfo.viewportHeight}`);
    console.log(`  Device pixel ratio: ${mediaQueryInfo.devicePixelRatio}`);
    console.log('  Media queries:');
    Object.entries(mediaQueryInfo.mediaQueries).forEach(([query, matches]) => {
      console.log(`    ${query}: ${matches ? '✅ Matches' : '❌ No match'}`);
    });

    // Take final screenshot
    await page.screenshot({ path: 'navigation-debug.png', fullPage: true });
    console.log('📷 Final screenshot taken: navigation-debug.png');

    // Check DOM structure around navigation
    const domStructure = await page.evaluate(() => {
      const body = document.body;
      function getElementInfo(element, depth = 0) {
        if (depth > 3) return null; // Limit depth
        
        const info = {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          children: []
        };
        
        Array.from(element.children).forEach(child => {
          const childInfo = getElementInfo(child, depth + 1);
          if (childInfo) info.children.push(childInfo);
        });
        
        return info;
      }
      
      return getElementInfo(body);
    });

    console.log('🏗️  DOM structure (first 3 levels):');
    function printDOMStructure(element, indent = '') {
      console.log(`${indent}${element.tagName}${element.className ? '.' + element.className.split(' ').join('.') : ''}${element.id ? '#' + element.id : ''}`);
      element.children.forEach(child => {
        printDOMStructure(child, indent + '  ');
      });
    }
    printDOMStructure(domStructure);

  } catch (error) {
    console.error('❌ Error during debugging:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

debugMobileNav();