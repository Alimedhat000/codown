import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
});

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
        const clean = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
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
