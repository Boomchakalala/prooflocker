import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker approved horizontal logo
 *
 * Uses the approved logo PNG at /public/brand/prooflocker-horizontal.png
 *
 * Sizing:
 * - Mobile: 24px height
 * - Desktop: 28px height
 * - Width: auto (preserves aspect ratio)
 *
 * Usage:
 *   <BrandLogo />
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="block group">
      {/* Horizontal logo - scales responsively */}
      <div className="relative h-6 w-auto sm:h-7">
        <Image
          src="/brand/prooflocker-horizontal.png"
          alt="ProofLocker"
          width={120}
          height={28}
          className="h-6 w-auto sm:h-7 object-contain transition-opacity group-hover:opacity-90"
          priority
        />
      </div>
    </Link>
  );
}
