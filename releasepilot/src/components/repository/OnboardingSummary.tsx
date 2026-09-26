import type { Repository } from '@/lib/types';
import { LanguageBadge } from '@/components/ui/Badge';

interface OnboardingSummaryProps {
  repo: Repository;
}

const SETUP_STEPS = [
  { step: '1', title: 'Clone the repository', code: 'git clone https://github.com/acme/ecommerce-platform.git\ncd ecommerce-platform' },
  { step: '2', title: 'Install dependencies', code: 'npm install' },
  { step: '3', title: 'Configure environment', code: 'cp .env.example .env\n# Edit .env with your local credentials' },
  { step: '4', title: 'Start services with Docker', code: 'docker-compose up -d postgres redis' },
  { step: '5', title: 'Run migrations', code: 'npm run db:migrate\nnpm run db:seed' },
  { step: '6', title: 'Start development server', code: 'npm run dev' },
];

const FILE_STRUCTURE = [
  { path: 'src/', description: 'Application source code' },
  { path: 'src/auth/', description: 'Authentication & JWT handling' },
  { path: 'src/cart/', description: 'Shopping cart logic' },
  { path: 'src/checkout/', description: 'Checkout & payment flow' },
  { path: 'src/products/', description: 'Product catalog API' },
  { path: 'docker-compose.yml', description: 'Container orchestration' },
  { path: 'prisma/schema.prisma', description: 'Database schema' },
  { path: '.env.example', description: 'Environment template' },
  { path: 'README.md', description: 'Project documentation' },
];

export default function OnboardingSummary({ repo }: OnboardingSummaryProps) {
  return (
    <div className="space-y-5">
      {/* Repository overview */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Repository Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Default Branch', value: repo.defaultBranch },
            { label: 'Languages', value: repo.languages.join(', ') },
            { label: 'Open Findings', value: String(repo.openFindings ?? 0) },
            { label: 'Health Score', value: `${repo.healthScore ?? 'N/A'}/100` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-medium text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {repo.languages.map((l) => <LanguageBadge key={l} language={l} />)}
          {repo.techStack.map((t) => (
            <span
              key={t}
              className="inline-flex items-center text-2xs font-medium rounded px-1.5 py-0.5 border"
              style={{ backgroundColor: 'rgba(107,114,128,0.1)', color: '#9ca3af', borderColor: 'rgba(107,114,128,0.2)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* File structure */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Key Files & Directories</h3>
        <div className="space-y-1.5">
          {FILE_STRUCTURE.map((item) => (
            <div key={item.path} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-bg-elevated transition-colors">
              <code className="text-xs text-accent-blue font-mono min-w-[200px]">{item.path}</code>
              <span className="text-xs text-text-muted">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dev setup steps */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Development Setup</h3>
        <div className="space-y-4">
          {SETUP_STEPS.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                {s.step}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-primary mb-1.5">{s.title}</p>
                <pre
                  className="text-xs rounded-lg p-3 overflow-x-auto"
                  style={{ backgroundColor: '#0d1117', color: '#e6edf3', border: '1px solid #1f2937', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {s.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testing guide */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Testing Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Unit Tests', cmd: 'npm test', desc: 'Run Jest unit test suite' },
            { title: 'Integration Tests', cmd: 'npm run test:integration', desc: 'Run API integration tests' },
            { title: 'Coverage Report', cmd: 'npm run test:coverage', desc: 'Generate HTML coverage report' },
          ].map((t) => (
            <div key={t.title} className="rounded-lg p-3 bg-bg-elevated border border-border-default">
              <p className="text-xs font-semibold text-text-primary mb-1">{t.title}</p>
              <code
                className="block text-xs rounded px-2 py-1 mb-2"
                style={{ backgroundColor: '#0d1117', color: '#7ee787', fontFamily: 'monospace' }}
              >
                {t.cmd}
              </code>
              <p className="text-2xs text-text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
