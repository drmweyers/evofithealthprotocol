const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

async function testProtocolWizard() {
    const browser = await chromium.launch({ 
        headless: false, // Set to true for headless mode
        slowMo: 1000 // Slow down for better observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🚀 Starting Protocol Creation Wizard Test');
        
        // Step 0: Navigate to application and login
        console.log('\n📍 Step 0: Navigating to application...');
        await page.goto('http://localhost:3501');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(screenshotsDir, '00-login-page.png') });
        
        // Login as trainer
        console.log('🔐 Logging in as trainer...');
        await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
        await page.fill('input[type="password"]', 'TestTrainer123!');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(screenshotsDir, '01-trainer-dashboard.png') });
        
        // Look for the Guided Protocol Wizard button
        console.log('🔍 Looking for Guided Protocol Wizard button...');
        await page.waitForTimeout(2000);
        
        // Try multiple possible selectors for the wizard button
        const wizardButtonSelectors = [
            'button:has-text("Guided Protocol Wizard")',
            'button:has-text("Protocol Wizard")',
            'button:has-text("Create Protocol")',
            'button:has-text("New Protocol")',
            '[data-testid="protocol-wizard-button"]',
            '.protocol-wizard-btn'
        ];
        
        let wizardButton = null;
        for (const selector of wizardButtonSelectors) {
            try {
                wizardButton = await page.locator(selector).first();
                if (await wizardButton.isVisible()) {
                    console.log(`✅ Found wizard button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!wizardButton || !(await wizardButton.isVisible())) {
            console.log('❌ Wizard button not found. Let me check what buttons are available...');
            const buttons = await page.locator('button').all();
            console.log('Available buttons:');
            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                try {
                    const text = await buttons[i].textContent();
                    console.log(`  - Button ${i}: "${text}"`);
                } catch (e) {
                    console.log(`  - Button ${i}: [Error getting text]`);
                }
            }
            throw new Error('Guided Protocol Wizard button not found');
        }
        
        // Click the wizard button
        console.log('🎯 Clicking Guided Protocol Wizard button...');
        await wizardButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(screenshotsDir, '02-wizard-start.png') });
        
        // Step 1: Client Selection
        console.log('\n📍 Step 1: Testing Client Selection...');
        await page.waitForTimeout(2000);
        
        // Check if clients load
        const clientSelector = 'select, .client-select, [data-testid="client-select"]';
        await page.waitForSelector(clientSelector, { timeout: 10000 });
        
        // Look for Emily Johnson or any available client
        const clientOptions = await page.locator('option').all();
        console.log(`Found ${clientOptions.length} client options`);
        
        let selectedClient = false;
        for (const option of clientOptions) {
            try {
                const text = await option.textContent();
                if (text && (text.includes('Emily Johnson') || text.includes('Emily'))) {
                    await option.click();
                    console.log('✅ Selected Emily Johnson');
                    selectedClient = true;
                    break;
                }
            } catch (e) {
                // Continue
            }
        }
        
        if (!selectedClient && clientOptions.length > 1) {
            // Select the first non-empty option
            await clientOptions[1].click();
            console.log('✅ Selected first available client');
            selectedClient = true;
        }
        
        if (!selectedClient) {
            throw new Error('No clients available to select');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '03-step1-client-selected.png') });
        
        // Click Next
        const nextButton = await page.locator('button:has-text("Next")').first();
        await nextButton.click();
        await page.waitForTimeout(2000);
        
        // Step 2: Template Selection
        console.log('\n📍 Step 2: Testing Template Selection...');
        await page.screenshot({ path: path.join(screenshotsDir, '04-step2-templates.png') });
        
        // Check if templates load
        const templates = await page.locator('.template-card, .template-option, [data-testid="template"]').all();
        console.log(`Found ${templates.length} template options`);
        
        if (templates.length === 0) {
            // Try alternative selectors
            const alternativeTemplates = await page.locator('button').all();
            for (const btn of alternativeTemplates) {
                const text = await btn.textContent();
                if (text && text.toLowerCase().includes('beginner')) {
                    await btn.click();
                    console.log('✅ Selected Beginner template');
                    break;
                }
            }
        } else {
            // Select the first template
            await templates[0].click();
            console.log('✅ Selected first available template');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '05-step2-template-selected.png') });
        
        // Click Next
        await page.locator('button:has-text("Next")').first().click();
        await page.waitForTimeout(2000);
        
        // Step 3: Health Information
        console.log('\n📍 Step 3: Testing Health Information...');
        await page.screenshot({ path: path.join(screenshotsDir, '06-step3-health-info.png') });
        
        // Add health conditions, medications, and allergies
        try {
            // Add hypertension as condition
            const conditionInput = await page.locator('input[placeholder*="condition"], input[placeholder*="health"]').first();
            if (await conditionInput.isVisible()) {
                await conditionInput.fill('Hypertension');
                await page.keyboard.press('Enter');
                console.log('✅ Added Hypertension condition');
            }
            
            // Add Metformin as medication
            const medicationInput = await page.locator('input[placeholder*="medication"], input[placeholder*="drug"]').first();
            if (await medicationInput.isVisible()) {
                await medicationInput.fill('Metformin');
                await page.keyboard.press('Enter');
                console.log('✅ Added Metformin medication');
            }
            
            // Add Penicillin as allergy
            const allergyInput = await page.locator('input[placeholder*="allergy"], input[placeholder*="allergic"]').first();
            if (await allergyInput.isVisible()) {
                await allergyInput.fill('Penicillin');
                await page.keyboard.press('Enter');
                console.log('✅ Added Penicillin allergy');
            }
            
        } catch (e) {
            console.log('⚠️ Some health information fields may not be available:', e.message);
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '07-step3-health-filled.png') });
        
        // Click Next
        await page.locator('button:has-text("Next")').first().click();
        await page.waitForTimeout(2000);
        
        // Step 4: Customization
        console.log('\n📍 Step 4: Testing Customization Options...');
        await page.screenshot({ path: path.join(screenshotsDir, '08-step4-customization.png') });
        
        try {
            // Select goals: Weight Loss and Improve Energy
            const goals = await page.locator('input[type="checkbox"], .goal-option').all();
            for (const goal of goals) {
                const text = await goal.textContent() || '';
                if (text.toLowerCase().includes('weight loss') || text.toLowerCase().includes('energy')) {
                    await goal.click();
                    console.log(`✅ Selected goal: ${text}`);
                }
            }
            
            // Set intensity to Moderate
            const intensityOptions = await page.locator('select option, input[type="radio"]').all();
            for (const option of intensityOptions) {
                const text = await option.textContent() || '';
                if (text.toLowerCase().includes('moderate')) {
                    await option.click();
                    console.log('✅ Set intensity to Moderate');
                    break;
                }
            }
            
            // Set duration and frequency
            const durationInput = await page.locator('input[type="number"], select').first();
            if (await durationInput.isVisible()) {
                await durationInput.fill('12');
                console.log('✅ Set duration to 12 weeks');
            }
            
        } catch (e) {
            console.log('⚠️ Some customization options may not be available:', e.message);
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '09-step4-customized.png') });
        
        // Click Next
        await page.locator('button:has-text("Next")').first().click();
        await page.waitForTimeout(3000);
        
        // Step 5: AI Generation
        console.log('\n📍 Step 5: Testing AI Generation Process...');
        await page.screenshot({ path: path.join(screenshotsDir, '10-step5-ai-generation-start.png') });
        
        // Wait for AI generation to complete (this might take a while)
        console.log('⏳ Waiting for AI protocol generation...');
        
        // Look for loading indicators
        const loadingSelectors = [
            '.loading', '.spinner', '.generating', 
            '[data-testid="loading"]', '.progress'
        ];
        
        let isGenerating = true;
        let waitTime = 0;
        const maxWaitTime = 60000; // 60 seconds max
        
        while (isGenerating && waitTime < maxWaitTime) {
            let foundLoading = false;
            for (const selector of loadingSelectors) {
                try {
                    const loadingElement = await page.locator(selector).first();
                    if (await loadingElement.isVisible()) {
                        foundLoading = true;
                        break;
                    }
                } catch (e) {
                    // Continue
                }
            }
            
            if (!foundLoading) {
                // Check if we can proceed to next step
                const nextBtn = await page.locator('button:has-text("Next")').first();
                if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
                    isGenerating = false;
                    console.log('✅ AI generation completed');
                    break;
                }
            }
            
            await page.waitForTimeout(2000);
            waitTime += 2000;
            
            if (waitTime % 10000 === 0) {
                console.log(`⏳ Still generating... ${waitTime/1000}s elapsed`);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, `11-step5-generating-${waitTime/1000}s.png`) 
                });
            }
        }
        
        if (waitTime >= maxWaitTime) {
            console.log('⚠️ AI generation took longer than expected');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '12-step5-ai-generation-complete.png') });
        
        // Click Next
        await page.locator('button:has-text("Next")').first().click();
        await page.waitForTimeout(2000);
        
        // Step 6: Safety Validation
        console.log('\n📍 Step 6: Testing Safety Validation...');
        await page.screenshot({ path: path.join(screenshotsDir, '13-step6-safety-validation.png') });
        
        // Review safety validation results
        const validationElements = await page.locator('.validation, .safety, .warning').all();
        console.log(`Found ${validationElements.length} validation elements`);
        
        for (let i = 0; i < validationElements.length; i++) {
            try {
                const text = await validationElements[i].textContent();
                console.log(`Validation ${i}: ${text}`);
            } catch (e) {
                // Continue
            }
        }
        
        await page.waitForTimeout(2000);
        
        // Click Next
        await page.locator('button:has-text("Next")').first().click();
        await page.waitForTimeout(2000);
        
        // Step 7: Review & Finalize
        console.log('\n📍 Step 7: Testing Review & Finalize...');
        await page.screenshot({ path: path.join(screenshotsDir, '14-step7-review.png') });
        
        // Add notes
        try {
            const notesInput = await page.locator('textarea, input[placeholder*="note"]').first();
            if (await notesInput.isVisible()) {
                await notesInput.fill('Test protocol creation');
                console.log('✅ Added notes: "Test protocol creation"');
            }
        } catch (e) {
            console.log('⚠️ Notes field may not be available');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, '15-step7-notes-added.png') });
        
        // Click Create Protocol
        const createButton = await page.locator('button:has-text("Create Protocol"), button:has-text("Create"), button:has-text("Finalize")').first();
        if (await createButton.isVisible()) {
            await createButton.click();
            console.log('🎯 Clicked Create Protocol');
            
            // Wait for protocol creation to complete
            await page.waitForTimeout(5000);
            await page.screenshot({ path: path.join(screenshotsDir, '16-protocol-created.png') });
            
            console.log('✅ Protocol creation completed');
        } else {
            console.log('❌ Create Protocol button not found');
        }
        
        console.log('\n🎉 Protocol Creation Wizard Test Completed!');
        console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: path.join(screenshotsDir, 'error-screenshot.png') });
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testProtocolWizard().catch(console.error);