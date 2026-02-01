import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="relative z-10 text-center py-16 md:py-24 lg:py-32 px-4 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Main headline - MASSIVE */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight leading-[0.95]">
          Predictions.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Locked forever.
          </span>
        </h1>

        {/* Subheading - LARGE italic */}
        <p className="text-3xl sm:text-4xl md:text-5xl text-gray-700 italic font-medium mb-8 md:mb-12">
          Say it now. Prove it later.
        </p>

        {/* Key benefits with icons - LARGE text */}
        <div className="max-w-3xl mx-auto mb-10 md:mb-14 space-y-3">
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span className="font-semibold">Anonymous — no signup required</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">~10 seconds to lock</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold">On-chain via Constellation Network</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">Immutable cryptographic proof</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="font-semibold">Shareable proof cards to flex your wins</span>
          </div>
        </div>

        {/* CTA Buttons - HUGE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
          <Link
            href="/lock"
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xl font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
          >
            Lock My First Prediction
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/app"
            className="w-full sm:w-auto px-10 py-5 text-blue-600 hover:text-blue-700 text-lg font-semibold underline decoration-2 underline-offset-4 hover:decoration-4 transition-all"
          >
            Explore locked predictions →
          </Link>
        </div>
      </div>
    </div>
  );
}
