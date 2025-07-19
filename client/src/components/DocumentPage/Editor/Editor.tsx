import { useState } from "react";

import "highlight.js/styles/github-dark.css";
import CodeEditor from "./CodeEditor";
import MarkdownPreview from "./MarkdownPreview";

export function Editor({ mode }: { mode: EditorMode }) {
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
          <CodeEditor content={content} setContent={setContent} />
        )}

        {(mode === "view" || mode === "both") && (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  );
}
