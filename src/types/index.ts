export type GameType = '8-Ball' | '9-Ball' | '10-Ball' | 'Straight Pool' | 'One Pocket' | 'Custom';

export type MatchFormat = 'Race To' | 'Best Of' | 'Single';

export type BreakRule = 'Winner Breaks' | 'Alternate Breaks' | 'Loser Breaks';

export type FoulType = 'Scratch' | 'Illegal Hit' | 'No Rail' | 'Wrong Ball' | 'Other';

export type TouchProtectionMode = 'hold' | 'confirm' | 'quick';

export type ThemeMode = 'dark' | 'light';

// Account roles (Fase 2). "Wasit" (referee) is not a global role — it is a
// per-tournament assignment handled later. Guests are tracked by a flag.
export type UserRole = 'participant' | 'venue_admin' | 'super_admin';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface MatchEvent {
  id: string;
  timestamp: number;
  type: 'rack_win' | 'set_win' | 'foul' | 'break' | 'turn_switch' | 'score_adjust' | 'timeout';
  player: 1 | 2;
  rackNumber: number;
  setNumber?: number;
  description: string;
  metadata?: {
    foulType?: FoulType;
    breakDetails?: {
      breaker: 1 | 2;
      isLegal: boolean;
      ballsPocketed: number;
      isDry: boolean;
      isRunOut: boolean;
    };
    prevScore1?: number;
    prevScore2?: number;
    newScore1?: number;
    newScore2?: number;
    prevSets1?: number;
    prevSets2?: number;
    newSets1?: number;
    newSets2?: number;
    prevCurrentSet?: number;
    newCurrentSet?: number;
    savedRackHistory?: RackHistoryItem[];
    prevTurn?: 1 | 2;
  };
}

export interface BreakRecord {
  rackNumber: number;
  breaker: 1 | 2;
  isLegal: boolean;
  ballsPocketed: number;
  isDry: boolean;
  isRunOut: boolean;
}

export interface FoulRecord {
  rackNumber: number;
  player: 1 | 2;
  type: FoulType;
  timestamp: number;
}

export interface RackHistoryItem {
  rackNumber: number;
  setNumber?: number;
  winner: 1 | 2;
  durationSeconds: number;
  breaker?: 1 | 2;
  breakDetails?: BreakRecord;
  fouls?: FoulRecord[];
  timestamp: number;
}

export interface SetHistoryItem {
  setNumber: number;
  winner: 1 | 2;
  player1Score: number;
  player2Score: number;
  durationSeconds: number;
  racks: RackHistoryItem[];
}

export interface MatchPlayer {
  id?: string;
  name: string;
  score: number;
  color: string;
  startingRating?: number;
  newRating?: number;
}

export interface Match {
  id: string;
  gameType: GameType;
  format: MatchFormat;
  raceTo: number;
  targetSets: number; // Target babak/set kemenangan (misal: 1 = Single Set, 2 = Best of 3 / Race to 2 Sets)
  currentSet: number; // Babak ke-berapa sekarang
  player1Sets: number; // Skor Set Pemain 1 (misal: 1)
  player2Sets: number; // Skor Set Pemain 2 (misal: 0)
  setHistory: SetHistoryItem[];
  player1: MatchPlayer;
  player2: MatchPlayer;
  status: 'in_progress' | 'finished' | 'paused';
  winner: 1 | 2 | null;
  startedAt: number;
  finishedAt?: number;
  durationSeconds: number;
  currentRack: number;
  currentTurn: 1 | 2;
  breakRule: BreakRule;
  isFoulTracking: boolean;
  isTimerEnabled: boolean;
  rackHistory: RackHistoryItem[];
  events: MatchEvent[];
  tournamentId?: string;
  tournamentMatchId?: string;
  tableId?: string; // club table this match is assigned to (per-venue)
  tableLabel?: string; // table name, for display on the scoreboard
  createdBy?: string; // auth user id of the recorder (empty for guests)
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  matchesCount: number;
  winsCount: number;
  lossesCount: number;
  racksWon: number;
  racksLost: number;
  winStreak: number;
  bestWinStreak: number;
  breakRunOuts: number;
  tournamentsWon?: number;
  createdAt: number;
  updatedAt: number;
}

export type TournamentFormat = 'Single Elimination' | 'Double Elimination' | 'Round Robin';

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  bracketType?: 'winners' | 'losers' | 'finals' | 'group';
  groupName?: string;
  player1Name: string;
  player2Name: string;
  player1Score?: number;
  player2Score?: number;
  winnerName?: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed';
  nextMatchIndex?: number;
  nextLoserMatchIndex?: number;
}

export interface TournamentGroupStanding {
  groupName: string;
  playerName: string;
  played: number;
  won: number;
  lost: number;
  rackWon: number;
  rackLost: number;
  points: number;
}

/** A tournament entrant: either linked to a real account (userId) or a plain
 *  walk-in name. `name` is always the display name used in the bracket. */
export interface TournamentParticipant {
  userId?: string;
  name: string;
}

/** A player's self-registration to an open (draft) tournament. */
export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  name: string;
  createdAt: number;
}

export interface Tournament {
  id: string;
  name: string;
  gameType: GameType;
  format: TournamentFormat;
  raceTo: number;
  targetSets?: number;
  /** 'draft' = registration open (no bracket yet); 'in_progress'/'completed'. */
  status: 'draft' | 'in_progress' | 'completed';
  /** Player quota for a registration (draft) tournament. */
  maxPlayers?: number;
  players: string[];
  /** Account-link info per entrant, matched to `players` by name. Optional for
   *  backward compatibility with older name-only tournaments. */
  participants?: TournamentParticipant[];
  matches: TournamentMatch[];
  winnerName?: string;
  runnerUpName?: string;
  venueName?: string;
  isPublic?: boolean;
  createdBy?: string;
  createdAt: number;
}

export interface ClubTable {
  id: string;
  ownerId?: string;
  name: string;
  position?: number;
  status: 'FREE' | 'LIVE' | 'MAINTENANCE';
  activeMatchId?: string;
  player1Name?: string;
  player2Name?: string;
  score1?: number;
  score2?: number;
  gameType?: GameType;
  raceTo?: number;
  startTime?: number;
  /** Rental tariff per hour (Rupiah) used when opening a billing session. */
  ratePerHour?: number;
}

/**
 * A table-rental billing session (sewa meja). Billing runs independently of the
 * scoreboard match: a table can be rented with or without a live match on it.
 */
export interface RentalSession {
  id: string;
  tableId: string;
  ownerId: string;
  /** Snapshot of the table name at open time (so receipts stay correct). */
  tableName: string;
  /** Snapshot of the tariff per hour at open time. */
  ratePerHour: number;
  startTime: number; // epoch ms
  endTime?: number; // epoch ms, set when closed
  status: 'active' | 'closed';
  /** Final billed amount (Rupiah), set at close. */
  totalCost?: number;
  /** Optional label — customer name / note. */
  note?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  touchProtection: TouchProtectionMode;
  holdDurationMs: number;
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  wakeLockEnabled: boolean;
  defaultGame: GameType;
  defaultRace: number;
  defaultTargetSets: number;
  defaultBreakRule: BreakRule;
  showTimer: boolean;
  fontSize: 'standard' | 'large' | 'massive';
}
