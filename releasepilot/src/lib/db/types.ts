/**
 * ReleasePilot AI — Phase 6 Extended Types
 * Augments the base types with persistence, proof mode, and Nexus types.
 */

// ─── Audit Events ─────────────────────────────────────────────────────────────

export type AuditEventKind =
  | 'WORKFLOW_TRANSITION'
  | 'APPROVAL_DECISION'
  | 'TEST_RESULT'
  | 'RELEASE_DECISION'
  | 'PROOF_RUN_STARTED'
  | 'PROOF_RUN_COMPLETED'
  | 'PROOF_RUN_FAILED'
  | 'DEMO_RESET'
  | 'NEXUS_VIEWED'
  | 'CONFIDENCE_CALCULATED';

export interface AuditEvent {
  id: string;
  kind: AuditEventKind;
  actor: string;           // 'system' | 'demo-user' | 'agent-worker-name'
  runId?: string;
  repositoryId?: string;
  timestamp: string;       // ISO 8601
  status: string;          // e.g. 'APPROVED', 'COMPLETED', 'PASS'
  message: string;
  metadata: Record<string, unknown>;
  actionLabel: 'ANALYZED' | 'PROPOSED' | 'SIMULATED' | 'EXECUTED' | 'BLOCKED' | 'REQUIRES_APPROVAL';
}

// ─── Proof Mode ───────────────────────────────────────────────────────────────

export type ProofCommandKind = 'TEST' | 'LINT' | 'BUILD' | 'TYPECHECK' | 'CUSTOM_ANALYSIS';

export interface ProofCommandResult {
  kind: ProofCommandKind;
  command: string;         // exact command string run (never shell-interpolated)
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  startedAt: string;
  completedAt: string;
  timedOut: boolean;
  outputTruncated: boolean;
  sandboxPath: string;     // canonical path used (never user-supplied path)
}

export interface ProofRunRecord {
  id: string;
  repositoryId: string;    // always 'fixture_ecommerce'
  triggeredBy: string;
  startedAt: string;
  completedAt: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  commands: ProofCommandResult[];
  summary: string;
  isDemoSeed: boolean;     // true = seeded demo record, protected from reset
  confidenceScore: number | null;
  confidenceExplanation: ConfidenceExplanation | null;
}

// ─── Release Confidence Engine ────────────────────────────────────────────────

export interface ConfidenceSignal {
  name: string;
  category: 'BUILD' | 'TEST' | 'SECURITY' | 'REVIEW' | 'DOCS' | 'CONFIG' | 'APPROVAL';
  score: number;           // 0-100 for this signal
  weight: number;          // relative weight in final calculation
  evidence: string;
  source: 'EXECUTED' | 'ANALYZED' | 'SIMULATED';
  detail: string;
}

export interface ConfidenceExplanation {
  overallScore: number;    // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: ConfidenceSignal[];
  blockers: string[];
  calculatedAt: string;
}

// ─── Nexus State ──────────────────────────────────────────────────────────────

export interface NexusNode {
  id: string;
  label: string;
  type: 'frontend' | 'api' | 'database' | 'cache' | 'auth' | 'test' | 'ci' | 'deps' | 'deploy' | 'docs';
  technology: string;
  status: 'HEALTHY' | 'DEGRADED' | 'ISSUE' | 'UNKNOWN';
  issues: number;
  x: number;
  y: number;
  description?: string;
}

export interface NexusEdge {
  from: string;
  to: string;
  label: string;
  protocol?: string;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ImpactTarget {
  nodeId: string;
  reason: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedVerification: string[];
}

export interface ImpactAnalysis {
  sourceId: string;           // file path or node id
  sourceLabel: string;
  affectedNodes: ImpactTarget[];
  affectedTests: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
}

export interface NexusState {
  repositoryId: string;
  lastUpdated: string;
  nodes: NexusNode[];
  edges: NexusEdge[];
  impactAnalyses: ImpactAnalysis[];
  confidence: ConfidenceExplanation | null;
}

// ─── Flight Recorder Entry ────────────────────────────────────────────────────

export interface FlightEntry {
  id: string;
  timestamp: string;
  kind: AuditEventKind;
  worker: string;
  message: string;
  actionLabel: 'ANALYZED' | 'PROPOSED' | 'SIMULATED' | 'EXECUTED' | 'BLOCKED' | 'REQUIRES_APPROVAL';
  confidenceDelta?: number;   // change in confidence score at this step
  runId?: string;
  evidence?: string;          // short evidence summary
}
