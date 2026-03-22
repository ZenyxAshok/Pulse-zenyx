'use strict';
const express = require('express');
const jwt = require('jsonwebtoken');
const { USERS, TENANTS } = require('../config/data');
const { JWT_SECRET, verifyToken, noCache } = require('../middleware/auth');

const router = express.Router();
router.use(noCache);

// POST /svc/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const tenant = user.tenantId ? TENANTS[user.tenantId] : null;

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    tenantId: user.tenantId,
    hospitalName: tenant?.name || null,
    plan: tenant?.plan || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  // Redirect target based on role
  const redirect = ['admin','noc'].includes(user.role) ? '/noc' : '/dashboard';

  res.json({
    token,
    user: { ...payload },
    redirect,
  });
});

// GET /svc/auth/me — verify token + return user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /svc/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
