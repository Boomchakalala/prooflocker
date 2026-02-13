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

        {/* The Compounding Formula */}
        <div className="mb-16 md:mb-20">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-slate-700/50 rounded-2xl p-6 md:p-10 max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">The Compounding Formula</h3>
              <p className="text-sm md:text-base text-white/60">Your reputation score is calculated from three weighted factors:</p>
            </div>

            {/* Three Factor Cards */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-10">
              {/* Accuracy */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 md:p-6 text-center hover:bg-purple-500/15 transition-colors">
                <div className="text-4xl md:text-5xl font-black text-purple-400 mb-3">50%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Accuracy</div>
                <p className="text-xs md:text-sm text-white/60">Correct vs total claims</p>
              </div>

              {/* Evidence Quality */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 md:p-6 text-center hover:bg-cyan-500/15 transition-colors">
                <div className="text-4xl md:text-5xl font-black text-cyan-400 mb-3">30%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Evidence</div>
                <p className="text-xs md:text-sm text-white/60">Quality of proof (A-F)</p>
              </div>

              {/* Activity */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 md:p-6 text-center hover:bg-emerald-500/15 transition-colors">
                <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-3">20%</div>
                <div className="text-sm md:text-base font-bold text-white mb-2">Activity</div>
                <p className="text-xs md:text-sm text-white/60">Volume of resolutions</p>
              </div>
            </div>

            {/* How Reputation Grows */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-base md:text-lg font-semibold text-white mb-2">Be Accurate</div>
                    <p className="text-sm text-white/70">Your correct-to-total ratio determines 50% of your reputation. The more accurate you are, the higher you score.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-base md:text-lg font-semibold text-white mb-2">Provide Strong Evidence</div>
                    <p className="text-sm text-white/70">Grade A evidence (official docs, verified sources) maximizes your score. Even incorrect claims with good evidence maintain credibility.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-base md:text-lg font-semibold text-white mb-2">Stay Active</div>
                    <p className="text-sm text-white/70">Resolve more claims to increase your activity score. Each resolved claim adds 4 points, maxing at 200 points (50 resolutions).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Tiers */}
        <div className="mb-16 md:mb-20">
          <div className="text-center mb-8 md:mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Reputation Tiers</h3>
            <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto">Your reputation score determines your tier. Higher tiers unlock greater visibility and credibility.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="space-y-3">
              {/* Novice */}
              <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-slate-600/40 rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-slate-500/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-slate-400">N</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-slate-300">Novice</div>
                    <div className="text-xs md:text-sm text-slate-500">Starting your journey</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-slate-400">0-299</div>
                  <div className="text-xs text-slate-600">points</div>
                </div>
              </div>

              {/* Trusted */}
              <div className="bg-gradient-to-r from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-cyan-400">T</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-cyan-300">Trusted</div>
                    <div className="text-xs md:text-sm text-cyan-500/70">Building credibility</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-cyan-400">300-499</div>
                  <div className="text-xs text-cyan-600">points</div>
                </div>
              </div>

              {/* Expert */}
              <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-blue-400">E</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-blue-300">Expert</div>
                    <div className="text-xs md:text-sm text-blue-500/70">Proven track record</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-blue-400">500-649</div>
                  <div className="text-xs text-blue-600">points</div>
                </div>
              </div>

              {/* Master */}
              <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-purple-400">M</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-purple-300">Master</div>
                    <div className="text-xs md:text-sm text-purple-500/70">Elite accuracy</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-purple-400">650-799</div>
                  <div className="text-xs text-purple-600">points</div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gradient-to-r from-amber-900/40 to-orange-800/20 border border-amber-500/40 rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-amber-500/60 transition-colors shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-amber-600/40 to-orange-600/40 border border-amber-500/50 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-amber-400">L</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-amber-300">Legend</div>
                    <div className="text-xs md:text-sm text-amber-500/70">Exceptional reputation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-amber-400">800-1000</div>
                  <div className="text-xs text-amber-600">points</div>
                </div>
              </div>
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
