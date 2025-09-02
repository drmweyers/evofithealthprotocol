import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Debugging Authentication State...');
  
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
    
    console.log('🔐 Performing login...');
    
    // Fill email
    await page.type('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.type('input[type="password"]', 'TestTrainer123!');
    
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
    
    // Wait for navigation or response
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      console.log('✅ Navigation completed after login');
    } catch (navError) {
      console.log('⚠️ Navigation timeout, checking current state...');
    }
    
    console.log('🎯 Current URL after login:', page.url());
    
    // Check localStorage for authentication token
    const authData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        tokenExists: !!localStorage.getItem('token')
      };
    });
    
    console.log('🔑 Auth data in localStorage:', authData);
    
    // Check if user data is available in React context
    const reactState = await page.evaluate(() => {
      // Try to access the React dev tools context
      const root = document.querySelector('#root');
      if (root && root._reactInternalInstance) {
        return 'React dev tools detected';
      }
      return 'React state not accessible';
    });
    
    console.log('⚛️ React state:', reactState);
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login-debug.png', fullPage: true });
    console.log('📸 Screenshot saved: after-login-debug.png');
    
    // Now navigate to /trainer and see what happens
    console.log('🚶 Manually navigating to /trainer...');
    await page.goto('http://localhost:3501/trainer', { waitUntil: 'networkidle2' });
    
    console.log('🎯 URL after /trainer navigation:', page.url());
    
    // Check auth data again
    const authDataAfterNavigation = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        tokenExists: !!localStorage.getItem('token'),
        currentPath: window.location.pathname
      };
    });
    
    console.log('🔑 Auth data after /trainer navigation:', authDataAfterNavigation);
    
    // Take screenshot of trainer page
    await page.screenshot({ path: 'trainer-page-debug.png', fullPage: true });
    console.log('📸 Screenshot saved: trainer-page-debug.png');
    
    // If we're on the trainer page, look for Protocol elements
    if (authDataAfterNavigation.currentPath === '/trainer') {
      console.log('✅ Successfully on trainer page! Looking for Protocol elements...');
      
      // Wait a bit for React to render
      await page.waitForTimeout(2000);
      
      // Look for any element containing "Protocol"
      const protocolElements = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const matches = [];
        
        allElements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if (text.includes('protocol') && text.length < 500) { // Avoid huge text blocks
            matches.push({
              tagName: el.tagName,
              text: el.textContent?.trim().substring(0, 200),
              className: el.className
            });
          }
        });
        
        return matches.slice(0, 10); // First 10 matches
      });
      
      console.log('🔍 Found Protocol elements:', protocolElements);
      
      // Look specifically for clickable "creation" or "wizard" elements
      const wizardElements = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const matches = [];
        
        allElements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          if ((text.includes('creation') || text.includes('wizard') || text.includes('create')) && text.length < 300) {
            const isClickable = el.onclick !== null || 
                              getComputedStyle(el).cursor === 'pointer' ||
                              el.tagName === 'BUTTON' ||
                              el.tagName === 'A' ||
                              el.getAttribute('role') === 'button' ||
                              el.className.includes('cursor-pointer');
                              
            matches.push({
              tagName: el.tagName,
              text: el.textContent?.trim().substring(0, 200),
              className: el.className,
              isClickable: isClickable
            });
          }
        });
        
        return matches.slice(0, 5);
      });
      
      console.log('🧙‍♂️ Found Wizard/Creation elements:', wizardElements);
      
      // Take final screenshot
      await page.screenshot({ path: 'trainer-final-state.png', fullPage: true });
      console.log('📸 Final screenshot: trainer-final-state.png');
    } else {
      console.log('❌ Not on trainer page. Current path:', authDataAfterNavigation.currentPath);
    }
    
    console.log('⏸️ Browser kept open for manual inspection...');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'auth-debug-error.png', fullPage: true });
  }
  
  // Keep browser open
  // await browser.close();
})();