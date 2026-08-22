import { expect, test, type Page } from '@playwright/test';

import { createTestDocument, getDocumentCard } from './utils';

const MARKDOWN = '# Hello E2E\n\nSome *emphasis* text.';

async function openInEditor(page: Page, title: string) {
  await getDocumentCard(page, title).first().click();
  await expect(page).toHaveURL(/.*\/app\/doc\/.+/);
  // Editor mounts after data fetch + websocket connect; allow headroom when
  // the suite runs in parallel against one server
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10_000 });
}

test.describe('Document Editor', () => {
  let docTitle: string;

  test.beforeEach(async ({ page }) => {
    // Authenticated via storageState (see auth.setup.ts)
    docTitle = `Editor Test Doc ${Date.now()}`;
    await createTestDocument(page, docTitle);
    await openInEditor(page, docTitle);
  });

  test('should open document in edit mode with markdown editor', async ({
    page,
  }) => {
    await expect(page.locator('.cm-editor .cm-content')).toBeEditable();
  });

  test('should persist typed content across reload', async ({ page }) => {
    await page.locator('.cm-content').first().click();
    await page.keyboard.type(MARKDOWN);

    // Give the Yjs websocket a moment to flush updates to the server
    await page.waitForTimeout(1500);

    await page.reload();
    await expect(page.locator('.cm-editor')).toBeVisible();

    await expect(
      page.locator('.cm-content').getByText('Hello E2E'),
    ).toBeVisible();
    await expect(
      page.locator('.cm-content').getByText('Some *emphasis* text.'),
    ).toBeVisible();
  });

  test('should render preview from typed markdown', async ({ page }) => {
    await page.locator('.cm-content').first().click();
    await page.keyboard.type(MARKDOWN);
    await page.waitForTimeout(1000);

    await page.getByRole('radio', { name: 'Preview only view' }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: 'Hello E2E' }),
    ).toBeVisible();
    await expect(page.locator('.cm-editor')).toHaveCount(0);
  });

  test('should show editor and preview side by side in split mode', async ({
    page,
  }) => {
    await page.locator('.cm-content').first().click();
    await page.keyboard.type(MARKDOWN);

    await page.getByRole('radio', { name: /Split view/i }).click();

    // Both panes render simultaneously in split mode
    await expect(page.locator('.cm-editor')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hello E2E' }),
    ).toBeVisible();
  });
});
