export default function HowItWorks() {
  return (
    <div className="relative z-10 py-12 md:py-20 lg:py-28 px-4 md:px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0F001A] to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 bg-gradient-to-r from-[#00E0FF] via-[#C084FC] to-[#A78BFA] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(0, 224, 255, 0.3))' }}>
            How It Works
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 font-semibold max-w-3xl mx-auto px-2">
            Three steps. From conviction to credibility.
          </p>
        </div>

        {/* Three Horizontal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
          {/* Box 1: Lock Your Claim */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#00E0FF]/50 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,224,255,0.25)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#00E0FF]/25 to-[#C084FC]/25 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#00E0FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-3 md:mb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">Make Your Call</h3>
              <p className="text-xs md:text-sm text-cyan-400 font-semibold">Before anyone knows</p>
            </div>

            <p className="text-sm md:text-base lg:text-lg text-white/75 leading-relaxed mb-4 md:mb-6 text-center">
              Timestamp your claim on-chain. No signup. Just conviction.
            </p>

            {/* Animation: Clock + Lock */}
            <div className="flex items-center justify-center gap-2 md:gap-3 text-slate-400">
              <svg className="w-4 h-4 md:w-5 md:h-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              <span className="text-xs md:text-sm">~10 seconds</span>
            </div>
          </div>

          {/* Box 2: Prove You Were Right */}
          <div className="bg-gradient-to-br from-emerald-600/10 via-green-600/8 to-emerald-700/10 border-2 border-emerald-500/40 hover:border-emerald-400/60 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:-translate-y-1 relative overflow-hidden">
            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-3 md:mb-4">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">Prove You Were Right</h3>
                <p className="text-xs md:text-sm text-emerald-400 font-semibold">When the world catches up</p>
              </div>

              <p className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed mb-3 md:mb-4 text-center">
                Mark it correct, incorrect, or contested. Your reputation updates instantly.
              </p>

              {/* NEW: Resolution = Reputation callout */}
              <div className="px-3 md:px-4 py-2 md:py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
                <p className="text-xs md:text-sm text-emerald-300 font-bold">
                  Resolution = Reputation
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Build */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#C084FC]/50 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(167,139,250,0.3)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#C084FC]/25 to-[#00E0FF]/25 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#C084FC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>

            <div className="text-center mb-3 md:mb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">Compound Credibility</h3>
              <p className="text-xs md:text-sm text-purple-400 font-semibold">Every resolution counts more</p>
            </div>

            <p className="text-sm md:text-base lg:text-lg text-white/75 leading-relaxed mb-4 md:mb-6 text-center">
              Streaks multiply your score. Top ranks get visibility. Your track record becomes your advantage.
            </p>

            {/* Stat box: compounding example */}
            <div className="px-3 md:px-4 py-2 md:py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-400">5-streak:</span>
                <span className="text-purple-400 font-bold">170 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
