import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { FoulType } from '../../types';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { IconFoulScratch, IconBallInHand } from '../common/BilliardIcons';

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1Name: string;
  player2Name: string;
  currentTurn: 1 | 2;
  onSubmitFoul: (player: 1 | 2, foulType: FoulType) => void;
}

export const FoulModal: React.FC<FoulModalProps> = ({
  isOpen,
  onClose,
  player1Name,
  player2Name,
  currentTurn,
  onSubmitFoul,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<1 | 2>(currentTurn);
  const [selectedFoul, setSelectedFoul] = useState<FoulType>('Scratch');

  const foulTypes: { type: FoulType; label: string; desc: string }[] = [
    { type: 'Scratch', label: 'Scratch (Cue Ball Masuk)', desc: 'Bola putih masuk ke dalam lubang kantong meja' },
    { type: 'Illegal Hit', label: 'Illegal Hit', desc: 'Tidak mengenai bola sasaran yang sah terlebih dahulu' },
    { type: 'No Rail', label: 'No Rail Contact', desc: 'Tidak ada bola yang menyentuh bantalan (rail) setelah kontak' },
    { type: 'Wrong Ball', label: 'Wrong Ball (Salah Bola)', desc: 'Menembak nomor bola yang tidak sesuai urutan/grup' },
    { type: 'Other', label: 'Pelanggaran Lainnya', desc: 'Sentuhan tangan/stik, bola melompat keluar meja, dll.' },
  ];

  const handleSubmit = () => {
    onSubmitFoul(selectedPlayer, selectedFoul);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pelanggaran (Foul)">
      <div className="space-y-4">
        {/* Player Selector */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Pemain yang Melakukan Foul
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlayer(1)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-display uppercase tracking-wider font-bold transition-all ${
                selectedPlayer === 1
                  ? 'border-red bg-red/20 text-red shadow-[0_0_15px_rgba(240,74,58,0.3)]'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <PlayerAvatar playerNumber={1} name={player1Name} size="xs" isActiveTurn={selectedPlayer === 1} />
              <span className="truncate">{player1Name}</span>
            </button>
            <button
              onClick={() => setSelectedPlayer(2)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-display uppercase tracking-wider font-bold transition-all ${
                selectedPlayer === 2
                  ? 'border-blue bg-blue/20 text-blue shadow-[0_0_15px_rgba(63,123,250,0.3)]'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <PlayerAvatar playerNumber={2} name={player2Name} size="xs" isActiveTurn={selectedPlayer === 2} />
              <span className="truncate">{player2Name}</span>
            </button>
          </div>
        </div>

        {/* Foul Types */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Jenis Pelanggaran
          </label>
          <div className="space-y-2">
            {foulTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedFoul(item.type)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between ${
                  selectedFoul === item.type
                    ? 'border-amber bg-amber/15 text-amber shadow-sm'
                    : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs text-text-faint mt-0.5">{item.desc}</div>
                </div>
                {selectedFoul === item.type && (
                  <IconFoulScratch size={20} className="text-amber shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3.5 rounded-2xl bg-surface-3 border border-line text-xs text-text-dim flex items-center gap-3">
          <IconBallInHand size={24} className="text-emerald-400 shrink-0" />
          <span>
            Lawan (<strong className="text-text">{selectedPlayer === 1 ? player2Name : player1Name}</strong>) akan otomatis mendapatkan status{' '}
            <strong className="text-emerald-400 font-bold">Ball in Hand</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-xl bg-amber hover:bg-amber-400 text-black font-bold uppercase tracking-wider font-ui text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <IconBallInHand size={16} /> Terapkan Foul & Ball in Hand
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3.5 rounded-xl bg-surface-3 hover:bg-surface-2 text-text-dim font-bold text-xs uppercase font-ui"
          >
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
};
