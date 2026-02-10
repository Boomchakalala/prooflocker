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
          Why It Matters
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-white/70 text-center max-w-2xl mx-auto mb-14">
          Every prediction you make builds a permanent track record that compounds over time
        </p>

        {/* Three Compact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1 - Primary Card (Most Important) */}
          <div className="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-emerald-700/5 border border-emerald-500/15 hover:border-emerald-400/25 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg text-center ring-1 ring-emerald-500/5">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Early Predictions Win</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Lock your claim before the news confirms it. Early accuracy earns multipliers. The earlier you call it, the more your reputation grows.
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
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Transparent Track Record</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Your accuracy is public and permanent. No credentials required—just provable results anyone can verify.
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
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">Reputation Compounds</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Every correct claim strengthens your reputation. Build momentum through consistency and watch your influence grow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
