# Panduan Final GitHub — Yang Harus Tampil di Repo Anda

> **Konteks:** Anda sudah ikuti `PANDUAN_GITHUB.md` (Hari 0). Sekarang tahap final — apa yang harus muncul di repo Anda saat juri membuka link.

---

## Struktur Akhir Repo yang Harus Tampil

Setelah semua file Hari 1–5 di-push, struktur repo Anda **harus tepat seperti ini**:

```
ecoloop/                              ← root repository
├── README.md                         ← yang dilihat juri pertama
├── .gitignore                        ← root level
├── client/                           ← Frontend React PWA
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                   ← WAJIB untuk SPA routing
│   ├── vite.config.js
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles/
│       │   └── global.css
│       ├── lib/
│       │   ├── api.js
│       │   └── supabase.js
│       ├── hooks/
│       │   └── useAuth.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── StatusPill.jsx
│       │   └── DropboxMap.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── NewPickup.jsx
│           ├── Pickups.jsx
│           ├── AggregatorDashboard.jsx
│           ├── RecyclerDashboard.jsx
│           └── Certificate.jsx
├── server/                           ← Backend Node.js + Express
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── lib/
│       │   └── validate.js
│       ├── db/
│       │   ├── schema.sql
│       │   ├── seed.js
│       │   └── supabase.js
│       ├── middlewares/
│       │   └── auth.js
│       └── routes/
│           ├── auth.js
│           ├── pickups.js
│           └── dropboxes.js
└── docs/                             ← Dokumentasi proses
    ├── SETUP_HARI_1-2.md
    ├── SETUP_HARI_2-3.md
    ├── SETUP_HARI_4-5.md
    ├── SETUP_HARI_5_DEPLOY.md
    ├── SETUP_HARI_6_PRODUKSI.md
    ├── PANDUAN_GITHUB.md
    ├── NASKAH_VIDEO_FINAL.md
    └── Naskah_Video_EcoLoop.md
```

**Total file:** 41 file (tidak hitung folder `node_modules/` dan `.env` yang memang tidak boleh di-commit).

---

## Verifikasi: Apa yang Harus Tampil saat Juri Buka Repo

Buka `https://github.com/USERNAME/ecoloop` di **browser incognito** (tanpa login). Lakukan checklist visual ini:

### Halaman Repo Utama

- [ ] **Nama repo** "ecoloop" tampil di header
- [ ] **Description** "Platform Ekosistem Digital Tiga Sisi..." muncul di bawah nama
- [ ] **Topics** muncul: `ewaste`, `circular-economy`, `react`, `supabase`, `nodejs`, `pwa`, `hackathon`, `sustainability`
- [ ] **Website link** di sebelah About: `https://ecoloop.vercel.app` (kalau sudah deploy)
- [ ] Folder list memperlihatkan: `client/`, `server/`, `docs/`
- [ ] File: `README.md`, `.gitignore`
- [ ] **README otomatis ditampilkan** di bawah file list
- [ ] **Stars/forks/watches** = 0 (normal untuk repo baru, bukan masalah)

### README Section yang Harus Muncul

Saat scroll README, juri harus melihat dalam 30 detik pertama:

1. **Hero** dengan judul "EcoLoop" + tagline
2. **Tabel "Coba langsung"** dengan 3 link clickable: Frontend, API, Repo
3. **Tabel akun demo** dengan 3 baris email + sandi
4. **Alur demo end-to-end (3 menit)** dengan 3 langkah numbered

Sisanya (problem, arsitektur, dll.) untuk juri yang tertarik dig deeper.

### Commit History

Klik tab **Commits** di repo:

- [ ] Minimal **10–15 commit** dengan pesan deskriptif
- [ ] Pesan menggunakan prefix konsisten: `feat:`, `fix:`, `docs:`, `chore:`
- [ ] Tanggal commit **tersebar** dari tanggal mulai (misal 30 April) sampai 6 Mei — bukti proses progresif
- [ ] **Dua avatar** muncul kalau Anda pakai `Co-authored-by` di pesan commit (bukti pair programming)

### File yang HARUS TIDAK ADA

- [ ] **Tidak ada `.env`** (cek di file list `server/` dan `client/`)
- [ ] **Tidak ada `node_modules/`** (folder sangat besar)
- [ ] **Tidak ada `.DS_Store`** (Mac noise)
- [ ] **Tidak ada credential** yang keceplos (misal di komentar kode)

Kalau ada `.env`, segera ikuti instruksi "Tidak sengaja commit `.env`" di [`PANDUAN_GITHUB.md`](./PANDUAN_GITHUB.md).

---

## Final Polish — Untuk Look Profesional

Hal kecil yang bikin perbedaan saat juri membuka repo. Lakukan satu per satu:

### 1. Update Description & Topics di GitHub

1. Buka halaman repo → klik **gear icon** sebelah "About" di sidebar kanan
2. **Description**: `Platform Ekosistem Digital Tiga Sisi untuk Pemulihan Rantai Nilai E-Waste Indonesia · IYREF 2026`
3. **Website**: `https://ecoloop.vercel.app` (URL Vercel asli Anda)
4. **Topics**: tambahkan tag — `ewaste`, `circular-economy`, `react`, `supabase`, `nodejs`, `pwa`, `hackathon`, `sustainability`, `indonesia`
5. **Save changes**

### 2. Pastikan README Punya URL Live yang Real

Sebelum final push, edit `README.md`:

```markdown
| **Aplikasi (Frontend)** | https://ecoloop-WHATEVER.vercel.app |
| **API (Backend)** | https://ecoloop-api-WHATEVER.up.railway.app/api/health |
```

Ganti `WHATEVER` dengan URL produksi asli Anda. **JANGAN biarkan placeholder** seperti `USERNAME`.

### 3. Buat Final Commit yang Bersih

Setelah semua file final, lakukan:

```bash
cd ecoloop

git add .
git status              # cek apa yang akan di-commit, pastikan tidak ada .env
git commit -m "chore: finalisasi submission IYREF 2026 — README dengan URL produksi"
git push origin main
```

### 4. Tag Versi Submission (Opsional Tapi Bagus)

Tag git menandai snapshot versi tertentu — berguna kalau ada commit setelah submission tapi juri tetap menilai versi waktu submission:

```bash
git tag -a v1.0-submission -m "Submisi IYREF 2026 Tahap 2 Pre-Eliminary"
git push origin v1.0-submission
```

Kalau berhasil, di tab **Releases** atau **Tags** di GitHub akan muncul `v1.0-submission`. Ini detail kecil yang menunjukkan keseriusan.

### 5. Pin Repo di Profil GitHub

Supaya repo ini muncul paling atas saat juri klik nama Anda:

1. Buka profile page Anda di GitHub
2. Klik **Customize your pins**
3. Centang `ecoloop`
4. **Save**

### 6. Buat README di Profil GitHub (Opsional)

Untuk kesan very polished:

1. Buat repo baru dengan nama persis sama dengan username GitHub Anda (misal `poggymacello/poggymacello`)
2. Tambahkan README dengan satu paragraf tentang Anda + featured project = EcoLoop

Ini membuat profil Anda terlihat seperti developer profesional saat juri klik nama.

---

## Submission ke Google Classroom — Langkah Tepat

Setelah repo final, ini yang Anda submit:

### Tiga link yang dipaste:

1. **GitHub repo:** `https://github.com/USERNAME/ecoloop`
2. **Live demo:** `https://ecoloop-WHATEVER.vercel.app`
3. **Video YouTube:** URL unlisted dari upload

### Caption submission (kalau ada kolom note):

```
Tim EcoLoop — Hackathon IYREF 2026
Sub-tema: Circular Economy & Waste Revolution

📦 Repository: https://github.com/USERNAME/ecoloop
🌐 Live demo: https://ecoloop-WHATEVER.vercel.app
🎬 Video: [URL YouTube]

🔑 Akun demo (sandi semua: password123):
- Masyarakat: demo.user@ecoloop.id
- Aggregator: demo.aggregator@ecoloop.id
- Recycler: demo.recycler@ecoloop.id

Tim:
- Poggy Gultom (13222102)
- Raifal Rosaldi (13222053)
Teknik Elektro ITB Angkatan 2022
```

---

## Final Smoke Test — Sebelum Tekan Submit

Buka **3 tab incognito** di browser, lakukan ini berturut-turut. Kalau salah satu gagal, perbaiki dulu sebelum submit.

### Tab 1: GitHub
1. Buka `https://github.com/USERNAME/ecoloop`
2. README harus terlihat di bawah file list
3. Klik `client/src/pages/Certificate.jsx` — file harus ke-render
4. Cari "env" di search bar repo — **tidak boleh** ada `.env` (hanya `.env.example`)

### Tab 2: Live Demo
1. Buka `https://ecoloop-WHATEVER.vercel.app`
2. Landing page harus render lengkap
3. Klik "Masuk" → klik tombol "Masyarakat" → klik "Masuk" → harus mendarat di /new-pickup
4. Buka langsung URL `https://ecoloop-WHATEVER.vercel.app/certificates/test` di tab baru — harus tampil halaman EcoLoop dengan pesan "Sertifikat tidak ditemukan", **bukan 404 putih**

### Tab 3: Video YouTube
1. Buka URL video di tab incognito
2. Pastikan **bisa diputar** (jangan Private)
3. Tonton sampai akhir, audio jernih
4. Subtitle muncul dan sync

Kalau ketiga tab ✓, **klik Submit di Google Classroom**. Anda selesai.

---

## Setelah Submit — Apa Yang Boleh Dilakukan

**Boleh:**
- Ngopi.
- Tidur.
- Beresin commit history kalau ada typo (commit baru OK, tapi tag `v1.0-submission` tetap menandai versi yang dinilai)
- Cek di Google Classroom: pastikan submission Anda terdaftar

**Tidak boleh:**
- Force-push (`git push --force`) — bisa hilangkan history commit yang sudah dilihat juri
- Hapus file dari repo — kalau juri sudah load preview, bisa kelihatan
- Update credential demo accounts di Supabase — kalau juri coba akun, akan gagal login

---

## Pengumuman & Hack Day

| Tanggal | Event |
|---|---|
| 6 Mei 2026 | **Submission deadline** ← Hari ini |
| 9 Mei 2026 | Pengumuman finalis (cek email + Google Classroom + IG @iyref2026) |
| 12 Mei 2026 | Technical Meeting (kalau lolos finalis) |
| 15-16 Mei 2026 | **Hack Day Final** di ITB (luring, minimal 1 anggota tim wajib hadir) |

Kalau lolos finalis, ada Hack Day intensif — tahap 3 yang bobotnya 80% dari nilai final. Tapi itu nanti. Sekarang fokus istirahat.

---

## Pertanyaan Yang Sering Ditanya Tim Hackathon

**Q: Repo saya kosong saat juri klik karena saya pakai .gitignore terlalu agresif. Apa yang terjadi?**
A: Ini blunder klasik. Cek file `.gitignore` jangan sampai exclude folder `src/`. Pakai `.gitignore` template dari panduan kami persis, jangan pakai dari template online sembarang.

**Q: Vercel saya error "Build failed" karena dependencies issue. Submit pakai apa?**
A: Submit GitHub link + video saja, skip live demo. Tulis di submission note: "Live demo terkendala build, silakan jalankan lokal dengan panduan di README." Jangan tunda submission. GitHub + video sudah cukup untuk dinilai 90% — live demo bonus.

**Q: Saya mau tambah fitur dadakan setelah submit. Boleh?**
A: Tag `v1.0-submission` Anda yang dinilai. Commit baru tidak masalah, tapi jangan ekspektasi juri lihat versi terbaru. Lebih baik fokus persiapan Hack Day.

**Q: Akun demo saya dipakai banyak orang sehingga datanya berantakan. Solusi?**
A: Jangan re-seed sampai pengumuman 9 Mei. Data berantakan justru menunjukkan sistem benar-benar dipakai. Re-seed setelah pengumuman, sebelum Hack Day.
