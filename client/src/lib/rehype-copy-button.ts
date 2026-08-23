import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeCopyHeadingLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName) && node.properties?.id) {
        const id = node.properties.id;

        node.children.push({
          type: 'element',
          tagName: 'button',
          properties: {
            className: [
              'ml-2',
              'text-sm',
              'text-blue-400',
              'hover:underline',
              'copy-button',
              'cursor-pointer',
              'border-none',
              'bg-transparent',
            ],
            onclick: `navigator.clipboard.writeText(location.href.split('#')[0] + '#${id}')`,
          },
          children: [{ type: 'text', value: '🔗' }],
        } as Element);
      }
    });
  };
}
