'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Command data ──────────────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: string;     // href for navigation
  category: 'Navigation' | 'Demo' | 'Analysis' | 'Reports';
  keywords: string[];
}

const COMMANDS: Command[] = [
  {
    id: 'cmd_dashboard',
    label: 'Dashboard',
    description: 'Engineering command overview',
    icon: '⊞',
    action: '/',
    category: 'Navigation',
    keywords: ['home', 'overview', 'metrics'],
  },
  {
    id: 'cmd_nexus',
    label: 'Nexus Command Center',
    description: 'Architecture graph, Impact Radar, Confidence Engine',
    icon: '⬡',
    action: '/nexus',
    category: 'Navigation',
    keywords: ['nexus', 'architecture', 'impact', 'confidence', 'graph'],
  },
  {
    id: 'cmd_demo',
    label: 'Judge Demo Guide',
    description: '7-step guided demo walkthrough',
    icon: '▶',
    action: '/demo',
    category: 'Demo',
    keywords: ['demo', 'judge', 'guide', 'walkthrough'],
  },
  {
    id: 'cmd_compare',
    label: 'Before/After Comparison',
    description: 'Health score, tests, coverage metrics',
    icon: '↕',
    action: '/demo/compare',
    category: 'Demo',
    keywords: ['compare', 'before', 'after', 'metrics', 'improvement'],
  },
  {
    id: 'cmd_repos',
    label: 'Repositories',
    description: 'All connected repositories',
    icon: '◫',
    action: '/repositories',
    category: 'Navigation',
    keywords: ['repos', 'repositories', 'list'],
  },
  {
    id: 'cmd_ecommerce',
    label: 'E-Commerce Platform',
    description: 'Demo repository — 6 issues detected and fixed',
    icon: '🛒',
    action: '/repositories/repo_ecommerce',
    category: 'Analysis',
    keywords: ['ecommerce', 'platform', 'demo', 'repository'],
  },
  {
    id: 'cmd_runs',
    label: 'Agent Runs',
    description: 'All runs — history and active',
    icon: '⏱',
    action: '/runs',
    category: 'Navigation',
    keywords: ['runs', 'agent', 'history'],
  },
  {
    id: 'cmd_run01',
    label: 'Run #01 — E-Commerce Fix',
    description: 'Completed run — full report, diffs, approval record',
    icon: '✓',
    action: '/runs/run_01',
    category: 'Reports',
    keywords: ['run', 'report', 'completed', 'fix', 'ecommerce'],
  },
  {
    id: 'cmd_deploy',
    label: 'Deployment Preparation',
    description: '8 gate checks, smoke tests, changelog',
    icon: '🚀',
    action: '/runs/run_01/deploy',
    category: 'Reports',
    keywords: ['deploy', 'deployment', 'release', 'gate', 'smoke'],
  },
  {
    id: 'cmd_new_run',
    label: 'Start New Agent Run',
    description: 'Launch a new analysis on E-Commerce Platform',
    icon: '⚡',
    action: '/runs/new?repo=repo_ecommerce',
    category: 'Analysis',
    keywords: ['new', 'run', 'start', 'agent', 'analysis'],
  },
  {
    id: 'cmd_onboard',
    label: 'Connect Repository',
    description: 'Onboard a new repository',
    icon: '＋',
    action: '/onboard',
    category: 'Analysis',
    keywords: ['connect', 'onboard', 'new', 'repository'],
  },
  {
    id: 'cmd_settings',
    label: 'Settings',
    description: 'Configuration and preferences',
    icon: '⚙',
    action: '/settings',
    category: 'Navigation',
    keywords: ['settings', 'config', 'preferences'],
  },
];

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_ORDER: Command['category'][] = ['Navigation', 'Demo', 'Analysis', 'Reports'];

function groupByCategory(cmds: Command[]): Map<string, Command[]> {
  const map = new Map<string, Command[]>();
  for (const c of CATEGORY_ORDER) {
    const items = cmds.filter((cmd) => cmd.category === c);
    if (items.length > 0) map.set(c, items);
  }
  return map;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered + grouped results
  const filtered = query.trim()
    ? COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
        );
      })
    : COMMANDS;

  const grouped = groupByCategory(filtered);
  const flat = Array.from(grouped.values()).flat();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setSelectedIdx(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = useCallback((cmd: Command) => {
    setOpen(false);
    setQuery('');
    router.push(cmd.action);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = flat[selectedIdx];
      if (cmd) execute(cmd);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/40 text-slate-500 text-xs hover:text-slate-300 hover:border-slate-600/60 transition-all duration-150"
        title="Open command palette (⌘K)"
        aria-label="Open command palette"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search…</span>
        <kbd className="text-2xs bg-slate-700/60 px-1 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(59,130,246,0.15)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, actions, repositories…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 text-sm placeholder-slate-600 focus:outline-none"
            aria-label="Command search"
          />
          <kbd className="text-2xs bg-slate-700/60 text-slate-500 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
          )}
          {Array.from(grouped.entries()).map(([category, cmds]) => (
            <div key={category}>
              <p className="px-4 pt-2 pb-1 text-2xs font-semibold text-slate-600 uppercase tracking-wider">{category}</p>
              {cmds.map((cmd) => {
                const flatIdx = flat.indexOf(cmd);
                const isSelected = flatIdx === selectedIdx;
                return (
                  <button
                    key={cmd.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelectedIdx(flatIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-blue-500/15' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>{cmd.label}</p>
                      <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                    </div>
                    {isSelected && (
                      <kbd className="text-2xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono flex-shrink-0">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-700/40 flex items-center gap-4 text-2xs text-slate-600">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
          <span className="ml-auto">⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
