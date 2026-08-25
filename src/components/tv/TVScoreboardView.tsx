import React, { useState } from 'react';
import type { Match } from '../../types';
import { useLiveReceiver } from '../../hooks/useLiveSync';
import { useFullscreen } from '../../hooks/useFullscreen';
import { formatSeconds } from '../../utils/time';
import { Maximize, Minimize, Tv, ArrowLeft, Layers, Clock } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface TVScoreboardViewProps {
  onBack: () => void;
}

export const TVScoreboardView: React.FC<TVScoreboardViewProps> = ({ onBack }) => {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useLiveReceiver((match) => {
    setLiveMatch(match);
  });

  const isMultiSet = liveMatch?.targetSets && liveMatch.targetSets > 1;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Broadcast Bar */}
      <div className="h-14 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 rounded-2xl border">
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Keluar dari Mode TV"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PoolScore Logo"
              className="w-7 h-7 rounded-lg object-cover border border-zinc-800 shadow-sm"
            />
            <span className="font-bold text-base tracking-tight text-white uppercase">
              PoolScore TV
            </span>
          </div>
        </div>

        {/* Center: Live Match Badges */}
        {liveMatch ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-zinc-900 text-zinc-200 border border-zinc-800 px-3 py-1 rounded-xl font-semibold uppercase">
              {liveMatch.gameType} · RACE TO {liveMatch.raceTo}
            </span>

            {isMultiSet && (
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                SET {liveMatch.currentSet} / {liveMatch.targetSets}
              </span>
            )}

            <span className="text-zinc-400 font-mono">
              RACK <strong className="text-white">{liveMatch.currentRack}</strong>
            </span>

            <span className="text-zinc-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {formatSeconds(liveMatch.durationSeconds)}
            </span>

            <span className="flex items-center gap-1.5 text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-xl font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              LIVE
            </span>
          </div>
        ) : (
          <div className="text-xs text-zinc-500 font-mono">
            ARENA SPECTATOR BROADCAST
          </div>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          title="Fullscreen TV"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Stadium Arena */}
      {!liveMatch ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
            <Tv className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-2xl text-white">
            Menunggu Siaran Pertandingan Live...
          </h3>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-md">
            Mulai pertandingan di smartphone untuk mencatat skor. Layar TV ini akan otomatis menampilkan skor secara langsung (*real-time*).
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-[1fr_40px_1fr] items-center gap-6 my-auto py-6">
          {/* Player 1 (Red) */}
          <div
            className={`flex flex-col items-center justify-between p-8 rounded-3xl border transition-all h-full ${
              liveMatch.currentTurn === 1
                ? 'border-rose-500/60 bg-zinc-900 shadow-xl shadow-rose-950/30 ring-1 ring-rose-500/30'
                : 'border-zinc-800/80 bg-zinc-900/40 opacity-75'
            }`}
          >
            {/* Player Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <PlayerAvatar playerNumber={1} size="md" name={liveMatch.player1.name} isActiveTurn={liveMatch.currentTurn === 1} />
                <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white truncate max-w-[280px]">
                  {liveMatch.player1.name}
                </h2>
              </div>

              {isMultiSet && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase">
                  <Layers className="w-3.5 h-3.5" />
                  {liveMatch.player1Sets} / {liveMatch.targetSets} SET MENANG
                </div>
              )}
            </div>

            {/* Giant Score Numeral */}
            <div className="font-mono font-black font-tabular text-[130px] sm:text-[180px] lg:text-[230px] leading-none text-rose-500 my-auto">
              {liveMatch.player1.score}
            </div>

            {/* Shooter Status */}
            <div className="h-8 flex items-center justify-center">
              {liveMatch.currentTurn === 1 && (
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-2 bg-rose-500/15 px-4 py-1.5 rounded-full border border-rose-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Giliran Menembak
                </div>
              )}
            </div>
          </div>

          {/* Center Divider Dots */}
          <div className="flex flex-col items-center justify-around h-full py-16">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className={`w-2 h-2 rounded-full transition-colors ${
                  liveMatch.currentTurn === 1 && n <= 4
                    ? 'bg-rose-500'
                    : liveMatch.currentTurn === 2 && n >= 4
                    ? 'bg-blue-500'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          {/* Player 2 (Blue) */}
          <div
            className={`flex flex-col items-center justify-between p-8 rounded-3xl border transition-all h-full ${
              liveMatch.currentTurn === 2
                ? 'border-blue-500/60 bg-zinc-900 shadow-xl shadow-blue-950/30 ring-1 ring-blue-500/30'
                : 'border-zinc-800/80 bg-zinc-900/40 opacity-75'
            }`}
          >
            {/* Player Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <PlayerAvatar playerNumber={2} size="md" name={liveMatch.player2.name} isActiveTurn={liveMatch.currentTurn === 2} />
                <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white truncate max-w-[280px]">
                  {liveMatch.player2.name}
                </h2>
              </div>

              {isMultiSet && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase">
                  <Layers className="w-3.5 h-3.5" />
                  {liveMatch.player2Sets} / {liveMatch.targetSets} SET MENANG
                </div>
              )}
            </div>

            {/* Giant Score Numeral */}
            <div className="font-mono font-black font-tabular text-[130px] sm:text-[180px] lg:text-[230px] leading-none text-blue-500 my-auto">
              {liveMatch.player2.score}
            </div>

            {/* Shooter Status */}
            <div className="h-8 flex items-center justify-center">
              {liveMatch.currentTurn === 2 && (
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-2 bg-blue-500/15 px-4 py-1.5 rounded-full border border-blue-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Giliran Menembak
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800/80 pt-3 px-2 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>POOLSCORE ARENA BROADCAST</span>
        <span>REAL-TIME LIVE SCORE SYNC</span>
      </div>
    </div>
  );
};
