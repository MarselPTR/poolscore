import React from 'react';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';
import { Share2, RotateCcw, PlusCircle, CheckCircle, Layers } from 'lucide-react';
import { IconTrophyCup } from '../common/BilliardIcons';

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

  const winner = match.winner === 1 ? match.player1 : (match.winner === 2 ? match.player2 : null);
  const isP1 = match.winner === 1;
  const isMultiSet = match.targetSets && match.targetSets > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md glass-panel-strong rounded-3xl p-6 sm:p-8 text-center border border-line-strong shadow-2xl animate-slide-up">
        {/* Animated Trophy Cup */}
        <div className="w-20 h-20 rounded-3xl bg-amber/20 border border-amber/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_35px_rgba(242,169,59,0.35)] animate-bounce">
          <IconTrophyCup size={48} />
        </div>

        {/* Label */}
        <div className="font-mono text-xs uppercase tracking-[0.24em] text-text-faint">
          Match Complete
        </div>

        {/* Winner Name */}
        <div
          className={`font-display font-bold text-3xl sm:text-4xl uppercase tracking-wider mt-1 ${
            isP1 ? 'text-red drop-shadow-[0_0_15px_rgba(240,74,58,0.5)]' : 'text-blue drop-shadow-[0_0_15px_rgba(63,123,250,0.5)]'
          }`}
        >
          {winner ? winner.name : 'Draw'} Wins!
        </div>

        {/* Multi-Set Score Badge if Multi-Set Match */}
        {isMultiSet ? (
          <div className="my-3 p-3 rounded-2xl bg-surface-2 border border-line">
            <div className="text-[10px] font-mono uppercase text-amber flex items-center justify-center gap-1 font-bold">
              <Layers className="w-3 h-3" /> Hasil Akhir Skor Babak (Sets)
            </div>
            <div className="font-mono font-extrabold text-4xl sm:text-5xl text-text mt-1">
              <span className="text-red">{match.player1Sets}</span>
              <span className="text-text-faint mx-3">—</span>
              <span className="text-blue">{match.player2Sets}</span>
            </div>
            <div className="text-[11px] font-mono text-text-faint mt-1">
              Best of {match.targetSets * 2 - 1} Sets (Race to {match.targetSets} Sets)
            </div>
          </div>
        ) : (
          /* Final Single Set Score */
          <div className="font-mono font-extrabold text-5xl sm:text-6xl my-3 tracking-tighter text-text">
            <span className="text-red">{match.player1.score}</span>
            <span className="text-text-faint mx-3">—</span>
            <span className="text-blue">{match.player2.score}</span>
          </div>
        )}

        {/* Metadata & Duration */}
        <div className="font-mono text-xs text-text-dim flex items-center justify-center gap-2 mb-6">
          <span className="uppercase">{match.gameType}</span>
          <span className="text-text-faint">·</span>
          <span>Race to {match.raceTo} per Set</span>
          <span className="text-text-faint">·</span>
          <span>{formatSeconds(match.durationSeconds)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={onOpenShareCard}
            className="col-span-2 py-3.5 px-4 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-felt/30 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Bagikan Kartu Skor (Share)
          </button>

          <button
            onClick={onRematch}
            className="py-3 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line-strong text-text font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-felt" />
            Rematch
          </button>

          <button
            onClick={onNewMatch}
            className="py-3 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line-strong text-text font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-blue" />
            New Match
          </button>

          <button
            onClick={onSaveAndFinish}
            className="col-span-2 py-2.5 px-4 rounded-xl bg-surface-3 hover:bg-surface-2 text-text-dim hover:text-text font-semibold font-ui text-xs uppercase transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
