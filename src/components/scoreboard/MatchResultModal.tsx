import React from 'react';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';
import { Share2, RotateCcw, Plus } from 'lucide-react';

interface MatchResultModalProps {
  isOpen: boolean;
  match: Match;
  onNewMatch: () => void;
  onRematch: () => void;
  onSaveAndFinish: () => void;
  onOpenShareCard: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  match,
  onNewMatch,
  onRematch,
  onSaveAndFinish,
  onOpenShareCard,
}) => {
  if (!isOpen) return null;

  const winner = match.winner === 1 ? match.player1 : match.winner === 2 ? match.player2 : null;
  const isMultiSet = match.targetSets && match.targetSets > 1;
  const score1 = isMultiSet ? match.player1Sets : match.player1.score;
  const score2 = isMultiSet ? match.player2Sets : match.player2.score;

  const bannerClass = match.winner === 1 ? 'bg-p1' : match.winner === 2 ? 'bg-p2' : 'bg-panel-3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop animate-fade select-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pertandingan selesai"
        className="w-full max-w-md bg-panel text-ink border border-rule rounded-md overflow-hidden animate-rise"
      >
        {/* Winner block in the winner's colour */}
        <div className={`${bannerClass} text-white px-6 py-6 text-center`}>
          <div className="font-display font-semibold uppercase tracking-[0.14em] text-sm opacity-85">
            {winner ? 'Pemenang' : 'Pertandingan selesai'}
          </div>
          <div className="display text-5xl mt-2 break-words">{winner ? winner.name : 'Seri'}</div>
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* Final score */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-right min-w-0">
              <div className="text-sm font-semibold text-ink-2 truncate">{match.player1.name}</div>
            </div>
            <div className="num text-6xl whitespace-nowrap">
              <span className="text-p1-ink">{score1}</span>
              <span className="text-ink-3 mx-2">–</span>
              <span className="text-p2-ink">{score2}</span>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-ink-2 truncate">{match.player2.name}</div>
            </div>
          </div>

          <div className="mt-3 text-center text-[13px] text-ink-3">
            {match.gameType} · {isMultiSet ? `skor set, race to ${match.raceTo} per set` : `race to ${match.raceTo}`}
            {' · '}
            {formatSeconds(match.durationSeconds)}
            {isMultiSet && (
              <>
                {' · '}set terakhir {match.player1.score}–{match.player2.score}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button onClick={onSaveAndFinish} className="btn btn-lg btn-block btn-primary">
              Simpan dan selesai
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={onRematch} className="btn btn-secondary !px-2">
                <RotateCcw className="w-4 h-4 shrink-0" />
                Rematch
              </button>
              <button onClick={onNewMatch} className="btn btn-secondary !px-2">
                <Plus className="w-4 h-4 shrink-0" />
                Baru
              </button>
              <button onClick={onOpenShareCard} className="btn btn-secondary !px-2">
                <Share2 className="w-4 h-4 shrink-0" />
                Bagikan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
