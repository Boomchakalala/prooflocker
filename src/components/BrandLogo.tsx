import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker horizontal logo with single tagline
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="block shrink-0">
      <div className="flex flex-col">
        <Image
          src="/brand/prooflocker-horizontal.png"
          alt="ProofLocker"
          width={200}
          height={36}
          className="h-7 w-auto md:h-8"
          priority
        />
        <p className="text-xs text-white/60 leading-tight mt-0.5 hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
