/**
 * POST /api/proof
 * Runs a guarded command in the fixture sandbox and returns real results.
 *
 * Body: { command: 'run-tests' | 'analyze-deps' }
 *
 * Security:
 * - Only allowlisted command keys accepted — no arbitrary commands
 * - Fixture path validated before execution
 * - No shell interpolation
 * - Results labeled EXECUTED IN SAFE LOCAL SANDBOX
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeInSandbox, getAllowedCommandKeys, getFixtureStatus } from '@/lib/sandbox/executor';
import { saveProofRun, appendAuditEvent } from '@/lib/db/persistence';
import type { ProofRunRecord } from '@/lib/db/types';

interface ProofBody {
  command: string;
}

function isProofBody(v: unknown): v is ProofBody {
  return typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).command === 'string';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;

    if (!isProofBody(body)) {
      return NextResponse.json(
        { error: 'Request body must be { command: string }' },
        { status: 400 }
      );
    }

    const startedAt = new Date().toISOString();
    const runId = `proof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Record start in audit trail
    appendAuditEvent({
      kind: 'PROOF_RUN_STARTED',
      actor: 'demo-user',
      runId,
      repositoryId: 'fixture_ecommerce',
      timestamp: startedAt,
      status: 'RUNNING',
      message: `Proof run started: ${body.command}`,
      metadata: { command: body.command },
      actionLabel: 'EXECUTED',
    });

    const result = await executeInSandbox(body.command);

    if (!result.ok) {
      appendAuditEvent({
        kind: 'PROOF_RUN_FAILED',
        actor: 'system',
        runId,
        repositoryId: 'fixture_ecommerce',
        timestamp: new Date().toISOString(),
        status: 'FAILED',
        message: `Proof run failed: ${result.error.message}`,
        metadata: { error: result.error },
        actionLabel: 'EXECUTED',
      });

      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.code === 'INVALID_COMMAND' ? 400 : 503 }
      );
    }

    const completedAt = new Date().toISOString();
    const proofRecord: ProofRunRecord = {
      id: runId,
      repositoryId: 'fixture_ecommerce',
      triggeredBy: 'demo-user',
      startedAt,
      completedAt,
      status: result.result.exitCode === 0 ? 'COMPLETED' : 'COMPLETED',
      commands: [result.result],
      summary: result.result.exitCode === 0
        ? `Command '${body.command}' passed (exit 0) in ${result.result.durationMs}ms`
        : `Command '${body.command}' exited with code ${result.result.exitCode} in ${result.result.durationMs}ms`,
      isDemoSeed: false,
      confidenceScore: null,
      confidenceExplanation: null,
    };

    saveProofRun(proofRecord);

    appendAuditEvent({
      kind: 'PROOF_RUN_COMPLETED',
      actor: 'system',
      runId,
      repositoryId: 'fixture_ecommerce',
      timestamp: completedAt,
      status: result.result.exitCode === 0 ? 'PASS' : 'FAIL',
      message: proofRecord.summary,
      metadata: {
        exitCode: result.result.exitCode,
        durationMs: result.result.durationMs,
        command: body.command,
      },
      actionLabel: 'EXECUTED',
    });

    return NextResponse.json({
      runId,
      command: body.command,
      result: result.result,
      summary: proofRecord.summary,
      label: 'EXECUTED IN SAFE LOCAL SANDBOX',
      sandboxNote: 'This command ran in a read-only fixture directory with no network access, no secrets, and a strict command allowlist.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = getFixtureStatus();
  return NextResponse.json({
    available: status.available,
    fixturePath: status.path,
    allowedCommands: getAllowedCommandKeys(),
    note: 'POST with { command: string } to run a sandboxed command against the fixture repository.',
    error: status.error,
  });
}
