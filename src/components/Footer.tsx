import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 glass relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4">
          {/* Main footer row */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs md:text-sm text-neutral-500 hidden md:block">
              <span className="text-white/70">Powered by Digital Evidence (DAG)</span>
            </p>
            <p className="flex-1 text-center text-xs md:text-sm text-neutral-500">
              Anonymous • Public • Immutable
            </p>
            <div className="hidden md:block w-[200px]"></div>
          </div>

          {/* Legal links row */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-neutral-600">
            <Link
              href="/legal/terms"
              className="hover:text-neutral-400 transition-colors focus:outline-none focus:text-neutral-300"
            >
              Terms
            </Link>
            <span className="text-neutral-700">•</span>
            <Link
              href="/legal/privacy"
              className="hover:text-neutral-400 transition-colors focus:outline-none focus:text-neutral-300"
            >
              Privacy
            </Link>
            <span className="text-neutral-700">•</span>
            <Link
              href="/legal/disclaimer"
              className="hover:text-neutral-400 transition-colors focus:outline-none focus:text-neutral-300"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
