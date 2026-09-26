/**
 * GET /api/audit
 * Returns the immutable engineering flight recorder audit trail.
 *
 * Query params:
 *   limit - number of events to return (default 50, max 200)
 *   kind  - filter by event kind
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuditEvents } from '@/lib/db/persistence';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const rawLimit = url.searchParams.get('limit');
    const kindFilter = url.searchParams.get('kind');

    const limit = Math.min(
      200,
      Math.max(1, rawLimit ? (parseInt(rawLimit, 10) || 50) : 50)
    );

    let events = getAuditEvents(limit);

    if (kindFilter) {
      events = events.filter((e) => e.kind === kindFilter);
    }

    return NextResponse.json({
      events,
      total: events.length,
      note: 'Immutable engineering flight recorder — every workflow transition, approval, and proof result.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
