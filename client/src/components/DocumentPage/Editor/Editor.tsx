import "highlight.js/styles/github-dark.css";
import CodeEditor from "./CodeEditor";
import MarkdownPreview from "./MarkdownPreview";
// import StatusBar from "./StatusBar";

export function Editor({
  mode,
  doc,
  setDoc,
}: {
  mode: EditorMode;
  doc: DocumentData;
  setDoc: (doc: DocumentData) => void;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-background text-white">
      <div className={`flex flex-1 gap-0 md:gap-4 overflow-auto `}>
        {(mode === "edit" || mode === "both") && (
          <div
            className={`flex-1 min-w-0 h-full overflow-hidden  last:border-r-0 p-2 md:p-4 ${
              mode === "both" ? "rounded-l-lg" : "rounded-lg"
            }`}
          >
            {/* <StatusBar content={doc.content} className="fixed bottom-0" /> */}

            <div className="overflow-auto h-full">
              <CodeEditor doc={doc} setDoc={setDoc} />
            </div>
          </div>
        )}

        {(mode === "view" || mode === "both") && (
          <div
            className={`flex-1 min-w-0 h-full  bg-neutral-800 p-2 md:p-4 ${
              mode === "both" ? "rounded-r-lg" : "rounded-lg"
            }`}
          >
            <MarkdownPreview content={doc.content} />
          </div>
        )}
      </div>
    </div>
  );
}
