import Link from 'next/link';
import type { AgentRun } from '@/lib/types';
import StatusChip from '@/components/ui/StatusChip';
import { WORKFLOW_STAGES } from '@/lib/types';

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconGitBranch() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remaining}s`;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date('2024-03-18T16:00:00Z');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

interface ActiveRunCardProps {
  run: AgentRun;
}

function ActiveRunCard({ run }: ActiveRunCardProps) {
  // For the running run, show stage 4 (dependency-audit) as active
  const currentStageIndex = 4;
  const currentStage = WORKFLOW_STAGES[currentStageIndex];
  const progressPct = Math.round((currentStageIndex / WORKFLOW_STAGES.length) * 100);

  return (
    <div className="rounded-xl border border-accent-blue/20 bg-bg-surface p-5 relative overflow-hidden">
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue via-cyan-400 to-accent-blue animate-pulse" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {run.repository?.name ?? 'Notification Hub'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-2xs text-text-muted">
              <IconGitBranch />
              {run.branch}
            </span>
            <span className="text-2xs text-text-muted">·</span>
            <span className="flex items-center gap-1 text-2xs text-text-muted">
              <IconClock />
              {run.startedAt ? formatRelativeTime(run.startedAt) : '—'}
            </span>
          </div>
        </div>
        <StatusChip status={run.status} size="sm" />
      </div>

      {/* Current stage */}
      <div className="flex items-center gap-2 mb-3 py-2 px-3 rounded-lg bg-bg-elevated border border-border-default">
        <span className="text-sm">{currentStage.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-primary">{currentStage.name}</p>
          <p className="text-2xs text-text-muted">{currentStage.description}</p>
        </div>
      </div>

      {/* Stage progress dots */}
      <div className="flex items-center gap-1 mb-2">
        {WORKFLOW_STAGES.map((stage, i) => (
          <div
            key={stage.slug}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < currentStageIndex
                  ? '#10b981'
                  : i === currentStageIndex
                  ? '#3b82f6'
                  : '#1f2937',
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xs text-text-muted">
          Stage {currentStageIndex + 1} of {WORKFLOW_STAGES.length}
        </span>
        <Link
          href={`/runs/${run.id}`}
          className="text-2xs font-semibold text-accent-blue hover:text-blue-400 transition-colors"
        >
          View run →
        </Link>
      </div>
    </div>
  );
}

interface ActiveRunsPanelProps {
  runs: AgentRun[];
}

export default function ActiveRunsPanel({ runs }: ActiveRunsPanelProps) {
  const hasRuns = runs.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Active Runs</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {hasRuns ? `${runs.length} run in progress` : 'No active runs'}
          </p>
        </div>
        {hasRuns && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
          </span>
        )}
      </div>

      {hasRuns ? (
        <div className="space-y-3">
          {runs.map((run) => (
            <ActiveRunCard key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <circle cx="12" cy="12" r="10" />
              <polyline points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">No active runs</p>
          <Link
            href="/repositories"
            className="inline-block mt-2 text-xs font-semibold text-accent-blue hover:underline"
          >
            Start an agent run →
          </Link>
        </div>
      )}
    </div>
  );
}
