'use client';

import { DrawerSection } from '@/types/journal';

interface FabPickerProps {
  open: boolean;
  onPick: (section: DrawerSection) => void;
  onClose: () => void;
}

export default function FabPicker({ open, onPick, onClose }: FabPickerProps) {
  return (
    <>
      <div
        className={`drawer-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div className={`fab-picker ${open ? 'open' : ''}`}>
        <div className="drawer-handle" />
        <button
          className="fab-pick-btn fab-pick-good"
          onClick={() => onPick('good')}
        >
          Podarilo sa
        </button>
        <button
          className="fab-pick-btn fab-pick-bad"
          onClick={() => onPick('bad')}
        >
          Príležitosť
        </button>
        <button className="fab-pick-cancel" onClick={onClose}>
          Zrušiť
        </button>
      </div>
    </>
  );
}
