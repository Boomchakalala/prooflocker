import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="relative z-10 text-center py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Predictions.{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Locked forever.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-2xl mx-auto">
          Say it now. Prove it later.
        </p>

        {/* CTA Buttons */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          {/* Radial glow behind primary CTA */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          <Link
            href="/lock"
            className="relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
          >
            Lock my prediction
          </Link>
          <Link
            href="/app"
            className="relative w-full sm:w-auto px-8 py-4 glass border border-white/10 hover:border-white/20 text-white text-lg font-medium rounded-lg transition-all"
          >
            Explore predictions
          </Link>
        </div>

        {/* Quick reassurance */}
        <p className="text-xs text-neutral-400 mt-3">
          No signup required · Takes 10 seconds · Free forever
        </p>

        {/* Trust badges - Premium chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm mt-12 opacity-80">
          <div className="glass border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 glow-blue">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-white font-medium">Anonymous by default</span>
          </div>
          <div className="glass border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 glow-purple">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white font-medium">Locked on-chain</span>
          </div>
          <div className="glass border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 glow-blue">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-white font-medium">Immutable proof</span>
          </div>
          <div className="glass border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 glow-purple">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-white font-medium">Shareable cards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
