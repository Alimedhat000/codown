import type { Element } from 'hast';
import { useEffect } from 'react';
import { LuMenu } from 'react-icons/lu';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { dateFormat } from '@/utils/dateformat';

import { MarkdownToc } from './markdown-toc';
import { MermaidDiagram } from './mermaid-diagram';
import { rehypeSupSub } from './rehype-subsuper';
import { rehypeTextDecorations } from './remark-decorations';
import { remarkTypographer } from './remark-typographer';
import { markdownSanitizeSchema } from './sanitize-schema';

export function MarkdownPreview({
  content,
  lastUpdated,
  previewScrollRef,
  onScroll,
  syncScroll,
}: {
  content: string;
  previewScrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  syncScroll?: boolean;
  lastUpdated?: string;
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
      className="custom-scrollbar w-full h-full flex-1 overflow-y-scroll p-6 bg-surface
            rounded-none markdown-previewer"
      ref={previewScrollRef}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="fixed bottom-4 right-4 z-5 px-4 py-2 bg-border rounded-md shadow-lg  hover:bg-border/80 transition">
            <LuMenu />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[300px] p-0">
          <div className="max-h-[70vh] overflow-y-scroll custom-scrollbar px-4 py-2">
            <MarkdownToc
              content={content}
              onHeadingClick={(id) => console.log('Navigated to:', id)}
              collapsible={false}
              className="h-full"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mb-8 text-muted-foreground">
        <span>
          Last Edited:{' '}
          {lastUpdated ? dateFormat(new Date(lastUpdated)) : 'Unknown'}
        </span>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          children={content}
          components={{
            pre: ({ children, node }) => {
              const codeEl = node?.children[0] as Element | undefined;
              const className = codeEl?.properties?.className;
              const isMermaid =
                Array.isArray(className) &&
                className.includes('language-mermaid');
              const source = codeEl?.children[0];
              if (
                isMermaid &&
                source &&
                'value' in source &&
                typeof source.value === 'string'
              ) {
                return <MermaidDiagram code={source.value} />;
              }
              return <pre>{children}</pre>;
            },
          }}
          remarkPlugins={[
            remarkTypographer,
            remarkGfm,
            remarkMath,
            remarkEmoji,
          ]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, markdownSanitizeSchema],
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
