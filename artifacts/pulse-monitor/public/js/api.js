// api.js — Pulse by ZENYX
'use strict';

PULSE.token = {
  get:    ()  => localStorage.getItem('pulse_jwt'),
  set:    (t) => localStorage.setItem('pulse_jwt', t),
  clear:  ()  => localStorage.removeItem('pulse_jwt'),
  exists: ()  => !!localStorage.getItem('pulse_jwt'),
};

async function _req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (PULSE.token.exists()) headers['Authorization'] = 'Bearer ' + PULSE.token.get();

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const BASE_PATH = (window.__PULSE_BASE__ || '') + '/svc';
  const res  = await fetch(BASE_PATH + path, opts);
  const json = await res.json().catch(() => ({ ok:false, error:'Invalid server response.' }));

  if (res.status === 401) {
    PULSE.token.clear();
    window.location.reload();
    throw new Error('Session expired.');
  }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

const _get  = (path)       => _req('GET',  path);
const _post = (path, body) => _req('POST', path, body);

PULSE.api = {
  auth: {
    login: async (email, password) => {
      const r = await _post('/auth/login', { email, password });
      PULSE.token.set(r.token);
      return r.user;
    },
    me:     () => _get('/auth/me').then(r => r.user),
    logout: async () => {
      await _post('/auth/logout', {}).catch(() => {});
      PULSE.token.clear();
      window.location.reload();
    },
  },

  dashboard:       (tenantId) => _get('/dashboard'      + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),
  assets:          (cat, tId) => _get('/assets'         + _qs({ cat, tenantId: tId })).then(r => r.data),
  alerts:          (tenantId) => _get('/alerts'          + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),
  uptime:          (tenantId) => _get('/uptime'          + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),
  recommendations: (tenantId) => _get('/recommendations' + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),
  tenant:          (tenantId) => _get('/tenant'          + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),

  tickets: {
    get:    (tenantId) => _get('/support/tickets' + (tenantId ? '?tenantId=' + tenantId : '')).then(r => r.data),
    create: (body)     => _post('/support/tickets', body).then(r => r.data),
  },

  admin: {
    tenants:       () => _get('/admin/tenants').then(r => r.data),
    zabbixStatus:  () => _get('/admin/zabbix/status').then(r => r.data),
  },
};

function _qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? '?' + s : '';
}
