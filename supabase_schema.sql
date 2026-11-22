-- =====================================================================
-- POOLSCORE — SKEMA DATABASE (Fase 2: Akun & Peran)
-- Jalankan seluruh file ini di Supabase -> SQL Editor.
-- CATATAN: bagian "BERSIHKAN DATA LAMA" bersifat menghapus. Aman dijalankan
-- karena model data berubah (disepakati 12 Nov 2026).
-- =====================================================================

-- 0. Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. BERSIHKAN DATA & OBJEK LAMA (hapus dulu agar skema baru bersih)
-- =====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.club_tables CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================================
-- 2. PROFILES (perluasan auth.users) + peran
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'participant'
    CHECK (role IN ('participant', 'venue_admin', 'super_admin')),
  approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('approved', 'pending', 'rejected')),
  -- Info tempat billiard (diisi saat daftar sebagai pengelola tempat)
  venue_name TEXT,
  venue_area TEXT,
  venue_phone TEXT,
  rating INTEGER DEFAULT 1400,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper: apakah pemanggil adalah super admin (dipakai oleh RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: apakah pemanggil admin tempat / super admin yang SUDAH DISETUJUI
-- (dipakai RLS agar pembuatan turnamen & meja hanya oleh admin yang sah).
CREATE OR REPLACE FUNCTION public.can_manage_venue()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND approval_status = 'approved'
      AND role IN ('venue_admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Login via username/nama/HP: mengembalikan 1 email yang cocok tanpa membuka
-- seluruh tabel profil. Dipakai sebelum user terautentikasi.
CREATE OR REPLACE FUNCTION public.resolve_login_email(identifier text)
RETURNS text AS $$
  SELECT email FROM public.profiles
  WHERE username ILIKE identifier
     OR name ILIKE identifier
     OR phone = identifier
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

REVOKE ALL ON FUNCTION public.resolve_login_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(text) TO anon, authenticated;

-- =====================================================================
-- 3. PLAYERS (papan peringkat sementara — berbasis poin turnamen di Fase 4)
-- =====================================================================
CREATE TABLE public.players (
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

-- =====================================================================
-- 4. MATCHES (riwayat per-akun lewat created_by)
-- =====================================================================
CREATE TABLE public.matches (
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
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'finished', 'paused')),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 5. TOURNAMENTS (publik — dibaca semua; Fase 4 menautkan ke venue)
-- =====================================================================
CREATE TABLE public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Single Elimination',
  race_to INTEGER NOT NULL DEFAULT 7,
  target_sets INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('draft', 'in_progress', 'completed')),
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  matches JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_name TEXT,
  runner_up_name TEXT,
  venue_name TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL
);

-- =====================================================================
-- 6. CLUB TABLES (per-tempat / venue — dimiliki admin tempat)
-- =====================================================================
CREATE TABLE public.club_tables (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'FREE'
    CHECK (status IN ('FREE', 'LIVE', 'MAINTENANCE')),
  active_match_id TEXT,
  player1_name TEXT,
  player2_name TEXT,
  score1 INTEGER DEFAULT 0,
  score2 INTEGER DEFAULT 0,
  game_type TEXT,
  race_to INTEGER,
  start_time BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX club_tables_owner_idx ON public.club_tables (owner_id);

-- =====================================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_tables ENABLE ROW LEVEL SECURITY;

-- PROFILES: hanya pemilik + super admin yang boleh baca (profil berisi email &
-- No. HP — JANGAN dibuka publik). Login via username/HP memakai fungsi server
-- public.resolve_login_email() (lihat bagian fungsi di bawah).
CREATE POLICY "user manages own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "super admin manages all profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- PLAYERS (peringkat): dibaca semua; klien hanya boleh INSERT/UPDATE (sinkron
-- hasil match), tidak boleh DELETE. Hapus hanya oleh super admin.
CREATE POLICY "players readable by all" ON public.players
  FOR SELECT USING (true);
CREATE POLICY "auth inserts players" ON public.players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth updates players" ON public.players
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "super admin manages players" ON public.players
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- MATCHES: riwayat pribadi — user baca/tulis miliknya; super admin baca semua.
CREATE POLICY "user reads own matches" ON public.matches
  FOR SELECT USING (auth.uid() = created_by OR public.is_super_admin());
CREATE POLICY "user inserts own matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "user updates own matches" ON public.matches
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "user deletes own matches" ON public.matches
  FOR DELETE USING (auth.uid() = created_by OR public.is_super_admin());

-- TOURNAMENTS: dibaca semua (publik); hanya pemilik (admin pembuat) atau super
-- admin yang boleh menulis.
CREATE POLICY "tournaments readable by all" ON public.tournaments
  FOR SELECT USING (true);
CREATE POLICY "owner inserts tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (auth.uid() = created_by AND public.can_manage_venue());
CREATE POLICY "owner updates own tournaments" ON public.tournaments
  FOR UPDATE USING (auth.uid() = created_by OR public.is_super_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_super_admin());
CREATE POLICY "owner deletes own tournaments" ON public.tournaments
  FOR DELETE USING (auth.uid() = created_by OR public.is_super_admin());

-- CLUB TABLES: dibaca semua (untuk tampilan TV); dikelola oleh pemiliknya
-- (admin tempat) dan super admin.
CREATE POLICY "club tables readable by all" ON public.club_tables
  FOR SELECT USING (true);
CREATE POLICY "owner manages own tables" ON public.club_tables
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id AND public.can_manage_venue());
CREATE POLICY "super admin manages all tables" ON public.club_tables
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- =====================================================================
-- 8. TRIGGER: buat profil otomatis saat sign up (membawa peran & info tempat)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta JSONB := COALESCE(new.raw_user_meta_data, '{}'::jsonb);
  req_role TEXT := COALESCE(meta->>'role', 'participant');
BEGIN
  -- Peran yang boleh dipilih saat daftar hanya participant / venue_admin.
  IF req_role NOT IN ('participant', 'venue_admin') THEN
    req_role := 'participant';
  END IF;

  INSERT INTO public.profiles (
    id, name, username, email, phone, role, approval_status,
    venue_name, venue_area, venue_phone, rating
  )
  VALUES (
    new.id,
    COALESCE(meta->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(meta->>'username', split_part(new.email, '@', 1)),
    new.email,
    meta->>'phone',
    req_role,
    CASE WHEN req_role = 'venue_admin' THEN 'pending' ELSE 'approved' END,
    meta->>'venue_name',
    meta->>'venue_area',
    meta->>'venue_phone',
    1400
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Cegah eskalasi hak akses: user tidak boleh mengubah `role`/`approval_status`
-- miliknya sendiri. Hanya super admin yang boleh.
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;
  NEW.role := OLD.role;
  NEW.approval_status := OLD.approval_status;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_profile_privileges_trg ON public.profiles;
CREATE TRIGGER protect_profile_privileges_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_privileges();

-- =====================================================================
-- 9. REALTIME (untuk live score & monitoring di fase berikutnya)
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;

-- =====================================================================
-- 10. SUPER ADMIN BENIH
-- Langkah: daftar akun "superadmin@poolscore.app" lewat aplikasi lebih dulu,
-- lalu jalankan baris di bawah ini, lalu login ulang.
-- =====================================================================
-- UPDATE public.profiles
--   SET role = 'super_admin', approval_status = 'approved'
--   WHERE email = 'superadmin@poolscore.app';
