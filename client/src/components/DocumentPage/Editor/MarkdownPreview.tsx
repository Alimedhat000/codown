import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";

import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeCopyHeadingLinks } from "@/lib/rehypeCopyButton";

export default function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="w-full h-full flex-1 overflow-auto p-6 bg-background
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
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            rehypeCopyHeadingLinks,
          ]}
        />
      </div>
    </div>
  );
}
