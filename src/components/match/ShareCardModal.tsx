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
        <div className="relative mx-auto max-w-[340px] rounded-3xl bg-surface border border-line-strong p-5 shadow-2xl overflow-hidden text-text">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PoolScore" className="w-6 h-6 rounded-md object-contain" />
              <span className="font-display font-bold text-xs uppercase tracking-widest text-text">
                PoolScore
              </span>
            </div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-red uppercase">
              {match.gameType} · FINAL {isMultiSet ? `(${match.targetSets} SETS)` : ''}
            </div>
          </div>

          {/* Player 1 Row */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-lg uppercase truncate">
              <PlayerAvatar playerNumber={1} size="xs" name={match.player1.name} />
              <span className="truncate">{match.player1.name}</span>
            </div>
            <div className="font-mono font-extrabold text-3xl text-red">
              {isMultiSet ? match.player1Sets : match.player1.score}
            </div>
          </div>

          <div className="text-center font-mono text-[11px] text-text-faint my-1">
            {isMultiSet ? `— SETS SCORE (RACE TO ${match.raceTo}/SET) —` : `— RACE TO ${match.raceTo} —`}
          </div>

          {/* Player 2 Row */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-lg uppercase truncate">
              <PlayerAvatar playerNumber={2} size="xs" name={match.player2.name} />
              <span className="truncate">{match.player2.name}</span>
            </div>
            <div className="font-mono font-extrabold text-3xl text-blue">
              {isMultiSet ? match.player2Sets : match.player2.score}
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-line text-right font-mono text-[10px] text-text-faint">
            {formatTimestampDate(match.startedAt).toUpperCase()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => downloadShareCard(match)}
            disabled={isGenerating}
            className="py-3.5 px-3 rounded-xl bg-red hover:bg-red-600 text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>

          <button
            onClick={() => shareMatchCardNative(match)}
            disabled={isGenerating}
            className="py-3.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line-strong text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 text-blue" />
            Share WhatsApp
          </button>

          <button
            onClick={handleCopyText}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-text-dim hover:text-text font-semibold font-ui text-xs uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Teks Tersalin ke Clipboard!' : 'Salin Ringkasan Teks'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
