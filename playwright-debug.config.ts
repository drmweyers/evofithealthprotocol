import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  
  reporter: [['list']],
  
  use: {
    baseURL: 'http://localhost:3500',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
  
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        headless: false,
        slowMo: 1000,
        viewport: { width: 1920, height: 1080 },
        channel: 'chrome'
      },
    },
  ],
  
  // No global setup/teardown for debugging
  
  outputDir: 'test-results/',
  
  expect: {
    timeout: 10000,
  }
});