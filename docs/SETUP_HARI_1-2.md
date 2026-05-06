# Setup Hari 1–2 — Supabase + Auth + Schema + Seed

> Target: Akhir Hari 2, Anda punya backend API yang bisa register/login user demo, database lima tabel ter-seed dengan data Bandung-area, dan endpoint `GET /api/auth/me` yang mengembalikan profil terverifikasi.

---

## Daftar File yang Sudah Disiapkan

```
server/
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── index.js                   # Express entry, mount routes
    ├── db/
    │   ├── schema.sql             # DDL untuk Supabase SQL Editor
    │   ├── supabase.js            # Admin & per-request client
    │   └── seed.js                # Demo users, dropboxes, pickups
    ├── middlewares/
    │   └── auth.js                # requireAuth + requireRole
    └── routes/
        └── auth.js                # /register, /login, /me
```

---

## Hari 1 — Pagi (3 jam)

### Step 1.1 — Buat Project Supabase (15 menit)

1. Daftar/login di [supabase.com](https://supabase.com).
2. Klik **New Project**:
   - **Name**: `ecoloop`
   - **Database Password**: simpan di password manager (akan dipakai bila perlu akses DB langsung).
   - **Region**: pilih **Southeast Asia (Singapore)** — terdekat dari Indonesia.
   - **Plan**: Free tier cukup untuk MVP.
3. Tunggu provisioning ~2 menit.

### Step 1.2 — Catat Credentials (5 menit)

Buka **Project Settings → API**, catat tiga nilai ini:

| Variable | Lokasi di Dashboard |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` `secret` (klik *Reveal*) |

> **Peringatan keamanan:** `service_role_key` punya akses penuh ke database tanpa RLS. Jangan pernah masukkan ke kode frontend atau commit ke Git.

### Step 1.3 — Inisialisasi Repo Lokal (10 menit)

```bash
# Di folder kosong tempat repo Anda
mkdir ecoloop && cd ecoloop
git init

# Salin semua file server/ dari deliverable ini ke ecoloop/server/
# (drag & drop atau cp -r)

cd server
npm install
cp .env.example .env
```

Edit `server/.env`, isi dengan credentials Step 1.2:

```env
SUPABASE_URL=https://abcdefghij.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 1.4 — Jalankan Schema SQL (10 menit)

1. Di Supabase Dashboard, buka **SQL Editor → New query**.
2. Buka file `server/src/db/schema.sql` di editor lokal Anda.
3. Copy seluruh isi → paste ke SQL Editor → klik **Run**.
4. Verifikasi: buka **Table Editor**, harus muncul lima tabel: `users`, `aggregators`, `recyclers`, `dropboxes`, `pickups`.

**Apa yang sudah terjadi:**
- 2 ENUM types dibuat (`user_role`, `pickup_status`)
- 5 tabel dengan FK constraint
- 5 index untuk query performance
- 2 trigger: auto-create profile saat signup, auto-update `updated_at`
- 1 function `nearby_dropboxes` untuk pencarian haversine
- RLS policies aktif di semua tabel

### Step 1.5 — Konfigurasi Supabase Auth (10 menit)

Di Dashboard → **Authentication → Providers**:
1. **Email**: pastikan **Enable**. Untuk demo, **Confirm Email** boleh dimatikan (lebih cepat testing).
2. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (frontend Vite default)
   - **Redirect URLs**: tambahkan `http://localhost:5173/**`

### Step 1.6 — Smoke Test Server (10 menit)

```bash
cd server
npm run dev
```

Output harus:
```
[ecoloop-api] listening on http://localhost:4000
```

Test health check:
```bash
curl http://localhost:4000/api/health
# {"ok":true,"service":"ecoloop-api","time":"2026-05-04T..."}
```

> **Selesai Hari 1 Pagi.** Server jalan, schema beres, auth provider siap.

---

## Hari 1 — Siang (3 jam)

### Step 1.7 — Jalankan Seed Script (10 menit)

```bash
cd server
npm run seed
```

Output yang diharapkan:
```
[seed] mulai seed EcoLoop...
[seed] user demo.user@ecoloop.id dibuat → 9f3c1a...
[seed] user demo.aggregator@ecoloop.id dibuat → ...
[seed] user demo.recycler@ecoloop.id dibuat → ...
[seed] aggregator: Bank Sampah ITB (...)
[seed] recycler: PT Daur Ulang Mandiri (...)
[seed] dropbox dibuat: Drop Box ITB Ganesha
[seed] dropbox dibuat: Drop Box Kantor RW Dago
[seed] dropbox dibuat: Drop Box Bank Sampah Cihampelas
[seed] pickup dibuat: smartphone (pending)
[seed] pickup dibuat: laptop (confirmed)
[seed] pickup dibuat: battery (collected)
[seed] pickup dibuat: monitor (certified)

=== SEED SELESAI ===
Akun demo (semua password: password123):
  user        → demo.user@ecoloop.id
  aggregator  → demo.aggregator@ecoloop.id
  recycler    → demo.recycler@ecoloop.id
```

> Seed bersifat *idempotent* — aman dijalankan ulang. Pickup demo akan di-reset, user/aggregator/recycler/dropbox akan di-skip jika sudah ada.

### Step 1.8 — Verifikasi via Table Editor (5 menit)

Buka Supabase Dashboard → **Table Editor**, cek:
- `users`: 3 rows (user, aggregator, recycler)
- `aggregators`: 1 row (Bank Sampah ITB)
- `recyclers`: 1 row (PT Daur Ulang Mandiri)
- `dropboxes`: 3 rows
- `pickups`: 4 rows dengan status berbeda

### Step 1.9 — Test Auth Flow End-to-End (15 menit)

Pakai `curl` atau Postman:

**1) Login dengan akun demo:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.user@ecoloop.id","password":"password123"}'
```

Salin `access_token` dari response.

**2) Cek profil:**
```bash
TOKEN="paste-access-token-di-sini"
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

Response harus:
```json
{
  "user": {
    "id": "...",
    "email": "demo.user@ecoloop.id",
    "role": "user",
    "full_name": "Demo User"
  }
}
```

**3) Test register user baru:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ecoloop.id","password":"test12345","full_name":"Test User","role":"user"}'
```

Buka **Table Editor → users**, harus muncul row baru — bukti **trigger `handle_new_user` bekerja**.

> **Selesai Hari 1 Siang.** Backend sudah live, auth lengkap, data demo siap.

---

## Hari 2 — Konsolidasi & Persiapan Hari 3

### Step 2.1 — Verifikasi Fungsi `nearby_dropboxes` (15 menit)

Di Supabase SQL Editor:
```sql
SELECT * FROM nearby_dropboxes(-6.8915, 107.6107, 5);
```

Harus mengembalikan 3 dropbox terurut berdasarkan jarak (Drop Box ITB Ganesha = 0.00 km).

### Step 2.2 — Verifikasi RLS (10 menit)

Test bahwa anon key benar-benar terkunci:
```bash
ANON_KEY="paste-anon-key-di-sini"
curl "https://your-project.supabase.co/rest/v1/users" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

Harus mengembalikan `[]` (kosong) — karena RLS users hanya boleh select untuk `auth.uid() = id`, dan request ini tanpa JWT user.

### Step 2.3 — Tinjauan Ulang Sebelum Hari 3 (30 menit)

Buka kembali file-file ini dan baca dengan saksama — Hari 3 akan membangun di atasnya:

| File | Perlu dipahami untuk... |
|---|---|
| `src/db/schema.sql` (bagian pickups) | Endpoint `POST /pickups` |
| `src/db/schema.sql` (function nearby_dropboxes) | Endpoint `GET /dropboxes` |
| `src/middlewares/auth.js` (requireRole) | Endpoint update status (aggregator/recycler only) |

### Step 2.4 — Commit ke Git (5 menit)

```bash
cd ecoloop
git add .
git commit -m "feat: setup Supabase, auth, schema, dan seed (hari 1-2)"

# Buat repo di GitHub (private), lalu:
git remote add origin git@github.com:<username>/ecoloop.git
git branch -M main
git push -u origin main
```

> **Pastikan `.env` TIDAK ter-commit.** `.gitignore` sudah mencegahnya — tapi cek ulang dengan `git status`.

---

## Definition of Done — Akhir Hari 2

Centang setelah semua berhasil:

- [ ] Project Supabase aktif di region Singapore
- [ ] Schema 5 tabel + 2 trigger + 1 function ter-deploy
- [ ] RLS policy aktif di semua tabel (verified via SQL Editor)
- [ ] `npm run dev` jalan tanpa error, health check 200 OK
- [ ] `npm run seed` selesai tanpa error
- [ ] 3 user demo bisa login via `POST /api/auth/login`
- [ ] `GET /api/auth/me` mengembalikan profil dengan role yang benar
- [ ] Trigger auto-create profile bekerja (test register → row di `public.users`)
- [ ] Repo di-push ke GitHub, `.env` tidak ter-commit

---

## Troubleshooting

**`npm run seed` error: "permission denied for schema auth"**
→ Cek `SUPABASE_SERVICE_ROLE_KEY` benar-benar terisi di `.env`, bukan anon key. Service role bypass RLS dan bisa akses schema `auth`.

**`POST /api/auth/register` error: "duplicate key value violates unique constraint users_email_key"**
→ Email sudah pernah didaftarkan. Hapus dari **Authentication → Users** atau pakai email lain. Trigger akan auto-bersihkan profile via `ON DELETE CASCADE`.

**Trigger `handle_new_user` tidak jalan**
→ Cek **Database → Triggers** di dashboard, pastikan `on_auth_user_created` aktif di tabel `auth.users`. Jika tidak ada, jalankan ulang bagian `5.1` dari `schema.sql`.

**`requireAuth` selalu return 401 padahal token valid**
→ Cek waktu token expiry (Supabase JWT default 1 jam). Login ulang untuk dapat access_token baru.

**Function `nearby_dropboxes` tidak ditemukan saat dipanggil dari frontend**
→ Pastikan dipanggil via Supabase RPC: `supabase.rpc('nearby_dropboxes', { user_lat: x, user_lng: y })`, bukan query SQL biasa.

---

## Yang Dibangun di Hari Berikutnya

**Hari 2–3** (paralel dengan finalisasi Hari 2):
- `POST /api/pickups` — buat pickup baru
- `GET /api/pickups` — list pickup user
- `PATCH /api/pickups/:id/status` — update status (dengan `requireRole`)
- `GET /api/dropboxes?lat=&lng=&radius=` — wrapper untuk RPC `nearby_dropboxes`

Semua sudah punya skema, function, dan auth middleware yang dibutuhkan — tinggal tulis route handler.
