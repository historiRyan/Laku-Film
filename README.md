# 🎬 LakuFilm - Nontren Bareng, Kamu Hosting Sendiri

**LakuFilm** adalah platform streaming video pribadi berbasis web yang dibangun dengan Next.js (App Router). Kamu bisa mengunggah film & series, mengelola kualitas video (360p/720p/1080p), chat antar user, toko/rental, dan masih banyak lagi. Data metadata & user tersimpan di **Upstash Redis**, sedangkan video & thumbnail di **Vercel Blob** — keduanya persist di Vercel.

> 🌐 **Live demo:** https://laku-film-1tg5.vercel.app

---

## 📸 Screenshot Beranda (Home)
Berikut adalah tampilan antarmuka utama dari LakuFilm:

![Screenshot Home](./public/github.png)
*Menampilkan daftar film & series lokal di samping saran film dari sumber eksternal (Watchmode).*

---

## ✨ Fitur Utama

- **🎬 Manajemen Video Lengkap:** Unggah film & series lewat `/upload` & `/upload-series`, dukungan **multi-kualitas** (360p/720p/1080p), thumbnail, rating, dan genre.
- **▶️ Player Multi-Kualitas:** Ganti resolusi 360p/720p/1080p langsung di player (`/play/[id]`).
- **🗑️ Penghapusan Berkas Otomatis:** Saat film/series/episode dihapus, file video & thumbnail di Blob ikut terhapus (tidak menghapus file yang masih dipakai entitas lain).
- **🔐 Autentikasi JWT + HttpOnly Cookie:** Login dengan `jose` (HS256), cookie `HttpOnly` + `SameSite=Lax` + `Secure` (produksi), sesi 7 hari. Password di-hash dengan `scrypt` (bukan plaintext).
- **👤 Peran User & Admin:** Admin bisa upload/delete via `/film-saya`; user biasa bisa daftar & login untuk menonton.
- **📋 Watchlist:** Simpan film ke daftar "nantinya ditonton" (tombol ⭐ di kartu film, halaman `/watchlist`, tersimpan per-user di Redis).
- **🔍 Pencarian:** Cari film/series lokal + eksternal (`/api/search`).
- **🌐 Rekomendasi Eksternal (Watchmode):** Saran film populer dari API Watchmode di beranda (butuh `WATCHMODE_API_KEY`, opsional).
- **📱 Desain Responsif + Dark/Light Mode:** Tailwind CSS, `shadcn/ui`, `next-themes`.
- **⚡ Dual-Mode Storage:** Otomatis pakai Upstash Redis + Vercel Blob di Vercel; fallback ke filesystem lokal saat `npm run dev`.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **UI & Styling** | `shadcn/ui`, Tailwind CSS 4, `tailwind-merge`, `clsx`, `cva` |
| **Storage (Vercel)** | Upstash Redis (metadata/user) + Vercel Blob (video/thumbnail) |
| **Storage (Lokal)** | Node.js `fs` (`lib/data-video.json`, `lib/users.json`) |
| **Upload** | Native `formData` multipart → Blob |
| **Ikon** | Lucide React |
| **Tema** | `next-themes` (Light/Dark) |
| **JWT** | `jose` (HS256) |
| **Password** | Node `crypto.scrypt` (salt + hash, timing-safe) |
| **Pengelola Paket** | `pnpm` |

---

## 🚀 Instalasi & Menjalankan di Komputer Lokal

1. **Clone repo:**
   ```bash
   git clone https://github.com/historiRyan/laku-film.git
   cd laku-film
   ```
2. **Pasang dependensi:** `pnpm install`
3. **Env lokal:** buat `.env.local`:
   ```bash
   JWT_SECRET=isi-string-acak
   ```
4. **Jalankan dev:** `pnpm dev` → buka http://localhost:3000
   - Mode lokal pakai `lib/users.json` (sudah ada admin `admin`/`admin`).

---

## 🚀 Deploy ke Vercel (Live: https://laku-film-1tg5.vercel.app)

### 1. Persiapan
- **Upstash Redis** (gratis): https://upstash.com → *Create Database* → salin **REST API URL** & **REST API Token**.
- **Vercel Blob**: Vercel dashboard → project → *Storage* → *Add Store* → *Blob* (token otomatis: `BLOB_READ_WRITE_TOKEN`).

### 2. Environment Variables (Settings → Environment Variables)
Isi **nilai langsung** (jangan pakai `@` di depan):
| Key | Value |
| :--- | :--- |
| `JWT_SECRET` | string acak (misal hasil `openssl rand -hex 32`) |
| `UPSTASH_REDIS_REST_URL` | dari Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | dari Upstash |
| `BLOB_READ_WRITE_TOKEN` | otomatis dari Blob store |
| `WATCHMODE_API_KEY` | opsional (rekomendasi film) |

Centang **Production + Preview + Development**, lalu **Redeploy**.

### 3. Seed Admin (login pertama)
Di Vercel, `users.json` lokal **tidak terbaca** (data di Redis kosong). Seed admin lewat script lokal:
```bash
export UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
export UPSTASH_REDIS_REST_TOKEN=xxxxx
# optional: SEED_ADMIN_USER=admin SEED_ADMIN_PASS=admin
node scripts/seed-admin.mjs
```
Setelah itu login di **/login** dengan `admin` / `admin`.

### 4. Catatan
- Mode lokal (`pnpm dev` tanpa env) tetap pakai filesystem.
- Upload video dibatasi body request Vercel (Hobby ~4.5MB, Pro ~25MB). Untuk file besar, naikkan plan atau pakai direct-to-Blob upload.

---

## 🤝 Kontribusi & Lisensi
Open source di bawah lisensi **MIT**.
