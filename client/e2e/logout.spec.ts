import { expect, test } from '@playwright/test';

import { gotoDashboard } from './utils';

// Runs as the final project (after all other authenticated specs) because
// logging out nulls the user's refresh token server-side, invalidating the
// shared session for every other test context.
test.describe('Logout', () => {
  test('should log out and block access to the app', async ({ page }) => {
    await gotoDashboard(page);

    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Session is gone server-side; /app must bounce back to login
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });
});
