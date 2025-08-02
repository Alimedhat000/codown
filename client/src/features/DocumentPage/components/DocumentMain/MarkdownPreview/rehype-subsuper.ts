import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// const supersubRegex = /(\^([^\s]+))(?=\s)|(_([^\s]+))(?=\s)/g;
const supersubRegex = /(\^([^\s^]+))(?=\s|$)|(_([^\s_]+))(?=\s|$)/g;

export const rehypeSupSub: Plugin = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const { value } = node;

      // Debug: log what we're processing
      if (value.includes('^[') || value.includes('~[')) {
        // console.log('Processing text:', value);
      }

      const matches = [...value.matchAll(supersubRegex)];

      if (matches.length === 0) return;

      // console.log('Found matches:', matches);

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [fullMatch, supFull, supText, subFull, subText] = match;
        const start = match.index!;

        // Add text before the match
        if (start > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, start),
          });
        }

        // Create proper hast nodes (HTML AST)
        if (supFull) {
          // console.log('Creating sup element for:', supText);
          children.push({
            type: 'element',
            tagName: 'sup',
            properties: {},
            children: [{ type: 'text', value: supText }],
          });
        } else if (subFull) {
          // console.log('Creating sub element for:', subText);
          children.push({
            type: 'element',
            tagName: 'sub',
            properties: {},
            children: [{ type: 'text', value: subText }],
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
