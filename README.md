# PoolScore

Papan skor biliar untuk 8-Ball, 9-Ball, 10-Ball, dan Straight Pool — mencatat
skor per rack & set, turnamen (single/double elimination, round robin),
manajemen meja klub, dan tampilan TV untuk penonton.

Dibangun dengan **React + TypeScript + Vite**, **Tailwind CSS**, penyimpanan
lokal **Dexie (IndexedDB)**, dan sinkronisasi opsional ke **Supabase**.

## Menjalankan secara lokal

```bash
npm install
npm run dev        # mode pengembangan
npm run build      # build produksi (tsc + vite)
npm run preview    # pratinjau hasil build
npm run lint       # oxlint
```

## Konfigurasi Supabase (opsional)

Salin `.env.example` menjadi `.env`, lalu isi dari **Project Settings → API** di
dashboard Supabase Anda:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Tanpa konfigurasi ini, aplikasi tetap berjalan penuh secara lokal (offline-first);
sinkronisasi cloud, akun, dan autentikasi akan nonaktif. Skema database ada di
[`supabase_schema.sql`](supabase_schema.sql).

## Fitur utama

- **Papan skor** per rack & set, aturan break (Winner/Alternate/Loser), pencatatan
  foul & break, timer, serta mode anti-sentuh (tahan / ketuk dua kali / sekali).
- **Turnamen** single elimination, double elimination, dan round robin.
- **Klub** multi-meja dengan status langsung.
- **Peringkat** pemain dan **riwayat** pertandingan.
- **Tampilan TV** untuk penonton, berbagi hasil, dan **PWA** (installable).
- Dua tema: **gelap** (default) dan **terang**.

## Peta jalan pengembangan

Arah pengembangan besar (platform multi-peran & multi-tempat) dan daftar
perbaikan terdokumentasi di [`ROADMAP.md`](ROADMAP.md).
