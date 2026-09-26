'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { WorkflowStage, Finding, TestResult, ReleaseReport } from '@/lib/types';
import { SeverityBadge } from '@/components/ui/Badge';
import { StageStatusChip } from '@/components/ui/StatusChip';
import ProgressBar from '@/components/ui/ProgressBar';
import { WORKFLOW_STAGES } from '@/lib/types';

// ─── Workflow Timeline ──────────────────────────────────────────────────────

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  currentStageIndex?: number;
}

function formatMs(ms?: number) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function WorkflowTimeline({ stages, currentStageIndex }: WorkflowTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Merge with static stage definitions for metadata
  const stagesWithDef = stages.map((s) => ({
    ...s,
    def: WORKFLOW_STAGES.find((d) => d.slug === s.slug),
  }));

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary">Workflow Timeline</h3>
        <p className="text-xs text-text-muted mt-0.5">
          {stages.filter((s) => s.status === 'DONE').length} / {stages.length} stages completed
        </p>
      </div>

      <div className="divide-y divide-border-default">
        {stagesWithDef.map((stage, i) => {
          const isActive = stage.status === 'ACTIVE' || i === (currentStageIndex ?? -1);
          const isDone = stage.status === 'DONE';
          const isFailed = stage.status === 'FAILED';
          const isExp = expanded === stage.id;

          const dotColor =
            isDone ? '#10b981'
            : isActive ? '#3b82f6'
            : isFailed ? '#ef4444'
            : '#374151';

          return (
            <div
              key={stage.id}
              className={`px-5 py-4 transition-colors duration-150 ${isActive ? 'bg-accent-blue-glow' : 'hover:bg-bg-elevated cursor-pointer'}`}
              onClick={() => !isActive && setExpanded(isExp ? null : stage.id)}
            >
              <div className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      backgroundColor: `${dotColor}20`,
                      borderColor: dotColor,
                      color: dotColor,
                    }}
                  >
                    {isDone ? '✓' : isFailed ? '✗' : isActive ? '◉' : `${i + 1}`}
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className="w-0.5 h-4"
                      style={{ backgroundColor: isDone ? '#10b981' : '#1f2937' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stage.def?.icon}</span>
                      <span className={`text-sm font-semibold ${isActive ? 'text-accent-blue' : 'text-text-primary'}`}>
                        {stage.name}
                      </span>
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-2xs text-text-muted font-mono">{formatMs(stage.durationMs)}</span>
                      <StageStatusChip status={stage.status} />
                    </div>
                  </div>

                  <p className="text-xs text-text-muted mt-1">{stage.description}</p>

                  {/* Expanded output */}
                  {(isExp || isActive) && stage.output && (
                    <div className="mt-3 rounded-lg bg-bg-elevated border border-border-default p-3">
                      <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-2">Output</p>
                      <div className="space-y-1">
                        {Object.entries(stage.output).map(([key, val]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-2xs text-text-muted font-mono min-w-[140px] flex-shrink-0">{key}:</span>
                            <span className="text-2xs text-text-secondary font-mono break-all">
                              {Array.isArray(val)
                                ? val.join(', ')
                                : typeof val === 'object'
                                ? JSON.stringify(val)
                                : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Findings Panel ─────────────────────────────────────────────────────────

interface FindingsPanelProps {
  findings: Finding[];
}

const CATEGORY_ICON: Record<Finding['category'], string> = {
  BUG: '🐛', TEST: '🧪', COVERAGE: '📊', DEPENDENCY: '📦',
  DOCUMENTATION: '📝', CONFIGURATION: '⚙️', SECURITY: '🔒', PERFORMANCE: '⚡',
};

export function FindingsPanel({ findings }: FindingsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const bySeverity = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Findings</h3>
            <p className="text-xs text-text-muted mt-0.5">{findings.length} detected · {findings.filter((f) => f.fixApplied).length} fixed</p>
          </div>
          <div className="flex items-center gap-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) =>
              bySeverity[sev] ? (
                <span
                  key={sev}
                  className="text-2xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      sev === 'CRITICAL' ? 'rgba(239,68,68,0.15)'
                      : sev === 'HIGH' ? 'rgba(249,115,22,0.15)'
                      : sev === 'MEDIUM' ? 'rgba(245,158,11,0.15)'
                      : 'rgba(59,130,246,0.15)',
                    color:
                      sev === 'CRITICAL' ? '#f87171'
                      : sev === 'HIGH' ? '#fb923c'
                      : sev === 'MEDIUM' ? '#fbbf24'
                      : '#60a5fa',
                  }}
                >
                  {bySeverity[sev]} {sev}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-border-default">
        {findings.map((f) => {
          const isExp = expanded === f.id;
          return (
            <div
              key={f.id}
              className="px-5 py-4 cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setExpanded(isExp ? null : f.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{CATEGORY_ICON[f.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary leading-snug">{f.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.fixApplied && (
                        <span className="text-2xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                          ✓ Fixed
                        </span>
                      )}
                      <SeverityBadge severity={f.severity} />
                    </div>
                  </div>

                  {f.filePath && (
                    <p className="text-2xs font-mono text-text-muted mt-1">
                      {f.filePath}
                      {f.lineStart && <span className="opacity-60"> :{f.lineStart}–{f.lineEnd}</span>}
                    </p>
                  )}

                  {isExp && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-text-secondary leading-relaxed">{f.description}</p>

                      {f.suggestion && (
                        <div className="rounded-lg bg-accent-blue-glow border border-accent-blue/20 p-3">
                          <p className="text-2xs font-semibold text-accent-blue mb-1">💡 Suggestion</p>
                          <p className="text-xs text-text-secondary leading-relaxed">{f.suggestion}</p>
                        </div>
                      )}

                      {f.fixDiff && (
                        <div className="rounded-lg overflow-hidden">
                          <div className="px-3 py-1.5 bg-bg-overlay border border-border-default rounded-t-lg">
                            <span className="text-2xs font-semibold text-text-muted">Applied Diff</span>
                          </div>
                          <pre
                            className="text-xs p-3 overflow-x-auto rounded-b-lg"
                            style={{ backgroundColor: '#0d1117', color: '#e6edf3', border: '1px solid #1f2937', borderTop: 'none', fontFamily: 'monospace' }}
                          >
                            {f.fixDiff.split('\n').map((line, i) => (
                              <div
                                key={i}
                                style={{
                                  color: line.startsWith('+') ? '#3fb950'
                                    : line.startsWith('-') ? '#f85149'
                                    : line.startsWith('@') ? '#79c0ff'
                                    : '#e6edf3',
                                }}
                              >
                                {line}
                              </div>
                            ))}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Test Results Panel ──────────────────────────────────────────────────────

interface TestResultsPanelProps {
  results: TestResult[];
}

export function TestResultsPanel({ results }: TestResultsPanelProps) {
  const before = results.find((r) => r.snapshot);
  const after = results.find((r) => !r.snapshot);

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary">Test Results</h3>
        <p className="text-xs text-text-muted mt-0.5">Before &amp; after comparison</p>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[before, after].map((r, idx) => {
          if (!r) return null;
          const label = idx === 0 ? 'Before' : 'After';
          const passRate = r.totalTests > 0 ? Math.round((r.passing / r.totalTests) * 100) : 0;
          const color = r.failing === 0 ? '#10b981' : '#f59e0b';

          return (
            <div
              key={r.id}
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: idx === 0 ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
                borderColor: idx === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: idx === 0 ? '#f87171' : '#34d399' }}>
                  {label}
                </span>
                <span className="text-2xs text-text-muted font-mono">
                  {r.durationMs ? `${Math.round(r.durationMs / 1000)}s` : '—'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-2xs text-text-muted mb-0.5">Total</p>
                  <p className="text-xl font-bold text-text-primary">{r.totalTests}</p>
                </div>
                <div>
                  <p className="text-2xs text-text-muted mb-0.5">Passing</p>
                  <p className="text-xl font-bold" style={{ color: '#10b981' }}>{r.passing}</p>
                </div>
                <div>
                  <p className="text-2xs text-text-muted mb-0.5">Failing</p>
                  <p className="text-xl font-bold" style={{ color: r.failing > 0 ? '#ef4444' : '#6b7280' }}>
                    {r.failing}
                  </p>
                </div>
              </div>

              <ProgressBar value={passRate} color={r.failing === 0 ? 'green' : 'amber'} size="sm" showLabel label="Pass rate" />

              {r.coverage !== undefined && (
                <div className="mt-2">
                  <ProgressBar value={r.coverage} color="blue" size="sm" showLabel label="Coverage" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {before && after && (
        <div className="px-5 pb-5">
          <div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <p className="text-xs font-semibold text-status-success mb-2">✓ Improvements</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tests Fixed', value: `+${after.passing - before.passing}` },
                { label: 'Failures Resolved', value: `-${before.failing - after.failing}` },
                { label: 'Coverage Gain', value: `+${((after.coverage ?? 0) - (before.coverage ?? 0)).toFixed(1)}%` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xs text-text-muted">{item.label}</p>
                  <p className="text-sm font-bold text-status-success">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Release Report Panel ────────────────────────────────────────────────────

interface ReleaseReportPanelProps {
  report: ReleaseReport;
}

export function ReleaseReportPanel({ report }: ReleaseReportPanelProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'changelog' | 'notes' | 'checklist'>('summary');

  const CHECKLIST = [
    { item: 'All tests passing', done: true },
    { item: 'Critical security vulnerabilities resolved', done: true },
    { item: 'Dependencies audited and updated', done: true },
    { item: 'Documentation up to date', done: true },
    { item: 'Docker healthcheck configured', done: true },
    { item: 'Coverage threshold met (≥80%)', done: true },
    { item: 'Changelog written', done: true },
    { item: 'Release notes drafted', done: true },
    { item: '12 outdated dependencies (non-critical) — review in next sprint', done: false },
    { item: 'Rate limiting on /auth/reset-password (recommended)', done: false },
  ];

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-border-default relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.05) 100%)' }}
      >
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Release Report</h3>
            <p className="text-xs text-text-muted mt-0.5">Autonomous engineering summary</p>
          </div>
          <div className="text-right">
            <p className="text-2xs text-text-muted">Release Readiness</p>
            <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
              {report.releaseReadiness}
              <span className="text-sm font-medium text-text-muted">/100</span>
            </p>
          </div>
        </div>

        {/* Before/after score */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 text-center p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-2xs text-text-muted">Health Before</p>
            <p className="text-xl font-bold" style={{ color: '#f87171' }}>{report.healthScoreBefore}</p>
          </div>
          <div className="text-text-muted text-lg">→</div>
          <div className="flex-1 text-center p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-2xs text-text-muted">Health After</p>
            <p className="text-xl font-bold" style={{ color: '#34d399' }}>{report.healthScoreAfter}</p>
          </div>
          <div className="text-center">
            <p className="text-2xs text-text-muted">Δ Score</p>
            <p className="text-xl font-bold" style={{ color: '#10b981' }}>
              +{report.healthScoreAfter - report.healthScoreBefore}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-default">
        {(['summary', 'changelog', 'notes', 'checklist'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue-glow'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Findings Found', value: report.findingsFound, color: '#f59e0b' },
                { label: 'Findings Fixed', value: report.findingsFixed, color: '#10b981' },
                { label: 'Tests Before', value: `${report.testPassingBefore}/${report.testPassingBefore + report.testFailingBefore}`, color: '#f87171' },
                { label: 'Tests After', value: `${report.testPassingAfter}/${report.testPassingAfter + report.testFailingAfter}`, color: '#34d399' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-bg-elevated border border-border-default">
                  <p className="text-2xs text-text-muted mb-1">{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-text-primary mb-2">Recommendations</p>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-accent-blue font-bold flex-shrink-0 mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'changelog' && (
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: '#e6edf3', fontFamily: 'inherit' }}
          >
            {report.changelog}
          </pre>
        )}

        {activeTab === 'notes' && (
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: '#e6edf3', fontFamily: 'inherit' }}
          >
            {report.releaseNotes}
          </pre>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: item.done ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.1)',
                    border: `1px solid ${item.done ? 'rgba(16,185,129,0.4)' : 'rgba(107,114,128,0.3)'}`,
                  }}
                >
                  {item.done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-2xs text-text-muted">—</span>
                  )}
                </div>
                <span className={`text-xs ${item.done ? 'text-text-primary' : 'text-text-muted'}`}>
                  {item.item}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
