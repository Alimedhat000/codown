import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { editorExtensions } from "./extensions";
import { MyTheme } from "./theme";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";

import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeCopyHeadingLinks } from "@/lib/rehypeCopyButton";

import "highlight.js/styles/github-dark.css";

export default function MarkDownEditor({ mode }: { mode: EditorMode }) {
  const [content, setContent] = useState(`## Table of Contents

<!-- toc -->

## Math Test

Inline math: $a^2 + b^2 = c^2$

Block math:

$$
\\sum_{i=1}^n i = \\frac{n(n+1)}{2}
$$

A code block:

\`\`\`ts
console.log("Hello world");
const ali = 22;
\`\`\`
`);

  return (
    <div className="flex flex-col gap-4 h-screen n  text-white">
      <div className="flex flex-1 gap-4 overflow-hidden">
        {(mode === "edit" || mode === "both") && (
          <div className="w-full h-full flex-1 overflow-auto">
            <CodeMirror
              value={content}
              height="100%"
              theme={MyTheme}
              extensions={editorExtensions}
              onChange={(val) => setContent(val)}
              className="w-full h-full"
            />
          </div>
        )}

        {(mode === "view" || mode === "both") && (
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
        )}
      </div>
    </div>
  );
}
