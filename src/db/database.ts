import Dexie, { type Table } from 'dexie';
import type { Match, Player, Tournament, AppSettings } from '../types';
import { pullInitialDataFromSupabase } from '../services/supabaseService';

export class PoolScoreDatabase extends Dexie {
  matches!: Table<Match, string>;
  players!: Table<Player, string>;
  tournaments!: Table<Tournament, string>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('PoolScoreDB');
    this.version(1).stores({
      matches: 'id, gameType, status, startedAt, finishedAt, tournamentId, tableNumber',
      players: 'id, name, rating, matchesCount, winsCount',
      tournaments: 'id, name, status, createdAt',
      clubTables: 'id, status',
      settings: 'id'
    });
    // v2: club tables moved to Supabase (per-venue); index matches by recorder.
    this.version(2).stores({
      matches: 'id, gameType, status, startedAt, finishedAt, tournamentId, createdBy',
      clubTables: null,
    });
  }
}

export const db = new PoolScoreDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  touchProtection: 'hold',
  holdDurationMs: 500,
  soundEnabled: true,
  soundVolume: 0.8,
  vibrationEnabled: true,
  wakeLockEnabled: true,
  defaultGame: '9-Ball',
  defaultRace: 7,
  defaultTargetSets: 1,
  defaultBreakRule: 'Winner Breaks',
  showTimer: true,
  fontSize: 'large',
};

// Clean Database initialization: default settings only. Club tables live in
// Supabase (per-venue) and are not seeded locally.
export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
  }

  // Pull live data from Supabase in background
  pullInitialDataFromSupabase().catch(() => {});
}
