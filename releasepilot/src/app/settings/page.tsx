import TopBar from '@/components/layout/TopBar';

export default function SettingsPage() {
  const sections = [
    {
      title: 'Demo Account',
      items: [
        { label: 'Name', value: 'Alex Chen' },
        { label: 'Email', value: 'alex.chen@acme.dev' },
        { label: 'Role', value: 'Admin' },
        { label: 'Plan', value: 'Enterprise (Demo)' },
      ],
    },
    {
      title: 'Agent Configuration',
      items: [
        { label: 'Max Iterations per Run', value: '10' },
        { label: 'Parallel Workers', value: '4' },
        { label: 'Automatic Approvals', value: 'Disabled — all changes require explicit human approval', ok: false, warn: true },
        { label: 'Require Approval for Releases', value: 'Enabled', ok: true },
        { label: 'Test Coverage Threshold', value: '80%' },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'GitHub', value: 'Connected ✓', ok: true },
        { label: 'Slack Notifications', value: 'Not configured' },
        { label: 'PagerDuty', value: 'Not configured' },
        { label: 'Jira', value: 'Not configured' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar title="Settings" subtitle="Account and agent configuration" />

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-border-default bg-bg-elevated">
              <h2 className="text-sm font-semibold text-text-primary">{section.title}</h2>
            </div>
            <div className="divide-y divide-border-default">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: ('warn' in item && item.warn) ? '#f59e0b'
                        : ('ok' in item && item.ok) ? '#10b981'
                        : '#f9fafb',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-status-warning/25 bg-status-warning/5 p-4">
          <p className="text-xs font-semibold text-status-warning mb-1">Demo Mode Active</p>
          <p className="text-xs text-text-muted">
            ReleasePilot is running with demo data. No real repository connections or agent runs are performed.
            All results shown are simulated from the E-Commerce Platform demo seed.
          </p>
        </div>
      </div>
    </div>
  );
}
