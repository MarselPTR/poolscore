import React, { useState } from 'react';
import type { Match } from '../../types';
import { useLiveReceiver } from '../../hooks/useLiveSync';
import { useFullscreen } from '../../hooks/useFullscreen';
import { formatSeconds } from '../../utils/time';
import { Maximize, Minimize, ArrowLeft } from 'lucide-react';

interface TVScoreboardViewProps {
  onBack: () => void;
}

const TVHalf: React.FC<{
  playerNumber: 1 | 2;
  name: string;
  score: number;
  raceTo: number;
  isTurn: boolean;
  setsWon: number;
  targetSets: number;
}> = ({ playerNumber, name, score, raceTo, isTurn, setsWon, targetSets }) => (
  <div className={`score-half score-half-p${playerNumber} h-full`} data-turn={isTurn}>
    {isTurn && <div className="absolute inset-x-0 top-0 h-[1.6cqh] bg-white" />}

    <div className="relative h-full flex flex-col items-center justify-between px-[4cqw] pt-[7cqh] pb-[5cqh]">
      <div className="flex flex-col items-center gap-[1.5cqh] w-full min-w-0">
        <h2 className="score-name max-w-full truncate" style={{ fontSize: 'min(11cqh, 11cqw)' }}>
          {name}
        </h2>
        <div
          className="flex items-center gap-[2cqw] font-display font-semibold uppercase tracking-[0.14em]"
          style={{ fontSize: 'min(3.4cqh, 3.4cqw)' }}
        >
          <span className={isTurn ? 'opacity-100' : 'opacity-0'}>Giliran</span>
          {targetSets > 1 && (
            <span className="flex items-center gap-[0.8cqw] opacity-90">
              Set
              {Array.from({ length: targetSets }).map((_, i) => (
                <span
                  key={i}
                  className={i < setsWon ? 'bg-white' : 'bg-white/25'}
                  style={{ width: 'min(2.6cqh, 2.6cqw)', height: 'min(2.6cqh, 2.6cqw)' }}
                />
              ))}
            </span>
          )}
        </div>
      </div>

      <div className="score-num" style={{ fontSize: 'min(58cqh, 48cqw)' }}>
        {score}
      </div>

      {raceTo <= 13 ? (
        <div className="flex items-center justify-center gap-[0.8cqw] w-full max-w-[80%]">
          {Array.from({ length: raceTo }).map((_, i) => (
            <span
              key={i}
              className={`flex-1 ${i < score ? 'bg-white' : 'bg-white/25'}`}
              style={{ height: '1.8cqh', maxWidth: '6cqw' }}
            />
          ))}
        </div>
      ) : (
        <div
          className="font-display font-semibold uppercase tracking-[0.14em] opacity-85"
          style={{ fontSize: 'min(3.4cqh, 3.4cqw)' }}
        >
          Race to {raceTo}
        </div>
      )}
    </div>
  </div>
);

export const TVScoreboardView: React.FC<TVScoreboardViewProps> = ({ onBack }) => {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useLiveReceiver((match) => {
    setLiveMatch(match);
  });

  const isMultiSet = !!liveMatch && liveMatch.targetSets > 1;

  // The spectator screen is always dark, whatever theme the operator uses.
  return (
    <div data-theme="dark" className="fixed inset-0 z-50 bg-bg text-ink flex flex-col select-none overflow-hidden">
      {/* Top strip */}
      <div className="h-12 flex items-center justify-between gap-4 pl-1.5 pr-1.5 border-b border-rule shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="icon-btn" title="Keluar dari tampilan TV" aria-label="Keluar dari tampilan TV">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <span className="display text-xl tracking-wide">PoolScore</span>
        </div>

        {liveMatch && (
          <div className="flex items-baseline gap-x-5 whitespace-nowrap overflow-hidden">
            <span className="display text-xl">{liveMatch.gameType}</span>
            <span className="text-sm text-ink-2">
              Race to <b className="num text-base text-ink">{liveMatch.raceTo}</b>
            </span>
            {isMultiSet && (
              <span className="text-sm text-ink-2">
                Set <b className="num text-base text-ink">{liveMatch.currentSet}</b>
              </span>
            )}
            <span className="text-sm text-ink-2">
              Rack <b className="num text-base text-ink">{liveMatch.currentRack}</b>
            </span>
            <span className="num text-base text-ink">{formatSeconds(liveMatch.durationSeconds)}</span>
          </div>
        )}

        <button
          onClick={toggleFullscreen}
          className="icon-btn"
          title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
        >
          {isFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {!liveMatch ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h3 className="display text-4xl sm:text-5xl">Menunggu pertandingan</h3>
          <p className="text-ink-2 mt-3 max-w-md">
            Mulai pertandingan dari perangkat pencatat skor. Layar ini akan menampilkan skornya secara
            langsung.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-2">
          <TVHalf
            playerNumber={1}
            name={liveMatch.player1.name}
            score={liveMatch.player1.score}
            raceTo={liveMatch.raceTo}
            isTurn={liveMatch.currentTurn === 1}
            setsWon={liveMatch.player1Sets}
            targetSets={liveMatch.targetSets}
          />
          <TVHalf
            playerNumber={2}
            name={liveMatch.player2.name}
            score={liveMatch.player2.score}
            raceTo={liveMatch.raceTo}
            isTurn={liveMatch.currentTurn === 2}
            setsWon={liveMatch.player2Sets}
            targetSets={liveMatch.targetSets}
          />
        </div>
      )}
    </div>
  );
};
