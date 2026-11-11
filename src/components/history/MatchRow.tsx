import React from 'react';
import type { Match } from '../../types';

interface MatchRowProps {
  match: Match;
  /** Short line on the right of the heading, e.g. date and duration. */
  meta?: string;
  onClick?: () => void;
  className?: string;
}

/** One finished match as a two-line scoreline. Shared by Home and History. */
export const MatchRow: React.FC<MatchRowProps> = ({ match, meta, onClick, className = '' }) => {
  const isMultiSet = match.targetSets && match.targetSets > 1;
  const score1 = isMultiSet ? match.player1Sets : match.player1.score;
  const score2 = isMultiSet ? match.player2Sets : match.player2.score;

  const format = isMultiSet
    ? `Best of ${match.targetSets * 2 - 1} set`
    : `Race to ${match.raceTo}`;

  const line = (playerNumber: 1 | 2, name: string, score: number) => {
    const won = match.winner === playerNumber;
    return (
      <div className="flex items-center gap-2.5">
        <span className={`w-1 h-5 shrink-0 ${playerNumber === 1 ? 'bg-p1' : 'bg-p2'}`} />
        <span className={`flex-1 truncate text-[15px] ${won ? 'font-semibold text-ink' : 'text-ink-2'}`}>
          {name}
        </span>
        <span className={`num text-2xl w-9 text-right ${won ? 'text-ink' : 'text-ink-3'}`}>{score}</span>
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left px-1 py-3 hover:bg-panel-2 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="eyebrow">
          {match.gameType} · {format}
        </span>
        {meta && <span className="text-[13px] text-ink-3 tabular-nums truncate">{meta}</span>}
      </div>
      <div className="space-y-1">
        {line(1, match.player1.name, score1)}
        {line(2, match.player2.name, score2)}
      </div>
    </button>
  );
};
