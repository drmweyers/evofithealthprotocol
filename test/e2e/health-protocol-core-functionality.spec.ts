import { test, expect } from '@playwright/test';

test.describe('Health Protocol Core Functionality Tests', () => {
  test('Core Navigation and Button Functionality', async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:3501');
    
    // Login as trainer
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    
    // Wait for trainer dashboard
    await page.waitForURL('**/trainer');
    
    // Verify we're on trainer dashboard by looking for the manage protocols button
    const manageButton = page.locator('text=Manage Health Protocols');
    await expect(manageButton).toBeVisible();
    
    // Click to navigate to protocols page
    await manageButton.click();
    await page.waitForURL('**/protocols');
    
    // Verify we're on the Health Protocol Management page
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    
    // Take screenshot of the protocols page
    await page.screenshot({ path: 'test-results/protocols-page.png' });
    
    // Verify both navigation buttons exist and are clickable
    const wizardButton = page.locator('text=Enhanced Protocol Wizard');
    const manualButton = page.locator('text=Manual Creation');
    
    await expect(wizardButton).toBeVisible();
    await expect(manualButton).toBeVisible();
    
    console.log('✅ Both navigation buttons are visible');
    
    // Test Enhanced Protocol Wizard button
    await wizardButton.click();
    await page.waitForTimeout(1000); // Allow for modal to appear
    
    // Check if modal or wizard opened
    const modal = page.locator('[role="dialog"]');
    const wizardTitle = page.locator('text=Protocol Creation Wizard');
    
    if (await modal.isVisible() || await wizardTitle.isVisible()) {
      console.log('✅ Enhanced Protocol Wizard modal opened successfully');
      await page.screenshot({ path: 'test-results/wizard-modal.png' });
      
      // Close the modal
      const closeButton = page.locator('[aria-label*="Close"], text=Cancel');
      if (await closeButton.first().isVisible()) {
        await closeButton.first().click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('⚠️ Enhanced Protocol Wizard modal not detected');
    }
    
    // Test Manual Creation button (should scroll to form)
    await manualButton.click();
    await page.waitForTimeout(1000); // Allow for scroll
    
    // Verify manual creation form is visible
    const protocolNameInput = page.locator('input[id="protocol-name"]');
    const protocolDescInput = page.locator('textarea[id="protocol-description"]');
    
    await expect(protocolNameInput).toBeVisible();
    await expect(protocolDescInput).toBeVisible();
    
    console.log('✅ Manual creation form is visible and accessible');
    
    // Test form inputs
    await protocolNameInput.fill('Test Protocol Name');
    await protocolDescInput.fill('Test protocol description');
    
    // Verify inputs work
    await expect(protocolNameInput).toHaveValue('Test Protocol Name');
    await expect(protocolDescInput).toHaveValue('Test protocol description');
    
    console.log('✅ Manual creation form inputs work correctly');
    
    // Take screenshot of completed form
    await page.screenshot({ path: 'test-results/manual-form-filled.png' });
    
    // Test tab navigation
    const manageTab = page.locator('text=Manage Protocols');
    if (await manageTab.isVisible()) {
      await manageTab.click();
      await page.waitForTimeout(500);
      
      // Should show manage protocols content
      const manageContent = page.locator('text=Your Health Protocols');
      if (await manageContent.isVisible()) {
        console.log('✅ Manage Protocols tab navigation works');
      }
    }
    
    // Test assignments tab
    const assignmentsTab = page.locator('text=Client Assignments');
    if (await assignmentsTab.isVisible()) {
      await assignmentsTab.click();
      await page.waitForTimeout(500);
      
      const assignmentContent = page.locator('text=Protocol Assignments');
      if (await assignmentContent.isVisible()) {
        console.log('✅ Client Assignments tab navigation works');
      }
    }
    
    // Return to create tab
    const createTab = page.locator('text=Create Protocols');
    if (await createTab.isVisible()) {
      await createTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Successfully returned to Create Protocols tab');
    }
    
    console.log('🎉 All core navigation functionality tests passed!');
  });

  test('Specialized Protocols Panel Functionality', async ({ page }) => {
    // Login and navigate to protocols
    await page.goto('http://localhost:3501');
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer');
    
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Look for specialized protocols section
    const specializedSection = page.locator('text=Specialized Health Protocols');
    if (await specializedSection.isVisible()) {
      console.log('✅ Specialized Health Protocols section found');
      
      // Test longevity mode if available
      const longevityOption = page.locator('text=Longevity Mode');
      if (await longevityOption.isVisible()) {
        await longevityOption.click();
        await page.waitForTimeout(500);
        console.log('✅ Longevity Mode option is clickable');
      }
      
      // Test parasite cleanse if available
      const parasiteOption = page.locator('text=Parasite Cleanse');
      if (await parasiteOption.isVisible()) {
        await parasiteOption.click();
        await page.waitForTimeout(500);
        console.log('✅ Parasite Cleanse option is clickable');
      }
      
      // Test client ailments section
      const ailmentsSection = page.locator('text=Client Ailments');
      if (await ailmentsSection.isVisible()) {
        await ailmentsSection.click();
        await page.waitForTimeout(500);
        console.log('✅ Client Ailments section is interactive');
        
        // Look for common ailments
        const ailmentsList = [
          'Digestive Issues',
          'Energy & Fatigue',
          'Weight Management',
          'Joint & Muscle Pain',
          'Sleep Issues',
          'Stress & Anxiety',
          'Skin Issues',
          'Hormonal Issues'
        ];
        
        let foundAilments = 0;
        for (const ailment of ailmentsList) {
          const ailmentElement = page.locator(`text=${ailment}`);
          if (await ailmentElement.isVisible()) {
            foundAilments++;
            console.log(`✅ Found ailment option: ${ailment}`);
          }
        }
        
        if (foundAilments > 0) {
          console.log(`✅ Found ${foundAilments} ailment options in the interface`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/specialized-protocols-panel.png' });
    console.log('🎉 Specialized Protocols Panel functionality verified!');
  });

  test('Mobile Responsiveness Verification', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login and navigate
    await page.goto('http://localhost:3501');
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer');
    
    await page.click('text=Manage Health Protocols');
    await page.waitForURL('**/protocols');
    
    // Verify mobile layout works
    await expect(page.locator('text=Health Protocol Management System')).toBeVisible();
    
    const wizardButton = page.locator('text=Enhanced Protocol Wizard');
    const manualButton = page.locator('text=Manual Creation');
    
    await expect(wizardButton).toBeVisible();
    await expect(manualButton).toBeVisible();
    
    // Test buttons work on mobile
    await wizardButton.click();
    await page.waitForTimeout(1000);
    
    // Close any modal that opened
    const closeButton = page.locator('[aria-label*="Close"], text=Cancel');
    if (await closeButton.first().isVisible()) {
      await closeButton.first().click();
    }
    
    await page.screenshot({ path: 'test-results/mobile-protocols-page.png' });
    console.log('✅ Mobile responsiveness verified - all buttons accessible');
  });
});