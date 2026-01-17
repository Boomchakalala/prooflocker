import Link from "next/link";

/**
 * BrandLogo component - Official ProofLocker logo
 * Clean header - logo only, no tagline
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center">
      <img
        src="/logos/prooflocker-logo-dark.svg"
        alt="ProofLocker"
        className="h-8 w-auto md:h-9"
      />
    </Link>
  );
}
