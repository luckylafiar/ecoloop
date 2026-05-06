# Naskah Video Presentasi — EcoLoop

**Durasi target:** 4 menit 0 detik (di tengah rentang 3–5 menit)
**Tim:** Poggy Gultom (13222102) & Raifal Rosaldi (13222053) — Teknik Elektro ITB 2022
**Sub-tema:** Circular Economy & Waste Revolution — IYREF 2026

**Catatan strategis untuk produksi:**
Penilaian video memberi bobot 40% pada urgensi masalah dan 35% pada dampak — totalnya 75%. Karena itu naskah ini *problem-led*, bukan *feature-led*. Demo MVP hanya mengambil 90 detik di tengah, sementara framing masalah dan dampak mendominasi awal dan akhir.

**Konvensi naskah:**
- **VISUAL** = apa yang dilihat penonton di layar
- **NARATOR** = teks voice-over yang dibacakan

---

## SEGMEN 1 — HOOK & PROBLEM STATEMENT (0:00 – 0:40)

### [0:00 – 0:08]

**VISUAL:** *Cold open.* Close-up tangan membuang smartphone rusak ke tempat sampah rumah tangga biasa. Sound design: bunyi "klang" benturan logam diikuti hening sejenak. Tidak ada teks.

**NARATOR:** (jeda dramatis 2 detik setelah bunyi)
"Setiap kali ini terjadi di Indonesia, dua juta ton limbah elektronik per tahun bergerak ke arah yang salah."

### [0:08 – 0:25]

**VISUAL:** *Montage cepat 3 shot, masing-masing 5–6 detik.*
1. Drone shot tumpukan e-waste di TPA bercampur sampah organik.
2. Animasi peta Indonesia dengan angka "2.000.000 ton/tahun" muncul, lalu zoom ke "hanya 17,4% dikelola benar".
3. Animasi periodik tabel — timbal (Pb), merkuri (Hg), kadmium (Cd) — meresap ke dalam tanah dan air tanah.

**NARATOR:**
"Indonesia adalah penghasil e-waste terbesar di ASEAN. Namun menurut data KLHK, hanya 17,4% yang dikelola dengan benar. Sisanya — termasuk timbal, merkuri, dan kadmium — masuk ke TPA, lalu meresap ke tanah dan air tanah secara ireversibel."

### [0:25 – 0:40]

**VISUAL:** Grafik bar sederhana muncul di layar — bersih, tanpa clutter:
- "92% mahasiswa ITB tidak tahu lokasi drop box e-waste terdekat"
- "Hanya 6 recycler bersertifikasi KLHK se-Indonesia"

**NARATOR:**
"Studi Kurniawan tahun 2022 menyimpulkan: masalahnya bukan rendahnya kesadaran, tapi tidak adanya infrastruktur. Survei kami pada mahasiswa ITB membuktikannya — 92% tidak tahu di mana harus membuang e-waste. Jika populasi dengan literasi tertinggi pun tidak punya akses, kita tidak butuh kampanye lagi. Kita butuh sistem."

---

## SEGMEN 2 — SOLUSI: ECOLOOP (0:40 – 1:25)

### [0:40 – 0:55]

**VISUAL:** Logo EcoLoop muncul dengan transisi halus. Lalu animasi tiga ikon yang terhubung — masyarakat (rumah), aggregator (truk komunitas), recycler (pabrik bersertifikat) — membentuk siklus tertutup.

**NARATOR:**
"Kami memperkenalkan EcoLoop — Progressive Web App yang menghubungkan tiga aktor yang selama ini terputus: masyarakat sebagai sumber, aggregator komunitas sebagai pengumpul, dan recycler bersertifikasi KLHK sebagai pengolah."

### [0:55 – 1:25]

**VISUAL:** Diagram alur sistem (system flow) muncul step-by-step:
1. User mendaftarkan e-waste → highlight ikon HP dan laptop
2. Sistem mencocokkan dengan dropbox / aggregator terdekat → animasi pin peta
3. Aggregator mengkonfirmasi pengumpulan → status berubah hijau
4. Recycler menerbitkan sertifikat *Chain of Custody* → ikon sertifikat muncul

**NARATOR:**
"Berbeda dari platform daur ulang lain di Indonesia yang fokus pada plastik atau resale gadget, EcoLoop adalah satu-satunya yang menangani limbah B3 spesifik dengan rantai *chain of custody* yang dapat diaudit. Setiap pickup melewati empat tahap status — *pending*, *confirmed*, *collected*, *certified* — sehingga setiap kilogram e-waste dapat dilacak dari rumah pengguna hingga ke recycler bersertifikat."

---

## SEGMEN 3 — DEMO MVP (1:25 – 2:55)

### [1:25 – 1:40] — Onboarding Pengguna

**VISUAL:** Screen recording layar mobile (mockup iPhone). Pengguna membuka EcoLoop sebagai PWA dari home screen, login, lalu landing di home dengan tombol besar "Daftarkan E-Waste".

**NARATOR:**
"Sebagai PWA, EcoLoop dapat diinstall langsung dari browser tanpa melalui app store. Pengguna login, lalu langsung diarahkan ke aksi utama: mendaftarkan e-waste."

### [1:40 – 2:05] — Fitur Inti: Buat Pickup

**VISUAL:** Pengguna memilih jenis perangkat (smartphone), mengisi estimasi berat (0,18 kg), kemudian melihat peta dengan pin drop box terdekat dalam radius 5 km.

**NARATOR:**
"Pengguna memilih jenis perangkat dan estimasi berat. Sistem memanggil endpoint `GET /dropboxes` dengan parameter geolokasi, lalu menampilkan drop box terdekat melalui Leaflet. Pengguna memilih lokasi, sistem membuat record `pickup` baru dengan status *pending*."

### [2:05 – 2:30] — Sisi Aggregator

**VISUAL:** Beralih ke dashboard aggregator (desktop view). Daftar pickup pending muncul. Aggregator menekan tombol "Konfirmasi" — status berubah ke *collected*.

**NARATOR:**
"Di sisi aggregator, dashboard menampilkan semua pickup pending di area mereka. Saat e-waste benar-benar dikumpulkan, mereka mengubah status melalui endpoint `PATCH /pickups/:id/status`. Inilah titik di mana data fisik dan digital tersinkronisasi."

### [2:30 – 2:55] — Sisi Recycler & Sertifikasi

**VISUAL:** Dashboard recycler menampilkan analitik — total kg per bulan, jenis perangkat, dan tombol "Terbitkan Sertifikat" yang menggenerasi PDF *Chain of Custody*.

**NARATOR:**
"Recycler bersertifikasi KLHK — yang lisensi B3-nya sudah diverifikasi admin EcoLoop — menerbitkan sertifikat digital saat material masuk fasilitas mereka. Status pickup berubah ke *certified*. Inilah bukti audit yang selama ini hilang dari ekosistem e-waste Indonesia."

---

## SEGMEN 4 — DAMPAK & TEMA (2:55 – 4:00)

### [2:55 – 3:20] — Proyeksi Dampak

**VISUAL:** Infografik bersih dengan angka besar yang muncul satu per satu:
- "10.000 pengguna aktif"
- "× 2 kg × 2 pickup/tahun"
- "= 40.000 kg e-waste/tahun"
- Lalu menampilkan: "5 kota × 3 tahun → kontribusi menuju target nasional 25%"

**NARATOR:**
"Dengan 10.000 pengguna aktif yang masing-masing melakukan dua pickup setahun, EcoLoop dapat memulihkan 40.000 kilogram e-waste per tahun di Jakarta saja. Diskalakan ke lima kota dalam tiga tahun, kontribusi ini akan mendorong angka recycling rate nasional dari 17,4% menuju target 25%."

### [3:20 – 3:40] — Target Pengguna & Keberlanjutan

**VISUAL:** Tiga kartu persona berdampingan:
1. Masyarakat urban 18–35 tahun
2. Aggregator komunitas (RT/RW, organisasi mahasiswa, bank sampah)
3. Recycler bersertifikasi KLHK

Lalu tiga tier model bisnis muncul: Gratis · B2B EPR · Rp150rb/bln Recycler.

**NARATOR:**
"Target kami jelas: masyarakat urban yang mengganti perangkat dengan cepat, aggregator komunitas yang butuh legitimasi, dan recycler yang butuh supply terstruktur. Model freemium kami memastikan masyarakat selalu gratis, sementara monetisasi datang dari produsen elektronik untuk laporan ESG dan recycler untuk analitik compliance."

### [3:40 – 4:00] — Penutup: Planetary Stewardship

**VISUAL:** Kembali ke shot pembuka — tangan membuang smartphone — namun kali ini ke drop box EcoLoop, bukan tempat sampah. Sertifikat digital muncul di layar HP pengguna. Cut to fade ke logo EcoLoop dengan tagline.

**NARATOR:** (tempo lebih lambat, reflektif)
"EcoLoop bukan sekadar aplikasi pembuangan. Setiap kilogram e-waste yang kembali ke recycler bersertifikasi adalah logam yang kembali ke rantai produksi — mengurangi pertambangan primer yang merusak ekosistem. Inilah *Regenerative Living* yang konkret. Inilah *Systemic Harmony* antara teknologi, manusia, alam, dan tata kelola. Kami percaya, masa depan bumi tidak ditentukan oleh seberapa banyak yang kita buang — tapi seberapa banyak yang kita kembalikan."

**[VISUAL AKHIR]:** Logo EcoLoop · "IYREF 2026 · Hackathon Competition" · Nama tim · Logo ITB & SRE ITB.

---

## Lampiran A — Checklist Produksi

| Aset | Keterangan |
|---|---|
| Voice-over | Bahasa Indonesia, intonasi tenang-meyakinkan, tempo 145–160 kata/menit |
| Musik latar | Instrumental ambient, volume -18 dB di bawah voice-over, tanpa drop di segmen 4 |
| Resolusi | 1920×1080 (16:9), 30 fps minimum |
| Screen recording | Gunakan QuickTime/OBS, viewport mobile 390×844 untuk demo PWA |
| Subtitle | Wajib, format SRT; perkuat kejelasan delivery (bobot 10%) |
| Branding | Konsisten — gunakan palet warna logo EcoLoop di semua infografik |

## Lampiran B — Mapping Naskah ke Kriteria Penilaian

| Kriteria (Bobot) | Disampaikan di Segmen | Cara Penyampaian |
|---|---|---|
| Permasalahan & Urgensi (40%) | Segmen 1 (0:00–0:40) | Data KLHK, mini-survei ITB, konsekuensi B3 ireversibel |
| Dampak/Manfaat Solusi (35%) | Segmen 4 (2:55–4:00) | Proyeksi bottom-up, model bisnis, alignment tema |
| Kreativitas & Kualitas Video (15%) | Cold open + closing loop visual | Shot pembuka & penutup yang mirroring |
| Kejelasan Penyampaian (10%) | Sepanjang video | Subtitle, infografik bersih, tempo voice-over |
