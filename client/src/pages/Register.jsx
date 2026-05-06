// src/pages/Register.jsx
//
// Halaman daftar akun baru untuk role 'user' (masyarakat).
// Aggregator & recycler tidak signup mandiri — mereka di-onboard via verifikasi admin
// karena butuh dokumen pendukung (izin B3 KLHK untuk recycler, dll.)

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Register() {
  const { session, signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session) nav('/new-pickup', { replace: true });
  }, [session, nav]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      return setError('Sandi minimal 8 karakter');
    }
    if (form.password !== form.confirm) {
      return setError('Konfirmasi sandi tidak sama');
    }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.full_name);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="container" style={{
        paddingBlock: 'var(--space-12)',
        maxWidth: '460px',
        textAlign: 'center',
      }}>
        <div className="rise rise-1">
          <div className="eyebrow" style={{ marginBottom: 'var(--space-3)', color: 'var(--c-accent-deep)' }}>
            Pendaftaran berhasil
          </div>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>
            Akun Anda telah dibuat.
          </h2>
          <p style={{ marginBottom: 'var(--space-8)' }}>
            Silakan masuk untuk mulai mendaftarkan e-waste pertama Anda.
          </p>
          <Link to="/login" className="btn btn-primary">
            Lanjut ke halaman masuk →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{
      paddingBlock: 'var(--space-12)',
      maxWidth: '460px',
    }}>
      <div className="rise rise-1">
        <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>
          Daftar · Akun baru
        </div>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>
          Bergabung dengan rantai pemulihan.
        </h2>
        <p style={{ marginBottom: 'var(--space-8)' }}>
          Akun masyarakat untuk mendaftarkan e-waste rumah tangga.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rise rise-2">
        <div className="field">
          <label htmlFor="full_name" className="field-label">Nama lengkap</label>
          <input
            id="full_name"
            type="text"
            className="field-input"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="field">
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            className="field-input"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password" className="field-label">Sandi</label>
          <input
            id="password"
            type="password"
            className="field-input"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <div className="field-help">Minimal 8 karakter</div>
        </div>

        <div className="field">
          <label htmlFor="confirm" className="field-label">Konfirmasi sandi</label>
          <input
            id="confirm"
            type="password"
            className="field-input"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="field-error" style={{ marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ marginTop: 'var(--space-4)' }}
        >
          {loading ? 'Mendaftarkan…' : 'Daftar'}
        </button>
      </form>

      <div className="rise rise-3" style={{
        marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--c-line)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>
          Sudah punya akun?
        </p>
        <Link to="/login" className="btn-link">
          Masuk di sini →
        </Link>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/" className="btn-link" style={{ fontSize: '0.85rem' }}>
            ← Kembali ke beranda
          </Link>
        </div>
      </div>

      <p className="field-help" style={{
        marginTop: 'var(--space-8)',
        textAlign: 'center',
        fontSize: '0.78rem',
        lineHeight: 1.6,
      }}>
        Aggregator komunitas dan recycler bersertifikat KLHK tidak mendaftar di
        sini — onboarding mereka memerlukan verifikasi dokumen (izin B3 untuk
        recycler, surat pengesahan organisasi untuk aggregator).
      </p>
    </main>
  );
}
