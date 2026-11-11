-- =====================================================================
-- PoolScore — Migrasi Fase 3: Meja per-tempat (venue)
-- Jalankan di Supabase -> SQL Editor.
-- AMAN: hanya menyentuh tabel `club_tables` (meja). Data akun (profiles),
-- pertandingan (matches), dan turnamen TIDAK tersentuh.
-- =====================================================================

-- 1. Ganti tabel meja lama (global) dengan versi per-pemilik (venue admin).
DROP TABLE IF EXISTS public.club_tables CASCADE;

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

-- 2. Keamanan baris (RLS)
ALTER TABLE public.club_tables ENABLE ROW LEVEL SECURITY;

-- Semua boleh melihat meja (untuk tampilan TV / penonton).
CREATE POLICY "club tables readable by all" ON public.club_tables
  FOR SELECT USING (true);

-- Pemilik (admin tempat) mengelola mejanya sendiri.
CREATE POLICY "owner manages own tables" ON public.club_tables
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Super admin mengelola semua meja.
CREATE POLICY "super admin manages all tables" ON public.club_tables
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 3. Realtime untuk live score meja
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_tables;
