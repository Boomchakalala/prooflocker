import Link from "next/link";
import Image from "next/image";

/**
 * BrandLogo component - ProofLocker horizontal logo with single tagline
 * Debug: LOGO_V2_OK label proves correct rendering
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center shrink-0">
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <Image
            src="/brand/prooflocker-horizontal.png"
            alt="ProofLocker"
            width={220}
            height={40}
            className="h-7 w-auto md:h-8 object-contain"
            priority
          />
          <span className="text-[10px] text-white/40 ml-2">LOGO_V2_OK</span>
        </div>
        <p className="text-xs text-white/60 mt-0.5 leading-tight hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
