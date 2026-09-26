# ReleasePilot AI — Judge Demo Script

**Duration:** 3–5 minutes  
**Repository:** E-Commerce Platform (seeded · 6 pre-loaded engineering issues)  
**Starting URL:** `http://localhost:3000`

> All demo data is structured and clearly labeled. No external writes, no real deployments.  
> Look for **ANALYZED**, **PROPOSED**, **SIMULATED**, and **REQUIRES_APPROVAL** labels throughout.

---

## Quick-Start Checklist (before the demo)

```bash
cd releasepilot
npm install          # first time only
npm run dev          # start dev server → http://localhost:3000
```

If you ran the demo before, reset it first:

```bash
curl -X POST http://localhost:3000/api/demo/reset
# or click "Reset Demo" on /demo
```

---

## Step-by-Step Walkthrough

---

### Step 1 — Open Dashboard (`/`)
**~15 seconds**

**What to click:** Navigate to `http://localhost:3000`

**What the judge should see:**
- Dark developer-tool dashboard with global metrics panel
- 4 repositories listed · 1 active run · 10 issues found this week
- E-Commerce Platform card showing health score **67/100** and **6 open findings**
- Pulsing blue dot: "1 Run Active"

**What to explain:**
> "This is the ReleasePilot AI dashboard. It gives an at-a-glance view of every connected repository.
> The E-Commerce Platform has a health score of 67 out of 100 and six open engineering issues.
> The agent has already started analyzing it — you can see the active run indicator."

**What this demonstrates:** Autonomous repository monitoring, health scoring, real-time status.

---

### Step 2 — Repository Detail (`/repositories/repo_ecommerce`)
**~30 seconds**

**What to click:** Click "E-Commerce Platform" repository card, or navigate directly.

**What the judge should see:**
- SVG architecture map: `Next.js Frontend → Express API → Auth Service → PostgreSQL + Redis`
- Technology badges: TypeScript, React, Express, PostgreSQL, Redis, Docker
- Health findings grid — **6 issues** with severity labels:
  - 🔴 CRITICAL: Password reset token vulnerability
  - 🔴 CRITICAL: CVE-2022-23529 (jsonwebtoken)
  - 🟠 HIGH: 3 failing tests
  - 🟠 HIGH: Test coverage 71.4% (below 80%)
  - 🟡 MEDIUM: Documentation mismatch
  - 🔵 LOW: Docker healthcheck target wrong
- Repository stats: 45 files · 28,540 LOC · TypeScript 71%

**What to explain:**
> "ReleasePilot has already scanned the repository. It detected the architecture automatically —
> no configuration required. It found six issues before proposing a single change.
> The agent diagnoses before it prescribes."

**What this demonstrates:** Autonomous repository understanding, CVE detection, architecture mapping.

---

### Step 3 — Start Agent Run (`/runs/new?repo=repo_ecommerce`)
**~2 minutes**

**What to click:** Click "Start Agent Run" or navigate to `/runs/new?repo=repo_ecommerce`.

#### Phase: Configure
**What the judge should see:**
- Pre-filled task: *"Prepare this project for release and resolve all issues necessary to make it production-ready."*
- Repository confirmation: E-Commerce Platform · branch: main

**What to click:** Click **"Review Scope →"**

#### Phase: Scope
**What the judge should see:**
- 7 affected files listed
- Identified risks: CRITICAL password reset, CRITICAL CVE, HIGH test failures, MEDIUM coverage gap
- Estimated risk: **HIGH**
- Required tests listed (3 new test files needed)

**What to explain:**
> "Before writing a single line of code, ReleasePilot shows exactly what it intends to touch and why.
> You see the risk assessment upfront — this is the scope review gate."

**What to click:** Click **"Generate Plan →"**

#### Phase: Plan
**What the judge should see:**
- 10-stage dynamic plan generated from the detected issues
- 7 parallel specialist workers assigned: Debugger, Test Engineer, Security Reviewer, etc.
- Stage 6 "Fix Generation" highlighted with **REQUIRES_APPROVAL** badge
- Estimated duration: ~15 minutes

**What to explain:**
> "The plan is dynamic — it's derived from what the agent found in this specific repository.
> Notice stage 6 is marked REQUIRES_APPROVAL. The agent will pause there and wait for a human."

**What to click:** Click **"Start Execution →"**

#### Phase: Execute
**What the judge should see:**
- Live log terminal streaming entries with action labels:
  - `[ANALYZED]` — read-only inspection
  - `[PROPOSED]` — fix recommended, not yet applied
  - `[SIMULATED]` — test/deploy validation in demo context
- Stages completing: Repository Analysis → Issue Detection → Test Execution → Coverage Analysis → Dependency Audit

---

### Step 4 — Human Approval Gate
**~30 seconds**

**What the judge should see (this is automatic at stage 5):**
- Log entry: `⏸ PAUSED — 5 file writes require human approval. No auto-approve.`
- **Approval Modal** appears automatically:
  - Title: "Human Approval Required"
  - 5 files listed (auth, discount, package.json, docker-compose, README)
  - Potential impact explained
  - Rollback plan: `git revert HEAD`
  - Three buttons: **Approve**, **Request Changes**, **Reject**

**What to explain:**
> "The run is now completely blocked. No timer. No auto-approve. The agent cannot proceed
> until a human explicitly clicks Approve. This is the fundamental safety guarantee of ReleasePilot:
> autonomous analysis, human control over destructive changes."

**What to click:** Click **"Approve"** (optionally add a comment first)

**After approval:**
- Log shows: `✓ Approved by user — applying proposed fixes now`
- Run continues: Fix Generation → Test Writing → Validation → Report
- Progress bar completes to 100%
- Phase changes to "Report"

**What to explain:**
> "After approval, the agent applies all proposed fixes, generates new regression tests,
> runs the full test suite again to validate, and produces a release report."

---

### Step 5 — Before/After Comparison (`/demo/compare`)
**~30 seconds**

**What to click:** Click "Before/After Comparison" in the demo completion message, or navigate to `/demo/compare`.

**What the judge should see:**
- Three hero cards showing:
  - Health Score: **67 → 94** (+27 points) with visual arc gauges
  - Release Risk: **HIGH → LOW**
  - Open Issues: **6 → 0**
- Full metrics table: tests, coverage, CVEs, docs, Docker config
- Issue resolution table: all 6 findings marked **FIXED**
- Test suite comparison: before/after pass rates and coverage per suite
- Code changes: 6 files · +28 lines added · PROPOSED label
- Amber disclaimer: clearly states this is structured demo data, not production execution

**What to explain:**
> "Every improvement is measurable and traced to a specific fix. Health score went from 67 to 94.
> Test coverage from 71% to 86%. Six critical issues resolved. All labeled PROPOSED —
> the agent showed its work without claiming to have deployed anything."

---

### Step 6 — Full Run Report (`/runs/run_01`)
**~45 seconds**

**What to click:** Click "Full Report →" or navigate to `/runs/run_01`.

**What the judge should see:**
- Run hero: status **COMPLETED** · duration 15m 8s · commit SHA shown
- Quick metrics: 10/10 stages · 6 code changes · 6 findings · 6 fixed · 94% release ready
- Workflow timeline: all 10 stages marked **DONE** in sequence
- Code Changes panel: 6 files with expandable before/after diffs
- Review Findings panel: severity filter tabs (CRITICAL / HIGH / MEDIUM / LOW)
- Test Results: before 142/145 → after 145/145 · coverage 71.4% → 85.6%
- Release Risk panel: score **94/100 LOW** · contributors breakdown
- Approval Status panel: **APPROVED** by Alex Chen with comment and timestamp

**What to explain:**
> "This is the complete audit trail. Every stage, every finding, every code change, every test result,
> and the explicit approval decision — all in one view. This is what you show stakeholders
> before pressing the deploy button."

**What to click:** Click **"Deploy Preparation →"** (top right)

---

### Step 7 — Nexus Command Center (`/nexus`)
**~60 seconds**

**What to click:** Navigate to `/nexus` (or click "Nexus" in the sidebar).

**What the judge should see:**

**Architecture tab:**
- SVG knowledge graph with 7 nodes: React Storefront, Express API, Auth Service, PostgreSQL, Redis, Test Suite, Dependencies
- All nodes show `HEALTHY` (green status dots) — this is the post-fix state
- Edges show communication paths (REST, JWT validation, DB reads/writes)

**Impact Radar tab:**
- Two change impact analyses listed
- Click "Password Reset Bug Fix" → graph highlights Auth, DB, and Test nodes with orange pulse rings
- The "What Changed / Why It Matters" panel explains: "Critical auth path changed — replay attack vector closed"
- Verification steps shown for each affected component

**Confidence tab:**
- Score arc gauge: **29/100 before fix** → **94/100 after fix**
- Toggle "Show Before Fix" to show the pre-fix state (CRITICAL blockers visible)
- Signal breakdown: Build, Test, Security, Review, Docs, Approval — each with evidence and source label
- Every signal shows whether it's `EXECUTED`, `ANALYZED`, or `SIMULATED`

**Flight Recorder tab:**
- 13 chronological entries covering the full run
- Filter by `ANALYZED`, `PROPOSED`, `SIMULATED`, `REQUIRES_APPROVAL`
- Confidence deltas shown: -15 for CVE, -8 for bug, +12 for approval, +15 for test fix
- "Raw API →" link shows the live `/api/audit` endpoint

**What to explain:**
> "The Nexus is the agent's thinking made visible. It's not just logs — it's architecture,
> impact propagation, confidence evidence, and a full audit trail. Every claim is traceable
> to a specific evidence source, labeled with whether it was actually executed or simulated."

---

### Step 8 — Proof Mode — Real Local Execution (`/nexus` → Proof Mode tab)
**~45 seconds**

**What to click:** On the Nexus page, click the **"Proof Mode"** tab.

**What the judge should see:**
- Security notice: "Safe Local Sandbox — fixture directory only, no network, no secrets, timeout 30s"
- Two commands available: `run-tests` and `analyze-deps`

**What to click:** Select `run-tests` and click **"▶ Execute"**

**After execution (5-15 seconds):**
- Output panel showing real test output
- **Exit code: 1** (expected — 2 tests fail on the buggy baseline)
- Label: `EXECUTED IN SAFE LOCAL SANDBOX`
- Exact failure: `Used token must be rejected` — `true !== false`
- Exact failure: `Float precision error: expected 89.99` — `89.991 !== 89.99`
- Note at bottom: "2 failures expected — this is the pre-fix buggy baseline"

**What to click:** Select `analyze-deps` and click **"▶ Execute"**

**After execution:**
- JSON output showing `jsonwebtoken@8.5.1` detected with CVE-2022-23529 (CVSS 7.6)
- Exit code: 1 (critical vulnerability found)
- Real package.json analysis — not a mock

**What to explain:**
> "This is real execution — not a slide, not a mock. The test runner actually ran and failed
> because the bug genuinely exists in the fixture code. When ReleasePilot proposes a fix,
> you can re-run Proof Mode to see all tests pass. The label says EXECUTED IN SAFE LOCAL SANDBOX —
> it ran on your machine, in a read-only directory, with no network access."

---

### Step 9 — Deployment Preparation (`/runs/run_01/deploy`)
**~45 seconds**

**What to click:** Click the "Deploy Preparation →" button on the run detail page.

**What the judge should see:**

**Release Gate Checks (8/8 PASS):**
- ✅ Production Build (34.2s · 0 errors)
- ✅ Test Suite (142 passing · coverage 87.3%)
- ✅ Lint & Type Check (0 errors, 0 warnings)
- ✅ Secrets & Config Scan
- ✅ Dependency Audit (CVE patched)
- ✅ Documentation Validation
- ✅ Deployment Configuration
- ✅ Changelog & Release Notes

**Deployment Pipeline (8 steps):**
- Steps labeled: `SIMULATED` or `REQUIRES_APPROVAL`
- Final step "Production Deploy" is **REQUIRES_APPROVAL** and **BLOCKED in demo mode**
- Version: **v2.4.0** · MINOR (new auth behavior)

**Smoke Tests (12/12 PASS):**
- All critical endpoints tested: auth, cart, checkout, payments, health
- Average response time: 157ms

**Service Health (6/6 healthy):**
- API Server · PostgreSQL · Redis · SendGrid · Stripe · CDN

**Changelog:** Auto-generated CHANGELOG.md and release notes for v2.4.0

**What to explain:**
> "Deployment preparation runs all pre-deployment gates automatically. Notice that the final
> production deploy step requires another explicit approval and is blocked in demo mode —
> the system can never deploy to production without a second human key, even after the code review
> was already approved."

---

### Final Summary for Judges
**~30 seconds**

> "In under 5 minutes, ReleasePilot AI took the E-Commerce Platform from:
>
> **67/100 health · 6 critical issues · 3 failing tests · 71% coverage**
>
> to:
>
> **94/100 health · 0 open issues · 145/145 tests · 86% coverage**
>
> Every step was:
> - **Autonomous** — the agent understood the repo, generated a plan, ran analysis, proposed fixes
> - **Transparent** — every action labeled ANALYZED / PROPOSED / SIMULATED
> - **Human-controlled** — two explicit approval gates, no auto-approve anywhere
> - **Safe** — no external writes, no real deployments, no credentials required
>
> That's ReleasePilot AI — from broken repository to verified release readiness, autonomously."

---

## Optional: Demo Reset

After the demo, reset for replay:

1. Click **"Reset Demo"** button on `/demo`, or
2. Run: `curl -X POST http://localhost:3000/api/demo/reset`

The reset:
- Restores approval store to PENDING (approval gate works again)
- Does **not** modify any external system
- Is safe to run repeatedly

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Build error | `npm run build` — check for TypeScript errors |
| Tests fail | `npm test` — should show 27 passing |
| Port conflict | Change port: `npm run dev -- -p 3001` |
| Approval modal doesn't appear | Refresh and restart the run — modal triggers at stage 5 |
| `/demo/compare` shows 404 | Ensure dev server is running (`npm run dev`) |

---

## Key Talking Points

| Feature | What to say |
|---------|-------------|
| Autonomous multi-step workflow | "10 stages, 7 specialist workers, no human required until the approval gate" |
| Repository understanding | "Architecture, CVEs, test gaps — all detected before any code change" |
| Dynamic planning | "The plan comes from the repository, not a static template" |
| Human approval gate | "No timer, no auto-approve — the system waits forever for a human decision" |
| Before/after evidence | "Every improvement is measured and traced to a specific fix" |
| Safe simulation | "PROPOSED / SIMULATED labels everywhere — nothing deployed without consent" |
| Audit trail | "Complete record: findings → fixes → tests → approval → deployment gate" |
| Bob-native | "Built with Bob's agent mode, TypeScript strict mode, and structured state machine" |

---

## Routes Reference

| Route | Purpose |
|-------|---------|
| `/` | Dashboard with global metrics |
| `/demo` | **START HERE** — guided judge walkthrough |
| `/demo/compare` | Before/after metrics comparison |
| `/repositories` | Repository list |
| `/repositories/repo_ecommerce` | E-Commerce Platform detail + architecture |
| `/runs/new?repo=repo_ecommerce` | Start agent run wizard |
| `/runs/run_01` | Completed run — full report with diffs |
| `/runs/run_01/deploy` | Deployment preparation |
| `/onboard` | Repository onboarding wizard |
| `/api/demo/reset` | POST — reset demo state |
| `/api/runs/:id/approve` | POST — approve/reject/request changes |
