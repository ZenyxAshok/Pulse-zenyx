'use strict';
const express = require('express');
const { verifyToken, requireRole, noCache } = require('../middleware/auth');
const { getDashboardData } = require('../services/hospitalService');
const { TENANTS, TICKETS } = require('../config/data');

const router = express.Router();
router.use(noCache, verifyToken, requireRole('admin','noc'));

// GET /svc/noc/overview — all hospitals summary
router.get('/overview', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      Object.keys(TENANTS).map(id => getDashboardData(id))
    );

    const hospitals = results.map((r, i) => {
      const tenantId = Object.keys(TENANTS)[i];
      if (r.status === 'rejected') {
        return { tenantId, name: TENANTS[tenantId].name, error: true };
      }
      const d = r.value;
      return {
        tenantId,
        name:        d.tenant.name,
        city:        d.tenant.city,
        plan:        d.tenant.plan,
        riskScore:   d.risk.score,
        riskGrade:   d.risk.grade,
        riskLabel:   d.risk.label,
        total:       d.summary.total,
        healthy:     d.summary.healthy,
        warning:     d.summary.warning,
        critical:    d.summary.critical,
        uptimePct:   d.summary.uptimePct,
        alertCount:  d.alerts.length,
        lastAlert:   d.alerts[0]?.time || null,
        dataSource:  d.dataSource,
        openTickets: TICKETS.filter(t=>t.tenantId===tenantId && t.status!=='resolved').length,
      };
    });

    const allAlerts = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.alerts.map(a => ({ ...a, hospitalName: r.value.tenant.name, tenantId: r.value.tenant.id })))
      .sort((a,b) => new Date(b.time) - new Date(a.time))
      .slice(0, 50);

    res.json({
      hospitals,
      allAlerts,
      summary: {
        total:    hospitals.length,
        critical: hospitals.filter(h=>h.riskGrade==='CRITICAL').length,
        atRisk:   hospitals.filter(h=>h.riskGrade==='AT RISK').length,
        healthy:  hospitals.filter(h=>['SAFE','NOTICE'].includes(h.riskGrade)).length,
        openTickets: TICKETS.filter(t=>t.status!=='resolved').length,
      },
    });
  } catch (err) {
    console.error('[NOC Overview]', err);
    res.status(500).json({ error: 'Failed to load NOC overview' });
  }
});

// GET /svc/noc/hospital/:id — drill-down for one hospital
router.get('/hospital/:id', async (req, res) => {
  try {
    const data = await getDashboardData(req.params.id);
    data.tickets = TICKETS.filter(t=>t.tenantId===req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load hospital data' });
  }
});

// GET /svc/noc/tickets — all tickets
router.get('/tickets', (req, res) => {
  const tickets = [...TICKETS].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  res.json({ tickets });
});

// PATCH /svc/noc/tickets/:id — NOC updates any ticket
router.patch('/tickets/:id', (req, res) => {
  const ticket = TICKETS.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status, assignedTo } = req.body;
  if (status)     ticket.status     = status;
  if (assignedTo) ticket.assignedTo = assignedTo;
  ticket.updatedAt = new Date().toISOString();
  res.json({ ticket });
});

module.exports = router;
