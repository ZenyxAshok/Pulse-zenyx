'use strict';
const express = require('express');
const { verifyToken, requireRole, noCache } = require('../middleware/auth');
const { getAlerts } = require('../services/hospitalService');

const router = express.Router();
router.use(noCache, verifyToken, requireRole('client'));

// GET /svc/alerts?severity=critical&ack=false
router.get('/', async (req, res) => {
  try {
    const alerts = await getAlerts(req.user.tenantId, req.query);
    res.json({ alerts, count: alerts.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

module.exports = router;
