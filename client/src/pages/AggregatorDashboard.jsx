// src/pages/AggregatorDashboard.jsx
//
// Dashboard untuk role 'aggregator'.
// Tiga seksi utama:
//   1. Queue — pickup yang menunggu action mereka
//   2. Dropbox management — list + form tambah dropbox
//   3. Stats — agregasi cepat untuk eyeballing kinerja

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import StatusPill from '../components/StatusPill.jsx';

const DEVICE_LABELS = {
  phone: 'HP', laptop: 'Laptop', battery: 'Baterai',
  cable: 'Kabel', monitor: 'Monitor', tv: 'TV', other: 'Lainnya',
};

const ALLOWED_DEVICES = ['phone', 'laptop', 'battery', 'cable', 'monitor', 'tv', 'other'];

export default function AggregatorDashboard() {
  const { session, profile, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [dropboxes, setDropboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // pickup id sedang diproses
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !session) nav('/login');
    if (!authLoading && profile && profile.role !== 'aggregator' && profile.role !== 'admin') {
      nav('/');
    }
  }, [authLoading, session, profile, nav]);

  async function load() {
    setLoading(true);
    try {
      const rows = await api.listPickups();
      setPickups(rows);
      // Untuk dropbox, fetch sekitar default location ITB Ganesha — radius 50km cukup luas
      const dbs = await api.nearbyDropboxes(-6.8915, 107.6107, 50);
      setDropboxes(dbs);
    } catch (e) {
      console.error('[aggregator load]', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session && profile?.role === 'aggregator') load(); }, [session, profile]);

  // Queue grouping
  const grouped = useMemo(() => ({
    pending:   pickups.filter((p) => p.status === 'pending'),
    confirmed: pickups.filter((p) => p.status === 'confirmed'),
    collected: pickups.filter((p) => p.status === 'collected'),
    certified: pickups.filter((p) => p.status === 'certified'),
  }), [pickups]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalKg = pickups.reduce((s, p) => s + Number(p.estimated_weight || 0), 0);
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeekKg = pickups
      .filter((p) => new Date(p.created_at).getTime() > week)
      .reduce((s, p) => s + Number(p.estimated_weight || 0), 0);
    return { totalKg, thisWeekKg, total: pickups.length };
  }, [pickups]);

  async function transition(pickup, newStatus) {
    setActioning(pickup.id);
    setError(null);
    try {
      await api.updatePickupStatus(pickup.id, { status: newStatus });
      await load();
    } catch (e) {
      setError(`Gagal: ${e.message}`);
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
          Dashboard · Aggregator komunitas
        </div>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>
          Selamat datang, {profile?.full_name?.split(' ')[0] || 'aggregator'}.
        </h2>
        <p style={{ maxWidth: '60ch' }}>
          Kelola pickup yang ditugaskan ke organisasi Anda dan tambahkan titik drop
          box baru ke jaringan EcoLoop.
        </p>
      </div>

      {/* AGGREGATE STATS -------------------------------------------------- */}
      <div className="rise rise-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-12)',
        paddingBlock: 'var(--space-6)',
        borderTop: '1px solid var(--c-ink)',
        borderBottom: '1px solid var(--c-line)',
      }}>
        <BigStat big={grouped.pending.length} label="Menunggu konfirmasi" emphasis />
        <BigStat big={grouped.confirmed.length} label="Siap dikumpulkan" />
        <BigStat big={stats.thisWeekKg.toFixed(2)} suffix="kg" label="Berat 7 hari terakhir" />
        <BigStat big={stats.totalKg.toFixed(2)} suffix="kg" label="Total kelolaan" />
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

      {/* QUEUE ----------------------------------------------------------- */}
      <section className="rise rise-3" style={{ marginBottom: 'var(--space-12)' }}>
        <h3 style={{ marginBottom: 'var(--space-6)' }}>Antrean pickup</h3>

        <QueueGroup
          title="Menunggu konfirmasi"
          subtitle="Anda perlu menerima atau menolak"
          rows={grouped.pending}
          actionLabel="Konfirmasi terima"
          actionStatus="confirmed"
          actioning={actioning}
          onAction={transition}
          accent
        />

        <QueueGroup
          title="Sudah dikonfirmasi"
          subtitle="Tunggu pengumpulan fisik. Tandai 'terkumpul' setelah diterima."
          rows={grouped.confirmed}
          actionLabel="Tandai terkumpul"
          actionStatus="collected"
          actioning={actioning}
          onAction={transition}
        />

        <QueueGroup
          title="Sudah terkumpul"
          subtitle="Menunggu recycler bersertifikat KLHK menerbitkan sertifikat"
          rows={grouped.collected}
          readonly
        />

        {grouped.certified.length > 0 && (
          <QueueGroup
            title="Selesai · Bersertifikat"
            subtitle="Telah diolah recycler. Sertifikat chain-of-custody tersedia."
            rows={grouped.certified}
            readonly
            showCertLink
          />
        )}
      </section>

      {/* DROPBOX MANAGEMENT --------------------------------------------- */}
      <section className="rise rise-4" style={{ marginBottom: 'var(--space-12)' }}>
        <DropboxSection
          dropboxes={dropboxes}
          onCreated={load}
          setError={setError}
        />
      </section>

    </main>
  );
}

// ----------------------------------------------------------------------------
// SUBCOMPONENTS
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

function QueueGroup({ title, subtitle, rows, actionLabel, actionStatus, actioning, onAction, accent = false, readonly = false, showCertLink = false }) {
  if (!rows.length) return null;
  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
            {title}
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)' }}>
            {subtitle}
          </div>
        </div>
        <span className="eyebrow">{rows.length} item</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {rows.map((p) => (
          <article key={p.id} style={{
            padding: 'var(--space-4)',
            border: '1px solid',
            borderColor: accent ? 'var(--c-accent)' : 'var(--c-line)',
            borderRadius: 'var(--radius)',
            background: accent ? 'rgba(194, 86, 43, 0.04)' : 'var(--c-bg)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}>
                  {DEVICE_LABELS[p.device_type] || p.device_type}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--c-ink-mute)',
                }}>
                  {Number(p.estimated_weight).toFixed(2)} kg
                </span>
                <StatusPill status={p.status} />
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--c-ink-mute)',
                marginTop: '4px',
                letterSpacing: '0.06em',
              }}>
                ID {p.id.slice(0, 8)} · {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
              {showCertLink && p.certificate_url && (
                <a href={p.certificate_url} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ fontSize: '0.8rem', marginTop: 'var(--space-2)', display: 'inline-block' }}>
                  Lihat sertifikat ↗
                </a>
              )}
            </div>

            {!readonly && (
              <button
                onClick={() => onAction(p, actionStatus)}
                disabled={actioning === p.id}
                className={accent ? 'btn btn-accent' : 'btn btn-primary'}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {actioning === p.id ? 'Memproses…' : actionLabel}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function DropboxSection({ dropboxes, onCreated, setError }) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: -6.8915,
    longitude: 107.6107,
    operating_hours: '',
    accepted_device_types: ['phone', 'laptop', 'battery'],
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleType(t) {
    setForm((f) => ({
      ...f,
      accepted_device_types: f.accepted_device_types.includes(t)
        ? f.accepted_device_types.filter((x) => x !== t)
        : [...f.accepted_device_types, t],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // POST /api/dropboxes
      const res = await fetch('/api/dropboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await authHeader()),
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          operating_hours: form.operating_hours || undefined,
          accepted_device_types: form.accepted_device_types,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setFormOpen(false);
      setForm((f) => ({ ...f, name: '', address: '', operating_hours: '' }));
      onCreated();
    } catch (e) {
      setError(`Gagal tambah dropbox: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h3 style={{ marginBottom: '4px' }}>Drop box jaringan</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', margin: 0 }}>
            Titik pengumpulan yang ditampilkan ke pengguna
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="btn btn-ghost"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          {formOpen ? 'Batal' : '+ Tambah drop box'}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} style={{
          padding: 'var(--space-6)',
          border: '1px solid var(--c-line-strong)',
          borderRadius: 'var(--radius)',
          marginBottom: 'var(--space-6)',
          background: 'var(--c-bg-deep)',
        }}>
          <div className="field">
            <label className="field-label">Nama lokasi</label>
            <input
              className="field-input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Drop Box Sekretariat HMTL"
            />
          </div>
          <div className="field">
            <label className="field-label">Alamat lengkap</label>
            <input
              className="field-input"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Jl. Ganesha No. 10, Bandung"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="field">
              <label className="field-label">Latitude</label>
              <input
                className="field-input"
                type="number"
                step="0.0000001"
                required
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Longitude</label>
              <input
                className="field-input"
                type="number"
                step="0.0000001"
                required
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Jam operasional</label>
            <input
              className="field-input"
              value={form.operating_hours}
              onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
              placeholder="Senin–Jumat 09:00–17:00"
            />
          </div>
          <div className="field">
            <label className="field-label">Perangkat yang diterima</label>
            <div className="device-grid">
              {ALLOWED_DEVICES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="device-chip"
                  data-active={form.accepted_device_types.includes(t)}
                  onClick={() => toggleType(t)}
                >
                  {DEVICE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="field-help">Pilih minimal satu jenis perangkat</div>
          </div>
          <button
            type="submit"
            disabled={submitting || form.accepted_device_types.length === 0}
            className="btn btn-primary"
          >
            {submitting ? 'Menyimpan…' : 'Daftarkan drop box'}
          </button>
        </form>
      )}

      {dropboxes.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-soft)' }}>
          Belum ada drop box terdaftar di jaringan area ini.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {dropboxes.map((d) => (
            <article key={d.id} style={{
              padding: 'var(--space-3) var(--space-4)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--radius)',
              background: 'var(--c-bg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600 }}>{d.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--c-ink-mute)',
                }}>
                  {Number(d.distance_km).toFixed(2)} km dari pusat
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', marginTop: '2px' }}>
                {d.address}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                {d.accepted_device_types?.map((t) => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    border: '1px solid var(--c-line-strong)',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--c-ink-soft)',
                  }}>
                    {DEVICE_LABELS[t] || t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

async function authHeader() {
  // Reuse pola yg sama dgn api.js — ambil JWT supabase
  const { supabase } = await import('../lib/supabase.js');
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {};
}
