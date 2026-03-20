'use strict';
// ─── ZABBIX CONNECTION TEST ROUTES ───────────────────────────────────────────
// These routes help you verify the Zabbix connection step by step.
// Only accessible to super_admin and zenyx_admin.
// Remove or disable this file once Zabbix is confirmed working in production.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const zabbix  = require('../services/zabbixAdapter');
const { TENANTS } = require('../config/mockData');
const { authenticate, zenyxOnly } = require('../middleware/auth');

router.use(authenticate, zenyxOnly);

// ── GET /api/zabbix/ping ──────────────────────────────────────────────────────
// Step 1 test: can we reach Zabbix and authenticate?
router.get('/ping', async (_req, res) => {
  const result = await zabbix.testConnection();
  res.json({
    ok:     result.connected,
    step:   1,
    check:  'Zabbix reachability and authentication',
    result,
    next:   result.connected
      ? 'Connection OK. Now test /api/zabbix/groups to verify host group access.'
      : 'Fix the error above, then retry this endpoint.',
  });
});

// ── GET /api/zabbix/groups ────────────────────────────────────────────────────
// Step 2 test: list all host groups the API user can see
router.get('/groups', async (_req, res) => {
  if (!zabbix.isConnected()) {
    return res.json({ ok: false, step: 2, error: 'ZABBIX_URL not set. Complete Step 1 first.' });
  }

  // We expose getHostGroups via a direct internal call here for diagnostics
  // This is safe because this route is admin-only
  try {
    // Use the adapter's internal _rpc via a workaround — call getHosts with a
    // known group to verify group access, or expose getAllGroups here for admin
    const tenantList = Object.values(TENANTS).map(t => ({
      tenantId:      t.id,
      hospitalName:  t.name,
      zabbixGroupId: t.zabbixGroupId,
      status:        'pending',
    }));

    // Test each tenant's group access
    const results = [];
    for (const t of tenantList) {
      try {
        const hosts = await zabbix.getHosts(t.zabbixGroupId);
        results.push({
          tenantId:      t.tenantId,
          hospitalName:  t.hospitalName,
          zabbixGroupId: t.zabbixGroupId,
          accessible:    hosts !== null,
          hostCount:     hosts ? hosts.length : 0,
          error:         hosts === null ? 'Group not found or no permission' : null,
        });
      } catch (err) {
        results.push({
          tenantId:      t.tenantId,
          hospitalName:  t.hospitalName,
          zabbixGroupId: t.zabbixGroupId,
          accessible:    false,
          hostCount:     0,
          error:         err.message,
        });
      }
    }

    const allOk = results.every(r => r.accessible);
    res.json({
      ok:     allOk,
      step:   2,
      check:  'Host group access per tenant',
      groups: results,
      next:   allOk
        ? 'All groups accessible. Test /api/zabbix/sample/:tenantId to see live data.'
        : 'Fix group IDs in backend/config/mockData.js TENANTS.zabbixGroupId, then retry.',
    });

  } catch (err) {
    res.status(500).json({ ok: false, step: 2, error: err.message });
  }
});

// ── GET /api/zabbix/sample/:tenantId ─────────────────────────────────────────
// Step 3 test: fetch a sample of live data for a specific tenant
router.get('/sample/:tenantId', async (req, res) => {
  const tenant = TENANTS[req.params.tenantId];
  if (!tenant) return res.status(404).json({ ok: false, error: 'Tenant not found.' });

  if (!zabbix.isConnected()) {
    return res.json({ ok: false, error: 'ZABBIX_URL not set. Complete Step 1 first.' });
  }

  try {
    const [hosts, triggers] = await Promise.all([
      zabbix.getHosts(tenant.zabbixGroupId),
      zabbix.getActiveTriggers(tenant.zabbixGroupId),
    ]);

    const score = zabbix.calcHealthScore(triggers || []);

    res.json({
      ok:     true,
      step:   3,
      check:  `Live data sample for ${tenant.name}`,
      data: {
        tenantId:       tenant.id,
        hospitalName:   tenant.name,
        zabbixGroupId:  tenant.zabbixGroupId,
        healthScore:    score,
        hostsFound:     hosts ? hosts.length : 0,
        activeAlerts:   triggers ? triggers.length : 0,
        // Show first 3 hosts and alerts as a preview
        sampleHosts:    (hosts || []).slice(0, 3).map(h => ({
          name:   h.name,
          ip:     h.ip,
          cat:    h.cat,
          status: h.status,
        })),
        sampleAlerts: (triggers || []).slice(0, 3).map(t => ({
          sev:    t.sev,
          title:  t.title,
          device: t.device,
          since:  t.since,
        })),
      },
      next: 'Live data confirmed. Your hospital dashboards will now show real Zabbix data.',
    });

  } catch (err) {
    res.status(500).json({ ok: false, step: 3, error: err.message });
  }
});

module.exports = router;
