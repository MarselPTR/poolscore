import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MatchPlayer } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Minus, Trophy, Check, Layers } from 'lucide-react';
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

  // Full-panel hold & touch protection state
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const isMultiSet = targetSets > 1;

  const holdDuration = settings.holdDurationMs || 500;
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setScoreBumping(true);
    const t = setTimeout(() => setScoreBumping(false), 300);
    return () => clearTimeout(t);
  }, [player.score]);

  const isRed = playerNumber === 1;

  const cancelHold = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  }, []);

  // Pointer events on the entire box
  const handlePointerDown = () => {
    if (isGameFinished) return;

    if (settings.touchProtection === 'quick') {
      onWinRack();
      return;
    }

    if (settings.touchProtection === 'confirm') {
      return; // Handled by onClick
    }

    // 'hold' mode
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

  // Active glow backgrounds with deep slate & crimson/blue tones
  const activeStyle = isActiveTurn
    ? isRed
      ? 'bg-gradient-to-r from-red/20 via-red/5 to-transparent border-red/70 shadow-[0_0_35px_rgba(201,42,57,0.22)] ring-1 ring-red/30'
      : 'bg-gradient-to-l from-blue/20 via-blue/5 to-transparent border-blue/70 shadow-[0_0_35px_rgba(59,130,246,0.22)] ring-1 ring-blue/30'
    : 'opacity-75 hover:opacity-95 border-line/60 bg-surface/50';

  const scoreSizeClass = fontSizePreference === 'massive'
    ? 'text-7xl sm:text-8xl md:text-9xl lg:text-[130px]'
    : fontSizePreference === 'standard'
    ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
    : 'text-6xl sm:text-7xl md:text-8xl lg:text-[110px]';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-between p-3 sm:p-5 h-full rounded-3xl border transition-all duration-300 select-none cursor-pointer overflow-hidden group active:scale-[0.99] ${activeStyle}`}
    >
      {/* Full-box animated hold progress fill overlay */}
      {settings.touchProtection === 'hold' && isHolding && (
        <div
          className={`absolute inset-0 transition-all pointer-events-none z-0 ${
            isRed ? 'bg-red/30' : 'bg-blue/30'
          }`}
          style={{
            height: `${progress * 100}%`,
            top: 'auto',
            bottom: 0,
          }}
        />
      )}

      {/* Ripple active glow on hold */}
      {isHolding && (
        <div
          className={`absolute inset-0 pointer-events-none z-0 animate-pulse ${
            isRed ? 'shadow-[inset_0_0_60px_rgba(201,42,57,0.4)]' : 'shadow-[inset_0_0_60px_rgba(59,130,246,0.4)]'
          }`}
        />
      )}

      {/* Top: Player Name & 3D Billiard Ball Avatar & Sets Counter */}
      <div className="flex flex-col items-center gap-1.5 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          {isRed && (
            <PlayerAvatar
              playerNumber={1}
              name={player.name}
              size="md"
              isActiveTurn={isActiveTurn}
            />
          )}
          <h2
            className={`font-display font-bold uppercase tracking-wider text-lg sm:text-2xl lg:text-3xl transition-colors duration-300 truncate max-w-[160px] sm:max-w-[220px] ${
              isActiveTurn
                ? isRed
                  ? 'text-red drop-shadow-[0_0_12px_rgba(201,42,57,0.5)]'
                  : 'text-blue drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                : 'text-text-dim'
            }`}
          >
            {player.name}
          </h2>
          {!isRed && (
            <PlayerAvatar
              playerNumber={2}
              name={player.name}
              size="md"
              isActiveTurn={isActiveTurn}
            />
          )}
        </div>

        {/* Set Score badge if Multi-Set */}
        {isMultiSet && (
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase shadow-sm ${
              isRed
                ? 'bg-red/20 text-red border border-red/40'
                : 'bg-blue/20 text-blue border border-blue/40'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{setsWon} / {targetSets} SETS WON</span>
          </div>
        )}
      </div>

      {/* Center: Huge Score Display with Manual Adjusters */}
      <div className="relative flex items-center justify-center my-auto py-1 sm:py-2 z-10 w-full">
        {/* Subtle manual minus button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjustScore(-1);
          }}
          disabled={player.score <= 0 || isGameFinished}
          title="Kurangi 1 poin"
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-surface-3/90 hover:bg-surface-2 text-text-dim hover:text-text transition-all active:scale-90 disabled:opacity-0 mr-2 sm:mr-4 z-20"
        >
          <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* The Giant Score Number */}
        <div
          className={`font-mono font-extrabold tracking-tighter leading-none transition-all duration-200 pointer-events-none ${scoreSizeClass} ${
            scoreBumping ? 'animate-score-bump' : ''
          } ${
            isActiveTurn
              ? isRed
                ? 'text-red drop-shadow-[0_0_24px_rgba(201,42,57,0.45)]'
                : 'text-blue drop-shadow-[0_0_24px_rgba(59,130,246,0.45)]'
              : 'text-text-faint'
          }`}
        >
          {player.score}
        </div>

        {/* Subtle manual plus button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjustScore(1);
          }}
          disabled={isGameFinished}
          title="Tambah 1 poin"
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-surface-3/90 hover:bg-surface-2 text-text-dim hover:text-text transition-all active:scale-90 disabled:opacity-0 ml-2 sm:ml-4 z-20"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Bottom Area: Games label, Turn indicator & Click Anywhere Cue */}
      <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full z-10 pointer-events-none">
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text-faint">
          {isMultiSet ? 'Racks Won (Current Set)' : 'Games Won'}
        </span>

        {/* Turn indicator badge */}
        <div
          className={`font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all duration-300 h-5 ${
            isActiveTurn
              ? isRed
                ? 'text-red opacity-100'
                : 'text-blue opacity-100'
              : 'opacity-0'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isRed ? 'bg-red shadow-[0_0_8px_#c92a39]' : 'bg-blue shadow-[0_0_8px_#3b82f6]'
            }`}
          />
          Your Turn
        </div>

        {/* Tap/Hold anywhere badge */}
        <div className="mt-1 w-full max-w-[220px] flex justify-center pointer-events-auto">
          {settings.touchProtection === 'confirm' && isConfirming ? (
            <div className="flex items-center gap-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleClick}
                className={`px-4 py-2 text-xs font-bold font-ui uppercase tracking-wider rounded-xl ${
                  isRed ? 'bg-red hover:bg-red-600' : 'bg-blue hover:bg-blue-600'
                } text-white shadow-lg flex items-center gap-1 active:scale-95`}
              >
                <Check className="w-3.5 h-3.5" /> Konfirmasi Menang
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-2.5 py-2 text-xs font-semibold font-ui uppercase rounded-xl bg-surface-3 hover:bg-surface-2 text-text-dim hover:text-text"
              >
                Batal
              </button>
            </div>
          ) : (
            <div
              className={`w-full py-2 sm:py-2.5 px-3 rounded-2xl border text-center font-ui font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                isRed
                  ? 'border-red/40 bg-surface-2/80 text-red hover:border-red hover:bg-red/10'
                  : 'border-blue/40 bg-surface-2/80 text-blue hover:border-blue hover:bg-blue/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>
                {settings.touchProtection === 'hold'
                  ? 'Tahan Kotak ➔ Win Rack'
                  : 'Pencet Kotak ➔ Win Rack'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
