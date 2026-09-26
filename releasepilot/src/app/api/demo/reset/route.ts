/**
 * POST /api/demo/reset
 * Safely resets the in-memory demo state without touching any external systems.
 *
 * What gets reset:
 * - Approval store: run_live → PENDING (so the demo approval gate works again)
 * - Proof runs created during this demo session (isDemoSeed=false are removed)
 * - Demo reset counter incremented in persistent store
 *
 * What is NOT touched:
 * - User-connected repositories
 * - Any external git state
 * - Seeded demo records (isDemoSeed=true)
 * - Production or staging systems
 *
 * This endpoint is safe to call repeatedly. It only affects in-memory and local demo state.
 */

import { NextResponse } from 'next/server';
import { APPROVAL_STORE } from '@/lib/approvalStore';
import { recordDemoReset, getDemoStats, appendAuditEvent } from '@/lib/db/persistence';

export async function POST() {
  // Reset the live run approval state so the demo approval gate works again
  APPROVAL_STORE.set('run_live', { status: 'PENDING' });

  // Clear any other live run states that may have been set during a demo session
  for (const key of Array.from(APPROVAL_STORE.keys())) {
    if (key.startsWith('run_live_')) {
      APPROVAL_STORE.delete(key);
    }
  }

  // Persist demo reset + remove non-seeded proof runs
  recordDemoReset();

  // Record in audit trail
  appendAuditEvent({
    kind: 'DEMO_RESET',
    actor: 'demo-user',
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
    message: 'Demo state reset to baseline — approval gates restored, session proof runs cleared.',
    metadata: { ...getDemoStats() },
    actionLabel: 'EXECUTED',
  });

  const stats = getDemoStats();

  return NextResponse.json({
    ok: true,
    message: 'Demo state reset successfully. Approval gates restored to PENDING.',
    resetAt: new Date().toISOString(),
    resetCount: stats.resetCount,
    note: 'No external systems were affected. Only in-memory demo state and session proof runs were cleared. Seeded demo records preserved.',
    storeState: Object.fromEntries(APPROVAL_STORE),
  });
}

export async function GET() {
  const stats = getDemoStats();
  return NextResponse.json({
    currentState: Object.fromEntries(APPROVAL_STORE),
    demoRunIds: ['run_01', 'run_live'],
    demoResetCount: stats.resetCount,
    lastReset: stats.lastReset,
    message: 'Current demo state. POST to this endpoint to reset.',
  });
}
