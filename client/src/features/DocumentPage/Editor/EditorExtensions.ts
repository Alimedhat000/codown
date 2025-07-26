import { defaultKeymap, history } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { foldGutter, foldKeymap } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { lineNumbers, gutter } from '@codemirror/view';
import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
// import { githubMarkdown } from "@codemirror/lang-markdown"; // optional preset

export const editorExtensions = [
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
  }),
  history(),
  lineNumbers(),
  foldGutter({
    openText: '▾',
    closedText: '▸',
    markerDOM(open) {
      const marker = document.createElement('span');
      marker.className = open
        ? 'cm-fold-marker cm-fold-open'
        : 'cm-fold-marker cm-fold-closed';
      marker.textContent = open ? '▾' : '▸';
      return marker;
    },
  }),
  highlightActiveLine(),
  gutter({ class: 'line-gutter' }),
  keymap.of(defaultKeymap),
  keymap.of(foldKeymap),
  EditorView.lineWrapping,
];
