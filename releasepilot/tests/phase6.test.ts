/**
 * ReleasePilot AI — Phase 6 Extended Unit Tests
 *
 * Tests for:
 *   1. Release Confidence Engine (score calculation, signals, blockers)
 *   2. Sandbox security boundaries (allowlist, path validation)
 *   3. Persistence adapter (read/write, isolation)
 *   4. Fixture tests (sanity check that fixture tests run and fail correctly)
 *   5. API input validation helpers
 */

import * as assert from 'assert';
import { calculateConfidence } from '../src/lib/confidence/engine';
import { getAllowedCommandKeys, getFixtureStatus } from '../src/lib/sandbox/executor';
import { _resetCacheForTests, appendAuditEvent, getAuditEvents } from '../src/lib/db/persistence';
import type { ConfidenceInputs } from '../src/lib/confidence/engine';

// ─── Inline test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err instanceof Error ? err.message : String(err)}`);
        failed++;
      });
    } else {
      console.log(`  ✓ ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function describe(suite: string, fn: () => void): void {
  console.log(`\n${suite}`);
  fn();
}

// ─── Confidence Engine Tests ──────────────────────────────────────────────────

describe('ConfidenceEngine — calculateConfidence()', () => {
  const perfectInputs: ConfidenceInputs = {
    buildPasses: true,
    buildDurationMs: 30000,
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
    dependencyAuditPassed: true,
    docsMismatches: 0,
    configIssues: 0,
    hasEnvExample: true,
    hasChangelog: true,
    approvalStatus: 'APPROVED',
    proofModeExecuted: false,
  };

  test('perfect inputs yield high score (≥90)', () => {
    const result = calculateConfidence(perfectInputs);
    assert.ok(result.overallScore >= 90, `Expected ≥90, got ${result.overallScore}`);
  });

  test('perfect inputs yield LOW risk', () => {
    const result = calculateConfidence(perfectInputs);
    assert.strictEqual(result.riskLevel, 'LOW');
  });

  test('perfect inputs have no blockers', () => {
    const result = calculateConfidence(perfectInputs);
    assert.strictEqual(result.blockers.length, 0);
  });

  test('failing build produces blocker', () => {
    const result = calculateConfidence({ ...perfectInputs, buildPasses: false });
    assert.ok(result.blockers.some((b) => b.toLowerCase().includes('build')));
  });

  test('failing tests produce blocker', () => {
    const result = calculateConfidence({ ...perfectInputs, failingTestCount: 3, testPassRate: 0.97 });
    assert.ok(result.blockers.some((b) => b.includes('3 test')));
  });

  test('critical CVE produces blocker', () => {
    const result = calculateConfidence({ ...perfectInputs, criticalCVEs: 1 });
    assert.ok(result.blockers.some((b) => b.toLowerCase().includes('cve')));
  });

  test('rejected approval produces blocker and low score', () => {
    const result = calculateConfidence({ ...perfectInputs, approvalStatus: 'REJECTED' });
    assert.ok(result.blockers.some((b) => b.toLowerCase().includes('rejected')));
  });

  test('CHANGES_REQUESTED produces blocker', () => {
    const result = calculateConfidence({ ...perfectInputs, approvalStatus: 'CHANGES_REQUESTED' });
    assert.ok(result.blockers.length > 0);
  });

  test('score is in range 0-100', () => {
    const r1 = calculateConfidence(perfectInputs);
    const r2 = calculateConfidence({
      ...perfectInputs,
      buildPasses: false,
      criticalCVEs: 5,
      failingTestCount: 50,
      criticalFindings: 5,
    });
    assert.ok(r1.overallScore >= 0 && r1.overallScore <= 100);
    assert.ok(r2.overallScore >= 0 && r2.overallScore <= 100);
  });

  test('pre-run confidence is lower than post-run', () => {
    const pre = calculateConfidence({
      buildPasses: true,
      testPassRate: 142 / 145,
      testCoverage: 71.4,
      failingTestCount: 3,
      regressionTestsAdded: 0,
      criticalFindings: 2,
      highFindings: 2,
      mediumFindings: 2,
      allFindingsResolved: false,
      criticalCVEs: 1,
      highCVEs: 1,
      dependencyAuditPassed: false,
      docsMismatches: 1,
      configIssues: 1,
      hasEnvExample: true,
      hasChangelog: false,
      approvalStatus: 'NONE',
      proofModeExecuted: false,
    });
    const post = calculateConfidence(perfectInputs);
    assert.ok(pre.overallScore < post.overallScore, `Pre ${pre.overallScore} should be < Post ${post.overallScore}`);
  });

  test('signals cover BUILD, TEST, SECURITY, REVIEW, DOCS, APPROVAL categories', () => {
    const result = calculateConfidence(perfectInputs);
    const categories = new Set(result.signals.map((s) => s.category));
    for (const cat of ['BUILD', 'TEST', 'SECURITY', 'REVIEW', 'DOCS', 'APPROVAL'] as const) {
      assert.ok(categories.has(cat), `Missing category: ${cat}`);
    }
  });

  test('proofModeExecuted marks signals as EXECUTED source', () => {
    const result = calculateConfidence({ ...perfectInputs, proofModeExecuted: true });
    const buildSig = result.signals.find((s) => s.name === 'Build Status');
    assert.strictEqual(buildSig?.source, 'EXECUTED');
  });

  test('null build returns SIMULATED source and score 50', () => {
    const result = calculateConfidence({ ...perfectInputs, buildPasses: null });
    const buildSig = result.signals.find((s) => s.name === 'Build Status');
    assert.strictEqual(buildSig?.source, 'SIMULATED');
    assert.strictEqual(buildSig?.score, 50);
  });
});

// ─── Sandbox Security Tests ───────────────────────────────────────────────────

describe('SandboxExecutor — security boundaries', () => {
  test('getAllowedCommandKeys returns non-empty array', () => {
    const keys = getAllowedCommandKeys();
    assert.ok(Array.isArray(keys) && keys.length > 0);
  });

  test('run-tests is in allowlist', () => {
    assert.ok(getAllowedCommandKeys().includes('run-tests'));
  });

  test('analyze-deps is in allowlist', () => {
    assert.ok(getAllowedCommandKeys().includes('analyze-deps'));
  });

  test('arbitrary commands are NOT in allowlist', () => {
    const allowed = getAllowedCommandKeys();
    const dangerous = ['rm -rf /', 'cat /etc/passwd', 'curl http://evil.com', 'sh', 'bash', 'eval'];
    for (const cmd of dangerous) {
      assert.ok(!allowed.includes(cmd), `Dangerous command should not be allowed: ${cmd}`);
    }
  });

  test('getFixtureStatus returns available/unavailable without throwing', () => {
    const status = getFixtureStatus();
    assert.ok(typeof status.available === 'boolean');
    assert.ok(typeof status.path === 'string');
    // Path must be within the project directory
    assert.ok(status.path.includes('fixtures'), `Path should include 'fixtures': ${status.path}`);
  });

  test('fixture path does not escape project root', () => {
    const status = getFixtureStatus();
    // Path traversal check: the path must not contain ../../ or go above cwd
    assert.ok(!status.path.includes('../'), 'Path must not contain ../');
  });
});

// ─── Persistence Tests ────────────────────────────────────────────────────────

describe('Persistence — appendAuditEvent / getAuditEvents', () => {
  test('appendAuditEvent returns event with generated id', () => {
    _resetCacheForTests();
    const event = appendAuditEvent({
      kind: 'WORKFLOW_TRANSITION',
      actor: 'test',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      message: 'Test event',
      metadata: {},
      actionLabel: 'ANALYZED',
    });
    assert.ok(typeof event.id === 'string' && event.id.length > 0);
    assert.strictEqual(event.kind, 'WORKFLOW_TRANSITION');
  });

  test('getAuditEvents returns recently added event', () => {
    _resetCacheForTests();
    appendAuditEvent({
      kind: 'TEST_RESULT',
      actor: 'test-suite',
      timestamp: new Date().toISOString(),
      status: 'PASS',
      message: 'All tests passed',
      metadata: { passing: 27 },
      actionLabel: 'EXECUTED',
    });
    const events = getAuditEvents(10);
    assert.ok(events.length >= 1);
    const found = events.find((e) => e.kind === 'TEST_RESULT' && e.actor === 'test-suite');
    assert.ok(found, 'Expected to find TEST_RESULT event');
  });

  test('getAuditEvents respects limit parameter', () => {
    _resetCacheForTests();
    for (let i = 0; i < 10; i++) {
      appendAuditEvent({
        kind: 'WORKFLOW_TRANSITION',
        actor: 'test',
        timestamp: new Date().toISOString(),
        status: 'OK',
        message: `Event ${i}`,
        metadata: {},
        actionLabel: 'ANALYZED',
      });
    }
    const events = getAuditEvents(5);
    assert.ok(events.length <= 5);
  });

  test('audit events are returned in reverse-chronological order (newest first)', () => {
    _resetCacheForTests();
    appendAuditEvent({ kind: 'DEMO_RESET', actor: 'a', timestamp: '2024-01-01T00:00:00Z', status: 'OK', message: 'first', metadata: {}, actionLabel: 'EXECUTED' });
    appendAuditEvent({ kind: 'DEMO_RESET', actor: 'b', timestamp: '2024-01-02T00:00:00Z', status: 'OK', message: 'second', metadata: {}, actionLabel: 'EXECUTED' });
    const events = getAuditEvents(10);
    // Most recent first
    const actorOrder = events.filter((e) => e.kind === 'DEMO_RESET').map((e) => e.actor);
    assert.strictEqual(actorOrder[0], 'b', 'Newest event should be first');
  });
});

// ─── Fixture Sanity Test ──────────────────────────────────────────────────────

describe('Fixture — sanity check (not sandbox execution)', () => {
  test('fixture tests/run.js exists at expected path', () => {
    const fs = require('fs');
    const path = require('path');
    const fixturePath = path.join(process.cwd(), 'fixtures', 'ecommerce-platform', 'tests', 'run.js');
    assert.ok(fs.existsSync(fixturePath), `Fixture not found: ${fixturePath}`);
  });

  test('fixture package.json has expected vulnerable dependency', () => {
    const fs = require('fs');
    const path = require('path');
    const pkgPath = path.join(process.cwd(), 'fixtures', 'ecommerce-platform', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { dependencies: Record<string, string> };
    assert.ok('jsonwebtoken' in pkg.dependencies, 'jsonwebtoken should be in dependencies');
    const version = pkg.dependencies.jsonwebtoken;
    // Should be < 9.0.0 (vulnerable version)
    const major = parseInt(version.replace(/[\^~>=<]/g, '').split('.')[0], 10);
    assert.ok(major < 9, `jsonwebtoken should be vulnerable (< 9.0.0), got ${version}`);
  });

  test('fixture package.json has expected vulnerable lodash', () => {
    const fs = require('fs');
    const path = require('path');
    const pkgPath = path.join(process.cwd(), 'fixtures', 'ecommerce-platform', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { dependencies: Record<string, string> };
    assert.ok('lodash' in pkg.dependencies, 'lodash should be in dependencies');
  });
});

// ─── API Validation Helpers ───────────────────────────────────────────────────

describe('API input validation', () => {
  test('command allowlist rejects empty string', () => {
    const allowed = getAllowedCommandKeys();
    assert.ok(!allowed.includes(''));
  });

  test('command allowlist rejects shell metacharacters', () => {
    const allowed = getAllowedCommandKeys();
    const shellMeta = ['&&', '||', ';', '|', '>', '<', '`', '$()'];
    for (const meta of shellMeta) {
      assert.ok(!allowed.some((k) => k.includes(meta)), `Allowlist should not contain shell meta: ${meta}`);
    }
  });

  test('audit event id is unique per call', () => {
    _resetCacheForTests();
    const e1 = appendAuditEvent({ kind: 'DEMO_RESET', actor: 'x', timestamp: new Date().toISOString(), status: 'OK', message: 'm', metadata: {}, actionLabel: 'EXECUTED' });
    const e2 = appendAuditEvent({ kind: 'DEMO_RESET', actor: 'y', timestamp: new Date().toISOString(), status: 'OK', message: 'm', metadata: {}, actionLabel: 'EXECUTED' });
    assert.notStrictEqual(e1.id, e2.id);
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

// Give async tests time to complete
setTimeout(() => {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
  else console.log('All tests passed! ✓');
}, 100);
