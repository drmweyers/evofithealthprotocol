import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Simple Protocol Creation Wizard Debug...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', (msg) => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', (error) => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  try {
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3501', { waitUntil: 'networkidle2' });
    
    console.log('🔐 Attempting login...');
    
    // Fill email
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.type('trainer.test@evofitmeals.com');
      console.log('✅ Email entered');
    }
    
    // Fill password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.type('TestTrainer123!');
      console.log('✅ Password entered');
    }
    
    // Click Sign In button
    const signInButtons = await page.$$('button');
    for (const button of signInButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Sign In')) {
        await button.click();
        console.log('✅ Sign In button clicked');
        break;
      }
    }
    
    // Wait for navigation
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      console.log('✅ Navigation after login completed');
    } catch (navError) {
      console.log('⚠️ Navigation timeout, continuing...');
    }
    
    console.log('🎯 Current URL:', page.url());
    
    // Navigate to trainer if needed
    if (!page.url().includes('/trainer')) {
      console.log('🚶 Navigating to /trainer...');
      await page.goto('http://localhost:3501/trainer', { waitUntil: 'networkidle2' });
    }
    
    // Take screenshot for analysis
    await page.screenshot({ path: 'trainer-dashboard-after-login.png', fullPage: true });
    console.log('📸 Screenshot saved: trainer-dashboard-after-login.png');
    
    // Look for any clickable elements containing "Protocol"
    console.log('🔍 Searching for Protocol-related elements...');
    
    const protocolElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const protocolElements = [];
      
      allElements.forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('protocol')) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) { // Element is visible
            protocolElements.push({
              tagName: el.tagName,
              text: el.textContent?.trim().substring(0, 200),
              className: el.className,
              isClickable: el.onclick !== null || 
                          getComputedStyle(el).cursor === 'pointer' ||
                          el.tagName === 'BUTTON' ||
                          el.tagName === 'A' ||
                          el.getAttribute('role') === 'button'
            });
          }
        }
      });
      
      return protocolElements;
    });
    
    console.log('🔍 Found Protocol-related elements:', protocolElements);
    
    // Look for cards or buttons with "wizard" or "creation"
    const wizardElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const wizardElements = [];
      
      allElements.forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('wizard') || text.includes('creation') || text.includes('create')) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            wizardElements.push({
              tagName: el.tagName,
              text: el.textContent?.trim().substring(0, 200),
              className: el.className,
              isClickable: el.onclick !== null || 
                          getComputedStyle(el).cursor === 'pointer' ||
                          el.tagName === 'BUTTON' ||
                          el.tagName === 'A' ||
                          el.getAttribute('role') === 'button'
            });
          }
        }
      });
      
      return wizardElements;
    });
    
    console.log('🧙‍♂️ Found Wizard/Creation elements:', wizardElements);
    
    // Try to click on the first clickable protocol-related element
    if (protocolElements.length > 0 || wizardElements.length > 0) {
      const clickableElements = [...protocolElements, ...wizardElements].filter(el => el.isClickable);
      
      if (clickableElements.length > 0) {
        console.log('🖱️ Attempting to click first clickable element...');
        const firstClickable = clickableElements[0];
        
        // Find the actual element and click it
        const elementToClick = await page.evaluateHandle((elementInfo) => {
          const allElements = Array.from(document.querySelectorAll('*'));
          return allElements.find(el => 
            el.textContent?.trim().substring(0, 200) === elementInfo.text &&
            el.className === elementInfo.className
          );
        }, firstClickable);
        
        if (elementToClick) {
          await elementToClick.click();
          console.log('✅ Clicked element:', firstClickable.text.substring(0, 50));
          
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'after-click.png', fullPage: true });
          console.log('📸 Screenshot after click: after-click.png');
        }
      }
    }
    
    console.log('⏸️ Browser kept open for manual inspection...');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'debug-error-simple.png', fullPage: true });
  }
  
  // Keep browser open
  // await browser.close();
})();