import { test, expect } from '@playwright/test';

test.describe('Parasite Cleanse Protocols Feature', () => {
  const BASE_URL = 'http://localhost:3501';
  
  test.beforeEach(async ({ page }) => {
    // Login as trainer to access health protocols
    await page.goto(BASE_URL);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[type="password"]', 'TestTrainer123!');
    await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]');
    
    // Wait for successful login and redirect
    await page.waitForURL((url) => {
      return url.pathname.includes('/trainer') || url.pathname === '/';
    }, { timeout: 10000 });
    
    // Navigate to health protocols page
    await page.goto(`${BASE_URL}/trainer/health-protocols`);
    await page.waitForLoadState('networkidle');
  });

  test('should display parasite cleanse protocols section', async ({ page }) => {
    // Look for specialized protocols panel
    await expect(page.locator('text=Specialized Protocols')).toBeVisible();
    
    // Check for parasite cleanse option
    const parasiteCleanseSection = page.locator('text=Parasite Cleanse');
    await expect(parasiteCleanseSection).toBeVisible();
    
    // Verify there are multiple protocol options available
    await page.click('text=Parasite Cleanse');
    
    // Should see at least 20+ protocol options
    await expect(page.locator('[data-testid="protocol-option"]')).toHaveCount({ min: 20 });
  });

  test('should show ailment-based protocol recommendations', async ({ page }) => {
    // Navigate to parasite cleanse protocols
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Look for ailment selection interface
    const ailmentSelector = page.locator('[data-testid="ailment-selector"]');
    await expect(ailmentSelector).toBeVisible();
    
    // Select digestive issues as an ailment
    await page.click('[data-value="digestive_issues"]');
    
    // Should see filtered protocol recommendations
    await expect(page.locator('[data-testid="recommended-protocol"]')).toHaveCount({ min: 3 });
    
    // Verify recommendation reasons are shown
    const reasoningText = page.locator('text=Targets digestive_issues');
    await expect(reasoningText).toBeVisible();
  });

  test('should display comprehensive protocol details', async ({ page }) => {
    // Navigate to a specific protocol
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Click on Traditional Triple Herb Protocol
    await page.click('text=Traditional Triple Herb Protocol');
    
    // Verify detailed protocol information is displayed
    await expect(page.locator('text=Black Walnut Hull')).toBeVisible();
    await expect(page.locator('text=Wormwood')).toBeVisible();
    await expect(page.locator('text=Cloves')).toBeVisible();
    
    // Check for dosage information
    await expect(page.locator('text=250-500mg')).toBeVisible();
    
    // Check for safety information
    await expect(page.locator('text=Contraindicated in pregnancy')).toBeVisible();
    
    // Verify evidence level is shown
    await expect(page.locator('text=Evidence Level')).toBeVisible();
  });

  test('should filter protocols by intensity level', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Filter by gentle intensity
    const intensityFilter = page.locator('[data-testid="intensity-filter"]');
    await intensityFilter.selectOption('gentle');
    
    // Verify only gentle protocols are shown
    const protocolCards = page.locator('[data-testid="protocol-card"]');
    const count = await protocolCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Each protocol should show as gentle
    for (let i = 0; i < count; i++) {
      const card = protocolCards.nth(i);
      await expect(card.locator('text=Gentle')).toBeVisible();
    }
  });

  test('should show regional availability information', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Select region filter
    const regionFilter = page.locator('[data-testid="region-filter"]');
    await regionFilter.selectOption('north_america');
    
    // Should show protocols available in North America
    const availableProtocols = page.locator('[data-testid="protocol-card"]');
    expect(await availableProtocols.count()).toBeGreaterThan(10);
    
    // Verify availability is indicated
    await expect(page.locator('text=Available in North America')).toBeVisible();
  });

  test('should display safety warnings and contraindications', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Click on a protocol with contraindications
    await page.click('text=Artemisinin Protocol');
    
    // Should show safety warnings prominently
    await expect(page.locator('text=⚠️')).toBeVisible();
    await expect(page.locator('text=Contraindications')).toBeVisible();
    
    // Specific contraindications should be listed
    await expect(page.locator('text=pregnancy')).toBeVisible();
    await expect(page.locator('text=G6PD_deficiency')).toBeVisible();
  });

  test('should integrate with customer assignment workflow', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Select a protocol
    await page.click('text=Traditional Triple Herb Protocol');
    
    // Should have option to assign to customer
    const assignButton = page.locator('[data-testid="assign-protocol-button"]');
    await expect(assignButton).toBeVisible();
    
    // Click assign button
    await assignButton.click();
    
    // Should show customer selection interface
    await expect(page.locator('[data-testid="customer-selection"]')).toBeVisible();
    
    // Should show available customers (test might have none, but interface should exist)
    const customerList = page.locator('[data-testid="customer-list"]');
    await expect(customerList).toBeVisible();
  });

  test('should provide protocol phase progression information', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Select a protocol with multiple phases
    await page.click('text=Ayurvedic Comprehensive Protocol');
    
    // Should show phase information
    await expect(page.locator('text=Phase 1')).toBeVisible();
    await expect(page.locator('text=Ama Digestion')).toBeVisible();
    
    // Should show phase durations
    await expect(page.locator('text=14 days')).toBeVisible();
    
    // Should show phase objectives
    await expect(page.locator('text=Objective')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Search for specific herb
    const searchInput = page.locator('[data-testid="protocol-search"]');
    await searchInput.fill('berberine');
    
    // Should filter to show only protocols containing berberine
    const searchResults = page.locator('[data-testid="protocol-card"]');
    const count = await searchResults.count();
    
    if (count > 0) {
      // Each result should contain berberine
      await expect(page.locator('text=Berberine')).toBeVisible();
    }
  });

  test('should display effectiveness scores and evidence levels', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Select a protocol
    await page.click('text=Clinical Evidence-Based Protocol');
    
    // Should show effectiveness scores
    await expect(page.locator('text=Effectiveness')).toBeVisible();
    await expect(page.locator('text=Protozoa')).toBeVisible();
    await expect(page.locator('text=Helminths')).toBeVisible();
    
    // Should show evidence level
    await expect(page.locator('text=Clinical Studies')).toBeVisible();
    
    // Should show percentage effectiveness scores
    await expect(page.locator('[data-testid="effectiveness-score"]')).toBeVisible();
  });

  test('should provide herb preparation and timing guidance', async ({ page }) => {
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Select a protocol with detailed herb information
    await page.click('text=Traditional Triple Herb Protocol');
    
    // Should show preparation methods
    await expect(page.locator('text=Preparation')).toBeVisible();
    await expect(page.locator('text=tincture')).toBeVisible();
    
    // Should show timing information  
    await expect(page.locator('text=3x daily before meals')).toBeVisible();
    
    // Should show active compounds
    await expect(page.locator('text=juglone')).toBeVisible();
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // Should still be functional on mobile
    const protocolList = page.locator('[data-testid="protocol-list"]');
    await expect(protocolList).toBeVisible();
    
    // Cards should stack vertically on mobile
    const protocolCards = page.locator('[data-testid="protocol-card"]');
    const firstCard = protocolCards.first();
    await expect(firstCard).toBeVisible();
    
    // Should be able to interact with protocols on mobile
    await firstCard.click();
    await expect(page.locator('[data-testid="protocol-details"]')).toBeVisible();
  });

  test('should validate user experience flow end-to-end', async ({ page }) => {
    // Complete user workflow test
    
    // 1. Navigate to protocols
    await page.click('text=Specialized Protocols');
    await page.click('text=Parasite Cleanse');
    
    // 2. Select ailments
    await page.click('[data-value="chronic_fatigue"]');
    await page.click('[data-value="digestive_issues"]');
    
    // 3. Get recommendations
    const recommendations = page.locator('[data-testid="recommended-protocol"]');
    await expect(recommendations).toHaveCount({ min: 1 });
    
    // 4. View protocol details
    await recommendations.first().click();
    await expect(page.locator('[data-testid="protocol-details"]')).toBeVisible();
    
    // 5. Check safety information
    await expect(page.locator('[data-testid="safety-section"]')).toBeVisible();
    
    // 6. Attempt to assign (if customer available)
    const assignButton = page.locator('[data-testid="assign-protocol-button"]');
    if (await assignButton.isVisible()) {
      await assignButton.click();
      await expect(page.locator('[data-testid="assignment-modal"]')).toBeVisible();
    }
    
    console.log('✅ End-to-end user experience flow completed successfully');
  });
});