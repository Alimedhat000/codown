# Client Quality Initiative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize client structure, enforce JSDoc via lint, achieve full Storybook state coverage with stories-as-tests, wired into CI.

**Architecture:** Seven-layer stacked PR flow managed by `gh-stack`, rooted on `develop`. Each layer is one PR; each task inside a layer is its own commit. Every layer ends green on local gates before the next begins.

**Tech Stack:** Storybook 9 + `@storybook/addon-vitest` (browser mode, Playwright chromium), vitest 3, ESLint flat config + `eslint-plugin-check-file` + `eslint-plugin-jsdoc` (only new dep, dev), plop, gh-stack.

**Spec:** `docs/superpowers/specs/2026-08-23-client-quality-design.md`

## Stack Layout

```
develop (trunk)
└── client-quality/docs        ← spec + this plan (PR1)
 └── client-quality/a-infra    ← CI filters, test wiring, plop (PR2)
  └── client-quality/b-structure   ← all renames/moves (PR3)
   └── client-quality/c-rules   ← naming rule flip + jsdoc warn (PR4)
    └── client-quality/d-seams  ← JSDoc backfill + error fields + D6 (PR5)
     └── client-quality/e-stories  ← decorators + stories + play tests (PR6)
      └── client-quality/f-ci   ← CI revert, AGENTS.md, ADR 0001 (PR7)
```

Merge strictly bottom-up via `gh stack merge <pr-number> --yes`; never plain `gh pr merge`.

## Global Constraints

- Directories PascalCase, files kebab-case (all `.ts`/`.tsx`)
- Feature layering untouched (`import/no-restricted-paths` zones stay as-is)
- No new runtime dependencies; sole new dev dependency: `eslint-plugin-jsdoc`
- No MSW/network mocking — story data via props and decorators
- All file moves via `git mv`
- Existing Playwright e2e must stay green throughout
- One task = one commit; D6 is isolated with its own e2e gate and drop-out policy
- Per-layer verification: `pnpm --filter client typecheck && pnpm --filter client build` minimum; plus `pnpm --filter client test` from Layer 1 onward; plus `pnpm lint` from Layer 3 onward

---

## Layer 0: `client-quality/docs`

### Task 0.1: Commit design spec ✅ (done — 34f7cd9)

### Task 0.2: Commit implementation plan

- [x] Write this document
- [ ] `git add docs/superpowers/plans/2026-08-23-client-quality.md && git commit -m "docs: client quality initiative implementation plan"`
- [ ] `gh stack submit --auto` → creates draft PR1 (docs)

---

## Layer 1: `client-quality/a-infra`

Create with: `gh stack add client-quality/a-infra`

### Task 1.1: Extend CI branch filters

**Files:** Modify `.github/workflows/lint-type-check.yml`, `.github/workflows/e2e.yml`

In both files, change the `on.pull_request.branches` and `on.push.branches` lists:

```yaml
branches: [main, develop, 'client-quality/**']
```

(Leave everything else untouched; removal of `'client-quality/**'` happens in Task 6.1.)

- [ ] Edit both workflows
- [ ] Commit: `ci: trigger workflows for stacked client-quality branches`

### Task 1.2: Wire the test runner

**Files:** Modify `client/package.json`, root `package.json`

- [ ] In `client/package.json` scripts add: `"test": "vitest run",`
- [ ] In root `package.json` scripts add: `"test:client": "pnpm --filter client test",` (joins the existing `run-p test:*` chain automatically)
- [ ] Local prerequisite (not committed): `pnpm exec playwright install chromium`
- [ ] Verify: `pnpm --filter client test` runs the existing 24 story files and passes
- [ ] Commit: `chore(client): wire vitest browser test runner`

### Task 1.3: Delete empty orphaned test

**Files:** Delete `client/src/lib/__tests__/api.test.tsx` (verified 0 lines) and the now-empty `__tests__/` dir

- [ ] Delete via `git rm client/src/lib/__tests__/api.test.tsx`
- [ ] Verify typecheck still green
- [ ] Commit: `chore(client): remove empty orphaned test file`

### Task 1.4: Plop templates emit compliant scaffolding

**Files:** Modify `client/generators/component/component.tsx.hbs`, `client/generators/component/component.stories.tsx.hbs`

New component template:

```hbs
/**
 * {{pascalCase name}} — TODO: one-line description of purpose.
 */
import React from 'react';

export interface {{pascalCase name}}Props {
  // define props
}

export const {{pascalCase name}} = ({}: {{pascalCase name}}Props) => {
  return <div>{{pascalCase name}} works!</div>;
};
```

Note: import order must satisfy the repo's `import/order` rule once real props exist; keep `React` import first-line external group as generated today.

New stories template:

```hbs
import type { Meta, StoryObj } from '@storybook/react-vite';

import { {{pascalCase name}} } from './{{kebabCase name}}';

const meta: Meta<typeof {{pascalCase name}}> = {
  title: '{{titlePath}}/{{pascalCase name}}',
  component: {{pascalCase name}},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof {{pascalCase name}}>;

export const Default: Story = {};

/*
Example interaction test:
import { expect } from 'storybook/test';
export const Clicked: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(/* assertion *\/).toHaveBeenCalled();
  },
};
*/
```

- [ ] Update both templates (keep `index.cjs` logic unchanged)
- [ ] Verify: `pnpm --filter client generate`, generate a throwaway component into Root, confirm shape, then discard the generated files before committing
- [ ] Commit: `chore(client): scaffold components with autodocs and jsdoc stubs`

---

## Layer 2: `client-quality/b-structure`

Create with: `gh stack add client-quality/b-structure`. Every task: `git mv` + fix imports + verify (`typecheck && build`). Commit per task.

### Task 2.1 (B1): Layouts → folder-per-component

| From | To |
|---|---|
| `src/components/layouts/AuthLayout.tsx` | `src/components/layouts/AuthLayout/auth-layout.tsx` + `AuthLayout/index.ts` |
| `src/components/layouts/ContentLayout.tsx` | `ContentLayout/content-layout.tsx` + index |
| `src/components/layouts/DashboardLayout.tsx` | `DashboardLayout/dashboard-layout.tsx` + index |
| `src/components/layouts/DocumentLayout.tsx` | `DocumentLayout/document-layout.tsx` + index |

index.ts content: `export { default } from './auth-layout';` (adjust per named/default export found on read). Fix any deep imports discovered via grep.

Commit: `refactor(client): folder-per-component for layouts`

### Task 2.2 (B2): context/auth normalization

| From | To |
|---|---|
| `src/context/auth/AuthContext.tsx` | `auth-context.tsx` |
| `src/context/auth/AuthProvider.tsx` | `auth-provider.tsx` |
| `src/context/auth/useAuth.tsx` | `use-auth.tsx` |

Update `context/auth/index.ts` re-export paths.

Commit: `refactor(client): kebab-case auth context files`

### Task 2.3 (B3): ui oddballs + Form/Input dissolution

1. `git mv src/components/ui/seo src/components/ui/Seo`; `git mv Seo/Head.tsx Seo/head.tsx`; create `Seo/index.ts`
2. `git mv src/components/ui/auth src/components/ui/Auth`
3. `git mv src/components/ui/Header/Header.stories.tsx …/header.stories.tsx`
4. **Dissolve `Form/Input/`:**
   - `git mv src/components/ui/Form/Input/input-field.tsx src/components/ui/Form/input.tsx`
   - `git mv src/components/ui/Form/Input/variants.ts src/components/ui/Form/variants.ts`
   - Delete `Form/Input/index.ts`; create `Form/index.ts`: `export * from './input';`
   - In `input.tsx`: `'../field-wrapper'` → `'./field-wrapper'`
   - In `input.stories.tsx`: `'./Input'` → `'./input'`
   - Update 3 external imports: `@/components/ui/Form/Input` → `@/components/ui/Form` (`NewDocumentFormBody.tsx`, `login-form.tsx`, `register-form.tsx`)
5. Audit `Seo/Auth/Header` internals for remaining PascalCase files (grep sweep must come back clean except intentionally-PascalCase dirs)

Verify + Storybook smoke test: `timeout 60 pnpm --filter client exec storybook --ci --smoke-test` (or equivalent headless boot check).

Commit: `refactor(client): normalize ui directory casing and dissolve Form/Input`

### Task 2.4 (B4): Feature fixes

1. `git mv src/features/Dashboard/components/DashBoardMain src/features/Dashboard/components/DashboardMain`
2. `git mv src/components/common/forms/NewDocumentFormBody.tsx src/components/common/NewDocumentFormBody/new-document-form-body.tsx` + `index.ts`; remove now-empty `common/forms/`; update 2 imports (`create-document-button.tsx`, `new-document-modal.tsx`) to barrel form `@/components/common/NewDocumentFormBody`

Commit: `refactor(client): fix DashboardMain casing, relocate shared NewDocumentFormBody`

### Task 2.5 (B5): Hooks renames (7 files, 6 verified import sites)

| From | To |
|---|---|
| `useAutoSave.ts` | `use-auto-save.ts` |
| `useCollab.ts` | `use-collab.ts` |
| `useCollaborators.ts` | `use-collaborators.ts` |
| `useDocument.ts` | `use-document.ts` |
| `useJoinRequests.ts` | `use-join-requests.ts` |
| `useMediaQuery.ts` | `use-media-query.ts` |
| `useShareLink.ts` | `use-share-link.ts` |

Import sites to update: `app/routes/app/document.tsx` (×2: useDocument, useMediaQuery), `features/…/DocumentMain/DocumentMain.tsx` (useCollab), `features/…/ShareButton/share-button.tsx` (×2: useJoinRequests, useShareLink), `features/…/CollaboratorsDropdown/collaborators-dropdown.tsx` (useCollaborators).

Commit: `refactor(client): kebab-case hook filenames`

### Task 2.6 (B6): DocumentMain subtree + leaf renames

| From (under `features/DocumentPage/components/DocumentMain/`) | To |
|---|---|
| `DocumentMain.tsx` | `document-main.tsx` |
| `MarkdownEditor/MarkdownEditor.tsx` | `markdown-editor.tsx` |
| `MarkdownEditor/EditorExtensions.ts` | `editor-extensions.ts` |
| `MarkdownEditor/EditorTheme.ts` | `editor-theme.ts` |
| `MarkdownEditor/KeyMapExtension.ts` | `key-map-extension.ts` |
| `MarkdownEditor/spellCheck.ts` | `spell-check.ts` |
| `MarkdownEditor/MarkdownStatusBar/useEditorStatus.ts` | `use-editor-status.ts` |
| `MarkdownEditor/MarkdownToolbar/useMarkdownCommands.tsx` | `use-markdown-commands.tsx` |
| `MarkdownPreview/MarkdownPreview.tsx` | `markdown-preview.tsx` |
| `MarkdownPreview/MermaidDiagram.tsx` | `mermaid-diagram.tsx` |
| `MarkdownPreview/remarkDecorations.tsx` | `remark-decorations.tsx` |
| `src/lib/rehypeCopyButton.ts` | `rehype-copy-button.ts` |
| `src/utils/generateUserColor.ts` | `generate-user-color.ts` |

Fix barrels (`DocumentMain/index.ts`, `MarkdownEditor/index.ts`, `MarkdownPreview/index.ts`), sibling relative imports (MermaidDiagram in MarkdownPreview.tsx, EditorExtensions/Theme/KeyMap/spellCheck in MarkdownEditor.tsx, FieldWrapper-style relative refs, `markdown-preview.stories.tsx` import), and any `@/lib/rehypeCopyButton` / `@/utils/generateUserColor` call sites (grep first).

Final sweep gate: `find client/src \( -name '*.ts' -o -name '*.tsx' \) | grep -E '/[A-Za-z]*[A-Z][A-Za-z]*(\.[a-z]+)*\.(ts|tsx)$'` must return nothing (middle-extension aware).

Commit: `refactor(client): kebab-case DocumentMain subtree and util filenames`

---

## Layer 3: `client-quality/c-rules`

Create with: `gh stack add client-quality/c-rules`

### Task 3.1: Naming rule flip + stale-ignore cleanup

**Modify `client/eslint.config.js`:**

```js
'check-file/filename-naming-convention': [
  'error',
  {
    '**/*.{ts,tsx}': 'KEBAB_CASE',
  },
  {
    ignoreMiddleExtensions: true,
  },
],
```

Remove `src/shared/**` from `ignores` (line ~17) and `--ignore-pattern src/shared` from `lint:fix`/`lint:ci` scripts in `client/package.json` (directory does not exist).

- [ ] Edits
- [ ] Verify: `pnpm --filter client lint` exits clean (proves Layer 2 completeness)
- [ ] Commit: `chore(client): enforce kebab-case filenames, drop stale shared ignores`

### Task 3.2: Add eslint-plugin-jsdoc (warn)

- [ ] `pnpm --filter client add -D eslint-plugin-jsdoc`
- [ ] Config additions:

```js
import jsdoc from 'eslint-plugin-jsdoc';
// plugins: { jsdoc }
// extends: jsdoc.configs['flat/recommended-typescript-flavor'] OR manual rules below
'jsdoc/require-jsdoc': ['warn', {
  require: { FunctionDeclaration: true, ClassDeclaration: true, ArrowFunctionExpression: false, FunctionExpression: false },
  contexts: ['ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'],
  exemptEmptyFunctions: true,
}],
'jsdoc/require-param': 'off',
```

Pragmatic target: every exported component/hook/util gets a JSDoc block; params documented only when non-obvious. Interim `warn` flips to `error` in Task 4.5.

- [ ] Verify: `pnpm lint` runs (warnings expected and acceptable until Layer 4 completes; `lint:ci` unaffected since root `pnpm lint` doesn't pass `--max-warnings 0`)
- [ ] Commit: `chore(client): add jsdoc lint rule (warn)`

---

## Layer 4: `client-quality/d-seams`

Create with: `gh stack add client-quality/d-seams`. Commits per batch; typecheck+build between each.

### Task 4.1: Dead code deletion

Delete commented refresh interceptor block (`client/src/lib/api.ts:11-17,27-55`).
Commit: `chore(client): remove dead token-refresh interceptor code`

### Task 4.2: Relocate bare API fns out of hooks file

Move `getJoinRequests` / `approveJoinRequest` / `rejectJoinRequest` from `hooks/use-join-requests.ts` into new `src/lib/join-requests-api.ts` (kebab, JSDoc'd); hook imports them internally. Grep for external callers first; update if any.
Commit: `refactor(client): split join-request api functions from hook`

### Task 4.3: Additive error fields on data hooks

For `use-document.ts`, `use-join-requests.ts`, `use-collaborators.ts`, `use-share-link.ts`: add `error: string | null` (set in catch, cleared on success) to state + return object. Purely additive — existing destructuring consumers unaffected.
Commit: `feat(client): expose error state from data hooks`

### Task 4.4: JSDoc backfill (batches, one commit per batch)

Order: ui primitives → Auth forms → layouts → context/auth → hooks → lib/utils → Dashboard features → DocumentPage features (~70 exports total). Each export gets a concise JSDoc block; props interface members documented when non-obvious; missing `tags: ['autodocs']` added to story metas on touch.

Suggested batch commits: `docs(client): jsdoc — <batch>`.

### Task 4.5: Flip jsdoc rule to error

Change `jsdoc/require-jsdoc` severity `warn` → `error`.
- [ ] `pnpm lint` fully clean
- [ ] Commit: `chore(client): enforce jsdoc rule`

### Task 4.6 (D6 — ISOLATED behavioral commit): Provider seam in useCollab

**Files:** Modify `hooks/use-collab.ts` ONLY.

Add optional provider factory parameter; default constructs `HocuspocusProvider` with `env.Socket_URL` exactly as today. Zero caller changes required.

```ts
import { HocuspocusProvider } from '@hocuspocus/provider';
// ...
export interface CollabProviderFactory {
  (options: { url: string; name: string; document: Y.Doc }): HocuspocusProvider;
}
const defaultProviderFactory: CollabProviderFactory = (opts) =>
  new HocuspocusProvider(opts);

export function useCollab(
  docId: string | undefined,
  createProvider: CollabProviderFactory = defaultProviderFactory,
) {
  // ... unchanged body, but construct via createProvider({ url: env.Socket_URL, name: docId, document: ydoc })
}
```

Verification sequence (all must pass):
- [ ] `pnpm --filter client typecheck && pnpm --filter client build`
- [ ] `pnpm --filter client test` (existing stories green)
- [ ] `pnpm --filter client test:e2e -- --project=collaboration-specs` (auto-runs auth→setup→chromium incl. sharing/editor specs → collaboration specs)
- [ ] Commit alone: `refactor(client): injectable provider factory in useCollab`

**Failure policy:** one evidence-backed retry max; otherwise drop D6 from scope (revert commit), MarkdownEditor story returns to deferred-residual status, Phase E proceeds without it.

---

## Layer 5: `client-quality/e-stories`

Create with: `gh stack add client-quality/e-stories`. Verify `pnpm --filter client test` after each batch.

### Task 5.1: Decorators in `.storybook/preview.ts`

```tsx
import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
// mock auth context matching AuthContextType shape

const preview: Preview = {
  decorators: [
    (Story) => <MemoryRouter><Story /></MemoryRouter>,
    // ModalAncestor decorator: wraps story in <Modal> root when story sets parameters.modalStory === true
  ],
};
```

Plus parameter-driven auth mock: decorator reading `parameters.auth` and supplying a matching context value (user/loading/isAuthenticated variants). Exact implementation follows the real `AuthContextType` interface read at execution time.
Commit: `test(client): storybook router/auth/modal decorators`

### Task 5.2: Gap-fill stories (12)

Each: folder-per-component story file, `tags:['autodocs']`, states listed, play() where noted. Data via props.

| Component dir | States | play() |
|---|---|---|
| `ui/Spinner` | sizes, color inheritance | — |
| `ui/Seo` | render smoke + docs | — |
| `ui/Auth` login-form | default, validation errors | fill+submit asserts validation |
| `ui/Auth` register-form | same | same |
| 4× layouts | render with child outlet content | — |
| `ui/Form` Input | label, error, disabled | typing fires onChange |
| `common/NewDocumentFormBody` | default, validation errors | valid submit fires onSubmit |
| `Dashboard/…/DocumentCardDropdown` | closed/open items | open→select fires handler |
| `Dashboard/…/NewDocumentModal` | open, open-with-form | open→close esc/cancel |
| `DocumentPage/…/MarkdownStatusBar` | ready/saving states | — |
| `DocumentPage/…/MarkdownToolbar` | active/inactive tools | tool click invokes command |
| `DocumentPage/…/MarkdownEditor` | render smoke via offline provider adapter (contingent on D6 success; else deferred) | — |

Also: add `NewDocumentModal/index.ts` barrel (sibling consistency).
Batch commits: `test(client): stories for <area>`

### Task 5.3: Enrichment of existing 24 stories

Recipe per component (worked exemplar — Button):

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';

const onClickFn = fn();

export const Loading: Story = { args: { isLoading: true, children: 'Saving' } };
export const Disabled: Story = { args: { disabled: true } };
export const AsChild: Story = { args: { asChild: true }, render: (args) => (
  <Button {...args}><a href="#">Link content</a></Button>
) };
export const ClickBehavior: Story = {
  args: { onClick: onClickFn, children: 'Click me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(onClickFn).toHaveBeenCalledTimes(1);
  },
};
```

Application order & coverage targets:
1. Primitives: Button (above), Modal (open/close/esc play), Dropdown (open→select play), Toast (show/autohide), Alert (variants), Avatar (image-break fallback), Skeleton, ToggleGroup (select play)
2. Header (auth states via auth decorator)
3. Dashboard: dashboard-main (loading skeleton/populated/empty grid), document-row + document-grid-card (long-title truncation, menu), sort-control (selection play)
4. DocumentHeader cluster: title, toolbar, view-mode (toggle play), share-button (opens modal), options-dropdown, collaborators-dropdown, workspace-info, create-document-button (opens modal)
5. MarkdownPreview: fixture markdown covering code blocks, math, mermaid, sanitization cases

Commits: `test(client): state coverage for <component>`

---

## Layer 6: `client-quality/f-ci`

Create with: `gh stack add client-quality/f-ci`

### Task 6.1: Remove temporary CI branch filters

Revert both workflow `branches:` lists to `[main, develop]`.
Commit: `ci: drop temporary client-quality branch triggers`

### Task 6.2: AGENTS.md conventions section

Add client section: folder-per-component layout, PascalCase dirs/kebab files, `autodocs` tag requirement, JSDoc-on-export policy (lint-enforced), story-state checklist, `pnpm --filter client test` command.
Commit: `docs: record client conventions in AGENTS.md`

### Task 6.3: ADR 0001 — defer auth token consolidation

Write `docs/adr/0001-defer-auth-token-consolidation.md`: context (token triplication across context/utils/api.defaults + wasLoggedOut flag + deleted dead interceptor), decision (deferred to dedicated initiative), consequences.
Commit: `docs: adr 0001 defer auth consolidation`

### Task 6.4: Final gate

`pnpm lint && pnpm typecheck && pnpm build && pnpm test` + `pnpm --filter client test:e2e`
Commit (if anything outstanding): `chore: client quality initiative complete`

---

## Execution Handoff

Run inline in this session (executing-plans style) given heavy local-verification coupling; dispatch subagents only for mechanical batches (JSDoc backfill, story enrichment) where context isolation helps.
