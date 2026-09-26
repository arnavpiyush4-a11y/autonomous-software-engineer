import React from 'react';
import Link from 'next/link';
import { PHASE4_DEPLOYMENT_REPORT } from '@/lib/phase4-data';
import ChangelogPanel from './ChangelogPanel';
import type {
  ReleaseGateCheck,
  DeploymentStep,
  SmokeTest,
  HealthCheck,
  DeployActionStatus,
  DeployCheckStatus,
  SmokeTestStatus,
  HealthCheckStatus,
} from '@/lib/types';

// ─── Colour helpers ──────────────────────────────────────────────────────────

function gateColor(status: DeployCheckStatus): string {
  if (status === 'PASS')    return 'text-emerald-400';
  if (status === 'FAIL')    return 'text-red-400';
  if (status === 'WARN')    return 'text-amber-400';
  if (status === 'PENDING') return 'text-slate-400';
  return 'text-slate-500';
}

function gateIcon(status: DeployCheckStatus): string {
  if (status === 'PASS')    return '✓';
  if (status === 'FAIL')    return '✗';
  if (status === 'WARN')    return '⚠';
  if (status === 'PENDING') return '○';
  return '—';
}

function gateBg(status: DeployCheckStatus): string {
  if (status === 'PASS')    return 'bg-emerald-500/10 border-emerald-500/20';
  if (status === 'FAIL')    return 'bg-red-500/10 border-red-500/20';
  if (status === 'WARN')    return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-slate-800/50 border-slate-700/50';
}

function stepColor(status: DeployActionStatus): string {
  if (status === 'COMPLETED')         return 'text-emerald-400';
  if (status === 'SIMULATED')         return 'text-sky-400';
  if (status === 'REQUIRES_APPROVAL') return 'text-amber-400';
  if (status === 'BLOCKED')           return 'text-red-400';
  return 'text-slate-400';
}

function stepBorder(status: DeployActionStatus): string {
  if (status === 'COMPLETED')         return 'border-emerald-500/40';
  if (status === 'SIMULATED')         return 'border-sky-500/40';
  if (status === 'REQUIRES_APPROVAL') return 'border-amber-500/50';
  if (status === 'BLOCKED')           return 'border-red-500/40';
  return 'border-slate-700/50';
}

function stepBg(status: DeployActionStatus): string {
  if (status === 'COMPLETED')         return 'bg-emerald-500/8';
  if (status === 'SIMULATED')         return 'bg-sky-500/8';
  if (status === 'REQUIRES_APPROVAL') return 'bg-amber-500/10';
  if (status === 'BLOCKED')           return 'bg-red-500/8';
  return 'bg-slate-800/30';
}

function smokeIcon(status: SmokeTestStatus): string {
  if (status === 'PASS') return '✓';
  if (status === 'FAIL') return '✗';
  return '○';
}

function smokeColor(status: SmokeTestStatus): string {
  if (status === 'PASS') return 'text-emerald-400';
  if (status === 'FAIL') return 'text-red-400';
  return 'text-slate-400';
}

function healthIcon(status: HealthCheckStatus): string {
  if (status === 'HEALTHY')   return '●';
  if (status === 'DEGRADED')  return '◐';
  if (status === 'DOWN')      return '○';
  return '○';
}

function healthColor(status: HealthCheckStatus): string {
  if (status === 'HEALTHY')   return 'text-emerald-400';
  if (status === 'DEGRADED')  return 'text-amber-400';
  if (status === 'DOWN')      return 'text-red-400';
  return 'text-slate-400';
}

// ─── Action Label Badge ──────────────────────────────────────────────────────

function ActionBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    COMPLETED:         'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    SIMULATED:         'bg-sky-500/15 text-sky-400 border-sky-500/25',
    ANALYZED:          'bg-violet-500/15 text-violet-400 border-violet-500/25',
    PROPOSED:          'bg-blue-500/15 text-blue-400 border-blue-500/25',
    REQUIRES_APPROVAL: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    BLOCKED:           'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wide border ${styles[label] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
      {label}
    </span>
  );
}

// ─── Release Gate Section ────────────────────────────────────────────────────

function ReleaseGateSection({ checks }: { checks: ReleaseGateCheck[] }) {
  const passCount = checks.filter(c => c.status === 'PASS').length;
  const allPass = passCount === checks.length;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Release Gate</h2>
          <p className="text-sm text-slate-400 mt-0.5">All checks must pass before deployment</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${
          allPass
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
        }`}>
          {allPass ? '✓ All Checks Passed' : `${passCount}/${checks.length} Passing`}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map(check => (
          <div
            key={check.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${gateBg(check.status)}`}
          >
            <span className={`text-lg font-bold mt-0.5 ${gateColor(check.status)}`}>
              {gateIcon(check.status)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-100">{check.name}</span>
                <ActionBadge label={check.actionLabel} />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{check.detail}</p>
              {check.remediationNote && (
                <p className="text-xs text-amber-400 mt-1">⚠ {check.remediationNote}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Deployment Steps ────────────────────────────────────────────────────────

function DeploymentStepsSection({ steps }: { steps: DeploymentStep[] }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Deployment Steps</h2>
        <p className="text-sm text-slate-400 mt-0.5">Sequential deployment pipeline — production step requires explicit approval</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700/60" />

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Step circle */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step.status === 'SIMULATED' || step.status === 'COMPLETED'
                  ? 'bg-sky-900/40 border-sky-500/50 text-sky-400'
                  : step.status === 'REQUIRES_APPROVAL'
                  ? 'bg-amber-900/30 border-amber-500/50 text-amber-300'
                  : step.status === 'BLOCKED'
                  ? 'bg-red-900/30 border-red-500/50 text-red-400'
                  : 'bg-slate-800/60 border-slate-600/50 text-slate-500'
              }`}>
                {step.status === 'SIMULATED' || step.status === 'COMPLETED' ? '✓' :
                 step.status === 'REQUIRES_APPROVAL' ? '⊙' :
                 step.status === 'BLOCKED' ? '✗' :
                 idx + 1}
              </div>

              {/* Step content */}
              <div className={`flex-1 border rounded-xl p-4 ${stepBg(step.status)} ${stepBorder(step.status)}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${stepColor(step.status)}`}>{step.name}</span>
                      <ActionBadge label={step.actionLabel} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                  </div>
                  {step.durationMs && (
                    <span className="text-xs text-slate-500 font-mono flex-shrink-0">
                      {(step.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                {step.output && (
                  <div className="mt-3 bg-slate-900/60 rounded-lg p-3 border border-slate-700/40">
                    <p className="text-xs font-mono text-emerald-400 leading-relaxed">{step.output}</p>
                  </div>
                )}

                {step.status === 'REQUIRES_APPROVAL' && (
                  <div className="mt-3 bg-amber-950/30 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-300 leading-relaxed">
                      🔒 {step.blockedReason}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        disabled
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700/50 text-slate-500 border border-slate-600/30 cursor-not-allowed"
                        title="Production deployment is disabled in this demo"
                      >
                        Approve Production Deploy
                      </button>
                      <span className="text-xs text-slate-500 self-center">— disabled in demo mode</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Smoke Tests ─────────────────────────────────────────────────────────────

function SmokeTestsSection({ tests }: { tests: SmokeTest[] }) {
  const passCount = tests.filter(t => t.status === 'PASS').length;
  const avgMs = Math.round(tests.reduce((a, t) => a + (t.durationMs ?? 0), 0) / tests.length);

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Smoke Tests</h2>
          <p className="text-sm text-slate-400 mt-0.5">Critical-path endpoint verification against staging</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{passCount}/{tests.length}</div>
            <div className="text-xs text-slate-500">Passing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-300">{avgMs}ms</div>
            <div className="text-xs text-slate-500">Avg Response</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-700/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1">Status</div>
          <div className="col-span-4">Test</div>
          <div className="col-span-5">Endpoint</div>
          <div className="col-span-1 text-right">Code</div>
          <div className="col-span-1 text-right">ms</div>
        </div>
        {tests.map((t, idx) => (
          <div
            key={t.id}
            className={`grid grid-cols-12 px-4 py-3 items-center text-sm ${
              idx % 2 === 0 ? 'bg-slate-900/20' : ''
            } border-b border-slate-700/20 last:border-0`}
          >
            <div className={`col-span-1 font-bold text-base ${smokeColor(t.status)}`}>
              {smokeIcon(t.status)}
            </div>
            <div className="col-span-4 text-slate-300 text-xs truncate">{t.name}</div>
            <div className="col-span-5 font-mono text-slate-400 text-xs truncate">
              <span className="text-sky-500 mr-1">{t.method}</span>
              {t.endpoint}
            </div>
            <div className={`col-span-1 text-right font-mono text-xs font-semibold ${
              (t.actualStatus ?? 0) < 400 ? 'text-emerald-400' : 'text-red-400'
            }`}>{t.actualStatus}</div>
            <div className="col-span-1 text-right font-mono text-xs text-slate-400">{t.durationMs}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Health Checks ───────────────────────────────────────────────────────────

function HealthChecksSection({ checks }: { checks: HealthCheck[] }) {
  const healthyCount = checks.filter(c => c.status === 'HEALTHY').length;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Service Health</h2>
          <p className="text-sm text-slate-400 mt-0.5">Infrastructure health verification post-staging deploy</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
          healthyCount === checks.length
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
        }`}>
          {healthyCount}/{checks.length} Healthy
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map(check => (
          <div
            key={check.id}
            className="flex items-start gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30"
          >
            <span className={`text-xl mt-0.5 ${healthColor(check.status)}`}>
              {healthIcon(check.status)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-100">{check.service}</span>
                <span className="text-xs text-slate-500 font-mono">{check.type}</span>
                <ActionBadge label={check.actionLabel} />
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">{check.endpoint}</p>
              <p className="text-xs text-slate-400 mt-1">{check.message}</p>
              {check.responseTimeMs !== undefined && (
                <p className={`text-xs font-mono mt-1 ${
                  check.responseTimeMs < 100 ? 'text-emerald-400' :
                  check.responseTimeMs < 500 ? 'text-amber-400' : 'text-red-400'
                }`}>{check.responseTimeMs}ms response</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Changelog Panel ─────────────────────────────────────────────────────────

function ChangelogPanel({ changelog, releaseNotes, version }: {
  changelog: string;
  releaseNotes: string;
  version: string;
}) {
  const [tab, setTab] = useState<'changelog' | 'notes'>('changelog');

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Release Artifacts</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Version <span className="font-mono text-sky-400">{version}</span> — auto-generated by ReleasePilot AI
          </p>
        </div>
        <div className="flex gap-1 bg-slate-800/60 rounded-lg p-1 border border-slate-700/50">
          {(['changelog', 'notes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'changelog' ? 'CHANGELOG.md' : 'Release Notes'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-xs font-mono text-slate-400">
            {tab === 'changelog' ? 'CHANGELOG.md' : 'RELEASE_NOTES.md'}
          </span>
          <div className="ml-auto">
            <ActionBadge label="PROPOSED" />
          </div>
        </div>
        <pre className="p-5 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-96">
          {tab === 'changelog' ? changelog : releaseNotes}
        </pre>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default async function DeployPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: runId } = await params;
  const report = PHASE4_DEPLOYMENT_REPORT;
  const isDemo = runId === 'run_01';

  const passedGates = report.gateChecks.filter(c => c.status === 'PASS').length;
  const passedSmoke = report.smokeTests.filter(t => t.status === 'PASS').length;
  const healthyServices = report.healthChecks.filter(c => c.status === 'HEALTHY').length;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/runs" className="hover:text-slate-300 transition-colors">Runs</Link>
            <span>/</span>
            <Link href={`/runs/${runId}`} className="hover:text-slate-300 transition-colors font-mono">{runId}</Link>
            <span>/</span>
            <span className="text-slate-300">Deploy</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Deployment Preparation
                <span className="ml-3 text-base font-mono text-sky-400">{report.version}</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                E-Commerce Platform · {report.environment}
                {!isDemo && <span className="ml-2 text-amber-400 text-xs">(demo data shown — connect a real repository to see live results)</span>}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                report.overallStatus === 'SIMULATED'
                  ? 'bg-sky-500/10 border-sky-500/25 text-sky-400'
                  : report.overallStatus === 'READY'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
              }`}>
                {report.overallStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Gate Checks', value: `${passedGates}/${report.gateChecks.length}`, color: 'text-emerald-400', icon: '🚦' },
            { label: 'Smoke Tests', value: `${passedSmoke}/${report.smokeTests.length}`, color: 'text-sky-400', icon: '🧪' },
            { label: 'Services Healthy', value: `${healthyServices}/${report.healthChecks.length}`, color: 'text-emerald-400', icon: '💚' },
            { label: 'Semver', value: report.version, color: 'text-violet-400', icon: '🏷️' },
          ].map(m => (
            <div key={m.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="text-xl mb-1">{m.icon}</div>
              <div className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Action label legend */}
        <div className="mb-8 flex flex-wrap gap-3 p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl">
          <span className="text-xs text-slate-500 self-center font-semibold mr-1">Key:</span>
          {[
            ['ANALYZED',          'Inspected by agent — no changes made'],
            ['PROPOSED',          'Recommended — not yet applied'],
            ['SIMULATED',         'Validated in demo — would run in real deploy'],
            ['REQUIRES_APPROVAL', 'Blocked until engineer approves'],
          ].map(([label, desc]) => (
            <div key={label} className="flex items-center gap-2">
              <ActionBadge label={label} />
              <span className="text-xs text-slate-500">{desc}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          <ReleaseGateSection checks={report.gateChecks} />
          <DeploymentStepsSection steps={report.steps} />
          <SmokeTestsSection tests={report.smokeTests} />
          <HealthChecksSection checks={report.healthChecks} />
          <ChangelogPanel
            changelog={report.changelog}
            releaseNotes={report.releaseNotes}
            version={report.version}
          />
        </div>

        {/* Footer navigation */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
          <Link
            href={`/runs/${runId}`}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to Run Report
          </Link>
          <Link
            href="/runs"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            All Runs →
          </Link>
        </div>
      </div>
    </div>
  );
}
