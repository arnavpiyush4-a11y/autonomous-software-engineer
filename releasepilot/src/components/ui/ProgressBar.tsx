interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'auto';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const colorValues: Record<NonNullable<ProgressBarProps['color']>, string> = {
  blue:  '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red:   '#ef4444',
  auto:  '', // computed
};

function getAutoColor(pct: number): string {
  if (pct >= 85) return '#10b981';
  if (pct >= 60) return '#f59e0b';
  return '#ef4444';
}

const sizeClasses: Record<NonNullable<ProgressBarProps['size']>, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'auto',
  size = 'sm',
  showLabel = false,
  label,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = color === 'auto' ? getAutoColor(pct) : colorValues[color];

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold" style={{ color: fillColor }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full bg-bg-overlay overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${animated ? 'animate-pulse-slow' : ''}`}
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
            boxShadow: `0 0 8px ${fillColor}60`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Segmented Progress Bar (before/after) ──────────────────────────────────

interface SegmentedProgressProps {
  before: number;
  after: number;
  label?: string;
  className?: string;
}

export function SegmentedProgress({ before, after, label, className = '' }: SegmentedProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted">{label}</span>
          <span className="text-xs font-semibold text-status-success">
            +{after - before}%
          </span>
        </div>
      )}
      <div className="relative h-2 rounded-full bg-bg-overlay overflow-hidden">
        {/* Before bar */}
        <div
          className="absolute inset-0 h-full rounded-full"
          style={{ width: `${before}%`, backgroundColor: '#f59e0b', opacity: 0.5 }}
        />
        {/* After bar */}
        <div
          className="absolute inset-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${after}%`, backgroundColor: '#10b981' }}
        />
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="flex items-center gap-1 text-2xs text-text-muted">
          <span className="w-2 h-2 rounded-full inline-block opacity-50" style={{ backgroundColor: '#f59e0b' }} />
          Before: {before}%
        </span>
        <span className="flex items-center gap-1 text-2xs text-status-success">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#10b981' }} />
          After: {after}%
        </span>
      </div>
    </div>
  );
}
