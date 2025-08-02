import { useEffect } from 'react';
import { LuMenu } from 'react-icons/lu';
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { dateFormat } from '@/utils/dateformat';

import { MarkdownToc } from './markdown-toc';
import { rehypeSupSub } from './rehype-subsuper';
import { remarkTypographer } from './remark-typographer';
import { rehypeTextDecorations } from './remarkDecorations';

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
          <button className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-border rounded-md shadow-lg  hover:bg-border/80 transition">
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
