import React, { useState, useEffect } from 'react';
import { RotateCw, X } from 'lucide-react';

export const LandscapeBanner: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || isDismissed) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-40 bg-surface-2/95 border border-amber/40 shadow-xl rounded-xl p-3 flex items-center justify-between text-xs text-text animate-fade-in backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber/20 text-amber flex items-center justify-center animate-pulse">
          <RotateCw className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-amber block">Rekomendasi Landscape</span>
          <span className="text-text-dim text-[11px]">Putar HP Anda mendatar untuk papan skor simetris merah & biru.</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-text-faint hover:text-text rounded-md"
          title="Tutup banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
