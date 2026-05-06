# EcoLoop

> **Platform Ekosistem Digital Tiga Sisi untuk Pemulihan Rantai Nilai E-Waste Indonesia**

Limbah elektronik tidak hilang — kami buatkan jalannya pulang. EcoLoop menghubungkan masyarakat, aggregator komunitas, dan recycler bersertifikat KLHK dalam satu rantai pengelolaan yang dapat diaudit.

---

## Coba langsung

| | |
|---|---|
| **Aplikasi (Frontend)** | https://ecoloop-lovat.vercel.app/ |
| **API (Backend)** | https://ecoloop-api.up.railway.app/api/health |
| **Repositori kode** | [github.com/poggymacello/ecoloop](https://github.com/poggymacello/ecoloop) |

> Ganti URL di atas setelah deploy selesai.

### Akun demo siap pakai

Klik tombol akun di halaman login — kredensial otomatis terisi.

| Peran | Email | Sandi |
|---|---|---|
| Masyarakat | `demo.user@ecoloop.id` | `password123` |
| Aggregator | `demo.aggregator@ecoloop.id` | `password123` |
| Recycler bersertifikat | `demo.recycler@ecoloop.id` | `password123` |

### Alur demo end-to-end (3 menit)

1. Login sebagai **Masyarakat** → daftarkan e-waste lewat peta drop box
2. Logout, login sebagai **Aggregator** → konfirmasi pickup, lalu tandai terkumpul
3. Logout, login sebagai **Recycler** → klik "Terbitkan sertifikat" → halaman sertifikat printable terbuka di tab baru

---

## Konteks Masalah

Indonesia menghasilkan ~2 juta ton e-waste per tahun (UNITAR 2024) — terbesar di ASEAN. Hanya **17,4% yang dikelola benar** (KLHK 2021). Survei tim ke 30 mahasiswa ITB: **92% tidak tahu lokasi drop box terdekat**. Akar masalahnya bukan kesadaran — Kurniawan et al. (Geosystem Engineering 2022) menyimpulkan masalah utamanya adalah ketiadaan infrastruktur dan akses informasi.

EcoLoop adalah jawabannya: bukan kampanye kesadaran lagi, tapi infrastruktur digital yang membuat pilihan benar menjadi mudah dan terverifikasi.

---

## Apa yang Membuat EcoLoop Berbeda

| | Octopus | Duitin | Rapel | Jaga Bumi | **EcoLoop** |
|---|:---:|:---:|:---:|:---:|:---:|
| Menangani e-waste B3 | × | × | △ | × | ✓ |
| Pickup terjadwal | ✓ | ✓ | ✓ | × | ✓ |
| Sertifikat chain-of-custody | × | × | × | × | **✓** |
| Platform tiga sisi | × | × | × | × | **✓** |

Sertifikat *chain-of-custody* yang dapat diaudit — fitur yang absen di seluruh kompetitor — adalah differentiator kunci EcoLoop. Setiap pickup yang lolos ke recycler bersertifikat KLHK menghasilkan dokumen formal di URL publik `/certificates/{uuid}` yang dapat dicetak, dibagikan, dan diverifikasi siapa saja.

---

## Arsitektur

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  USER (PWA)     │      │  AGGREGATOR     │      │  RECYCLER KLHK   │
│  React + Vite   │      │  Dashboard      │      │  Dashboard       │
└────────┬────────┘      └────────┬────────┘      └────────┬─────────┘
         │                        │                        │
         │   HTTPS / REST         │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │  API GATEWAY   │
                          │  Node + Express│
                          │   (Railway)    │
                          └───────┬────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
          ┌───────▼─────┐ ┌───────▼──────┐ ┌──────▼──────┐
          │  Postgres   │ │  Supabase    │ │  Supabase   │
          │  + RLS      │ │  Auth (JWT)  │ │  Storage    │
          │             │ │              │ │  (Sertifikat│
          │             │ │              │ │   B3 KLHK)  │
          └─────────────┘ └──────────────┘ └─────────────┘
                          ↑ all on Supabase
```

**Lapisan deploy:**

- **Frontend** → Vercel (CDN edge, auto-deploy dari Git push)
- **Backend** → Railway (Nixpacks Node.js runtime)
- **Database & Auth & Storage** → Supabase (managed Postgres dengan Row-Level Security)

---

## Tech Stack

| Lapisan | Teknologi | Mengapa |
|---|---|---|
| Frontend | React 18 + Vite | PWA installable, offline-ready |
| Routing & Map | React Router + Leaflet.js + OpenStreetMap | Open-source, tanpa biaya API map |
| State Auth | Supabase Auth SDK + custom AuthProvider | JWT auto-refresh, RLS-friendly |
| Backend | Node.js 20 + Express.js | Ekosistem JS konsisten, prototyping cepat |
| Database | PostgreSQL via Supabase | RLS, real-time, gratis tier |
| Validasi | Custom validator (no zod/joi) | Ramping, < 100 baris kode |
| Geolokasi | PL/pgSQL function `nearby_dropboxes` | Haversine native, lebih cepat |
| Hosting FE | Vercel | Deploy via Git push, edge network |
| Hosting BE | Railway | Auto-detect Node.js, free $5 trial |

---

## State Machine Pickup

Inti chain-of-custody EcoLoop:

```
   ┌──────────┐  aggregator  ┌─────────────┐  aggregator  ┌────────────┐  recycler  ┌─────────────┐
   │ pending  │ ───────────► │ confirmed   │ ───────────► │ collected  │ ─────────► │ certified   │
   └──────────┘  konfirmasi  └─────────────┘  jemput/ambil└────────────┘  +CoC URL  └─────────────┘
   user create                                                                       (terminal)
```

Otorisasi setiap transisi dijaga di backend (`server/src/routes/pickups.js`). Transisi ilegal ditolak dengan `409 invalid_transition`. Recycler yang menerbitkan sertifikat **wajib** menyertakan `certificate_url` — backend menolak request tanpa field ini.

---

## Skema Database

Lima tabel utama, semuanya dengan Row-Level Security aktif:

- **`users`** — extends `auth.users` Supabase via FK; trigger `handle_new_user` auto-create profil saat signup
- **`aggregators`** — pengumpul komunitas dengan flag `verified`
- **`recyclers`** — pemegang izin B3 KLHK dengan `klhk_license_no` dan `verified_at`
- **`dropboxes`** — titik pengumpulan dengan koordinat & `accepted_device_types[]`
- **`pickups`** — tabel utama dengan FK ke ke-empat tabel lainnya, status enum 4-tahap

Schema lengkap di [`server/src/db/schema.sql`](./server/src/db/schema.sql). Termasuk PL/pgSQL function `nearby_dropboxes(lat, lng, radius)` yang menghitung haversine native di Postgres.

---

## API Endpoints

Base URL development: `http://localhost:4000/api`. Auth: `Authorization: Bearer <jwt>` di header.

| Method | Path | Role | Fungsi |
|---|---|---|---|
| GET | `/health` | public | Health check |
| POST | `/auth/register` | public | Registrasi (juga bisa via Supabase SDK) |
| POST | `/auth/login` | public | Login, return JWT |
| GET | `/auth/me` | auth | Profil pengguna |
| POST | `/pickups` | user | Buat pickup baru |
| GET | `/pickups` | role-aware | List pickup terfilter berdasarkan role |
| GET | `/pickups/:id` | party | Detail dengan ownership check |
| PATCH | `/pickups/:id/status` | aggr/recyc | Transisi state machine |
| GET | `/dropboxes` | public | Cari terdekat (lat, lng, radius) |
| GET | `/dropboxes/:id` | public | Detail dropbox aktif |
| POST | `/dropboxes` | aggregator | Daftarkan dropbox baru |

Detail validation rules dan response schemas di [`docs/SETUP_HARI_2-3.md`](./docs/SETUP_HARI_2-3.md).

---

## Pengembangan Lokal

### Prasyarat

Node.js >= 20, npm >= 10, akun Supabase (gratis).

### Langkah cepat

```bash
git clone https://github.com/USERNAME/ecoloop.git
cd ecoloop

cd server && npm install
cd ../client && npm install

# Setup env (lihat docs/SETUP_HARI_1-2.md untuk detail)
cp server/.env.example server/.env
cp client/.env.example client/.env
# isi credentials Supabase di kedua file

# Jalankan schema & seed di Supabase
# (paste server/src/db/schema.sql ke Supabase SQL Editor)

# Terminal 1 — backend
cd server && npm run dev        # http://localhost:4000

# Terminal 2 — frontend
cd client && npm run dev        # http://localhost:5173

# Terminal 3 — seed data demo (sekali saja)
cd server && npm run seed
```

Buka `http://localhost:5173`, login dengan akun demo di atas.

Detail lengkap: [`docs/SETUP_HARI_1-2.md`](./docs/SETUP_HARI_1-2.md).

---

## Deployment

EcoLoop di-deploy ke tiga platform terintegrasi:

1. **Vercel** untuk frontend React (auto-deploy dari Git push)
2. **Railway** untuk backend Node.js (Nixpacks runtime)
3. **Supabase** untuk database, auth, storage (sudah managed)

Panduan deploy step-by-step: [`docs/SETUP_HARI_5_DEPLOY.md`](./docs/SETUP_HARI_5_DEPLOY.md).

---

## Struktur Repositori

```
ecoloop/
├── client/                       Frontend React PWA
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── pages/                Landing, Login, NewPickup, Pickups,
│   │   │                         AggregatorDashboard, RecyclerDashboard, Certificate
│   │   ├── components/           Header, DropboxMap, StatusPill
│   │   ├── hooks/                useAuth (Supabase session)
│   │   ├── lib/                  api.js, supabase.js
│   │   └── styles/               global.css (design tokens)
│   ├── vercel.json               SPA rewrite rules
│   └── vite.config.js
├── server/                       Backend Node.js + Express
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql        DDL: 5 tabel, RLS, triggers, RPC
│   │   │   ├── seed.js           Demo data
│   │   │   └── supabase.js       Admin & per-token client
│   │   ├── routes/               auth, pickups, dropboxes
│   │   ├── middlewares/          requireAuth, requireRole
│   │   ├── lib/                  validate.js
│   │   └── index.js              Express entry
│   └── package.json
└── docs/
    ├── SETUP_HARI_1-2.md         Supabase + Auth + Schema + Seed
    ├── SETUP_HARI_2-3.md         API endpoints (pickups + dropboxes)
    ├── SETUP_HARI_4-5.md         Frontend dashboards + sertifikat
    ├── SETUP_HARI_5_DEPLOY.md    Deploy ke Vercel + Railway
    ├── PANDUAN_GITHUB.md         Git workflow untuk pemula
    └── Naskah_Video_EcoLoop.md   Storyboard video presentasi
```

---

## Tim

| Nama | NIM | Peran |
|---|---|---|
| Poggy Gultom | 13222102 | Ketua Tim — Backend & Product |
| Raifal Rosaldi | 13222053 | Anggota Tim — Frontend & UX |

Institut Teknologi Bandung — Teknik Elektro Angkatan 2022.

Submisi Hackathon **IYREF 2026** — Sub-tema *Circular Economy & Waste Revolution*. Diselenggarakan oleh Society of Renewable Energy ITB.

---

## Lisensi

Proyek ini dibuat untuk Hackathon IYREF 2026. Hak cipta © 2026 Tim EcoLoop. Source code tersedia untuk inspeksi juri dan keperluan akademik.
