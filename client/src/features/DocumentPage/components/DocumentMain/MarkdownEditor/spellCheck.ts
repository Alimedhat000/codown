// Advanced Spellcheck Extension using Typo.js
// Installation: npm install typo-js @types/typo-js

import { Extension } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import Typo from 'typo-js';

// Dictionary manager class
class DictionaryManager {
  private static instance: DictionaryManager;
  private dictionaries: Map<string, Typo> = new Map();
  private loadingPromises: Map<string, Promise<Typo>> = new Map();

  static getInstance(): DictionaryManager {
    if (!DictionaryManager.instance) {
      DictionaryManager.instance = new DictionaryManager();
    }
    return DictionaryManager.instance;
  }

  async loadDictionary(language: string = 'en_US'): Promise<Typo> {
    if (this.dictionaries.has(language)) {
      return this.dictionaries.get(language)!;
    }

    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language)!;
    }

    const loadPromise = this.fetchDictionary(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      const dictionary = await loadPromise;
      this.dictionaries.set(language, dictionary);
      this.loadingPromises.delete(language);
      return dictionary;
    } catch (error) {
      this.loadingPromises.delete(language);
      throw error;
    }
  }

  private async fetchDictionary(language: string): Promise<Typo> {
    try {
      // You can host these files locally or use a CDN
      const baseUrl = `https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/${language}`;

      const [affResponse, dicResponse] = await Promise.all([
        fetch(`${baseUrl}/${language}.aff`),
        fetch(`${baseUrl}/${language}.dic`),
      ]);

      if (!affResponse.ok || !dicResponse.ok) {
        throw new Error(`Failed to load dictionary for ${language}`);
      }

      const affData = await affResponse.text();
      const dicData = await dicResponse.text();

      return new Typo(language, affData, dicData, {
        // platform: 'any',
      });
    } catch (error) {
      console.warn(`Failed to load dictionary for ${language}:`, error);
      // Fallback to a basic dictionary with common words
      return this.createBasicDictionary();
    }
  }

  private createBasicDictionary(): Typo {
    // Create a basic fallback dictionary
    const commonWords = [
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'in',
      'that',
      'have',
      'it',
      'for',
      'not',
      'on',
      'with',
      'he',
      'as',
      'you',
      'do',
      'at',
      'this',
      'but',
      'his',
      'by',
      'from',
      'they',
      'we',
      'say',
      'her',
      'she',
      'or',
      'an',
      'will',
      'my',
      'one',
      'all',
      'would',
      'there',
      'their',
      'what',
      'so',
      'up',
      'out',
      'if',
      'about',
      'who',
      'get',
      'which',
      'go',
      'me',
      'when',
      'make',
      'can',
      'like',
      'time',
      'no',
      'just',
      'him',
      'know',
      'take',
      'people',
      'into',
      'year',
      'your',
      'good',
      'some',
      'could',
      'them',
      'see',
      'other',
      'than',
      'then',
      'now',
      'look',
      'only',
      'come',
      'its',
      'over',
      'think',
      'also',
      'back',
      'after',
      'use',
      'two',
      'how',
      'our',
      'work',
      'first',
      'well',
      'way',
      'even',
      'new',
      'want',
      'because',
      'any',
      'these',
      'give',
      'day',
      'most',
      'us',
    ];

    // Create a minimal dictionary structure
    return {
      check: (word: string) => {
        return (
          commonWords.includes(word.toLowerCase()) ||
          /^[A-Z][a-z]*$/.test(word) || // Proper nouns
          /^\d+$/.test(word) || // Numbers
          word.length <= 2
        ); // Short words
      },
      suggest: (word: string) => {
        // Basic suggestions based on common misspellings
        const suggestions: string[] = [];
        const lower = word.toLowerCase();

        // Common corrections
        const corrections: Record<string, string[]> = {
          teh: ['the'],
          recieve: ['receive'],
          seperate: ['separate'],
          occured: ['occurred'],
          definately: ['definitely'],
          accomodate: ['accommodate'],
          achieve: ['achieve'],
          beleive: ['believe'],
          calender: ['calendar'],
          cemetary: ['cemetery'],
        };

        if (corrections[lower]) {
          suggestions.push(...corrections[lower]);
        }

        return suggestions.slice(0, 5); // Limit to 5 suggestions
      },
    } as Typo;
  }

  getDictionary(language: string = 'en_US'): Typo | null {
    return this.dictionaries.get(language) || null;
  }
}

// Suggestion widget for displaying spelling corrections
class SuggestionWidget extends WidgetType {
  constructor(
    private suggestions: string[],
    private onSelect: (suggestion: string) => void,
    private onIgnore: () => void,
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'cm-spellcheck-suggestions';

    const list = document.createElement('ul');
    list.className = 'cm-suggestions-list';

    // Add suggestions
    this.suggestions.slice(0, 5).forEach((suggestion) => {
      const item = document.createElement('li');
      item.className = 'cm-suggestion-item';
      item.textContent = suggestion;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.onSelect(suggestion);
      });
      list.appendChild(item);
    });

    // Add ignore option
    const ignoreItem = document.createElement('li');
    ignoreItem.className = 'cm-suggestion-item cm-suggestion-ignore';
    ignoreItem.textContent = 'Ignore';
    ignoreItem.addEventListener('click', (e) => {
      e.preventDefault();
      this.onIgnore();
    });
    list.appendChild(ignoreItem);

    wrapper.appendChild(list);
    return wrapper;
  }
}

// Spellcheck plugin
const createSpellcheckPlugin = (language: string = 'en_US') => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private dictionary: Typo | null = null;
      private ignoredWords: Set<string> = new Set(['https', 'http', 'github']);
      private showSuggestions: Map<number, boolean> = new Map();

      constructor(_view: EditorView) {
        this.decorations = Decoration.none;
        this.loadDictionary(language);
      }

      private async loadDictionary(lang: string) {
        try {
          const dictManager = DictionaryManager.getInstance();
          this.dictionary = await dictManager.loadDictionary(lang);
          // Trigger a rebuild of decorations once dictionary is loaded
          if (this.dictionary) {
            // Force an update by dispatching an empty transaction
            const view = (this as any).view;
            if (view) {
              view.dispatch({});
            }
          }
        } catch (error) {
          console.error('Failed to load spellcheck dictionary:', error);
        }
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          !this.decorations.size
        ) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      private buildDecorations(view: EditorView): DecorationSet {
        if (!this.dictionary) {
          return Decoration.none;
        }

        const decorations: any[] = [];
        const doc = view.state.doc;

        // Enhanced word regex that handles contractions and hyphenated words
        const wordRegex = /\b[a-zA-Z]+(?:[''][a-zA-Z]+)*(?:-[a-zA-Z]+)*\b/g;

        for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
          const line = doc.line(lineNum);
          const text = line.text;
          let match;

          wordRegex.lastIndex = 0;
          while ((match = wordRegex.exec(text)) !== null) {
            const word = match[0];
            const from = line.from + match.index;
            const to = from + word.length;

            // Skip if word is ignored or if it's a proper noun in markdown context (e.g., after #)
            if (
              this.ignoredWords.has(word.toLowerCase()) ||
              this.isInMarkdownContext(text, match.index)
            ) {
              continue;
            }

            if (!this.dictionary.check(word)) {
              const misspelledDecoration = Decoration.mark({
                class: 'cm-misspelled',
                attributes: {
                  'data-word': word,
                  'data-from': from.toString(),
                  'data-to': to.toString(),
                },
              });

              decorations.push(misspelledDecoration.range(from, to));
            }
          }
        }

        return Decoration.set(decorations);
      }

      private isInMarkdownContext(text: string, wordIndex: number): boolean {
        // Check if word is in a code block, link, or after a heading marker
        const beforeWord = text.substring(0, wordIndex);

        // Skip words in inline code
        const backtickCount = (beforeWord.match(/`/g) || []).length;
        if (backtickCount % 2 === 1) return true;

        // Skip words in links
        if (
          beforeWord.includes('[') &&
          beforeWord.lastIndexOf('[') > beforeWord.lastIndexOf(']')
        ) {
          return true;
        }

        // Skip words after heading markers at line start
        if (/^\s*#+\s/.test(beforeWord)) return true;

        return false;
      }

      private showSuggestionsForWord(
        view: EditorView,
        from: number,
        to: number,
        word: string,
      ) {
        if (!this.dictionary) return;

        const suggestions = this.dictionary.suggest(word);
        if (suggestions.length === 0) return;

        const _widget = new SuggestionWidget(
          suggestions,
          (suggestion) => {
            // Replace the misspelled word with the suggestion
            view.dispatch({
              changes: { from, to, insert: suggestion },
              selection: { anchor: from + suggestion.length },
            });
          },
          () => {
            // Add word to ignored list
            this.ignoredWords.add(word.toLowerCase());
            // Rebuild decorations to remove this word's highlighting
            this.decorations = this.buildDecorations(view);
          },
        );

        // This would need additional implementation to show the widget
        // For now, we'll just log the suggestions
        console.log(`Suggestions for "${word}":`, suggestions);
      }
    },
    {
      decorations: (v) => v.decorations,
      eventHandlers: {
        contextmenu: (event, _view) => {
          const target = event.target as HTMLElement;
          if (target.classList.contains('cm-misspelled')) {
            event.preventDefault();
            const word = target.getAttribute('data-word');
            const _from = parseInt(target.getAttribute('data-from') || '0');
            const _to = parseInt(target.getAttribute('data-to') || '0');

            if (word) {
              // Here you could show a context menu with suggestions
              console.log(`Context menu for misspelled word: ${word}`);
            }
          }
        },
      },
    },
  );
};

// Theme for spellcheck decorations
const spellcheckTheme = EditorView.theme({
  '.cm-misspelled': {
    textDecoration: 'underline wavy #dc2626',
    textUnderlineOffset: '2px',
    cursor: 'pointer',
  },
  '.cm-spellcheck-suggestions': {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxWidth: '200px',
  },
  '.cm-suggestions-list': {
    listStyle: 'none',
    margin: 0,
    padding: '4px 0',
  },
  '.cm-suggestion-item': {
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  '.cm-suggestion-ignore': {
    borderTop: '1px solid #eee',
    fontStyle: 'italic',
    color: '#666',
  },
});

// Main spellcheck extension factory
export function createAdvancedSpellcheckExtension(
  language: string = 'en_US',
): Extension {
  return [createSpellcheckPlugin(language), spellcheckTheme];
}

// Custom word management
export class SpellcheckManager {
  private static customWords: Set<string> = new Set();

  static addCustomWord(word: string) {
    this.customWords.add(word.toLowerCase());
  }

  static removeCustomWord(word: string) {
    this.customWords.delete(word.toLowerCase());
  }

  static isCustomWord(word: string): boolean {
    return this.customWords.has(word.toLowerCase());
  }

  static getCustomWords(): string[] {
    return Array.from(this.customWords);
  }
}
