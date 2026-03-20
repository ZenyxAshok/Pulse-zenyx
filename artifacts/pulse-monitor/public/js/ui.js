// frontend/public/js/ui.js
'use strict';

PULSE.ui = (() => {
  let _toastTimer;

  // ── Toast ──
  function toast(msg, type = '') {
    const el  = document.getElementById('toast');
    const ico = document.getElementById('toast-icon');
    const txt = document.getElementById('toast-msg');
    const icons = { error:'❌', warn:'⚠️', success:'✅', default:'ℹ️' };
    if (ico) ico.textContent = icons[type] || icons.default;
    if (txt) txt.textContent = msg;
    el?.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el?.classList.remove('show'), 3500);
  }

  // ── Page loader ──
  function showLoader(pageId) {
    const el = document.getElementById('page-' + pageId);
    if (!el || el.querySelector('.pg-loader')) return;
    const d = document.createElement('div');
    d.className = 'pg-loader';
    d.innerHTML = '<div class="pg-spinner"></div>';
    el.prepend(d);
  }

  function hideLoader(pageId) {
    document.getElementById('page-' + pageId)?.querySelector('.pg-loader')?.remove();
  }

  // ── Error banner inside page ──
  function showError(pageId, msg) {
    const el = document.getElementById('page-' + pageId);
    if (!el) return;
    const d = document.createElement('div');
    d.className = 'pg-error';
    d.innerHTML = `<span>⚠️</span> ${esc(msg)} — <span class="retry-link" onclick="PULSE.app.reload()">Retry</span>`;
    el.prepend(d);
  }

  // ── Escape HTML ──
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ── setText helper ──
  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
  }

  // ── Set inner HTML safely (only for our own render output) ──
  function html(id, markup) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = markup;
  }

  // ── Filter chip toggle ──
  function activateChip(el, group) {
    document.querySelectorAll(`.fchip[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  // ── SVG uptime ring ──
  function ring(pct, color, size = 70, strokeW = 6) {
    const r  = (size / 2) - strokeW;
    const c  = 2 * Math.PI * r;
    const off = c - (pct / 100) * c;
    const col = color === 'green'  ? 'var(--green)'  :
                color === 'yellow' ? 'var(--yellow)' : 'var(--red)';
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle fill="none" stroke="var(--surface-3)" stroke-width="${strokeW}" cx="${size/2}" cy="${size/2}" r="${r}"/>
      <circle fill="none" stroke="${col}" stroke-width="${strokeW}" stroke-linecap="round"
              cx="${size/2}" cy="${size/2}" r="${r}"
              stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
              transform="rotate(-90 ${size/2} ${size/2})"/>
    </svg>`;
  }

  return { toast, showLoader, hideLoader, showError, esc, set, html, activateChip, ring };
})();
