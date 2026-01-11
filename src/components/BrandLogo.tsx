import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker horizontal logo with tagline
 *
 * Uses the approved logo PNG at /brand/prooflocker-horizontal.png
 *
 * Sizing:
 * - Mobile: 28px height
 * - Desktop: 32px height
 * - Width: auto (preserves aspect ratio)
 *
 * Usage:
 *   <BrandLogo />
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="block shrink-0">
      <div className="flex flex-col gap-0.5">
        {/* Horizontal logo */}
        <Image
          src="/brand/prooflocker-horizontal.png"
          alt="ProofLocker"
          width={180}
          height={32}
          className="h-7 w-auto md:h-8"
          priority
        />
        {/* Tagline - only one */}
        <p className="text-xs text-white/60 leading-tight hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
