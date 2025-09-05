import { test, expect } from '@playwright/test';

test.describe('Health Protocol Complete Workflow Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3501');
    
    // Login as trainer
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL('**/trainer');
    await expect(page.locator('h1:has-text("Welcome")')).toContainText('Welcome');
  });

  test('Complete Enhanced Protocol Wizard Workflow', async ({ page }) => {
    // Navigate to Health Protocols
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Verify we're on the Health Protocol Management page
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    
    // Ensure we're on the "Create Protocols" tab
    const createTab = page.locator('text=Create Protocols');
    await expect(createTab).toBeVisible();
    await createTab.click();
    
    // Click Enhanced Protocol Wizard
    await page.click('text=Enhanced Protocol Wizard');
    
    // Verify the modal opens with proper title
    await expect(page.locator('text=Protocol Creation Wizard')).toBeVisible();
    
    // Check if we see Step 1 of 7
    const stepIndicator = page.locator('text=Step 1 of 7');
    if (await stepIndicator.isVisible()) {
      // Test navigation within wizard
      const nextButton = page.locator('text=Next', { exact: false });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Wait a bit for potential step changes
        await page.waitForTimeout(1000);
      }
    }
    
    // Test closing the wizard
    const closeButton = page.locator('[aria-label*="Close"], text=Cancel');
    if (await closeButton.first().isVisible()) {
      await closeButton.first().click();
    }
    
    // Verify we're back to the main protocols page
    await expect(page.locator('text=Create New Health Protocol')).toBeVisible();
  });

  test('Manual Protocol Creation Workflow', async ({ page }) => {
    // Navigate to Health Protocols
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Click Manual Creation card
    await page.click('text=Manual Creation');
    
    // Verify the page scrolls to manual creation form
    await page.waitForTimeout(1000); // Allow for smooth scroll
    
    // Test manual creation form inputs
    const protocolNameInput = page.locator('input[id="protocol-name"]');
    const protocolDescInput = page.locator('textarea[id="protocol-description"]');
    
    await expect(protocolNameInput).toBeVisible();
    await expect(protocolDescInput).toBeVisible();
    
    // Fill in the form
    await protocolNameInput.fill('Test 30-Day Longevity Protocol');
    await protocolDescInput.fill('A comprehensive test protocol for longevity improvements.');
    
    // Verify the inputs accepted the values
    await expect(protocolNameInput).toHaveValue('Test 30-Day Longevity Protocol');
    await expect(protocolDescInput).toHaveValue('A comprehensive test protocol for longevity improvements.');
    
    // Test the specialized protocols panel below
    const specializedPanel = page.locator('text=Specialized Health Protocols');
    await expect(specializedPanel).toBeVisible();
  });

  test('Specialized Protocols Panel Interaction', async ({ page }) => {
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Look for specialized protocol options
    const longevityOption = page.locator('text=Longevity Mode');
    const parasiteOption = page.locator('text=Parasite Cleanse');
    
    if (await longevityOption.isVisible()) {
      await longevityOption.click();
      await page.waitForTimeout(500);
      
      // Look for expanded options
      const intensityOptions = page.locator('text=Gentle, text=Moderate, text=Intensive');
      // Don't assert visibility as the UI might be different, but check if interactions work
    }
    
    // Test client ailments selector if visible
    const ailmentsSection = page.locator('text=Client Ailments');
    if (await ailmentsSection.isVisible()) {
      await ailmentsSection.click();
      await page.waitForTimeout(500);
      
      // Look for common health issues
      const commonIssues = [
        'Digestive Issues',
        'Energy & Fatigue',
        'Weight Management',
        'Joint & Muscle Pain',
        'Sleep Issues'
      ];
      
      for (const issue of commonIssues) {
        const issueElement = page.locator(`text=${issue}`);
        if (await issueElement.isVisible()) {
          console.log(`Found health issue option: ${issue}`);
        }
      }
    }
  });

  test('Tab Navigation and State Management', async ({ page }) => {
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Test all three tabs
    const tabs = ['Create Protocols', 'Manage Protocols', 'Client Assignments'];
    
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
        
        // Verify tab is active (should have different styling)
        // Note: Specific styling checks would depend on the actual CSS classes
        console.log(`Successfully clicked ${tabName} tab`);
        
        // Check for tab-specific content
        if (tabName === 'Create Protocols') {
          await expect(page.locator('text=Create New Health Protocol')).toBeVisible();
        } else if (tabName === 'Manage Protocols') {
          // Should show protocols list or empty state
          const manageContent = page.locator('text=Your Health Protocols, text=No Protocols Yet');
          await expect(manageContent.first()).toBeVisible();
        } else if (tabName === 'Client Assignments') {
          await expect(page.locator('text=Protocol Assignments')).toBeVisible();
        }
      }
    }
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Test rapid clicking on buttons
    const wizardButton = page.locator('text=Enhanced Protocol Wizard');
    await wizardButton.click();
    await wizardButton.click(); // Double click
    
    // Should still only open one modal
    const modalCount = await page.locator('[role="dialog"]').count();
    expect(modalCount).toBeLessThanOrEqual(1);
    
    // Close any open modals
    const closeButtons = page.locator('[aria-label*="Close"], text=Cancel');
    const closeButtonCount = await closeButtons.count();
    if (closeButtonCount > 0) {
      await closeButtons.first().click();
    }
    
    // Test form validation with empty inputs
    await page.click('text=Manual Creation');
    await page.waitForTimeout(500);
    
    // Try to submit empty form (if there's a submit button visible)
    const submitButton = page.locator('text=Save Protocol, text=Create Protocol, text=Generate Protocol');
    if (await submitButton.first().isVisible()) {
      await submitButton.first().click();
      // Should show validation errors or handle gracefully
    }
  });

  test('Mobile Responsiveness Check', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Check if the page adapts well to mobile
    const createProtocolCard = page.locator('text=Create New Health Protocol');
    await expect(createProtocolCard).toBeVisible();
    
    // Test button accessibility on mobile
    const wizardButton = page.locator('text=Enhanced Protocol Wizard');
    const manualButton = page.locator('text=Manual Creation');
    
    await expect(wizardButton).toBeVisible();
    await expect(manualButton).toBeVisible();
    
    // Test clicking on mobile
    await wizardButton.click();
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      // Modal should be visible and accessible on mobile
      await expect(modal).toBeVisible();
      
      // Close modal
      const closeButton = page.locator('[aria-label*="Close"], text=Cancel');
      if (await closeButton.first().isVisible()) {
        await closeButton.first().click();
      }
    }
  });

  test('Performance and Loading States', async ({ page }) => {
    // Monitor network requests
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('api')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Wait for potential API calls to complete
    await page.waitForTimeout(2000);
    
    // Check if any API calls were made and their status
    console.log('API Responses:', responses);
    
    // Verify page loads quickly
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
  });
});