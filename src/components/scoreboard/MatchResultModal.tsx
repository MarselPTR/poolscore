import React from 'react';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';
import { Share2, RotateCcw, PlusCircle, CheckCircle, Trophy, Layers } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl p-6 sm:p-7 text-center border border-zinc-800 shadow-2xl animate-slide-up">
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
          <Trophy className="w-8 h-8 shrink-0" />
        </div>

        {/* Status */}
        <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
          Pertandingan Selesai
        </div>

        {/* Winner Name */}
        <div
          className={`font-bold text-2xl sm:text-3xl uppercase tracking-tight mt-1 ${
            isP1 ? 'text-rose-400' : 'text-blue-400'
          }`}
        >
          {winner ? winner.name : 'Draw'} Menang!
        </div>

        {/* Final Score Card */}
        {isMultiSet ? (
          <div className="my-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5 shrink-0" /> Hasil Akhir Skor Babak
            </div>
            <div className="font-mono font-black text-4xl text-white mt-1 font-tabular">
              <span className="text-rose-400">{match.player1Sets}</span>
              <span className="text-zinc-600 mx-3">-</span>
              <span className="text-blue-400">{match.player2Sets}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Rack Terakhir: {match.player1.score} - {match.player2.score}
            </div>
          </div>
        ) : (
          <div className="my-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-400">
              Skor Akhir Rack ({match.gameType})
            </div>
            <div className="font-mono font-black text-4xl text-white mt-1 font-tabular">
              <span className="text-rose-400">{match.player1.score}</span>
              <span className="text-zinc-600 mx-3">-</span>
              <span className="text-blue-400">{match.player2.score}</span>
            </div>
          </div>
        )}

        {/* Match Duration & Meta */}
        <div className="text-xs text-zinc-400 font-mono mb-5">
          Durasi Pertandingan: <span className="text-white font-semibold">{formatSeconds(match.durationSeconds)}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onOpenShareCard}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Bagikan Kartu Skor</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRematch}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-all active:scale-95 truncate"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Rematch</span>
            </button>

            <button
              onClick={onNewMatch}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-all active:scale-95 truncate"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Match Baru</span>
            </button>
          </div>

          <button
            onClick={onSaveAndFinish}
            className="w-full py-2.5 px-3 rounded-xl text-zinc-500 hover:text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Simpan & Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
