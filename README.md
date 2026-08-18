# IMPROVEHUB Finance & Tax App — Panduan Setup (Tahap 1)

Ini adalah **Tahap 1** dari aplikasi: fondasi sistem sudah jalan (login, dashboard,
switcher 3 PT / Group, input pemasukan & pengeluaran, laporan Neraca & Laba Rugi
otomatis). Modul Perpajakan, Aset Tetap, Anggaran, dan lainnya masih berupa
halaman "segera hadir" — akan menyusul di tahap berikutnya.

Anda tidak perlu paham coding untuk langkah-langkah di bawah ini. Ikuti urutan:
**Supabase → GitHub → Cloudflare**.

---

## Langkah 1 — Buat Project di Supabase (database & login)

1. Buka [supabase.com](https://supabase.com) → daftar/masuk (bisa pakai akun Google).
2. Klik **New Project**.
   - Nama: `improvehub-finance`
   - Database Password: buat password kuat, **simpan di tempat aman**.
   - Region: pilih **Southeast Asia (Singapore)** — paling dekat dengan Indonesia.
3. Tunggu ± 2 menit sampai project selesai dibuat.
4. Di sidebar kiri, klik **SQL Editor** → **New query**.
5. Buka file `supabase/schema.sql` dari folder project ini, salin **semua isinya**,
   tempel ke SQL Editor, lalu klik **Run**. Ini akan membuat semua tabel, 3 PT Anda,
   akun akuntansi dasar, dan aturan keamanan otomatis.
6. Masih di Supabase, klik ikon **Settings (gerigi)** → **API**.
   - Salin **Project URL** → ini nilai untuk `VITE_SUPABASE_URL`
   - Salin **anon public key** → ini nilai untuk `VITE_SUPABASE_ANON_KEY`
   - ⚠️ Jangan pernah salin/pakai **service_role key** di aplikasi frontend.

### Buat akun login pertama Anda (sebagai Owner)
1. Di Supabase, sidebar kiri → **Authentication** → **Users** → **Add user** →
   **Create new user**. Isi email & password Anda sendiri, centang "Auto Confirm User".
2. Buka **SQL Editor** lagi, jalankan query berikut (ganti `EMAIL_ANDA`):
   ```sql
   insert into user_profiles (id, full_name, role)
   select id, 'Owner', 'owner' from auth.users where email = 'EMAIL_ANDA'
   on conflict (id) do update set role = 'owner';
   ```
   Ini menjadikan akun Anda sebagai **Owner** — akses penuh ke semua 3 PT.

---

## Langkah 2 — Unggah kode ke GitHub

1. Buka [github.com](https://github.com) → masuk/daftar.
2. Klik **New repository**. Nama: `improvehub-finance-app`. Pilih **Private**
   (karena ini data keuangan perusahaan). Klik **Create repository**.
3. Di komputer Anda, buka folder project ini di terminal, lalu jalankan:
   ```bash
   git init
   git add .
   git commit -m "Tahap 1: fondasi aplikasi"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/improvehub-finance-app.git
   git push -u origin main
   ```
   (Ganti `USERNAME_ANDA` sesuai akun GitHub Anda. Jika diminta login, GitHub akan
   memandu membuat **Personal Access Token** sebagai pengganti password.)

---

## Langkah 3 — Hubungkan ke Cloudflare Pages (hosting)

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → masuk/daftar.
2. Sidebar kiri → **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git**.
3. Pilih repo `improvehub-finance-app` yang tadi dibuat, klik **Begin setup**.
4. Isi konfigurasi build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Klik **Environment variables** → tambahkan 2 variabel (nilai dari Langkah 1):
   - `VITE_SUPABASE_URL` = Project URL Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = anon public key Supabase Anda
6. Klik **Save and Deploy**. Tunggu ± 1–2 menit — Cloudflare akan memberi Anda
   alamat seperti `improvehub-finance-app.pages.dev`.
7. Setelah ini, **setiap kali Anda push perubahan ke GitHub**, Cloudflare otomatis
   build & deploy ulang — Anda tidak perlu upload manual lagi.

---

## Menjalankan di komputer sendiri (opsional, untuk testing sebelum deploy)

```bash
npm install
cp .env.example .env      # lalu isi 2 nilai Supabase di file .env
npm run dev                # buka http://localhost:5173
```

---

## Struktur Data Penting

- **3 PT sudah otomatis dibuat** oleh `schema.sql`: PT. Sumber Pengembangan Karya,
  PT. FYI Psychology Indonesia, I-Global — semuanya dengan alamat kantor yang sama
  dan **NPWP placeholder** (`00.000.000.0-000.000`).
- **Cara ganti NPWP asli:** untuk saat ini lewat Supabase → Table Editor → tabel
  `entities` → edit langsung. Menu "Profil Perusahaan" di dalam web untuk mengedit
  ini akan dibangun di tahap berikutnya.
- Setiap kali Anda input pemasukan/pengeluaran di web, sistem **otomatis membuat
  jurnal double-entry di belakang layar** — Anda tidak perlu paham debit/kredit.

---

## Rencana Tahap Berikutnya

Modul yang masih berupa "segera hadir" di aplikasi saat ini akan dibangun bertahap:
1. Modul Perpajakan lengkap (PPh 21, PPh 23/26, PPN, PPh Badan, Lapor Pajak + export PDF/Excel kop surat)
2. Aset Tetap & Penyusutan otomatis
3. Anggaran & Realisasi
4. Laporan Konsolidasi 3 PT (dengan eliminasi antar-entitas)
5. Manajemen Pengguna & Role, Pengaturan
6. PWA install prompt (Android & iOS)

Beri tahu saya kapan Anda siap lanjut ke modul berikutnya.
