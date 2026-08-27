-- =====================================================================
-- POOLSCORE CHAMPIONSHIP SUITE - SUPABASE DATABASE SCHEMA
-- NugrahaTech Innovations
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extending Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Pemain' CHECK (role IN ('Pemain', 'Wasit', 'Pengelola Club')),
  rating INTEGER DEFAULT 1400,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Players Leaderboard Table
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 1400,
  matches_count INTEGER DEFAULT 0,
  wins_count INTEGER DEFAULT 0,
  losses_count INTEGER DEFAULT 0,
  racks_won INTEGER DEFAULT 0,
  racks_lost INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  break_run_outs INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  game_type TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Race To',
  race_to INTEGER NOT NULL DEFAULT 7,
  target_sets INTEGER NOT NULL DEFAULT 1,
  current_set INTEGER NOT NULL DEFAULT 1,
  player1_sets INTEGER NOT NULL DEFAULT 0,
  player2_sets INTEGER NOT NULL DEFAULT 0,
  player1 JSONB NOT NULL,
  player2 JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'finished', 'paused')),
  winner INTEGER,
  started_at BIGINT NOT NULL,
  finished_at BIGINT,
  duration_seconds INTEGER DEFAULT 0,
  current_rack INTEGER DEFAULT 1,
  current_turn INTEGER DEFAULT 1,
  break_rule TEXT DEFAULT 'Winner Breaks',
  is_foul_tracking BOOLEAN DEFAULT TRUE,
  is_timer_enabled BOOLEAN DEFAULT TRUE,
  rack_history JSONB DEFAULT '[]'::jsonb,
  set_history JSONB DEFAULT '[]'::jsonb,
  events JSONB DEFAULT '[]'::jsonb,
  tournament_id TEXT,
  tournament_match_id TEXT,
  table_number INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Single Elimination',
  race_to INTEGER NOT NULL DEFAULT 7,
  target_sets INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'completed')),
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  matches JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_name TEXT,
  runner_up_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL
);

-- 6. Club Tables (Multi-Table Management)
CREATE TABLE IF NOT EXISTS public.club_tables (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'FREE' CHECK (status IN ('FREE', 'LIVE', 'MAINTENANCE')),
  active_match_id TEXT REFERENCES public.matches(id) ON DELETE SET NULL,
  player1_name TEXT,
  player2_name TEXT,
  score1 INTEGER DEFAULT 0,
  score2 INTEGER DEFAULT 0,
  game_type TEXT,
  race_to INTEGER,
  start_time BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert Initial 8 Billiard Tables if empty
INSERT INTO public.club_tables (id, name, status)
VALUES
  (1, 'Meja 1 (VIP Diamond)', 'FREE'),
  (2, 'Meja 2 (Standard Pro)', 'FREE'),
  (3, 'Meja 3 (Standard Pro)', 'FREE'),
  (4, 'Meja 4 (Standard Pro)', 'FREE'),
  (5, 'Meja 5 (Standard Pro)', 'FREE'),
  (6, 'Meja 6 (Standard Pro)', 'FREE'),
  (7, 'Meja 7 (Match Arena)', 'FREE'),
  (8, 'Meja 8 (TV Final Arena)', 'FREE')
ON CONFLICT (id) DO NOTHING;

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_tables ENABLE ROW LEVEL SECURITY;

-- Allow public reads and authenticated writes
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert/update their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Players are readable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert or update players" ON public.players FOR ALL USING (true);

CREATE POLICY "Matches are readable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert/update matches" ON public.matches FOR ALL USING (true);

CREATE POLICY "Tournaments are readable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert/update tournaments" ON public.tournaments FOR ALL USING (true);

CREATE POLICY "Club tables are readable by everyone" ON public.club_tables FOR SELECT USING (true);
CREATE POLICY "Anyone can update club tables" ON public.club_tables FOR ALL USING (true);

-- 9. Automatic Profile Creation on User Sign Up (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username, email, role, rating)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'Pemain'),
    1400
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Enable Realtime Publications for Live Scoreboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
