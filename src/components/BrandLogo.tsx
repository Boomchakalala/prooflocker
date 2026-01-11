import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker brand mark and wordmark
 *
 * Displays:
 * - Desktop (>= sm): PL symbol + ProofLocker wordmark
 * - Mobile (< sm): PL symbol only
 *
 * Usage:
 *   <BrandLogo />
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* PL Symbol - Always visible */}
      <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
        <Image
          src="/brand/prooflocker-mark.svg"
          alt="ProofLocker"
          fill
          className="object-contain transition-opacity group-hover:opacity-90"
          priority
        />
      </div>

      {/* ProofLocker Wordmark - Hidden on mobile */}
      <div className="relative hidden sm:block w-28 h-4 sm:h-[18px]">
        <Image
          src="/brand/prooflocker-wordmark.svg"
          alt="ProofLocker"
          fill
          className="object-contain transition-opacity group-hover:opacity-90"
          priority
        />
      </div>
    </Link>
  );
}
