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
│   └── zenyx-audit/        # ZENYX Care IT Check — main app
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
