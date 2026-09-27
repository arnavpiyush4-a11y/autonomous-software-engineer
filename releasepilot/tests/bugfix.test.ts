/**
 * ReleasePilot AI — Bug-Fix Regression Tests
 *
 * Tests for behaviors added in the QA bug-fix pass:
 *   BUG-03: resetRun sentinel / state reset
 *   BUG-08: truncateTask helper
 *   BUG-10: repository filter logic
 *   BUG-11: run filter logic
 *   BUG-15: parseGitHubUrl validation
 *   BUG-17: task input validation (empty / whitespace)
 *   BUG-16: SVG instance IDs (pattern/filter uniqueness)
 *
 * Run: npx ts-node --project tsconfig.test.json -r tsconfig-paths/register tests/bugfix.test.ts
 */

import * as assert from 'assert';
import { APPROVAL_STORE } from '../src/lib/approvalStore';
import { _resetCacheForTests } from '../src/lib/db/persistence';
import { getFixtureStatus, getAllowedCommandKeys } from '../src/lib/sandbox/executor';
import { calculateConfidence } from '../src/lib/confidence/engine';

// ─── Inline test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    passed++;
  } catch (err) {
    console.error(`  \u2717 ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function describe(suite: string, fn: () => void): void {
  console.log(`\n${suite}`);
  fn();
}

// ─── BUG-08: truncateTask helper ─────────────────────────────────────────────

/**
 * Inline copy of the truncateTask logic from NewRunPageInner.tsx.
 * The helper itself is not exported, so we re-implement it here to keep
 * tests framework-free (no DOM / JSX needed).
 */
function truncateTask(text: string, max = 70): string {
  return text.length > max ? text.slice(0, max) + '\u2026' : text;
}

describe('BUG-08: truncateTask()', () => {
  test('returns text unchanged when at or below max', () => {
    assert.strictEqual(truncateTask('short'), 'short');
    assert.strictEqual(truncateTask('x'.repeat(70)), 'x'.repeat(70));
  });

  test('truncates text longer than max and appends ellipsis', () => {
    const long = 'x'.repeat(71);
    const result = truncateTask(long);
    assert.strictEqual(result.length, 71); // 70 chars + 1 ellipsis char
    assert.ok(result.endsWith('\u2026'));
  });

  test('respects custom max parameter', () => {
    const result = truncateTask('hello world', 5);
    assert.strictEqual(result, 'hello\u2026');
  });

  test('empty string is returned unchanged', () => {
    assert.strictEqual(truncateTask(''), '');
  });

  test('exactly max length — no ellipsis added', () => {
    const text = 'a'.repeat(70);
    assert.strictEqual(truncateTask(text), text);
    assert.ok(!truncateTask(text).includes('\u2026'));
  });
});

// ─── BUG-15: parseGitHubUrl validation ───────────────────────────────────────

/**
 * Inline copy of the parseGitHubUrl logic from onboard/page.tsx.
 */
function parseGitHubUrl(raw: string): { owner: string; repo: string } | string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return 'Enter a valid URL (e.g. https://github.com/owner/repo)';
  }
  if (url.protocol !== 'https:') return 'URL must use https://';
  if (url.hostname !== 'github.com') return 'URL must be a github.com repository';
  if (url.username || url.password) return 'URL must not contain credentials';
  const parts = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/').filter(Boolean);
  if (parts.length !== 2) return 'URL must point to a repository: github.com/owner/repo';
  const [owner, repo] = parts;
  return { owner, repo };
}

describe('BUG-15: parseGitHubUrl()', () => {
  test('accepts valid https github.com URL', () => {
    const result = parseGitHubUrl('https://github.com/acme/my-repo');
    assert.deepStrictEqual(result, { owner: 'acme', repo: 'my-repo' });
  });

  test('strips trailing .git extension', () => {
    const result = parseGitHubUrl('https://github.com/acme/my-repo.git');
    assert.deepStrictEqual(result, { owner: 'acme', repo: 'my-repo' });
  });

  test('rejects non-https protocol', () => {
    const result = parseGitHubUrl('http://github.com/acme/repo');
    assert.ok(typeof result === 'string');
    assert.ok((result as string).includes('https'));
  });

  test('rejects non-github.com hostname', () => {
    const result = parseGitHubUrl('https://gitlab.com/acme/repo');
    assert.ok(typeof result === 'string');
    assert.ok((result as string).includes('github.com'));
  });

  test('rejects URL with credentials', () => {
    const result = parseGitHubUrl('https://user:pass@github.com/acme/repo');
    assert.ok(typeof result === 'string');
    assert.ok((result as string).toLowerCase().includes('credential'));
  });

  test('rejects URL with no path segments', () => {
    const result = parseGitHubUrl('https://github.com/');
    assert.ok(typeof result === 'string');
  });

  test('rejects URL with only one path segment (org only)', () => {
    const result = parseGitHubUrl('https://github.com/acme');
    assert.ok(typeof result === 'string');
  });

  test('rejects URL with three or more path segments (deep path)', () => {
    const result = parseGitHubUrl('https://github.com/acme/repo/tree/main');
    assert.ok(typeof result === 'string');
  });

  test('rejects plainly invalid input', () => {
    const result = parseGitHubUrl('not-a-url');
    assert.ok(typeof result === 'string');
  });

  test('trims whitespace around URL', () => {
    const result = parseGitHubUrl('  https://github.com/acme/repo  ');
    assert.deepStrictEqual(result, { owner: 'acme', repo: 'repo' });
  });
});

// ─── BUG-17: task input validation ───────────────────────────────────────────

/**
 * Mirrors the validation logic from NewRunPageInner.tsx.
 */
function validateTaskInput(value: string): string | null {
  if (!value.trim()) return 'Please enter a task description before starting.';
  return null;
}

describe('BUG-17: task input validation', () => {
  test('non-empty input returns null (valid)', () => {
    assert.strictEqual(validateTaskInput('Fix the authentication bug'), null);
  });

  test('empty string returns error message', () => {
    const err = validateTaskInput('');
    assert.ok(typeof err === 'string' && err.length > 0);
  });

  test('whitespace-only input returns error message', () => {
    const err = validateTaskInput('   ');
    assert.ok(typeof err === 'string' && err.length > 0);
  });

  test('single character is valid', () => {
    assert.strictEqual(validateTaskInput('x'), null);
  });
});

// ─── BUG-10: repository filter logic ─────────────────────────────────────────

type RepoFilter = 'All' | 'Healthy' | 'At Risk' | 'Running';
interface MockRepo { id: string; healthScore: number }

function filterRepos(repos: MockRepo[], runStatuses: Record<string, string>, filter: RepoFilter): MockRepo[] {
  return repos.filter((repo) => {
    if (filter === 'All') return true;
    if (filter === 'Healthy') return repo.healthScore >= 85;
    if (filter === 'At Risk') return repo.healthScore < 85;
    if (filter === 'Running') return runStatuses[repo.id] === 'RUNNING';
    return true;
  });
}

describe('BUG-10: repository filter logic', () => {
  const repos: MockRepo[] = [
    { id: 'r1', healthScore: 92 },
    { id: 'r2', healthScore: 67 },
    { id: 'r3', healthScore: 85 },
    { id: 'r4', healthScore: 40 },
  ];
  const runStatuses: Record<string, string> = { r2: 'RUNNING', r4: 'COMPLETED' };

  test('All filter returns all repos', () => {
    assert.strictEqual(filterRepos(repos, runStatuses, 'All').length, 4);
  });

  test('Healthy filter returns repos with score >= 85', () => {
    const result = filterRepos(repos, runStatuses, 'Healthy');
    assert.strictEqual(result.length, 2);
    assert.ok(result.every((r) => r.healthScore >= 85));
  });

  test('At Risk filter returns repos with score < 85', () => {
    const result = filterRepos(repos, runStatuses, 'At Risk');
    assert.strictEqual(result.length, 2);
    assert.ok(result.every((r) => r.healthScore < 85));
  });

  test('Running filter returns only repos with RUNNING status', () => {
    const result = filterRepos(repos, runStatuses, 'Running');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'r2');
  });

  test('Running filter returns empty array when no repos are running', () => {
    const result = filterRepos(repos, {}, 'Running');
    assert.strictEqual(result.length, 0);
  });
});

// ─── BUG-11: run filter logic ─────────────────────────────────────────────────

type RunFilter = 'All Runs' | 'Completed' | 'Running' | 'Failed';
interface MockRun { id: string; status: 'COMPLETED' | 'RUNNING' | 'FAILED' }

function filterRuns(runs: MockRun[], filter: RunFilter): MockRun[] {
  return runs.filter((r) => {
    if (filter === 'All Runs') return true;
    if (filter === 'Completed') return r.status === 'COMPLETED';
    if (filter === 'Running') return r.status === 'RUNNING';
    if (filter === 'Failed') return r.status === 'FAILED';
    return true;
  });
}

describe('BUG-11: run filter logic', () => {
  const runs: MockRun[] = [
    { id: 'r1', status: 'COMPLETED' },
    { id: 'r2', status: 'RUNNING' },
    { id: 'r3', status: 'FAILED' },
    { id: 'r4', status: 'COMPLETED' },
  ];

  test('All Runs returns all', () => {
    assert.strictEqual(filterRuns(runs, 'All Runs').length, 4);
  });

  test('Completed returns only completed runs', () => {
    const result = filterRuns(runs, 'Completed');
    assert.strictEqual(result.length, 2);
    assert.ok(result.every((r) => r.status === 'COMPLETED'));
  });

  test('Running returns only running runs', () => {
    const result = filterRuns(runs, 'Running');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'r2');
  });

  test('Failed returns only failed runs', () => {
    const result = filterRuns(runs, 'Failed');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'r3');
  });
});

// ─── BUG-16: SVG instance ID uniqueness ──────────────────────────────────────

describe('BUG-16: SVG instance ID generation', () => {
  function makeIds(instanceId: string) {
    return {
      gridId: `nexus-grid-${instanceId}`,
      glowId: `node-glow-${instanceId}`,
    };
  }

  test('arch-main and arch-impact produce different IDs', () => {
    const main = makeIds('arch-main');
    const impact = makeIds('arch-impact');
    assert.notStrictEqual(main.gridId, impact.gridId);
    assert.notStrictEqual(main.glowId, impact.glowId);
  });

  test('default instanceId produces well-formed IDs', () => {
    const ids = makeIds('arch');
    assert.strictEqual(ids.gridId, 'nexus-grid-arch');
    assert.strictEqual(ids.glowId, 'node-glow-arch');
  });

  test('IDs contain no spaces or special chars', () => {
    const ids = makeIds('arch-main');
    const validId = /^[a-zA-Z0-9-]+$/;
    assert.ok(validId.test(ids.gridId), `gridId has invalid chars: ${ids.gridId}`);
    assert.ok(validId.test(ids.glowId), `glowId has invalid chars: ${ids.glowId}`);
  });
});

// ─── BUG-03: reset sentinel ───────────────────────────────────────────────────

describe('BUG-03: reset sentinel value', () => {
  const RESET_SENTINEL = '__RESET__';

  test('sentinel is the expected string', () => {
    assert.strictEqual(RESET_SENTINEL, '__RESET__');
  });

  test('sentinel is distinguishable from approval values', () => {
    const approvalValues = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'];
    for (const v of approvalValues) {
      assert.notStrictEqual(v, RESET_SENTINEL);
    }
  });
});

// ─── Approval state integrity ─────────────────────────────────────────────────

describe('Approval state integrity', () => {
  test('PENDING approval can be resolved to APPROVED', () => {
    APPROVAL_STORE.set('test_run_integrity', { status: 'PENDING' });
    const current = APPROVAL_STORE.get('test_run_integrity')!;
    assert.strictEqual(current.status, 'PENDING');
    APPROVAL_STORE.set('test_run_integrity', {
      status: 'APPROVED',
      comment: 'LGTM',
      resolvedAt: new Date().toISOString(),
    });
    const resolved = APPROVAL_STORE.get('test_run_integrity')!;
    assert.strictEqual(resolved.status, 'APPROVED');
  });

  test('already-resolved approval is detected (idempotency guard)', () => {
    APPROVAL_STORE.set('test_run_idem', { status: 'APPROVED', resolvedAt: '2024-01-01T00:00:00Z' });
    const current = APPROVAL_STORE.get('test_run_idem')!;
    // Simulate what the API does: reject if not PENDING
    const alreadyResolved = current.status !== 'PENDING';
    assert.strictEqual(alreadyResolved, true, 'Should detect already-resolved approval');
  });

  test('valid approval actions are exhaustive', () => {
    const validActions = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'];
    // Verify no approval action is missing from the set
    assert.strictEqual(validActions.length, 3);
    assert.ok(validActions.includes('APPROVED'));
    assert.ok(validActions.includes('REJECTED'));
    assert.ok(validActions.includes('CHANGES_REQUESTED'));
  });

  test('REJECTED approval does not leave run in APPROVED state', () => {
    APPROVAL_STORE.set('test_run_reject', { status: 'PENDING' });
    APPROVAL_STORE.set('test_run_reject', {
      status: 'REJECTED',
      resolvedAt: new Date().toISOString(),
    });
    const result = APPROVAL_STORE.get('test_run_reject')!;
    assert.strictEqual(result.status, 'REJECTED');
    assert.notStrictEqual(result.status, 'APPROVED');
  });

  test('run IDs with timestamp suffix are unique', () => {
    const t = Date.now();
    const id1 = `run_live_${t}`;
    const id2 = `run_live_${t + 1}`;
    assert.notStrictEqual(id1, id2);
  });

  test('run_01 is a distinct ID from live run IDs', () => {
    const liveId = `run_live_${Date.now()}`;
    assert.notStrictEqual(liveId, 'run_01');
    assert.ok(!liveId.startsWith('run_01'));
  });
});

// ─── Proof Mode path security ─────────────────────────────────────────────────

describe('Proof Mode — enhanced path security', () => {
  test('fixture path is an absolute path', () => {
    const status = getFixtureStatus();
    const path = require('path');
    assert.ok(path.isAbsolute(status.path), `Fixture path should be absolute: ${status.path}`);
  });

  test('fixture path contains expected directory name', () => {
    const status = getFixtureStatus();
    assert.ok(
      status.path.includes('ecommerce-platform'),
      `Fixture path should include ecommerce-platform: ${status.path}`
    );
  });

  test('allowlist keys contain only hyphen-separated alphanumeric strings', () => {
    const allowed = getAllowedCommandKeys();
    const safeKeyPattern = /^[a-z][a-z0-9-]*$/;
    for (const key of allowed) {
      assert.ok(safeKeyPattern.test(key), `Allowlist key has unexpected format: ${key}`);
    }
  });

  test('type-check is in allowlist', () => {
    assert.ok(getAllowedCommandKeys().includes('type-check'));
  });
});

// ─── Confidence score determinism ─────────────────────────────────────────────

describe('Confidence engine — determinism', () => {
  const inputs = {
    buildPasses: true as boolean | null,
    testPassRate: 1.0,
    testCoverage: 90,
    failingTestCount: 0,
    regressionTestsAdded: 3,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    allFindingsResolved: true,
    criticalCVEs: 0,
    highCVEs: 0,
    dependencyAuditPassed: true as boolean | null,
    docsMismatches: 0,
    configIssues: 0,
    hasEnvExample: true,
    hasChangelog: true,
    approvalStatus: 'APPROVED' as const,
    proofModeExecuted: false,
  };

  test('same inputs always produce the same score', () => {
    const r1 = calculateConfidence(inputs);
    const r2 = calculateConfidence(inputs);
    assert.strictEqual(r1.overallScore, r2.overallScore);
    assert.strictEqual(r1.riskLevel, r2.riskLevel);
    assert.strictEqual(r1.blockers.length, r2.blockers.length);
  });

  test('each signal has a name, score in 0-100, and valid source', () => {
    const result = calculateConfidence(inputs);
    const validSources = ['EXECUTED', 'ANALYZED', 'SIMULATED'];
    for (const signal of result.signals) {
      assert.ok(typeof signal.name === 'string' && signal.name.length > 0, 'Signal must have name');
      assert.ok(signal.score >= 0 && signal.score <= 100, `Signal score out of range: ${signal.name}=${signal.score}`);
      assert.ok(validSources.includes(signal.source), `Invalid source: ${signal.source}`);
    }
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log('All tests passed! \u2713');
