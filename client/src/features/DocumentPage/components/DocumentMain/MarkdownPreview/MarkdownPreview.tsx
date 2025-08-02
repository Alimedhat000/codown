import { useEffect } from 'react';
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

export function MarkdownPreview({
  content,
  previewScrollRef,
  onScroll,
  syncScroll,
}: {
  content: string;
  previewScrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  syncScroll?: boolean;
}) {
  useEffect(() => {
    const el = previewScrollRef?.current;
    if (!el) return;

    if (syncScroll) {
      el.addEventListener('scroll', onScroll!);
    }

    return () => {
      el.removeEventListener('scroll', onScroll!);
    };
  }, [syncScroll, onScroll, previewScrollRef]);

  return (
    <div
      className="custom-scrollbar w-full h-full flex-1 overflow-auto p-6 bg-surface
            rounded-none"
      ref={previewScrollRef}
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
