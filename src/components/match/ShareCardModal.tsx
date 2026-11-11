import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { generateShareCardCanvas, downloadShareCard, shareMatchCardNative } from '../../utils/shareCard';
import { formatTimestampDate } from '../../utils/time';
import { Download, Share2, Copy, Check } from 'lucide-react';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isMultiSet = match.targetSets && match.targetSets > 1;

  // The preview is the real image that will be downloaded or shared.
  useEffect(() => {
    let isMounted = true;
    if (isOpen && match) {
      setIsGenerating(true);
      generateShareCardCanvas(match)
        .then((canvas) => {
          if (isMounted) {
            setPreviewUrl(canvas.toDataURL('image/png'));
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
    const winner = match.winner === 1 ? match.player1.name : (match.winner === 2 ? match.player2.name : 'Seri');
    const scoreStr = isMultiSet
      ? `${match.player1.name} ${match.player1Sets} - ${match.player2Sets} ${match.player2.name} (set)`
      : `${match.player1.name} ${match.player1.score} - ${match.player2.score} ${match.player2.name}`;

    const text = `Hasil pertandingan PoolScore
${match.gameType}, ${isMultiSet ? `best of ${match.targetSets * 2 - 1} set (race to ${match.raceTo} per set)` : `race to ${match.raceTo}`}
${scoreStr}
Pemenang: ${winner}
${formatTimestampDate(match.startedAt)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan hasil">
      <div className="space-y-4 select-none">
        <div className="mx-auto max-w-[320px] aspect-[5/6] bg-panel-2 border border-rule flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Pratinjau kartu hasil pertandingan" className="w-full h-full object-contain" />
          ) : (
            <span className="text-sm text-ink-3">
              {isGenerating ? 'Menyiapkan gambar…' : 'Pratinjau tidak tersedia'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => downloadShareCard(match)} disabled={isGenerating} className="btn btn-primary">
            <Download className="w-4 h-4" />
            Unduh gambar
          </button>

          <button onClick={() => shareMatchCardNative(match)} disabled={isGenerating} className="btn btn-secondary">
            <Share2 className="w-4 h-4" />
            Bagikan
          </button>
        </div>

        <button onClick={handleCopyText} className="btn btn-ghost btn-block">
          {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Ringkasan tersalin' : 'Salin ringkasan sebagai teks'}
        </button>
      </div>
    </Modal>
  );
};
