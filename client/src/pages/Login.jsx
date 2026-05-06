// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Masyarakat',  email: 'demo.user@ecoloop.id',       role: 'user' },
  { label: 'Aggregator',  email: 'demo.aggregator@ecoloop.id', role: 'aggregator' },
  { label: 'Recycler',    email: 'demo.recycler@ecoloop.id',   role: 'recycler' },
];

function homeForRole(role) {
  if (role === 'aggregator') return '/dashboard/aggregator';
  if (role === 'recycler')   return '/dashboard/recycler';
  return '/new-pickup';
}

export default function Login() {
  const { session, profile, signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo.user@ecoloop.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && profile) {
      nav(homeForRole(profile.role), { replace: true });
    }
  }, [session, profile, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Gagal masuk');
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-12)', maxWidth: '460px' }}>
      <div className="rise rise-1">
        <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>
          Masuk · Akses akun
        </div>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Selamat datang kembali.</h2>
        <p style={{ marginBottom: 'var(--space-8)' }}>
          Masuk untuk mendaftarkan e-waste atau mengelola pickup.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rise rise-2">
        <div className="field">
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" className="field-input"
            value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password" className="field-label">Kata sandi</label>
          <input id="password" type="password" className="field-input"
            value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <div className="field-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
        <button type="submit" disabled={loading}
          className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-4)' }}>
          {loading ? 'Masuk…' : 'Masuk'}
        </button>
      </form>

      <div className="rise rise-3" style={{
        marginTop: 'var(--space-12)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--c-line)',
      }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
          Akun demo · Klik untuk isi
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {DEMO_ACCOUNTS.map((a) => (
            <button key={a.email} type="button"
              onClick={() => { setEmail(a.email); setPassword('password123'); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3)', background: 'transparent',
                border: '1px solid var(--c-line)', borderRadius: 'var(--radius)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--c-ink)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--c-ink)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--c-line)'}
            >
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{a.label}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-ink-mute)',
              }}>
                {a.email.split('@')[0]}
              </span>
            </button>
          ))}
        </div>
        <div className="field-help" style={{ marginTop: 'var(--space-3)' }}>
          Sandi semua akun: <code style={{
            fontFamily: 'var(--font-mono)', background: 'var(--c-bg-deep)',
            padding: '2px 6px', borderRadius: 'var(--radius)',
          }}>password123</code>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
        <Link to="/" className="btn-link">← Kembali ke beranda</Link>
      </div>
    </main>
  );
}
