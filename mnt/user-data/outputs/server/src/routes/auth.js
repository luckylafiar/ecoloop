// server/src/routes/auth.js
//
// Catatan: frontend PWA bisa langsung pakai supabase.auth.signUp() &
// supabase.auth.signInWithPassword() dengan ANON key — itu jalur utama.
// Endpoint di sini ada untuk:
//   - Demo / Postman testing tanpa frontend
//   - Server-side onboarding (mis. admin onboard recycler)

import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// POST /api/auth/register
// Body: { email, password, full_name, role? }
router.post('/register', async (req, res) => {
  const { email, password, full_name, role = 'user' } = req.body || {};
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  if (!['user', 'aggregator', 'recycler'].includes(role)) {
    return res.status(400).json({ error: 'invalid_role' });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,                       // demo: skip email verification
    user_metadata: { full_name, role },        // → masuk ke trigger handle_new_user
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json({
    user: { id: data.user.id, email: data.user.email, role },
  });
});

// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user.id, email: data.user.email },
  });
});

// GET /api/auth/me
// Header: Authorization: Bearer <jwt>
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
