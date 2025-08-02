import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

// Define the replacement patterns
const typographerPatterns = [
  // Copyright and trademark symbols
  { pattern: /\(c\)/gi, replacement: '©' },
  { pattern: /\(r\)/gi, replacement: '®' },
  { pattern: /\(tm\)/gi, replacement: '™' },

  // Plus-minus
  { pattern: /\+-/g, replacement: '±' },

  // Ellipsis - multiple dots (2 or more) become single ellipsis
  { pattern: /\.{2,}/g, replacement: '…' },

  // Multiple exclamation marks - 3 or more become 3
  { pattern: /!{4,}/g, replacement: '!!!' },

  // Multiple question marks - 3 or more become 3
  { pattern: /\?{4,}/g, replacement: '???' },

  // Double comma becomes single comma
  { pattern: /,,\s*/g, replacement: ', ' },

  // Em dash - triple hyphen
  { pattern: /---/g, replacement: '—' },

  // En dash - double hyphen
  { pattern: /--/g, replacement: '–' },

  // Double quotes
  {
    pattern: /"([^"]+?)"/g,
    replacement: '“$1”',
  },

  // Single quotes
  {
    pattern: /'([^']+?)'/g,
    replacement: '‘$1’',
  },
];

export const remarkTypographer: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'text', (node: any) => {
      let { value } = node;

      // Apply all typographer patterns
      for (const { pattern, replacement } of typographerPatterns) {
        value = value.replace(pattern, replacement);
      }

      // Update the node value if it changed
      if (value !== node.value) {
        node.value = value;
      }
    });
  };
};
