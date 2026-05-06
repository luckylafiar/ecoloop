// src/pages/NewPickup.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DropboxMap from '../components/DropboxMap.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const DEVICE_TYPES = [
  { id: 'phone',   label: 'HP / Phone',     hint: '~0.18 kg' },
  { id: 'laptop',  label: 'Laptop',         hint: '~2,1 kg' },
  { id: 'battery', label: 'Baterai',        hint: '~0,05 kg' },
  { id: 'cable',   label: 'Kabel/Charger',  hint: '~0,1 kg' },
  { id: 'monitor', label: 'Monitor',        hint: '~4,5 kg' },
  { id: 'tv',      label: 'TV',             hint: '~10 kg' },
];

const DEFAULT_LOCATION = [-6.8915, 107.6107]; // ITB Ganesha

export default function NewPickup() {
  const { session, loading: authLoading } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [device, setDevice] = useState(null);
  const [weight, setWeight] = useState('');
  const [coords, setCoords] = useState(DEFAULT_LOCATION);
  const [coordsSource, setCoordsSource] = useState('default');
  const [dropboxes, setDropboxes] = useState([]);
  const [selectedDropbox, setSelectedDropbox] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  // Redirect jika belum login
  useEffect(() => {
    if (!authLoading && !session) nav('/login');
  }, [authLoading, session, nav]);

  // Coba ambil geolokasi (best-effort)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setCoordsSource('geolocation');
      },
      () => { /* user menolak — biarkan default */ },
      { timeout: 5000 }
    );
  }, []);

  // Fetch dropbox terdekat saat coords berubah
  useEffect(() => {
    let cancelled = false;
    api.nearbyDropboxes(coords[0], coords[1], 5)
      .then((rows) => {
        if (!cancelled) setDropboxes(rows);
      })
      .catch((err) => console.error('[dropboxes]', err));
    return () => { cancelled = true; };
  }, [coords]);

  // Filter dropbox yang menerima device terpilih
  const matchingDropboxes = useMemo(() => {
    if (!device) return dropboxes;
    return dropboxes.filter((d) => d.accepted_device_types?.includes(device));
  }, [dropboxes, device]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.createPickup({
        device_type: device,
        estimated_weight: Number(weight),
        dropbox_id: selectedDropbox?.id,
      });
      setCreatedId(result.id);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Gagal membuat pickup');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <main className="container" style={{ padding: 'var(--space-8)' }}>Memuat…</main>;

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)', maxWidth: '780px' }}>
      {/* Step indicator */}
      <div className="rise rise-1" style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/" className="btn-link" style={{ fontSize: '0.8rem' }}>
          ← Beranda
        </Link>
      </div>

      <div className="rise rise-2" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
          Langkah {step === 4 ? '✓' : `${step} dari 3`} · Pickup baru
        </div>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>
          {step === 1 && 'Apa yang ingin Anda buang?'}
          {step === 2 && 'Berapa perkiraan beratnya?'}
          {step === 3 && 'Pilih titik drop box terdekat.'}
          {step === 4 && 'Pickup terdaftar.'}
        </h2>
        <p>
          {step === 1 && 'Pilih jenis perangkat. Kami akan tunjukkan drop box yang menerimanya.'}
          {step === 2 && `Berat estimasi untuk ${labelFor(device)}. Tidak harus presisi.`}
          {step === 3 && 'Marker di peta menunjukkan drop box yang menerima jenis perangkat Anda.'}
          {step === 4 && 'Aggregator akan mengonfirmasi. Anda akan menerima sertifikat saat material sampai di recycler bersertifikat.'}
        </p>
      </div>

      {/* STEP 1 — Device picker */}
      {step === 1 && (
        <div className="rise rise-3">
          <div className="device-grid" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-3)',
          }}>
            {DEVICE_TYPES.map((d) => (
              <button
                key={d.id}
                className="device-chip"
                data-active={device === d.id}
                onClick={() => setDevice(d.id)}
                style={{ flexDirection: 'column', display: 'flex', gap: '0.3rem', padding: '1rem 0.5rem' }}
              >
                <span>{d.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: device === d.id ? 'var(--c-clay)' : 'var(--c-ink-mute)',
                }}>
                  {d.hint}
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              disabled={!device}
              onClick={() => setStep(2)}
            >
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Weight */}
      {step === 2 && (
        <div className="rise rise-3">
          <div className="field">
            <label className="field-label" htmlFor="weight">Berat estimasi (kg)</label>
            <input
              id="weight"
              type="number"
              step="0.01"
              min="0.01"
              max="1000"
              className="field-input"
              placeholder="0.18"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
            <div className="field-help">
              Tidak yakin? Tebakan kasar tidak masalah — aggregator akan menimbang ulang saat pengumpulan.
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Kembali</button>
            <button
              className="btn btn-primary"
              disabled={!weight || Number(weight) <= 0}
              onClick={() => setStep(3)}
            >
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Map + dropbox selection */}
      {step === 3 && (
        <div className="rise rise-3">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
              <span className="eyebrow">
                {matchingDropboxes.length} drop box dalam 5 km
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--c-ink-mute)',
              }}>
                {coordsSource === 'geolocation' ? 'Lokasi Anda' : 'Default: ITB Ganesha'}
              </span>
            </div>
          </div>

          <DropboxMap
            center={coords}
            dropboxes={matchingDropboxes}
            selectedId={selectedDropbox?.id}
            onSelect={setSelectedDropbox}
            height={340}
          />

          {/* Dropbox list — fallback untuk yang tidak suka peta */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            {matchingDropboxes.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDropbox(d)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-3) var(--space-4)',
                  background: selectedDropbox?.id === d.id ? 'var(--c-bg-deep)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedDropbox?.id === d.id ? 'var(--c-ink)' : 'var(--c-line)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--c-ink)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--c-ink-mute)',
                    whiteSpace: 'nowrap',
                  }}>
                    {Number(d.distance_km).toFixed(2)} km
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-soft)', marginTop: '2px' }}>
                  {d.address}
                </div>
              </button>
            ))}
            {matchingDropboxes.length === 0 && (
              <div className="field-help">
                Tidak ada drop box yang menerima {labelFor(device)} dalam 5 km. Anda tetap bisa
                membuat pickup tanpa memilih drop box — aggregator terdekat akan
                ditunjuk.
              </div>
            )}
          </div>

          {error && (
            <div className="field-error" style={{ marginTop: 'var(--space-4)' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Kembali</button>
            <button
              className="btn btn-accent"
              disabled={loading}
              onClick={submit}
            >
              {loading ? 'Mendaftarkan…' : 'Daftarkan pickup'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Success */}
      {step === 4 && (
        <div className="rise rise-3">
          <div style={{
            background: 'var(--c-bg-deep)',
            border: '1px solid var(--c-line)',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--space-6)',
          }}>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
              ID Pickup
            </div>
            <code style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--c-ink)',
              wordBreak: 'break-all',
              display: 'block',
              marginBottom: 'var(--space-4)',
            }}>
              {createdId}
            </code>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Status step="pending"   label="Menunggu konfirmasi aggregator" active />
              <Status step="confirmed" label="Aggregator akan menerima atau menjemput" />
              <Status step="collected" label="E-waste dipegang aggregator" />
              <Status step="certified" label="Sertifikat chain-of-custody dari recycler" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Link to="/pickups" className="btn btn-primary">Lihat semua pickup</Link>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setStep(1); setDevice(null); setWeight(''); setSelectedDropbox(null); setCreatedId(null);
              }}
            >
              Daftarkan lagi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Status({ step, label, active = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) 0',
      opacity: active ? 1 : 0.45,
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: active ? 'var(--c-accent)' : 'var(--c-line-strong)',
        flexShrink: 0,
      }}/>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--c-ink-mute)',
        minWidth: '7em',
      }}>
        {step}
      </span>
      <span style={{ fontSize: '0.9rem', color: 'var(--c-ink)' }}>{label}</span>
    </div>
  );
}

function labelFor(deviceId) {
  return DEVICE_TYPES.find((d) => d.id === deviceId)?.label || deviceId;
}
