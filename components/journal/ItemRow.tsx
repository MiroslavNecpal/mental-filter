'use client';

import { JournalItem } from '@/types/journal';

interface ItemRowProps {
  item: JournalItem;
  editable: boolean;
  variant: 'good' | 'bad';
  onDeleteRequest: (item: JournalItem) => void;
  onLightbox: (src: string) => void;
}

export default function ItemRow({
  item,
  editable,
  variant,
  onDeleteRequest,
  onLightbox,
}: ItemRowProps) {
  return (
    <div className={`item-row item-row-${variant}`}>
      <span className="item-text">{item.text}</span>
      <div className="item-actions">
        {item.photo && (
          <button
            className="item-photo-btn"
            onClick={() => onLightbox(item.photo!)}
          >
            📷
          </button>
        )}
        {editable && (
          <button
            className="item-delete-btn"
            onClick={() => onDeleteRequest(item)}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
