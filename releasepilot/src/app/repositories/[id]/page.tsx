import { notFound } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import {
  getRepositoryById,
  getRunsByRepositoryId,
  getFindingsByRepositoryId,
  ECOMMERCE_ARCHITECTURE,
} from '@/lib/mock-data';
import ArchitectureMap from '@/components/repository/ArchitectureMap';
import OnboardingSummary from '@/components/repository/OnboardingSummary';
import { SeverityBadge, LanguageBadge } from '@/components/ui/Badge';
import StatusChip, { HealthScoreChip } from '@/components/ui/StatusChip';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import type { AgentRun } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function RunRow({ run }: { run: AgentRun }) {
  return (
    <Link
      href={`/runs/${run.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors border-b border-border-default last:border-b-0"
    >
      <StatusChip status={run.status} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary truncate">
          Branch: <span className="font-mono text-accent-blue">{run.branch}</span>
        </p>
        {run.summary && (
          <p className="text-2xs text-text-muted truncate mt-0.5">{run.summary}</p>
        )}
      </div>
      <span className="text-2xs text-text-muted flex-shrink-0">
        {run.startedAt ? formatDate(run.startedAt) : '—'}
      </span>
      {run.durationMs && (
        <span className="text-2xs text-text-muted font-mono flex-shrink-0">
          {formatDuration(run.durationMs)}
        </span>
      )}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const repo = getRepositoryById(id);
  if (!repo) notFound();

  const runs = getRunsByRepositoryId(id);
  const findings = getFindingsByRepositoryId(id);
  const architecture = id === 'repo_ecommerce' ? ECOMMERCE_ARCHITECTURE : null;

  const openFindings = findings.filter((f) => f.status === 'OPEN');
  const fixedFindings = findings.filter((f) => f.status === 'FIXED');

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar
        title={repo.name}
        subtitle={repo.fullName}
      />

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Hero card */}
        <div
          className="rounded-xl border border-border-default bg-bg-surface p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(16,185,129,0.03) 100%)' }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl font-bold text-text-primary">{repo.name}</h1>
                {repo.healthScore !== undefined && <HealthScoreChip score={repo.healthScore} />}
              </div>
              <p className="text-sm text-text-secondary mb-3 max-w-2xl">{repo.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {repo.languages.map((l) => <LanguageBadge key={l} language={l} />)}
                {repo.techStack.map((t) => (
                  <span
                    key={t}
                    className="text-2xs font-medium rounded px-1.5 py-0.5 border"
                    style={{ backgroundColor: 'rgba(107,114,128,0.1)', color: '#9ca3af', borderColor: 'rgba(107,114,128,0.2)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2">
                <Link
                  href={`/runs/new?repo=${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
                  </svg>
                  Start Agent Run
                </Link>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm text-text-secondary border border-border-default rounded-lg hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
              {repo.healthScore !== undefined && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <ProgressBar value={repo.healthScore} size="xs" color="auto" className="w-24" />
                  <span className="font-semibold">{repo.healthScore}/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-border-default">
            {[
              { label: 'Total Runs', value: runs.length },
              { label: 'Findings Found', value: findings.length },
              { label: 'Fixed', value: fixedFindings.length, color: '#10b981' },
              { label: 'Open', value: openFindings.length, color: openFindings.length > 0 ? '#f59e0b' : '#10b981' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xs text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: stat.color ?? '#f9fafb' }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: architecture + onboarding */}
          <div className="xl:col-span-2 space-y-6">
            {architecture && <ArchitectureMap map={architecture} />}
            <OnboardingSummary repo={repo} />
          </div>

          {/* Right: runs + findings */}
          <div className="xl:col-span-1 space-y-6">
            {/* Recent runs */}
            <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">Agent Runs</h3>
                <Link href="/runs" className="text-xs text-accent-blue hover:underline">View all →</Link>
              </div>
              {runs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-text-muted">No runs yet</p>
                </div>
              ) : (
                <div>
                  {runs.slice(0, 5).map((run) => (
                    <RunRow key={run.id} run={run} />
                  ))}
                </div>
              )}
            </div>

            {/* Findings */}
            {findings.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default">
                  <h3 className="text-sm font-semibold text-text-primary">Findings</h3>
                  <p className="text-xs text-text-muted mt-0.5">{fixedFindings.length} fixed · {openFindings.length} open</p>
                </div>
                <ul className="divide-y divide-border-default">
                  {findings.map((f) => (
                    <li key={f.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <SeverityBadge severity={f.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{f.title}</p>
                          {f.filePath && (
                            <p className="text-2xs font-mono text-text-muted mt-0.5">{f.filePath}</p>
                          )}
                        </div>
                        {f.fixApplied && (
                          <span className="text-2xs font-semibold" style={{ color: '#10b981' }}>Fixed</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
