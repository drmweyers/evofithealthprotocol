import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Protocol Creation Wizard Debug Session...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Enable console logging from browser
  page.on('console', (msg) => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  // Enable error logging
  page.on('pageerror', (error) => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  page.on('response', (response) => {
    if (!response.ok() && response.url().includes('/api/')) {
      console.log(`[NETWORK ERROR] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3501', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('🔐 Logging in as trainer...');
    // Try to login as trainer
    try {
      // Wait for email input and fill it
      console.log('🔍 Looking for email input field...');
      await page.waitForSelector('input[type="email"], input[placeholder*="email" i]', { timeout: 5000 });
      await page.type('input[type="email"], input[placeholder*="email" i]', 'trainer.test@evofitmeals.com');
      console.log('✅ Email entered');
      
      // Wait for password input and fill it
      console.log('🔍 Looking for password input field...');
      await page.waitForSelector('input[type="password"]', { timeout: 2000 });
      await page.type('input[type="password"]', 'TestTrainer123!');
      console.log('✅ Password entered');
      
      // Click sign in button
      console.log('🔍 Looking for sign in button...');
      const signInButton = await page.waitForSelector('button[type="submit"], button:contains("Sign In")', { timeout: 2000 });
      await signInButton.click();
      console.log('✅ Sign In button clicked');
      
      // Wait for navigation after login
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      console.log('✅ Login successful, navigation completed');
    } catch (loginError) {
      console.log('❌ Login error:', loginError.message);
      console.log('📸 Taking screenshot of login error...');
      await page.screenshot({ path: 'login-error.png', fullPage: true });
    }

    console.log('🎯 Current URL:', page.url());
    
    // Navigate to trainer page if not already there
    if (!page.url().includes('/trainer')) {
      console.log('🚶 Navigating to trainer dashboard...');
      await page.goto('http://localhost:3501/trainer', { waitUntil: 'networkidle2' });
    }
    
    console.log('🔍 Looking for Protocol Creation Wizard button...');
    
    // Check for various possible selectors for the wizard trigger
    const possibleSelectors = [
      'button:contains("Protocol Creation Wizard")',
      '[data-testid="protocol-wizard-trigger"]',
      'button:contains("Create Protocol")',
      '.cursor-pointer', // Card elements
      'div[role="button"]',
      'button[class*="cursor-pointer"]'
    ];
    
    let wizardButton = null;
    for (const selector of possibleSelectors) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 2000 });
        wizardButton = await page.$(selector);
        if (wizardButton) {
          console.log(`✅ Found wizard trigger with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector not found: ${selector}`);
      }
    }
    
    if (!wizardButton) {
      console.log('📸 Taking screenshot for analysis...');
      await page.screenshot({ path: 'trainer-page-debug.png', fullPage: true });
      
      // Get page content for analysis
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      console.log('📄 Page Title:', pageTitle);
      console.log('🔍 Looking for any buttons on page...');
      
      const buttons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          id: btn.id,
          disabled: btn.disabled
        }));
      });
      
      console.log('🔘 Found buttons:', buttons);
      
      const cards = await page.evaluate(() => {
        const cardElements = Array.from(document.querySelectorAll('[class*="card"], .cursor-pointer, div[class*="hover"]'));
        return cardElements.map(card => ({
          text: card.textContent?.trim().substring(0, 150),
          className: card.className,
          hasClick: card.onclick !== null,
          hasSparkles: card.querySelector('[class*="sparkles"], svg') !== null
        }));
      });
      
      console.log('📋 Found cards/clickable elements:', cards);
      
      // Look specifically for elements containing "Protocol Creation Wizard" text
      const wizardElements = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const wizardRelated = allElements.filter(el => 
          el.textContent && el.textContent.includes('Protocol') && 
          (el.textContent.includes('Creation') || el.textContent.includes('Wizard'))
        );
        return wizardRelated.map(el => ({
          tagName: el.tagName,
          text: el.textContent?.trim().substring(0, 200),
          className: el.className,
          clickable: el.onclick !== null || el.style.cursor === 'pointer'
        }));
      });
      
      console.log('🧙‍♂️ Elements containing Protocol/Creation/Wizard:', wizardElements);
    } else {
      console.log('🖱️ Clicking Protocol Creation Wizard...');
      await wizardButton.click();
      
      // Wait for wizard to open
      await page.waitForTimeout(2000);
      
      console.log('📸 Taking screenshot after clicking wizard...');
      await page.screenshot({ path: 'protocol-wizard-opened.png', fullPage: true });
      
      // Check for wizard content
      const wizardVisible = await page.evaluate(() => {
        return document.querySelector('[class*="dialog"], [role="dialog"]') !== null;
      });
      
      console.log('🧙‍♂️ Wizard dialog visible:', wizardVisible);
      
      if (wizardVisible) {
        // Look for the Protocol Generation button
        console.log('🔍 Looking for Protocol Generation button...');
        const genButton = await page.$('button:has-text("Generate Protocol"), button:has-text("Next"), button:has-text("Generate")');
        
        if (genButton) {
          console.log('🖱️ Clicking Protocol Generation button...');
          await genButton.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'protocol-generation-clicked.png', fullPage: true });
        }
      }
    }
    
    console.log('⏸️ Keeping browser open for manual inspection...');
    console.log('📸 Screenshots saved: trainer-page-debug.png, protocol-wizard-opened.png, protocol-generation-clicked.png');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  }

  // Keep browser open for manual inspection
  // await browser.close();
})();