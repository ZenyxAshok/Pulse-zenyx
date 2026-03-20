// frontend/public/js/app.js
'use strict';

PULSE.app = (() => {
  // ── State ──
  const S = {
    user:        null,
    currentPage: null,
    cache:       {},
  };

  // ── Page metadata ──
  const META = {
    dashboard:       { title:'IT Health Dashboard',    sub:'Real-time monitoring' },
    assets:          { title:'Monitored Assets',        sub:'All departments' },
    alerts:          { title:'Alerts & Incidents',      sub:'Active and resolved' },
    uptime:          { title:'Uptime & Reports',         sub:'30-day availability' },
    recommendations: { title:'Recommendations',         sub:'ZENYX reviewed items' },
    support:         { title:'Support',                  sub:'ZENYX NOC · 24×7' },
  };

  // ── Page data loaders (API → render) ──
  const LOADERS = {
    dashboard: async () => {
      const d = await PULSE.api.dashboard();
      S.cache.dashboard = d;
      PULSE.render.dashboard(d);
      _updateSidebarHealth(d.healthScore);
      // Update alert badge
      const b = document.getElementById('alerts-badge');
      if (b && d.activeAlerts > 0) { b.textContent = d.activeAlerts; b.style.display='inline'; }
    },
    assets: async () => {
      const d = await PULSE.api.assets();
      S.cache.assets = d;
      PULSE.render.assets(d);
    },
    alerts: async () => {
      const d = await PULSE.api.alerts();
      S.cache.alerts = d;
      PULSE.render.alerts(d);
    },
    uptime: async () => {
      const d = await PULSE.api.uptime();
      S.cache.uptime = d;
      PULSE.render.uptime(d);
    },
    recommendations: async () => {
      const d = await PULSE.api.recommendations();
      S.cache.recs = d;
      PULSE.render.recommendations(d);
    },
    support: async () => {
      const [tickets, tenant] = await Promise.all([PULSE.api.tickets.get(), PULSE.api.tenant()]);
      S.cache.tickets = tickets;
      S.cache.tenant  = tenant;
      PULSE.render.support(tickets, tenant);
    },
  };

  // ── Init ──
  async function init() {
    if (!PULSE.token.exists()) { _showLogin(); return; }
    try {
      S.user = await PULSE.api.auth.me();
      _showApp();
      await navigate('dashboard');
    } catch {
      PULSE.token.clear();
      _showLogin();
    }
  }

  // ── Navigation ──
  async function navigate(pageId) {
    const allowed = PULSE.PERMISSIONS[S.user?.role] || [];
    if (!allowed.includes(pageId)) { PULSE.ui.toast('Access denied for this page.', 'error'); return; }

    S.currentPage = pageId;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[data-page="${pageId}"]`)?.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) { pageEl.classList.add('active'); pageEl.style.opacity='0'; setTimeout(()=>{ pageEl.style.transition='opacity .2s'; pageEl.style.opacity='1'; },10); }

    const m = META[pageId] || {};
    PULSE.ui.set('tb-title', m.title || pageId);
    PULSE.ui.set('tb-sub',   (S.user?.tenant?.name || 'ZENYX') + ' · ' + (m.sub || ''));

    PULSE.ui.showLoader(pageId);
    try   { await LOADERS[pageId]?.(); }
    catch (e) { PULSE.ui.showError(pageId, e.message); }
    finally   { PULSE.ui.hideLoader(pageId); }
  }

  // Reload current page
  function reload() { if (S.currentPage) navigate(S.currentPage); }

  // ── Login ──
  async function handleLogin() {
    const email = document.getElementById('lf-email')?.value?.trim();
    const pass  = document.getElementById('lf-password')?.value;
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('login-btn');

    errEl.style.display = 'none';
    if (!email || !pass) { errEl.textContent='Email and password required.'; errEl.style.display='block'; return; }

    btn.disabled = true; btn.textContent = 'Signing in…';

    try {
      S.user = await PULSE.api.auth.login(email, pass);
      _showApp();
      await navigate('dashboard');
    } catch (e) {
      errEl.textContent = e.message || 'Login failed.';
      errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Access Portal →';
    }
  }

  function handleLogout() { PULSE.api.auth.logout(); }

  // ── Submit support ticket ──
  async function submitTicket() {
    const title = document.getElementById('ticket-title')?.value?.trim();
    const desc  = document.getElementById('ticket-desc')?.value?.trim();
    const pri   = document.getElementById('ticket-priority')?.value || 'medium';
    if (!title) { PULSE.ui.toast('Ticket title is required.', 'warn'); return; }
    try {
      const t = await PULSE.api.tickets.create({ title, description:desc, priority:pri });
      PULSE.ui.toast(`✅ Ticket #${t.id} created`, 'success');
      document.getElementById('new-ticket-form').style.display='none';
      document.getElementById('ticket-title').value='';
      document.getElementById('ticket-desc').value='';
      await LOADERS.support();
    } catch (e) { PULSE.ui.toast(e.message,'error'); }
  }

  // ── Asset filter ──
  async function filterAssets(cat) {
    PULSE.ui.showLoader('assets');
    try {
      const d = await PULSE.api.assets(cat || undefined);
      S.cache.assets = d;
      PULSE.render.assets(d);
    } catch (e) { PULSE.ui.toast(e.message,'error'); }
    finally { PULSE.ui.hideLoader('assets'); }
  }

  // ── Show/hide screens ──
  function _showLogin() {
    document.getElementById('login').style.display = 'grid';
    document.getElementById('app').style.display   = 'none';
  }

  function _showApp() {
    document.getElementById('login').style.opacity = '0';
    document.getElementById('login').style.transition = 'opacity .4s';
    setTimeout(() => {
      document.getElementById('login').style.display = 'none';
      const app = document.getElementById('app');
      app.style.display = 'flex'; app.style.flexDirection = 'row';
      app.style.opacity = '0'; app.style.transition = 'opacity .35s';
      setTimeout(() => app.style.opacity = '1', 30);
    }, 400);

    _populateSidebar();
    _applyRoleVisibility();
    _startClock();
  }

  function _populateSidebar() {
    const u = S.user;
    PULSE.ui.set('sb-user-name', u?.name);
    PULSE.ui.set('sb-user-role', _fmtRole(u?.role));
    const av = document.getElementById('sb-user-avatar');
    if (av) av.textContent = u?.initials || '?';
    PULSE.ui.set('sb-hosp-name', u?.tenant?.name || 'ZENYX');
  }

  function _applyRoleVisibility() {
    const role    = S.user?.role;
    const allowed = PULSE.PERMISSIONS[role] || [];
    document.querySelectorAll('.nav-link[data-page]').forEach(l => {
      l.style.display = allowed.includes(l.dataset.page) ? '' : 'none';
    });
    const adminSec = document.getElementById('admin-section');
    if (adminSec) adminSec.style.display = PULSE.ZENYX_ROLES.includes(role) ? 'block' : 'none';
  }

  function _updateSidebarHealth(score) {
    const dot = document.getElementById('sb-status-dot');
    const txt = document.getElementById('sb-status-text');
    if (!dot || !txt) return;
    if (score >= 90)     { dot.className='pulse-dot';        txt.textContent='All Systems Healthy'; txt.style.color='var(--green)';  }
    else if (score >= 75){ dot.className='pulse-dot warn';   txt.textContent='Minor Issues Detected';txt.style.color='var(--yellow)';}
    else                 { dot.className='pulse-dot danger';  txt.textContent='Attention Required';  txt.style.color='var(--red)';   }
  }

  function _fmtRole(r) {
    return {super_admin:'ZENYX Super Admin',zenyx_admin:'ZENYX NOC',hospital_admin:'Hospital IT Admin',hospital_viewer:'Hospital Viewer'}[r] || r;
  }

  function _startClock() {
    function tick() {
      const now = new Date();
      PULSE.ui.set('tb-clock',
        now.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) + ' · ' +
        now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
      );
    }
    tick(); setInterval(tick, 1000);
  }

  return { init, navigate, reload, handleLogin, handleLogout, submitTicket, filterAssets };
})();

// ── Expose globals for HTML onclick ──
function handleLogin()   { PULSE.app.handleLogin(); }
function handleLogout()  { PULSE.app.handleLogout(); }
function navTo(page)     { PULSE.app.navigate(page); }
function submitTicket()  { PULSE.app.submitTicket(); }
function filterAssets(c) { PULSE.app.filterAssets(c); }

document.addEventListener('DOMContentLoaded', () => PULSE.app.init());
