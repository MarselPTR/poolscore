import React, { useState } from 'react';
import type { Match } from '../../types';
import { useLiveReceiver } from '../../hooks/useLiveSync';
import { useFullscreen } from '../../hooks/useFullscreen';
import { formatSeconds } from '../../utils/time';
import { Maximize, Minimize, Tv, ArrowLeft } from 'lucide-react';

interface TVScoreboardViewProps {
  onBack: () => void;
}

export const TVScoreboardView: React.FC<TVScoreboardViewProps> = ({ onBack }) => {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useLiveReceiver((match) => {
    setLiveMatch(match);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black text-text flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden font-mono">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between border-b border-line-strong pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text transition-colors"
            title="Keluar dari Mode TV"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Tv className="w-6 h-6 text-felt" />
            <span className="font-display font-bold text-2xl uppercase tracking-widest text-text">
              PoolScore TV
            </span>
          </div>
        </div>

        {liveMatch && (
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-felt/20 text-felt border border-felt/40 px-3 py-1 rounded-lg font-bold uppercase">
              {liveMatch.gameType} · RACE TO {liveMatch.raceTo}
            </span>
            <span className="text-text-dim">
              RACK <b className="text-text">{liveMatch.currentRack}</b>
            </span>
            <span className="text-text-dim">
              ⏱ {formatSeconds(liveMatch.durationSeconds)}
            </span>
            <span className="flex items-center gap-1.5 text-red bg-red/10 border border-red/30 px-2.5 py-1 rounded-lg font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red" />
              LIVE
            </span>
          </div>
        )}

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text transition-colors"
          title="Fullscreen TV"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Stadium Score Arena */}
      {!liveMatch ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-line flex items-center justify-center mb-4 animate-pulse">
            <Tv className="w-10 h-10 text-text-faint" />
          </div>
          <h3 className="font-display font-bold text-3xl uppercase tracking-wider text-text">
            Menunggu Pertandingan Live...
          </h3>
          <p className="text-text-dim text-sm mt-2 max-w-md">
            Buka PoolScore di smartphone pemain atau wasit untuk mulai mencatat skor. Layar TV ini akan otomatis menampilkan skor secara real-time.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-[1fr_60px_1fr] items-center gap-6 my-auto py-6">
          {/* Player 1 (Red) */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all h-full ${
              liveMatch.currentTurn === 1
                ? 'border-red bg-gradient-to-r from-red/20 via-red/5 to-transparent shadow-[0_0_60px_rgba(240,74,58,0.25)]'
                : 'border-line/40 bg-surface/30 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-4 h-4 rounded-full bg-red shadow-[0_0_12px_#f04a3a]" />
              <h2 className="font-display font-bold text-4xl sm:text-6xl uppercase tracking-wider text-text truncate">
                {liveMatch.player1.name}
              </h2>
            </div>

            <div className="font-mono font-extrabold text-[120px] sm:text-[180px] lg:text-[220px] leading-none text-red drop-shadow-[0_0_30px_rgba(240,74,58,0.5)] my-auto">
              {liveMatch.player1.score}
            </div>

            {liveMatch.currentTurn === 1 && (
              <div className="font-mono text-sm uppercase tracking-widest text-red font-bold flex items-center gap-2 bg-red/10 px-4 py-1 rounded-full border border-red/30 mt-4 animate-pulse">
                ● Inning / Menembak
              </div>
            )}
          </div>

          {/* Center Divider */}
          <div className="flex flex-col items-center justify-around h-full py-12">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className={`w-3 h-3 rotate-45 rounded-sm transition-all ${
                  liveMatch.currentTurn === 1 && n <= 4
                    ? 'bg-red shadow-[0_0_10px_#f04a3a]'
                    : liveMatch.currentTurn === 2 && n >= 4
                    ? 'bg-blue shadow-[0_0_10px_#3f7bfa]'
                    : 'bg-text-faint'
                }`}
              />
            ))}
          </div>

          {/* Player 2 (Blue) */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all h-full ${
              liveMatch.currentTurn === 2
                ? 'border-blue bg-gradient-to-l from-blue/20 via-blue/5 to-transparent shadow-[0_0_60px_rgba(63,123,250,0.25)]'
                : 'border-line/40 bg-surface/30 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-4 h-4 rounded-full bg-blue shadow-[0_0_12px_#3f7bfa]" />
              <h2 className="font-display font-bold text-4xl sm:text-6xl uppercase tracking-wider text-text truncate">
                {liveMatch.player2.name}
              </h2>
            </div>

            <div className="font-mono font-extrabold text-[120px] sm:text-[180px] lg:text-[220px] leading-none text-blue drop-shadow-[0_0_30px_rgba(63,123,250,0.5)] my-auto">
              {liveMatch.player2.score}
            </div>

            {liveMatch.currentTurn === 2 && (
              <div className="font-mono text-sm uppercase tracking-widest text-blue font-bold flex items-center gap-2 bg-blue/10 px-4 py-1 rounded-full border border-blue/30 mt-4 animate-pulse">
                ● Inning / Menembak
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-line-strong pt-3 flex items-center justify-between text-xs text-text-faint">
        <span>POOLSCORE LIVE SPECTATOR ENGINE</span>
        <span>REAL-TIME MULTI-SCREEN BROADCAST</span>
      </div>
    </div>
  );
};
