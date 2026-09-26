import type { GlobalMetrics } from '@/lib/types';
import MetricCard from '@/components/ui/MetricCard';

function IconBug() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88M16 2l-1.88 1.88M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-3 1.5-6 3-8M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M18 21c-1.5-2-3-5-3-8" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconRepo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v4H3z" />
      <path d="M3 11h18v4H3z" />
      <path d="M3 19h18v2H3z" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconTestTube() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}

interface GlobalMetricsBannerProps {
  metrics: GlobalMetrics;
}

export default function GlobalMetricsBanner({ metrics }: GlobalMetricsBannerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        label="Repositories"
        value={metrics.totalRepositories}
        icon={<IconRepo />}
        accentColor="#3b82f6"
        className="col-span-1"
      />
      <MetricCard
        label="Active Runs"
        value={metrics.activeRuns}
        icon={<IconPlay />}
        accentColor="#06b6d4"
        className="col-span-1"
      />
      <MetricCard
        label="Issues Found"
        value={metrics.issuesFoundThisWeek}
        unit=" this week"
        icon={<IconBug />}
        accentColor="#f59e0b"
        className="col-span-1"
      />
      <MetricCard
        label="Issues Fixed"
        value={metrics.issuesFixedThisWeek}
        unit=" this week"
        icon={<IconCheck />}
        accentColor="#10b981"
        delta={{ value: metrics.issuesFixedThisWeek - metrics.issuesFoundThisWeek, label: 'vs found' }}
        className="col-span-1"
      />
      <MetricCard
        label="Avg Health Score"
        value={metrics.averageHealthScore}
        unit="/100"
        icon={<IconShield />}
        accentColor="#8b5cf6"
        className="col-span-1"
      />
      <MetricCard
        label="Tests Passing"
        value={`${metrics.testsPassingRate}%`}
        icon={<IconTestTube />}
        accentColor="#10b981"
        className="col-span-1"
      />
    </div>
  );
}
