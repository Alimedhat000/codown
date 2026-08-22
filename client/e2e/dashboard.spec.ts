import { expect, test, type Page } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');

    // Authenticated via storageState (see auth.setup.ts)
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();
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
});

function getDocumentCard(page: Page, title: string) {
  return page.getByRole('link').filter({ hasText: title });
}

async function openDocumentMenu(page: Page, title: string) {
  const card = getDocumentCard(page, title);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'options' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

async function createTestDocument(page: Page, title: string) {
  await page.getByLabel(/new document/i).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Document Title').fill(title);
  await dialog.getByRole('button', { name: /create/i }).click();
  await expect(dialog).not.toBeVisible();

  await expect(getDocumentCard(page, title)).toBeVisible();
}
