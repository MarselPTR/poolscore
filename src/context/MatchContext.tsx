import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Match, MatchEvent, GameType, MatchFormat, BreakRule, FoulType, BreakRecord, FoulRecord, RackHistoryItem, SetHistoryItem } from '../types';
import { db } from '../db/database';
import { calculateElo } from '../utils/elo';
import { useLiveBroadcast } from '../hooks/useLiveSync';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useSettings } from './SettingsContext';
import { syncMatchToSupabase, syncPlayerToSupabase, syncTournamentToSupabase } from '../services/supabaseService';
import confetti from 'canvas-confetti';

interface StartMatchParams {
  gameType: GameType;
  format: MatchFormat;
  raceTo: number;
  targetSets?: number;
  player1Name: string;
  player2Name: string;
  breakRule: BreakRule;
  isFoulTracking: boolean;
  isTimerEnabled: boolean;
  tournamentId?: string;
  tournamentMatchId?: string;
  tableNumber?: number;
}

interface MatchContextType {
  activeMatch: Match | null;
  rackSeconds: number;
  isPaused: boolean;
  foulAlert: { text: string; player: 1 | 2 } | null;
  setWonAlert: { text: string; player: 1 | 2; setScoreText: string } | null;
  recentMatches: Match[];
  startMatch: (params: StartMatchParams) => Promise<string>;
  winRack: (player: 1 | 2) => void;
  undo: () => void;
  recordFoul: (player: 1 | 2, type: FoulType) => void;
  recordBreak: (breakData: Omit<BreakRecord, 'rackNumber'>) => void;
  switchTurn: (targetPlayer?: 1 | 2) => void;
  adjustScore: (player: 1 | 2, delta: number) => void;
  togglePauseTimer: () => void;
  finishAndSaveMatch: () => Promise<void>;
  quitMatch: () => void;
  resumeMatch: (matchId: string) => Promise<boolean>;
  refreshRecentMatches: () => Promise<void>;
  clearFoulAlert: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [rackSeconds, setRackSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [foulAlert, setFoulAlert] = useState<{ text: string; player: 1 | 2 } | null>(null);
  const [setWonAlert, setSetWonAlert] = useState<{ text: string; player: 1 | 2; setScoreText: string } | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  const { settings } = useSettings();
  const { playPocketDrop, playBallHit, playRackWon, playMatchWon, playFoul } = useSoundEffects(
    settings.soundEnabled,
    settings.soundVolume,
    settings.vibrationEnabled
  );
  const { broadcastMatch } = useLiveBroadcast();
  const foulTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent matches on mount
  const refreshRecentMatches = useCallback(async () => {
    try {
      const matches = await db.matches
        .where('status')
        .equals('finished')
        .reverse()
        .sortBy('startedAt');
      setRecentMatches(matches.slice(0, 10));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshRecentMatches();
  }, [refreshRecentMatches]);

  // Synchronize with broadcast channel on activeMatch state changes
  useEffect(() => {
    broadcastMatch(activeMatch);
    if (activeMatch && activeMatch.status === 'in_progress') {
      try {
        db.matches.put(activeMatch);
      } catch {
        // ignore
      }
    }
  }, [activeMatch, broadcastMatch]);

  // Match and Rack Timers
  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'in_progress' || isPaused || !activeMatch.isTimerEnabled) {
      return;
    }

    const timer = setInterval(() => {
      setActiveMatch((prev) => {
        if (!prev || prev.status !== 'in_progress') return prev;
        return {
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        };
      });
      setRackSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMatch?.status, activeMatch?.isTimerEnabled, isPaused]);

  const clearFoulAlert = useCallback(() => {
    if (foulTimeoutRef.current) clearTimeout(foulTimeoutRef.current);
    setFoulAlert(null);
  }, []);

  const triggerFoulAlert = useCallback((text: string, player: 1 | 2) => {
    clearFoulAlert();
    setFoulAlert({ text, player });
    foulTimeoutRef.current = setTimeout(() => {
      setFoulAlert(null);
    }, 2800);
  }, [clearFoulAlert]);

  // Start new match
  const startMatch = async (params: StartMatchParams): Promise<string> => {
    const matchId = `MATCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Lookup ratings for players
    let r1 = 1400;
    let r2 = 1400;
    try {
      const p1 = await db.players.where('name').equalsIgnoreCase(params.player1Name).first();
      if (p1) r1 = p1.rating;
      const p2 = await db.players.where('name').equalsIgnoreCase(params.player2Name).first();
      if (p2) r2 = p2.rating;
    } catch {
      // ignore
    }

    const newMatch: Match = {
      id: matchId,
      gameType: params.gameType,
      format: params.format,
      raceTo: params.raceTo,
      targetSets: params.targetSets || 1,
      currentSet: 1,
      player1Sets: 0,
      player2Sets: 0,
      setHistory: [],
      player1: {
        name: params.player1Name.trim() || 'Player 1',
        score: 0,
        color: '#f04a3a',
        startingRating: r1,
      },
      player2: {
        name: params.player2Name.trim() || 'Player 2',
        score: 0,
        color: '#3f7bfa',
        startingRating: r2,
      },
      status: 'in_progress',
      winner: null,
      startedAt: Date.now(),
      durationSeconds: 0,
      currentRack: 1,
      currentTurn: 1,
      breakRule: params.breakRule,
      isFoulTracking: params.isFoulTracking,
      isTimerEnabled: params.isTimerEnabled,
      rackHistory: [],
      events: [
        {
          id: `evt-${Date.now()}-start`,
          timestamp: Date.now(),
          type: 'turn_switch',
          player: 1,
          rackNumber: 1,
          setNumber: 1,
          description: `Pertandingan dimulai: ${params.player1Name} vs ${params.player2Name}`,
        }
      ],
      tournamentId: params.tournamentId,
      tournamentMatchId: params.tournamentMatchId,
      tableNumber: params.tableNumber,
    };

    setActiveMatch(newMatch);
    setRackSeconds(0);
    setIsPaused(false);
    playBallHit();

    // Update Table status if table is assigned
    if (params.tableNumber) {
      try {
        await db.clubTables.update(params.tableNumber, {
          status: 'LIVE',
          activeMatchId: matchId,
          player1Name: params.player1Name,
          player2Name: params.player2Name,
          score1: 0,
          score2: 0,
          gameType: params.gameType,
          startTime: Date.now(),
        });
      } catch {
        // ignore
      }
    }

    await db.matches.put(newMatch);
    return matchId;
  };

  // Finalize statistics, Elo calculations, and save to Dexie
  const finalizeMatchStats = async (match: Match) => {
    try {
      const s1 = match.player1.score;
      const s2 = match.player2.score;
      const r1 = match.player1.startingRating || 1400;
      const r2 = match.player2.startingRating || 1400;

      const eloRes = calculateElo(r1, r2, s1, s2);

      const finalMatch: Match = {
        ...match,
        player1: {
          ...match.player1,
          newRating: eloRes.newRatingA,
        },
        player2: {
          ...match.player2,
          newRating: eloRes.newRatingB,
        }
      };

      await db.matches.put(finalMatch);

      // Update or create Player 1
      const p1Record = await db.players.where('name').equalsIgnoreCase(match.player1.name).first();
      const isP1Winner = match.winner === 1;
      if (p1Record) {
        await db.players.update(p1Record.id, {
          rating: eloRes.newRatingA,
          matchesCount: p1Record.matchesCount + 1,
          winsCount: isP1Winner ? p1Record.winsCount + 1 : p1Record.winsCount,
          lossesCount: !isP1Winner ? p1Record.lossesCount + 1 : p1Record.lossesCount,
          racksWon: p1Record.racksWon + s1,
          racksLost: p1Record.racksLost + s2,
          winStreak: isP1Winner ? p1Record.winStreak + 1 : 0,
          bestWinStreak: isP1Winner ? Math.max(p1Record.bestWinStreak, p1Record.winStreak + 1) : p1Record.bestWinStreak,
          updatedAt: Date.now(),
        });
      } else {
        await db.players.add({
          id: `p_${Date.now()}_1`,
          name: match.player1.name,
          rating: eloRes.newRatingA,
          matchesCount: 1,
          winsCount: isP1Winner ? 1 : 0,
          lossesCount: isP1Winner ? 0 : 1,
          racksWon: s1,
          racksLost: s2,
          breakRunOuts: 0,
          winStreak: isP1Winner ? 1 : 0,
          bestWinStreak: isP1Winner ? 1 : 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Update or create Player 2
      const p2Record = await db.players.where('name').equalsIgnoreCase(match.player2.name).first();
      const isP2Winner = match.winner === 2;
      if (p2Record) {
        await db.players.update(p2Record.id, {
          rating: eloRes.newRatingB,
          matchesCount: p2Record.matchesCount + 1,
          winsCount: isP2Winner ? p2Record.winsCount + 1 : p2Record.winsCount,
          lossesCount: !isP2Winner ? p2Record.lossesCount + 1 : p2Record.lossesCount,
          racksWon: p2Record.racksWon + s2,
          racksLost: p2Record.racksLost + s1,
          winStreak: isP2Winner ? p2Record.winStreak + 1 : 0,
          bestWinStreak: isP2Winner ? Math.max(p2Record.bestWinStreak, p2Record.winStreak + 1) : p2Record.bestWinStreak,
          updatedAt: Date.now(),
        });
      } else {
        await db.players.add({
          id: `p_${Date.now()}_2`,
          name: match.player2.name,
          rating: eloRes.newRatingB,
          matchesCount: 1,
          winsCount: isP2Winner ? 1 : 0,
          lossesCount: isP2Winner ? 0 : 1,
          racksWon: s2,
          racksLost: s1,
          breakRunOuts: 0,
          winStreak: isP2Winner ? 1 : 0,
          bestWinStreak: isP2Winner ? 1 : 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Update Club Table if assigned
      if (match.tableNumber) {
        await db.clubTables.update(match.tableNumber, {
          status: 'FREE',
          activeMatchId: undefined,
          player1Name: undefined,
          player2Name: undefined,
          score1: undefined,
          score2: undefined,
        });
      }

      // Update Tournament Match if from tournament
      if (match.tournamentId && match.tournamentMatchId) {
        const t = await db.tournaments.get(match.tournamentId);
        if (t) {
          const matchIdx = t.matches.findIndex(m => m.id === match.tournamentMatchId);
          if (matchIdx !== -1) {
            const currentTMatch = t.matches[matchIdx];
            currentTMatch.status = 'completed';
            currentTMatch.player1Score = s1;
            currentTMatch.player2Score = s2;
            currentTMatch.winnerName = match.winner === 1 ? match.player1.name : match.player2.name;

            // Advance winner to next round match
            if (currentTMatch.nextMatchIndex !== undefined && t.matches[currentTMatch.nextMatchIndex]) {
              const nextM = t.matches[currentTMatch.nextMatchIndex];
              if (!nextM.player1Name || nextM.player1Name.startsWith('Pemenang') || nextM.player1Name.startsWith('Juara')) {
                nextM.player1Name = currentTMatch.winnerName;
              } else if (!nextM.player2Name || nextM.player2Name.startsWith('Pemenang') || nextM.player2Name.startsWith('Juara')) {
                nextM.player2Name = currentTMatch.winnerName;
              }
              if (nextM.player1Name && nextM.player2Name && !nextM.player1Name.startsWith('Pemenang') && !nextM.player2Name.startsWith('Pemenang')) {
                nextM.status = 'ready';
              }
            }

            // For Double Elimination: Advance loser to losers bracket
            if (currentTMatch.nextLoserMatchIndex !== undefined && t.matches[currentTMatch.nextLoserMatchIndex]) {
              const loserName = match.winner === 1 ? match.player2.name : match.player1.name;
              const loserM = t.matches[currentTMatch.nextLoserMatchIndex];
              if (!loserM.player1Name || loserM.player1Name.startsWith('Kalah') || loserM.player1Name.startsWith('Pemenang')) {
                loserM.player1Name = loserName;
              } else if (!loserM.player2Name || loserM.player2Name.startsWith('Kalah') || loserM.player2Name.startsWith('Pemenang')) {
                loserM.player2Name = loserName;
              }
              if (loserM.player1Name && loserM.player2Name && !loserM.player1Name.startsWith('Kalah') && !loserM.player2Name.startsWith('Kalah')) {
                loserM.status = 'ready';
              }
            }

            // Check if tournament is completely finished (final match won)
            const finalMatch = t.matches[t.matches.length - 1];
            if (finalMatch && finalMatch.status === 'completed') {
              t.status = 'completed';
              t.winnerName = finalMatch.winnerName;
            } else {
              t.status = 'in_progress';
            }

            await db.tournaments.put(t);
            syncTournamentToSupabase(t).catch(() => {});
          }
        }
      }

      // Sync to Supabase in background
      syncMatchToSupabase(finalMatch).catch(() => {});
      const p1Latest = await db.players.where('name').equalsIgnoreCase(match.player1.name).first();
      if (p1Latest) syncPlayerToSupabase(p1Latest).catch(() => {});
      const p2Latest = await db.players.where('name').equalsIgnoreCase(match.player2.name).first();
      if (p2Latest) syncPlayerToSupabase(p2Latest).catch(() => {});

      await refreshRecentMatches();
    } catch {
      // ignore
    }
  };

  // Win Rack & Set Progression
  const winRack = (winnerPlayer: 1 | 2) => {
    if (!activeMatch || activeMatch.status !== 'in_progress') return;

    const currentScore1 = activeMatch.player1.score;
    const currentScore2 = activeMatch.player2.score;
    const newScore1 = winnerPlayer === 1 ? currentScore1 + 1 : currentScore1;
    const newScore2 = winnerPlayer === 2 ? currentScore2 + 1 : currentScore2;

    const winnerName = winnerPlayer === 1 ? activeMatch.player1.name : activeMatch.player2.name;

    // Check if the current SET is won
    const isSetWon = newScore1 >= activeMatch.raceTo || newScore2 >= activeMatch.raceTo;

    // Calculate Sets Won
    const currentSets1 = activeMatch.player1Sets || 0;
    const currentSets2 = activeMatch.player2Sets || 0;
    const newSets1 = isSetWon && winnerPlayer === 1 ? currentSets1 + 1 : currentSets1;
    const newSets2 = isSetWon && winnerPlayer === 2 ? currentSets2 + 1 : currentSets2;

    const targetSets = activeMatch.targetSets || 1;
    const isMatchWon = isSetWon && (newSets1 >= targetSets || newSets2 >= targetSets);

    // Determine next turn based on Break Rule
    let nextTurn: 1 | 2 = winnerPlayer;
    if (activeMatch.breakRule === 'Winner Breaks') {
      nextTurn = winnerPlayer;
    } else if (activeMatch.breakRule === 'Alternate Breaks') {
      const currentBreaker = activeMatch.rackHistory.length > 0
        ? (activeMatch.rackHistory[activeMatch.rackHistory.length - 1].breaker || 1)
        : 1;
      nextTurn = currentBreaker === 1 ? 2 : 1;
    } else if (activeMatch.breakRule === 'Loser Breaks') {
      nextTurn = winnerPlayer === 1 ? 2 : 1;
    }

    const rackItem: RackHistoryItem = {
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      winner: winnerPlayer,
      durationSeconds: rackSeconds,
      breaker: activeMatch.currentTurn,
      timestamp: Date.now(),
    };

    if (isSetWon && !isMatchWon) {
      // Set completed, but more Sets are required to finish match
      const setItem: SetHistoryItem = {
        setNumber: activeMatch.currentSet,
        winner: winnerPlayer,
        player1Score: newScore1,
        player2Score: newScore2,
        durationSeconds: activeMatch.durationSeconds,
        racks: [...activeMatch.rackHistory.filter(r => r.setNumber === activeMatch.currentSet), rackItem],
      };

      const setWinEvent: MatchEvent = {
        id: `evt-${Date.now()}-setwin`,
        timestamp: Date.now(),
        type: 'set_win',
        player: winnerPlayer,
        rackNumber: activeMatch.currentRack,
        setNumber: activeMatch.currentSet,
        description: `🏆 ${winnerName} memenangkan Set ${activeMatch.currentSet}! Skor Set: ${newSets1} - ${newSets2}`,
        metadata: {
          prevScore1: currentScore1,
          prevScore2: currentScore2,
          newScore1: 0,
          newScore2: 0,
          prevSets1: currentSets1,
          prevSets2: currentSets2,
          newSets1,
          newSets2,
          prevCurrentSet: activeMatch.currentSet,
          newCurrentSet: activeMatch.currentSet + 1,
          savedRackHistory: activeMatch.rackHistory,
        },
      };

      const updatedMatch: Match = {
        ...activeMatch,
        player1: { ...activeMatch.player1, score: 0 }, // Reset rack score for next set
        player2: { ...activeMatch.player2, score: 0 },
        player1Sets: newSets1,
        player2Sets: newSets2,
        currentSet: activeMatch.currentSet + 1,
        currentRack: 1, // Reset rack number for next set
        currentTurn: nextTurn,
        setHistory: [...(activeMatch.setHistory || []), setItem],
        rackHistory: [...activeMatch.rackHistory, rackItem],
        events: [...activeMatch.events, setWinEvent],
      };

      setActiveMatch(updatedMatch);
      setRackSeconds(0);
      playRackWon();

      // Show Set Victory Banner Alert
      if (setTimeoutRef.current) clearTimeout(setTimeoutRef.current);
      setSetWonAlert({
        text: `🏆 ${winnerName} memenangkan Set ${activeMatch.currentSet}!`,
        player: winnerPlayer,
        setScoreText: `Skor Babak: ${newSets1} - ${newSets2}`,
      });
      setTimeoutRef.current = setTimeout(() => {
        setSetWonAlert(null);
      }, 4000);

      return;
    }

    // Normal Rack Win or Total Match Won
    const rackWinEvent: MatchEvent = {
      id: `evt-${Date.now()}-win`,
      timestamp: Date.now(),
      type: isMatchWon && targetSets > 1 ? 'set_win' : 'rack_win',
      player: winnerPlayer,
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      description: isMatchWon && targetSets > 1
        ? `🏆 ${winnerName} memenangkan Match! Skor Babak Akhir: ${newSets1} - ${newSets2}`
        : `${winnerName} memenangkan Rack ${activeMatch.currentRack}`,
      metadata: {
        prevScore1: currentScore1,
        prevScore2: currentScore2,
        newScore1,
        newScore2,
        prevSets1: currentSets1,
        prevSets2: currentSets2,
        newSets1,
        newSets2,
        prevCurrentSet: activeMatch.currentSet,
        newCurrentSet: activeMatch.currentSet,
      },
    };

    const updatedMatch: Match = {
      ...activeMatch,
      player1: { ...activeMatch.player1, score: newScore1 },
      player2: { ...activeMatch.player2, score: newScore2 },
      player1Sets: newSets1,
      player2Sets: newSets2,
      currentRack: isMatchWon ? activeMatch.currentRack : activeMatch.currentRack + 1,
      currentTurn: nextTurn,
      status: isMatchWon ? 'finished' : 'in_progress',
      winner: isMatchWon ? winnerPlayer : null,
      finishedAt: isMatchWon ? Date.now() : undefined,
      rackHistory: [...activeMatch.rackHistory, rackItem],
      events: [...activeMatch.events, rackWinEvent],
    };

    setActiveMatch(updatedMatch);
    setRackSeconds(0);

    if (isMatchWon) {
      playMatchWon();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: winnerPlayer === 1 ? ['#f04a3a', '#ffffff', '#f2a93b'] : ['#3f7bfa', '#ffffff', '#04e2ac']
      });
      finalizeMatchStats(updatedMatch);
    } else {
      playRackWon();
    }
  };

  // Undo last action (Supports Set Win, Rack Win, Foul, Turn Switch, Score Adjust)
  const undo = () => {
    if (!activeMatch || activeMatch.events.length <= 1) return;

    const eventsCopy = [...activeMatch.events];
    const lastEvent = eventsCopy.pop();
    if (!lastEvent) return;

    if (lastEvent.type === 'set_win') {
      const prevSets1 = lastEvent.metadata?.prevSets1 ?? activeMatch.player1Sets;
      const prevSets2 = lastEvent.metadata?.prevSets2 ?? activeMatch.player2Sets;
      const prevSet = lastEvent.metadata?.prevCurrentSet ?? activeMatch.currentSet;
      const prevScore1 = lastEvent.metadata?.prevScore1 ?? activeMatch.player1.score;
      const prevScore2 = lastEvent.metadata?.prevScore2 ?? activeMatch.player2.score;
      const prevRackHistory = lastEvent.metadata?.savedRackHistory ?? activeMatch.rackHistory.slice(0, -1);
      const prevSetHistory = activeMatch.setHistory ? activeMatch.setHistory.slice(0, -1) : [];

      setActiveMatch({
        ...activeMatch,
        player1: { ...activeMatch.player1, score: prevScore1 },
        player2: { ...activeMatch.player2, score: prevScore2 },
        player1Sets: prevSets1,
        player2Sets: prevSets2,
        currentSet: prevSet,
        currentRack: activeMatch.raceTo,
        status: 'in_progress',
        winner: null,
        finishedAt: undefined,
        setHistory: prevSetHistory,
        rackHistory: prevRackHistory,
        events: eventsCopy,
      });
      setSetWonAlert(null);
      playBallHit();
    } else if (lastEvent.type === 'rack_win') {
      const lastRack = activeMatch.rackHistory[activeMatch.rackHistory.length - 1];
      const prevRackHistory = activeMatch.rackHistory.slice(0, -1);
      const prevWinner = lastEvent.player;

      const restoredScore1 = prevWinner === 1 ? Math.max(0, activeMatch.player1.score - 1) : activeMatch.player1.score;
      const restoredScore2 = prevWinner === 2 ? Math.max(0, activeMatch.player2.score - 1) : activeMatch.player2.score;

      setActiveMatch({
        ...activeMatch,
        player1: { ...activeMatch.player1, score: restoredScore1 },
        player2: { ...activeMatch.player2, score: restoredScore2 },
        currentRack: lastRack ? lastRack.rackNumber : Math.max(1, activeMatch.currentRack - 1),
        currentTurn: lastRack?.breaker || 1,
        status: 'in_progress',
        winner: null,
        finishedAt: undefined,
        rackHistory: prevRackHistory,
        events: eventsCopy,
      });
      playBallHit();
    } else if (lastEvent.type === 'turn_switch') {
      const prevTurn = lastEvent.player === 1 ? 2 : 1;
      setActiveMatch({
        ...activeMatch,
        currentTurn: prevTurn,
        events: eventsCopy,
      });
      playBallHit();
    } else if (lastEvent.type === 'score_adjust' && lastEvent.metadata) {
      setActiveMatch({
        ...activeMatch,
        player1: { ...activeMatch.player1, score: lastEvent.metadata.prevScore1 ?? activeMatch.player1.score },
        player2: { ...activeMatch.player2, score: lastEvent.metadata.prevScore2 ?? activeMatch.player2.score },
        events: eventsCopy,
      });
      playBallHit();
    } else {
      setActiveMatch({
        ...activeMatch,
        events: eventsCopy,
      });
    }
  };

  // Record Foul
  const recordFoul = (player: 1 | 2, type: FoulType) => {
    if (!activeMatch || activeMatch.status !== 'in_progress') return;

    const foulPlayerName = player === 1 ? activeMatch.player1.name : activeMatch.player2.name;
    const opponentPlayerName = player === 1 ? activeMatch.player2.name : activeMatch.player1.name;
    const opponent: 1 | 2 = player === 1 ? 2 : 1;

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-foul`,
      timestamp: Date.now(),
      type: 'foul',
      player,
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      description: `Foul: ${foulPlayerName} (${type}) ➔ ${opponentPlayerName} Ball in Hand`,
      metadata: {
        foulType: type,
      },
    };

    const foulRecord: FoulRecord = {
      rackNumber: activeMatch.currentRack,
      player,
      type,
      timestamp: Date.now(),
    };

    const currentRackHistory = [...activeMatch.rackHistory];
    const currentRackIndex = currentRackHistory.findIndex(r => r.rackNumber === activeMatch.currentRack && r.setNumber === activeMatch.currentSet);
    if (currentRackIndex !== -1) {
      const fouls = currentRackHistory[currentRackIndex].fouls || [];
      currentRackHistory[currentRackIndex].fouls = [...fouls, foulRecord];
    }

    setActiveMatch({
      ...activeMatch,
      currentTurn: opponent,
      rackHistory: currentRackHistory,
      events: [...activeMatch.events, newEvent],
    });

    playFoul();
    triggerFoulAlert(`FOUL (${type.toUpperCase()}) - ${opponentPlayerName.toUpperCase()} BALL IN HAND`, opponent);
  };

  // Record Break
  const recordBreak = (breakData: Omit<BreakRecord, 'rackNumber'>) => {
    if (!activeMatch || activeMatch.status !== 'in_progress') return;

    const breakerName = breakData.breaker === 1 ? activeMatch.player1.name : activeMatch.player2.name;

    const desc = `${breakerName} Break: ${breakData.isLegal ? 'Legal' : 'Illegal/Foul'} (${breakData.ballsPocketed} bola masuk)${
      breakData.isRunOut ? ' 🔥 Table Run-Out!' : ''
    }`;

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-break`,
      timestamp: Date.now(),
      type: 'break',
      player: breakData.breaker,
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      description: desc,
      metadata: {
        breakDetails: breakData,
      },
    };

    setActiveMatch({
      ...activeMatch,
      events: [...activeMatch.events, newEvent],
    });

    playBallHit();
  };

  // Switch Turn
  const switchTurn = (targetPlayer?: 1 | 2) => {
    if (!activeMatch || activeMatch.status !== 'in_progress') return;

    const nextTurn: 1 | 2 = targetPlayer !== undefined
      ? targetPlayer
      : (activeMatch.currentTurn === 1 ? 2 : 1);

    if (nextTurn === activeMatch.currentTurn) return;

    const nextPlayerName = nextTurn === 1 ? activeMatch.player1.name : activeMatch.player2.name;

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-turn`,
      timestamp: Date.now(),
      type: 'turn_switch',
      player: nextTurn,
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      description: `Giliran menembak beralih ke ${nextPlayerName}`,
    };

    setActiveMatch({
      ...activeMatch,
      currentTurn: nextTurn,
      events: [...activeMatch.events, newEvent],
    });

    playBallHit();
  };

  // Manually adjust score (+1 / -1)
  const adjustScore = (player: 1 | 2, delta: number) => {
    if (!activeMatch || activeMatch.status !== 'in_progress') return;

    const prevS1 = activeMatch.player1.score;
    const prevS2 = activeMatch.player2.score;

    let newS1 = prevS1;
    let newS2 = prevS2;

    if (player === 1) {
      newS1 = Math.max(0, prevS1 + delta);
    } else {
      newS2 = Math.max(0, prevS2 + delta);
    }

    if (newS1 === prevS1 && newS2 === prevS2) return;

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-adjust`,
      timestamp: Date.now(),
      type: 'score_adjust',
      player,
      rackNumber: activeMatch.currentRack,
      setNumber: activeMatch.currentSet,
      description: `Penyesuaian manual skor ${player === 1 ? activeMatch.player1.name : activeMatch.player2.name}: ${
        delta > 0 ? '+' : ''
      }${delta} poin`,
      metadata: {
        prevScore1: prevS1,
        prevScore2: prevS2,
        newScore1: newS1,
        newScore2: newS2,
      },
    };

    setActiveMatch({
      ...activeMatch,
      player1: { ...activeMatch.player1, score: newS1 },
      player2: { ...activeMatch.player2, score: newS2 },
      events: [...activeMatch.events, newEvent],
    });

    if (delta > 0) {
      playPocketDrop();
    } else {
      playBallHit();
    }
  };

  // Toggle Timer Pause
  const togglePauseTimer = () => {
    setIsPaused(prev => !prev);
  };

  // Finish match and save
  const finishAndSaveMatch = async () => {
    if (!activeMatch) return;
    await finalizeMatchStats({
      ...activeMatch,
      status: 'finished',
      finishedAt: Date.now(),
    });
    setActiveMatch(null);
  };

  // Quit match without saving as finished
  const quitMatch = () => {
    setActiveMatch(null);
  };

  // Resume previous match from database
  const resumeMatch = async (matchId: string): Promise<boolean> => {
    try {
      const match = await db.matches.get(matchId);
      if (match && match.status === 'in_progress') {
        setActiveMatch(match);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <MatchContext.Provider
      value={{
        activeMatch,
        rackSeconds,
        isPaused,
        foulAlert,
        setWonAlert,
        recentMatches,
        startMatch,
        winRack,
        undo,
        recordFoul,
        recordBreak,
        switchTurn,
        adjustScore,
        togglePauseTimer,
        finishAndSaveMatch,
        quitMatch,
        resumeMatch,
        refreshRecentMatches,
        clearFoulAlert,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};
