import { expect, test } from '@playwright/test';

import {
  createTestDocument,
  getDocumentCard,
  gotoDashboard,
  openDocumentMenu,
} from './utils';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
  });

  test('should display dashboard with document list', async ({ page }) => {
    // Check for controls in header
    await expect(page.getByLabel(/sort/i)).toBeVisible();
    await expect(page.getByLabel(/new document/i)).toBeVisible();

    // Check for document list or empty state
    const documentList = page.getByTestId('document-list');
    const emptyState = page.getByText(/It's empty in here/i);

    await expect(documentList.or(emptyState)).toBeVisible();
  });

  test('should create new document', async ({ page }) => {
    const docTitle = `Test Document ${Date.now()}`;

    await page.getByLabel(/new document/i).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Document Title').fill(docTitle);
    await dialog.getByRole('button', { name: /create/i }).click();

    await expect(dialog).not.toBeVisible();

    await expect(getDocumentCard(page, docTitle)).toBeVisible();
  });

  test('should delete new document', async ({ page }) => {
    const docTitle = `Delete Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    await openDocumentMenu(page, docTitle);
    await page.getByRole('menuitem', { name: /delete/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /delete/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(getDocumentCard(page, docTitle)).toHaveCount(0);
  });

  test('should open document in view mode', async ({ page }) => {
    const docTitle = `View Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    await openDocumentMenu(page, docTitle);
    await page.getByRole('menuitem', { name: /open in view mode/i }).click();

    await expect(page).toHaveURL(/.*\/doc\/.+/);
  });

  test('should copy document link', async ({ page }) => {
    const docTitle = `Copy Link Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    await openDocumentMenu(page, docTitle);
    await page.getByRole('menuitem', { name: /copy ?link/i }).click();

    // The menu item text changes to "Link copied!" on success
    await expect(page.getByText(/link copied/i)).toBeVisible();
  });

  test('should rename document', async ({ page }) => {
    const originalTitle = `Rename Test Document ${Date.now()}`;
    const newTitle = `Renamed Test Document ${Date.now()}`;

    await createTestDocument(page, originalTitle);

    await openDocumentMenu(page, originalTitle);
    await page.getByRole('menuitem', { name: /rename/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const titleInput = dialog.getByLabel('Document Title');
    await titleInput.fill(newTitle);
    await dialog.getByRole('button', { name: /^rename$/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(getDocumentCard(page, newTitle)).toBeVisible();
    await expect(getDocumentCard(page, originalTitle)).toHaveCount(0);
  });

  test('should switch between grid and row view', async ({ page }) => {
    const container = page.getByTestId('document-list');

    await expect(container).toHaveClass(/document-grid/);

    await page.getByRole('radio', { name: 'Row view' }).click();
    await expect(container).toHaveClass(/document-list/);

    await page.getByRole('radio', { name: 'Grid view' }).click();
    await expect(container).toHaveClass(/document-grid/);
  });

  test('should sort documents', async ({ page }) => {
    // Created first, so it is the OLDER of the two but sorts first A->Z
    const titleA = `AAA Sort Doc ${Date.now()}`;
    // Created second: NEWER, but sorts last A->Z. Relative order of these two
    // is asserted (not global order) so concurrent tests cannot interfere.
    const titleB = `MMM Sort Doc ${Date.now()}`;

    await createTestDocument(page, titleA);
    await createTestDocument(page, titleB);

    const positionOf = async (title: string) =>
      page.getByTestId('document-list').evaluate((list, t) => {
        return Array.from(list.children).findIndex((el) =>
          el.textContent?.includes(t as string),
        );
      }, title);

    await page.getByRole('button', { name: 'sort', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'New To Old' }).click();

    let [posA, posB] = await Promise.all([
      positionOf(titleA),
      positionOf(titleB),
    ]);
    expect(posB).toBeLessThan(posA); // newer (MMM) first

    await page.getByRole('button', { name: 'sort', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'A to Z' }).click();

    [posA, posB] = await Promise.all([positionOf(titleA), positionOf(titleB)]);
    expect(posA).toBeLessThan(posB); // AAA first

    await page.getByRole('button', { name: 'sort', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Z to A' }).click();

    [posA, posB] = await Promise.all([positionOf(titleA), positionOf(titleB)]);
    expect(posB).toBeLessThan(posA); // MMM first
  });
});
