import React from 'react';
import { History, ArrowLeftRight, Play, Pause, RotateCcw, AlertTriangle, Zap } from 'lucide-react';
import { formatSeconds } from '../../utils/time';

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
    <div className="flex items-center justify-between px-3 sm:px-6 py-2 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg select-none gap-2">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-medium uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none active:scale-95 border border-zinc-800"
          title="Batalkan Aksi Terakhir"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">Undo</span>
        </button>

        {/* Foul Button */}
        <button
          onClick={onOpenFoul}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 transition-colors text-xs font-semibold uppercase tracking-wider active:scale-95 border border-rose-500/30"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Foul</span>
        </button>

        {/* Break Tracker Button */}
        <button
          onClick={onOpenBreak}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-medium uppercase tracking-wider active:scale-95 border border-zinc-800"
        >
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">Break</span>
        </button>

        {/* History / Timeline Drawer */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-medium uppercase tracking-wider active:scale-95 border border-zinc-800"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">Log</span>
        </button>

        {/* Switch Turn Button */}
        <button
          onClick={onSwitchTurn}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs font-medium uppercase tracking-wider active:scale-95 border border-zinc-800"
          title="Alihkan Giliran Menembak"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Turn</span>
        </button>
      </div>

      {/* Right: Match Timer Controls */}
      <div className="flex items-center gap-2 pl-3 border-l border-zinc-800 font-mono font-tabular shrink-0">
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          title={isPaused ? 'Lanjutkan Timer' : 'Jeda Timer'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        <div className="text-right">
          <div className="text-xs sm:text-sm font-bold text-zinc-200">
            {formatSeconds(durationSeconds)}
          </div>
          {showRackTimer && (
            <div className="text-[10px] text-zinc-500">
              Rack: {formatSeconds(rackSeconds)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
