import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#000000] relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          {/* Left: Copyright */}
          <div className="text-gray-400 text-center md:text-left">
            © 2026 ProofLocker — All on-chain records immutable.
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-gray-400">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-gray-700">|</span>
            <a href="mailto:contact@prooflocker.io" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Right: Constellation DAG */}
          <div className="flex items-center gap-2 text-gray-400">
            <span>Built on</span>
            <a
              href="https://constellationnetwork.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold text-[#9370db] hover:text-[#7d5fc7] transition-colors"
            >
              <span>Constellation DAG</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
