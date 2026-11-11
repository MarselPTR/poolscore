-- =====================================================================
-- PoolScore — Migrasi Fase 3: Turnamen per-tempat (venue)
-- Jalankan di Supabase -> SQL Editor (setelah migrasi meja).
-- AMAN: hanya menambah kolom & memperketat RLS pada `tournaments`.
-- Data turnamen yang ada tidak dihapus.
-- =====================================================================

-- 1. Kolom baru: nama tempat (denormalisasi untuk tampilan) & publik/tidak.
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Perketat hak tulis: hanya pemilik (admin pembuat) atau super admin.
--    Baca tetap publik (semua peran boleh melihat daftar turnamen).
DROP POLICY IF EXISTS "auth writes tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "tournaments readable by all" ON public.tournaments;

CREATE POLICY "tournaments readable by all" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "owner inserts tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "owner updates own tournaments" ON public.tournaments
  FOR UPDATE USING (auth.uid() = created_by OR public.is_super_admin())
  WITH CHECK (auth.uid() = created_by OR public.is_super_admin());

CREATE POLICY "owner deletes own tournaments" ON public.tournaments
  FOR DELETE USING (auth.uid() = created_by OR public.is_super_admin());
