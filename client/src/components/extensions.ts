import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { lineNumbers, gutter } from "@codemirror/view";
import { keymap, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history } from "@codemirror/commands";
// import { githubMarkdown } from "@codemirror/lang-markdown"; // optional preset

export const editorExtensions = [
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    // extensions: [githubMarkdown()],
  }),
  history(),
  lineNumbers(),
  highlightActiveLine(),
  gutter({ class: "line-gutter" }),
  keymap.of(defaultKeymap),
];
