# REPLIT AGENT TASK — Add UBC as a Live Client to Pulse by ZENYX

## OVERVIEW
We are adding a new real client called **UBC** to the Pulse monitoring dashboard.
UBC is connected to our live Zabbix server at `http://124.123.30.120/api_jsonrpc.php`
Their Zabbix Host Group ID is **22** (group name: UBC_NOC).

---

## TASK 1 — Update the .env file

Open the `.env` file in the root of the project.

Find these 3 lines (they start with `#` which means they are commented out):
```
# ZABBIX_URL=https://your-zabbix-server.example.com/api_jsonrpc.php
# ZABBIX_USER=pulse_readonly
# ZABBIX_PASS=your_secure_password
```

Replace them with these exact lines (remove the # symbol):
```
ZABBIX_URL=http://124.123.30.120/api_jsonrpc.php
ZABBIX_USER=Admin
ZABBIX_PASS=Zenyx!@#
```

Save the file.

---

## TASK 2 — Update backend/config/mockData.js

### 2A — Add UBC to the TENANTS section

Find the TENANTS object. It ends with `tenant_yashoda` block followed by `};`

Add this new tenant BEFORE the closing `};` of the TENANTS object:

```javascript
  tenant_ubc: {
    id: 'tenant_ubc', name: 'UBC', location: 'Hyderabad',
    plan: 'MSP Monitoring Tier', planPrice: '₹6,999/mo', renewalDate: '2026-12-31',
    sla: '4-hour standard · 30-min critical', zabbixGroupId: 22, active: true,
    nocPhone: '+91 89771 00000',
  },
```

---

### 2B — Add UBC user to the USERS array

Find the USERS array. It ends with `usr_z02` (ZENYX NOC Engineer) entry.

Add this new user BEFORE the closing `];` of the USERS array:

```javascript
  { id:'usr_ubc01', tenantId:'tenant_ubc', name:'UBC IT Admin', email:'it@ubc.in', role:ROLES.HOSPITAL_ADMIN, initials:'UA', pwHash:'demo1234', active:true },
```

---

### 2C — Add UBC to the ASSETS section

Find the ASSETS object. Add this block BEFORE the closing `};` of ASSETS:

```javascript
  tenant_ubc: [
    { id:'ast_ubc01', name:'UBC_TZ470 SonicWall Firewall', ip:'192.168.1.1', cat:ASSET_CAT.FIREWALL, loc:'Server Room', status:'online', avail:100.0, seen:'Just now', zabbixHostId:4001 },
  ],
```

---

### 2D — Add UBC to the ALERTS section

Find the ALERTS object. Add this block BEFORE the closing `};` of ALERTS:

```javascript
  tenant_ubc: [],
```

---

### 2E — Add UBC to the DASHBOARD section

Find the DASHBOARD object. Add this block BEFORE the closing `};` of DASHBOARD:

```javascript
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
```

---

### 2F — Add UBC to the UPTIME section

Find the UPTIME object. Add this block BEFORE the closing `};` of UPTIME:

```javascript
  tenant_ubc: {
    services:[
      { name:'Firewall', uptime:100.0, color:'green' },
    ],
    calendar:[...Array(20).fill('ok'), ...Array(10).fill('future')],
  },
```

---

### 2G — Add UBC to the RECOMMENDATIONS section

Find the RECOMMENDATIONS object. Add this block BEFORE the closing `};` of RECOMMENDATIONS:

```javascript
  tenant_ubc: [
    { id:'rec_ubc01', level:'opportunity', icon:'🚀', title:'Add More Devices to Monitoring', desc:'Currently only the SonicWall firewall is being monitored. Adding servers, switches, and Wi-Fi access points will give UBC full infrastructure visibility.', action:'Contact ZENYX to onboard additional devices' },
  ],
```

---

### 2H — Add UBC to the TICKETS section

Find the TICKETS object. Add this block BEFORE the closing `};` of TICKETS:

```javascript
  tenant_ubc: [],
```

---

## TASK 3 — Update server.js console log

Find this block in `server.js`:
```
  it.admin@apollo.com   / demo1234  (Hospital Admin)
  it.admin@care.com     / demo1234  (Hospital Admin)
  it.admin@yashoda.com  / demo1234  (Hospital Admin)
  ashok@zenyx.in        / demo1234  (Super Admin)
  noc@zenyx.in          / demo1234  (ZENYX NOC)
```

Add this line at the end of that list:
```
  it@ubc.in             / demo1234  (UBC - Hospital Admin)
```

---

## TASK 4 — Restart the server

After all changes are saved, stop and restart the Replit server so the new environment variables and code changes take effect.

---

## VERIFICATION

After restart, confirm the following works:
1. Go to the Pulse dashboard login page
2. Login with: `it@ubc.in` / `demo1234`
3. UBC dashboard should load showing their Firewall status from live Zabbix data
4. Login as `ashok@zenyx.in` / `demo1234` and check All Hospitals view — UBC should appear in the list

---

## SUMMARY OF CHANGES
| File | Change |
|------|--------|
| `.env` | Enabled live Zabbix connection with real server IP and credentials |
| `backend/config/mockData.js` | Added UBC to TENANTS, USERS, ASSETS, ALERTS, DASHBOARD, UPTIME, RECOMMENDATIONS, TICKETS |
| `server.js` | Added UBC credentials to console log |
