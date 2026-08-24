# Client Quality Initiative — Design Spec

- **Date:** 2026-08-23
- **Status:** Draft — awaiting user review before commit
- **Plan:** `docs/superpowers/plans/2026-08-23-client-quality.md` (written after spec approval)

## 1. Problem

The client (`client/`) is hard to work with:

1. **Confusing file structure** — mixed casing conventions, misplaced shared components, inconsistent folder shapes
2. **Undocumented components** — zero JSDoc anywhere in `client/src`
3. **Insufficient Storybook coverage** — 12 component dirs have no story; existing stories lack state coverage (e.g., `Button` has an `isLoading` prop but no loading story)
4. **No component tests** — the `@storybook/addon-vitest` browser project is configured in `vitest.config.ts` but there is no `test` script; nothing runs it

## 2. Goals / Non-goals

**Goals:** one dedicated cleanup push that normalizes structure, enforces documentation via lint, brings every component into Storybook with real state coverage, makes stories executable as tests, and wires all of it into CI so it cannot regress.

**Non-goals:** server-side changes; new runtime dependencies; MSW or network mocking; auth consolidation (deferred, see §9); hook unit-testing infrastructure beyond what stories provide; flipping a11y from `'todo'` to failing mode.

## 3. Decisions Locked

| Decision | Choice | Rationale |
|---|---|---|
| Effort shape | Dedicated cleanup push, phased | Conventions agreed once, mass migration once, lint keeps it honest |
| Test strategy | Storybook interaction tests (`play()` via addon-vitest browser project) | Infra already 90% wired; one artifact = docs + visual states + test; zero new deps |
| Structure scope | Full normalization | Mechanical `git mv`; partial fixes leave drift |
| File naming | kebab-case for all `.ts`/`.tsx` | Matches ~90% majority, shadcn heritage, existing story names; ESLint rule flips to match reality |
| Directory naming | PascalCase (unchanged) | Component identity matches exported symbol; dominant existing pattern |
| JSDoc policy | Lint-enforced (`eslint-plugin-jsdoc`) | Backfill is pointless if new code can skip it |
| Sequencing fix | Renames land **before** the KEBAB_CASE rule flips; JSDoc rule starts as `warn` | Rule-before-rename would go red mid-flight; `warn` interim because backfill hasn't happened |

## 4. Target Conventions

- Folder-per-component: `<ComponentName>/{<component>.tsx, index.ts, <component>.stories.tsx}` — directories PascalCase, files kebab-case
- Every story meta gets `tags: ['autodocs']` so JSDoc renders as Storybook docs pages automatically
- Every interactive component gets state stories (loading/error/disabled/empty where applicable); interactive behavior gets `play()` assertions — stories are the component tests
- Every export carries JSDoc (components, hooks, lib/utils functions)
- Composite kits (e.g., `ui/Form`) may hold internal parts flat inside their folder when those parts have no external consumers; external API goes through the folder barrel

## 5. Current-State Evidence

- ~60 component `.tsx` files; 24 story files; 12 dirs without stories (enumerated in §7 Phase E)
- Full uppercase-basename sweep found **29 violator files** for the kebab-case rule (all addressed in Phase B)
- `lib/__tests__/api.test.tsx` is empty (0 lines) and attached to no runner
- ESLint naming rule exists but is inert today (`button.tsx` passes; probe yields warning-level result only)
- CI (`lint-type-check.yml`) already runs root `pnpm lint` / `pnpm test`, so client rules/tests flow into CI automatically once scripts exist; only Playwright chromium install needs adding
- Playwright e2e project dependency chain: `auth-specs → setup → chromium → collaboration-specs → logout-specs`

## 6. Architecture Findings Folded In

Survey vocabulary: *module* = interface + implementation; *seam* = where an interface lives; *locality* = change concentrated in one place.

| # | Finding | Disposition |
|---|---|---|
| 1 | Auth/token state triplicated: React context + `utils/token` localStorage + mutated `api.defaults.headers`, plus hidden `wasLoggedOut` flag and a fully commented-out 401-refresh interceptor (`api.ts:27-55`) | **Deferred** to its own initiative; ADR stub written in Phase F. Dead interceptor deleted in Phase D. |
| 2 | All data hooks swallow errors (`console.error`, no `error` in return interface) — callers cannot render error states | **Folded in, minimal variant**: additive `error` field on hook returns during Phase D; enables real error-state stories in Phase E |
| 3 | `useCollab.ts:18-22` constructs `HocuspocusProvider` inline — no seam; blocks any editor story without a live websocket | **Folded in as Task D6** (isolated behavioral commit + targeted e2e gate); un-defers the MarkdownEditor story |
| 4 | Misc: bare API fns mixed into `useJoinRequests.ts`; `useAutoSave` interval-resets-on-edit semantics undocumented; `NewDocumentFormBody` renders Radix `ModalContent` needing a `<Modal>` ancestor in stories | Folded into Phases D/E respectively |

## 7. Phase Plan

### Phase A — Non-breaking infra
- **A1:** `"test": "vitest run"` in `client/package.json`; root `test:client`; local `playwright install chromium`; verify 24 existing stories pass
- **A2:** Delete empty `lib/__tests__/api.test.tsx`
- **A3:** Plop templates emit JSDoc stub, `autodocs` tag, typed meta, commented `play()` example

### Phase B — Structural normalization (all `git mv`)
- **B1:** Layouts → folder-per-component (`AuthLayout/auth-layout.tsx` + index, etc.)
- **B2:** `context/auth`: `auth-context.tsx`, `auth-provider.tsx`, `use-auth.tsx`
- **B3:** ui oddballs: `seo/`→`Seo/` (+`Head.tsx`→`head.tsx`+index), `auth/`→`Auth/`, `Header.stories.tsx`→`header.stories.tsx`; **dissolve `Form/Input/`** — `input-field.tsx`→`Form/input.tsx`, `variants.ts` up, `Form/index.ts` created, 3 external imports updated (evidence: only `Input` crosses the seam externally)
- **B4:** `DashBoardMain`→`DashboardMain`; `common/forms/NewDocumentFormBody.tsx`→`common/NewDocumentFormBody/new-document-form-body.tsx` (**drop single-child `forms/` layer**; stays shared — used by Dashboard modal AND DocumentPage CreateDocumentButton, feature move would violate isolation lint)
- **B5:** Hooks renames (7): `use-auto-save`, `use-collab`, `use-collaborators`, `use-document`, `use-join-requests`, `use-media-query`, `use-share-link`; 6 verified import sites across 4 files. No hook-name exemption: B2 already renames `useAuth.tsx`; function names keep `useX` casing (what react-hooks lint tracks)
- **B6:** DocumentMain subtree (11 files): `document-main.tsx`, `markdown-editor.tsx`, `editor-extensions.ts`, `editor-theme.ts`, `key-map-extension.ts`, `spell-check.ts`, `use-editor-status.ts`, `use-markdown-commands.tsx`, `markdown-preview.tsx`, `mermaid-diagram.tsx`, `remark-decorations.tsx`; leaves: `rehype-copy-button.ts`, `generate-user-color.ts`. External consumers go through barrels — churn confined to barrels/siblings/one story import
- Each task verified: typecheck + build; batch commits

### Phase C — Enforcement rules
- **C1:** Naming rule → `'**/*.{ts,tsx}': 'KEBAB_CASE'` (now passes post-B); remove stale `src/shared` ignores (dir doesn't exist). Dir convention documented, not linted
- **C2:** Add `eslint-plugin-jsdoc` (sole new dev dep), `require-jsdoc` as **`warn`**, exports-focused, `require-param` off (types self-document)

### Phase D — Documentation + seam fixes
- JSDoc backfill batches (commit per batch): ui → auth forms → layouts → context/hooks → lib/utils → features (~70 exports); missing `autodocs` tags added on touch
- Dead refresh interceptor deleted (`api.ts`); bare API fns relocated from `useJoinRequests.ts` to `lib/`; `error` fields added to data hooks (additive, non-breaking)
- **D6 (isolated, last):** injectable provider factory param on `useCollab(docId, createProvider?)`, default preserves current behavior exactly. Verify: typecheck + build + `pnpm --filter client test` + `pnpm --filter client test:e2e -- --project=collaboration-specs` (dependency chain auto-covers setup/chromium/sharing/editor/collaboration specs). Own commit; **failure policy:** one evidenced retry max, else D6 drops from scope and the MarkdownEditor story returns to deferred-residual — the initiative never blocks on it
- End of phase: flip `jsdoc/require-jsdoc` to `error`

### Phase E — Stories & interaction tests
- Groundwork decorators in `preview.ts`: global `MemoryRouter` (harmless to non-router stories), parameter-driven mock auth context, `Modal` ancestor wrapper for form-body stories
- Gap-fill (12): Spinner (sizes), Seo (smoke), login/register forms (validation states + submit play), 4× layouts, Form/Input (label/error/disabled + typing play), NewDocumentFormBody (validation + submit play), DocumentCardDropdown (open/select play), NewDocumentModal (open/close play), NewDocumentModal gains its `index.ts`
- MarkdownEditor story now feasible post-D6 via offline provider adapter; StatusBar/Toolbar get full state coverage regardless
- Enrichment of existing 24: enumerate cva variants → one story each; boolean props → state story each; interactions → play() with `fn()` args + `within(canvasElement)` asserts. Fully worked exemplar: Button (Loading/Disabled/AsChild/ClickBehavior). Priority: primitives → Dashboard cards/menus → DocumentHeader cluster → MarkdownPreview fixtures (code/math/mermaid)
- Verify each batch: `pnpm --filter client test` green

### Phase F — CI, docs, records
- `lint-type-check.yml`: add Playwright chromium install step before "Run tests"
- AGENTS.md: client conventions section (folder shape, casing, autodocs, JSDoc policy, story checklist, test command)
- Write `docs/adr/0001-defer-auth-token-consolidation.md` recording finding #1 + deferral rationale
- Full gate: `pnpm lint && pnpm typecheck && pnpm build && pnpm test` + `pnpm --filter client test:e2e`

## 8. Verification Gates & Failure Policies

- Every phase ends green: lint + typecheck + build (tests from Phase A onward)
- Renames never precede rule flips; rules never exceed current compliance level (naming after B; jsdoc `error` only after backfill)
- D6 is the only runtime-behavioral commit in Phase D and carries its own e2e gate + drop-out policy
- Existing Playwright e2e must stay green throughout; suites select by role/text, not filenames, so renames shouldn't touch them

## 9. Residuals (explicit)

- Auth token consolidation — deferred, recorded in ADR 0001
- Hook internals (autosave timing, collab lifecycle) documented but not logic-tested under the storybook-only strategy; a node vitest project remains a cheap future add
- MarkdownEditor story contingent on D6 success (else deferred again)
- a11y stays `'todo'`; strictness flip is future work after violations triage

## 10. Risks

| Risk | Mitigation |
|---|---|
| Rename churn vs open branches | Land early on clean branch; phases ship as separate PR-sized chunks |
| Vitest browser mode needs chromium locally | One-time `playwright install chromium`; documented in AGENTS.md |
| D6 regression in collab path | Isolated commit, targeted e2e project run, explicit drop-out policy |
| Scope creep beyond four complaints | §6 table bounds every architecture fold-in; anything else requires its own spec |
