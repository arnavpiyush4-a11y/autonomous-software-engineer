/**
 * POST /api/analysis/scan
 * Trigger a repository analysis scan.
 * Body: { repositoryId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/analysis/repositoryAnalyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;

    // Validate input
    if (
      typeof body !== 'object' ||
      body === null ||
      !('repositoryId' in body) ||
      typeof (body as Record<string, unknown>).repositoryId !== 'string'
    ) {
      return NextResponse.json(
        { error: 'repositoryId (string) is required' },
        { status: 400 }
      );
    }

    const repositoryId = (body as { repositoryId: string }).repositoryId;

    // In Phase 3 MVP, always use the seeded analyzer
    // A real implementation would fetch from GitHub API
    const scan = analyzeRepository(repositoryId);

    return NextResponse.json({ scan }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
