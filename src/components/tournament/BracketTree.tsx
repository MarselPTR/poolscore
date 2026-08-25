import React from 'react';
import type { Tournament, TournamentMatch } from '../../types';
import { Play, CheckCircle, Trophy } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface BracketTreeProps {
  tournament: Tournament;
  onPlayMatch: (tMatch: TournamentMatch) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  tournament,
  onPlayMatch,
}) => {
  const maxRound = Math.max(...tournament.matches.map((m) => m.round), 1);
  const rounds: { roundNumber: number; title: string; matches: TournamentMatch[] }[] = [];

  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = tournament.matches.filter((m) => m.round === r);
    let title = `Round ${r}`;
    if (r === maxRound) {
      title = 'Grand Final';
    } else if (r === maxRound - 1) {
      title = 'Semi Final';
    } else if (r === maxRound - 2) {
      title = 'Quarter Final';
    }
    rounds.push({ roundNumber: r, title, matches: roundMatches });
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-x-auto select-none">
      {/* Champion Banner if completed */}
      {tournament.winnerName && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-950 border border-rose-500/40 flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-rose-400">Juara Turnamen</div>
              <div className="font-bold text-xl text-white">
                {tournament.winnerName}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Columns */}
      <div className="flex items-start gap-6 min-w-[650px] py-2">
        {rounds.map((round) => (
          <div key={round.roundNumber} className="flex-1 flex flex-col">
            {/* Round Title */}
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 text-center pb-2 border-b border-zinc-800">
              {round.title}
            </div>

            {/* Match Cards Stack */}
            <div className="flex-1 flex flex-col justify-around gap-4">
              {round.matches.map((m) => {
                const isReady = m.status === 'ready';
                const isCompleted = m.status === 'completed';
                const hasPlayers = m.player1Name && m.player2Name;

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border transition-all p-3 shadow-sm ${
                      isCompleted
                        ? 'border-zinc-800 bg-zinc-950/80'
                        : isReady
                        ? 'border-rose-500/50 bg-zinc-950 shadow-rose-950/20'
                        : 'border-zinc-800/60 bg-zinc-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
                      <span>Match #{m.id.substring(0, 8)}</span>
                      {isCompleted && (
                        <span className="text-zinc-400 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3 h-3 text-rose-400" /> Selesai
                        </span>
                      )}
                    </div>

                    {/* Player 1 Row */}
                    <div
                      className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs font-mono mb-1 ${
                        m.winnerName && m.winnerName === m.player1Name
                          ? 'bg-rose-500/15 text-rose-300 font-bold'
                          : 'text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlayerAvatar playerNumber={1} size="xs" name={m.player1Name || 'TBD'} />
                        <span className="truncate font-sans font-medium text-xs">{m.player1Name || 'TBD'}</span>
                      </div>
                      <span className="font-bold">{m.player1Score ?? '-'}</span>
                    </div>

                    {/* Player 2 Row */}
                    <div
                      className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs font-mono mb-2 ${
                        m.winnerName && m.winnerName === m.player2Name
                          ? 'bg-blue-500/15 text-blue-300 font-bold'
                          : 'text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlayerAvatar playerNumber={2} size="xs" name={m.player2Name || 'TBD'} />
                        <span className="truncate font-sans font-medium text-xs">{m.player2Name || 'TBD'}</span>
                      </div>
                      <span className="font-bold">{m.player2Score ?? '-'}</span>
                    </div>

                    {/* Action Button if Match is Ready */}
                    {isReady && hasPlayers && (
                      <button
                        onClick={() => onPlayMatch(m)}
                        className="w-full mt-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Mulai Match
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
