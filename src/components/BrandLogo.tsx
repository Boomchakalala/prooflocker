/**
 * BrandLogo component - Official ProofLocker logo
 * Clean header - logo only, no tagline
 * Note: Does not include Link wrapper - parent component should handle navigation
 */
export default function BrandLogo() {
  return (
    <img
      src="/logos/prooflocker-logo-dark.svg"
      alt="ProofLocker"
      className="h-8 w-auto md:h-9 select-none"
    />
  );
}
