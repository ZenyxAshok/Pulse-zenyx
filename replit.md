# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── mockup-sandbox/     # Component preview server
│   └── zenyx-audit/        # ZENYX Hospital IT Health Audit — main app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── zenyx-care-it-check.html  # Standalone built HTML export (477 KB)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

---

## ZENYX Care IT Check (`artifacts/zenyx-audit`)

**Tool name:** ZENYX Care IT Check
**Subtitle:** Healthcare Infrastructure Reliability & Technology Assessment
**Company:** ZENYX IT Infra Solutions
**Brand colors:** Orange `#F97316`, Black `#111111`, White `#FFFFFF`
**Preview path:** `/`

### What it is
A premium consulting-grade Hospital IT Health Audit tool. Used by ZENYX consultants to assess hospital IT infrastructure readiness, compute a live risk score (0–100), and recommend an MSP support package.

### Current state (as of last session)
Fully built and functional. Light healthcare SaaS UI. All features complete.

### Key files
- `artifacts/zenyx-audit/src/pages/home.tsx` — entire app (single file, ~1000 lines)
- `artifacts/zenyx-audit/src/App.tsx`
- `artifacts/zenyx-audit/src/index.css`
- `artifacts/zenyx-audit/index.html`
- `artifacts/zenyx-audit/public/zenyx-icon.png`
- `artifacts/zenyx-audit/public/zenyx-logo-nobg.png`

### 7-Step Assessment Flow
1. **Hospital Information** — name, type, branches, contact, computers, servers, date
2. **Network & Connectivity** — switches, ISP redundancy, Wi-Fi quality, downtime, users, observations
3. **Security & Backup** — firewall, endpoint security, backup system/type, monitoring, password policy, data security, observations
4. **Infrastructure & Operations** — CCTV, rack management, UPS, cabling, NAS, IT support model, observations
5. **Operational IT Challenges** — free-text description of day-to-day IT pain points
6. **Future IT Goals** — free-text description of desired improvements
7. **Results** — full dashboard with all sections below

### Results Page Sections
- Infrastructure Health Score (SVG gauge, score/100, category breakdown bars)
- Score grades: Stable Infrastructure (0–25) / Needs Optimization (26–50) / Operational Risk Areas (51–75) / Critical Infrastructure Gaps (76–100)
- Key Infrastructure Observations (consulting-tone, amber warning icons)
- Recommended Actions (priority-coded cards: CRITICAL/HIGH/MEDIUM/LOW)
- Hospital IT Vision (displays future goals entered in Step 6)
- Recommended Support Model (3 packages: Monitoring / Support / Security — recommended one has ⭐ badge)
- What Happens Next (5-step implementation roadmap)
- Executive Summary (print-only)
- Action buttons: Print Report / Export as PDF / Start New Assessment

### Scoring Logic (useMemo, never break this)
Rules object maps field values → risk points. Total max = 141. Normalizes to 0–100.
Fields scored: firewall, backupSystem, internetRedundancy, downtime, serverMonitoring, endpointSecurity, passwordPolicy, dataSecurity, wifiQuality, cablingQuality, rackManagement, ups, itSupport

### UI Design
- Light healthcare SaaS aesthetic (`bg-[#F8F9FC]` page background)
- Dark header only (brand identity) — everything else is white/light
- Cards: `shadow-sm border border-gray-200 rounded-2xl bg-white` with thin orange top gradient bar
- Orange used as accent only (not dominant)
- RadioGroup: orange border + orange text when selected
- Step progress bar: sticky, white, 7 steps with orange active indicator

### Standalone HTML Export
`zenyx-care-it-check.html` at project root — 477 KB, fully self-contained (CSS + JS inlined).
To regenerate: `PORT=3000 BASE_PATH="/" pnpm --filter @workspace/zenyx-audit build` then inline assets.

---

## Pulse by ZENYX — Hospital IT Monitoring Dashboard (`artifacts/pulse-monitor`)

**Tool name:** Pulse by ZENYX
**Preview path:** `/pulse-monitor`
**Port:** 23483
**Mode:** Live (Zabbix connected via `ZABBIX_URL`, `ZABBIX_USER`, `ZABBIX_PASS` secrets)

### What it is
A premium hospital client portal where hospital IT teams see their live infrastructure health — firewalls, servers, internet, backups, Wi-Fi — in real time. ZENYX MSP customers log in to view their dedicated dashboard.

### Design System v3 (current)
- Dark enterprise aesthetic (`#070816` background, orange `#F0641E` accent)
- Fonts: Sora (headings), Inter (body), JetBrains Mono (data)
- Full-screen layout: sidebar (220px) + main area (full remaining width)
- Live polling every 5 seconds on the dashboard page
- "Last updated X sec ago" live counter in the status bar

### Dashboard Layout (top → bottom)
1. **Live Status Bar** — blinking green dot + "LIVE" + "Last updated Xs ago" + Live/Mock badge
2. **Hospital Risk Status Hero** — 2-column: left = Health Score ring card, right = risk panel (active alerts as risk cards, or "All Clear" shield when no risks)
3. **Business Metrics Strip** — 5 cards: Connectivity, Security Layer, Critical Systems, Wireless Coverage, Recovery Readiness
4. **Infrastructure Status + Recent Risk Events** — 2-column grid
5. **ZENYX NOC Activity** — 4-cell grid showing what ZENYX is actively doing
6. **Support Strip** — quick escalation bar with emergency phone number

### Demo Login Credentials
| Email | Password | Role |
|---|---|---|
| `it@ubc.in` | `demo1234` | UBC Hospital Admin (Live Zabbix) |
| `it.admin@apollo.com` | `demo1234` | Apollo Hospital Admin (Mock) |
| `it.admin@care.com` | `demo1234` | CARE Hospital Admin (Mock) |
| `it.admin@yashoda.com` | `demo1234` | Yashoda Hospital Admin (Mock) |
| `ashok@zenyx.in` | `demo1234` | Super Admin |
| `noc@zenyx.in` | `demo1234` | ZENYX NOC |

### Tenants + Zabbix Group IDs
- `tenant_ubc` → groupId: 22 (live Zabbix, 1 device: UBC_TZ470 SonicWall)
- `tenant_apollo` → groupId: 12 (mock fallback)
- `tenant_care` → groupId: 15 (mock fallback)
- `tenant_yashoda` → groupId: 18 (mock fallback)

### Key Files
- `artifacts/pulse-monitor/public/css/style.css` — complete design system v3
- `artifacts/pulse-monitor/public/index.html` — full SPA shell (login + all pages)
- `artifacts/pulse-monitor/public/js/app.js` — navigation, auth, live polling
- `artifacts/pulse-monitor/public/js/render.js` — all render functions (business-impact language)
- `artifacts/pulse-monitor/public/js/api.js` — frontend API client
- `artifacts/pulse-monitor/public/js/ui.js` — shared UI helpers (toast, loader, ring SVG)
- `artifacts/pulse-monitor/public/js/constants.js` — roles, permissions, labels
- `artifacts/pulse-monitor/routes/hospital.js` — Express routes (no-cache headers applied)
- `artifacts/pulse-monitor/services/hospitalService.js` — data layer (Zabbix live + mock fallback)
- `artifacts/pulse-monitor/services/dashboardTransformer.js` — raw Zabbix → business JSON
- `artifacts/pulse-monitor/services/zabbixAdapter.js` — Zabbix API integration
- `artifacts/pulse-monitor/config/mockData.js` — all demo data (tenants, users, assets, alerts, dashboard)
- `artifacts/pulse-monitor/server.js` — Express app entry + routing

### Backend Architecture
- `/pulse-monitor/` → serves `index.html` (SPA)
- `/pulse-monitor/svc/*` → hospital API routes (require JWT auth)
- All `/svc/*` routes have `Cache-Control: no-cache, no-store` headers
- JWT issued on login; tenant resolved via middleware for every request

---

## Other Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Routes in `src/routes/`. Entry: `src/index.ts`.

### `lib/db` (`@workspace/db`)
Drizzle ORM + PostgreSQL. Config in `drizzle.config.ts`. Push: `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec + Orval codegen. Run: `pnpm --filter @workspace/api-spec run codegen`.

### `lib/api-zod` / `lib/api-client-react`
Generated from API spec. Do not edit manually.

### `scripts` (`@workspace/scripts`)
Utility scripts. Run: `pnpm --filter @workspace/scripts run <script>`.
