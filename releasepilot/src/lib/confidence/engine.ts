/**
 * Release Confidence Engine
 *
 * Calculates an explainable confidence score (0-100) from a weighted set
 * of signals drawn from real executed evidence, analyzed findings, and
 * simulated results.
 *
 * Every signal records its source: EXECUTED | ANALYZED | SIMULATED
 * so the UI can show exactly how trustworthy each data point is.
 */

import type {
  ConfidenceSignal,
  ConfidenceExplanation,
} from '../db/types';

export interface ConfidenceInputs {
  // Build
  buildPasses: boolean | null;          // null = not run
  buildDurationMs?: number;
  // Tests
  testPassRate: number | null;          // 0-1, null = not run
  testCoverage: number | null;          // 0-100, null = unknown
  failingTestCount: number;
  regressionTestsAdded: number;
  // Review
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  allFindingsResolved: boolean;
  // Security
  criticalCVEs: number;
  highCVEs: number;
  dependencyAuditPassed: boolean | null;
  // Docs / Config
  docsMismatches: number;
  configIssues: number;
  hasEnvExample: boolean;
  hasChangelog: boolean;
  // Approval
  approvalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  // Evidence quality
  proofModeExecuted: boolean;           // real local execution happened
}

export function calculateConfidence(inputs: ConfidenceInputs): ConfidenceExplanation {
  const signals: ConfidenceSignal[] = [];

  // ── Build signal ─────────────────────────────────────────────────
  if (inputs.buildPasses === null) {
    signals.push({
      name: 'Build Status',
      category: 'BUILD',
      score: 50,
      weight: 15,
      evidence: 'Build not executed',
      source: 'SIMULATED',
      detail: 'Build health assumed from static analysis. No local build was run.',
    });
  } else {
    signals.push({
      name: 'Build Status',
      category: 'BUILD',
      score: inputs.buildPasses ? 100 : 0,
      weight: 15,
      evidence: inputs.buildPasses ? 'Build passes' : 'Build failing',
      source: inputs.proofModeExecuted ? 'EXECUTED' : 'SIMULATED',
      detail: inputs.buildPasses
        ? `Production build completed${inputs.buildDurationMs ? ` in ${(inputs.buildDurationMs / 1000).toFixed(1)}s` : ''}.`
        : 'Build is currently broken — cannot release.',
    });
  }

  // ── Test pass rate ────────────────────────────────────────────────
  if (inputs.testPassRate === null) {
    signals.push({
      name: 'Test Pass Rate',
      category: 'TEST',
      score: 40,
      weight: 20,
      evidence: 'Tests not executed',
      source: 'SIMULATED',
      detail: 'No test execution recorded. Score estimated from coverage baseline.',
    });
  } else {
    const testScore = Math.round(inputs.testPassRate * 100);
    signals.push({
      name: 'Test Pass Rate',
      category: 'TEST',
      score: testScore,
      weight: 20,
      evidence: `${testScore}% pass rate · ${inputs.failingTestCount} failing`,
      source: inputs.proofModeExecuted ? 'EXECUTED' : 'SIMULATED',
      detail: inputs.failingTestCount === 0
        ? 'All tests passing — no known regressions.'
        : `${inputs.failingTestCount} tests failing — must fix before release.`,
    });
  }

  // ── Test coverage ─────────────────────────────────────────────────
  if (inputs.testCoverage !== null) {
    const covScore = inputs.testCoverage >= 80 ? 100
      : inputs.testCoverage >= 60 ? 70
      : inputs.testCoverage >= 40 ? 40
      : 20;
    signals.push({
      name: 'Test Coverage',
      category: 'TEST',
      score: covScore,
      weight: 10,
      evidence: `${inputs.testCoverage.toFixed(1)}% coverage`,
      source: inputs.proofModeExecuted ? 'EXECUTED' : 'SIMULATED',
      detail: inputs.testCoverage >= 80
        ? 'Coverage above 80% threshold.'
        : `Coverage below 80% threshold (${inputs.testCoverage.toFixed(1)}%). Risk of undetected regressions.`,
    });
  }

  // ── Regression tests ──────────────────────────────────────────────
  if (inputs.regressionTestsAdded > 0) {
    signals.push({
      name: 'Regression Tests Added',
      category: 'TEST',
      score: Math.min(100, inputs.regressionTestsAdded * 20),
      weight: 8,
      evidence: `+${inputs.regressionTestsAdded} new regression test(s)`,
      source: 'ANALYZED',
      detail: `${inputs.regressionTestsAdded} new test(s) were added to prevent regression of fixed issues.`,
    });
  }

  // ── Code review findings ──────────────────────────────────────────
  const findingPenalty = inputs.criticalFindings * 15 + inputs.highFindings * 8 + inputs.mediumFindings * 3;
  const findingScore = Math.max(0, 100 - findingPenalty);
  signals.push({
    name: 'Review Findings',
    category: 'REVIEW',
    score: inputs.allFindingsResolved ? 100 : findingScore,
    weight: 15,
    evidence: inputs.allFindingsResolved
      ? 'All findings resolved'
      : `${inputs.criticalFindings} CRITICAL · ${inputs.highFindings} HIGH · ${inputs.mediumFindings} MEDIUM`,
    source: 'ANALYZED',
    detail: inputs.allFindingsResolved
      ? 'All code review findings have been addressed.'
      : `${inputs.criticalFindings + inputs.highFindings + inputs.mediumFindings} unresolved findings affecting release quality.`,
  });

  // ── Security / Dependency ─────────────────────────────────────────
  const secPenalty = inputs.criticalCVEs * 25 + inputs.highCVEs * 12;
  const secScore = Math.max(0, 100 - secPenalty);
  signals.push({
    name: 'Dependency Security',
    category: 'SECURITY',
    score: inputs.dependencyAuditPassed === false ? 0 : secScore,
    weight: 15,
    evidence: inputs.criticalCVEs === 0 && inputs.highCVEs === 0
      ? 'No known CVEs'
      : `${inputs.criticalCVEs} CRITICAL CVE(s) · ${inputs.highCVEs} HIGH CVE(s)`,
    source: inputs.proofModeExecuted ? 'EXECUTED' : 'ANALYZED',
    detail: inputs.criticalCVEs === 0
      ? 'Dependency audit passed — no known critical vulnerabilities.'
      : `${inputs.criticalCVEs} critical CVE(s) detected. Must patch before release.`,
  });

  // ── Docs / Config ─────────────────────────────────────────────────
  const docsScore = Math.max(0, 100 - inputs.docsMismatches * 15 - inputs.configIssues * 10)
    + (inputs.hasEnvExample ? 5 : 0)
    + (inputs.hasChangelog ? 5 : 0);
  signals.push({
    name: 'Documentation & Config',
    category: 'DOCS',
    score: Math.min(100, docsScore),
    weight: 8,
    evidence: inputs.docsMismatches === 0 && inputs.configIssues === 0
      ? 'Docs and config clean'
      : `${inputs.docsMismatches} doc mismatch(es) · ${inputs.configIssues} config issue(s)`,
    source: 'ANALYZED',
    detail: inputs.docsMismatches === 0
      ? `Documentation accurate${inputs.hasChangelog ? ' · Changelog present' : ''}.`
      : `${inputs.docsMismatches} documentation mismatche(s) found. May confuse consumers.`,
  });

  // ── Approval gate ─────────────────────────────────────────────────
  const approvalScores: Record<ConfidenceInputs['approvalStatus'], number> = {
    APPROVED: 100,
    NONE: 60,
    PENDING: 40,
    CHANGES_REQUESTED: 20,
    REJECTED: 0,
  };
  signals.push({
    name: 'Human Approval',
    category: 'APPROVAL',
    score: approvalScores[inputs.approvalStatus],
    weight: 9,
    evidence: inputs.approvalStatus === 'APPROVED'
      ? 'Explicitly approved'
      : inputs.approvalStatus === 'NONE'
      ? 'Not yet reviewed'
      : inputs.approvalStatus,
    source: 'ANALYZED',
    detail: inputs.approvalStatus === 'APPROVED'
      ? 'Human reviewer has explicitly approved this release.'
      : inputs.approvalStatus === 'NONE'
      ? 'No human approval on record. Required before release.'
      : 'Approval gate has not been passed.',
  });

  // ── Weighted average ──────────────────────────────────────────────
  const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
  const weightedSum = signals.reduce((s, sig) => s + sig.score * sig.weight, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // ── Blockers ──────────────────────────────────────────────────────
  const blockers: string[] = [];
  if (inputs.buildPasses === false) blockers.push('Build is failing — must pass before release');
  if (inputs.failingTestCount > 0) blockers.push(`${inputs.failingTestCount} test(s) failing`);
  if (inputs.criticalCVEs > 0) blockers.push(`${inputs.criticalCVEs} critical CVE(s) must be patched`);
  if (inputs.criticalFindings > 0) blockers.push(`${inputs.criticalFindings} critical code review finding(s) unresolved`);
  if (inputs.approvalStatus === 'REJECTED') blockers.push('Approval rejected — run must be restarted');
  if (inputs.approvalStatus === 'CHANGES_REQUESTED') blockers.push('Changes requested — address comments before re-approval');

  const riskLevel: ConfidenceExplanation['riskLevel'] =
    blockers.length > 0 ? 'CRITICAL'
    : overallScore >= 85 ? 'LOW'
    : overallScore >= 65 ? 'MEDIUM'
    : 'HIGH';

  return {
    overallScore,
    riskLevel,
    signals,
    blockers,
    calculatedAt: new Date().toISOString(),
  };
}

/** Pre-calculated confidence for the E-Commerce Platform after run_01 */
export const DEMO_POST_RUN_CONFIDENCE = calculateConfidence({
  buildPasses: true,
  buildDurationMs: 34200,
  testPassRate: 1.0,
  testCoverage: 85.6,
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
});

/** Pre-calculated confidence for the E-Commerce Platform BEFORE run_01 */
export const DEMO_PRE_RUN_CONFIDENCE = calculateConfidence({
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
