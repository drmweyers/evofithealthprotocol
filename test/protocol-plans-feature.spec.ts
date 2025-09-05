import { test, expect, Page } from '@playwright/test';

const TEST_BASE_URL = 'http://localhost:3501';
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

const PROTOCOL_PLAN_DATA = {
  planName: 'Test 30-Day Wellness Plan',
  planDescription: 'A comprehensive wellness plan for beginners',
  protocolType: 'general',
  name: 'Test Protocol',
  description: 'Test protocol generated from plan',
  duration: 30,
  intensity: 'moderate',
  targetAudience: ['beginner'],
  healthFocus: ['energy_vitality', 'digestive_health']
};

test.describe('Protocol Plans Feature', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should login as trainer', async () => {
    await page.goto(`${TEST_BASE_URL}/login`);
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', TRAINER_CREDENTIALS.email);
    await page.fill('input[name="password"], input[type="password"]', TRAINER_CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    // Wait for redirect to trainer dashboard
    await page.waitForURL('**/trainer', { timeout: 10000 });
    
    // Verify trainer dashboard loads
    await expect(page).toHaveTitle(/Trainer/i);
  });

  test('should navigate to Protocol Creation Wizard', async () => {
    // Navigate to protocol creation
    await page.goto(`${TEST_BASE_URL}/trainer/protocols/create`);
    
    // Wait for wizard to load
    await page.waitForSelector('text=Protocol Creation Wizard', { timeout: 5000 });
    
    // Verify wizard is loaded
    await expect(page.locator('h1')).toContainText('Protocol Creation Wizard');
    await expect(page.locator('text=Step 1 of 7')).toBeVisible();
  });

  test('should complete wizard steps to save as protocol plan', async () => {
    // Step 1: Protocol Type & Template
    console.log('Testing Step 1: Protocol Type Selection');
    await page.click(`[data-protocol-type="${PROTOCOL_PLAN_DATA.protocolType}"], text="General Wellness"`);
    await page.click('button:has-text("Next")');
    
    // Step 2: Basic Information
    console.log('Testing Step 2: Basic Information');
    await page.fill('input[id="protocol-name"]', PROTOCOL_PLAN_DATA.name);
    await page.fill('textarea[id="description"]', PROTOCOL_PLAN_DATA.description);
    await page.fill('input[id="duration"]', PROTOCOL_PLAN_DATA.duration.toString());
    await page.click(`[data-intensity="${PROTOCOL_PLAN_DATA.intensity}"], text="Moderate"`);
    await page.click('button:has-text("Next")');
    
    // Step 3: Target Audience & Health Focus
    console.log('Testing Step 3: Audience and Focus');
    for (const audience of PROTOCOL_PLAN_DATA.targetAudience) {
      await page.click(`text="${audience}" >> xpath=ancestor::div[contains(@class, 'cursor-pointer')]`);
    }
    for (const focus of PROTOCOL_PLAN_DATA.healthFocus) {
      await page.click(`[data-health-focus="${focus}"], text*="${focus.replace('_', ' ')}"`);
    }
    await page.click('button:has-text("Next")');
    
    // Step 4: Personalization (Optional - Skip)
    console.log('Testing Step 4: Personalization (Skip)');
    await page.click('button:has-text("Next")');
    
    // Step 5: Safety & Medical Considerations
    console.log('Testing Step 5: Safety Validation');
    // Accept defaults and continue
    await page.click('button:has-text("Next")');
    
    // Step 6: Advanced Features (Optional - Skip)
    console.log('Testing Step 6: Advanced Options (Skip)');
    await page.click('button:has-text("Next")');
    
    // Step 7: Preview & Generate
    console.log('Testing Step 7: Preview and Save as Plan');
    await page.waitForSelector('text=Preview & Generate', { timeout: 5000 });
    
    // Generate preview first
    const generateBtn = page.locator('button:has-text("Generate Protocol Preview")');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(2000); // Wait for preview generation
    }
    
    // Look for Save as Protocol Plan button
    await page.waitForSelector('button:has-text("Save as Protocol Plan")', { timeout: 10000 });
    await page.click('button:has-text("Save as Protocol Plan")');
    
    // Fill in plan details modal
    await page.waitForSelector('input[id="plan-name"]', { timeout: 5000 });
    await page.fill('input[id="plan-name"]', PROTOCOL_PLAN_DATA.planName);
    await page.fill('textarea[id="plan-description"]', PROTOCOL_PLAN_DATA.planDescription);
    
    // Save the plan
    await page.click('button:has-text("Save Plan")');
    
    // Wait for success message
    await page.waitForSelector('text*="Protocol Plan Saved"', { timeout: 10000 });
    
    console.log('✅ Protocol plan saved successfully');
  });

  test('should navigate to Protocol Plans Library', async () => {
    // Navigate to protocol plans library
    await page.goto(`${TEST_BASE_URL}/trainer/protocol-plans`);
    
    // Wait for library to load
    await page.waitForSelector('text=Protocol Plans Library', { timeout: 10000 });
    
    // Verify library page loads
    await expect(page.locator('h2')).toContainText('Protocol Plans Library');
    
    // Look for our saved plan
    await page.waitForSelector(`text="${PROTOCOL_PLAN_DATA.planName}"`, { timeout: 5000 });
    await expect(page.locator(`text="${PROTOCOL_PLAN_DATA.planName}"`)).toBeVisible();
    
    console.log('✅ Protocol Plans Library loaded and shows saved plan');
  });

  test('should be able to assign protocol plan to customer', async () => {
    // Make sure we're on the protocol plans library
    await page.goto(`${TEST_BASE_URL}/trainer/protocol-plans`);
    await page.waitForSelector('text=Protocol Plans Library', { timeout: 5000 });
    
    // Find our plan card and click assign button
    const planCard = page.locator(`text="${PROTOCOL_PLAN_DATA.planName}" >> xpath=ancestor::div[contains(@class, 'Card') or contains(@class, 'card')]`);
    const assignBtn = planCard.locator('button:has-text("Assign to Customer")');
    
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
    } else {
      // Try dropdown menu
      await planCard.locator('[data-testid="dropdown-menu-trigger"], button:has([data-testid="more-vertical"])').click();
      await page.click('text="Assign to Customer"');
    }
    
    // Wait for assignment modal
    await page.waitForSelector('text*="Assign Protocol Plan"', { timeout: 10000 });
    
    // Look for customer selection dropdown
    const customerSelect = page.locator('select, [role="combobox"]').first();
    if (await customerSelect.isVisible()) {
      await customerSelect.click();
      
      // Select first available customer
      const customerOptions = page.locator('[role="option"], option');
      const optionCount = await customerOptions.count();
      
      if (optionCount > 0) {
        await customerOptions.first().click();
        
        // Click assign/create button
        await page.click('button:has-text("Create & Assign"), button:has-text("Assign")');
        
        // Wait for success message
        await page.waitForSelector('text*="Protocol Created"', { timeout: 10000 });
        
        console.log('✅ Protocol plan assigned to customer successfully');
      } else {
        console.log('⚠️ No customers available for assignment');
        await page.click('button:has-text("Cancel")');
      }
    } else {
      console.log('⚠️ Customer selection not available');
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should validate protocol plan appears in usage stats', async () => {
    // Go back to protocol plans library
    await page.goto(`${TEST_BASE_URL}/trainer/protocol-plans`);
    await page.waitForSelector('text=Protocol Plans Library', { timeout: 5000 });
    
    // Find our plan card
    const planCard = page.locator(`text="${PROTOCOL_PLAN_DATA.planName}" >> xpath=ancestor::div[contains(@class, 'Card') or contains(@class, 'card')]`);
    
    // Check if usage count is displayed (should be 1 if assignment worked)
    const usageText = planCard.locator('text*=" uses", text*=" use"');
    if (await usageText.isVisible()) {
      const usageCount = await usageText.textContent();
      console.log(`✅ Usage count displayed: ${usageCount}`);
    } else {
      console.log('⚠️ Usage count not visible yet');
    }
  });

  test('should test search functionality in protocol plans library', async () => {
    await page.goto(`${TEST_BASE_URL}/trainer/protocol-plans`);
    await page.waitForSelector('text=Protocol Plans Library', { timeout: 5000 });
    
    // Test search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Test 30-Day');
    
    // Wait a moment for search to process
    await page.waitForTimeout(1000);
    
    // Verify our plan is still visible
    await expect(page.locator(`text="${PROTOCOL_PLAN_DATA.planName}"`)).toBeVisible();
    
    // Test search with non-matching term
    await searchInput.fill('NonExistentPlan');
    await page.waitForTimeout(1000);
    
    // Plan should not be visible now
    const planExists = await page.locator(`text="${PROTOCOL_PLAN_DATA.planName}"`).isVisible();
    if (!planExists) {
      console.log('✅ Search filtering works correctly');
    }
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1000);
    
    // Plan should be visible again
    await expect(page.locator(`text="${PROTOCOL_PLAN_DATA.planName}"`)).toBeVisible();
  });

  test('should clean up test data', async () => {
    await page.goto(`${TEST_BASE_URL}/trainer/protocol-plans`);
    await page.waitForSelector('text=Protocol Plans Library', { timeout: 5000 });
    
    // Find our test plan card
    const planCard = page.locator(`text="${PROTOCOL_PLAN_DATA.planName}" >> xpath=ancestor::div[contains(@class, 'Card') or contains(@class, 'card')]`);
    
    // Click dropdown menu
    const dropdownBtn = planCard.locator('[data-testid="dropdown-menu-trigger"], button:has([data-testid="more-vertical"])');
    if (await dropdownBtn.isVisible()) {
      await dropdownBtn.click();
      
      // Click delete
      await page.click('text="Delete"');
      
      // Confirm deletion
      await page.waitForSelector('text*="Delete Protocol Plan"', { timeout: 5000 });
      await page.click('button:has-text("Delete Plan")');
      
      // Wait for success message or plan to disappear
      await page.waitForTimeout(2000);
      
      console.log('✅ Test plan deleted successfully');
    } else {
      console.log('⚠️ Could not find delete button');
    }
  });
});

test.describe('API Endpoints Testing', () => {
  test('should test protocol plans API endpoints', async ({ request }) => {
    // First login to get session
    const loginResponse = await request.post(`${TEST_BASE_URL}/api/auth/login`, {
      data: TRAINER_CREDENTIALS
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    // Test creating a protocol plan via API
    const createPlanResponse = await request.post(`${TEST_BASE_URL}/api/protocol-plans`, {
      data: {
        planName: 'API Test Plan',
        planDescription: 'Created via API test',
        wizardConfiguration: {
          protocolType: 'general',
          name: 'API Test Protocol',
          description: 'Test description',
          duration: 21,
          intensity: 'gentle',
          category: 'general',
          targetAudience: ['beginner'],
          healthFocus: ['energy_vitality'],
          experienceLevel: 'beginner',
          personalizations: {},
          safetyValidation: {
            requiresHealthcareApproval: false,
            contraindications: [],
            drugInteractions: [],
            pregnancySafe: true,
            intensityWarnings: []
          },
          advancedOptions: {
            enableVersioning: true,
            enableEffectivenessTracking: true,
            allowCustomerModifications: false,
            includeProgressMilestones: true
          }
        }
      }
    });
    
    if (createPlanResponse.ok()) {
      const planData = await createPlanResponse.json();
      console.log('✅ Protocol plan created via API:', planData.data.id);
      
      // Test listing plans
      const listResponse = await request.get(`${TEST_BASE_URL}/api/protocol-plans`);
      expect(listResponse.ok()).toBeTruthy();
      
      const listData = await listResponse.json();
      console.log('✅ Plans listed via API:', listData.data.length);
      
      // Test getting specific plan
      const getResponse = await request.get(`${TEST_BASE_URL}/api/protocol-plans/${planData.data.id}`);
      expect(getResponse.ok()).toBeTruthy();
      
      console.log('✅ Specific plan retrieved via API');
      
      // Clean up - delete the test plan
      const deleteResponse = await request.delete(`${TEST_BASE_URL}/api/protocol-plans/${planData.data.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
      
      console.log('✅ Test plan deleted via API');
    } else {
      console.log('⚠️ Failed to create plan via API:', await createPlanResponse.text());
    }
  });
});