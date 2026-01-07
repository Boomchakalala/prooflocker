export default function FullLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Symbol */}
      <svg
        className="w-10 h-10 flex-shrink-0"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ultra-minimal mark: vertical bar intersecting dot - represents timestamp/finality */}
        {/* Vertical bar */}
        <rect x="18" y="8" width="4" height="24" fill="white" rx="2" />

        {/* Intersecting dot with subtle glow */}
        <circle cx="20" cy="20" r="3" fill="#10b981" />
        <circle cx="20" cy="20" r="3" fill="#10b981" opacity="0.3" />
      </svg>

      {/* Wordmark and tagline */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-bold text-white font-sans leading-none tracking-tight">
          ProofLocker
        </span>
        <span className="text-xs text-white/60 font-normal leading-none tracking-normal">
          Predictions. Locked forever.
        </span>
      </div>
    </div>
  );
}
