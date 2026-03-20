'use strict';

const ROLES = {
  SUPER_ADMIN:     'super_admin',
  ZENYX_ADMIN:     'zenyx_admin',
  HOSPITAL_ADMIN:  'hospital_admin',
  HOSPITAL_VIEWER: 'hospital_viewer',
};

const PERMISSIONS = {
  super_admin:     ['dashboard','assets','alerts','uptime','recommendations','support','admin'],
  zenyx_admin:     ['dashboard','assets','alerts','uptime','recommendations','support'],
  hospital_admin:  ['dashboard','assets','alerts','uptime','recommendations','support'],
  hospital_viewer: ['dashboard','alerts','uptime','support'],
};

const ZENYX_ROLES = [ROLES.SUPER_ADMIN, ROLES.ZENYX_ADMIN];

const ALERT_SEV = { CRITICAL:'critical', WARNING:'warning', INFO:'info', RESOLVED:'resolved' };
const ASSET_CAT = { FIREWALL:'Firewall', SERVER:'Server', SWITCH:'Switch', WIFI:'Wi-Fi AP', STORAGE:'Storage', PC:'Computer', CCTV:'CCTV', UPS:'UPS' };
const TICKET_ST = { OPEN:'open', IN_PROGRESS:'in_progress', RESOLVED:'resolved' };
const RISK_LVL  = { HIGH:'high', MEDIUM:'medium', LOW:'low', OPPORTUNITY:'opportunity' };

module.exports = { ROLES, PERMISSIONS, ZENYX_ROLES, ALERT_SEV, ASSET_CAT, TICKET_ST, RISK_LVL };
