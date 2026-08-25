import React, { useState, useRef, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface HoldButtonProps {
  onTrigger: () => void;
  label: string;
  className?: string;
  playerColor?: 'red' | 'blue';
  disabled?: boolean;
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  onTrigger,
  label,
  className = '',
  playerColor = 'red',
  disabled = false,
}) => {
  const { settings } = useSettings();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const holdDuration = settings.holdDurationMs || 500;
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHold = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;

    if (settings.touchProtection === 'quick') {
      onTrigger();
      return;
    }

    if (settings.touchProtection === 'confirm') {
      return; // Handled by onClick
    }

    // 'hold' mode
    e.preventDefault();
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / holdDuration);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        cancelHold();
        onTrigger();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleClick = () => {
    if (disabled) return;

    if (settings.touchProtection === 'confirm') {
      if (!isConfirming) {
        setIsConfirming(true);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(() => {
          setIsConfirming(false);
        }, 3000);
      } else {
        setIsConfirming(false);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        onTrigger();
      }
    }
  };

  const handleConfirmCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  };

  const colorClasses = playerColor === 'red'
    ? 'border-red/40 hover:border-red text-red-100 active:bg-red/20'
    : 'border-blue/40 hover:border-blue text-blue-100 active:bg-blue/20';

  const glowStyle = isHolding && playerColor === 'red'
    ? { boxShadow: '0 0 20px rgba(240, 74, 58, 0.4)' }
    : isHolding && playerColor === 'blue'
    ? { boxShadow: '0 0 20px rgba(63, 123, 250, 0.4)' }
    : {};

  if (settings.touchProtection === 'confirm' && isConfirming) {
    return (
      <div className="flex items-center gap-1.5 animate-fade-in">
        <button
          onClick={handleClick}
          className="px-3 py-2 text-xs font-bold font-ui uppercase tracking-wider rounded-lg bg-felt hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95"
        >
          ✓ Ya, Menang
        </button>
        <button
          onClick={handleConfirmCancel}
          className="px-2 py-2 text-xs font-semibold font-ui uppercase rounded-lg bg-surface-3 hover:bg-surface-2 text-text-dim hover:text-text transition-all"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
      disabled={disabled}
      style={glowStyle}
      className={`relative overflow-hidden group select-none font-ui font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border bg-surface/60 backdrop-blur transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${colorClasses} ${className}`}
    >
      {/* Radial hold fill background for 'hold' mode */}
      {settings.touchProtection === 'hold' && isHolding && (
        <div
          className={`absolute inset-0 transition-opacity pointer-events-none ${
            playerColor === 'red' ? 'bg-red/40' : 'bg-blue/40'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {settings.touchProtection === 'hold' && (
          <span className="text-[10px] opacity-70">⏱</span>
        )}
        {label}
        {settings.touchProtection === 'hold' && (
          <span className="text-[9px] opacity-60 font-mono lowercase tracking-normal">(tahan)</span>
        )}
      </span>
    </button>
  );
};
