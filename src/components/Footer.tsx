import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#0f172a] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">
            Built on{" "}
            <a
              href="https://constellationnetwork.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-200 hover:text-blue-400 transition-colors"
            >
              Constellation Network
            </a>
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-3">
            <Link href="/legal/privacy" className="hover:text-gray-200 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-600">·</span>
            <Link href="/legal/terms" className="hover:text-gray-200 transition-colors">
              Terms
            </Link>
          </div>

          <p className="text-gray-500 text-xs">© 2026 ProofLocker</p>
        </div>
      </div>
    </footer>
  );
}
