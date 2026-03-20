'use strict';
const express = require('express');
const router  = express.Router();
const svc     = require('../services/authService');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok:false, error:'Email and password required.' });
    const result = await svc.login(email.trim(), password);
    res.json({ ok:true, token:result.token, user:result.user });
  } catch (e) {
    res.status(e.status||500).json({ ok:false, error:e.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = svc.getUserById(req.user.sub);
  if (!user) return res.status(404).json({ ok:false, error:'User not found.' });
  res.json({ ok:true, user });
});

// POST /api/auth/logout  (client drops token; server-side is a no-op in JWT mode)
// ZABBIX_IMPL: add token to a Redis revocation list here for real logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ ok:true, message:'Signed out.' });
});

module.exports = router;
