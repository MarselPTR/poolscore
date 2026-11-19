import React from 'react';
import { History, ArrowLeftRight, Play, Pause, Undo2, Flag, Zap } from 'lucide-react';
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
  /** When false, the match clock and its pause control are hidden. */
  showClock?: boolean;
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
  showClock = true,
}) => {
  // Labels collapse to icons on narrow phones; the title keeps them discoverable.
  const actionClass = 'btn btn-secondary !px-3 sm:!px-4';

  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-4 h-14 border-t border-rule bg-bg select-none shrink-0 safe-area-pb">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button onClick={onUndo} disabled={!canUndo} className={actionClass} title="Batalkan aksi terakhir">
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        <button onClick={onSwitchTurn} className={actionClass} title="Ganti giliran menembak">
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">Giliran</span>
        </button>

        <button onClick={onOpenFoul} className={actionClass} title="Catat foul">
          <Flag className="w-4 h-4 text-warn" />
          <span>Foul</span>
        </button>

        <button onClick={onOpenBreak} className={actionClass} title="Catat break">
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Break</span>
        </button>

        <button onClick={onOpenHistory} className={actionClass} title="Riwayat rack dan log">
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Log</span>
        </button>
      </div>

      {/* Match clock (hidden when the user turns the timer display off) */}
      {showClock && (
      <div className="flex items-center gap-2 pl-3 border-l border-rule shrink-0">
        <div className="text-right">
          <div className={`num text-xl ${isPaused ? 'text-ink-3' : 'text-ink'}`}>
            {formatSeconds(durationSeconds)}
          </div>
          {showRackTimer && (
            <div className="text-xs text-ink-3 tabular-nums leading-tight">
              Rack {formatSeconds(rackSeconds)}
            </div>
          )}
        </div>

        <button
          onClick={onTogglePause}
          className="icon-btn"
          title={isPaused ? 'Lanjutkan timer' : 'Jeda timer'}
          aria-label={isPaused ? 'Lanjutkan timer' : 'Jeda timer'}
        >
          {isPaused ? <Play className="w-[18px] h-[18px]" /> : <Pause className="w-[18px] h-[18px]" />}
        </button>
      </div>
      )}
    </div>
  );
};
