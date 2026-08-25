import React from 'react';
import type { Tournament, TournamentMatch } from '../../types';
import { Play, CheckCircle } from 'lucide-react';
import { IconTrophyCup } from '../common/BilliardIcons';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface BracketTreeProps {
  tournament: Tournament;
  onPlayMatch: (tMatch: TournamentMatch) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  tournament,
  onPlayMatch,
}) => {
  // Group matches by round (Round 1, Round 2, Round 3/Final)
  const maxRound = Math.max(...tournament.matches.map((m) => m.round), 1);
  const rounds: { roundNumber: number; title: string; matches: TournamentMatch[] }[] = [];

  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = tournament.matches.filter((m) => m.round === r);
    let title = `Round ${r}`;
    if (r === maxRound) {
      title = '🏆 Grand Final';
    } else if (r === maxRound - 1) {
      title = 'Semi Final';
    } else if (r === maxRound - 2) {
      title = 'Quarter Final';
    }
    rounds.push({ roundNumber: r, title, matches: roundMatches });
  }

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-surface-2/80 border border-line overflow-x-auto select-none backdrop-blur-md">
      {/* Champion Banner if completed */}
      {tournament.winnerName && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber/20 border border-amber/40 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <IconTrophyCup size={36} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-amber font-bold">Juara Turnamen (Champion)</div>
              <div className="font-display font-bold text-2xl uppercase tracking-wider text-text">
                {tournament.winnerName}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Columns */}
      <div className="flex items-start gap-8 min-w-[700px] py-4">
        {rounds.map((round) => (
          <div key={round.roundNumber} className="flex-1 flex flex-col">
            {/* Round Title */}
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-felt mb-4 text-center pb-2 border-b border-line">
              {round.title}
            </div>

            {/* Match Cards Stack */}
            <div className="flex-1 flex flex-col justify-around gap-6">
              {round.matches.map((m) => {
                const isReady = m.status === 'ready';
                const isCompleted = m.status === 'completed';
                const hasPlayers = m.player1Name && m.player2Name;

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border transition-all p-3 shadow-md ${
                      isCompleted
                        ? 'border-line/70 bg-surface-3/60'
                        : isReady
                        ? 'border-felt bg-felt/10 shadow-felt/20 hover:border-emerald-400'
                        : 'border-line/40 bg-surface/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-faint mb-1.5">
                      <span>Match #{m.id.substring(0, 8)}</span>
                      {isCompleted && (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>

                    {/* Player 1 Row */}
                    <div
                      className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs font-mono mb-1 ${
                        m.winnerName && m.winnerName === m.player1Name
                          ? 'bg-red/20 text-red font-bold'
                          : 'text-text'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlayerAvatar playerNumber={1} size="xs" name={m.player1Name || 'TBD'} />
                        <span className="truncate">{m.player1Name || 'TBD'}</span>
                      </div>
                      <span className="font-extrabold">{m.player1Score ?? '-'}</span>
                    </div>

                    {/* Player 2 Row */}
                    <div
                      className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs font-mono ${
                        m.winnerName && m.winnerName === m.player2Name
                          ? 'bg-blue/20 text-blue font-bold'
                          : 'text-text'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlayerAvatar playerNumber={2} size="xs" name={m.player2Name || 'TBD'} />
                        <span className="truncate">{m.player2Name || 'TBD'}</span>
                      </div>
                      <span className="font-extrabold">{m.player2Score ?? '-'}</span>
                    </div>

                    {/* Play Match Button if Ready */}
                    {isReady && hasPlayers && (
                      <button
                        onClick={() => onPlayMatch(m)}
                        className="mt-2.5 w-full py-2 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Mulai Pertandingan Ini
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
