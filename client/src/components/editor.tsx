import "remirror/styles/all.css";
import {
  Remirror,
  ThemeProvider,
  useRemirrorContext,
  EditorComponent,
} from "@remirror/react";
import type { RemirrorManager, EditorState } from "@remirror/core";
import {
  Bold,
  Code,
  Italic,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";

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
    <div className="toolbar">
      <button onClick={() => commands.undo()}>
        <Undo />
      </button>
      <button onClick={() => commands.redo()}>
        <Redo />
      </button>
      <button
        onClick={() => commands.toggleBold()}
        className={active.bold() ? "active" : ""}
      >
        <Bold />
      </button>
      <button
        onClick={() => commands.toggleItalic()}
        className={active.italic() ? "active" : ""}
      >
        <Italic />
      </button>
      <button onClick={() => commands.toggleHeading({ level: 1 })}>H1</button>
      <button onClick={() => commands.toggleHeading({ level: 2 })}>H2</button>
      <button
        onClick={() => commands.toggleStrike()}
        className={active.strike() ? "active" : ""}
      >
        <Strikethrough />
      </button>
      <button
        onClick={() => commands.toggleCode()}
        className={active.code() ? "active" : ""}
      >
        <Code />
      </button>
      <button onClick={() => commands.toggleBlockquote()}>
        <Quote />
      </button>
      <button onClick={() => commands.toggleBulletList()}>• List</button>
      <button onClick={() => commands.toggleOrderedList()}>1. List</button>
      <button onClick={() => commands.toggleTaskList()}>☐ Checklist</button>
      <button
        onClick={() => commands.updateLink({ href: "https://example.com" })}
      >
        🔗 Link
      </button>
      <button
        onClick={() =>
          commands.insertImage({ src: "https://via.placeholder.com/150" })
        }
      >
        🖼️ Image
      </button>
      <button onClick={() => commands.insertHorizontalRule()}>―</button>
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
