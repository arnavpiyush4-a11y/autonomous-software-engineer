'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconRepositories() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v4H3z" rx="1" />
      <path d="M3 11h18v4H3z" rx="1" />
      <path d="M3 19h18v2H3z" rx="1" />
      <circle cx="7.5" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRuns() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12,7 12,12 15.5,15.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
    </svg>
  );
}

function IconDemo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconNexus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <circle cx="12" cy="3" r="1.5"/>
      <circle cx="21" cy="12" r="1.5"/>
      <circle cx="12" cy="21" r="1.5"/>
      <circle cx="3" cy="12" r="1.5"/>
      <line x1="12" y1="4.5" x2="12" y2="9"/>
      <line x1="19.5" y1="12" x2="15" y2="12"/>
      <line x1="12" y1="19.5" x2="12" y2="15"/>
      <line x1="4.5" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/',               label: 'Dashboard',    icon: <IconDashboard /> },
  { href: '/nexus',          label: 'Nexus',        icon: <IconNexus /> },
  { href: '/repositories',   label: 'Repositories', icon: <IconRepositories />, badge: 4 },
  { href: '/runs',           label: 'Agent Runs',   icon: <IconRuns />, badge: 1 },
  { href: '/onboard',        label: 'Connect Repo', icon: <IconBolt /> },
  { href: '/demo',           label: 'Judge Demo',   icon: <IconDemo /> },
  { href: '/settings',       label: 'Settings',     icon: <IconSettings /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}
      className="flex flex-col h-screen bg-bg-surface border-r border-border-default sticky top-0 z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-default">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-blue text-white shadow-glow-blue">
          <IconBolt />
        </div>
        <div>
          <span className="text-base font-bold text-text-primary tracking-tight">ReleasePilot</span>
          <span className="block text-2xs text-text-muted font-medium tracking-widest uppercase mt-px">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
        <div className="mb-6">
          <p className="px-3 mb-2 text-2xs font-semibold text-text-muted uppercase tracking-wider">Menu</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                      active
                        ? 'text-accent-blue bg-accent-blue-glow'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                    ].join(' ')}
                  >
                    <span className={active ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-secondary transition-colors duration-150'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={[
                          'text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                          active
                            ? 'bg-accent-blue text-white'
                            : 'bg-bg-overlay text-text-muted',
                        ].join(' ')}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Active run status indicator */}
        <div className="mt-auto">
          <div className="bg-bg-elevated border border-border-default rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
              </span>
              <span className="text-xs font-semibold text-text-primary">1 Run Active</span>
            </div>
            <p className="text-2xs text-text-muted leading-relaxed">
              Notification Hub analysis in progress…
            </p>
            <Link
              href="/runs"
              className="mt-2 block text-2xs font-semibold text-accent-blue hover:underline"
            >
              View runs →
            </Link>
          </div>
        </div>
      </nav>

      {/* Version footer */}
      <div className="px-5 py-3 border-t border-border-default">
        <p className="text-2xs text-text-muted">ReleasePilot <span className="font-mono">v0.5.0</span> · Phases 1–5 ✓</p>
      </div>
    </aside>
  );
}
