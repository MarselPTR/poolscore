import React, { useState } from 'react';
import type { Tournament, TournamentMatch, TournamentGroupStanding } from '../../types';
import { Play, CheckCircle, Trophy, ZoomIn, ZoomOut, RotateCcw, Award, Layers } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface BracketTreeProps {
  tournament: Tournament;
  onPlayMatch: (tMatch: TournamentMatch) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  tournament,
  onPlayMatch,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [deActiveTab, setDeActiveTab] = useState<'winners' | 'losers' | 'finals'>('winners');
  const [rrActiveTab, setRrActiveTab] = useState<'standings' | 'playoffs'>('standings');

  const format = tournament.format || 'Single Elimination';

  // Calculate Standings for Round Robin
  const calculateGroupStandings = (): TournamentGroupStanding[] => {
    const standingsMap: Record<string, TournamentGroupStanding> = {};

    tournament.players.forEach((p) => {
      const pMatch = tournament.matches.find(
        (m) => m.bracketType === 'group' && (m.player1Name === p || m.player2Name === p)
      );
      const groupName = pMatch?.groupName || 'Grup Utama';

      standingsMap[p] = {
        groupName,
        playerName: p,
        played: 0,
        won: 0,
        lost: 0,
        rackWon: 0,
        rackLost: 0,
        points: 0,
      };
    });

    tournament.matches
      .filter((m) => m.bracketType === 'group' && m.status === 'completed')
      .forEach((m) => {
        const p1 = standingsMap[m.player1Name];
        const p2 = standingsMap[m.player2Name];
        const s1 = m.player1Score || 0;
        const s2 = m.player2Score || 0;

        if (p1) {
          p1.played += 1;
          p1.rackWon += s1;
          p1.rackLost += s2;
          if (m.winnerName === m.player1Name) {
            p1.won += 1;
            p1.points += 3;
          } else {
            p1.lost += 1;
          }
        }

        if (p2) {
          p2.played += 1;
          p2.rackWon += s2;
          p2.rackLost += s1;
          if (m.winnerName === m.player2Name) {
            p2.won += 1;
            p2.points += 3;
          } else {
            p2.lost += 1;
          }
        }
      });

    return Object.values(standingsMap).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      const diffA = a.rackWon - a.rackLost;
      const diffB = b.rackWon - b.rackLost;
      return diffB - diffA;
    });
  };

  // Filter matches based on format
  const getFilteredMatches = (): TournamentMatch[] => {
    if (format === 'Double Elimination') {
      if (deActiveTab === 'winners') return tournament.matches.filter((m) => m.bracketType === 'winners' || (!m.bracketType && m.round <= 3));
      if (deActiveTab === 'losers') return tournament.matches.filter((m) => m.bracketType === 'losers');
      return tournament.matches.filter((m) => m.bracketType === 'finals');
    }
    if (format === 'Round Robin') {
      if (rrActiveTab === 'standings') return tournament.matches.filter((m) => m.bracketType === 'group');
      return tournament.matches.filter((m) => m.bracketType === 'finals');
    }
    return tournament.matches;
  };

  const matchesToRender = getFilteredMatches();
  const maxRound = Math.max(...matchesToRender.map((m) => m.round), 1);
  const rounds: { roundNumber: number; title: string; matches: TournamentMatch[] }[] = [];

  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = matchesToRender.filter((m) => m.round === r);
    if (roundMatches.length === 0) continue;

    let title = `Babak ${r}`;
    if (format === 'Single Elimination') {
      if (r === maxRound) title = 'Grand Final';
      else if (r === maxRound - 1) title = 'Semi Final';
      else if (r === maxRound - 2) title = 'Quarter Final';
      else if (r === maxRound - 3) title = 'Round of 16 (R16)';
      else if (r === maxRound - 4) title = 'Round of 32 (R32)';
    } else if (format === 'Double Elimination') {
      if (deActiveTab === 'winners') {
        if (r === maxRound) title = 'Winners Final';
        else if (r === maxRound - 1) title = 'Winners Semi Final';
        else title = `Winners Round ${r}`;
      } else if (deActiveTab === 'losers') {
        if (r === maxRound) title = 'Losers Final';
        else if (r === maxRound - 1) title = 'Losers Semi Final';
        else title = `Losers Round ${r}`;
      } else {
        title = 'Grand Final Championship';
      }
    } else if (format === 'Round Robin') {
      if (rrActiveTab === 'playoffs') {
        if (r === maxRound) title = 'Championship Final';
        else title = 'Playoff Semifinal';
      } else {
        title = `Jadwal Pertandingan Grup`;
      }
    }

    rounds.push({ roundNumber: r, title, matches: roundMatches });
  }

  const standings = calculateGroupStandings();
  const groupNames = Array.from(new Set(standings.map((s) => s.groupName)));

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-x-auto select-none space-y-4 font-sans">
      
      {/* 1. Champion Banner if completed */}
      {tournament.winnerName && (
        <div className="mb-4 p-4 rounded-xl bg-zinc-950 border border-rose-500/40 flex items-center justify-between animate-fade-in shadow-md">
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
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold">
            <Award className="w-4 h-4 text-rose-500" />
            <span>Turnamen Selesai</span>
          </div>
        </div>
      )}

      {/* 2. Format Selector & Zoom Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        
        {/* Double Elimination Tabs */}
        {format === 'Double Elimination' && (
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setDeActiveTab('winners')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                deActiveTab === 'winners' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Winners Bracket</span>
            </button>
            <button
              onClick={() => setDeActiveTab('losers')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                deActiveTab === 'losers' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Losers Bracket</span>
            </button>
            <button
              onClick={() => setDeActiveTab('finals')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                deActiveTab === 'finals' ? 'bg-amber-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Grand Final</span>
            </button>
          </div>
        )}

        {/* Round Robin Tabs */}
        {format === 'Round Robin' && (
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setRrActiveTab('standings')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                rrActiveTab === 'standings' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Klasemen & Jadwal Grup</span>
            </button>
            <button
              onClick={() => setRrActiveTab('playoffs')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                rrActiveTab === 'playoffs' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Bagan Playoff Knockout</span>
            </button>
          </div>
        )}

        {/* Single Elimination Badge */}
        {format === 'Single Elimination' && (
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Bagan Single Elimination ({tournament.players.length} Pemain)</span>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.7, prev - 0.1))}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-white transition-all"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. ROUND ROBIN: Standings Table View */}
      {format === 'Round Robin' && rrActiveTab === 'standings' && (
        <div className="space-y-4 animate-fade-in">
          {groupNames.map((grpName) => {
            const grpStandings = standings.filter((s) => s.groupName === grpName);
            return (
              <div key={grpName} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    {grpName}
                  </h3>
                  <span className="text-[11px] text-zinc-400">Top 2 Lolos ke Playoff</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                        <th className="py-2 px-2 w-10 text-center">#</th>
                        <th className="py-2 px-3">Pemain</th>
                        <th className="py-2 px-2 text-center">Main</th>
                        <th className="py-2 px-2 text-center text-emerald-400">M</th>
                        <th className="py-2 px-2 text-center text-rose-400">K</th>
                        <th className="py-2 px-2 text-center">Selisih</th>
                        <th className="py-2 px-3 text-center font-bold text-white">Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {grpStandings.map((s, idx) => (
                        <tr
                          key={s.playerName}
                          className={`hover:bg-zinc-900/60 transition-colors ${
                            idx < 2 ? 'bg-rose-500/5 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-2 text-center font-mono text-zinc-400">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx + 1}
                          </td>
                          <td className="py-2.5 px-3 flex items-center gap-2 font-sans">
                            <PlayerAvatar playerNumber={(idx % 2 + 1) as 1 | 2} size="xs" name={s.playerName} />
                            <span className="text-zinc-200">{s.playerName}</span>
                            {idx < 2 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">
                                Lolos
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center text-zinc-400">{s.played}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{s.won}</td>
                          <td className="py-2.5 px-2 text-center text-rose-400">{s.lost}</td>
                          <td className="py-2.5 px-2 text-center text-zinc-400">
                            {s.rackWon - s.rackLost > 0 ? `+${s.rackWon - s.rackLost}` : s.rackWon - s.rackLost}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-400 text-sm">
                            {s.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. BRACKET TREE: Visual Match Cards Columns */}
      {!(format === 'Round Robin' && rrActiveTab === 'standings') && (
        <div className="overflow-x-auto pb-4 pt-2">
          <div
            className="flex items-start gap-6 sm:gap-8 transition-transform duration-200 origin-top-left"
            style={{
              transform: `scale(${zoomLevel})`,
              minWidth: rounds.length > 3 ? `${rounds.length * 280}px` : '100%',
            }}
          >
            {rounds.map((round) => (
              <div key={round.roundNumber} className="flex-1 min-w-[240px] max-w-[320px] flex flex-col">
                
                {/* Round Title Header */}
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
                          <span>{m.groupName ? m.groupName : `Match #${m.matchIndex + 1}`}</span>
                          {isCompleted && (
                            <span className="text-zinc-400 flex items-center gap-1 font-medium text-[10px]">
                              <CheckCircle className="w-3 h-3 text-rose-400" /> Selesai
                            </span>
                          )}
                        </div>

                        {/* Player 1 Row */}
                        <div
                          className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-mono mb-1 transition-colors ${
                            m.winnerName && m.winnerName === m.player1Name
                              ? 'bg-rose-500/15 text-rose-300 font-bold'
                              : 'text-zinc-200 bg-zinc-900/40'
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
                          className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-mono mb-2 transition-colors ${
                            m.winnerName && m.winnerName === m.player2Name
                              ? 'bg-blue-500/15 text-blue-300 font-bold'
                              : 'text-zinc-200 bg-zinc-900/40'
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
      )}

    </div>
  );
};
