import { test, expect, Page } from '@playwright/test';

/**
 * STORY-004: Health Protocol Generation Optimization - Comprehensive Feature Testing
 * Testing all new features: Template Engine, Safety Validation, Versioning, Effectiveness Tracking
 */

test.describe('Health Protocol Optimization Features', () => {
  let page: Page;
  
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Authentication & Setup', () => {
    test('should login as trainer to access health protocol features', async () => {
      await page.goto('http://localhost:3501');
      
      // Check if we can reach the application
      await expect(page).toHaveTitle(/Health Protocol/);
      
      // Navigate to login page
      await page.click('[data-testid="login-button"]', { timeout: 5000 }).catch(() => {
        // If button not found, try alternative navigation
        console.log('Direct login button not found, trying alternative navigation');
      });
      
      // Try direct navigation to login
      await page.goto('http://localhost:3501/login');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', 'trainer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="login-submit"]');
      
      // Wait for successful login redirect
      await page.waitForURL(/dashboard|protocols/, { timeout: 10000 });
      
      // Verify we're logged in as trainer
      await expect(page.locator('[data-testid="user-role"]')).toContainText('Trainer');
    });
  });

  test.describe('Protocol Template Engine', () => {
    test('should display protocol templates in creation wizard', async () => {
      // Navigate to protocol creation
      await page.goto('http://localhost:3501/protocols/create');
      
      // Verify template selection step
      await expect(page.locator('[data-testid="template-selection-step"]')).toBeVisible();
      
      // Check for pre-built templates
      const expectedTemplates = [
        'Longevity Enhancement',
        'Parasite Cleanse',
        'Weight Loss Protocol',
        'Muscle Building',
        'Detox Protocol',
        'Energy Boost',
        'Immune Support',
        'Digestive Health'
      ];
      
      for (const template of expectedTemplates) {
        await expect(page.locator(`[data-testid="template-${template.toLowerCase().replace(/\s+/g, '-')}"]`)).toBeVisible();
      }
    });

    test('should allow template customization based on client profile', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Select a template
      await page.click('[data-testid="template-longevity-enhancement"]');
      
      // Proceed to customization step
      await page.click('[data-testid="next-step-button"]');
      
      // Verify customization options
      await expect(page.locator('[data-testid="client-age-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="health-goals-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="dietary-restrictions-select"]')).toBeVisible();
      
      // Fill customization data
      await page.fill('[data-testid="client-age-input"]', '35');
      await page.selectOption('[data-testid="health-goals-select"]', 'longevity');
      await page.selectOption('[data-testid="dietary-restrictions-select"]', 'none');
      
      // Verify template is being customized
      await expect(page.locator('[data-testid="template-preview"]')).toContainText('35-year-old');
    });
  });

  test.describe('Medical Safety Validation System', () => {
    test('should validate drug interactions during protocol creation', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Navigate through steps to reach safety validation
      await page.click('[data-testid="template-parasite-cleanse"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Fill client information
      await page.fill('[data-testid="client-age-input"]', '45');
      await page.click('[data-testid="next-step-button"]');
      
      // Medical history and medications step
      await expect(page.locator('[data-testid="medication-input"]')).toBeVisible();
      
      // Enter medications that should trigger interaction warnings
      await page.fill('[data-testid="medication-input"]', 'warfarin, metformin');
      
      // Trigger safety validation
      await page.click('[data-testid="validate-safety-button"]');
      
      // Wait for validation results
      await expect(page.locator('[data-testid="safety-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="drug-interaction-warning"]')).toContainText('warfarin');
    });

    test('should require healthcare provider approval for high-risk protocols', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Select high-risk template
      await page.click('[data-testid="template-parasite-cleanse"]');
      
      // Navigate through wizard
      await page.click('[data-testid="next-step-button"]');
      await page.fill('[data-testid="client-age-input"]', '65'); // Higher risk age
      await page.click('[data-testid="next-step-button"]');
      
      // Add conditions that increase risk
      await page.check('[data-testid="condition-diabetes"]');
      await page.check('[data-testid="condition-heart-disease"]');
      
      await page.click('[data-testid="validate-safety-button"]');
      
      // Verify healthcare provider approval requirement
      await expect(page.locator('[data-testid="healthcare-approval-required"]')).toBeVisible();
      await expect(page.locator('[data-testid="healthcare-approval-required"]')).toContainText('healthcare provider approval');
    });
  });

  test.describe('Protocol Versioning System', () => {
    test('should create initial version when protocol is saved', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Complete protocol creation workflow
      await page.click('[data-testid="template-weight-loss-protocol"]');
      await page.click('[data-testid="next-step-button"]');
      
      await page.fill('[data-testid="client-age-input"]', '30');
      await page.click('[data-testid="next-step-button"]');
      
      // Skip safety validation for this test
      await page.click('[data-testid="skip-safety-validation"]');
      
      // Final review and save
      await page.click('[data-testid="next-step-button"]');
      await page.fill('[data-testid="protocol-name-input"]', 'Test Protocol v1');
      await page.click('[data-testid="save-protocol-button"]');
      
      // Wait for success and navigate to protocol detail
      await page.waitForURL(/protocols\/\w+/, { timeout: 10000 });
      
      // Verify version information
      await expect(page.locator('[data-testid="protocol-version"]')).toContainText('1.0');
      await expect(page.locator('[data-testid="version-history-button"]')).toBeVisible();
    });

    test('should show version history and allow rollback', async () => {
      // This test assumes we have a protocol with multiple versions
      await page.goto('http://localhost:3501/protocols');
      
      // Click on a protocol to view details
      await page.click('[data-testid="protocol-item"]:first-child');
      
      // Open version history
      await page.click('[data-testid="version-history-button"]');
      
      // Verify version history panel
      await expect(page.locator('[data-testid="version-history-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="version-item"]')).toHaveCount.greaterThan(0);
      
      // Test rollback functionality (if multiple versions exist)
      const versionCount = await page.locator('[data-testid="version-item"]').count();
      if (versionCount > 1) {
        await page.click('[data-testid="rollback-button"]:first-child');
        await page.click('[data-testid="confirm-rollback"]');
        
        // Verify rollback success
        await expect(page.locator('[data-testid="rollback-success-message"]')).toBeVisible();
      }
    });
  });

  test.describe('Protocol Effectiveness Tracking', () => {
    test('should display effectiveness metrics for completed protocols', async () => {
      await page.goto('http://localhost:3501/protocols');
      
      // Filter for completed protocols
      await page.click('[data-testid="filter-completed"]');
      
      // Click on a completed protocol
      await page.click('[data-testid="protocol-item"]:first-child');
      
      // Navigate to effectiveness tab
      await page.click('[data-testid="effectiveness-tab"]');
      
      // Verify effectiveness tracking components
      await expect(page.locator('[data-testid="effectiveness-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-correlation-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-satisfaction-score"]')).toBeVisible();
    });

    test('should provide optimization recommendations based on data', async () => {
      await page.goto('http://localhost:3501/protocols');
      
      // Navigate to analytics dashboard
      await page.click('[data-testid="analytics-dashboard-button"]');
      
      // Verify optimization recommendations
      await expect(page.locator('[data-testid="optimization-recommendations"]')).toBeVisible();
      
      // Check for specific recommendation types
      await expect(page.locator('[data-testid="duration-optimization"]')).toBeVisible();
      await expect(page.locator('[data-testid="intensity-optimization"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-factors"]')).toBeVisible();
    });
  });

  test.describe('Enhanced OpenAI Integration', () => {
    test('should generate protocol with optimized AI prompts', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Select template and proceed to AI generation step
      await page.click('[data-testid="template-energy-boost"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Fill basic information
      await page.fill('[data-testid="client-age-input"]', '28');
      await page.selectOption('[data-testid="activity-level-select"]', 'moderate');
      await page.click('[data-testid="next-step-button"]');
      
      // Skip safety validation
      await page.click('[data-testid="skip-safety-validation"]');
      
      // Generate protocol with AI
      await page.click('[data-testid="generate-with-ai-button"]');
      
      // Wait for AI generation (with loading indicator)
      await expect(page.locator('[data-testid="ai-generation-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-generation-loading"]')).not.toBeVisible({ timeout: 30000 });
      
      // Verify generated protocol content
      await expect(page.locator('[data-testid="generated-protocol-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-generation-cost"]')).toBeVisible();
    });

    test('should use cached responses for similar requests', async () => {
      // Generate the same type of protocol twice and verify caching
      const generateProtocol = async (testId: string) => {
        await page.goto('http://localhost:3501/protocols/create');
        await page.click('[data-testid="template-muscle-building"]');
        await page.click('[data-testid="next-step-button"]');
        
        await page.fill('[data-testid="client-age-input"]', '25');
        await page.selectOption('[data-testid="fitness-level-select"]', 'intermediate');
        await page.click('[data-testid="next-step-button"]');
        
        await page.click('[data-testid="skip-safety-validation"]');
        
        const startTime = Date.now();
        await page.click('[data-testid="generate-with-ai-button"]');
        await expect(page.locator('[data-testid="generated-protocol-content"]')).toBeVisible({ timeout: 30000 });
        const endTime = Date.now();
        
        return endTime - startTime;
      };
      
      // First generation (should be slower)
      const firstGenTime = await generateProtocol('first');
      
      // Second generation (should use cache, faster)
      const secondGenTime = await generateProtocol('second');
      
      // Verify caching by checking if second generation was significantly faster
      // Allow some variance, but cached should be at least 50% faster
      expect(secondGenTime).toBeLessThan(firstGenTime * 0.7);
    });
  });

  test.describe('Guided Protocol Creation Wizard', () => {
    test('should guide user through complete 7-step workflow', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Verify initial wizard setup
      await expect(page.locator('[data-testid="wizard-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('1 of 7');
      
      // Step 1: Template Selection
      await expect(page.locator('[data-testid="template-selection-step"]')).toBeVisible();
      await page.click('[data-testid="template-immune-support"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Step 2: Client Profile
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('2 of 7');
      await page.fill('[data-testid="client-age-input"]', '40');
      await page.selectOption('[data-testid="gender-select"]', 'female');
      await page.click('[data-testid="next-step-button"]');
      
      // Step 3: Health Assessment
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('3 of 7');
      await page.check('[data-testid="health-goal-immune-support"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Step 4: Medical Safety
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('4 of 7');
      await page.click('[data-testid="no-medications-checkbox"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Step 5: AI Generation
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('5 of 7');
      await page.click('[data-testid="generate-protocol-button"]');
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });
      await page.click('[data-testid="next-step-button"]');
      
      // Step 6: Review & Customize
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('6 of 7');
      await expect(page.locator('[data-testid="protocol-preview"]')).toBeVisible();
      await page.click('[data-testid="next-step-button"]');
      
      // Step 7: Save & Finalize
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('7 of 7');
      await page.fill('[data-testid="protocol-name-input"]', 'Immune Support Protocol for Sarah');
      await page.click('[data-testid="save-protocol-button"]');
      
      // Verify completion
      await expect(page.locator('[data-testid="protocol-created-success"]')).toBeVisible();
    });

    test('should allow navigation between wizard steps', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Navigate forward through steps
      await page.click('[data-testid="template-digestive-health"]');
      await page.click('[data-testid="next-step-button"]');
      
      await page.fill('[data-testid="client-age-input"]', '35');
      await page.click('[data-testid="next-step-button"]');
      
      // Navigate backward
      await page.click('[data-testid="previous-step-button"]');
      await expect(page.locator('[data-testid="step-indicator"]')).toContainText('2 of 7');
      
      // Verify data persistence
      await expect(page.locator('[data-testid="client-age-input"]')).toHaveValue('35');
      
      // Navigate to specific step using step indicator
      await page.click('[data-testid="step-indicator-1"]');
      await expect(page.locator('[data-testid="template-selection-step"]')).toBeVisible();
    });
  });

  test.describe('Error Handling & Edge Cases', () => {
    test('should handle OpenAI API failures gracefully', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Navigate to AI generation step
      await page.click('[data-testid="template-longevity-enhancement"]');
      await page.click('[data-testid="next-step-button"]');
      await page.fill('[data-testid="client-age-input"]', '50');
      await page.click('[data-testid="next-step-button"]');
      await page.click('[data-testid="skip-safety-validation"]');
      
      // Mock API failure by intercepting requests
      await page.route('**/api/openai/**', route => {
        route.abort('failed');
      });
      
      // Attempt AI generation
      await page.click('[data-testid="generate-with-ai-button"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="ai-generation-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="fallback-template-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-generation-button"]')).toBeVisible();
    });

    test('should validate required fields in wizard', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Try to proceed without selecting template
      await page.click('[data-testid="next-step-button"]');
      
      // Verify validation message
      await expect(page.locator('[data-testid="template-required-error"]')).toBeVisible();
      
      // Select template and proceed
      await page.click('[data-testid="template-weight-loss-protocol"]');
      await page.click('[data-testid="next-step-button"]');
      
      // Try to proceed without required client information
      await page.click('[data-testid="next-step-button"]');
      
      // Verify age validation
      await expect(page.locator('[data-testid="age-required-error"]')).toBeVisible();
    });
  });

  test.describe('Performance & User Experience', () => {
    test('should load protocol creation wizard within performance budget', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3501/protocols/create');
      await expect(page.locator('[data-testid="template-selection-step"]')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should provide real-time feedback during AI generation', async () => {
      await page.goto('http://localhost:3501/protocols/create');
      
      // Navigate to AI generation
      await page.click('[data-testid="template-detox-protocol"]');
      await page.click('[data-testid="next-step-button"]');
      await page.fill('[data-testid="client-age-input"]', '42');
      await page.click('[data-testid="next-step-button"]');
      await page.click('[data-testid="skip-safety-validation"]');
      
      // Start AI generation
      await page.click('[data-testid="generate-protocol-button"]');
      
      // Verify loading states
      await expect(page.locator('[data-testid="generation-progress-bar"]')).toBeVisible();
      await expect(page.locator('[data-testid="generation-status-text"]')).toContainText('Generating');
      
      // Wait for completion
      await expect(page.locator('[data-testid="generated-content"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="generation-complete-checkmark"]')).toBeVisible();
    });
  });
});