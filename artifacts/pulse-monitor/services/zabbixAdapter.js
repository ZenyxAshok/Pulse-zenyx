'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// ZABBIX ADAPTER — Pulse by ZENYX
// ───────────────────────────────────────────────────────────────────────────────
// THE ONLY file that talks to Zabbix. No other service calls Zabbix directly.
// Credentials live in .env — never reach the frontend.
//
// ACTIVATION: Set ZABBIX_URL, ZABBIX_USER, ZABBIX_PASS in .env
// When those are absent → every method returns null → hospitalService falls
// back to mock data automatically. No code changes needed.
// ═══════════════════════════════════════════════════════════════════════════════

const ZABBIX_URL  = process.env.ZABBIX_URL  || null;
const ZABBIX_USER = process.env.ZABBIX_USER || null;
const ZABBIX_PASS = process.env.ZABBIX_PASS || null;

// Cached auth token — shared across all requests in this process
let _authToken   = null;
let _tokenExpiry = 0;
const TOKEN_TTL  = 7 * 60 * 60 * 1000;  // 7h — refresh before Zabbix 8h default

// Severity map: Zabbix priority int → Pulse severity string
const SEV_MAP = {
  0: 'info', 1: 'info', 2: 'info',
  3: 'warning', 4: 'warning', 5: 'critical',
};

// Host availability map: Zabbix available string → Pulse status
const AVAIL_MAP = { '0': 'warning', '1': 'online', '2': 'offline' };

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: JSON-RPC core
// ─────────────────────────────────────────────────────────────────────────────

async function _rpc(method, params, withAuth = true) {
  if (!ZABBIX_URL) return null;

  const body = { jsonrpc: '2.0', method, params, id: 1 };
  if (withAuth) {
    if (!_authToken || Date.now() > _tokenExpiry) await _authenticate();
    body.auth = _authToken;
  }

  let res;
  try {
    res = await fetch(ZABBIX_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(15000),
    });
  } catch (err) {
    console.warn('[ZabbixAdapter] Network error on', method, '—', err.message);
    return null;
  }

  if (!res.ok) {
    console.warn('[ZabbixAdapter] HTTP', res.status, 'on', method);
    return null;
  }

  const json = await res.json().catch(() => null);
  if (!json) { console.warn('[ZabbixAdapter] Non-JSON from Zabbix on', method); return null; }

  if (json.error) {
    // Session expired → force re-auth on next call
    if (/(session|login)/i.test(json.error.data || '')) { _authToken = null; _tokenExpiry = 0; }
    console.warn('[ZabbixAdapter] API error on', method, '—', json.error.data || json.error.message);
    return null;
  }

  return json.result;
}

async function _authenticate() {
  console.log('[ZabbixAdapter] Authenticating…');
  const result = await _rpc('user.login', { username: ZABBIX_USER, password: ZABBIX_PASS }, false);
  if (!result) throw new Error('Zabbix auth failed — check ZABBIX_USER / ZABBIX_PASS');
  _authToken   = result;
  _tokenExpiry = Date.now() + TOKEN_TTL;
  console.log('[ZabbixAdapter] Auth OK. Token cached.');
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: HOSTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all monitored hosts for a Zabbix host group (= one hospital tenant).
 * Returns normalized asset objects ready for the frontend, or null on failure.
 *
 * Normalized shape: { id, name, ip, cat, loc, status, avail, seen, zabbixHostId }
 */
async function getHosts(groupId) {
  if (!ZABBIX_URL) return null;

  const raw = await _rpc('host.get', {
    groupids:         [String(groupId)],
    output:           ['hostid', 'name', 'status', 'available', 'lastaccess'],
    selectInterfaces: ['ip', 'type'],
    selectInventory:  ['location', 'type'],
    monitored_hosts:  true,
  });

  if (!raw) return null;

  return raw.map(h => {
    const ip     = h.interfaces?.[0]?.ip || 'N/A';
    const inv    = h.inventory || {};
    const status = AVAIL_MAP[h.available] || 'warning';
    const lastMs = parseInt(h.lastaccess || 0) * 1000;

    return {
      id:           'zx_' + h.hostid,
      name:         h.name,
      ip,
      cat:          _guessCategory(h.name, inv.type || ''),
      loc:          inv.location || '',
      status,
      avail:        status === 'online' ? 99.9 : 0,   // refined later by getHostUptime
      seen:         lastMs > 0 ? _timeAgo(lastMs) : 'Never',
      zabbixHostId: parseInt(h.hostid),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: ALERTS / TRIGGERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get currently firing (active) triggers for a host group.
 * Returns normalized alert objects, or null on failure.
 *
 * Normalized shape: { id, sev, title, desc, device, since, resolvedAt, zabbixTriggerId }
 */
async function getActiveTriggers(groupId) {
  if (!ZABBIX_URL) return null;

  const raw = await _rpc('trigger.get', {
    groupids:      [String(groupId)],
    filter:        { value: 1 },        // 1 = PROBLEM (currently firing)
    output:        ['triggerid', 'description', 'priority', 'lastchange', 'comments'],
    selectHosts:   ['name'],
    sortfield:     'priority',
    sortorder:     'DESC',
    limit:         100,
    only_true:     true,
    skipDependent: true,
  });

  if (!raw) return null;

  return raw.map(t => ({
    id:              'zx_' + t.triggerid,
    sev:             SEV_MAP[parseInt(t.priority)] || 'info',
    title:           t.description,
    desc:            t.comments || t.description,
    device:          t.hosts?.[0]?.name || 'Unknown',
    since:           new Date(parseInt(t.lastchange) * 1000).toISOString(),
    resolvedAt:      null,
    ticketId:        null,
    zabbixTriggerId: parseInt(t.triggerid),
  }));
}

/**
 * Get recently resolved problems for a host group.
 * Returns normalized alert objects with resolvedAt set, or null on failure.
 */
async function getResolvedProblems(groupId, daysBack = 30) {
  if (!ZABBIX_URL) return null;

  const timeFrom = Math.floor(Date.now() / 1000) - daysBack * 86400;

  const raw = await _rpc('problem.get', {
    groupids:  [String(groupId)],
    time_from: timeFrom,
    output:    ['eventid', 'name', 'severity', 'clock', 'r_clock'],
    recent:    false,
    sortfield: 'clock',
    sortorder: 'DESC',
    limit:     50,
  });

  if (!raw) return null;

  return raw
    .filter(p => parseInt(p.r_clock) > 0)
    .map(p => ({
      id:         'zxp_' + p.eventid,
      sev:        SEV_MAP[parseInt(p.severity)] || 'info',
      title:      p.name,
      desc:       p.name,
      device:     '',
      since:      new Date(parseInt(p.clock) * 1000).toISOString(),
      resolvedAt: new Date(parseInt(p.r_clock) * 1000).toISOString(),
      ticketId:   null,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: UPTIME
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get uptime % for a single host over N days via ICMP ping history.
 * Returns 0–100 float, or null on failure.
 */
async function getHostUptime(zabbixHostId, days = 30) {
  if (!ZABBIX_URL) return null;
  const timeFrom = Math.floor(Date.now() / 1000) - days * 86400;

  // Find the icmpping item for this host
  const items = await _rpc('item.get', {
    hostids: [String(zabbixHostId)],
    search:  { key_: 'icmpping' },
    output:  ['itemid'],
    limit:   1,
  });
  if (!items?.length) return null;

  const hist = await _rpc('history.get', {
    itemids:   [items[0].itemid],
    time_from: timeFrom,
    output:    ['value'],
    history:   3,       // unsigned integer
    limit:     50000,
  });
  if (!hist?.length) return null;

  const up  = hist.filter(h => parseInt(h.value) === 1).length;
  return Math.round((up / hist.length) * 1000) / 10;
}

/**
 * Batch uptime fetch for multiple hosts — one history.get call instead of N.
 * Returns { [zabbixHostId]: uptimePct }
 */
async function getBatchHostUptime(hostIds, days = 30) {
  if (!ZABBIX_URL || !hostIds?.length) return {};
  const timeFrom = Math.floor(Date.now() / 1000) - days * 86400;

  // Get all icmpping items for these hosts
  const items = await _rpc('item.get', {
    hostids: hostIds.map(String),
    search:  { key_: 'icmpping' },
    output:  ['itemid', 'hostid'],
  });
  if (!items?.length) return {};

  const itemToHost = {};
  const itemIds = [];
  for (const item of items) {
    itemToHost[item.itemid] = item.hostid;
    itemIds.push(item.itemid);
  }

  const hist = await _rpc('history.get', {
    itemids:   itemIds,
    time_from: timeFrom,
    output:    ['itemid', 'value'],
    history:   3,
    limit:     200000,
  });
  if (!hist?.length) return {};

  // Aggregate per host
  const counts = {};
  for (const row of hist) {
    const hid = itemToHost[row.itemid];
    if (!hid) continue;
    if (!counts[hid]) counts[hid] = { up: 0, total: 0 };
    counts[hid].total++;
    if (parseInt(row.value) === 1) counts[hid].up++;
  }

  const result = {};
  for (const [hid, { up, total }] of Object.entries(counts)) {
    result[hid] = Math.round((up / total) * 1000) / 10;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute 0–100 health score from active triggers.
 * Formula: 100 − (critical × 15) − (warning × 5), clamped 0–100.
 */
function calcHealthScore(triggers) {
  if (!triggers?.length) return 100;
  const crit = triggers.filter(t => t.sev === 'critical').length;
  const warn = triggers.filter(t => t.sev === 'warning').length;
  return Math.max(0, Math.min(100, 100 - crit * 15 - warn * 5));
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: CONNECTION UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const isConnected = () => !!ZABBIX_URL;

/** Test Zabbix connectivity — used by admin status endpoint. */
async function testConnection() {
  if (!ZABBIX_URL) return { connected: false, mode: 'mock', error: 'ZABBIX_URL not set in .env' };
  try {
    await _authenticate();
    const version = await _rpc('apiinfo.version', {}, false);
    return { connected: true, url: ZABBIX_URL, mode: 'live', version: version || 'unknown' };
  } catch (err) {
    return { connected: false, url: ZABBIX_URL, mode: 'error', error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function _guessCategory(name, invType) {
  const n = (name + ' ' + invType).toLowerCase();
  if (/firewall|fortigate|palo|asa|utm|ngfw/.test(n)) return 'Firewall';
  if (/switch|sw-|sw_|distribution|access.?sw/.test(n)) return 'Switch';
  if (/ap-|access.?point|wifi|wi-fi|meraki|unifi|ubiquiti/.test(n)) return 'Wi-Fi AP';
  if (/nas|backup|storage|san|nfs|raid/.test(n)) return 'Storage';
  if (/cctv|nvr|dvr|camera/.test(n)) return 'CCTV';
  if (/ups|apc|eaton|power/.test(n)) return 'UPS';
  if (/pc|workstation|desktop|laptop|thin.?client/.test(n)) return 'Computer';
  return 'Server';
}

function _timeAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60)    return 'Just now';
  if (sec < 3600)  return Math.floor(sec / 60) + ' min ago';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
  return Math.floor(sec / 86400) + 'd ago';
}

module.exports = {
  getHosts, getActiveTriggers, getResolvedProblems,
  getHostUptime, getBatchHostUptime,
  calcHealthScore, isConnected, testConnection,
};
