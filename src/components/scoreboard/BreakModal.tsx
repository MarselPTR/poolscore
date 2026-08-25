import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Check } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { IconBreakShot, IconTableRunOut } from '../common/BilliardIcons';

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1Name: string;
  player2Name: string;
  currentTurn: 1 | 2;
  onSubmitBreak: (breakData: {
    breaker: 1 | 2;
    isLegal: boolean;
    ballsPocketed: number;
    isDry: boolean;
    isRunOut: boolean;
  }) => void;
}

export const BreakModal: React.FC<BreakModalProps> = ({
  isOpen,
  onClose,
  player1Name,
  player2Name,
  currentTurn,
  onSubmitBreak,
}) => {
  const [breaker, setBreaker] = useState<1 | 2>(currentTurn);
  const [isLegal, setIsLegal] = useState<boolean>(true);
  const [ballsPocketed, setBallsPocketed] = useState<number>(1);
  const [isRunOut, setIsRunOut] = useState<boolean>(false);

  const handleSubmit = () => {
    onSubmitBreak({
      breaker,
      isLegal,
      ballsPocketed: isLegal ? ballsPocketed : 0,
      isDry: ballsPocketed === 0,
      isRunOut,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Break Tracker (Catatan Pukulan Pertama)">
      <div className="space-y-4">
        {/* Breaker Player */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Pemain yang Melakukan Break
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBreaker(1)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-display uppercase tracking-wider font-bold transition-all ${
                breaker === 1
                  ? 'border-red bg-red/20 text-red shadow-[0_0_15px_rgba(240,74,58,0.3)]'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <PlayerAvatar playerNumber={1} name={player1Name} size="xs" isActiveTurn={breaker === 1} />
              <span className="truncate">{player1Name}</span>
            </button>
            <button
              onClick={() => setBreaker(2)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2.5 font-display uppercase tracking-wider font-bold transition-all ${
                breaker === 2
                  ? 'border-blue bg-blue/20 text-blue shadow-[0_0_15px_rgba(63,123,250,0.3)]'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <PlayerAvatar playerNumber={2} name={player2Name} size="xs" isActiveTurn={breaker === 2} />
              <span className="truncate">{player2Name}</span>
            </button>
          </div>
        </div>

        {/* Legal / Illegal Break */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Status Keabsahan Break
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLegal(true)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-ui uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isLegal
                  ? 'border-felt bg-felt/20 text-emerald-300 shadow-sm'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <IconBreakShot size={16} /> Legal Break
            </button>
            <button
              onClick={() => setIsLegal(false)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-ui uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                !isLegal
                  ? 'border-amber bg-amber/20 text-amber shadow-sm'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              Illegal / Foul Break
            </button>
          </div>
        </div>

        {/* Balls Pocketed */}
        {isLegal && (
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
              Jumlah Bola Masuk Saat Break
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setBallsPocketed(num)}
                  className={`flex-1 py-3 rounded-xl border font-mono font-bold text-sm transition-all ${
                    ballsPocketed === num
                      ? 'border-felt bg-felt text-white shadow-md'
                      : 'border-line bg-surface-2 text-text-dim hover:text-text'
                  }`}
                >
                  {num === 0 ? 'Dry (0)' : num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table Run-Out */}
        {isLegal && ballsPocketed > 0 && (
          <div
            onClick={() => setIsRunOut(!isRunOut)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              isRunOut ? 'border-amber bg-amber/20 text-amber shadow-lg shadow-amber/10' : 'border-line bg-surface-2 text-text-dim hover:text-text'
            }`}
          >
            <div className="flex items-center gap-3">
              <IconTableRunOut size={26} className={isRunOut ? 'animate-pulse' : 'opacity-70'} />
              <div>
                <div className="font-bold text-sm">Table Run-Out (Clearance Langsung)</div>
                <div className="text-xs text-text-faint">Menghabiskan seluruh bola meja dari break tanpa lepas giliran</div>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${isRunOut ? 'bg-amber text-black border-amber' : 'border-line'}`}>
              {isRunOut && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold uppercase tracking-wider font-ui text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <IconBreakShot size={16} /> Simpan Catatan Break
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
