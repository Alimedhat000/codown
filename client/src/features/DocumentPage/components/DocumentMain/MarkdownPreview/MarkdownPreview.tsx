import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMermaidPlugin from 'remark-mermaid-plugin';
import { Pluggable } from 'unified';

import { rehypeSupSub } from './rehype-subsuper';
import { remarkTypographer } from './remark-typographer';
import { rehypeTextDecorations } from './remarkDecorations';

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="custom-scrollbar w-full h-full flex-1 overflow-auto p-6 bg-surface
            rounded-none"
    >
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          children={content}
          remarkPlugins={[
            remarkTypographer,
            remarkGfm,
            remarkMath,
            remarkEmoji,
            [remarkMermaidPlugin, { theme: 'dark' }] as Pluggable,
          ]}
          rehypePlugins={[
            rehypeRaw,
            rehypeStringify,
            rehypeTextDecorations,
            rehypeSupSub,
            rehypeKatex,
            rehypeHighlight,
            rehypeSlug,
          ]}
        />
      </div>
    </div>
  );
}
