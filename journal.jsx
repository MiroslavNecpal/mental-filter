import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'journal_entries_v4';

const toKey = date => date.toISOString().split('T')[0];
const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const formatDay = date => date.toLocaleDateString('sk-SK', { weekday: 'long' });
const formatDate = date =>
  date.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
const isToday = date => toKey(date) === toKey(today());
const isFuture = date => date > today();

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveEntries(e) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
}
function makeItem(text, photo = null) {
  return { id: Date.now() + Math.random(), text, photo };
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>
      <img
        src={src}
        alt=""
        className="lightbox-img"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ── FAB picker — choose section ───────────────────────────────────────────────
function FabPicker({ open, onPick, onClose }) {
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
          <span className="fab-pick-dot dot-good-solid" />
          Zvládol som
        </button>
        <button
          className="fab-pick-btn fab-pick-bad"
          onClick={() => onPick('bad')}
        >
          <span className="fab-pick-dot dot-bad-solid" />
          Na budúce
        </button>
        <button className="fab-pick-cancel" onClick={onClose}>
          Zrušiť
        </button>
      </div>
    </>
  );
}

// ── Add Drawer ────────────────────────────────────────────────────────────────
function AddDrawer({ open, section, onClose, onAdd }) {
  const [val, setVal] = useState('');
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setVal('');
      setPhoto(null);
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open, section]);

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
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

// ── Delete Drawer ─────────────────────────────────────────────────────────────
function DeleteDrawer({ open, item, onClose, onConfirm }) {
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
          <p className="delete-drawer-preview">„{item.text}"</p>
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

// ── Item row ──────────────────────────────────────────────────────────────────
function ItemRow({ item, editable, variant, onDeleteRequest, onLightbox }) {
  return (
    <div className={`item-row item-row-${variant}`}>
      <span className="item-text">{item.text}</span>
      <div className="item-actions">
        {item.photo && (
          <button
            className="item-photo-btn"
            onClick={() => onLightbox(item.photo)}
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

// ── Section ───────────────────────────────────────────────────────────────────
function Section({
  title,
  dotClass,
  variant,
  items,
  onDeleteRequest,
  onLightbox,
  editable,
}) {
  if (items.length === 0 && !editable) return null;
  return (
    <div className="section">
      <div className="section-label">
        <span className={`section-dot ${dotClass}`} />
        {title}
      </div>
      <div className="section-card">
        {items.length === 0 ? (
          <p className="item-empty">Žiadny záznam</p>
        ) : (
          items.map((item, i) => (
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

// ── App ───────────────────────────────────────────────────────────────────────
export default function Journal() {
  const [viewDate, setViewDate] = useState(today());
  const [entries, setEntries] = useState(loadEntries);
  const [animDir, setAnimDir] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const key = toKey(viewDate);
  const entry = entries[key] || { good: [], bad: [] };
  const editable = isToday(viewDate);
  const future = isFuture(viewDate);
  const anyOpen = fabOpen || !!drawer || !!lightbox || !!deleteTarget;

  const navigate = useCallback(
    dir => {
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

  const updateEntry = patch => {
    const u = { ...entries, [key]: { ...entry, ...patch } };
    setEntries(u);
    saveEntries(u);
  };
  const addItem = (f, t, p) =>
    updateEntry({ [f]: [...(entry[f] || []), makeItem(t, p)] });
  const removeItem = (f, id) =>
    updateEntry({ [f]: (entry[f] || []).filter(i => i.id !== id) });
  const removeItemPhoto = (f, id) =>
    updateEntry({
      [f]: (entry[f] || []).map(i => (i.id === id ? { ...i, photo: null } : i)),
    });

  const onTouchStart = e => {
    if (anyOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = e => {
    if (anyOpen || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 60) navigate(dx < 0 ? 'next' : 'prev');
    touchStartX.current = null;
  };

  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape') {
        setFabOpen(false);
        setDrawer(null);
        setLightbox(null);
        setDeleteTarget(null);
        return;
      }
      if (anyOpen) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
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

  const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif`;
  const sfd = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`;

  const goodCount = (entry.good || []).length;
  const badCount = (entry.bad || []).length;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #FDFCFA;
          min-height: 100vh;
          font-family: ${sf};
          color: #2D2A26;
          -webkit-font-smoothing: antialiased;
        }

        .shell {
          min-height: 100vh;
          max-width: 480px;
          margin: 0 auto;
          background: #FDFCFA;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ── Page ── */
        .page-wrap {
          flex: 1;
          padding: 55px 21px 89px;
          display: flex;
          flex-direction: column;
          gap: 21px;
        }

        @keyframes slideInR  { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutL { to { transform: translateX(-24px); opacity: 0; } }
        @keyframes slideOutR { to { transform: translateX(24px);  opacity: 0; } }
        .slide-in        { animation: slideInR  0.2s ease both; }
        .slide-out-left  { animation: slideOutL 0.2s ease both; }
        .slide-out-right { animation: slideOutR 0.2s ease both; }

        /* ── Date header — centered ── */
        .date-header {
          text-align: center;
          padding-bottom: 8px;
        }
        .day-name {
          font-family: ${sfd};
          font-size: 34px; font-weight: 700;
          color: #2D2A26; text-transform: capitalize;
          letter-spacing: -0.5px; line-height: 1.1;
        }
        .date-full {
          font-size: 13px; color: #6B6660; margin-top: 5px;
        }

        /* ── Summary cards ── */
        .summary-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 13px;
        }
        .summary-card {
          border-radius: 13px; padding: 21px 13px 18px;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
        }
        .summary-card-good { background: #C5E8DC; }
        .summary-card-bad  { background: #D4D9E0; }
        .summary-count {
          font-family: ${sfd};
          font-size: 34px; font-weight: 700; line-height: 1;
        }
        .summary-card-good .summary-count { color: #1D6B56; }
        .summary-card-bad  .summary-count { color: #4A5568; }
        .summary-label {
          font-size: 13px; font-weight: 400;
        }
        .summary-card-good .summary-label { color: #1D6B56; }
        .summary-card-bad  .summary-label { color: #4A5568; }

        /* ── Section ── */
        .section { display: flex; flex-direction: column; gap: 8px; }

        .section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.1px;
          color: #6B6660;
          padding: 0 5px;
        }
        .section-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .dot-good-solid { background: #1D6B56; }
        .dot-bad-solid  { background: #4A5568; }

        /* White card wrapping items */
        .section-card {
          background: #fff;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        /* ── Item row ── */
        .item-row {
          display: flex; align-items: center;
          padding: 13px 13px 13px 16px;
          border-left: 3px solid transparent;
          border-bottom: 1px solid #F5F3EF;
          gap: 8px;
          min-height: 55px;
        }
        .item-row:last-child { border-bottom: none; }
        .item-row-good { border-left-color: #1D6B56; }
        .item-row-bad  { border-left-color: #4A5568; }

        .item-text { flex: 1; font-size: 15px; color: #2D2A26; font-weight: 400; line-height: 1.5; word-break: break-word; }
        .item-actions { display: flex; align-items: center; gap: 0; flex-shrink: 0; }

        .item-photo-btn {
          background: transparent; border: none; font-size: 14px; cursor: pointer;
          min-width: 36px; min-height: 44px;
          display: flex; align-items: center; justify-content: center;
          opacity: 0.6; transition: opacity 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .item-photo-btn:hover { opacity: 1; }

        .item-delete-btn {
          background: transparent; border: none; color: #C4BFB8;
          font-size: 16px; cursor: pointer;
          min-width: 36px; min-height: 44px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .item-delete-btn:hover { color: #C0392B; }

        .item-empty {
          padding: 13px 16px; font-size: 14px; color: #C4BFB8;
          border-left: 3px solid #EDE9E3;
        }

        /* ── Future ── */
        .future-msg { text-align: center; padding: 55px 0; color: #C4BFB8; font-size: 15px; }

        /* ── FAB ── */
        .fab {
          position: fixed;
          bottom: 34px;
          left: 50%; transform: translateX(-50%);
          width: 55px; height: 55px; border-radius: 50%;
          background: #E8965A;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 5px 21px rgba(232,150,90,0.42);
          font-size: 26px; color: #fff; font-weight: 300;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 8;
          -webkit-tap-highlight-color: transparent;
        }
        .fab:hover { transform: translateX(-50%) scale(1.06); box-shadow: 0 8px 21px rgba(232,150,90,0.5); }
        .fab:active { transform: translateX(-50%) scale(0.96); }
        .fab.open { transform: translateX(-50%) rotate(45deg); }

        /* ── FAB picker ── */
        .fab-picker {
          position: fixed; left: 0; right: 0; bottom: 0;
          max-width: 480px; margin: 0 auto;
          background: #FDFCFA;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 -2px 20px rgba(0,0,0,0.08);
          transform: translateY(100%);
          transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
          z-index: 20;
          padding-bottom: env(safe-area-inset-bottom, 16px);
          display: flex; flex-direction: column;
        }
        .fab-picker.open { transform: translateY(0); }

        .fab-pick-btn {
          display: flex; align-items: center; gap: 13px;
          background: transparent; border: none; border-bottom: 1px solid #EDE9E3;
          font-family: ${sf}; font-size: 16px; font-weight: 500; color: #2D2A26;
          padding: 21px 24px; cursor: pointer; text-align: left;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .fab-pick-btn:last-of-type { border-bottom: none; }
        .fab-pick-btn:hover { background: #F5F3EF; }

        .fab-pick-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        .fab-pick-cancel {
          background: transparent; border: none;
          font-family: ${sf}; font-size: 15px; color: #6B6660;
          padding: 13px 21px; cursor: pointer; text-align: center;
          -webkit-tap-highlight-color: transparent;
        }
        .fab-pick-cancel:hover { color: #2D2A26; }

        /* ── Lightbox ── */
        @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }
        .lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.88);
          display: flex; align-items: center; justify-content: center;
          animation: lbIn 0.18s ease both;
          cursor: pointer; padding: 20px;
        }
        .lightbox-img { max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; cursor: default; }
        .lightbox-close {
          position: absolute; top: 16px; right: 16px;
          background: rgba(255,255,255,0.15); color: #fff; border: none;
          width: 44px; height: 44px; border-radius: 4px;
          cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Shared drawer styles ── */
        .drawer-backdrop {
          position: fixed; inset: 0; background: rgba(45,42,38,0.35);
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease; z-index: 10;
        }
        .drawer-backdrop.visible { opacity: 1; pointer-events: all; }

        .drawer {
          position: fixed; left: 0; right: 0; bottom: 0;
          max-width: 480px; margin: 0 auto;
          background: #FDFCFA;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 -2px 20px rgba(0,0,0,0.08);
          transform: translateY(100%);
          transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
          z-index: 20; display: flex; flex-direction: column;
          padding-bottom: env(safe-area-inset-bottom, 16px);
        }
        .drawer.open { transform: translateY(0); }

        .drawer-handle { width: 36px; height: 4px; background: #D4D9E0; border-radius: 2px; margin: 10px auto 0; flex-shrink: 0; }

        .drawer-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 13px 21px 13px;
          border-bottom: 1px solid #EDE9E3; flex-shrink: 0;
        }
        .drawer-title { font-size: 15px; font-weight: 600; color: #2D2A26; display: flex; align-items: center; gap: 10px; }
        .drawer-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }

        .drawer-close {
          background: transparent; border: none; color: #C4BFB8; font-size: 16px;
          cursor: pointer; min-width: 44px; min-height: 44px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 4px; margin-right: -8px;
          transition: color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .drawer-close:hover { color: #2D2A26; }

        .drawer-photo-preview { position: relative; flex-shrink: 0; }
        .drawer-photo-preview img { display: block; width: 100%; max-height: 200px; object-fit: cover; }
        .drawer-photo-remove {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.45); color: #fff; border: none;
          width: 30px; height: 30px; border-radius: 50%;
          cursor: pointer; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
        }

        .drawer-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: ${sf}; font-size: 16px; line-height: 1.618;
          color: #2D2A26; padding: 13px 21px; resize: none; min-height: 120px;
        }
        .drawer-textarea::placeholder { color: #C4BFB8; }

        .drawer-actions {
          display: flex; align-items: center;
          border-top: 1px solid #EDE9E3; flex-shrink: 0;
          padding: 8px 13px; gap: 8px;
        }
        .drawer-photo-btn {
          flex: 1; background: transparent; border: none;
          font-family: ${sf}; font-size: 14px; color: #6B6660;
          cursor: pointer; min-height: 44px;
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 0 13px; border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .drawer-photo-btn:hover { color: #2D2A26; background: #F1EDE6; }

        .drawer-submit {
          background: #2D2A26; color: #FDFCFA; border: none;
          font-family: ${sf}; font-size: 14px; font-weight: 600;
          cursor: pointer; min-height: 44px; padding: 0 21px;
          border-radius: 4px; transition: opacity 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .drawer-submit:hover { opacity: 0.85; }
        .drawer-submit:disabled { background: #D4D9E0; color: #6B6660; cursor: default; }

        /* ── Delete drawer ── */
        .delete-drawer { }
        .delete-drawer-body { padding: 21px 21px 8px; display: flex; flex-direction: column; gap: 5px; }
        .delete-drawer-label { font-size: 17px; font-weight: 600; color: #2D2A26; }
        .delete-drawer-preview { font-size: 14px; color: #6B6660; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .delete-drawer-actions { display: flex; gap: 8px; padding: 13px 21px 8px; }
        .delete-btn-cancel {
          flex: 1; background: #EDE9E3; color: #2D2A26; border: none;
          font-family: ${sf}; font-size: 15px; font-weight: 500;
          min-height: 55px; border-radius: 4px; cursor: pointer; transition: opacity 0.15s;
        }
        .delete-btn-cancel:active { opacity: 0.7; }
        .delete-btn-confirm {
          flex: 1; background: #C0392B; color: #fff; border: none;
          font-family: ${sf}; font-size: 15px; font-weight: 600;
          min-height: 55px; border-radius: 4px; cursor: pointer; transition: opacity 0.15s;
        }
        .delete-btn-confirm:active { opacity: 0.8; }
      `}</style>

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
        onAdd={(text, photo) => addItem(drawer, text, photo)}
      />

      <DeleteDrawer
        open={!!deleteTarget}
        item={deleteTarget?.item || null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={id => removeItem(deleteTarget.field, id)}
      />
    </>
  );
}
