-- =====================================================================
-- PoolScore — Migrasi KEAMANAN (perbaikan #1–#4)
-- Jalankan di Supabase -> SQL Editor. AMAN & idempoten (boleh diulang).
-- Tidak menghapus data apa pun; hanya memperketat RLS + menambah fungsi.
-- =====================================================================

-- Pastikan helper super admin ada (dari skema utama).
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================================
-- #1 — CEGAH ESKALASI HAK AKSES
-- User tidak boleh mengubah `role` atau `approval_status` miliknya sendiri.
-- Hanya super admin yang boleh. Perubahan ilegal dikembalikan diam-diam.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_super_admin() THEN
    RETURN NEW; -- super admin boleh mengubah peran/persetujuan siapa pun
  END IF;
  -- Non-super-admin: paksa role & approval_status tetap seperti semula.
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
-- #2 — TUTUP KEBOCORAN DATA PRIBADI (email & No. HP)
-- Profil tidak lagi bisa dibaca publik. Hanya pemilik + super admin.
-- (Kebijakan "user manages own profile" & "super admin manages all profiles"
--  yang FOR ALL tetap memberi akses baca ke pemilik/super admin.)
-- =====================================================================
DROP POLICY IF EXISTS "profiles readable by all" ON public.profiles;

-- Login via username/nama/HP butuh menemukan email SEBELUM user terautentikasi.
-- Dilakukan lewat fungsi server yang hanya mengembalikan 1 email yang cocok,
-- tanpa membuka seluruh tabel profil.
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
-- #3 — LINDUNGI TABEL `players` (peringkat/rating)
-- Sebelumnya: user login mana pun bisa INSERT/UPDATE/DELETE baris siapa pun.
-- Sekarang: klien hanya boleh INSERT & UPDATE (untuk sinkron hasil match),
-- TIDAK boleh DELETE. Hapus hanya oleh super admin.
-- =====================================================================
DROP POLICY IF EXISTS "auth writes players" ON public.players;

CREATE POLICY "auth inserts players" ON public.players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth updates players" ON public.players
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "super admin manages players" ON public.players
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- =====================================================================
-- #4 (+ perkuat #5) — TEGAKKAN PERAN & PERSETUJUAN DI SERVER
-- Hanya admin tempat yang SUDAH DISETUJUI (atau super admin) yang boleh
-- membuat turnamen & meja. Persetujuan super admin tidak lagi sekadar UI.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.can_manage_venue()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND approval_status = 'approved'
      AND role IN ('venue_admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Turnamen: pembuatan butuh peran admin yang disetujui.
DROP POLICY IF EXISTS "owner inserts tournaments" ON public.tournaments;
CREATE POLICY "owner inserts tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (auth.uid() = created_by AND public.can_manage_venue());

-- Meja: pembuatan/perubahan butuh peran admin yang disetujui.
DROP POLICY IF EXISTS "owner manages own tables" ON public.club_tables;
CREATE POLICY "owner manages own tables" ON public.club_tables
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id AND public.can_manage_venue());

-- =====================================================================
-- Selesai. Setelah dijalankan, login via email/username/HP tetap bekerja,
-- tetapi eskalasi peran, scraping PII, perusakan `players`, dan bypass
-- persetujuan admin sudah ditutup.
-- =====================================================================
