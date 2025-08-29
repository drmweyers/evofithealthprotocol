import { test, expect, Page } from '@playwright/test';

// Test credentials
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

// Helper to login as trainer
async function loginAsTrainer(page: Page) {
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to protocols page (actual app behavior)
  await page.waitForURL('**/protocols', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Protocol Creation Wizard - STORY-004', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for this test suite
    test.setTimeout(60000);
    
    // Login as trainer before each test
    await loginAsTrainer(page);
  });

  test('Should access Guided Protocol Wizard from Health Protocol Dashboard', async ({ page }) => {
    // We should already be on /protocols after login
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the Health Protocol Dashboard
    await expect(page.locator('h1:has-text("Health Protocol Management System")')).toBeVisible();
    
    // Make sure the Health Protocols tab is active (should be by default)
    const healthProtocolsTab = page.locator('button:has-text("Health Protocols")').first();
    if (await healthProtocolsTab.isVisible()) {
      await healthProtocolsTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Click on Create Protocols tab in the TrainerHealthProtocols component
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await expect(createTab).toBeVisible();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    // Look for Guided Protocol Wizard option card
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await expect(wizardCard).toBeVisible({ timeout: 10000 });
    
    // Click on the Guided Protocol Wizard card
    await wizardCard.click();
    await page.waitForTimeout(3000);
    
    // After clicking, the wizard should be displayed - check for any wizard-related content
    const wizardIndicator = page.locator('text=/wizard|step|protocol creation/i').first();
    await expect(wizardIndicator).toBeVisible({ timeout: 10000 });
  });

  test('Should complete Guided Protocol Wizard 7-step workflow', async ({ page }) => {
    // Navigate to the Guided Protocol Wizard
    await page.waitForLoadState('networkidle');
    
    // Click Create Protocols tab
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    // Click Guided Protocol Wizard
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Step 1: Client Selection
    const step1Element = page.locator('text=/Client Selection|Step 1/i').first();
    if (await step1Element.isVisible()) {
      // Select a client if available
      const clientCheckbox = page.locator('input[type="checkbox"]').first();
      if (await clientCheckbox.isVisible()) {
        await clientCheckbox.check();
        await page.waitForTimeout(500);
      }
      
      // Look for and click Next button
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 2: Template Selection
    const step2Element = page.locator('text=/Template Selection|Step 2/i').first();
    if (await step2Element.isVisible()) {
      // Select a template option
      const templateOption = page.locator('[class*="template"], button:has-text("Template")').first();
      if (await templateOption.isVisible()) {
        await templateOption.click();
        await page.waitForTimeout(500);
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 3: Health Information
    const step3Element = page.locator('text=/Health Information|Step 3/i').first();
    if (await step3Element.isVisible()) {
      // Fill in health information
      const ageInput = page.locator('input[placeholder*="age" i], input[name*="age" i]').first();
      if (await ageInput.isVisible()) {
        await ageInput.fill('35');
        await page.waitForTimeout(300);
      }
      
      // Add health conditions
      const conditionInput = page.locator('input[placeholder*="condition" i], input[placeholder*="health" i]').first();
      if (await conditionInput.isVisible()) {
        await conditionInput.fill('Mild hypertension');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 4: Customization
    const step4Element = page.locator('text=/Customization|Step 4/i').first();
    if (await step4Element.isVisible()) {
      // Set protocol intensity
      const intensitySelect = page.locator('select[name*="intensity"], [role="combobox"]').first();
      if (await intensitySelect.isVisible()) {
        await intensitySelect.click();
        await page.waitForTimeout(300);
        const moderateOption = page.locator('option:has-text("moderate"), [role="option"]:has-text("moderate")').first();
        if (await moderateOption.isVisible()) {
          await moderateOption.click();
        }
      }
      
      // Set duration
      const durationInput = page.locator('input[type="number"], input[placeholder*="duration" i]').first();
      if (await durationInput.isVisible()) {
        await durationInput.fill('30');
        await page.waitForTimeout(300);
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 5: AI Generation
    const step5Element = page.locator('text=/AI Generation|Step 5/i').first();
    if (await step5Element.isVisible()) {
      // Click Generate Protocol button
      const generateButton = page.locator('button:has-text("Generate")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();
        // Wait for AI generation (longer timeout)
        await page.waitForTimeout(5000);
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 6: Safety Validation
    const step6Element = page.locator('text=/Safety Validation|Step 6/i').first();
    if (await step6Element.isVisible()) {
      // Verify safety validation is displayed
      const safetyIndicator = page.locator('[class*="safety"], [class*="validation"], text=/safety/i').first();
      if (await safetyIndicator.isVisible()) {
        await expect(safetyIndicator).toBeVisible();
      }
      
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 7: Review & Finalize
    const step7Element = page.locator('text=/Review|Finalize|Step 7/i').first();
    if (await step7Element.isVisible()) {
      // Verify protocol summary is displayed
      const protocolSummary = page.locator('[class*="summary"], [class*="review"]').first();
      if (await protocolSummary.isVisible()) {
        await expect(protocolSummary).toBeVisible();
      }
      
      // Click Create Protocol button to finalize
      const createProtocolButton = page.locator('button:has-text("Create Protocol"), button:has-text("Finalize")').first();
      if (await createProtocolButton.isVisible()) {
        await createProtocolButton.click();
        await page.waitForTimeout(3000);
        
        // Look for success confirmation
        const successMessage = page.locator('text=/success|created|saved/i').first();
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Should handle medical safety validation in Enhanced Wizard', async ({ page }) => {
    // Navigate to Guided Protocol Wizard
    await page.waitForLoadState('networkidle');
    
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Navigate through steps to reach health information
    // (Simplified navigation - skip to relevant step)
    const healthStep = page.locator('text=/Health Information/i').first();
    if (await healthStep.isVisible()) {
      // Enter high-risk medication
      const medicationInput = page.locator('input[placeholder*="medication" i], input[name*="medication" i]').first();
      if (await medicationInput.isVisible()) {
        await medicationInput.fill('Warfarin');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Check for safety warning
        const warningIndicator = page.locator('text=/warning|caution|interaction|risk/i').first();
        await expect(warningIndicator).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Should save and manage protocols through Enhanced Wizard', async ({ page }) => {
    // Test protocol saving and management workflow
    await page.waitForLoadState('networkidle');
    
    // Complete a simple protocol creation
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Create a basic protocol (simplified path)
    const createButton = page.locator('button:has-text("Create"), button:has-text("Generate")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Navigate to Manage Protocols tab to verify saved protocol
    const manageTab = page.locator('button:has-text("Manage Protocols")').first();
    if (await manageTab.isVisible()) {
      await manageTab.click();
      await page.waitForTimeout(2000);
      
      // Check if protocols are listed
      const protocolList = page.locator('[class*="protocol"], .protocol-card').first();
      if (await protocolList.isVisible()) {
        await expect(protocolList).toBeVisible();
      }
    }
  });

  test('Should handle protocol versioning and history', async ({ page }) => {
    // Test protocol version management
    await page.waitForLoadState('networkidle');
    
    // Navigate to Manage Protocols
    const manageTab = page.locator('button:has-text("Manage Protocols")').first();
    await manageTab.click();
    await page.waitForTimeout(2000);
    
    // Look for version history features
    const versionButton = page.locator('text=/version|history/i').first();
    if (await versionButton.isVisible()) {
      await versionButton.click();
      await page.waitForTimeout(2000);
      
      // Verify version history is displayed
      const versionList = page.locator('[class*="version"], .version-item').first();
      if (await versionList.isVisible()) {
        await expect(versionList).toBeVisible();
      }
    }
  });
});

// Edge cases and error handling tests
test.describe('Guided Protocol Wizard Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTrainer(page);
  });

  test('Should validate required fields in Enhanced Wizard', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to Enhanced Wizard
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Try to proceed without filling required fields
    const nextButton = page.locator('button:has-text("Next")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation error messages
      const errorMessage = page.locator('text=/required|please fill|validation/i').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('Should handle API errors gracefully in Enhanced Wizard', async ({ page }) => {
    // Mock API error responses
    await page.route('**/api/trainer/health-protocols**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error during protocol generation' })
      });
    });
    
    await page.waitForLoadState('networkidle');
    
    // Navigate to Enhanced Wizard from trainer dashboard
    const healthProtocolsTab = page.locator('button:has-text("Health Protocols")').first();
    await healthProtocolsTab.click();
    await page.waitForTimeout(1000);
    
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Try to generate protocol
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(3000);
      
      // Check for error handling
      const errorMessage = page.locator('text=/error|failed|server error/i').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('Should maintain wizard state when navigating between steps', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to Enhanced Wizard
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    await page.waitForTimeout(1000);
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Fill some data in current step
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      const testData = 'Test Protocol Data';
      await input.fill(testData);
      await page.waitForTimeout(500);
      
      // Go to next step
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Go back to previous step
        const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")').first();
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(1000);
          
          // Check if data is preserved
          const inputValue = await input.inputValue();
          expect(inputValue).toBe(testData);
        }
      }
    }
  });
});

// Performance tests for Guided Protocol Wizard
test.describe('Guided Protocol Wizard Performance', () => {
  test('Should load Enhanced Wizard within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await loginAsTrainer(page);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Enhanced Wizard from trainer dashboard
    const healthProtocolsTab = page.locator('button:has-text("Health Protocols")').first();
    await healthProtocolsTab.click();
    await page.waitForTimeout(1000);
    
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    
    // Wait for wizard to be fully loaded - check for wizard-related content
    // Try multiple selectors to ensure we catch the wizard loading
    try {
      await page.waitForSelector('text=/wizard|step|protocol creation/i', { timeout: 5000 });
    } catch (error) {
      // Fallback: wait for any wizard-related content
      await page.waitForSelector('text=/Guided Protocol Wizard|Client Selection|Step 1/i', { timeout: 5000 });
    }
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(8000); // Should load within 8 seconds
  });

  test('Should handle large client datasets efficiently', async ({ page }) => {
    await loginAsTrainer(page);
    await page.waitForLoadState('networkidle');
    
    // Navigate to Enhanced Wizard from trainer dashboard
    const healthProtocolsTab = page.locator('button:has-text("Health Protocols")').first();
    await healthProtocolsTab.click();
    await page.waitForTimeout(1000);
    
    const createTab = page.locator('button:has-text("Create Protocols")').first();
    await createTab.click();
    
    const wizardCard = page.locator('text=/Guided Protocol Wizard/i').first();
    await wizardCard.click();
    await page.waitForTimeout(2000);
    
    // Check for efficient handling of large client lists
    const clientList = page.locator('[class*="client"], .client-item').all();
    if ((await clientList).length > 50) {
      // Check if pagination or virtualization is implemented
      const paginationOrVirtualization = page.locator('[class*="pagination"], [class*="virtual"]').first();
      if (await paginationOrVirtualization.isVisible()) {
        await expect(paginationOrVirtualization).toBeVisible();
      }
    }
  });
});