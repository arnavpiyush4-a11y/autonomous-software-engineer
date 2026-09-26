import TopBar from '@/components/layout/TopBar';
import GlobalMetricsBanner from '@/components/dashboard/GlobalMetrics';
import RepositoryHealthGrid from '@/components/dashboard/RepositoryHealthGrid';
import ActiveRunsPanel from '@/components/dashboard/ActiveRunsPanel';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { MOCK_DASHBOARD_DATA } from '@/lib/mock-data';
import Link from 'next/link';

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function DashboardPage() {
  const { metrics, repositories, activeRuns, recentActivity } = MOCK_DASHBOARD_DATA;

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar />

      {/* Hero banner */}
      <div
        className="px-6 py-8 border-b border-border-default"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}
                >
                  <IconBolt />
                </div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">ReleasePilot AI</span>
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
                Engineering Dashboard
              </h1>
              <p className="text-sm text-text-secondary max-w-xl">
                Autonomous AI agent monitoring your repositories — finding issues, generating fixes, and preparing releases.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/onboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 12px rgba(59,130,246,0.3)' }}
              >
                <IconPlus />
                Connect Repository
              </Link>
              <Link
                href="/repositories"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary rounded-lg border border-border-default bg-bg-elevated hover:text-text-primary hover:border-border-subtle transition-colors duration-150"
              >
                View All Repos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-8">
        {/* Metrics row */}
        <GlobalMetricsBanner metrics={metrics} />

        {/* Three-column grid: repos (span-2) + active runs + activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: repository health grid (2/3 width on xl) */}
          <div className="xl:col-span-2">
            <RepositoryHealthGrid repositories={repositories} />
          </div>

          {/* Right column: active runs + release health summary */}
          <div className="xl:col-span-1 space-y-6">
            <ActiveRunsPanel runs={activeRuns} />

            {/* Release Readiness card */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h2 className="text-base font-semibold text-text-primary mb-1">Release Readiness</h2>
              <p className="text-xs text-text-muted mb-4">Latest completed run · E-Commerce Platform</p>

              <div className="space-y-3">
                {[
                  { label: 'Health Score', before: 67, after: 94, color: '#10b981' },
                  { label: 'Test Coverage', before: 71, after: 86, color: '#3b82f6' },
                  { label: 'Issues Fixed', before: 0, after: 100, color: '#8b5cf6' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs text-text-muted line-through">{item.before}%</span>
                        <span className="text-xs font-semibold" style={{ color: item.color }}>
                          {item.after}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-bg-overlay overflow-hidden">
                      <div
                        className="absolute inset-0 rounded-full opacity-30"
                        style={{ width: `${item.before}%`, backgroundColor: item.color }}
                      />
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-700"
                        style={{ width: `${item.after}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 pt-4 border-t border-border-default flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-text-muted">Release Risk Score</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: '#10b981' }}>94<span className="text-sm font-medium text-text-muted">/100</span></p>
                </div>
                <Link
                  href="/runs/run_01"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-status-success/30 text-status-success hover:bg-status-success/10 transition-colors"
                >
                  Full Report →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity — full width */}
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}
