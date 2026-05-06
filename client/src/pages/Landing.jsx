// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Landing() {
  const { session } = useAuth();
  const ctaTarget = session ? '/new-pickup' : '/login';

  return (
    <main>
      {/* HERO ------------------------------------------------------------ */}
      <section style={{ paddingBlock: 'var(--space-16) var(--space-12)' }}>
        <div className="container">
          <div className="rise rise-1 eyebrow" style={{ marginBottom: 'var(--space-6)' }}>
            Edisi 01 · Mei 2026 · Sub-tema Circular Economy
          </div>

          <h1 className="rise rise-2" style={{ maxWidth: '14ch', marginBottom: 'var(--space-8)' }}>
            Limbah elektronik <em>tidak hilang</em>.<br/>
            Kami buatkan jalannya pulang.
          </h1>

          <div className="rise rise-3" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            maxWidth: '780px',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--c-line)',
          }}>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--c-ink)' }}>
              EcoLoop menghubungkan tiga aktor yang selama ini terputus — masyarakat,
              aggregator komunitas, dan recycler bersertifikat KLHK — dalam satu
              ekosistem digital yang dapat diaudit. Tidak lagi sekadar kampanye
              kesadaran. Ini infrastruktur.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link to={ctaTarget} className="btn btn-accent">
                Daftarkan e-waste
              </Link>
              <a href="#alur" className="btn btn-ghost">
                Lihat cara kerja
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CRISIS STATS — editorial pull-quote style ---------------------- */}
      <section className="rise rise-4" style={{
        background: 'var(--c-ink)',
        color: 'var(--c-bg)',
        paddingBlock: 'var(--space-12)',
      }}>
        <div className="container">
          <div className="eyebrow" style={{
            color: 'var(--c-clay)',
            marginBottom: 'var(--space-6)',
          }}>
            Data Krisis · Mengapa ini mendesak
          </div>

          <div style={{
            display: 'grid',
            gap: 'var(--space-8)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}>
            <Stat
              big="2,0"
              suffix="jt ton/thn"
              label="E-waste Indonesia"
              source="UNITAR Global E-waste Monitor 2024"
            />
            <Stat
              big="17,4"
              suffix="%"
              label="Yang dikelola benar"
              source="KLHK 2021"
            />
            <Stat
              big="92"
              suffix="%"
              label="Mahasiswa ITB tidak tahu lokasi drop box terdekat"
              source="Survei tim, 2026"
            />
            <Stat
              big="6"
              suffix=""
              label="Recycler B3 bersertifikat KLHK se-Indonesia"
              source="Waste4Change 2022"
            />
          </div>

          <p className="serif-italic" style={{
            fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)',
            lineHeight: 1.4,
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid rgba(245, 240, 230, 0.15)',
            color: 'var(--c-bg)',
            maxWidth: '52ch',
          }}>
            "Masalahnya bukan rendahnya kesadaran, melainkan ketiadaan
            infrastruktur yang membuat pilihan benar menjadi mudah dan
            terverifikasi."
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontStyle: 'normal',
              color: 'var(--c-clay)',
              marginTop: 'var(--space-4)',
            }}>
              — Kurniawan et al., Geosystem Engineering 2022
            </span>
          </p>
        </div>
      </section>

      {/* THREE-ACTOR FLOW ---------------------------------------------- */}
      <section id="alur" style={{ paddingBlock: 'var(--space-16)' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>
            Cara kerja · Tiga sisi, satu rantai
          </div>
          <h2 style={{ maxWidth: '20ch', marginBottom: 'var(--space-12)' }}>
            Setiap kilogram terlacak dari ruang tamu ke pabrik daur ulang.
          </h2>

          <div style={{
            display: 'grid',
            gap: 'var(--space-6)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}>
            <Actor
              num="01"
              role="Masyarakat"
              title="Daftar dalam 30 detik"
              body="Pilih jenis perangkat, perkirakan berat, lihat drop box terdekat lewat peta. Tanpa app store."
            />
            <Actor
              num="02"
              role="Aggregator komunitas"
              title="Terverifikasi, terlegitimasi"
              body="Bank sampah, RT/RW, organisasi mahasiswa. Konfirmasi pickup, kelola titik pengumpulan."
            />
            <Actor
              num="03"
              role="Recycler bersertifikat"
              title="Sertifikat chain-of-custody"
              body="Hanya pemegang izin B3 KLHK yang dapat menerbitkan sertifikat. Bukti audit yang selama ini hilang."
            />
          </div>
        </div>
      </section>

      {/* CTA STRIP ----------------------------------------------------- */}
      <section style={{
        background: 'var(--c-bg-deep)',
        paddingBlock: 'var(--space-12)',
        borderTop: '1px solid var(--c-line)',
        borderBottom: '1px solid var(--c-line)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'var(--space-6)',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              Mulai dari satu perangkat di tangan Anda.
            </h3>
            <p style={{ maxWidth: '46ch' }}>
              Setiap pickup yang melewati sistem mengembalikan logam berharga
              ke rantai produksi — mengurangi tambang primer.
            </p>
          </div>
          <Link to={ctaTarget} className="btn btn-accent" style={{ alignSelf: 'start' }}>
            Daftarkan sekarang
          </Link>
        </div>
      </section>

      {/* FOOTER -------------------------------------------------------- */}
      <footer style={{
        paddingBlock: 'var(--space-8)',
        textAlign: 'left',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <div className="eyebrow">
            EcoLoop · Hackathon IYREF 2026 · SRE ITB
          </div>
          <div className="eyebrow" style={{ color: 'var(--c-ink-soft)' }}>
            Tim · Poggy Gultom · Raifal Rosaldi
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ big, suffix, label, source }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
        fontWeight: 300,
        lineHeight: 0.95,
        letterSpacing: '-0.04em',
        color: 'var(--c-bg)',
      }}>
        {big}
        <span style={{
          fontSize: '0.4em',
          fontWeight: 400,
          marginLeft: '0.15em',
          color: 'var(--c-clay)',
        }}>
          {suffix}
        </span>
      </div>
      <div style={{
        fontSize: '0.95rem',
        marginTop: 'var(--space-2)',
        color: 'var(--c-bg)',
        maxWidth: '20ch',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--c-clay)',
        marginTop: 'var(--space-2)',
      }}>
        {source}
      </div>
    </div>
  );
}

function Actor({ num, role, title, body }) {
  return (
    <article style={{
      borderTop: '1px solid var(--c-ink)',
      paddingTop: 'var(--space-4)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.2rem',
        fontWeight: 300,
        letterSpacing: '-0.02em',
        color: 'var(--c-ink)',
        marginBottom: 'var(--space-2)',
      }}>
        {num}
      </div>
      <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
        {role}
      </div>
      <h3 style={{ marginBottom: 'var(--space-2)' }}>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
