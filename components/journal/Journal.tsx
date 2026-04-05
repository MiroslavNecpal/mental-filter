'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  JournalEntries,
  JournalEntry,
  AnimDirection,
  DrawerSection,
  DeleteTarget,
} from '@/types/journal';
import {
  toKey,
  today,
  addDays,
  formatDay,
  formatDate,
  isToday,
  isFuture,
} from '@/lib/date-utils';
import { loadEntries, saveEntries, makeItem } from '@/lib/storage';
import Lightbox from './Lightbox';
import FabPicker from './FabPicker';
import AddDrawer from './AddDrawer';
import DeleteDrawer from './DeleteDrawer';
import Section from './Section';

export default function Journal() {
  const [viewDate, setViewDate] = useState(today());
  const [entries, setEntries] = useState<JournalEntries>(loadEntries);
  const [animDir, setAnimDir] = useState<AnimDirection>(null);
  const [animating, setAnimating] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [drawer, setDrawer] = useState<DrawerSection>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const key = toKey(viewDate);
  const entry: JournalEntry = entries[key] || { good: [], bad: [] };
  const editable = isToday(viewDate);
  const future = isFuture(viewDate);
  const anyOpen = fabOpen || !!drawer || !!lightbox || !!deleteTarget;

  const navigate = useCallback(
    (dir: 'next' | 'prev') => {
      if (animating) return;
      setAnimDir(dir);
      setAnimating(true);
      setTimeout(() => {
        setViewDate(d => addDays(d, dir === 'next' ? 1 : -1));
        setAnimDir(null);
        setAnimating(false);
      }, 200);
    },
    [animating]
  );

  const updateEntry = (patch: Partial<JournalEntry>) => {
    const u = { ...entries, [key]: { ...entry, ...patch } };
    setEntries(u);
    saveEntries(u);
  };

  const addItem = (f: 'good' | 'bad', t: string, p: string | null) =>
    updateEntry({ [f]: [...(entry[f] || []), makeItem(t, p)] });

  const removeItem = (f: 'good' | 'bad', id: number) =>
    updateEntry({ [f]: (entry[f] || []).filter(i => i.id !== id) });

  const onTouchStart = (e: React.TouchEvent) => {
    if (anyOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (anyOpen || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current!);
    if (Math.abs(dx) > 50 && dy < 60) navigate(dx < 0 ? 'next' : 'prev');
    touchStartX.current = null;
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFabOpen(false);
        setDrawer(null);
        setLightbox(null);
        setDeleteTarget(null);
        return;
      }
      if (anyOpen) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'ArrowRight') navigate('next');
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [navigate, anyOpen]);

  const slideClass = animDir
    ? animDir === 'next'
      ? 'slide-out-left'
      : 'slide-out-right'
    : 'slide-in';

  const goodCount = (entry.good || []).length;
  const badCount = (entry.bad || []).length;

  return (
    <>
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      <div
        className="shell"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={`page-wrap ${slideClass}`} key={key}>
          {/* Date header — centered */}
          <div className="date-header">
            <div className="day-name">{formatDay(viewDate)}</div>
            <div className="date-full">{formatDate(viewDate)}</div>
          </div>

          {future ? (
            <div className="future-msg">Ešte nenastalo</div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="summary-row">
                <div className="summary-card summary-card-good">
                  <span className="summary-count">{goodCount}</span>
                  <span className="summary-label">zvládol som</span>
                </div>
                <div className="summary-card summary-card-bad">
                  <span className="summary-count">{badCount}</span>
                  <span className="summary-label">nezvládol som</span>
                </div>
              </div>

              {/* Sections */}
              <Section
                title="Zvládol som"
                dotClass="dot-good-solid"
                variant="good"
                items={entry.good || []}
                editable={editable}
                onDeleteRequest={item =>
                  setDeleteTarget({ field: 'good', item })
                }
                onLightbox={setLightbox}
              />
              <Section
                title="Nezvládol som"
                dotClass="dot-bad-solid"
                variant="bad"
                items={entry.bad || []}
                editable={editable}
                onDeleteRequest={item =>
                  setDeleteTarget({ field: 'bad', item })
                }
                onLightbox={setLightbox}
              />
            </>
          )}
        </div>

        {/* FAB */}
        {editable && (
          <button
            className={`fab ${fabOpen ? 'open' : ''}`}
            onClick={() => setFabOpen(o => !o)}
            aria-label="Pridať záznam"
          >
            +
          </button>
        )}
      </div>

      {/* FAB section picker */}
      <FabPicker
        open={fabOpen}
        onPick={section => {
          setFabOpen(false);
          setDrawer(section);
        }}
        onClose={() => setFabOpen(false)}
      />

      <AddDrawer
        open={!!drawer}
        section={drawer || 'good'}
        onClose={() => setDrawer(null)}
        onAdd={(text, photo) => addItem(drawer!, text, photo)}
      />

      <DeleteDrawer
        open={!!deleteTarget}
        item={deleteTarget?.item || null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={id => removeItem(deleteTarget!.field, id)}
      />
    </>
  );
}
