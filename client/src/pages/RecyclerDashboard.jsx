// src/pages/RecyclerDashboard.jsx
//
// Dashboard untuk role 'recycler' (bersertifikat KLHK).
// Fitur kunci yang menjawab proposal Tahap 1:
//   - Inbox: pickups status='collected' siap diterbitkan sertifikat
//   - Action "Terbitkan Sertifikat": GENERATE URL halaman /certificates/:id otomatis
//   - Analitik: kg per device type, this-month, lifetime — bahan B2B EPR ESG report

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const DEVICE_LABELS = {
  phone: 'Ponsel', laptop: 'Laptop', battery: 'Baterai',
  cable: 'Kabel', monitor: 'Monitor', tv: 'TV', other: 'Lainnya',
};

export default function RecyclerDashboard() {
  const { session, profile, loading: authLoading } = useAuth();
  const nav = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // pickup yg akan disertifikasi

  useEffect(() => {
    if (!authLoading && !session) nav('/login');
    if (!authLoading && profile && profile.role !== 'recycler' && profile.role !== 'admin') {
      nav('/');
    }
  }, [authLoading, session, profile, nav]);

  async function load() {
    setLoading(true);
    try {
      const rows = await api.listPickups();
      setPickups(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session && profile?.role === 'recycler') load(); }, [session, profile]);

  // Bagi data menjadi inbox (siap proses) dan history (sudah disertifikasi)
  const inbox     = useMemo(() => pickups.filter((p) => p.status === 'collected'), [pickups]);
  const certified = useMemo(() => pickups.filter((p) => p.status === 'certified'), [pickups]);

  // Analytics
  const analytics = useMemo(() => {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const allKg = certified.reduce((s, p) => s + Number(p.estimated_weight || 0), 0);
    const monthKg = certified
      .filter((p) => new Date(p.updated_at).getTime() > monthAgo)
      .reduce((s, p) => s + Number(p.estimated_weight || 0), 0);

    // Breakdown per device type
    const byType = {};
    for (const p of certified) {
      const t = p.device_type || 'other';
      byType[t] = (byType[t] || 0) + Number(p.estimated_weight || 0);
    }
    const breakdown = Object.entries(byType)
      .map(([type, kg]) => ({ type, kg, label: DEVICE_LABELS[type] || type }))
      .sort((a, b) => b.kg - a.kg);

    const maxKg = Math.max(...breakdown.map((b) => b.kg), 0.01);

    return { allKg, monthKg, count: certified.length, breakdown, maxKg };
  }, [certified]);

  async function issueCertificate(pickup) {
    setActioning(pickup.id);
    setError(null);
    setConfirmModal(null);
    try {
      // Generate certificate URL — halaman /certificates/:id dirender dari data DB
      const certUrl = `${window.location.origin}/certificates/${pickup.id}`;
      await api.updatePickupStatus(pickup.id, {
        status: 'certified',
        certificate_url: certUrl,
      });
      await load();
      // Buka sertifikat di tab baru sebagai konfirmasi visual
      window.open(certUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(`Gagal terbitkan: ${e.message}`);
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || loading) {
    return <main className="container" style={{ padding: 'var(--space-8)' }}>Memuat dashboard…</main>;
  }

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)' }}>

      {/* HEADER ----------------------------------------------------------- */}
      <div className="rise rise-1" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
          Dashboard · Recycler bersertifikat KLHK
        </div>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>
          {profile?.full_name || 'Fasilitas Pengolahan'}
        </h2>
        <p style={{ maxWidth: '60ch' }}>
          Terima material yang sudah dikumpulkan aggregator, terbitkan sertifikat
          chain-of-custody, dan akses analitik aliran limbah untuk laporan
          compliance & ESG.
        </p>
      </div>

      {/* TOP STATS -------------------------------------------------------- */}
      <div className="rise rise-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-12)',
        paddingBlock: 'var(--space-6)',
        borderTop: '1px solid var(--c-ink)',
        borderBottom: '1px solid var(--c-line)',
      }}>
        <BigStat
          big={inbox.length}
          label="Menunggu sertifikasi"
          emphasis={inbox.length > 0}
        />
        <BigStat
          big={analytics.monthKg.toFixed(2)}
          suffix="kg"
          label="30 hari terakhir"
        />
        <BigStat
          big={analytics.allKg.toFixed(2)}
          suffix="kg"
          label="Total terolah"
        />
        <BigStat
          big={analytics.count}
          label="Sertifikat diterbitkan"
        />
      </div>

      {error && (
        <div className="card" style={{
          background: 'rgba(194, 86, 43, 0.08)',
          borderColor: 'var(--c-accent)',
          marginBottom: 'var(--space-6)',
        }}>
          <div className="field-error">{error}</div>
        </div>
      )}

      {/* INBOX ------------------------------------------------------------ */}
      <section className="rise rise-3" style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: '4px' }}>Inbox · Siap disertifikasi</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', margin: 0 }}>
            Material yang telah diterima fasilitas Anda. Terbitkan sertifikat
            setelah verifikasi fisik selesai.
          </p>
        </div>

        {inbox.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', paddingBlock: 'var(--space-8)' }}>
            <p style={{ color: 'var(--c-ink-soft)' }}>
              Belum ada material yang menunggu sertifikasi.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {inbox.map((p) => (
              <article key={p.id} style={{
                padding: 'var(--space-4) var(--space-5)',
                border: '1px solid var(--c-accent)',
                borderRadius: 'var(--radius)',
                background: 'rgba(194, 86, 43, 0.04)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                    }}>
                      {DEVICE_LABELS[p.device_type] || p.device_type}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: 'var(--c-accent-deep)',
                      fontWeight: 500,
                    }}>
                      {Number(p.estimated_weight).toFixed(2)} kg
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--c-ink-mute)',
                    marginTop: '4px',
                    letterSpacing: '0.06em',
                  }}>
                    Dikumpulkan {new Date(p.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · ID '}{p.id.slice(0, 8)}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmModal(p)}
                  disabled={actioning === p.id}
                  className="btn btn-accent"
                  style={{ padding: '0.7rem 1.2rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                >
                  {actioning === p.id ? 'Memproses…' : 'Terbitkan sertifikat →'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ANALYTICS — bahan untuk laporan B2B EPR -------------------------- */}
      {analytics.breakdown.length > 0 && (
        <section className="rise rise-4" style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              Analitik aliran · Tier compliance
            </div>
            <h3 style={{ marginBottom: '4px' }}>Komposisi material terolah</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', margin: 0 }}>
              Data ini dapat diekspor sebagai lampiran laporan ESG produsen mitra.
            </p>
          </div>

          <div style={{
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-6)',
            background: 'var(--c-bg-deep)',
          }}>
            {analytics.breakdown.map((b) => (
              <BarRow
                key={b.type}
                label={b.label}
                kg={b.kg}
                max={analytics.maxKg}
                pct={(b.kg / analytics.allKg) * 100}
              />
            ))}
          </div>
        </section>
      )}

      {/* HISTORY ---------------------------------------------------------- */}
      {certified.length > 0 && (
        <section className="rise rise-5" style={{ marginBottom: 'var(--space-12)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Riwayat sertifikasi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {certified.map((p) => (
              <article key={p.id} style={{
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--c-line)',
                borderRadius: 'var(--radius)',
                background: 'var(--c-bg)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 'var(--space-3)',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>
                      {DEVICE_LABELS[p.device_type]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-ink-mute)' }}>
                      {Number(p.estimated_weight).toFixed(2)} kg
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--c-ink-mute)',
                    marginTop: '2px',
                  }}>
                    Disertifikasi {new Date(p.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {p.certificate_url && (
                  <Link
                    to={`/certificates/${p.id}`}
                    target="_blank"
                    className="btn btn-ghost"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Lihat sertifikat ↗
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CONFIRM MODAL --------------------------------------------------- */}
      {confirmModal && (
        <ConfirmIssueModal
          pickup={confirmModal}
          onConfirm={() => issueCertificate(confirmModal)}
          onCancel={() => setConfirmModal(null)}
        />
      )}

    </main>
  );
}

// ----------------------------------------------------------------------------

function BigStat({ big, suffix, label, emphasis = false }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.5rem',
        fontWeight: 300,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: emphasis ? 'var(--c-accent)' : 'var(--c-ink)',
      }}>
        {big}
        {suffix && (
          <span style={{
            fontSize: '0.42em',
            marginLeft: '0.18em',
            color: 'var(--c-ink-mute)',
            fontWeight: 400,
          }}>{suffix}</span>
        )}
      </div>
      <div className="eyebrow" style={{ marginTop: 'var(--space-2)' }}>
        {label}
      </div>
    </div>
  );
}

function BarRow({ label, kg, max, pct }) {
  const widthPct = (kg / max) * 100;
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '4px',
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--c-ink-soft)',
        }}>
          {kg.toFixed(2)} kg <span style={{ color: 'var(--c-ink-mute)' }}>· {pct.toFixed(1)}%</span>
        </span>
      </div>
      <div style={{
        height: '8px',
        background: 'var(--c-bg)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${widthPct}%`,
          background: 'var(--c-accent)',
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}/>
      </div>
    </div>
  );
}

function ConfirmIssueModal({ pickup, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(31, 42, 28, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--c-bg)',
        border: '1px solid var(--c-line-strong)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-8)',
        maxWidth: '480px',
        width: '100%',
      }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-3)', color: 'var(--c-accent-deep)' }}>
          Konfirmasi penerbitan
        </div>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>
          Terbitkan sertifikat chain-of-custody?
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-soft)', marginBottom: 'var(--space-6)' }}>
          Tindakan ini akan menyatakan bahwa material{' '}
          <strong>{DEVICE_LABELS[pickup.device_type]} {Number(pickup.estimated_weight).toFixed(2)} kg</strong>{' '}
          telah selesai diolah di fasilitas Anda. Sertifikat menjadi catatan
          permanen dan dapat diakses publik untuk verifikasi.
        </p>

        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--c-bg-deep)',
          borderRadius: 'var(--radius)',
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          wordBreak: 'break-all',
        }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>URL sertifikat</div>
          {window.location.origin}/certificates/{pickup.id}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-ghost">Batal</button>
          <button onClick={onConfirm} className="btn btn-accent">Terbitkan & buka</button>
        </div>
      </div>
    </div>
  );
}
