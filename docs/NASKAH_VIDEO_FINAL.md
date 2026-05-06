# Naskah Video FINAL — Produksi

> **Total durasi target:** 4 menit 0 detik (di tengah rentang 3–5 menit)
> **Bobot rubrik:** Urgensi 40% + Dampak 35% + Kreativitas 15% + Kejelasan 10%
> **Tanggal pengumpulan:** 6 Mei 2026

---

## Spesifikasi Produksi

| Aspek | Spesifikasi |
|---|---|
| Resolusi | 1920×1080 (16:9 landscape) |
| Frame rate | 30 fps |
| Audio | 48 kHz stereo, voiceover -3 dB peak |
| Format akhir | MP4 (H.264 + AAC) |
| Subtitle | Indonesia, embedded burn-in atau .srt |
| Durasi total | 4:00 ± 15 detik |
| Ukuran file | < 200 MB (untuk upload mudah) |

---

## Sebelum Tekan Rekam — Checklist Pra-Produksi

### Tools wajib

- [ ] **OBS Studio** ([obsproject.com](https://obsproject.com)) — gratis, untuk screen recording
- [ ] **CapCut** ([capcut.com](https://capcut.com)) — gratis, untuk editing (alternatif: iMovie di Mac)
- [ ] **Audacity** (opsional) — bersihkan audio voiceover
- [ ] HP atau headphone dengan mic dekat — untuk voiceover

### Setup browser sebelum rekam

- [ ] **Tutup semua tab** kecuali EcoLoop
- [ ] Mode **Incognito/Private** browsing — supaya tidak ada riwayat tab autocomplete
- [ ] Resolusi browser **1920×1080** atau **1440×900** — full screen
- [ ] **Bookmark tersembunyi** (Cmd/Ctrl+Shift+B di Chrome) — agar bersih
- [ ] **DevTools tutup** (F12)
- [ ] **Notifikasi sistem mute** — Mac: Do Not Disturb; Windows: Focus Assist
- [ ] Wallpaper desktop bersih (kalau OBS men-capture seluruh layar)
- [ ] Buka URL Vercel produksi, **bukan localhost** — supaya URL bar terlihat profesional

### Setup audio

- [ ] Tempat rekam: ruangan kecil dengan banyak kain/sofa (meredam echo)
- [ ] Jendela **tutup**, AC **off** (mengurangi noise frekuensi rendah)
- [ ] HP dengan mic atau earphone bermic, jarak 15-20 cm dari mulut
- [ ] **Tes rekam 5 detik** dulu, dengar di headphone — pastikan tidak muffled

### Setup OBS

- [ ] Source: **Display Capture** (bukan Window Capture, agar dialog/popup ikut terekam)
- [ ] Output Settings → Recording: MP4 / MKV, 1080p, 30 fps, bitrate 8000 Kbps
- [ ] Audio Mixer: Desktop Audio dimute (atau dilow) — kita pakai voiceover terpisah
- [ ] Hotkey: F9 = Start Recording, F10 = Stop Recording

---

## Naskah Voiceover Lengkap

> **Cara baca:** Tone documentary-narrator, tempo 145-160 kata/menit. Jeda dramatis di tanda `[...]`. Penekanan di kata **bold**.

### SEGMEN 1 — HOOK (0:00 – 0:40)

**[0:00]** *(diam 1 detik, lalu sound effect "klang" bunyi HP jatuh ke tempat sampah)*

> Setiap kali ini terjadi di Indonesia... **[1 detik jeda]** dua juta ton limbah elektronik bergerak ke arah yang salah.

**[0:14]**

> Indonesia adalah penghasil e-waste terbesar di **ASEAN**. Namun menurut data Kementerian Lingkungan Hidup, hanya **17 koma 4 persen** yang dikelola dengan benar.

**[0:25]**

> Sisanya — termasuk **timbal**, **merkuri**, dan **kadmium** — masuk ke TPA, lalu meresap ke tanah dan air tanah secara ireversibel.

**[0:35]**

> Studi Kurniawan tahun 2022 menyimpulkan: masalahnya bukan rendahnya kesadaran. Masalahnya adalah **tidak adanya infrastruktur**.

---

### SEGMEN 2 — SOLUSI (0:40 – 1:25)

**[0:40]**

> Survei kami ke mahasiswa ITB membuktikan: **92 persen** tidak tahu di mana harus membuang e-waste. Jika populasi dengan literasi tertinggi pun tidak punya akses, solusinya bukan kampanye lagi.

**[0:55]**

> Kami memperkenalkan **EcoLoop** — Progressive Web App yang menghubungkan tiga aktor yang selama ini terputus: masyarakat sebagai sumber, aggregator komunitas sebagai pengumpul, dan **recycler bersertifikat KLHK** sebagai pengolah.

**[1:10]**

> Berbeda dari platform daur ulang lain di Indonesia, EcoLoop adalah satu-satunya yang menangani limbah B3 spesifik dengan rantai *chain-of-custody* yang dapat diaudit.

---

### SEGMEN 3 — DEMO (1:25 – 2:55) — KLIMAKS

**[1:25]** *(transisi ke screen recording browser)*

> Mari saya tunjukkan. Saya buka EcoLoop di browser pada URL produksi yang sudah kami deploy.

**[1:32]** *(login sebagai user)*

> Sebagai pengguna masyarakat, saya pilih jenis perangkat — misalnya HP, **0,18 kilogram**.

**[1:42]** *(pilih dropbox di peta)*

> Sistem menampilkan peta drop box terdekat. Di belakang layar, ini memanggil function PostgreSQL bernama `nearby_dropboxes` yang menghitung jarak haversine native di database. Saya pilih Drop Box ITB Ganesha. Pickup tercatat dengan status **pending**.

**[2:00]** *(switch ke aggregator dashboard)*

> Sekarang saya login sebagai aggregator — Bank Sampah ITB. Pickup yang baru saja saya buat sudah otomatis muncul, karena sistem menautkan `aggregator_id` dari pemilik dropbox saat pickup dibuat.

**[2:15]**

> Saya konfirmasi terima — status berubah ke **confirmed**. Setelah saya menjemput fisik e-waste-nya, saya tandai sebagai **terkumpul**.

**[2:30]** *(switch ke recycler dashboard — KLIMAKS)*

> Terakhir, saya login sebagai recycler bersertifikat KLHK. Pickup yang sudah terkumpul muncul di inbox. Saya klik **"Terbitkan sertifikat"**.

**[2:42]** *(modal muncul, klik konfirmasi, tab baru terbuka)*

> Sistem secara otomatis menggenerasi URL sertifikat unik dan membuka halamannya. Inilah artefak audit yang **selama ini hilang** dari ekosistem e-waste Indonesia: dokumen formal dengan nomor sertifikat, estimasi pemulihan logam berbasis literatur, dan segel verifikasi yang dapat dicetak menjadi PDF A4.

---

### SEGMEN 4 — DAMPAK (2:55 – 3:30)

**[2:55]** *(infografik proyeksi muncul)*

> Mari lihat dampaknya. Dengan sepuluh ribu pengguna aktif, masing-masing dua pickup setahun, EcoLoop dapat memulihkan **40 ton** e-waste per tahun di Jakarta saja.

**[3:08]**

> Diskalakan ke lima kota dalam tiga tahun, kontribusi ini akan mendorong angka recycling rate nasional dari 17,4% menuju **target 25%**.

**[3:18]**

> Model kami freemium: masyarakat dan aggregator selalu gratis. Monetisasi datang dari produsen elektronik untuk laporan ESG, dan recycler untuk analitik compliance — yang sudah Anda lihat di dashboard tadi.

---

### SEGMEN 5 — PENUTUP (3:30 – 4:00)

**[3:30]** *(tempo melambat)*

> EcoLoop bukan sekadar aplikasi pembuangan.

**[3:35]**

> Setiap kilogram e-waste yang kembali ke recycler bersertifikat adalah logam yang kembali ke rantai produksi — **mengurangi pertambangan primer** yang merusak ekosistem.

**[3:46]**

> Inilah *Regenerative Living* yang konkret. Inilah *Systemic Harmony* antara teknologi, manusia, alam, dan tata kelola.

**[3:55]** *(visual: tangan yang sama dari pembukaan, tapi membuang ke dropbox EcoLoop)*

> Kami percaya, masa depan bumi tidak ditentukan oleh seberapa banyak yang kita buang — tapi seberapa banyak yang kita **kembalikan**.

**[4:00]** *(fade ke logo EcoLoop)*

---

## Shot List Detail Per Segmen

### Segmen 1 (0:00 – 0:40) — Hook

| Time | Visual | Source | Catatan |
|---|---|---|---|
| 0:00–0:08 | Close-up tangan membuang HP rusak ke tempat sampah biasa | Rekam sendiri | Pakai HP rusak/figuran. Slow motion bonus |
| 0:08–0:14 | Wide shot TPA dengan tumpukan e-waste | Stock footage Pexels/Pixabay (free) | Search "landfill electronics" |
| 0:14–0:25 | Animasi text: "2.000.000 ton" lalu zoom ke "17,4%" | Buat di CapCut | Pakai font Fraunces, palette earth-tone |
| 0:25–0:35 | Animasi periodik tabel: Pb, Hg, Cd menyala | Buat sederhana di CapCut | Tidak perlu fancy — text + warna |
| 0:35–0:40 | Quote Kurniawan dengan foto sumber jurnal | Screenshot DOI page + overlay | Sumber kredibilitas |

### Segmen 2 (0:40 – 1:25) — Solusi

| Time | Visual | Source |
|---|---|---|
| 0:40–0:55 | Bar chart "92%" dengan animasi rise | Buat di CapCut |
| 0:55–1:10 | Logo EcoLoop fade in, lalu animasi 3 ikon (rumah → truk → pabrik) menyatu | Pakai favicon.svg sebagai basis |
| 1:10–1:25 | Tabel kompetitor dari README muncul row by row | Screenshot tabel + animasi |

### Segmen 3 (1:25 – 2:55) — Demo (KLIMAKS)

**Pakai screen recording dari URL produksi Vercel, BUKAN localhost.**

| Time | Halaman | Action | Highlight |
|---|---|---|---|
| 1:25–1:32 | Landing page | Tampilkan URL bar `ecoloop.vercel.app` | URL bar zoom |
| 1:32–1:42 | Login → New Pickup step 1 | Klik device "HP" | Animasi step indicator |
| 1:42–1:55 | New Pickup step 2-3 | Isi 0.18 kg, peta render, klik dropbox | Cursor highlight peta |
| 1:55–2:00 | Success page | Tampilkan ID pickup | Zoom ke ID |
| 2:00–2:15 | Aggregator login → dashboard | Stat cards muncul | Highlight "1 menunggu" |
| 2:15–2:30 | Klik Konfirmasi → Tandai terkumpul | Status pill berubah warna | Status transition prominent |
| **2:30–2:55** | **Recycler dashboard → klik Terbitkan → modal → tab sertifikat terbuka → scroll** | **PALING PENTING** — slow scroll memperlihatkan tabel pemulihan + segel | Zoom akhir ke nomor `EL/2026/05/...` |

### Segmen 4 (2:55 – 3:30) — Dampak

| Time | Visual |
|---|---|
| 2:55–3:08 | Animasi angka counting up: "0 → 40.000 kg" |
| 3:08–3:18 | Peta Indonesia, 5 kota highlight terurut |
| 3:18–3:30 | Tiga kartu pricing tier: Gratis / B2B EPR / Rp150rb |

### Segmen 5 (3:30 – 4:00) — Penutup

| Time | Visual |
|---|---|
| 3:30–3:46 | Slowdown text overlays: "Regenerative Living", "Systemic Harmony" |
| 3:46–3:55 | Same closing-up shot (mirror dari opening): tangan ke dropbox EcoLoop, certificate notification muncul di HP |
| 3:55–4:00 | Logo EcoLoop center + "IYREF 2026 · SRE ITB" + nama tim |

---

## Catatan Delivery untuk Narator

**Keseluruhan tone:** documentary, bukan sales pitch. Bayangkan VOA Indonesia atau podcast jurnalistik — tenang, percaya diri, fakta-driven. **Bukan** YouTuber tutorial yang antusias.

**Pacing per segmen:**
- Hook: **lambat dan deliberate**. Beri ruang untuk angka mendarat di telinga pendengar.
- Solusi: tempo netral, naik sedikit
- Demo: **sedikit lebih cepat**, energetic — ini paling banyak action
- Dampak: kembali tenang, otoritatif
- Penutup: **sangat lambat**, hampir reflektif. Kata terakhir "kembalikan" diberi tekanan.

**Kata-kata yang sering salah ucap:**
- *Haversine* → "ha-ver-sin" (bukan "ha-ver-sayn")
- *Chain-of-custody* → "ceyn ov kas-tow-di"
- *Regenerative Living* → "ri-jen-er-ey-tiv li-ving"
- *KLHK* → eja huruf demi huruf, "ka-el-ha-ka"
- *Recycler* → "ri-say-kler"

**Rekam dalam 3 take:**
1. Take pertama: baca semuanya tanpa berhenti, untuk dapat ritme natural
2. Take kedua: split per segmen, fokus akurasi
3. Take ketiga: pickup shot — kalimat-kalimat yang masih kurang tegas

Editor pilih bagian terbaik dari ketiga take.

---

## Musik Latar — Rekomendasi

**Wajib:** instrumental, ambient, tidak vokal, tidak overpowering.

**Sumber gratis:**
- [YouTube Audio Library](https://studio.youtube.com/channel/UC.../music) — filter "No copyright"
- [Pixabay Music](https://pixabay.com/music/) — search "ambient" atau "documentary"
- [Free Music Archive](https://freemusicarchive.org/)

**Track style yang cocok:** ambient piano, soft electronic, minimal cello. Hindari upbeat corporate (terlalu salesy) dan dramatic orchestra (overkill).

**Volume mixing:**
- Voiceover: 0 dB (full)
- Music: -18 sampai -22 dB (sangat di belakang)
- **Duck music** otomatis saat narator bicara — fitur ini ada di CapCut

**Critical:** segmen 1 (Hook) **boleh tanpa musik selama 5 detik pertama** untuk sound effect "klang" tempat sampah. Music masuk pelan setelahnya.

---

## Subtitle — Wajib

Subtitle Bahasa Indonesia adalah komponen kejelasan (10% bobot). **Wajib ada.**

**Format:**
- Font: **Inter** atau **Helvetica**, bold, ukuran ~36-40 pt
- Warna: **putih** dengan **outline hitam** 2px (kontras di bg apa pun)
- Posisi: **center bottom**, padding 80px dari bawah
- Maksimum **2 baris**, ~40 karakter per baris

**Konten subtitle:**
Tidak harus persis word-for-word voiceover. Subtitle adalah versi padat — bisa hilangkan kata sambung untuk muat di layar. Contoh:

| Voiceover | Subtitle |
|---|---|
| "Setiap kali ini terjadi di Indonesia, dua juta ton limbah elektronik bergerak ke arah yang salah." | "Setiap kali ini terjadi, 2 juta ton e-waste bergerak salah arah." |

**Tools:** CapCut punya auto-subtitle dari audio. Generate dulu, lalu edit manual untuk akurasi.

---

## Mapping Naskah ke Kriteria Penilaian

| Kriteria (Bobot) | Disampaikan di Segmen | Cara Penyampaian |
|---|---|---|
| **Urgensi masalah (40%)** | Segmen 1 + bagian Segmen 2 (0:00–0:55) | Data UNITAR, KLHK, mini-survei ITB, konsekuensi B3 ireversibel |
| **Dampak/Manfaat (35%)** | Segmen 4 + Penutup (2:55–4:00) | Proyeksi 40 ton, 5 kota, model bisnis, alignment tema |
| **Kreativitas video (15%)** | Cold open + closing mirror (0:00 dan 3:55) | Visual mirroring, palette konsisten, dokumenter tone |
| **Kejelasan (10%)** | Sepanjang video | Subtitle, infografik bersih, tempo voice-over deliberate |
