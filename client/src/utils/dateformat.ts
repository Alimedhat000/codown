import { formatDistanceToNow } from 'date-fns';

/**
 * Humanized relative timestamp ("about 5 minutes ago") via date-fns.
 */
export function dateFormat(date: Date) {
  const timeAgo = formatDistanceToNow(date, {
    addSuffix: true,
  });

  return timeAgo;
}
