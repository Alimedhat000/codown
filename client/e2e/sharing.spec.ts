import { expect, test, type Page } from '@playwright/test';

import { createTestDocument, getDocumentCard } from './utils';

test.describe('Document Sharing', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test.beforeEach(async ({ page }) => {
    // Authenticated via storageState (see auth.setup.ts)
    const docTitle = `Share Test Doc ${Date.now()}`;
    await createTestDocument(page, docTitle);
    await getDocumentCard(page, docTitle).first().click();
    await expect(page).toHaveURL(/.*\/app\/doc\/.+/);
  });

  /**
   * Open the share dialog for the current document.
   */
  async function openShareMenu(page: Page) {
    await page.getByRole('button', { name: 'Share' }).click();

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Server-generated links currently omit the port (e.g. http://localhost/...),
    // so navigate by pathname against the test baseURL instead of the raw URL.
    const linkEl = menu.locator('p').first();
    await expect(linkEl).toHaveText(/\/app\/doc\/share\/\S+/);

    return new URL((await linkEl.textContent()) ?? '').pathname;
  }

  test('should generate a share link', async ({ page }) => {
    const sharePath = await openShareMenu(page);
    expect(sharePath).toContain('/app/doc/share/');
  });

  test('should copy the share link to clipboard with a toast', async ({
    page,
  }) => {
    const sharePath = await openShareMenu(page);

    const menu = page.getByRole('menu');
    const copyButton = menu.getByRole('button').first();
    await expect(copyButton).toBeEnabled();
    await copyButton.click({ force: true }); // skip radix open-animation checks

    // Toast renders both a visible div and an sr-only role="status" copy;
    // assert on the status element (tolerates the app's "Coppied" typo)
    await expect(page.getByRole('status')).toContainText(/cop{2}ied|copied/i);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(clipboard).pathname).toBe(sharePath);
  });

  test('should grant access through the share link', async ({ page }) => {
    const sharePath = await openShareMenu(page);

    // The share route resolves the token then redirects to the document
    await page.goto(sharePath);
    await expect(page).toHaveURL(/.*\/app\/doc\/[^/]+$/, { timeout: 10_000 });
  });

  test('should show an error state for a malformed share link', async ({
    page,
  }) => {
    await page.goto('/app/doc/share/not-a-real-token');

    // Server rejects the token (401) and the route renders its error card
    // instead of redirecting to a document
    await expect(page.getByText(/went wrong accessing|invalid/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/.*\/doc\/share\//);
  });
});
