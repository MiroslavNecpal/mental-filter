'use client';

import { JournalItem } from '@/types/journal';
import ItemRow from './ItemRow';

interface SectionProps {
  title: string;
  variant: 'good' | 'bad';
  items: JournalItem[];
  onDeleteRequest: (item: JournalItem) => void;
  onLightbox: (src: string) => void;
  editable: boolean;
}

export default function Section({
  title,
  variant,
  items,
  onDeleteRequest,
  onLightbox,
  editable,
}: SectionProps) {
  if (items.length === 0 && !editable) return null;

  return (
    <div className="section">
      <div className={`section-label section-label-${variant}`}>{title}</div>
      <div className="section-card">
        {items.length === 0 ? (
          <p className="item-empty">Žiadny záznam</p>
        ) : (
          items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              editable={editable}
              variant={variant}
              onDeleteRequest={onDeleteRequest}
              onLightbox={onLightbox}
            />
          ))
        )}
      </div>
    </div>
  );
}
