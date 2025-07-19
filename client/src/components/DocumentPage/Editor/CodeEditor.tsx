import CodeMirror from "@uiw/react-codemirror";
import { editorExtensions } from "./EditorExtensions";
import { MyTheme } from "./EditorTheme";

export default function CodeEditor({
  doc,
  setDoc,
}: {
  doc: DocumentData;
  setDoc: (doc: DocumentData) => void;
}) {
  return (
    <CodeMirror
      value={doc.content}
      height="100%"
      theme={MyTheme}
      extensions={editorExtensions}
      onChange={(val) => setDoc({ content: val, title: doc.title })}
      className="w-full h-full flex-1 overflow-auto"
    />
  );
}
