import type { Tournament } from '../types';

// Default tournament points scheme. Points are only used *relative to each
// tournament*: a player's score is normalized to a percentage of that
// tournament's top score, so every tournament carries equal weight. A
// per-tournament custom scheme can be layered on later.
export const POINTS_SCHEME = { win: 10, champion: 50, runnerUp: 25 };

export interface RankingEntry {
  name: string;
  /** Average of this player's per-tournament percentages (0–100). */
  avgPct: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  bestPct: number;
}

/** Points earned by each participant within a single tournament. */
function tournamentPoints(t: Tournament): Record<string, number> {
  const pts: Record<string, number> = {};
  for (const p of t.players) pts[p] = 0;
  for (const m of t.matches) {
    if (m.status === 'completed' && m.winnerName && pts[m.winnerName] !== undefined) {
      pts[m.winnerName] += POINTS_SCHEME.win;
    }
  }
  if (t.winnerName && pts[t.winnerName] !== undefined) pts[t.winnerName] += POINTS_SCHEME.champion;
  if (t.runnerUpName && pts[t.runnerUpName] !== undefined) pts[t.runnerUpName] += POINTS_SCHEME.runnerUp;
  return pts;
}

/**
 * Global ranking across all completed tournaments. Only players who have taken
 * part in a completed tournament appear. Ranked by average percentage (equal
 * weight per tournament), with tournaments won / played as tiebreakers.
 */
export function computeGlobalRanking(tournaments: Tournament[]): RankingEntry[] {
  const completed = tournaments.filter((t) => t.status === 'completed');
  const agg: Record<string, { pctSum: number; count: number; won: number; best: number }> = {};

  for (const t of completed) {
    const pts = tournamentPoints(t);
    const max = Math.max(1, ...Object.values(pts));
    for (const p of t.players) {
      const pct = (pts[p] / max) * 100;
      if (!agg[p]) agg[p] = { pctSum: 0, count: 0, won: 0, best: 0 };
      agg[p].pctSum += pct;
      agg[p].count += 1;
      agg[p].best = Math.max(agg[p].best, pct);
      if (t.winnerName === p) agg[p].won += 1;
    }
  }

  return Object.entries(agg)
    .map(([name, a]) => ({
      name,
      avgPct: a.count ? a.pctSum / a.count : 0,
      tournamentsPlayed: a.count,
      tournamentsWon: a.won,
      bestPct: a.best,
    }))
    .sort(
      (x, y) =>
        y.avgPct - x.avgPct ||
        y.tournamentsWon - x.tournamentsWon ||
        y.tournamentsPlayed - x.tournamentsPlayed
    );
}
