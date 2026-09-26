'use client';

import { useState } from 'react';
import type { CodeChange, ReviewFinding, ReleaseRiskReport, ApprovalRequest } from '@/lib/types';
import { SeverityBadge } from '@/components/ui/Badge';

// ─── Action Label Badge ───────────────────────────────────────────────────────

function ActionBadge({ label }: { label: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    ANALYZED:           { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
    PROPOSED:           { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa' },
    SIMULATED:          { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
    EXECUTED:           { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
    BLOCKED:            { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
    REQUIRES_APPROVAL:  { bg: 'rgba(245,158,11,0.2)',   text: '#fbbf24' },
  };
  const c = cfg[label] ?? cfg.ANALYZED;
  return (
    <span className="text-2xs font-bold rounded px-1.5 py-0.5"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {label.replace('_', ' ')}
    </span>
  );
}

// ─── Code Change Card ─────────────────────────────────────────────────────────

interface CodeChangeCardProps {
  change: CodeChange;
}

function DiffLine({ line }: { line: string }) {
  const color =
    line.startsWith('+') ? '#3fb950'
    : line.startsWith('-') ? '#f85149'
    : line.startsWith('@') ? '#79c0ff'
    : '#e6edf3';
  return <div style={{ color }}>{line}</div>;
}

function CodeChangeCard({ change }: CodeChangeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = change.changeType === 'CREATED' ? '#10b981' : change.changeType === 'DELETED' ? '#ef4444' : '#3b82f6';

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-bg-elevated transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span
          className="text-2xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}40` }}
        >
          {change.changeType}
        </span>
        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono text-text-primary">{change.filePath}</code>
          <p className="text-xs text-text-muted mt-0.5">{change.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {change.linesAdded > 0 && <span className="text-xs font-mono" style={{ color: '#3fb950' }}>+{change.linesAdded}</span>}
          {change.linesRemoved > 0 && <span className="text-xs font-mono" style={{ color: '#f85149' }}>-{change.linesRemoved}</span>}
          <ActionBadge label={change.actionLabel} />
          {change.approvalRequired && (
            <span className="text-2xs px-1 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>⏸ requires approval</span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-text-muted"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {expanded && (change.diffBefore !== undefined || change.diffAfter !== undefined) && (
        <div className="border-t border-border-default">
          {change.diffBefore !== undefined && change.diffAfter !== undefined ? (
            <div className="grid grid-cols-2">
              <div className="border-r border-border-default">
                <div className="px-3 py-1.5 border-b border-border-default" style={{ backgroundColor: '#1a0d0d' }}>
                  <span className="text-2xs font-semibold" style={{ color: '#f85149' }}>Before</span>
                </div>
                <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: '#0d0d0d', fontFamily: 'monospace', color: '#e6edf3', minHeight: '60px' }}>
                  {change.diffBefore}
                </pre>
              </div>
              <div>
                <div className="px-3 py-1.5 border-b border-border-default" style={{ backgroundColor: '#0d1a0d' }}>
                  <span className="text-2xs font-semibold" style={{ color: '#3fb950' }}>After</span>
                </div>
                <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: '#0d130d', fontFamily: 'monospace', color: '#e6edf3', minHeight: '60px' }}>
                  {change.diffAfter}
                </pre>
              </div>
            </div>
          ) : change.diffAfter !== undefined ? (
            <div>
              <div className="px-3 py-1.5 border-b border-border-default" style={{ backgroundColor: '#0d1a0d' }}>
                <span className="text-2xs font-semibold" style={{ color: '#3fb950' }}>New file</span>
              </div>
              <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: '#0d130d', fontFamily: 'monospace', color: '#e6edf3', maxHeight: '300px', overflowY: 'auto' }}>
                {change.diffAfter}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function CodeChangesPanel({ changes }: { changes: CodeChange[] }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Code Changes</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {changes.length} files · {changes.reduce((a, c) => a + c.linesAdded, 0)} additions · {changes.reduce((a, c) => a + c.linesRemoved, 0)} deletions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-muted">All changes are</span>
          <ActionBadge label="PROPOSED" />
          <span className="text-2xs text-text-muted">until approved</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {changes.map((c) => <CodeChangeCard key={c.id} change={c} />)}
      </div>
    </div>
  );
}

// ─── Review Findings Panel ────────────────────────────────────────────────────

export function ReviewFindingsPanel({ findings }: { findings: ReviewFinding[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const filtered = activeFilter === 'ALL' ? findings : findings.filter((f) => f.severity === activeFilter);

  const counts: Record<string, number> = {};
  for (const f of findings) { counts[f.severity] = (counts[f.severity] ?? 0) + 1; }

  const severityColor = (s: string) =>
    s === 'CRITICAL' ? '#ef4444'
    : s === 'HIGH' ? '#f97316'
    : s === 'MEDIUM' ? '#f59e0b'
    : s === 'LOW' ? '#3b82f6'
    : '#9ca3af';

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Review Findings</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {findings.length} total · {findings.filter((f) => f.fixApplied).length} fixed
            </p>
          </div>
          {/* Severity counts */}
          <div className="flex items-center gap-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) =>
              counts[sev] ? (
                <span key={sev} className="text-2xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: severityColor(sev) + '20', color: severityColor(sev) }}>
                  {counts[sev]} {sev}
                </span>
              ) : null
            )}
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1">
          {filters.map((f) => (
            <button key={f}
              onClick={() => setActiveFilter(f)}
              className="px-2.5 py-1 text-2xs font-medium rounded transition-colors"
              style={{
                backgroundColor: activeFilter === f ? (f === 'ALL' ? '#3b82f6' : severityColor(f)) + '20' : 'transparent',
                color: activeFilter === f ? (f === 'ALL' ? '#60a5fa' : severityColor(f)) : '#6b7280',
                border: `1px solid ${activeFilter === f ? (f === 'ALL' ? '#3b82f6' : severityColor(f)) + '40' : 'transparent'}`,
              }}>
              {f} {f !== 'ALL' && counts[f] ? `(${counts[f]})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border-default">
        {filtered.map((f) => {
          const isExp = expanded === f.id;
          return (
            <div key={f.id}
              className="px-5 py-4 cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setExpanded(isExp ? null : f.id)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={f.severity} />
                      <ActionBadge label={f.actionLabel} />
                    </div>
                    {f.fixApplied && (
                      <span className="text-2xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>✓ Fixed</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text-primary">{f.title}</p>
                  {f.filePath && (
                    <p className="text-2xs font-mono text-text-muted mt-1">
                      {f.filePath}{f.lineStart ? ` :${f.lineStart}–${f.lineEnd}` : ''}
                    </p>
                  )}

                  {isExp && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-text-secondary leading-relaxed">{f.description}</p>
                      {f.suggestion && (
                        <div className="rounded-lg p-3"
                          style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <p className="text-2xs font-semibold text-accent-blue mb-1">💡 Suggestion</p>
                          <p className="text-xs text-text-secondary">{f.suggestion}</p>
                        </div>
                      )}
                      {f.fixDiff && (
                        <div className="rounded-lg overflow-hidden">
                          <div className="px-3 py-1.5 border border-border-default rounded-t-lg bg-bg-overlay">
                            <span className="text-2xs font-semibold text-text-muted">Applied Diff</span>
                          </div>
                          <pre className="text-xs p-3 overflow-x-auto rounded-b-lg"
                            style={{ backgroundColor: '#0d1117', color: '#e6edf3', border: '1px solid #1f2937', borderTop: 'none', fontFamily: 'monospace' }}>
                            {f.fixDiff.split('\n').map((line, i) => (
                              <DiffLine key={i} line={line} />
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

// ─── Release Risk Panel ───────────────────────────────────────────────────────

export function ReleaseRiskPanel({ report }: { report: ReleaseRiskReport }) {
  const riskColors = {
    LOW:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
    MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
    HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
    CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
  };
  const rc = riskColors[report.riskLevel];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: rc.border }}>
      {/* Header with score */}
      <div className="p-5 relative" style={{ background: `linear-gradient(135deg, ${rc.bg} 0%, transparent 100%)` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Release Risk Score</h3>
            <p className="text-xs text-text-muted mt-0.5">Automated analysis — {new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black" style={{ color: rc.color }}>{report.overallScore}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: rc.color }}>{report.riskLevel} RISK</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-2 rounded-full bg-bg-overlay overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${report.overallScore}%`, backgroundColor: rc.color, boxShadow: `0 0 10px ${rc.color}60` }} />
        </div>
      </div>

      {/* Contributors */}
      <div className="px-5 py-4 border-t border-border-default">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Score Contributors</h4>
        <div className="space-y-2">
          {report.contributors.map((c) => {
            const impact = c.impact === 'POSITIVE' ? '#10b981' : c.impact === 'NEGATIVE' ? '#ef4444' : '#9ca3af';
            return (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs flex-shrink-0" style={{ color: impact }}>
                  {c.impact === 'POSITIVE' ? '↑' : c.impact === 'NEGATIVE' ? '↓' : '→'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-text-secondary">{c.name}</span>
                    <span className="text-2xs font-semibold" style={{ color: impact }}>
                      {c.weight > 0 ? '+' : ''}{c.weight}%
                    </span>
                  </div>
                  <p className="text-2xs text-text-muted">{c.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers + warnings */}
      {(report.blockers.length > 0 || report.warnings.length > 0) && (
        <div className="px-5 py-4 border-t border-border-default space-y-3">
          {report.blockers.length > 0 && (
            <div>
              <p className="text-2xs font-semibold text-status-danger uppercase tracking-wider mb-2">Blockers</p>
              {report.blockers.map((b) => <p key={b} className="text-xs text-status-danger">✗ {b}</p>)}
            </div>
          )}
          {report.warnings.length > 0 && (
            <div>
              <p className="text-2xs font-semibold text-status-warning uppercase tracking-wider mb-2">Warnings</p>
              {report.warnings.map((w) => <p key={w} className="text-xs text-text-secondary">⚠ {w}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="px-5 py-4 border-t border-border-default">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Recommendations</p>
        <ul className="space-y-1.5">
          {report.recommendations.map((r) => (
            <li key={r} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="text-accent-blue flex-shrink-0 mt-0.5">→</span>{r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Approval Status Panel ────────────────────────────────────────────────────

export function ApprovalStatusPanel({ request }: { request: ApprovalRequest }) {
  const statusConfig = {
    PENDING: { color: '#f59e0b', icon: '⏸', label: 'Pending' },
    APPROVED: { color: '#10b981', icon: '✓', label: 'Approved' },
    REJECTED: { color: '#ef4444', icon: '✗', label: 'Rejected' },
    CHANGES_REQUESTED: { color: '#f97316', icon: '◎', label: 'Changes Requested' },
  };
  const cfg = statusConfig[request.status];

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Approval Gate</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded"
            style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-text-muted mb-1">Reason for Approval</p>
          <p className="text-xs text-text-secondary">{request.reason}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-muted mb-2">Files Affected</p>
          <ul className="space-y-1">
            {request.filesAffected.map((f) => (
              <li key={f} className="text-xs font-mono text-text-secondary flex items-center gap-2">
                <span style={{ color: '#f59e0b' }}>✎</span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3 bg-bg-elevated border border-border-default">
            <p className="text-2xs font-semibold text-text-muted mb-1">Potential Impact</p>
            <p className="text-xs text-text-secondary leading-relaxed">{request.potentialImpact}</p>
          </div>
          <div className="rounded-lg p-3 bg-bg-elevated border border-border-default">
            <p className="text-2xs font-semibold text-text-muted mb-1">Rollback Guidance</p>
            <p className="text-xs text-text-secondary leading-relaxed">{request.rollbackGuidance}</p>
          </div>
        </div>
        {request.status !== 'PENDING' && (
          <div className="rounded-lg p-3" style={{ backgroundColor: cfg.color + '08', border: `1px solid ${cfg.color}25` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                {cfg.icon} {cfg.label} by {request.resolvedBy ?? 'Unknown'}
              </span>
              <span className="text-2xs text-text-muted">
                {request.resolvedAt ? new Date(request.resolvedAt).toLocaleString() : ''}
              </span>
            </div>
            {request.comment && <p className="text-xs text-text-secondary italic">"{request.comment}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}
