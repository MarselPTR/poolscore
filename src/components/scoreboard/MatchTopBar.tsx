import React from 'react';
import type { Match } from '../../types';
import { Maximize, Minimize, QrCode, MoreVertical, Tv, Layers } from 'lucide-react';

interface MatchTopBarProps {
  match: Match;
  isWakeLocked: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenQR: () => void;
  onOpenTV: () => void;
  onOpenSettings: () => void;
}

export const MatchTopBar: React.FC<MatchTopBarProps> = ({
  match,
  isWakeLocked,
  isFullscreen,
  onToggleFullscreen,
  onOpenQR,
  onOpenTV,
  onOpenSettings,
}) => {
  const maxPossibleRacks = match.raceTo * 2 - 1;
  const isMultiSet = match.targetSets && match.targetSets > 1;

  return (
    <div className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl text-xs select-none shrink-0">
      {/* Left: Match Info & Game Type */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="font-semibold text-white uppercase tracking-wider bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {match.gameType}
        </span>

        {/* Set / Babak Counter if Multi-Set */}
        {isMultiSet && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl font-semibold">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>SET {match.currentSet}</span>
            <span className="text-zinc-500 font-normal hidden sm:inline">(Race to {match.targetSets} Sets)</span>
          </div>
        )}

        <span className="text-zinc-400 flex items-center gap-1 font-mono text-xs">
          RACE TO <b className="text-white font-bold">{match.raceTo}</b>
        </span>

        <span className="text-zinc-700 hidden xs:inline">·</span>

        <span className="text-zinc-400 font-mono text-xs">
          RACK <span className="text-white font-bold">{match.currentRack}</span>
          <span className="text-zinc-600">/{maxPossibleRacks}</span>
        </span>

        {/* Set Score Banner if Multi-Set */}
        {isMultiSet && (
          <div className="hidden lg:flex items-center gap-2 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold">
            <span className="text-zinc-500 uppercase text-[10px]">Skor Babak:</span>
            <span className="text-rose-400">{match.player1Sets}</span>
            <span className="text-zinc-600">-</span>
            <span className="text-blue-400">{match.player2Sets}</span>
          </div>
        )}

        {match.tableNumber && (
          <span className="text-zinc-300 font-medium bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-800 hidden sm:inline">
            MEJA {match.tableNumber}
          </span>
        )}
      </div>

      {/* Right: Controls & Indicators */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Wake Lock Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
            isWakeLocked ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30' : 'text-zinc-500 bg-zinc-900/50 border border-zinc-800'
          }`}
          title={isWakeLocked ? 'Layar dijaga tetap menyala' : 'Wake Lock tidak aktif'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isWakeLocked ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="hidden sm:inline">{isWakeLocked ? 'Screen Awake' : 'Wake Lock Off'}</span>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* QR Code */}
        <button
          onClick={onOpenQR}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          title="Bagikan Live Match / QR"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* TV Mode */}
        <button
          onClick={onOpenTV}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all hidden sm:block"
          title="Tampilan TV Arena"
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          title="Pengaturan"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
