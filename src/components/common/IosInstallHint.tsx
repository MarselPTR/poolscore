import React, { useState } from 'react';
import { Share, Plus, X } from 'lucide-react';

const DISMISS_KEY = 'poolscore_ios_hint_dismissed';

function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // When launched from the home screen the app is already "fullscreen", so the
  // hint is pointless.
  const standalone =
    ('standalone' in navigator && (navigator as unknown as { standalone?: boolean }).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;
  return isIos && !standalone;
}

/**
 * iPhone-only, dismissible tip: iOS browsers cannot go true fullscreen, so the
 * best "app-like" experience is adding PoolScore to the Home Screen. Shows once
 * until dismissed. Renders nothing on any other platform.
 */
export const IosInstallHint: React.FC = () => {
  const [show, setShow] = useState(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return false;
    } catch {
      // ignore
    }
    return isIosBrowser();
  });

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <div className="flex items-start gap-3 p-3 border border-rule rounded-md bg-ink/[0.03]">
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-2">
        <span className="font-semibold text-ink">Tips untuk iPhone:</span> agar bisa layar penuh
        seperti aplikasi, buka di <b>Safari</b> lalu tap <Share className="inline w-3.5 h-3.5 -mt-0.5" />{' '}
        <b>Bagikan</b> → <Plus className="inline w-3.5 h-3.5 -mt-0.5" /> <b>Add to Home Screen</b>.
      </div>
      <button
        onClick={dismiss}
        aria-label="Tutup tips"
        className="shrink-0 icon-btn !w-7 !h-7 text-ink-3"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
