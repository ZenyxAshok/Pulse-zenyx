'use strict';
const jwt   = require('jsonwebtoken');
const { USERS, TENANTS } = require('../config/mockData');

const SECRET  = process.env.JWT_SECRET     || 'dev_secret_change_me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

function _findUser(email) {
  return USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.active) || null;
}

async function login(email, password) {
  const user = _findUser(email);
  if (!user) throw { status: 401, message: 'Invalid email or password.' };

  // Dev mode: plain compare. Production: replace with bcrypt.compare(password, user.pwHash)
  const valid = (password === user.pwHash);
  if (!valid) throw { status: 401, message: 'Invalid email or password.' };

  const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
  const token   = jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

  return { token, user: _safe(user) };
}

function verifyToken(token) {
  try   { return jwt.verify(token, SECRET); }
  catch { throw { status: 401, message: 'Session expired. Please sign in again.' }; }
}

function getUserById(id) {
  const user = USERS.find(u => u.id === id);
  return user ? _safe(user) : null;
}

function _safe(user) {
  const tenant = user.tenantId ? TENANTS[user.tenantId] : null;
  return {
    id: user.id, name: user.name, email: user.email,
    initials: user.initials, role: user.role, tenantId: user.tenantId,
    tenant: tenant ? { id: tenant.id, name: tenant.name, location: tenant.location, plan: tenant.plan, planPrice: tenant.planPrice } : null,
  };
}

module.exports = { login, verifyToken, getUserById };
