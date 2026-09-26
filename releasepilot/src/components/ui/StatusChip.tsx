import type { RunStatus, StageStatus } from '@/lib/types';

// ─── Run Status Chip ────────────────────────────────────────────────────────

const RUN_STATUS_CONFIG: Record<RunStatus, { label: string; bg: string; text: string; dot: string; pulse: boolean }> = {
  QUEUED:    { label: 'Queued',    bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', dot: '#6b7280', pulse: false },
  RUNNING:   { label: 'Running',   bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', dot: '#3b82f6', pulse: true  },
  COMPLETED: { label: 'Completed', bg: 'rgba(16,185,129,0.15)',  text: '#34d399', dot: '#10b981', pulse: false },
  FAILED:    { label: 'Failed',    bg: 'rgba(239,68,68,0.15)',   text: '#f87171', dot: '#ef4444', pulse: false },
  CANCELLED: { label: 'Cancelled', bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', dot: '#6b7280', pulse: false },
};

interface StatusChipProps {
  status: RunStatus;
  size?: 'sm' | 'md';
}

export default function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const cfg = RUN_STATUS_CONFIG[status];
  const sizeClass = size === 'sm'
    ? 'text-2xs px-2 py-0.5 gap-1.5'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClass}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {cfg.pulse && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: cfg.dot }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: cfg.dot }}
        />
      </span>
      {cfg.label}
    </span>
  );
}

// ─── Stage Status Chip ──────────────────────────────────────────────────────

const STAGE_STATUS_CONFIG: Record<StageStatus, { label: string; bg: string; text: string; icon: string }> = {
  PENDING:  { label: 'Pending', bg: 'rgba(55,65,81,0.6)',    text: '#6b7280', icon: '○' },
  ACTIVE:   { label: 'Active',  bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', icon: '◉' },
  DONE:     { label: 'Done',    bg: 'rgba(16,185,129,0.15)', text: '#34d399', icon: '✓' },
  FAILED:   { label: 'Failed',  bg: 'rgba(239,68,68,0.15)',  text: '#f87171', icon: '✗' },
  SKIPPED:  { label: 'Skipped', bg: 'rgba(107,114,128,0.12)', text: '#6b7280', icon: '—' },
};

export function StageStatusChip({ status }: { status: StageStatus }) {
  const cfg = STAGE_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-2xs font-semibold rounded px-1.5 py-0.5"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="font-mono">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Health Score Chip ──────────────────────────────────────────────────────

export function HealthScoreChip({ score }: { score: number }) {
  let bg: string, text: string, label: string;
  if (score >= 85)       { bg = 'rgba(16,185,129,0.15)'; text = '#34d399'; label = 'Healthy'; }
  else if (score >= 65)  { bg = 'rgba(245,158,11,0.15)'; text = '#fbbf24'; label = 'Fair'; }
  else                   { bg = 'rgba(239,68,68,0.15)';  text = '#f87171'; label = 'At Risk'; }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-1"
      style={{ backgroundColor: bg, color: text }}
    >
      <span className="text-base leading-none">{score}</span>
      <span className="text-2xs font-semibold opacity-80">{label}</span>
    </span>
  );
}
