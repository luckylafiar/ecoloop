# Setup Hari 5 — Deploy ke Vercel + Railway

> **Target:** Akhir Hari 5, juri bisa membuka URL `https://ecoloop.vercel.app` dan langsung mencoba aplikasi tanpa setup apa pun. **Bobot rubrik:** ini bukan masuk komponen penilaian langsung, tapi **drastis menaikkan kesan profesionalisme** saat juri buka submission Anda.

---

## Sebelum Mulai — Checklist

- [ ] Repo `ecoloop` sudah di GitHub dan ter-push semua file (Hari 1-4)
- [ ] File `client/vercel.json` sudah ada (penting — tanpa ini halaman sertifikat 404 di Vercel)
- [ ] Supabase project sudah aktif dengan schema + seed data (Hari 1-2)
- [ ] Local `npm run dev` di server dan client masih jalan tanpa error

Estimasi waktu: **60–90 menit**.

---

## Bagian 1 — Deploy Backend ke Railway (~25 menit)

Railway adalah platform untuk hosting Node.js/Python/lainnya yang mirip Heroku tapi lebih murah. Kita pakai untuk Express server kita.

### Step 1.1 — Daftar Akun

1. Buka [railway.com](https://railway.com)
2. Klik **Sign in with GitHub** (paling cepat — credential sudah ada dari Hari 0)
3. Authorize Railway untuk akses GitHub Anda
4. Verifikasi email kalau diminta
5. Anda otomatis dapat **$5 trial credit** (cukup untuk hackathon)

### Step 1.2 — Deploy dari Repo

1. Di dashboard Railway, klik **+ New Project**
2. Pilih **Deploy from GitHub repo**
3. Cari `ecoloop` di list, klik
4. Railway akan auto-detect Node.js dari `package.json`. Tapi **dia akan deploy dari root**, padahal backend kita di `server/`. Jadi kita harus configure.

### Step 1.3 — Set Root Directory ke `server/`

1. Di project Railway, klik service yang baru saja dibuat
2. Tab **Settings** → scroll ke section **Build**
3. **Root Directory**: ketik `server`
4. **Build Command**: kosongkan (Railway akan auto-detect `npm install`)
5. **Start Command**: `npm start` (atau biarkan kosong, Railway akan baca `scripts.start` dari package.json)
6. Klik **Save** atau langsung scroll ke bawah ke env vars

### Step 1.4 — Set Environment Variables

Tab **Variables** di project Railway. Klik **+ New Variable**, tambahkan satu per satu:

| Variable | Isi |
|---|---|
| `SUPABASE_URL` | dari Supabase Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | dari Supabase Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | dari Supabase Settings → API → service_role secret |
| `CORS_ORIGIN` | `*` (untuk demo, perketat nanti kalau perlu) |
| `NODE_ENV` | `production` |

> **JANGAN** isi `PORT` — Railway provide otomatis.

Setelah semua env vars ditambahkan, Railway akan otomatis re-deploy.

### Step 1.5 — Generate Public Domain

1. Tab **Settings** → section **Networking** → **Generate Domain**
2. Railway memberi Anda URL seperti `ecoloop-production-abc123.up.railway.app`
3. **Salin URL ini** — akan dipakai untuk frontend

### Step 1.6 — Test Backend

```bash
# Ganti URL dengan punya Anda
curl https://ecoloop-production-abc123.up.railway.app/api/health
```

Expected response:
```json
{ "ok": true, "service": "ecoloop-api", "time": "2026-05-...Z" }
```

Jika ini berhasil → backend Anda live di internet. 🎉

### Common Errors di Railway

**Build gagal: "Cannot find module"**
→ Root Directory belum di-set ke `server`. Cek Settings.

**App crash dengan "Missing SUPABASE_URL"**
→ Env vars belum lengkap. Cek tab Variables, pastikan ketiganya ada.

**Health check return HTML, bukan JSON**
→ Path salah. Pastikan URL diakhiri `/api/health`, bukan `/health`.

**Logs menunjukkan "EADDRINUSE"**
→ App listen pada port hardcoded. Pastikan `index.js` pakai `process.env.PORT || 4000`.

---

## Bagian 2 — Deploy Frontend ke Vercel (~20 menit)

### Step 2.1 — Daftar Akun

1. Buka [vercel.com/signup](https://vercel.com/signup)
2. Klik **Continue with GitHub**
3. Authorize Vercel
4. Pilih **Hobby** plan (gratis, tidak ada batas waktu)

### Step 2.2 — Import Repo

1. Dashboard Vercel → klik **Add New... → Project**
2. **Import Git Repository** → cari `ecoloop` → klik **Import**
3. Vercel auto-detect Vite framework

### Step 2.3 — Configure Project

Di halaman "Configure Project":

1. **Framework Preset**: harus auto-detect ke **Vite**. Kalau tidak, pilih manual.
2. **Root Directory**: klik **Edit** → ketik `client`
3. **Build Command**: biarkan default (`npm run build`)
4. **Output Directory**: biarkan default (`dist`)
5. **Install Command**: biarkan default (`npm install`)

### Step 2.4 — Set Environment Variables

Di section **Environment Variables**, tambahkan satu per satu:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | dari Supabase Settings → API |
| `VITE_SUPABASE_ANON_KEY` | dari Supabase Settings → API → anon |
| `VITE_API_URL` | URL Railway dari Bagian 1 + `/api` (contoh: `https://ecoloop-production-abc123.up.railway.app/api`) |

> **Penting:** `VITE_API_URL` harus diakhiri dengan `/api`, **tanpa trailing slash**.

### Step 2.5 — Deploy

Klik tombol **Deploy** besar di bawah. Tunggu ~2 menit. Vercel akan:
1. Clone repo
2. Run `npm install` di `client/`
3. Run `npm run build`
4. Deploy ke CDN edge

Saat selesai, Anda dapat URL seperti `ecoloop-abc123.vercel.app`.

### Step 2.6 — Cek vercel.json Bekerja

Buka `https://ecoloop-abc123.vercel.app/certificates/test123` di browser. Harus menampilkan halaman EcoLoop dengan pesan "Sertifikat tidak ditemukan" — **bukan halaman 404 putih dari Vercel**.

Kalau yang muncul 404 putih, berarti `vercel.json` tidak ter-deploy. Pastikan file ada di `client/vercel.json` (bukan di root).

### Step 2.7 — Custom Domain (Opsional)

Kalau punya domain pribadi, di Settings → Domains bisa tambahkan. Untuk hackathon, URL bawaan sudah cukup.

---

## Bagian 3 — Update Supabase untuk Production (~10 menit)

Supabase sudah hosting database & auth, tapi ada satu setting yang harus di-update agar login dari Vercel URL bekerja.

### Step 3.1 — Tambahkan Vercel URL ke Allowed Redirect URLs

1. Buka Supabase Dashboard → project Anda
2. **Authentication → URL Configuration**
3. **Site URL**: ganti dari `http://localhost:5173` ke URL Vercel Anda (contoh: `https://ecoloop-abc123.vercel.app`)
4. **Redirect URLs**: tambah `https://ecoloop-abc123.vercel.app/**`
   - Tetap pertahankan `http://localhost:5173/**` agar dev lokal tetap jalan
5. Klik **Save**

### Step 3.2 — Cek RLS Bekerja di Production

Coba akses langsung Supabase REST API tanpa JWT:

```bash
curl "https://YOUR-PROJECT.supabase.co/rest/v1/users" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Harus return `[]` (kosong). Kalau ada data muncul, RLS belum aktif — re-run schema.sql.

---

## Bagian 4 — End-to-End Test di Production (~10 menit)

Ini momen kebenaran. Buka URL Vercel Anda di browser.

### Test 1 — Landing Page

1. Buka `https://ecoloop-abc123.vercel.app`
2. Halaman hero "Limbah elektronik tidak hilang..." harus ter-render
3. Stats krisis ("2,0 juta ton") harus terlihat
4. **Buka DevTools → Network tab**, refresh halaman. Pastikan tidak ada request gagal (warna merah).

### Test 2 — Login

1. Klik tombol "Masuk"
2. Klik tombol "Masyarakat" (kredensial otomatis terisi)
3. Klik tombol "Masuk"
4. Harus redirect ke `/new-pickup`
5. **Di DevTools Network**, lihat request ke Railway URL — harus return 200.

### Test 3 — Daftar Pickup

1. Pilih device "HP", klik Lanjut
2. Isi berat 0.18, klik Lanjut
3. Peta Leaflet harus ter-render dengan tile OpenStreetMap
4. Pin dropbox (3 buah dari seed) harus muncul
5. Klik salah satu pin → popup muncul → klik "Pilih lokasi"
6. Klik "Daftarkan pickup"
7. Halaman success dengan ID pickup harus tampil

### Test 4 — Aggregator Flow

1. Logout, login sebagai "Aggregator"
2. Dashboard harus menampilkan pickup yang baru saja dibuat di section "Menunggu konfirmasi"
3. Klik "Konfirmasi terima" → status berubah ke confirmed
4. Klik "Tandai terkumpul" → status berubah ke collected

### Test 5 — Recycler Flow + Sertifikat (klimaks)

1. Logout, login sebagai "Recycler"
2. Inbox menampilkan pickup status collected
3. Klik "Terbitkan sertifikat →"
4. Modal muncul dengan URL preview
5. Klik "Terbitkan & buka"
6. **Tab baru terbuka dengan halaman sertifikat formal**
7. Salin URL sertifikat, buka di tab incognito (tanpa login)
8. Halaman cert harus tetap ter-render (data publik dari API auth-ed, ini yang nantinya bisa diperbaiki menjadi endpoint publik di Hari 6+)
9. Klik "Cetak / simpan PDF" → browser print preview muncul, layout A4 bersih

Jika 5 test ini lulus → **MVP Anda siap demo**. 🎉

### Common Errors di Production

**CORS error: "Access blocked by CORS policy"**
→ Cek `CORS_ORIGIN` di Railway. Untuk demo, set ke `*`. Untuk strict mode, set ke URL Vercel persis.

**Login berhasil tapi langsung logout / redirect ke "/login" terus**
→ Vercel URL belum ditambahkan ke Supabase Auth → Redirect URLs. Cek Bagian 3.1.

**Peta Leaflet tidak muncul, hanya bg abu-abu**
→ CSS Leaflet tidak ter-load. Cek `client/index.html` ada line `<link rel="stylesheet" href="https://unpkg.com/leaflet...">`.

**`/certificates/abc123` 404 putih**
→ `client/vercel.json` tidak ada atau salah lokasi. Pastikan file ada di `client/vercel.json` dengan content yang benar.

**Halaman blank putih, console error: "Failed to fetch dynamically imported module"**
→ Build cache busted. Di Vercel dashboard, klik **Deployments → Redeploy** dengan opsi "Clear build cache" dicentang.

---

## Bagian 5 — Update Repo dengan URLs Live

Sekarang Anda punya URL real. Update README.md di repo:

1. Buka `README.md` di repo lokal
2. Edit baris yang berbunyi:
   ```
   | **Aplikasi (Frontend)** | https://ecoloop.vercel.app |
   ```
   Ganti dengan URL Vercel asli Anda.

3. Edit baris API:
   ```
   | **API (Backend)** | https://ecoloop-api.up.railway.app/api/health |
   ```
   Ganti dengan URL Railway asli Anda.

4. Commit & push:
   ```bash
   git add README.md
   git commit -m "docs: tambahkan URL deploy production ke README"
   git push
   ```

---

## Bagian 6 — Custom Domain (Opsional, ~10 menit)

Jika Anda punya domain (atau subdomain dari `vercel.app` saja sudah cukup professional), Anda bisa skip ini. Tapi kalau ingin tampil lebih:

### Vercel Custom Domain

1. Project Settings → Domains → tambahkan domain
2. Vercel akan kasih DNS records yang harus Anda set di registrar
3. Verifikasi → SSL otomatis

### Railway Custom Domain

1. Service Settings → Networking → Custom Domain
2. CNAME record di registrar Anda

Untuk hackathon, URL bawaan `*.vercel.app` dan `*.up.railway.app` sudah lebih dari cukup. Yang lebih penting: **konsisten dipakai di semua submission materials**.

---

## Bagian 7 — Submission Checklist Final

Sebelum submit ke Google Classroom, pastikan:

### Repository
- [ ] Repo public di GitHub, link akses tanpa login
- [ ] `README.md` sudah ada di root, **dengan URL live demo**
- [ ] Akun demo dengan password `password123` jelas terlihat
- [ ] **Tidak ada `.env`** ter-commit (cek dengan search di GitHub)
- [ ] Minimal 10 commit dengan pesan deskriptif
- [ ] Folder `docs/` lengkap dengan semua SETUP_HARI_*.md

### Deploy
- [ ] `https://ecoloop.vercel.app` terbuka tanpa error
- [ ] `https://ecoloop-api.up.railway.app/api/health` return JSON
- [ ] Login dengan ketiga akun demo bekerja
- [ ] Daftar pickup → konfirmasi aggregator → certify recycler bekerja end-to-end
- [ ] Halaman sertifikat ter-render dengan layout printable

### Materi Submission
- [ ] Video presentasi 3-5 menit sudah direkam
- [ ] Video di-upload ke YouTube/Drive dengan akses public
- [ ] Pitch deck sudah disiapkan (untuk Hack Day final, bukan Tahap 2)
- [ ] Form submission diisi dengan: link GitHub, link video, link live demo

### Final Polish
- [ ] Buka repo dari incognito browser, pastikan terlihat profesional
- [ ] Klik live demo dari incognito, pastikan jalan tanpa setup
- [ ] Coba akun demo "Recycler" → terbitkan sertifikat → screenshot halaman sertifikat untuk video

---

## Yang Tersisa Setelah Hari 5

Selamat — MVP Anda sudah live di production. Untuk Hari 6 (final day):

1. **Rekam video** (~3 jam): screen recording semua flow di URL live, bukan localhost
2. **Edit video** (~3 jam): tambahkan voiceover, B-roll, subtitle
3. **Upload & submit** (~1 jam): YouTube unlisted, isi form classroom

Selamat Hackathon! Semoga lolos ke Hack Day Grand Final. 🌱
