import { EditorView } from 'codemirror';
import React from 'react';
import { LuCheck, LuX } from 'react-icons/lu';

import { cn } from '@/utils/cn';

import { useEditorStatus } from './useEditorStatus';

export interface MarkdownStatusBarProps {
  className?: string;
  view: EditorView | null;
  useTabs: boolean;
  setUseTabs: React.Dispatch<React.SetStateAction<boolean>>;
  spellcheck: boolean;
  setSpellcheck: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MarkdownStatusBar = ({
  className,
  view,
  useTabs,
  setUseTabs,
  spellcheck,
  setSpellcheck,
}: MarkdownStatusBarProps) => {
  const status = useEditorStatus(view);

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 py-0.5 bg-header text-muted-foreground border-y border-border text-sm',
        className,
      )}
    >
      <div>
        Line {status.line}, Col {status.column} — {status.totalLines} Lines
      </div>
      <div className="flex items-center gap-4">
        <div
          className="cursor-pointer hover:underline"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            setSpellcheck(!spellcheck);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSpellcheck(!spellcheck);
            }
          }}
        >
          {spellcheck ? <LuCheck /> : <LuX />}
        </div>
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer hover:underline"
          onClick={(e) => {
            e.preventDefault();
            setUseTabs(!useTabs);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setUseTabs(!useTabs);
            }
          }}
        >
          {useTabs ? 'Tab' : 'Spaces'}: 4
        </div>
        <div>Length: {status.length}</div>
      </div>
    </div>
  );
};
