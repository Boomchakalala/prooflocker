"use client";

import Link from "next/link";
import {
  POINTS_CONFIG,
  RELIABILITY_TIERS,
  type ReliabilityTier,
} from "@/lib/user-scoring";
import { EVIDENCE_TIERS } from "@/lib/evidence-scoring";

export default function ScoringPage() {
  const tierOrder: ReliabilityTier[] = ['legend', 'master', 'expert', 'trusted', 'novice'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            How Scoring Works
          </h1>
          <p className="text-lg text-neutral-400">
            Understanding ProofLocker's three-tier scoring system
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {/* Evidence Score */}
          <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Evidence Score</h3>
            <p className="text-sm text-neutral-400 mb-3">Auto-calculated quality of proof provided</p>
            <div className="text-3xl font-bold text-green-400">0-100</div>
          </div>

          {/* Reliability Score */}
          <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reliability Score</h3>
            <p className="text-sm text-neutral-400 mb-3">Your reputation as a forecaster</p>
            <div className="text-3xl font-bold text-purple-400">0-1000</div>
          </div>

          {/* Total Points */}
          <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Total Points</h3>
            <p className="text-sm text-neutral-400 mb-3">Lifetime earnings, never decrease</p>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Unlimited
            </div>
          </div>
        </div>

        {/* Evidence Scoring System */}
        <section className="mb-16">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Evidence Scoring (0-100)</h2>
            </div>

            <p className="text-neutral-300 mb-6">
              When you resolve a prediction, we automatically calculate an evidence quality score based on the proof you provide. Higher scores mean stronger evidence.
            </p>

            {/* Evidence Tiers */}
            <div className="space-y-3 mb-8">
              {Object.entries(EVIDENCE_TIERS).reverse().map(([key, tier]) => (
                <div key={key} className={`p-4 rounded-lg border ${tier.bgColor} ${tier.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
                    <span className="text-sm text-neutral-400">{tier.range}</span>
                  </div>
                  <p className="text-sm text-neutral-400">{tier.description}</p>
                </div>
              ))}
            </div>

            {/* How It's Calculated */}
            <div className="bg-black/40 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                How Evidence Score Is Calculated
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">Number of Evidence Items</div>
                    <div className="text-neutral-400">1st item: +30pts, 2nd: +20pts, 3rd: +15pts, 4+: +5pts each (diminishing returns)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-bold">2</span>
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">Evidence Type</div>
                    <div className="text-neutral-400">Screenshots: +5pts bonus, Files/PDFs: +8pts bonus</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">Source Quality</div>
                    <div className="text-neutral-400">Reputable domains (NYT, Bloomberg, etc): +10pts, Social media: +5pts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">Evidence Summary</div>
                    <div className="text-neutral-400">Providing a 50+ character explanation: +10pts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reliability Score System */}
        <section className="mb-16">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Reliability Score (0-1000)</h2>
            </div>

            <p className="text-neutral-300 mb-6">
              Your overall reputation as a forecaster. This score recalculates based on your accuracy, evidence quality, and prediction volume. It represents your current standing.
            </p>

            {/* Reliability Tiers */}
            <div className="space-y-3 mb-8">
              {tierOrder.map((tierKey) => {
                const tier = RELIABILITY_TIERS[tierKey];
                const nextTier = tierOrder[tierOrder.indexOf(tierKey) - 1];
                const maxScore = nextTier ? RELIABILITY_TIERS[nextTier].min - 1 : 1000;

                return (
                  <div key={tierKey} className={`p-4 rounded-lg border ${tier.bgColor} border-current`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {tier.min}-{maxScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How It's Calculated */}
            <div className="bg-black/40 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                How Reliability Score Is Calculated
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Accuracy</span>
                    <span className="text-purple-400 font-semibold">40% (0-400 pts)</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[40%]" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Win rate × 400 points</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Evidence Quality</span>
                    <span className="text-purple-400 font-semibold">30% (0-300 pts)</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[30%]" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Average evidence score × 3</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Volume</span>
                    <span className="text-purple-400 font-semibold">20% (0-200 pts)</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[20%]" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Number of resolved predictions (diminishing returns)</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Consistency Bonus</span>
                    <span className="text-purple-400 font-semibold">10% (0-100 pts)</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[10%]" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Bonus for maintaining high accuracy + evidence quality</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Points System */}
        <section className="mb-16">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Total Points System</h2>
            </div>

            <p className="text-neutral-300 mb-6">
              Your lifetime cumulative earnings. Points <strong className="text-yellow-400">never decrease</strong> and represent your total contribution to the platform. Perfect for future airdrops and rewards.
            </p>

            {/* Earn Points */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-white">How to Earn Points</h3>

              {/* Lock Prediction */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Lock a Prediction</div>
                      <div className="text-sm text-neutral-400">Claim a prediction publicly</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">+{POINTS_CONFIG.LOCK_BASE}</div>
                    <div className="text-xs text-neutral-500">base points</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-neutral-300">
                    <span className="text-yellow-400 font-semibold">+{POINTS_CONFIG.LOCK_EARLY_BONUS}</span> bonus if resolution date is &gt;30 days away
                  </span>
                </div>
              </div>

              {/* Resolve Correct */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Resolve Correct</div>
                      <div className="text-sm text-neutral-400">Prove your prediction was right</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">25-75</div>
                    <div className="text-xs text-neutral-500">points</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-neutral-300">
                      Base <span className="text-green-400 font-semibold">{POINTS_CONFIG.RESOLVE_CORRECT_BASE}</span> points × evidence multiplier (0.5x-1.5x)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-neutral-300">
                      <span className="text-green-400 font-semibold">+{POINTS_CONFIG.RESOLVE_ONCHAIN_BONUS}</span> bonus for on-chain verification
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolve Incorrect */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Resolve Incorrect</div>
                      <div className="text-sm text-neutral-400">Accept you were wrong</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">{POINTS_CONFIG.RESOLVE_INCORRECT_PENALTY}</div>
                    <div className="text-xs text-neutral-500">penalty</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-neutral-400">
                    Don't worry — Total Points can never go below 0
                  </span>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-4">
                Example Calculation
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-neutral-300">Lock prediction (early)</span>
                  <span className="text-white font-semibold">+15 points</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-neutral-300">Resolve correct (evidence score: 80)</span>
                  <span className="text-white font-semibold">+65 points</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-neutral-300">On-chain verification bonus</span>
                  <span className="text-white font-semibold">+20 points</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-white">Total Earned</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    100 points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why This Matters</h2>
            <div className="space-y-4 text-neutral-300">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Transparent Reputation:</strong> Your Reliability Score shows others how accurate and rigorous you are
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Quality Incentivized:</strong> Better evidence and accuracy directly earn you more points
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Future Rewards:</strong> Total Points may unlock airdrops, exclusive features, or other benefits
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="text-white">Hard to Game:</strong> Diminishing returns and multi-factor scoring prevent exploitation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock Your First Prediction
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            Start earning points and building your reputation today
          </p>
        </div>
      </div>
    </div>
  );
}
