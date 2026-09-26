/**
 * ReleasePilot AI — Mock Data Layer
 * All seeded demo data. No real DB connection required for the Phase 1 MVP.
 */

import type {
  User,
  Repository,
  AgentRun,
  WorkflowStage,
  Finding,
  TestResult,
  ReleaseReport,
  ActivityItem,
  DashboardData,
  GlobalMetrics,
  ArchitectureMap,
} from './types';

// ─── Users ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'user_01',
  email: 'alex.chen@acme.dev',
  name: 'Alex Chen',
  avatarUrl: undefined,
  role: 'admin',
  createdAt: '2024-01-10T08:00:00Z',
};

// ─── Repositories ──────────────────────────────────────────────────────────

export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: 'repo_ecommerce',
    name: 'E-Commerce Platform',
    fullName: 'acme/ecommerce-platform',
    description: 'Full-stack e-commerce platform with React storefront, Express API, and PostgreSQL database. Handles product catalog, cart, checkout, and order management.',
    url: 'https://github.com/acme/ecommerce-platform',
    defaultBranch: 'main',
    languages: ['TypeScript', 'JavaScript'],
    techStack: ['React', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    isActive: true,
    healthScore: 67,
    ownerId: 'user_01',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-18T14:22:00Z',
    openFindings: 6,
  },
  {
    id: 'repo_payments',
    name: 'Payment Service',
    fullName: 'acme/payment-service',
    description: 'Microservice handling payment processing, refunds, and transaction reconciliation. Integrates with Stripe and PayPal.',
    url: 'https://github.com/acme/payment-service',
    defaultBranch: 'main',
    languages: ['TypeScript'],
    techStack: ['Node.js', 'Express', 'Stripe', 'PostgreSQL'],
    isActive: true,
    healthScore: 88,
    ownerId: 'user_01',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-17T11:30:00Z',
    openFindings: 1,
  },
  {
    id: 'repo_notifications',
    name: 'Notification Hub',
    fullName: 'acme/notification-hub',
    description: 'Centralized notification service supporting email, SMS, and push channels with template management and delivery tracking.',
    url: 'https://github.com/acme/notification-hub',
    defaultBranch: 'develop',
    languages: ['Python'],
    techStack: ['FastAPI', 'Celery', 'Redis', 'SendGrid'],
    isActive: true,
    healthScore: 74,
    ownerId: 'user_01',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-03-16T08:45:00Z',
    openFindings: 3,
  },
  {
    id: 'repo_analytics',
    name: 'Analytics Engine',
    fullName: 'acme/analytics-engine',
    description: 'Real-time analytics pipeline processing user events and generating business intelligence reports.',
    url: 'https://github.com/acme/analytics-engine',
    defaultBranch: 'main',
    languages: ['Go', 'TypeScript'],
    techStack: ['Go', 'Kafka', 'ClickHouse', 'React'],
    isActive: true,
    healthScore: 91,
    ownerId: 'user_01',
    createdAt: '2024-01-28T12:00:00Z',
    updatedAt: '2024-03-15T16:10:00Z',
    openFindings: 0,
  },
];

// ─── Workflow Stages for the Completed E-Commerce Run ──────────────────────

export const ECOMMERCE_STAGES: WorkflowStage[] = [
  {
    id: 'stage_01',
    stageIndex: 0,
    slug: 'repo-analysis',
    name: 'Repository Analysis',
    description: 'Clone and analyze codebase structure',
    status: 'DONE',
    startedAt: '2024-03-18T14:00:00Z',
    completedAt: '2024-03-18T14:00:47Z',
    durationMs: 47200,
    agentRunId: 'run_01',
    output: {
      filesScanned: 312,
      linesOfCode: 28540,
      languages: { TypeScript: '71%', JavaScript: '18%', CSS: '8%', Other: '3%' },
      frameworks: ['React 18', 'Express 4.x', 'Prisma', 'Jest', 'Docker'],
    },
  },
  {
    id: 'stage_02',
    stageIndex: 1,
    slug: 'issue-detection',
    name: 'Issue Detection',
    description: 'Identify bugs, vulnerabilities, and code smells',
    status: 'DONE',
    startedAt: '2024-03-18T14:00:47Z',
    completedAt: '2024-03-18T14:02:31Z',
    durationMs: 104000,
    agentRunId: 'run_01',
    output: {
      issuesFound: 6,
      bySeverity: { CRITICAL: 1, HIGH: 3, MEDIUM: 1, LOW: 1 },
    },
  },
  {
    id: 'stage_03',
    stageIndex: 2,
    slug: 'test-execution',
    name: 'Test Execution',
    description: 'Run existing test suite and collect results',
    status: 'DONE',
    startedAt: '2024-03-18T14:02:31Z',
    completedAt: '2024-03-18T14:04:18Z',
    durationMs: 107000,
    agentRunId: 'run_01',
    output: {
      totalTests: 145,
      passing: 142,
      failing: 3,
      skipped: 0,
      coverage: 71.4,
    },
  },
  {
    id: 'stage_04',
    stageIndex: 3,
    slug: 'coverage-analysis',
    name: 'Coverage Analysis',
    description: 'Analyze test coverage gaps and weak areas',
    status: 'DONE',
    startedAt: '2024-03-18T14:04:18Z',
    completedAt: '2024-03-18T14:05:02Z',
    durationMs: 44000,
    agentRunId: 'run_01',
    output: {
      overallCoverage: 71.4,
      uncoveredPaths: ['src/auth/password-reset.ts (lines 45-89)', 'src/cart/promo-codes.ts (lines 112-156)', 'src/checkout/edge-cases.ts (lines 23-67)'],
    },
  },
  {
    id: 'stage_05',
    stageIndex: 4,
    slug: 'dependency-audit',
    name: 'Dependency Audit',
    description: 'Check for outdated or vulnerable dependencies',
    status: 'DONE',
    startedAt: '2024-03-18T14:05:02Z',
    completedAt: '2024-03-18T14:05:39Z',
    durationMs: 37000,
    agentRunId: 'run_01',
    output: {
      totalDeps: 87,
      outdated: 12,
      vulnerable: 1,
      critical: ['jsonwebtoken@8.5.1 → CVE-2022-23529'],
    },
  },
  {
    id: 'stage_06',
    stageIndex: 5,
    slug: 'doc-validation',
    name: 'Documentation Validation',
    description: 'Validate docs match actual API contracts',
    status: 'DONE',
    startedAt: '2024-03-18T14:05:39Z',
    completedAt: '2024-03-18T14:06:24Z',
    durationMs: 45000,
    agentRunId: 'run_01',
    output: {
      docsScanned: 8,
      mismatches: 1,
      details: ['README describes /api/v1/auth/forgot-password but implementation uses /api/v1/auth/reset-password'],
    },
  },
  {
    id: 'stage_07',
    stageIndex: 6,
    slug: 'fix-generation',
    name: 'Fix Generation',
    description: 'Generate AI-powered fixes for detected issues',
    status: 'DONE',
    startedAt: '2024-03-18T14:06:24Z',
    completedAt: '2024-03-18T14:09:58Z',
    durationMs: 214000,
    agentRunId: 'run_01',
    output: {
      fixesGenerated: 5,
      fixesApplied: 5,
      filesModified: ['src/auth/password-reset.ts', 'package.json', 'docker-compose.yml', 'README.md'],
    },
  },
  {
    id: 'stage_08',
    stageIndex: 7,
    slug: 'test-writing',
    name: 'Test Writing',
    description: 'Generate missing tests to improve coverage',
    status: 'DONE',
    startedAt: '2024-03-18T14:09:58Z',
    completedAt: '2024-03-18T14:12:44Z',
    durationMs: 166000,
    agentRunId: 'run_01',
    output: {
      testsGenerated: 3,
      filesCreated: ['src/auth/__tests__/password-reset.test.ts'],
      coverageImprovement: '+14.2%',
    },
  },
  {
    id: 'stage_09',
    stageIndex: 8,
    slug: 'validation',
    name: 'Validation',
    description: 'Run full test suite to confirm all fixes work',
    status: 'DONE',
    startedAt: '2024-03-18T14:12:44Z',
    completedAt: '2024-03-18T14:14:52Z',
    durationMs: 128000,
    agentRunId: 'run_01',
    output: {
      totalTests: 145,
      passing: 145,
      failing: 0,
      coverage: 85.6,
      allFixesVerified: true,
    },
  },
  {
    id: 'stage_10',
    stageIndex: 9,
    slug: 'report-generation',
    name: 'Report Generation',
    description: 'Compile release report and recommendations',
    status: 'DONE',
    startedAt: '2024-03-18T14:14:52Z',
    completedAt: '2024-03-18T14:15:08Z',
    durationMs: 16000,
    agentRunId: 'run_01',
    output: {
      reportGenerated: true,
      healthScoreImprovement: '+27 points (67 → 94)',
      releaseReadiness: 94,
    },
  },
];

// ─── Agent Runs ────────────────────────────────────────────────────────────

export const MOCK_RUNS: AgentRun[] = [
  {
    id: 'run_01',
    status: 'COMPLETED',
    workflowState: 'COMPLETED',
    task: 'Prepare this project for release and resolve all issues necessary to make it production-ready.',
    triggeredBy: 'manual',
    branch: 'main',
    commitSha: 'a3f7c92b1e4d8f05c6a2b9e1d3f7a0c5b8e2d4f6',
    startedAt: '2024-03-18T14:00:00Z',
    completedAt: '2024-03-18T14:15:08Z',
    durationMs: 908000,
    summary: 'Fixed critical password-reset vulnerability, upgraded jsonwebtoken, repaired 3 failing tests, added 14.2% coverage, corrected documentation.',
    repositoryId: 'repo_ecommerce',
    createdAt: '2024-03-18T13:58:00Z',
    updatedAt: '2024-03-18T14:15:08Z',
    stages: ECOMMERCE_STAGES,
  },
  {
    id: 'run_02',
    status: 'COMPLETED',
    workflowState: 'COMPLETED',
    task: 'Audit payment service for security issues and update dependencies.',
    triggeredBy: 'scheduled',
    branch: 'main',
    commitSha: 'd2e8b4a7c1f3e9d5a0b6c2e8f4a1d7b3e5c9a2f8',
    startedAt: '2024-03-15T09:00:00Z',
    completedAt: '2024-03-15T09:12:45Z',
    durationMs: 765000,
    summary: 'Resolved 1 high-severity SQL injection vector in payment service, updated 3 outdated deps.',
    repositoryId: 'repo_payments',
    createdAt: '2024-03-15T08:58:00Z',
    updatedAt: '2024-03-15T09:12:45Z',
  },
  {
    id: 'run_03',
    status: 'RUNNING',
    workflowState: 'EXECUTING',
    task: 'Analyze notification service and report any issues.',
    triggeredBy: 'manual',
    branch: 'develop',
    startedAt: '2024-03-18T15:30:00Z',
    repositoryId: 'repo_notifications',
    createdAt: '2024-03-18T15:28:00Z',
    updatedAt: '2024-03-18T15:30:00Z',
  },
  {
    id: 'run_04',
    status: 'COMPLETED',
    workflowState: 'COMPLETED',
    task: 'Run a routine health check and flag any issues.',
    triggeredBy: 'webhook',
    branch: 'main',
    commitSha: 'f1a5e3c7b9d2f4a8c0e6b2d8f3a5c1e7b9d4f2a6',
    startedAt: '2024-03-14T16:20:00Z',
    completedAt: '2024-03-14T16:28:33Z',
    durationMs: 513000,
    summary: 'No critical issues. Minor: 2 outdated dev-dependencies flagged.',
    repositoryId: 'repo_analytics',
    createdAt: '2024-03-14T16:18:00Z',
    updatedAt: '2024-03-14T16:28:33Z',
  },
  {
    id: 'run_05',
    status: 'FAILED',
    workflowState: 'FAILED',
    task: 'Analyze feature/new-checkout branch for release readiness.',
    triggeredBy: 'manual',
    branch: 'feature/new-checkout',
    startedAt: '2024-03-13T11:00:00Z',
    completedAt: '2024-03-13T11:03:22Z',
    durationMs: 202000,
    summary: 'Analysis failed: unable to install dependencies. Branch has conflicting peer dependency versions.',
    repositoryId: 'repo_ecommerce',
    createdAt: '2024-03-13T10:58:00Z',
    updatedAt: '2024-03-13T11:03:22Z',
  },
];

// ─── Findings ──────────────────────────────────────────────────────────────

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'finding_01',
    title: 'Critical: Password Reset Token Not Invalidated After Use',
    description: 'The password reset flow in `src/auth/password-reset.ts` does not invalidate the reset token after successful use. An attacker who intercepts a reset token can use it multiple times to reset the victim\'s password and take over the account.',
    severity: 'CRITICAL',
    category: 'BUG',
    status: 'FIXED',
    filePath: 'src/auth/password-reset.ts',
    lineStart: 45,
    lineEnd: 89,
    suggestion: 'After a successful password reset, immediately delete or mark the token as used in the database. Add a `usedAt` timestamp column to the `password_reset_tokens` table.',
    fixApplied: true,
    fixDiff: `--- a/src/auth/password-reset.ts\n+++ b/src/auth/password-reset.ts\n@@ -67,6 +67,9 @@\n   if (!token || !user) throw new UnauthorizedError('Invalid token');\n+  if (token.usedAt) throw new UnauthorizedError('Token already used');\n   await updateUserPassword(user.id, hashedPassword);\n+  await markTokenAsUsed(token.id);\n   return { success: true };`,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:02:00Z',
  },
  {
    id: 'finding_02',
    title: 'Failing Tests: Cart Discount Calculation',
    description: '3 unit tests in `src/cart/__tests__/discount.test.ts` are failing due to a rounding error in the discount calculation function. The function uses floating-point arithmetic directly instead of integer-cent math, causing 0.001 cent discrepancies.',
    severity: 'HIGH',
    category: 'TEST',
    status: 'FIXED',
    filePath: 'src/cart/discount.ts',
    lineStart: 23,
    lineEnd: 41,
    suggestion: 'Convert all monetary values to integer cents before performing arithmetic, then convert back to dollars for display. Use `Math.round(amount * 100)` pattern throughout.',
    fixApplied: true,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:02:05Z',
  },
  {
    id: 'finding_03',
    title: 'Missing Edge-Case Coverage: Checkout Flow',
    description: 'The checkout flow has 0% test coverage for edge cases: concurrent checkout attempts, expired inventory locks, and payment gateway timeout handling. These paths are critical for data consistency under load.',
    severity: 'MEDIUM',
    category: 'COVERAGE',
    status: 'FIXED',
    filePath: 'src/checkout/edge-cases.ts',
    lineStart: 23,
    lineEnd: 67,
    suggestion: 'Add integration tests for: (1) two users trying to purchase the last item simultaneously, (2) inventory lock expiry during checkout, (3) payment timeout with idempotency key retry.',
    fixApplied: true,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:04:00Z',
  },
  {
    id: 'finding_04',
    title: 'Outdated Dependency: jsonwebtoken@8.5.1 (CVE-2022-23529)',
    description: 'The package `jsonwebtoken@8.5.1` has a known vulnerability (CVE-2022-23529) that allows attackers to bypass token verification when using the `algorithms` option. Current version is 8.5.1, latest secure version is 9.0.2.',
    severity: 'HIGH',
    category: 'DEPENDENCY',
    status: 'FIXED',
    filePath: 'package.json',
    suggestion: 'Upgrade to `jsonwebtoken@9.0.2` which patches this vulnerability. Also audit all JWT verification calls to ensure `algorithms` is explicitly set.',
    fixApplied: true,
    fixDiff: `--- a/package.json\n+++ b/package.json\n@@ -12,7 +12,7 @@\n-    "jsonwebtoken": "^8.5.1",\n+    "jsonwebtoken": "^9.0.2",`,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:05:10Z',
  },
  {
    id: 'finding_05',
    title: 'Documentation Mismatch: Password Reset API Endpoint',
    description: 'The README documents the password reset endpoint as `POST /api/v1/auth/forgot-password`, but the actual implementation uses `POST /api/v1/auth/reset-password`. This will cause integration failures for any client following the documentation.',
    severity: 'LOW',
    category: 'DOCUMENTATION',
    status: 'FIXED',
    filePath: 'README.md',
    lineStart: 142,
    lineEnd: 145,
    suggestion: 'Update README.md line 143 to reference the correct endpoint `/api/v1/auth/reset-password`. Consider adding an API contract test to catch future drift.',
    fixApplied: true,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:06:00Z',
  },
  {
    id: 'finding_06',
    title: 'Missing HEALTH_CHECK_PATH in docker-compose.yml',
    description: 'The `docker-compose.yml` healthcheck for the `api` service does not specify `HEALTH_CHECK_PATH`, defaulting to `/`. The actual health endpoint is `/api/v1/health`. This causes the container orchestrator to report the service as healthy even when the API is misconfigured.',
    severity: 'HIGH',
    category: 'CONFIGURATION',
    status: 'FIXED',
    filePath: 'docker-compose.yml',
    lineStart: 28,
    lineEnd: 34,
    suggestion: 'Add `HEALTH_CHECK_PATH: /api/v1/health` to the environment section and update the healthcheck `test` command to use `$$HEALTH_CHECK_PATH`.',
    fixApplied: true,
    fixDiff: `--- a/docker-compose.yml\n+++ b/docker-compose.yml\n@@ -28,6 +28,7 @@\n     environment:\n+      HEALTH_CHECK_PATH: /api/v1/health\n     healthcheck:\n-      test: ["CMD", "curl", "-f", "http://localhost:3000/"]\n+      test: ["CMD", "curl", "-f", "http://localhost:3000$$HEALTH_CHECK_PATH"]`,
    repositoryId: 'repo_ecommerce',
    agentRunId: 'run_01',
    createdAt: '2024-03-18T14:06:15Z',
  },
];

// ─── Test Results ──────────────────────────────────────────────────────────

export const MOCK_TEST_RESULTS: TestResult[] = [
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
    createdAt: '2024-03-18T14:14:52Z',
  },
];

// ─── Release Report ────────────────────────────────────────────────────────

export const MOCK_RELEASE_REPORT: ReleaseReport = {
  id: 'report_01',
  healthScoreBefore: 67,
  healthScoreAfter: 94,
  findingsFound: 6,
  findingsFixed: 6,
  testPassingBefore: 142,
  testFailingBefore: 3,
  testPassingAfter: 145,
  testFailingAfter: 0,
  coverageBefore: 71.4,
  coverageAfter: 85.6,
  releaseReadiness: 94,
  changelog: `## Changes in This Release

### 🔒 Security Fixes
- **[CRITICAL]** Fixed password reset token not being invalidated after use (CVE risk)
- **[HIGH]** Upgraded \`jsonwebtoken\` from 8.5.1 to 9.0.2 (CVE-2022-23529)

### 🐛 Bug Fixes  
- Fixed floating-point rounding error in cart discount calculation
- Corrected password reset API endpoint documentation (README)

### 🧪 Test Improvements
- Added 3 new tests for password reset flow
- Added edge-case integration tests for concurrent checkout
- Added inventory lock expiry and payment timeout test scenarios

### ⚙️ Configuration
- Added HEALTH_CHECK_PATH to docker-compose.yml API service healthcheck`,
  releaseNotes: `# Release Notes — E-Commerce Platform v2.4.1

This patch release resolves a critical security vulnerability in the authentication flow and improves system reliability.

**Security:** A critical bug where password reset tokens were not invalidated after use has been fixed. All users should update immediately.

**Stability:** Three failing cart discount tests are now passing after a fix to the monetary arithmetic implementation.

**Coverage:** Test coverage improved from 71.4% to 85.6% with 3 new targeted test files.`,
  recommendations: [
    'Consider implementing rate limiting on the /auth/reset-password endpoint to prevent brute-force attacks',
    'Review remaining 12 outdated dependencies (non-critical) in the next sprint',
    'Add contract testing between frontend and API to prevent future documentation drift',
    'Implement distributed locking for inventory management to handle high-concurrency checkout scenarios at scale',
    'Set up automated dependency scanning in CI/CD pipeline (e.g., Dependabot or Snyk)',
  ],
  agentRunId: 'run_01',
  createdAt: '2024-03-18T14:15:08Z',
};

// ─── Activity Feed ─────────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act_01',
    type: 'run_completed',
    title: 'Agent run completed successfully',
    description: 'E-Commerce Platform · Fixed 6 issues, improved health score 67→94',
    timestamp: '2024-03-18T14:15:08Z',
    repositoryName: 'acme/ecommerce-platform',
    runStatus: 'COMPLETED',
  },
  {
    id: 'act_02',
    type: 'finding_fixed',
    title: 'Critical vulnerability patched',
    description: 'Password reset token invalidation fix applied to ecommerce-platform',
    timestamp: '2024-03-18T14:09:58Z',
    repositoryName: 'acme/ecommerce-platform',
    severity: 'CRITICAL',
  },
  {
    id: 'act_03',
    type: 'run_started',
    title: 'Agent run started',
    description: 'Notification Hub · Branch: develop',
    timestamp: '2024-03-18T15:30:00Z',
    repositoryName: 'acme/notification-hub',
    runStatus: 'RUNNING',
  },
  {
    id: 'act_04',
    type: 'report_generated',
    title: 'Release report generated',
    description: 'E-Commerce Platform · Release readiness: 94/100',
    timestamp: '2024-03-18T14:15:08Z',
    repositoryName: 'acme/ecommerce-platform',
  },
  {
    id: 'act_05',
    type: 'run_completed',
    title: 'Agent run completed',
    description: 'Payment Service · Resolved 1 SQL injection vector',
    timestamp: '2024-03-15T09:12:45Z',
    repositoryName: 'acme/payment-service',
    runStatus: 'COMPLETED',
  },
  {
    id: 'act_06',
    type: 'run_failed',
    title: 'Agent run failed',
    description: 'E-Commerce Platform · feature/new-checkout — dependency conflict',
    timestamp: '2024-03-13T11:03:22Z',
    repositoryName: 'acme/ecommerce-platform',
    runStatus: 'FAILED',
  },
  {
    id: 'act_07',
    type: 'repo_connected',
    title: 'Repository connected',
    description: 'Analytics Engine added to ReleasePilot',
    timestamp: '2024-01-28T12:05:00Z',
    repositoryName: 'acme/analytics-engine',
  },
];

// ─── Global Metrics ────────────────────────────────────────────────────────

export const MOCK_GLOBAL_METRICS: GlobalMetrics = {
  totalRepositories: 4,
  activeRuns: 1,
  issuesFoundThisWeek: 7,
  issuesFixedThisWeek: 6,
  averageHealthScore: 80,
  testsPassingRate: 98.6,
  releaseReadinessAvg: 85,
};

// ─── Architecture Map ──────────────────────────────────────────────────────

export const ECOMMERCE_ARCHITECTURE: ArchitectureMap = {
  nodes: [
    { id: 'react',     label: 'React Frontend',   type: 'frontend',  technology: 'React 18',     x: 200, y: 60  },
    { id: 'gateway',   label: 'API Gateway',       type: 'gateway',   technology: 'Nginx',        x: 200, y: 160 },
    { id: 'express',   label: 'Express API',       type: 'service',   technology: 'Express 4.x',  x: 200, y: 270 },
    { id: 'auth',      label: 'Auth Service',      type: 'service',   technology: 'JWT + Bcrypt', x: 60,  y: 380 },
    { id: 'cart',      label: 'Cart Service',      type: 'service',   technology: 'Express',      x: 200, y: 380 },
    { id: 'checkout',  label: 'Checkout Service',  type: 'service',   technology: 'Express',      x: 340, y: 380 },
    { id: 'postgres',  label: 'PostgreSQL',        type: 'database',  technology: 'PostgreSQL 15',x: 120, y: 490 },
    { id: 'redis',     label: 'Redis Cache',       type: 'cache',     technology: 'Redis 7',      x: 280, y: 490 },
    { id: 'stripe',    label: 'Stripe',            type: 'external',  technology: 'Stripe API',   x: 380, y: 490 },
  ],
  edges: [
    { from: 'react',    to: 'gateway',  protocol: 'HTTPS' },
    { from: 'gateway',  to: 'express',  protocol: 'HTTP'  },
    { from: 'express',  to: 'auth',     protocol: 'internal' },
    { from: 'express',  to: 'cart',     protocol: 'internal' },
    { from: 'express',  to: 'checkout', protocol: 'internal' },
    { from: 'auth',     to: 'postgres', protocol: 'TCP' },
    { from: 'cart',     to: 'postgres', protocol: 'TCP' },
    { from: 'cart',     to: 'redis',    protocol: 'TCP' },
    { from: 'checkout', to: 'postgres', protocol: 'TCP' },
    { from: 'checkout', to: 'stripe',   protocol: 'HTTPS' },
  ],
};

// ─── Dashboard Data ────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_DATA: DashboardData = {
  metrics: MOCK_GLOBAL_METRICS,
  repositories: MOCK_REPOSITORIES,
  activeRuns: MOCK_RUNS.filter((r) => r.status === 'RUNNING'),
  recentActivity: MOCK_ACTIVITY,
};

// ─── Helper Accessors ──────────────────────────────────────────────────────

export function getRepositoryById(id: string): Repository | undefined {
  return MOCK_REPOSITORIES.find((r) => r.id === id);
}

export function getRunsByRepositoryId(repositoryId: string): AgentRun[] {
  return MOCK_RUNS.filter((r) => r.repositoryId === repositoryId);
}

export function getRunById(id: string): AgentRun | undefined {
  const run = MOCK_RUNS.find((r) => r.id === id);
  if (!run) return undefined;
  if (run.id === 'run_01') {
    return { ...run, stages: ECOMMERCE_STAGES, releaseReport: MOCK_RELEASE_REPORT };
  }
  return run;
}

export function getFindingsByRunId(runId: string): Finding[] {
  return MOCK_FINDINGS.filter((f) => f.agentRunId === runId);
}

export function getFindingsByRepositoryId(repositoryId: string): Finding[] {
  return MOCK_FINDINGS.filter((f) => f.repositoryId === repositoryId);
}

export function getTestResultsByRunId(runId: string): TestResult[] {
  return MOCK_TEST_RESULTS.filter((t) => t.agentRunId === runId);
}
