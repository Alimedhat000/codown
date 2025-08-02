import { EditorView } from 'codemirror';

import { cn } from '@/utils/cn';

import { ToolbarButton } from './toolbar-button';
import { toolbarButtons } from './toolbar-buttons';
import { useMarkdownCommands } from './useMarkdownCommands';

export function MarkdownToolbar({
  view,
  className,
}: {
  view: EditorView | null;
  className?: string;
}) {
  const { handleUndo, handleRedo, runCommand, runOrderedListCommand } =
    useMarkdownCommands(view);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-0.5 bg-header text-white border-b border-t border-border overflow-x-auto scrollbar-hide',
        className,
      )}
    >
      {toolbarButtons.map((btn, idx) => {
        if (btn.type === 'divider') {
          return (
            <div key={idx} className="mx-1 border-l border-zinc-600 h-4" />
          );
        }

        const { icon, title, action } = btn;

        let onClick = () => {};
        if (action === 'undo') onClick = handleUndo;
        else if (action === 'redo') onClick = handleRedo;
        else if (action === 'orderedList') onClick = runOrderedListCommand;
        else if (action === 'command') onClick = () => runCommand(...btn.args);

        return (
          <ToolbarButton
            key={title}
            icon={icon}
            title={title}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
}
