import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 glass relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col gap-5 md:gap-4">
          {/* Mobile layout - Stacked centered content */}
          <div className="flex flex-col gap-4 items-center md:hidden">
            {/* Tagline */}
            <p className="text-sm text-white/70 font-medium tracking-wide">
              Anonymous • Public • Immutable
            </p>

            {/* Powered by - Mobile */}
            <p className="text-xs text-neutral-500">
              Powered by <span className="text-neutral-400">Digital Evidence (DAG)</span>
            </p>

            {/* Divider */}
            <div className="w-16 h-px bg-white/10"></div>

            {/* Legal links - Mobile */}
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <Link
                href="/legal/terms"
                className="hover:text-neutral-300 transition-colors"
              >
                Terms
              </Link>
              <span className="text-neutral-700">•</span>
              <Link
                href="/legal/privacy"
                className="hover:text-neutral-300 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-neutral-700">•</span>
              <Link
                href="/legal/disclaimer"
                className="hover:text-neutral-300 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>

          {/* Desktop layout - 3-column */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              <span className="text-white/70">Powered by Digital Evidence (DAG)</span>
            </p>
            <p className="text-sm text-neutral-500 absolute left-1/2 -translate-x-1/2">
              Anonymous • Public • Immutable
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-600 whitespace-nowrap">
              <Link
                href="/legal/terms"
                className="hover:text-neutral-400 transition-colors"
              >
                Terms
              </Link>
              <span className="text-neutral-700">•</span>
              <Link
                href="/legal/privacy"
                className="hover:text-neutral-400 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-neutral-700">•</span>
              <Link
                href="/legal/disclaimer"
                className="hover:text-neutral-400 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
