'use strict';
const express = require('express');
const router  = express.Router();
const svc     = require('../services/hospitalService');
const { authenticate, resolveTenant, requireRole } = require('../middleware/auth');

// All hospital routes require a valid JWT + tenant resolution
router.use(authenticate, resolveTenant);

const wrap = fn => (req, res) =>
  fn(req, res).catch(e => res.status(e.status || 500).json({ ok:false, error: e.message }));

// GET /api/dashboard
router.get('/dashboard', wrap(async (req, res) => {
  const data = await svc.getDashboard(req.tenantId);
  res.json({ ok:true, data });
}));

// GET /api/assets?cat=Server
router.get('/assets', wrap(async (req, res) => {
  const data = await svc.getAssets(req.tenantId, { cat: req.query.cat });
  res.json({ ok:true, data });
}));

// GET /api/alerts
router.get('/alerts', wrap(async (req, res) => {
  const data = await svc.getAlerts(req.tenantId);
  res.json({ ok:true, data });
}));

// GET /api/uptime
router.get('/uptime', wrap(async (req, res) => {
  const data = await svc.getUptime(req.tenantId);
  res.json({ ok:true, data });
}));

// GET /api/recommendations
router.get('/recommendations', wrap(async (req, res) => {
  const data = await svc.getRecommendations(req.tenantId);
  res.json({ ok:true, data });
}));

// GET /api/support/tickets
router.get('/support/tickets', wrap(async (req, res) => {
  const data = await svc.getTickets(req.tenantId);
  res.json({ ok:true, data });
}));

// POST /api/support/tickets  (hospital_admin and above)
router.post('/support/tickets',
  requireRole('super_admin', 'zenyx_admin', 'hospital_admin'),
  wrap(async (req, res) => {
    const ticket = await svc.createTicket(req.tenantId, req.body, req.user.sub);
    res.status(201).json({ ok:true, data:ticket });
  })
);

// GET /api/tenant
router.get('/tenant', wrap(async (req, res) => {
  const data = svc.getTenant(req.tenantId);
  res.json({ ok:true, data });
}));

module.exports = router;
