'use strict';
// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TRANSFORMER — Pulse by ZENYX
// ───────────────────────────────────────────────────────────────────────────────
// Converts raw Zabbix data (hosts + triggers + uptimeMap) into clean, 
// business-friendly JSON for the Pulse frontend.
//
// Rules:
//   - No Zabbix IDs, field names, or raw values reach the frontend
//   - Language is business-friendly, not technical monitoring jargon
//   - All transformations are pure functions (input → output, no side effects)
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the complete dashboard payload from live Zabbix data.
 *
 * @param {object}   tenant     — TENANTS config entry
 * @param {Array}    hosts      — normalized hosts from zabbixAdapter.getHosts()
 * @param {Array}    triggers   — normalized triggers from getActiveTriggers()
 * @param {object}   uptimeMap  — { [zabbixHostId]: pct } from getBatchHostUptime()
 *
 * @returns {object} Dashboard payload matching the Pulse frontend data contract
 */
function buildDashboard(tenant, hosts, triggers, uptimeMap) {
  const active   = triggers.filter(t => !t.resolvedAt);
  const score    = calcHealthScore(active);
  const label    = _scoreLabel(score);
  const msg      = _scoreMessage(tenant.name, active);
  const pills    = _buildPills(hosts, active, uptimeMap);
  const metrics  = _buildMetrics(hosts, active, uptimeMap);
  const services = _buildServices(hosts, uptimeMap);
  const uptime   = _calcMonthUptime(uptimeMap);

  return {
    healthScore:      score,
    healthLabel:      label,
    healthMsg:        msg,
    pills,
    metrics,
    services,
    monthUptime:      uptime,
    devicesMonitored: hosts.length,
    activeAlerts:     active.length,
    nocMsg: `${hosts.length} devices tracked · ${active.length} alert${active.length !== 1 ? 's' : ''} require${active.length === 1 ? 's' : ''} attention`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 100 − (critical × 15) − (warning × 5), clamped 0–100.
 */
function calcHealthScore(activeTriggers) {
  if (!activeTriggers?.length) return 100;
  const crit = activeTriggers.filter(t => t.sev === 'critical').length;
  const warn = activeTriggers.filter(t => t.sev === 'warning').length;
  return Math.max(0, Math.min(100, 100 - crit * 15 - warn * 5));
}

function _scoreLabel(score) {
  if (score >= 95) return 'All Systems Healthy';
  if (score >= 85) return 'Good — Minor Issues Detected';
  if (score >= 70) return 'Attention Required';
  if (score >= 50) return 'Degraded — Action Needed';
  return 'Critical — Immediate Action Required';
}

function _scoreMessage(hospitalName, active) {
  if (!active.length) {
    return `${hospitalName} IT infrastructure is fully operational. No active alerts.`;
  }
  const crit = active.filter(t => t.sev === 'critical');
  const warn = active.filter(t => t.sev === 'warning');
  const parts = [];
  if (crit.length) parts.push(`${crit.length} critical issue${crit.length > 1 ? 's' : ''} requiring immediate attention`);
  if (warn.length) parts.push(`${warn.length} warning${warn.length > 1 ? 's' : ''} to review`);
  return `ZENYX has flagged ${parts.join(' and ')}. Your NOC team is monitoring the situation.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS PILLS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the coloured pill array shown in the health hero card.
 * Checks key service categories and maps alert severity → pill state.
 */
function _buildPills(hosts, active, uptimeMap) {
  const pills = [];

  // Check each important category
  const checks = [
    { cat: 'Firewall',   label: 'Firewall',        critLabel: 'Firewall Issue' },
    { cat: 'Server',     label: 'Servers',          critLabel: 'Server Issue'  },
    { cat: 'Switch',     label: 'Network Core',     critLabel: 'Network Issue' },
    { cat: 'Wi-Fi AP',   label: 'Wi-Fi',            critLabel: 'Wi-Fi Issues'  },
    { cat: 'Storage',    label: 'Backup & Storage', critLabel: 'Storage Issue' },
  ];

  for (const { cat, label, critLabel } of checks) {
    const catHosts = hosts.filter(h => h.cat === cat);
    if (!catHosts.length) continue;

    const offline  = catHosts.filter(h => h.status === 'offline');
    const degraded = catHosts.filter(h => h.status === 'warning');

    // Check if any trigger mentions a host in this category
    const catNames  = catHosts.map(h => h.name.toLowerCase());
    const triggered = active.filter(t =>
      catNames.some(n => t.device?.toLowerCase().includes(n) || t.title?.toLowerCase().includes(n))
    );

    if (triggered.some(t => t.sev === 'critical') || offline.length > 0) {
      pills.push({ label: `${offline.length || ''} ${critLabel}`.trim(), s: 'bad' });
    } else if (triggered.some(t => t.sev === 'warning') || degraded.length > 0) {
      pills.push({ label: `${label} Warning`, s: 'warn' });
    } else {
      pills.push({ label: `${label} OK`, s: 'ok' });
    }
  }

  // Internet pill — derived from overall connectivity (firewall uptime proxy)
  const firewalls = hosts.filter(h => h.cat === 'Firewall');
  if (firewalls.length) {
    const fwUp = firewalls.every(h => h.status === 'online');
    pills.unshift({ label: fwUp ? 'Internet Online' : 'Internet Issues', s: fwUp ? 'ok' : 'bad' });
  }

  return pills;
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC CARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the 5 metric card objects (Internet Links, Firewalls, Servers, Wi-Fi, Backup).
 */
function _buildMetrics(hosts, active, uptimeMap) {
  const byCategory = (cat) => hosts.filter(h => h.cat === cat);
  const countOf    = (cat) => byCategory(cat).length;

  // Determine trend status: any critical trigger or offline host → 'down', warning → 'warn', else 'ok'
  const _ts = (cat) => {
    const catHosts = byCategory(cat);
    if (catHosts.some(h => h.status === 'offline')) return 'down';
    if (catHosts.some(h => h.status === 'warning')) return 'warn';
    return 'ok';
  };

  const _trend = (cat) => {
    const ts = _ts(cat);
    if (ts === 'ok')   return `All ${countOf(cat) > 1 ? 'OK' : 'Secure'}`;
    if (ts === 'warn') return '1 Warning';
    const n = byCategory(cat).filter(h => h.status === 'offline').length;
    return `${n} Down`;
  };

  // Backup: look for last successful backup age via storage host uptime
  const storageHosts  = byCategory('Storage');
  const storageUptime = storageHosts.length
    ? Math.min(...storageHosts.map(h => uptimeMap[h.zabbixHostId] ?? 99))
    : 99;
  const backupLabel   = storageUptime >= 95 ? 'Current' : storageUptime >= 70 ? 'Delayed' : 'At Risk';
  const backupTs      = storageUptime >= 95 ? 'ok' : storageUptime >= 70 ? 'warn' : 'down';

  return {
    internet: { count: countOf('Firewall'),  trend: _trend('Firewall'),  ts: _ts('Firewall')  },
    firewall: { count: countOf('Firewall'),  trend: _trend('Firewall'),  ts: _ts('Firewall')  },
    servers:  { count: countOf('Server'),    trend: _trend('Server'),    ts: _ts('Server')    },
    wifi:     { count: countOf('Wi-Fi AP'),  trend: _trend('Wi-Fi AP'),  ts: _ts('Wi-Fi AP')  },
    backup:   { val: backupLabel,            trend: backupLabel,          ts: backupTs         },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE LIST (dashboard uptime bars)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the service status list shown in the dashboard card.
 * Groups hosts by category, picks the worst status in each group.
 */
function _buildServices(hosts, uptimeMap) {
  const ORDER    = ['Firewall', 'Server', 'Switch', 'Wi-Fi AP', 'Storage', 'Computer'];
  const services = [];

  for (const cat of ORDER) {
    const catHosts = hosts.filter(h => h.cat === cat);
    if (!catHosts.length) continue;

    // Overall status = worst individual status
    const hasOffline  = catHosts.some(h => h.status === 'offline');
    const hasWarning  = catHosts.some(h => h.status === 'warning');
    const sc          = hasOffline ? 'bad' : hasWarning ? 'warn' : 'ok';

    // Average uptime for this category
    const uptimes  = catHosts.map(h => uptimeMap[h.zabbixHostId] ?? (h.status === 'online' ? 99.9 : 0));
    const avgUp    = uptimes.reduce((a, b) => a + b, 0) / uptimes.length;

    // Build a business-friendly meta string
    const offlineCount = catHosts.filter(h => h.status === 'offline').length;
    const meta = offlineCount
      ? `${catHosts.length} total · ${offlineCount} offline`
      : `${catHosts.length} device${catHosts.length > 1 ? 's' : ''} · All monitored`;

    // Use first host's name as service label, or generic
    const label = catHosts.length === 1
      ? catHosts[0].name
      : `${cat} Infrastructure (${catHosts.length})`;

    services.push({
      name:   label,
      meta,
      uptime: Math.round(avgUp * 10) / 10,
      sc,
    });
  }

  return services;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPTIME SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate overall month uptime % from the uptimeMap.
 */
function _calcMonthUptime(uptimeMap) {
  const vals = Object.values(uptimeMap);
  if (!vals.length) return 99.9;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATIONS BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate smart recommendations from active Zabbix triggers.
 * Maps trigger severity + device type → actionable recommendations.
 *
 * @param {Array} triggers — active triggers from getActiveTriggers()
 * @returns {Array} recommendation items
 */
function buildRecommendations(triggers) {
  const recs = [];
  const seen = new Set();

  for (const t of triggers) {
    const key = t.sev + '_' + _catFromDevice(t.device);
    if (seen.has(key)) continue;
    seen.add(key);

    const rec = _triggerToRec(t);
    if (rec) recs.push(rec);
  }

  // Always add a generic security opportunity if no critical/warning exists
  if (!triggers.some(t => t.sev === 'critical' || t.sev === 'warning')) {
    recs.push({
      id:     'opp_security',
      level:  'opportunity',
      icon:   '🚀',
      title:  'Upgrade to ZENYX Security Monitoring (SOC Tier)',
      desc:   'Your infrastructure is healthy. Adding ZENYX Security Monitoring gives you 24×7 threat detection, CERT-In compliance reports, and ransomware early warning.',
      action: 'Contact your ZENYX account manager for a proposal',
    });
  }

  return recs;
}

function _triggerToRec(trigger) {
  const cat   = _catFromDevice(trigger.device);
  const isCrit = trigger.sev === 'critical';
  const level  = isCrit ? 'high' : trigger.sev === 'warning' ? 'medium' : 'low';
  const icon   = isCrit ? '🔴' : '🟡';

  // Map device category to recommendation text
  const templates = {
    Server: {
      title:  `Server Issue Detected — ${trigger.device}`,
      desc:   `${trigger.title}. This may impact hospital applications running on this server. ZENYX NOC team is investigating.`,
      action: 'Contact ZENYX NOC for immediate assessment',
    },
    Firewall: {
      title:  `Firewall Alert — ${trigger.device}`,
      desc:   `${trigger.title}. Your network security perimeter may be affected. Do not make configuration changes without ZENYX guidance.`,
      action: 'Contact ZENYX NOC immediately — do not restart without guidance',
    },
    'Wi-Fi AP': {
      title:  `Wi-Fi Access Point Offline — ${trigger.device}`,
      desc:   `${trigger.title}. Staff or clinical devices in the affected area may lose wireless connectivity. Likely PoE or switch port issue.`,
      action: 'ZENYX can dispatch a technician — confirm scheduling',
    },
    Storage: {
      title:  `Storage / Backup Issue — ${trigger.device}`,
      desc:   `${trigger.title}. Data backup may be at risk. Immediate review required to ensure patient data protection under DPDP Act obligations.`,
      action: 'Contact ZENYX for backup health review',
    },
    Switch: {
      title:  `Network Switch Issue — ${trigger.device}`,
      desc:   `${trigger.title}. Network connectivity for connected devices may be affected.`,
      action: 'ZENYX will review switch health remotely',
    },
  };

  const tmpl = templates[cat] || {
    title:  `Alert: ${trigger.title}`,
    desc:   trigger.desc || trigger.title,
    action: 'Contact ZENYX NOC for assessment',
  };

  return {
    id:     'rec_' + trigger.id,
    level,
    icon,
    title:  tmpl.title,
    desc:   tmpl.desc,
    action: tmpl.action,
  };
}

function _catFromDevice(deviceName) {
  if (!deviceName) return 'Server';
  const n = deviceName.toLowerCase();
  if (/firewall|fortigate|palo|asa/.test(n)) return 'Firewall';
  if (/switch|sw-/.test(n))                  return 'Switch';
  if (/ap-|wi-fi|wifi|meraki/.test(n))       return 'Wi-Fi AP';
  if (/nas|backup|storage/.test(n))          return 'Storage';
  return 'Server';
}

module.exports = { buildDashboard, buildRecommendations, calcHealthScore };
