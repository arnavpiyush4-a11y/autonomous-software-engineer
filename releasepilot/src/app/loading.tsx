export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#111827] border border-blue-500/30 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6">
              <path d="M13 2L4.09 12.26A1 1 0 0 0 5 14h5.5l-.5 8 8.91-10.26A1 1 0 0 0 18 10h-5.5L13 2z" />
            </svg>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading ReleasePilot AI…</span>
        </div>

        {/* Shimmer bars */}
        <div className="w-80 space-y-3">
          {[100, 75, 90, 60].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-slate-800 overflow-hidden"
              style={{ width: `${w}%` }}
            >
              <div
                className="h-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
