import { expect, test as setup } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page).toHaveURL(/.*\/app/);
  await page.context().storageState({ path: AUTH_FILE });
});
