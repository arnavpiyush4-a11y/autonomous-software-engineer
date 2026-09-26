import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import { MOCK_REPOSITORIES, MOCK_RUNS } from '@/lib/mock-data';
import { LanguageBadge } from '@/components/ui/Badge';
import { HealthScoreChip } from '@/components/ui/StatusChip';
import StatusChip from '@/components/ui/StatusChip';
import ProgressBar from '@/components/ui/ProgressBar';
import type { RunStatus } from '@/lib/types';

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function RepositoriesPage() {
  const latestRunByRepo: Record<string, RunStatus> = {};
  for (const run of MOCK_RUNS) {
    if (!latestRunByRepo[run.repositoryId]) {
      latestRunByRepo[run.repositoryId] = run.status;
    }
  }

  const sorted = [...MOCK_REPOSITORIES].sort((a, b) => (a.healthScore ?? 0) - (b.healthScore ?? 0));

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar
        title="Repositories"
        subtitle={`${MOCK_REPOSITORIES.length} connected · monitoring active`}
      />

      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Filter pills */}
            {['All', 'Healthy', 'At Risk', 'Running'].map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  i === 0
                    ? 'bg-accent-blue text-white border-accent-blue'
                    : 'text-text-secondary border-border-default hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg"
            style={{ backgroundColor: '#3b82f6' }}
          >
            <IconPlus />
            Connect Repository
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border-default bg-bg-elevated">
            <div className="col-span-4 text-2xs font-semibold text-text-muted uppercase tracking-wider">Repository</div>
            <div className="col-span-2 text-2xs font-semibold text-text-muted uppercase tracking-wider">Stack</div>
            <div className="col-span-2 text-2xs font-semibold text-text-muted uppercase tracking-wider">Health</div>
            <div className="col-span-2 text-2xs font-semibold text-text-muted uppercase tracking-wider">Last Run</div>
            <div className="col-span-1 text-2xs font-semibold text-text-muted uppercase tracking-wider">Issues</div>
            <div className="col-span-1 text-2xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</div>
          </div>

          {/* Rows */}
          {sorted.map((repo) => {
            const runStatus = latestRunByRepo[repo.id];
            const healthColor =
              (repo.healthScore ?? 0) >= 85 ? '#10b981'
              : (repo.healthScore ?? 0) >= 65 ? '#f59e0b'
              : '#ef4444';

            return (
              <div
                key={repo.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-border-default last:border-b-0 hover:bg-bg-elevated transition-colors duration-150 items-center"
              >
                {/* Name */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <IconGitHub />
                    <Link
                      href={`/repositories/${repo.id}`}
                      className="text-sm font-semibold text-text-primary hover:text-accent-blue transition-colors truncate"
                    >
                      {repo.name}
                    </Link>
                  </div>
                  <p className="text-xs text-text-muted truncate pl-5">{repo.description}</p>
                </div>

                {/* Stack */}
                <div className="col-span-2 flex flex-wrap gap-1">
                  {repo.languages.slice(0, 2).map((l) => <LanguageBadge key={l} language={l} />)}
                </div>

                {/* Health */}
                <div className="col-span-2">
                  {repo.healthScore !== undefined ? (
                    <div className="flex items-center gap-2">
                      <ProgressBar value={repo.healthScore} size="xs" color="auto" className="flex-1" />
                      <span className="text-xs font-semibold tabular-nums" style={{ color: healthColor }}>
                        {repo.healthScore}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </div>

                {/* Last run */}
                <div className="col-span-2">
                  {runStatus ? <StatusChip status={runStatus} size="sm" /> : <span className="text-xs text-text-muted">No runs</span>}
                </div>

                {/* Issues */}
                <div className="col-span-1">
                  {(repo.openFindings ?? 0) > 0 ? (
                    <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                      {repo.openFindings}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>0</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <Link
                    href={`/repositories/${repo.id}`}
                    className="text-xs font-semibold text-accent-blue hover:text-blue-400 transition-colors whitespace-nowrap"
                  >
                    Details
                  </Link>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-text-secondary transition-colors"
                    title="Open on GitHub"
                  >
                    <IconExternalLink />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
