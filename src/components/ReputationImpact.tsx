"use client";

import Link from "next/link";

export default function ReputationImpact() {
  return (
    <div className="relative z-10 py-12 md:py-20 lg:py-28 px-4 md:px-6 bg-gradient-to-b from-[#0a0a0a] via-[#1a0033] to-[#0a0a0a]">
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
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Your Reputation Compounds
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto px-2">
            Every correct resolution makes the next one count more. Streaks, evidence quality, and consistency — your track record is the product.
          </p>
        </div>

        {/* 3 Benefits - Clean Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* 1. Prove Your Track Record */}
          <div className="group bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Cryptographic Proof
              </h3>
            </div>

            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-4 md:mb-5">
              Every claim is hashed and timestamped on Constellation DAG. Nobody can fake when you called it — the math proves it.
            </p>

            <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="text-[10px] text-purple-400/60 uppercase tracking-wider mb-2 font-semibold">On-Chain Proof</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Every prediction is cryptographically signed with a timestamp. Your track record is immutable and publicly verifiable on the blockchain.
              </div>
            </div>
          </div>

          {/* 2. Climb the Ranks */}
          <div className="group bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl md:rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Reputation Tiers
              </h3>
            </div>

            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-4 md:mb-5">
              Novice → Trusted → Expert → Master → Legend. Each tier reflects your accuracy, evidence quality, and volume of resolved claims.
            </p>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <span className="text-xs md:text-sm text-slate-400">Tier System</span>
                <span className="text-sm md:text-base font-bold text-cyan-400">5 Levels</span>
              </div>
              <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-xs md:text-sm text-slate-300">Streaks multiply points. Consistency compounds reputation.</p>
              </div>
            </div>
          </div>

          {/* 3. Compound Growth */}
          <div className="group bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl md:rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Compounding Returns
              </h3>
            </div>

            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-4 md:mb-5">
              Streaks multiply your points. High-risk categories earn bonuses. Grade A evidence amplifies everything. Your reputation grows exponentially.
            </p>

            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="text-[10px] text-emerald-400/60 uppercase tracking-wider mb-2 font-semibold">Growth Formula</div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Accuracy</span>
                  <span className="text-emerald-400 font-semibold">50% weight</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Evidence Quality</span>
                  <span className="text-emerald-400 font-semibold">30% weight</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Activity</span>
                  <span className="text-emerald-400 font-semibold">20% weight</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 md:mt-16">
          <p className="text-sm md:text-base text-white/60 mb-4 md:mb-6 px-2">
            Every claim compounds. Start building your reputation.
          </p>
          <Link
            href="/lock"
            className="inline-block px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-base md:text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-105"
          >
            Start Building Your Reputation
          </Link>
        </div>
      </div>
    </div>
  );
}
