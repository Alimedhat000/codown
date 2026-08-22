import { expect, type Page } from '@playwright/test';

export function getDocumentCard(page: Page, title: string) {
  return page.getByRole('link').filter({ hasText: title });
}

export async function openDocumentMenu(page: Page, title: string) {
  const card = getDocumentCard(page, title);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'options' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

export async function createTestDocument(page: Page, title: string) {
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByLabel(/new document/i).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Document Title').fill(title);
  await dialog.getByRole('button', { name: /create/i }).click();
  await expect(dialog).not.toBeVisible();

  await expect(getDocumentCard(page, title)).toBeVisible();
}

export async function openDocumentEditor(page: Page, title: string) {
  await createTestDocument(page, title);
  await getDocumentCard(page, title).first().click();
  await expect(page).toHaveURL(/.*\/app\/doc\/.+/);
}

// Server-generated links currently omit the port (e.g. http://localhost/...),
// so navigate by pathname against the test baseURL instead of the raw URL.
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
