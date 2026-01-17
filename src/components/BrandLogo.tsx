import Link from "next/link";

/**
 * BrandLogo component - Official ProofLocker logo with tagline
 * Uses official brand assets from /logos
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      {/* Official Logo */}
      <img
        src="/logos/prooflocker-logo-dark.svg"
        alt="ProofLocker"
        className="h-8 w-auto md:h-9"
      />
      {/* Tagline - Hidden on very small screens */}
      <p className="hidden sm:block text-xs text-white/40 leading-none border-l border-white/10 pl-3">
        Say it now. Prove it later.
      </p>
    </Link>
  );
}
