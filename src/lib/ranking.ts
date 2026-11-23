import type { Tournament } from '../types';

// Default tournament points scheme. Points are only used *relative to each
// tournament*: a player's score is normalized to a percentage of that
// tournament's top score, so every tournament carries equal weight. A
// per-tournament custom scheme can be layered on later.
export const POINTS_SCHEME = { win: 10, champion: 50, runnerUp: 25 };

export interface RankingEntry {
  name: string;
  /** Linked account id, when the entrant is a registered player. */
  userId?: string;
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
  // Account-linked entrants aggregate by userId (so results merge across
  // tournaments even if the display name varies); walk-ins aggregate by name.
  const agg: Record<
    string,
    { name: string; userId?: string; pctSum: number; count: number; won: number; best: number }
  > = {};

  for (const t of completed) {
    const pts = tournamentPoints(t);
    const max = Math.max(1, ...Object.values(pts));
    // name -> userId for this tournament's entrants
    const linked: Record<string, string> = {};
    for (const p of t.participants || []) {
      if (p.userId) linked[p.name] = p.userId;
    }

    for (const p of t.players) {
      const userId = linked[p];
      const key = userId ? `u:${userId}` : `n:${p.toLowerCase()}`;
      const pct = (pts[p] / max) * 100;
      if (!agg[key]) agg[key] = { name: p, userId, pctSum: 0, count: 0, won: 0, best: 0 };
      agg[key].name = p; // keep the latest display name
      agg[key].pctSum += pct;
      agg[key].count += 1;
      agg[key].best = Math.max(agg[key].best, pct);
      if (t.winnerName === p) agg[key].won += 1;
    }
  }

  return Object.values(agg)
    .map((a) => ({
      name: a.name,
      userId: a.userId,
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
