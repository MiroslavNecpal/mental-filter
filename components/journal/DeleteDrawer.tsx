'use client';

import { JournalItem } from '@/types/journal';

interface DeleteDrawerProps {
  open: boolean;
  item: JournalItem | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export default function DeleteDrawer({
  open,
  item,
  onClose,
  onConfirm,
}: DeleteDrawerProps) {
  if (!item) return null;

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div
        className={`drawer delete-drawer ${open ? 'open' : ''}`}
        role="dialog"
      >
        <div className="drawer-handle" />
        <div className="delete-drawer-body">
          <p className="delete-drawer-label">Vymazať záznam?</p>
          <p className="delete-drawer-preview">&bdquo;{item.text}&ldquo;</p>
        </div>
        <div className="delete-drawer-actions">
          <button className="delete-btn-cancel" onClick={onClose}>
            Zrušiť
          </button>
          <button
            className="delete-btn-confirm"
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
          >
            Vymazať
          </button>
        </div>
      </div>
    </>
  );
}
