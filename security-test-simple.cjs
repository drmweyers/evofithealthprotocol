const puppeteer = require('puppeteer');

async function testSecurity() {
    console.log('🔒 Security Testing Started...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 2000,
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    try {
        // Step 1: Navigate to application
        console.log('1. Navigating to application...');
        await page.goto('http://localhost:3501');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'security-test-1-home.png' });
        
        // Step 2: Login as trainer
        console.log('2. Logging in as trainer...');
        await page.type('input[name="email"]', 'trainer.test@evofitmeals.com');
        await page.type('input[name="password"]', 'TestTrainer123!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'security-test-2-logged-in.png' });
        
        // Step 3: Navigate to Health Protocols
        console.log('3. Accessing Health Protocols...');
        const healthProtocolsLink = await page.$('text=Health Protocols') || 
                                   await page.$('a[href*="protocol"]') ||
                                   await page.$('button:has-text("Health")');
        
        if (healthProtocolsLink) {
            await healthProtocolsLink.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'security-test-3-protocols.png' });
        } else {
            console.log('No Health Protocols link found, checking current page...');
            await page.screenshot({ path: 'security-test-3-no-protocols.png' });
        }
        
        // Step 4: Test XSS Protection
        console.log('4. Testing XSS Protection...');
        const inputs = await page.$$('input[type="text"], input:not([type]), textarea');
        console.log(`Found ${inputs.length} input fields`);
        
        if (inputs.length > 0) {
            const testInput = inputs[0];
            
            // XSS Test 1: Script tag
            await testInput.click();
            await testInput.evaluate(el => el.value = '');
            await testInput.type('<script>alert("XSS")</script>');
            await page.waitForTimeout(1000);
            
            const scriptValue = await testInput.evaluate(el => el.value);
            console.log('XSS Script Result:', scriptValue);
            await page.screenshot({ path: 'security-test-4-xss-script.png' });
            
            // XSS Test 2: HTML injection
            await testInput.evaluate(el => el.value = '');
            await testInput.type('<img src=x onerror=alert("XSS")>');
            await page.waitForTimeout(1000);
            
            const htmlValue = await testInput.evaluate(el => el.value);
            console.log('HTML Injection Result:', htmlValue);
            await page.screenshot({ path: 'security-test-5-html-injection.png' });
            
            // Length limit test
            await testInput.evaluate(el => el.value = '');
            const longText = 'A'.repeat(150);
            await testInput.type(longText);
            await page.waitForTimeout(1000);
            
            const lengthValue = await testInput.evaluate(el => el.value);
            console.log(`Length Test: Input ${longText.length} chars, Result ${lengthValue.length} chars`);
            await page.screenshot({ path: 'security-test-6-length-limit.png' });
            
            // Special characters test
            await testInput.evaluate(el => el.value = '');
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            await testInput.type(specialChars);
            await page.waitForTimeout(1000);
            
            const specialValue = await testInput.evaluate(el => el.value);
            console.log('Special Characters Result:', specialValue);
            await page.screenshot({ path: 'security-test-7-special-chars.png' });
        }
        
        // Step 5: Form validation test
        console.log('5. Testing Form Validation...');
        const submitButtons = await page.$$('button[type="submit"], button:has-text("Submit"), button:has-text("Create")');
        
        if (submitButtons.length > 0) {
            await submitButtons[0].click();
            await page.waitForTimeout(2000);
            
            const validationMessages = await page.$$('.error, .invalid, [role="alert"]');
            console.log(`Found ${validationMessages.length} validation messages`);
            
            await page.screenshot({ path: 'security-test-8-validation.png' });
        }
        
        // Step 6: Unauthorized access test
        console.log('6. Testing Unauthorized Access...');
        await page.goto('http://localhost:3501/admin');
        await page.waitForTimeout(2000);
        
        const adminUrl = page.url();
        console.log('Admin access URL result:', adminUrl);
        await page.screenshot({ path: 'security-test-9-admin-access.png' });
        
        console.log('✅ Security testing completed successfully!');
        
    } catch (error) {
        console.error('❌ Security test error:', error);
        await page.screenshot({ path: 'security-test-error.png' });
    } finally {
        await browser.close();
    }
}

testSecurity().catch(console.error);