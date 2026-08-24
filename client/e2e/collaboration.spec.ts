import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

import { getSharePath, openDocumentEditor } from './utils';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:5000';

// The second user is created via the API: the registration form is already
// covered by auth.spec.ts and proved flaky to drive from a second context.
/**
 * Register a throwaway second user via the API for collaboration specs.
 */
async function createUserViaApi(requestCtx: APIRequestContext, suffix: number) {
  const res = await requestCtx.post(`${API_URL}/api/auth/register`, {
    data: {
      email: `e2e-${suffix}@test.local`,
      username: `e2e_${suffix}`,
      fullName: 'E2E Collaborator',
      password: 'e2epassword',
    },
  });
  if (res.status() === 409) return; // leftover from a partial previous run
  expect(res.status()).toBe(201);
}

/**
 * Log the second user in through the login UI.
 */
async function loginUser2(page: Page, suffix: number) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(`e2e-${suffix}@test.local`);
  await page.getByLabel(/password/i).fill('e2epassword');
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await expect(page).toHaveURL(/.*\/app/, { timeout: 10_000 });
}

// Owner resolves the pending request from the Share menu. The hook fetching
// join requests runs once on mount (no polling), so the page is reloaded first.
/**
 * Owner approves or rejects a pending collaboration request via the UI.
 */
async function resolvePendingRequest(
  page: Page,
  username: string,
  action: 'approve' | 'reject',
) {
  await page.reload();
  await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Share' }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();

  const row = menu.locator('div.rounded-md').filter({ hasText: username });
  await expect(row).toBeVisible();

  // First button is the green approve, second the red reject
  const buttons = row.getByRole('button');
  await (action === 'approve' ? buttons.first() : buttons.nth(1)).click();

  await expect(row).toHaveCount(0); // removed from the list after resolution
  await page.keyboard.press('Escape');
}

// Types into one client's editor and expects the text to appear in the
// other client's editor. Retried because a CodeMirror remount (awareness
// updates, provider reconnect) can swallow a click's focus, dropping the
// whole keystroke burst.
/**
 * Type into one client and wait for the text to appear in the other.
 */
async function typeAndSync(from: Page, to: Page, text: string) {
  const content = from.locator('.cm-content').first();
  for (let attempt = 0; attempt < 3; attempt++) {
    await content.click();
    await expect(content).toBeFocused();
    await from.keyboard.type(text);

    try {
      // Input accepted locally AND propagated over the websocket
      await expect(
        from.locator('.cm-content').getByText(text).first(),
      ).toBeVisible({ timeout: 5_000 });
      await expect(
        to.locator('.cm-content').getByText(text).first(),
      ).toBeVisible({ timeout: 15_000 });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

test.describe.serial('Multi-user Collaboration', () => {
  // Two clients, registrations and an approval round-trip: well over the
  // default 30s budget
  test.setTimeout(120_000);

  let userSuffix: number;
  let username: string;

  test.beforeEach(async () => {
    userSuffix = Date.now() + Math.floor(Math.random() * 1000);
    username = `e2e_${userSuffix}`;
  });

  test('join request, approval and access via share link', async ({
    page,
    browser,
  }) => {
    const docTitle = `Collab Access Doc ${Date.now()}`;
    await openDocumentEditor(page, docTitle);
    const sharePath = await getSharePath(page, 'view');

    // Second client registers, logs in and hits the share link.
    // NOTE: explicitly wipe storageState — this Playwright version seeds
    // manually-created contexts with the project's storageState otherwise.
    const ctx2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const p2 = await ctx2.newPage();
    await createUserViaApi(p2.request, userSuffix);
    await loginUser2(p2, userSuffix);
    await p2.goto(sharePath);

    // Not a collaborator yet -> request submitted, no access
    await expect(p2.getByText(/waiting for approval/i)).toBeVisible();

    // Owner sees the request and approves it
    await resolvePendingRequest(page, username, 'approve');

    // Collaborator now gets through
    await p2.goto(sharePath);
    await expect(p2).toHaveURL(/.*\/app\/doc\/[^/]+$/, { timeout: 15_000 });
    await expect(p2.getByText(docTitle).first()).toBeVisible();

    await ctx2.close();
  });

  test('live co-editing after edit-permission approval', async ({
    page,
    browser,
  }) => {
    const docTitle = `Collab Edit Doc ${Date.now()}`;
    await openDocumentEditor(page, docTitle);
    const sharePath = await getSharePath(page, 'edit');

    // Second client joins with edit permission (explicitly clean context,
    // see note in the test above)
    const ctx2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const p2 = await ctx2.newPage();
    await createUserViaApi(p2.request, userSuffix);
    await loginUser2(p2, userSuffix);
    await p2.goto(sharePath);
    await expect(p2.getByText(/waiting for approval/i)).toBeVisible();

    await resolvePendingRequest(page, username, 'approve');

    await p2.goto(sharePath);
    await expect(p2).toHaveURL(/.*\/app\/doc\/[^/]+$/, { timeout: 15_000 });
    await expect(p2.locator('.cm-editor')).toBeVisible({ timeout: 10_000 });

    // Owner types; the update must reach the second client over websocket
    const ownerText = `Owner typed this at ${Date.now()}`;
    await typeAndSync(page, p2, ownerText);

    // And back the other way
    const collabText = `Collaborator replied at ${Date.now()}`;
    await typeAndSync(p2, page, collabText);

    await ctx2.close();
  });

  test('view-only collaborator cannot edit', async ({ page, browser }) => {
    const docTitle = `Collab Readonly Doc ${Date.now()}`;
    await openDocumentEditor(page, docTitle);
    const sharePath = await getSharePath(page, 'view');

    const ctx2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const p2 = await ctx2.newPage();
    await createUserViaApi(p2.request, userSuffix);
    await loginUser2(p2, userSuffix);
    await p2.goto(sharePath);
    await expect(p2.getByText(/waiting for approval/i)).toBeVisible();

    await resolvePendingRequest(page, username, 'approve');

    await p2.goto(sharePath);
    await expect(p2).toHaveURL(/.*\/app\/doc\/[^/]+$/, { timeout: 15_000 });
    await expect(p2.locator('.cm-editor')).toBeVisible({ timeout: 10_000 });

    // View permission -> CodeMirror rendered non-editable
    await expect(p2.locator('.cm-content').first()).toHaveAttribute(
      'contenteditable',
      'false',
    );

    // Typing must not insert anything into the collaborator's editor
    const intruderText = `This should never appear ${Date.now()}`;
    await p2.locator('.cm-content').first().click();
    await p2.keyboard.type(intruderText);
    await expect(p2.locator('.cm-content').getByText(intruderText)).toHaveCount(
      0,
    );

    await ctx2.close();
  });

  test('rejected join request denies document access', async ({
    page,
    browser,
  }) => {
    const docTitle = `Collab Reject Doc ${Date.now()}`;
    await openDocumentEditor(page, docTitle);
    const sharePath = await getSharePath(page, 'view');

    const ctx2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const p2 = await ctx2.newPage();
    await createUserViaApi(p2.request, userSuffix);
    await loginUser2(p2, userSuffix);
    await p2.goto(sharePath);
    await expect(p2.getByText(/waiting for approval/i)).toBeVisible();

    // Owner rejects; the request row disappears from their list
    await resolvePendingRequest(page, username, 'reject');

    // A rejected request blocks re-entry: still no access on retry
    await p2.goto(sharePath);
    await expect(p2).toHaveURL(/.*\/doc\/share\//);
    await expect(p2.getByText(/waiting for approval/i)).toBeVisible({
      timeout: 15_000,
    });

    await ctx2.close();
  });
});
