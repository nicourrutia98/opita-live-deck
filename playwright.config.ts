import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['html', { open: 'never' }], ['list']],

  projects: [
    // Local Testing
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: '**/prod/**',
      retries: 0,
      timeout: 30_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
      },
    },
    // Production Testing (E2E Driven Debugging)
    {
      name: 'prod-e2e',
      testDir: './tests/prod',
      retries: 1,
      timeout: 60_000,
      use: {
        ...devices['Desktop Chrome'],
        // Fallback to our new S3 Bucket
        baseURL: process.env.TEST_FRONTEND_BASE || 'http://opita-live-deck-prod-2026.s3-website-us-east-1.amazonaws.com',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],

  webServer: {
    command: 'npm run preview -- --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
