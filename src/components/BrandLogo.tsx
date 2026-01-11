import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker horizontal logo with single tagline
 * No cropping, no overflow constraints
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex flex-col justify-center">
        <Image
          src="/brand/prooflocker-horizontal.png"
          alt="ProofLocker"
          width={260}
          height={48}
          className="h-7 w-auto md:h-8 object-contain"
          style={{ maxWidth: "none" }}
          priority
        />
        <p className="text-xs text-white/60 mt-0.5 leading-tight hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
