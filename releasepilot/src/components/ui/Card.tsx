import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Extra background gradient variant */
  variant?: 'default' | 'elevated' | 'success' | 'danger' | 'info';
  /** Whether to show a subtle top-border accent line */
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'none';
  /** Hover lift effect */
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default:  'bg-bg-surface border-border-default',
  elevated: 'bg-bg-elevated border-border-default',
  success:  'bg-bg-surface border-status-success/30',
  danger:   'bg-bg-surface border-status-danger/30',
  info:     'bg-bg-surface border-accent-blue/30',
};

const accentClasses: Record<NonNullable<CardProps['accent']>, string> = {
  blue:  'before:bg-accent-blue',
  green: 'before:bg-status-success',
  amber: 'before:bg-status-warning',
  red:   'before:bg-status-danger',
  none:  '',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({
  children,
  className = '',
  variant = 'default',
  accent = 'none',
  hoverable = false,
  padding = 'md',
  ...props
}: CardProps) {
  const accentClass = accent !== 'none'
    ? `relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:rounded-t-xl ${accentClasses[accent]}`
    : '';

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : '',
        accentClass,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Card sub-components ────────────────────────────────────────────────────

export function CardHeader({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-base font-semibold text-text-primary ${className}`}>
      {children}
    </h2>
  );
}

export function CardSubtitle({ children, className = '' }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-text-muted mt-0.5 ${className}`}>
      {children}
    </p>
  );
}

export function CardDivider({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-border-default my-4 ${className}`} />;
}

export function CardFooter({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between pt-4 border-t border-border-default mt-4 ${className}`}>
      {children}
    </div>
  );
}
