// src/components/Header.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const ROLE_LABEL = {
  user: 'Masyarakat',
  aggregator: 'Aggregator',
  recycler: 'Recycler',
  admin: 'Admin',
};

function homeForRole(role) {
  if (role === 'aggregator') return '/dashboard/aggregator';
  if (role === 'recycler')   return '/dashboard/recycler';
  return '/new-pickup';
}

export default function Header() {
  const { session, profile, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // Sembunyikan header saat di halaman sertifikat — agar print bersih
  if (loc.pathname.startsWith('/certificates/')) return null;

  async function handleSignOut() {
    await signOut();
    nav('/');
  }

  const role = profile?.role;
  const homeLink = role ? homeForRole(role) : '/login';

  return (
    <header style={{
      borderBottom: '1px solid var(--c-line)',
      padding: '1.1rem 0',
      background: 'var(--c-bg)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontStyle: 'italic',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--c-ink)',
          }}>
            Eco<span style={{ fontWeight: 600, fontStyle: 'normal' }}>Loop</span>
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--c-ink-mute)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            ID/2026
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session && profile ? (
            <>
              {/* Role badge */}
              <span className="hide-mobile" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                background: role === 'recycler' ? 'rgba(194, 86, 43, 0.1)' : 'var(--c-bg-deep)',
                color: role === 'recycler' ? 'var(--c-accent-deep)' : 'var(--c-ink-soft)',
                border: '1px solid',
                borderColor: role === 'recycler' ? 'var(--c-accent)' : 'var(--c-line-strong)',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 500,
              }}>
                {ROLE_LABEL[role] || role}
              </span>

              {role === 'user' && (
                <Link to="/pickups" className="btn-link hide-mobile">
                  Riwayat
                </Link>
              )}

              {(role === 'aggregator' || role === 'recycler') && loc.pathname !== homeLink && (
                <Link to={homeLink} className="btn-link hide-mobile">
                  Dashboard
                </Link>
              )}

              <button onClick={handleSignOut} className="btn btn-ghost"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              Masuk
            </Link>
          )}
        </nav>
      </div>
      <style>{`
        @media (max-width: 540px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
