'use client';

import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'push_prompt_dismissed';

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return;
    }

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed && Notification.permission === 'default') {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        dismiss();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      setVisible(false);
    } catch (err) {
      console.error('[PushPrompt] subscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="push-prompt-backdrop" onClick={dismiss} />
      <div className="push-prompt" role="dialog" aria-label="Povolenie notifikácií">
        <div className="push-prompt-body">
          <p className="push-prompt-text">
            Chceš každý večer o 22:00 pripomienku zapísať si, čo sa ti podarilo?
          </p>
          <div className="push-prompt-actions">
            <button
              className="push-prompt-cancel"
              onClick={dismiss}
              disabled={loading}
            >
              Nie, ďakujem
            </button>
            <button
              className="push-prompt-confirm"
              onClick={subscribe}
              disabled={loading}
            >
              {loading ? '…' : 'Áno, chcem'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
