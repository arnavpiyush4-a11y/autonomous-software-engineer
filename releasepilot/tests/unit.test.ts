/**
 * ReleasePilot AI — Unit Tests
 * Pure Node.js tests using built-in assert (no external framework).
 * Run: npx ts-node --project tsconfig.test.json -r tsconfig-paths/register tests/unit.test.ts
 */

import * as assert from 'assert';
import { WorkflowStateMachine, validateTransition, canApprove, stateAfterApproval } from '../src/lib/workflow/stateMachine';
import { RepositoryAnalyzer } from '../src/lib/analysis/repositoryAnalyzer';
import type { ParsedRepository } from '../src/lib/analysis/repositoryAnalyzer';
import type { HealthFinding, WorkflowState } from '../src/lib/types';

// ─── Inline test runner ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
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

// ─── State Machine Tests ─────────────────────────────────────────────────────

describe('WorkflowStateMachine', () => {
  test('initial state is IDLE', () => {
    const sm = new WorkflowStateMachine();
    assert.strictEqual(sm.state, 'IDLE');
    assert.strictEqual(sm.progressPct, 0);
  });

  test('valid transition IDLE → ONBOARDING records transition', () => {
    const sm = new WorkflowStateMachine();
    const t = sm.transition('ONBOARDING', 'Starting repository scan');
    assert.ok(t !== null, 'transition should succeed');
    assert.strictEqual(sm.state, 'ONBOARDING');
    assert.strictEqual(t!.from, 'IDLE');
    assert.strictEqual(t!.to, 'ONBOARDING');
    assert.strictEqual(t!.reason, 'Starting repository scan');
    assert.ok(t!.progressPct > 0);
  });

  test('full happy path IDLE → COMPLETED', () => {
    const sm = new WorkflowStateMachine();
    const steps: Array<[WorkflowState, string]> = [
      ['ONBOARDING',        'Scanning repo'],
      ['UNDERSTANDING',     'Analyzing task'],
      ['PLANNING',          'Generating plan'],
      ['EXECUTING',         'Running workers'],
      ['TESTING',           'Running tests'],
      ['REVIEWING',         'Code review'],
      ['APPROVAL_REQUIRED', 'Need approval'],
      ['EXECUTING',         'Post-approval'],
      ['TESTING',           'Final validation'],
      ['REVIEWING',         'Final review'],
      ['COMPLETED',         'All done'],
    ];
    for (const [to, reason] of steps) {
      const t = sm.transition(to, reason);
      assert.ok(t !== null, `Transition to ${to} should succeed`);
    }
    assert.strictEqual(sm.state, 'COMPLETED');
    assert.strictEqual(sm.progressPct, 100);
    assert.ok(sm.isTerminal());
  });

  test('invalid transition is rejected and state unchanged', () => {
    const sm = new WorkflowStateMachine();
    const result = sm.transition('COMPLETED', 'Trying to skip');
    assert.strictEqual(result, null);
    assert.strictEqual(sm.state, 'IDLE');
  });

  test('fail() transitions to FAILED', () => {
    const sm = new WorkflowStateMachine('EXECUTING');
    const t = sm.fail('Unrecoverable error', new Error('test'));
    assert.ok(t !== null);
    assert.strictEqual(sm.state, 'FAILED');
    assert.ok(sm.isTerminal());
  });

  test('fail() is no-op from terminal state', () => {
    const sm = new WorkflowStateMachine('COMPLETED');
    const t = sm.fail('Trying to fail completed');
    assert.strictEqual(t, null);
    assert.strictEqual(sm.state, 'COMPLETED');
  });

  test('cancel() transitions to CANCELLED', () => {
    const sm = new WorkflowStateMachine('PLANNING');
    const t = sm.cancel('User cancelled');
    assert.ok(t !== null);
    assert.strictEqual(sm.state, 'CANCELLED');
    assert.strictEqual(t!.reason, 'User cancelled');
  });

  test('transition history records all entries', () => {
    const sm = new WorkflowStateMachine();
    sm.transition('ONBOARDING', 'r1');
    sm.transition('UNDERSTANDING', 'r2');
    assert.strictEqual(sm.transitions.length, 2);
    assert.strictEqual(sm.transitions[0].to, 'ONBOARDING');
    assert.strictEqual(sm.transitions[1].to, 'UNDERSTANDING');
  });

  test('snapshot() returns correct shape', () => {
    const sm = new WorkflowStateMachine('REVIEWING');
    const snap = sm.snapshot();
    assert.strictEqual(snap.state, 'REVIEWING');
    assert.ok(typeof snap.progressPct === 'number');
    assert.ok(typeof snap.description === 'string');
    assert.ok(Array.isArray(snap.history));
    assert.strictEqual(snap.isTerminal, false);
    assert.strictEqual(snap.isActive, true);
  });

  test('canTransitionTo is accurate', () => {
    const sm = new WorkflowStateMachine('APPROVAL_REQUIRED');
    assert.strictEqual(sm.canTransitionTo('EXECUTING'), true);
    assert.strictEqual(sm.canTransitionTo('CANCELLED'), true);
    assert.strictEqual(sm.canTransitionTo('PLANNING'), false);
    assert.strictEqual(sm.canTransitionTo('ONBOARDING'), false);
  });
});

describe('validateTransition()', () => {
  test('returns null for valid transition', () => {
    assert.strictEqual(validateTransition('IDLE', 'ONBOARDING'), null);
  });

  test('returns error string for invalid transition', () => {
    const result = validateTransition('IDLE', 'COMPLETED');
    assert.ok(typeof result === 'string', 'should return error string');
    assert.ok((result as string).includes('IDLE'));
    assert.ok((result as string).includes('COMPLETED'));
  });
});

describe('canApprove() and stateAfterApproval()', () => {
  test('canApprove is true only in APPROVAL_REQUIRED', () => {
    assert.strictEqual(canApprove('APPROVAL_REQUIRED'), true);
    assert.strictEqual(canApprove('EXECUTING'), false);
    assert.strictEqual(canApprove('COMPLETED'), false);
  });

  test('stateAfterApproval maps correctly', () => {
    assert.strictEqual(stateAfterApproval('APPROVED'), 'EXECUTING');
    assert.strictEqual(stateAfterApproval('REJECTED'), 'CANCELLED');
    assert.strictEqual(stateAfterApproval('CHANGES_REQUESTED'), 'BLOCKED');
  });
});

// ─── Repository Analyzer Tests ───────────────────────────────────────────────

describe('RepositoryAnalyzer', () => {
  const analyzer = new RepositoryAnalyzer();

  const minimal: ParsedRepository = {
    files: ['src/index.ts', 'src/app.ts', 'package.json'],
    hasDockerfile: false,
    hasDockerCompose: false,
    hasCiCd: false,
    hasAgentsMd: false,
    hasContributing: false,
    hasEnvExample: false,
    hasTests: false,
    testPaths: [],
    configFiles: [],
    entryPoints: ['src/index.ts'],
  };

  test('produces valid scan from minimal input', () => {
    const scan = analyzer.analyze(minimal, 'test_repo');
    assert.strictEqual(scan.repositoryId, 'test_repo');
    assert.strictEqual(scan.status, 'COMPLETED');
    assert.ok(scan.totalFiles >= 1);
    assert.ok(scan.healthScore >= 0 && scan.healthScore <= 100);
    assert.ok(Array.isArray(scan.healthFindings));
  });

  test('detects TypeScript from .ts files', () => {
    const scan = analyzer.analyze(minimal, 'test_repo');
    assert.ok('TypeScript' in scan.languages, 'TypeScript should be detected');
  });

  test('detects frameworks from package.json deps', () => {
    const withDeps: ParsedRepository = {
      ...minimal,
      packageJson: {
        dependencies: { express: '^4.18.0', react: '^18.0.0' },
        devDependencies: { jest: '^29.0.0' },
      },
    };
    const scan = analyzer.analyze(withDeps, 'fw_repo');
    assert.ok(scan.frameworks.includes('Express'), 'Express should be detected');
    assert.ok(scan.frameworks.includes('React'), 'React should be detected');
    assert.ok(scan.frameworks.includes('Jest'), 'Jest should be detected');
  });

  test('detects npm package manager from package-lock.json', () => {
    const withLock: ParsedRepository = {
      ...minimal,
      files: ['package-lock.json', 'src/index.ts'],
    };
    assert.strictEqual(analyzer.analyze(withLock, 'npm_repo').packageManager, 'npm');
  });

  test('extracts test and lint commands from scripts', () => {
    const withScripts: ParsedRepository = {
      ...minimal,
      packageJson: { scripts: { build: 'tsc', test: 'jest', lint: 'eslint src' } },
    };
    const scan = analyzer.analyze(withScripts, 'scripts_repo');
    assert.strictEqual(scan.buildCommand, 'npm run build');
    assert.strictEqual(scan.testCommand, 'npm test');
    assert.strictEqual(scan.lintCommand, 'npm run lint');
  });

  test('detects missing README as HIGH finding', () => {
    const scan = analyzer.analyze(minimal, 'no_readme_repo');
    const f = scan.healthFindings.find((hf) => hf.title.toLowerCase().includes('readme'));
    assert.ok(f, 'Missing README finding expected');
    assert.strictEqual(f!.severity, 'HIGH');
  });

  test('detects missing .env.example as MEDIUM finding', () => {
    const scan = analyzer.analyze(minimal, 'no_env_repo');
    const f = scan.healthFindings.find((hf) => hf.title.toLowerCase().includes('env'));
    assert.ok(f, 'Missing .env.example finding expected');
    assert.strictEqual(f!.severity, 'MEDIUM');
  });

  test('detects missing tests as HIGH finding', () => {
    const scan = analyzer.analyze(minimal, 'no_tests_repo');
    const f = scan.healthFindings.find((hf) => hf.category === 'TEST' && hf.title.toLowerCase().includes('test'));
    assert.ok(f, 'Missing tests finding expected');
    assert.strictEqual(f!.severity, 'HIGH');
  });

  test('detects CVE-2022-23529 in jsonwebtoken@8.5.1', () => {
    const withVuln: ParsedRepository = {
      ...minimal,
      packageJson: { dependencies: { jsonwebtoken: '^8.5.1' } },
    };
    const scan = analyzer.analyze(withVuln, 'vuln_repo');
    const f = scan.healthFindings.find((hf) => hf.title.includes('CVE-2022-23529'));
    assert.ok(f, 'CVE-2022-23529 finding expected');
    assert.strictEqual(f!.severity, 'CRITICAL');
  });

  test('does NOT flag jsonwebtoken@9.0.2 as vulnerable', () => {
    const withPatched: ParsedRepository = {
      ...minimal,
      packageJson: { dependencies: { jsonwebtoken: '^9.0.2' } },
    };
    const scan = analyzer.analyze(withPatched, 'patched_repo');
    const f = scan.healthFindings.find((hf) => hf.title.includes('jsonwebtoken') && hf.category === 'SECURITY');
    assert.strictEqual(f, undefined, 'Patched version should not be flagged');
  });

  test('calculateHealthScore returns 100 for empty findings', () => {
    assert.strictEqual(analyzer.calculateHealthScore([]), 100);
  });

  test('calculateHealthScore deducts: CRITICAL-15 HIGH-8 MEDIUM-4 LOW-2', () => {
    const mf: HealthFinding[] = [
      { id: '1', category: 'SECURITY', severity: 'CRITICAL', title: 'c', description: 'c', recommendation: 'c', affectedFiles: [] },
      { id: '2', category: 'QUALITY',  severity: 'HIGH',     title: 'h', description: 'h', recommendation: 'h', affectedFiles: [] },
      { id: '3', category: 'QUALITY',  severity: 'MEDIUM',   title: 'm', description: 'm', recommendation: 'm', affectedFiles: [] },
      { id: '4', category: 'QUALITY',  severity: 'LOW',      title: 'l', description: 'l', recommendation: 'l', affectedFiles: [] },
    ];
    assert.strictEqual(analyzer.calculateHealthScore(mf), 71);
  });

  test('health score clamped to 0 minimum', () => {
    const manyFindings: HealthFinding[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      category: 'SECURITY' as const,
      severity: 'CRITICAL' as const,
      title: 'c',
      description: 'c',
      recommendation: 'c',
      affectedFiles: [],
    }));
    assert.ok(analyzer.calculateHealthScore(manyFindings) >= 0);
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log('All tests passed! ✓');
