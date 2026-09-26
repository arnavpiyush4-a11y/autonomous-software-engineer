import { notFound } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import {
  getRunById,
  getFindingsByRunId,
  getTestResultsByRunId,
  MOCK_REPOSITORIES,
  MOCK_RELEASE_REPORT,
  ECOMMERCE_STAGES,
} from '@/lib/mock-data';
import {
  getPhase3RunById,
  getCodeChangesByRunId,
  getReviewFindingsByRunId,
  getReleaseRiskByRunId,
  getApprovalRequestByRunId,
  getPhase3TestResultsByRunId,
} from '@/lib/phase3-data';
import StatusChip from '@/components/ui/StatusChip';
import {
  WorkflowTimeline,
  FindingsPanel,
  TestResultsPanel,
  ReleaseReportPanel,
} from '@/components/runs/RunDetailPanels';
import {
  CodeChangesPanel,
  ReviewFindingsPanel,
  ReleaseRiskPanel,
  ApprovalStatusPanel,
} from '@/components/runs/Phase3Panels';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms?: number) {
  if (!ms) return '—';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Scope Summary Card ──────────────────────────────────────────────────────

function ScopeSummaryCard({ run }: { run: Awaited<ReturnType<typeof getPhase3RunById>> }) {
  if (!run?.scopeSummary) return null;
  const s = run.scopeSummary;
  const riskColors = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
  const color = riskColors[s.estimatedRisk];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '30' }}>
      <div className="px-5 py-3 border-b border-border-default bg-bg-surface flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Scope Summary</h3>
          <p className="text-xs text-text-muted mt-0.5">Analyzed before execution</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded"
          style={{ backgroundColor: color + '20', color }}>
          {s.estimatedRisk} RISK
        </span>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4 bg-bg-surface">
        <div>
          <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-2">Affected Files</p>
          <ul className="space-y-1">
            {s.affectedFiles.map((f) => (
              <li key={f} className="text-xs font-mono text-text-secondary">{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-2">Identified Risks</p>
          <ul className="space-y-1">
            {s.risks.slice(0, 4).map((r) => (
              <li key={r} className="text-xs text-text-secondary flex items-start gap-1.5">
                <span className="flex-shrink-0" style={{ color: r.startsWith('CRITICAL') ? '#ef4444' : '#f97316' }}>!</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Tab navigation ──────────────────────────────────────────────────────────

type TabId = 'overview' | 'changes' | 'findings' | 'tests' | 'risk' | 'approval';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RunDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Try Phase 3 data first, fall back to legacy
  const p3Run = getPhase3RunById(id);
  const legacyRun = getRunById(id);
  if (!p3Run && !legacyRun) notFound();

  const repo = MOCK_REPOSITORIES.find((r) => r.id === (p3Run ?? legacyRun)!.repositoryId);

  // Phase 3 data
  const codeChanges = getCodeChangesByRunId(id);
  const reviewFindings = getReviewFindingsByRunId(id);
  const releaseRisk = getReleaseRiskByRunId(id);
  const approvalRequest = getApprovalRequestByRunId(id);
  const p3TestResults = getPhase3TestResultsByRunId(id);

  // Legacy data (fallback)
  const legacyFindings = getFindingsByRunId(id);
  const legacyTestResults = getTestResultsByRunId(id);
  const releaseReport = id === 'run_01' ? MOCK_RELEASE_REPORT : legacyRun?.releaseReport;
  const stages = p3Run?.stages ?? legacyRun?.stages ?? (id === 'run_01' ? ECOMMERCE_STAGES : []);

  const run = p3Run ?? legacyRun!;
  const status = run.status;
  const task = 'task' in run ? run.task : 'Agent run';

  const testResults = p3TestResults.length > 0 ? p3TestResults : legacyTestResults;

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar
        title={`Run #${id.replace('run_', '')}`}
        subtitle={repo?.name ?? run.repositoryId}
      />

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Run hero */}
        <div
          className="rounded-xl border border-border-default p-6 relative overflow-hidden"
          style={{
            background:
              status === 'COMPLETED'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.04) 100%)'
                : status === 'RUNNING'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusChip status={status} />
                {repo && (
                  <Link href={`/repositories/${repo.id}`} className="text-sm font-semibold text-accent-blue hover:underline">
                    {repo.name}
                  </Link>
                )}
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs font-mono text-text-muted">branch: {run.branch}</span>
                {run.commitSha && (
                  <>
                    <span className="text-xs text-text-muted">·</span>
                    <code className="text-xs font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                      {run.commitSha.slice(0, 7)}
                    </code>
                  </>
                )}
              </div>
              <p className="text-xs text-text-muted mb-1 font-medium">Task:</p>
              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">{task}</p>
              {run.summary && (
                <p className="text-xs text-text-muted mt-2 max-w-2xl leading-relaxed italic">"{run.summary}"</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-4">
              {status === 'COMPLETED' && (
                <Link
                  href={`/runs/${id}/deploy`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Deploy Preparation →
                </Link>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xs text-text-muted uppercase tracking-wider">Started</p>
                  <p className="text-xs font-medium text-text-primary mt-0.5">{formatDate(run.startedAt)}</p>
                </div>
                <div>
                  <p className="text-2xs text-text-muted uppercase tracking-wider">Duration</p>
                  <p className="text-xs font-medium text-text-primary mt-0.5">{formatDuration(run.durationMs)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick metrics */}
          {status === 'COMPLETED' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 pt-5 border-t border-border-default">
              {[
                { label: 'Stages', value: `${stages.filter((s) => s.status === 'DONE').length}/${stages.length}` },
                { label: 'Code Changes', value: codeChanges.length || legacyFindings.length, color: codeChanges.length > 0 ? '#3b82f6' : undefined },
                { label: 'Findings', value: reviewFindings.length || legacyFindings.length, color: '#f59e0b' },
                { label: 'Fixed', value: (reviewFindings.filter((f) => f.fixApplied).length || legacyFindings.filter((f) => f.fixApplied).length), color: '#10b981' },
                { label: 'Release Ready', value: releaseRisk ? `${releaseRisk.overallScore}%` : releaseReport ? `${releaseReport.releaseReadiness}%` : '—', color: '#10b981' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xs text-text-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: stat.color ?? '#f9fafb' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: workflow timeline */}
          <div className="xl:col-span-1 space-y-5">
            {stages.length > 0 ? (
              <WorkflowTimeline stages={stages} />
            ) : (
              <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
                <p className="text-sm text-text-muted">Workflow stages not available for this run</p>
              </div>
            )}

            {/* Scope summary */}
            {p3Run?.scopeSummary && <ScopeSummaryCard run={p3Run} />}
          </div>

          {/* Right: Phase 3 panels */}
          <div className="xl:col-span-2 space-y-6">
            {/* Approval status */}
            {approvalRequest && <ApprovalStatusPanel request={approvalRequest} />}

            {/* Code changes (Phase 3) or legacy findings */}
            {codeChanges.length > 0
              ? <CodeChangesPanel changes={codeChanges} />
              : legacyFindings.length > 0 && <FindingsPanel findings={legacyFindings} />
            }

            {/* Review findings (Phase 3) — shown alongside code changes */}
            {reviewFindings.length > 0 && <ReviewFindingsPanel findings={reviewFindings} />}

            {/* Test results */}
            {testResults.length > 0 && <TestResultsPanel results={testResults} />}

            {/* Release risk (Phase 3) */}
            {releaseRisk && <ReleaseRiskPanel report={releaseRisk} />}

            {/* Legacy release report (fallback) */}
            {!releaseRisk && releaseReport && <ReleaseReportPanel report={releaseReport} />}

            {/* Empty state */}
            {codeChanges.length === 0 && legacyFindings.length === 0 && reviewFindings.length === 0 && testResults.length === 0 && !releaseRisk && !releaseReport && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                    <circle cx="12" cy="12" r="10" /><polyline points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">
                  {status === 'RUNNING' ? 'Run In Progress' : 'No Data Yet'}
                </p>
                <p className="text-xs text-text-muted">
                  {status === 'RUNNING'
                    ? 'Findings and results will appear as stages complete.'
                    : 'This run has no detailed output data.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
