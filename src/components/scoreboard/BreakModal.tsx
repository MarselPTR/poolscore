import React, { useState } from 'react';
import { Modal } from '../common/Modal';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Catat break">
      <div className="space-y-5 select-none">
        <div>
          <span className="label">Pemain yang melakukan break</span>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setBreaker(1)} data-on={breaker === 1} className="opt opt-p1 !min-h-12">
              <span className="truncate max-w-full">{player1Name}</span>
            </button>
            <button onClick={() => setBreaker(2)} data-on={breaker === 2} className="opt opt-p2 !min-h-12">
              <span className="truncate max-w-full">{player2Name}</span>
            </button>
          </div>
        </div>

        <div>
          <span className="label">Keabsahan break</span>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setIsLegal(true)} data-on={isLegal} className="opt">
              Legal
            </button>
            <button
              onClick={() => {
                setIsLegal(false);
                setBallsPocketed(0);
              }}
              data-on={!isLegal}
              className="opt"
            >
              Ilegal / foul
            </button>
          </div>
        </div>

        {isLegal && (
          <div>
            <span className="label">Bola masuk saat break</span>
            <div className="grid grid-cols-6 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setBallsPocketed(count)}
                  data-on={ballsPocketed === count}
                  className="opt !px-0"
                >
                  {count === 0 ? 'Dry' : <span className="num text-xl">{count}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLegal && ballsPocketed > 0 && (
          <label className="flex items-center justify-between gap-4 py-3 border-y border-rule cursor-pointer">
            <span>
              <span className="block text-sm font-semibold text-ink">Break and run</span>
              <span className="block text-[13px] text-ink-2">Meja dibersihkan dalam satu inning</span>
            </span>
            <input
              type="checkbox"
              checked={isRunOut}
              onChange={(e) => setIsRunOut(e.target.checked)}
              className="switch"
            />
          </label>
        )}

        <button onClick={handleSubmit} className="btn btn-lg btn-block btn-primary">
          Simpan catatan break
        </button>
      </div>
    </Modal>
  );
};
