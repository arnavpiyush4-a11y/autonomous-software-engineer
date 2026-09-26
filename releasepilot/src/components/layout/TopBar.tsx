'use client';

import { MOCK_USER } from '@/lib/mock-data';

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
      {initials}
    </div>
  );
}

interface TopBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header
      style={{ height: 'var(--topbar-height)' }}
      className="flex items-center justify-between px-6 border-b border-border-default bg-bg-surface/90 backdrop-blur-sm sticky top-0 z-30"
    >
      {/* Left: Page title */}
      <div className="flex flex-col justify-center">
        {title && (
          <h1 className="text-base font-semibold text-text-primary leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
        {!title && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Welcome back,</span>
            <span className="text-sm font-medium text-text-primary">{MOCK_USER.name}</span>
          </div>
        )}
      </div>

      {/* Center: actions slot */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
        >
          <IconBell />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-danger" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border-default" />

        {/* User profile */}
        <button
          aria-label="User menu"
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors duration-150"
        >
          <UserAvatar name={MOCK_USER.name} />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-text-primary leading-tight">{MOCK_USER.name}</p>
            <p className="text-2xs text-text-muted capitalize">{MOCK_USER.role}</p>
          </div>
          <span className="text-text-muted hidden sm:block">
            <IconChevronDown />
          </span>
        </button>
      </div>
    </header>
  );
}
