# 🎬 LakuFilm - Nontren Bareng, Kamu Hosting Sendiri

**LakuFilm** adalah platform streaming video pribadi berbasis web yang dibangun dengan Next.js. Kamu bisa mengunggah film & series, mengelola kualitas video (360p/720p/1080p), serta menghapus berkas asli otomatis saat data dihapus. Proyek ini berjalan lokal tanpa database eksternal.

---

## 📸 Screenshot Beranda (Home)
Berikut adalah tampilan antarmuka utama dari LakuFilm:

![Screenshot Home](./public/github.png)
*Menampilkan daftar film & series lokal di samping saran film dari sumber eksternal.*

---

## ✨ Fitur Utama

- **Desain Responsif Modern:** Didukung Tailwind CSS & komponen `shadcn/ui` yang nyaman di desktop maupun mobile.
- **Navigasi Cepat & Intuitif:** Menggunakan App Router Next.js dengan navigasi *client-side* yang halus.
- **Manajemen Video Lengkap:** Unggah film & series, dukungan multi-kualitas video, thumbnail, rating, dan genre.
- **Penghapusan Berkas Otomatis:** Ketika sebuah film, series, atau episode dihapus, file video dan thumbnail yang bersesuaian di folder `public/uploads/` juga dihapus secara otomatis tanpa menghilangkan berkas yang masih dipakai entitas lain.
- **Ringan & Self-contained:** Tidak memerlukan server database eksternal. Semua data disimpan dalam file JSON lokal.
- **Autentikasi Pengguna (JWT + HttpOnly Cookie):** Autentikasi berbasis JSON Web Token yang ditandatangani dengan `jose` (algoritma HS256) dan disimpan di browser melalui cookie dengan properti `HttpOnly`, `SameSite=Lax`, dan `Secure` (produksi). Sesi dipertahankan selama 7 hari tanpa menyimpan data sensitif di `localStorage` atau `sessionStorage`.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js (App Router) |
| **UI & Styling** | React, `shadcn/ui`, Tailwind CSS, `tailwind-merge`, `clsx`, `cva` |
| **Data (Lokal)** | File JSON (`lib/data-video.json`, `lib/users.json`) via Node.js `fs` |
| **Upload Parsing** | `Formidable` & Multipart form handler |
| **Ikon** | Lucide React |
| **Tema** | `next-themes` (Light/Dark Mode) |
| **JWT** | `jose` (HS256 sign/verify) |
| **Pengelola Paket** | `pnpm` / `npm` |

---

## 🚀 Instalasi & Menjalankan di Komputer Lokal

1. **Pastikan Node.js sudah terpasang** (v18+ direkomendasikan).
2. **Clone repository ini** dan masuk ke direktori proyek:
   ```bash
   git clone https://github.com/historiRyan/laku-film.git
   cd laku-film
   ```
3. **Pasang dependensi:**
   ```bash
   pnpm install
   # atau jika menggunakan npm:
   npm install
   ```
4. **Konfigurasi Environment Variable (JWT):**
   Buat berkas `.env.local` di root proyek dan isi dengan secret key untuk JWT:
   ```bash
   echo "JWT_SECRET=nama-secret-key-anda" > .env.local
   ```
   > Secret ini dipakai untuk menandatangani dan memverifikasi token JWT. Pada produksi, gunakan nilai yang kuat dan unik.
5. **Jalankan server pengembangan:**
   ```bash
   pnpm dev
   # atau jika menggunakan npm:
   npm run dev
   ```
6. **Buka di browser:** Akses [http://localhost:3000](http://localhost:3000)
   - **Default Akun Admin:** Username: `admin`, Password: `admin` (Akun dapat dikelola di `lib/users.json`).
7. **Build untuk Produksi:**
   ```bash
   pnpm build && pnpm start
   ```

---

## 📁 Struktur Folder

```text
laku-film/
├── app/                        # App Router (Next.js 13+)
│   ├── api/                    # Route API (films, series, episodes, files)
│   │   ├── auth/               # Route API autentikasi (JWT + HttpOnly cookie)
│   │   │   ├── login/
│   │   │   │   └── route.ts    # Verifikasi kredensial, sign JWT, set cookie
│   │   │   ├── register/
│   │   │   │   └── route.ts    # Buat akun, sign JWT (opsional), set cookie
│   │   │   ├── logout/
│   │   │   │   └── route.ts    # Hapus cookie auth-token
│   │   │   └── me/
│   │   │       └── route.ts    # Baca & verify JWT, kembalikan data user
│   │   ├── films/              # Route CRUD + hapus file otomatis
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── series/             # Route CRUD + hapus file otomatis
│   │   │   └── [id]/
│   │   │       ├── episodes/
│   │   │       │   └── [episodeId]/
│   │   │       │       └── route.ts
│   │   │       └── route.ts
│   │   └── files/              # Handler upload (multipart + JSON I/O)
│   ├── film-saya/              # Halaman CRUD lokal
│   ├── film-viral/             # Halaman film viral
├── components/                 # Komponen UI Reusable
│   ├── ui/                     # Komponen dasar shadcn/ui
│   ├── auth-provider.tsx       # Konteks otentikasi (JWT cookie-based)
│   ├── auth-guard.tsx          # Wrapper proteksi rute (client-side)
│   ├── home-browser.tsx        # Grid browser film/series
│   ├── movie-card.tsx          # Kartu film
│   └── series-actions.tsx      # Aksi episode & series (edit/hapus)
├── lib/                        # Data film & series (lokal) + utilitas
│   ├── data-video.json         # Data film & series lokal
│   ├── jwt.ts                  # Utilitas JWT (sign/verify) dengan jose
│   ├── users.ts                # Server-side user CRUD (baca/tulis users.json)
│   ├── auth.ts                 # Server-side getCurrentUser() dari cookie
│   ├── types.ts                # Definisi tipe TypeScript
│   └── users.json              # Data pengguna (lokal)
├── public/                     # Aset statis (uploads, ikon, placeholder)
│   ├── github.png              # Gambar preview untuk README
│   └── uploads/                # Video & thumbnail hasil unggah
├── styles/                     # Global CSS (Tailwind directives)
├── .env.local                  # Environment variable (JWT_SECRET)
├── package.json                # Dependensi proyek
└── tsconfig.json               # Konfigurasi TypeScript
```

---

## ⚙️ Cara Kerja Penghapusan Berkas Saat Sebuah Film/Series Dihapus

Mekanisme ini diterapkan secara konsisten di: `DELETE` & `PATCH` pada endpoint API terkait.

1. **Membaca Data Lokal:** Membaca seluruh data lokal dari `lib/data-video.json`.
2. **Pengecekan Ketergantungan:** Menghitung sekumpulan nama berkas yang masih sedang dipakai oleh entitas yang tersisa (deterministik, agar tidak ada berkas yang terhapus secara tidak sengaja karena dipakai bersama).
3. **Penghapusan File Fisik:** Hanya menghapus berkas video (`videoFileName`, tiap entry di `videoFiles`) dan thumbnail (`thumbFileName`) yang memang **tidak lagi terpakai**.
4. **Memperbarui Database:** Memperbarui file JSON data lokal.

---

## 🔐 Alur Autentikasi JWT (HttpOnly Cookie)

Autentikasi menggunakan **JSON Web Token (JWT)** yang disimpan di cookie browser dengan properti `HttpOnly`, melindungi terhadap serangan XSS dan CSRF.

### Alur Login
1. Klien mengirimkan kredensial (`username`, `password`) ke `POST /api/auth/login`.
2. Server memverifikasi kredensial melalui `lib/users.ts` (membaca `lib/users.json`).
3. Jika valid, server menandatangani JWT menggunakan `jose` (algoritma HS256) dengan payload `{ username, name, role }`.
4. Server mengirimkan respons dengan header `Set-Cookie: auth-token=<jwt>; HttpOnly; SameSite=Lax; Secure` (Secure hanya di produksi).
5. Browser menyimpan cookie secara otomatis; klien tidak perlu mengelola token secara manual.

### Pelindungan Sesi
- Pada setiap render, `AuthProvider` memanggil `GET /api/auth/me`.
- Server membaca cookie `auth-token`, memverifikasinya dengan `jose`, dan mengembalikan data user.
- Jika token tidak valid atau kadaluarsa, cookie dihapus dan status `user` diset `null`.

### Logout
- Klien memanggil `POST /api/auth/logout`.
- Server mengirimkan cookie `auth-token` dengan `Max-Age=0` untuk menghapus sesi.

### Registrasi
- `POST /api/auth/register` membuat akun baru dan secara otomatis membuatkan JWT + cookie (kecuali untuk `registerAdmin` yang hanya membuat akun tanpa mengganti sesi).

---

---

## 🚀 Deploy ke Hosting Node (Railway / Render)

LakuFilm menyimpan video & data di **filesystem server** (`public/uploads/`, `lib/data-video.json`, `lib/users.json`), sehingga butuh hosting yang menjalankan **Node.js secara penuh** (bukan static host seperti Cloudflare Pages atau GitHub Pages). Rekomendasi: **Railway** atau **Render**.

### Railway (paling mudah)
1. Fork/connect repo ini ke Railway.
2. Railway otomatis deteksi `railway.json` (build `nixpacks`, start `npm run start`).
3. Di *Variables*, set:
   - `JWT_SECRET` → string acak panjang (wajib diubah).
   - `WATCHMODE_API_KEY` → opsional (rekomendasi film eksternal).
4. Deploy. Domain otomatis diberikan.

### Render
1. *New Web Service* → connect repo.
2. `render.yaml` sudah disediakan (plan free, Node 20).
3. Di *Environment*, isi `JWT_SECRET` & `WATCHMODE_API_KEY`.
4. Deploy.

> ⚠️ Catatan: file & data tersimpan di disk container. Di tier free yang auto-sleep atau saat redeploy, **data bisa reset** (sesuai sifat self-hosted). Untuk persistensi penuh, gunakan layanan berbayar atau pindahkan storage ke object storage (R2/S3).

---

## 🤝 Kontribusi & Lisensi

Berkontribusi sangat diterima di sini! Silakan buat *pull request* dan jelaskan perubahan yang diajukan. Proyek ini bersifat *open source* dan tersedia di bawah lisensi **MIT**.
