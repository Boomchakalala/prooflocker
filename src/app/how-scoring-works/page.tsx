'use client';

import Link from 'next/link';

export default function HowScoringWorksPage() {
  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
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

        {/* Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How Scoring Works
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            ProofLocker rewards quality predictions with reputation scores and lifetime points
          </p>
        </div>

        {/* Main Scoring Components - Simplified */}
        <div className="space-y-6 mb-8">
          {/* 1. Reliability Score */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Reliability Score (0-1000)
            </h3>
            <p className="text-neutral-400 mb-6">
              Your reputation based on accuracy, evidence quality, and activity
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">🎯 Accuracy (50%)</span>
                <span className="text-neutral-500 text-sm">Win rate × 500 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">📋 Evidence Quality (30%)</span>
                <span className="text-neutral-500 text-sm">Avg evidence × 300 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">📈 Activity (20%)</span>
                <span className="text-neutral-500 text-sm">Up to 200 pts</span>
              </div>
            </div>
          </div>

          {/* 2. Total Points */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Total Points (Lifetime)
            </h3>
            <p className="text-neutral-400 mb-6">
              Cumulative points from all activities
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Lock prediction</span>
                <span className="text-green-400 font-semibold">+10 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Resolve correct</span>
                <span className="text-green-400 font-semibold">+80-150 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">High-risk bonus</span>
                <span className="text-blue-400 font-semibold">+40 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Streak bonus</span>
                <span className="text-purple-400 font-semibold">+10 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Resolve incorrect</span>
                <span className="text-red-400 font-semibold">-15 pts</span>
              </div>
            </div>
          </div>

          {/* 3. Evidence Score */}
          <div className="glass border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Evidence Score (0-100)
            </h3>
            <p className="text-neutral-400 mb-6">
              Quality of proof when resolving predictions
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-medium">Strong (76-100)</span>
                <span className="text-neutral-500 text-sm">Multiple sources + screenshots</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-medium">Solid (51-75)</span>
                <span className="text-neutral-500 text-sm">Good sources or multiple items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-medium">Basic (26-50)</span>
                <span className="text-neutral-500 text-sm">Some evidence but limited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-400 font-medium">Unverified (0-25)</span>
                <span className="text-neutral-500 text-sm">Minimal or no evidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Example - Simplified */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Example</h3>
          <div className="space-y-3 text-neutral-300">
            <p className="text-sm">15 predictions resolved • 12 correct (80%) • Avg evidence: 72/100</p>
            <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
              <div>🎯 Accuracy: 80% × 500 = <span className="text-blue-400 font-semibold">400 pts</span></div>
              <div>📋 Evidence: 72/100 × 300 = <span className="text-blue-400 font-semibold">216 pts</span></div>
              <div>📈 Activity: 15 resolved = <span className="text-blue-400 font-semibold">150 pts</span></div>
              <div className="pt-2 mt-2 border-t border-white/10">
                <span className="text-white font-bold">Total Reliability: <span className="text-2xl text-blue-400">766</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips - Simplified List */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Tips to Boost Your Score</h3>
          <div className="space-y-3 text-neutral-300">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <div>
                <span className="text-white font-medium">Be Accurate</span>
                <span className="text-neutral-400 text-sm ml-2">Quality over quantity</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">2.</span>
              <div>
                <span className="text-white font-medium">Add Strong Evidence</span>
                <span className="text-neutral-400 text-sm ml-2">Screenshots and reputable sources</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <div>
                <span className="text-white font-medium">Build Streaks</span>
                <span className="text-neutral-400 text-sm ml-2">Multiple correct predictions earn bonuses</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold">4.</span>
              <div>
                <span className="text-white font-medium">Stay Active</span>
                <span className="text-neutral-400 text-sm ml-2">Consistent activity shows reliability</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
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
