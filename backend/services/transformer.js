'use strict';

// Maps Zabbix trigger keys / names → business impact messages
const RISK_MAP = [
  { match: /firewall.*down|firewall.*unavail/i,  impact: 'Network security protection is offline — hospital exposed to threats', category: 'security' },
  { match: /backup.*fail|backup.*error/i,        impact: 'Data backup has failed — patient records at risk of permanent loss', category: 'backup' },
  { match: /disk.*full|storage.*full|no.*space/i,impact: 'Storage critically full — systems may stop saving data soon', category: 'storage' },
  { match: /cpu.*high|processor.*high/i,         impact: 'Hospital systems are overloaded — slowdowns expected across departments', category: 'performance' },
  { match: /memory.*high|ram.*high/i,            impact: 'Server memory critical — application crashes possible', category: 'performance' },
  { match: /server.*down|host.*unreach/i,        impact: 'A critical system is offline — hospital operations may be affected', category: 'availability' },
  { match: /switch.*down|network.*down/i,        impact: 'Network connectivity failure — departments may be unable to communicate', category: 'network' },
  { match: /internet.*down|wan.*down/i,          impact: 'Internet connection lost — cloud services and remote access unavailable', category: 'connectivity' },
  { match: /vpn.*down/i,                         impact: 'VPN tunnel offline — remote staff and branch connectivity lost', category: 'security' },
  { match: /wifi.*down|ap.*down/i,               impact: 'Wi-Fi coverage lost in affected area — wireless devices offline', category: 'network' },
  { match: /nas.*down|nas.*unreach/i,            impact: 'Backup storage unreachable — data protection compromised', category: 'backup' },
];

const SEVERITY_MAP = { 0: 'info', 1: 'info', 2: 'info', 3: 'warning', 4: 'high', 5: 'critical' };
const SEVERITY_ZABBIX = { 0: 'Not classified', 1: 'Information', 2: 'Warning', 3: 'Average', 4: 'High', 5: 'Disaster' };
const TYPE_MAP = {
  firewall: 'firewall', fw: 'firewall', fortigate: 'firewall', sophos: 'firewall', sonicwall: 'firewall',
  switch: 'switch', cisco: 'switch', hp: 'switch',
  server: 'server', poweredge: 'server', hpe: 'server', proliant: 'server',
  nas: 'nas', synology: 'nas', qnap: 'nas',
  ap: 'wifi', wifi: 'wifi', unifi: 'wifi', ubiquiti: 'wifi',
  endpoint: 'endpoint', workstation: 'endpoint', desktop: 'endpoint',
};

function inferDeviceType(name = '') {
  const lower = name.toLowerCase();
  for (const [key, type] of Object.entries(TYPE_MAP)) {
    if (lower.includes(key)) return type;
  }
  return 'server';
}

function getBusinessImpact(description = '') {
  for (const rule of RISK_MAP) {
    if (rule.match.test(description)) return { impact: rule.impact, category: rule.category };
  }
  return { impact: 'System issue detected — ZENYX NOC is investigating', category: 'general' };
}

function calcRiskScore(alerts = []) {
  if (!alerts.length) return { score: 5, grade: 'SAFE', label: 'All Systems Healthy' };
  let score = 0;
  for (const a of alerts) {
    if (a.severity === 'critical') score += 25;
    else if (a.severity === 'high')    score += 15;
    else if (a.severity === 'warning') score += 8;
    else                               score += 2;
  }
  score = Math.min(score, 100);
  let grade, label;
  if      (score <= 6)   { grade = 'SAFE';     label = 'All Systems Healthy'; }
  else if (score <= 25)  { grade = 'NOTICE';   label = 'Minor Issues Detected'; }
  else if (score <= 50)  { grade = 'AT RISK';  label = 'Operational Risk Present'; }
  else                   { grade = 'CRITICAL'; label = 'Immediate Action Required'; }
  return { score, grade, label };
}

function transformHosts(rawHosts = []) {
  return rawHosts.map(h => ({
    id: h.hostid,
    name: h.name || h.host,
    type: inferDeviceType(h.name || h.host),
    status: h.available === '1' ? 'healthy' : h.available === '2' ? 'critical' : 'warning',
    ip: h.interfaces?.[0]?.ip || 'N/A',
    lastSeen: h.available === '1' ? 'Just now' : 'Unreachable',
  }));
}

function transformProblems(rawProblems = [], hosts = []) {
  const hostMap = {};
  for (const h of hosts) hostMap[h.hostid || h.id] = h.name || h.host;

  return rawProblems.map(p => {
    const sev = parseInt(p.severity || 0);
    const { impact, category } = getBusinessImpact(p.name || '');
    return {
      id: p.eventid || p.problemid,
      severity: SEVERITY_MAP[sev] || 'info',
      severityLabel: SEVERITY_ZABBIX[sev] || 'Info',
      title: p.name,
      businessImpact: impact,
      category,
      deviceId: p.objectid,
      deviceName: hostMap[p.hostid] || 'Unknown Device',
      time: p.clock ? new Date(parseInt(p.clock) * 1000).toISOString() : new Date().toISOString(),
      ack: p.acknowledged === '1',
    };
  });
}

function buildDashboard(tenant, assets, alerts) {
  const total    = assets.length;
  const healthy  = assets.filter(a => a.status === 'healthy').length;
  const critical = assets.filter(a => a.status === 'critical').length;
  const warning  = assets.filter(a => a.status === 'warning').length;
  const { score, grade, label } = calcRiskScore(alerts);

  const metrics = {
    connectivity:  { label: 'Connectivity',      value: assets.filter(a=>['switch','wifi'].includes(a.type) && a.status==='healthy').length + '/' + assets.filter(a=>['switch','wifi'].includes(a.type)).length, status: critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'healthy' },
    security:      { label: 'Security Layer',     value: assets.filter(a=>a.type==='firewall'&&a.status==='healthy').length === assets.filter(a=>a.type==='firewall').length ? 'Protected' : 'At Risk', status: assets.some(a=>a.type==='firewall'&&a.status==='critical') ? 'critical' : 'healthy' },
    criticalSys:   { label: 'Critical Systems',   value: assets.filter(a=>a.type==='server'&&a.status==='healthy').length + '/' + assets.filter(a=>a.type==='server').length, status: assets.some(a=>a.type==='server'&&a.status==='critical') ? 'critical' : 'healthy' },
    wireless:      { label: 'Wireless Coverage',  value: assets.filter(a=>a.type==='wifi'&&a.status==='healthy').length + '/' + assets.filter(a=>a.type==='wifi').length + ' APs', status: assets.some(a=>a.type==='wifi'&&a.status==='critical') ? 'critical' : assets.some(a=>a.type==='wifi'&&a.status==='warning') ? 'warning' : 'healthy' },
    recovery:      { label: 'Recovery Readiness', value: assets.filter(a=>a.type==='nas'&&a.status==='healthy').length === assets.filter(a=>a.type==='nas').length ? 'Ready' : 'At Risk', status: assets.some(a=>a.type==='nas'&&a.status!=='healthy') ? 'critical' : 'healthy' },
  };

  return {
    tenant: { id: tenant.id, name: tenant.name, city: tenant.city, plan: tenant.plan },
    summary: { total, healthy, warning, critical, uptimePct: total > 0 ? Math.round((healthy/total)*100*10)/10 : 100 },
    risk: { score, grade, label },
    metrics,
    assets,
    alerts: alerts.slice(0, 20),
    lastUpdated: new Date().toISOString(),
    dataSource: tenant.live ? 'live' : 'mock',
  };
}

module.exports = { transformHosts, transformProblems, buildDashboard, calcRiskScore, getBusinessImpact };
