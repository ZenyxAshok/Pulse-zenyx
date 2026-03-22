/* ═══════════════════════════════════════════════════════════
   PULSE BY ZENYX — Frontend App v3
   Single-file SPA: Router · Auth · API · App · Render · Sound
═══════════════════════════════════════════════════════════ */

'use strict';

// ─── STATE ────────────────────────────────────────────────────────────────────
const State = {
  token:       null,
  user:        null,
  dashData:    null,
  nocData:     null,
  pollTimer:   null,
  nocTimer:    null,
  lastAlertIds: new Set(),
};

// ─── API ──────────────────────────────────────────────────────────────────────
const API = {
  async call(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (State.token) opts.headers['Authorization'] = `Bearer ${State.token}`;
    if (body)        opts.body = JSON.stringify(body);
    const res  = await fetch('/svc' + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get:   (path)       => API.call('GET',   path),
  post:  (path, body) => API.call('POST',  path, body),
  patch: (path, body) => API.call('PATCH', path, body),
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = {
  init() {
    State.token = localStorage.getItem('pulse_token');
    const u = localStorage.getItem('pulse_user');
    if (u) State.user = JSON.parse(u);
  },
  async login() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');
    const btn      = document.getElementById('loginBtn');
    errEl.classList.remove('show');
    btn.textContent = 'Signing in...';
    btn.disabled    = true;
    try {
      const data = await API.post('/auth/login', { email, password });
      State.token = data.token;
      State.user  = data.user;
      localStorage.setItem('pulse_token', data.token);
      localStorage.setItem('pulse_user',  JSON.stringify(data.user));
      Router.go(data.redirect);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add('show');
    } finally {
      btn.textContent = 'Sign In →';
      btn.disabled    = false;
    }
  },
  logout() {
    State.token = null; State.user  = null;
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    clearInterval(State.pollTimer);
    clearInterval(State.nocTimer);
    Router.go('/');
    Toast.show('Signed out successfully', 'info');
  },
  isLoggedIn() { return !!State.token && !!State.user; },
};

// ─── ROUTER ───────────────────────────────────────────────────────────────────
const Router = {
  routes: {
    '/':         'page-landing',
    '/login':    'page-login',
    '/dashboard':'app-client',
    '/alerts':   'app-client',
    '/devices':  'app-client',
    '/tickets':  'app-client',
    '/noc':      'app-noc',
  },
  go(path, replace = false) {
    if (replace) history.replaceState({}, '', path);
    else         history.pushState({}, '', path);
    Router.render(path);
  },
  render(path) {
    // Hide everything
    document.querySelectorAll('.page, .app-shell').forEach(el => {
      el.classList.remove('active');
    });

    // Auth guards
    if (['/dashboard','/alerts','/devices','/tickets'].includes(path)) {
      if (!Auth.isLoggedIn()) { Router.go('/login', true); return; }
      if (['admin','noc'].includes(State.user?.role)) { Router.go('/noc', true); return; }
    }
    if (path.startsWith('/noc')) {
      if (!Auth.isLoggedIn()) { Router.go('/login', true); return; }
      if (State.user?.role === 'client') { Router.go('/dashboard', true); return; }
    }
    if (path === '/login' && Auth.isLoggedIn()) {
      Router.go(State.user?.role === 'client' ? '/dashboard' : '/noc', true); return;
    }

    // Show correct shell/page
    if (path === '/login') {
      document.getElementById('page-login').classList.add('active');
    } else if (path === '/' || path === '') {
      document.getElementById('page-landing').classList.add('active');
    } else if (path.startsWith('/noc')) {
      document.getElementById('app-noc').classList.add('active');
      App.initNoc(path);
    } else {
      document.getElementById('app-client').classList.add('active');
      App.initClient(path);
    }
  },
  init() {
    Auth.init();
    window.addEventListener('popstate', () => Router.render(location.pathname));
    // Enter key on login
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.getElementById('page-login').classList.contains('active')) Auth.login();
    });
    Router.render(location.pathname);
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)        return `${diff}s ago`;
  if (diff < 3600)      return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
function statusColor(s) {
  return s === 'critical' ? 'var(--red)' : s === 'warning' ? 'var(--amber)' : s === 'high' ? '#f97316' : 'var(--green)';
}
function deviceIcon(type) {
  const icons = { firewall:'🛡️', server:'🖥️', switch:'🔀', nas:'💾', wifi:'📶', endpoint:'💻' };
  return icons[type] || '🖥️';
}
function gradeColor(g) {
  return g === 'CRITICAL' ? 'var(--red)' : g === 'AT RISK' ? 'var(--amber)' : g === 'NOTICE' ? '#f97316' : 'var(--green)';
}
function planBadge(p) {
  return `<span class="badge badge-orange">${(p||'basic').toUpperCase()}</span>`;
}
function slaRemaining(createdAt, slaHours) {
  const end  = new Date(createdAt).getTime() + slaHours * 3600000;
  const diff = Math.floor((end - Date.now()) / 60000);
  if (diff < 0) return '<span style="color:var(--red)">SLA BREACHED</span>';
  if (diff < 60) return `<span style="color:var(--amber)">${diff}m remaining</span>`;
  return `<span style="color:var(--text-secondary)">${Math.floor(diff/60)}h ${diff%60}m</span>`;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'info', duration = 3000) {
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const el    = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = {
  open(id)  { document.getElementById(id).classList.add('open'); },
  close(id) { document.getElementById(id).classList.remove('open'); },
};

// ─── SOUND ────────────────────────────────────────────────────────────────────
const Sound = {
  muted: false,
  ctx: null,
  toggle() {
    Sound.muted = !Sound.muted;
    const btn = document.getElementById('soundBtn');
    if (btn) btn.innerHTML = Sound.muted ? '🔇 Sound Off' : '🔔 Sound On';
    btn?.classList.toggle('muted', Sound.muted);
    Toast.show(Sound.muted ? 'Alert sound muted' : 'Alert sound enabled', 'info');
  },
  beep() {
    if (Sound.muted) return;
    try {
      if (!Sound.ctx) Sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = Sound.ctx;
      const osc = ctx.createOscillator();
      const gain= ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0,   ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      setTimeout(() => {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type = 'sine'; o2.frequency.value = 1100;
        g2.gain.setValueAtTime(0, ctx.currentTime);
        g2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
        g2.gain.linearRampToValueAtTime(0,    ctx.currentTime + 0.4);
        o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.4);
      }, 200);
    } catch(e) {}
  },
};

// ─── RENDER ───────────────────────────────────────────────────────────────────
const Render = {
  alertItem(a, clickable = true) {
    const handler = clickable ? `onclick="App.openAlertDetail('${a.id}')"` : '';
    return `
      <div class="alert-item ${a.severity}" ${handler}>
        <span class="alert-sev ${a.severity}">${a.severity}</span>
        <div class="alert-body">
          <div class="alert-title">${a.title}</div>
          <div class="alert-impact">${a.businessImpact}</div>
          <div class="alert-meta">
            <span class="alert-device">${deviceIcon(a.deviceType||'server')} ${a.deviceName}</span>
            <span class="alert-time">${timeAgo(a.time)}</span>
            ${a.ack ? '<span class="alert-ack">✓ ACK</span>' : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.openRaiseTicket('${a.deviceId||''}','${(a.deviceName||'').replace(/'/g,"\\'")}','${a.title.replace(/'/g,"\\'")}')" title="Raise ticket for this alert">🎫</button>
        </div>
      </div>`;
  },

  metricCard(m, key) {
    const icons = { connectivity:'🔌', security:'🛡️', criticalSys:'🖥️', wireless:'📶', recovery:'💾' };
    const navMap = { connectivity:'devices', security:'devices', criticalSys:'devices', wireless:'devices', recovery:'devices' };
    return `
      <div class="metric-card status-${m.status}" onclick="App.clientNav('${navMap[key]||'devices'}')">
        <div class="metric-label">${icons[key]||''} ${m.label}</div>
        <div class="metric-value" style="color:${statusColor(m.status)}">${m.value}</div>
        <div class="metric-status"><span class="status-chip ${m.status}"><span class="status-dot ${m.status}"></span>${m.status}</span></div>
      </div>`;
  },

  deviceRow(d) {
    return `
      <tr onclick="App.openDeviceDetail('${d.id}')">
        <td><div class="device-name">${deviceIcon(d.type)} ${d.name}</div></td>
        <td><span class="device-type-badge">${d.type}</span></td>
        <td><div class="device-ip">${d.ip}</div></td>
        <td><span class="status-chip ${d.status}"><span class="status-dot ${d.status}"></span>${d.status}</span></td>
        <td><div class="font-mono text-sm">${d.uptime ? d.uptime+'%' : '—'}</div></td>
        <td><div class="text-sm text-secondary">${d.lastSeen}</div></td>
        <td><button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();App.openDeviceDetail('${d.id}')">→</button></td>
      </tr>`;
  },

  ticketItem(t, nocMode = false) {
    const actions = nocMode
      ? `<button class="btn btn-sm btn-secondary" onclick="App.openNocTicket('${t.id}')">Manage</button>`
      : '';
    return `
      <div class="ticket-item">
        <div class="ticket-header">
          <span class="ticket-id">${t.id}</span>
          <span class="ticket-title">${t.title}</span>
          <span class="ticket-status ${t.status}">${t.status.replace('_',' ')}</span>
          ${actions}
        </div>
        <div class="ticket-meta">
          ${t.deviceName ? `<span class="ticket-device">${deviceIcon('server')} ${t.deviceName}</span>` : ''}
          <span class="ticket-sev"><span class="status-chip ${t.severity}" style="font-size:10px">${t.severity}</span></span>
          <span class="ticket-time">${timeAgo(t.createdAt)}</span>
          ${t.status !== 'resolved' ? `<span class="ticket-sla">SLA: ${slaRemaining(t.createdAt, t.slaHours)}</span>` : ''}
          ${t.assignedTo ? `<span class="text-sm text-secondary">→ ${t.assignedTo}</span>` : '<span class="text-sm text-muted">Unassigned</span>'}
          ${t.autoRaised ? '<span class="badge badge-orange">AUTO</span>' : ''}
        </div>
      </div>`;
  },

  hospitalCard(h) {
    const grade = h.riskGrade || 'SAFE';
    const cls   = grade === 'CRITICAL' ? 'critical' : grade === 'AT RISK' ? 'at-risk' : 'safe';
    return `
      <div class="hospital-card ${cls}" onclick="App.nocDrillDown('${h.tenantId}')">
        <div class="hospital-card-header">
          <div>
            <div class="hospital-name">🏥 ${h.name}</div>
            <div class="hospital-plan">${h.plan} plan · ${h.dataSource === 'live' ? '<span class="badge badge-live">LIVE</span>' : '<span class="badge badge-mock">MOCK</span>'}</div>
          </div>
          <div style="text-align:right">
            <div class="hospital-score" style="color:${gradeColor(grade)}">${h.riskScore}</div>
            <div class="hospital-grade font-mono text-xs" style="color:${gradeColor(grade)}">${grade}</div>
          </div>
        </div>
        <div class="hospital-stats">
          <div class="hospital-stat">
            <div class="hospital-stat-num" style="color:var(--green)">${h.healthy}</div>
            <div class="hospital-stat-label">Healthy</div>
          </div>
          <div class="hospital-stat">
            <div class="hospital-stat-num" style="color:var(--amber)">${h.warning}</div>
            <div class="hospital-stat-label">Warning</div>
          </div>
          <div class="hospital-stat">
            <div class="hospital-stat-num" style="color:var(--red)">${h.critical}</div>
            <div class="hospital-stat-label">Critical</div>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
          <span>${h.alertCount} active alerts</span>
          <span>${h.openTickets} open tickets</span>
          <span>${h.lastAlert ? timeAgo(h.lastAlert) : 'No alerts'}</span>
        </div>
      </div>`;
  },

  streamItem(a) {
    return `
      <div class="stream-item ${a.severity}" onclick="App.openAlertDetail('${a.id}','${a.tenantId||''}')">
        <span class="stream-hospital">${(a.hospitalName||'').split(' ')[0]}</span>
        <span class="stream-msg">${a.title} — <span style="color:var(--text-muted)">${a.businessImpact}</span></span>
        <span class="stream-time">${timeAgo(a.time)}</span>
      </div>`;
  },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
const App = {
  // ── CLIENT ──────────────────────────────────────────────────────────────────
  initClient(path) {
    // Set user info in sidebar
    const u = State.user;
    if (u) {
      document.getElementById('clientName').textContent    = u.name;
      document.getElementById('clientHospital').textContent= u.hospitalName || '—';
      document.getElementById('clientAvatar').textContent  = u.name?.[0] || 'U';
    }
    // Nav based on path
    const section = path === '/alerts' ? 'alerts' : path === '/devices' ? 'devices' : path === '/tickets' ? 'tickets' : 'dashboard';
    App.clientNav(section, false);
    // Start polling
    App.loadDashboard();
    clearInterval(State.pollTimer);
    State.pollTimer = setInterval(App.loadDashboard, 5000);
  },

  clientNav(section, updateHistory = true) {
    // Update nav active state
    document.querySelectorAll('#app-client .nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.querySelector(`#app-client [data-section="${section}"]`);
    if (navEl) navEl.classList.add('active');
    // Show content section
    document.querySelectorAll('#app-client .content-section').forEach(el => el.classList.remove('active'));
    const secId = section.startsWith('device-') ? 'section-device-detail' : `section-${section}`;
    const secEl = document.getElementById(secId);
    if (secEl) secEl.classList.add('active');
    // Topbar title
    const titles = { dashboard:'Dashboard', alerts:'Alerts', devices:'Devices', tickets:'Support Tickets' };
    document.getElementById('clientTopbarTitle').textContent = titles[section] || 'Dashboard';
    // Update URL
    const paths  = { dashboard:'/dashboard', alerts:'/alerts', devices:'/devices', tickets:'/tickets' };
    if (updateHistory && paths[section]) history.pushState({}, '', paths[section]);
    // Load section data
    if (section === 'alerts')  App.loadAlerts();
    if (section === 'devices') App.loadDevices();
    if (section === 'tickets') App.loadTickets();
  },

  async loadDashboard() {
    try {
      const data = await API.get('/dashboard');
      State.dashData = data;
      App._renderDashboard(data);
      document.getElementById('clientLastUpdated').textContent = `Updated ${timeAgo(data.lastUpdated)}`;
      const badge = document.getElementById('clientDataBadge');
      badge.textContent = data.dataSource === 'live' ? 'LIVE' : 'MOCK';
      badge.className   = `badge badge-${data.dataSource === 'live' ? 'live' : 'mock'}`;
    } catch(e) { console.error('[Dashboard]', e); }
  },

  _renderDashboard(data) {
    // Hospital name
    document.getElementById('dashHospitalName').textContent = data.tenant.name + ' — IT Dashboard';
    document.getElementById('dashSubtitle').textContent     = `${data.summary.total} devices monitored · ${data.summary.uptimePct}% uptime · Plan: ${data.tenant.plan}`;

    // Metrics
    const mr = document.getElementById('metricsRow');
    mr.innerHTML = Object.entries(data.metrics).map(([k,m]) => Render.metricCard(m,k)).join('');

    // Risk ring
    const score  = data.risk.score;
    const circ   = 2 * Math.PI * 50;
    const offset = circ - (score / 100) * circ;
    const ringFg = document.getElementById('riskRingFg');
    ringFg.style.strokeDashoffset = offset;
    ringFg.style.stroke = gradeColor(data.risk.grade);
    document.getElementById('riskScoreNum').textContent  = score;
    document.getElementById('riskScoreNum').style.color  = gradeColor(data.risk.grade);
    document.getElementById('riskGrade').textContent     = data.risk.grade;
    document.getElementById('riskGrade').style.color     = gradeColor(data.risk.grade);
    document.getElementById('riskGradeLabel').textContent= data.risk.label;

    // Alerts list
    const al = document.getElementById('dashAlertsList');
    if (data.alerts.length === 0) {
      al.innerHTML = `<div class="all-clear"><div class="all-clear-icon">🛡️</div><div class="all-clear-text">All Clear — No Active Alerts</div><div class="text-secondary text-sm">All systems operating normally</div></div>`;
    } else {
      al.innerHTML = data.alerts.slice(0,5).map(a => Render.alertItem(a)).join('');
    }

    // Alert badge
    const unacked = data.alerts.filter(a => !a.ack).length;
    const badge   = document.getElementById('clientAlertBadge');
    if (unacked > 0) { badge.textContent = unacked; badge.style.display = 'block'; }
    else              { badge.style.display = 'none'; }

    // Device table (dashboard)
    const tbody = document.querySelector('#dashDeviceTable tbody');
    if (tbody) tbody.innerHTML = data.assets.slice(0,6).map(d => `
      <tr onclick="App.openDeviceDetail('${d.id}')">
        <td><div class="device-name">${deviceIcon(d.type)} ${d.name}</div></td>
        <td><span class="device-type-badge">${d.type}</span></td>
        <td><span class="status-chip ${d.status}"><span class="status-dot ${d.status}"></span>${d.status}</span></td>
        <td><div class="text-sm text-secondary">${d.lastSeen}</div></td>
      </tr>`).join('');
  },

  async loadAlerts() {
    try {
      const sev = document.getElementById('alertFilter')?.value || '';
      const ack = document.getElementById('alertAckFilter')?.value || '';
      const params = new URLSearchParams();
      if (sev) params.set('severity', sev);
      if (ack) params.set('ack', ack);
      const data = await API.get('/alerts' + (params.toString() ? '?' + params : ''));
      const list = document.getElementById('alertsPageList');
      if (data.alerts.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">✅</div><div>No alerts match your filter</div></div>`;
      } else {
        list.innerHTML = data.alerts.map(a => Render.alertItem(a)).join('');
      }
    } catch(e) { console.error('[Alerts]', e); }
  },
  filterAlerts() { App.loadAlerts(); },

  async loadDevices() {
    try {
      const data  = await API.get('/devices');
      const tbody = document.querySelector('#devicesTable tbody');
      if (tbody) tbody.innerHTML = data.assets.map(d => Render.deviceRow(d)).join('');
    } catch(e) { console.error('[Devices]', e); }
  },

  async loadTickets() {
    try {
      const data  = await API.get('/tickets');
      const stats = document.getElementById('ticketStats');
      stats.innerHTML = `
        <div class="card" style="text-align:center">
          <div class="metric-value text-blue">${data.counts.open}</div>
          <div class="metric-label">Open</div>
        </div>
        <div class="card" style="text-align:center">
          <div class="metric-value text-amber">${data.counts.in_progress}</div>
          <div class="metric-label">In Progress</div>
        </div>
        <div class="card" style="text-align:center">
          <div class="metric-value text-green">${data.counts.resolved}</div>
          <div class="metric-label">Resolved</div>
        </div>`;
      const list = document.getElementById('ticketsList');
      if (data.tickets.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎫</div><div>No tickets yet — raise your first issue above</div></div>`;
      } else {
        list.innerHTML = data.tickets.map(t => Render.ticketItem(t, false)).join('');
      }
      // Badge
      const b = document.getElementById('clientTicketBadge');
      const open = data.counts.open + data.counts.in_progress;
      if (open > 0) { b.textContent = open; b.style.display = 'block'; }
      else            { b.style.display = 'none'; }
    } catch(e) { console.error('[Tickets]', e); }
  },

  async openDeviceDetail(deviceId) {
    App.clientNav('device-detail', false);
    document.getElementById('deviceDetailTitle').textContent = 'Loading...';
    try {
      const data = await API.get(`/devices/${deviceId}`);
      const d    = data.device;
      document.getElementById('deviceDetailTitle').textContent = d.name;
      document.getElementById('deviceDetailContent').innerHTML = `
        <div class="two-col">
          <div class="card">
            <div class="device-detail-header">
              <div class="device-detail-icon">${deviceIcon(d.type)}</div>
              <div>
                <div class="device-detail-name">${d.name}</div>
                <div class="device-detail-sub">${d.type.toUpperCase()} · ${d.ip}</div>
              </div>
              <div style="margin-left:auto"><span class="status-chip ${d.status}"><span class="status-dot ${d.status}"></span>${d.status}</span></div>
            </div>
            <div class="detail-row"><span class="detail-label">Device Type</span><span class="detail-value">${d.type}</span></div>
            <div class="detail-row"><span class="detail-label">IP Address</span><span class="detail-value font-mono">${d.ip}</span></div>
            <div class="detail-row"><span class="detail-label">Last Seen</span><span class="detail-value">${d.lastSeen}</span></div>
            <div class="detail-row"><span class="detail-label">Uptime</span><span class="detail-value">${d.uptime ? d.uptime+'%' : '—'}</span></div>
            ${d.uptime ? `<div class="uptime-bar"><div class="uptime-bar-fill" style="width:${d.uptime}%"></div></div>` : ''}
            <hr class="divider">
            <button class="btn btn-primary" style="width:100%" onclick="App.openRaiseTicket('${d.id}','${d.name.replace(/'/g,"\\'")}')">🎫 Raise Ticket for This Device</button>
          </div>
          <div class="card">
            <div class="card-title">24-Hour Status History</div>
            <div class="history-grid">
              ${(d.history||[]).map(h => `<div class="history-cell ${h.status}" title="${h.hour} — ${h.status} (CPU:${h.cpu}%)"></div>`).join('')}
            </div>
            <div style="display:flex;gap:12px;margin-top:8px;font-size:11px;color:var(--text-muted)">
              <span>24h ago</span><span style="margin-left:auto">Now</span>
            </div>
            <hr class="divider">
            <div class="card-title">Performance (Last Reading)</div>
            ${d.history && d.history[0] ? `
              <div class="detail-row"><span class="detail-label">CPU Usage</span><span class="detail-value">${d.history[0].cpu}%</span></div>
              <div class="detail-row"><span class="detail-label">Response Time</span><span class="detail-value">${d.history[0].responseMs}ms</span></div>
            ` : '<div class="text-secondary text-sm">No performance data available</div>'}
          </div>
        </div>`;
    } catch(e) {
      document.getElementById('deviceDetailContent').innerHTML = `<div class="empty-state"><div>Failed to load device details</div></div>`;
    }
  },

  openAlertDetail(alertId, tenantId) {
    const alerts = State.dashData?.alerts || [];
    const alert  = alerts.find(a => a.id == alertId);
    if (!alert) { Toast.show('Alert detail not available', 'warning'); return; }
    document.getElementById('alertModalContent').innerHTML = `
      <div class="detail-row"><span class="detail-label">Severity</span><span class="alert-sev ${alert.severity}">${alert.severity}</span></div>
      <div class="detail-row"><span class="detail-label">Alert</span><span class="detail-value font-bold">${alert.title}</span></div>
      <div class="impact-box">
        <div class="impact-box-label">Business Impact</div>
        ${alert.businessImpact}
      </div>
      <div class="detail-row"><span class="detail-label">Device</span><span class="detail-value">${deviceIcon('server')} ${alert.deviceName}</span></div>
      <div class="detail-row"><span class="detail-label">Triggered</span><span class="detail-value">${timeAgo(alert.time)}</span></div>
      <div class="detail-row"><span class="detail-label">Acknowledged</span><span class="detail-value">${alert.ack ? '<span class="text-green">Yes</span>' : '<span class="text-amber">No</span>'}</span></div>
      <hr class="divider">
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="Modal.close('alertModal')">Close</button>
        <button class="btn btn-primary" onclick="Modal.close('alertModal');App.openRaiseTicket('${alert.deviceId||''}','${(alert.deviceName||'').replace(/'/g,"\\'")}','${alert.title.replace(/'/g,"\\'")}')" >🎫 Raise Ticket</button>
      </div>`;
    Modal.open('alertModal');
  },

  openRaiseTicket(deviceId = '', deviceName = '', prefillTitle = '') {
    document.getElementById('ticketTitle').value       = prefillTitle;
    document.getElementById('ticketDeviceId').value    = deviceId;
    document.getElementById('ticketDeviceName').value  = deviceName;
    const ctx = document.getElementById('ticketDeviceContext');
    if (deviceName) {
      document.getElementById('ticketDeviceDisplay').textContent = deviceName;
      ctx.style.display = 'block';
    } else {
      ctx.style.display = 'none';
    }
    Modal.open('raiseTicketModal');
  },

  async submitTicket() {
    const title       = document.getElementById('ticketTitle').value.trim();
    const severity    = document.getElementById('ticketSeverity').value;
    const description = document.getElementById('ticketDescription').value.trim();
    const deviceId    = document.getElementById('ticketDeviceId').value;
    const deviceName  = document.getElementById('ticketDeviceName').value;
    if (!title) { Toast.show('Please enter a title', 'warning'); return; }
    try {
      await API.post('/tickets', { title, severity, description, deviceId, deviceName });
      Modal.close('raiseTicketModal');
      Toast.show('Ticket raised — ZENYX NOC has been notified', 'success');
      document.getElementById('ticketTitle').value       = '';
      document.getElementById('ticketDescription').value = '';
      App.loadTickets();
    } catch(e) {
      Toast.show('Failed to raise ticket: ' + e.message, 'error');
    }
  },

  // ── NOC ─────────────────────────────────────────────────────────────────────
  initNoc(path) {
    const u = State.user;
    if (u) {
      document.getElementById('nocName').textContent   = u.name;
      document.getElementById('nocAvatar').textContent = u.name?.[0] || 'Z';
    }
    App.nocNav('noc-overview', false);
    App.loadNocOverview();
    clearInterval(State.nocTimer);
    State.nocTimer = setInterval(App.loadNocOverview, 8000);
  },

  nocNav(section, updateNav = true) {
    document.querySelectorAll('#app-noc .nav-item').forEach(el => el.classList.remove('active'));
    if (updateNav) {
      const navEl = document.querySelector(`#app-noc [data-section="${section}"]`);
      if (navEl) navEl.classList.add('active');
    }
    document.querySelectorAll('#app-noc .content-section').forEach(el => el.classList.remove('active'));
    const secId = section.startsWith('noc-hospital') ? 'section-noc-hospital' : `section-${section}`;
    const secEl = document.getElementById(secId);
    if (secEl) secEl.classList.add('active');
    const titles = { 'noc-overview':'All Hospitals', 'noc-alerts':'Alert Stream', 'noc-tickets':'All Tickets' };
    document.getElementById('nocTopbarTitle').textContent = titles[section] || 'Hospital Detail';
    if (section === 'noc-tickets') App.loadNocTickets();
    if (section === 'noc-alerts')  App.renderNocAlertStream();
  },

  async loadNocOverview() {
    try {
      const data   = State.nocData = await API.get('/noc/overview');
      const now    = new Date().toLocaleString('en-IN', { hour12:true });
      document.getElementById('nocTimestamp').textContent  = now;
      document.getElementById('nocLastUpdated').textContent= `Updated just now`;

      // Summary row
      const s = data.summary;
      document.getElementById('nocSummaryRow').innerHTML = `
        <div class="noc-stat"><div class="noc-stat-icon">🏥</div><div><div class="noc-stat-num">${s.total}</div><div class="noc-stat-label">Hospitals Monitored</div></div></div>
        <div class="noc-stat" style="border-color:${s.critical>0?'rgba(239,68,68,.3)':''}"><div class="noc-stat-icon">🔴</div><div><div class="noc-stat-num" style="color:${s.critical>0?'var(--red)':'inherit'}">${s.critical}</div><div class="noc-stat-label">Critical</div></div></div>
        <div class="noc-stat"><div class="noc-stat-icon">✅</div><div><div class="noc-stat-num" style="color:var(--green)">${s.healthy}</div><div class="noc-stat-label">All Clear</div></div></div>
        <div class="noc-stat"><div class="noc-stat-icon">🎫</div><div><div class="noc-stat-num">${s.openTickets}</div><div class="noc-stat-label">Open Tickets</div></div></div>`;

      // Hospital grid
      document.getElementById('hospitalGrid').innerHTML = data.hospitals.map(h => Render.hospitalCard(h)).join('');

      // Alert stream on overview
      document.getElementById('nocAlertStream').innerHTML = data.allAlerts.slice(0,15).map(a => Render.streamItem(a)).join('') ||
        '<div class="empty-state" style="padding:20px"><div>No recent alerts across all hospitals</div></div>';

      // Alert badge
      const criticalCount = data.allAlerts.filter(a => a.severity === 'critical').length;
      const ab = document.getElementById('nocAlertBadge');
      if (criticalCount > 0) { ab.textContent = criticalCount; ab.style.display = 'block'; }
      else                    { ab.style.display = 'none'; }

      // Sound — trigger on new critical alerts
      const newIds = new Set(data.allAlerts.filter(a=>a.severity==='critical').map(a=>a.id));
      const hasNew = [...newIds].some(id => !State.lastAlertIds.has(id));
      if (hasNew && State.lastAlertIds.size > 0) Sound.beep();
      State.lastAlertIds = newIds;

    } catch(e) { console.error('[NOC]', e); }
  },

  renderNocAlertStream() {
    if (!State.nocData) return;
    let alerts = State.nocData.allAlerts;
    const sev  = document.getElementById('nocAlertFilterSev')?.value;
    if (sev === 'critical') alerts = alerts.filter(a => a.severity === 'critical');
    if (sev === 'warning')  alerts = alerts.filter(a => ['critical','warning','high'].includes(a.severity));
    document.getElementById('nocFullAlertStream').innerHTML = alerts.map(a => Render.streamItem(a)).join('') ||
      '<div class="empty-state"><div>No alerts match filter</div></div>';
  },
  filterNocAlerts() { App.renderNocAlertStream(); },

  async nocDrillDown(tenantId) {
    App.nocNav('noc-hospital', false);
    document.getElementById('nocHospitalTitle').textContent = 'Loading...';
    try {
      const data = await API.get(`/noc/hospital/${tenantId}`);
      document.getElementById('nocHospitalTitle').textContent = data.tenant.name;
      document.getElementById('nocHospitalContent').innerHTML = `
        <div style="margin-bottom:16px;display:flex;gap:10px;align-items:center">
          <span class="status-chip" style="background:${gradeColor(data.risk.grade)}22;color:${gradeColor(data.risk.grade)}">${data.risk.grade}</span>
          <span class="font-mono text-sm text-secondary">Risk Score: ${data.risk.score}/100</span>
          ${planBadge(data.tenant.plan)}
          <span class="badge badge-${data.dataSource==='live'?'live':'mock'}">${data.dataSource.toUpperCase()}</span>
        </div>
        <div class="metrics-row" style="grid-template-columns:repeat(5,1fr)">
          ${Object.entries(data.metrics).map(([k,m]) => Render.metricCard(m,k)).join('')}
        </div>
        <div class="two-col" style="margin-top:16px">
          <div class="card">
            <div class="card-title">Devices (${data.assets.length})</div>
            <table class="device-table"><thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Last Seen</th></tr></thead>
            <tbody>${data.assets.map(d=>`<tr><td><div class="device-name">${deviceIcon(d.type)} ${d.name}</div></td><td><span class="device-type-badge">${d.type}</span></td><td><span class="status-chip ${d.status}"><span class="status-dot ${d.status}"></span>${d.status}</span></td><td class="text-sm text-secondary">${d.lastSeen}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <div class="card">
            <div class="card-title">Active Alerts (${data.alerts.length})</div>
            ${data.alerts.length === 0 ? '<div class="all-clear"><div class="all-clear-icon">🛡️</div><div class="all-clear-text">All Clear</div></div>'
              : data.alerts.map(a => Render.alertItem(a, false)).join('')}
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-title">Tickets (${(data.tickets||[]).length})</div>
          ${(data.tickets||[]).length === 0
            ? '<div class="empty-state"><div>No tickets for this hospital</div></div>'
            : (data.tickets||[]).map(t => Render.ticketItem(t, true)).join('')}
        </div>`;
    } catch(e) {
      document.getElementById('nocHospitalContent').innerHTML = `<div class="empty-state"><div>Failed to load hospital data</div></div>`;
    }
  },

  async loadNocTickets() {
    try {
      const data = await API.get('/noc/tickets');
      document.getElementById('nocTicketsList').innerHTML = data.tickets.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">🎫</div><div>No tickets yet</div></div>'
        : data.tickets.map(t => Render.ticketItem(t, true)).join('');
    } catch(e) { console.error('[NOC Tickets]', e); }
  },

  openNocTicket(ticketId) {
    document.getElementById('nocTicketModalContent').innerHTML = `
      <div class="detail-row"><span class="detail-label">Ticket</span><span class="detail-value font-mono text-orange">${ticketId}</span></div>
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Update Status</label>
        <select class="form-input" id="nocTicketStatus">
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Assign To</label>
        <input class="form-input" id="nocTicketAssign" placeholder="Engineer name">
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="Modal.close('nocTicketModal')">Cancel</button>
        <button class="btn btn-primary" onclick="App.updateNocTicket('${ticketId}')">Update Ticket</button>
      </div>`;
    Modal.open('nocTicketModal');
  },

  async updateNocTicket(ticketId) {
    const status     = document.getElementById('nocTicketStatus').value;
    const assignedTo = document.getElementById('nocTicketAssign').value.trim();
    try {
      await API.patch(`/noc/tickets/${ticketId}`, { status, assignedTo: assignedTo || undefined });
      Modal.close('nocTicketModal');
      Toast.show('Ticket updated', 'success');
      App.loadNocTickets();
    } catch(e) {
      Toast.show('Failed to update ticket', 'error');
    }
  },
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});
