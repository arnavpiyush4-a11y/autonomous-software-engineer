/**
 * Demo Mode Banner Component
 *
 * Displayed on all pages to clearly explain that:
 * - Repository writes are simulated (no external git operations)
 * - Production deployments require explicit approval and are blocked in demo
 * - All SIMULATED actions are labeled and never presented as EXECUTED
 */

'use client';

import { useState } from 'react';

interface DemoModeBannerProps {
  compact?: boolean;
}

export default function DemoModeBanner({ compact = false }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 text-xs text-amber-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        Demo Mode — External writes safely simulated
      </div>
    );
  }

  return (
    <div className="border-b border-amber-500/15 bg-amber-500/5">
      <div className="max-w-screen-2xl mx-auto px-6 py-2.5 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs text-amber-300 font-semibold">Demo Mode · </span>
          <span className="text-xs text-amber-400/80">
            Repository writes, test runs, and deployments are safely simulated — no external git operations or production changes occur.
            Labels: <span className="font-mono font-semibold">ANALYZED</span> = read-only ·
            <span className="font-mono font-semibold"> PROPOSED</span> = not yet applied ·
            <span className="font-mono font-semibold"> SIMULATED</span> = validated in demo, not executed ·
            <span className="font-mono font-semibold"> REQUIRES_APPROVAL</span> = blocked until you approve.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/50 hover:text-amber-400 transition-colors flex-shrink-0 p-1 rounded"
          aria-label="Dismiss demo mode notice"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
