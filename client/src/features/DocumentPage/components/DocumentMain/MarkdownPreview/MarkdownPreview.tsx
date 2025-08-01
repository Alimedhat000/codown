import ReactMarkdown from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { rehypeCopyHeadingLinks } from '@/lib/rehypeCopyButton';

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="custom-scrollbar w-full h-full flex-1 overflow-auto p-6 bg-background
            rounded-none"
    >
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
          rehypePlugins={[
            rehypeKatex,
            rehypeHighlight,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            rehypeCopyHeadingLinks,
          ]}
        />
      </div>
    </div>
  );
}
