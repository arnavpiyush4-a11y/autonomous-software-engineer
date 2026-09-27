'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';
import { WORKFLOW_STAGES, type WorkflowState } from '@/lib/types';
import {
  ECOMMERCE_SCOPE,
  ECOMMERCE_TASK_PLAN,
  ECOMMERCE_AGENT_LOGS,
  ECOMMERCE_CODE_CHANGES,
  ECOMMERCE_REVIEW_FINDINGS,
  ECOMMERCE_RELEASE_RISK,
} from '@/lib/phase3-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type RunPhase =
  | 'IDLE'           // task input
  | 'SCOPING'        // showing scope preview
  | 'PLANNING'       // showing task plan
  | 'RUNNING'        // executing stages
  | 'APPROVAL_REQUIRED'  // waiting for explicit human approval
  | 'CONTINUING'     // after approval, continuing
  | 'COMPLETED';

// ─── Simulated stage logs ─────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  ts: string;
  stage: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  label: 'ANALYZED' | 'PROPOSED' | 'SIMULATED' | 'REQUIRES_APPROVAL' | null;
  message: string;
}

const STAGE_LOGS: Record<string, LogEntry[]> = {
  'repo-analysis': [
    { id: 1,  ts: '14:00:05', stage: 'Arch Analyst', level: 'INFO',    label: 'ANALYZED', message: 'Scanned 45 files, 28,540 lines of code' },
    { id: 2,  ts: '14:00:18', stage: 'Arch Analyst', level: 'INFO',    label: 'ANALYZED', message: 'Languages: TypeScript 71%, JavaScript 18%, CSS 8%' },
    { id: 3,  ts: '14:00:31', stage: 'Arch Analyst', level: 'SUCCESS', label: 'ANALYZED', message: 'Frameworks: React 18, Express 4.x, Prisma, Jest, Redis' },
    { id: 4,  ts: '14:00:47', stage: 'Arch Analyst', level: 'SUCCESS', label: 'ANALYZED', message: 'Architecture: 5 components mapped (Frontend, API, Auth, DB, Cache)' },
  ],
  'issue-detection': [
    { id: 5,  ts: '14:00:48', stage: 'Debugger',     level: 'INFO',    label: 'ANALYZED', message: 'Running static analysis across 45 source files…' },
    { id: 6,  ts: '14:01:02', stage: 'Debugger',     level: 'ERROR',   label: 'ANALYZED', message: 'CRITICAL: src/auth/password-reset.ts:67 — reset token not invalidated after use' },
    { id: 7,  ts: '14:01:15', stage: 'Debugger',     level: 'WARN',    label: 'ANALYZED', message: 'HIGH: src/cart/discount.ts:23 — floating-point rounding error in discount calc' },
    { id: 8,  ts: '14:01:28', stage: 'Debugger',     level: 'WARN',    label: 'ANALYZED', message: 'HIGH: docker-compose.yml:28 — healthcheck targeting "/" not "/api/v1/health"' },
    { id: 9,  ts: '14:02:05', stage: 'Debugger',     level: 'WARN',    label: 'ANALYZED', message: '6 total: 1 CRITICAL · 3 HIGH · 1 MEDIUM · 1 LOW' },
  ],
  'test-execution': [
    { id: 10, ts: '14:02:32', stage: 'Test Eng',     level: 'INFO',    label: 'SIMULATED', message: 'npm test (Jest) — recording baseline results' },
    { id: 11, ts: '14:03:00', stage: 'Test Eng',     level: 'ERROR',   label: 'SIMULATED', message: 'FAIL src/cart/__tests__/discount.test.ts — 3 failures (floating-point)' },
    { id: 12, ts: '14:03:15', stage: 'Test Eng',     level: 'ERROR',   label: 'SIMULATED', message: '● Expected 90.00, received 89.999999999' },
    { id: 13, ts: '14:04:18', stage: 'Test Eng',     level: 'WARN',    label: 'SIMULATED', message: 'Baseline: 142/145 passing · coverage 71.4% (below 80% threshold)' },
  ],
  'coverage-analysis': [
    { id: 14, ts: '14:04:34', stage: 'Test Eng',     level: 'WARN',    label: 'ANALYZED', message: 'Critical gap: src/auth/password-reset.ts lines 45-89 — 0% coverage' },
    { id: 15, ts: '14:04:48', stage: 'Test Eng',     level: 'WARN',    label: 'ANALYZED', message: 'Gap: src/cart/promo-codes.ts lines 112-156 — no concurrent-access tests' },
    { id: 16, ts: '14:05:02', stage: 'Test Eng',     level: 'INFO',    label: 'ANALYZED', message: '3 critical paths require new tests to reach 80% threshold' },
  ],
  'dependency-audit': [
    { id: 17, ts: '14:05:03', stage: 'Security',     level: 'INFO',    label: 'ANALYZED', message: 'Auditing 87 dependencies (prod + dev)…' },
    { id: 18, ts: '14:05:14', stage: 'Security',     level: 'ERROR',   label: 'ANALYZED', message: 'CRITICAL CVE: jsonwebtoken@8.5.1 — CVE-2022-23529 (CVSS 7.6) — token bypass' },
    { id: 19, ts: '14:05:27', stage: 'Security',     level: 'WARN',    label: 'ANALYZED', message: '12 non-critical packages have available updates' },
    { id: 20, ts: '14:05:39', stage: 'Security',     level: 'INFO',    label: 'PROPOSED', message: 'Upgrade path: jsonwebtoken 8.5.1 → 9.0.2 (patch CVE)' },
  ],
  'doc-validation': [
    { id: 21, ts: '14:05:40', stage: 'Docs',         level: 'INFO',    label: 'ANALYZED', message: 'Scanning 8 documentation files against live API routes…' },
    { id: 22, ts: '14:06:02', stage: 'Docs',         level: 'WARN',    label: 'ANALYZED', message: 'MISMATCH: README:143 /forgot-password ≠ implementation /reset-password' },
    { id: 23, ts: '14:06:24', stage: 'Docs',         level: 'INFO',    label: 'ANALYZED', message: 'Documentation review complete: 1 contract mismatch found' },
  ],
  'fix-generation': [
    { id: 24, ts: '14:06:48', stage: 'Debugger',     level: 'INFO',    label: 'PROPOSED', message: 'src/auth/password-reset.ts — add token.usedAt check + markTokenAsUsed()' },
    { id: 25, ts: '14:07:10', stage: 'Debugger',     level: 'INFO',    label: 'PROPOSED', message: 'src/cart/discount.ts — replace float with integer-cent arithmetic' },
    { id: 26, ts: '14:07:30', stage: 'Security',     level: 'INFO',    label: 'PROPOSED', message: 'package.json — jsonwebtoken 8.5.1 → 9.0.2' },
    { id: 27, ts: '14:07:55', stage: 'Debugger',     level: 'INFO',    label: 'PROPOSED', message: 'docker-compose.yml — HEALTH_CHECK_PATH=/api/v1/health' },
    { id: 28, ts: '14:08:20', stage: 'Docs',         level: 'INFO',    label: 'PROPOSED', message: 'README.md — corrected endpoint /forgot-password → /reset-password' },
    { id: 29, ts: '14:09:58', stage: 'Debugger',     level: 'SUCCESS', label: 'SIMULATED', message: '5 fixes staged to branch fix/releasepilot-run — pending validation' },
  ],
  'test-writing': [
    { id: 30, ts: '14:10:30', stage: 'Test Eng',     level: 'SUCCESS', label: 'PROPOSED', message: 'Created: src/auth/__tests__/password-reset.test.ts (3 regression tests)' },
    { id: 31, ts: '14:11:05', stage: 'Test Eng',     level: 'SUCCESS', label: 'PROPOSED', message: 'Created: src/checkout/__tests__/edge-cases.test.ts (2 edge-case tests)' },
    { id: 32, ts: '14:12:44', stage: 'Test Eng',     level: 'SUCCESS', label: 'PROPOSED', message: '5 new tests generated — projected coverage: 71.4% → 85.6%' },
  ],
  'validation': [
    { id: 33, ts: '14:12:45', stage: 'Test Eng',     level: 'INFO',    label: 'SIMULATED', message: 'Running full test suite with all fixes applied…' },
    { id: 34, ts: '14:13:10', stage: 'Test Eng',     level: 'SUCCESS', label: 'SIMULATED', message: 'PASS src/auth/__tests__/password-reset.test.ts (3/3)' },
    { id: 35, ts: '14:13:40', stage: 'Test Eng',     level: 'SUCCESS', label: 'SIMULATED', message: 'PASS src/cart/__tests__/discount.test.ts (3/3) — rounding fix verified' },
    { id: 36, ts: '14:14:45', stage: 'Test Eng',     level: 'SUCCESS', label: 'SIMULATED', message: '145/145 tests passing · coverage 85.6% · zero regressions' },
  ],
  'report-generation': [
    { id: 37, ts: '14:14:53', stage: 'Release Mgr',  level: 'INFO',    label: 'ANALYZED', message: 'Calculating release risk score…' },
    { id: 38, ts: '14:15:01', stage: 'Release Mgr',  level: 'SUCCESS', label: 'ANALYZED', message: 'Health score: 67 → 94 (+27 points)' },
    { id: 39, ts: '14:15:05', stage: 'Release Mgr',  level: 'SUCCESS', label: 'ANALYZED', message: 'Release readiness: 94/100 — risk level: LOW' },
    { id: 40, ts: '14:15:08', stage: 'Release Mgr',  level: 'SUCCESS', label: 'ANALYZED', message: '🚀 Repository is production-ready for release v2.4.1' },
  ],
};

const STAGE_DURATIONS = [3000, 4500, 4000, 3000, 3000, 3000, 6000, 5000, 5000, 3000];
const LOG_INTERVAL = 700;

// ─── Sub-components ──────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Truncate text and append ellipsis only when truncation actually occurs. */
function truncateTask(text: string, max = 70): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}\u2026` : trimmed;
}

function ActionLabelBadge({ label }: { label: LogEntry['label'] }) {
  if (!label) return null;
  const cfg: Record<string, { bg: string; text: string }> = {
    ANALYZED:          { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
    PROPOSED:          { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa' },
    SIMULATED:         { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
    REQUIRES_APPROVAL: { bg: 'rgba(245,158,11,0.2)',   text: '#fbbf24' },
  };
  const c = cfg[label];
  return (
    <span className="text-2xs font-bold rounded px-1 py-0.5 flex-shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>
      {label.replace('_', ' ')}
    </span>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const colors = { INFO: '#9ca3af', WARN: '#fbbf24', ERROR: '#f87171', SUCCESS: '#34d399' };
  // BUG-07: use Unicode escapes to prevent encoding artifacts
  const pfx = { INFO: '  ', WARN: '\u26A0\uFE0F ', ERROR: '\u2717 ', SUCCESS: '\u2713 ' };
  return (
    <div className="flex items-start gap-2 py-0.5 text-xs font-mono">
      <span className="flex-shrink-0" style={{ color: '#4b5563', minWidth: '52px' }}>{entry.ts}</span>
      <span className="flex-shrink-0" style={{ color: '#374151', minWidth: '68px' }}>[{entry.stage}]</span>
      {entry.label && <ActionLabelBadge label={entry.label} />}
      <span style={{ color: colors[entry.level] }}>
        <span style={{ color: '#4b5563' }}>{pfx[entry.level]}</span>{entry.message}
      </span>
    </div>
  );
}

// ─── Scope Preview Panel ──────────────────────────────────────────────────────

function ScopePreview({ onConfirm }: { onConfirm: () => void }) {
  const s = ECOMMERCE_SCOPE;
  const riskColors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border p-5 relative overflow-hidden"
        style={{ borderColor: riskColors[s.estimatedRisk] + '40', background: `linear-gradient(135deg, ${riskColors[s.estimatedRisk]}08 0%, transparent 100%)` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Task Scope Analysis</h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xl">{s.task}</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
            style={{ backgroundColor: riskColors[s.estimatedRisk] + '20', color: riskColors[s.estimatedRisk] }}>
            {s.estimatedRisk} RISK
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-border-default">
          <p className="text-xs text-text-secondary leading-relaxed">{s.expectedBehavior}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Affected files */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Affected Files</h4>
          <ul className="space-y-1.5">
            {s.affectedFiles.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs">
                <span style={{ color: '#3b82f6' }}>→</span>
                <code className="text-xs font-mono text-text-secondary">{f}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Identified Risks</h4>
          <ul className="space-y-1.5">
            {s.risks.map((r) => {
              const isCritical = r.startsWith('CRITICAL');
              const isHigh = r.startsWith('HIGH');
              const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#f59e0b';
              return (
                <li key={r} className="text-xs flex items-start gap-2">
                  <span className="flex-shrink-0 font-bold" style={{ color }}>!</span>
                  <span className="text-text-secondary">{r}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Required tests */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 md:col-span-2">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Required Tests</h4>
          <ul className="space-y-1.5">
            {s.requiredTests.map((t) => (
              <li key={t} className="text-xs flex items-start gap-2">
                <span style={{ color: '#10b981' }}>✓</span>
                <code className="font-mono text-text-secondary">{t}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#3b82f6' }}>
          Review Task Plan →
        </button>
      </div>
    </div>
  );
}

// ─── Task Plan Panel ──────────────────────────────────────────────────────────

function TaskPlanPanel({ onStart }: { onStart: () => void }) {
  const plan = ECOMMERCE_TASK_PLAN;
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Stages', value: plan.totalStages },
            { label: 'Est. Duration', value: `~${plan.estimatedDurationMin} min` },
            { label: 'Workers', value: plan.parallelWorkers.length },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-bg-elevated border border-border-default">
              <p className="text-2xs text-text-muted mb-1">{s.label}</p>
              <p className="text-xl font-bold text-text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.parallelWorkers.map((w) => (
            <span key={w} className="text-xs px-2 py-1 rounded border text-text-secondary border-border-default bg-bg-elevated">
              {w}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {plan.stages.map((stage) => (
            <div key={stage.index}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border-default bg-bg-elevated hover:bg-bg-overlay transition-colors">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0"
                style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1.5px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                {stage.index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary">{stage.name}</p>
                <p className="text-2xs text-text-muted">{stage.worker} · ~{stage.estimatedDurationSec}s</p>
              </div>
              {stage.requiresApproval && (
                <span className="text-2xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                  ⏸ Approval
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart}
        className="w-full py-3 text-sm font-semibold text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
        style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
        </svg>
        Start Autonomous Run
      </button>
    </div>
  );
}

// ─── Explicit Approval Modal ──────────────────────────────────────────────────

interface ApprovalModalProps {
  onApprove: (action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', comment: string) => void;
  runId: string;
}

function ApprovalModal({ onApprove, runId }: ApprovalModalProps) {
  const [comment, setComment] = useState('');
  const [confirming, setConfirming] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    setConfirming(action);
    setApiError(null);
    try {
      const res = await fetch(`/api/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        const message = data.error ?? `Approval API returned ${res.status}`;
        setApiError(message);
        setConfirming(null);
        // Do NOT advance the workflow — the approval gate remains active
        return;
      }
      // Only advance the workflow when the API confirms success
      onApprove(action, comment);
    } catch (err) {
      // Network / fetch failure — approval gate must remain active
      const message = err instanceof Error ? err.message : 'Network error — approval could not be persisted';
      setApiError(message);
      setConfirming(null);
      // Do NOT advance the workflow
      return;
    }
    setConfirming(null);
  };

  return (
    <div className="rounded-xl border p-5 space-y-4"
      style={{ borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">⏸</span>
        <h3 className="text-sm font-bold text-status-warning">Human Approval Required</h3>
      </div>

      <div className="rounded-lg p-3 border border-border-default bg-bg-elevated text-xs text-text-secondary leading-relaxed">
        ReleasePilot has analyzed all 6 issues and proposed fixes. Before any file is written, you must explicitly approve these changes. No action has been taken yet.
      </div>

      {/* What will be changed */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Files to be modified</p>
        <ul className="space-y-1.5">
          {ECOMMERCE_CODE_CHANGES.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 text-xs py-1 px-2 rounded bg-bg-elevated">
              <code className="font-mono text-text-secondary">{c.filePath}</code>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-2xs" style={{ color: '#3b82f6' }}>+{c.linesAdded}</span>
                {c.linesRemoved > 0 && <span className="text-2xs" style={{ color: '#ef4444' }}>-{c.linesRemoved}</span>}
                {c.approvalRequired && (
                  <span className="text-2xs px-1 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>requires approval</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Impact + rollback */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3 border border-border-default bg-bg-elevated">
          <p className="text-2xs font-semibold text-text-muted mb-1">Potential Impact</p>
          <p className="text-xs text-text-secondary leading-relaxed">Auth flow changes affect all password-reset users. Discount fix changes pricing output. JWT upgrade may need re-signing config review.</p>
        </div>
        <div className="rounded-lg p-3 border border-border-default bg-bg-elevated">
          <p className="text-2xs font-semibold text-text-muted mb-1">Rollback Guidance</p>
          <p className="text-xs text-text-secondary leading-relaxed">All changes staged as a single Git commit on branch <code className="font-mono">fix/releasepilot-run</code>. Run <code className="font-mono">git revert HEAD</code> to undo.</p>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="text-xs font-semibold text-text-muted block mb-1.5">Review comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Add a note about your decision…"
          className="w-full text-xs rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
          style={{ backgroundColor: '#0d1117', border: '1px solid #1f2937', color: '#e6edf3' }}
        />
      </div>

      {/* API error — shown when approval could not be persisted */}
      {apiError && (
        <div className="rounded-lg p-3 border border-red-500/30 bg-red-950/30 text-xs text-red-400 leading-relaxed">
          ✗ Approval could not be saved: {apiError}. The approval gate is still active — please try again.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handleAction('APPROVED')}
          disabled={confirming !== null}
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#10b981' }}>
          {confirming === 'APPROVED' ? '…' : '✓ Approve & Apply'}
        </button>
        <button
          onClick={() => handleAction('CHANGES_REQUESTED')}
          disabled={confirming !== null}
          className="px-3 py-2.5 text-xs font-semibold rounded-lg hover:bg-bg-elevated border border-status-warning/30 text-status-warning disabled:opacity-50">
          Request Changes
        </button>
        <button
          onClick={() => handleAction('REJECTED')}
          disabled={confirming !== null}
          className="px-3 py-2.5 text-xs font-semibold rounded-lg hover:bg-status-danger/10 border border-status-danger/25 text-status-danger disabled:opacity-50">
          Reject
        </button>
      </div>
    </div>
  );
}

// ─── Main Inner Component ────────────────────────────────────────────────────

export default function NewRunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoId = searchParams.get('repo') ?? 'repo_ecommerce';
  const repo = MOCK_REPOSITORIES.find((r) => r.id === repoId) ?? MOCK_REPOSITORIES[0];

  const [phase, setPhase] = useState<RunPhase>('IDLE');
  const [taskInput, setTaskInput] = useState(
    'Prepare this project for release and resolve all issues necessary to make it production-ready.'
  );
  const [taskError, setTaskError] = useState('');
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const approvalResolveRef = useRef<((decision: string) => void) | null>(null);
  // New unique run ID is generated each time the user starts a run (see resetRun)
  const runIdRef = useRef(`run_live_${Date.now()}`);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((e: LogEntry) => setLogs((p) => [...p, e]), []);

  function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

  /** Reset all run state so the user can start again without a page reload. */
  function resetRun() {
    // Abort any pending approval promise so the old async chain exits cleanly
    if (approvalResolveRef.current) {
      approvalResolveRef.current('__RESET__');
      approvalResolveRef.current = null;
    }
    runningRef.current = false;
    runIdRef.current = `run_live_${Date.now()}`;
    setPhase('IDLE');
    setLogs([]);
    setCompletedStages([]);
    setCurrentStageIdx(-1);
    setApprovalDecision(null);
    setTaskError('');
  }

  async function startRun() {
    // BUG-17: validate task input before starting
    if (!taskInput.trim()) {
      setTaskError('Please enter a task before starting.');
      return;
    }
    setTaskError('');

    if (runningRef.current) return;
    runningRef.current = true;
    setPhase('RUNNING');
    setLogs([]);
    setCompletedStages([]);
    setCurrentStageIdx(-1);

    await sleep(600);
    // BUG-08: ellipsis only when text is actually truncated
    addLog({ id: -1, ts: '14:00:00', stage: 'Planner', level: 'INFO', label: null, message: `Task received \u2014 \u201c${truncateTask(taskInput)}\u201d` });
    await sleep(500);
    addLog({ id: -2, ts: '14:00:01', stage: 'Planner', level: 'INFO', label: 'ANALYZED', message: 'Scope: auth, cart, checkout, deps, docs — HIGH risk' });
    await sleep(500);
    addLog({ id: -3, ts: '14:00:02', stage: 'Planner', level: 'INFO', label: 'PROPOSED', message: 'Plan: 10 stages, 7 parallel workers, ~15 min estimated' });
    await sleep(800);

    for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
      const stageDef = WORKFLOW_STAGES[i];
      const stageLogs = STAGE_LOGS[stageDef.slug] ?? [];
      setCurrentStageIdx(i);

      for (const log of stageLogs) {
        addLog(log);
        await sleep(LOG_INTERVAL);
      }

      const consumed = stageLogs.length * LOG_INTERVAL;
      const remaining = Math.max(0, STAGE_DURATIONS[i] - consumed);
      await sleep(remaining);

      setCompletedStages((prev) => [...prev, i]);

      // Approval gate — after coverage-analysis, before fix-generation
      if (stageDef.slug === 'dependency-audit') {
        setPhase('APPROVAL_REQUIRED');
        addLog({
          id: 999, ts: '14:06:00', stage: 'Planner', level: 'WARN',
          label: 'REQUIRES_APPROVAL',
          message: '⏸ PAUSED — 5 file writes require human approval. No auto-approve.',
        });

        // Wait for EXPLICIT user decision — no timeout, no auto-approve
        const decision = await new Promise<string>((resolve) => {
          approvalResolveRef.current = resolve;
        });

        approvalResolveRef.current = null;

        // BUG-03/__RESET__: if the user resets mid-run, exit cleanly
        if (decision === '__RESET__') {
          runningRef.current = false;
          return;
        }

        if (decision === 'REJECTED') {
          setPhase('COMPLETED'); // show cancelled state
          addLog({ id: 1001, ts: '14:06:50', stage: 'Planner', level: 'ERROR', label: null, message: '\u2717 Run rejected by user \u2014 no changes applied' });
          setCurrentStageIdx(-1);
          runningRef.current = false;
          return;
        }

        if (decision === 'CHANGES_REQUESTED') {
          setPhase('COMPLETED');
          addLog({ id: 1001, ts: '14:06:50', stage: 'Planner', level: 'WARN', label: null, message: '\u26A0\uFE0F Changes requested \u2014 run blocked. Review comments and restart.' });
          setCurrentStageIdx(-1);
          runningRef.current = false;
          return;
        }

        // APPROVED
        setPhase('CONTINUING');
        addLog({ id: 1000, ts: '14:06:48', stage: 'Planner', level: 'SUCCESS', label: null, message: '\u2713 Approved by user \u2014 applying proposed fixes now' });
        await sleep(500);
        setPhase('RUNNING');
      }
    }

    setCurrentStageIdx(-1);
    setPhase('COMPLETED');
    runningRef.current = false;
  }

  function handleApprovalDecision(action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', comment: string) {
    setApprovalDecision(action);
    if (approvalResolveRef.current) {
      approvalResolveRef.current(action);
    }
  }

  const progressPct =
    completedStages.length === 0 && currentStageIdx === -1 ? 0
    : Math.round(((completedStages.length + (currentStageIdx >= 0 ? 0.5 : 0)) / WORKFLOW_STAGES.length) * 100);

  const isRunning = phase === 'RUNNING' || phase === 'CONTINUING';
  const isActive = ['RUNNING', 'CONTINUING', 'APPROVAL_REQUIRED'].includes(phase);
  const isDone = phase === 'COMPLETED';
  const isApproved = approvalDecision === 'APPROVED';

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar title="New Agent Run" subtitle={`${repo.name} · ${repo.defaultBranch}`} />

      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Phase breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          {([ ['IDLE', 'Configure'], ['SCOPING', 'Scope'], ['PLANNING', 'Plan'], ['RUNNING', 'Execute'], ['COMPLETED', 'Report'] ] as const).map(([p, label], i) => {
            const phases: RunPhase[] = ['IDLE', 'SCOPING', 'PLANNING', 'RUNNING', 'COMPLETED'];
            const currentIdx = phases.indexOf(phase === 'APPROVAL_REQUIRED' || phase === 'CONTINUING' ? 'RUNNING' : phase);
            const idx = phases.indexOf(p);
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const color = done ? '#10b981' : active ? '#3b82f6' : '#374151';
            return (
              <div key={p} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold"
                    style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="text-xs" style={{ color: active ? '#f9fafb' : done ? '#6b7280' : '#374151' }}>{label}</span>
                </div>
                {i < 4 && <div className="w-8 h-px" style={{ backgroundColor: color }} />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="xl:col-span-1 space-y-5">
            {/* Task input */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Task</h3>
              <textarea
                value={taskInput}
                onChange={(e) => { setTaskInput(e.target.value); if (taskError) setTaskError(''); }}
                disabled={phase !== 'IDLE'}
                rows={4}
                aria-describedby={taskError ? 'task-error' : undefined}
                aria-invalid={!!taskError}
                className="w-full text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none"
                style={{ backgroundColor: '#0d1117', border: `1px solid ${taskError ? '#ef4444' : '#1f2937'}`, color: '#e6edf3' }}
              />
              {/* BUG-17: inline validation error */}
              {taskError && (
                <p id="task-error" role="alert" className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{taskError}</p>
              )}

              {phase === 'IDLE' && (
                <button
                  onClick={() => {
                    if (!taskInput.trim()) { setTaskError('Please enter a task before starting.'); return; }
                    setTaskError('');
                    setPhase('SCOPING');
                  }}
                  className="w-full mt-3 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: '#3b82f6' }}>
                  Analyze Scope →
                </button>
              )}

              {isActive && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-text-primary">
                      {phase === 'APPROVAL_REQUIRED' ? '⏸ Awaiting approval'
                       : phase === 'CONTINUING' ? 'Applying fixes…'
                       : `Stage ${currentStageIdx + 1}/${WORKFLOW_STAGES.length}`}
                    </span>
                    <span className="text-xs font-mono font-semibold text-accent-blue">{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-overlay overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: phase === 'APPROVAL_REQUIRED' ? '#f59e0b' : '#3b82f6',
                        boxShadow: `0 0 10px ${phase === 'APPROVAL_REQUIRED' ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.4)'}`,
                      }} />
                  </div>
                </div>
              )}

              {isDone && (
                <div className="mt-3 p-3 rounded-lg text-center space-y-2"
                  style={{
                    backgroundColor: isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${isApproved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  <p className="text-sm font-semibold" style={{ color: isApproved ? '#10b981' : '#ef4444' }}>
                    {isApproved ? '\u2713 Run Completed' : approvalDecision === 'REJECTED' ? '\u2717 Run Rejected' : '\u26A0\uFE0F Changes Requested'}
                  </p>
                  {isApproved && (
                    <button onClick={() => router.push('/runs/run_01')} className="text-xs font-semibold text-accent-blue hover:underline block mx-auto">
                      View full report →
                    </button>
                  )}
                  {/* BUG-03: restart after terminal state */}
                  <button
                    onClick={resetRun}
                    className="text-xs font-semibold rounded-lg px-3 py-1.5 border transition-colors"
                    style={{ borderColor: 'rgba(75,85,99,0.5)', color: '#9ca3af', backgroundColor: 'rgba(31,41,55,0.6)' }}
                  >
                    {isApproved ? 'Start another run' : 'Try again'}
                  </button>
                </div>
              )}
            </div>

            {/* Approval gate */}
            {phase === 'APPROVAL_REQUIRED' && (
              <ApprovalModal runId={runIdRef.current} onApprove={handleApprovalDecision} />
            )}

            {/* Workflow stages */}
            {(isActive || isDone) && (
              <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default">
                  <h3 className="text-sm font-semibold text-text-primary">Stages</h3>
                </div>
                <div className="divide-y divide-border-default">
                  {WORKFLOW_STAGES.map((stage, i) => {
                    const done = completedStages.includes(i);
                    const active = currentStageIdx === i;
                    const color = done ? '#10b981' : active ? '#3b82f6' : '#374151';
                    return (
                      <div key={stage.slug} className={`flex items-center gap-3 px-4 py-2.5 ${active ? 'bg-accent-blue-glow' : ''}`}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0"
                          style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}>
                          {done ? '✓' : active ? '◉' : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${active ? 'text-accent-blue' : done ? 'text-text-secondary' : 'text-text-muted'}`}>
                            {stage.name}
                          </p>
                          <p className="text-2xs text-text-muted">{stage.worker}</p>
                        </div>
                        {active && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-blue" /></span>}
                        {stage.requiresApproval && !done && (
                          <span className="text-2xs px-1 rounded" style={{ color: '#fbbf24', backgroundColor: 'rgba(245,158,11,0.1)' }}>⏸</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="xl:col-span-2 space-y-5">
            {phase === 'IDLE' && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4 text-2xl">🎯</div>
                <h2 className="text-base font-semibold text-text-primary mb-2">Configure your task</h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto">Enter a natural-language engineering task. ReleasePilot will analyze scope, generate a plan, and walk you through each step.</p>
              </div>
            )}

            {phase === 'SCOPING' && <ScopePreview onConfirm={() => setPhase('PLANNING')} />}

            {phase === 'PLANNING' && <TaskPlanPanel onStart={startRun} />}

            {(isActive || isDone) && (
              <>
                {/* Live log terminal */}
                <div className="rounded-xl border border-border-default overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default" style={{ backgroundColor: '#0d1117' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                      <span className="text-xs font-mono text-text-muted ml-2">releasepilot — agent</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Label legend */}
                      {(['ANALYZED','PROPOSED','SIMULATED'] as const).map((l) => (
                        <ActionLabelBadge key={l} label={l} />
                      ))}
                      {isRunning && (
                        <span className="relative flex h-1.5 w-1.5 ml-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-blue" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 overflow-y-auto" style={{ backgroundColor: '#0d1117', minHeight: '380px', maxHeight: '500px' }}>
                    {logs.map((log, i) => <LogLine key={`${log.id}-${i}`} entry={log} />)}
                    <div ref={logEndRef} />
                    {isRunning && <span className="text-accent-blue animate-pulse">█</span>}
                  </div>
                </div>

                {/* Post-completion summary */}
                {isDone && isApproved && (
                  <div className="rounded-xl border border-status-success/25 p-5"
                    style={{ backgroundColor: 'rgba(16,185,129,0.05)' }}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-status-success mb-1">🚀 Run Completed</h3>
                        <p className="text-xs text-text-secondary">All 6 issues resolved · 145/145 tests passing · Release readiness: 94/100</p>
                      </div>
                      <button onClick={() => router.push('/runs/run_01')}
                        className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 flex-shrink-0"
                        style={{ backgroundColor: '#3b82f6' }}>
                        Full Report →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Health Score', before: '67', after: '94', color: '#10b981' },
                        { label: 'Issues Fixed', before: '0/6', after: '6/6', color: '#10b981' },
                        { label: 'Tests Passing', before: '142', after: '145', color: '#10b981' },
                        { label: 'Coverage', before: '71.4%', after: '85.6%', color: '#3b82f6' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg p-3 text-center"
                          style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <p className="text-2xs text-text-muted mb-1">{s.label}</p>
                          <p className="text-xs text-text-muted line-through">{s.before}</p>
                          <p className="text-sm font-bold" style={{ color: s.color }}>{s.after}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
