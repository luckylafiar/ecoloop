# Panduan GitHub untuk EcoLoop — Dari Nol

> **Konteks Anda:** Pair programming di 1 laptop, belum pernah pakai Git, repo akan public.
> **Hasil akhir:** Repo `ecoloop` di GitHub yang ter-update setiap kali commit, siap dilink di submission classroom.

---

## Bagian 1 — Setup Awal (Sekali Saja, ~30 menit)

### Step 1.1 — Install Git (5 menit)

**Windows:**
1. Download dari [git-scm.com/download/win](https://git-scm.com/download/win)
2. Install dengan setting default (Next-Next-Next saja)
3. Buka **Git Bash** dari Start Menu — ini terminal yang akan Anda pakai untuk semua perintah Git

**macOS:**
1. Buka **Terminal** (Spotlight: cmd+space, ketik "terminal")
2. Ketik `git --version`. Kalau Git belum ada, macOS akan menawarkan install — klik **Install**.

**Verifikasi:**
```bash
git --version
# git version 2.40.0 atau lebih baru → OK
```

### Step 1.2 — Daftar Akun GitHub (5 menit)

Lewati kalau sudah punya. Kalau belum:
1. Buka [github.com/signup](https://github.com/signup)
2. Pilih **email pribadi**, bukan email kampus — kampus kadang block notifikasi GitHub.
3. Username yang professional (ini akan muncul di submission Anda). Saran: nama belakang + tahun, misal `gultom2026`.
4. Free plan sudah cukup untuk hackathon.

### Step 1.3 — Konfigurasi Identitas Git (3 menit)

Git perlu tahu siapa yang membuat commit. Buka Git Bash / Terminal:

```bash
git config --global user.name "Poggy Gultom"
git config --global user.email "email-yang-sama-dengan-github@gmail.com"
git config --global init.defaultBranch main
```

> **Penting:** email ini harus sama dengan email GitHub Anda, kalau tidak commit Anda tidak akan ter-link ke profil GitHub (warna hijau di profile page tidak muncul).

Cek konfigurasi:
```bash
git config --list | grep user
# user.name=Poggy Gultom
# user.email=email-yang-sama-dengan-github@gmail.com
```

### Step 1.4 — Setup Authentication (10 menit)

Sekarang GitHub butuh tahu bahwa laptop Anda boleh push ke akunnya. Cara termudah untuk pemula adalah **Personal Access Token (PAT)** — bukan SSH key.

1. Login GitHub di browser.
2. Klik foto profil kanan-atas → **Settings** → scroll bawah → **Developer settings** (paling bawah sidebar kiri) → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.
3. Isi:
   - **Note**: `Laptop Hackathon EcoLoop`
   - **Expiration**: 30 days (cukup untuk hackathon)
   - **Scopes**: centang **`repo`** saja (cukup untuk push/pull repo private maupun public)
4. Klik **Generate token** di paling bawah.
5. **Copy token-nya sekarang** (mulai dengan `ghp_...`). Kalau ditutup, Anda harus generate ulang — token tidak bisa dilihat lagi.
6. Simpan di catatan sementara (Notes / Notepad). Nanti dipakai sekali waktu push pertama.

> **Kenapa pakai PAT bukan password biasa?** Sejak 2021 GitHub tidak menerima password lagi untuk operasi Git. PAT adalah pengganti.

---

## Bagian 2 — Buat Repo & Push Pertama (~20 menit)

### Step 2.1 — Buat Repo Kosong di GitHub

1. Login GitHub → klik tombol **+** kanan-atas → **New repository**
2. Isi:
   - **Repository name**: `ecoloop`
   - **Description**: `Platform Ekosistem Digital E-Waste Indonesia · IYREF 2026`
   - **Public** ← pilih ini (rekomendasi saya)
   - **JANGAN** centang "Add a README file", "Add .gitignore", atau "Choose a license". Kosongkan semua. Kita akan push dari laptop, bukan create dari GitHub.
3. Klik **Create repository**.

GitHub akan menampilkan halaman "quick setup". Biarkan tab itu tetap terbuka — di situ ada URL yang akan kita pakai.

### Step 2.2 — Susun Folder di Laptop

Buat satu folder yang akan jadi repo Anda. Saran lokasi: `Documents/projects/ecoloop`.

Sekarang **letakkan semua file yang sudah saya buat** di folder ini, dengan struktur persis seperti ini:

```
ecoloop/
├── README.md                    ← dari deliverable Tahap 1
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── index.js
│       ├── lib/
│       │   └── validate.js
│       ├── db/
│       │   ├── schema.sql
│       │   ├── supabase.js
│       │   └── seed.js
│       ├── middlewares/
│       │   └── auth.js
│       └── routes/
│           ├── auth.js
│           ├── pickups.js
│           └── dropboxes.js
└── docs/
    ├── SETUP_HARI_1-2.md
    ├── SETUP_HARI_2-3.md
    └── Naskah_Video_EcoLoop.md
```

> **Catatan:** `Naskah_Video_EcoLoop.md` di-commit juga karena mendokumentasikan proses tim — bukan rahasia. Kalau Anda lebih suka, bisa di luar repo.

### Step 2.3 — Buat .gitignore Root

Selain `.gitignore` di folder `server/`, buat satu lagi di root `ecoloop/.gitignore` dengan isi:

```gitignore
# Lingkungan & rahasia
.env
.env.local
*.env

# OS noise
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/
*.swp

# Node
node_modules/

# Log
*.log
npm-debug.log*

# Build
dist/
build/
```

> Ini lapisan pertahanan tambahan supaya kalau Anda lupa bekerja dari subfolder, file rahasia tetap aman.

### Step 2.4 — Inisialisasi Git Lokal

Buka terminal **di dalam folder `ecoloop/`**:

**Windows (Git Bash):** klik kanan di folder → **Git Bash Here**
**macOS:** buka Terminal → `cd ~/Documents/projects/ecoloop`

Jalankan:
```bash
git init
git add .
git status
```

`git status` akan menampilkan daftar semua file yang akan di-commit. **Periksa daftar ini** — pastikan **TIDAK ADA `.env`** di sana. Yang boleh ada hanya `.env.example`.

Kalau `.env` muncul (artinya ter-track), berhenti dan jalankan:
```bash
git rm --cached server/.env
```

Kalau aman, lanjut:
```bash
git commit -m "feat: initial commit - schema, auth, pickups, dropboxes (hari 1-3)"
```

### Step 2.5 — Hubungkan ke GitHub & Push Pertama

Kembali ke tab GitHub yang berisi quick setup. Copy URL HTTPS, formatnya:
```
https://github.com/USERNAME-ANDA/ecoloop.git
```

Di terminal:
```bash
git remote add origin https://github.com/USERNAME-ANDA/ecoloop.git
git branch -M main
git push -u origin main
```

Saat push, terminal akan tanya:
- **Username**: ketik username GitHub Anda
- **Password**: paste **PAT yang sudah Anda generate di Step 1.4**, BUKAN password GitHub

> Di Git Bash, password tidak terlihat saat diketik (tidak ada bintang). Itu normal — paste saja dan tekan Enter.

Kalau berhasil, output akan seperti:
```
Enumerating objects: 18, done.
...
To https://github.com/USERNAME-ANDA/ecoloop.git
 * [new branch]      main -> main
```

Refresh tab GitHub → semua file Anda sudah ada di sana. **README.md akan otomatis ditampilkan di bawah**.

### Step 2.6 — Cache Token (Opsional Tapi Sangat Disarankan)

Supaya tidak perlu paste PAT setiap push, simpan ke credential helper:

**Windows:** sudah otomatis (Windows Credential Manager).
**macOS:**
```bash
git config --global credential.helper osxkeychain
```

Push lagi sekali, masukkan PAT — selanjutnya akan diingat.

---

## Bagian 3 — Workflow Harian (Yang Akan Anda Ulang Terus)

Setiap kali Anda berdua selesai mengerjakan satu fitur kecil, lakukan tiga perintah ini:

```bash
git add .
git commit -m "feat: tambah endpoint POST /pickups dengan validasi device"
git push
```

Selesai. Itu saja. Tiga perintah, ulangi terus.

### Frekuensi Commit

**Commit setiap kali ada milestone kecil**, jangan tunggu sampai banyak. Saran:
- Setelah `npm run seed` berhasil → commit
- Setelah endpoint POST /pickups bisa di-test → commit
- Setelah validasi device_type ditambahkan → commit
- Setelah landing page React jadi → commit

Target Anda: **minimal 10–15 commit total selama hackathon**. Juri sering melihat commit history untuk memverifikasi bahwa pekerjaan benar-benar dikerjakan progresif, bukan dump 1 commit besar di hari terakhir.

### Format Pesan Commit yang Disarankan

Pakai prefix singkat — ini standar industri (Conventional Commits):

| Prefix | Untuk apa | Contoh |
|---|---|---|
| `feat:` | Fitur baru | `feat: tambah haversine RPC dropboxes` |
| `fix:` | Bug fix | `fix: device_type smartphone diganti phone` |
| `docs:` | Dokumentasi | `docs: update README dengan endpoint baru` |
| `chore:` | Setup, config, dll | `chore: konfigurasi cors origin` |
| `refactor:` | Bersih-bersih kode | `refactor: ekstrak validator ke lib/` |

Pesan dalam Bahasa Indonesia atau Inggris konsisten saja — pilih satu, jangan campur.

---

## Bagian 4 — Troubleshooting Umum

**`fatal: not a git repository`**
→ Anda tidak di folder repo. `cd` ke folder `ecoloop` dulu.

**`Your branch is up to date with 'origin/main'.` tapi GitHub kosong**
→ Anda commit tapi belum push. Jalankan `git push`.

**`error: failed to push some refs`**
→ Ada perubahan di GitHub yang belum di-pull (jarang terjadi kalau cuma 1 laptop, tapi bisa kalau Anda edit langsung via GitHub web). Jalankan: `git pull origin main --rebase` lalu `git push`.

**`Authentication failed`**
→ PAT salah atau expired. Generate baru di GitHub Settings.

**Tidak sengaja commit `.env`**
→ Segera lakukan:
```bash
git rm --cached server/.env
echo "server/.env" >> .gitignore
git add .gitignore
git commit -m "chore: remove committed .env"
git push
```
Lalu **regenerate `SUPABASE_SERVICE_ROLE_KEY`** di Supabase Dashboard, karena key lama sudah ter-expose di history GitHub. Ini langkah keamanan wajib — siapa saja yang clone repo Anda di masa lalu sebelum dihapus bisa lihat key-nya.

**Mau lihat history commit:**
```bash
git log --oneline
```

**Mau batalkan commit terakhir (yang BELUM di-push):**
```bash
git reset --soft HEAD~1
```
File tetap aman, hanya commit-nya yang dibatalkan.

**Mau batalkan perubahan file yang BELUM di-commit:**
```bash
git checkout -- nama-file.js
```

---

## Bagian 5 — Checklist Sebelum Submit ke Classroom

Sebelum Anda paste link GitHub ke Google Classroom, pastikan:

- [ ] Repo bisa diakses oleh orang lain (kalau public, buka di browser tanpa login → harus terlihat)
- [ ] `README.md` muncul otomatis di halaman utama repo
- [ ] Folder `server/src/` lengkap dengan semua file
- [ ] **TIDAK ADA `.env`** di repo — cek dengan search di GitHub: kotak search di repo → ketik `.env` → hanya `.env.example` yang boleh muncul
- [ ] Minimal 10 commit dengan pesan deskriptif
- [ ] Commit terakhir adalah versi yang benar-benar mau Anda submit (bukan WIP yang error)
- [ ] Link yang Anda submit adalah `https://github.com/USERNAME/ecoloop`, bukan link ke file individual

---

## Bagian 6 — Bonus: Bikin Repo Anda Terlihat Profesional

Hal-hal kecil yang dilihat juri tapi sering dilupakan:

**1. Tambahkan topik ke repo.**
Di halaman repo GitHub → klik gear icon di sebelah "About" → tambahkan topics: `ewaste`, `circular-economy`, `sustainability`, `react`, `supabase`, `nodejs`, `pwa`, `hackathon`. Topics membuat repo Anda searchable dan terkesan terkurasi.

**2. Tambahkan deskripsi & website link.**
Sambil di "About" → isi deskripsi singkat (1 baris) dan kalau Anda sudah deploy ke Vercel, paste link-nya di field "Website". Link akan muncul di pojok atas repo.

**3. Pin repo di profil.**
Di profile page Anda → kalau Anda berkontribusi ke beberapa project, pin `ecoloop` supaya muncul paling atas. Profile → **Customize your pins** → centang `ecoloop`.

**4. Buat satu commit terakhir yang "bersih".**
Sebelum submit final, lakukan commit dengan pesan yang menggambarkan keseluruhan, misal:
```bash
git commit --allow-empty -m "chore: finalisasi MVP untuk submission IYREF 2026"
git push
```

Ini akan jadi commit terakhir yang dilihat juri ketika mereka buka repo.

---

## Catatan Pair Programming

Karena Anda berdua kerja di 1 laptop, kalian **tidak perlu** belajar branching, pull request, atau merge sekarang. Itu untuk skenario kerja paralel di laptop berbeda.

Tapi karena hackathon ini didokumentasikan untuk publik, ada baiknya **dua-duanya muncul sebagai contributor**. Cara termudah:

Setiap beberapa commit, ganti `user.email` di config Git ke email yang lain:
```bash
# Saat Raifal yang ngetik commit:
git config user.email "raifal@email.com"
git commit -m "..."

# Saat Poggy yang ngetik:
git config user.email "poggy@email.com"
git commit -m "..."
```

Dengan begitu di GitHub akan terlihat **dua avatar** di contributor section — bukti tim ini benar-benar berdua yang kerja, bukan satu orang.

Atau pakai cara yang lebih jelas: di pesan commit tambahkan co-author di baris terakhir:
```bash
git commit -m "feat: tambah endpoint pickups

Co-authored-by: Raifal Rosaldi <raifal@email.com>"
```

GitHub akan menghitung commit ini untuk dua orang sekaligus.
