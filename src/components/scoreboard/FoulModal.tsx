import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { FoulType } from '../../types';

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
    { type: 'Scratch', label: 'Scratch', desc: 'Bola putih masuk ke kantong' },
    { type: 'Illegal Hit', label: 'Illegal hit', desc: 'Tidak mengenai bola sasaran yang sah lebih dulu' },
    { type: 'No Rail', label: 'No rail', desc: 'Tidak ada bola menyentuh ban setelah kontak' },
    { type: 'Wrong Ball', label: 'Salah bola', desc: 'Menembak bola yang tidak sesuai urutan atau grup' },
    { type: 'Other', label: 'Lainnya', desc: 'Sentuhan tangan atau stik, bola keluar meja, dan lain-lain' },
  ];

  const handleSubmit = () => {
    onSubmitFoul(selectedPlayer, selectedFoul);
    onClose();
  };

  const opponentName = selectedPlayer === 1 ? player2Name : player1Name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat foul">
      <div className="space-y-5 select-none">
        <div>
          <span className="label">Pemain yang melakukan foul</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPlayer(1)}
              data-on={selectedPlayer === 1}
              className="opt opt-p1 !min-h-12"
            >
              <span className="truncate max-w-full">{player1Name}</span>
            </button>
            <button
              onClick={() => setSelectedPlayer(2)}
              data-on={selectedPlayer === 2}
              className="opt opt-p2 !min-h-12"
            >
              <span className="truncate max-w-full">{player2Name}</span>
            </button>
          </div>
        </div>

        <div>
          <span className="label">Jenis pelanggaran</span>
          <div className="border border-rule rounded-[4px] rows" role="radiogroup">
            {foulTypes.map((f) => {
              const isOn = selectedFoul === f.type;
              return (
                <button
                  key={f.type}
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => setSelectedFoul(f.type)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${
                    isOn ? 'bg-panel-2' : 'hover:bg-panel-2'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isOn ? 'border-ink' : 'border-rule-strong'
                    }`}
                  >
                    {isOn && <span className="w-2 h-2 rounded-full bg-ink" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{f.label}</span>
                    <span className="block text-[13px] text-ink-2">{f.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="notice notice-warn">
          Giliran berpindah ke <strong>{opponentName}</strong> dengan ball in hand.
        </p>

        <button onClick={handleSubmit} className="btn btn-lg btn-block btn-warn">
          Catat foul
        </button>
      </div>
    </Modal>
  );
};
