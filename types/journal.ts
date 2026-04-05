export interface JournalItem {
  id: number;
  text: string;
  photo: string | null;
}

export interface JournalEntry {
  good: JournalItem[];
  bad: JournalItem[];
}

export interface JournalEntries {
  [key: string]: JournalEntry;
}

export interface DeleteTarget {
  field: 'good' | 'bad';
  item: JournalItem;
}

export type AnimDirection = 'next' | 'prev' | null;
export type DrawerSection = 'good' | 'bad' | null;
