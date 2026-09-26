import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        'bg-base': '#0a0e1a',
        'bg-surface': '#111827',
        'bg-elevated': '#1a2236',
        'bg-overlay': '#1f2937',

        // Borders
        'border-default': '#1f2937',
        'border-subtle': '#374151',
        'border-strong': '#4b5563',

        // Text
        'text-primary': '#f9fafb',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',
        'text-disabled': '#374151',

        // Accent — Electric Blue
        'accent-blue': '#3b82f6',
        'accent-blue-dim': '#1d4ed8',
        'accent-blue-glow': 'rgba(59,130,246,0.15)',

        // Status
        'status-success': '#10b981',
        'status-success-dim': 'rgba(16,185,129,0.15)',
        'status-warning': '#f59e0b',
        'status-warning-dim': 'rgba(245,158,11,0.15)',
        'status-danger': '#ef4444',
        'status-danger-dim': 'rgba(239,68,68,0.15)',
        'status-info': '#06b6d4',
        'status-info-dim': 'rgba(6,182,212,0.15)',
        'status-neutral': '#6b7280',
        'status-neutral-dim': 'rgba(107,114,128,0.15)',

        // Severity
        'severity-critical': '#ef4444',
        'severity-high': '#f97316',
        'severity-medium': '#f59e0b',
        'severity-low': '#3b82f6',

        // Stage colors
        'stage-active': '#3b82f6',
        'stage-done': '#10b981',
        'stage-pending': '#374151',
        'stage-failed': '#ef4444',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '88': '22rem',
        '96': '24rem',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.5)',
        'elevated': '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.5)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.05) 50%, transparent 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
        'success-gradient': 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 100%)',
        'danger-gradient': 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
