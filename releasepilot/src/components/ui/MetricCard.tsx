interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; label?: string };
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MetricCard({
  label,
  value,
  unit,
  delta,
  icon,
  accentColor = '#3b82f6',
  className = '',
  size = 'md',
}: MetricCardProps) {
  const valueSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl';

  return (
    <div
      className={`relative rounded-xl border border-border-default bg-bg-surface p-5 overflow-hidden ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl pointer-events-none"
        style={{ backgroundColor: accentColor, transform: 'translate(30%, -30%)' }}
      />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</span>
          {icon && (
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {icon}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end gap-1.5">
          <span className={`${valueSize} font-bold text-text-primary tracking-tight leading-none`}>
            {value}
          </span>
          {unit && (
            <span className="text-sm text-text-muted font-medium mb-0.5">{unit}</span>
          )}
        </div>

        {/* Delta */}
        {delta !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="text-xs font-semibold"
              style={{ color: delta.value >= 0 ? '#10b981' : '#ef4444' }}
            >
              {delta.value >= 0 ? '↑' : '↓'} {Math.abs(delta.value)}
              {unit}
            </span>
            {delta.label && (
              <span className="text-xs text-text-muted">{delta.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
