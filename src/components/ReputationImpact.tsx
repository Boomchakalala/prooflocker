"use client";

import Link from "next/link";

export default function ReputationImpact() {
  return (
    <div className="relative z-10 py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-[#0a0a0a] via-[#1a0033] to-[#0a0a0a]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
        <div
          className="w-[600px] h-[600px] md:w-[1000px] md:h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(91, 33, 182, 0.2) 0%, rgba(46, 92, 255, 0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-5 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Your Reputation Compounds
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto px-4">
            Every correct claim makes the next one worth more. Math-backed credibility that grows exponentially.
          </p>
        </div>

        {/* How Reputation Grows - Visual Flow */}
        <div className="mb-12 md:mb-16">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-slate-700/50 rounded-2xl p-6 md:p-10 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">The Compounding Formula</h3>
              <p className="text-sm md:text-base text-white/60">Your reputation score is calculated from three weighted factors:</p>
            </div>

            {/* Three Factor Cards */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Accuracy */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 text-center">
                <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">50%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Accuracy</div>
                <p className="text-xs text-white/60">Correct vs total claims</p>
              </div>

              {/* Evidence Quality */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 text-center">
                <div className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">30%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Evidence</div>
                <p className="text-xs text-white/60">Quality of proof (A-F)</p>
              </div>

              {/* Activity */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
                <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">20%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Activity</div>
                <p className="text-xs text-white/60">Volume + streaks</p>
              </div>
            </div>

            {/* Multipliers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-5 py-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
                  </svg>
                  <span className="text-sm md:text-base font-semibold text-white">Active Streak</span>
                </div>
                <span className="text-xs md:text-sm text-orange-300 font-medium">Up to 2× multiplier</span>
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span className="text-sm md:text-base font-semibold text-white">High-Risk Categories</span>
                </div>
                <span className="text-xs md:text-sm text-red-300 font-medium">+50% bonus points</span>
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span className="text-sm md:text-base font-semibold text-white">Grade A Evidence</span>
                </div>
                <span className="text-xs md:text-sm text-blue-300 font-medium">Maximum points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Progression */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Rise Through the Ranks</h3>
            <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto">Five reputation tiers. Each unlocks higher credibility and visibility.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto">
            {/* Novice */}
            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-sm font-bold text-slate-300 mb-1">Novice</div>
              <div className="text-xs text-slate-500">0-100 pts</div>
            </div>

            {/* Trusted */}
            <div className="bg-slate-800/60 border border-cyan-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-bold text-cyan-400 mb-1">Trusted</div>
              <div className="text-xs text-slate-500">101-500 pts</div>
            </div>

            {/* Expert */}
            <div className="bg-slate-800/60 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-bold text-blue-400 mb-1">Expert</div>
              <div className="text-xs text-slate-500">501-2000 pts</div>
            </div>

            {/* Master */}
            <div className="bg-slate-800/60 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">👑</div>
              <div className="text-sm font-bold text-purple-400 mb-1">Master</div>
              <div className="text-xs text-slate-500">2001-5000 pts</div>
            </div>

            {/* Legend */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-bold text-amber-400 mb-1">Legend</div>
              <div className="text-xs text-slate-500">5000+ pts</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-sm md:text-base text-white/60 mb-6 px-4">
            Start building verifiable credibility. One claim at a time.
          </p>
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-base md:text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Lock Your First Claim
          </Link>
        </div>
      </div>
    </div>
  );
}
