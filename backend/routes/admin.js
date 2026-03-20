'use strict';
const express = require('express');
const router  = express.Router();
const svc     = require('../services/hospitalService');
const zabbix  = require('../services/zabbixAdapter');
const { authenticate, zenyxOnly } = require('../middleware/auth');
const { TENANTS, USERS }          = require('../config/mockData');

router.use(authenticate, zenyxOnly);

// GET /api/admin/tenants — all hospitals summary
router.get('/tenants', async (_req, res) => {
  try { res.json({ ok: true, data: await svc.getAllTenantsSummary() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/admin/tenants/:tenantId — single hospital detail + Zabbix mapping
router.get('/tenants/:tenantId', (req, res) => {
  const t = TENANTS[req.params.tenantId];
  if (!t) return res.status(404).json({ ok: false, error: 'Tenant not found.' });
  res.json({ ok: true, data: {
    ...t,
    zabbixMapping: {
      groupId:   t.zabbixGroupId,
      connected: zabbix.isConnected(),
      note:      'Set ZABBIX_URL in .env and groupId in TENANTS config to activate live data.',
    },
  }});
});

// GET /api/admin/users
router.get('/users', (_req, res) => {
  const safe = USERS.map(({ pwHash, ...u }) => u);
  res.json({ ok: true, data: safe });
});

// GET /api/admin/zabbix/status — live connectivity test
router.get('/zabbix/status', async (_req, res) => {
  try {
    const status = await zabbix.testConnection();
    res.json({ ok: true, data: status });
  } catch (e) {
    res.json({ ok: true, data: { connected: false, error: e.message } });
  }
});

// GET /api/admin/tenant/:tenantId/mapping — show Zabbix mapping for a tenant
router.get('/tenant/:tenantId/mapping', (req, res) => {
  const t = TENANTS[req.params.tenantId];
  if (!t) return res.status(404).json({ ok: false, error: 'Tenant not found.' });
  res.json({ ok: true, data: {
    tenantId:      t.id,
    hospitalName:  t.name,
    zabbixGroupId: t.zabbixGroupId,
    connected:     zabbix.isConnected(),
    instructions:  [
      '1. Set ZABBIX_URL, ZABBIX_USER, ZABBIX_PASS in .env',
      `2. Ensure Zabbix host group ID ${t.zabbixGroupId} contains all ${t.name} devices`,
      '3. Restart the server — live data flows automatically',
    ],
  }});
});

module.exports = router;
