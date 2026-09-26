/**
 * ReleasePilot AI — Workflow State Machine
 *
 * Defines valid state transitions, transition rules, and produces
 * structured transition records with timestamps and explanations.
 *
 * States: IDLE → ONBOARDING → UNDERSTANDING → PLANNING → EXECUTING
 *         → TESTING → REVIEWING → APPROVAL_REQUIRED → COMPLETED
 * Also: FAILED, BLOCKED, CANCELLED (from any active state)
 */

import type { WorkflowState } from '@/lib/types';

// ─── Transition definition ──────────────────────────────────────────────────

export interface StateTransition {
  from: WorkflowState;
  to: WorkflowState;
  reason: string;
  timestamp: string;
  durationMs?: number;
  progressPct: number;
  metadata?: Record<string, unknown>;
}

// ─── Valid transitions map ───────────────────────────────────────────────────

// Each key lists the states that key state can transition TO.
const VALID_TRANSITIONS: Partial<Record<WorkflowState, WorkflowState[]>> = {
  IDLE:              ['ONBOARDING', 'CANCELLED'],
  ONBOARDING:        ['UNDERSTANDING', 'FAILED', 'CANCELLED'],
  UNDERSTANDING:     ['PLANNING', 'BLOCKED', 'FAILED', 'CANCELLED'],
  PLANNING:          ['EXECUTING', 'BLOCKED', 'FAILED', 'CANCELLED'],
  EXECUTING:         ['TESTING', 'APPROVAL_REQUIRED', 'BLOCKED', 'FAILED', 'CANCELLED'],
  TESTING:           ['REVIEWING', 'EXECUTING', 'FAILED', 'CANCELLED'],
  REVIEWING:         ['APPROVAL_REQUIRED', 'COMPLETED', 'FAILED', 'CANCELLED'],
  APPROVAL_REQUIRED: ['EXECUTING', 'CANCELLED', 'COMPLETED'],
  COMPLETED:         [],
  FAILED:            ['IDLE'],
  BLOCKED:           ['EXECUTING', 'CANCELLED'],
  CANCELLED:         [],
};

// Progress percentages for each state
const STATE_PROGRESS: Record<WorkflowState, number> = {
  IDLE:              0,
  ONBOARDING:        5,
  UNDERSTANDING:     15,
  PLANNING:          25,
  EXECUTING:         55,
  TESTING:           70,
  REVIEWING:         85,
  APPROVAL_REQUIRED: 90,
  COMPLETED:         100,
  FAILED:            0,
  BLOCKED:           0,
  CANCELLED:         0,
};

// Human-readable descriptions for states
export const STATE_DESCRIPTIONS: Record<WorkflowState, string> = {
  IDLE:              'Waiting to start',
  ONBOARDING:        'Connecting and scanning the repository',
  UNDERSTANDING:     'Analyzing task scope, affected files, and risks',
  PLANNING:          'Generating a dynamic execution plan',
  EXECUTING:         'Running analysis workers and applying proposed changes',
  TESTING:           'Running test suite to validate changes',
  REVIEWING:         'Code review and release-risk assessment',
  APPROVAL_REQUIRED: 'Waiting for human approval before destructive changes',
  COMPLETED:         'All tasks completed — release report ready',
  FAILED:            'Run failed — see error log for details',
  BLOCKED:           'Blocked on an external dependency or missing information',
  CANCELLED:         'Run cancelled by user',
};

// ─── State Machine class ────────────────────────────────────────────────────

export class WorkflowStateMachine {
  private currentState: WorkflowState;
  private history: StateTransition[] = [];
  private startTime: number;

  constructor(initialState: WorkflowState = 'IDLE') {
    this.currentState = initialState;
    this.startTime = Date.now();
  }

  get state(): WorkflowState {
    return this.currentState;
  }

  get transitions(): StateTransition[] {
    return [...this.history];
  }

  get progressPct(): number {
    return STATE_PROGRESS[this.currentState];
  }

  /**
   * Attempt a transition. Returns true if successful, false if invalid.
   * Always provides a reason string for audit logging.
   */
  transition(
    to: WorkflowState,
    reason: string,
    metadata?: Record<string, unknown>
  ): StateTransition | null {
    const allowed = VALID_TRANSITIONS[this.currentState] ?? [];

    if (!allowed.includes(to)) {
      console.warn(
        `[StateMachine] Invalid transition: ${this.currentState} → ${to}. ` +
        `Allowed: ${allowed.join(', ')}`
      );
      return null;
    }

    const now = Date.now();
    const transition: StateTransition = {
      from: this.currentState,
      to,
      reason,
      timestamp: new Date(now).toISOString(),
      durationMs: now - this.startTime,
      progressPct: STATE_PROGRESS[to],
      metadata,
    };

    this.history.push(transition);
    this.currentState = to;
    this.startTime = now;

    return transition;
  }

  /**
   * Force-fail the machine with a reason. Allowed from any non-terminal state.
   */
  fail(reason: string, error?: unknown): StateTransition | null {
    const terminalStates: WorkflowState[] = ['COMPLETED', 'CANCELLED', 'FAILED'];
    if (terminalStates.includes(this.currentState)) return null;

    const now = Date.now();
    const transition: StateTransition = {
      from: this.currentState,
      to: 'FAILED',
      reason,
      timestamp: new Date(now).toISOString(),
      durationMs: now - this.startTime,
      progressPct: 0,
      metadata: error instanceof Error ? { error: error.message } : undefined,
    };

    this.history.push(transition);
    this.currentState = 'FAILED';
    return transition;
  }

  /**
   * Cancel the run. Allowed from any non-terminal state.
   */
  cancel(reason = 'Cancelled by user'): StateTransition | null {
    const terminalStates: WorkflowState[] = ['COMPLETED', 'CANCELLED', 'FAILED'];
    if (terminalStates.includes(this.currentState)) return null;

    const now = Date.now();
    const transition: StateTransition = {
      from: this.currentState,
      to: 'CANCELLED',
      reason,
      timestamp: new Date(now).toISOString(),
      durationMs: now - this.startTime,
      progressPct: 0,
    };

    this.history.push(transition);
    this.currentState = 'CANCELLED';
    return transition;
  }

  isTerminal(): boolean {
    return ['COMPLETED', 'FAILED', 'CANCELLED'].includes(this.currentState);
  }

  isActive(): boolean {
    return !this.isTerminal() && this.currentState !== 'IDLE';
  }

  canTransitionTo(state: WorkflowState): boolean {
    const allowed = VALID_TRANSITIONS[this.currentState] ?? [];
    return allowed.includes(state);
  }

  getDescription(): string {
    return STATE_DESCRIPTIONS[this.currentState];
  }

  /**
   * Return a snapshot suitable for serialization.
   */
  snapshot(): {
    state: WorkflowState;
    progressPct: number;
    description: string;
    history: StateTransition[];
    isTerminal: boolean;
    isActive: boolean;
  } {
    return {
      state: this.currentState,
      progressPct: this.progressPct,
      description: this.getDescription(),
      history: this.transitions,
      isTerminal: this.isTerminal(),
      isActive: this.isActive(),
    };
  }
}

// ─── Validation helpers ─────────────────────────────────────────────────────

/**
 * Validate that a run transition request is safe.
 * Returns an error string if invalid, or null if ok.
 */
export function validateTransition(
  from: WorkflowState,
  to: WorkflowState
): string | null {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return `Cannot transition from '${from}' to '${to}'. Valid next states: ${allowed.join(', ') || 'none (terminal state)'}`;
  }
  return null;
}

/**
 * Returns whether an approval action is possible in the given state.
 */
export function canApprove(state: WorkflowState): boolean {
  return state === 'APPROVAL_REQUIRED';
}

/**
 * Returns the expected next state after approval.
 */
export function stateAfterApproval(action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'): WorkflowState {
  switch (action) {
    case 'APPROVED':           return 'EXECUTING';
    case 'REJECTED':           return 'CANCELLED';
    case 'CHANGES_REQUESTED':  return 'BLOCKED';
  }
}

// ─── Stage → WorkflowState mapping ─────────────────────────────────────────

// Maps a workflow stage slug to the appropriate WorkflowState
export const STAGE_TO_WORKFLOW_STATE: Record<string, WorkflowState> = {
  'repo-analysis':     'ONBOARDING',
  'issue-detection':   'EXECUTING',
  'test-execution':    'TESTING',
  'coverage-analysis': 'TESTING',
  'dependency-audit':  'EXECUTING',
  'doc-validation':    'REVIEWING',
  'fix-generation':    'EXECUTING',
  'test-writing':      'TESTING',
  'validation':        'TESTING',
  'report-generation': 'REVIEWING',
};
