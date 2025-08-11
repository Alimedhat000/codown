import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'test@example.com', 'testpassword');
  });

  test('should display dashboard with document list', async ({ page }) => {
    await page.goto('/app');

    // Check dashboard elements
    await expect(
      page.getByRole('heading', { name: /dashboard|documents/i }),
    ).toBeVisible();

    // Check for document list or empty state
    const documentList = page.getByTestId('document-list');
    const emptyState = page.getByText(/It's empty in here/i);

    // Either documents exist or empty state is shown
    await expect(documentList.or(emptyState)).toBeVisible();
  });

  test('should create new document and delete it', async ({ page }) => {
    await page.goto('/app');

    const docTitle = 'Test Document';

    // Click new document button
    await page.getByLabel(/new document/i).click();
    await page.getByLabel(/document title/i).fill(docTitle);
    await page.getByRole('button', { name: /create|save/i }).click();
    const newDocItem = page
      .locator(`.document-item:has-text("${docTitle}")`)
      .first();
    await expect(newDocItem).toBeVisible();

    // Delete the document
    await newDocItem.getByLabel(/options/i).click();
    await page.getByRole('menuitem', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Verify document is no longer visible
    await expect(
      page.locator(`.document-item:has-text("${docTitle}")`),
    ).toHaveCount(0);
  });

  test('should switch between grid and list view', async ({ page }) => {
    await page.goto('/app');

    // Assume you have view toggle buttons
    const gridViewButton = page.getByRole('button', { name: /grid/i });
    const listViewButton = page.getByRole('button', { name: /list/i });

    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      // Check that list view is active
      await expect(page.locator('.document-list')).toBeVisible();
    }

    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
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
