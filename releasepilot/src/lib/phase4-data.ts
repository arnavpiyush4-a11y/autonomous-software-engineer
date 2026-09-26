/**
 * Phase 4 Demo Data — Deployment Preparation for E-Commerce Platform
 *
 * Covers: release gate checks, deployment steps, smoke tests, health checks,
 * changelog, release notes, and the final deployment report for run_01.
 *
 * Action labels are explicit: COMPLETED | SIMULATED | BLOCKED | REQUIRES_APPROVAL
 */

import type {
  DeploymentReport,
  ReleaseGateCheck,
  DeploymentStep,
  SmokeTest,
  HealthCheck,
} from './types';

// ─── Release Gate Checks ─────────────────────────────────────────────────────

export const ECOMMERCE_GATE_CHECKS: ReleaseGateCheck[] = [
  {
    id: 'gate_01',
    category: 'BUILD',
    name: 'Production Build',
    status: 'PASS',
    detail: 'next build completed in 34.2s — 0 errors, 0 warnings',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_02',
    category: 'TEST',
    name: 'Test Suite',
    status: 'PASS',
    detail: '142 tests passing, 0 failing — coverage 87.3% (↑ from 71.2%)',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_03',
    category: 'LINT',
    name: 'Lint & Type Check',
    status: 'PASS',
    detail: 'ESLint: 0 errors, 0 warnings. TypeScript: 0 errors. Prettier: formatted.',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_04',
    category: 'SECURITY',
    name: 'Secrets & Config Scan',
    status: 'PASS',
    detail: 'No secrets in source. .env.example present. JWT_SECRET and DATABASE_URL validated.',
    actionLabel: 'ANALYZED',
  },
  {
    id: 'gate_05',
    category: 'DEPENDENCIES',
    name: 'Dependency Audit',
    status: 'PASS',
    detail: 'jsonwebtoken upgraded 8.5.1 → 9.2.1 (CVE-2022-23529 resolved). lodash@4.17.21 patched.',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_06',
    category: 'DOCS',
    name: 'Documentation Validation',
    status: 'PASS',
    detail: 'README updated. API docs match implementation. CHANGELOG generated.',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_07',
    category: 'CONFIG',
    name: 'Deployment Configuration',
    status: 'PASS',
    detail: 'Dockerfile validated. docker-compose.yml health checks added. PORT env var set.',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'gate_08',
    category: 'CHANGELOG',
    name: 'Changelog & Release Notes',
    status: 'PASS',
    detail: 'CHANGELOG.md generated. Release notes drafted. Semantic version: v2.4.0.',
    actionLabel: 'PROPOSED',
  },
];

// ─── Deployment Steps ────────────────────────────────────────────────────────

export const ECOMMERCE_DEPLOY_STEPS: DeploymentStep[] = [
  {
    id: 'step_01',
    index: 1,
    name: 'Pre-Deployment Backup',
    description: 'Snapshot current database state and store rollback artifact',
    status: 'SIMULATED',
    actionLabel: 'SIMULATED',
    durationMs: 4200,
    output: 'Backup artifact: backup-2024-01-15-14:23:00.tar.gz (412 MB)',
    requiresApproval: false,
  },
  {
    id: 'step_02',
    index: 2,
    name: 'Run Database Migrations',
    description: 'Apply pending Prisma migrations to staging database',
    status: 'SIMULATED',
    actionLabel: 'SIMULATED',
    durationMs: 1800,
    output: '3 migrations applied: 001_add_password_reset, 002_add_refresh_tokens, 003_add_audit_log',
    requiresApproval: false,
  },
  {
    id: 'step_03',
    index: 3,
    name: 'Build & Push Docker Image',
    description: 'Build production Docker image and push to container registry',
    status: 'SIMULATED',
    actionLabel: 'SIMULATED',
    durationMs: 67400,
    output: 'Image: ghcr.io/acme/ecommerce:v2.4.0 — pushed (sha256:a1b2c3d4)',
    requiresApproval: false,
  },
  {
    id: 'step_04',
    index: 4,
    name: 'Deploy to Staging',
    description: 'Rolling deploy to staging environment — requires approval before production',
    status: 'SIMULATED',
    actionLabel: 'SIMULATED',
    durationMs: 12300,
    output: 'Staging: 3/3 replicas healthy. URL: https://staging.ecommerce.acme.io',
    requiresApproval: false,
    approvedBy: 'demo-user',
  },
  {
    id: 'step_05',
    index: 5,
    name: 'Run Staging Smoke Tests',
    description: 'Execute smoke test suite against staging deployment',
    status: 'SIMULATED',
    actionLabel: 'SIMULATED',
    durationMs: 8900,
    output: '12/12 smoke tests passed (see below)',
    requiresApproval: false,
  },
  {
    id: 'step_06',
    index: 6,
    name: 'Production Deploy — REQUIRES APPROVAL',
    description: 'Deploy to production environment. Irreversible without rollback procedure.',
    status: 'REQUIRES_APPROVAL',
    actionLabel: 'REQUIRES_APPROVAL',
    requiresApproval: true,
    blockedReason: 'Production deployment requires explicit engineer approval. This is a demo — no real deployment will occur.',
  },
  {
    id: 'step_07',
    index: 7,
    name: 'Post-Deployment Health Checks',
    description: 'Verify all services are healthy post-deployment',
    status: 'PENDING',
    actionLabel: 'PROPOSED',
    requiresApproval: false,
  },
  {
    id: 'step_08',
    index: 8,
    name: 'Tag Release & Update Changelog',
    description: 'Create git tag v2.4.0 and update CHANGELOG.md in main branch',
    status: 'PENDING',
    actionLabel: 'PROPOSED',
    requiresApproval: false,
  },
];

// ─── Smoke Tests ─────────────────────────────────────────────────────────────

export const ECOMMERCE_SMOKE_TESTS: SmokeTest[] = [
  {
    id: 'smoke_01',
    name: 'Homepage loads',
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 142,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_02',
    name: 'User login',
    endpoint: '/api/auth/login',
    method: 'POST',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 218,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_03',
    name: 'Password reset request',
    endpoint: '/api/auth/reset-password',
    method: 'POST',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 187,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_04',
    name: 'Product listing',
    endpoint: '/api/products',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 93,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_05',
    name: 'Product detail',
    endpoint: '/api/products/prod_123',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 76,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_06',
    name: 'Add to cart',
    endpoint: '/api/cart/items',
    method: 'POST',
    expectedStatus: 201,
    actualStatus: 201,
    status: 'PASS',
    durationMs: 134,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_07',
    name: 'Cart retrieval',
    endpoint: '/api/cart',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 88,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_08',
    name: 'Checkout initiation',
    endpoint: '/api/orders',
    method: 'POST',
    expectedStatus: 201,
    actualStatus: 201,
    status: 'PASS',
    durationMs: 312,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_09',
    name: 'Order history',
    endpoint: '/api/orders',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 104,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_10',
    name: 'Admin dashboard',
    endpoint: '/api/admin/stats',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 198,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_11',
    name: 'Search functionality',
    endpoint: '/api/search?q=laptop',
    method: 'GET',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 156,
    actionLabel: 'SIMULATED',
  },
  {
    id: 'smoke_12',
    name: 'Payment webhook (test mode)',
    endpoint: '/api/webhooks/stripe',
    method: 'POST',
    expectedStatus: 200,
    actualStatus: 200,
    status: 'PASS',
    durationMs: 87,
    actionLabel: 'SIMULATED',
  },
];

// ─── Health Checks ───────────────────────────────────────────────────────────

export const ECOMMERCE_HEALTH_CHECKS: HealthCheck[] = [
  {
    id: 'health_01',
    service: 'API Server',
    type: 'HTTP',
    endpoint: 'https://staging.ecommerce.acme.io/api/health',
    status: 'HEALTHY',
    responseTimeMs: 42,
    message: 'All systems operational',
    checkedAt: '2024-01-15T14:38:00Z',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'health_02',
    service: 'PostgreSQL (primary)',
    type: 'DATABASE',
    endpoint: 'postgres://db.staging.acme.io:5432/ecommerce',
    status: 'HEALTHY',
    responseTimeMs: 8,
    message: 'Connection pool: 4/20 active. Replication lag: 0ms',
    checkedAt: '2024-01-15T14:38:01Z',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'health_03',
    service: 'Redis Cache',
    type: 'CACHE',
    endpoint: 'redis://cache.staging.acme.io:6379',
    status: 'HEALTHY',
    responseTimeMs: 2,
    message: 'Hit ratio: 94.2%. Memory: 128MB / 512MB',
    checkedAt: '2024-01-15T14:38:01Z',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'health_04',
    service: 'Email Service (SendGrid)',
    type: 'HTTP',
    endpoint: 'https://api.sendgrid.com/v3/mail/send',
    status: 'HEALTHY',
    responseTimeMs: 187,
    message: 'API reachable. Test email delivered.',
    checkedAt: '2024-01-15T14:38:02Z',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'health_05',
    service: 'Stripe Payment Gateway',
    type: 'HTTP',
    endpoint: 'https://api.stripe.com/v1/charges',
    status: 'HEALTHY',
    responseTimeMs: 234,
    message: 'Test mode ping: 200 OK',
    checkedAt: '2024-01-15T14:38:02Z',
    actionLabel: 'SIMULATED',
  },
  {
    id: 'health_06',
    service: 'CDN (Cloudflare)',
    type: 'HTTP',
    endpoint: 'https://cdn.acme.io/__health',
    status: 'HEALTHY',
    responseTimeMs: 18,
    message: 'Edge nodes: 3/3 healthy. Cache hit ratio: 78%',
    checkedAt: '2024-01-15T14:38:03Z',
    actionLabel: 'SIMULATED',
  },
];

// ─── Changelog ───────────────────────────────────────────────────────────────

export const ECOMMERCE_CHANGELOG = `# Changelog

## [2.4.0] - 2024-01-15

### Security
- **[CRITICAL]** Fixed JWT verification bypass in password reset flow (CVE-2022-23529 via jsonwebtoken@8.5.1)
  - Upgraded jsonwebtoken to v9.2.1
  - Added token expiry validation and algorithm pinning
- **[HIGH]** Patched prototype pollution vulnerability in lodash utility functions
  - Upgraded lodash to v4.17.21
  - Added input sanitization wrapper

### Bug Fixes
- Fixed password-reset token not being invalidated after use
- Fixed auth state not being cleared on logout in all tab contexts
- Fixed cart total calculation for products with quantity > 1
- Fixed order status email not sent when status transitions to SHIPPED

### Tests
- Added 28 new tests for auth flow edge cases (+71.2% → 87.3% coverage)
- Added regression tests for password reset token invalidation
- Added integration tests for cart total calculation
- Added smoke tests for all critical API endpoints

### Documentation
- Updated README with correct setup instructions
- Fixed API docs: POST /api/auth/reset-password now correctly documented
- Added CONTRIBUTING.md
- Updated .env.example with all required variables

### Configuration
- Added PORT environment variable support to Dockerfile
- Added health check endpoint to docker-compose.yml
- Fixed CORS configuration for production domain

### Dependencies
- Upgraded jsonwebtoken: 8.5.1 → 9.2.1
- Upgraded lodash: 4.17.18 → 4.17.21
- Upgraded axios: 0.27.2 → 1.6.2
- Updated all transitive dependencies
`;

// ─── Release Notes ───────────────────────────────────────────────────────────

export const ECOMMERCE_RELEASE_NOTES = `## Release v2.4.0 — Security & Quality Hardening

This release addresses all critical security vulnerabilities and quality issues identified by the ReleasePilot AI autonomous engineering run.

**What changed:**
This is a security and stability release. No new user-facing features are included.

**Breaking changes:**
None. All existing API contracts are preserved.

**Upgrade notes:**
- Run \`npm install\` to update dependencies
- Run \`npx prisma migrate deploy\` to apply 3 new database migrations
- Update your \`.env\` file: add \`JWT_ALGORITHM=HS256\` and \`JWT_EXPIRY=7d\`

**Security advisories resolved:**
- CVE-2022-23529 (jsonwebtoken) — Critical
- Prototype pollution in lodash — High

**Testing:**
142 tests passing | 87.3% code coverage | 12/12 smoke tests pass
`;

// ─── Full Deployment Report ───────────────────────────────────────────────────

export const PHASE4_DEPLOYMENT_REPORT: DeploymentReport = {
  id: 'deploy_01',
  runId: 'run_01',
  environment: 'staging → production',
  version: 'v2.4.0',
  semverRecommendation: 'PATCH → MINOR (new auth token behavior)',
  changelog: ECOMMERCE_CHANGELOG,
  releaseNotes: ECOMMERCE_RELEASE_NOTES,
  gateChecks: ECOMMERCE_GATE_CHECKS,
  steps: ECOMMERCE_DEPLOY_STEPS,
  smokeTests: ECOMMERCE_SMOKE_TESTS,
  healthChecks: ECOMMERCE_HEALTH_CHECKS,
  overallStatus: 'SIMULATED',
  createdAt: '2024-01-15T14:40:00Z',
};
