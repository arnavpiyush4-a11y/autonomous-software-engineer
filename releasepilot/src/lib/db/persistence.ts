/**
 * ReleasePilot AI — Local File Persistence Adapter
 *
 * Stores all data as a single JSON file at `.releasepilot-db.json`
 * in the project root. This is an intentional local-only fallback
 * for the hackathon environment where a full database is not available.
 *
 * DOCUMENTED LIMITATION: Data is co-located with the project, not
 * suitable for multi-process or multi-server deployments. A Prisma/
 * SQLite or PostgreSQL adapter can replace this file with zero changes
 * to service callers (same interface).
 *
 * Security: File writes are sequential (no concurrent corruption risk
 * in single-process Next.js). No external network access.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  AuditEvent,
  ProofRunRecord,
  NexusState,
} from './types';

const DB_PATH = path.join(process.cwd(), '.releasepilot-db.json');

export interface DbSchema {
  auditEvents: AuditEvent[];
  proofRuns: ProofRunRecord[];
  nexusState: NexusState | null;
  demoResetCount: number;
  lastDemoReset: string | null;
  schemaVersion: number;
}

const EMPTY_DB: DbSchema = {
  auditEvents: [],
  proofRuns: [],
  nexusState: null,
  demoResetCount: 0,
  lastDemoReset: null,
  schemaVersion: 1,
};

let _cache: DbSchema | null = null;

function readDb(): DbSchema {
  if (_cache) return _cache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DbSchema>;
      _cache = { ...EMPTY_DB, ...parsed };
    } else {
      _cache = { ...EMPTY_DB };
    }
  } catch {
    _cache = { ...EMPTY_DB };
  }
  return _cache;
}

function writeDb(db: DbSchema): void {
  _cache = db;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Write failure is non-fatal — in-memory cache still holds state
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function appendAuditEvent(event: Omit<AuditEvent, 'id'>): AuditEvent {
  const db = readDb();
  const full: AuditEvent = {
    ...event,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  db.auditEvents = [...db.auditEvents.slice(-499), full]; // keep last 500
  writeDb(db);
  return full;
}

export function getAuditEvents(limit = 50): AuditEvent[] {
  const db = readDb();
  return db.auditEvents.slice(-limit).reverse();
}

export function saveProofRun(run: ProofRunRecord): ProofRunRecord {
  const db = readDb();
  const existing = db.proofRuns.findIndex((r) => r.id === run.id);
  if (existing >= 0) {
    db.proofRuns[existing] = run;
  } else {
    db.proofRuns = [...db.proofRuns.slice(-19), run]; // keep last 20
  }
  writeDb(db);
  return run;
}

export function getProofRuns(): ProofRunRecord[] {
  const db = readDb();
  return db.proofRuns.slice().reverse();
}

export function getProofRunById(id: string): ProofRunRecord | null {
  const db = readDb();
  return db.proofRuns.find((r) => r.id === id) ?? null;
}

export function saveNexusState(state: NexusState): void {
  const db = readDb();
  db.nexusState = state;
  writeDb(db);
}

export function getNexusState(): NexusState | null {
  return readDb().nexusState;
}

export function recordDemoReset(): void {
  const db = readDb();
  db.demoResetCount += 1;
  db.lastDemoReset = new Date().toISOString();
  // Remove non-seeded proof runs (those with isDemoSeed: false)
  db.proofRuns = db.proofRuns.filter((r) => r.isDemoSeed === true);
  writeDb(db);
}

export function getDemoStats(): { resetCount: number; lastReset: string | null } {
  const db = readDb();
  return { resetCount: db.demoResetCount, lastReset: db.lastDemoReset };
}

/** For testing only */
export function _resetCacheForTests(): void {
  _cache = null;
}
