import Link from "next/link";

/**
 * BrandLogo component - ProofLocker mark + wordmark with tagline
 * Uses separate SVG assets for better scaling
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* Mark/Icon */}
      <img
        src="/brand/prooflocker-mark.svg"
        alt="ProofLocker mark"
        className="h-7 w-7 md:h-8 md:w-8"
      />
      {/* Wordmark + Tagline */}
      <div className="flex flex-col justify-center">
        <img
          src="/brand/prooflocker-wordmark.svg"
          alt="ProofLocker"
          className="h-7 w-auto md:h-8"
        />
        <p className="text-xs text-white/60 mt-0.5 leading-tight hidden sm:block">
          Predictions. Locked forever.
        </p>
      </div>
    </Link>
  );
}
