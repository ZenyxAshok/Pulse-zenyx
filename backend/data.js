'use strict';

// ─── USERS ───────────────────────────────────────────────────────────────────
const USERS = [
  { id: 'u1', email: 'it@ubc.in',           password: 'demo1234', role: 'client',  tenantId: 'ubc',     name: 'UBC IT Admin',    hospital: 'UBC Hospital' },
  { id: 'u2', email: 'it.admin@apollo.com',  password: 'demo1234', role: 'client',  tenantId: 'apollo',  name: 'Apollo IT Admin',  hospital: 'Apollo Hospital' },
  { id: 'u3', email: 'it.admin@care.com',    password: 'demo1234', role: 'client',  tenantId: 'care',    name: 'CARE IT Admin',    hospital: 'CARE Hospital' },
  { id: 'u4', email: 'it.admin@yashoda.com', password: 'demo1234', role: 'client',  tenantId: 'yashoda', name: 'Yashoda IT Admin', hospital: 'Yashoda Hospitals' },
  { id: 'u5', email: 'ashok@zenyx.in',       password: 'demo1234', role: 'admin',   tenantId: null,      name: 'Ashok Chappidi',   hospital: null },
  { id: 'u6', email: 'noc@zenyx.in',         password: 'demo1234', role: 'noc',     tenantId: null,      name: 'NOC Engineer',     hospital: null },
];

// ─── TENANTS ─────────────────────────────────────────────────────────────────
const TENANTS = {
  ubc:     { id: 'ubc',     name: 'UBC Hospital',       city: 'Hyderabad', plan: 'plus',    zabbixGroupId: '22', live: true },
  apollo:  { id: 'apollo',  name: 'Apollo Hospital',    city: 'Hyderabad', plan: 'basic',   zabbixGroupId: '12', live: false },
  care:    { id: 'care',    name: 'CARE Hospital',      city: 'Hyderabad', plan: 'plus',    zabbixGroupId: '15', live: false },
  yashoda: { id: 'yashoda', name: 'Yashoda Hospitals',  city: 'Hyderabad', plan: 'premium', zabbixGroupId: '18', live: false },
};

// ─── MOCK ASSETS ─────────────────────────────────────────────────────────────
const MOCK_ASSETS = {
  apollo: [
    { id: 'ap-fw-01',  name: 'Sophos XGS Firewall',     type: 'firewall',  status: 'healthy',  ip: '192.168.1.1',  uptime: 99.8, lastSeen: 'Just now' },
    { id: 'ap-sw-01',  name: 'Core Switch Floor-1',      type: 'switch',    status: 'healthy',  ip: '192.168.1.10', uptime: 99.5, lastSeen: 'Just now' },
    { id: 'ap-sv-01',  name: 'Main Server HPE',          type: 'server',    status: 'warning',  ip: '192.168.1.20', uptime: 97.2, lastSeen: '2m ago' },
    { id: 'ap-nas-01', name: 'Synology NAS Backup',      type: 'nas',       status: 'critical', ip: '192.168.1.30', uptime: 85.0, lastSeen: '18m ago' },
    { id: 'ap-ap-01',  name: 'Wi-Fi AP Reception',       type: 'wifi',      status: 'healthy',  ip: '192.168.1.50', uptime: 99.1, lastSeen: 'Just now' },
  ],
  care: [
    { id: 'ca-fw-01',  name: 'FortiGate 100F',           type: 'firewall',  status: 'healthy',  ip: '10.0.1.1',    uptime: 99.9, lastSeen: 'Just now' },
    { id: 'ca-sv-01',  name: 'Dell PowerEdge Server',    type: 'server',    status: 'healthy',  ip: '10.0.1.20',   uptime: 99.7, lastSeen: 'Just now' },
    { id: 'ca-sw-01',  name: 'Cisco Catalyst Switch',    type: 'switch',    status: 'warning',  ip: '10.0.1.10',   uptime: 96.0, lastSeen: '5m ago' },
    { id: 'ca-ep-01',  name: 'Endpoint Cluster (12)',    type: 'endpoint',  status: 'healthy',  ip: '10.0.1.100',  uptime: 98.5, lastSeen: 'Just now' },
  ],
  yashoda: [
    { id: 'ya-fw-01',  name: 'SonicWall TZ570',          type: 'firewall',  status: 'healthy',  ip: '172.16.1.1',  uptime: 99.9, lastSeen: 'Just now' },
    { id: 'ya-sv-01',  name: 'Primary App Server',       type: 'server',    status: 'healthy',  ip: '172.16.1.20', uptime: 99.8, lastSeen: 'Just now' },
    { id: 'ya-sv-02',  name: 'Backup Server',            type: 'server',    status: 'healthy',  ip: '172.16.1.21', uptime: 99.5, lastSeen: 'Just now' },
    { id: 'ya-nas-01', name: 'Qnap NAS TS-864eU',        type: 'nas',       status: 'healthy',  ip: '172.16.1.30', uptime: 99.2, lastSeen: 'Just now' },
    { id: 'ya-ap-01',  name: 'UniFi AP Block A',         type: 'wifi',      status: 'healthy',  ip: '172.16.1.50', uptime: 99.0, lastSeen: 'Just now' },
    { id: 'ya-ap-02',  name: 'UniFi AP Block B',         type: 'wifi',      status: 'warning',  ip: '172.16.1.51', uptime: 94.0, lastSeen: '12m ago' },
  ],
};

// ─── MOCK ALERTS ─────────────────────────────────────────────────────────────
const MOCK_ALERTS = {
  apollo: [
    { id: 'a1', severity: 'critical', title: 'NAS storage critically low',      businessImpact: 'Backup system at risk — data loss possible if not resolved',        device: 'ap-nas-01', deviceName: 'Synology NAS Backup',  time: new Date(Date.now()-18*60000).toISOString(), ack: false },
    { id: 'a2', severity: 'warning',  title: 'Server CPU above 80%',            businessImpact: 'Hospital systems may slow down — response time affected',           device: 'ap-sv-01',  deviceName: 'Main Server HPE',       time: new Date(Date.now()-35*60000).toISOString(), ack: false },
    { id: 'a3', severity: 'info',     title: 'Switch port flap detected',       businessImpact: 'Network micro-interruption — monitoring closely',                   device: 'ap-sw-01',  deviceName: 'Core Switch Floor-1',   time: new Date(Date.now()-90*60000).toISOString(), ack: true },
  ],
  care: [
    { id: 'c1', severity: 'warning',  title: 'Switch uptime degraded',          businessImpact: 'Network connectivity may be unstable on Floor 2',                  device: 'ca-sw-01',  deviceName: 'Cisco Catalyst Switch', time: new Date(Date.now()-5*60000).toISOString(),  ack: false },
  ],
  yashoda: [
    { id: 'y1', severity: 'warning',  title: 'Wi-Fi AP Block B signal weak',    businessImpact: 'Wireless coverage in Block B reduced — staff devices affected',    device: 'ya-ap-02',  deviceName: 'UniFi AP Block B',      time: new Date(Date.now()-12*60000).toISOString(), ack: false },
  ],
};

// ─── MOCK TICKETS ─────────────────────────────────────────────────────────────
// In-memory store — replace with DB in production
const TICKETS = [
  { id: 'TKT-001', tenantId: 'apollo', title: 'NAS storage full — need urgent attention', description: 'Auto-raised from critical alert', severity: 'critical', status: 'in_progress', createdAt: new Date(Date.now()-18*60000).toISOString(), updatedAt: new Date(Date.now()-10*60000).toISOString(), assignedTo: 'NOC Engineer', slaHours: 4, deviceId: 'ap-nas-01', deviceName: 'Synology NAS Backup', autoRaised: true },
  { id: 'TKT-002', tenantId: 'apollo', title: 'Server performance degraded', description: 'CPU consistently above 80% for 30 mins', severity: 'warning', status: 'open', createdAt: new Date(Date.now()-35*60000).toISOString(), updatedAt: new Date(Date.now()-35*60000).toISOString(), assignedTo: null, slaHours: 8, deviceId: 'ap-sv-01', deviceName: 'Main Server HPE', autoRaised: true },
  { id: 'TKT-003', tenantId: 'care',   title: 'Switch needs firmware update', description: 'Raised by hospital IT admin', severity: 'info', status: 'open', createdAt: new Date(Date.now()-2*3600000).toISOString(), updatedAt: new Date(Date.now()-2*3600000).toISOString(), assignedTo: null, slaHours: 24, deviceId: 'ca-sw-01', deviceName: 'Cisco Catalyst Switch', autoRaised: false },
];

let ticketCounter = 4;
function nextTicketId() { return `TKT-${String(ticketCounter++).padStart(3,'0')}`; }

module.exports = { USERS, TENANTS, MOCK_ASSETS, MOCK_ALERTS, TICKETS, nextTicketId };
