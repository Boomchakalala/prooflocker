import Link from "next/link";

/**
 * BrandLogo component - ProofLocker logo with tagline
 *
 * Clean SVG-based logo to avoid PNG issues with embedded text
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="block shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Simple lock icon */}
        <svg
          className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical bar */}
          <rect x="18" y="8" width="4" height="24" fill="white" rx="2" />
          {/* Dot with glow */}
          <circle cx="20" cy="20" r="3" fill="#10b981" />
          <circle cx="20" cy="20" r="3" fill="#10b981" opacity="0.3" />
        </svg>

        {/* Wordmark and tagline */}
        <div className="flex flex-col gap-0.5">
          <span className="text-lg md:text-xl font-bold text-white leading-none tracking-tight">
            ProofLocker
          </span>
          <span className="text-xs text-white/60 leading-none hidden sm:block">
            Predictions. Locked forever.
          </span>
        </div>
      </div>
    </Link>
  );
}
