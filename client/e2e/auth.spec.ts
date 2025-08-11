import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your app
    await page.goto('/');
  });

  test('should display landing page for unauthenticated users', async ({
    page,
  }) => {
    // Check if landing page is shown
    await expect(page).toHaveTitle(/codown/i);

    // Todo:
    // // Check for login/register buttons or links
    // const loginButton = page.getByRole('link', { name: /login/i });
    // const registerButton = page.getByRole('link', {
    //   name: /register|sign up/i,
    // });

    // await expect(loginButton).toBeVisible();
    // await expect(registerButton).toBeVisible();

    // Check for CTA Button
    const CTA = page.getByRole('button', { name: 'Get Started Now' });
    await expect(CTA).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started Now' }).click();

    // await page.getByRole('link', { name: /login/i }).click();

    // Wait for navigation and check URL
    await expect(page).toHaveURL(/.*\/login/);

    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /login|sign in/i }),
    ).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /register|sign up/i }).click();

    // Wait for navigation and check URL
    await expect(page).toHaveURL(/.*\/register/);

    // Check for register form elements
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

    // Try to submit empty form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Check for validation errors
    const errorMessage = page.getByText(/required|invalid|error/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should handle login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form (use test credentials)
    await page.getByLabel(/email/i).fill('ali@mail.com');
    await page.getByLabel(/password/i).fill('secure1234');

    // Submit form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Check for successful login (adjust based on your app's behavior)
    await expect(page).toHaveURL(/.*\/app/);

    // Check for user menu or logout button
    await page.getByRole('button', { name: /user menu/i }).click();

    // Now check for Logout
    await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible();
  });
});
