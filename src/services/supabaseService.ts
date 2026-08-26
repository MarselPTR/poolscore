import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Match, Tournament, Player, ClubTable } from '../types';

// =====================================================================
// MATCHES SYNC SERVICE
// =====================================================================

export async function syncMatchToSupabase(match: Match): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: match.id,
      game_type: match.gameType,
      format: match.format,
      race_to: match.raceTo,
      target_sets: match.targetSets,
      current_set: match.currentSet,
      player1_sets: match.player1Sets,
      player2_sets: match.player2Sets,
      player1: match.player1,
      player2: match.player2,
      status: match.status,
      winner: match.winner,
      started_at: match.startedAt,
      finished_at: match.finishedAt || null,
      duration_seconds: match.durationSeconds,
      current_rack: match.currentRack,
      current_turn: match.currentTurn,
      break_rule: match.breakRule,
      is_foul_tracking: match.isFoulTracking,
      is_timer_enabled: match.isTimerEnabled,
      rack_history: match.rackHistory,
      set_history: match.setHistory,
      events: match.events,
      tournament_id: match.tournamentId || null,
      tournament_match_id: match.tournamentMatchId || null,
      table_number: match.tableNumber || null,
    };

    await supabase.from('matches').upsert(payload, { onConflict: 'id' });
  } catch {
    // Fail silently / fallback to local IndexedDB
  }
}

export async function fetchMatchesFromSupabase(limit = 20): Promise<Match[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      gameType: d.game_type,
      format: d.format,
      raceTo: d.race_to,
      targetSets: d.target_sets || 1,
      currentSet: d.current_set || 1,
      player1Sets: d.player1_sets || 0,
      player2Sets: d.player2_sets || 0,
      player1: d.player1,
      player2: d.player2,
      status: d.status,
      winner: d.winner,
      startedAt: d.started_at,
      finishedAt: d.finished_at,
      durationSeconds: d.duration_seconds,
      currentRack: d.current_rack,
      currentTurn: d.current_turn,
      breakRule: d.break_rule,
      isFoulTracking: d.is_foul_tracking,
      isTimerEnabled: d.is_timer_enabled,
      rackHistory: d.rack_history || [],
      setHistory: d.set_history || [],
      events: d.events || [],
      tournamentId: d.tournament_id,
      tournamentMatchId: d.tournament_match_id,
      tableNumber: d.table_number,
    }));
  } catch {
    return [];
  }
}

// =====================================================================
// PLAYERS & LEADERBOARD SYNC SERVICE
// =====================================================================

export async function syncPlayerToSupabase(player: Player): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: player.id,
      name: player.name,
      avatar_url: player.avatarUrl || null,
      rating: player.rating,
      matches_count: player.matchesCount,
      wins_count: player.winsCount,
      losses_count: player.lossesCount,
      racks_won: player.racksWon,
      racks_lost: player.racksLost,
      win_streak: player.winStreak,
      best_win_streak: player.bestWinStreak,
      break_run_outs: player.breakRunOuts,
      tournaments_won: player.tournamentsWon || 0,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    };

    await supabase.from('players').upsert(payload, { onConflict: 'name' });
  } catch {
    // Fail silently / offline
  }
}

export async function fetchPlayersFromSupabase(): Promise<Player[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('rating', { ascending: false });

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      avatarUrl: d.avatar_url,
      rating: d.rating,
      matchesCount: d.matches_count,
      winsCount: d.wins_count,
      lossesCount: d.losses_count,
      racksWon: d.racks_won,
      racksLost: d.racks_lost,
      winStreak: d.win_streak,
      bestWinStreak: d.best_win_streak,
      breakRunOuts: d.break_run_outs,
      tournamentsWon: d.tournaments_won,
      createdAt: Number(d.created_at),
      updatedAt: Number(d.updated_at),
    }));
  } catch {
    return [];
  }
}

// =====================================================================
// TOURNAMENTS SYNC SERVICE
// =====================================================================

export async function syncTournamentToSupabase(tournament: Tournament): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: tournament.id,
      name: tournament.name,
      game_type: tournament.gameType,
      format: tournament.format,
      race_to: tournament.raceTo,
      target_sets: tournament.targetSets || 1,
      status: tournament.status,
      players: tournament.players,
      matches: tournament.matches,
      winner_name: tournament.winnerName || null,
      runner_up_name: tournament.runnerUpName || null,
      created_at: tournament.createdAt,
    };

    await supabase.from('tournaments').upsert(payload, { onConflict: 'id' });
  } catch {
    // Fail silently
  }
}

// =====================================================================
// CLUB TABLES SYNC SERVICE
// =====================================================================

export async function syncClubTableToSupabase(table: ClubTable): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: table.id,
      name: table.name,
      status: table.status,
      active_match_id: table.activeMatchId || null,
      player1_name: table.player1Name || null,
      player2_name: table.player2Name || null,
      score1: table.score1 || 0,
      score2: table.score2 || 0,
      game_type: table.gameType || null,
      race_to: table.raceTo || null,
      start_time: table.startTime || null,
    };

    await supabase.from('club_tables').upsert(payload, { onConflict: 'id' });
  } catch {
    // Fail silently
  }
}
