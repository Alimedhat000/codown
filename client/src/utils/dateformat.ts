import { formatDistanceToNow } from 'date-fns';

export function dateFormat(date: Date) {
  const timeAgo = formatDistanceToNow(date, {
    addSuffix: true,
  });

  return timeAgo;
}
