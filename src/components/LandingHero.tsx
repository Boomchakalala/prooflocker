import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="relative z-10 min-h-[60vh] flex items-center justify-center text-center py-16 px-6 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        {/* Main headline */}
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
          Predictions.<br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Locked
          </span>{" "}
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            forever.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-3">
          Say it now. Prove it later.
        </p>

        <p className="text-base text-gray-400 mb-10">
          No signup · 10 seconds · On-chain forever
        </p>

        {/* Key benefits with dark badges - Only 4 pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm md:text-base text-gray-300">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span>Anonymous</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>10 seconds</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>On-chain</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Immutable</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/lock"
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Lock my prediction
          </Link>
          <Link
            href="/app"
            className="px-10 py-4 border-2 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white text-lg font-bold rounded-xl transition-all hover:bg-gray-800/50"
          >
            Explore predictions
          </Link>
        </div>
      </div>
    </div>
  );
}
