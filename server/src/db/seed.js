// server/src/db/seed.js
//
// Mengisi database dengan data demo untuk MVP & video presentation.
// Pakai service_role key sehingga bypass RLS.
//
// Jalankan: npm run seed

import 'dotenv/config';
import { supabaseAdmin } from './supabase.js';

const log = (msg) => console.log(`[seed] ${msg}`);

const DEMO_USERS = [
  { email: 'demo.user@ecoloop.id',       password: 'password123', full_name: 'Demo User',       role: 'user'       },
  { email: 'demo.aggregator@ecoloop.id', password: 'password123', full_name: 'Demo Aggregator', role: 'aggregator' },
  { email: 'demo.recycler@ecoloop.id',   password: 'password123', full_name: 'Demo Recycler',   role: 'recycler'   },
];

// Koordinat sekitar ITB Bandung (Ganesha) untuk demo realistic
const DROPBOX_DATA = [
  {
    name: 'Drop Box ITB Ganesha',
    address: 'Jl. Ganesha No. 10, Bandung 40132',
    latitude: -6.8915, longitude: 107.6107,
    accepted_device_types: ['phone', 'laptop', 'battery', 'cable'],
    operating_hours: 'Senin–Jumat 08:00–17:00',
  },
  {
    name: 'Drop Box Kantor RW Dago',
    address: 'Jl. Ir. H. Juanda No. 207, Dago, Bandung 40135',
    latitude: -6.8825, longitude: 107.6158,
    accepted_device_types: ['phone', 'cable', 'battery'],
    operating_hours: 'Setiap hari 09:00–20:00',
  },
  {
    name: 'Drop Box Bank Sampah Cihampelas',
    address: 'Jl. Cihampelas No. 124, Bandung 40171',
    latitude: -6.8957, longitude: 107.6042,
    accepted_device_types: ['phone', 'laptop', 'tv', 'monitor', 'battery'],
    operating_hours: 'Selasa–Sabtu 09:00–16:00',
  },
];

async function createOrFindAuthUser({ email, password, full_name, role }) {
  // listUsers untuk cek apakah sudah ada (idempotent seed)
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    log(`user ${email} sudah ada → skip create`);
    return existing;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  log(`user ${email} dibuat → ${data.user.id}`);
  return data.user;
}

async function upsertAggregator(userId) {
  const { data: existing } = await supabaseAdmin
    .from('aggregators').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('aggregators')
    .insert({
      user_id: userId,
      org_name: 'Bank Sampah ITB',
      org_type: 'kampus',
      verified: true,
    })
    .select().single();
  if (error) throw error;
  return data;
}

async function upsertRecycler(userId) {
  const { data: existing } = await supabaseAdmin
    .from('recyclers').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('recyclers')
    .insert({
      user_id: userId,
      company_name: 'PT Daur Ulang Mandiri',
      klhk_license_no: 'B3-2024-000123',
      klhk_license_url: 'https://example.com/klhk-license-demo.pdf',
      verified_at: new Date().toISOString(),
      is_active: true,
    })
    .select().single();
  if (error) throw error;
  return data;
}

async function upsertDropboxes(aggregatorId) {
  const created = [];
  for (const d of DROPBOX_DATA) {
    const { data: existing } = await supabaseAdmin
      .from('dropboxes').select('*').eq('name', d.name).maybeSingle();
    if (existing) {
      created.push(existing);
      continue;
    }
    const { data, error } = await supabaseAdmin
      .from('dropboxes')
      .insert({ ...d, aggregator_id: aggregatorId })
      .select().single();
    if (error) throw error;
    created.push(data);
    log(`dropbox dibuat: ${d.name}`);
  }
  return created;
}

async function seedSamplePickups({ userId, aggregatorId, recyclerId, dropboxId }) {
  // Hapus pickup demo lama dari user demo (idempotent)
  await supabaseAdmin.from('pickups').delete().eq('user_id', userId);

  const samples = [
    { device_type: 'phone',      estimated_weight: 0.18, status: 'pending'   },
    { device_type: 'laptop',     estimated_weight: 2.10, status: 'confirmed' },
    { device_type: 'battery',    estimated_weight: 0.05, status: 'collected' },
    { device_type: 'monitor',    estimated_weight: 4.50, status: 'certified' },
  ];

  for (const p of samples) {
    const row = {
      ...p,
      user_id: userId,
      dropbox_id: dropboxId,
      aggregator_id: ['confirmed', 'collected', 'certified'].includes(p.status) ? aggregatorId : null,
      recycler_id: p.status === 'certified' ? recyclerId : null,
      certificate_url: p.status === 'certified' ? 'https://example.com/coc-demo.pdf' : null,
    };
    const { error } = await supabaseAdmin.from('pickups').insert(row);
    if (error) throw error;
    log(`pickup dibuat: ${p.device_type} (${p.status})`);
  }
}

async function main() {
  log('mulai seed EcoLoop...');

  // 1. Auth users (trigger handle_new_user akan auto-isi public.users)
  const userMap = {};
  for (const u of DEMO_USERS) {
    const authUser = await createOrFindAuthUser(u);
    userMap[u.role] = authUser.id;
  }

  // Beri waktu trigger memproses (umumnya instan, tapi kita aman 500ms)
  await new Promise((r) => setTimeout(r, 500));

  // Pastikan role di public.users sesuai (jaga-jaga jika trigger tidak menangkap metadata)
  for (const u of DEMO_USERS) {
    await supabaseAdmin
      .from('users')
      .update({ role: u.role, full_name: u.full_name })
      .eq('id', userMap[u.role]);
  }

  // 2. Aggregator + Recycler
  const agg = await upsertAggregator(userMap['aggregator']);
  log(`aggregator: ${agg.org_name} (${agg.id})`);

  const rec = await upsertRecycler(userMap['recycler']);
  log(`recycler: ${rec.company_name} (${rec.id})`);

  // 3. Dropboxes
  const dropboxes = await upsertDropboxes(agg.id);

  // 4. Sample pickups untuk demo flow
  await seedSamplePickups({
    userId: userMap['user'],
    aggregatorId: agg.id,
    recyclerId: rec.id,
    dropboxId: dropboxes[0].id,
  });

  console.log('\n=== SEED SELESAI ===');
  console.log('Akun demo (semua password: password123):');
  DEMO_USERS.forEach((u) =>
    console.log(`  ${u.role.padEnd(11)} → ${u.email}`)
  );
  console.log('\nUji cepat: POST /api/auth/login dengan demo.user@ecoloop.id\n');
}

main().catch((err) => {
  console.error('[seed] GAGAL:', err.message || err);
  process.exit(1);
});
