// server/src/routes/pickups.js
//
// Endpoint pickup (alur inti EcoLoop).
//
// State machine status:
//   pending → confirmed → collected → certified
//   - pending   : user baru daftar, aggregator belum konfirmasi
//   - confirmed : aggregator menerima pickup (akan dijemput / diterima di dropbox)
//   - collected : aggregator sudah memegang fisik e-waste
//   - certified : recycler bersertifikat KLHK menerbitkan sertifikat CoC
//
// Authorization per transisi:
//   - pending → confirmed   : aggregator
//   - confirmed → collected : aggregator
//   - collected → certified : recycler

import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../lib/validate.js';

const router = Router();

const ALLOWED_DEVICE_TYPES = ['phone', 'laptop', 'battery', 'tv', 'monitor', 'cable', 'other'];

// State machine — siapa boleh ubah ke status apa
const TRANSITIONS = {
  pending:   { confirmed:  ['aggregator'] },
  confirmed: { collected:  ['aggregator'] },
  collected: { certified:  ['recycler']   },
  certified: {},  // terminal
};

// ----------------------------------------------------------------------------
// POST /api/pickups — user mendaftarkan e-waste baru
// ----------------------------------------------------------------------------
router.post('/', requireAuth, async (req, res) => {
  const v = validate(req.body, {
    device_type:      { type: 'string', required: true, enum: ALLOWED_DEVICE_TYPES },
    estimated_weight: { type: 'number', required: true, min: 0.01, max: 1000 },
    dropbox_id:       { type: 'uuid',   required: false },
  });
  if (!v.ok) return res.status(400).json({ error: 'invalid_input', details: v.errors });

  const { device_type, estimated_weight, dropbox_id } = v.value;

  // Jika dropbox_id disertakan, validasi: harus ada, aktif, dan menerima device_type ini
  let aggregator_id = null;
  if (dropbox_id) {
    const { data: dropbox, error: dErr } = await supabaseAdmin
      .from('dropboxes')
      .select('id, aggregator_id, accepted_device_types, is_active')
      .eq('id', dropbox_id)
      .maybeSingle();

    if (dErr) {
      console.error('[POST /pickups] dropbox lookup error:', dErr);
      return res.status(500).json({ error: 'db_error' });
    }
    if (!dropbox || !dropbox.is_active) {
      return res.status(404).json({ error: 'dropbox_not_found_or_inactive' });
    }
    if (!dropbox.accepted_device_types.includes(device_type)) {
      return res.status(400).json({
        error: 'device_type_not_accepted',
        accepted: dropbox.accepted_device_types,
      });
    }
    aggregator_id = dropbox.aggregator_id;
  }

  const { data, error } = await supabaseAdmin
    .from('pickups')
    .insert({
      user_id: req.user.id,
      device_type,
      estimated_weight,
      dropbox_id: dropbox_id ?? null,
      aggregator_id,                    // pre-link ke aggregator pemilik dropbox
      status: 'pending',
    })
    .select('id, status, device_type, estimated_weight, dropbox_id, aggregator_id, created_at')
    .single();

  if (error) {
    console.error('[POST /pickups] insert error:', error);
    return res.status(500).json({ error: 'db_error' });
  }
  return res.status(201).json(data);
});

// ----------------------------------------------------------------------------
// GET /api/pickups — list pickup; filter berdasarkan role
//   - user       : pickups miliknya
//   - aggregator : pickups yang dropbox-nya milik aggregator (atau aggregator_id-nya cocok)
//   - recycler   : pickups dengan status 'collected' (siap diolah) + recycler_id miliknya
// ----------------------------------------------------------------------------
router.get('/', requireAuth, async (req, res) => {
  const { role, id: userId } = req.user;
  const status = req.query.status; // optional filter

  let query = supabaseAdmin
    .from('pickups')
    .select('id, user_id, aggregator_id, recycler_id, dropbox_id, device_type, estimated_weight, status, certificate_url, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (role === 'user') {
    query = query.eq('user_id', userId);
  } else if (role === 'aggregator') {
    // Cari aggregator_id milik user ini
    const { data: agg } = await supabaseAdmin
      .from('aggregators').select('id').eq('user_id', userId).maybeSingle();
    if (!agg) return res.json([]);
    query = query.eq('aggregator_id', agg.id);
  } else if (role === 'recycler') {
    const { data: rec } = await supabaseAdmin
      .from('recyclers').select('id').eq('user_id', userId).maybeSingle();
    if (!rec) return res.json([]);
    // Recycler lihat: yang sudah collected (kandidat) + yang sudah recycler_id-nya
    query = query.or(`status.eq.collected,recycler_id.eq.${rec.id}`);
  } else if (role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('[GET /pickups] error:', error);
    return res.status(500).json({ error: 'db_error' });
  }
  return res.json(data);
});

// ----------------------------------------------------------------------------
// GET /api/pickups/:id — detail satu pickup (dengan otorisasi kepemilikan)
// ----------------------------------------------------------------------------
router.get('/:id', requireAuth, async (req, res) => {
  const v = validate({ id: req.params.id }, { id: { type: 'uuid', required: true } });
  if (!v.ok) return res.status(400).json({ error: 'invalid_id' });

  const { data: pickup, error } = await supabaseAdmin
    .from('pickups')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'db_error' });
  if (!pickup) return res.status(404).json({ error: 'not_found' });

  // Authorization: user sendiri, aggregator pemilik, recycler terkait, atau admin
  const isOwner = pickup.user_id === req.user.id;
  let isPartyMember = false;
  if (req.user.role === 'aggregator') {
    const { data: agg } = await supabaseAdmin
      .from('aggregators').select('id').eq('user_id', req.user.id).maybeSingle();
    isPartyMember = agg && pickup.aggregator_id === agg.id;
  } else if (req.user.role === 'recycler') {
    const { data: rec } = await supabaseAdmin
      .from('recyclers').select('id').eq('user_id', req.user.id).maybeSingle();
    isPartyMember = rec && (pickup.recycler_id === rec.id || pickup.status === 'collected');
  }

  if (!isOwner && !isPartyMember && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }

  return res.json(pickup);
});

// ----------------------------------------------------------------------------
// PATCH /api/pickups/:id/status — transisi status oleh aggregator/recycler
//   Body: { status: 'confirmed'|'collected'|'certified', certificate_url? }
// ----------------------------------------------------------------------------
router.patch('/:id/status', requireAuth, requireRole('aggregator', 'recycler', 'admin'), async (req, res) => {
  const idCheck = validate({ id: req.params.id }, { id: { type: 'uuid', required: true } });
  if (!idCheck.ok) return res.status(400).json({ error: 'invalid_id' });

  const v = validate(req.body, {
    status:          { type: 'string', required: true, enum: ['confirmed', 'collected', 'certified'] },
    certificate_url: { type: 'string', required: false, maxLen: 500 },
  });
  if (!v.ok) return res.status(400).json({ error: 'invalid_input', details: v.errors });

  const { status: newStatus, certificate_url } = v.value;

  // Ambil pickup current
  const { data: pickup, error: pErr } = await supabaseAdmin
    .from('pickups').select('*').eq('id', req.params.id).maybeSingle();
  if (pErr) return res.status(500).json({ error: 'db_error' });
  if (!pickup) return res.status(404).json({ error: 'not_found' });

  // Validasi transisi
  const allowedRoles = TRANSITIONS[pickup.status]?.[newStatus];
  if (!allowedRoles) {
    return res.status(400).json({
      error: 'invalid_transition',
      from: pickup.status,
      to: newStatus,
    });
  }
  if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'role_not_allowed_for_transition', required: allowedRoles });
  }

  // Authorization tambahan: aggregator/recycler hanya boleh action pickup miliknya
  const updates = { status: newStatus };

  if (req.user.role === 'aggregator') {
    const { data: agg } = await supabaseAdmin
      .from('aggregators').select('id, verified').eq('user_id', req.user.id).maybeSingle();
    if (!agg || !agg.verified) {
      return res.status(403).json({ error: 'aggregator_not_verified' });
    }
    // Jika pickup belum punya aggregator_id (user pilih dropbox manual nanti), ikat di sini
    if (pickup.aggregator_id && pickup.aggregator_id !== agg.id) {
      return res.status(403).json({ error: 'not_pickup_owner' });
    }
    if (!pickup.aggregator_id) updates.aggregator_id = agg.id;
  }

  if (req.user.role === 'recycler') {
    const { data: rec } = await supabaseAdmin
      .from('recyclers').select('id, is_active').eq('user_id', req.user.id).maybeSingle();
    if (!rec || !rec.is_active) {
      return res.status(403).json({ error: 'recycler_not_active' });
    }
    // Saat certify, sertifikat URL wajib
    if (newStatus === 'certified') {
      if (!certificate_url) {
        return res.status(400).json({ error: 'certificate_url_required' });
      }
      updates.recycler_id = rec.id;
      updates.certificate_url = certificate_url;
    }
  }

  const { data: updated, error: uErr } = await supabaseAdmin
    .from('pickups')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, status, aggregator_id, recycler_id, certificate_url, updated_at')
    .single();

  if (uErr) {
    console.error('[PATCH /pickups/:id/status] update error:', uErr);
    return res.status(500).json({ error: 'db_error' });
  }
  return res.json(updated);
});

export default router;
