import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { markdown } from "@codemirror/lang-markdown";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// import "github-markdown-css/2-markdown.css";

export default function MarkDownEditor() {
  const [content, setContent] = useState("## Hello Markdown\nEdit me!");

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={[markdown()]}
          onChange={(val) => setContent(val)}
        />
      </div>

      {/* <div
        className="markdown-body"
        style={{
          flex: 1,
          padding: "1rem",
          backgroundColor: "#f9f9f9",
          overflowY: "auto",
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div> */}
    </div>
  );
}
