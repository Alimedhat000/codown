import type { IconType } from 'react-icons';
import {
  LuUndo,
  LuRedo,
  LuBold,
  LuItalic,
  LuStrikethrough,
  LuHeading,
  LuQuote,
  LuCode,
  LuList,
  LuListOrdered,
  LuListChecks,
  LuLink,
  LuImage,
  LuMinus,
  LuTable,
  LuSubscript,
  LuSuperscript,
} from 'react-icons/lu';

type RunCommandArgs = [before: string, after?: string, prefixNewline?: boolean];

type ToolbarCommand =
  | {
      type: 'button';
      icon: IconType;
      title: string;
      action: 'undo' | 'redo' | 'orderedList';
    }
  | {
      type: 'button';
      icon: IconType;
      title: string;
      action: 'command';
      args: RunCommandArgs;
    }
  | { type: 'divider' };

export const toolbarButtons: ToolbarCommand[] = [
  { type: 'button', icon: LuUndo, title: 'Undo', action: 'undo' },
  { type: 'button', icon: LuRedo, title: 'Redo', action: 'redo' },
  { type: 'divider' },

  {
    type: 'button',
    icon: LuBold,
    title: 'Bold',
    action: 'command',
    args: ['**'],
  },
  {
    type: 'button',
    icon: LuItalic,
    title: 'Italic',
    action: 'command',
    args: ['*'],
  },
  {
    type: 'button',
    icon: LuStrikethrough,
    title: 'Strikethrough',
    action: 'command',
    args: ['~~'],
  },
  {
    type: 'button',
    icon: LuHeading,
    title: 'Heading',
    action: 'command',
    args: ['# ', '', true],
  },
  {
    type: 'button',
    icon: LuSubscript,
    title: 'Subscript',
    action: 'command',
    args: ['_', '_', false],
  },
  {
    type: 'button',
    icon: LuSuperscript,
    title: 'Superscript',
    action: 'command',
    args: ['^', '^', false],
  },
  { type: 'divider' },

  {
    type: 'button',
    icon: LuCode,
    title: 'Inline Code',
    action: 'command',
    args: ['`'],
  },
  {
    type: 'button',
    icon: LuQuote,
    title: 'Quote',
    action: 'command',
    args: ['> ', '', true],
  },
  {
    type: 'button',
    icon: LuList,
    title: 'Bullet List',
    action: 'command',
    args: ['- ', '', true],
  },
  {
    type: 'button',
    icon: LuListOrdered,
    title: 'Numbered List',
    action: 'orderedList',
  },
  {
    type: 'button',
    icon: LuListChecks,
    title: 'Task List',
    action: 'command',
    args: ['- [ ] ', '', true],
  },
  { type: 'divider' },

  {
    type: 'button',
    icon: LuLink,
    title: 'Link',
    action: 'command',
    args: ['[', '](url)'],
  },
  {
    type: 'button',
    icon: LuImage,
    title: 'Image',
    action: 'command',
    args: ['![', '](image-url)'],
  },
  {
    type: 'button',
    icon: LuMinus,
    title: 'Line',
    action: 'command',
    args: ['--- \n\n', '', false],
  },
  {
    type: 'button',
    icon: LuTable,
    title: 'Table',
    action: 'command',
    args: [
      `| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n`,
    ],
  },
];
