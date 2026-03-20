// frontend/public/js/constants.js
'use strict';

window.PULSE = window.PULSE || {};

PULSE.ROLES = {
  SUPER_ADMIN:     'super_admin',
  ZENYX_ADMIN:     'zenyx_admin',
  HOSPITAL_ADMIN:  'hospital_admin',
  HOSPITAL_VIEWER: 'hospital_viewer',
};

// Which pages each role can access
PULSE.PERMISSIONS = {
  super_admin:     ['dashboard','assets','alerts','uptime','recommendations','support','admin'],
  zenyx_admin:     ['dashboard','assets','alerts','uptime','recommendations','support'],
  hospital_admin:  ['dashboard','assets','alerts','uptime','recommendations','support'],
  hospital_viewer: ['dashboard','alerts','uptime','support'],
};

PULSE.ZENYX_ROLES = ['super_admin', 'zenyx_admin'];

// Icon map for asset categories
PULSE.ASSET_ICONS = {
  'Firewall':'🔥','Server':'🗄️','Switch':'🔀','Wi-Fi AP':'📡',
  'Storage':'💾','Computer':'💻','CCTV':'📷','UPS':'🔋',
};

// Severity → display properties
PULSE.SEV = {
  critical: { cls:'crit',     icon:'🔴', badgeCls:'badge-red',    label:'Critical' },
  warning:  { cls:'warn',     icon:'🟡', badgeCls:'badge-yellow', label:'Warning'  },
  info:     { cls:'info-row', icon:'🔵', badgeCls:'badge-blue',   label:'Info'     },
  resolved: { cls:'resolved', icon:'✅', badgeCls:'badge-green',  label:'Resolved' },
};

PULSE.TICKET_BADGE = {
  open:        'ts-open',
  in_progress: 'ts-prog',
  resolved:    'ts-done',
};

PULSE.RISK_BADGE = {
  high:        'badge-red',
  medium:      'badge-yellow',
  low:         'badge-blue',
  opportunity: 'badge-blue',
};

PULSE.RISK_LABEL = {
  high:'High Risk', medium:'Medium', low:'Low Risk', opportunity:'Opportunity',
};
