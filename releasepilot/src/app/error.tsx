'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Error card */}
        <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-400 mb-2">
            ReleasePilot AI encountered an unexpected error.
          </p>

          {/* Error detail */}
          {error.message && (
            <div className="mt-4 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-left">
              <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-1">Digest: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 text-sm font-semibold border border-slate-600/40 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-4">ReleasePilot AI · Demo MVP</p>
      </div>
    </div>
  );
}
