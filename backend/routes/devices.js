'use strict';
const express = require('express');
const { verifyToken, requireRole, noCache } = require('../middleware/auth');
const { getAssets } = require('../services/hospitalService');

const router = express.Router();
router.use(noCache, verifyToken, requireRole('client'));

router.get('/', async (req, res) => {
  try {
    const assets = await getAssets(req.user.tenantId);
    res.json({ assets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load devices' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assets = await getAssets(req.user.tenantId);
    const device = assets.find(a => a.id === req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    // Add mock history for detail view
    device.history = Array.from({length:24}, (_,i) => ({
      hour: `${String(23-i).padStart(2,'0')}:00`,
      status: Math.random() > 0.15 ? 'healthy' : 'warning',
      cpu: Math.round(20 + Math.random()*60),
      responseMs: Math.round(5 + Math.random()*50),
    }));
    res.json({ device });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load device' });
  }
});

module.exports = router;
