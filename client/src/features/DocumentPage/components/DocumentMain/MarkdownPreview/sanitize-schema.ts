import { defaultSchema } from 'hast-util-sanitize';
import type { Options } from 'rehype-sanitize';

const HIGHLIGHT_CLASS_PATTERN = /^(hljs(-[\w-]+)?|language-[\w-]+)$/;

/**
 * Allow-list schema extending hast-util-sanitize defaults for the preview pipeline.
 */
export const markdownSanitizeSchema: Options = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ['className', HIGHLIGHT_CLASS_PATTERN],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      ['className', HIGHLIGHT_CLASS_PATTERN],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ['className', HIGHLIGHT_CLASS_PATTERN],
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ['className', HIGHLIGHT_CLASS_PATTERN],
    ],
  },
};
