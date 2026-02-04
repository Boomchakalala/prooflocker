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
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            How Scoring Works
          </h1>
          <p className="text-neutral-400">
            Three metrics track your prediction quality and contribution
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Evidence Score</div>
            <div className="text-3xl font-bold text-white mb-2">0-100</div>
            <p className="text-sm text-neutral-400">Quality of proof when resolving</p>
          </div>

          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Reliability Score</div>
            <div className="text-3xl font-bold text-white mb-2">0-1000</div>
            <p className="text-sm text-neutral-400">Your reputation as a forecaster</p>
          </div>

          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Total Points</div>
            <div className="text-3xl font-bold text-white mb-2">Lifetime</div>
            <p className="text-sm text-neutral-400">Cumulative, never decrease</p>
          </div>
        </div>

        {/* Evidence Scoring System */}
        <section className="mb-12">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Evidence Scoring (0-100)</h2>

            <p className="text-neutral-300 mb-6">
              When you resolve a prediction, we automatically calculate an evidence quality score based on the proof you provide.
            </p>

            {/* Evidence Tiers */}
            <div className="space-y-3 mb-8">
              {Object.entries(EVIDENCE_TIERS).reverse().map(([key, tier]) => (
                <div key={key} className={`p-4 rounded-lg border ${tier.bgColor} ${tier.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
                    <span className="text-sm text-neutral-500">{tier.range}</span>
                  </div>
                  <p className="text-sm text-neutral-400">{tier.description}</p>
                </div>
              ))}
            </div>

            {/* How It's Calculated */}
            <div className="bg-black/40 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                How It's Calculated
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-white font-medium mb-1">Number of Evidence Items</div>
                  <div className="text-neutral-400">1st item: +30pts, 2nd: +20pts, 3rd: +15pts, 4+: +5pts each</div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">Evidence Type</div>
                  <div className="text-neutral-400">Screenshots: +5pts, Files/PDFs: +8pts</div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">Source Quality</div>
                  <div className="text-neutral-400">Reputable domains (NYT, Bloomberg): +10pts, Social media: +5pts</div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">Evidence Summary</div>
                  <div className="text-neutral-400">50+ character explanation: +10pts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reliability Score System */}
        <section className="mb-12">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reliability Score (0-1000)</h2>

            <p className="text-neutral-300 mb-6">
              Your reputation as a forecaster. Recalculates based on accuracy, evidence quality, and prediction volume.
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
                      <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
                      <span className="text-sm text-neutral-500">{tier.min}-{maxScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How It's Calculated */}
            <div className="bg-black/40 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                How It's Calculated
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Accuracy</span>
                    <span className="text-neutral-400 text-sm">40% (0-400 pts)</span>
                  </div>
                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600 w-[40%]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Evidence Quality</span>
                    <span className="text-neutral-400 text-sm">30% (0-300 pts)</span>
                  </div>
                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600 w-[30%]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Volume</span>
                    <span className="text-neutral-400 text-sm">20% (0-200 pts)</span>
                  </div>
                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600 w-[20%]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Consistency Bonus</span>
                    <span className="text-neutral-400 text-sm">10% (0-100 pts)</span>
                  </div>
                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600 w-[10%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Points System */}
        <section className="mb-12">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Total Points System</h2>

            <p className="text-neutral-300 mb-6">
              Lifetime cumulative earnings. Points <strong className="text-white">never decrease</strong> and represent your total contribution.
            </p>

            {/* Earn Points */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">How to Earn Points</h3>

              {/* Lock Prediction */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold mb-1">Lock a Prediction</div>
                    <div className="text-sm text-neutral-400">Claim a prediction publicly</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">+{POINTS_CONFIG.LOCK_BASE}</div>
                    <div className="text-xs text-neutral-500">points</div>
                  </div>
                </div>
                <div className="text-sm text-neutral-400">
                  +{POINTS_CONFIG.LOCK_EARLY_BONUS} bonus if resolution date is &gt;30 days away
                </div>
              </div>

              {/* Resolve Correct */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold mb-1">Resolve Correct</div>
                    <div className="text-sm text-neutral-400">Prove your prediction was right</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">25-75</div>
                    <div className="text-xs text-neutral-500">points</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-neutral-400">
                  <div>Base {POINTS_CONFIG.RESOLVE_CORRECT_BASE} points × evidence multiplier (0.5x-1.5x)</div>
                  <div>+{POINTS_CONFIG.RESOLVE_ONCHAIN_BONUS} bonus for on-chain verification</div>
                </div>
              </div>

              {/* Resolve Incorrect */}
              <div className="bg-black/40 rounded-lg p-5 border border-neutral-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold mb-1">Resolve Incorrect</div>
                    <div className="text-sm text-neutral-400">Accept you were wrong</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{POINTS_CONFIG.RESOLVE_INCORRECT_PENALTY}</div>
                    <div className="text-xs text-neutral-500">penalty</div>
                  </div>
                </div>
                <div className="text-sm text-neutral-500">
                  Total Points can never go below 0
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="mt-8 bg-black/40 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Example
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
                  <span className="text-2xl font-bold text-white">100 points</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="mb-12">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why This Matters</h2>
            <div className="space-y-3 text-neutral-300">
              <div className="flex items-start gap-3">
                <div className="text-neutral-500 mt-1">•</div>
                <div>
                  <strong className="text-white">Transparent Reputation:</strong> Your Reliability Score shows others how accurate and rigorous you are
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-neutral-500 mt-1">•</div>
                <div>
                  <strong className="text-white">Quality Incentivized:</strong> Better evidence and accuracy directly earn you more points
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-neutral-500 mt-1">•</div>
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
            className="inline-block px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold rounded-lg transition-all"
          >
            Lock Your First Prediction
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            Start earning points and building your reputation
          </p>
        </div>
      </div>
    </div>
  );
}
