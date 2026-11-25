-- =====================================================================
-- PoolScore — Migrasi: Billing lanjutan (tarif default venue)
-- Jalankan di Supabase -> SQL Editor. AMAN & idempoten. Tidak menghapus data.
-- Prasyarat: supabase_migration_billing.sql sudah dijalankan.
-- =====================================================================

-- Tarif default tempat (Rupiah/jam): dipakai sebagai tarif awal setiap meja
-- baru yang dibuat pengelola. Catatan/nama pelanggan per sewa sudah tersedia
-- (kolom note di rental_sessions dari migrasi sebelumnya).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_rate_per_hour INTEGER;

-- =====================================================================
-- Selesai.
-- =====================================================================
