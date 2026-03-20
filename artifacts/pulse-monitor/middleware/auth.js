'use strict';
const { verifyToken } = require('../services/authService');
const { ZENYX_ROLES } = require('../config/constants');

// Attach decoded JWT payload to req.user
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch (e) {
    res.status(e.status || 401).json({ ok: false, error: e.message });
  }
}

// Resolve tenantId for the request:
//   - ZENYX roles: accept ?tenantId query param, else require it
//   - Hospital roles: always use their own tenantId, block cross-tenant
function resolveTenant(req, res, next) {
  const { role, tenantId: userTenant } = req.user;
  const isZenyx = ZENYX_ROLES.includes(role);

  if (isZenyx) {
    // ZENYX users must supply ?tenantId= for hospital-scoped endpoints
    req.tenantId = req.query.tenantId || userTenant || null;
  } else {
    // Hospital users: block any attempt to read another tenant's data
    const requested = req.query.tenantId;
    if (requested && requested !== userTenant) {
      return res.status(403).json({ ok: false, error: 'Access denied: cross-tenant request.' });
    }
    req.tenantId = userTenant;
  }
  next();
}

// Role guard factory
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Insufficient permissions.' });
    }
    next();
  };
}

const zenyxOnly = requireRole('super_admin', 'zenyx_admin');

module.exports = { authenticate, resolveTenant, requireRole, zenyxOnly };
