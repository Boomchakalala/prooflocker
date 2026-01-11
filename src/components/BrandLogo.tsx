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
    <Link href="/" className="block">
      <div className="flex flex-col">
        {/* Horizontal logo */}
        <Image
          src="/brand/prooflocker-horizontal.png"
          alt="ProofLocker"
          width={140}
          height={32}
          className="h-7 w-auto sm:h-8 object-contain"
          priority
        />
        {/* Tagline */}
        <p className="text-xs text-white/60 leading-tight mt-0.5 hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
