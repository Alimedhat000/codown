import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'testpassword');
  });

  test('should display dashboard with document list', async ({ page }) => {
    await page.goto('/app');

    // Check dashboard elements
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();

    // Check for controls in header
    await expect(page.getByLabel(/sort/i)).toBeVisible();
    await expect(page.getByLabel(/new document/i)).toBeVisible();

    // Check for document list or empty state
    const documentList = page.getByTestId('document-list');
    const emptyState = page.getByText(/It's empty in here/i);

    // Either documents exist or empty state is shown
    await expect(documentList.or(emptyState)).toBeVisible();
  });

  test('should create new document', async ({ page }) => {
    await page.goto('/app');

    const docTitle = `Test Document ${Date.now()}`;

    // Click new document button
    await page.getByLabel(/new document/i).click();
    // Wait for modal to be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/document title/i).fill(docTitle);
    await page.getByRole('button', { name: /create|save/i }).click();

    // Wait for modal to close and document to appear
    await expect(page.getByRole('dialog')).not.toBeVisible();

    const newDocItem = page.locator(`text="${docTitle}"`).first();

    await expect(newDocItem).toBeVisible();
  });

  test('should delete new document', async ({ page }) => {
    await page.goto('/app');

    const docTitle = `Delete Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    // Find and delete the document
    const documentCard = page
      .locator(`text="${docTitle}"`)
      .locator('..')
      .locator('..');
    await documentCard.getByLabel(/options/i).click();

    // Wait for dropdown menu to be visible
    await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Handle confirmation modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /delete|confirm|yes/i }).click();

    // Wait for modal to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify document is no longer visible
    await expect(page.locator(`text="${docTitle}"`)).toHaveCount(0);
  });

  test('should open document in view mode', async ({ page }) => {
    await page.goto('/app');

    // Create a document to view
    const docTitle = `View Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    // Find and open document in view mode
    const documentCard = page
      .locator(`text="${docTitle}"`)
      .locator('..')
      .locator('..');
    await documentCard.getByLabel(/options/i).click();

    await page.getByRole('menuitem', { name: /open in view mode/i }).click();

    // Verify navigation to document page in view mode
    await expect(page).toHaveURL(/.*\/doc\/.+/);
    // You might also check for view-mode specific indicators
  });

  test('should copy document link', async ({ page }) => {
    await page.goto('/app');

    // Create a document to copy link
    const docTitle = `Copy Link Test Document ${Date.now()}`;
    await createTestDocument(page, docTitle);

    // Find document and copy link
    const documentCard = page
      .locator(`text="${docTitle}"`)
      .locator('..')
      .locator('..');
    await documentCard.getByLabel(/options/i).click();

    await page.getByRole('menuitem', { name: /copy link|copylink/i }).click();

    // Verify success feedback (the text changes to "Link copied!")
    await expect(page.getByText(/link copied/i)).toBeVisible();
  });

  test('should rename document', async ({ page }) => {
    await page.goto('/app');

    // Create a document to rename
    const originalTitle = `Rename Test Document ${Date.now()}`;
    const newTitle = `Renamed Test Document ${Date.now()}`;

    await createTestDocument(page, originalTitle);

    // Find and rename the document
    const documentCard = page
      .locator(`text="${originalTitle}"`)
      .locator('..')
      .locator('..');
    await documentCard.getByLabel(/options/i).click();

    await page.getByRole('menuitem', { name: /rename/i }).click();

    // Handle rename modal
    await expect(page.getByRole('dialog')).toBeVisible();
    const titleInput = page.getByRole('textbox', { name: /title|name/i });
    await titleInput.clear();
    await titleInput.fill(newTitle);
    await page.getByRole('button', { name: /save|update|rename/i }).click();

    // Wait for modal to close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify new title appears and old title is gone
    await expect(page.locator(`text="${newTitle}"`)).toBeVisible();
    await expect(page.locator(`text="${originalTitle}"`)).toHaveCount(0);
  });

  test('should switch between grid and list view', async ({ page }) => {
    await page.goto('/app');

    // Assume you have view toggle buttons
    const gridViewButton = page.getByRole('button', { name: /grid/i });
    const listViewButton = page.getByRole('button', { name: /list/i });

    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      // await page.waitForTimeout(500);
      // Check that list view is active
      await expect(page.locator('.document-list')).toBeVisible();
    }

    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      // await page.waitForTimeout(500);
      // Check that grid view is active (adjust selector based on your implementation)
      await expect(page.locator('.document-grid')).toBeVisible();
    }
  });
});

// Helper function for authentication
async function loginAsUser(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  // Wait for successful login (adjust based on your app)
  await page.waitForURL(/.*\/app/);
}

async function createTestDocument(page: any, title: string) {
  await page.getByLabel(/new document/i).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel(/document title/i).fill(title);
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();

  // Wait for document to appear in list
  await expect(page.locator(`text="${title}"`)).toBeVisible();
}
