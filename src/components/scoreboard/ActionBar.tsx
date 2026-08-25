import React from 'react';
import { History, ArrowLeftRight, Play, Pause } from 'lucide-react';
import { formatSeconds } from '../../utils/time';
import { IconUndoMotion, IconFoulScratch, IconBreakShot } from '../common/BilliardIcons';

interface ActionBarProps {
  onUndo: () => void;
  onOpenFoul: () => void;
  onOpenBreak: () => void;
  onOpenHistory: () => void;
  onSwitchTurn: () => void;
  durationSeconds: number;
  rackSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  canUndo: boolean;
  showRackTimer?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onUndo,
  onOpenFoul,
  onOpenBreak,
  onOpenHistory,
  onSwitchTurn,
  durationSeconds,
  rackSeconds,
  isPaused,
  onTogglePause,
  canUndo,
  showRackTimer = true,
}) => {
  return (
    <div className="flex items-center justify-between px-2 sm:px-6 py-2 border-t border-line bg-surface-2/90 backdrop-blur-md select-none gap-1 sm:gap-2">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5 scrollbar-none">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-text-dim hover:text-text hover:bg-surface-3 transition-colors text-xs font-mono uppercase font-semibold disabled:opacity-30 disabled:pointer-events-none active:scale-95 border border-transparent hover:border-line"
          title="Batalkan Aksi Terakhir (Undo)"
        >
          <IconUndoMotion size={16} />
          <span className="hidden xs:inline">Undo</span>
        </button>

        {/* Foul Button */}
        <button
          onClick={onOpenFoul}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-amber hover:text-amber-300 hover:bg-amber/15 transition-colors text-xs font-mono uppercase font-bold active:scale-95 border border-amber/30"
        >
          <IconFoulScratch size={18} />
          <span>Foul</span>
        </button>

        {/* Break Tracker Button */}
        <button
          onClick={onOpenBreak}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-text-dim hover:text-text hover:bg-surface-3 transition-colors text-xs font-mono uppercase font-semibold active:scale-95 border border-transparent hover:border-line"
        >
          <IconBreakShot size={18} />
          <span className="hidden xs:inline">Break</span>
        </button>

        {/* History / Timeline Drawer */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-text-dim hover:text-text hover:bg-surface-3 transition-colors text-xs font-mono uppercase font-semibold active:scale-95 border border-transparent hover:border-line"
        >
          <History className="w-4 h-4 text-felt" />
          <span className="hidden xs:inline">History</span>
        </button>

        {/* Switch Turn Button */}
        <button
          onClick={onSwitchTurn}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-text-dim hover:text-text hover:bg-surface-3 transition-colors text-xs font-mono uppercase font-semibold active:scale-95 border border-transparent hover:border-line"
          title="Alihkan Giliran Menembak"
        >
          <ArrowLeftRight className="w-4 h-4 text-blue" />
          <span className="hidden sm:inline">Turn</span>
        </button>
      </div>

      {/* Right: Timer Section */}
      <div className="flex items-center gap-2 pl-2 border-l border-line font-mono shrink-0">
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-lg text-text-dim hover:text-text hover:bg-surface-3 transition-colors"
          title={isPaused ? 'Lanjutkan Timer' : 'Jeda Timer'}
        >
          {isPaused ? <Play className="w-4 h-4 text-felt fill-felt" /> : <Pause className="w-4 h-4" />}
        </button>

        <div className="text-right">
          <div className="text-xs sm:text-sm font-bold text-text tracking-wider">
            {formatSeconds(durationSeconds)}
          </div>
          {showRackTimer && (
            <div className="text-[10px] text-text-faint">
              Rack: {formatSeconds(rackSeconds)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
