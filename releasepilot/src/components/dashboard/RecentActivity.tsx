import type { ActivityItem } from '@/lib/types';

const TYPE_CONFIG: Record<ActivityItem['type'], { icon: string; color: string; bg: string }> = {
  run_completed:    { icon: '✓', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  finding_fixed:    { icon: '🔧', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  run_started:      { icon: '▶', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  run_failed:       { icon: '✗', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  report_generated: { icon: '📋', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  repo_connected:   { icon: '+', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date('2024-03-18T16:00:00Z');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

interface RecentActivityProps {
  items: ActivityItem[];
  maxItems?: number;
}

export default function RecentActivity({ items, maxItems = 7 }: RecentActivityProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
          <p className="text-xs text-text-muted mt-0.5">Latest events across all repositories</p>
        </div>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">No recent activity</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-default">
            {visible.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type];
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors duration-150"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Icon dot */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {item.type === 'finding_fixed' || item.type === 'report_generated' ? (
                      <span className="text-xs">{cfg.icon}</span>
                    ) : (
                      <span className="text-2xs font-bold">{cfg.icon}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">{item.description}</p>
                    {item.repositoryName && (
                      <p className="text-2xs text-text-muted mt-0.5 font-mono opacity-70">
                        {item.repositoryName}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-2xs text-text-muted flex-shrink-0 mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
