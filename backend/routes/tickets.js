'use strict';
const express = require('express');
const { verifyToken, requireRole, noCache } = require('../middleware/auth');
const { TICKETS, nextTicketId } = require('../config/data');

const router = express.Router();
router.use(noCache, verifyToken, requireRole('client'));

// GET /svc/tickets
router.get('/', (req, res) => {
  const tickets = TICKETS.filter(t => t.tenantId === req.user.tenantId);
  res.json({ tickets, counts: {
    open:        tickets.filter(t=>t.status==='open').length,
    in_progress: tickets.filter(t=>t.status==='in_progress').length,
    resolved:    tickets.filter(t=>t.status==='resolved').length,
  }});
});

// POST /svc/tickets — raise new ticket
router.post('/', (req, res) => {
  const { title, description, severity, deviceId, deviceName } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const ticket = {
    id: nextTicketId(),
    tenantId:   req.user.tenantId,
    title,
    description: description || '',
    severity:    severity || 'info',
    status:      'open',
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    assignedTo:  null,
    slaHours:    severity === 'critical' ? 4 : severity === 'warning' ? 8 : 24,
    deviceId:    deviceId || null,
    deviceName:  deviceName || null,
    autoRaised:  false,
  };
  TICKETS.push(ticket);
  res.status(201).json({ ticket });
});

// PATCH /svc/tickets/:id/status
router.patch('/:id/status', (req, res) => {
  const ticket = TICKETS.find(t => t.id === req.params.id && t.tenantId === req.user.tenantId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status } = req.body;
  if (!['open','in_progress','resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  ticket.status    = status;
  ticket.updatedAt = new Date().toISOString();
  res.json({ ticket });
});

module.exports = router;
