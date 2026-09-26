'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { NexusState, NexusNode, NexusEdge, ImpactAnalysis, ConfidenceExplanation, FlightEntry } from '@/lib/db/types';
import { DEMO_POST_RUN_CONFIDENCE, DEMO_PRE_RUN_CONFIDENCE } from '@/lib/confidence/engine';

// ─── Static flight recorder data ─────────────────────────────────────────────

const FLIGHT_DATA: FlightEntry[] = [
  { id: 'f01', timestamp: '14:00:00', kind: 'WORKFLOW_TRANSITION', worker: 'Planner', message: 'Task received — scope analysis starting', actionLabel: 'ANALYZED', confidenceDelta: undefined, evidence: 'Task: Prepare for release' },
  { id: 'f02', timestamp: '14:00:32', kind: 'WORKFLOW_TRANSITION', worker: 'Architecture Analyst', message: 'Repository scanned — 45 files, 28,540 LOC, 5-component architecture mapped', actionLabel: 'ANALYZED', confidenceDelta: undefined, evidence: '5 nodes · 6 connections' },
  { id: 'f03', timestamp: '14:01:02', kind: 'WORKFLOW_TRANSITION', worker: 'Debugger', message: 'CRITICAL: Password reset token never invalidated — account takeover risk', actionLabel: 'ANALYZED', confidenceDelta: -15, evidence: 'src/auth/password-reset.ts:67' },
  { id: 'f04', timestamp: '14:01:15', kind: 'WORKFLOW_TRANSITION', worker: 'Debugger', message: 'HIGH: Floating-point discount arithmetic — 3 tests failing', actionLabel: 'ANALYZED', confidenceDelta: -8, evidence: 'src/cart/discount.ts:23' },
  { id: 'f05', timestamp: '14:02:32', kind: 'TEST_RESULT',         worker: 'Test Engineer', message: 'Baseline: 142/145 tests passing, 71.4% coverage', actionLabel: 'SIMULATED', confidenceDelta: -5, evidence: '3 failing in discount.test.ts' },
  { id: 'f06', timestamp: '14:05:14', kind: 'WORKFLOW_TRANSITION', worker: 'Security Reviewer', message: 'CRITICAL CVE: jsonwebtoken@8.5.1 — CVE-2022-23529 (CVSS 7.6)', actionLabel: 'ANALYZED', confidenceDelta: -15, evidence: 'package.json' },
  { id: 'f07', timestamp: '14:06:24', kind: 'APPROVAL_DECISION',   worker: 'Planner', message: 'PAUSED — 5 file writes require human approval. No auto-approve.', actionLabel: 'REQUIRES_APPROVAL', confidenceDelta: undefined, runId: 'run_01' },
  { id: 'f08', timestamp: '14:06:48', kind: 'APPROVAL_DECISION',   worker: 'Alex Chen', message: 'APPROVED — reviewed all proposed diffs, proceeding', actionLabel: 'ANALYZED', confidenceDelta: +12, runId: 'run_01', evidence: 'Human explicit approval' },
  { id: 'f09', timestamp: '14:07:10', kind: 'WORKFLOW_TRANSITION', worker: 'Debugger', message: 'PROPOSED: Add token.usedAt check to password-reset.ts', actionLabel: 'PROPOSED', confidenceDelta: +10, evidence: '+2 lines' },
  { id: 'f10', timestamp: '14:07:30', kind: 'WORKFLOW_TRANSITION', worker: 'Security Reviewer', message: 'PROPOSED: Upgrade jsonwebtoken 8.5.1 → 9.0.2', actionLabel: 'PROPOSED', confidenceDelta: +10, evidence: 'CVE-2022-23529 resolved' },
  { id: 'f11', timestamp: '14:10:30', kind: 'WORKFLOW_TRANSITION', worker: 'Test Engineer', message: 'PROPOSED: 3 regression tests for token invalidation', actionLabel: 'PROPOSED', confidenceDelta: +8, evidence: '+19 lines, 3 tests' },
  { id: 'f12', timestamp: '14:13:10', kind: 'TEST_RESULT',         worker: 'Test Engineer', message: 'After-fix: 145/145 tests passing, 85.6% coverage', actionLabel: 'SIMULATED', confidenceDelta: +15, evidence: '0 failing · +14.2% coverage' },
  { id: 'f13', timestamp: '14:15:08', kind: 'RELEASE_DECISION',    worker: 'Release Manager', message: 'Release confidence: 94/100 — LOW risk', actionLabel: 'ANALYZED', confidenceDelta: undefined, evidence: 'Final score' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function actionColor(label: FlightEntry['actionLabel']): string {
  const m: Record<string, string> = {
    ANALYZED: '#60a5fa',
    PROPOSED: '#a78bfa',
    SIMULATED: '#9ca3af',
    EXECUTED: '#34d399',
    BLOCKED: '#f87171',
    REQUIRES_APPROVAL: '#fbbf24',
  };
  return m[label] ?? '#60a5fa';
}

function nodeColor(type: NexusNode['type']): string {
  const m: Record<string, string> = {
    frontend: '#3b82f6',
    api: '#8b5cf6',
    database: '#10b981',
    cache: '#f59e0b',
    auth: '#ef4444',
    test: '#06b6d4',
    ci: '#f97316',
    deps: '#ec4899',
    deploy: '#84cc16',
    docs: '#6b7280',
  };
  return m[type] ?? '#6b7280';
}

function statusColor(status: NexusNode['status']): string {
  return { HEALTHY: '#10b981', DEGRADED: '#f59e0b', ISSUE: '#ef4444', UNKNOWN: '#6b7280' }[status];
}

function riskColor(risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined): string {
  if (!risk) return '#6b7280';
  return { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' }[risk];
}

function ScoreMeter({ score, size = 100 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  return (
    <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`} aria-label={`Confidence score ${score}/100`}>
      <circle cx={size / 2} cy={size * 0.65} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.08}
        strokeDasharray={`${circ * 0.75} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size * 0.65})`} />
      <circle cx={size / 2} cy={size * 0.65} r={r} fill="none" stroke={color} strokeWidth={size * 0.08}
        strokeDasharray={`${circ * 0.75 * pct} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
        transform={`rotate(135 ${size / 2} ${size * 0.65})`} />
      <text x={size / 2} y={size * 0.62} textAnchor="middle" fill={color} fontSize={size * 0.22} fontWeight="bold" fontFamily="monospace">{score}</text>
      <text x={size / 2} y={size * 0.74} textAnchor="middle" fill="rgba(156,163,175,0.7)" fontSize={size * 0.11} fontFamily="sans-serif">/ 100</text>
    </svg>
  );
}

// ─── Architecture Knowledge Graph ─────────────────────────────────────────────

function ArchitectureGraph({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  impactNodeIds,
  instanceId = 'arch',
}: {
  nodes: NexusNode[];
  edges: NexusEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  impactNodeIds: Set<string>;
  instanceId?: string;
}) {
  const W = 700;
  const H = 330;
  const gridId = `nexus-grid-${instanceId}`;
  const glowId = `node-glow-${instanceId}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: '330px' }}
      role="img"
      aria-label="Architecture knowledge graph"
    >
      {/* Grid background */}
      <defs>
        <pattern id={gridId} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        </pattern>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${gridId})`} rx="12"/>

      {/* Edges */}
      {edges.map((edge) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to = nodes.find((n) => n.id === edge.to);
        if (!from || !to) return null;

        const fx = from.x + 50, fy = from.y + 25;
        const tx = to.x + 50, ty = to.y + 25;
        const mx = (fx + tx) / 2, my = (fy + ty) / 2;
        const highlight = impactNodeIds.has(edge.from) && impactNodeIds.has(edge.to);
        const edgeColor = highlight ? riskColor('HIGH') : 'rgba(148,163,184,0.2)';

        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line x1={fx} y1={fy} x2={tx} y2={ty}
              stroke={edgeColor} strokeWidth={highlight ? 2 : 1}
              strokeDasharray={highlight ? '4 2' : 'none'}
              style={{ transition: 'all 0.3s' }} />
            {edge.label && (
              <text x={mx} y={my - 5} textAnchor="middle" fill="rgba(156,163,175,0.5)" fontSize="9" fontFamily="sans-serif">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const color = nodeColor(node.type);
        const isSelected = selectedNodeId === node.id;
        const isImpacted = impactNodeIds.has(node.id);
        const borderColor = isSelected ? '#f9fafb' : isImpacted ? riskColor('HIGH') : color;
        const bgOpacity = isSelected ? 0.25 : isImpacted ? 0.2 : 0.12;

        return (
          <g key={node.id}
            onClick={() => onSelectNode(isSelected ? null : node.id)}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`${node.label} — ${node.status}`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectNode(isSelected ? null : node.id)}
          >
            {/* Pulse ring for impacted nodes */}
            {isImpacted && (
              <circle cx={node.x + 50} cy={node.y + 24} r="36"
                fill="none" stroke={riskColor('HIGH')} strokeWidth="1"
                opacity="0.4" strokeDasharray="4 3" />
            )}

            {/* Node background */}
            <rect x={node.x} y={node.y} width="100" height="48" rx="8"
              fill={`rgba(${hexToRgb(color)},${bgOpacity})`}
              stroke={borderColor} strokeWidth={isSelected || isImpacted ? 1.5 : 1}
              style={{ transition: 'all 0.25s' }} />

            {/* Status dot */}
            <circle cx={node.x + 90} cy={node.y + 10} r="4"
              fill={statusColor(node.status)} />

            {/* Label */}
            <text x={node.x + 50} y={node.y + 18} textAnchor="middle"
              fill="#f9fafb" fontSize="10" fontWeight="600" fontFamily="sans-serif">
              {node.label}
            </text>
            <text x={node.x + 50} y={node.y + 30} textAnchor="middle"
              fill="rgba(156,163,175,0.7)" fontSize="8" fontFamily="sans-serif">
              {node.technology.split(' · ')[0]}
            </text>

            {/* Issues badge */}
            {node.issues > 0 && (
              <g>
                <circle cx={node.x + 10} cy={node.y + 10} r="7" fill="#ef4444" />
                <text x={node.x + 10} y={node.y + 14} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{node.issues}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Impact Radar ─────────────────────────────────────────────────────────────

function ImpactRadar({
  analyses,
  onAnalysisSelect,
  selectedSource,
}: {
  analyses: ImpactAnalysis[];
  onAnalysisSelect: (a: ImpactAnalysis | null) => void;
  selectedSource: string | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-xs text-slate-400">Select a change to see impact propagation across the architecture</p>
      </div>
      {analyses.map((a) => {
        const isSelected = selectedSource === a.sourceId;
        return (
          <button
            key={a.sourceId}
            onClick={() => onAnalysisSelect(isSelected ? null : a)}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
              isSelected
                ? 'border-amber-500/50 bg-amber-500/8'
                : 'border-slate-700/40 bg-slate-800/20 hover:border-slate-600/50 hover:bg-slate-800/40'
            }`}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-1.5 rounded-full mt-1 self-stretch`}
                style={{ backgroundColor: riskColor(a.riskLevel) }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-200">{a.sourceLabel}</span>
                  <span className="text-2xs font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${riskColor(a.riskLevel)}20`, color: riskColor(a.riskLevel) }}>
                    {a.riskLevel} RISK
                  </span>
                </div>
                <code className="text-2xs text-slate-500 font-mono">{a.sourceId}</code>
                {isSelected && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-slate-300 leading-relaxed">{a.summary}</p>
                    <div className="mt-2">
                      <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Affected components</p>
                      {a.affectedNodes.map((n) => (
                        <div key={n.nodeId} className="flex items-start gap-2 text-xs py-1">
                          <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ backgroundColor: riskColor(n.risk) }} />
                          <span className="text-slate-400">{n.reason}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1">
                      <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tests to verify</p>
                      {a.affectedTests.map((t) => (
                        <code key={t} className="block text-2xs text-blue-400 font-mono">{t}</code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <svg className={`flex-shrink-0 mt-0.5 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Release Confidence Panel ─────────────────────────────────────────────────

function ConfidencePanel({ conf, showBefore }: { conf: ConfidenceExplanation; showBefore: boolean }) {
  const displayConf = showBefore ? DEMO_PRE_RUN_CONFIDENCE : conf;
  const categoryColors: Record<string, string> = {
    BUILD: '#3b82f6', TEST: '#10b981', SECURITY: '#ef4444',
    REVIEW: '#f59e0b', DOCS: '#8b5cf6', CONFIG: '#06b6d4', APPROVAL: '#ec4899',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreMeter score={displayConf.overallScore} size={90} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-100">{displayConf.overallScore}<span className="text-sm text-slate-500">/100</span></span>
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${riskColor(displayConf.riskLevel)}20`, color: riskColor(displayConf.riskLevel) }}>
              {displayConf.riskLevel} RISK
            </span>
          </div>
          <p className="text-xs text-slate-400">Weighted across {displayConf.signals.length} signals</p>
          <p className="text-2xs text-slate-600 font-mono mt-0.5">{displayConf.calculatedAt.slice(0, 16).replace('T', ' ')}</p>
        </div>
      </div>

      {displayConf.blockers.length > 0 && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/8 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1.5">Release Blockers</p>
          {displayConf.blockers.map((b, i) => (
            <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
              <span className="text-red-400 flex-shrink-0">✗</span> {b}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {displayConf.signals.map((sig) => (
          <div key={sig.name} className="group">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold px-1 py-0.5 rounded"
                  style={{ backgroundColor: `${categoryColors[sig.category] ?? '#6b7280'}20`, color: categoryColors[sig.category] ?? '#6b7280' }}>
                  {sig.category}
                </span>
                <span className="text-xs text-slate-300">{sig.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-slate-500">{sig.evidence}</span>
                <span className="text-xs font-bold" style={{ color: sig.score >= 70 ? '#10b981' : sig.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                  {sig.score}
                </span>
              </div>
            </div>
            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${sig.score}%`, backgroundColor: sig.score >= 70 ? '#10b981' : sig.score >= 40 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <p className="text-2xs text-slate-600 mt-0.5 group-hover:text-slate-400 transition-colors">{sig.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flight Recorder ─────────────────────────────────────────────────────────

function FlightRecorder({ entries }: { entries: FlightEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL' ? entries : entries.filter((e) => e.actionLabel === filter);

  const filters = ['ALL', 'ANALYZED', 'PROPOSED', 'SIMULATED', 'REQUIRES_APPROVAL'];

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-1 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-2xs font-bold px-2 py-1 rounded transition-colors ${
              filter === f ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1" ref={endRef}>
        {filtered.map((entry, i) => (
          <div key={entry.id}
            className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-800/30 transition-colors"
            style={{ animationDelay: `${i * 0.03}s` }}>
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: actionColor(entry.actionLabel) }} />
              {i < filtered.length - 1 && <div className="w-px h-4 bg-slate-700/50 mt-0.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xs font-mono text-slate-600">{entry.timestamp}</span>
                <span className="text-2xs font-bold px-1 py-0.5 rounded"
                  style={{ backgroundColor: `${actionColor(entry.actionLabel)}20`, color: actionColor(entry.actionLabel) }}>
                  {entry.actionLabel.replace('_', ' ')}
                </span>
                <span className="text-2xs text-slate-500">{entry.worker}</span>
                {entry.confidenceDelta !== undefined && (
                  <span className={`text-2xs font-bold ${entry.confidenceDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.confidenceDelta > 0 ? '+' : ''}{entry.confidenceDelta}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{entry.message}</p>
              {entry.evidence && (
                <code className="text-2xs text-blue-400 font-mono">{entry.evidence}</code>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Proof Mode Panel ──────────────────────────────────────────────────────────

function ProofModePanel() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    exitCode: number;
    stdout: string;
    durationMs: number;
    timedOut: boolean;
    command: string;
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState('run-tests');

  async function runProof() {
    if (running) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setError(String(data.error ?? 'Unknown error'));
      } else {
        const cmdResult = data.result as { exitCode: number; stdout: string; durationMs: number; timedOut: boolean };
        setResult({ ...cmdResult, command: String(data.command ?? command), label: String(data.label ?? 'EXECUTED') });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
        <div className="flex items-start gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-xs text-amber-300 leading-relaxed">
            <span className="font-semibold">Safe Local Sandbox</span> — commands run against the bundled fixture repository only.
            No network, no secrets, no external writes. Output capped at 64KB. Timeout: 30s.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
        >
          <option value="run-tests">run-tests — Execute fixture test suite (node tests/run.js)</option>
          <option value="analyze-deps">analyze-deps — Scan for vulnerable dependencies</option>
        </select>
        <button
          onClick={runProof}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
        >
          {running ? 'Running…' : '▶ Execute'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-3 text-xs text-red-300">{error}</div>
      )}

      {result && (
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                result.exitCode === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              }`}>
                exit {result.exitCode}
              </span>
              <span className="text-2xs font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded">
                {result.label}
              </span>
              <span className="text-2xs text-slate-500 font-mono">{result.durationMs}ms</span>
            </div>
            {result.exitCode !== 0 && (
              <span className="text-2xs text-amber-400">2 failures expected (buggy baseline)</span>
            )}
          </div>
          <pre className="p-3 text-2xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
            {result.stdout || result.label}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Nexus Node Detail ────────────────────────────────────────────────────────

function NodeDetail({ node }: { node: NexusNode }) {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${nodeColor(node.type)}30`, backgroundColor: `${nodeColor(node.type)}08` }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{node.label}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{node.technology}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor(node.status) }} />
          <span className="text-2xs font-semibold" style={{ color: statusColor(node.status) }}>{node.status}</span>
        </div>
      </div>
      {node.description && <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>}
      {node.issues > 0 && (
        <div className="text-xs text-red-400">{node.issues} open issue(s)</div>
      )}
    </div>
  );
}

// ─── Main Nexus Page ──────────────────────────────────────────────────────────

const TABS = ['Architecture', 'Impact Radar', 'Confidence', 'Flight Recorder', 'Proof Mode'] as const;
type Tab = (typeof TABS)[number];

export default function NexusPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Architecture');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ImpactAnalysis | null>(null);
  const [showBeforeConf, setShowBeforeConf] = useState(false);
  const [nexusData, setNexusData] = useState<NexusState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/nexus')
      .then((r) => r.json())
      .then((d: NexusState) => { setNexusData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAnalysisSelect = useCallback((a: ImpactAnalysis | null) => {
    setSelectedAnalysis(a);
  }, []);

  const impactNodeIds = new Set(
    selectedAnalysis?.affectedNodes.map((n) => n.nodeId) ?? []
  );
  if (selectedAnalysis) {
    // also highlight source node if it matches a node id
    const sourceNode = nexusData?.nodes.find((n) => n.id === selectedAnalysis.sourceId);
    if (sourceNode) impactNodeIds.add(sourceNode.id);
  }

  const selectedNode = nexusData?.nodes.find((n) => n.id === selectedNodeId) ?? null;

  const postConf = nexusData?.confidence ?? DEMO_POST_RUN_CONFIDENCE;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading Nexus Command Center…</p>
        </div>
      </div>
    );
  }

  const nodes = nexusData?.nodes ?? [];
  const edges = nexusData?.edges ?? [];
  const analyses = nexusData?.impactAnalyses ?? [];

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Subtle dot-grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
      }} />

      {/* Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-r from-blue-950/40 via-[#0a0e1a] to-violet-950/30">
        <div className="max-w-screen-2xl mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-100 tracking-tight">Nexus Command Center</h1>
                  <p className="text-xs text-slate-500">E-Commerce Platform · Living Engineering Digital Twin</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Confidence score chip */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Confidence: {postConf.overallScore}/100</span>
                <span className="text-2xs text-emerald-600">{postConf.riskLevel} RISK</span>
              </div>
              <Link href="/demo" className="px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-400 text-xs hover:text-slate-200 transition-colors">
                Demo Guide →
              </Link>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-5 overflow-x-auto no-scrollbar" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === tab
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">

        {/* ── Architecture Tab ─────────────────────────────── */}
        {activeTab === 'Architecture' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">Architecture Knowledge Graph</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click a node to inspect · Select an Impact Radar entry to see propagation</p>
                </div>
                <span className="text-2xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded font-mono font-bold">ANALYZED</span>
              </div>
              <div className="p-4">
                <ArchitectureGraph
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  impactNodeIds={impactNodeIds}
                  instanceId="arch-main"
                />
              </div>

              {/* Legend */}
              <div className="px-5 pb-4 flex gap-4 flex-wrap">
                {[
                  { type: 'frontend', label: 'Frontend' },
                  { type: 'api', label: 'API' },
                  { type: 'auth', label: 'Auth' },
                  { type: 'database', label: 'Database' },
                  { type: 'cache', label: 'Cache' },
                  { type: 'test', label: 'Tests' },
                  { type: 'deps', label: 'Dependencies' },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: nodeColor(item.type as NexusNode['type']) }} />
                    <span className="text-2xs text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Node detail */}
              {selectedNode ? (
                <NodeDetail node={selectedNode} />
              ) : (
                <div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-4 text-center">
                  <p className="text-xs text-slate-500">Click a node to see details</p>
                </div>
              )}

              {/* Quick metrics */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Summary</h3>
                {[
                  { label: 'Nodes', value: `${nodes.length} components` },
                  { label: 'Connections', value: `${edges.length} edges` },
                  { label: 'Health', value: `${nodes.filter((n) => n.status === 'HEALTHY').length}/${nodes.length} healthy` },
                  { label: 'Open Issues', value: `${nodes.reduce((s, n) => s + n.issues, 0)} total` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-xs font-medium text-slate-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Impact Radar Tab ─────────────────────────────── */}
        {activeTab === 'Impact Radar' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">Impact Radar</h2>
              <p className="text-xs text-slate-500 mb-4">Each change propagates through the architecture. Select to trace impact.</p>
              <ImpactRadar
                analyses={analyses}
                onAnalysisSelect={handleAnalysisSelect}
                selectedSource={selectedAnalysis?.sourceId ?? null}
              />
            </div>

            <div className="xl:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/30">
                <h2 className="text-sm font-semibold text-slate-200">Architecture — Impact View</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAnalysis
                    ? `Showing impact of: ${selectedAnalysis.sourceLabel}`
                    : 'Select a change from the radar to highlight affected components'}
                </p>
              </div>
              <div className="p-4">
                <ArchitectureGraph
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  impactNodeIds={impactNodeIds}
                  instanceId="arch-impact"
                />
              </div>

              {selectedAnalysis && (
                <div className="px-5 pb-5">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-xs font-semibold text-amber-300 mb-1">What Changed · Why It Matters</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedAnalysis.summary}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedAnalysis.affectedNodes.map((n) => {
                        const node = nodes.find((nd) => nd.id === n.nodeId);
                        return (
                          <div key={n.nodeId} className="rounded-lg border border-slate-700/30 bg-slate-800/40 p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: riskColor(n.risk) }} />
                              <span className="text-xs font-medium text-slate-200">{node?.label ?? n.nodeId}</span>
                            </div>
                            <p className="text-2xs text-slate-400 leading-relaxed">{n.reason}</p>
                            {n.suggestedVerification.map((sv, i) => (
                              <p key={i} className="text-2xs text-blue-400 mt-0.5">→ {sv}</p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Confidence Tab ───────────────────────────────── */}
        {activeTab === 'Confidence' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Release Confidence Engine
                    {showBeforeConf && <span className="ml-2 text-xs font-normal text-red-400">(Pre-Fix)</span>}
                    {!showBeforeConf && <span className="ml-2 text-xs font-normal text-emerald-400">(Post-Fix)</span>}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Explainable score from real evidence</p>
                </div>
                <button
                  onClick={() => setShowBeforeConf((b) => !b)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    showBeforeConf
                      ? 'border-emerald-500/40 text-emerald-400 hover:text-emerald-200'
                      : 'border-slate-600/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {showBeforeConf ? '\u2713 Show After Fix' : 'Show Before Fix'}
                </button>
              </div>
              {showBeforeConf ? (
                <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                  <p className="text-xs text-red-400">Showing PRE-FIX state — 6 issues open, CVE present, 3 tests failing</p>
                </div>
              ) : (
                <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <p className="text-xs text-emerald-400">Showing POST-FIX state — all issues resolved, 0 blockers</p>
                </div>
              )}
              <ConfidencePanel conf={postConf} showBefore={showBeforeConf} />
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Before → After Comparison</h2>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Before Fix</p>
                  <ScoreMeter score={DEMO_PRE_RUN_CONFIDENCE.overallScore} size={100} />
                  <p className="text-xs text-red-400 font-bold mt-1">{DEMO_PRE_RUN_CONFIDENCE.riskLevel}</p>
                </div>
                <div className="text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">After Fix</p>
                  <ScoreMeter score={DEMO_POST_RUN_CONFIDENCE.overallScore} size={100} />
                  <p className="text-xs text-emerald-400 font-bold mt-1">{DEMO_POST_RUN_CONFIDENCE.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal Improvements</p>
                {DEMO_POST_RUN_CONFIDENCE.signals.map((after) => {
                  const before = DEMO_PRE_RUN_CONFIDENCE.signals.find((s) => s.name === after.name);
                  const delta = before ? after.score - before.score : 0;
                  return (
                    <div key={after.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{after.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 line-through">{before?.score ?? '?'}</span>
                        <span className="text-slate-300 font-medium">{after.score}</span>
                        {delta !== 0 && (
                          <span className={`text-2xs font-bold ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Flight Recorder Tab ───────────────────────────── */}
        {activeTab === 'Flight Recorder' && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Engineering Flight Recorder</h2>
                <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail — every decision, worker, confidence delta, and approval</p>
              </div>
              <Link href="/api/audit" target="_blank"
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors">
                Raw API →
              </Link>
            </div>
            <FlightRecorder entries={FLIGHT_DATA} />
          </div>
        )}

        {/* ── Proof Mode Tab ────────────────────────────────── */}
        {activeTab === 'Proof Mode' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">Proof Mode</h2>
              <p className="text-xs text-slate-500 mb-4">
                Real execution against the bundled fixture repository. Results are labeled{' '}
                <span className="font-mono text-blue-400 text-2xs">EXECUTED IN SAFE LOCAL SANDBOX</span>.
              </p>
              <ProofModePanel />
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">What Proof Mode Does</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Runs real tests against the fixture',
                    icon: '▶',
                    color: '#10b981',
                    body: 'Executes node tests/run.js in the ecommerce-platform fixture directory. No test framework dependency needed — pure Node.js.',
                  },
                  {
                    title: 'Demonstrates the bug → fix story',
                    icon: '🐛',
                    color: '#f59e0b',
                    body: 'The test suite intentionally fails on the buggy baseline (2 failures). After ReleasePilot\'s proposed fix is applied, all tests would pass.',
                  },
                  {
                    title: 'Scans real dependencies',
                    icon: '🔍',
                    color: '#3b82f6',
                    body: 'Reads the fixture\'s package.json and detects jsonwebtoken@8.5.1 (CVE-2022-23529 CVSS 7.6) and lodash@4.17.18.',
                  },
                  {
                    title: 'Hard security boundaries',
                    icon: '🔒',
                    color: '#8b5cf6',
                    body: 'Commands must be in the allowlist. Path validated before execution. No shell:true. No network. No secrets. Timeout: 30s. Output cap: 64KB.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}30` }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
