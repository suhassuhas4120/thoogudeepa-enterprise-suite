import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E & Multi-Persona Simulation Configuration
 * Thoogudeepa Enterprise Suite
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  fullyParallel: false, // Run in sequence so multi-device restaurant simulation state stays deterministic
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3001',
    trace: 'on', // Capture full step-by-step DOM snapshots and network calls
    video: 'on', // Record WebM videos of every simulation session
    screenshot: 'on', // Capture high-res screenshot of final state and any assertions
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
  },
  projects: [
    {
      name: 'Restaurant Simulation (Chromium)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1400, height: 900 },
      },
    },
    {
      name: 'Customer Mobile (iPhone 14)',
      use: {
        ...devices['iPhone 14'],
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'Kitchen & Waiter Tablet (iPad Gen 7)',
      use: {
        ...devices['iPad (gen 7)'],
        defaultBrowserType: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});
