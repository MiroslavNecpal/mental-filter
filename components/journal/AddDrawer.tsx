'use client';

import { useState, useEffect, useRef } from 'react';
import { DrawerSection } from '@/types/journal';

interface AddDrawerProps {
  open: boolean;
  section: DrawerSection;
  onClose: () => void;
  onAdd: (text: string, photo: string | null) => void;
}

export default function AddDrawer({
  open,
  section,
  onClose,
  onAdd,
}: AddDrawerProps) {
  const [val, setVal] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setVal('');
      setPhoto(null);
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open, section]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const submit = () => {
    const t = val.trim();
    if (!t) return;
    onAdd(t, photo);
    onClose();
  };

  const isGood = section === 'good';

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div className={`drawer ${open ? 'open' : ''}`} role="dialog">
        <div className="drawer-handle" />
        <div className="drawer-header">
          <div className="drawer-title">
            <span
              className={`drawer-dot ${isGood ? 'dot-good-solid' : 'dot-bad-solid'}`}
            />
            {isGood ? 'Zvládol som' : 'Na budúce'}
          </div>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {photo && (
          <div className="drawer-photo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" />
            <button
              className="drawer-photo-remove"
              onClick={() => setPhoto(null)}
            >
              ✕
            </button>
          </div>
        )}

        <textarea
          ref={inputRef}
          className="drawer-textarea"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Napíš záznam…"
          rows={4}
          maxLength={300}
        />

        <div className="drawer-actions">
          <button
            className="drawer-photo-btn"
            onClick={() => fileRef.current?.click()}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {photo ? 'Zmeniť' : 'Fotka'}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <button
            className="drawer-submit"
            onClick={submit}
            disabled={!val.trim()}
          >
            Uložiť
          </button>
        </div>
      </div>
    </>
  );
}
