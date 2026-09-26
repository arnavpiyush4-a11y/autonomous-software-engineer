// Design tokens — single source of truth (mirrors tailwind.config.ts)
// Import this file anywhere you need programmatic access to tokens.

export const colors = {
  // Base backgrounds
  bgBase: '#0a0e1a',
  bgSurface: '#111827',
  bgElevated: '#1a2236',
  bgOverlay: '#1f2937',

  // Borders
  borderDefault: '#1f2937',
  borderSubtle: '#374151',
  borderStrong: '#4b5563',

  // Text
  textPrimary: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Accent
  accentBlue: '#3b82f6',
  accentBlueDim: '#1d4ed8',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  neutral: '#6b7280',

  // Severity
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
} as const;

export const severity = {
  critical: { text: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Critical' },
  high:     { text: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'High' },
  medium:   { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Medium' },
  low:      { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', label: 'Low' },
} as const;

export const status = {
  running:   { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Running' },
  completed: { text: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Completed' },
  failed:    { text: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Failed' },
  pending:   { text: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Pending' },
  queued:    { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Queued' },
  cancelled: { text: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Cancelled' },
} as const;

export const stageStatus = {
  pending:  { color: '#374151', label: 'Pending' },
  active:   { color: '#3b82f6', label: 'Active' },
  done:     { color: '#10b981', label: 'Done' },
  failed:   { color: '#ef4444', label: 'Failed' },
  skipped:  { color: '#6b7280', label: 'Skipped' },
} as const;

export const spacing = {
  contentPadding: '24px',
  sidebarWidth: '256px',
  topbarHeight: '64px',
} as const;

export const language = {
  typescript: { color: '#3178c6', label: 'TypeScript' },
  javascript: { color: '#f7df1e', label: 'JavaScript' },
  python:     { color: '#3572a5', label: 'Python' },
  go:         { color: '#00add8', label: 'Go' },
  rust:       { color: '#dea584', label: 'Rust' },
  java:       { color: '#b07219', label: 'Java' },
  ruby:       { color: '#701516', label: 'Ruby' },
  csharp:     { color: '#178600', label: 'C#' },
} as const;
