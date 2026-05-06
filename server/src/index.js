// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import pickupsRoutes from './routes/pickups.js';
import dropboxesRoutes from './routes/dropboxes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ecoloop-api', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/pickups',   pickupsRoutes);
app.use('/api/dropboxes', dropboxesRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'internal_server_error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[ecoloop-api] listening on http://localhost:${PORT}`);
});
