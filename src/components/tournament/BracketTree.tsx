import React, { useState } from 'react';
import type { Tournament, TournamentMatch, TournamentGroupStanding } from '../../types';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface BracketTreeProps {
  tournament: Tournament;
  onPlayMatch: (tMatch: TournamentMatch) => void;
  /** Hide the "Mulai match" action for viewers who don't own the tournament. */
  readOnly?: boolean;
}

const MatchCard: React.FC<{
  match: TournamentMatch;
  onPlay: () => void;
  readOnly?: boolean;
}> = ({ match: m, onPlay, readOnly }) => {
  const isReady = m.status === 'ready';
  const isCompleted = m.status === 'completed';
  const hasPlayers = m.player1Name && m.player2Name;

  const row = (playerNumber: 1 | 2, name: string, score: number | undefined) => {
    const won = !!m.winnerName && m.winnerName === name;
    const lost = isCompleted && !won;
    return (
      <div className="flex items-center gap-2 h-9 pr-2.5">
        <span className={`w-1 self-stretch ${playerNumber === 1 ? 'bg-p1' : 'bg-p2'}`} />
        <span
          className={`flex-1 truncate text-sm ${
            won ? 'font-semibold text-ink' : lost ? 'text-ink-3' : 'text-ink'
          }`}
        >
          {name || 'Menunggu'}
        </span>
        <span className={`num text-lg ${won ? 'text-ink' : 'text-ink-3'}`}>{score ?? '–'}</span>
      </div>
    );
  };

  return (
    <div
      className={`w-full bg-panel border rounded-[4px] overflow-hidden ${
        isReady ? 'border-ink' : 'border-rule'
      } ${!isReady && !isCompleted ? 'opacity-55' : ''}`}
    >
      <div className="flex items-center justify-between px-2.5 h-6 border-b border-rule text-xs text-ink-3">
        <span>{m.groupName ? m.groupName : `Match ${m.matchIndex + 1}`}</span>
        {isCompleted && <span>Selesai</span>}
      </div>

      <div className="rows">
        {row(1, m.player1Name, m.player1Score)}
        {row(2, m.player2Name, m.player2Score)}
      </div>

      {isReady && hasPlayers && !readOnly && (
        <button
          onClick={onPlay}
          className="w-full h-9 bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
        >
          Mulai match
        </button>
      )}
    </div>
  );
};

export const BracketTree: React.FC<BracketTreeProps> = ({
  tournament,
  onPlayMatch,
  readOnly,
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
      if (r === maxRound) title = 'Final';
      else if (r === maxRound - 1) title = 'Semifinal';
      else if (r === maxRound - 2) title = 'Perempat final';
      else if (r === maxRound - 3) title = '16 besar';
      else if (r === maxRound - 4) title = '32 besar';
    } else if (format === 'Double Elimination') {
      if (deActiveTab === 'winners') {
        if (r === maxRound) title = 'Final winners';
        else if (r === maxRound - 1) title = 'Semifinal winners';
        else title = `Winners babak ${r}`;
      } else if (deActiveTab === 'losers') {
        if (r === maxRound) title = 'Final losers';
        else if (r === maxRound - 1) title = 'Semifinal losers';
        else title = `Losers babak ${r}`;
      } else {
        title = 'Grand final';
      }
    } else if (format === 'Round Robin') {
      if (rrActiveTab === 'playoffs') {
        if (r === maxRound) title = 'Final';
        else title = 'Semifinal playoff';
      } else {
        title = 'Jadwal grup';
      }
    }

    rounds.push({ roundNumber: r, title, matches: roundMatches });
  }

  const standings = calculateGroupStandings();
  const groupNames = Array.from(new Set(standings.map((s) => s.groupName)));

  const isGroupStage = format === 'Round Robin' && rrActiveTab === 'standings';

  // How a round feeds the next one decides which connector lines to draw.
  const linkToNext = (i: number): 'pair' | 'straight' | 'none' => {
    const next = rounds[i + 1];
    if (!next) return 'none';
    if (next.matches.length * 2 === rounds[i].matches.length) return 'pair';
    if (next.matches.length === rounds[i].matches.length) return 'straight';
    return 'none';
  };

  return (
    <div className="space-y-5 select-none">
      {/* Champion */}
      {tournament.winnerName && (
        <div className="bg-primary text-on-primary px-5 py-4 rounded-[4px]">
          <div className="font-display font-semibold uppercase tracking-[0.14em] text-sm opacity-70">
            Juara turnamen
          </div>
          <div className="display text-4xl mt-1.5 break-words">{tournament.winnerName}</div>
        </div>
      )}

      {/* View switch and zoom */}
      <div className="flex items-end justify-between gap-3 border-b border-rule">
        <div className="flex overflow-x-auto no-scrollbar">
          {format === 'Double Elimination' && (
            <>
              <button onClick={() => setDeActiveTab('winners')} data-on={deActiveTab === 'winners'} className="tab">
                Winners
              </button>
              <button onClick={() => setDeActiveTab('losers')} data-on={deActiveTab === 'losers'} className="tab">
                Losers
              </button>
              <button onClick={() => setDeActiveTab('finals')} data-on={deActiveTab === 'finals'} className="tab">
                Grand final
              </button>
            </>
          )}

          {format === 'Round Robin' && (
            <>
              <button
                onClick={() => setRrActiveTab('standings')}
                data-on={rrActiveTab === 'standings'}
                className="tab"
              >
                Klasemen dan jadwal
              </button>
              <button
                onClick={() => setRrActiveTab('playoffs')}
                data-on={rrActiveTab === 'playoffs'}
                className="tab"
              >
                Playoff
              </button>
            </>
          )}

          {format === 'Single Elimination' && (
            <span className="tab !cursor-default" data-on="true">
              Bagan
            </span>
          )}
        </div>

        {!isGroupStage && (
          <div className="flex items-center pb-1 shrink-0">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.7, prev - 0.1))}
              className="icon-btn"
              title="Perkecil"
              aria-label="Perkecil bagan"
            >
              <ZoomOut className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="num text-base text-ink-2 hover:text-ink w-12 text-center"
              title="Kembalikan ukuran"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.1))}
              className="icon-btn"
              title="Perbesar"
              aria-label="Perbesar bagan"
            >
              <ZoomIn className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Round robin: standings, then the group schedule */}
      {isGroupStage && (
        <div className="space-y-8">
          {groupNames.map((grpName) => {
            const grpStandings = standings.filter((s) => s.groupName === grpName);
            return (
              <section key={grpName}>
                <div className="flex items-baseline justify-between pb-2 border-b border-rule-strong">
                  <h3 className="display text-xl">{grpName}</h3>
                  <span className="text-[13px] text-ink-3">Dua teratas lolos ke playoff</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rule">
                        <th className="eyebrow font-semibold py-2 w-8 text-center">#</th>
                        <th className="eyebrow font-semibold py-2 pl-2">Pemain</th>
                        <th className="eyebrow font-semibold py-2 text-right pl-4">Main</th>
                        <th className="eyebrow font-semibold py-2 text-right pl-4">M</th>
                        <th className="eyebrow font-semibold py-2 text-right pl-4">K</th>
                        <th className="eyebrow font-semibold py-2 text-right pl-4">Selisih</th>
                        <th className="eyebrow font-semibold py-2 text-right pl-4 pr-1">Poin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grpStandings.map((s, idx) => {
                        const diff = s.rackWon - s.rackLost;
                        const qualifies = idx < 2;
                        return (
                          <tr key={s.playerName} className="border-b border-rule">
                            <td className={`py-2.5 text-center num text-lg ${qualifies ? 'text-ink' : 'text-ink-3'}`}>
                              {idx + 1}
                            </td>
                            <td className="py-2.5 pl-2">
                              <span className={`text-[15px] ${qualifies ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                                {s.playerName}
                              </span>
                              {qualifies && <span className="tag ml-2 align-middle">Lolos</span>}
                            </td>
                            <td className="py-2.5 text-right pl-4 num text-lg text-ink-2">{s.played}</td>
                            <td className="py-2.5 text-right pl-4 num text-lg text-ink-2">{s.won}</td>
                            <td className="py-2.5 text-right pl-4 num text-lg text-ink-2">{s.lost}</td>
                            <td className="py-2.5 text-right pl-4 num text-lg text-ink-2">
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                            <td className="py-2.5 text-right pl-4 pr-1 num text-xl text-ink">{s.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <section>
            <h3 className="eyebrow pb-2 border-b border-rule-strong">Jadwal grup</h3>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-3">
              {matchesToRender.map((m) => (
                <MatchCard key={m.id} match={m} readOnly={readOnly} onPlay={() => onPlayMatch(m)} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Bracket columns */}
      {!isGroupStage && (
        <div className="overflow-x-auto pb-4">
          {rounds.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-3">Belum ada pertandingan di tahap ini.</p>
          ) : (
            <div
              className="flex items-stretch gap-8 origin-top-left"
              style={{
                transform: `scale(${zoomLevel})`,
                width: `${rounds.length * 232 + (rounds.length - 1) * 32}px`,
              }}
            >
              {rounds.map((round, i) => {
                const out = linkToNext(i);
                const incoming = i > 0 ? linkToNext(i - 1) : 'none';

                return (
                  <div key={round.roundNumber} className="w-[232px] shrink-0 flex flex-col">
                    <div className="eyebrow pb-2 border-b border-rule-strong">{round.title}</div>

                    <div className="bracket-round pt-1">
                      {round.matches.map((m, idx) => (
                        <div
                          key={m.id}
                          className="bracket-slot"
                          data-out={out !== 'none'}
                          data-in={incoming !== 'none'}
                          data-join={out === 'pair' ? (idx % 2 === 0 ? 'top' : 'bottom') : undefined}
                        >
                          <MatchCard match={m} readOnly={readOnly} onPlay={() => onPlayMatch(m)} />
                          {out === 'pair' && <span className="bracket-join" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
