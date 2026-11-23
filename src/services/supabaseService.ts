import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Match, Tournament, Player, ClubTable } from '../types';
import { db } from '../db/database';

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
      table_number: null,
      created_by: match.createdBy || null,
    };

    await supabase.from('matches').upsert(payload, { onConflict: 'id' });
  } catch {
    // Fail silently / fallback to local IndexedDB
  }
}

export async function fetchMatchesFromSupabase(limit = 100): Promise<Match[]> {
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
      createdBy: d.created_by,
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

export interface PlayerSearchResult {
  id: string;
  name: string;
  username: string;
}

/**
 * Search registered players by name/username to add them as tournament
 * participants. Backed by a SECURITY DEFINER function that returns only safe
 * fields (no email/phone), so this does not expose personal data.
 */
export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  const q = query.trim();
  if (!isSupabaseConfigured || q.length < 2) return [];
  try {
    const { data, error } = await supabase.rpc('search_players', { query: q });
    if (error || !data) return [];
    return (data as PlayerSearchResult[]).map((d) => ({
      id: d.id,
      name: d.name,
      username: d.username,
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
      participants: tournament.participants || [],
      matches: tournament.matches,
      winner_name: tournament.winnerName || null,
      runner_up_name: tournament.runnerUpName || null,
      venue_name: tournament.venueName || null,
      is_public: tournament.isPublic ?? true,
      created_by: tournament.createdBy || null,
      created_at: tournament.createdAt,
    };

    await supabase.from('tournaments').upsert(payload, { onConflict: 'id' });
  } catch {
    // Fail silently
  }
}

export async function deleteTournamentFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTournamentsFromSupabase(): Promise<Tournament[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      gameType: d.game_type,
      format: d.format,
      raceTo: d.race_to,
      targetSets: d.target_sets || 1,
      status: d.status,
      players: d.players || [],
      participants: d.participants || [],
      matches: d.matches || [],
      winnerName: d.winner_name,
      runnerUpName: d.runner_up_name,
      venueName: d.venue_name,
      isPublic: d.is_public,
      createdBy: d.created_by,
      createdAt: Number(d.created_at),
    }));
  } catch {
    return [];
  }
}

// =====================================================================
// CLUB TABLES (per-venue) — managed by venue admins, synced to Supabase
// =====================================================================

function mapTableRow(d: Record<string, unknown>): ClubTable {
  return {
    id: d.id as string,
    ownerId: (d.owner_id as string) || undefined,
    name: d.name as string,
    position: (d.position as number) ?? 0,
    status: d.status as ClubTable['status'],
    activeMatchId: (d.active_match_id as string) || undefined,
    player1Name: (d.player1_name as string) || undefined,
    player2Name: (d.player2_name as string) || undefined,
    score1: (d.score1 as number) || 0,
    score2: (d.score2 as number) || 0,
    gameType: (d.game_type as ClubTable['gameType']) || undefined,
    raceTo: (d.race_to as number) || undefined,
    startTime: (d.start_time as number) || undefined,
  };
}

/** Tables owned by one venue admin. */
export async function fetchTablesForOwner(ownerId: string): Promise<ClubTable[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('club_tables')
      .select('*')
      .eq('owner_id', ownerId)
      .order('position', { ascending: true });
    if (error || !data) return [];
    return data.map(mapTableRow);
  } catch {
    return [];
  }
}

/** All tables (super admin monitoring). */
export async function fetchAllTables(): Promise<ClubTable[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('club_tables')
      .select('*')
      .order('position', { ascending: true });
    if (error || !data) return [];
    return data.map(mapTableRow);
  } catch {
    return [];
  }
}

export async function createTable(ownerId: string, name: string, position: number): Promise<ClubTable | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const id = `tbl_${Math.random().toString(36).substring(2, 10)}`;
    const { data, error } = await supabase
      .from('club_tables')
      .insert({ id, owner_id: ownerId, name, position, status: 'FREE' })
      .select()
      .single();
    if (error || !data) return null;
    return mapTableRow(data);
  } catch {
    return null;
  }
}

export async function renameTable(id: string, name: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('club_tables')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function setTableStatus(id: string, status: ClubTable['status']): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status !== 'LIVE') {
      Object.assign(patch, {
        active_match_id: null,
        player1_name: null,
        player2_name: null,
        score1: 0,
        score2: 0,
        game_type: null,
        start_time: null,
      });
    }
    const { error } = await supabase.from('club_tables').update(patch).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteTable(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('club_tables').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/** Update the live snapshot shown on a table card (called as the match plays). */
export async function updateTableLive(
  id: string,
  patch: Partial<Pick<ClubTable, 'status' | 'activeMatchId' | 'player1Name' | 'player2Name' | 'score1' | 'score2' | 'gameType' | 'raceTo' | 'startTime'>>
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase
      .from('club_tables')
      .update({
        status: patch.status,
        active_match_id: patch.activeMatchId ?? null,
        player1_name: patch.player1Name ?? null,
        player2_name: patch.player2Name ?? null,
        score1: patch.score1 ?? 0,
        score2: patch.score2 ?? 0,
        game_type: patch.gameType ?? null,
        race_to: patch.raceTo ?? null,
        start_time: patch.startTime ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Fail silently
  }
}

// =====================================================================
// VENUE ADMIN APPROVAL (Super Admin)
// =====================================================================

export interface VenueAdminRow {
  id: string;
  name: string;
  email: string | null;
  venueName: string | null;
  venueArea: string | null;
  venuePhone: string | null;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  createdAt: string | null;
}

export async function fetchVenueAdmins(): Promise<VenueAdminRow[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, venue_name, venue_area, venue_phone, approval_status, created_at')
      .eq('role', 'venue_admin')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      venueName: d.venue_name,
      venueArea: d.venue_area,
      venuePhone: d.venue_phone,
      approvalStatus: d.approval_status,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function setProfileApproval(
  id: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// =====================================================================
// FULL CLOUD SYNC INITIALIZATION
// =====================================================================

export async function pullInitialDataFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    // Club tables are read directly from Supabase (per-venue), not mirrored
    // into the local DB.
    const [cloudPlayers, cloudMatches, cloudTournaments] = await Promise.all([
      fetchPlayersFromSupabase(),
      fetchMatchesFromSupabase(100),
      fetchTournamentsFromSupabase(),
    ]);

    if (cloudPlayers.length > 0) {
      await db.players.bulkPut(cloudPlayers);
    }

    if (cloudMatches.length > 0) {
      await db.matches.bulkPut(cloudMatches);
    }

    if (cloudTournaments.length > 0) {
      await db.tournaments.bulkPut(cloudTournaments);
    }
  } catch {
    // Fail silently
  }
}
