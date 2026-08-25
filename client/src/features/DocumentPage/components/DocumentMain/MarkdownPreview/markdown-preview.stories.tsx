import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { MarkdownPreview } from './markdown-preview';

const meta: Meta<typeof MarkdownPreview> = {
  component: MarkdownPreview,
  tags: ['autodocs'],
  title: 'Features/DocumentPage/MarkdownPreview',
};

export default meta;

const XSS_PAYLOAD = [
  '# Legit heading',
  '',
  '<script>window.__xssRan = true;</script>',
  '',
  '<img src=x onerror="window.__xssRan = true" />',
  '',
  '<iframe src="https://attacker.example/phish" title="x"></iframe>',
  '',
  '<svg><circle r="10"></circle></svg>',
  '',
  "[click me](javascript:alert('xss'))",
  '',
].join('\n');

/**
 * Raw HTML attacks are stripped by sanitization.
 */
export const SanitizesMaliciousHtml: StoryObj<typeof MarkdownPreview> = {
  args: {
    content: XSS_PAYLOAD,
    lastUpdated: new Date('2026-08-22T00:00:00Z').toISOString(),
  },
  play: async ({ canvasElement }) => {
    const prose = getProse(canvasElement);

    expect(
      prose.querySelectorAll('script'),
      'raw <script> tags must never reach the DOM',
    ).toHaveLength(0);
    expect(
      prose.querySelectorAll('[onerror], [onclick], [onload]'),
      'inline event handlers must be stripped',
    ).toHaveLength(0);
    expect(
      prose.querySelectorAll('iframe'),
      'arbitrary remote content embedding must be blocked',
    ).toHaveLength(0);
    expect(
      prose.querySelectorAll('svg'),
      'hand-typed raw <svg> must be sanitized away like any other HTML',
    ).toHaveLength(0);

    const hrefs = Array.from(prose.querySelectorAll('a')).map((a) =>
      (a.getAttribute('href') ?? '').trim().toLowerCase(),
    );
    expect(
      hrefs.filter((href) => href.startsWith('javascript:')),
      'javascript: URLs must be removed from links',
    ).toEqual([]);
  },
};

const MERMAID_DOC = [
  '# Diagrams still work',
  '',
  '```mermaid',
  'flowchart TD',
  '  A[Start] --> B{Decision}',
  '  B -->|yes| C[End]',
  '```',
].join('\n');

/**
 * Fenced mermaid blocks render as diagrams.
 */
export const RendersMermaidDiagrams: StoryObj<typeof MarkdownPreview> = {
  args: {
    content: MERMAID_DOC,
    lastUpdated: new Date('2026-08-22T00:00:00Z').toISOString(),
  },
  play: async ({ canvasElement }) => {
    const prose = getProse(canvasElement);

    await waitFor(
      () =>
        expect(
          prose.querySelector('svg'),
          'mermaid fences must render as real <svg> diagrams',
        ).not.toBeNull(),
      { timeout: 10_000 },
    );
    expect(
      prose.querySelector('pre'),
      'no stray <pre> wrapper around diagrams',
    ).toBeNull();

    const renderedText = prose.textContent ?? '';
    for (const label of ['Start', 'Decision', 'End']) {
      expect(
        renderedText.includes(label),
        `node label "${label}" must be visible inside the diagram`,
      ).toBe(true);
    }
  },
};

const RICH_DOC = [
  '# Title',
  '',
  '```js',
  'const x = 1;',
  '```',
  '',
  '[docs](https://example.com)',
  '',
  '- [ ] task one',
  '- [x] task two',
  '',
  'Math: $E = mc^2$',
].join('\n');

/**
 * Safe markdown features survive sanitization intact.
 */
export const PreservesSafeMarkdownFeatures: StoryObj<typeof MarkdownPreview> = {
  args: {
    content: RICH_DOC,
    lastUpdated: new Date('2026-08-22T00:00:00Z').toISOString(),
  },
  play: async ({ canvasElement }) => {
    const prose = getProse(canvasElement);

    await waitFor(
      () =>
        expect(
          prose.querySelector('code.hljs'),
          'syntax highlight classes must survive on fenced code',
        ).not.toBeNull(),
      { timeout: 10_000 },
    );

    expect(
      prose.querySelector('a[href="https://example.com"]'),
      'ordinary links must keep their href',
    ).not.toBeNull();

    expect(
      prose.querySelectorAll('input[type="checkbox"]'),
      'GFM task list checkboxes must render',
    ).toHaveLength(2);

    await waitFor(
      () =>
        expect(
          prose.querySelector('.katex'),
          'inline math must still render through KaTeX',
        ).not.toBeNull(),
      { timeout: 10_000 },
    );
  },
};

/**
 * Grab the rendered prose container from the story canvas.
 */
function getProse(canvasElement: HTMLElement): HTMLElement {
  const preview = canvasElement.querySelector<HTMLElement>(
    '.markdown-previewer',
  );
  expect(preview, 'preview must be mounted').not.toBeNull();
  const prose = preview!.querySelector('.prose');
  expect(
    prose,
    'preview must render a .prose content container',
  ).not.toBeNull();
  return prose as HTMLElement;
}
