import Link from "next/link";

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
            Three steps. Conviction to reputation.
          </p>
        </div>

        {/* Flywheel visual */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 md:mb-12 text-sm md:text-base font-bold text-white/60">
          <span className="text-cyan-400">Stream</span>
          <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span className="text-emerald-400">Claim</span>
          <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-400">Proof</span>
          <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span className="text-purple-400">Reputation</span>
        </div>

        {/* Three Horizontal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
          {/* Box 1: Monitor */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-slate-700/50 hover:border-[#00E0FF]/50 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,224,255,0.25)] hover:-translate-y-1">
            {/* Step number */}
            <div className="flex items-center justify-center mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500/15 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <span className="text-cyan-400 font-black text-lg md:text-xl">1</span>
              </div>
            </div>

            <div className="text-center mb-3 md:mb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">See Something</h3>
              <p className="text-xs md:text-sm text-cyan-400 font-semibold">Browse the live intel feed</p>
            </div>

            <p className="text-sm md:text-base lg:text-lg text-white/75 leading-relaxed mb-4 md:mb-6 text-center">
              Our globe and feed show breaking intelligence and news events in real time. Spot a pattern or trend before anyone else does.
            </p>

            <div className="px-3 md:px-4 py-2 md:py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
              <p className="text-xs md:text-sm text-cyan-300/80">
                Think of it like a live newsroom — always updating.
              </p>
            </div>
          </div>

          {/* Box 2: Lock It */}
          <div className="bg-gradient-to-br from-emerald-600/10 via-green-600/8 to-emerald-700/10 border border-slate-700/50 hover:border-emerald-400/60 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4 md:mb-5">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-black text-lg md:text-xl">2</span>
                </div>
              </div>

              <div className="text-center mb-3 md:mb-4">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">Lock Your Claim</h3>
                <p className="text-xs md:text-sm text-emerald-400 font-semibold">Timestamp it on-chain forever</p>
              </div>

              <p className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed mb-3 md:mb-4 text-center">
                Write what you think will happen. It gets hashed and locked on-chain with a timestamp. No edits. No deletions. It&apos;s permanent.
              </p>

              <div className="px-3 md:px-4 py-2 md:py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
                <p className="text-xs md:text-sm text-emerald-300 font-bold">
                  Like putting a letter in a vault nobody can open.
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Prove It */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-slate-700/50 hover:border-[#C084FC]/50 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(167,139,250,0.3)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/15 border border-purple-500/30 rounded-full flex items-center justify-center">
                <span className="text-purple-400 font-black text-lg md:text-xl">3</span>
              </div>
            </div>

            <div className="text-center mb-3 md:mb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">Prove It Later</h3>
              <p className="text-xs md:text-sm text-purple-400 font-semibold">Submit evidence, earn reputation</p>
            </div>

            <p className="text-sm md:text-base lg:text-lg text-white/75 leading-relaxed mb-4 md:mb-6 text-center">
              When the outcome is clear, come back and attach receipts — news articles, screenshots, links. Better evidence = higher reputation score.
            </p>

            <div className="px-3 md:px-4 py-2 md:py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-400">Correct + Grade A evidence:</span>
                <span className="text-purple-400 font-bold">+170 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom clarification */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto">
            That&apos;s it. Your accuracy and evidence quality determine your reputation score over time. The more you prove, the more credible you become.
          </p>
        </div>
      </div>
    </div>
  );
}
