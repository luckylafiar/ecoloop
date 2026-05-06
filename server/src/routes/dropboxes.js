// server/src/routes/dropboxes.js
//
// Endpoint dropboxes:
//   GET  /api/dropboxes?lat=&lng=&radius=  → cari terdekat (PUBLIC, no auth)
//   GET  /api/dropboxes/:id                 → detail dropbox
//   POST /api/dropboxes                     → daftar dropbox baru (aggregator only)

import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../lib/validate.js';

const router = Router();

const ALLOWED_DEVICE_TYPES = ['phone', 'laptop', 'battery', 'tv', 'monitor', 'cable', 'other'];

// ----------------------------------------------------------------------------
// GET /api/dropboxes?lat=&lng=&radius=
//   Public — agar peta Leaflet di landing page bisa dipanggil tanpa login.
//   Pakai RPC nearby_dropboxes (haversine) yang sudah dibuat di schema.sql.
//   - lat, lng wajib
//   - radius opsional, default 5 km
// ----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const v = validate(req.query, {
    lat:    { type: 'number', required: true, min: -90,  max: 90  },
    lng:    { type: 'number', required: true, min: -180, max: 180 },
    radius: { type: 'number', required: false, min: 0.1, max: 50  },
  });
  if (!v.ok) return res.status(400).json({ error: 'invalid_query', details: v.errors });

  const { lat, lng, radius = 5 } = v.value;

  const { data, error } = await supabaseAdmin.rpc('nearby_dropboxes', {
    user_lat:  lat,
    user_lng:  lng,
    radius_km: radius,
  });

  if (error) {
    console.error('[GET /dropboxes] rpc error:', error);
    return res.status(500).json({ error: 'db_error' });
  }
  return res.json(data ?? []);
});

// ----------------------------------------------------------------------------
// GET /api/dropboxes/:id
// ----------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const v = validate({ id: req.params.id }, { id: { type: 'uuid', required: true } });
  if (!v.ok) return res.status(400).json({ error: 'invalid_id' });

  const { data, error } = await supabaseAdmin
    .from('dropboxes')
    .select('id, name, address, latitude, longitude, accepted_device_types, operating_hours, is_active, aggregator_id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'db_error' });
  if (!data || !data.is_active) return res.status(404).json({ error: 'not_found' });
  return res.json(data);
});

// ----------------------------------------------------------------------------
// POST /api/dropboxes — aggregator terverifikasi mendaftarkan dropbox baru
// ----------------------------------------------------------------------------
router.post('/', requireAuth, requireRole('aggregator', 'admin'), async (req, res) => {
  const v = validate(req.body, {
    name:            { type: 'string', required: true,  maxLen: 150 },
    address:         { type: 'string', required: true,  maxLen: 500 },
    latitude:        { type: 'number', required: true,  min: -90,  max: 90  },
    longitude:       { type: 'number', required: true,  min: -180, max: 180 },
    operating_hours: { type: 'string', required: false, maxLen: 100 },
  });
  if (!v.ok) return res.status(400).json({ error: 'invalid_input', details: v.errors });

  // accepted_device_types divalidasi terpisah karena array
  const types = req.body.accepted_device_types;
  if (!Array.isArray(types) || types.length === 0) {
    return res.status(400).json({ error: 'accepted_device_types_required' });
  }
  for (const t of types) {
    if (!ALLOWED_DEVICE_TYPES.includes(t)) {
      return res.status(400).json({ error: 'invalid_device_type', value: t, allowed: ALLOWED_DEVICE_TYPES });
    }
  }

  // Cari aggregator_id milik user. Wajib verified.
  const { data: agg, error: aErr } = await supabaseAdmin
    .from('aggregators').select('id, verified').eq('user_id', req.user.id).maybeSingle();
  if (aErr) return res.status(500).json({ error: 'db_error' });
  if (!agg)  return res.status(403).json({ error: 'no_aggregator_profile' });
  if (!agg.verified) return res.status(403).json({ error: 'aggregator_not_verified' });

  const { data, error } = await supabaseAdmin
    .from('dropboxes')
    .insert({
      aggregator_id:         agg.id,
      name:                  v.value.name,
      address:               v.value.address,
      latitude:              v.value.latitude,
      longitude:             v.value.longitude,
      operating_hours:       v.value.operating_hours ?? null,
      accepted_device_types: types,
      is_active:             true,
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /dropboxes] insert error:', error);
    return res.status(500).json({ error: 'db_error' });
  }
  return res.status(201).json(data);
});

export default router;
