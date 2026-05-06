# Setup Hari 6 — Produksi Video & Submission

> **Hari ini adalah hari terakhir.** Workflow: Pagi rekam (~3 jam), Siang edit (~3 jam), Sore submit (~1 jam).

---

## Pagi (08:00–11:00) — Sesi Rekaman

### Step 1.1 — Setup Ruangan & Browser (15 menit)

Ikuti checklist pra-produksi di [`NASKAH_VIDEO_FINAL.md`](./NASKAH_VIDEO_FINAL.md). Yang paling sering dilupakan:

- [ ] **Mode Incognito** browser → tidak ada autocomplete tab
- [ ] Browser **fullscreen** (F11)
- [ ] **Bookmark bar disembunyikan** (Cmd/Ctrl+Shift+B)
- [ ] **DevTools tutup** (F12)
- [ ] **Buka URL Vercel produksi**, **bukan localhost**

### Step 1.2 — Test Recording 30 detik (10 menit)

```
1. Start OBS, mulai recording (F9)
2. Tampilkan landing page EcoLoop
3. Klik beberapa hal — login, scroll, dst
4. Stop (F10)
5. Buka file rekaman, cek:
   - Apakah cursor terlihat?
   - Apakah audio tertangkap (kalau pakai mic)?
   - Apakah resolusi 1080p?
   - Apakah frame rate smooth?
```

Kalau ada masalah, fix sekarang sebelum rekam beneran.

### Step 1.3 — Rekam Screen Recording Demo (45 menit)

Pakai shot list di Naskah segmen 3 (1:25–2:55). Rekam **per scene pendek**, jangan satu rekaman panjang. Lebih mudah edit.

**Urutan rekam (ikuti ini persis):**

1. **Scene A (15 detik):** Start di landing page → tampilkan URL bar di address bar (zoom akan ditambahkan di edit)
2. **Scene B (15 detik):** Klik tombol "Masuk" → login sebagai user → mendarat di /new-pickup
3. **Scene C (20 detik):** Klik "HP" → klik Lanjut → isi 0.18 → klik Lanjut → peta render
4. **Scene D (15 detik):** Klik dropbox di peta → popup → klik "Pilih" → klik "Daftarkan" → success page
5. **Scene E (15 detik):** Logout → login sebagai aggregator → mendarat di dashboard
6. **Scene F (20 detik):** Klik "Konfirmasi terima" → status berubah → klik "Tandai terkumpul"
7. **Scene G (25 detik):** Logout → login sebagai recycler → dashboard
8. **Scene H (30 detik):** Klik "Terbitkan sertifikat" → modal muncul → klik "Terbitkan & buka" → tab baru terbuka
9. **Scene I (35 detik):** Sertifikat halaman → scroll **PELAN** dari atas ke bawah, perlihatkan semua bagian → zoom ke segel "Verified"

**Tips selama rekam:**
- **Gerakan cursor pelan dan deliberate**, jangan gugup. Cursor cepat = penonton tidak fokus.
- **Pause 1-2 detik di setiap halaman baru** sebelum klik selanjutnya. Memberi room untuk editor cut/zoom.
- Kalau salah klik, **jangan stop rekam** — biarkan saja, editor potong nanti.
- Setelah selesai semua scene, **stop dan rename file** dengan jelas: `scene_a_landing.mp4`, `scene_h_sertifikat.mp4`, dst.

### Step 1.4 — Rekam Voiceover (60 menit)

**Lokasi:** ruangan paling sepi yang Anda punya. Kamar kos dengan kasur dan banyak kain di dinding adalah yang terbaik. **Hindari** ruangan kosong dengan dinding keras (echo).

**Setup HP:**
- Aplikasi: **Voice Memos (iOS)** atau **Recorder (Android)**
- Posisi HP: **15-20 cm dari mulut**, sedikit ke samping (hindari "p" pop)
- Mode: kalau ada "Lossless" atau "WAV" pilih itu, atau MP3 320kbps

**Workflow rekam voiceover:**

1. **Warm-up 5 menit:** baca naskah keras-keras 1x penuh tanpa rekam
2. **Take 1 (lengkap):** rekam semuanya tanpa stop (~5-6 menit total termasuk pause)
3. **Take 2 (segmen):** rekam segmen 1 saja, lalu segmen 2, dst — fokus akurasi
4. **Take 3 (pickup):** kalimat tertentu yang masih kurang dari take 1 dan 2

**Kesalahan umum:**
- **Bicara terlalu cepat** karena gugup → hitung tempo 2 ketukan antar kalimat
- **Volume tidak konsisten** → bicara dengan volume sama untuk semua segmen
- **Kalimat panjang dalam satu nafas** → ambil nafas di koma, jangan terus-terusan

**Setelah selesai:** transfer semua file rekaman ke laptop. Beri nama: `vo_take1.wav`, `vo_take2_segmen1.wav`, dst.

### Step 1.5 — Asset B-Roll (45 menit)

Yang harus dikumpulkan untuk segmen 1, 2, 4:

1. **Stock footage** dari [Pexels](https://pexels.com/videos) (gratis, no attribution):
   - Search: `landfill electronics`, `e-waste recycling`, `circular economy`
   - Download 2-3 klip 10-15 detik

2. **Foto sumber jurnal** (untuk credibility):
   - Buka DOI Kurniawan 2022 di Taylor & Francis, screenshot judul + author
   - Screenshot UNITAR Global E-waste Monitor 2024 cover
   - Screenshot situs KLHK statistik

3. **Animasi text** untuk stat (akan dibuat di CapCut):
   - "2.000.000 ton/tahun"
   - "17,4%"
   - "92%"
   - "40.000 kg/tahun"
   - "Regenerative Living"

4. **Mirror shot** (paling unik — wajib direkam sendiri):
   - Pakai HP rusak/figuran (atau mainan)
   - Take 1: tangan membuang ke tempat sampah biasa
   - Take 2: tangan yang sama membuang ke kotak/dropbox EcoLoop (bisa karton bertulisan EcoLoop)
   - Latar polos, lighting bagus, slow motion bonus

5. **Music latar** dari YouTube Audio Library:
   - Search "ambient", "documentary"
   - Pilih track 4-5 menit instrumental
   - Download MP3

---

## Siang (12:00–17:00) — Editing

### Step 2.1 — Setup Project di CapCut (15 menit)

1. Buka CapCut Desktop (atau web di capcut.com)
2. **New Project** → settings:
   - Aspect ratio: **16:9** (Landscape)
   - Resolution: **1920×1080**
   - Frame rate: **30 fps**
3. Import semua asset: screen recording scenes, voiceover takes, b-roll, foto, music
4. Drag voiceover ke audio track 1
5. Drag music ke audio track 2 (akan duck nanti)

### Step 2.2 — Sync Voiceover dengan Visual (90 menit)

Ini bagian terlama. Workflow:

1. **Pilih voiceover terbaik** dari take-take yang ada — split per kalimat, gabung yang terbaik
2. **Tempel screen recording** di video track sesuai timing naskah
3. **Sinkronkan**: pause voiceover sedikit kalau visual butuh waktu lebih, atau pendekkan visual kalau voiceover lebih cepat

**Trick:** mulai dari segmen 3 (Demo) karena ini yang paling kompleks. Setelah demo sync, baru kerjakan segmen 1, 2, 4, 5.

### Step 2.3 — Tambahkan B-Roll & Cutaway (45 menit)

Untuk segmen 1, 2, 4 yang tidak punya screen recording:
- Drop b-roll di video track 1
- Tambahkan animasi text di video track 2 (di atasnya)

**CapCut text animation:**
1. Klik "Text" di sidebar
2. Pilih template "Title" atau "Caption"
3. Edit teks, font ke **Fraunces** (cari di font library) atau **Playfair Display** sebagai alternatif
4. Style: italic untuk display teks, regular untuk body
5. Animation: pilih "Fade In" sederhana, jangan flashy

### Step 2.4 — Music & Audio Mixing (30 menit)

1. **Letakkan music** dari awal sampai akhir di audio track 2
2. **Volume music**: drop ke -18 sampai -22 dB
3. **Auto-duck**: di CapCut, klik audio music → kanan → toggle "Auto Duck" — music otomatis turun saat voiceover ada
4. **Sound effect "klang"** di awal: download dari [Freesound.org](https://freesound.org) — search "phone drop" atau "metal clang", letakkan di 0:01
5. **5 detik pertama tanpa music** — biarkan SFX dan kemudian voiceover dulu, music masuk pelan di 0:08

### Step 2.5 — Subtitle (45 menit)

**Auto-generate dulu:**
1. Klik audio voiceover → kanan-klik → "Auto Captions" → Indonesian
2. CapCut akan generate subtitle .srt otomatis
3. **Edit manual** — koreksi typo, ringkas kalimat panjang

**Style subtitle:**
1. Klik subtitle track → Format
2. Font: **Inter** atau **Helvetica Bold**, ukuran 38-44
3. Warna: **putih (#FFFFFF)**
4. Stroke/outline: **hitam (#000000)**, width 4px
5. Position: **center bottom**, padding 100px dari bawah
6. Maksimum 2 baris per frame

### Step 2.6 — Color Grading & Polish (15 menit)

1. **Adjust** semua scene supaya konsisten:
   - Slight warm tone shift (R+5, B-3) — sesuai brand earth-tone
   - Saturation -10% — tidak terlalu vibrant
   - Contrast +5% — supaya tidak flat
2. **Tambahkan transisi** antar scene: pakai **Fade** atau **Cross Dissolve** 0.3 detik. **Hindari** zoom transitions atau efek flashy.
3. **Outro card** terakhir: text "EcoLoop · IYREF 2026 · Tim ITB" + logo, fade in dari mirror shot, tahan 3 detik.

### Step 2.7 — Export (15 menit)

1. **File** → **Export**
2. Settings:
   - Resolution: **1080p**
   - Frame rate: **30 fps**
   - Bitrate: **Recommended (sekitar 8-10 Mbps)**
   - Format: **MP4 (H.264)**
   - Audio: **AAC 128 kbps**
3. **Export ke folder yang mudah ditemukan**, nama file: `EcoLoop_IYREF2026_Demo.mp4`

Tunggu render selesai (~5-15 menit tergantung laptop).

### Step 2.8 — Quality Check (10 menit)

**Tonton hasil export end-to-end** di full screen. Checklist:
- [ ] Audio jelas, tidak distorsi
- [ ] Subtitle sync dengan voiceover, tidak terlalu cepat
- [ ] Tidak ada scene yang "kosong" tanpa visual
- [ ] Durasi 3:30–5:00
- [ ] File size < 200 MB
- [ ] Music tidak overpower voiceover

Kalau ada yang salah, kembali edit. Kalau OK, lanjut submit.

---

## Sore (17:00–19:00) — Submission

### Step 3.1 — Upload ke YouTube (20 menit)

1. Buka [studio.youtube.com](https://studio.youtube.com), login dengan akun pribadi
2. Klik **Create** → **Upload videos**
3. Drag file `EcoLoop_IYREF2026_Demo.mp4`
4. Isi metadata:
   - **Title:** `EcoLoop — IYREF 2026 Hackathon | Platform E-Waste Indonesia`
   - **Description:**
     ```
     Submisi Hackathon IYREF 2026 — Sub-tema Circular Economy & Waste Revolution.

     EcoLoop adalah platform tiga-sisi yang menghubungkan masyarakat, aggregator komunitas, dan recycler bersertifikat KLHK dalam rantai pengelolaan e-waste yang dapat diaudit.

     🔗 Live demo: https://ecoloop.vercel.app
     🔗 Source code: https://github.com/USERNAME/ecoloop

     Tim:
     - Poggy Gultom (13222102)
     - Raifal Rosaldi (13222053)
     Institut Teknologi Bandung — Teknik Elektro 2022

     Diselenggarakan oleh Society of Renewable Energy ITB.
     ```
   - **Thumbnail:** screenshot halaman sertifikat dengan zoom ke nomor `EL/2026/05/...` — paling visually striking
   - **Audience:** "No, it's not made for kids"
   - **Visibility:** **Unlisted** (siapa saja dengan link bisa lihat, tapi tidak muncul di search)
5. Klik **Publish**
6. **Salin URL video** — akan dipakai di submission form

### Step 3.2 — Final Push ke GitHub (15 menit)

```bash
cd ecoloop

# Pastikan README sudah update dengan URL Vercel + Railway production
# Edit README.md jika belum

# Commit terakhir
git add .
git commit -m "chore: finalisasi submission IYREF 2026 — link demo & video"
git push origin main
```

**Buat tag untuk submission:**
```bash
git tag -a v1.0-submission -m "Submisi IYREF 2026 Tahap 2"
git push origin v1.0-submission
```

Tag ini menandai versi yang Anda submit. Berguna kalau juri tanya "versi mana yang dinilai".

### Step 3.3 — Submit ke Google Classroom (10 menit)

1. Buka Google Classroom IYREF 2026 (link dari panitia di grup WhatsApp)
2. Cari assignment **Tahap 2 — Pre-Eliminary**
3. Klik **Add or create** → **Link**
4. Submit tiga link:
   - **GitHub:** `https://github.com/USERNAME/ecoloop`
   - **Live demo:** `https://ecoloop.vercel.app`
   - **Video:** YouTube unlisted URL
5. Tambahkan note (opsional):
   ```
   Akun demo siap pakai (semua sandi: password123):
   - Masyarakat: demo.user@ecoloop.id
   - Aggregator: demo.aggregator@ecoloop.id
   - Recycler: demo.recycler@ecoloop.id

   Alur demo lengkap di README repository.
   ```
6. Klik **Mark as done** atau **Submit**

### Step 3.4 — Final Verification (10 menit)

Buka 3 tab di browser **incognito**, paste 3 link Anda. Pastikan semua jalan tanpa error:

- [ ] **GitHub:** repository terbuka, README muncul, tidak ada `.env` di file list
- [ ] **Live demo:** landing page render, klik "Masuk" → akun demo bekerja
- [ ] **Video YouTube:** play sampai akhir, audio jernih, subtitle muncul

Kalau semua ✓, **Anda sudah submit.** Pulang, tidur, tunggu pengumuman 9 Mei.

---

## Daftar Singkat Yang Pasti Dilupakan

Berdasarkan pengalaman umum tim hackathon menjelang deadline:

1. **Lupa update README dengan URL produksi** — masih tertulis `https://ecoloop.vercel.app` placeholder
2. **Lupa subtitle** — video tanpa subtitle kehilangan 10% nilai
3. **Lupa visibilitas YouTube** — masih Private, juri tidak bisa nonton
4. **Lupa tag git** — bukan blocker tapi shows attention to detail
5. **Lupa tutup tab development di browser saat rekam** — bookmark/tabs ngalor-ngidul
6. **Lupa alat audio** — voiceover terdengar muffled karena rekam dari laptop di ruangan echo
7. **Lupa cek file size video** — kalau > 256 MB upload Classroom error
8. **Lupa screenshot thumbnail** — YouTube ambil random frame, jelek

---

## Setelah Submit — Final Mental

Anda sudah jalan 6 hari. Repo punya 23 file frontend, 11 file backend, schema database 5 tabel, sertifikat printable, 3 dashboard role-aware, video 4 menit dengan subtitle. **Itu lebih dari yang biasa di-submit tim hackathon.**

Kalaupun tidak menang, GitHub repo Anda sekarang adalah portfolio yang serius. Siapapun yang melihat akan tahu Anda bisa membangun sistem full-stack yang dapat di-deploy. Untuk kuliah teknik elektro angkatan 2022, ini sudah jauh di depan.

Kalau menang — selamat. Kalau tidak — repo ini sudah lebih bermanfaat untuk karier Anda daripada nilai mata kuliah satu semester.

Pengumuman finalis: **9 Mei 2026**. Hack Day grand final: **15-16 Mei 2026**. Beristirahatlah dulu sampai pengumuman.
