/**
 * ReleasePilot AI — Phase 3 Extended Mock Data
 * Structured evidence for the E-Commerce Platform demo run.
 * All actions are clearly labeled: ANALYZED | PROPOSED | SIMULATED
 */

import type {
  RepositoryScan,
  AgentLog,
  CodeChange,
  ReviewFinding,
  ReleaseRiskReport,
  ApprovalRequest,
  ScopeSummary,
  TaskPlan,
  TestResult,
  WorkflowState,
  AgentRun,
} from '@/lib/types';
import { repositoryAnalyzer, ECOMMERCE_PARSED } from './analysis/repositoryAnalyzer';

// ─── Repository Scan (from analysis engine) ──────────────────────────────────

export const ECOMMERCE_SCAN: RepositoryScan = (() => {
  const scan = repositoryAnalyzer.analyze(ECOMMERCE_PARSED, 'repo_ecommerce');
  // Override with deterministic IDs for the demo
  scan.id = 'scan_ecommerce_01';
  scan.scannedAt = '2024-03-18T13:45:00Z';
  scan.durationMs = 8240;
  scan.totalFiles = 45;
  scan.totalLines = 28540;
  scan.languages = { TypeScript: 71, JavaScript: 18, CSS: 8, Other: 3 };
  scan.healthScore = 67;
  // Add the deterministic seeded findings on top of the analyzed ones
  scan.healthFindings = scan.healthFindings.map((f, i) => ({
    ...f,
    id: `hf_demo_${i + 1}`,
  }));
  return scan;
})();

// ─── Scope Summary ───────────────────────────────────────────────────────────

export const ECOMMERCE_SCOPE: ScopeSummary = {
  task: 'Prepare this project for release and resolve all issues necessary to make it production-ready.',
  affectedFiles: [
    'src/auth/password-reset.ts',
    'src/cart/discount.ts',
    'src/checkout/edge-cases.ts',
    'package.json',
    'docker-compose.yml',
    'README.md',
    'docs/API.md',
  ],
  affectedModules: ['auth', 'cart', 'checkout', 'dependencies', 'documentation', 'configuration'],
  estimatedRisk: 'HIGH',
  expectedBehavior:
    'After this run: all tests pass, security vulnerability patched, coverage ≥ 80%, documentation matches implementation, Docker healthcheck correctly configured.',
  risks: [
    'CRITICAL: Password reset tokens are reusable — account takeover risk',
    'HIGH: jsonwebtoken@8.5.1 has CVE-2022-23529 — JWT verification bypass',
    'HIGH: 3 failing tests block CI pipeline',
    'MEDIUM: Test coverage at 71.4% — below 80% threshold',
    'MEDIUM: README documents wrong API endpoint',
    'LOW: Docker healthcheck target is incorrect path',
  ],
  requiredTests: [
    'src/auth/__tests__/password-reset.test.ts — regression for token invalidation',
    'src/cart/__tests__/discount.test.ts — floating-point arithmetic correctness',
    'src/checkout/__tests__/edge-cases.test.ts — concurrent checkout scenarios',
  ],
  proposedApproach:
    'Sequential analysis → targeted fix generation (pending approval) → new regression tests → full validation → release report.',
};

// ─── Task Plan ───────────────────────────────────────────────────────────────

export const ECOMMERCE_TASK_PLAN: TaskPlan = {
  totalStages: 10,
  estimatedDurationMin: 15,
  parallelWorkers: [
    'Architecture Analyst',
    'Debugger',
    'Test Engineer',
    'Security Reviewer',
    'Dependency Auditor',
    'Documentation Maintainer',
    'Release Manager',
  ],
  stages: [
    { index: 0, name: 'Repository Analysis',     worker: 'Architecture Analyst',   estimatedDurationSec: 47,  dependencies: [],      expectedOutputs: ['File tree', 'Language map', 'Architecture graph'], requiresApproval: false },
    { index: 1, name: 'Issue Detection',          worker: 'Debugger',               estimatedDurationSec: 104, dependencies: [0],     expectedOutputs: ['Finding list', 'Severity breakdown'],             requiresApproval: false },
    { index: 2, name: 'Test Execution',           worker: 'Test Engineer',          estimatedDurationSec: 107, dependencies: [0],     expectedOutputs: ['Test results (before)', 'Coverage baseline'],      requiresApproval: false },
    { index: 3, name: 'Coverage Analysis',        worker: 'Test Engineer',          estimatedDurationSec: 44,  dependencies: [2],     expectedOutputs: ['Coverage gaps', 'Critical uncovered paths'],       requiresApproval: false },
    { index: 4, name: 'Dependency Audit',         worker: 'Security Reviewer',      estimatedDurationSec: 37,  dependencies: [0],     expectedOutputs: ['CVE report', 'Outdated package list'],             requiresApproval: false },
    { index: 5, name: 'Documentation Review',     worker: 'Documentation Maintainer',estimatedDurationSec: 45, dependencies: [0],     expectedOutputs: ['API contract mismatches', 'Doc completeness'],    requiresApproval: false },
    { index: 6, name: 'Fix Generation',           worker: 'Debugger',               estimatedDurationSec: 214, dependencies: [1,3,4,5], expectedOutputs: ['Proposed diffs', 'Modified files'],             requiresApproval: true  },
    { index: 7, name: 'Test Writing',             worker: 'Test Engineer',          estimatedDurationSec: 166, dependencies: [6],     expectedOutputs: ['New test files', 'Coverage projection'],          requiresApproval: false },
    { index: 8, name: 'Validation',               worker: 'Test Engineer',          estimatedDurationSec: 128, dependencies: [7],     expectedOutputs: ['Test results (after)', 'Regression check'],       requiresApproval: false },
    { index: 9, name: 'Report Generation',        worker: 'Release Manager',        estimatedDurationSec: 16,  dependencies: [8],     expectedOutputs: ['Release risk score', 'Changelog', 'Report'],      requiresApproval: false },
  ],
};

// ─── Agent Logs ──────────────────────────────────────────────────────────────

export const ECOMMERCE_AGENT_LOGS: AgentLog[] = [
  // Understanding
  { id: 'log_001', runId: 'run_01', stageSlug: 'understand', stageName: 'Understanding',      timestamp: '14:00:00', level: 'INFO',    worker: 'Planner',             message: 'Task received — parsing intent and identifying scope', actionLabel: 'ANALYZED' },
  { id: 'log_002', runId: 'run_01', stageSlug: 'understand', stageName: 'Understanding',      timestamp: '14:00:01', level: 'INFO',    worker: 'Architecture Analyst', message: 'Affected modules identified: auth, cart, checkout, deps, docs', actionLabel: 'ANALYZED' },
  { id: 'log_003', runId: 'run_01', stageSlug: 'understand', stageName: 'Understanding',      timestamp: '14:00:02', level: 'WARN',    worker: 'Planner',             message: 'Risk level: HIGH — critical security vulnerability in scope', actionLabel: 'ANALYZED' },
  { id: 'log_004', runId: 'run_01', stageSlug: 'plan',       stageName: 'Planning',           timestamp: '14:00:03', level: 'INFO',    worker: 'Planner',             message: 'Dynamic plan generated: 10 stages, 7 workers, ~15 min', actionLabel: 'PROPOSED' },
  // Repo analysis
  { id: 'log_005', runId: 'run_01', stageSlug: 'repo-analysis', stageName: 'Repo Analysis',  timestamp: '14:00:05', level: 'INFO',    worker: 'Architecture Analyst', message: '[ANALYZED] Scanned 45 files, 28,540 lines of code', actionLabel: 'ANALYZED' },
  { id: 'log_006', runId: 'run_01', stageSlug: 'repo-analysis', stageName: 'Repo Analysis',  timestamp: '14:00:18', level: 'INFO',    worker: 'Architecture Analyst', message: '[ANALYZED] Languages: TypeScript 71%, JavaScript 18%, CSS 8%', actionLabel: 'ANALYZED' },
  { id: 'log_007', runId: 'run_01', stageSlug: 'repo-analysis', stageName: 'Repo Analysis',  timestamp: '14:00:31', level: 'SUCCESS', worker: 'Architecture Analyst', message: '[ANALYZED] Architecture mapped: 5 components, 6 connections', actionLabel: 'ANALYZED', evidence: { type: 'metric', title: 'Architecture Graph', detail: '5 nodes: Frontend, Backend API, Auth Service, PostgreSQL, Redis' } as never },
  // Issue detection
  { id: 'log_008', runId: 'run_01', stageSlug: 'issue-detection', stageName: 'Issue Detection', timestamp: '14:00:48', level: 'INFO', worker: 'Debugger', message: '[ANALYZED] Running static analysis across 45 source files', actionLabel: 'ANALYZED' },
  { id: 'log_009', runId: 'run_01', stageSlug: 'issue-detection', stageName: 'Issue Detection', timestamp: '14:01:02', level: 'ERROR', worker: 'Debugger', message: '[ANALYZED] CRITICAL: src/auth/password-reset.ts:67 — reset token not invalidated after use', actionLabel: 'ANALYZED', evidence: { type: 'file', filePath: 'src/auth/password-reset.ts', lineStart: 67, lineEnd: 72 } as never },
  { id: 'log_010', runId: 'run_01', stageSlug: 'issue-detection', stageName: 'Issue Detection', timestamp: '14:01:15', level: 'WARN',  worker: 'Debugger', message: '[ANALYZED] HIGH: src/cart/discount.ts:23-41 — floating-point rounding error causes 0.001¢ discrepancies', actionLabel: 'ANALYZED' },
  { id: 'log_011', runId: 'run_01', stageSlug: 'issue-detection', stageName: 'Issue Detection', timestamp: '14:01:28', level: 'WARN',  worker: 'Debugger', message: '[ANALYZED] HIGH: docker-compose.yml:28 — healthcheck uses "/" not "/api/v1/health"', actionLabel: 'ANALYZED' },
  { id: 'log_012', runId: 'run_01', stageSlug: 'issue-detection', stageName: 'Issue Detection', timestamp: '14:02:05', level: 'WARN',  worker: 'Debugger', message: '[ANALYZED] 6 issues detected across 5 files: 1 CRITICAL, 3 HIGH, 1 MEDIUM, 1 LOW', actionLabel: 'ANALYZED' },
  // Test execution
  { id: 'log_013', runId: 'run_01', stageSlug: 'test-execution', stageName: 'Test Execution',   timestamp: '14:02:32', level: 'INFO',  worker: 'Test Engineer', message: '[SIMULATED] npm test (Jest) — recording baseline', actionLabel: 'SIMULATED' },
  { id: 'log_014', runId: 'run_01', stageSlug: 'test-execution', stageName: 'Test Execution',   timestamp: '14:03:00', level: 'ERROR', worker: 'Test Engineer', message: '[SIMULATED] FAIL src/cart/__tests__/discount.test.ts (3 failures)', actionLabel: 'SIMULATED', evidence: { type: 'test', title: 'Failing tests', detail: 'Expected 90.00, received 89.99 — float precision error' } as never },
  { id: 'log_015', runId: 'run_01', stageSlug: 'test-execution', stageName: 'Test Execution',   timestamp: '14:04:18', level: 'WARN',  worker: 'Test Engineer', message: '[SIMULATED] Coverage: 71.4% — below 80% threshold. 14 files uncovered', actionLabel: 'SIMULATED' },
  // Coverage analysis
  { id: 'log_016', runId: 'run_01', stageSlug: 'coverage-analysis', stageName: 'Coverage',      timestamp: '14:04:34', level: 'WARN',  worker: 'Test Engineer', message: '[ANALYZED] Critical gap: src/auth/password-reset.ts lines 45-89 — 0% coverage on token invalidation path', actionLabel: 'ANALYZED' },
  { id: 'log_017', runId: 'run_01', stageSlug: 'coverage-analysis', stageName: 'Coverage',      timestamp: '14:04:48', level: 'WARN',  worker: 'Test Engineer', message: '[ANALYZED] Gap: src/cart/promo-codes.ts lines 112-156 — no edge-case tests for concurrent access', actionLabel: 'ANALYZED' },
  // Dependency audit
  { id: 'log_018', runId: 'run_01', stageSlug: 'dependency-audit', stageName: 'Dep Audit',      timestamp: '14:05:14', level: 'ERROR', worker: 'Security Reviewer', message: '[ANALYZED] CRITICAL: jsonwebtoken@8.5.1 — CVE-2022-23529 (CVSS 7.6) — token verification bypass possible', actionLabel: 'ANALYZED', evidence: { type: 'file', filePath: 'package.json' } as never },
  { id: 'log_019', runId: 'run_01', stageSlug: 'dependency-audit', stageName: 'Dep Audit',      timestamp: '14:05:27', level: 'WARN',  worker: 'Security Reviewer', message: '[ANALYZED] 12 non-critical packages have updates available', actionLabel: 'ANALYZED' },
  // Doc validation
  { id: 'log_020', runId: 'run_01', stageSlug: 'doc-validation', stageName: 'Doc Validation',   timestamp: '14:06:02', level: 'WARN',  worker: 'Documentation Maintainer', message: '[ANALYZED] MISMATCH: README.md:143 documents POST /api/v1/auth/forgot-password, implementation uses /reset-password', actionLabel: 'ANALYZED' },
  // Approval gate
  { id: 'log_021', runId: 'run_01', stageSlug: 'approval', stageName: 'Approval Gate',          timestamp: '14:06:24', level: 'WARN',  worker: 'Planner', message: '[REQUIRES_APPROVAL] Paused — 5 file writes require human approval before execution', actionLabel: 'REQUIRES_APPROVAL' },
  // Fix generation (after approval)
  { id: 'log_022', runId: 'run_01', stageSlug: 'fix-generation', stageName: 'Fix Generation',   timestamp: '14:06:48', level: 'INFO',  worker: 'Debugger', message: '[PROPOSED] src/auth/password-reset.ts — add token.usedAt check + markTokenAsUsed() call', actionLabel: 'PROPOSED', evidence: { type: 'diff', filePath: 'src/auth/password-reset.ts', before: '  if (!token || !user) throw new UnauthorizedError();', after: '  if (!token || !user) throw new UnauthorizedError();\n  if (token.usedAt) throw new UnauthorizedError("Token already used");\n  await markTokenAsUsed(token.id);' } as never },
  { id: 'log_023', runId: 'run_01', stageSlug: 'fix-generation', stageName: 'Fix Generation',   timestamp: '14:07:10', level: 'INFO',  worker: 'Debugger', message: '[PROPOSED] src/cart/discount.ts — replace float arithmetic with integer-cent math', actionLabel: 'PROPOSED' },
  { id: 'log_024', runId: 'run_01', stageSlug: 'fix-generation', stageName: 'Fix Generation',   timestamp: '14:07:30', level: 'INFO',  worker: 'Security Reviewer', message: '[PROPOSED] package.json — upgrade jsonwebtoken 8.5.1 → 9.0.2', actionLabel: 'PROPOSED' },
  { id: 'log_025', runId: 'run_01', stageSlug: 'fix-generation', stageName: 'Fix Generation',   timestamp: '14:09:58', level: 'SUCCESS', worker: 'Debugger', message: '[SIMULATED] 5 fixes proposed and staged — pending validation', actionLabel: 'SIMULATED' },
  // Test writing
  { id: 'log_026', runId: 'run_01', stageSlug: 'test-writing', stageName: 'Test Writing',       timestamp: '14:10:30', level: 'SUCCESS', worker: 'Test Engineer', message: '[PROPOSED] src/auth/__tests__/password-reset.test.ts — 3 regression tests for token invalidation', actionLabel: 'PROPOSED' },
  { id: 'log_027', runId: 'run_01', stageSlug: 'test-writing', stageName: 'Test Writing',       timestamp: '14:12:44', level: 'SUCCESS', worker: 'Test Engineer', message: '[PROPOSED] 5 total new tests — projected coverage: +14.2% → 85.6%', actionLabel: 'PROPOSED' },
  // Validation
  { id: 'log_028', runId: 'run_01', stageSlug: 'validation', stageName: 'Validation',           timestamp: '14:13:10', level: 'SUCCESS', worker: 'Test Engineer', message: '[SIMULATED] PASS: 145/145 tests passing with all fixes applied', actionLabel: 'SIMULATED' },
  { id: 'log_029', runId: 'run_01', stageSlug: 'validation', stageName: 'Validation',           timestamp: '14:14:52', level: 'SUCCESS', worker: 'Test Engineer', message: '[SIMULATED] Coverage: 85.6% — threshold met. Zero regressions.', actionLabel: 'SIMULATED' },
  // Report
  { id: 'log_030', runId: 'run_01', stageSlug: 'report-generation', stageName: 'Report',        timestamp: '14:15:08', level: 'SUCCESS', worker: 'Release Manager', message: '[ANALYZED] Release readiness: 94/100 — health score: 67 → 94 (+27 points)', actionLabel: 'ANALYZED' },
];

// ─── Code Changes ─────────────────────────────────────────────────────────────

export const ECOMMERCE_CODE_CHANGES: CodeChange[] = [
  {
    id: 'cc_01',
    runId: 'run_01',
    filePath: 'src/auth/password-reset.ts',
    changeType: 'MODIFIED',
    description: 'Add token invalidation after successful password reset — prevents replay attacks',
    actionLabel: 'PROPOSED',
    diffBefore:
`  // Verify token
  const token = await findResetToken(resetToken);
  if (!token || !user) throw new UnauthorizedError('Invalid token');

  // Update password
  await updateUserPassword(user.id, hashedPassword);
  return { success: true };`,
    diffAfter:
`  // Verify token
  const token = await findResetToken(resetToken);
  if (!token || !user) throw new UnauthorizedError('Invalid token');
  if (token.usedAt) throw new UnauthorizedError('Token already used');

  // Update password  
  await updateUserPassword(user.id, hashedPassword);
  await markTokenAsUsed(token.id);
  return { success: true };`,
    linesAdded: 2,
    linesRemoved: 0,
    relatedFindingId: 'rf_01',
    approvalRequired: true,
  },
  {
    id: 'cc_02',
    runId: 'run_01',
    filePath: 'src/cart/discount.ts',
    changeType: 'MODIFIED',
    description: 'Replace floating-point arithmetic with integer-cent math to fix rounding errors',
    actionLabel: 'PROPOSED',
    diffBefore:
`export function applyDiscount(price: number, pct: number): number {
  return price - (price * pct / 100);
}`,
    diffAfter:
`export function applyDiscount(price: number, pct: number): number {
  const cents = Math.round(price * 100);
  const discountCents = Math.round(cents * pct / 100);
  return (cents - discountCents) / 100;
}`,
    linesAdded: 3,
    linesRemoved: 1,
    relatedFindingId: 'rf_02',
    approvalRequired: true,
  },
  {
    id: 'cc_03',
    runId: 'run_01',
    filePath: 'package.json',
    changeType: 'MODIFIED',
    description: 'Upgrade jsonwebtoken 8.5.1 → 9.0.2 — patches CVE-2022-23529',
    actionLabel: 'PROPOSED',
    diffBefore: `    "jsonwebtoken": "^8.5.1",`,
    diffAfter:  `    "jsonwebtoken": "^9.0.2",`,
    linesAdded: 1,
    linesRemoved: 1,
    relatedFindingId: 'rf_04',
    approvalRequired: true,
  },
  {
    id: 'cc_04',
    runId: 'run_01',
    filePath: 'docker-compose.yml',
    changeType: 'MODIFIED',
    description: 'Fix API service healthcheck — was targeting "/" instead of "/api/v1/health"',
    actionLabel: 'PROPOSED',
    diffBefore:
`    environment:
      NODE_ENV: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]`,
    diffAfter:
`    environment:
      NODE_ENV: production
      HEALTH_CHECK_PATH: /api/v1/health
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000$$HEALTH_CHECK_PATH"]`,
    linesAdded: 2,
    linesRemoved: 1,
    relatedFindingId: 'rf_06',
    approvalRequired: true,
  },
  {
    id: 'cc_05',
    runId: 'run_01',
    filePath: 'README.md',
    changeType: 'MODIFIED',
    description: 'Correct password reset endpoint documentation — was /forgot-password, should be /reset-password',
    actionLabel: 'PROPOSED',
    diffBefore: `POST /api/v1/auth/forgot-password`,
    diffAfter:  `POST /api/v1/auth/reset-password`,
    linesAdded: 1,
    linesRemoved: 1,
    relatedFindingId: 'rf_05',
    approvalRequired: false, // doc change, safe
  },
  {
    id: 'cc_06',
    runId: 'run_01',
    filePath: 'src/auth/__tests__/password-reset.test.ts',
    changeType: 'CREATED',
    description: 'New regression tests for password reset token invalidation (3 tests)',
    actionLabel: 'PROPOSED',
    diffBefore: undefined,
    diffAfter:
`describe('Password Reset Token Invalidation', () => {
  it('should invalidate token after successful reset', async () => {
    const token = await createResetToken(user.id);
    await resetPassword(token.value, 'newPassword123!');
    const reused = await resetPassword(token.value, 'anotherPassword!');
    expect(reused.status).toBe(401);
  });

  it('should reject already-used tokens', async () => {
    const token = await createResetToken(user.id);
    await markTokenAsUsed(token.id);
    await expect(resetPassword(token.value, 'newPwd!')).rejects.toThrow('Token already used');
  });

  it('should expire tokens after 24h', async () => {
    const token = await createResetToken(user.id, { expiresInHours: -1 });
    await expect(resetPassword(token.value, 'newPwd!')).rejects.toThrow('Token expired');
  });
});`,
    linesAdded: 19,
    linesRemoved: 0,
    approvalRequired: false,
  },
];

// ─── Review Findings ──────────────────────────────────────────────────────────

export const ECOMMERCE_REVIEW_FINDINGS: ReviewFinding[] = [
  {
    id: 'rf_01',
    runId: 'run_01',
    severity: 'CRITICAL',
    category: 'SECURITY',
    title: 'Password Reset Token Not Invalidated After Use',
    description: 'The password reset flow in `src/auth/password-reset.ts` does not invalidate the reset token after successful use. An attacker who intercepts a reset token can use it multiple times to take over the account.',
    filePath: 'src/auth/password-reset.ts',
    lineStart: 45,
    lineEnd: 89,
    suggestion: 'After a successful password reset, immediately mark the token as used. Add a `usedAt` timestamp column to the `password_reset_tokens` table and check it before processing.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
    fixDiff: `@@ -67,6 +67,9 @@\n   if (!token || !user) throw new UnauthorizedError('Invalid token');\n+  if (token.usedAt) throw new UnauthorizedError('Token already used');\n   await updateUserPassword(user.id, hashedPassword);\n+  await markTokenAsUsed(token.id);\n   return { success: true };`,
  },
  {
    id: 'rf_02',
    runId: 'run_01',
    severity: 'HIGH',
    category: 'BUG',
    title: 'Floating-Point Arithmetic in Discount Calculation',
    description: '3 unit tests fail due to a rounding error in `discount.ts`. The function uses floating-point arithmetic directly instead of integer-cent math, producing 0.001¢ discrepancies that fail strict equality checks.',
    filePath: 'src/cart/discount.ts',
    lineStart: 23,
    lineEnd: 41,
    suggestion: 'Convert all monetary values to integer cents before performing arithmetic. Use `Math.round(amount * 100)` pattern throughout.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
  },
  {
    id: 'rf_03',
    runId: 'run_01',
    severity: 'MEDIUM',
    category: 'COVERAGE',
    title: 'Checkout Flow Has 0% Coverage for Edge Cases',
    description: 'Critical checkout paths — concurrent purchases, inventory lock expiry, and payment gateway timeouts — have zero test coverage.',
    filePath: 'src/checkout/edge-cases.ts',
    lineStart: 23,
    lineEnd: 67,
    suggestion: 'Add integration tests for: concurrent last-item purchase, expired inventory lock during checkout, payment timeout with idempotency key retry.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
  },
  {
    id: 'rf_04',
    runId: 'run_01',
    severity: 'HIGH',
    category: 'SECURITY',
    title: 'jsonwebtoken@8.5.1 — CVE-2022-23529 (CVSS 7.6)',
    description: 'The package `jsonwebtoken@8.5.1` has a known vulnerability allowing attackers to bypass token verification when using the `algorithms` option.',
    filePath: 'package.json',
    suggestion: 'Upgrade to `jsonwebtoken@9.0.2`. Audit all JWT verification calls to ensure `algorithms` is explicitly specified.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
    fixDiff: `--- a/package.json\n+++ b/package.json\n-    "jsonwebtoken": "^8.5.1",\n+    "jsonwebtoken": "^9.0.2",`,
  },
  {
    id: 'rf_05',
    runId: 'run_01',
    severity: 'LOW',
    category: 'DOCUMENTATION',
    title: 'README Documents Wrong API Endpoint',
    description: 'README.md line 143 documents the password reset endpoint as `POST /api/v1/auth/forgot-password`. The actual implementation uses `POST /api/v1/auth/reset-password`.',
    filePath: 'README.md',
    lineStart: 143,
    lineEnd: 145,
    suggestion: 'Update README.md to reference the correct endpoint. Consider adding an API contract test to catch future drift.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
  },
  {
    id: 'rf_06',
    runId: 'run_01',
    severity: 'HIGH',
    category: 'CONFIGURATION',
    title: 'Docker Healthcheck Targets Wrong Path',
    description: 'The docker-compose.yml healthcheck for the `api` service targets `/`, not `/api/v1/health`. The service will appear healthy to orchestrators even when the API is misconfigured.',
    filePath: 'docker-compose.yml',
    lineStart: 28,
    lineEnd: 34,
    suggestion: 'Add `HEALTH_CHECK_PATH: /api/v1/health` to the environment section and reference it in the healthcheck command.',
    status: 'FIXED',
    actionLabel: 'ANALYZED',
    fixApplied: true,
    fixDiff: `--- a/docker-compose.yml\n+++ b/docker-compose.yml\n+      HEALTH_CHECK_PATH: /api/v1/health\n-      test: ["CMD", "curl", "-f", "http://localhost:3000/"]\n+      test: ["CMD", "curl", "-f", "http://localhost:3000$$HEALTH_CHECK_PATH"]`,
  },
];

// ─── Release Risk Report ──────────────────────────────────────────────────────

export const ECOMMERCE_RELEASE_RISK: ReleaseRiskReport = {
  id: 'rrr_01',
  runId: 'run_01',
  overallScore: 94,
  riskLevel: 'LOW',
  contributors: [
    { name: 'Security Vulnerabilities',   impact: 'POSITIVE', weight: 25, detail: 'Critical CVE patched, token invalidation fixed' },
    { name: 'Test Pass Rate',             impact: 'POSITIVE', weight: 20, detail: '145/145 tests passing (was 142/145)' },
    { name: 'Test Coverage',              impact: 'POSITIVE', weight: 15, detail: 'Coverage 71.4% → 85.6% (above 80% threshold)' },
    { name: 'Code Review Findings',       impact: 'POSITIVE', weight: 15, detail: 'All 6 findings resolved' },
    { name: 'Dependency Health',          impact: 'POSITIVE', weight: 10, detail: 'Critical CVE patched; 12 non-critical updates remain' },
    { name: 'Documentation Accuracy',     impact: 'POSITIVE', weight: 8,  detail: 'API endpoint mismatch corrected' },
    { name: 'Configuration',             impact: 'POSITIVE', weight: 5,  detail: 'Docker healthcheck now correctly configured' },
    { name: 'Remaining Outdated Deps',    impact: 'NEGATIVE', weight: -4, detail: '12 non-critical packages have available updates' },
    { name: 'No AGENTS.md',              impact: 'NEGATIVE', weight: -2, detail: 'Repository has no AI agent instructions file' },
  ],
  blockers: [],
  warnings: [
    '12 non-critical dependencies have available updates — review in next sprint',
    'No rate limiting on /auth/reset-password endpoint — consider adding before high-traffic launch',
  ],
  recommendations: [
    'Add rate limiting to /auth/reset-password (max 5 req/hour per IP)',
    'Review remaining 12 outdated non-critical dependencies',
    'Add contract tests between frontend and API to prevent future documentation drift',
    'Implement distributed locking for inventory management for high-concurrency scenarios',
    'Set up automated dependency scanning in CI/CD (Dependabot or Snyk)',
  ],
  createdAt: '2024-03-18T14:15:08Z',
};

// ─── Approval Request ─────────────────────────────────────────────────────────

export const ECOMMERCE_APPROVAL_REQUEST: ApprovalRequest = {
  id: 'apr_01',
  runId: 'run_01',
  status: 'APPROVED',
  reason: 'Destructive file writes requiring human sign-off',
  description:
    'ReleasePilot has completed analysis and has proposed fixes for all 6 detected issues. Before applying any changes, explicit human approval is required. Review the proposed diffs carefully — once approved, fixes will be staged as Git commits on branch `fix/releasepilot-run-01`.',
  filesAffected: [
    'src/auth/password-reset.ts',
    'src/cart/discount.ts',
    'package.json',
    'docker-compose.yml',
    'README.md',
  ],
  potentialImpact:
    'Auth flow changes affect all password reset users. Discount calculation change affects cart pricing. jsonwebtoken upgrade may require token re-signing configuration review.',
  rollbackGuidance:
    'All changes are staged as a single Git commit. To rollback: `git revert HEAD` on the fix branch, or delete the `fix/releasepilot-run-01` branch entirely.',
  requestedAt: '2024-03-18T14:06:24Z',
  resolvedAt:  '2024-03-18T14:06:48Z',
  resolvedBy:  'Alex Chen',
  comment:     'Approved — reviewed diffs, all look correct. Proceed.',
};

// ─── Phase 3 Agent Run (augmented run_01) ────────────────────────────────────

export const PHASE3_RUN_01: AgentRun = {
  id: 'run_01',
  status: 'COMPLETED',
  workflowState: 'COMPLETED',
  triggeredBy: 'manual',
  branch: 'main',
  commitSha: 'a3f7c92b1e4d8f05c6a2b9e1d3f7a0c5b8e2d4f6',
  task: 'Prepare this project for release and resolve all issues necessary to make it production-ready.',
  startedAt: '2024-03-18T14:00:00Z',
  completedAt: '2024-03-18T14:15:08Z',
  durationMs: 908000,
  summary: 'Fixed critical password-reset vulnerability, patched CVE-2022-23529, repaired 3 failing tests, added +14.2% coverage, corrected documentation, fixed Docker healthcheck.',
  repositoryId: 'repo_ecommerce',
  createdAt: '2024-03-18T13:58:00Z',
  updatedAt: '2024-03-18T14:15:08Z',
  scopeSummary: ECOMMERCE_SCOPE,
  taskPlan: ECOMMERCE_TASK_PLAN,
  logs: ECOMMERCE_AGENT_LOGS,
  codeChanges: ECOMMERCE_CODE_CHANGES,
  reviewFindings: ECOMMERCE_REVIEW_FINDINGS,
  releaseRiskReport: ECOMMERCE_RELEASE_RISK,
  approvalRequest: ECOMMERCE_APPROVAL_REQUEST,
};

// ─── Test results for Phase 3 run ────────────────────────────────────────────

export const PHASE3_TEST_RESULTS: TestResult[] = [
  {
    id: 'tr_before',
    suiteName: 'Full Test Suite (Before)',
    totalTests: 145,
    passing: 142,
    failing: 3,
    skipped: 0,
    coverage: 71.4,
    durationMs: 107000,
    snapshot: true,
    agentRunId: 'run_01',
    failedTests: [
      { name: 'discount calculation › should apply 10% coupon correctly', file: 'src/cart/__tests__/discount.test.ts', errorMessage: 'Expected 90.00, received 89.999999999', expected: '90.00', received: '89.999999999' },
      { name: 'discount calculation › should apply 25% coupon correctly', file: 'src/cart/__tests__/discount.test.ts', errorMessage: 'Expected 75.00, received 74.999999997', expected: '75.00', received: '74.999999997' },
      { name: 'discount calculation › should stack promotions in correct order', file: 'src/cart/__tests__/discount.test.ts', errorMessage: 'Expected 63.75, received 63.7499999', expected: '63.75', received: '63.7499999' },
    ],
    createdAt: '2024-03-18T14:04:18Z',
  },
  {
    id: 'tr_after',
    suiteName: 'Full Test Suite (After)',
    totalTests: 145,
    passing: 145,
    failing: 0,
    skipped: 0,
    coverage: 85.6,
    durationMs: 128000,
    snapshot: false,
    agentRunId: 'run_01',
    failedTests: [],
    createdAt: '2024-03-18T14:14:52Z',
  },
];

// ─── Helper accessors ─────────────────────────────────────────────────────────

export function getPhase3RunById(id: string): AgentRun | undefined {
  if (id === 'run_01') return PHASE3_RUN_01;
  return undefined;
}

export function getReviewFindingsByRunId(runId: string): ReviewFinding[] {
  if (runId === 'run_01') return ECOMMERCE_REVIEW_FINDINGS;
  return [];
}

export function getCodeChangesByRunId(runId: string): CodeChange[] {
  if (runId === 'run_01') return ECOMMERCE_CODE_CHANGES;
  return [];
}

export function getAgentLogsByRunId(runId: string): AgentLog[] {
  if (runId === 'run_01') return ECOMMERCE_AGENT_LOGS;
  return [];
}

export function getPhase3TestResultsByRunId(runId: string): TestResult[] {
  if (runId === 'run_01') return PHASE3_TEST_RESULTS;
  return [];
}

export function getReleaseRiskByRunId(runId: string): ReleaseRiskReport | undefined {
  if (runId === 'run_01') return ECOMMERCE_RELEASE_RISK;
  return undefined;
}

export function getApprovalRequestByRunId(runId: string): ApprovalRequest | undefined {
  if (runId === 'run_01') return ECOMMERCE_APPROVAL_REQUEST;
  return undefined;
}
