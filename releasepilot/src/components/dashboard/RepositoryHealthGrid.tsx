import Link from 'next/link';
import type { Repository } from '@/lib/types';
import { LanguageBadge } from '@/components/ui/Badge';
import { HealthScoreChip } from '@/components/ui/StatusChip';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusChip from '@/components/ui/StatusChip';

function IconGitHub() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

interface RepositoryCardProps {
  repo: Repository;
  latestRunStatus?: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

function RepositoryCard({ repo, latestRunStatus }: RepositoryCardProps) {
  const healthColor =
    (repo.healthScore ?? 0) >= 85
      ? '#10b981'
      : (repo.healthScore ?? 0) >= 65
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="group relative rounded-xl border border-border-default bg-bg-surface hover:border-border-subtle transition-all duration-200 overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: healthColor, opacity: 0.6 }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-text-muted">
                <IconGitHub />
              </span>
              <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-blue transition-colors">
                {repo.name}
              </h3>
            </div>
            <p className="text-xs text-text-muted truncate">{repo.fullName}</p>
          </div>
          {repo.healthScore !== undefined && (
            <HealthScoreChip score={repo.healthScore} />
          )}
        </div>

        {/* Description */}
        {repo.description && (
          <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
            {repo.description}
          </p>
        )}

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.languages.map((lang) => (
            <LanguageBadge key={lang} language={lang} />
          ))}
          {repo.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center text-2xs font-medium rounded px-1.5 py-0.5 border"
              style={{
                backgroundColor: 'rgba(107,114,128,0.1)',
                color: '#9ca3af',
                borderColor: 'rgba(107,114,128,0.2)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Health progress */}
        {repo.healthScore !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xs text-text-muted">Health Score</span>
              <span className="text-2xs font-semibold" style={{ color: healthColor }}>
                {repo.healthScore}/100
              </span>
            </div>
            <ProgressBar value={repo.healthScore} color="auto" size="xs" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-default">
          <div className="flex items-center gap-2">
            {latestRunStatus && <StatusChip status={latestRunStatus} size="sm" />}
            {(repo.openFindings ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-2xs text-status-warning">
                <IconAlert />
                {repo.openFindings} findings
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/repositories/${repo.id}`}
              className="flex items-center gap-1 text-2xs font-semibold text-accent-blue hover:text-blue-400 transition-colors"
            >
              View <IconArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RepositoryHealthGridProps {
  repositories: Repository[];
}

export default function RepositoryHealthGrid({ repositories }: RepositoryHealthGridProps) {
  const runStatusMap: Record<string, 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'> = {
    repo_ecommerce: 'COMPLETED',
    repo_payments: 'COMPLETED',
    repo_notifications: 'RUNNING',
    repo_analytics: 'COMPLETED',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Connected Repositories</h2>
          <p className="text-xs text-text-muted mt-0.5">{repositories.length} repositories monitored</p>
        </div>
        <Link
          href="/repositories"
          className="text-xs font-semibold text-accent-blue hover:text-blue-400 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {repositories.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            latestRunStatus={runStatusMap[repo.id]}
          />
        ))}
      </div>
    </div>
  );
}
