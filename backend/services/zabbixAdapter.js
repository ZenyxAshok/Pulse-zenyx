'use strict';
const https = require('https');
const http = require('http');

const ZABBIX_URL  = process.env.ZABBIX_URL  || '';
const ZABBIX_USER = process.env.ZABBIX_USER || '';
const ZABBIX_PASS = process.env.ZABBIX_PASS || '';

let _authToken = null;
let _authExpiry = 0;

async function zabbixCall(method, params, retried = false) {
  if (!ZABBIX_URL) throw new Error('ZABBIX_URL not configured');

  if (method !== 'user.login' && (!_authToken || Date.now() > _authExpiry)) {
    await _login();
  }

  const body = JSON.stringify({ jsonrpc: '2.0', method, params, auth: _authToken, id: 1 });
  const url = new URL(ZABBIX_URL.includes('://') ? ZABBIX_URL : `http://${ZABBIX_URL}`);
  url.pathname = url.pathname.endsWith('/') ? `${url.pathname}api_jsonrpc.php` : `${url.pathname}/api_jsonrpc.php`;

  const data = await _httpPost(url, body);

  if (data.error) {
    // Session expired — re-auth once
    if (data.error.code === -32602 && !retried) {
      _authToken = null;
      return zabbixCall(method, params, true);
    }
    throw new Error(`Zabbix error: ${data.error.data || data.error.message}`);
  }
  return data.result;
}

async function _login() {
  const result = await zabbixCall('user.login', { username: ZABBIX_USER, password: ZABBIX_PASS }, true);
  _authToken = result;
  _authExpiry = Date.now() + 3600 * 1000; // 1h
  return result;
}

function _httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      rejectUnauthorized: false,
    };
    const req = lib.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Zabbix timeout')); });
    req.write(body);
    req.end();
  });
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

async function getHostsByGroup(groupIds) {
  return zabbixCall('host.get', {
    groupids: Array.isArray(groupIds) ? groupIds : [groupIds],
    output: ['hostid','host','name','status','available'],
    selectInterfaces: ['ip'],
    selectGroups: ['name'],
    monitored_hosts: true,
  });
}

async function getProblemsByHosts(hostIds) {
  return zabbixCall('problem.get', {
    hostids: hostIds,
    output: 'extend',
    severities: [2,3,4,5],
    recent: true,
    selectAcknowledges: ['clock','message','username'],
    sortfield: ['severity','eventid'],
    sortorder: 'DESC',
  });
}

async function getItemsByHost(hostId, keys = []) {
  const params = {
    hostids: [hostId],
    output: ['itemid','name','key_','lastvalue','lastclock','units'],
  };
  if (keys.length) params.search = { key_: keys[0] };
  return zabbixCall('item.get', params);
}

async function getTriggersByHosts(hostIds) {
  return zabbixCall('trigger.get', {
    hostids: hostIds,
    output: ['triggerid','description','priority','value','lastchange'],
    selectHosts: ['hostid','name'],
    filter: { value: 1 }, // only firing
    sortfield: 'priority',
    sortorder: 'DESC',
  });
}

module.exports = { getHostsByGroup, getProblemsByHosts, getItemsByHost, getTriggersByHosts, isConfigured: () => !!ZABBIX_URL };
