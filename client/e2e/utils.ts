import { expect, type Page } from '@playwright/test';

/**
 * Locate a document card link by its title.
 */
export function getDocumentCard(page: Page, title: string) {
  return page.getByRole('link').filter({ hasText: title });
}

/**
 * Open a document card's action dropdown.
 */
export async function openDocumentMenu(page: Page, title: string) {
  const card = getDocumentCard(page, title);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'options' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

/**
 * Navigate to /app and ensure the dashboard is visible.
 * Resilient to refresh-token rotation: if the shared storageState's
 * refresh token was already rotated by a previous test (multi-device
 * sessions now rotate on refresh), the first goto will land on /login.
 * In that case, re-login via the UI and continue.
 */
export async function gotoDashboard(page: Page) {
  await page.goto('/app');
  const dashboard = page.getByRole('heading', { name: 'Dashboard' });
  try {
    await expect(dashboard).toBeVisible({ timeout: 2_000 });
  } catch {
    // Session from shared storageState was rotated — re-authenticate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await expect(page).toHaveURL(/.*\/app/);
    await expect(dashboard).toBeVisible();
  }
}

/**
 * Create a document end-to-end from the dashboard.
 */
export async function createTestDocument(page: Page, title: string) {
  await gotoDashboard(page);

  await page.getByLabel(/new document/i).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Document Title').fill(title);
  await dialog.getByRole('button', { name: /create/i }).click();
  await expect(dialog).not.toBeVisible();

  await expect(getDocumentCard(page, title)).toBeVisible();
}

/**
 * Create a document and open it in the editor.
 */
export async function openDocumentEditor(page: Page, title: string) {
  await createTestDocument(page, title);
  await getDocumentCard(page, title).first().click();
  await expect(page).toHaveURL(/.*\/app\/doc\/.+/);
}

// Server-generated links currently omit the port (e.g. http://localhost/...),
// so navigate by pathname against the test baseURL instead of the raw URL.
/**
 * Extract the share-link path from the share dialog, rebased onto the test baseURL.
 */
export async function getSharePath(
  page: Page,
  permission?: 'view' | 'edit',
): Promise<string> {
  await page.getByRole('button', { name: 'Share' }).click();

  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();

  if (permission) {
    const label = permission === 'view' ? 'View mode' : 'Edit mode';
    await menu.getByRole('combobox').click();
    await page.getByRole('option', { name: label }).click();
    // Link token is regenerated for the new permission
    await page.waitForTimeout(500);
  }

  const linkEl = menu.locator('p').first();
  await expect(linkEl).toHaveText(/\/app\/doc\/share\/\S+/);

  const sharePath = new URL((await linkEl.textContent()) ?? '').pathname;
  await page.keyboard.press('Escape'); // close the menu
  return sharePath;
}
