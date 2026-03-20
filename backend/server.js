'use strict';
require('dotenv').config();

const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const hospitalRoutes = require('./routes/hospital');
const adminRoutes    = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers (relax CSP for Google Fonts + inline scripts) ──
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { ok:false, error:'Too many attempts. Wait 15 minutes.' } }));
app.use('/api',      rateLimit({ windowMs:      60 * 1000, max: 300, message: { ok:false, error:'Rate limit exceeded.' } }));

// ── Health check (public) ──
app.get('/api/health', (_req, res) => res.json({
  ok: true, product: 'Pulse by ZENYX', version: '2.0.0',
  mode: process.env.ZABBIX_URL ? 'live' : 'mock',
  time: new Date().toISOString(),
}));

// ── API routes ──
const zabbixTestRoutes = require('./routes/zabbixTest');
app.use('/api/auth',    authRoutes);
app.use('/api',         hospitalRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/zabbix',  zabbixTestRoutes); // Zabbix connection diagnostics (admin only)

// ── Serve SPA ──
const STATIC = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(STATIC));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ ok:false, error:'Not found.' });
  res.sendFile(path.join(STATIC, 'index.html'));
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error('[Pulse]', err);
  res.status(err.status || 500).json({ ok:false, error: process.env.NODE_ENV === 'production' ? 'Server error.' : err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║  Pulse by ZENYX v2.0  —  Running        ║
║  http://localhost:${PORT}                   ║
║  Mode: ${process.env.ZABBIX_URL ? 'LIVE (Zabbix connected)' : 'MOCK DATA (Zabbix not set)   '}  ║
╚══════════════════════════════════════════╝

Demo credentials:
  it.admin@apollo.com   / demo1234  (Hospital Admin)
  it.admin@care.com     / demo1234  (Hospital Admin)
  it.admin@yashoda.com  / demo1234  (Hospital Admin)
  ashok@zenyx.in        / demo1234  (Super Admin)
  noc@zenyx.in          / demo1234  (ZENYX NOC)
`);
});

module.exports = app;
