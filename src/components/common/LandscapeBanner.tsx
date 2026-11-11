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
    <div className="flex items-center gap-2.5 h-9 pl-4 pr-1 bg-panel-2 border-b border-rule text-[13px] text-ink-2">
      <RotateCw className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">Putar layar mendatar untuk papan skor berdampingan.</span>
      <button onClick={() => setIsDismissed(true)} className="icon-btn !w-8 !h-8" aria-label="Tutup saran">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
