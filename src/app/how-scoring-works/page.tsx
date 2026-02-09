'use client';

import Link from 'next/link';
import UnifiedHeader from '@/components/UnifiedHeader';

export default function HowScoringWorksPage() {
  return (
    <div className="min-h-screen gradient-bg text-white relative">
      <UnifiedHeader currentView="about" />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 pt-16">

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">How Scoring Works</h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            ProofLocker uses two separate scoring systems: Reputation Score tracks your reputation and trustworthiness, while XP measures your overall engagement and progression.
          </p>
        </div>

        {/* Overview Cards - Two boxes at top */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          {/* Reputation Score Card */}
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reputation Score</h2>
                <p className="text-sm text-neutral-400">0-1000, capped</p>
              </div>
            </div>
            <p className="text-neutral-300 mb-4">
              Your reputation and trustworthiness as a predictor. Measures accuracy, evidence quality, and timely resolution. Can go up or down based on performance.
            </p>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-neutral-400 mb-2">Starting Score</div>
              <div className="text-2xl font-bold text-blue-400">100</div>
            </div>
          </div>

          {/* XP Card */}
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">XP</h2>
                <p className="text-sm text-neutral-400">Uncapped, never decreases</p>
              </div>
            </div>
            <p className="text-neutral-300 mb-4">
              Your total experience and engagement. Rewards all activity and always increases. Unlocks milestones, badges, and exclusive features.
            </p>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-neutral-400 mb-2">Starting XP</div>
              <div className="text-2xl font-bold text-purple-400">0</div>
            </div>
          </div>

        </div>

        {/* Reputation Score Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reputation Score (0-1000)</h2>
                <p className="text-sm text-neutral-400">Your trust and reputation</p>
              </div>
            </div>

            {/* Tier Badges */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Reputation Tiers</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gray-500/5 rounded-lg p-3 border border-gray-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">0-299</div>
                  <div className="text-sm font-bold text-gray-400">Novice</div>
                </div>
                <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">300-499</div>
                  <div className="text-sm font-bold text-green-400">Trusted</div>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">500-649</div>
                  <div className="text-sm font-bold text-blue-400">Expert</div>
                </div>
                <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">650-799</div>
                  <div className="text-sm font-bold text-purple-400">Master</div>
                </div>
                <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">800-1000</div>
                  <div className="text-sm font-bold text-yellow-400">Legend</div>
                </div>
              </div>
            </div>

            {/* Correct/Incorrect Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-base font-bold text-white mb-3">Correct Resolutions</h3>
                <div className="space-y-2">
                  <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade A</span>
                    <span className="text-lg font-bold text-green-400">+40</span>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade B</span>
                    <span className="text-lg font-bold text-blue-400">+32</span>
                  </div>
                  <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade C</span>
                    <span className="text-lg font-bold text-yellow-400">+25</span>
                  </div>
                  <div className="bg-orange-500/5 rounded-lg p-3 border border-orange-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade D</span>
                    <span className="text-lg font-bold text-orange-400">+15</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3">Incorrect Resolutions</h3>
                <div className="space-y-2">
                  <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade A</span>
                    <span className="text-lg font-bold text-red-400">-30</span>
                  </div>
                  <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade B</span>
                    <span className="text-lg font-bold text-red-400">-35</span>
                  </div>
                  <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade C</span>
                    <span className="text-lg font-bold text-red-400">-38</span>
                  </div>
                  <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade D / None</span>
                    <span className="text-lg font-bold text-red-400">-42</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue */}
            <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
              <h3 className="text-sm font-bold text-white mb-2">Overdue Penalties</h3>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Overdue (no extension): -10 per claim, max -50/month</li>
                <li>• Auto-archive (2× timeframe): -20 additional</li>
                <li>• One-time extension available for long-term claims</li>
              </ul>
            </div>

          </div>
        </section>

        {/* XP Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">XP System</h2>
                <p className="text-sm text-neutral-400">Uncapped, never decreases</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-base font-bold text-white mb-3">Earning XP</h3>
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Lock claim</span>
                    <span className="text-lg font-bold text-purple-400">+10</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">+ Grade A evidence</span>
                    <span className="text-lg font-bold text-green-400">+20</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Resolve claim</span>
                    <span className="text-lg font-bold text-purple-400">+50</span>
                  </div>
                  <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Correct bonus</span>
                    <span className="text-lg font-bold text-green-400">+100</span>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">On-time bonus</span>
                    <span className="text-lg font-bold text-blue-400">+20</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3">Milestones</h3>
                <div className="space-y-2">
                  <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/20">
                    <div className="text-sm font-bold text-white">1,000 XP</div>
                    <div className="text-xs text-neutral-400">Special profile badge</div>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-sm font-bold text-white">5,000 XP</div>
                    <div className="text-xs text-neutral-400">Priority claim visibility</div>
                  </div>
                  <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                    <div className="text-sm font-bold text-white">10,000 XP</div>
                    <div className="text-xs text-neutral-400">Custom profile theme</div>
                  </div>
                  <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20">
                    <div className="text-sm font-bold text-white">25,000 XP</div>
                    <div className="text-xs text-neutral-400">Veteran Predictor title</div>
                  </div>
                  <div className="bg-orange-500/5 rounded-lg p-3 border border-orange-500/20">
                    <div className="text-sm font-bold text-white">50,000+ XP</div>
                    <div className="text-xs text-neutral-400">Leaderboard recognition</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Evidence Grades */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Evidence Grade (A-D)</h2>
            <p className="text-sm text-neutral-300 mb-6">Initial evidence affects XP only. Resolution evidence determines Reputation changes.</p>

            <div className="grid md:grid-cols-4 gap-3">
              <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-lg mb-2">
                  A
                </div>
                <div className="text-green-400 font-semibold text-sm mb-1">Authoritative</div>
                <p className="text-xs text-neutral-400">Official docs, court records, on-chain</p>
              </div>

              <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg mb-2">
                  B
                </div>
                <div className="text-blue-400 font-semibold text-sm mb-1">High-Quality</div>
                <p className="text-xs text-neutral-400">Reputable sources, credible data</p>
              </div>

              <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-lg mb-2">
                  C
                </div>
                <div className="text-yellow-400 font-semibold text-sm mb-1">Weak/Indirect</div>
                <p className="text-xs text-neutral-400">Screenshots, single-source, social media</p>
              </div>

              <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg mb-2">
                  D
                </div>
                <div className="text-orange-400 font-semibold text-sm mb-1">No Evidence</div>
                <p className="text-xs text-neutral-400">Minimal or no proof, opinion</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contested Resolutions */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contested Resolutions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-2">7-Day Dispute Window</h3>
                <p className="text-xs text-neutral-400">Users with Reputation ≥200 can vote (one vote per user)</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-2">Simple Majority</h3>
                <p className="text-xs text-neutral-400">Outcome determined by majority; ties keep original resolution</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-2">Only Finalized Count</h3>
                <p className="text-xs text-neutral-400">Only finalized resolutions affect Reputation and accuracy</p>
              </div>
              <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
                <h3 className="text-sm font-bold text-white mb-2">Overruled Penalty</h3>
                <p className="text-xs text-neutral-400">-20 additional penalty on top of incorrect penalty</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105"
          >
            Lock Your First Claim
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-neutral-400 mt-4">
            Start building your reputation and earning XP today
          </p>
        </div>

      </div>
    </div>
  );
}
