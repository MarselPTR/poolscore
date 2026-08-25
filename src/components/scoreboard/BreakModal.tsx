import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Zap, Flame } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Break Tracker">
      <div className="space-y-4 select-none">
        {/* Breaker Player */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Pemain yang Melakukan Break
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setBreaker(1)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 font-semibold transition-all ${
                breaker === 1
                  ? 'border-rose-500/60 bg-rose-500/15 text-rose-300 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <PlayerAvatar playerNumber={1} name={player1Name} size="xs" isActiveTurn={breaker === 1} />
              <span className="truncate text-sm">{player1Name}</span>
            </button>
            <button
              onClick={() => setBreaker(2)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 font-semibold transition-all ${
                breaker === 2
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-300 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <PlayerAvatar playerNumber={2} name={player2Name} size="xs" isActiveTurn={breaker === 2} />
              <span className="truncate text-sm">{player2Name}</span>
            </button>
          </div>
        </div>

        {/* Legal / Illegal Break */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Status Keabsahan Break
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLegal(true)}
              className={`py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                isLegal
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              Legal Break
            </button>
            <button
              onClick={() => {
                setIsLegal(false);
                setBallsPocketed(0);
              }}
              className={`py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                !isLegal
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              Illegal / Foul Break
            </button>
          </div>
        </div>

        {/* Balls Pocketed */}
        {isLegal && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Jumlah Bola Masuk Saat Break
            </label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setBallsPocketed(count)}
                  className={`flex-1 py-2.5 rounded-xl border font-mono font-bold text-sm transition-all ${
                    ballsPocketed === count
                      ? 'border-zinc-200 bg-white text-zinc-950 shadow-sm'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  {count === 0 ? 'Dry' : count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Break & Run Out Switch */}
        {isLegal && ballsPocketed > 0 && (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">Break & Run-Out</div>
                <div className="text-[11px] text-zinc-500">Pembersihan meja langsung (1 inning)</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRunOut}
              onChange={(e) => setIsRunOut(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-zinc-950" /> Simpan Catatan Break
        </button>
      </div>
    </Modal>
  );
};
