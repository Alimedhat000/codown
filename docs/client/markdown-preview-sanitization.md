# Markdown Preview: Sanitization & Mermaid Rendering

How untrusted document content becomes safe HTML in the editor preview, and why
the pipeline is shaped the way it is. Introduced in PR #60 (issue #49).

## Threat model

Document content is **collaborator-authored and therefore untrusted**. Anyone
with write access to a document (today: any authenticated user via the share
flow; later: collaboration sockets) can put arbitrary text — including raw
HTML — into a document, and every other user renders it in their preview.

Pre-#49, raw HTML flowed straight into the live DOM: `<script>` tags were
injected into every viewer's page and `<iframe src="https://attacker">`
phishing overlays worked. React incidentally blocks some vectors (string event
handler props throw; `javascript:` hrefs are dropped), but that is an
implementation detail, not a security contract.

## Render pipeline

`MarkdownPreview.tsx` renders with `react-markdown`:

```
markdown
  │ remark: remarkTypographer → remarkGfm → remarkMath → remarkEmoji
  ▼
rehypeRaw                ← parses embedded raw HTML into real elements
rehypeSanitize           ← ★ the security boundary (sanitize-schema.ts)
rehypeStringify          ← legacy no-op compiler registration
rehypeTextDecorations    ┐
rehypeSupSub             │ trusted app-generated markup,
rehypeKatex              │ applied AFTER sanitize so it is never filtered
rehypeHighlight          │
rehypeSlug               ┘
```

**Ordering rule: `rehypeSanitize` must stay immediately after `rehypeRaw`.**
Everything the app itself generates runs later and is therefore never filtered.
Moving sanitize later would strip KaTeX/highlight/slug output; moving it
earlier would let raw HTML through. Do not insert new raw-HTML-producing
plugins before sanitize.

## `sanitize-schema.ts`

Built from `hast-util-sanitize`'s `defaultSchema` (GitHub-style allowlist) with
one extension: `className` patterns `hljs`, `hljs-*`, `language-*` on
`code`/`pre`/`span`/`div`, so fenced-code highlighting classes can never be
caught by a future re-ordering.

Concretely blocked for document HTML: `<script>`, all `on*` handlers,
`<iframe>`/`<object>`/`<embed>`, hand-typed `<svg>` and any other non-allowlisted
element, `javascript:`/`data:` URLs, `style` attributes. **There are no SVG or
script exceptions for document HTML — by design.** Trusted generated markup
belongs in a plugin that runs after sanitize, not in schema exceptions.

## Mermaid: decoupled from the raw-HTML pipeline

Mermaid diagrams are **not** rendered through `rehypeRaw` at all. The old
`remark-mermaid-plugin` pre-rendered diagrams to raw HTML strings inside the
markdown tree, which made them indistinguishable from attacker HTML at
sanitize time (sanitizing strictly destroyed diagrams; allowing SVG opened a
CSS-injection hole via mermaid's embedded `<style>`).

Instead, a custom `pre` renderer in `MarkdownPreview.tsx` detects
```` ```mermaid ```` fences (via the hast node's `language-mermaid` class) and
hands the source text to `MermaidDiagram.tsx`, which:

1. calls `mermaid.render()` client-side with `securityLevel: 'strict'`
   (mermaid sanitizes label content itself),
2. passes the resulting SVG string through DOMPurify,
3. injects it via `dangerouslySetInnerHTML` on a `.language-mermaid` wrapper
   (reusing the existing CSS hook in `index.css`).

Invalid diagram syntax falls back to a plain code block showing the source.

### The DOMPurify config, explained

`SVG_SANITIZE_CONFIG` in `MermaidDiagram.tsx` needs three non-obvious knobs.
This sanitizer instance only ever sees mermaid's own output — never document
HTML — which is what makes these exceptions acceptable:

- **`ADD_TAGS: ['foreignobject']`** — mermaid v11 renders node labels as HTML
  inside `<foreignObject>`. The svg profile explicitly disallows the tag
  (`svgDisallowed` list), so without this, diagrams render with shapes but no
  text.
- **`HTML_INTEGRATION_POINTS: { 'annotation-xml': true, foreignobject: true }`**
  — DOMPurify 3.4.13 defaults this map to `annotation-xml` only, so
  HTML-namespace children (`div`/`span` labels) inside `foreignObject` fail
  namespace validation and are removed even when the tag itself is allowed.
  `foreignObject` is a spec-standard SVG→HTML integration point; listing it
  restores spec behavior. Event handlers, `javascript:` URLs and `<script>`
  remain blocked in every profile regardless.
- **`FORBID_CONTENTS: [...]`** — DOMPurify empties the contents of listed tags.
  The default list contains `foreignobject`; we pass the full default list
  minus `foreignobject` (verified against `dompurify/dist/purify.es.mjs`,
  `DEFAULT_FORBID_CONTENTS`). Keep this list in sync when bumping dompurify.

The story spec `RendersMermaidDiagrams` asserts visible label text
(`Start`/`Decision`/`End`), so any of the above regressing fails CI-visible
tests rather than silently blanking diagrams.

## Testing

Stories live in `markdown-preview.stories.tsx` and run through the Storybook
vitest browser project (headless chromium):

```bash
cd client
pnpm exec vitest run --project storybook \
  src/features/DocumentPage/components/DocumentMain/MarkdownPreview/markdown-preview.stories.tsx

# or interactively:
pnpm storybook   # Features/DocumentPage/MarkdownPreview
```

- `SanitizesMaliciousHtml` — script/iframe/raw-svg/event-handlers/`javascript:` blocked
- `RendersMermaidDiagrams` — fences render real `<svg>` with visible labels
- `PreservesSafeMarkdownFeatures` — hljs classes, links, GFM task lists, KaTeX survive

Note: content assertions are scoped to the `.prose` container — the previewer
chrome (dropdown icon) legitimately contains its own inline `<svg>`.

## Known trade-offs / follow-ups

- Mermaid rendering is async (React effect) rather than in-pipeline.
- `mermaid@11` is heavy; the client build emits a >500 kB chunk warning.
  Consider lazy-loading `MermaidDiagram`/mermaid via dynamic import.
- Dead CSS in `src/index.css` (`code.hljs.language-mermaid`,
  `pre:has(> code.language-mermaid)`) targets the removed plugin structure.
- Storybook coverage does not yet exercise every enabled markdown feature, and
  the storybook vitest project is not wired into CI (tracked issues).
