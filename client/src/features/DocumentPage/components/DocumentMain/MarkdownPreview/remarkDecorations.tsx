import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// Regex patterns for text decorations
const textDecorationRegex = /(\+\+([^+]+)\+\+)|(==([^=]+)==)/g;

export const rehypeTextDecorations: Plugin = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const { value } = node;
      const matches = [...value.matchAll(textDecorationRegex)];

      if (matches.length === 0) return;

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [fullMatch, insFull, insText, markFull, markText] = match;
        const start = match.index!;

        // Add text before the match
        if (start > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, start),
          });
        }

        // Create proper hast nodes (HTML AST)
        if (insFull && insText) {
          // ++text++ becomes <ins>text</ins>
          children.push({
            type: 'element',
            tagName: 'ins',
            properties: {},
            children: [{ type: 'text', value: insText }],
          });
        } else if (markFull && markText) {
          // ==text== becomes <mark>text</mark>
          children.push({
            type: 'element',
            tagName: 'mark',
            properties: {},
            children: [{ type: 'text', value: markText }],
          });
        }

        lastIndex = start + fullMatch.length;
      }

      // Add remaining text after the last match
      if (lastIndex < value.length) {
        children.push({
          type: 'text',
          value: value.slice(lastIndex),
        });
      }

      // Replace the original text node with the new children
      parent.children.splice(index, 1, ...children);
    });
  };
};
