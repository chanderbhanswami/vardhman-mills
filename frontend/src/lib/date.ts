export { formatDistanceToNow, formatDate, formatRelative } from 'date-fns';

export const formatCustomDate = (date: Date | string, format?: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(format === 'full' && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }).format(new Date(date));
};