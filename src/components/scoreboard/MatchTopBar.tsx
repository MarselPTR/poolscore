import React from 'react';
import type { Match } from '../../types';
import { Maximize, Minimize, QrCode, MoreVertical, Layers } from 'lucide-react';
import { IconTVScreen } from '../common/BilliardIcons';

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
    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-b border-line bg-surface-2/70 backdrop-blur-md text-xs font-mono select-none">
      {/* Left: Match Specifications */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="font-bold text-text uppercase tracking-wider bg-surface-3 px-2.5 py-1 rounded-lg border border-line flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-felt" />
          {match.gameType}
        </span>

        {/* Set / Babak Counter if Multi-Set */}
        {isMultiSet ? (
          <div className="flex items-center gap-1.5 bg-amber/15 text-amber border border-amber/30 px-2.5 py-1 rounded-lg font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>SET {match.currentSet}</span>
            <span className="text-text-faint font-normal">(Race to {match.targetSets} Sets)</span>
          </div>
        ) : null}

        <span className="text-text-dim flex items-center gap-1">
          RACE TO <b className="text-text font-bold">{match.raceTo}</b>
        </span>

        <span className="text-text-faint hidden xs:inline">·</span>

        <span className="text-text-dim">
          RACK <span className="text-text font-bold">{match.currentRack}</span>
          <span className="text-text-faint">/{maxPossibleRacks}</span>
        </span>

        {/* Set Score Banner if Multi-Set */}
        {isMultiSet && (
          <div className="hidden md:flex items-center gap-2 bg-surface-3 px-2.5 py-1 rounded-lg border border-line text-[11px] font-bold">
            <span className="text-text-faint uppercase text-[9px]">Skor Babak:</span>
            <span className="text-red">🔴 {match.player1Sets}</span>
            <span className="text-text-faint">—</span>
            <span className="text-blue">{match.player2Sets} 🔵</span>
          </div>
        )}

        {match.tableNumber && (
          <span className="text-felt font-bold bg-felt/10 px-2 py-0.5 rounded border border-felt/20 hidden sm:inline">
            MEJA {match.tableNumber}
          </span>
        )}
      </div>

      {/* Right: Status Indicators & Quick Device Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wake Lock Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-xs transition-colors ${
            isWakeLocked ? 'text-felt bg-felt/10 border border-felt/30' : 'text-text-faint'
          }`}
          title={isWakeLocked ? 'Layar dijaga tetap menyala' : 'Wake Lock tidak aktif'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isWakeLocked ? 'bg-felt animate-pulse' : 'bg-text-faint'}`} />
          <span className="hidden sm:inline">{isWakeLocked ? 'Screen Awake' : 'Wake Lock Off'}</span>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1.5 text-red text-[10px] sm:text-xs font-bold bg-red/10 px-2 py-0.5 rounded border border-red/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* QR Code live share */}
        <button
          onClick={onOpenQR}
          className="p-1.5 text-text-dim hover:text-text hover:bg-surface-3 rounded-lg transition-colors"
          title="Bagikan Live Match / QR"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* TV Mode */}
        <button
          onClick={onOpenTV}
          className="p-1.5 text-text-dim hover:text-text hover:bg-surface-3 rounded-lg transition-colors hidden sm:block"
          title="Tampilan TV / Big Screen"
        >
          <IconTVScreen size={18} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 text-text-dim hover:text-text hover:bg-surface-3 rounded-lg transition-colors"
          title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-text-dim hover:text-text hover:bg-surface-3 rounded-lg transition-colors"
          title="Pengaturan Match"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
