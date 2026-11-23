-- =====================================================================
-- PoolScore — Migrasi: Peserta turnamen berbasis akun (Tahap 1)
-- Jalankan di Supabase -> SQL Editor. AMAN & idempoten. Tidak menghapus data.
-- =====================================================================

-- 1. Simpan info akun tiap peserta (array {userId, name}) di turnamen.
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS participants JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Pencarian pemain yang AMAN untuk menambah peserta.
--    Mengembalikan HANYA id, nama, username (TANPA email/No. HP), jadi tidak
--    membuka kembali kebocoran data pribadi. Hanya untuk user terautentikasi.
CREATE OR REPLACE FUNCTION public.search_players(query text)
RETURNS TABLE (id uuid, name text, username text) AS $$
  SELECT id, name, username
  FROM public.profiles
  WHERE query <> ''
    AND (name ILIKE '%' || query || '%' OR username ILIKE '%' || query || '%')
  ORDER BY name
  LIMIT 20;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

REVOKE ALL ON FUNCTION public.search_players(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_players(text) TO authenticated;

-- =====================================================================
-- Selesai.
-- =====================================================================
