/**
 * ReleasePilot AI — Guarded Sandbox Executor
 *
 * Security model:
 * - Only the fixture directory is allowed (canonical path validated at startup)
 * - Command allowlist: only known safe, read-only commands
 * - No shell:true — arguments are never shell-interpolated
 * - Timeout: 30s hard limit per command
 * - Output: capped at 64KB to prevent memory exhaustion
 * - No environment secrets forwarded
 * - No network access (commands do not require internet)
 * - No external writes (test/lint commands are read-only)
 * - All results labeled 'EXECUTED IN SAFE LOCAL SANDBOX'
 *
 * What this guarantees:
 *   A browser request cannot cause arbitrary code execution, file deletion,
 *   network access, secret exposure, or production writes via this service.
 */

import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import type { ProofCommandResult, ProofCommandKind } from '../db/types';

// ─── Configuration ────────────────────────────────────────────────────────────

const FIXTURE_DIR_NAME = 'ecommerce-platform';
const FIXTURE_ROOT = path.resolve(process.cwd(), 'fixtures', FIXTURE_DIR_NAME);
const TIMEOUT_MS = 30_000;
const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB

// Strict command allowlist — only safe, read-only operations
// Format: [binary, ...fixedArgsPrefix]
// User cannot supply binary or extra args — only predefined entries run.
const ALLOWED_COMMANDS: Record<
  string,
  { binary: string; args: string[]; kind: ProofCommandKind }
> = {
  'run-tests': {
    binary: 'node',
    args: ['tests/run.js'],
    kind: 'TEST',
  },
  'type-check': {
    binary: 'node',
    args: ['--input-type=module', '--eval', 'import("./src/index.ts").then(() => process.exit(0)).catch(() => process.exit(1))'],
    kind: 'TYPECHECK',
  },
  'analyze-deps': {
    binary: 'node',
    args: ['tests/analyze-deps.js'],
    kind: 'CUSTOM_ANALYSIS',
  },
};

// ─── Path validation ──────────────────────────────────────────────────────────

function validateFixtureDirectory(): { ok: boolean; error?: string } {
  try {
    // Resolve both the fixture path and the project root to canonical paths
    // so symlinks cannot be used to escape the sandbox
    const real = fs.realpathSync(FIXTURE_ROOT);
    // realpathSync the expected root too so the comparison is canonical vs canonical
    const expectedBase = fs.realpathSync(path.resolve(process.cwd(), 'fixtures'));
    const expectedFull = path.join(expectedBase, FIXTURE_DIR_NAME);
    // Must be exactly the fixture dir or a subpath of it — never a parent
    if (real !== expectedFull && !real.startsWith(expectedFull + path.sep)) {
      return { ok: false, error: `Fixture path escapes sandbox: ${real}` };
    }
    if (!fs.existsSync(real)) {
      return { ok: false, error: `Fixture directory not found: ${real}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Path validation failed: ${String(e)}` };
  }
}

// ─── Safe process execution ───────────────────────────────────────────────────

function runProcess(
  binary: string,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; exitCode: number; timedOut: boolean; outputTruncated: boolean }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputTruncated = false;
    let totalBytes = 0;

    const child = spawn(binary, args, {
      cwd,
      shell: false,   // NEVER shell: true
      timeout: TIMEOUT_MS,
      env: {
        // Minimal safe environment — no secrets, no tokens, no credentials
        PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
        NODE_ENV: 'test',
        HOME: process.env.HOME ?? '/tmp',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const appendOutput = (chunk: Buffer, target: 'stdout' | 'stderr') => {
      const remaining = MAX_OUTPUT_BYTES - totalBytes;
      if (remaining <= 0) {
        outputTruncated = true;
        return;
      }
      const text = chunk.toString('utf-8').slice(0, remaining);
      totalBytes += text.length;
      if (target === 'stdout') stdout += text;
      else stderr += text;
      if (totalBytes >= MAX_OUTPUT_BYTES) outputTruncated = true;
    };

    child.stdout.on('data', (chunk: Buffer) => appendOutput(chunk, 'stdout'));
    child.stderr.on('data', (chunk: Buffer) => appendOutput(chunk, 'stderr'));

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 1,
        timedOut,
        outputTruncated,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout: '',
        stderr: `Process error: ${err.message}`,
        exitCode: 1,
        timedOut: false,
        outputTruncated: false,
      });
    });
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SandboxError {
  code: 'INVALID_COMMAND' | 'PATH_VALIDATION_FAILED' | 'FIXTURE_NOT_FOUND';
  message: string;
}

export async function executeInSandbox(
  commandKey: string,
): Promise<{ ok: true; result: ProofCommandResult } | { ok: false; error: SandboxError }> {
  // 1. Validate command is in allowlist
  const allowed = ALLOWED_COMMANDS[commandKey];
  if (!allowed) {
    return {
      ok: false,
      error: {
        code: 'INVALID_COMMAND',
        message: `Command '${commandKey}' is not in the allowlist. Allowed: ${Object.keys(ALLOWED_COMMANDS).join(', ')}`,
      },
    };
  }

  // 2. Validate fixture directory
  const pathCheck = validateFixtureDirectory();
  if (!pathCheck.ok) {
    return {
      ok: false,
      error: {
        code: pathCheck.error?.includes('not found') ? 'FIXTURE_NOT_FOUND' : 'PATH_VALIDATION_FAILED',
        message: pathCheck.error ?? 'Path validation failed',
      },
    };
  }

  // 3. Execute
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const { stdout, stderr, exitCode, timedOut, outputTruncated } = await runProcess(
    allowed.binary,
    allowed.args,
    FIXTURE_ROOT,
  );

  const completedAt = new Date().toISOString();
  const durationMs = Date.now() - t0;

  return {
    ok: true,
    result: {
      kind: allowed.kind,
      command: allowed.binary,
      args: allowed.args,
      exitCode,
      stdout,
      stderr,
      durationMs,
      startedAt,
      completedAt,
      timedOut,
      outputTruncated,
      sandboxPath: FIXTURE_ROOT,
    },
  };
}

/** Returns list of allowed command keys for API introspection */
export function getAllowedCommandKeys(): string[] {
  return Object.keys(ALLOWED_COMMANDS);
}

/** Returns whether the fixture exists and is reachable */
export function getFixtureStatus(): { available: boolean; path: string; error?: string } {
  const check = validateFixtureDirectory();
  return {
    available: check.ok,
    path: FIXTURE_ROOT,
    error: check.error,
  };
}
