/**
 * Example Header.tsx - Integration of BrandLogo component
 *
 * Replace FullLogo with BrandLogo in your header like this:
 */

import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* NEW: Use BrandLogo (no Link wrapper needed - it's built-in) */}
          <BrandLogo />

          {/* Right side content */}
          <div className="flex items-center gap-4">
            {/* Your existing header content */}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Migration notes:
 *
 * BEFORE (old):
 *   import FullLogo from "@/components/FullLogo";
 *   <Link href="/" className="hover:opacity-90 transition-opacity">
 *     <FullLogo />
 *   </Link>
 *
 * AFTER (new):
 *   import BrandLogo from "@/components/BrandLogo";
 *   <BrandLogo />
 *
 * The Link is built into BrandLogo, so no extra wrapper needed.
 */
