# Connecting Pulse by ZENYX to Your Zabbix Server

## STEP 1 — What you need before starting

You need a running Zabbix server. Either:
- Zabbix installed on your own server (Linux VM, cloud VPS)
- Zabbix on your office network accessible via URL

Your Zabbix must be reachable from the internet (or from Replit).
If Zabbix is inside your office LAN only, Replit cannot reach it.
In that case, run Pulse on a server inside your network, or use a tunnel.

---

## STEP 2 — Create a read-only API user in Zabbix

Log into your Zabbix web UI as Admin.

Go to: Administration → Users → Create user

Fill in:
  Username:  pulse_api
  Password:  (choose a strong password)
  User type: Zabbix User   ← NOT Admin, NOT Super Admin

Go to: Permissions tab
  Add host group access for each hospital host group
  Permission: Read

This user can READ monitoring data but cannot change anything in Zabbix.

---

## STEP 3 — Create one Host Group per hospital in Zabbix

In Zabbix go to: Configuration → Host Groups → Create host group

Create one group per hospital:
  "Apollo Hospitals - Jubilee Hills"
  "CARE Hospitals - Banjara Hills"
  "Yashoda Hospitals - Secunderabad"

Move each hospital's hosts into the right group.

Note the Group ID number — you will need it in Step 5.
To find it: click the group, the ID is in the URL (?groupid=12)

---

## STEP 4 — Set environment variables in Replit

In your Replit project, click the lock icon (Secrets) in the left sidebar.

Add these three secrets:

  Key: ZABBIX_URL
  Value: https://your-zabbix-server.com/api_jsonrpc.php

  Key: ZABBIX_USER
  Value: pulse_api

  Key: ZABBIX_PASS
  Value: (the password you set in Step 2)

Do NOT put these in .env in the code — use Replit Secrets.

---

## STEP 5 — Map each hospital to its Zabbix Group ID

Open this file: backend/config/mockData.js

Find the TENANTS section. Update zabbixGroupId for each hospital:

  tenant_apollo: {
    ...
    zabbixGroupId: 12,   ← replace 12 with your real Apollo group ID
  },
  tenant_care: {
    ...
    zabbixGroupId: 15,   ← replace with CARE group ID
  },
  tenant_yashoda: {
    ...
    zabbixGroupId: 18,   ← replace with Yashoda group ID
  },

---

## STEP 6 — Restart Replit and test the connection

After setting secrets and updating group IDs:

1. Click Stop then Run in Replit
2. Login as ashok@zenyx.in / demo1234
3. Open your browser console or call this URL:

   GET /api/admin/zabbix/status
   (with your JWT token in Authorization header)

You should see:
  { "connected": true, "mode": "live", "version": "6.x" }

If you see connected: false, check the error message — it tells you exactly what is wrong.

---

## STEP 7 — Verify data is flowing

Login as a hospital user (e.g. it.admin@apollo.com)
Open the Dashboard page.

In the browser console you should see:
  dataSource: "live"   ← means real Zabbix data

If you still see:
  dataSource: "mock"   ← Zabbix is not reachable, using mock data

The app still works perfectly on mock — it just means the connection is not established yet.

---

## TROUBLESHOOTING

Problem: "Network error" or "fetch failed"
Fix: Your Zabbix URL is not reachable from Replit's servers.
     Either your Zabbix is behind a firewall or on a local network.
     Solution: Move Pulse to a server on the same network as Zabbix,
     or open port 443/80 on your Zabbix server for Replit's IP range.

Problem: "Zabbix auth failed"
Fix: Wrong username or password in Replit Secrets.
     Double-check ZABBIX_USER and ZABBIX_PASS.

Problem: "connected: true" but dashboard still shows mock data
Fix: The zabbixGroupId in mockData.js does not match any real group in Zabbix.
     Update the group IDs (Step 5) and restart.

Problem: Assets page is empty after connecting
Fix: The pulse_api user does not have Read permission on the host group.
     Go to Zabbix Admin → Users → pulse_api → Permissions → add the group.

---

## WHAT HAPPENS AUTOMATICALLY ONCE CONNECTED

When ZABBIX_URL is set and reachable:
- Every API call tries Zabbix first
- If Zabbix returns data → frontend shows "live" data
- If Zabbix errors or times out → falls back to mock silently
- Token refresh happens automatically every 7 hours
- No code changes needed — just the 3 env vars

