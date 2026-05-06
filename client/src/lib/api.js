// src/lib/api.js
//
// Wrapper fetch ke backend Express. Otomatis attach JWT dari Supabase session.
// Vite dev server proxy /api ke localhost:4000 (lihat vite.config.js).

import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, { body, query } = {}) {
  let url = `${BASE}${path}`;
  if (query) {
    const usp = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null)
    );
    url += `?${usp.toString()}`;
  }
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(data?.error || `http_${res.status}`);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const api = {
  // ---- Pickups ----
  listPickups: (status) => request('GET', '/pickups', { query: { status } }),
  createPickup: (payload) => request('POST', '/pickups', { body: payload }),
  getPickup: (id) => request('GET', `/pickups/${id}`),
  updatePickupStatus: (id, payload) =>
    request('PATCH', `/pickups/${id}/status`, { body: payload }),

  // ---- Dropboxes (public) ----
  nearbyDropboxes: (lat, lng, radius = 5) =>
    request('GET', '/dropboxes', { query: { lat, lng, radius } }),
  getDropbox: (id) => request('GET', `/dropboxes/${id}`),

  // ---- Auth ----
  me: () => request('GET', '/auth/me'),
};
