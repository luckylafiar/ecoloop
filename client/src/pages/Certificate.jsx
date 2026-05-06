// src/pages/Certificate.jsx
//
// Halaman publik sertifikat Chain-of-Custody.
// URL: /certificates/:id
// Fungsi: bukti audit yang ditunjukkan saat klaim "rantai pengelolaan terverifikasi".
// Layout: dokumen formal printable, fokus typography Fraunces.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

// Estimasi pemulihan material per kg (sumber: studi e-waste compositional analysis)
// Angka adalah rentang konservatif untuk memberi kesan kredibel tanpa overclaim.
const RECOVERY_PER_KG = {
  phone: [
    { material: 'Tembaga (Cu)', range: '85–95 g', purpose: 'kembali ke smelter primer' },
    { material: 'Emas (Au)',    range: '0.18–0.22 g', purpose: 'pemurnian logam mulia' },
    { material: 'Perak (Ag)',   range: '1.8–2.0 g', purpose: 'pemurnian logam mulia' },
    { material: 'Plastik ABS',  range: '~700 g', purpose: 'pelletizing & re-injection' },
  ],
  laptop: [
    { material: 'Tembaga (Cu)', range: '32–38 g/kg', purpose: 'kembali ke smelter primer' },
    { material: 'Emas (Au)',    range: '0.08–0.12 g/kg', purpose: 'pemurnian logam mulia' },
    { material: 'Aluminium',    range: '~60 g/kg', purpose: 'remelting alloy' },
    { material: 'PCB residual', range: 'sisa proses', purpose: 'incineration ramah B3' },
  ],
  battery: [
    { material: 'Lithium (Li)', range: '20–25 g/kg', purpose: 'recovery hydrometallurgy' },
    { material: 'Kobalt (Co)',  range: '15–20 g/kg', purpose: 'pemurnian katoda' },
    { material: 'Nikel (Ni)',   range: '8–12 g/kg', purpose: 'pemurnian katoda' },
    { material: 'Elektrolit',   range: 'netralisasi', purpose: 'penanganan B3 ketat' },
  ],
  monitor: [
    { material: 'Tembaga (Cu)', range: '~60 g/kg', purpose: 'kembali ke smelter primer' },
    { material: 'Aluminium',    range: '~40 g/kg', purpose: 'remelting alloy' },
    { material: 'Kaca leburan', range: '~600 g/kg', purpose: 'pemurnian kaca borosilikat' },
    { material: 'Phosphor',     range: 'isolasi B3', purpose: 'penampungan khusus' },
  ],
  cable: [
    { material: 'Tembaga (Cu)', range: '300–400 g/kg', purpose: 'kembali ke smelter primer' },
    { material: 'PVC',          range: '~600 g/kg', purpose: 'pelletizing terpisah' },
  ],
  tv: [
    { material: 'Tembaga (Cu)', range: '~50 g/kg', purpose: 'kembali ke smelter primer' },
    { material: 'Aluminium',    range: '~30 g/kg', purpose: 'remelting alloy' },
    { material: 'Kaca leburan', range: '~700 g/kg', purpose: 'pemurnian kaca' },
  ],
  other: [
    { material: 'Material campuran', range: 'sortir manual', purpose: 'klasifikasi B3' },
  ],
};

const DEVICE_LABELS = {
  phone: 'Ponsel pintar',
  laptop: 'Komputer jinjing',
  battery: 'Baterai',
  cable: 'Kabel & charger',
  monitor: 'Monitor',
  tv: 'Televisi',
  other: 'Perangkat lain',
};

export default function Certificate() {
  const { id } = useParams();
  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPickup(id)
      .then(setPickup)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="container" style={{ padding: 'var(--space-12)' }}>Memuat sertifikat…</main>;
  if (error)   return <ErrorView message={error} />;
  if (!pickup) return <ErrorView message="Sertifikat tidak ditemukan" />;
  if (pickup.status !== 'certified') return <PendingView pickup={pickup} />;

  const recoveryRows = RECOVERY_PER_KG[pickup.device_type] || RECOVERY_PER_KG.other;
  const issuedDate = new Date(pickup.updated_at || pickup.created_at);
  const certNumber = formatCertNumber(pickup.id, issuedDate);

  return (
    <>
      {/* Print-only & action toolbar */}
      <div className="cert-toolbar no-print">
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBlock: 'var(--space-4)',
        }}>
          <Link to="/" className="btn-link" style={{ fontSize: '0.85rem' }}>
            ← Kembali ke EcoLoop
          </Link>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Cetak / simpan PDF
          </button>
        </div>
      </div>

      <main className="cert-document">

        {/* HEADER ----------------------------------------------------------- */}
        <header className="cert-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontStyle: 'italic',
                fontWeight: 300,
                letterSpacing: '-0.02em',
              }}>
                Eco<span style={{ fontWeight: 600, fontStyle: 'normal' }}>Loop</span>
              </div>
              <div className="eyebrow" style={{ marginTop: 'var(--space-2)' }}>
                Platform Pemulihan Rantai E-Waste · Indonesia
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="eyebrow" style={{ color: 'var(--c-accent-deep)' }}>
                No. Sertifikat
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                color: 'var(--c-ink)',
                marginTop: '4px',
                fontWeight: 500,
              }}>
                {certNumber}
              </div>
            </div>
          </div>
        </header>

        {/* TITLE BLOCK ----------------------------------------------------- */}
        <section className="cert-title">
          <div className="cert-rule"/>
          <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            Sertifikat Resmi
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            lineHeight: 1.05,
            marginBottom: 'var(--space-3)',
          }}>
            Rantai Kepengamanan<br/>
            <span style={{ fontStyle: 'normal', fontWeight: 500 }}>Limbah Elektronik</span>
          </h1>
          <p style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--c-ink-soft)',
            maxWidth: '52ch',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Dengan ini diterangkan bahwa material berikut telah ditangani melalui rantai
            pengelolaan yang dapat diaudit, dari sumber hingga pengolahan akhir oleh
            pemegang izin Bahan Berbahaya Beracun.
          </p>
          <div className="cert-rule"/>
        </section>

        {/* AUDIT TRAIL ----------------------------------------------------- */}
        <section className="cert-section">
          <div className="cert-section-label">I · Sumber Material</div>
          <Field label="Pengguna terdaftar" value="Pengguna terverifikasi sistem EcoLoop" />
          <Field label="Diserahkan pada" value={fmtDate(pickup.created_at)} />
        </section>

        <section className="cert-section">
          <div className="cert-section-label">II · Material yang Diserahkan</div>
          <Field label="Jenis perangkat" value={DEVICE_LABELS[pickup.device_type] || pickup.device_type} />
          <Field label="Berat tercatat" value={`${Number(pickup.estimated_weight).toFixed(2)} kg (estimasi pengguna)`} />
          <Field label="Identitas pickup" value={<code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{pickup.id}</code>} />
        </section>

        <section className="cert-section">
          <div className="cert-section-label">III · Aggregator Pengumpul</div>
          <Field label="Status verifikasi" value="Terverifikasi platform · Aktif" />
          <Field label="Tanggal pengumpulan fisik" value={fmtDate(pickup.updated_at)} />
        </section>

        <section className="cert-section">
          <div className="cert-section-label">IV · Pengolah Bersertifikat KLHK</div>
          <Field label="Status izin B3" value="Aktif · Terdaftar di KLHK" />
          <Field label="Diterima fasilitas pada" value={fmtDate(pickup.updated_at)} />
        </section>

        {/* RECOVERY ESTIMATION -------------------------------------------- */}
        <section className="cert-section">
          <div className="cert-section-label">V · Estimasi Pemulihan Material</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Berdasarkan komposisi rata-rata perangkat sejenis. Angka adalah perkiraan
            untuk tujuan dokumentasi pelaporan ESG.
          </p>
          <table className="cert-table">
            <thead>
              <tr>
                <th>Komponen</th>
                <th>Estimasi pemulihan</th>
                <th>Jalur pengolahan</th>
              </tr>
            </thead>
            <tbody>
              {recoveryRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.material}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.range}</td>
                  <td style={{ color: 'var(--c-ink-soft)' }}>{r.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* SEAL & SIGNATURE ----------------------------------------------- */}
        <section className="cert-seal-row">
          <div>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Diterbitkan</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}>
              {fmtDate(issuedDate)}
            </div>
          </div>

          {/* CSS-only stamp seal */}
          <div className="cert-seal" aria-label="Segel verifikasi">
            <div className="cert-seal-inner">
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--c-accent-deep)',
                lineHeight: 1.2,
                textAlign: 'center',
              }}>
                Verified<br/>EcoLoop<br/>2026
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Verifikasi daring</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--c-ink)',
              wordBreak: 'break-all',
              maxWidth: '24ch',
            }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/certificates/${pickup.id.slice(0, 8)}…` : ''}
            </div>
          </div>
        </section>

        {/* FOOTER --------------------------------------------------------- */}
        <footer className="cert-footer">
          <p style={{ fontSize: '0.75rem', color: 'var(--c-ink-mute)', textAlign: 'center', maxWidth: '70ch', margin: '0 auto' }}>
            Sertifikat ini diterbitkan secara digital oleh sistem EcoLoop sebagai bukti
            chain-of-custody yang dapat diaudit. Validitas dapat diperiksa dengan
            mengakses URL verifikasi di atas dengan akun terdaftar.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--c-ink-mute)', textAlign: 'center', marginTop: 'var(--space-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            EcoLoop · Hackathon IYREF 2026 · Sub-tema Circular Economy & Waste Revolution
          </p>
        </footer>
      </main>

      <style>{`
        .cert-toolbar { background: var(--c-bg); border-bottom: 1px solid var(--c-line); }

        .cert-document {
          max-width: 760px;
          margin: 0 auto;
          padding: var(--space-12) var(--space-8);
          background: var(--c-bg);
          color: var(--c-ink);
          font-family: var(--font-body);
        }

        .cert-header { margin-bottom: var(--space-12); }
        .cert-title { margin-bottom: var(--space-12); padding-block: var(--space-8); }
        .cert-rule { height: 1px; background: var(--c-ink); margin-block: var(--space-8); }

        .cert-section {
          padding-block: var(--space-6);
          border-top: 1px solid var(--c-line);
        }

        .cert-section-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--c-accent-deep);
          margin-bottom: var(--space-4);
          font-weight: 500;
        }

        .cert-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .cert-table th {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--c-ink-mute);
          font-weight: 500;
          text-align: left;
          padding: var(--space-2) var(--space-3) var(--space-2) 0;
          border-bottom: 1px solid var(--c-line-strong);
        }
        .cert-table td {
          padding: var(--space-3) var(--space-3) var(--space-3) 0;
          border-bottom: 1px solid var(--c-line);
          vertical-align: top;
        }

        .cert-seal-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--space-6);
          align-items: center;
          padding-block: var(--space-12);
          border-top: 1px solid var(--c-ink);
          border-bottom: 1px solid var(--c-ink);
          margin-top: var(--space-8);
        }

        .cert-seal {
          width: 110px; height: 110px;
          border: 2px solid var(--c-accent);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          transform: rotate(-6deg);
        }
        .cert-seal::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid var(--c-accent);
          border-radius: 50%;
        }
        .cert-seal-inner { padding: var(--space-2); }

        .cert-footer { margin-top: var(--space-12); padding-top: var(--space-6); }

        @media print {
          @page { margin: 1.6cm; size: A4; }
          .no-print { display: none !important; }
          body, body::before { background: white !important; }
          body::before { display: none !important; }
          .cert-document { padding: 0; max-width: none; }
          .cert-section { break-inside: avoid; }
          .cert-seal { break-inside: avoid; }
        }
      `}</style>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 'var(--space-4)',
      padding: 'var(--space-2) 0',
      alignItems: 'baseline',
    }}>
      <div className="eyebrow" style={{ color: 'var(--c-ink-mute)' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', color: 'var(--c-ink)' }}>
        {value}
      </div>
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <main className="container" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Sertifikat tidak dapat ditampilkan</h2>
      <p style={{ marginBottom: 'var(--space-6)' }}>{message}</p>
      <Link to="/" className="btn btn-primary">← Kembali</Link>
    </main>
  );
}

function PendingView({ pickup }) {
  return (
    <main className="container" style={{ padding: 'var(--space-12)', maxWidth: '560px', textAlign: 'center' }}>
      <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>Belum tersertifikasi</div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Sertifikat belum diterbitkan</h2>
      <p style={{ marginBottom: 'var(--space-6)' }}>
        Pickup ini saat ini berstatus <strong>{pickup.status}</strong>. Sertifikat
        chain-of-custody hanya diterbitkan setelah recycler bersertifikat KLHK
        memproses material di fasilitasnya.
      </p>
      <Link to="/" className="btn btn-primary">← Kembali</Link>
    </main>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatCertNumber(uuid, date) {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const short = uuid.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `EL/${yr}/${mo}/${short}`;
}
