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

  /**
   * Decode the permission claim from a share-link JWT.
   */
  function tokenPermission(shareUrl: string): string {
    const token = new URL(shareUrl).pathname.split('/').pop() ?? '';
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    );
    return payload.permission;
  }

  test('should copy an edit-mode link right after switching permission', async ({
    page,
  }) => {
    // Slow down share-link responses so the copy lands while the
    // post-switch refetch is still in flight (exposes stale-link races)
    await page.route('**/share-link*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await openShareMenu(page); // initial view-mode link loaded

    const menu = page.getByRole('menu');
    await menu.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Edit mode' }).click();

    const copyButton = menu.getByRole('button').first();
    await expect(copyButton).toBeEnabled();
    await copyButton.click({ force: true }); // skip radix open-animation checks

    await expect(page.getByRole('status')).toContainText(/cop{2}ied|copied/i);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(clipboard).pathname).toContain('/app/doc/share/');
    // The copied token must match the newly selected mode, not the previous one
    expect(tokenPermission(clipboard)).toBe('edit');
  });

  test('should not keep a copyable link after a failed refetch', async ({
    page,
  }) => {
    // Only the post-switch edit fetch fails; earlier view fetches
    // (including StrictMode's dev double-invoke) succeed
    await page.route('**/share-link*', async (route) => {
      if (route.request().url().includes('permission=edit')) {
        return route.abort('connectionrefused');
      }
      return route.continue();
    });

    await openShareMenu(page); // view link loaded, copy enabled

    const menu = page.getByRole('menu');
    await menu.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Edit mode' }).click();

    // The failed edit fetch must invalidate the old view link entirely:
    // nothing copyable, and no view URL displayed under an "Edit mode" select
    await expect(menu.getByText('Failed to fetch share link')).toBeVisible();
    await expect(menu.locator('p').first()).toHaveText(/No link available/);
    await expect(menu.getByRole('button').first()).toBeDisabled();

    // Recovery: switching back to View (not intercepted) must clear the
    // error and restore a working, copyable link without a page reload
    await menu.getByRole('combobox').click();
    await page.getByRole('option', { name: 'View mode' }).click();

    const recoveredLink = menu.locator('p').first();
    await expect(recoveredLink).toHaveText(/\/app\/doc\/share\/\S+/);
    await expect(menu.getByText('Failed to fetch share link')).toBeHidden();
    const recoveredCopy = menu.getByRole('button').first();
    await expect(recoveredCopy).toBeEnabled();
    await recoveredCopy.click({ force: true }); // skip radix open-animation checks
    const clipboardAfterRecovery = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(tokenPermission(clipboardAfterRecovery)).toBe('view');
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
