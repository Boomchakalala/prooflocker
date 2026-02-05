'use client';

import Link from 'next/link';
import { TierBadge } from '@/components/scoring/SimplifiedUX';

export default function HowScoringWorksPage() {
  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/app"
          className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to App
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How Scoring Works
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            ProofLocker rewards quality predictions with reputation scores and lifetime points
          </p>
        </div>

        {/* Tier Badges Preview */}
        <div className="glass border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Reputation Tiers</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <TierBadge reliabilityScore={950} size="lg" />
            <TierBadge reliabilityScore={720} size="lg" />
            <TierBadge reliabilityScore={580} size="lg" />
            <TierBadge reliabilityScore={350} size="lg" />
            <TierBadge reliabilityScore={150} size="lg" />
          </div>
          <p className="text-center text-neutral-400 text-sm">
            Your tier badge shows next to all your predictions
          </p>
        </div>

        {/* Main Scoring Components */}
        <div className="space-y-6 mb-12">
          {/* 1. Reliability Score */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💎</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Reliability Score (0-1000)
                </h3>
                <p className="text-neutral-400 mb-4">
                  Your reputation score based on accuracy, evidence quality, and activity
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-300">🎯 Accuracy (50%)</span>
                      <span className="text-neutral-500">Win rate × 500 pts</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Get predictions right to boost your score
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-300">📋 Evidence Quality (30%)</span>
                      <span className="text-neutral-500">Avg evidence × 300 pts</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Strong evidence increases credibility
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-300">📈 Activity (20%)</span>
                      <span className="text-neutral-500">Up to 200 pts</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Resolve more predictions to show consistency
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Total Points */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Total Points (Lifetime)
                </h3>
                <p className="text-neutral-400 mb-4">
                  Cumulative points from all activities (never decreases)
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">Lock prediction</span>
                    <span className="text-green-400 font-semibold">+10 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">Resolve correct</span>
                    <span className="text-green-400 font-semibold">+80-150 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">High-risk category bonus</span>
                    <span className="text-blue-400 font-semibold">+40 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">Streak bonus</span>
                    <span className="text-purple-400 font-semibold">+10 pts/streak</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">Resolve incorrect</span>
                    <span className="text-red-400 font-semibold">-15 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Evidence Score */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Evidence Score (0-100)
                </h3>
                <p className="text-neutral-400 mb-4">
                  Quality of proof when resolving predictions
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-green-400 font-semibold mb-1">🔍 Strong (76-100)</div>
                    <div className="text-xs text-neutral-500">Multiple reputable sources + screenshots</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold mb-1">📋 Solid (51-75)</div>
                    <div className="text-xs text-neutral-500">Good sources or multiple items</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-yellow-400 font-semibold mb-1">📝 Basic (26-50)</div>
                    <div className="text-xs text-neutral-500">Some evidence but limited</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-orange-400 font-semibold mb-1">❓ Unverified (0-25)</div>
                    <div className="text-xs text-neutral-500">Minimal or no evidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="bg-gradient-to-r from-[#2E5CFF]/10 to-[#5B21B6]/10 border border-[#2E5CFF]/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Example Calculation</h2>
          <div className="space-y-4 text-neutral-300">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-2">User Profile:</div>
              <div className="space-y-1 text-sm">
                <div>• 15 predictions resolved</div>
                <div>• 12 correct (80% accuracy)</div>
                <div>• Average evidence score: 72/100</div>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-2">Reliability Score Breakdown:</div>
              <div className="space-y-1 text-sm">
                <div>🎯 Accuracy: 80% × 500 = <span className="text-blue-400 font-semibold">400 pts</span></div>
                <div>📋 Evidence: 72/100 × 300 = <span className="text-blue-400 font-semibold">216 pts</span></div>
                <div>📈 Activity: 15 resolved = <span className="text-blue-400 font-semibold">150 pts</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total Reliability:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-400">766</span>
                    <TierBadge reliabilityScore={766} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="glass border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">💡 Tips to Boost Your Score</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-semibold text-blue-400 mb-2">
                Be Accurate
              </div>
              <div className="text-sm text-neutral-400">
                Quality over quantity. One correct prediction is worth more than many incorrect ones.
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-semibold text-green-400 mb-2">
                Add Strong Evidence
              </div>
              <div className="text-sm text-neutral-400">
                Include screenshots, reputable sources, and explanations when resolving.
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-semibold text-purple-400 mb-2">
                Build Streaks
              </div>
              <div className="text-sm text-neutral-400">
                Multiple correct predictions in a row earn bonus points.
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-semibold text-orange-400 mb-2">
                Stay Active
              </div>
              <div className="text-sm text-neutral-400">
                Consistent activity shows you're a reliable forecaster.
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Lock Your First Prediction
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
