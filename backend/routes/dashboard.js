'use strict';
const express = require('express');
const { verifyToken, requireRole, noCache } = require('../middleware/auth');
const { getDashboardData } = require('../services/hospitalService');

const router = express.Router();
router.use(noCache, verifyToken, requireRole('client'));

// GET /svc/dashboard — main dashboard data for logged-in hospital
router.get('/', async (req, res) => {
  try {
    const data = await getDashboardData(req.user.tenantId);
    res.json(data);
  } catch (err) {
    console.error('[Dashboard]', err.message);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;
