export const toKey = (date: Date): string => date.toISOString().split('T')[0];

export const today = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const formatDay = (date: Date): string =>
  date.toLocaleDateString('sk-SK', { weekday: 'long' });

export const formatDate = (date: Date): string =>
  date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const isToday = (date: Date): boolean => toKey(date) === toKey(today());

export const isFuture = (date: Date): boolean => date > today();
