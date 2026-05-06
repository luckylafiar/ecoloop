# Setup Hari 2–3 — Endpoint Pickups & Dropboxes (Alur Inti)

> **Bobot rubrik:** Fungsionalitas Inti (35%) + Relevansi Solusi (35%) = **70% dari nilai produk**. Hari ini paling kritis.

---

## File Baru di Hari 2–3

```
server/src/
├── lib/
│   └── validate.js              ← validator ringan tanpa zod
├── routes/
│   ├── pickups.js               ← POST/GET/PATCH alur inti
│   └── dropboxes.js             ← GET haversine + POST registrasi
└── index.js                     ← updated: mount kedua routes
```

---

## Ringkasan Endpoint

| Method | Path | Auth | Role | Fungsi |
|---|---|---|---|---|
| POST   | `/api/pickups`            | ✓ | user        | Buat pickup baru, validasi dropbox accept device |
| GET    | `/api/pickups`            | ✓ | role-aware  | List terfilter berdasarkan role pengguna |
| GET    | `/api/pickups/:id`        | ✓ | party-only  | Detail dengan ownership check |
| PATCH  | `/api/pickups/:id/status` | ✓ | aggr/recyc  | Transisi state machine 4-tahap |
| GET    | `/api/dropboxes?lat=&lng=&radius=` | ✗ Public | — | Haversine via RPC |
| GET    | `/api/dropboxes/:id`      | ✗ Public | — | Detail dropbox aktif |
| POST   | `/api/dropboxes`          | ✓ | aggregator  | Registrasi dropbox baru (verified) |

---

## State Machine `pickup_status`

```
   ┌──────────┐  aggregator  ┌─────────────┐  aggregator  ┌────────────┐  recycler  ┌─────────────┐
   │ pending  │ ───────────► │ confirmed   │ ───────────► │ collected  │ ─────────► │ certified   │
   └──────────┘  konfirmasi  └─────────────┘  jemput/ambil└────────────┘  +CoC URL  └─────────────┘
   user create                                                                       (terminal)
```

Semua aturan di-enforce di `routes/pickups.js` lewat tabel `TRANSITIONS`. Transisi ilegal → `400 invalid_transition` dengan detail `from`/`to`.

---

## Testing Playbook (curl)

> Pastikan server jalan (`npm run dev`) dan seed sudah dijalankan dari Hari 1–2.

### 1) GET dropboxes terdekat (public, no auth)

Koordinat ITB Ganesha:

```bash
curl "http://localhost:4000/api/dropboxes?lat=-6.8915&lng=107.6107&radius=5"
```

Expected: 3 dropbox ter-sort by `distance_km`. Drop Box ITB Ganesha = `0.00` km.

### 2) Login sebagai user dan simpan token

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.user@ecoloop.id","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' | sed 's/.*:"//;s/"//')
echo "Token: ${TOKEN:0:40}..."
```

### 3) Ambil dropbox_id (untuk pickup)

```bash
DROPBOX_ID=$(curl -s "http://localhost:4000/api/dropboxes?lat=-6.8915&lng=107.6107" \
  | grep -o '"id":"[^"]*"' | head -1 | sed 's/.*:"//;s/"//')
echo "Dropbox ID: $DROPBOX_ID"
```

### 4) POST pickup baru — kasus sukses

```bash
curl -X POST http://localhost:4000/api/pickups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"device_type\":\"phone\",\"estimated_weight\":0.18,\"dropbox_id\":\"$DROPBOX_ID\"}"
```

Expected `201`:
```json
{
  "id": "...", "status": "pending", "device_type": "phone",
  "estimated_weight": 0.18, "aggregator_id": "...", "created_at": "..."
}
```

> Perhatikan `aggregator_id` ter-isi otomatis dari pemilik dropbox.

### 5) POST pickup — kasus gagal (device_type ditolak dropbox)

```bash
# Drop Box RW Dago hanya menerima ['phone','cable','battery'] — kita coba kirim 'laptop'
DAGO_ID=$(curl -s "http://localhost:4000/api/dropboxes?lat=-6.8825&lng=107.6158&radius=1" \
  | grep -o '"id":"[^"]*"' | head -1 | sed 's/.*:"//;s/"//')

curl -X POST http://localhost:4000/api/pickups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"device_type\":\"laptop\",\"estimated_weight\":2.5,\"dropbox_id\":\"$DAGO_ID\"}"
```

Expected `400`:
```json
{ "error": "device_type_not_accepted", "accepted": ["phone","cable","battery"] }
```

### 6) GET pickups — user view

```bash
curl http://localhost:4000/api/pickups -H "Authorization: Bearer $TOKEN"
```

Expected: 4 pickup dari seed + 1 dari step 4 = **5 row**, semua `user_id` = demo.user.

### 7) Login sebagai aggregator dan PATCH status

```bash
AGG_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.aggregator@ecoloop.id","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' | sed 's/.*:"//;s/"//')

# Ambil pickup yang baru saja dibuat di step 4 (status: pending)
PENDING_ID=$(curl -s http://localhost:4000/api/pickups \
  -H "Authorization: Bearer $AGG_TOKEN" \
  | grep -o '"id":"[^"]*"' | head -1 | sed 's/.*:"//;s/"//')

# Konfirmasi (pending → confirmed)
curl -X PATCH "http://localhost:4000/api/pickups/$PENDING_ID/status" \
  -H "Authorization: Bearer $AGG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

Expected `200`: `status: "confirmed"`.

### 8) PATCH — kasus gagal (transisi ilegal)

```bash
# User coba lompat langsung pending → certified
curl -X PATCH "http://localhost:4000/api/pickups/$PENDING_ID/status" \
  -H "Authorization: Bearer $AGG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"certified"}'
```

Expected `400`:
```json
{ "error": "invalid_transition", "from": "confirmed", "to": "certified" }
```

> *Setelah step 7, status sudah `confirmed`, sehingga transisi langsung ke `certified` ditolak — harus lewat `collected` dulu oleh aggregator. Contoh sempurna state machine bekerja.*

### 9) Recycler certify — happy path lengkap

```bash
# Aggregator: confirmed → collected
curl -X PATCH "http://localhost:4000/api/pickups/$PENDING_ID/status" \
  -H "Authorization: Bearer $AGG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"collected"}'

# Recycler login, certify
REC_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.recycler@ecoloop.id","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' | sed 's/.*:"//;s/"//')

curl -X PATCH "http://localhost:4000/api/pickups/$PENDING_ID/status" \
  -H "Authorization: Bearer $REC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"certified","certificate_url":"https://example.com/coc-9f3.pdf"}'
```

Expected `200`: `status: "certified"`, `certificate_url` ter-isi, `recycler_id` ter-link.

---

## Definition of Done — Hari 3

Centang setelah verifikasi:

- [ ] `GET /api/dropboxes?lat=-6.8915&lng=107.6107` mengembalikan 3 dropbox dengan `distance_km` valid
- [ ] `POST /api/pickups` berhasil membuat row dan **mengisi `aggregator_id` otomatis** dari dropbox
- [ ] Validasi device_type ditolak ketika tidak match dengan `accepted_device_types` dropbox
- [ ] `GET /api/pickups` mengembalikan list yang **terfilter berdasarkan role**
- [ ] State machine: transisi ilegal (mis. `pending → certified`) ditolak `400`
- [ ] PATCH `certified` **wajib** ada `certificate_url`, jika tidak ada → `400`
- [ ] Aggregator/recycler tidak terverifikasi → `403 not_verified`

---

## Kesalahan Umum & Penyelesaian

**`rpc nearby_dropboxes` error: "function not found"**
→ Schema belum lengkap di-run. Cek di Supabase SQL Editor: `SELECT * FROM pg_proc WHERE proname = 'nearby_dropboxes';` harus return 1 row.

**PATCH selalu return `403 aggregator_not_verified`**
→ Cek tabel `aggregators` di dashboard, pastikan kolom `verified = true`. Seed sudah set ini, tapi jika dibuat manual via UI nanti, perlu admin approval.

**`POST /pickups` return `500 db_error`**
→ Periksa log server Express. Umumnya FK constraint: `dropbox_id` valid tapi `aggregator_id` di dropbox tersebut tidak valid (jarang, hanya jika data corrupted).

**Public `GET /dropboxes` butuh auth**
→ Pastikan `requireAuth` **tidak** dipasang di route ini. Endpoint ini sengaja public agar landing page bisa render peta tanpa user login dulu.

---

## Yang Disiapkan untuk Hari 3–4

Endpoint API sudah lengkap untuk alur inti. Hari berikutnya: frontend React PWA — landing page dengan peta Leaflet (panggil `GET /api/dropboxes`), form daftar pickup (panggil `POST /api/pickups`), dashboard tiga role yang menampilkan `GET /api/pickups` filter status.

Karena endpoint sudah role-aware, frontend cukup login dengan akun demo yang sesuai dan otomatis melihat data yang relevan untuk role tersebut — tidak perlu logic filter di FE.
