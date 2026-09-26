/**
 * POST /api/demo/reset
 * Safely resets the in-memory demo state without touching any external systems.
 *
 * What gets reset:
 * - Approval store: run_live → PENDING (so the demo approval gate works again)
 *
 * What is NOT touched:
 * - User-connected repositories
 * - Any external git state
 * - Any database records
 * - Production or staging systems
 *
 * This endpoint is safe to call repeatedly. It only affects in-memory demo state.
 */

import { NextResponse } from 'next/server';
import { APPROVAL_STORE } from '@/lib/approvalStore';

export async function POST() {
  // Reset the live run approval state so the demo approval gate works again
  APPROVAL_STORE.set('run_live', { status: 'PENDING' });

  // Clear any other live run states that may have been set during a demo session
  for (const key of Array.from(APPROVAL_STORE.keys())) {
    if (key.startsWith('run_live_')) {
      APPROVAL_STORE.delete(key);
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Demo state reset successfully. Approval gates restored to PENDING.',
    resetAt: new Date().toISOString(),
    note: 'No external systems were affected. Only in-memory demo state was cleared.',
    storeState: Object.fromEntries(APPROVAL_STORE),
  });
}

export async function GET() {
  return NextResponse.json({
    currentState: Object.fromEntries(APPROVAL_STORE),
    demoRunIds: ['run_01', 'run_live'],
    message: 'Current demo state. POST to this endpoint to reset.',
  });
}
