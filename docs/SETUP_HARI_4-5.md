# Setup Hari 4–5 — Dashboard Aggregator + Recycler + Sertifikat

> Bobot rubrik untuk halaman ini: **Fungsionalitas Inti (35%)** + **UI/UX (15%)** = 50% nilai produk. Plus, sertifikat = visual klimaks video (segmen 2:30-2:55).

---

## File Baru

```
client/src/pages/
├── Certificate.jsx              ← halaman sertifikat printable
├── AggregatorDashboard.jsx      ← queue + dropbox manage
├── RecyclerDashboard.jsx        ← inbox + analitik + history
└── Login.jsx                    ← UPDATED: redirect role-based

client/src/components/
└── Header.jsx                   ← UPDATED: nav role-aware + role badge

client/src/
└── App.jsx                      ← UPDATED: routes baru
```

---

## Alur Demo End-to-End (yang harus diuji)

Setelah Anda salin file-file ini ke client repo:

```bash
cd client
npm install              # jika belum
npm run dev
```

Buka `http://localhost:5173` dan jalankan **alur lengkap** ini:

### 1. Sebagai User
1. Klik "Masuk" → klik "Masyarakat" (auto-isi `demo.user@ecoloop.id`)
2. Header menampilkan badge `MASYARAKAT`
3. Otomatis redirect ke `/new-pickup`
4. Daftarkan pickup baru: pilih **HP**, berat 0.18 kg, pilih dropbox di peta
5. Berhasil → muncul ID pickup
6. Logout

### 2. Sebagai Aggregator
1. Login dengan tombol "Aggregator" → otomatis ke `/dashboard/aggregator`
2. Header: badge `AGGREGATOR`
3. Stats teratas menunjukkan jumlah pending naik (pickup yang baru saja dibuat user)
4. Klik **"Konfirmasi terima"** → status berubah ke `confirmed`, pindah ke seksi berikut
5. Klik **"Tandai terkumpul"** → status berubah ke `collected`
6. (Opsional) Coba seksi "Tambah drop box" — buat dropbox baru dengan koordinat sendiri
7. Logout

### 3. Sebagai Recycler ← KLIMAKS DEMO
1. Login dengan tombol "Recycler" → otomatis ke `/dashboard/recycler`
2. Header: badge `RECYCLER` warna terracotta (visual cue beda dari role lain)
3. Inbox menampilkan pickup yang baru saja di-collect (dengan border terracotta)
4. Klik **"Terbitkan sertifikat →"**
5. Modal konfirmasi muncul, menampilkan URL sertifikat yang akan digenerate
6. Klik "Terbitkan & buka"
7. **Tab baru terbuka menampilkan halaman sertifikat formal** dengan:
   - Letterhead EcoLoop
   - Nomor sertifikat unik (mis. `EL/2026/05/9F3C1A`)
   - Tabel estimasi pemulihan material (Cu, Au, Al, dll.)
   - Segel "Verified EcoLoop 2026" CSS-only stamp
8. Klik tombol **"Cetak / simpan PDF"** di toolbar atas
9. Browser print dialog terbuka — sertifikat di-render rapi untuk A4

> Inilah momen yang akan direkam di video segmen 2:30–2:55. Lebih impressive dari "PDF generated" di naskah aslinya — karena URL sertifikat itu sendiri **adalah** mekanisme verifikasi.

---

## Update Naskah Video (Hanya Segmen 2:30-2:55)

Ganti naskah segmen 2:30–2:55 di `Naskah_Video_EcoLoop.md` dengan versi yang memanfaatkan sertifikat real:

> **VISUAL:** Switch ke dashboard recycler. Highlight stat cards di atas (kg processed, sertifikat issued). Cursor ke tombol "Terbitkan sertifikat" di inbox. Klik → modal muncul → konfirmasi → tab baru terbuka dengan halaman sertifikat → cursor scroll perlahan ke bawah memperlihatkan tabel pemulihan material dan segel verifikasi. Akhiri dengan zoom-in ke nomor sertifikat `EL/2026/05/...` di pojok kanan atas.
>
> **NARATOR:** "Recycler bersertifikat KLHK menerbitkan sertifikat dengan satu klik. Sistem otomatis menghasilkan dokumen chain-of-custody yang dapat diaudit — bukan sekadar entri database, tapi halaman yang dapat dicetak, dibagikan, dan diverifikasi secara independen oleh pihak ketiga. Inilah artefak audit yang selama ini hilang dari ekosistem e-waste Indonesia."

Perubahan kunci: kata "PDF" diganti "halaman yang dapat dicetak, dibagikan, dan diverifikasi" — karena sertifikat kita HTML printable (lebih powerful dari PDF statis).

---

## Hal-Hal yang Patut Dicatat untuk Pitch

1. **URL sertifikat = mekanisme verifikasi.** Saat juri tanya "bagaimana audit independen mungkin?", jawabannya: "Anyone can hit `/certificates/{uuid}` and see the same document. The URL itself is the verification — no central authority needed."

2. **Estimasi pemulihan logam memberi bobot ke klaim sirkular.** Banyak proposal berbicara "logam kembali ke rantai produksi" tapi tanpa angka. Tabel estimasi (Cu 32-38 g/kg untuk laptop, dll.) berbasis literatur compositional analysis e-waste — gives the certificate scientific credibility.

3. **Print stylesheet @media print sudah dikonfigurasi.** Saat juri minta hard copy bukti, recycler bisa langsung cetak di printer kantor. Ini membedakan dari kompetitor yang hanya punya layar.

4. **Aggregator dapat menambah dropbox dari dashboard.** Bukan sekadar konsumen sistem — mereka adalah **kontributor jaringan**. Differentiator vs Octopus/Duitin yang infrastrukturnya statis.

5. **Analitik device-type breakdown di recycler dashboard.** Visualisasi langsung ini menjawab klaim model bisnis B2B EPR di proposal: produsen elektronik membayar untuk **data yang seperti ini**, bukan abstraksi.

---

## Smoke Test Cepat (Sebelum Push)

```bash
# Backend running
cd server && npm run dev   # Terminal 1

# Frontend running
cd client && npm run dev   # Terminal 2

# Buka http://localhost:5173
# Login sebagai recycler → cek dashboard ter-render
# Klik "Terbitkan sertifikat" → cek halaman sertifikat ter-render
# Cek halaman sertifikat: print preview (Cmd/Ctrl+P) → A4 layout bersih
```

---

## Definition of Done — Hari 5 Selesai

- [ ] Login.jsx redirect ke dashboard yang tepat per role
- [ ] Header.jsx menampilkan badge role yang benar (terracotta untuk recycler)
- [ ] AggregatorDashboard: 4 stat cards, 4 queue groups dengan tombol action yang berfungsi
- [ ] AggregatorDashboard: form tambah dropbox berfungsi (POST /api/dropboxes)
- [ ] RecyclerDashboard: inbox menunjukkan pickup status='collected'
- [ ] RecyclerDashboard: tombol "Terbitkan sertifikat" memunculkan modal, lalu generate URL
- [ ] Halaman sertifikat ter-render lengkap dengan letterhead, tabel pemulihan, segel
- [ ] Tombol "Cetak / simpan PDF" di sertifikat memunculkan browser print dialog
- [ ] @media print menyembunyikan toolbar dan optimasi A4

---

## Yang Tersisa Setelah Hari 5

Backend & frontend pada dasarnya **sudah lengkap untuk MVP**. Yang tersisa di Hari 5–6:

- **Hari 5**: Deploy ke Vercel (FE) + Railway (BE) — sehingga juri bisa akses URL publik
- **Hari 6**: Rekam video, edit, submit

Frontend Anda sudah punya:
- Landing editorial yang membedakan dari aplikasi recycle generik
- Flow user → aggregator → recycler yang seamless
- Sertifikat yang bisa dicetak — visual klimaks video
- 6 halaman role-aware: Landing, Login, NewPickup, Pickups, AggregatorDashboard, RecyclerDashboard, Certificate

Tinggal record demo dan finalize submission.
