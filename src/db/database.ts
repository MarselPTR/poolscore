import Dexie, { type Table } from 'dexie';
import type { Match, Player, Tournament, ClubTable, AppSettings } from '../types';
import { pullInitialDataFromSupabase } from '../services/supabaseService';

export class PoolScoreDatabase extends Dexie {
  matches!: Table<Match, string>;
  players!: Table<Player, string>;
  tournaments!: Table<Tournament, string>;
  clubTables!: Table<ClubTable, number>;
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
  }
}

export const db = new PoolScoreDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'obsidian',
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

export const DEFAULT_CLUB_TABLES: ClubTable[] = [
  { id: 1, name: 'Meja 1 (VIP Diamond)', status: 'FREE' },
  { id: 2, name: 'Meja 2 (Standard Pro)', status: 'FREE' },
  { id: 3, name: 'Meja 3 (Standard Pro)', status: 'FREE' },
  { id: 4, name: 'Meja 4 (Standard Pro)', status: 'FREE' },
  { id: 5, name: 'Meja 5 (Standard Pro)', status: 'FREE' },
  { id: 6, name: 'Meja 6 (Standard Pro)', status: 'FREE' },
  { id: 7, name: 'Meja 7 (Practice Table)', status: 'FREE' },
  { id: 8, name: 'Meja 8 (Practice Table)', status: 'FREE' },
];

// Clean Database initialization: only default settings & tables, then sync from Supabase
export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
  }

  const tablesCount = await db.clubTables.count();
  if (tablesCount === 0) {
    await db.clubTables.bulkPut(DEFAULT_CLUB_TABLES);
  }

  // Pull live data from Supabase in background
  pullInitialDataFromSupabase().catch(() => {});
}
