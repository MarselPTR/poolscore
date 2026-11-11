import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const liveUrl = typeof window !== 'undefined' ? `${window.location.origin}/?live=${match.id}` : '';

  // Render a real, scannable QR code for the live link.
  useEffect(() => {
    if (!isOpen || !liveUrl) return;
    let active = true;
    QRCode.toDataURL(liveUrl, { margin: 1, width: 320, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [isOpen, liveUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan pertandingan">
      <div className="space-y-5 select-none">
        <div className="text-center">
          <div className="inline-flex bg-white p-3 rounded-[4px]">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Kode QR pertandingan" className="w-40 h-40" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-[13px] text-zinc-500">
                Menyiapkan…
              </div>
            )}
          </div>
          <div className="eyebrow mt-4">Kode pertandingan</div>
          <div className="num text-3xl text-ink mt-1 tracking-wide">{match.id}</div>
        </div>

        <div>
          <label htmlFor="live-url" className="label">
            Tautan
          </label>
          <div className="flex gap-2">
            <input id="live-url" type="text" readOnly value={liveUrl} className="field font-mono !text-[13px]" />
            <button onClick={handleCopy} className="btn btn-secondary shrink-0">
              {copied ? <Check className="w-4 h-4 text-ok shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenTVView();
          }}
          className="btn btn-lg btn-block btn-primary"
        >
          <Tv className="w-4 h-4 shrink-0" />
          Buka tampilan TV
        </button>
      </div>
    </Modal>
  );
};
