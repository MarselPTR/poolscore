import Dexie, { type Table } from 'dexie';
import type { Match, Player, Tournament, ClubTable, AppSettings } from '../types';

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

// Seed initial sample data if new database
export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
  }

  const playerCount = await db.players.count();
  if (playerCount === 0) {
    const samplePlayers: Player[] = [
      {
        id: 'p_andi',
        name: 'Andi',
        rating: 1542,
        matchesCount: 48,
        winsCount: 32,
        lossesCount: 16,
        racksWon: 245,
        racksLost: 180,
        breakRunOuts: 14,
        winStreak: 4,
        bestWinStreak: 7,
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'p_budi',
        name: 'Budi',
        rating: 1491,
        matchesCount: 42,
        winsCount: 26,
        lossesCount: 16,
        racksWon: 210,
        racksLost: 175,
        breakRunOuts: 9,
        winStreak: 2,
        bestWinStreak: 5,
        createdAt: Date.now() - 86400000 * 28,
        updatedAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'p_rizky',
        name: 'Rizky',
        rating: 1438,
        matchesCount: 35,
        winsCount: 20,
        lossesCount: 15,
        racksWon: 165,
        racksLost: 140,
        breakRunOuts: 6,
        winStreak: 1,
        bestWinStreak: 4,
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'p_dimas',
        name: 'Dimas',
        rating: 1391,
        matchesCount: 29,
        winsCount: 14,
        lossesCount: 15,
        racksWon: 130,
        racksLost: 142,
        breakRunOuts: 3,
        winStreak: 0,
        bestWinStreak: 3,
        createdAt: Date.now() - 86400000 * 15,
        updatedAt: Date.now() - 86400000 * 1,
      },
    ];
    await db.players.bulkPut(samplePlayers);
  }

  const tablesCount = await db.clubTables.count();
  if (tablesCount === 0) {
    const sampleTables: ClubTable[] = [
      { id: 1, name: 'Table 01 (Pro 9ft)', status: 'FREE' },
      { id: 2, name: 'Table 02 (Pro 9ft)', status: 'FREE' },
      { id: 3, name: 'Table 03 (Club 8ft)', status: 'FREE' },
      { id: 4, name: 'Table 04 (Club 8ft)', status: 'FREE' },
      { id: 5, name: 'Table 05 (VIP Lounge)', status: 'FREE' },
      { id: 6, name: 'Table 06 (VIP Lounge)', status: 'FREE' },
    ];
    await db.clubTables.bulkPut(sampleTables);
  }

  const matchCount = await db.matches.count();
  if (matchCount === 0) {
    const sampleMatches: Match[] = [
      {
        id: 'MATCH-8F72KD',
        gameType: '9-Ball',
        format: 'Race To',
        raceTo: 7,
        targetSets: 1,
        currentSet: 1,
        player1Sets: 0,
        player2Sets: 0,
        setHistory: [],
        player1: { name: 'Andi', score: 7, color: '#f04a3a', startingRating: 1533, newRating: 1542 },
        player2: { name: 'Budi', score: 5, color: '#3f7bfa', startingRating: 1500, newRating: 1491 },
        status: 'finished',
        winner: 1,
        startedAt: Date.now() - 3600000 * 3,
        finishedAt: Date.now() - 3600000 * 2 - 1800000,
        durationSeconds: 2520, // 42 mins
        currentRack: 12,
        currentTurn: 1,
        breakRule: 'Winner Breaks',
        isFoulTracking: true,
        isTimerEnabled: true,
        rackHistory: [
          { rackNumber: 1, winner: 1, durationSeconds: 180, breaker: 1, timestamp: Date.now() - 3600000 * 3 },
          { rackNumber: 2, winner: 2, durationSeconds: 220, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 180000 },
          { rackNumber: 3, winner: 1, durationSeconds: 160, breaker: 2, timestamp: Date.now() - 3600000 * 3 + 400000 },
          { rackNumber: 4, winner: 1, durationSeconds: 240, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 560000 },
          { rackNumber: 5, winner: 2, durationSeconds: 190, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 800000 },
          { rackNumber: 6, winner: 2, durationSeconds: 260, breaker: 2, timestamp: Date.now() - 3600000 * 3 + 990000 },
          { rackNumber: 7, winner: 1, durationSeconds: 150, breaker: 2, timestamp: Date.now() - 3600000 * 3 + 1250000 },
          { rackNumber: 8, winner: 1, durationSeconds: 210, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 1400000 },
          { rackNumber: 9, winner: 2, durationSeconds: 175, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 1610000 },
          { rackNumber: 10, winner: 2, durationSeconds: 230, breaker: 2, timestamp: Date.now() - 3600000 * 3 + 1785000 },
          { rackNumber: 11, winner: 1, durationSeconds: 190, breaker: 2, timestamp: Date.now() - 3600000 * 3 + 2015000 },
          { rackNumber: 12, winner: 1, durationSeconds: 315, breaker: 1, timestamp: Date.now() - 3600000 * 3 + 2205000 },
        ],
        events: []
      },
      {
        id: 'MATCH-9X21AB',
        gameType: '8-Ball',
        format: 'Race To',
        raceTo: 7,
        targetSets: 1,
        currentSet: 1,
        player1Sets: 0,
        player2Sets: 0,
        setHistory: [],
        player1: { name: 'Dimas', score: 5, color: '#f04a3a', startingRating: 1400, newRating: 1391 },
        player2: { name: 'Rizky', score: 7, color: '#3f7bfa', startingRating: 1429, newRating: 1438 },
        status: 'finished',
        winner: 2,
        startedAt: Date.now() - 86400000 * 1 - 3600000 * 2,
        finishedAt: Date.now() - 86400000 * 1 - 3600000 * 1,
        durationSeconds: 2280,
        currentRack: 12,
        currentTurn: 2,
        breakRule: 'Winner Breaks',
        isFoulTracking: true,
        isTimerEnabled: true,
        rackHistory: [],
        events: []
      }
    ];
    await db.matches.bulkPut(sampleMatches);
  }
}
