import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function debugDOM() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  try {
    console.log('🔗 Navigating to http://localhost:3501...');
    await page.goto('http://localhost:3501');
    await page.waitForTimeout(2000);

    // Login
    const loginForm = await page.$('form');
    if (loginForm) {
      await page.fill('input[type="email"], input[name="email"]', 'trainer.test@evofitmeals.com');
      await page.fill('input[type="password"], input[name="password"]', 'TestTrainer123!');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await page.waitForTimeout(3000);
    }

    // Get the complete HTML structure
    const htmlContent = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    // Save to file for inspection
    writeFileSync('complete-dom.html', htmlContent);
    console.log('✅ Complete DOM saved to complete-dom.html');

    // Check for specific elements
    const mobileNavButton = await page.$('button:has(svg)');
    if (mobileNavButton) {
      const isVisible = await mobileNavButton.isVisible();
      const classes = await mobileNavButton.getAttribute('class');
      console.log(`🔘 Mobile nav button found: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
      console.log(`   Classes: ${classes}`);
    } else {
      console.log('❌ No mobile nav button found');
    }

    // Check CSS applied to nav
    const navStyles = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (nav) {
        const styles = window.getComputedStyle(nav);
        return {
          display: styles.display,
          visibility: styles.visibility,
          width: styles.width,
          height: styles.height,
          className: nav.className,
          id: nav.id
        };
      }
      return null;
    });

    console.log('🎨 Nav styles:', navStyles);

    // Take screenshot
    await page.screenshot({ path: 'dom-debug.png' });
    console.log('📷 Screenshot saved as dom-debug.png');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'error-dom-debug.png' });
  } finally {
    await browser.close();
  }
}

debugDOM();