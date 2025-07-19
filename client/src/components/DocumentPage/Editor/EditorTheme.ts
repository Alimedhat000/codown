import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const config = {
  name: "dracula",
  dark: true,
  background: "#27272a",
  foreground: "#d4d4d8",
  selection: "#303036",
  cursor: "#9894f9",
  dropdownBackground: "#282A36",
  dropdownBorder: "#191A21",
  activeLine: "#53576c22",
  lineNumber: "#52525b",
  lineNumberActive: "#F8F8F2",
  matchingBracket: "#44475A",
  keyword: "#FF79C6",
  storage: "#FF79C6",
  variable: "#F8F8F2",
  parameter: "#F8F8F2",
  function: "#50FA7B",
  string: "#F1FA8C",
  constant: "#BD93F9",
  type: "#8BE9FD",
  class: "#8BE9FD",
  number: "#BD93F9",
  comment: "#6272A4",
  heading: "#9894f9",
  invalid: "#FF5555",
  regexp: "#F1FA8C",
};
const draculaTheme = EditorView.theme(
  {
    "&": {
      color: config.foreground,
      fontSize: "1.1rem",
      backgroundColor: config.background,
    },
    ".cm-content": { caretColor: config.cursor },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: config.cursor },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: config.selection },
    ".cm-panels": {
      backgroundColor: config.dropdownBackground,
      color: config.foreground,
    },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },
    ".cm-searchMatch": {
      backgroundColor: config.dropdownBackground,
      outline: `1px solid ${config.dropdownBorder}`,
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: config.selection,
    },
    ".cm-activeLine": { backgroundColor: config.activeLine },
    ".cm-selectionMatch": { backgroundColor: config.selection },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: config.matchingBracket,
      outline: "none",
    },
    ".cm-gutters": {
      backgroundColor: config.background,
      color: config.foreground,
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: config.background },
    ".cm-lineNumbers .cm-gutterElement": { color: config.lineNumber },
    ".cm-lineNumbers .cm-activeLineGutter": { color: config.lineNumberActive },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: config.foreground,
    },
    ".cm-tooltip": {
      border: `1px solid ${config.dropdownBorder}`,
      backgroundColor: config.dropdownBackground,
      color: config.foreground,
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: config.foreground,
      borderBottomColor: config.foreground,
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        background: config.selection,
        color: config.foreground,
      },
    },
  },
  { dark: config.dark }
);
const draculaHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: config.keyword },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.macroName],
    color: config.variable,
  },
  { tag: [tags.propertyName], color: config.function },
  {
    tag: [
      tags.processingInstruction,
      tags.string,
      tags.inserted,
      tags.special(tags.string),
    ],
    color: config.string,
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: config.function,
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: config.constant,
  },
  { tag: [tags.definition(tags.name), tags.separator], color: config.variable },
  { tag: [tags.className], color: config.class },
  {
    tag: [
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: config.number,
  },
  { tag: [tags.typeName], color: config.type, fontStyle: config.type },
  { tag: [tags.operator, tags.operatorKeyword], color: config.keyword },
  {
    tag: [tags.url, tags.escape, tags.regexp, tags.link],
    color: config.regexp,
  },
  { tag: [tags.meta, tags.comment], color: config.comment },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.heading, fontWeight: "bold", color: config.heading },
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: config.variable,
  },
  { tag: tags.invalid, color: config.invalid },
  { tag: tags.strikethrough, textDecoration: "line-through" },
]);
const MyTheme = [draculaTheme, syntaxHighlighting(draculaHighlightStyle)];

export { config, MyTheme, draculaHighlightStyle, draculaTheme };
