/**
 * GET  /api/runs/[id]/deploy — returns deployment report for a run
 * POST /api/runs/[id]/deploy — trigger a deployment step action
 *
 * For the MVP demo, always returns Phase 4 demo data.
 * Action labels are explicit: SIMULATED steps are never presented as executed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PHASE4_DEPLOYMENT_REPORT } from '@/lib/phase4-data';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Return demo data for run_01 and run_live; 404 for anything else
  if (id !== 'run_01' && id !== 'run_live') {
    return NextResponse.json(
      { error: 'No deployment report found for this run. Only the demo run (run_01) has deployment data.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    runId: id,
    report: PHASE4_DEPLOYMENT_REPORT,
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const body = await req.json() as unknown;
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const bodyObj = body as Record<string, unknown>;
  const action = bodyObj.action as string | undefined;

  const allowedActions = ['APPROVE_PRODUCTION', 'ROLLBACK', 'SKIP_STEP'] as const;

  if (!action || !allowedActions.includes(action as (typeof allowedActions)[number])) {
    return NextResponse.json(
      { error: `action must be one of: ${allowedActions.join(', ')}` },
      { status: 400 }
    );
  }

  // Production deployment is blocked in demo mode
  if (action === 'APPROVE_PRODUCTION') {
    return NextResponse.json(
      {
        error: 'Production deployment is disabled in demo mode. This is a simulated environment.',
        hint: 'In a real ReleasePilot deployment, this would trigger the production deploy pipeline after verifying credentials and run context.',
        actionLabel: 'BLOCKED',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    runId: id,
    action,
    status: 'ACKNOWLEDGED',
    message: `Action ${action} acknowledged for run ${id} (demo mode — no real deployment)`,
    actionLabel: 'SIMULATED',
    timestamp: new Date().toISOString(),
  });
}
