export default function ReputationImpact() {
  return (
    <div className="relative z-10 py-20 md:py-28 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#1a0033] to-[#0a0a0a]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
        <div
          className="w-[1000px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(91, 33, 182, 0.2) 0%, rgba(46, 92, 255, 0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Reputation Opens Doors
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Your track record isn't just a number—it's your unfair advantage
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {/* Column 1: Professional Credibility */}
          <div className="bg-gradient-to-br from-blue-600/5 via-blue-500/5 to-blue-700/5 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(46,92,255,0.2)] hover:-translate-y-1">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Your Track Record, Quantified
            </h3>

            {/* Body */}
            <p className="text-base text-white/70 leading-relaxed mb-6">
              Share your accuracy rate with clients, investors, or employers. &ldquo;I called 23/27 market moves&rdquo; hits different when it's cryptographically proven.
            </p>

            {/* Visual: Screenshot mockup */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                  #12
                </div>
                <div>
                  <div className="text-sm text-white font-semibold">Accuracy: 85%</div>
                  <div className="text-xs text-slate-400">23/27 correct</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">Proof: proof.locker/xZ9k2...</div>
            </div>

            {/* Quote */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-500/5 border-l-2 border-blue-500/50 rounded">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div>
                <p className="text-sm text-white/80 italic mb-1">
                  &ldquo;My ProofLocker history closed a consulting deal&rdquo;
                </p>
                <p className="text-xs text-slate-500">— Verified Predictor</p>
              </div>
            </div>
          </div>

          {/* Column 2: Community Trust */}
          <div className="bg-gradient-to-br from-purple-600/5 via-purple-500/5 to-purple-700/5 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:-translate-y-1">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Earn Trust, Don't Beg For It
            </h3>

            {/* Body */}
            <p className="text-base text-white/70 leading-relaxed mb-6">
              Top-ranked predictors become trusted sources. Others cite your claims as evidence. Your reputation compounds with every resolution.
            </p>

            {/* Visual: Leaderboard snippet */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-white font-semibold text-sm">Anon #2834</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-purple-400 text-sm font-bold">892</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">47</span>
                    </div>
                    <span className="text-slate-400 text-sm">You</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-emerald-400 text-sm font-bold">+35</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat */}
            <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <p className="text-sm text-purple-300 font-semibold">
                Top 50 predictors get <span className="text-white font-bold">10x more</span> upvotes
              </p>
            </div>
          </div>

          {/* Column 3: Personal Mastery */}
          <div className="bg-gradient-to-br from-cyan-600/5 via-cyan-500/5 to-cyan-700/5 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,224,255,0.2)] hover:-translate-y-1">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Compete Against Your Best Self
            </h3>

            {/* Body */}
            <p className="text-base text-white/70 leading-relaxed mb-6">
              Track your accuracy across categories. See where you excel. Build expertise one claim at a time. Streaks, badges, and tier progression make growth visible.
            </p>

            {/* Visual: Badge grid */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
                  <span className="text-lg">🏆</span>
                  <span className="text-[9px] text-emerald-400 font-semibold">Master</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                  <span className="text-lg">🔥</span>
                  <span className="text-[9px] text-orange-400 font-semibold">5-Streak</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                  <span className="text-lg">💎</span>
                  <span className="text-[9px] text-blue-400 font-semibold">Crypto</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-purple-500/10 border border-purple-500/30 rounded">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] text-purple-400 font-semibold">Early</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-slate-700/30 border border-slate-600/30 rounded">
                  <span className="text-lg opacity-30">🎯</span>
                  <span className="text-[9px] text-slate-500">Locked</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-slate-700/30 border border-slate-600/30 rounded">
                  <span className="text-lg opacity-30">⭐</span>
                  <span className="text-[9px] text-slate-500">Locked</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/dashboard"
              className="block w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 text-center font-semibold rounded-lg transition-all"
            >
              Start your streak
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
