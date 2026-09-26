'use client';

import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricRow {
  label: string;
  before: string | number;
  after: string | number;
  delta?: string;
  deltaPositive?: boolean;
  highlight?: boolean;
}

interface FindingRow {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  status: 'FIXED' | 'OPEN';
  category: string;
  actionLabel: 'ANALYZED' | 'PROPOSED' | 'SIMULATED';
}

interface TestRow {
  suite: string;
  before: { total: number; pass: number; fail: number; coverage: number };
  after: { total: number; pass: number; fail: number; coverage: number };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const OVERVIEW_METRICS: MetricRow[] = [
  { label: 'Health Score', before: '67/100', after: '94/100', delta: '+27 pts', deltaPositive: true, highlight: true },
  { label: 'Release Risk', before: 'HIGH', after: 'LOW (94/100)', delta: 'Improved', deltaPositive: true, highlight: true },
  { label: 'Open Issues', before: '6', after: '0', delta: '−6 resolved', deltaPositive: true, highlight: true },
  { label: 'Tests Passing', before: '142/145', after: '145/145', delta: '+3 fixed', deltaPositive: true },
  { label: 'Test Coverage', before: '71.4%', after: '85.6%', delta: '+14.2%', deltaPositive: true },
  { label: 'Total Tests', before: '142', after: '145', delta: '+3 new', deltaPositive: true },
  { label: 'Failing Tests', before: '3', after: '0', delta: '−3 fixed', deltaPositive: true },
  { label: 'Security CVEs', before: '1 CRITICAL', after: '0', delta: 'Patched', deltaPositive: true },
  { label: 'Doc Accuracy', before: '⚠ Mismatch', after: '✓ Correct', delta: 'Fixed', deltaPositive: true },
  { label: 'Docker Health', before: '⚠ Wrong path', after: '✓ /api/v1/health', delta: 'Fixed', deltaPositive: true },
];

const FINDINGS: FindingRow[] = [
  { severity: 'CRITICAL', title: 'Password reset token not invalidated after use', status: 'FIXED', category: 'SECURITY', actionLabel: 'PROPOSED' },
  { severity: 'HIGH',     title: 'CVE-2022-23529: jsonwebtoken@8.5.1 (CVSS 7.6)', status: 'FIXED', category: 'SECURITY', actionLabel: 'PROPOSED' },
  { severity: 'HIGH',     title: 'Floating-point discount arithmetic (3 failing tests)', status: 'FIXED', category: 'BUG', actionLabel: 'PROPOSED' },
  { severity: 'HIGH',     title: 'Docker healthcheck targets "/" — should be /api/v1/health', status: 'FIXED', category: 'CONFIG', actionLabel: 'PROPOSED' },
  { severity: 'MEDIUM',   title: 'Checkout edge-case paths have 0% test coverage', status: 'FIXED', category: 'COVERAGE', actionLabel: 'PROPOSED' },
  { severity: 'LOW',      title: 'README documents wrong API endpoint', status: 'FIXED', category: 'DOCS', actionLabel: 'PROPOSED' },
];

const TEST_SUITES: TestRow[] = [
  {
    suite: 'src/auth/__tests__/password-reset.test.ts',
    before: { total: 8,  pass: 8,  fail: 0, coverage: 34.2 },
    after:  { total: 11, pass: 11, fail: 0, coverage: 91.7 },
  },
  {
    suite: 'src/cart/__tests__/discount.test.ts',
    before: { total: 12, pass: 9,  fail: 3, coverage: 78.3 },
    after:  { total: 14, pass: 14, fail: 0, coverage: 94.1 },
  },
  {
    suite: 'src/checkout/__tests__/edge-cases.test.ts',
    before: { total: 6,  pass: 6,  fail: 0, coverage: 22.4 },
    after:  { total: 8,  pass: 8,  fail: 0, coverage: 81.6 },
  },
  {
    suite: 'Full Test Suite (aggregate)',
    before: { total: 145, pass: 142, fail: 3, coverage: 71.4 },
    after:  { total: 145, pass: 145, fail: 0, coverage: 85.6 },
  },
];

const CODE_CHANGES = [
  { file: 'src/auth/password-reset.ts', added: 2, removed: 0, reason: 'Token invalidation — account-takeover fix', label: 'PROPOSED' },
  { file: 'src/cart/discount.ts',        added: 3, removed: 1, reason: 'Integer-cent math — floating-point fix',    label: 'PROPOSED' },
  { file: 'package.json',               added: 1, removed: 1, reason: 'jsonwebtoken 8.5.1 → 9.0.2 (CVE patched)', label: 'PROPOSED' },
  { file: 'docker-compose.yml',         added: 2, removed: 1, reason: 'Healthcheck now targets /api/v1/health',    label: 'PROPOSED' },
  { file: 'README.md',                  added: 1, removed: 1, reason: 'Correct /forgot-password → /reset-password', label: 'PROPOSED' },
  { file: 'src/auth/__tests__/password-reset.test.ts', added: 19, removed: 0, reason: '3 new regression tests for token invalidation', label: 'PROPOSED' },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function SeverityPill({ sev }: { sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const cfg = {
    CRITICAL: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    HIGH:     { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    MEDIUM:   { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    LOW:      { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  }[sev];
  return (
    <span className="text-2xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      {sev}
    </span>
  );
}

function ActionBadge({ label }: { label: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    ANALYZED:  { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
    PROPOSED:  { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa' },
    SIMULATED: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
  };
  const c = cfg[label] ?? cfg.ANALYZED;
  return (
    <span className="text-2xs font-bold rounded px-1.5 py-0.5" style={{ backgroundColor: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

function MetricCompareRow({ row }: { row: MetricRow }) {
  return (
    <div className={`grid grid-cols-4 items-center gap-4 px-4 py-3 border-b border-slate-700/40 last:border-b-0 ${row.highlight ? 'bg-slate-800/40' : ''}`}>
      <span className="text-sm text-slate-300 font-medium">{row.label}</span>
      <span className="text-sm font-mono text-red-400">{row.before}</span>
      <span className="text-sm font-mono text-emerald-400 font-semibold">{row.after}</span>
      {row.delta ? (
        <span className={`text-xs font-semibold ${row.deltaPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {row.delta}
        </span>
      ) : <span />}
    </div>
  );
}

function ScoreArc({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = value / max;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct * 0.75);
  return (
    <svg width="140" height="100" viewBox="0 0 140 100">
      {/* Background arc */}
      <circle
        cx="70" cy="80" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(135 70 80)"
      />
      {/* Foreground arc */}
      <circle
        cx="70" cy="80" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${circ * 0.75 * pct} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(135 70 80)"
      />
      <text x="70" y="75" textAnchor="middle" fill={color} fontSize="24" fontWeight="bold" fontFamily="monospace">
        {value}
      </text>
      <text x="70" y="93" textAnchor="middle" fill="rgba(156,163,175,0.8)" fontSize="11" fontFamily="sans-serif">
        out of {max}
      </text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-emerald-950/30 via-[#0a0e1a] to-blue-950/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ReleasePilot AI · Before / After</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                E-Commerce Platform — Transformation Evidence
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Measurable before/after comparison · Run{' '}
                <Link href="/runs/run_01" className="text-blue-400 hover:underline font-mono">run_01</Link>
                {' '}· All fixes{' '}
                <span className="font-mono text-violet-400 text-xs font-bold bg-violet-500/10 px-1.5 py-0.5 rounded">PROPOSED</span>
                {' '}— simulated, not executed in production
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/demo"
                className="px-4 py-2 rounded-xl border border-slate-600/50 bg-slate-800/60 text-slate-300 text-sm font-medium hover:bg-slate-700/60 transition-colors"
              >
                ← Demo Guide
              </Link>
              <Link
                href="/runs/run_01"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                Full Report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Hero score cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health score */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Health Score</p>
            <div className="flex items-end justify-center gap-4 my-3">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Before</p>
                <ScoreArc value={67} max={100} color="#ef4444" />
              </div>
              <div className="text-slate-600 text-xl font-bold pb-6">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">After</p>
                <ScoreArc value={94} max={100} color="#10b981" />
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
              <span className="text-emerald-400 text-sm font-bold">+27 points</span>
            </div>
          </div>

          {/* Release risk */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Release Risk</p>
            <div className="flex items-center justify-center gap-6 my-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">Before</p>
                <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                  <span className="text-red-400 font-bold text-sm">HIGH</span>
                </div>
              </div>
              <div className="text-slate-600 text-xl font-bold">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">After</p>
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <span className="text-emerald-400 font-bold text-sm">LOW</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Release readiness score: <span className="text-emerald-400 font-bold">94/100</span></p>
          </div>

          {/* Issues */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Open Issues</p>
            <div className="flex items-center justify-center gap-6 my-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">Before</p>
                <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                  <span className="text-red-400 font-bold text-4xl">6</span>
                </div>
              </div>
              <div className="text-slate-600 text-xl font-bold">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">After</p>
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <span className="text-emerald-400 font-bold text-4xl">0</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">All 6 issues resolved (2 CRITICAL + 3 HIGH + 1 LOW)</p>
          </div>
        </div>

        {/* Metrics table */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Full Metrics Comparison</h2>
              <p className="text-xs text-slate-500 mt-0.5">All values are structured demo data — clearly labeled where simulated</p>
            </div>
            <span className="text-xs bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-1 rounded font-mono font-bold">SIMULATED</span>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-slate-700/30">
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Metric</span>
            <span className="text-2xs font-semibold text-red-400/70 uppercase tracking-wider">Before</span>
            <span className="text-2xs font-semibold text-emerald-400/70 uppercase tracking-wider">After</span>
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Delta</span>
          </div>
          {OVERVIEW_METRICS.map((row, i) => (
            <MetricCompareRow key={i} row={row} />
          ))}
        </div>

        {/* Findings table */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200">Issue Resolution</h2>
            <p className="text-xs text-slate-500 mt-0.5">All 6 seeded issues — status after ReleasePilot run_01</p>
          </div>
          <div className="divide-y divide-slate-700/30">
            {FINDINGS.map((f, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <SeverityPill sev={f.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.category}</p>
                </div>
                <ActionBadge label={f.actionLabel} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  f.status === 'FIXED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                }`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test results */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Test Results — Before vs After</h2>
              <p className="text-xs text-slate-500 mt-0.5">Run by Test Engineer agent worker · labeled SIMULATED</p>
            </div>
            <span className="text-xs bg-slate-700/50 border border-slate-600/40 text-slate-400 px-2 py-1 rounded font-mono font-bold">SIMULATED</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold uppercase tracking-wider">Test Suite</th>
                  <th className="text-right px-3 py-2 text-red-400/70 font-semibold uppercase tracking-wider">Before Pass</th>
                  <th className="text-right px-3 py-2 text-red-400/70 font-semibold uppercase tracking-wider">Before Fail</th>
                  <th className="text-right px-3 py-2 text-red-400/70 font-semibold uppercase tracking-wider">Before Cov</th>
                  <th className="text-right px-3 py-2 text-emerald-400/70 font-semibold uppercase tracking-wider">After Pass</th>
                  <th className="text-right px-3 py-2 text-emerald-400/70 font-semibold uppercase tracking-wider">After Fail</th>
                  <th className="text-right px-3 py-2 text-emerald-400/70 font-semibold uppercase tracking-wider">After Cov</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {TEST_SUITES.map((row, i) => (
                  <tr key={i} className={i === TEST_SUITES.length - 1 ? 'bg-slate-800/40 font-semibold' : 'hover:bg-slate-800/20 transition-colors'}>
                    <td className="px-4 py-2.5 text-slate-300 font-mono text-2xs">{row.suite}</td>
                    <td className="text-right px-3 py-2.5 text-slate-300">{row.before.pass}/{row.before.total}</td>
                    <td className={`text-right px-3 py-2.5 font-bold ${row.before.fail > 0 ? 'text-red-400' : 'text-slate-500'}`}>{row.before.fail}</td>
                    <td className="text-right px-3 py-2.5 text-slate-400">{row.before.coverage}%</td>
                    <td className="text-right px-3 py-2.5 text-emerald-400">{row.after.pass}/{row.after.total}</td>
                    <td className={`text-right px-3 py-2.5 font-bold ${row.after.fail > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{row.after.fail}</td>
                    <td className="text-right px-3 py-2.5 text-emerald-400">{row.after.coverage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Code changes */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Proposed Code Changes</h2>
              <p className="text-xs text-slate-500 mt-0.5">6 files · all labeled PROPOSED — approved by human, not executed in production</p>
            </div>
            <span className="text-xs bg-violet-500/10 border border-violet-500/25 text-violet-400 px-2 py-1 rounded font-mono font-bold">PROPOSED</span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {CODE_CHANGES.map((c, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <code className="text-xs font-mono text-blue-300 flex-1 min-w-0 truncate">{c.file}</code>
                <span className="text-emerald-400 text-xs font-mono flex-shrink-0">+{c.added}</span>
                <span className="text-red-400 text-xs font-mono flex-shrink-0">−{c.removed}</span>
                <span className="text-xs text-slate-400 max-w-[280px] truncate hidden md:block">{c.reason}</span>
                <ActionBadge label={c.label} />
              </div>
            ))}
          </div>
        </div>

        {/* Simulation disclaimer */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">Demo Mode — Safe Local Simulation</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                All metrics on this page are <strong className="text-slate-300">structured demo data</strong> that reflect
                real engineering problems and their solutions. No actual file writes, test executions, or deployments
                occurred against any external system.{' '}
                <strong className="text-amber-300">PROPOSED</strong> = fix is staged and approved but not yet applied to production.{' '}
                <strong className="text-amber-300">SIMULATED</strong> = validated in demo context, would run in a real deployment.
                Every action in ReleasePilot is clearly labeled with its execution status.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/demo"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-400 text-sm font-medium hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            ← Demo Guide
          </Link>
          <Link
            href="/runs/run_01"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30"
          >
            Full Run Report →
          </Link>
          <Link
            href="/runs/run_01/deploy"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/12 transition-all"
          >
            Deployment Prep →
          </Link>
        </div>

      </div>
    </div>
  );
}
