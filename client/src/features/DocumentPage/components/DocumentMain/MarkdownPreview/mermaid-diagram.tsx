import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
});

const SVG_SANITIZE_CONFIG: Config = {
  USE_PROFILES: { html: true, svg: true, svgFilters: true },
  ADD_TAGS: ['foreignobject'],
  HTML_INTEGRATION_POINTS: {
    'annotation-xml': true,
    foreignobject: true,
  },
  FORBID_CONTENTS: [
    'annotation-xml',
    'audio',
    'colgroup',
    'desc',
    'head',
    'iframe',
    'math',
    'mi',
    'mn',
    'mo',
    'ms',
    'mtext',
    'noembed',
    'noframes',
    'noscript',
    'plaintext',
    'script',
    'selectedcontent',
    'style',
    'svg',
    'template',
    'thead',
    'title',
    'video',
    'xmp',
  ],
};

/**
 * Renders fenced mermaid code to SVG asynchronously.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const renderId = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSvg('');

    mermaid
      .render(renderId, code)
      .then(({ svg }) => {
        if (cancelled) return;
        const clean = DOMPurify.sanitize(svg, SVG_SANITIZE_CONFIG);
        setSvg(clean);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [code, renderId]);

  if (failed) {
    return (
      <pre className="bg-surface rounded-md overflow-x-auto p-4">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="language-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
