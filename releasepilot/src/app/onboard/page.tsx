'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';

// ─── Step types ──────────────────────────────────────────────────────────────

type OnboardStep = 'input' | 'analyzing' | 'complete';

interface AnalysisLogEntry {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'scan';
  ms: number; // delay before showing
}

// ─── Animated log line ───────────────────────────────────────────────────────

function LogLine({ entry, visible }: { entry: AnalysisLogEntry; visible: boolean }) {
  const colors = {
    info:    { text: '#9ca3af', prefix: '  ' },
    success: { text: '#34d399', prefix: '✓ ' },
    warn:    { text: '#fbbf24', prefix: '⚠ ' },
    scan:    { text: '#60a5fa', prefix: '→ ' },
  };
  const c = colors[entry.type];
  return (
    <div
      className="text-xs font-mono py-0.5 transition-all duration-300"
      style={{
        color: c.text,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-8px)',
      }}
    >
      <span style={{ color: '#374151' }}>{c.prefix}</span>
      {entry.text}
    </div>
  );
}

// ─── Simulated analysis logs ─────────────────────────────────────────────────

const ANALYSIS_LOG: AnalysisLogEntry[] = [
  { id: 1,  text: 'Resolving repository URL…',                     type: 'scan',    ms: 200  },
  { id: 2,  text: 'Connecting to GitHub API…',                     type: 'info',    ms: 700  },
  { id: 3,  text: 'Fetching repository metadata…',                 type: 'info',    ms: 1200 },
  { id: 4,  text: 'Detected default branch: main',                 type: 'success', ms: 1700 },
  { id: 5,  text: 'Cloning repository (shallow)…',                 type: 'scan',    ms: 2200 },
  { id: 6,  text: 'Scanning file tree: 312 files found',           type: 'success', ms: 2900 },
  { id: 7,  text: 'Language detection: TypeScript 71%, JS 18%…',   type: 'info',    ms: 3400 },
  { id: 8,  text: 'Identified frameworks: React, Express, Prisma', type: 'success', ms: 3900 },
  { id: 9,  text: 'Parsing package.json (87 dependencies)…',       type: 'scan',    ms: 4400 },
  { id: 10, text: 'Checking for AGENTS.md / .agentrc…',            type: 'info',    ms: 4900 },
  { id: 11, text: 'Parsing README.md (dev setup detected)…',       type: 'success', ms: 5400 },
  { id: 12, text: 'Docker configuration detected (docker-compose.yml)', type: 'success', ms: 5900 },
  { id: 13, text: 'CI/CD: .github/workflows/ (2 workflows)',       type: 'success', ms: 6400 },
  { id: 14, text: 'Test framework: Jest + Supertest',              type: 'info',    ms: 6900 },
  { id: 15, text: 'Database: PostgreSQL (Prisma ORM)',              type: 'info',    ms: 7300 },
  { id: 16, text: 'Cache layer: Redis',                            type: 'info',    ms: 7700 },
  { id: 17, text: 'Running initial test suite…',                   type: 'scan',    ms: 8100 },
  { id: 18, text: '145 tests · 3 failing · coverage 71.4%',        type: 'warn',    ms: 9200 },
  { id: 19, text: 'Running dependency vulnerability scan…',        type: 'scan',    ms: 9700 },
  { id: 20, text: 'WARN: jsonwebtoken@8.5.1 — CVE-2022-23529',    type: 'warn',    ms: 10200 },
  { id: 21, text: 'Architecture map generated (9 nodes, 10 edges)',type: 'success', ms: 10700 },
  { id: 22, text: 'Health score computed: 67/100',                 type: 'warn',    ms: 11200 },
  { id: 23, text: 'Onboarding complete — repository ready',        type: 'success', ms: 11800 },
];

const TOTAL_DURATION_MS = 12400;

// ─── Demo repos ──────────────────────────────────────────────────────────────

const DEMO_REPOS = [
  {
    id: 'repo_ecommerce',
    label: 'E-Commerce Platform',
    url: 'https://github.com/acme/ecommerce-platform',
    description: 'Pre-seeded with 6 issues including critical security bug',
    badge: 'Demo',
  },
];

// ─── GitHub URL validation (BUG-15) ─────────────────────────────────────────

/** Returns a parsed { owner, repo } or an error string. */
function parseGitHubUrl(raw: string): { owner: string; repo: string } | string {
  if (!raw.trim()) return 'Enter a GitHub URL or select a demo repository.';
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return 'Enter a valid URL (e.g. https://github.com/owner/repository).';
  }
  if (parsed.protocol !== 'https:') return 'Only HTTPS GitHub URLs are accepted.';
  if (parsed.hostname !== 'github.com') return 'Only github.com repositories are supported.';
  if (parsed.username || parsed.password) return 'URLs must not contain credentials.';
  const parts = parsed.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'URL must be in the form https://github.com/owner/repository.';
  }
  return { owner: parts[0], repo: parts[1] };
}

// ─── URL input step ──────────────────────────────────────────────────────────

interface InputStepProps {
  onSubmit: (url: string, repoId: string) => void;
}

function InputStep({ onSubmit }: InputStepProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = parseGitHubUrl(url);
    if (typeof result === 'string') { setError(result); return; }
    setError('');
    onSubmit(url.trim(), ''); // empty repoId → custom repo path
  }

  function handleDemo(id: string, repoUrl: string) {
    onSubmit(repoUrl, id);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
          style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          🚀
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Connect a Repository</h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          ReleasePilot will analyze your codebase, map its architecture, identify issues, and prepare it for release.
        </p>
      </div>

      {/* URL form */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6 mb-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">GitHub Repository URL</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://github.com/owner/repository"
              className="w-full px-4 py-2.5 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#0d1117',
                border: `1px solid ${error ? '#ef4444' : '#1f2937'}`,
                color: '#f9fafb',
                fontFamily: 'monospace',
              }}
            />
            {error && <p className="text-xs text-status-danger mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Analyze →
          </button>
        </form>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border-default" />
        <span className="text-xs text-text-muted">or try a demo</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>

      {/* Demo repos */}
      {DEMO_REPOS.map((demo) => (
        <button
          key={demo.id}
          onClick={() => handleDemo(demo.id, demo.url)}
          className="w-full text-left rounded-xl border border-accent-blue/25 bg-accent-blue-glow p-5 hover:border-accent-blue/50 transition-all duration-150 group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                  {demo.label}
                </span>
                <span
                  className="text-2xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
                >
                  {demo.badge}
                </span>
              </div>
              <p className="text-xs text-text-muted">{demo.description}</p>
              <code className="text-2xs font-mono text-text-muted opacity-60 mt-1 block">{demo.url}</code>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-blue flex-shrink-0 mt-1">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </button>
      ))}

      {/* What happens next */}
      <div className="mt-6 rounded-xl border border-border-default bg-bg-elevated p-5">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">What ReleasePilot Analyzes</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            '📁 Repository structure',
            '🔍 Languages & frameworks',
            '📦 Dependencies & vulnerabilities',
            '🧪 Test suite & coverage',
            '🐳 Docker & CI/CD config',
            '📝 Documentation accuracy',
            '🗺️ Architecture mapping',
            '⚙️ Environment configuration',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-text-secondary">
              <span>{item.slice(0, 2)}</span>
              <span>{item.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analyzing step ───────────────────────────────────────────────────────────

interface AnalyzingStepProps {
  repoUrl: string;
  onComplete: () => void;
}

function AnalyzingStep({ repoUrl, onComplete }: AnalyzingStepProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const completed = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    ANALYSIS_LOG.forEach((entry) => {
      const t = setTimeout(() => {
        setVisibleCount((c) => c + 1);
        setProgressPct(Math.round((entry.id / ANALYSIS_LOG.length) * 100));
      }, entry.ms);
      timers.push(t);
    });

    const doneTimer = setTimeout(() => {
      if (!completed.current) {
        completed.current = true;
        onComplete();
      }
    }, TOTAL_DURATION_MS);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Analyzing Repository</h1>
        <p className="text-xs font-mono text-text-muted truncate">{repoUrl}</p>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-text-primary">Analysis Progress</span>
          <span className="text-xs font-mono font-semibold text-accent-blue">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-overlay overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              backgroundColor: '#3b82f6',
              boxShadow: '0 0 12px rgba(59,130,246,0.5)',
            }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex items-center gap-1 mt-3">
          {['Structure', 'Languages', 'Deps', 'Tests', 'Docker', 'CI/CD', 'Docs', 'Health'].map((stage, i) => (
            <div
              key={stage}
              className="flex-1 h-1 rounded-full"
              style={{
                backgroundColor: progressPct >= (i + 1) * 12.5 ? '#10b981' : '#1f2937',
              }}
              title={stage}
            />
          ))}
        </div>
      </div>

      {/* Log terminal */}
      <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-default bg-bg-elevated">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-status-danger" />
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <div className="w-3 h-3 rounded-full bg-status-success" />
          </div>
          <span className="text-xs font-mono text-text-muted ml-2">releasepilot — analysis</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
            </span>
            <span className="text-2xs text-text-muted">running</span>
          </div>
        </div>
        <div
          className="px-4 py-3 font-mono text-xs min-h-[280px]"
          style={{ backgroundColor: '#0d1117' }}
        >
          {ANALYSIS_LOG.slice(0, visibleCount).map((entry) => (
            <LogLine key={entry.id} entry={entry} visible />
          ))}
          {visibleCount < ANALYSIS_LOG.length && (
            <span className="text-accent-blue animate-pulse">█</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Complete step ────────────────────────────────────────────────────────────

interface CompleteStepProps {
  repoId: string;      // non-empty = seeded demo repo; empty = custom URL
  repoUrl: string;     // always the original URL the user entered
}

function CompleteStep({ repoId, repoUrl }: CompleteStepProps) {
  const router = useRouter();
  const isDemo = !!repoId; // true = seeded demo, false = custom URL
  const demoRepo = MOCK_REPOSITORIES.find((r) => r.id === repoId);

  // Parse owner/repo from the entered URL for display purposes
  const parsed = parseGitHubUrl(repoUrl);
  const customLabel = typeof parsed === 'object'
    ? `${parsed.owner}/${parsed.repo}`
    : repoUrl;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-1">
          {isDemo ? 'Repository Ready' : 'Demo Preview'}
        </h1>
        <p className="text-sm text-text-secondary">
          {isDemo
            ? `${demoRepo?.name ?? 'E-Commerce Platform'} has been analyzed and onboarded.`
            : <><code className="font-mono text-accent-blue">{customLabel}</code> — simulated analysis preview</>
          }
        </p>
      </div>

      {/* BUG-06: show disclaimer when custom URL entered */}
      {!isDemo && (
        <div className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 flex items-start gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold">Demo Preview</span> — No real repository was cloned or analyzed.
            The metrics below are from the E-Commerce Platform fixture and are shown for demonstration purposes only.
            Real analysis would require a connected GitHub App or token.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Files Scanned', value: isDemo ? '312' : '~312', icon: '📁' },
          { label: 'Health Score', value: isDemo ? '67/100' : 'Demo: 67/100', icon: '🏥', warn: true },
          { label: 'Issues Found', value: isDemo ? '6' : 'Demo: 6', icon: '🐛', warn: true },
          { label: 'Tests', value: isDemo ? '145 (3 failing)' : 'Demo: 145', icon: '🧪', warn: true },
          { label: 'Dependencies', value: isDemo ? '87 (1 CVE)' : 'Demo: 87', icon: '📦', warn: true },
          { label: 'Coverage', value: isDemo ? '71.4%' : 'Demo: 71.4%', icon: '📊' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{
              borderColor: stat.warn ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)',
              backgroundColor: stat.warn ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)',
            }}
          >
            <p className="text-2xs text-text-muted mb-1">{stat.icon} {stat.label}</p>
            <p className="text-lg font-bold" style={{ color: stat.warn ? '#fbbf24' : '#34d399' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Call to actions */}
      <div className="space-y-3">
        {isDemo ? (
          <button
            onClick={() => router.push(`/repositories/${repoId}`)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-colors hover:opacity-90"
            style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
          >
            <div>
              <p className="text-sm font-semibold text-white">View Demo Repository</p>
              <p className="text-xs text-blue-200 mt-0.5">Architecture map, onboarding guide, findings</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border-default bg-bg-elevated cursor-default">
            <div>
              <p className="text-sm font-semibold text-text-primary">{customLabel}</p>
              <p className="text-xs text-text-muted mt-0.5">Simulated preview only — no real data available</p>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push(`/runs/run_01`)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border-default bg-bg-surface text-left transition-colors hover:bg-bg-elevated"
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">View Demo Agent Run</p>
            <p className="text-xs text-text-muted mt-0.5">See how ReleasePilot fixed all 6 issues in the demo</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {isDemo && (
          <button
            onClick={() => router.push(`/runs/new?repo=${repoId}`)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-status-success/25 bg-status-success/5 text-left transition-colors hover:bg-status-success/10"
          >
            <div>
              <p className="text-sm font-semibold text-status-success">Start New Agent Run</p>
              <p className="text-xs text-text-muted mt-0.5">Let ReleasePilot autonomously resolve all issues</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Onboard Page ────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [step, setStep] = useState<OnboardStep>('input');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoId, setRepoId] = useState('');

  function handleSubmit(url: string, id: string) {
    setRepoUrl(url);
    // BUG-06: keep empty repoId for custom URLs so CompleteStep can show the right label
    setRepoId(id); // empty string = custom repo
    setStep('analyzing');
  }

  function handleAnalysisComplete() {
    setStep('complete');
  }

  const stepLabels: { key: OnboardStep; label: string }[] = [
    { key: 'input', label: 'Connect' },
    { key: 'analyzing', label: 'Analyze' },
    { key: 'complete', label: 'Ready' },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar
        title="Connect Repository"
        subtitle="Onboard a new repository for autonomous analysis"
      />

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Breadcrumb steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {stepLabels.map((s, i) => {
            const stepOrder: OnboardStep[] = ['input', 'analyzing', 'complete'];
            const currentIdx = stepOrder.indexOf(step);
            const isActive = s.key === step;
            const isDone = stepOrder.indexOf(s.key) < currentIdx;
            const color = isDone ? '#10b981' : isActive ? '#3b82f6' : '#374151';

            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold border"
                    style={{ backgroundColor: `${color}20`, borderColor: color, color }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium" style={{ color: isActive ? '#f9fafb' : '#6b7280' }}>
                    {s.label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="w-12 h-px mx-1" style={{ backgroundColor: color }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === 'input' && <InputStep onSubmit={handleSubmit} />}
        {step === 'analyzing' && <AnalyzingStep repoUrl={repoUrl} onComplete={handleAnalysisComplete} />}
        {step === 'complete' && <CompleteStep repoId={repoId} repoUrl={repoUrl} />}
      </div>
    </div>
  );
}
