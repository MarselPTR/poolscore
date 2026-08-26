import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MatchPlayer } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Minus, Check, Layers } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface PlayerPanelProps {
  player: MatchPlayer;
  playerNumber: 1 | 2;
  isActiveTurn: boolean;
  onWinRack: () => void;
  onAdjustScore: (delta: number) => void;
  onSelectTurn: () => void;
  isGameFinished: boolean;
  setsWon?: number;
  targetSets?: number;
  fontSizePreference?: 'standard' | 'large' | 'massive';
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  playerNumber,
  isActiveTurn,
  onWinRack,
  onAdjustScore,
  isGameFinished,
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
  const isRed = playerNumber === 1;

  const holdDuration = settings.holdDurationMs || 500;
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setScoreBumping(true);
    const t = setTimeout(() => setScoreBumping(false), 240);
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
    if (isGameFinished) return;

    if (settings.touchProtection === 'quick') {
      onWinRack();
      return;
    }

    if (settings.touchProtection === 'confirm') {
      return;
    }

    // Hold mode
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

    if (settings.touchProtection === 'confirm') {
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
    } else if (settings.touchProtection === 'quick') {
      onWinRack();
    }
  };

  const handleCancelConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  };

  const activePanelStyle = isActiveTurn
    ? isRed
      ? 'bg-zinc-900/90 border-rose-500/70 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
      : 'bg-zinc-900/90 border-blue-500/70 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/30'
    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80';

  const scoreSizeClass = fontSizePreference === 'massive'
    ? 'text-7xl sm:text-8xl md:text-9xl lg:text-[120px]'
    : fontSizePreference === 'standard'
    ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
    : 'text-6xl sm:text-7xl md:text-8xl lg:text-[105px]';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-between p-3.5 sm:p-5 h-full rounded-2xl border transition-all duration-200 select-none cursor-pointer overflow-hidden group active:scale-[0.995] ${activePanelStyle}`}
    >
      {/* Hold progress fill overlay */}
      {settings.touchProtection === 'hold' && isHolding && (
        <div
          className={`absolute inset-0 transition-all pointer-events-none z-0 ${
            isRed ? 'bg-rose-500/20' : 'bg-blue-500/20'
          }`}
          style={{
            height: `${progress * 100}%`,
            top: 'auto',
            bottom: 0,
          }}
        />
      )}

      {/* Top Section: Player Header & Sets Badge */}
      <div className="flex flex-col items-center gap-2 z-10 pointer-events-none w-full">
        <div className="flex items-center justify-center gap-3">
          {isRed && (
            <PlayerAvatar
              playerNumber={1}
              name={player.name}
              size="sm"
              isActiveTurn={isActiveTurn}
            />
          )}

          <h2
            className={`font-semibold tracking-tight text-base sm:text-xl lg:text-2xl truncate max-w-[150px] sm:max-w-[200px] ${
              isActiveTurn
                ? isRed
                  ? 'text-rose-400 font-bold'
                  : 'text-blue-400 font-bold'
                : 'text-zinc-400'
            }`}
          >
            {player.name}
          </h2>

          {!isRed && (
            <PlayerAvatar
              playerNumber={2}
              name={player.name}
              size="sm"
              isActiveTurn={isActiveTurn}
            />
          )}
        </div>

        {/* Set Score Pill */}
        {isMultiSet && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
              isRed
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{setsWon} / {targetSets} SET</span>
          </div>
        )}
      </div>

      {/* Center Section: Tabular Score Numerals with Tactile Minus Correction Only */}
      <div className="relative flex items-center justify-center my-auto py-2 z-10 w-full">
        {/* Giant Crisp Tabular Score Numeral */}
        <div
          className={`font-mono font-black font-tabular tracking-tight leading-none transition-all duration-150 pointer-events-none ${scoreSizeClass} ${
            scoreBumping ? 'animate-score-bump' : ''
          } ${
            isActiveTurn
              ? isRed
                ? 'text-rose-500'
                : 'text-blue-500'
              : 'text-zinc-600'
          }`}
        >
          {player.score}
        </div>

        {/* Tactile Manual Minus Correction Button (No Plus button) */}
        {player.score > 0 && !isGameFinished && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdjustScore(-1);
            }}
            title="Koreksi: Kurangi 1 poin (-1)"
            className="absolute right-2 sm:right-4 p-2 sm:p-2.5 rounded-xl bg-zinc-800/90 hover:bg-rose-500/20 hover:border-rose-500/40 border border-zinc-700/80 text-zinc-300 hover:text-rose-400 transition-all active:scale-90 z-20 shadow-md flex items-center justify-center"
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Bottom Area: Turn Cue & Action Target */}
      <div className="flex flex-col items-center gap-1.5 w-full z-10 pointer-events-none">
        {/* Active Shooter Status */}
        <div className="h-4 flex items-center justify-center">
          {isActiveTurn ? (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                isRed ? 'text-rose-400' : 'text-blue-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isRed ? 'bg-rose-500' : 'bg-blue-500'}`} />
              Giliran Menembak
            </span>
          ) : (
            <span className="text-[10px] text-zinc-600 uppercase font-mono">
              {isMultiSet ? 'Rack Menang' : 'Poin Game'}
            </span>
          )}
        </div>

        {/* Action Prompt Pill */}
        <div className="w-full max-w-[200px] flex justify-center pointer-events-auto">
          {settings.touchProtection === 'confirm' && isConfirming ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleClick}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg ${
                  isRed ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'
                } text-white shadow-sm flex items-center gap-1 active:scale-95`}
              >
                <Check className="w-3.5 h-3.5" /> Konfirmasi
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-2.5 py-1.5 text-xs font-medium uppercase rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
              >
                Batal
              </button>
            </div>
          ) : (
            <div
              className={`w-full py-1.5 px-3 rounded-lg border text-center font-semibold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                isRed
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 group-hover:bg-rose-500/20'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20'
              }`}
            >
              <span>
                {settings.touchProtection === 'hold' ? 'Tahan untuk Win Rack' : 'Tekan untuk Win Rack'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
