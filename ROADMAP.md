# PoolScore — Rencana Pengembangan & Catatan Diskusi

> Dokumen kerja internal. Merekam arah besar produk, keputusan yang sudah
> disepakati, temuan audit, pertanyaan yang masih terbuka, dan rencana
> bertahap. Dibuat 11 Nov 2026 untuk dilanjutkan 12 Nov 2026.

---

## 0. Status saat ini (sudah selesai)

- **Redesain UI menyeluruh** (gaya broadcast olahraga + utilitarian), dua tema
  (gelap/terang), font Barlow, semua layar diuji di desktop 1920/1366 & ponsel.
- **Tata letak desktop lebar diperbaiki** (beranda 2 kolom, riwayat kisi 2
  kolom, semua halaman sejajar header).
- **Bug modal hasil pertandingan diperbaiki** — dulu papan skor langsung loncat
  ke beranda saat selesai sehingga tombol Rematch/Bagikan/Simpan tak terjangkau.
  Sekarang modal hasil muncul dan tombolnya berfungsi.
- **Fase 1 selesai (12 Nov 2026)** — lihat §7:
  - #4 Foul: disimpan per-rack + **undo foul mengembalikan giliran** (teruji).
  - #3 **Break & run** kini tercatat & masuk statistik profil (teruji = 1).
  - #7 **Resume match** saat refresh (teruji).
  - #9 **PWA service worker** (vite-plugin-pwa, precache aset).
  - #11 **UI setelan baru**: ukuran angka skor, durasi tahan, volume, getaran,
    timer, wake lock; `defaultTargetSets` kini dipakai di Quick Match.
  - #13 **README** ditulis ulang. **QR jadi QR asli** (pustaka `qrcode`).
  - **BONUS**: diperbaiki **bug perhitungan statistik ganda** — `finalizeMatchStats`
    terpanggil 2× (saat menang + saat "Simpan dan selesai") sehingga stat dobel.
    Dulu tak terlihat karena modal hasil tak pernah muncul; terungkap setelah
    modal hasil diperbaiki.
- Semua perubahan **belum di-commit/push** (menunggu perintah).

---

## 1. Visi besar (arah baru produk)

PoolScore berubah dari **pencatat skor satu-perangkat (local-first)** menjadi
**platform multi-peran & multi-tempat (venue) berbasis akun**, dengan Supabase
sebagai sumber data utama. Hanya mode **Tamu** yang tetap jalan lokal.

### Peran pengguna (4 tingkat + 1 kondisional)

| Peran | Hak utama |
|---|---|
| **Tamu** | Hanya **mulai pertandingan** (tidak disimpan). Tidak bisa akses Riwayat, Turnamen, Klub. |
| **Peserta / user biasa** | Punya akun. **Riwayat pribadi**. Daftar turnamen (mandiri). Masuk peringkat. |
| **Wasit** (kondisional) | Role khusus yang **hanya aktif/berfungsi saat ada turnamen**. Bisa menginput skor pertandingan turnamen. |
| **Admin tempat billiard** | Akun milik satu tempat (mis. bernama "Amorty Billiard"). Mengelola **turnamen, meja (Klub), dan mendaftarkan akun peserta** di tempatnya. **Pendaftarannya harus disetujui Super Admin.** Halaman **Klub hanya muncul untuk peran ini.** |
| **Super Admin** | Mengelola **seluruh** website, termasuk **menyetujui** pendaftaran admin tempat. |

### Konsep tempat (venue)

- Setiap **tempat billiard = satu "venue"** (mis. Amorty Billiard di daerah A).
- Admin tempat terikat ke satu venue. Admin tempat A & B terpisah akun + data.
- **Meja milik per-venue**: admin mendaftarkan **berapa jumlah meja** di
  tempatnya (bukan 8 meja global), dengan **monitoring live score lengkap**.
- **Turnamen & meja dikelola per-venue** oleh admin tempatnya.

### Turnamen & peserta

- Turnamen bersifat **publik/global**. Halaman Turnamen menampilkan turnamen
  yang **terbuka untuk umum**.
- Peserta **harus punya akun PoolScore**. Pendaftaran peserta:
  - **mandiri** lewat halaman Turnamen, atau
  - **didaftarkan admin tempat** (termasuk pendaftaran **offline** → admin yang
    mendaftarkan).
- **Pencatat skor turnamen = ketiganya** (peserta, wasit, admin tempat) boleh
  input, lalu **otomatis tersinkron ke dashboard monitoring admin** pengelola
  turnamen tersebut. → butuh sinkronisasi realtime.

### Peringkat (ranking)

- **Global**, **khusus peserta turnamen**, **berbasis poin hasil turnamen**
  (menggantikan Elo-per-pertandingan yang sekarang).
- **Skema poin:** penyedia turnamen (admin) yang menentukan nilainya, tetapi
  sistem **mengonversinya ke persentase** agar **bobot tiap turnamen sama**.
  (Rumus normalisasi persisnya → lihat Pertanyaan Terbuka Q1.)

### Riwayat

- Disimpan **per-akun** (tiap pengguna beda-beda).
- **Pertandingan Tamu TIDAK disimpan** (tidak ke cloud, tidak ke peringkat).
- Peringkat & Turnamen tetap **global** (bukan per-akun).

---

## 2. Keputusan yang sudah disepakati (11 Nov 2026)

1. **Supabase**: dianggap **sudah dikonfigurasi** (perlu diverifikasi di hari-1
   bahwa `isSupabaseConfigured` bernilai true & tabel/RLS siap).
2. **Poin peringkat**: admin menentukan nilai → **dikonversi ke persentase**
   agar bobot antar-turnamen setara.
3. **Role Wasit**: dibuat, tetapi **hanya berfungsi saat ada turnamen**.
4. **Pencatat skor turnamen**: peserta + wasit + admin, **sinkron realtime** ke
   dashboard admin pengelola.
5. **Pertandingan Tamu**: **tidak disimpan**.
6. **Meja (Klub)**: **per-venue**; admin mendaftarkan jumlah meja + monitoring
   live score lengkap.
7. **Super Admin pertama**: dibuat sebagai **akun benih** manual (lihat §6).

---

## 3. Pertanyaan yang masih terbuka (bahas besok)

- **Q1 — Rumus normalisasi poin→persentase.** Contoh opsi: persentase =
  (poin pemain ÷ poin maksimum di turnamen itu) × 100, lalu peringkat global =
  rata-rata persentase seluruh turnamen yang diikuti. Perlu disepakati: pakai
  rata-rata, total, atau N turnamen terbaik? Apakah ada bobot per
  ukuran/tingkat turnamen?
- **Q2 — Identitas peserta.** Satu akun global dipakai lintas venue, ya? Saat
  admin "daftarkan peserta offline", apakah admin **membuat akun baru** untuk
  orang itu, atau menautkan ke akun yang sudah ada?
- **Q3 — Pertandingan kasual (non-turnamen) untuk user login.** Apakah kedua
  pemain harus punya akun, atau boleh nama bebas? Riwayat masuk ke akun siapa
  (pencatat skor)?
- **Q4 — Penugasan Wasit.** Siapa yang menetapkan seseorang jadi wasit di sebuah
  turnamen — admin tempat? Bagaimana alurnya?
- **Q5 — Isi dashboard monitoring admin.** Apa saja yang ditampilkan (meja live,
  skor turnamen berjalan, bagan, daftar peserta, antrean)?
- **Q6 — Pendaftaran venue/admin.** Data apa yang diisi saat daftar admin tempat
  (nama tempat, alamat/daerah, kontak)? Tampilan antrean persetujuan Super Admin
  seperti apa?
- **Q7 — Migrasi data lama.** Data lokal/Supabase lama (pemain nama-bebas,
  match, turnamen) mau diapakan — dibersihkan, atau dimigrasi?
- **Q8 — Matriks hak akses final** per peran × per halaman (draf di §5).

---

## 4. Temuan audit kode (bug & fitur belum sempurna)

> Hampir semua **sudah ada sejak sebelum redesain** (di `MatchContext`,
> `tournamentGenerator`, `supabaseService`). Sebagian akan **terserap/berubah**
> oleh visi baru (ditandai ⟶ BERUBAH).

### A. Bug (tidak bekerja semestinya)
1. **Link Live/QR penonton tak berfungsi lintas perangkat.** `?live=<id>` tak
   pernah dibaca; QR hanya pola hiasan (bukan QR asli); mode TV hanya antar-tab
   di perangkat sama. → terkait Fase 5.
2. **Skor meja Klub selalu 0–0 saat main.** `clubTables` tak diperbarui tiap
   rack. → ⟶ **BERUBAH** (jadi monitoring per-venue, Fase 3).
3. **Statistik "Break & Run" tak pernah tercatat.** `breakRunOuts` selalu 0;
   data break tak ditempel ke rack. Badge B&R tak pernah muncul.
4. **Foul tak tersimpan per-rack & Undo foul tak sempurna** (giliran tak
   dikembalikan saat undo foul/break).
5. **Double Elimination: seeding bisa salah** (pengisi slot placeholder keliru,
   match bisa "siap" dengan pemain placeholder).
6. **Round Robin mentok setelah fase grup** (playoff tak terisi dari klasemen).
7. **Pertandingan hilang saat refresh** (`resumeMatch` tak pernah dipanggil).

### B. Belum lengkap / menyesatkan
8. **Login Google tidak berfungsi** (tombol hanya munculkan toast "dalam
   pengembangan"; `loginWithGoogle` sebenarnya sudah ada). → Fase 5.
9. **Bukan PWA offline penuh** (ada manifest, **tanpa service worker**).
10. **Sinkronisasi cloud hanya sekali tarik** (tak subscribe realtime meski
    skema SQL mengaktifkannya). → prasyarat Fase 4/5.

### C. Minor / poles
11. **Setelan tersembunyi tanpa UI**: ukuran font papan skor, volume, getaran,
    durasi tahan, `defaultTargetSets` (bahkan tak dipakai).
12. **Elo multi-set kurang akurat** (pakai skor rack set terakhir). → ⟶
    **BERUBAH** (peringkat jadi berbasis poin turnamen, Fase 4).
13. **README** masih template Vite bawaan.

### D. Sudah diperbaiki
- Modal hasil pertandingan (lihat §0).

---

## 5. Draf matriks hak akses (untuk difinalkan — Q8)

| Halaman / Aksi | Tamu | Peserta | Wasit | Admin tempat | Super Admin |
|---|---|---|---|---|---|
| Mulai pertandingan (kasual) | ✅ (tak disimpan) | ✅ | ✅ | ✅ | ✅ |
| Riwayat (pribadi) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Turnamen (lihat/daftar) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Input skor turnamen | ❌ | ✅* | ✅* | ✅ | ✅ |
| Klub (meja + monitoring) | ❌ | ❌ | ❌ | ✅ (venue sendiri) | ✅ (semua) |
| Buat/kelola turnamen | ❌ | ❌ | ❌ | ✅ (venue sendiri) | ✅ |
| Daftarkan peserta | — | — | — | ✅ | ✅ |
| Setujui admin tempat | ❌ | ❌ | ❌ | ❌ | ✅ |
| Kelola semua data | ❌ | ❌ | ❌ | ❌ | ✅ |

\* hanya dalam konteks turnamen yang relevan.

---

## 6. Catatan teknis

- **Supabase wajib** untuk Fase 2+. RLS harus memisahkan data per-akun &
  per-venue. Tabel yang kemungkinan perlu: `profiles` (role, venue_id),
  `venues`, `tournaments` (venue_id, is_public), `tournament_participants`,
  `tournament_points`, `matches` (created_by, tournament_id), `tables`
  (venue_id), `ranking_points`.
- **Super Admin benih (rekomendasi):** tambah kolom `role` pada `profiles`
  dengan nilai `super_admin`; set satu akun secara manual lewat SQL di Supabase
  (`UPDATE profiles SET role='super_admin' WHERE email='...'`). Role diverifikasi
  di sisi server (RLS), bukan hanya di UI.
- **Realtime** diperlukan untuk: input skor turnamen multi-sumber → dashboard
  admin, dan nonton live lintas perangkat (#1, #4-tournament).
- **QR asli**: pakai pustaka QR ringan; link mengarah ke halaman tonton yang
  membaca `?live=<id>` / `/t/<tournament>`.

---

## 7. Rencana bertahap (master list)

Dikerjakan **berurutan per fase** agar tiap tahap bisa diuji & di-rollback.
"Sekaligus satu commit raksasa" dihindari.

| Fase | Isi | Prasyarat |
|---|---|---|
| **0. Prasyarat backend** | Verifikasi Supabase aktif; siapkan tabel + RLS + akun Super Admin benih | — |
| **1. Perbaikan cepat (independen)** | #4 foul/undo, #3 break & run, #7 resume match, #9 PWA/service worker, #11 setelan tersembunyi, #13 README, **QR jadi QR asli** | — |
| **2. Sistem akun & peran** | 4 peran + wasit kondisional, pendaftaran + approval Super Admin, batasan Tamu, **riwayat per-akun**, navigasi berbasis peran (Klub khusus admin) | Fase 0 |
| **3. Multi-tempat (venue)** | Entitas venue, admin terikat venue, **meja per-venue** + monitoring live (menyerap #2), turnamen per-venue | Fase 2 |
| **4. Turnamen publik & peringkat poin** | Turnamen terbuka umum, daftar mandiri/oleh admin, peserta = akun, **peringkat poin→persentase** (menggantikan #12), input skor multi-sumber → dashboard admin, perbaikan bracket (#5, #6) | Fase 3 |
| **5. Live & integrasi** | Nonton live lintas perangkat (#1), sinkron realtime (#10), Login Google (#8) | Supabase + OAuth |

**Langkah pertama besok:** jawab Q1 (rumus poin) & Q2 (identitas peserta),
verifikasi Supabase, lalu mulai Fase 0 → Fase 1.

---

## 8. Hal yang perlu diputuskan sebelum ngoding tiap fase

- Fase 1 aman dikerjakan kapan saja (tidak tergantung visi baru), **kecuali** #2
  (skor klub) & #12 (Elo) yang sengaja ditunda karena akan berubah di Fase 3/4.
- Jangan commit perubahan redesain + fitur baru dalam satu commit; pisahkan.
- Konfirmasi dulu: apakah data Supabase lama mau dibersihkan (Q7). → **Ya, dibersihkan.**

---

## 11. Fase 4 (berjalan) — Peringkat poin & bagan benar

Inti SELESAI & tervalidasi lewat simulasi (12 Nov 2026). **Tidak perlu migrasi SQL baru.**

- ✅ **Perbaikan logika bagan** (#5 double-elim, #6 round-robin playoff):
  modul murni `lib/tournamentProgress.ts` — penempatan slot dihitung dari
  struktur (bukan tebak teks), seeding playoff round-robin dari klasemen,
  deteksi juara/runner-up. **Teruji**: semua format (single/double/round-robin)
  pada 4/8/16/32 pemain tuntas dengan satu juara, tanpa slot placeholder.
- ✅ **Peringkat berbasis poin → persentase** (`lib/ranking.ts`): poin dari
  hasil turnamen (menang + bonus juara/runner-up), **dinormalkan ke % per
  turnamen** (bobot setara), peringkat global = rata-rata %. Halaman Peringkat
  ditulis ulang (menggantikan Elo kasual); modul profil/H2H Elo lama dihapus.
- ✅ `MatchContext` memakai `applyMatchResult` (menggantikan advancement lama
  yang buggy).

### Catatan skema poin
Saat ini pakai skema default tetap (menang=10, juara=50, runner-up=25). Opsi
**admin menentukan poin sendiri** = refinement berikutnya (butuh kolom
`points_scheme` + UI).

### Sisa Fase 4 (belum — paling besar, perlu keputusan)
- **Peserta = akun** (registrasi mandiri / oleh admin, profil terkelola) —
  turnamen masih berbasis nama bebas; peringkat memakai nama.
- **Penugasan Wasit** per-turnamen + **input skor multi-sumber** (peserta/wasit/
  admin) tersinkron realtime ke **dashboard monitoring admin**.

---

## 10. Fase 3 (berjalan) — Kelola meja per-tempat

Kode sisi aplikasi untuk **kelola meja** SELESAI (12 Nov 2026). Butuh migrasi SQL.

- ✅ Meja jadi **milik per-tempat** (`club_tables.owner_id`); admin hanya lihat &
  kelola mejanya sendiri; super admin memantau semua; RLS per pemilik.
- ✅ **Auto-buat 4 meja** untuk admin tempat baru; tombol **"Tambah meja"**,
  **"Atur jumlah"** sekaligus, **rename** inline, **hapus** (meja non-aktif).
- ✅ **Skor live meja** diperbarui ke Supabase saat match berjalan (menyelesaikan
  audit #2); meja otomatis FREE saat match selesai.
- ✅ Match menyimpan `tableId`/`tableLabel` (menggantikan `tableNumber`); meja tak
  lagi di-cache lokal (Dexie v2 menghapus store `clubTables`).
- ⏳ Verifikasi runtime menunggu migrasi dijalankan.

**Turnamen per-tempat (SELESAI 12 Nov 2026):**
- ✅ Turnamen dimiliki pembuat (`created_by`) + `venue_name`; hanya **venue_admin
  / super_admin** yang bisa **buat / hapus / jalankan match**; peserta & lainnya
  **hanya melihat** (read-only), termasuk bagan.
- ✅ Daftar turnamen dimuat dari Supabase (publik) agar semua peran melihat
  turnamen yang terbuka; kartu menampilkan nama tempat.
- ✅ RLS: baca publik, tulis hanya pemilik/super admin.

### Langkah wajib di Supabase (dijalankan pemilik — berurutan)
1. `supabase_migration_fase3_tables.sql` — meja per-tempat. **AMAN** (hanya meja).
2. `supabase_migration_fase3_tournaments.sql` — turnamen per-tempat. **AMAN**
   (hanya menambah kolom + RLS pada `tournaments`).

### Sisa Fase 3 / Fase 4 (belum)
- Pendaftaran peserta oleh admin (akun terkelola), penugasan Wasit, input skor
  turnamen multi-sumber → dashboard admin, peringkat berbasis poin.

---

## 9. Spesifikasi Fase 2 — Sistem akun & peran (FINAL)

Disepakati 12 Nov 2026. **Kode sisi aplikasi SELESAI & teruji (alur Tamu).**
Menunggu langkah Supabase dari pemilik (lihat "Langkah wajib di Supabase").

### Status implementasi (12 Nov 2026)
- ✅ Skema `supabase_schema.sql` ditulis ulang (peran, approval, `created_by`,
  RLS per peran, pembersihan data lama, trigger, seed super admin).
- ✅ `AuthContext`: 3 peran + guest; fallback login lokal dihapus; role &
  approval diambil dari `profiles`; register membawa info tempat.
- ✅ `AuthView`: daftar sebagai Peserta / Pengelola tempat (+ field tempat).
- ✅ `PendingApprovalScreen` untuk venue_admin belum disetujui.
- ✅ Navigasi berbasis peran (`lib/roles.ts`, Header, BottomNav) — Tamu hanya
  Beranda + Peringkat (teruji).
- ✅ Riwayat per-akun (`created_by`); pertandingan Tamu tidak disimpan (teruji:
  IndexedDB = 0).
- ✅ `SuperAdminPanel` (setujui/tolak pengelola tempat).
- ⏳ Verifikasi runtime untuk akun login (peran, approval, riwayat lintas
  perangkat) menunggu skema dijalankan di Supabase.

### Langkah wajib di Supabase (dijalankan pemilik)
1. Supabase → **SQL Editor** → tempel & jalankan seluruh isi
   `supabase_schema.sql`. **Peringatan: menghapus data lama** (disepakati).
2. Di aplikasi, **daftar akun** `superadmin@poolscore.app` (peran: Peserta).
3. Di SQL Editor, jalankan baris seed (ada di bagian paling bawah skema):
   `UPDATE public.profiles SET role='super_admin', approval_status='approved' WHERE email='superadmin@poolscore.app';`
4. Login ulang akun itu → tab **Panel** muncul.

### Belum dikerjakan (lanjut ke fase berikutnya)
- Pendaftaran peserta oleh admin (offline) → Fase 3/4.
- Peran Wasit (penugasan per-turnamen) → Fase 4.

---

### Spesifikasi detail (arsip keputusan)

### Keputusan final
1. **Wasit = penugasan per-turnamen**, bukan peran akun global.
2. **Peran akun global: 3** — `participant` (default), `venue_admin`, `super_admin`.
3. **Pilihan saat daftar: 2** — *Peserta* (langsung aktif) atau *Pengelola tempat*
   (status `pending` → tunggu approval Super Admin). Hapus pilihan lama
   (Pemain/Wasit/Pengelola Club).
4. **Super Admin benih**: akun dummy **`superadmin@poolscore.app`** (website belum
   publish). Dibuat lewat daftar biasa di app, lalu dinaikkan via SQL manual.
5. **Tamu**: hanya **Beranda** (mulai pertandingan, tak disimpan) + **Peringkat**
   (lihat sebagai etalase). Tidak bisa Riwayat, Turnamen, Klub.
6. **Pertandingan kasual**: boleh **nama bebas** (tak semua pemain harus punya
   akun), disimpan ke **riwayat pencatatnya** (`created_by`). Akun wajib hanya
   untuk peserta turnamen (Fase 4).
7. **Login lokal palsu dinonaktifkan** — akun asli wajib Supabase; hanya Tamu lokal.
8. **Data Supabase lama dibersihkan** sebelum skema baru dipasang.
9. **Pendaftaran peserta oleh admin (offline)** → **ditunda ke Fase 3/4** (butuh
   mekanisme profil terkelola / server function). Fase 2 = pendaftaran mandiri saja.

### Navigasi berbasis peran
| Peran | Tab |
|---|---|
| Tamu | Beranda, Peringkat (lihat) |
| Peserta | Beranda, Riwayat, Turnamen, Peringkat |
| Admin tempat | + Klub + Dashboard admin |
| Super Admin | semua + Panel approval |

### Perubahan skema Supabase (akan ditulis ke `supabase_schema.sql`)
- `profiles`: tambah `role` (`participant`|`venue_admin`|`super_admin`, default
  `participant`), `approval_status` (`approved`|`pending`|`rejected`), dan info
  tempat untuk admin (`venue_name`, `venue_area`, `venue_phone`).
- `matches`: tambah `created_by` (uuid → auth.users).
- **RLS per peran**: user baca match miliknya sendiri; super_admin baca semua &
  ubah `approval_status`; peringkat/turnamen tetap publik (read).
- **Bersihkan** data lama (players/matches/tournaments/club_tables).
- **Seed Super Admin (dijalankan user di Supabase):**
  `UPDATE public.profiles SET role='super_admin', approval_status='approved' WHERE email='superadmin@poolscore.app';`

### Perubahan aplikasi
- `AuthContext`: hapus fallback login/register lokal (wajib Supabase); ambil
  `role` + `approval_status` dari `profiles`; `UserProfile` memuat role baru.
- `AuthView`: selektor peran → *Peserta* / *Pengelola tempat* (+ field nama
  tempat/daerah/kontak bila admin). Hapus 3 peran lama.
- Layar **"menunggu persetujuan"** untuk venue_admin `pending`.
- `Header`/`BottomNav`/`App`: tab tampil sesuai peran; Tamu & peran tak berhak
  tak bisa buka tab terlarang.
- **Riwayat** diambil dari Supabase difilter `created_by`. Tamu: tak ada riwayat,
  match tak disimpan ke cloud.
- Simpan `created_by` saat finalisasi match (bukan untuk Tamu).
- **Panel Super Admin**: daftar venue_admin `pending` → setujui / tolak.
- **Peringkat** tetap pakai data saat ini dulu (jadi berbasis poin di Fase 4);
  bisa dilihat Tamu.

### Catatan
- Peran **diverifikasi di sisi server (RLS)**, bukan hanya disembunyikan di UI.
- Super Admin benih: user daftar `superadmin@poolscore.app` di app → jalankan SQL
  seed di atas → login ulang.
