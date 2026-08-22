import { defineConfig, devices } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'on-failure' }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/test-configuration. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Keep video only when a test fails */
    video: 'retain-on-failure',

    /* Run in headless mode */
    headless: true,
  },

  /* Configure projects for major browsers.
   *
   * Order matters: logging in overwrites the user's single stored refresh
   * token (server-side), which invalidates every previously-issued session,
   * and logging out nulls it entirely. The unauthenticated auth specs
   * (which perform a real login) therefore run BEFORE the setup project saves
   * the storageState, the authenticated specs run against that shared session,
   * and the logout spec runs LAST. Token refresh itself does not rotate the
   * stored token, so those tests can safely run in parallel. */
  projects: [
    {
      name: 'auth-specs',
      testMatch: /auth\.spec\.ts/,
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['auth-specs'],
    },
    {
      name: 'chromium',
      testMatch: /(dashboard|editor|sharing)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        /* Tests run as the authenticated test user (see auth.setup.ts). */
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
    {
      /* Multi-client tests (second browser context + registrations) are the
       * heaviest specs; they run in their own serialized stage to avoid
       * competing with the single-client tests for server/worker resources. */
      name: 'collaboration-specs',
      testMatch: /collaboration\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['chromium'],
    },
    {
      /* Must run after every other authenticated spec: logging out nulls the
       * user's refresh token server-side and invalidates the shared session. */
      name: 'logout-specs',
      testMatch: /logout\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['collaboration-specs'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm --dir .. dev',
    url: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
