import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import { MOCK_RUNS, MOCK_REPOSITORIES } from '@/lib/mock-data';
import StatusChip from '@/components/ui/StatusChip';
import { WORKFLOW_STAGES } from '@/lib/types';
import type { AgentRun } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Map repo IDs to names
const REPO_NAMES = Object.fromEntries(MOCK_REPOSITORIES.map((r) => [r.id, r.name]));

function WorkflowMiniTimeline({ run }: { run: AgentRun }) {
  // For completed runs, all stages are done; for running, simulate progress
  const stagesCount = WORKFLOW_STAGES.length;
  const completedStages =
    run.status === 'COMPLETED' ? stagesCount
    : run.status === 'RUNNING' ? 4
    : run.status === 'FAILED' ? 2
    : 0;

  return (
    <div className="flex items-center gap-0.5">
      {WORKFLOW_STAGES.map((stage, i) => {
        let color = '#1f2937';
        if (i < completedStages) color = '#10b981';
        else if (i === completedStages && run.status === 'RUNNING') color = '#3b82f6';
        else if (run.status === 'FAILED' && i === completedStages) color = '#ef4444';

        return (
          <div
            key={stage.slug}
            className="h-1.5 rounded-full flex-1 min-w-0"
            style={{ backgroundColor: color }}
            title={stage.name}
          />
        );
      })}
    </div>
  );
}

function RunCard({ run }: { run: AgentRun }) {
  const repoName = REPO_NAMES[run.repositoryId] ?? run.repositoryId;
  const isCompleted = run.status === 'COMPLETED';

  return (
    <div className="group rounded-xl border border-border-default bg-bg-surface hover:border-border-subtle transition-all duration-150 hover:-translate-y-0.5 flex flex-col">
      <Link href={`/runs/${run.id}`} className="block p-5 flex-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusChip status={run.status} size="sm" />
              <span className="text-xs text-text-muted capitalize">{run.triggeredBy}</span>
              {run.commitSha && (
                <code className="text-2xs font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                  {run.commitSha.slice(0, 7)}
                </code>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
              {repoName}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 font-mono">branch: {run.branch}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {run.startedAt && (
              <p className="text-xs text-text-muted">{formatDate(run.startedAt)}</p>
            )}
            {run.durationMs && (
              <p className="text-xs font-mono text-text-muted mt-0.5">{formatDuration(run.durationMs)}</p>
            )}
          </div>
        </div>

        {/* Workflow timeline */}
        <WorkflowMiniTimeline run={run} />

        {/* Summary */}
        {run.summary && (
          <p className="text-xs text-text-secondary mt-3 leading-relaxed line-clamp-2">
            {run.summary}
          </p>
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-4 pt-3 border-t border-border-default">
        <span className="text-2xs text-text-muted">
          {WORKFLOW_STAGES.length} stages
        </span>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <Link
              href={`/runs/${run.id}/deploy`}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Deploy →
            </Link>
          )}
          <Link
            href={`/runs/${run.id}`}
            className="text-xs font-semibold text-accent-blue hover:text-blue-400 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RunsPage() {
  const runs = [...MOCK_RUNS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const completed = runs.filter((r) => r.status === 'COMPLETED').length;
  const running = runs.filter((r) => r.status === 'RUNNING').length;
  const failed = runs.filter((r) => r.status === 'FAILED').length;

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar title="Agent Runs" subtitle={`${runs.length} total runs · ${running} active`} />

      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Summary chips */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {[
            { label: 'All Runs', count: runs.length, active: true },
            { label: 'Completed', count: completed, color: '#10b981' },
            { label: 'Running', count: running, color: '#3b82f6' },
            { label: 'Failed', count: failed, color: '#ef4444' },
          ].map((f) => (
            <button
              key={f.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                f.active
                  ? 'bg-accent-blue text-white border-accent-blue'
                  : 'text-text-secondary border-border-default hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {f.label}
              <span
                className="text-2xs font-bold px-1.5 py-0.5 rounded-full"
                style={
                  f.active
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }
                    : { backgroundColor: 'rgba(107,114,128,0.2)', color: '#9ca3af' }
                }
              >
                {f.count}
              </span>
            </button>
          ))}

          {/* Workflow legend */}
          <div className="ml-auto flex items-center gap-3">
            {[
              { label: 'Completed', color: '#10b981' },
              { label: 'Active', color: '#3b82f6' },
              { label: 'Pending', color: '#1f2937' },
              { label: 'Failed', color: '#ef4444' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-2xs text-text-muted">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Run cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      </div>
    </div>
  );
}
