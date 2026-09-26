import type { FindingSeverity, RunStatus } from '@/lib/types';

// ─── Generic Badge ──────────────────────────────────────────────────────────

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'orange' | 'purple' | 'cyan' | 'neutral';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  blue:    { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  green:   { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  amber:   { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  red:     { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  orange:  { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  purple:  { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  cyan:    { bg: 'rgba(6,182,212,0.12)',  text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
  neutral: { bg: 'rgba(107,114,128,0.12)',text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'text-2xs px-1.5 py-0.5 gap-1',
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

export default function Badge({ children, variant = 'blue', size = 'sm', dot = false, className = '' }: BadgeProps) {
  const s = variantStyles[variant];
  return (
    <span
      className={`inline-flex items-center font-semibold rounded uppercase tracking-wider border ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: s.text }}
        />
      )}
      {children}
    </span>
  );
}

// ─── Language Badge ─────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TypeScript:  { bg: 'rgba(49,120,198,0.15)',  text: '#60a5fa', border: 'rgba(49,120,198,0.4)' },
  JavaScript:  { bg: 'rgba(247,223,30,0.1)',   text: '#fbbf24', border: 'rgba(247,223,30,0.3)' },
  Python:      { bg: 'rgba(53,114,165,0.15)',  text: '#60a5fa', border: 'rgba(53,114,165,0.4)' },
  Go:          { bg: 'rgba(0,173,216,0.12)',   text: '#22d3ee', border: 'rgba(0,173,216,0.3)' },
  Rust:        { bg: 'rgba(222,165,132,0.12)', text: '#f97316', border: 'rgba(222,165,132,0.3)' },
  Java:        { bg: 'rgba(176,114,25,0.12)',  text: '#fbbf24', border: 'rgba(176,114,25,0.3)' },
  Ruby:        { bg: 'rgba(112,21,22,0.15)',   text: '#f87171', border: 'rgba(112,21,22,0.4)' },
};

export function LanguageBadge({ language }: { language: string }) {
  const style = LANG_COLORS[language] ?? variantStyles.neutral;
  return (
    <span
      className="inline-flex items-center text-2xs font-bold rounded px-1.5 py-0.5 uppercase tracking-wider border"
      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
    >
      {language}
    </span>
  );
}

// ─── Severity Badge ─────────────────────────────────────────────────────────

const SEVERITY_VARIANT: Record<FindingSeverity, BadgeVariant> = {
  CRITICAL: 'red',
  HIGH:     'orange',
  MEDIUM:   'amber',
  LOW:      'blue',
  INFO:     'cyan',
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <Badge variant={SEVERITY_VARIANT[severity]} size="xs" dot>
      {severity}
    </Badge>
  );
}

// ─── Run Status Badge ────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<RunStatus, BadgeVariant> = {
  QUEUED:    'neutral',
  RUNNING:   'blue',
  COMPLETED: 'green',
  FAILED:    'red',
  CANCELLED: 'neutral',
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} size="xs" dot>
      {status}
    </Badge>
  );
}
