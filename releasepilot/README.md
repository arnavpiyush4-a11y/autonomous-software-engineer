# ReleasePilot AI

**An autonomous AI software-engineering agent that takes an unfamiliar repository from onboarding through analysis, planning, debugging, implementation, testing, review, release readiness, deployment preparation, and post-deployment verification — in one continuous, stateful workflow.**

```
ONBOARD → UNDERSTAND → PLAN → DEBUG/DEVELOP → TEST → REVIEW → MAINTAIN → RELEASE CHECK → DEPLOY → VERIFY
```

---

## Quick Start

```bash
# 1. Install dependencies
cd releasepilot
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev
# → http://localhost:3000

# 4. Run unit tests (27 tests)
npm test
```

### Build

```bash
npm run build   # Production build (Next.js 14)
npm start       # Start production server
```

---

## Demo Flow (for Judges)

ReleasePilot AI ships with a fully seeded demo repository: **E-Commerce Platform** with six pre-loaded issues.

> **Recommended starting point:** Open [`/demo`](http://localhost:3000/demo) for the guided step-by-step judge walkthrough.
> For the click-by-click script, see [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

### 1. Dashboard → `http://localhost:3000`
- View global metrics: repositories, active runs, issues found/fixed this week
- See the E-Commerce Platform with health score, active run, and recent activity
- All panels refresh dynamically as runs complete

### 2. Repository Detail → `/repositories/repo_ecommerce`
- SVG architecture map showing: Next.js Frontend → API Layer → PostgreSQL + Redis
- Health findings grid: 6 issues (CRITICAL: CVE, HIGH: bug, MEDIUM: tests, etc.)
- Onboarding summary with setup commands

### 3. Start Agent Run → `/runs/new?repo=repo_ecommerce`
- Task pre-filled: *"Prepare this project for release and resolve all issues necessary to make it production-ready"*
- **Phase: Configure** → enter or confirm task
- **Phase: Scope** → review affected files, risk assessment, required tests (shown before any modifications)
- **Phase: Plan** → 10-stage plan, 7 parallel workers, approval gate highlighted on stage 6
- **Phase: Execute** → live log terminal with `ANALYZED` / `PROPOSED` / `SIMULATED` action labels
- **Approval Modal** → triggered at dependency audit stage — review files, impact, rollback plan → Approve / Request Changes / Reject (no auto-approve)
- Run continues through fix generation → test writing → validation → report

### 4. Before/After Comparison → `/demo/compare`
- Health score: **67 → 94** (+27 points) with visual arc gauges
- Release risk: **HIGH → LOW** (94/100)
- Open issues: **6 → 0** (all resolved)
- Test suite comparison: 142/145 failing → 145/145 passing
- Coverage: **71.4% → 85.6%** (+14.2%)
- Code changes: 6 files with PROPOSED labels — clearly not executed in production
- Simulation disclaimer: every value labeled with its execution status

### 5. Run Detail → `/runs/run_01`
- Workflow timeline (10 stages, all DONE)
- Code changes panel with before/after diffs (6 files)
- Review findings with severity filter tabs
- Test results: 142→145 tests passing, 71.4%→85.6% coverage
- Release risk score: **94/100 LOW risk**
- Approval record showing explicit human decision
- **→ "Deploy Preparation" button**

### 6. Deployment Preparation → `/runs/run_01/deploy`
- Release gate: 8/8 checks passing (Build ✓, Tests ✓, Lint ✓, Security ✓, Dependencies ✓, Docs ✓, Config ✓, Changelog ✓)
- Deployment pipeline: 8 steps with clear `SIMULATED` / `REQUIRES_APPROVAL` labels
- Smoke tests: 12/12 passing across all critical endpoints
- Service health checks: 6/6 healthy (API, PostgreSQL, Redis, SendGrid, Stripe, CDN)
- Auto-generated CHANGELOG.md and release notes for v2.4.0

---

## Architecture

```
releasepilot/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── page.tsx                  # Dashboard
│   │   ├── layout.tsx                # Root layout + Sidebar
│   │   ├── loading.tsx               # Global loading UI
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── onboard/page.tsx          # Repository onboarding wizard
│   │   ├── demo/
│   │   │   ├── page.tsx              # Guided judge demo (7-step walkthrough)
│   │   │   └── compare/page.tsx      # Before/after metrics comparison
│   │   ├── repositories/
│   │   │   ├── page.tsx              # Repository list
│   │   │   └── [id]/page.tsx         # Repository detail + architecture map
│   │   ├── runs/
│   │   │   ├── page.tsx              # Agent runs list
│   │   │   ├── [id]/page.tsx         # Run detail (Phase 3 panels)
│   │   │   ├── [id]/deploy/page.tsx  # Deployment preparation (Phase 4)
│   │   │   └── new/
│   │   │       ├── page.tsx          # Suspense wrapper
│   │   │       └── NewRunPageInner.tsx  # 5-phase run wizard with approval
│   │   ├── settings/page.tsx         # Settings page
│   │   └── api/
│   │       ├── analysis/scan/        # POST — repository analysis
│   │       ├── demo/reset/           # POST/GET — safe demo state reset
│   │       └── runs/[id]/
│   │           ├── approve/          # GET/POST — approval workflow
│   │           └── deploy/           # GET/POST — deployment actions
│   │
│   ├── components/
│   │   ├── layout/                   # Sidebar, TopBar
│   │   ├── ui/                       # Badge, Button, Card, MetricCard, ProgressBar, StatusChip
│   │   ├── dashboard/                # GlobalMetrics, RepositoryHealthGrid, ActiveRunsPanel, RecentActivity
│   │   ├── repository/               # ArchitectureMap (SVG), OnboardingSummary
│   │   └── runs/
│   │       ├── RunDetailPanels.tsx   # WorkflowTimeline, FindingsPanel, TestResultsPanel, ReleaseReportPanel
│   │       └── Phase3Panels.tsx      # CodeChangesPanel, ReviewFindingsPanel, ReleaseRiskPanel, ApprovalStatusPanel
│   │
│   └── lib/
│       ├── types.ts                  # All TypeScript types (120+ interfaces/enums)
│       ├── mock-data.ts              # Phase 1+2 demo data
│       ├── phase3-data.ts            # Phase 3: logs, code changes, review findings, release risk
│       ├── phase4-data.ts            # Phase 4: gate checks, deploy steps, smoke tests, health checks
│       ├── approvalStore.ts          # In-memory approval state (no auto-approve)
│       ├── analysis/
│       │   └── repositoryAnalyzer.ts # Repository analysis engine + CVE detection
│       └── workflow/
│           └── stateMachine.ts       # WorkflowStateMachine + transition validation
│
├── tests/
│   └── unit.test.ts                  # 27 unit tests (WorkflowStateMachine + RepositoryAnalyzer)
│
├── tsconfig.json                     # Next.js TypeScript config
├── tsconfig.test.json                # Test-specific config (CommonJS + ts-node)
├── tailwind.config.ts                # Dark design tokens
└── .env.example                      # Environment variable template
```

---

## Technical Architecture Decisions

### Frontend
- **Next.js 14 (App Router)** — server components for fast initial load, client components for interactivity
- **TypeScript end-to-end** — strict mode, no `any` types
- **Tailwind CSS** — dark design system with CSS custom properties for the design token layer
- **No external UI library** — all components are custom to ensure visual consistency and hackathon credibility
- **No hydration mismatches** — `useSearchParams()` wrapped in Suspense boundary (Next.js 14 requirement)

### State Machine
`src/lib/workflow/stateMachine.ts` implements a proper state machine:
- Explicit allowed transitions per state (no silent invalid transitions)
- `transition()`, `fail()`, `cancel()` with full history recording
- `snapshot()` for serializable state export
- `canTransitionTo()`, `isTerminal()`, `isActive()` guards
- Tested: 14 unit tests covering happy path, invalid transitions, cancellation, failure

### Repository Analyzer
`src/lib/analysis/repositoryAnalyzer.ts` performs real analysis:
- Language detection from file extensions
- Framework detection from `package.json` dependencies
- CVE scanning: jsonwebtoken@<9.0.0, lodash@<4.17.21, axios@<1.0.0
- Health score calculation: 100 − (CRITICAL×15 + HIGH×8 + MEDIUM×4 + LOW×2), clamped to [0,100]
- Tested: 13 unit tests covering all detection logic

### Action Label System
Every agent action is labeled with one of:
| Label | Meaning |
|-------|---------|
| `ANALYZED` | Agent inspected this — no changes made |
| `PROPOSED` | Agent recommends this — not yet applied |
| `SIMULATED` | Validated in demo/staging — would run in real deployment |
| `EXECUTED` | Actually applied (reserved for future real-execution mode) |
| `BLOCKED` | Could not proceed due to a constraint |
| `REQUIRES_APPROVAL` | Paused for explicit human decision |

### Approval Gate
- No auto-approve anywhere in the codebase
- Approval modal requires explicit user action: **Approve** / **Request Changes** / **Reject**
- API: `POST /api/runs/[id]/approve` validates action, rejects already-resolved approvals (409)
- `GET /api/runs/[id]/approve` returns current status
- In-memory store in `src/lib/approvalStore.ts` (pre-seeded: `run_live` → PENDING)

---

## Seeded Issues in Demo Repository

The E-Commerce Platform demo contains six pre-loaded engineering issues:

| # | Issue | Severity | Category |
|---|-------|----------|---------|
| 1 | Password-reset JWT token not invalidated after use | CRITICAL | BUG |
| 2 | CVE-2022-23529: jsonwebtoken@8.5.1 vulnerable to JWT verification bypass | CRITICAL | SECURITY |
| 3 | `POST /api/auth/reset-password` — 4 failing tests | HIGH | TEST |
| 4 | Auth flow missing edge-case coverage (11 uncovered paths) | HIGH | COVERAGE |
| 5 | lodash@4.17.18 — prototype pollution vulnerability | HIGH | DEPENDENCY |
| 6 | API docs mismatch: `reset-password` endpoint undocumented | MEDIUM | DOCUMENTATION |

After the agent run:
- All 6 issues resolved
- 114 → 142 tests (+28 new tests)
- 71.2% → 87.3% coverage
- Release risk score: 94/100 (LOW)
- Auto-generated: CHANGELOG.md, release notes, deployment checklist, v2.4.0 semantic version

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

```bash
# Required for production (not needed for demo mode)
DATABASE_URL=postgresql://localhost:5432/releasepilot
JWT_SECRET=your-secret-here
NEXTAUTH_SECRET=your-auth-secret-here

# Optional
GITHUB_TOKEN=ghp_...           # For real repository analysis
OPENAI_API_KEY=sk-...          # For AI-powered suggestions (Phase 6+)
```

> **Note:** The demo works fully without any environment variables. All data is seeded.

---

## Testing

```bash
npm test
# Runs 27 unit tests with ts-node (no external framework)
# WorkflowStateMachine: 14 tests
# RepositoryAnalyzer: 13 tests
```

Tests use Node.js built-in `assert` with a lightweight inline runner. No Jest/Vitest dependency required.

---

## What's Simulated vs Real

| Feature | Status |
|---------|--------|
| Repository analysis engine | ✅ Real (analyzes file trees, detects CVEs) |
| State machine transitions | ✅ Real (validated, tested, serializable) |
| Demo repository data | ✅ Structured (reflects real engineering issues) |
| Agent logs | ✅ Structured demo data (action-labeled) |
| Code changes / diffs | ✅ Structured demo data (real-looking diffs) |
| Test results | ✅ Structured demo data |
| Release risk scoring | ✅ Real algorithm (weighted deductions) |
| Approval workflow | ✅ Real (explicit gates, no auto-approve) |
| Deployment steps | 🔵 Simulated (labeled SIMULATED — no real K8s/Docker) |
| Smoke tests | 🔵 Simulated (labeled SIMULATED) |
| Health checks | 🔵 Simulated (labeled SIMULATED) |
| GitHub API calls | ⬜ Not connected (demo only) |
| LLM code generation | ⬜ Not connected (Phase 6+) |
| Database persistence | ⬜ In-memory (no DB required to run) |

---

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Dashboard, UI design system, navigation, demo data |
| 2 | ✅ Complete | Repository onboarding wizard, architecture map, health report |
| 3 | ✅ Complete | State machine, analysis engine, run wizard, approval gates, 27 unit tests |
| 4 | ✅ Complete | Deployment preparation, gate checks, smoke tests, health checks, changelog |
| 5 | ✅ Complete | Loading/error/404 states, responsive polish, README |
| Demo | ✅ Complete | `/demo` guided walkthrough, `/demo/compare` before/after page, `DEMO_SCRIPT.md` |

---

## Development

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
npm test         # 27 unit tests
```

---

*Built for the IBM Bob Hackathon — ReleasePilot AI demonstrates autonomous software engineering from problem discovery to verified release readiness.*
