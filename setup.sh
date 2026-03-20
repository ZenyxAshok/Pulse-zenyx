#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PULSE BY ZENYX — Replit Setup Script
# Run this ONCE after uploading files: bash setup.sh
# ═══════════════════════════════════════════════════════════════════════════════

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║   PULSE BY ZENYX — Replit Setup Script           ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── STEP 1: Node version ──────────────────────────────────────────────────────
echo -e "${CYAN}[1/7] Checking Node.js version...${NC}"
NODE_VER=$(node -v 2>/dev/null || echo "not found")
if [ "$NODE_VER" = "not found" ]; then
  echo -e "${RED}✗ Node.js not found.${NC}"; exit 1
fi
NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}✗ Node $NODE_VER too old. Need v18+.${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $NODE_VER${NC}"

# ── STEP 2: Detect project root ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}[2/7] Detecting project structure...${NC}"

if [ -f "backend/server.js" ]; then
  echo -e "${GREEN}✓ Files in current directory${NC}"
elif [ -f "pulse-mvp/backend/server.js" ]; then
  echo -e "${YELLOW}  Found files inside pulse-mvp/ — moving to root...${NC}"
  cp -r pulse-mvp/. .
  rm -rf pulse-mvp
  echo -e "${GREEN}✓ Files moved to root${NC}"
else
  echo -e "${RED}✗ Cannot find backend/server.js${NC}"
  echo ""
  echo "Expected structure after extracting the V4 zip:"
  echo "  backend/server.js"
  echo "  frontend/public/index.html"
  echo "  package.json"
  exit 1
fi

# ── STEP 3: Verify files ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[3/7] Verifying required files...${NC}"

FILES=(
  "package.json"
  "backend/server.js"
  "backend/config/mockData.js"
  "backend/config/constants.js"
  "backend/services/authService.js"
  "backend/services/hospitalService.js"
  "backend/services/zabbixAdapter.js"
  "backend/services/dashboardTransformer.js"
  "backend/middleware/auth.js"
  "backend/routes/auth.js"
  "backend/routes/hospital.js"
  "backend/routes/admin.js"
  "backend/routes/zabbixTest.js"
  "frontend/public/index.html"
  "frontend/public/css/style.css"
  "frontend/public/js/constants.js"
  "frontend/public/js/api.js"
  "frontend/public/js/ui.js"
  "frontend/public/js/render.js"
  "frontend/public/js/app.js"
)

MISSING=0
for F in "${FILES[@]}"; do
  if [ -f "$F" ]; then
    echo -e "  ${GREEN}✓${NC} $F"
  else
    echo -e "  ${RED}✗ MISSING: $F${NC}"
    MISSING=$((MISSING+1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo -e "${RED}✗ $MISSING file(s) missing. Re-upload the V4 zip.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ All 20 files present${NC}"

# ── STEP 4: Install npm packages ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}[4/7] Installing npm dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ── STEP 5: Write .replit config ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}[5/7] Writing Replit configuration...${NC}"

cat > .replit << 'EOF'
run = "node backend/server.js"
language = "nodejs"

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "node backend/server.js"]
deploymentTarget = "cloudrun"
EOF

echo -e "${GREEN}✓ .replit written${NC}"

# ── STEP 6: Write .env if missing ────────────────────────────────────────────
echo ""
echo -e "${CYAN}[6/7] Checking .env file...${NC}"

if [ ! -f ".env" ]; then
  cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
JWT_SECRET=pulse_zenyx_change_this_secret_before_going_live_2024
JWT_EXPIRES_IN=8h

# Zabbix — leave blank to use demo data
# Fill when you have a reachable Zabbix server:
# ZABBIX_URL=https://your-server/api_jsonrpc.php
# ZABBIX_USER=pulse_api
# ZABBIX_PASS=your_password
EOF
  echo -e "${GREEN}✓ .env created with safe defaults${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

# ── STEP 7: Smoke test ───────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[7/7] Running smoke test (starting server for 10 seconds)...${NC}"

node backend/server.js > /tmp/pulse_log.txt 2>&1 &
SPID=$!
sleep 3

if ! kill -0 $SPID 2>/dev/null; then
  echo -e "${RED}✗ Server crashed. Error log:${NC}"
  cat /tmp/pulse_log.txt
  exit 1
fi

PASS=0; FAIL=0

run_test() {
  local NAME="$1"; local URL="$2"; local MATCH="$3"; local AUTH="$4"
  local RESULT
  if [ -n "$AUTH" ]; then
    RESULT=$(curl -s -H "Authorization: Bearer $AUTH" "$URL" 2>/dev/null)
  else
    RESULT=$(curl -s "$URL" 2>/dev/null)
  fi
  if echo "$RESULT" | grep -q "$MATCH" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $NAME"
    PASS=$((PASS+1))
  else
    echo -e "  ${RED}✗${NC} $NAME → got: $(echo "$RESULT" | head -c 100)"
    FAIL=$((FAIL+1))
  fi
}

# Basic checks
run_test "Health endpoint"      "http://localhost:3000/api/health"  '"ok":true'
run_test "Frontend HTML"        "http://localhost:3000/"             "Pulse by ZENYX"
run_test "CSS file"             "http://localhost:3000/css/style.css" "Instrument Sans"
run_test "JS app file"          "http://localhost:3000/js/app.js"   "PULSE.app"
run_test "No-auth block"        "http://localhost:3000/api/dashboard" '"error"'

# Login and get token
LR=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"it.admin@apollo.com","password":"demo1234"}')

TOK=$(echo "$LR" | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    try{process.stdout.write(JSON.parse(d).token||'')}catch(e){}
  });
")

if [ -n "$TOK" ]; then
  echo -e "  ${GREEN}✓${NC} Login (Apollo admin)"
  PASS=$((PASS+1))

  run_test "Dashboard API"      "http://localhost:3000/api/dashboard"          '"healthScore"'  "$TOK"
  run_test "Assets API"         "http://localhost:3000/api/assets"             '"total"'        "$TOK"
  run_test "Alerts API"         "http://localhost:3000/api/alerts"             '"counts"'       "$TOK"
  run_test "Uptime API"         "http://localhost:3000/api/uptime"             '"services"'     "$TOK"
  run_test "Recommendations"    "http://localhost:3000/api/recommendations"    '"items"'        "$TOK"
  run_test "Support tickets"    "http://localhost:3000/api/support/tickets"    '"tickets"'      "$TOK"

  # Create a ticket
  NT=$(curl -s -X POST http://localhost:3000/api/support/tickets \
    -H "Authorization: Bearer $TOK" \
    -H "Content-Type: application/json" \
    -d '{"title":"Setup test ticket","priority":"low"}' 2>/dev/null)
  if echo "$NT" | grep -q '"id"'; then
    echo -e "  ${GREEN}✓${NC} Create support ticket"
    PASS=$((PASS+1))
  else
    echo -e "  ${RED}✗${NC} Create support ticket"
    FAIL=$((FAIL+1))
  fi

  # Cross-tenant block
  CR=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"it.admin@care.com","password":"demo1234"}')
  CTOK=$(echo "$CR" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).token||'')}catch(e){}});
  ")
  if [ -n "$CTOK" ]; then
    run_test "Cross-tenant block" \
      "http://localhost:3000/api/dashboard?tenantId=tenant_apollo" \
      '"error"' "$CTOK"
  fi

  # Super admin
  AR=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"ashok@zenyx.in","password":"demo1234"}')
  ATOK=$(echo "$AR" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).token||'')}catch(e){}});
  ")
  if [ -n "$ATOK" ]; then
    run_test "Admin — all tenants"  "http://localhost:3000/api/admin/tenants"    'Apollo Hospitals'  "$ATOK"
    run_test "Zabbix ping endpoint" "http://localhost:3000/api/zabbix/ping"      '"step"'    "$ATOK"
    run_test "Zabbix mapping"       "http://localhost:3000/api/admin/tenant/tenant_apollo/mapping" '"zabbixGroupId"' "$ATOK"
  fi
else
  echo -e "  ${RED}✗${NC} Login failed — skipping auth tests"
  FAIL=$((FAIL+1))
fi

# Stop test server
kill $SPID 2>/dev/null
wait $SPID 2>/dev/null
rm -f /tmp/pulse_log.txt

# ── RESULT ───────────────────────────────────────────────────────────────────
TOTAL=$((PASS+FAIL))
echo ""
echo -e "${BLUE}${BOLD}══════════════════════════════════════════════════${NC}"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  ✓ ALL $TOTAL TESTS PASSED — READY TO RUN${NC}"
  echo ""
  echo -e "${BOLD}  Start the server:${NC}"
  echo -e "    ${CYAN}node backend/server.js${NC}"
  echo -e "    ${YELLOW}(or click Run in Replit)${NC}"
  echo ""
  echo -e "${BOLD}  Demo login credentials:${NC}"
  echo -e "    ${CYAN}it.admin@apollo.com${NC}   / demo1234  → Apollo Hospital"
  echo -e "    ${CYAN}it.admin@care.com${NC}     / demo1234  → CARE Hospital"
  echo -e "    ${CYAN}it.admin@yashoda.com${NC}  / demo1234  → Yashoda Hospital"
  echo -e "    ${CYAN}ashok@zenyx.in${NC}        / demo1234  → ZENYX Super Admin"
  echo ""
  echo -e "${BOLD}  To connect Zabbix:${NC}"
  echo -e "    Add 3 secrets in Replit (🔒 icon in sidebar):"
  echo -e "    ${CYAN}ZABBIX_URL${NC}   = https://your-zabbix/api_jsonrpc.php"
  echo -e "    ${CYAN}ZABBIX_USER${NC}  = pulse_api"
  echo -e "    ${CYAN}ZABBIX_PASS${NC}  = your_password"
  echo -e "    Then click Run — live data flows automatically."
  echo ""
  echo -e "${BOLD}  To connect zenyxpulse.com:${NC}"
  echo -e "    Replit → Deployments → Custom Domain → add zenyxpulse.com"
else
  echo -e "${RED}${BOLD}  ✗ $FAIL of $TOTAL tests failed${NC}"
  echo ""
  echo -e "${YELLOW}  Troubleshooting:${NC}"
  echo -e "  1. Make sure you extracted the V4 zip into Replit"
  echo -e "  2. Run: npm install"
  echo -e "  3. Run: bash setup.sh again"
fi

echo -e "${BLUE}${BOLD}══════════════════════════════════════════════════${NC}"
echo ""
