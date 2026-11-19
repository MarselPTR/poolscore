import React, { useState } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useMatch } from '../../context/MatchContext';
import { formatSeconds } from '../../utils/time';
import { ConfirmDialog } from './ConfirmDialog';

interface ResumeMatchBarProps {
  /** Re-open the full scoreboard for the running match. */
  onResume: () => void;
}

/**
 * Floating bar shown on every dashboard tab while a match is running but the
 * scoreboard is minimized. It keeps the live score and clock in view, lets the
 * user jump back into the match, and offers a quick cancel. The clock keeps
 * advancing because the timer lives in MatchContext, not the (unmounted)
 * scoreboard.
 */
export const ResumeMatchBar: React.FC<ResumeMatchBarProps> = ({ onResume }) => {
  const { activeMatch, isPaused, quitMatch } = useMatch();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  if (!activeMatch || activeMatch.status !== 'in_progress') return null;

  const { player1, player2, gameType, durationSeconds } = activeMatch;

  return (
    <>
      <div
        className="fixed inset-x-0 z-30 px-3 md:px-6 pointer-events-none
                   bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-4"
      >
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="flex items-stretch h-14 bg-ink text-bg shadow-xl animate-rise">
            {/* Tap the main area to resume */}
            <button
              onClick={onResume}
              aria-label={`Lanjutkan pertandingan ${player1.name} lawan ${player2.name}`}
              className="group flex-1 min-w-0 flex items-center gap-3 pl-3.5 pr-2"
            >
              {/* Live indicator (or paused) */}
              <span className="shrink-0 flex items-center justify-center w-7">
                {isPaused ? (
                  <Pause className="w-4 h-4 opacity-80" />
                ) : (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
                  </span>
                )}
              </span>

              {/* Players + score */}
              <div className="min-w-0 flex-1 text-left leading-tight">
                <div className="flex items-center gap-2 font-semibold truncate">
                  <span className="truncate">{player1.name}</span>
                  <span className="num shrink-0 tabular-nums">
                    {player1.score}<span className="opacity-50 mx-0.5">–</span>{player2.score}
                  </span>
                  <span className="truncate">{player2.name}</span>
                </div>
                <div className="text-[11px] uppercase tracking-wide opacity-60 truncate">
                  {gameType} · {isPaused ? 'Dijeda' : 'Berlangsung'} · {formatSeconds(durationSeconds)}
                </div>
              </div>

              {/* Resume affordance */}
              <span className="shrink-0 flex items-center gap-1.5 h-9 px-3 bg-bg text-ink font-display font-semibold uppercase text-sm tracking-wide">
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Lanjutkan</span>
              </span>
            </button>

            {/* Cancel the match (with confirmation) */}
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              aria-label="Batalkan pertandingan"
              title="Batalkan pertandingan"
              className="shrink-0 flex items-center justify-center w-11 border-l border-bg/15 text-bg/70 hover:text-danger"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={quitMatch}
        title="Batalkan pertandingan?"
        message="Pertandingan ini akan dihapus dan TIDAK tersimpan ke riwayat maupun statistik. Tindakan ini tidak bisa dibatalkan."
        confirmText="Ya, batalkan"
        cancelText="Lanjut bermain"
        type="danger"
        iconType="delete"
      />
    </>
  );
};
