import { expect, test } from '@playwright/test';

// These tests cover the unauthenticated flows; they run without a saved
// session (see the 'auth-specs' project in playwright.config.ts).
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page for unauthenticated users', async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/codown/i);

    const CTA = page.getByRole('button', { name: 'Get Started Now' });
    await expect(CTA).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started Now' }).click();

    await expect(page).toHaveURL(/.*\/login/);

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /login|sign in/i }),
    ).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /register|sign up/i }).click();

    await expect(page).toHaveURL(/.*\/register/);

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /register|sign up|create account/i }),
    ).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /login|sign in/i }).click();

    const errorMessage = page.getByText(/required|invalid|error/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should handle login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Seeded by server/scripts/seed-test-user.ts (see `pnpm --filter server seed:test`)
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword');

    await page.getByRole('button', { name: /login|sign in/i }).click();

    await expect(page).toHaveURL(/.*\/app/);

    await page.getByRole('button', { name: /user menu/i }).click();
    await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible();
  });

  test('should register a new account and redirect to login', async ({
    page,
  }) => {
    const suffix = Date.now();
    await page.goto('/register');

    await page.getByLabel('Email').fill(`e2e-${suffix}@test.local`);
    await page.getByLabel('Username').fill(`e2e_${suffix}`);
    await page.getByLabel('Full Name').fill('E2E Registered User');
    await page.getByLabel('Password').fill('e2epassword');

    await page
      .getByRole('button', { name: /create account|register|sign up/i })
      .click();

    // Registration succeeds -> the app sends the user to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('should reject registration with an existing email', async ({
    page,
  }) => {
    await page.goto('/register');

    const suffix = Date.now();
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Username').fill(`e2edup${suffix}`);
    await page.getByLabel('Full Name').fill('E2E Duplicate User');
    await page.getByLabel('Password').fill('e2epassword');

    await page
      .getByRole('button', { name: /create account|register|sign up/i })
      .click();

    await expect(page.getByText(/already exists|failed/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
