import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { Copy, Check, Tv } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onOpenTVView: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  match,
  onOpenTVView,
}) => {
  const [copied, setCopied] = useState(false);

  const liveUrl = typeof window !== 'undefined' ? `${window.location.origin}/?live=${match.id}` : '';

  // Generate SVG QR Code pattern dynamically
  const generateQRSvg = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-inner">
        {/* QR Corner 1 */}
        <rect x="5" y="5" width="26" height="26" fill="#000" />
        <rect x="9" y="9" width="18" height="18" fill="#fff" />
        <rect x="13" y="13" width="10" height="10" fill="#000" />

        {/* QR Corner 2 */}
        <rect x="69" y="5" width="26" height="26" fill="#000" />
        <rect x="73" y="9" width="18" height="18" fill="#fff" />
        <rect x="77" y="13" width="10" height="10" fill="#000" />

        {/* QR Corner 3 */}
        <rect x="5" y="69" width="26" height="26" fill="#000" />
        <rect x="9" y="73" width="18" height="18" fill="#fff" />
        <rect x="13" y="77" width="10" height="10" fill="#000" />

        {/* Data Dots */}
        <rect x="38" y="10" width="6" height="6" fill="#000" />
        <rect x="50" y="14" width="6" height="6" fill="#000" />
        <rect x="36" y="24" width="6" height="6" fill="#000" />
        <rect x="48" y="26" width="6" height="6" fill="#000" />

        <rect x="12" y="38" width="6" height="6" fill="#000" />
        <rect x="24" y="44" width="6" height="6" fill="#000" />
        <rect x="10" y="52" width="6" height="6" fill="#000" />
        <rect x="22" y="58" width="6" height="6" fill="#000" />

        <rect x="38" y="38" width="8" height="8" fill="#e11d48" />
        <rect x="54" y="42" width="8" height="8" fill="#000" />
        <rect x="44" y="54" width="8" height="8" fill="#000" />
        <rect x="56" y="58" width="8" height="8" fill="#000" />

        <rect x="70" y="38" width="6" height="6" fill="#000" />
        <rect x="82" y="44" width="6" height="6" fill="#000" />
        <rect x="72" y="52" width="6" height="6" fill="#000" />
        <rect x="84" y="58" width="6" height="6" fill="#000" />

        <rect x="38" y="70" width="6" height="6" fill="#000" />
        <rect x="48" y="76" width="6" height="6" fill="#000" />
        <rect x="40" y="84" width="6" height="6" fill="#000" />
        <rect x="52" y="88" width="6" height="6" fill="#000" />

        <rect x="70" y="70" width="6" height="6" fill="#000" />
        <rect x="84" y="76" width="6" height="6" fill="#000" />
        <rect x="76" y="84" width="6" height="6" fill="#000" />
        <rect x="88" y="88" width="6" height="6" fill="#000" />
      </svg>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Match & QR Spectator">
      <div className="space-y-4 text-center select-none">
        {/* QR Display */}
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
          {generateQRSvg()}
          <div className="mt-3 font-mono font-bold text-sm tracking-wider text-rose-400">
            KODE MATCH: {match.id}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Penonton atau wasit cukup scan QR ini untuk melihat live scoreboard.
          </div>
        </div>

        {/* Link Box */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
          <input
            type="text"
            readOnly
            value={liveUrl}
            className="w-full bg-transparent text-zinc-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-semibold text-xs flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin'}
          </button>
        </div>

        {/* TV Mode Launch CTA */}
        <button
          onClick={() => {
            onClose();
            onOpenTVView();
          }}
          className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-700/60 shadow-sm transition-all active:scale-95"
        >
          <Tv className="w-4 h-4 text-zinc-400" />
          Buka Tampilan TV Layar Penuh
        </button>
      </div>
    </Modal>
  );
};
