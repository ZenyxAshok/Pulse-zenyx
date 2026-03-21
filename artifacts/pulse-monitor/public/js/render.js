// frontend/public/js/render.js — Pulse by ZENYX v3
'use strict';

const { esc, set, html, ring } = PULSE.ui;
const { ASSET_ICONS, SEV, RISK_BADGE, RISK_LABEL, TICKET_BADGE } = PULSE;

// ════════════════════════════════════════════
// DASHBOARD — Premium Enterprise Redesign
// ════════════════════════════════════════════
function renderDashboard(d) {
  // NOC desc
  set('noc-desc', d.nocMsg || 'ZENYX NOC is actively monitoring your hospital 24×7');

  // Health score ring
  set('score-num', d.healthScore);
  const fill = document.getElementById('score-fill');
  if (fill) {
    const c = 2 * Math.PI * 38;
    const offset = c - (d.healthScore / 100) * c;
    const color  = d.healthScore >= 90 ? 'var(--green)' : d.healthScore >= 70 ? 'var(--yellow)' : 'var(--red)';
    setTimeout(() => {
      fill.style.strokeDasharray  = c.toFixed(1);
      fill.style.strokeDashoffset = offset.toFixed(1);
      fill.style.stroke = color;
    }, 120);
  }

  // Health label + message
  set('health-title', d.healthLabel);
  set('health-msg',   d.healthMsg);

  // Pills
  html('health-pills', (d.pills || []).map(p =>
    `<div class="hp hp-${p.s}">${p.s === 'ok' ? '✓' : p.s === 'warn' ? '⚠' : '✗'} ${esc(p.label)}</div>`
  ).join(''));

  // Stats
  const mu = document.getElementById('meta-uptime');
  if (mu) {
    mu.textContent = d.monthUptime + '%';
    mu.style.color = d.monthUptime >= 99 ? 'var(--green)' : 'var(--yellow)';
  }
  set('meta-devices', d.devicesMonitored);
  const ma = document.getElementById('meta-alerts');
  if (ma) {
    ma.textContent = d.activeAlerts;
    ma.style.color = d.activeAlerts > 0 ? 'var(--red)' : 'var(--green)';
  }

  // Business Metrics Strip
  _setBizMetric('bmc-internet', d.metrics?.internet);
  _setBizMetric('bmc-firewall', d.metrics?.firewall);
  _setBizMetric('bmc-servers',  d.metrics?.servers);
  _setBizMetric('bmc-wifi',     d.metrics?.wifi);
  _setBizMetric('bmc-backup',   d.metrics?.backup);

  // Risk Panel
  _renderRiskPanel(d.active || [], d.activeAlerts || 0);

  // Infrastructure Status
  html('svc-list', (d.services || []).map(s => {
    const sc    = s.sc || 'ok';
    const dotCl = sc === 'ok' ? 'ok' : sc === 'warn' ? 'warn' : 'bad';
    const fillCl = sc === 'ok' ? 'fill-green' : sc === 'warn' ? 'fill-yellow' : 'fill-red';
    const pct   = s.uptime > 0 ? s.uptime + '%' : 'Down';
    const impact = _svcImpact(s.name);
    return `<div class="svc-item">
      <div class="svc-status-dot ${dotCl}"></div>
      <div class="svc-icon">${_svcIcon(s.name)}</div>
      <div class="svc-info">
        <div class="svc-name">${esc(s.name)}</div>
        <div class="svc-impact">${esc(impact)}</div>
        <div class="svc-meta">${esc(s.meta)}</div>
      </div>
      <div class="svc-uptime-wrap">
        <div class="uptime-bar-bg"><div class="uptime-bar-fill ${fillCl}" style="width:${s.uptime}%"></div></div>
        <div class="uptime-pct">${pct}</div>
      </div>
    </div>`;
  }).join('') || '<div class="re-empty"><div class="re-empty-icon">🖥️</div><div class="re-empty-msg">No infrastructure data</div></div>');

  // Recent Risk Events (was "Recent Alerts")
  html('dash-alerts', _renderRiskEvents(d.active || []));
}

function _setBizMetric(prefix, m) {
  if (!m) return;
  const valEl = document.getElementById(prefix + '-val');
  const stEl  = document.getElementById(prefix + '-st');
  if (valEl) valEl.textContent = m.count ?? m.val ?? '—';
  if (stEl) {
    const ts = m.trend_status || m.ts || 'ok';
    stEl.textContent = m.trend || (ts === 'ok' ? 'All Good' : ts === 'warn' ? 'Check Needed' : 'Action Required');
    stEl.className = 'biz-status ' + (ts === 'ok' ? 'bs-ok' : ts === 'warn' ? 'bs-warn' : 'bs-down');
  }
}

function _renderRiskPanel(activeAlerts, count) {
  const badge = document.getElementById('risk-count-badge');
  if (badge) {
    badge.textContent = count > 0 ? count + ' Risk' + (count > 1 ? 's' : '') : 'All Clear';
    badge.className = 'risk-count-badge' + (count === 0 ? ' ok' : '');
  }

  if (!activeAlerts.length) {
    html('risk-panel', `
      <div class="all-clear-card">
        <div class="ac-icon">🛡️</div>
        <div class="ac-title">All Systems Stable</div>
        <div class="ac-msg">No active business risks detected. All critical hospital IT systems are operating normally.</div>
        <div class="ac-sub">ZENYX NOC is actively monitoring your infrastructure 24×7</div>
      </div>`);
    return;
  }

  html('risk-panel', activeAlerts.slice(0, 4).map(a => {
    const sev = a.sev || 'info';
    const sevCl = sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'info';
    const sevLabel = sev === 'critical' ? 'Critical Risk' : sev === 'warning' ? 'Business Warning' : 'Advisory';
    const impact = _alertImpact(a);
    const since = a.since
      ? _relTime(new Date(a.since))
      : '';
    return `<div class="risk-card ${sevCl}" onclick="navTo('alerts')">
      <div class="rc-dot ${sevCl}"></div>
      <div class="rc-body">
        <div class="rc-sev ${sevCl}">${sevLabel}</div>
        <div class="rc-title">${esc(a.title)}</div>
        <div class="rc-impact">${esc(impact)}</div>
        <div class="rc-time">${since}</div>
      </div>
      <div class="rc-action" onclick="event.stopPropagation();navTo('alerts')">View →</div>
    </div>`;
  }).join(''));
}

function _renderRiskEvents(activeAlerts) {
  if (!activeAlerts.length) {
    return `<div class="re-empty">
      <div class="re-empty-icon">✅</div>
      <div class="re-empty-title">No Active Risk Events</div>
      <div class="re-empty-msg">All monitored systems are operating within normal parameters</div>
    </div>`;
  }
  return activeAlerts.slice(0, 5).map(a => {
    const sev = a.sev || 'info';
    const sevCl = sev === 'critical' ? 'crit' : sev === 'warning' ? 'warn' : 'info-row';
    const impact = _alertImpact(a);
    const since = a.since ? _relTime(new Date(a.since)) : '';
    return `<div class="re-item ${sevCl}" onclick="PULSE.ui.toast('${esc(a.title)}')">
      <div class="re-title">${esc(a.title)}</div>
      <div class="re-impact">${esc(impact)}</div>
      <div class="re-meta">${since}${a.ticketId ? ' · Ticket #' + esc(a.ticketId) : ''}</div>
    </div>`;
  }).join('');
}

function _alertImpact(a) {
  if (a.impact) return a.impact;
  const t = (a.title || '').toLowerCase();
  if (/internet|wan|isp|connectivity/i.test(t)) return 'Hospital internet connectivity may be affected';
  if (/firewall|security|vpn/i.test(t))         return 'Network security posture may be degraded';
  if (/server|his|emr|pacs|application/i.test(t)) return 'Clinical or admin applications may be impacted';
  if (/backup|storage/i.test(t))                 return 'Data recovery capability may be at risk';
  if (/wi-fi|wifi|wireless/i.test(t))            return 'Wireless coverage in hospital may be reduced';
  if (/switch|network/i.test(t))                 return 'Internal network connectivity may be degraded';
  return a.desc || 'May impact hospital IT operations';
}

function _relTime(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)   return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function _svcIcon(name) {
  if (/internet|fibernet|airtel|act|jio|isp|wan/i.test(name)) return '🌐';
  if (/backup/i.test(name))                                    return '💾';
  if (/firewall|fortigate|cisco asa|palo|sonic/i.test(name))  return '🔥';
  if (/his|emr|pacs|radiology|server|cluster/i.test(name))    return '🗄️';
  if (/wi-fi|wifi|ap|meraki/i.test(name))                     return '📡';
  if (/switch/i.test(name))                                    return '🔀';
  return '🔌';
}

function _svcImpact(name) {
  if (/internet|wan|isp|fibernet/i.test(name)) return 'External connectivity · Telemedicine';
  if (/firewall|sonic|fortigate/i.test(name))  return 'Network security · Access control';
  if (/his|emr/i.test(name))                   return 'Patient records · Clinical workflows';
  if (/pacs|radiology/i.test(name))             return 'Radiology · Diagnostic imaging';
  if (/server|cluster/i.test(name))             return 'Core infrastructure · Applications';
  if (/backup/i.test(name))                     return 'Business continuity · Data recovery';
  if (/wi-fi|wifi|ap/i.test(name))              return 'Wireless coverage · Staff mobility';
  if (/switch/i.test(name))                     return 'Internal networking · LAN connectivity';
  return 'Hospital IT infrastructure';
}

// ════════════════════════════════════════════
// ASSETS
// ════════════════════════════════════════════
function renderAssets(d) {
  set('asset-total',   d.total   || 0);
  set('asset-online',  d.online  || 0);
  set('asset-offline', d.offline || 0);
  set('asset-warning', d.warning || 0);

  const STATUS = {
    online:  `<span class="badge badge-green"><span class="badge-dot"></span>Online</span>`,
    offline: `<span class="badge badge-red">✗ Offline</span>`,
    warning: `<span class="badge badge-yellow"><span class="badge-dot"></span>Degraded</span>`,
  };

  html('assets-tbody', !d.assets?.length
    ? `<tr><td colspan="7" class="td-empty">No assets found.</td></tr>`
    : d.assets.map(a => {
        const ac = a.status === 'offline' ? 'var(--red)' : a.status === 'warning' ? 'var(--yellow)' : 'var(--green)';
        return `<tr onclick="PULSE.ui.toast('${esc(a.name)} · ${a.ip} · ${esc(a.loc)}')">
          <td><div class="asset-name-wrap">
            <div class="asset-icon">${ASSET_ICONS[a.cat] || '📦'}</div>
            <div><div class="asset-nm">${esc(a.name)}</div><div class="asset-ip">${a.ip}</div></div>
          </div></td>
          <td class="td-dim">${esc(a.cat)}</td>
          <td class="td-dim">${esc(a.loc)}</td>
          <td class="mono">${a.ip}</td>
          <td>${STATUS[a.status] || ''}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${ac};">${a.avail > 0 ? a.avail + '%' : '0%'}</td>
          <td style="font-size:12px;color:${a.status === 'offline' ? 'var(--red)' : 'var(--t3)'};">${esc(a.seen)}</td>
        </tr>`;
      }).join('')
  );
}

// ════════════════════════════════════════════
// ALERTS
// ════════════════════════════════════════════
function renderAlerts(d) {
  set('alert-critical', d.counts?.critical ?? 0);
  set('alert-warning',  d.counts?.warning  ?? 0);
  set('alert-resolved', d.counts?.resolved ?? 0);

  html('alerts-active',   renderAlertRows(d.active   || []));
  html('alerts-resolved', renderAlertRows(d.resolved || []));
}

function renderAlertRows(rows) {
  if (!rows.length) return `<p class="empty-msg">No alerts in this category ✓</p>`;
  return rows.map(a => {
    const s    = SEV[a.sev] || SEV.info;
    const since = a.since ? new Date(a.since).toLocaleString('en-IN', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
    const res   = a.resolvedAt ? ` · Resolved ${new Date(a.resolvedAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}` : '';
    const tkt   = a.ticketId ? ` · Ticket #${a.ticketId}` : '';
    return `<div class="alert-row ${s.cls}" onclick="PULSE.ui.toast('#${esc(a.ticketId || '')} — ${esc(a.title)}')">
      <div class="ar-icon">${s.icon}</div>
      <div class="ar-body">
        <div class="ar-title">${esc(a.title)}</div>
        <div class="ar-desc">${esc(a.desc)}</div>
        <div class="ar-time">${since}${res}${tkt}</div>
      </div>
      <div class="ar-badge"><span class="badge ${s.badgeCls}">${s.label}</span></div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════
// UPTIME
// ════════════════════════════════════════════
function renderUptime(d) {
  html('uptime-rings', (d.services || []).map(s => `
    <div class="uring-card">
      <div class="uring-wrap">
        ${PULSE.ui.ring(s.uptime, s.color)}
        <div class="uring-pct" style="color:${s.color === 'green' ? 'var(--t1)' : s.color === 'yellow' ? 'var(--yellow)' : 'var(--red)'}">${s.uptime}%</div>
      </div>
      <div class="uring-label">${esc(s.name)}</div>
    </div>`).join('')
  );

  const TIPS = { ok:'100% Uptime', partial:'Partial Outage', down:'Major Outage', future:'Future' };
  html('cal-grid', (d.calendar || []).map((day, i) =>
    `<div class="cal-day cal-${day}" title="Day ${i + 1}: ${TIPS[day] || day}"
          onclick="PULSE.ui.toast('Day ${i + 1}: ${TIPS[day] || day}')"></div>`
  ).join(''));
}

// ════════════════════════════════════════════
// RECOMMENDATIONS
// ════════════════════════════════════════════
function renderRecommendations(d) {
  html('recs-list', !d.items?.length
    ? `<p class="empty-msg">No recommendations — all systems in good shape ✓</p>`
    : d.items.map(r => `
      <div class="risk-item ${r.level}" onclick="PULSE.ui.toast('${esc(r.title)}')">
        <div class="ri-icon">${r.icon}</div>
        <div class="ri-body">
          <div class="ri-title">${esc(r.title)}</div>
          <div class="ri-desc">${esc(r.desc)}</div>
          <div class="ri-action">→ ${esc(r.action)}</div>
        </div>
        <div><span class="badge ${RISK_BADGE[r.level]}">${RISK_LABEL[r.level] || r.level}</span></div>
      </div>`).join('')
  );
}

// ════════════════════════════════════════════
// SUPPORT
// ════════════════════════════════════════════
function renderSupport(tickets, tenant) {
  html('tickets-list', !tickets.tickets?.length
    ? `<div class="td-empty" style="padding:20px">No tickets found.</div>`
    : tickets.tickets.map(t => {
        const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'}) : '—';
        return `<div class="ticket-row" onclick="PULSE.ui.toast('Ticket #${t.id}: ${esc(t.title)}')">
          <div class="ticket-id">#${esc(t.id)}</div>
          <div class="ticket-title">${esc(t.title)}</div>
          <span class="ticket-status ${TICKET_BADGE[t.status] || ''}">${t.status.replace('_', ' ')}</span>
          <div class="ticket-date">${date}</div>
        </div>`;
      }).join('')
  );

  if (tenant) {
    set('acct-plan',    tenant.plan);
    set('acct-price',   tenant.planPrice);
    set('acct-sla',     tenant.sla);
    set('acct-renewal', tenant.renewalDate
      ? new Date(tenant.renewalDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})
      : '—');
  }
}

// Export
PULSE.render = {
  dashboard:       renderDashboard,
  assets:          renderAssets,
  alerts:          renderAlerts,
  uptime:          renderUptime,
  recommendations: renderRecommendations,
  support:         renderSupport,
};
