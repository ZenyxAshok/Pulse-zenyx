// frontend/public/js/render.js
'use strict';

// ─── Pure render functions. No fetch calls here. ─────────────────────────────
const { esc, set, html, ring } = PULSE.ui;
const { ASSET_ICONS, SEV, RISK_BADGE, RISK_LABEL, TICKET_BADGE } = PULSE;

// ════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════
function renderDashboard(d) {
  // NOC banner
  set('noc-desc', d.nocMsg || '');

  // Health score ring
  set('score-num', d.healthScore);
  const fill = document.getElementById('score-fill');
  if (fill) {
    const offset = 270 - (d.healthScore / 100) * 270;
    const color  = d.healthScore >= 90 ? 'var(--green)' : d.healthScore >= 70 ? 'var(--yellow)' : 'var(--red)';
    setTimeout(() => { fill.style.strokeDashoffset = offset; fill.style.stroke = color; }, 100);
  }

  // Health text
  set('health-title', d.healthLabel);
  set('health-msg',   d.healthMsg);

  // Pills
  html('health-pills', (d.pills||[]).map(p =>
    `<div class="hp hp-${p.s}">${p.s==='ok'?'✓':p.s==='warn'?'⚠':'✗'} ${esc(p.label)}</div>`
  ).join(''));

  // Meta figures
  const mu = document.getElementById('meta-uptime');
  if (mu) { mu.textContent = d.monthUptime + '%'; mu.style.color = d.monthUptime >= 99 ? 'var(--green)' : 'var(--yellow)'; }
  set('meta-devices', d.devicesMonitored);
  const ma = document.getElementById('meta-alerts');
  if (ma) { ma.textContent = d.activeAlerts; ma.style.color = d.activeAlerts > 0 ? 'var(--red)' : 'var(--green)'; }

  // Metric cards
  const m = d.metrics || {};
  _setMetric('mc-internet', m.internet?.count,   'Internet Links',    m.internet?.trend,  m.internet?.ts);
  _setMetric('mc-firewall', m.firewall?.count,   'Firewalls',         m.firewall?.trend,  m.firewall?.ts);
  _setMetric('mc-servers',  m.servers?.count,    'Servers',           m.servers?.trend,   m.servers?.ts);
  _setMetric('mc-wifi',     m.wifi?.count,       'Wi-Fi APs',         m.wifi?.trend,      m.wifi?.ts);
  _setMetric('mc-backup',   m.backup?.val,       'Last Backup',       m.backup?.trend,    m.backup?.ts);

  // Services list
  html('svc-list', (d.services||[]).map(s => {
    const fillClass = s.sc==='ok' ? 'fill-green' : s.sc==='warn' ? 'fill-yellow' : 'fill-red';
    const pctColor  = s.sc==='ok' ? '' : s.sc==='warn' ? 'style="color:var(--yellow)"' : 'style="color:var(--red)"';
    const pct       = s.uptime > 0 ? s.uptime + '%' : 'Down';
    return `<div class="svc-item">
      <div class="svc-icon">${_svcIcon(s.name)}</div>
      <div class="svc-info"><div class="svc-name">${esc(s.name)}</div><div class="svc-meta">${esc(s.meta)}</div></div>
      <div class="svc-uptime">
        <div class="uptime-bar-bg"><div class="uptime-bar-fill ${fillClass}" style="width:${s.uptime}%"></div></div>
        <div class="uptime-pct" ${pctColor}>${pct}</div>
      </div>
    </div>`;
  }).join(''));
}

function _setMetric(id, val, label, trend, ts) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = el.querySelector('.mc-val');
  const t = el.querySelector('.mc-trend');
  if (v) v.textContent = val ?? '—';
  if (t) {
    t.textContent = trend || '';
    t.className   = 'mc-trend ' + (ts==='ok'?'mc-up': ts==='warn'?'mc-warn':'mc-down');
  }
}

function _svcIcon(name) {
  if (/internet|fibernet|airtel|act|jio|isp/i.test(name))       return '🌐';
  if (/backup/i.test(name))                                      return '💾';
  if (/firewall|fortigate|cisco asa|palo/i.test(name))          return '🔥';
  if (/his|emr|pacs|radiology|server|cluster/i.test(name))      return '🗄️';
  if (/wi-fi|wifi|ap|meraki/i.test(name))                       return '📡';
  if (/switch/i.test(name))                                      return '🔀';
  return '🔌';
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
        const ac = a.status==='offline' ? 'var(--red)' : a.status==='warning' ? 'var(--yellow)' : 'var(--green)';
        return `<tr onclick="PULSE.ui.toast('${esc(a.name)} · ${a.ip} · ${esc(a.loc)}')">
          <td><div class="asset-name-wrap">
            <div class="asset-icon">${ASSET_ICONS[a.cat]||'📦'}</div>
            <div><div class="asset-nm">${esc(a.name)}</div><div class="asset-ip">${a.ip}</div></div>
          </div></td>
          <td class="td-dim">${esc(a.cat)}</td>
          <td class="td-dim">${esc(a.loc)}</td>
          <td class="mono">${a.ip}</td>
          <td>${STATUS[a.status]||''}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:${ac};">${a.avail > 0 ? a.avail+'%' : '0%'}</td>
          <td style="font-size:12px;color:${a.status==='offline'?'var(--red)':'var(--t3)'};">${esc(a.seen)}</td>
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
    const since = a.since ? new Date(a.since).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
    const res   = a.resolvedAt ? ` · Resolved ${new Date(a.resolvedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}` : '';
    const tkt   = a.ticketId ? ` · Ticket #${a.ticketId}` : '';
    return `<div class="alert-row ${s.cls}" onclick="PULSE.ui.toast('#${esc(a.ticketId||'')} — ${esc(a.title)}')">
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
  // Service rings
  html('uptime-rings', (d.services||[]).map(s => `
    <div class="uring-card">
      <div class="uring-wrap">
        ${PULSE.ui.ring(s.uptime, s.color)}
        <div class="uring-pct" style="color:${s.color==='green'?'var(--t1)':s.color==='yellow'?'var(--yellow)':'var(--red)'}">${s.uptime}%</div>
      </div>
      <div class="uring-label">${esc(s.name)}</div>
    </div>`).join('')
  );

  // Calendar
  const TIPS = { ok:'100% Uptime', partial:'Partial Outage', down:'Major Outage', future:'Future' };
  html('cal-grid', (d.calendar||[]).map((day, i) =>
    `<div class="cal-day cal-${day}" title="Day ${i+1}: ${TIPS[day]||day}"
          onclick="PULSE.ui.toast('Day ${i+1}: ${TIPS[day]||day}')"></div>`
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
        <div><span class="badge ${RISK_BADGE[r.level]}">${RISK_LABEL[r.level]||r.level}</span></div>
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
        const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—';
        return `<div class="ticket-row" onclick="PULSE.ui.toast('Ticket #${t.id}: ${esc(t.title)}')">
          <div class="ticket-id">#${esc(t.id)}</div>
          <div class="ticket-title">${esc(t.title)}</div>
          <span class="ticket-status ${TICKET_BADGE[t.status]||''}">${t.status.replace('_',' ')}</span>
          <div class="ticket-date">${date}</div>
        </div>`;
      }).join('')
  );

  if (tenant) {
    set('acct-plan',    tenant.plan);
    set('acct-price',   tenant.planPrice);
    set('acct-sla',     tenant.sla);
    set('acct-renewal', tenant.renewalDate
      ? new Date(tenant.renewalDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})
      : '—');
  }
}

// Export
PULSE.render = { dashboard:renderDashboard, assets:renderAssets, alerts:renderAlerts, uptime:renderUptime, recommendations:renderRecommendations, support:renderSupport };
