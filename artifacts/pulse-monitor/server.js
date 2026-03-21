'use strict';
require('dotenv').config();

const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes       = require('./routes/auth');
const hospitalRoutes   = require('./routes/hospital');
const adminRoutes      = require('./routes/admin');
const zabbixTestRoutes = require('./routes/zabbixTest');

const app    = express();
const PORT   = process.env.PORT || 3001;
const BASE   = process.env.BASE_PATH || '';  // e.g. '/pulse-monitor'
const STATIC = path.join(__dirname, 'public');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limits
app.use(BASE + '/svc/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));
app.use(BASE + '/svc',      rateLimit({ windowMs: 60 * 1000, max: 300 }));

// Debug route — full Zabbix connection diagnostics (auth test)
app.get('/api/debug/zabbix', async (req, res) => {
  const zabbix  = require('./services/zabbixAdapter');
  const url      = process.env.ZABBIX_URL  || null;
  const user     = process.env.ZABBIX_USER || null;
  const pass     = process.env.ZABBIX_PASS || null;
  const connected = zabbix.isConnected();

  const report = {
    connected,
    url,
    user_env_set:  !!user,
    pass_env_set:  !!pass,
    auth_new_field: null,   // uses { username: ... }  (Zabbix ≥ 5.4)
    auth_old_field: null,   // uses { user: ... }      (Zabbix < 5.4)
    api_version:    null,
    error:          null,
  };

  if (!url) { return res.json({ ...report, error: 'ZABBIX_URL not set' }); }

  // Helper: raw JSON-RPC call (no auth)
  const rpcRaw = async (method, params, auth = undefined) => {
    try {
      const body = { jsonrpc: '2.0', method, params, id: 1 };
      if (auth) body.auth = auth;
      const r = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  AbortSignal.timeout(12000),
      });
      return await r.json();
    } catch (e) {
      return { error: e.message };
    }
  };

  // 1. Get API version (no auth needed)
  const verResp = await rpcRaw('apiinfo.version', {});
  report.api_version = verResp.result || verResp.error || verResp;

  // 2. Try Zabbix ≥ 5.4 style login ({ username })
  const newResp = await rpcRaw('user.login', { username: user, password: pass });
  if (newResp.result) {
    report.auth_new_field = 'SUCCESS — token: ' + newResp.result.slice(0, 8) + '…';
  } else {
    report.auth_new_field = 'FAILED — ' + JSON.stringify(newResp.error || newResp);
  }

  // 3. Try Zabbix < 5.4 style login ({ user })
  const oldResp = await rpcRaw('user.login', { user, password: pass });
  if (oldResp.result) {
    report.auth_old_field = 'SUCCESS — token: ' + oldResp.result.slice(0, 8) + '…';
  } else {
    report.auth_old_field = 'FAILED — ' + JSON.stringify(oldResp.error || oldResp);
  }

  console.log('[DEBUG /api/debug/zabbix]', JSON.stringify(report, null, 2));
  res.json(report);
});

// Health check
app.get(BASE + '/svc/health', (_req, res) => res.json({
  ok: true, product: 'Pulse by ZENYX', version: '2.0.0',
  mode: process.env.ZABBIX_URL ? 'live' : 'mock',
  time: new Date().toISOString(),
}));

// API routes
app.use(BASE + '/svc/auth',   authRoutes);
app.use(BASE + '/svc/admin',  adminRoutes);
app.use(BASE + '/svc/zabbix', zabbixTestRoutes);
app.use(BASE + '/svc',        hospitalRoutes);

// Static assets
app.use(BASE, express.static(STATIC));

// Redirect base path without trailing slash
if (BASE) {
  app.get(BASE, (_req, res) => res.sendFile(path.join(STATIC, 'index.html')));
}

// SPA catch-all
app.use((req, res) => {
  if (req.path.includes('/svc/')) return res.status(404).json({ ok: false, error: 'Not found.' });
  res.sendFile(path.join(STATIC, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('[Pulse]', err);
  res.status(err.status || 500).json({ ok: false, error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║  Pulse by ZENYX v2.0  —  Running        ║
║  http://localhost:${PORT}                    ║
║  Base path: ${BASE || '/'}                  ║
║  Mode: ${process.env.ZABBIX_URL ? 'LIVE (Zabbix connected)   ' : 'MOCK DATA (Zabbix not set)'}  ║
╚══════════════════════════════════════════╝

Demo credentials:
  it.admin@apollo.com   / demo1234  (Hospital Admin)
  it.admin@care.com     / demo1234  (Hospital Admin)
  it.admin@yashoda.com  / demo1234  (Hospital Admin)
  ashok@zenyx.in        / demo1234  (Super Admin)
  noc@zenyx.in          / demo1234  (ZENYX NOC)
  it@ubc.in             / demo1234  (UBC - Hospital Admin)
`);
});

module.exports = app;
