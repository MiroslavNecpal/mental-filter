import { JournalEntries, JournalItem } from '@/types/journal';

const STORAGE_KEY = 'journal_entries_v4';

export function loadEntries(): JournalEntries {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveEntries(entries: JournalEntries): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function makeItem(
  text: string,
  photo: string | null = null
): JournalItem {
  return { id: Date.now() + Math.random(), text, photo };
}
