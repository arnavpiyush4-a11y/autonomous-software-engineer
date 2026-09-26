/**
 * In-memory approval store — shared between route handlers.
 * Phase 3 MVP: no database persistence yet.
 */

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface ApprovalRecord {
  status: ApprovalStatus;
  comment?: string;
  resolvedAt?: string;
}

// Module-level singleton (survives across route handler invocations in the same process)
export const APPROVAL_STORE = new Map<string, ApprovalRecord>();

// Pre-seed the demo live run
APPROVAL_STORE.set('run_live', { status: 'PENDING' });
