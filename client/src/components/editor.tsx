import "remirror/styles/all.css";
import {
  Remirror,
  ThemeProvider,
  useRemirrorContext,
  EditorComponent,
} from "@remirror/react";
import type { RemirrorManager, EditorState } from "@remirror/core";

interface EditorProps {
  // Using `any` here to allow flexible manager injection from any editor extension set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manager: RemirrorManager<any>;
  initialContent: EditorState;
  onChange: (html: string) => void;
}

const Menu = () => {
  const { commands, active } = useRemirrorContext({ autoUpdate: true });

  return (
    <div>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? "bold" : undefined }}
      >
        B
      </button>
    </div>
  );
};

export default function Editor({
  manager,
  initialContent,
  onChange,
}: EditorProps) {
  return (
    <div className="px-10 py-6">
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={initialContent}
          onChange={({ helpers }) => {
            const markdown = helpers.getMarkdown();
            onChange(markdown);
          }}
        >
          <Menu />
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
    </div>
  );
}
