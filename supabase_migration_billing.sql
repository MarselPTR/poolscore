-- =====================================================================
-- PoolScore — Migrasi: Billing sewa meja
-- Jalankan di Supabase -> SQL Editor. AMAN & idempoten. Tidak menghapus data.
-- Prasyarat: migrasi keamanan (#1-#4) sudah dijalankan (butuh can_manage_venue
-- & is_super_admin).
-- =====================================================================

-- 1. Tarif sewa per jam (Rupiah) per meja. Null = pakai tarif bawaan di aplikasi.
ALTER TABLE public.club_tables
  ADD COLUMN IF NOT EXISTS rate_per_hour INTEGER;

-- 2. Sesi sewa: satu baris per sesi sewa meja (billing). Berjalan terpisah dari
--    pertandingan — meja bisa disewa dengan atau tanpa match aktif.
CREATE TABLE IF NOT EXISTS public.rental_sessions (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_id TEXT NOT NULL REFERENCES public.club_tables(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  rate_per_hour INTEGER NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),
  total_cost INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rental_sessions_owner_idx
  ON public.rental_sessions (owner_id);
CREATE INDEX IF NOT EXISTS rental_sessions_owner_status_idx
  ON public.rental_sessions (owner_id, status);

ALTER TABLE public.rental_sessions ENABLE ROW LEVEL SECURITY;

-- Data keuangan: HANYA pemilik meja (admin tempat) & super admin yang boleh
-- baca/tulis. Tidak dibuka publik.
DROP POLICY IF EXISTS "owner manages own rentals" ON public.rental_sessions;
CREATE POLICY "owner manages own rentals" ON public.rental_sessions
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id AND public.can_manage_venue());

DROP POLICY IF EXISTS "super admin manages all rentals" ON public.rental_sessions;
CREATE POLICY "super admin manages all rentals" ON public.rental_sessions
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- =====================================================================
-- Selesai.
-- =====================================================================
