-- ============================================================================
-- EcoLoop — Database Schema
-- Target  : PostgreSQL 15+ (Supabase)
-- Run via : Supabase Dashboard → SQL Editor → New Query → paste & Run
-- Order   : extensions → types → tables → indexes → triggers → functions → RLS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- untuk gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 2. CUSTOM TYPES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'aggregator', 'recycler', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pickup_status') THEN
    CREATE TYPE pickup_status AS ENUM ('pending', 'confirmed', 'collected', 'certified');
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. TABLES
-- ----------------------------------------------------------------------------

-- 3.1 users — extends auth.users (Supabase) via 1:1 FK
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  full_name   VARCHAR(100) NOT NULL,
  role        user_role NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 aggregators — pengumpul komunitas (RT/RW, kampus, bank sampah)
CREATE TABLE IF NOT EXISTS public.aggregators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_name    VARCHAR(150) NOT NULL,
  org_type    VARCHAR(50),                 -- 'rt_rw' | 'kampus' | 'bank_sampah'
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 recyclers — pengolah B3 bersertifikat KLHK
CREATE TABLE IF NOT EXISTS public.recyclers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name        VARCHAR(150) NOT NULL,
  klhk_license_no     VARCHAR(50) NOT NULL,
  klhk_license_url    TEXT NOT NULL,       -- file di Supabase Storage
  verified_at         TIMESTAMPTZ,         -- diisi admin setelah review (target 2x24 jam)
  is_active           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 dropboxes — titik pengumpulan e-waste
CREATE TABLE IF NOT EXISTS public.dropboxes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregator_id         UUID NOT NULL REFERENCES public.aggregators(id) ON DELETE CASCADE,
  name                  VARCHAR(150) NOT NULL,
  address               TEXT NOT NULL,
  latitude              DECIMAL(10, 7) NOT NULL,
  longitude             DECIMAL(10, 7) NOT NULL,
  accepted_device_types TEXT[] NOT NULL DEFAULT ARRAY['phone','laptop','battery']::TEXT[],
  operating_hours       VARCHAR(100),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 pickups — TABEL UTAMA (sesuai proposal Tahap 1)
CREATE TABLE IF NOT EXISTS public.pickups (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id),
  aggregator_id     UUID REFERENCES public.aggregators(id),
  recycler_id       UUID REFERENCES public.recyclers(id),
  dropbox_id        UUID REFERENCES public.dropboxes(id),
  device_type       VARCHAR(50) NOT NULL,
  estimated_weight  DECIMAL(8, 2) NOT NULL,    -- kg
  status            pickup_status NOT NULL DEFAULT 'pending',
  certificate_url   TEXT,                      -- chain-of-custody PDF dari recycler
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dropboxes_geo        ON public.dropboxes (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dropboxes_active     ON public.dropboxes (is_active);
CREATE INDEX IF NOT EXISTS idx_pickups_user         ON public.pickups (user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status       ON public.pickups (status);
CREATE INDEX IF NOT EXISTS idx_pickups_aggregator   ON public.pickups (aggregator_id);

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS
-- ----------------------------------------------------------------------------

-- 5.1 Auto-create profile in public.users when auth.users row is inserted.
--     Frontend cukup panggil supabase.auth.signUp() — profile dibuat otomatis.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.2 Auto-update updated_at on pickups
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pickups_set_updated_at ON public.pickups;
CREATE TRIGGER pickups_set_updated_at
  BEFORE UPDATE ON public.pickups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. FUNCTIONS — nearby_dropboxes (haversine)
-- ----------------------------------------------------------------------------
-- Mendukung endpoint: GET /dropboxes?lat=..&lng=..&radius=5km
CREATE OR REPLACE FUNCTION public.nearby_dropboxes(
  user_lat   DECIMAL,
  user_lng   DECIMAL,
  radius_km  DECIMAL DEFAULT 5
)
RETURNS TABLE (
  id                    UUID,
  name                  VARCHAR,
  address               TEXT,
  latitude              DECIMAL,
  longitude             DECIMAL,
  accepted_device_types TEXT[],
  operating_hours       VARCHAR,
  distance_km           DECIMAL
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id, d.name, d.address, d.latitude, d.longitude,
    d.accepted_device_types, d.operating_hours,
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(d.latitude)) *
        cos(radians(d.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(d.latitude))
      ))
    ))::DECIMAL(10, 2) AS distance_km
  FROM public.dropboxes d
  WHERE d.is_active = TRUE
    AND (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(d.latitude)) *
        cos(radians(d.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(d.latitude))
      ))
    )) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
-- Backend Express memakai service_role key → bypass RLS untuk operasi privileged.
-- RLS di sini melindungi akses langsung dari frontend yang pakai anon key.
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropboxes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups      ENABLE ROW LEVEL SECURITY;

-- USERS: user hanya boleh lihat & update profil sendiri
DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- DROPBOXES: semua user terotentikasi boleh baca dropbox aktif
DROP POLICY IF EXISTS dropboxes_select_active ON public.dropboxes;
CREATE POLICY dropboxes_select_active ON public.dropboxes
  FOR SELECT USING (is_active = TRUE);

-- PICKUPS: user hanya boleh baca & insert pickup miliknya sendiri
DROP POLICY IF EXISTS pickups_select_own ON public.pickups;
CREATE POLICY pickups_select_own ON public.pickups
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS pickups_insert_own ON public.pickups;
CREATE POLICY pickups_insert_own ON public.pickups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AGGREGATORS / RECYCLERS: profil publik hanya jika sudah verified/active
DROP POLICY IF EXISTS aggregators_select_verified ON public.aggregators;
CREATE POLICY aggregators_select_verified ON public.aggregators
  FOR SELECT USING (verified = TRUE);

DROP POLICY IF EXISTS recyclers_select_active ON public.recyclers;
CREATE POLICY recyclers_select_active ON public.recyclers
  FOR SELECT USING (is_active = TRUE);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
