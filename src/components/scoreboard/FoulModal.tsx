import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { FoulType } from '../../types';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { AlertTriangle, Check } from 'lucide-react';

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
      <div className="space-y-4 select-none">
        {/* Player Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Pemain yang Melakukan Foul
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setSelectedPlayer(1)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 font-semibold transition-all ${
                selectedPlayer === 1
                  ? 'border-rose-500/60 bg-rose-500/15 text-rose-300 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <PlayerAvatar playerNumber={1} name={player1Name} size="xs" isActiveTurn={selectedPlayer === 1} />
              <span className="truncate text-sm">{player1Name}</span>
            </button>
            <button
              onClick={() => setSelectedPlayer(2)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 font-semibold transition-all ${
                selectedPlayer === 2
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-300 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <PlayerAvatar playerNumber={2} name={player2Name} size="xs" isActiveTurn={selectedPlayer === 2} />
              <span className="truncate text-sm">{player2Name}</span>
            </button>
          </div>
        </div>

        {/* Foul Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Jenis Pelanggaran
          </label>
          <div className="space-y-1.5">
            {foulTypes.map((f) => (
              <button
                key={f.type}
                onClick={() => setSelectedFoul(f.type)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                  selectedFoul === f.type
                    ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{f.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{f.desc}</div>
                </div>
                {selectedFoul === f.type && (
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Ball in Hand Notice */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Giliran menembak akan otomatis dialihkan ke lawan dengan hak <strong>Ball in Hand</strong>.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          Konfirmasi Foul
        </button>
      </div>
    </Modal>
  );
};
