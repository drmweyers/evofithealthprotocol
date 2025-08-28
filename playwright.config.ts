import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * 
 * Focused E2E testing with essential browser coverage
 * Optimized for HealthProtocol application testing
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './test/e2e',
  
  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  
  /* Reporting */
  reporter: 'html',
  
  /* Global test settings */
  use: {
    baseURL: 'http://localhost:3501',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // webServer disabled - using existing running server
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3501',
  //   reuseExistingServer: !process.env.CI,
  // },
});