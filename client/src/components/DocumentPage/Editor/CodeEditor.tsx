import CodeMirror from "@uiw/react-codemirror";
import { editorExtensions } from "./EditorExtensions";
import { MyTheme } from "./EditorTheme";

export default function CodeEditor({
  content,
  setContent,
}: {
  content: string;
  setContent: (content: string) => void;
}) {
  return (
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
  );
}
