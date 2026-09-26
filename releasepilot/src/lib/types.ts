// ─── Enums ─────────────────────────────────────────────────────────────────

export type RunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type StageStatus = 'PENDING' | 'ACTIVE' | 'DONE' | 'FAILED' | 'SKIPPED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED' | 'SKIPPED';
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingCategory = 'BUG' | 'TEST' | 'COVERAGE' | 'DEPENDENCY' | 'DOCUMENTATION' | 'CONFIGURATION' | 'SECURITY' | 'PERFORMANCE';
export type FindingStatus = 'OPEN' | 'FIXED' | 'WONT_FIX' | 'FALSE_POSITIVE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
export type TechLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Go' | 'Rust' | 'Java' | 'Ruby' | 'C#';

// Phase 3 workflow state machine states
export type WorkflowState =
  | 'IDLE'
  | 'ONBOARDING'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'TESTING'
  | 'REVIEWING'
  | 'APPROVAL_REQUIRED'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

// Action labels for transparency
export type ActionLabel = 'ANALYZED' | 'PROPOSED' | 'SIMULATED' | 'EXECUTED' | 'BLOCKED' | 'REQUIRES_APPROVAL';

// ─── Core Entities ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'developer' | 'viewer';
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  defaultBranch: string;
  languages: string[];
  techStack: string[];
  isActive: boolean;
  healthScore?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Computed / joined
  latestRun?: AgentRun;
  openFindings?: number;
  lastScan?: RepositoryScan;
}

// ─── Phase 3: Repository Scan ───────────────────────────────────────────────

export interface RepositoryScan {
  id: string;
  repositoryId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scannedAt: string;
  durationMs?: number;
  // File stats
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>; // lang → percentage
  frameworks: string[];
  packageManager?: string;
  // Structure
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  hasCiCd: boolean;
  ciCdProvider?: string;
  hasReadme: boolean;
  hasAgentsMd: boolean;
  hasContributing: boolean;
  hasEnvExample: boolean;
  hasTests: boolean;
  testFramework?: string;
  // Commands detected
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;
  typeCheckCommand?: string;
  devCommand?: string;
  // Entry points
  entryPoints: string[];
  configFiles: string[];
  // Architecture components
  components: ArchitectureComponent[];
  // Health findings from scan
  healthFindings: HealthFinding[];
  // Summary
  healthScore: number;
  summary: string;
}

export interface ArchitectureComponent {
  id: string;
  scanId: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'cache' | 'queue' | 'gateway' | 'external' | 'service' | 'worker';
  technology: string;
  filePaths: string[];
  connects: string[]; // component ids
  x?: number;
  y?: number;
}

export interface HealthFinding {
  id: string;
  scanId: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  suggestion?: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  actionLabel: ActionLabel;
  // If linked to a run fix
  fixApplied?: boolean;
  fixedInRunId?: string;
}

// ─── Agent Run ──────────────────────────────────────────────────────────────

export interface AgentRun {
  id: string;
  status: RunStatus;
  workflowState: WorkflowState;
  triggeredBy: 'manual' | 'scheduled' | 'webhook';
  branch: string;
  commitSha?: string;
  task: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  summary?: string;
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
  // Plan
  scopeSummary?: ScopeSummary;
  taskPlan?: TaskPlan;
  // Joined
  repository?: Repository;
  stages?: WorkflowStage[];
  logs?: AgentLog[];
  codeChanges?: CodeChange[];
  testResults?: TestResult[];
  reviewFindings?: ReviewFinding[];
  releaseRiskReport?: ReleaseRiskReport;
  approvalRequest?: ApprovalRequest;
  releaseReport?: ReleaseReport;
}

// ─── Scope & Plan ───────────────────────────────────────────────────────────

export interface ScopeSummary {
  task: string;
  affectedFiles: string[];
  affectedModules: string[];
  estimatedRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedBehavior: string;
  risks: string[];
  requiredTests: string[];
  proposedApproach: string;
}

export interface TaskPlan {
  totalStages: number;
  estimatedDurationMin: number;
  parallelWorkers: string[];
  stages: PlannedStage[];
}

export interface PlannedStage {
  index: number;
  name: string;
  worker: string;
  estimatedDurationSec: number;
  dependencies: number[];
  expectedOutputs: string[];
  requiresApproval: boolean;
}

// ─── Workflow Stage ─────────────────────────────────────────────────────────

export interface WorkflowStage {
  id: string;
  stageIndex: number;
  name: string;
  slug: string;
  status: StageStatus;
  description?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  output?: Record<string, unknown>;
  errorMsg?: string;
  transitionReason?: string;
  progressPct?: number;
  agentRunId: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  description?: string;
  output?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  stageId: string;
}

// ─── Agent Logs ─────────────────────────────────────────────────────────────

export interface AgentLog {
  id: string;
  runId: string;
  stageSlug: string;
  stageName: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  worker: string;
  message: string;
  actionLabel?: ActionLabel;
  evidence?: LogEvidence;
}

export interface LogEvidence {
  type: 'file' | 'code' | 'diff' | 'test' | 'finding' | 'metric';
  title?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  before?: string;
  after?: string;
  language?: string;
}

// ─── Code Changes ───────────────────────────────────────────────────────────

export interface CodeChange {
  id: string;
  runId: string;
  filePath: string;
  changeType: 'MODIFIED' | 'CREATED' | 'DELETED';
  description: string;
  actionLabel: ActionLabel;
  diffBefore?: string;
  diffAfter?: string;
  linesAdded: number;
  linesRemoved: number;
  relatedFindingId?: string;
  approvalRequired: boolean;
}

// ─── Test Results ───────────────────────────────────────────────────────────

export interface TestResult {
  id: string;
  suiteName: string;
  totalTests: number;
  passing: number;
  failing: number;
  skipped: number;
  coverage?: number;
  durationMs?: number;
  snapshot: boolean; // true = before, false = after
  agentRunId: string;
  failedTests?: FailedTest[];
  createdAt: string;
}

export interface FailedTest {
  name: string;
  file: string;
  errorMessage: string;
  expected?: string;
  received?: string;
}

// ─── Review Findings ────────────────────────────────────────────────────────

export interface ReviewFinding {
  id: string;
  runId: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  suggestion?: string;
  status: FindingStatus;
  actionLabel: ActionLabel;
  fixApplied: boolean;
  fixDiff?: string;
}

// ─── Release Risk Report ─────────────────────────────────────────────────────

export interface ReleaseRiskReport {
  id: string;
  runId: string;
  overallScore: number; // 0-100, higher = more ready
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contributors: RiskContributor[];
  blockers: string[];
  warnings: string[];
  recommendations: string[];
  createdAt: string;
}

export interface RiskContributor {
  name: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  weight: number; // percentage contribution
  detail: string;
}

// ─── Approval Request ────────────────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  runId: string;
  status: ApprovalStatus;
  reason: string;
  description: string;
  filesAffected: string[];
  potentialImpact: string;
  rollbackGuidance: string;
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  comment?: string;
  rejectionReason?: string;
}

// ─── Release Report (legacy + Phase 3) ──────────────────────────────────────

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: FindingCategory;
  status: FindingStatus;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  suggestion?: string;
  fixApplied: boolean;
  fixDiff?: string;
  repositoryId: string;
  agentRunId: string;
  createdAt: string;
}

export interface ReleaseReport {
  id: string;
  healthScoreBefore: number;
  healthScoreAfter: number;
  findingsFound: number;
  findingsFixed: number;
  testPassingBefore: number;
  testFailingBefore: number;
  testPassingAfter: number;
  testFailingAfter: number;
  coverageBefore?: number;
  coverageAfter?: number;
  releaseReadiness: number;
  changelog?: string;
  releaseNotes?: string;
  recommendations: string[];
  agentRunId: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  status: ApprovalStatus;
  comment?: string;
  agentRunId: string;
  approverId: string;
  createdAt: string;
}

// ─── UI / Dashboard Types ───────────────────────────────────────────────────

export interface GlobalMetrics {
  totalRepositories: number;
  activeRuns: number;
  issuesFoundThisWeek: number;
  issuesFixedThisWeek: number;
  averageHealthScore: number;
  testsPassingRate: number;
  releaseReadinessAvg: number;
}

export interface DashboardData {
  metrics: GlobalMetrics;
  repositories: Repository[];
  activeRuns: AgentRun[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'run_completed' | 'finding_fixed' | 'run_started' | 'run_failed' | 'report_generated' | 'repo_connected';
  title: string;
  description: string;
  timestamp: string;
  repositoryName?: string;
  severity?: FindingSeverity;
  runStatus?: RunStatus;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'cache' | 'queue' | 'external' | 'frontend' | 'gateway';
  technology: string;
  x: number;
  y: number;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
}

export interface ArchitectureMap {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

// ─── Phase 4: Deployment ─────────────────────────────────────────────────────

export type DeployCheckStatus = 'PASS' | 'FAIL' | 'WARN' | 'PENDING' | 'SKIPPED';
export type DeployActionStatus = 'COMPLETED' | 'SIMULATED' | 'BLOCKED' | 'REQUIRES_APPROVAL' | 'PENDING';
export type SmokeTestStatus = 'PASS' | 'FAIL' | 'PENDING';
export type HealthCheckStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'PENDING';

export interface ReleaseGateCheck {
  id: string;
  category: 'BUILD' | 'TEST' | 'LINT' | 'SECURITY' | 'DOCS' | 'CONFIG' | 'DEPENDENCIES' | 'CHANGELOG';
  name: string;
  status: DeployCheckStatus;
  detail: string;
  actionLabel: ActionLabel;
  remediationNote?: string;
}

export interface DeploymentStep {
  id: string;
  index: number;
  name: string;
  description: string;
  status: DeployActionStatus;
  actionLabel: ActionLabel;
  durationMs?: number;
  output?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  blockedReason?: string;
}

export interface SmokeTest {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus: number;
  actualStatus?: number;
  status: SmokeTestStatus;
  durationMs?: number;
  errorMessage?: string;
  actionLabel: ActionLabel;
}

export interface HealthCheck {
  id: string;
  service: string;
  type: 'HTTP' | 'TCP' | 'DATABASE' | 'CACHE' | 'QUEUE';
  endpoint: string;
  status: HealthCheckStatus;
  responseTimeMs?: number;
  message?: string;
  checkedAt?: string;
  actionLabel: ActionLabel;
}

export interface DeploymentReport {
  id: string;
  runId: string;
  environment: string;
  version: string;
  semverRecommendation: string;
  changelog: string;
  releaseNotes: string;
  gateChecks: ReleaseGateCheck[];
  steps: DeploymentStep[];
  smokeTests: SmokeTest[];
  healthChecks: HealthCheck[];
  overallStatus: 'READY' | 'BLOCKED' | 'DEPLOYED' | 'FAILED' | 'SIMULATED';
  deployedAt?: string;
  createdAt: string;
}

// ─── Stage definitions (static config) ─────────────────────────────────────

export interface StageDefinition {
  index: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  worker: string;
  requiresApproval?: boolean;
}

export const WORKFLOW_STAGES: StageDefinition[] = [
  { index: 0, slug: 'repo-analysis',     name: 'Repository Analysis',     description: 'Analyze codebase structure, languages, and architecture',       icon: '🔍', worker: 'Architecture Analyst'  },
  { index: 1, slug: 'issue-detection',   name: 'Issue Detection',          description: 'Identify bugs, vulnerabilities, and code quality issues',       icon: '🐛', worker: 'Debugger'              },
  { index: 2, slug: 'test-execution',    name: 'Test Execution',           description: 'Run existing test suite and record baseline results',           icon: '🧪', worker: 'Test Engineer'         },
  { index: 3, slug: 'coverage-analysis', name: 'Coverage Analysis',        description: 'Map test coverage gaps and identify uncovered critical paths',  icon: '📊', worker: 'Test Engineer'         },
  { index: 4, slug: 'dependency-audit',  name: 'Dependency Audit',         description: 'Check for outdated packages and known CVEs',                   icon: '📦', worker: 'Security Reviewer'     },
  { index: 5, slug: 'doc-validation',    name: 'Documentation Review',     description: 'Validate documentation matches actual API contracts',           icon: '📝', worker: 'Documentation Maintainer' },
  { index: 6, slug: 'fix-generation',    name: 'Fix Generation',           description: 'Propose and apply fixes — requires human approval',            icon: '🔧', worker: 'Debugger', requiresApproval: true },
  { index: 7, slug: 'test-writing',      name: 'Test Writing',             description: 'Generate regression and edge-case tests for fixed paths',      icon: '✍️', worker: 'Test Engineer'         },
  { index: 8, slug: 'validation',        name: 'Validation',               description: 'Run full test suite to verify fixes and new tests pass',       icon: '✅', worker: 'Test Engineer'         },
  { index: 9, slug: 'report-generation', name: 'Report Generation',        description: 'Calculate release risk score and compile final report',        icon: '📋', worker: 'Release Manager'       },
];
