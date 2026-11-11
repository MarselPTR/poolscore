import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MatchPlayer } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Minus } from 'lucide-react';

interface PlayerPanelProps {
  player: MatchPlayer;
  playerNumber: 1 | 2;
  isActiveTurn: boolean;
  onWinRack: () => void;
  onAdjustScore: (delta: number) => void;
  isGameFinished: boolean;
  raceTo: number;
  setsWon?: number;
  targetSets?: number;
  fontSizePreference?: 'standard' | 'large' | 'massive';
}

// Above this the row of win markers gets too small to read, so we show text.
const MAX_RACE_MARKERS = 13;

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  playerNumber,
  isActiveTurn,
  onWinRack,
  onAdjustScore,
  isGameFinished,
  raceTo,
  setsWon = 0,
  targetSets = 1,
  fontSizePreference = 'large',
}) => {
  const { settings } = useSettings();
  const [scoreBumping, setScoreBumping] = useState(false);

  // Touch protection & hold state
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const isMultiSet = targetSets > 1;
  const mode = settings.touchProtection;

  const holdDuration = settings.holdDurationMs || 500;
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setScoreBumping(true);
    const t = setTimeout(() => setScoreBumping(false), 220);
    return () => clearTimeout(t);
  }, [player.score]);

  const cancelHold = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  }, []);

  const handlePointerDown = () => {
    // Quick and confirm modes act on click; only hold mode starts here.
    if (isGameFinished || mode === 'quick' || mode === 'confirm') return;

    setIsHolding(true);
    startTimeRef.current = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / holdDuration);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        cancelHold();
        onWinRack();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isGameFinished) return;

    if (mode === 'confirm') {
      e.stopPropagation();
      if (!isConfirming) {
        setIsConfirming(true);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(() => {
          setIsConfirming(false);
        }, 3000);
      } else {
        setIsConfirming(false);
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        onWinRack();
      }
    } else if (mode === 'quick') {
      onWinRack();
    }
  };

  const handleCancelConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  };

  const scoreScale =
    fontSizePreference === 'massive' ? 1.12 : fontSizePreference === 'standard' ? 0.82 : 1;

  const showMarkers = raceTo <= MAX_RACE_MARKERS;
  const hint =
    mode === 'hold'
      ? 'Tahan untuk menang rack'
      : mode === 'confirm'
      ? 'Ketuk dua kali untuk menang rack'
      : 'Ketuk untuk menang rack';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
      data-turn={isActiveTurn}
      role="button"
      aria-label={`${player.name}, skor ${player.score}. ${hint}`}
      className={`score-half score-half-p${playerNumber} h-full w-full ${
        isGameFinished ? '' : 'cursor-pointer'
      }`}
      style={{ ['--score-scale' as string]: scoreScale }}
    >
      {/* Hold progress rises from the bottom edge */}
      {mode === 'hold' && isHolding && (
        <div
          className="absolute inset-x-0 bottom-0 bg-white/25 pointer-events-none"
          style={{ height: `${progress * 100}%` }}
        />
      )}

      {/* Turn marker: a solid bar along the top of the shooter's half */}
      {isActiveTurn && <div className="absolute inset-x-0 top-0 h-2 bg-white" />}

      <div className="relative h-full flex flex-col items-center justify-between px-4 pt-[6cqh] pb-[4cqh] pointer-events-none">
        {/* Name and turn */}
        <div className="flex flex-col items-center gap-[1.5cqh] w-full min-w-0">
          <h2 className="score-name max-w-full truncate px-2">{player.name}</h2>
          <div className="flex items-center gap-3 h-5">
            <span
              className={`font-display font-semibold uppercase tracking-[0.12em] text-sm ${
                isActiveTurn ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Giliran
            </span>
            {isMultiSet && (
              <span className="flex items-center gap-1.5" aria-label={`Set ${setsWon} dari ${targetSets}`}>
                <span className="font-display font-semibold uppercase tracking-[0.12em] text-sm opacity-80">
                  Set
                </span>
                {Array.from({ length: targetSets }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 ${i < setsWon ? 'bg-white' : 'bg-white/25'}`}
                  />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className={`score-num ${scoreBumping ? 'animate-score-bump' : ''}`}>{player.score}</div>

        {/* Race progress and action hint */}
        <div className="flex flex-col items-center gap-[2cqh] w-full">
          {showMarkers ? (
            <div
              className="flex items-center justify-center gap-1 w-full max-w-[420px]"
              aria-label={`${player.score} dari ${raceTo} rack`}
            >
              {Array.from({ length: raceTo }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 flex-1 max-w-8 ${i < player.score ? 'bg-white' : 'bg-white/25'}`}
                />
              ))}
            </div>
          ) : (
            <div className="font-display font-semibold uppercase tracking-[0.12em] text-sm opacity-80">
              Race to {raceTo}
            </div>
          )}

          <div className="h-9 flex items-center justify-center pointer-events-auto">
            {isGameFinished ? null : mode === 'confirm' && isConfirming ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleClick}
                  className="h-9 px-4 rounded-[4px] bg-white text-black text-sm font-semibold"
                >
                  Ya, menang rack
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="h-9 px-3 rounded-[4px] border border-white/50 text-white text-sm font-semibold"
                >
                  Batal
                </button>
              </div>
            ) : (
              <span className="text-[13px] opacity-75 pointer-events-none">{hint}</span>
            )}
          </div>
        </div>
      </div>

      {/* Manual correction */}
      {player.score > 0 && !isGameFinished && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAdjustScore(-1);
          }}
          title="Koreksi: kurangi 1"
          aria-label={`Kurangi 1 skor ${player.name}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-[4px] border border-white/40 bg-black/20 text-white hover:bg-black/35"
        >
          <Minus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
