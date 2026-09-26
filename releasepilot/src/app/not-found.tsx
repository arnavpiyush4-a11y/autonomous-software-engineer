import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 display */}
        <div className="mb-6">
          <div className="text-8xl font-black text-slate-800 select-none">404</div>
          <div className="text-blue-500/40 text-lg font-mono -mt-3">page_not_found</div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-100 mb-2">Page not found</h1>
        <p className="text-sm text-slate-400 mb-8">
          The resource you&apos;re looking for doesn&apos;t exist in ReleasePilot AI.
          It may have been moved or this is a demo environment with limited data.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/repositories"
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 text-sm font-semibold border border-slate-600/40 transition-colors"
          >
            Repositories
          </Link>
        </div>
      </div>
    </div>
  );
}
