export default function HowItWorks() {
  return (
    <div className="relative z-10 py-20 md:py-28 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0F001A] to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#00E0FF] via-[#C084FC] to-[#A78BFA] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(0, 224, 255, 0.3))' }}>
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-semibold max-w-3xl mx-auto">
            Three steps. From conviction to credibility. Your track record, verifiable forever.
          </p>
        </div>

        {/* Three Horizontal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Box 1: Lock Your Claim - REFINED */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#00E0FF]/50 rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,224,255,0.25)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00E0FF]/25 to-[#C084FC]/25 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                <svg className="w-8 h-8 text-[#00E0FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Make Your Call</h3>
              <p className="text-sm text-cyan-400 font-semibold">Before anyone knows</p>
            </div>

            <p className="text-base md:text-lg text-white/75 leading-relaxed mb-6 text-center">
              Timestamp your claim on-chain. No signup. Just conviction. Add your research as evidence for bonus credibility.
            </p>

            {/* Animation: Clock + Lock */}
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              <span className="text-sm">~10 seconds</span>
            </div>
          </div>

          {/* Box 2: Prove You Were Right - NEW EMPHASIS */}
          <div className="bg-gradient-to-br from-emerald-600/10 via-green-600/8 to-emerald-700/10 border-2 border-emerald-500/40 hover:border-emerald-400/60 rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:-translate-y-1 relative overflow-hidden">
            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Prove You Were Right</h3>
                <p className="text-sm text-emerald-400 font-semibold">When the world catches up</p>
              </div>

              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-4 text-center">
                Mark it correct, incorrect, or contested. Link OSINT signals as verification. Your reputation updates instantly—streaks, points, and rank all locked on-chain.
              </p>

              {/* NEW: Resolution = Reputation callout */}
              <div className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
                <p className="text-sm text-emerald-300 font-bold">
                  Resolution = Reputation. This is where credibility is minted.
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Build - COMPLETELY NEW FOCUS */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#C084FC]/50 rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(167,139,250,0.3)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C084FC]/25 to-[#00E0FF]/25 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                <svg className="w-8 h-8 text-[#C084FC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Compound Your Credibility</h3>
              <p className="text-sm text-purple-400 font-semibold">Every resolution makes the next one count more</p>
            </div>

            <p className="text-base md:text-lg text-white/75 leading-relaxed mb-6 text-center">
              Streaks multiply your score. Category mastery unlocks badges. Top ranks get visibility. Your track record becomes your unfair advantage.
            </p>

            {/* Stat box: compounding example */}
            <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">5-streak on high-risk:</span>
                <span className="text-purple-400 font-bold">170 pts per prediction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom visual: Graph teaser */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-12 mb-4">
              <div>
                <div className="text-3xl font-bold text-amber-400 mb-1">0</div>
                <div className="text-xs text-slate-500">Start</div>
              </div>
              <svg className="w-24 h-12 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 50">
                <path d="M 10 45 Q 30 40 50 20 T 90 5" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">892</div>
                <div className="text-xs text-slate-500">After 27 resolves</div>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Your reputation grows exponentially with consistency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
