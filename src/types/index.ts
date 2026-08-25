export type GameType = '8-Ball' | '9-Ball' | '10-Ball' | 'Straight Pool' | 'One Pocket' | 'Custom';

export type MatchFormat = 'Race To' | 'Best Of' | 'Single';

export type BreakRule = 'Winner Breaks' | 'Alternate Breaks' | 'Loser Breaks';

export type FoulType = 'Scratch' | 'Illegal Hit' | 'No Rail' | 'Wrong Ball' | 'Other';

export type TouchProtectionMode = 'hold' | 'confirm' | 'quick';

export type ThemeMode = 'obsidian' | 'felt-green' | 'carbon' | 'navy';

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
  tableNumber?: number;
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
  createdAt: number;
  updatedAt: number;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  player1Name: string;
  player2Name: string;
  player1Score?: number;
  player2Score?: number;
  winnerName?: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed';
  nextMatchIndex?: number;
}

export interface Tournament {
  id: string;
  name: string;
  gameType: GameType;
  format: 'Single Elimination' | 'Double Elimination' | 'Round Robin';
  raceTo: number;
  targetSets?: number;
  status: 'draft' | 'in_progress' | 'completed';
  players: string[];
  matches: TournamentMatch[];
  winnerName?: string;
  createdAt: number;
}

export interface ClubTable {
  id: number;
  name: string;
  status: 'FREE' | 'LIVE' | 'MAINTENANCE';
  activeMatchId?: string;
  player1Name?: string;
  player2Name?: string;
  score1?: number;
  score2?: number;
  gameType?: GameType;
  raceTo?: number;
  startTime?: number;
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
