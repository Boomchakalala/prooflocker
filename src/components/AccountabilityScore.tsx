export default function AccountabilityScore() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      {/* Enhanced green gradient background for trust and credibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/8 to-transparent opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div
          className="w-[800px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))' }}>
          Track Record Over Hype
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-white/60 text-center max-w-2xl mx-auto mb-14 font-medium">
          Earn your Insight Score. Climb from Novice to Oracle. Build verifiable credibility through consistent accuracy.
        </p>

        {/* Three Compact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1 - Primary Card (Most Important) */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/15 hover:border-emerald-400/25 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center ring-1 ring-emerald-500/5">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Points Per Prediction</h3>
            <p className="text-sm md:text-base text-white/70 mb-3">
              +10 pts to lock. +80-120 pts for correct resolves. High-risk categories (Crypto, Politics, Markets) earn bonus points.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400/80">
              <span className="px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Lock +10</span>
              <span className="px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Win +80-120</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-400/20 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Streaks & Mastery</h3>
            <p className="text-sm md:text-base text-white/70 mb-3">
              Hit 3+ correct in a row? Unlock streak bonuses (+10 pts each). Dominate a category? Earn mastery badges and extra points.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-green-400/80">
              <span className="px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">Streak +10/ea</span>
              <span className="px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">Mastery +20</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-400/20 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Climb the Ranks</h3>
            <p className="text-sm md:text-base text-white/70 mb-3">
              Start as a Novice. Prove yourself as a Forecaster (1K pts). Become a Visionary (5K pts). Reach Oracle status (15K+ pts).
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400/80 flex-wrap">
              <span className="px-2 py-1 bg-gray-500/10 rounded-full border border-gray-500/20">Novice</span>
              <span className="px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">Forecaster</span>
              <span className="px-2 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">Visionary</span>
              <span className="px-2 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">Oracle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
