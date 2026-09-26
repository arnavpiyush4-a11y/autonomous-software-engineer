'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  route: string;
  cta: string;
  icon: string;
  description: string;
  evidence: string[];
  keyTakeaway: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Repository Onboarding',
    subtitle: 'Connect and scan the E-Commerce Platform',
    duration: '~30s',
    route: '/repositories/repo_ecommerce',
    cta: 'View Repository →',
    icon: '🔍',
    description:
      'ReleasePilot automatically scans the repository structure, detects languages, frameworks, CI/CD config, dependencies, Docker files, and AGENTS.md project instructions.',
    evidence: [
      '45 files scanned · 28,540 lines of code',
      'TypeScript 71%, JavaScript 18%, CSS 8%',
      '5-component architecture mapped (Frontend, API, Auth, DB, Cache)',
      'Health score: 67/100 — 6 issues detected',
    ],
    keyTakeaway: 'The agent understands the repository before it writes a single line.',
  },
  {
    id: 2,
    title: 'Baseline Health Report',
    subtitle: 'Six seeded issues found before any fix',
    duration: '~30s',
    route: '/repositories/repo_ecommerce',
    cta: 'See Health Findings →',
    icon: '🐛',
    description:
      'Static analysis, CVE scanning, test execution, coverage measurement, documentation diffing, and configuration validation — all run before proposing any change.',
    evidence: [
      'CRITICAL: Password-reset token never invalidated (account takeover risk)',
      'CRITICAL: jsonwebtoken@8.5.1 — CVE-2022-23529 (CVSS 7.6)',
      'HIGH: 3 failing tests in cart/discount.test.ts',
      'HIGH: Test coverage at 71.4% — below 80% threshold',
      'MEDIUM: README documents wrong API endpoint (/forgot-password vs /reset-password)',
      'LOW: Docker healthcheck targets "/" instead of "/api/v1/health"',
    ],
    keyTakeaway: 'Before suggesting anything, the agent diagnoses the entire codebase.',
  },
  {
    id: 3,
    title: 'Autonomous Task Execution',
    subtitle: 'Dynamic plan → live execution → approval gate',
    duration: '~2min',
    route: '/runs/new?repo=repo_ecommerce',
    cta: 'Start Agent Run →',
    icon: '⚡',
    description:
      'Enter a natural-language task. The agent generates a dynamic 10-stage plan, executes parallel workers (Debugger, Test Engineer, Security Reviewer, etc.), and pauses at a mandatory human approval gate before writing any files.',
    evidence: [
      'Task: "Prepare this project for release and resolve all issues"',
      '10 stages planned dynamically based on detected issues',
      '7 parallel specialist workers assigned',
      'All findings labeled: ANALYZED / PROPOSED / SIMULATED',
      '⏸ PAUSED at approval gate — no auto-approve, ever',
    ],
    keyTakeaway: 'The agent is autonomous but never acts without human sign-off on destructive changes.',
  },
  {
    id: 4,
    title: 'Human Approval Gate',
    subtitle: 'Explicit review before any file is written',
    duration: '~30s',
    route: '/runs/new?repo=repo_ecommerce',
    cta: 'See Approval Modal →',
    icon: '🔒',
    description:
      'After root-cause analysis and fix proposal, the run pauses. The approval modal shows exactly which files will change, the potential impact, and a rollback plan. Three options: Approve, Request Changes, or Reject.',
    evidence: [
      '5 files proposed for modification — shown with line counts',
      'Potential impact explained: auth flow, pricing, JWT config',
      'Rollback: git revert HEAD on branch fix/releasepilot-run',
      'No timeout — the gate waits for a human forever',
      'If rejected, zero changes are applied',
    ],
    keyTakeaway: 'Autonomous ≠ uncontrolled. Humans own every release gate.',
  },
  {
    id: 5,
    title: 'Before/After Results',
    subtitle: 'Measurable engineering improvement',
    duration: '~30s',
    route: '/demo/compare',
    cta: 'See Comparison →',
    icon: '📊',
    description:
      'After the run completes, every metric is measured before and after. The transformation is immediate and quantifiable.',
    evidence: [
      'Health score: 67 → 94 (+27 points)',
      'Issues fixed: 0/6 → 6/6 (100%)',
      'Tests passing: 142/145 → 145/145',
      'Test coverage: 71.4% → 85.6% (+14.2%)',
      'Release risk: HIGH → LOW (94/100)',
    ],
    keyTakeaway: 'Real numbers, not promises. Every improvement is traced to a specific fix.',
  },
  {
    id: 6,
    title: 'Full Engineering Report',
    subtitle: 'Code review, release risk, approval record',
    duration: '~45s',
    route: '/runs/run_01',
    cta: 'View Full Report →',
    icon: '📋',
    description:
      'The run detail page shows the complete evidence: workflow timeline, code changes with diffs, review findings by severity, test results comparison, release risk score breakdown, and the approval decision record.',
    evidence: [
      'Workflow timeline: 10/10 stages completed',
      '6 code changes with before/after diffs',
      '6 review findings — 2 CRITICAL fixed, 2 HIGH fixed',
      'Release risk score: 94/100 — LOW risk',
      'Approval record: APPROVED by demo-user',
    ],
    keyTakeaway: 'Complete audit trail from problem to fix to validated release.',
  },
  {
    id: 7,
    title: 'Deployment Preparation',
    subtitle: 'Release gate, smoke tests, health checks',
    duration: '~45s',
    route: '/runs/run_01/deploy',
    cta: 'Deployment Checklist →',
    icon: '🚀',
    description:
      'Deployment preparation validates the full release: 8 gate checks, a sequential deployment pipeline, 12 smoke tests, 6 service health checks, and auto-generated changelog + release notes.',
    evidence: [
      '8/8 release gate checks passing (Build, Tests, Lint, Security, Deps, Docs, Config, Changelog)',
      'Version v2.4.0 · MINOR (new auth behavior)',
      '12/12 smoke tests passing (avg 157ms)',
      '6/6 services healthy (API, DB, Redis, Email, Stripe, CDN)',
      'Production deploy: REQUIRES_APPROVAL — blocked in demo mode',
    ],
    keyTakeaway: 'Deployment is safe: every gate must pass, production requires a human key.',
  },
];

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  isActive,
  isCompleted,
  onClick,
}: {
  step: DemoStep;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 p-4 ${
        isActive
          ? 'border-blue-500/50 bg-blue-500/8 shadow-lg shadow-blue-900/20'
          : isCompleted
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
          isActive ? 'bg-blue-500/20' : isCompleted ? 'bg-emerald-500/20' : 'bg-slate-700/60'
        }`}>
          {isCompleted ? '✓' : step.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${
              isActive ? 'text-blue-300' : isCompleted ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              {step.id}. {step.title}
            </span>
            <span className="text-2xs text-slate-500 font-mono">{step.duration}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.subtitle}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const step = DEMO_STEPS.find((s) => s.id === activeStep)!;

  function markComplete() {
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps((p) => [...p, activeStep]);
    }
    if (activeStep < DEMO_STEPS.length) {
      setActiveStep(activeStep + 1);
    }
  }

  async function resetDemo() {
    setResetting(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json() as { message: string };
      setResetMsg(data.message ?? 'Demo reset.');
      setCompletedSteps([]);
      setActiveStep(1);
    } catch {
      setResetMsg('Reset complete (offline mode).');
      setCompletedSteps([]);
      setActiveStep(1);
    } finally {
      setResetting(false);
      setTimeout(() => setResetMsg(''), 3000);
    }
  }

  const totalEstMin = 5;
  const progress = Math.round((completedSteps.length / DEMO_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-[#0a0e1a] to-violet-950/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ReleasePilot AI · Judge Demo</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                From Broken Repository to Verified Release
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                7-step guided demo · ~{totalEstMin} minutes · E-Commerce Platform (seeded with 6 engineering issues)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Reset button */}
              <button
                onClick={resetDemo}
                disabled={resetting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600/50 bg-slate-800/60 text-slate-300 text-sm font-medium hover:bg-slate-700/60 transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                {resetting ? 'Resetting…' : 'Reset Demo'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-400 text-sm hover:text-slate-200 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">Demo progress</span>
              <span className="text-xs font-mono text-blue-400">{completedSteps.length}/{DEMO_STEPS.length} steps</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {resetMsg && (
            <div className="mt-3 text-xs text-emerald-400 flex items-center gap-2">
              <span>✓</span> {resetMsg}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Step navigator */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Steps</p>
            {DEMO_STEPS.map((s) => (
              <StepCard
                key={s.id}
                step={s}
                isActive={s.id === activeStep}
                isCompleted={completedSteps.includes(s.id)}
                onClick={() => setActiveStep(s.id)}
              />
            ))}
          </div>

          {/* Right: Step detail */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
              {/* Step header */}
              <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/6 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-2xl flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">Step {step.id}/{DEMO_STEPS.length}</span>
                      <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">{step.duration}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 mt-1">{step.title}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{step.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Step body */}
              <div className="px-6 py-6 space-y-6">
                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>

                {/* Evidence / what to show */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What judges should see</h3>
                  <ul className="space-y-2">
                    {step.evidence.map((e, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5 font-bold">›</span>
                        <span className="text-slate-300 leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key takeaway */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/6 p-4">
                  <p className="text-xs font-semibold text-violet-400 mb-1">Key Takeaway</p>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{step.keyTakeaway}</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={step.route}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30"
                  >
                    {step.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Link>
                  <button
                    onClick={markComplete}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                      completedSteps.includes(activeStep)
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default'
                        : 'border-slate-600/50 bg-slate-700/40 text-slate-300 hover:bg-slate-700/70'
                    }`}
                  >
                    {completedSteps.includes(activeStep) ? '✓ Done' : 'Mark Done →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Core value proposition */}
            {activeStep === DEMO_STEPS.length && completedSteps.includes(DEMO_STEPS.length) && (
              <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
                <div className="text-3xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2">Demo Complete!</h3>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  You&apos;ve seen ReleasePilot AI take the E-Commerce Platform from{' '}
                  <span className="text-red-400 font-semibold">67/100 health · 6 open issues · 3 failing tests</span>{' '}
                  to{' '}
                  <span className="text-emerald-400 font-semibold">94/100 health · 0 open issues · 145/145 tests passing</span>{' '}
                  — with a full audit trail, human approval gate, and deployment checklist.
                </p>
                <div className="mt-4 flex gap-3 justify-center">
                  <Link href="/demo/compare" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                    Before/After Comparison →
                  </Link>
                  <button
                    onClick={resetDemo}
                    className="px-5 py-2.5 rounded-xl border border-slate-600/50 bg-slate-700/40 text-slate-300 text-sm font-semibold hover:bg-slate-700/70 transition-colors"
                  >
                    Restart Demo
                  </button>
                </div>
              </div>
            )}

            {/* Quick navigation to other key pages */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/repositories/repo_ecommerce', label: 'Repository', icon: '📁' },
                { href: '/runs/new?repo=repo_ecommerce', label: 'Start Run', icon: '⚡' },
                { href: '/runs/run_01', label: 'Full Report', icon: '📋' },
                { href: '/demo/compare', label: 'Before/After', icon: '📊' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all"
                >
                  <span className="text-base">{l.icon}</span>
                  <span className="font-medium text-xs">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
