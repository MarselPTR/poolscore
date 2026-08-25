import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { generateShareCardCanvas, downloadShareCard, shareMatchCardNative } from '../../utils/shareCard';
import { formatTimestampDate } from '../../utils/time';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const isMultiSet = match.targetSets && match.targetSets > 1;

  useEffect(() => {
    let isMounted = true;
    if (isOpen && match) {
      setIsGenerating(true);
      generateShareCardCanvas(match)
        .then(() => {
          if (isMounted) {
            setIsGenerating(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsGenerating(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, match]);

  const handleCopyText = () => {
    const winner = match.winner === 1 ? match.player1.name : (match.winner === 2 ? match.player2.name : 'Draw');
    const scoreStr = isMultiSet
      ? `🔴 ${match.player1.name}: ${match.player1Sets} Sets\n🔵 ${match.player2.name}: ${match.player2Sets} Sets`
      : `🔴 ${match.player1.name}: ${match.player1.score}\n🔵 ${match.player2.name}: ${match.player2.score}`;

    const text = `🎱 PoolScore Match Result:
${match.gameType} — ${isMultiSet ? `Best of ${match.targetSets * 2 - 1} Sets (Race to ${match.raceTo}/Set)` : `Race to ${match.raceTo}`}
${scoreStr}
🏆 Pemenang: ${winner}
📅 ${formatTimestampDate(match.startedAt)}
Dicatat dengan PoolScore PWA.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Hasil Pertandingan">
      <div className="space-y-4 select-none">
        {/* Card Preview Container */}
        <div className="relative mx-auto max-w-[340px] rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-xl overflow-hidden text-white font-tabular">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PoolScore" className="w-6 h-6 rounded-lg object-contain" />
              <span className="font-bold text-xs uppercase tracking-tight text-white">
                PoolScore
              </span>
            </div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-rose-400 uppercase">
              {match.gameType} · FINAL {isMultiSet ? `(${match.targetSets} SETS)` : ''}
            </div>
          </div>

          {/* Player 1 Row */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 font-bold text-base uppercase truncate">
              <PlayerAvatar playerNumber={1} size="xs" name={match.player1.name} />
              <span className="truncate">{match.player1.name}</span>
            </div>
            <div className="font-mono font-black text-2xl text-rose-400">
              {isMultiSet ? match.player1Sets : match.player1.score}
            </div>
          </div>

          <div className="text-center font-mono text-[10px] text-zinc-500 my-1">
            {isMultiSet ? `— SETS SCORE (RACE TO ${match.raceTo}/SET) —` : `— RACE TO ${match.raceTo} —`}
          </div>

          {/* Player 2 Row */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 font-bold text-base uppercase truncate">
              <PlayerAvatar playerNumber={2} size="xs" name={match.player2.name} />
              <span className="truncate">{match.player2.name}</span>
            </div>
            <div className="font-mono font-black text-2xl text-blue-400">
              {isMultiSet ? match.player2Sets : match.player2.score}
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>{formatTimestampDate(match.startedAt)}</span>
            <span>PoolScore PWA</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => downloadShareCard(match)}
            disabled={isGenerating}
            className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Gambar
          </button>

          <button
            onClick={() => shareMatchCardNative(match)}
            disabled={isGenerating}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            Bagikan
          </button>
        </div>

        <button
          onClick={handleCopyText}
          className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Teks ringkasan disalin!' : 'Salin Teks Ringkasan Skor'}
        </button>
      </div>
    </Modal>
  );
};
