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
