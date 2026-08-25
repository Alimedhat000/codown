import { useEffect, useState } from 'react';

/**
 * Live boolean match state for a CSS media query string.
 *
 * @param query - CSS media query to watch, e.g. '(min-width: 768px)';
 *   the listener re-subscribes whenever it changes.
 * @returns Whether the query currently matches, kept live via the
 *   matchMedia change event.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', documentChangeHandler);

    return () => {
      mediaQueryList.removeEventListener('change', documentChangeHandler);
    };
  }, [query]);

  return matches;
}
