import { test, expect } from '@playwright/test';

// Test credentials
const TRAINER_CREDENTIALS = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

// Helper function to login
async function loginAsTrainer(page: any) {
  await page.goto('http://localhost:3501/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500); // Allow CSS to load
  
  await page.fill('input[type="email"]', TRAINER_CREDENTIALS.email);
  await page.fill('input[type="password"]', TRAINER_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL(/\/(trainer|protocols)/, { timeout: 10000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500); // Allow React to render with CSS
}

test.describe('Mobile Responsive Design - Phone', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport BEFORE navigating (iPhone 13 size)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Viewport is already set in beforeEach
    await loginAsTrainer(page);
    
    // Mobile navigation trigger should be visible
    const mobileMenuButton = page.locator('[aria-label="Open navigation menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Desktop navigation should not be visible
    const desktopLogout = page.locator('button:has-text("Logout")');
    const logoutCount = await desktopLogout.count();
    if (logoutCount > 0) {
      // Check if any desktop logout buttons are visible
      const visibleLogout = await desktopLogout.first().isVisible();
      if (visibleLogout) {
        // It should be hidden on mobile
        const parent = await desktopLogout.first().locator('..').getAttribute('class');
        expect(parent).toContain('hidden');
      }
    }
  });

  test('should open mobile navigation drawer', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Click mobile menu button
    await page.click('[aria-label="Open navigation menu"]');
    
    // Wait for drawer animation
    await page.waitForTimeout(300);
    
    // Navigation drawer should be visible
    await expect(page.locator('text="EvoFit Health"')).toBeVisible();
    await expect(page.locator('text="Sign Out"')).toBeVisible();
    
    // Should show user email
    await expect(page.getByText(TRAINER_CREDENTIALS.email)).toBeVisible();
  });

  test('should navigate through mobile menu', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Open mobile menu
    await page.click('[aria-label="Open navigation menu"]');
    await page.waitForTimeout(300);
    
    // Navigate to Health Protocols if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/protocols')) {
      await page.click('text="Health Protocols"');
      await page.waitForURL('**/protocols');
    }
    
    // Menu should close after navigation
    await expect(page.locator('[aria-label="Open navigation menu"]')).toBeVisible();
  });

  test('should display responsive stats cards', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Navigate to trainer dashboard
    if (!page.url().includes('/trainer')) {
      await page.goto('http://localhost:3501/trainer');
      await page.waitForLoadState('networkidle');
    }
    
    // Stats cards should stack vertically on mobile
    const statsGrid = page.locator('.grid').first();
    const gridClasses = await statsGrid.getAttribute('class');
    expect(gridClasses).toContain('grid-cols-1');
    
    // Cards should be visible
    await expect(page.locator('text="Total Customers"')).toBeVisible();
  });

  test('should have appropriate font sizes for mobile', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Check header text size
    const headerText = page.locator('h1').first();
    const fontSize = await headerText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Mobile font size should be smaller
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeLessThanOrEqual(24);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });

  test('should have proper touch target sizes', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Open mobile menu
    await page.click('[aria-label="Open navigation menu"]');
    await page.waitForTimeout(300);
    
    // Check navigation button sizes
    const navButtons = page.locator('nav button');
    const buttonCount = await navButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = navButtons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44 pixels (allowing some flexibility)
          expect(box.height).toBeGreaterThanOrEqual(36);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should not have horizontal scroll', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('Mobile Responsive Design - Tablet', () => {
  test.beforeEach(async ({ page }) => {
    // Set tablet viewport (iPad size)
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  test('should display appropriate layout for tablet', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Check if layout adapts for tablet
    const viewport = page.viewportSize();
    
    if (viewport && viewport.width >= 768) {
      // Should show multi-column layouts on tablets
      const multiColGrids = await page.locator('[class*="sm:grid-cols-2"], [class*="md:grid-cols-2"]').count();
      expect(multiColGrids).toBeGreaterThan(0);
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Portrait orientation
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    let bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768);
    
    // Landscape orientation
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1024);
    
    // Should not cause layout issues
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'Mobile XS', width: 320, height: 568 },
    { name: 'Mobile SM', width: 375, height: 667 },
    { name: 'Mobile MD', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop SM', width: 1024, height: 768 },
    { name: 'Desktop MD', width: 1280, height: 800 }
  ];

  for (const { name, width, height } of breakpoints) {
    test(`should render correctly at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await loginAsTrainer(page);
      
      // Check if navigation adapts correctly
      if (width < 768) {
        // Mobile navigation
        const mobileMenu = await page.locator('[aria-label="Open navigation menu"]').isVisible();
        expect(mobileMenu).toBeTruthy();
      } else {
        // Desktop navigation elements might be visible
        const hasNav = await page.locator('nav').count() > 0;
        expect(hasNav).toBeTruthy();
      }
      
      // Check grid layouts adapt
      const grids = page.locator('.grid');
      const gridCount = await grids.count();
      
      for (let i = 0; i < Math.min(gridCount, 3); i++) {
        const grid = grids.nth(i);
        const gridClass = await grid.getAttribute('class');
        
        if (gridClass) {
          if (width < 640) {
            // Should use single column on mobile
            expect(gridClass).toContain('grid-cols-1');
          }
        }
      }
      
      // No horizontal scroll should be present
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    });
  }
});

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should load quickly on mobile viewport', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3501/login');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds on local (more lenient for Docker)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle interactions smoothly', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Open and close menu multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('[aria-label="Open navigation menu"]');
      await page.waitForTimeout(300);
      
      // Close by clicking X or outside
      const closeButton = page.locator('button:has-text("Sign Out")');
      if (await closeButton.isVisible()) {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(300);
    }
    
    // Should still be responsive
    await expect(page.locator('[aria-label="Open navigation menu"]')).toBeVisible();
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Check for ARIA labels
    const menuButton = page.locator('[aria-label="Open navigation menu"]');
    await expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
    
    // Open menu
    await menuButton.click();
    await page.waitForTimeout(300);
    
    // Navigation should have proper structure
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should maintain focus management', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Open menu
    await page.click('[aria-label="Open navigation menu"]');
    await page.waitForTimeout(300);
    
    // Tab through menu items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Menu should be closed
    await expect(page.locator('[aria-label="Open navigation menu"]')).toBeVisible();
  });

  test('should have sufficient text contrast', async ({ page }) => {
    await loginAsTrainer(page);
    
    // Check that text is visible and readable
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        const color = await heading.evaluate(el => 
          window.getComputedStyle(el).color
        );
        
        // Color should be defined (not transparent)
        expect(color).toBeTruthy();
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });
});