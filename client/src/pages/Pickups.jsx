// src/pages/Pickups.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const DEVICE_LABELS = {
  phone: 'HP', laptop: 'Laptop', battery: 'Baterai',
  cable: 'Kabel', monitor: 'Monitor', tv: 'TV', other: 'Lainnya',
};

export default function Pickups() {
  const { session, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) nav('/login');
  }, [authLoading, session, nav]);

  useEffect(() => {
    if (!session) return;
    api.listPickups()
      .then(setRows)
      .catch((err) => console.error('[pickups]', err))
      .finally(() => setLoading(false));
  }, [session]);

  // Aggregate stats — fakta yang menarik untuk video demo
  const totalKg = rows.reduce((s, r) => s + Number(r.estimated_weight || 0), 0);
  const certifiedCount = rows.filter((r) => r.status === 'certified').length;

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)', maxWidth: '880px' }}>
      <div className="rise rise-1" style={{ marginBottom: 'var(--space-2)' }}>
        <Link to="/" className="btn-link" style={{ fontSize: '0.8rem' }}>← Beranda</Link>
      </div>

      <div className="rise rise-2" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
            Riwayat · Pickup Anda
          </div>
          <h2>Setiap kilogram terlacak.</h2>
        </div>
        <Link to="/new-pickup" className="btn btn-accent">
          + Pickup baru
        </Link>
      </div>

      {/* Aggregate stats — visual hook untuk video */}
      {!loading && rows.length > 0 && (
        <div className="rise rise-3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
          paddingBlock: 'var(--space-6)',
          borderTop: '1px solid var(--c-line)',
          borderBottom: '1px solid var(--c-line)',
        }}>
          <Stat big={rows.length} label="Total pickup" />
          <Stat big={totalKg.toFixed(2)} suffix="kg" label="Total berat" />
          <Stat big={certifiedCount} label="Bersertifikat" />
        </div>
      )}

      {loading ? (
        <p>Memuat…</p>
      ) : rows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', paddingBlock: 'var(--space-12)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}>
            Belum ada pickup terdaftar.
          </p>
          <Link to="/new-pickup" className="btn btn-primary">
            Daftarkan yang pertama
          </Link>
        </div>
      ) : (
        <div className="rise rise-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {rows.map((r) => (
            <article key={r.id} style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--radius)',
              background: 'var(--c-bg)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 'var(--space-3)',
              alignItems: 'start',
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: 'var(--c-ink)',
                  }}>
                    {DEVICE_LABELS[r.device_type] || r.device_type}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--c-ink-mute)',
                  }}>
                    {Number(r.estimated_weight).toFixed(2)} kg
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--c-ink-mute)',
                  letterSpacing: '0.08em',
                }}>
                  {new Date(r.created_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
                {r.certificate_url && (
                  <a
                    href={r.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-link"
                    style={{
                      fontSize: '0.8rem',
                      marginTop: 'var(--space-2)',
                      display: 'inline-block',
                    }}
                  >
                    Lihat sertifikat ↗
                  </a>
                )}
              </div>
              <StatusPill status={r.status} />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ big, suffix, label }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.4rem',
        fontWeight: 300,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: 'var(--c-ink)',
      }}>
        {big}
        {suffix && (
          <span style={{
            fontSize: '0.45em',
            marginLeft: '0.2em',
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
