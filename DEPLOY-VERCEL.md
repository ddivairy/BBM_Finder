# Deploy BBM Finder ke Vercel

Panduan ini memakai dua project Vercel dari repository yang sama:

- Backend Express, root directory `backend`
- Frontend Vite, root directory `frontend`

Frontend memanggil URL backend melalui `VITE_API_URL`. Deploy backend lebih dulu agar URL-nya bisa dipasang ke project frontend.

## 1. Siapkan database

Backend membutuhkan MySQL/TiDB yang dapat diakses dari internet dan menerima koneksi dari Vercel. Gunakan host, port, username, password, dan nama database dari penyedia database.

Siapkan skema aplikasi sebelum deploy. Untuk database baru, gunakan `BBM-Finder.sql` hanya setelah memeriksa isinya: file itu menjalankan `DROP DATABASE IF EXISTS BBM_Finder` dan akan menghapus database beserta datanya. Jangan jalankan file itu terhadap database yang sudah berisi data.

Untuk database yang sudah ada, periksa tabel dan kolomnya terlebih dahulu, lalu jalankan migrasi yang memang belum diterapkan:

- `DB-USER.sql` untuk tabel user pada database baru.
- `DB-USER-VERIFIKASI.sql` jika tabel `User` lama belum memiliki `status_verifikasi`.
- `DB-LOKASI-UPGRADE.sql` jika tabel `lokasi` belum memiliki kolom pengajuan dan status persetujuan.
- `DB-LAPORAN.sql` untuk tabel laporan dan like laporan.
- `DB-INFO-PENGECER.sql` untuk tabel komunitas pengecer, love, dan dislike.

Jalankan migrasi `ALTER TABLE` satu kali saja. Backend menjalankan bootstrap admin saat request pertama tiba, tetapi tidak menjalankan migrasi skema otomatis pada Vercel. Akun database harus dapat membaca dan menulis tabel aplikasi.

## 2. Deploy backend

1. Di Vercel pilih **Add New → Project** dan import repository ini.
2. Atur **Root Directory** menjadi `backend`.
3. Framework preset dapat dideteksi sebagai Express. Entry point `index.mjs` mengekspor aplikasi Express untuk Vercel Functions.
4. Tambahkan environment variables berikut di **Settings → Environment Variables** untuk Production (dan Preview jika digunakan):

   | Variable | Nilai |
   | --- | --- |
   | `DB_HOST` | Host database |
   | `DB_PORT` | Port database, misalnya `4000` atau `3306` |
   | `DB_USER` | Username database |
   | `DB_PASSWORD` | Password database |
   | `DB_NAME` | Nama database, misalnya `BBM_Finder` |
   | `ADMIN_EMAIL` | Email akun bootstrap admin |
   | `ADMIN_PASSWORD` | Password kuat dan unik untuk admin |

5. Deploy. Catat domain Production backend, misalnya `https://bbm-finder-api.vercel.app`.
6. Buka domain backend. Halaman admin tersedia di `/`; endpoint API tersedia di bawah `/api`.

Backend mempertahankan koneksi pool MySQL per instance Function. Tidak ada proses server atau timer keep-alive yang perlu berjalan di luar request. Di Vercel, bootstrap admin memerlukan kedua variable `ADMIN_EMAIL` dan `ADMIN_PASSWORD`; kredensial default lokal tidak digunakan.

## 3. Deploy frontend

1. Buat project Vercel baru dari repository yang sama.
2. Atur **Root Directory** menjadi `frontend`.
3. Framework preset: **Vite**. Build command `npm run build`; output directory `dist`.
4. Tambahkan environment variable berikut untuk Production dan Preview yang dipakai:

   ```text
   VITE_API_URL=https://bbm-finder-api.vercel.app/api
   ```

   Ganti domain dengan domain backend yang sebenarnya. Nilai ini harus diakhiri `/api`.

5. Deploy ulang frontend setiap kali nilai `VITE_API_URL` berubah karena Vite memasukkan nilainya saat build.

## 4. Uji komunikasi

1. Buka `https://YOUR-BACKEND.vercel.app/api/lokasi`. Respons yang diharapkan adalah JSON daftar lokasi, termasuk `[]` bila belum ada lokasi yang disetujui.
2. Buka frontend Production dan coba daftar lokasi, login, laporan, serta komunitas.
3. Buka `https://YOUR-BACKEND.vercel.app/` untuk halaman admin. Login menggunakan akun admin dari environment `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
4. Jika frontend menampilkan error jaringan/CORS, periksa bahwa `VITE_API_URL` menunjuk ke domain backend yang benar dan deploy ulang frontend.
5. Jika API mengembalikan 500, buka **Vercel → backend project → Logs**. Pastikan variabel database benar, database mengizinkan koneksi dari deployment, dan semua migrasi SQL yang diperlukan sudah diterapkan.

## Pengembangan lokal

Salin `backend/.env.example` menjadi `backend/.env`, isi variabel database dan admin. Salin `frontend/.env.example` menjadi `frontend/.env.local` bila ingin mengganti URL lokal. File `.env` tidak boleh di-commit.

Jalankan backend dari direktori `backend` dengan `npm run dev`, lalu frontend dari direktori `frontend` dengan `npm run dev`.

## Dokumentasi Vercel

- [Express di Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Root Directory untuk monorepo](https://vercel.com/docs/monorepos)
