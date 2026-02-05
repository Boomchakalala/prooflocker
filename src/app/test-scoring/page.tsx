'use client';

import { SimplifiedProfileCard, TierBadge, PredictionCardAuthor } from '@/components/scoring/SimplifiedUX';
import Link from 'next/link';

export default function TestScoringPage() {
  // Mock data for testing
  const mockStats = {
    reliabilityScore: 620,
    totalPoints: 2340,
    correctResolves: 12,
    totalResolves: 15,
    locksCount: 25,
    currentStreak: 3,
    categoryStats: {
      Crypto: { correct: 8, total: 10 },
      Tech: { correct: 4, total: 5 },
    },
  };

  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs - matching profile page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Back link - matching profile page */}
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
        <div className="glass border border-white/10 rounded-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎨 Simplified Scoring UX Test
          </h1>
          <p className="text-neutral-400">
            Testing new tier badge components with mock data
          </p>
        </div>

        {/* Test 1: Tier Badges */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">1. Tier Badge Examples</h2>
          <div className="flex flex-wrap gap-4">
            <TierBadge reliabilityScore={950} size="lg" />
            <TierBadge reliabilityScore={720} size="lg" />
            <TierBadge reliabilityScore={580} size="lg" />
            <TierBadge reliabilityScore={350} size="lg" />
            <TierBadge reliabilityScore={150} size="lg" />
          </div>
          <p className="text-sm text-green-400 mt-4">
            ✓ If you see 5 tier badges above with icons, components are working!
          </p>
        </div>

        {/* Test 2: Profile Card */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">2. Simplified Profile Card</h2>
          <SimplifiedProfileCard
            stats={mockStats}
            anonId="test-user-7291"
          />
          <p className="text-sm text-green-400 mt-4">
            ✓ Profile card with tier badge, progress bar, and stats
          </p>
        </div>

        {/* Test 3: Prediction Card Author */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">3. Prediction Card Author Line</h2>
          <div className="glass border border-white/10 rounded-lg p-4">
            <div className="text-lg text-white mb-3">
              Bitcoin will hit $100k by end of 2026
            </div>
            <PredictionCardAuthor
              anonId="test-user-7291"
              reliabilityScore={620}
              createdAt={new Date('2024-01-15')}
            />
          </div>
          <p className="text-sm text-green-400 mt-4">
            ✓ Compact author info with tier badge
          </p>
        </div>

        {/* Test 4: Different Tiers Grid */}
        <div className="glass border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">4. All Reliability Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { score: 950, label: 'Legend', color: 'text-yellow-400' },
              { score: 720, label: 'Master', color: 'text-purple-400' },
              { score: 580, label: 'Expert', color: 'text-blue-400' },
              { score: 350, label: 'Trusted', color: 'text-green-400' },
              { score: 150, label: 'Novice', color: 'text-gray-400' },
            ].map((tier) => (
              <div key={tier.score} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center space-y-2">
                <TierBadge reliabilityScore={tier.score} size="md" />
                <div className={`text-2xl font-bold ${tier.color}`}>{tier.score}</div>
                <div className="text-sm text-neutral-400">{tier.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-[#2E5CFF]/10 to-[#5B21B6]/10 border border-[#2E5CFF]/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">✅ If Everything Above Looks Good</h2>
          <div className="text-neutral-300 space-y-2">
            <p>1. ✓ Components are working correctly</p>
            <p>2. ✓ Styling matches your app's design</p>
            <p>3. ✓ Tier badges have icons and colors</p>
            <p>4. ✓ Ready for integration into real pages</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-neutral-400">
              Check <code className="bg-white/10 px-2 py-1 rounded text-xs">SCORING_UX_OPTIONS_BC_COMPLETE.md</code> for what was implemented
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="glass border border-white/10 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-neutral-300 mb-3">🔍 Mock Data Used</h2>
          <pre className="text-xs text-neutral-500 overflow-auto bg-black/20 p-4 rounded">
            {JSON.stringify(mockStats, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
