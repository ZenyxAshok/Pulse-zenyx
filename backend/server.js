'use strict';
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const ticketRoutes = require('./routes/tickets');
const nocRoutes = require('./routes/noc');
const deviceRoutes = require('./routes/devices');

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Too many requests' } });
app.use('/svc/', limiter);

// Static files — frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API routes — all under /svc/
app.use('/svc/auth', authRoutes);
app.use('/svc/dashboard', dashboardRoutes);
app.use('/svc/alerts', alertRoutes);
app.use('/svc/tickets', ticketRoutes);
app.use('/svc/noc', nocRoutes);
app.use('/svc/devices', deviceRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', product: 'Pulse by ZENYX', version: '3.0.0' }));

// SPA fallback — all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🫀 Pulse by ZENYX running on port ${PORT}`);
  console.log(`   Landing  → http://localhost:${PORT}/`);
  console.log(`   Login    → http://localhost:${PORT}/login`);
  console.log(`   Dashboard→ http://localhost:${PORT}/dashboard`);
  console.log(`   NOC      → http://localhost:${PORT}/noc\n`);
});
