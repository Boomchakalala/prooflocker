'use client';

import { SimplifiedProfileCard, TierBadge, PredictionCardAuthor } from '@/components/scoring/SimplifiedUX';

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
    <div className="min-h-screen bg-[#0A0A0F] p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">
            🎨 Simplified Scoring UX Test
          </h1>
          <p className="text-gray-400">
            Testing new components with mock data
          </p>
        </div>

        {/* Test 1: Tier Badges */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">1. Tier Badges</h2>
          <div className="flex flex-wrap gap-4">
            <TierBadge reliabilityScore={950} size="lg" />
            <TierBadge reliabilityScore={720} size="lg" />
            <TierBadge reliabilityScore={580} size="lg" />
            <TierBadge reliabilityScore={350} size="lg" />
            <TierBadge reliabilityScore={150} size="lg" />
          </div>
          <div className="text-sm text-green-400">
            ✓ If you see 5 tier badges above, component works!
          </div>
        </section>

        {/* Test 2: Profile Card */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">2. Profile Card</h2>
          <SimplifiedProfileCard
            stats={mockStats}
            anonId="test-user-7291"
          />
          <div className="text-sm text-green-400">
            ✓ If you see a profile card with tier badge, stats, and progress bar - it works!
          </div>
        </section>

        {/* Test 3: Prediction Card Author */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">3. Prediction Card Author Line</h2>
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
            <div className="text-lg text-white">
              Bitcoin will hit $100k by end of 2026
            </div>
            <PredictionCardAuthor
              anonId="test-user-7291"
              reliabilityScore={620}
              createdAt={new Date('2024-01-15')}
            />
          </div>
          <div className="text-sm text-green-400">
            ✓ If you see compact author info with tier badge - it works!
          </div>
        </section>

        {/* Test 4: Different Scores */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">4. Various Reliability Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { score: 950, label: 'Legend' },
              { score: 720, label: 'Master' },
              { score: 580, label: 'Expert' },
              { score: 350, label: 'Trusted' },
              { score: 150, label: 'Novice' },
            ].map((tier) => (
              <div key={tier.score} className="bg-gray-800/50 p-4 rounded-lg text-center space-y-2">
                <TierBadge reliabilityScore={tier.score} size="md" />
                <div className="text-2xl font-bold text-white">{tier.score}</div>
                <div className="text-sm text-gray-400">{tier.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-blue-400">✅ If Everything Above Looks Good</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. Components are working correctly</p>
            <p>2. You can safely integrate them into your actual pages</p>
            <p>3. Check <code className="bg-gray-800 px-2 py-1 rounded">IMPLEMENTATION_STEPS.md</code> for next steps</p>
          </div>
        </section>

        {/* Debug Info */}
        <section className="bg-gray-900/30 border border-gray-700 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-gray-400">🔍 Debug Info</h2>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify(mockStats, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
