'use client';

import { useState, useRef, useEffect } from 'react';
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

const NOTIFICATIONS = [
  { id: 'n1', text: 'E-Commerce Platform run completed', time: '2m ago', read: false },
  { id: 'n2', text: 'Security CVE resolved in Payment Service', time: '14m ago', read: false },
  { id: 'n3', text: 'New repository connected: Notification Hub', time: '1h ago', read: true },
];

interface TopBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }

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
        <div ref={notifRef} className="relative">
          <button
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-danger" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 rounded-xl border border-border-default bg-bg-surface shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                <span className="text-xs font-semibold text-text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-2xs text-accent-blue hover:underline">Mark all read</button>
                )}
              </div>
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border-default last:border-b-0 ${n.read ? '' : 'bg-accent-blue-glow'}`}>
                    {!n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />}
                    {n.read && <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary leading-snug">{n.text}</p>
                      <p className="text-2xs text-text-muted mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border-default" />

        {/* User profile */}
        <div ref={userRef} className="relative">
          <button
            aria-label="User menu"
            aria-expanded={userOpen}
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
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
          {userOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-xl border border-border-default bg-bg-surface shadow-lg z-50 py-1">
              <div className="px-4 py-2 border-b border-border-default">
                <p className="text-xs font-semibold text-text-primary">{MOCK_USER.name}</p>
                <p className="text-2xs text-text-muted">{MOCK_USER.email}</p>
              </div>
              {[
                { label: 'Settings', href: '/settings' },
                { label: 'Demo Guide', href: '/demo' },
              ].map((item) => (
                <a key={item.label} href={item.href} className="block px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  {item.label}
                </a>
              ))}
              <div className="border-t border-border-default mt-1 pt-1">
                <button className="w-full text-left px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
