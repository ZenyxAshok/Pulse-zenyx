'use strict';
const zabbix = require('./zabbixAdapter');
const { transformHosts, transformProblems, buildDashboard } = require('./transformer');
const { TENANTS, MOCK_ASSETS, MOCK_ALERTS } = require('../config/data');

async function getDashboardData(tenantId) {
  const tenant = TENANTS[tenantId];
  if (!tenant) throw new Error(`Unknown tenant: ${tenantId}`);

  if (tenant.live && zabbix.isConfigured()) {
    try {
      const rawHosts    = await zabbix.getHostsByGroup(tenant.zabbixGroupId);
      const hostIds     = rawHosts.map(h => h.hostid);
      const rawProblems = hostIds.length ? await zabbix.getProblemsByHosts(hostIds) : [];
      const assets      = transformHosts(rawHosts);
      const alerts      = transformProblems(rawProblems, rawHosts);
      return buildDashboard(tenant, assets, alerts);
    } catch (err) {
      console.error(`[Zabbix] Live fetch failed for ${tenantId}:`, err.message, '— falling back to mock');
    }
  }

  // Mock fallback
  const assets = MOCK_ASSETS[tenantId] || [];
  const alerts = MOCK_ALERTS[tenantId] || [];
  return buildDashboard(tenant, assets, alerts);
}

async function getAssets(tenantId) {
  const data = await getDashboardData(tenantId);
  return data.assets;
}

async function getAlerts(tenantId, filters = {}) {
  const data = await getDashboardData(tenantId);
  let alerts = data.alerts;
  if (filters.severity) alerts = alerts.filter(a => a.severity === filters.severity);
  if (filters.ack === 'true')  alerts = alerts.filter(a => a.ack);
  if (filters.ack === 'false') alerts = alerts.filter(a => !a.ack);
  return alerts;
}

module.exports = { getDashboardData, getAssets, getAlerts };
