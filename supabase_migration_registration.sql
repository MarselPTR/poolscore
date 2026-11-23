-- =====================================================================
-- PoolScore — Migrasi: Pendaftaran mandiri turnamen (Tahap 2)
-- Jalankan di Supabase -> SQL Editor. AMAN & idempoten. Tidak menghapus data.
-- Prasyarat: migrasi keamanan (#1-#4) & participants sudah dijalankan.
-- =====================================================================

-- 1. Kuota peserta untuk turnamen pendaftaran (status 'draft').
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS max_players INTEGER;

-- 2. Tabel pendaftaran: satu baris per pemain yang mendaftar ke satu turnamen.
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  UNIQUE (tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS tournament_registrations_tid_idx
  ON public.tournament_registrations (tournament_id);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Daftar pendaftar boleh dilihat semua user login (seperti lembar pendaftaran
-- turnamen publik — hanya nama, tanpa data pribadi).
DROP POLICY IF EXISTS "registrations readable by authenticated" ON public.tournament_registrations;
CREATE POLICY "registrations readable by authenticated" ON public.tournament_registrations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Peserta hanya boleh mendaftarkan DIRINYA SENDIRI, dan hanya ke turnamen yang
-- masih buka pendaftaran (status 'draft').
DROP POLICY IF EXISTS "user registers self to open tournament" ON public.tournament_registrations;
CREATE POLICY "user registers self to open tournament" ON public.tournament_registrations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id AND t.status = 'draft'
    )
  );

-- Yang boleh menghapus pendaftaran: pemain itu sendiri (batal), pemilik
-- turnamen (keluarkan), atau super admin.
DROP POLICY IF EXISTS "self or owner removes registration" ON public.tournament_registrations;
CREATE POLICY "self or owner removes registration" ON public.tournament_registrations
  FOR DELETE USING (
    user_id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id AND t.created_by = auth.uid()
    )
  );

-- =====================================================================
-- Selesai.
-- =====================================================================
