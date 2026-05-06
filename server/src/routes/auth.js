// server/src/middlewares/auth.js
//
// requireAuth   → verifikasi JWT Supabase, load profil, attach ke req.user
// requireRole   → membatasi route ke role tertentu (pakai SETELAH requireAuth)

import { supabaseAdmin } from '../db/supabase.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'missing_token' });

    // Verifikasi token ke Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    // Load profil (role tinggal di public.users)
    const { data: profile, error: pErr } = await supabaseAdmin
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', data.user.id)
      .single();

    if (pErr || !profile) {
      return res.status(401).json({ error: 'profile_not_found' });
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      jwt: token,
    };
    next();
  } catch (err) {
    console.error('[requireAuth] unexpected error:', err);
    return res.status(500).json({ error: 'auth_error' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', required: roles });
    }
    next();
  };
}
