import type { Tournament, TournamentMatch, TournamentGroupStanding } from '../types';

// A slot still holds a placeholder (not a real player) when it is empty or
// starts with one of the generator's placeholder words.
const PLACEHOLDER_RE = /^(Pemenang|Juara|Kalah|Runner-up|Peringkat|TBD|Menunggu)/i;
export function isPlaceholder(name?: string): boolean {
  return !name || PLACEHOLDER_RE.test(name.trim());
}

function markReadyIfComplete(m: TournamentMatch) {
  if (m.status === 'completed') return;
  if (!isPlaceholder(m.player1Name) && !isPlaceholder(m.player2Name)) {
    m.status = 'ready';
  }
}

/**
 * Which slot (1 or 2) of the target match a source match feeds.
 * Derived from the bracket structure so seeding is always correct:
 * - winner feeds (source.nextMatchIndex === target) take the lower slots,
 *   ordered by matchIndex;
 * - loser feeds (source.nextLoserMatchIndex === target) take the slots after
 *   the winner feeds.
 */
function slotInTarget(
  matches: TournamentMatch[],
  source: TournamentMatch,
  targetIndex: number,
  viaLoser: boolean
): 1 | 2 {
  const winnerFeeds = matches
    .filter((m) => m.nextMatchIndex === targetIndex)
    .sort((a, b) => a.matchIndex - b.matchIndex);
  const loserFeeds = matches
    .filter((m) => m.nextLoserMatchIndex === targetIndex)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  if (!viaLoser) {
    const idx = winnerFeeds.findIndex((m) => m.id === source.id);
    return idx <= 0 ? 1 : 2;
  }
  const idx = loserFeeds.findIndex((m) => m.id === source.id);
  const slotNum = winnerFeeds.length + idx + 1;
  return slotNum <= 1 ? 1 : 2;
}

function placeInto(target: TournamentMatch, slot: 1 | 2, name: string) {
  if (slot === 1) target.player1Name = name;
  else target.player2Name = name;
  markReadyIfComplete(target);
}

// ---- Round robin standings (points: win = 3, tiebreak rack difference) ----
export function computeStandings(tournament: Tournament): TournamentGroupStanding[] {
  const map: Record<string, TournamentGroupStanding> = {};
  tournament.players.forEach((p) => {
    const pMatch = tournament.matches.find(
      (m) => m.bracketType === 'group' && (m.player1Name === p || m.player2Name === p)
    );
    map[p] = {
      groupName: pMatch?.groupName || 'Grup Utama',
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
      const p1 = map[m.player1Name];
      const p2 = map[m.player2Name];
      const s1 = m.player1Score || 0;
      const s2 = m.player2Score || 0;
      if (p1) {
        p1.played += 1;
        p1.rackWon += s1;
        p1.rackLost += s2;
        if (m.winnerName === m.player1Name) { p1.won += 1; p1.points += 3; } else p1.lost += 1;
      }
      if (p2) {
        p2.played += 1;
        p2.rackWon += s2;
        p2.rackLost += s1;
        if (m.winnerName === m.player2Name) { p2.won += 1; p2.points += 3; } else p2.lost += 1;
      }
    });

  return Object.values(map).sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    return (b.rackWon - b.rackLost) - (a.rackWon - a.rackLost);
  });
}

function rankInGroup(standings: TournamentGroupStanding[], group: string, place: number): string | null {
  const g = standings.filter((s) => s.groupName === group);
  return g[place]?.playerName || null;
}

// Resolve a round-robin playoff placeholder ("Juara Grup A", "Runner-up Grup B",
// "Peringkat 1 Grup", ...) from the current standings.
function resolveGroupPlaceholder(name: string, standings: TournamentGroupStanding[]): string | null {
  const groups = Array.from(new Set(standings.map((s) => s.groupName)));
  const m = name.match(/^(Juara|Runner-up|Peringkat 1|Peringkat 2)\s+Grup(?:\s+([A-Z]))?/i);
  if (!m) return null;
  const place = /Juara|Peringkat 1/i.test(m[1]) ? 0 : 1;
  if (m[2]) return rankInGroup(standings, `Grup ${m[2].toUpperCase()}`, place);
  // single group
  return rankInGroup(standings, groups[0], place);
}

function seedRoundRobinPlayoffs(t: Tournament) {
  const groupMatches = t.matches.filter((m) => m.bracketType === 'group');
  if (groupMatches.length === 0) return;
  const allDone = groupMatches.every((m) => m.status === 'completed');
  if (!allDone) return;

  const standings = computeStandings(t);
  t.matches
    .filter((m) => m.bracketType !== 'group' && m.status !== 'completed')
    .forEach((m) => {
      if (isPlaceholder(m.player1Name)) {
        const r = resolveGroupPlaceholder(m.player1Name, standings);
        if (r) m.player1Name = r;
      }
      if (isPlaceholder(m.player2Name)) {
        const r = resolveGroupPlaceholder(m.player2Name, standings);
        if (r) m.player2Name = r;
      }
      markReadyIfComplete(m);
    });
}

// The match that decides the champion: highest round, preferring a "finals" one.
function finalMatch(t: Tournament): TournamentMatch | undefined {
  const maxRound = Math.max(...t.matches.map((m) => m.round));
  const inRound = t.matches.filter((m) => m.round === maxRound);
  return inRound.find((m) => m.bracketType === 'finals') || inRound[inRound.length - 1];
}

/**
 * Pure tournament progression: records one match result and advances the
 * bracket (winner, loser-drop, round-robin playoff seeding, completion).
 * Returns a new Tournament object.
 */
export function applyMatchResult(
  tournament: Tournament,
  tMatchId: string,
  winnerName: string,
  score1: number,
  score2: number
): Tournament {
  const t: Tournament = {
    ...tournament,
    matches: tournament.matches.map((m) => ({ ...m })),
  };

  const m = t.matches.find((x) => x.id === tMatchId);
  if (!m) return t;

  const loserName = winnerName === m.player1Name ? m.player2Name : m.player1Name;
  m.status = 'completed';
  m.player1Score = score1;
  m.player2Score = score2;
  m.winnerName = winnerName;

  // Advance winner.
  if (m.nextMatchIndex !== undefined && t.matches[m.nextMatchIndex]) {
    const target = t.matches[m.nextMatchIndex];
    placeInto(target, slotInTarget(t.matches, m, m.nextMatchIndex, false), winnerName);
  }

  // Drop loser (double elimination).
  if (m.nextLoserMatchIndex !== undefined && t.matches[m.nextLoserMatchIndex] && loserName) {
    const target = t.matches[m.nextLoserMatchIndex];
    placeInto(target, slotInTarget(t.matches, m, m.nextLoserMatchIndex, true), loserName);
  }

  // Round robin: once the group stage is done, seed the playoff from standings.
  if (m.bracketType === 'group') {
    seedRoundRobinPlayoffs(t);
  }

  // Championship decided?
  const fin = finalMatch(t);
  if (fin && fin.status === 'completed') {
    t.status = 'completed';
    t.winnerName = fin.winnerName;
    t.runnerUpName = fin.winnerName === fin.player1Name ? fin.player2Name : fin.player1Name;
  } else {
    t.status = 'in_progress';
  }

  return t;
}
