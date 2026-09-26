/**
 * POST /api/runs/[id]/approve
 * Approve, reject, or request-changes on an approval request.
 *
 * Body: {
 *   action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'
 *   comment?: string
 * }
 *
 * Security: No auto-approve. Requires explicit user action.
 */

import { NextRequest, NextResponse } from 'next/server';
import { APPROVAL_STORE } from '@/lib/approvalStore';

interface ApproveBody {
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  comment?: string;
}

function isValidAction(v: unknown): v is ApproveBody['action'] {
  return v === 'APPROVED' || v === 'REJECTED' || v === 'CHANGES_REQUESTED';
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Run ID is required' }, { status: 400 });
    }

    const body = await req.json() as unknown;

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const bodyObj = body as Record<string, unknown>;

    if (!isValidAction(bodyObj.action)) {
      return NextResponse.json(
        { error: 'action must be one of: APPROVED, REJECTED, CHANGES_REQUESTED' },
        { status: 400 }
      );
    }

    // For live runs, check the approval store
    const existing = APPROVAL_STORE.get(id);

    if (!existing) {
      // If not in store, seed it as PENDING (allows new live runs to be approved)
      APPROVAL_STORE.set(id, { status: 'PENDING' });
    }

    const current = APPROVAL_STORE.get(id)!;

    if (current.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Approval has already been resolved: ${current.status}`,
          current,
        },
        { status: 409 }
      );
    }

    // Record the decision — no auto-approve, explicit action required
    const resolved = {
      status: bodyObj.action,
      comment: typeof bodyObj.comment === 'string' ? bodyObj.comment : undefined,
      resolvedAt: new Date().toISOString(),
    };

    APPROVAL_STORE.set(id, resolved);

    return NextResponse.json({
      runId: id,
      action: bodyObj.action,
      comment: resolved.comment,
      resolvedAt: resolved.resolvedAt,
      message:
        bodyObj.action === 'APPROVED'
          ? 'Approved — fixes will now be applied'
          : bodyObj.action === 'REJECTED'
          ? 'Rejected — run will be cancelled'
          : 'Changes requested — run is now blocked',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const status = APPROVAL_STORE.get(id);
  if (!status) {
    return NextResponse.json({ runId: id, status: null });
  }
  return NextResponse.json({ runId: id, ...status });
}
