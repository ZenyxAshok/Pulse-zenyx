'use strict';
// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// This file is the single source of truth for the demo.
// When Zabbix is connected, zabbixAdapter.js will replace each section.
// Search "ZABBIX_IMPL" throughout the codebase to find every integration point.
// ─────────────────────────────────────────────────────────────────────────────

const { ROLES, ALERT_SEV, ASSET_CAT, TICKET_ST, RISK_LVL } = require('./constants');

// ── TENANTS ─────────────────────────────────────────────────────────────────
// ZABBIX_IMPL: zabbixGroupId maps each tenant to a Zabbix Host Group ID
const TENANTS = {
  tenant_apollo: {
    id: 'tenant_apollo', name: 'Apollo Hospitals', location: 'Jubilee Hills, Hyderabad',
    plan: 'MSP Support Tier', planPrice: '₹12,999/mo', renewalDate: '2026-04-01',
    sla: '4-hour standard · 30-min critical', zabbixGroupId: 12, active: true,
    nocPhone: '+91 89771 00000',
  },
  tenant_care: {
    id: 'tenant_care', name: 'CARE Hospitals', location: 'Banjara Hills, Hyderabad',
    plan: 'MSP Monitoring Tier', planPrice: '₹6,999/mo', renewalDate: '2026-05-01',
    sla: '8-hour standard · 1-hour critical', zabbixGroupId: 15, active: true,
    nocPhone: '+91 89771 00000',
  },
  tenant_yashoda: {
    id: 'tenant_yashoda', name: 'Yashoda Hospitals', location: 'Secunderabad, Hyderabad',
    plan: 'MSP Security Tier', planPrice: '₹23,999/mo', renewalDate: '2026-03-15',
    sla: '2-hour standard · 15-min critical', zabbixGroupId: 18, active: true,
    nocPhone: '+91 89771 00000',
  },
  tenant_ubc: {
    id: 'tenant_ubc', name: 'UBC', location: 'Hyderabad',
    plan: 'MSP Monitoring Tier', planPrice: '₹6,999/mo', renewalDate: '2026-12-31',
    sla: '4-hour standard · 30-min critical', zabbixGroupId: 22, active: true,
    nocPhone: '+91 89771 00000',
  },
};

// ── USERS ────────────────────────────────────────────────────────────────────
// Passwords are "demo1234" — stored as a placeholder; authService does a string
// compare in dev mode. Replace with real bcrypt hashes before production.
const USERS = [
  { id:'usr_a01', tenantId:'tenant_apollo',  name:'Ramesh Agarwal',     email:'it.admin@apollo.com',   role:ROLES.HOSPITAL_ADMIN,  initials:'RA', pwHash:'demo1234', active:true },
  { id:'usr_a02', tenantId:'tenant_apollo',  name:'Meena Sharma',       email:'it.viewer@apollo.com',  role:ROLES.HOSPITAL_VIEWER, initials:'MS', pwHash:'demo1234', active:true },
  { id:'usr_c01', tenantId:'tenant_care',    name:'Priya Sharma',       email:'it.admin@care.com',     role:ROLES.HOSPITAL_ADMIN,  initials:'PS', pwHash:'demo1234', active:true },
  { id:'usr_y01', tenantId:'tenant_yashoda', name:'Vikram Reddy',       email:'it.admin@yashoda.com',  role:ROLES.HOSPITAL_ADMIN,  initials:'VR', pwHash:'demo1234', active:true },
  { id:'usr_z01', tenantId:null,             name:'Ashok Chappidi',     email:'ashok@zenyx.in',        role:ROLES.SUPER_ADMIN,     initials:'AC', pwHash:'demo1234', active:true },
  { id:'usr_z02', tenantId:null,             name:'ZENYX NOC Engineer', email:'noc@zenyx.in',          role:ROLES.ZENYX_ADMIN,     initials:'ZN', pwHash:'demo1234', active:true },
  { id:'usr_ubc01', tenantId:'tenant_ubc',   name:'UBC IT Admin',       email:'it@ubc.in',             role:ROLES.HOSPITAL_ADMIN,  initials:'UA', pwHash:'demo1234', active:true },
];

// ── ASSETS ───────────────────────────────────────────────────────────────────
// ZABBIX_IMPL: replace with zabbixAdapter.getHosts(tenant.zabbixGroupId)
// status: 'online' | 'offline' | 'warning'
const ASSETS = {
  tenant_apollo: [
    { id:'ast_a01', name:'Fortigate FG-200F',        ip:'192.168.1.1',    cat:ASSET_CAT.FIREWALL, loc:'Server Room',     status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:1001 },
    { id:'ast_a02', name:'HIS Primary Server',        ip:'192.168.10.10',  cat:ASSET_CAT.SERVER,   loc:'Server Room',     status:'warning', avail:89.2,  seen:'38 sec ago', zabbixHostId:1002 },
    { id:'ast_a03', name:'PACS / Radiology Server',   ip:'192.168.10.12',  cat:ASSET_CAT.SERVER,   loc:'Radiology Dept',  status:'online',  avail:99.9,  seen:'1 min ago',  zabbixHostId:1003 },
    { id:'ast_a04', name:'Backup / DR Server',        ip:'192.168.10.14',  cat:ASSET_CAT.SERVER,   loc:'Server Room',     status:'warning', avail:74.0,  seen:'2 min ago',  zabbixHostId:1004 },
    { id:'ast_a05', name:'Core Switch — Cisco C9300', ip:'192.168.1.10',   cat:ASSET_CAT.SWITCH,   loc:'Server Room',     status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:1005 },
    { id:'ast_a06', name:'Distribution Switch DS-3',  ip:'192.168.1.13',   cat:ASSET_CAT.SWITCH,   loc:'Floor 3 IDF',     status:'online',  avail:99.8,  seen:'1 min ago',  zabbixHostId:1006 },
    { id:'ast_a07', name:'AP-ICU-01',                 ip:'192.168.50.41',  cat:ASSET_CAT.WIFI,     loc:'ICU Wing',        status:'online',  avail:99.1,  seen:'2 min ago',  zabbixHostId:1007 },
    { id:'ast_a08', name:'AP-Ward3B',                 ip:'192.168.50.43',  cat:ASSET_CAT.WIFI,     loc:'Ward 3B',         status:'offline', avail:0,     seen:'7h 22m ago', zabbixHostId:1008 },
    { id:'ast_a09', name:'AP-Ward4A',                 ip:'192.168.50.44',  cat:ASSET_CAT.WIFI,     loc:'Ward 4A',         status:'offline', avail:0,     seen:'7h 18m ago', zabbixHostId:1009 },
    { id:'ast_a10', name:'NAS Backup Unit — Synology',ip:'192.168.10.50',  cat:ASSET_CAT.STORAGE,  loc:'Server Room',     status:'warning', avail:97.1,  seen:'2 min ago',  zabbixHostId:1010 },
    { id:'ast_a11', name:'OPD-PC-Reception-01',       ip:'192.168.20.11',  cat:ASSET_CAT.PC,       loc:'OPD Reception',   status:'online',  avail:99.5,  seen:'5 min ago',  zabbixHostId:1011 },
    { id:'ast_a12', name:'OPD-PC-Reception-02',       ip:'192.168.20.12',  cat:ASSET_CAT.PC,       loc:'OPD Reception',   status:'online',  avail:98.2,  seen:'5 min ago',  zabbixHostId:1012 },
    { id:'ast_a13', name:'CCTV NVR — Main',           ip:'192.168.60.10',  cat:ASSET_CAT.CCTV,     loc:'Security Room',   status:'online',  avail:99.9,  seen:'3 min ago',  zabbixHostId:1013 },
    { id:'ast_a14', name:'UPS — Server Room APC',     ip:'192.168.5.1',    cat:ASSET_CAT.UPS,      loc:'Server Room',     status:'online',  avail:100.0, seen:'1 min ago',  zabbixHostId:1014 },
  ],
  tenant_care: [
    { id:'ast_c01', name:'Cisco ASA 5506-X',          ip:'10.0.1.1',       cat:ASSET_CAT.FIREWALL, loc:'Server Room',     status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:2001 },
    { id:'ast_c02', name:'EMR Application Server',    ip:'10.0.10.10',     cat:ASSET_CAT.SERVER,   loc:'Server Room',     status:'online',  avail:98.8,  seen:'1 min ago',  zabbixHostId:2002 },
    { id:'ast_c03', name:'Backup Server',             ip:'10.0.10.20',     cat:ASSET_CAT.SERVER,   loc:'Server Room',     status:'online',  avail:99.2,  seen:'1 min ago',  zabbixHostId:2003 },
    { id:'ast_c04', name:'Core Switch — HP ProCurve', ip:'10.0.1.10',      cat:ASSET_CAT.SWITCH,   loc:'Server Room',     status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:2004 },
    { id:'ast_c05', name:'AP-OPD-01',                 ip:'10.0.50.1',      cat:ASSET_CAT.WIFI,     loc:'OPD Block',       status:'online',  avail:99.5,  seen:'2 min ago',  zabbixHostId:2005 },
    { id:'ast_c06', name:'NAS Backup',                ip:'10.0.10.50',     cat:ASSET_CAT.STORAGE,  loc:'Server Room',     status:'online',  avail:99.8,  seen:'2 min ago',  zabbixHostId:2006 },
  ],
  tenant_ubc: [
    { id:'ast_ubc01', name:'UBC_TZ470 SonicWall Firewall', ip:'192.168.1.1', cat:ASSET_CAT.FIREWALL, loc:'Server Room', status:'online', avail:100.0, seen:'Just now', zabbixHostId:4001 },
  ],
  tenant_yashoda: [
    { id:'ast_y01', name:'Palo Alto PA-220',          ip:'172.16.1.1',     cat:ASSET_CAT.FIREWALL, loc:'DC Room',         status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:3001 },
    { id:'ast_y02', name:'HIS Cluster Node 1',        ip:'172.16.10.10',   cat:ASSET_CAT.SERVER,   loc:'DC Room',         status:'online',  avail:99.9,  seen:'30 sec ago', zabbixHostId:3002 },
    { id:'ast_y03', name:'HIS Cluster Node 2',        ip:'172.16.10.11',   cat:ASSET_CAT.SERVER,   loc:'DC Room',         status:'warning', avail:91.0,  seen:'45 sec ago', zabbixHostId:3003 },
    { id:'ast_y04', name:'Core Switch — Cisco C9500', ip:'172.16.1.10',    cat:ASSET_CAT.SWITCH,   loc:'DC Room',         status:'online',  avail:100.0, seen:'Just now',   zabbixHostId:3004 },
    { id:'ast_y05', name:'AP-OPD-Block',              ip:'172.16.50.1',    cat:ASSET_CAT.WIFI,     loc:'OPD Block',       status:'online',  avail:99.5,  seen:'2 min ago',  zabbixHostId:3005 },
    { id:'ast_y06', name:'SAN Storage Array',         ip:'172.16.10.80',   cat:ASSET_CAT.STORAGE,  loc:'DC Room',         status:'online',  avail:100.0, seen:'1 min ago',  zabbixHostId:3006 },
  ],
};

// ── ALERTS ───────────────────────────────────────────────────────────────────
// ZABBIX_IMPL: replace with zabbixAdapter.getTriggers(tenant.zabbixGroupId)
// resolvedAt: null = still active
const ALERTS = {
  tenant_apollo: [
    {
      id:'alr_a01', sev:ALERT_SEV.CRITICAL,
      title:'HIS Application Link Degraded — High Latency',
      desc:'HIS server showing 4,200ms average latency (threshold: 500ms). OPD patient record access severely impacted. ZENYX NOC team actively investigating root cause.',
      device:'HIS Primary Server', deviceIp:'192.168.10.10',
      since:'2026-03-20T09:14:00Z', resolvedAt:null, ticketId:'ZX-2892', zabbixTriggerId:5001,
    },
    {
      id:'alr_a02', sev:ALERT_SEV.WARNING,
      title:'2 Wi-Fi Access Points Offline — Ward 3B & Ward 4A',
      desc:'AP-Ward3B and AP-Ward4A unreachable since 2:11 AM. Mobile devices and bedside tablets in these wards are losing wireless connectivity. Likely PoE port failure on DS-3.',
      device:'AP-Ward3B, AP-Ward4A', deviceIp:'192.168.50.43–44',
      since:'2026-03-20T02:11:00Z', resolvedAt:null, ticketId:'ZX-2891', zabbixTriggerId:5002,
    },
    {
      id:'alr_a03', sev:ALERT_SEV.WARNING,
      title:'Daily Backup Failed — 26 Hours Without Successful Backup',
      desc:'Backup job scheduled at 8:00 PM failed to complete. Last successful backup was 26 hours ago. Data recovery risk elevated. ZENYX reviewing backup agent logs.',
      device:'NAS Backup Unit', deviceIp:'192.168.10.50',
      since:'2026-03-19T20:00:00Z', resolvedAt:null, ticketId:'ZX-2889', zabbixTriggerId:5003,
    },
    {
      id:'alr_a04', sev:ALERT_SEV.RESOLVED,
      title:'Primary Internet Disruption — ACT Fibernet',
      desc:'Primary ISP link went down. Failover to Airtel leased line activated automatically within 45 seconds. Primary link restored after 12 minutes. No patient data impact.',
      device:'Fortigate FG-200F', deviceIp:'192.168.1.1',
      since:'2026-03-19T15:22:00Z', resolvedAt:'2026-03-19T15:34:00Z', ticketId:'ZX-2886', zabbixTriggerId:5004,
    },
    {
      id:'alr_a05', sev:ALERT_SEV.RESOLVED,
      title:'OPD Reception — 3 Computers Lost Network Access',
      desc:'Switch port failure caused 3 OPD reception computers to go offline. ZENYX team remotely reconfigured the switch port. Resolved in 8 minutes, no on-site visit required.',
      device:'Distribution Switch DS-3', deviceIp:'192.168.1.13',
      since:'2026-03-17T11:42:00Z', resolvedAt:'2026-03-17T11:50:00Z', ticketId:'ZX-2874', zabbixTriggerId:5005,
    },
  ],
  tenant_care: [
    {
      id:'alr_c01', sev:ALERT_SEV.INFO,
      title:'SSL Certificate Expiring in 14 Days — EMR Staff Portal',
      desc:'EMR portal SSL certificate expires April 3, 2026. Renewal required before expiry to avoid browser security warnings disrupting staff login to patient records system.',
      device:'EMR Application Server', deviceIp:'10.0.10.10',
      since:'2026-03-18T08:00:00Z', resolvedAt:null, ticketId:'ZX-2870', zabbixTriggerId:6001,
    },
  ],
  tenant_ubc: [],
  tenant_yashoda: [
    {
      id:'alr_y01', sev:ALERT_SEV.WARNING,
      title:'HIS Cluster Node 2 — CPU Sustained at 91%',
      desc:'Node 2 running at 91% CPU for over 2 hours. Node 1 is carrying the full cluster load. If Node 1 encounters any issue the HIS system will go down completely. Immediate investigation required.',
      device:'HIS Cluster Node 2', deviceIp:'172.16.10.11',
      since:'2026-03-20T07:30:00Z', resolvedAt:null, ticketId:'ZX-2895', zabbixTriggerId:7001,
    },
  ],
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
// ZABBIX_IMPL: computed from trigger counts + item history
// healthScore = 100 - (critical × 15) - (warning × 5), clamped 0–100
const DASHBOARD = {
  tenant_apollo: {
    healthScore:88, healthLabel:'Good — Minor Issues Detected',
    healthMsg:'Your infrastructure is operating well. ZENYX has flagged 3 active alerts. The HIS server and backup system need attention today.',
    pills:[
      { label:'Internet Online', s:'ok' }, { label:'Firewall Active', s:'ok' },
      { label:'Core Network OK', s:'ok' }, { label:'2 Wi-Fi APs Offline', s:'warn' },
      { label:'Backup Overdue (26h)', s:'warn' }, { label:'HIS Link Degraded', s:'bad' },
    ],
    metrics:{
      internet:{ count:2, trend:'Active',  ts:'ok'   },
      firewall:{ count:1, trend:'Secure',  ts:'ok'   },
      servers: { count:14,trend:'1 Warn',  ts:'warn' },
      wifi:    { count:28,trend:'2 Down',  ts:'down' },
      backup:  { val:'26h',trend:'Overdue',ts:'down' },
    },
    services:[
      { name:'Primary Internet — ACT Fibernet',  meta:'300 Mbps · ICU & OPD',          uptime:99.9,  sc:'ok'   },
      { name:'Backup Internet — Airtel Leased',  meta:'100 Mbps · Failover',            uptime:97.4,  sc:'ok'   },
      { name:'Fortigate FG-200F Firewall',       meta:'UTM · IPS · Deep Inspection ON', uptime:100.0, sc:'ok'   },
      { name:'HIS / EMR Server (Primary)',       meta:'Dell R750 · High Latency',       uptime:89.2,  sc:'warn' },
      { name:'Wi-Fi — Cisco Meraki (28 APs)',    meta:'Ward 3B & 4A offline',           uptime:93.0,  sc:'warn' },
      { name:'Backup System — NAS Synology',     meta:'Last job failed · 26h overdue',  uptime:0,     sc:'bad'  },
    ],
    monthUptime:99.7, devicesMonitored:143, activeAlerts:3,
    nocMsg:'143 devices tracked · Last heartbeat 42 sec ago · 3 alerts require attention',
  },
  tenant_care: {
    healthScore:94, healthLabel:'Healthy — Minor Advisory',
    healthMsg:'All critical systems running normally. One SSL certificate advisory requires action before April 3 to avoid staff disruption.',
    pills:[
      { label:'Internet Online', s:'ok' }, { label:'Firewall Active', s:'ok' },
      { label:'EMR Server OK', s:'ok' }, { label:'SSL Cert Expiring (14d)', s:'warn' },
    ],
    metrics:{
      internet:{ count:1, trend:'Active', ts:'ok' },
      firewall:{ count:1, trend:'Secure', ts:'ok' },
      servers: { count:6, trend:'All OK', ts:'ok' },
      wifi:    { count:14,trend:'All OK', ts:'ok' },
      backup:  { val:'2h', trend:'Current',ts:'ok'},
    },
    services:[
      { name:'Primary Internet — Jio Leased',   meta:'200 Mbps · All Departments',  uptime:99.8,  sc:'ok' },
      { name:'Cisco ASA Firewall',              meta:'IPS Active · Signatures current',uptime:100.0,sc:'ok' },
      { name:'EMR Application Server',         meta:'All services normal',           uptime:98.8,  sc:'ok' },
      { name:'Backup System',                  meta:'Last backup 2h ago',            uptime:99.2,  sc:'ok' },
    ],
    monthUptime:99.8, devicesMonitored:67, activeAlerts:1,
    nocMsg:'67 devices tracked · Last heartbeat 38 sec ago · 1 advisory item',
  },
  tenant_ubc: {
    healthScore:100, healthLabel:'Healthy',
    healthMsg:'All monitored systems are operating normally. ZENYX NOC is actively monitoring your infrastructure.',
    pills:[
      { label:'Firewall Online', s:'ok' },
      { label:'Internet Active', s:'ok' },
    ],
    metrics:{
      internet:{ count:1, trend:'Active', ts:'ok' },
      firewall:{ count:1, trend:'Secure', ts:'ok' },
      servers: { count:0, trend:'—',      ts:'ok' },
      wifi:    { count:0, trend:'—',      ts:'ok' },
      backup:  { val:'—', trend:'—',      ts:'ok' },
    },
    services:[
      { name:'UBC_TZ470 SonicWall Firewall', meta:'ICMP Active · Monitoring ON', uptime:100.0, sc:'ok' },
    ],
    monthUptime:100.0, devicesMonitored:1, activeAlerts:0,
    nocMsg:'1 device tracked · ZENYX NOC monitoring active 24×7',
  },
  tenant_yashoda: {
    healthScore:79, healthLabel:'Attention Required',
    healthMsg:'HIS Cluster Node 2 is under heavy load. Failover is active but the situation needs resolution before it impacts patient care.',
    pills:[
      { label:'Internet Online', s:'ok' }, { label:'Firewall Active', s:'ok' },
      { label:'Cluster Node 2 High CPU', s:'bad' }, { label:'Backup OK', s:'ok' },
    ],
    metrics:{
      internet:{ count:2, trend:'Active', ts:'ok'   },
      firewall:{ count:1, trend:'Secure', ts:'ok'   },
      servers: { count:8, trend:'1 Warn', ts:'warn' },
      wifi:    { count:22,trend:'All OK', ts:'ok'   },
      backup:  { val:'4h', trend:'Current',ts:'ok'  },
    },
    services:[
      { name:'Primary Internet — ACT',          meta:'500 Mbps · All Wings',          uptime:99.9,  sc:'ok'  },
      { name:'Palo Alto PA-220 Firewall',       meta:'Threat Prevention Active',      uptime:100.0, sc:'ok'  },
      { name:'HIS Cluster Node 1',              meta:'Taking full cluster load',      uptime:99.9,  sc:'ok'  },
      { name:'HIS Cluster Node 2',              meta:'91% CPU · Failover active',     uptime:91.0,  sc:'bad' },
    ],
    monthUptime:98.1, devicesMonitored:198, activeAlerts:1,
    nocMsg:'198 devices tracked · Last heartbeat 31 sec ago · 1 active warning',
  },
};

// ── UPTIME ────────────────────────────────────────────────────────────────────
// ZABBIX_IMPL: zabbixAdapter.getUptimeHistory(tenantId, 30)
// calendar: array of 30 items — 'ok'|'partial'|'down'|'future'
const UPTIME = {
  tenant_apollo: {
    services:[
      { name:'Internet',     uptime:99.7, color:'green'  },
      { name:'Firewall',     uptime:100.0,color:'green'  },
      { name:'HIS Server',   uptime:89.2, color:'yellow' },
      { name:'Core Network', uptime:98.9, color:'green'  },
    ],
    calendar:[
      'ok','ok','ok','ok','ok','ok','ok','ok','ok','ok',
      'ok','ok','ok','partial','ok','ok','ok','partial','ok','ok',
      'future','future','future','future','future','future','future','future','future','future',
    ],
  },
  tenant_care: {
    services:[
      { name:'Internet', uptime:99.8, color:'green' },
      { name:'Firewall', uptime:100.0,color:'green' },
      { name:'EMR Svr',  uptime:98.8, color:'green' },
      { name:'Backup',   uptime:99.2, color:'green' },
    ],
    calendar:[...Array(20).fill('ok'), ...Array(10).fill('future')],
  },
  tenant_ubc: {
    services:[
      { name:'Firewall', uptime:100.0, color:'green' },
    ],
    calendar:[...Array(20).fill('ok'), ...Array(10).fill('future')],
  },
  tenant_yashoda: {
    services:[
      { name:'Internet',   uptime:99.9, color:'green'  },
      { name:'Firewall',   uptime:100.0,color:'green'  },
      { name:'HIS Cluster',uptime:91.0, color:'yellow' },
      { name:'Wi-Fi',      uptime:99.5, color:'green'  },
    ],
    calendar:[
      'ok','ok','ok','ok','ok','down','ok','ok','ok','ok',
      'ok','ok','ok','ok','partial','ok','ok','ok','ok','ok',
      'future','future','future','future','future','future','future','future','future','future',
    ],
  },
};

// ── RECOMMENDATIONS ───────────────────────────────────────────────────────────
// ZABBIX_IMPL: map high-severity triggers + ZENYX engineer notes from CRM
const RECOMMENDATIONS = {
  tenant_apollo: [
    { id:'rec_a01', level:RISK_LVL.HIGH,        icon:'🔴', title:'HIS Server RAM Above 88% — OPD Application Slowdowns',       desc:'During peak OPD hours (9 AM–1 PM), HIS server RAM is consistently above 88%, causing patient record access latency. Upgrading from 32GB to 64GB will resolve immediately.', action:'Contact ZENYX to schedule RAM upgrade — est. ₹18,000' },
    { id:'rec_a02', level:RISK_LVL.HIGH,        icon:'💾', title:'No Offsite Backup — DPDP Act Patient Data Risk',              desc:'Backup runs only to on-site NAS. Last 2 jobs failed. No cloud or offsite copy of patient data exists. Critical DPDP Act compliance risk. Ransomware or fire could cause total data loss.', action:'ZENYX recommends cloud backup to Hyderabad DC — ₹4,999/month' },
    { id:'rec_a03', level:RISK_LVL.MEDIUM,      icon:'📡', title:'2 Wi-Fi Access Points Down for 7+ Hours — Ward Coverage Gap', desc:'Ward 3B and 4A have no wireless coverage. Staff may be using personal mobile data for clinical apps, creating an uncontrolled security gap outside your network perimeter.', action:'ZENYX dispatch ready — confirm scheduling with your IT coordinator' },
    { id:'rec_a04', level:RISK_LVL.MEDIUM,      icon:'🔐', title:'Firewall IPS Signatures Not Updated for 18 Days',            desc:'Fortigate IPS database is 18 days old. New ransomware variants targeting hospital networks may not be blocked. ZENYX will push updates in the next scheduled maintenance window.', action:'Scheduled: Sunday 2:00–3:00 AM maintenance window (no downtime)' },
    { id:'rec_a05', level:RISK_LVL.OPPORTUNITY, icon:'🚀', title:'Upgrade to ZENYX Security Monitoring (SOC Tier)',             desc:'Your plan covers infrastructure monitoring. Adding ZENYX Security Monitoring gives you 24×7 threat detection, CERT-In compliance reports, ransomware early warning, and DPDP breach notification assistance.', action:'Request upgrade proposal from your ZENYX account manager' },
  ],
  tenant_care: [
    { id:'rec_c01', level:RISK_LVL.MEDIUM, icon:'🔐', title:'SSL Certificate Expiring April 3 — EMR Staff Portal', desc:'EMR portal SSL certificate expires in 14 days. Renewal before expiry prevents browser security warnings that would disrupt staff login to the patient records system.', action:'ZENYX will handle renewal — please confirm authorization via email' },
    { id:'rec_c02', level:RISK_LVL.OPPORTUNITY, icon:'🚀', title:'Upgrade Opportunity: Add Wi-Fi Monitoring', desc:'Your current plan does not include wireless infrastructure monitoring. Adding it would give you real-time AP health, rogue device detection, and coverage gap alerts.', action:'Contact your ZENYX account manager for pricing' },
  ],
  tenant_ubc: [
    { id:'rec_ubc01', level:'opportunity', icon:'🚀', title:'Add More Devices to Monitoring', desc:'Currently only the SonicWall firewall is being monitored. Adding servers, switches, and Wi-Fi access points will give UBC full infrastructure visibility.', action:'Contact ZENYX to onboard additional devices' },
  ],
  tenant_yashoda: [
    { id:'rec_y01', level:RISK_LVL.HIGH,   icon:'🔴', title:'HIS Cluster Node 2 CPU at 91% — Immediate Action Required', desc:'Node 2 has been at 91% CPU for over 2 hours with Node 1 carrying the full load. If Node 1 encounters any failure the entire HIS system will go down, disrupting all hospital operations.', action:'Call ZENYX NOC immediately — +91 89771 00000' },
    { id:'rec_y02', level:RISK_LVL.MEDIUM, icon:'📊', title:'HIS Database Query Optimization Recommended',              desc:'Slow database queries are contributing to the Node 2 CPU spike. A query optimization pass can reduce CPU load by an estimated 30–40%.', action:'ZENYX can schedule a database performance review — contact account manager' },
  ],
};

// ── SUPPORT TICKETS ───────────────────────────────────────────────────────────
// ZABBIX_IMPL: replace with Freshdesk / Zoho Desk / internal DB call
const TICKETS = {
  tenant_apollo: [
    { id:'ZX-2892', title:'HIS server high latency — OPD patient records slow',   status:TICKET_ST.OPEN,        createdAt:'2026-03-20T09:30:00Z', priority:'high'   },
    { id:'ZX-2891', title:'Wi-Fi APs offline — Ward 3B and Ward 4A',              status:TICKET_ST.OPEN,        createdAt:'2026-03-20T02:15:00Z', priority:'high'   },
    { id:'ZX-2889', title:'Daily backup job failure — NAS not completing',         status:TICKET_ST.IN_PROGRESS, createdAt:'2026-03-19T20:10:00Z', priority:'high'   },
    { id:'ZX-2886', title:'Primary internet disruption — ACT Fibernet',           status:TICKET_ST.RESOLVED,    createdAt:'2026-03-19T15:22:00Z', priority:'medium' },
    { id:'ZX-2874', title:'OPD reception network — 3 computers offline',          status:TICKET_ST.RESOLVED,    createdAt:'2026-03-17T11:42:00Z', priority:'medium' },
    { id:'ZX-2860', title:'New workstation setup — Cardiology department',        status:TICKET_ST.RESOLVED,    createdAt:'2026-03-14T10:00:00Z', priority:'low'    },
  ],
  tenant_care: [
    { id:'ZX-2870', title:'SSL certificate renewal — EMR portal',                 status:TICKET_ST.OPEN,        createdAt:'2026-03-18T09:00:00Z', priority:'medium' },
  ],
  tenant_ubc: [],
  tenant_yashoda: [
    { id:'ZX-2895', title:'HIS Cluster Node 2 high CPU — urgent investigation',  status:TICKET_ST.OPEN,        createdAt:'2026-03-20T07:35:00Z', priority:'high'   },
    { id:'ZX-2888', title:'Quarterly security scan — schedule request',           status:TICKET_ST.IN_PROGRESS, createdAt:'2026-03-16T09:00:00Z', priority:'low'    },
  ],
};

module.exports = { TENANTS, USERS, ASSETS, ALERTS, DASHBOARD, UPTIME, RECOMMENDATIONS, TICKETS };
