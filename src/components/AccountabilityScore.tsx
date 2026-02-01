export default function AccountabilityScore() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      {/* Subtle green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent opacity-50" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Track Record Over Hype
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-white/60 text-center max-w-2xl mx-auto mb-14">
          Build verifiable credibility through consistent accuracy.
        </p>

        {/* Three Compact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1 */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-400/20 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Accuracy Rewarded</h3>
            <p className="text-sm md:text-base text-white/70">
              Points for correct predictions. Penalties for misses. Your score reflects reality.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-400/20 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Reputation Built</h3>
            <p className="text-sm md:text-base text-white/70">
              Long-term reliability visible to everyone. No identity needed—just results.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-400/20 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Trust Compounded</h3>
            <p className="text-sm md:text-base text-white/70">
              Each resolution strengthens your history. Credibility earned through proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
