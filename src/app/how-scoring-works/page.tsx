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
            ProofLocker uses two separate scoring systems to measure your performance: Reliability Score tracks your reputation and trustworthiness, while XP measures your overall engagement and progression. This guide explains how each system works and how you can maximize both.
          </p>
        </div>

        {/* Two Score Overview */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Reliability Score Card */}
            <div className="glass border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Reliability Score</h2>
                  <p className="text-sm text-neutral-400">0-1000, capped</p>
                </div>
              </div>
              <p className="text-neutral-300 mb-4">
                Your reputation and trustworthiness as a predictor. This score measures how accurate you are, how strong your evidence is, and whether you close claims on time. It can go up or down based on your performance.
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
                Your total experience and engagement. XP rewards all activity on the platform and always increases, never decreases. It unlocks milestones, badges, and exclusive features as you level up.
              </p>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-neutral-400 mb-2">Starting XP</div>
                <div className="text-2xl font-bold text-purple-400">0</div>
              </div>
            </div>

          </div>
        </section>

        {/* Reliability Score Detailed Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Reliability Score</h2>
            <p className="text-neutral-300 mb-6">
              Reliability Score is your primary measure of trust and reputation. It starts at 100 and ranges from 0 to 1000. Your score changes only when you resolve claims or when claims become overdue.
            </p>

            {/* Tier Badges */}
            <div className="mb-8">
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

            {/* Correct Resolution */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Correct Resolution</h3>
              <p className="text-neutral-300 mb-4">
                When you resolve a claim correctly, your Reliability Score increases based on the quality of your resolution evidence. Higher quality evidence earns greater rewards.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-400">Grade A Evidence</span>
                    <span className="text-xl font-bold text-green-400">+40</span>
                  </div>
                  <p className="text-xs text-neutral-400">Official documents, court records, on-chain transactions</p>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-400">Grade B Evidence</span>
                    <span className="text-xl font-bold text-blue-400">+32</span>
                  </div>
                  <p className="text-xs text-neutral-400">Reputable sources, credible data</p>
                </div>
                <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-yellow-400">Grade C Evidence</span>
                    <span className="text-xl font-bold text-yellow-400">+25</span>
                  </div>
                  <p className="text-xs text-neutral-400">Reasonable but subjective proof</p>
                </div>
                <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-orange-400">Grade D Evidence</span>
                    <span className="text-xl font-bold text-orange-400">+15</span>
                  </div>
                  <p className="text-xs text-neutral-400">Weak or no evidence</p>
                </div>
              </div>
            </div>

            {/* Incorrect Resolution */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Incorrect Resolution</h3>
              <p className="text-neutral-300 mb-4">
                When you resolve a claim incorrectly, your Reliability Score decreases. The penalty is smaller if you provide strong evidence admitting or explaining the error, and larger if you provide weak or no evidence.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-400">Grade A Evidence</span>
                    <span className="text-xl font-bold text-red-400">-30</span>
                  </div>
                  <p className="text-xs text-neutral-400">Strong evidence accepting the error</p>
                </div>
                <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-400">Grade B Evidence</span>
                    <span className="text-xl font-bold text-red-400">-35</span>
                  </div>
                  <p className="text-xs text-neutral-400">Reasonable explanation provided</p>
                </div>
                <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-400">Grade C Evidence</span>
                    <span className="text-xl font-bold text-red-400">-38</span>
                  </div>
                  <p className="text-xs text-neutral-400">Weak or subjective explanation</p>
                </div>
                <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-400">Grade D or No Evidence</span>
                    <span className="text-xl font-bold text-red-400">-42</span>
                  </div>
                  <p className="text-xs text-neutral-400">No effort to explain or support</p>
                </div>
              </div>
            </div>

            {/* Overdue Penalties */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Overdue Claims</h3>
              <p className="text-neutral-300 mb-4">
                Claims that remain unresolved past their expected timeframe incur penalties. This encourages timely resolution and accountability.
              </p>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Overdue (no extension)</span>
                    <span className="text-lg font-bold text-red-400">-10</span>
                  </div>
                  <p className="text-xs text-neutral-400">Applied once per claim when expected timeframe passes. Maximum -50 total per month across all overdue claims.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Auto-archive (2× timeframe)</span>
                    <span className="text-lg font-bold text-red-400">-20</span>
                  </div>
                  <p className="text-xs text-neutral-400">If no resolution after 2× the expected timeframe with no extension, the claim auto-archives with this additional penalty.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Extension granted</span>
                    <span className="text-lg font-bold text-green-400">No penalty</span>
                  </div>
                  <p className="text-xs text-neutral-400">You may extend a long-term claim once with a brief justification to avoid overdue penalties.</p>
                </div>
              </div>
            </div>

            {/* Overruled Penalty */}
            <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Overruled by Community Vote</span>
                <span className="text-lg font-bold text-orange-400">-20</span>
              </div>
              <p className="text-xs text-neutral-400">If your resolution is contested and overruled by the community, you receive this additional penalty on top of the standard incorrect penalty.</p>
            </div>

          </div>
        </section>

        {/* XP Detailed Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">XP (Experience Points)</h2>
            <p className="text-neutral-300 mb-6">
              XP measures your overall engagement and activity on ProofLocker. It always increases and never decreases, rewarding you for participation regardless of outcome. Higher XP unlocks milestones, badges, and exclusive features.
            </p>

            {/* Locking Claims */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Locking Claims</h3>
              <p className="text-neutral-300 mb-4">
                You earn XP immediately when you lock a claim. Providing initial evidence at lock time grants bonus XP based on evidence quality.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Base lock reward</span>
                    <span className="text-xl font-bold text-purple-400">+10</span>
                  </div>
                  <p className="text-xs text-neutral-400">Earned every time you lock a claim</p>
                </div>
                <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Grade A initial evidence</span>
                    <span className="text-xl font-bold text-green-400">+20 bonus</span>
                  </div>
                  <p className="text-xs text-neutral-400">Total +30 XP for locking with Grade A evidence</p>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Grade B initial evidence</span>
                    <span className="text-xl font-bold text-blue-400">+15 bonus</span>
                  </div>
                  <p className="text-xs text-neutral-400">Total +25 XP for locking with Grade B evidence</p>
                </div>
                <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Grade C initial evidence</span>
                    <span className="text-xl font-bold text-yellow-400">+10 bonus</span>
                  </div>
                  <p className="text-xs text-neutral-400">Total +20 XP for locking with Grade C evidence</p>
                </div>
              </div>
              <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-neutral-400">
                  <strong className="text-white">Note:</strong> Initial evidence only affects XP at lock time. It does not affect your Reliability Score. Only resolution evidence impacts Reliability.
                </p>
              </div>
            </div>

            {/* Resolving Claims */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Resolving Claims</h3>
              <p className="text-neutral-300 mb-4">
                Resolving claims earns substantial XP. You receive XP for the act of resolving, bonus XP for correct resolutions, and extra XP for closing on time.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Resolve any claim</span>
                    <span className="text-xl font-bold text-purple-400">+50</span>
                  </div>
                  <p className="text-xs text-neutral-400">Earned for any resolution, correct or incorrect</p>
                </div>
                <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Correct resolution bonus</span>
                    <span className="text-xl font-bold text-green-400">+100</span>
                  </div>
                  <p className="text-xs text-neutral-400">Total +150 XP for resolving correctly</p>
                </div>
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">On-time closure bonus</span>
                    <span className="text-xl font-bold text-blue-400">+20</span>
                  </div>
                  <p className="text-xs text-neutral-400">Resolved within expected timeframe</p>
                </div>
                <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Maximum (correct + on-time + A)</span>
                    <span className="text-xl font-bold text-yellow-400">+180</span>
                  </div>
                  <p className="text-xs text-neutral-400">Best possible: 50 + 100 + 20 + 10 (lock bonus)</p>
                </div>
              </div>
            </div>

            {/* XP Milestones */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">XP Milestones & Rewards</h3>
              <p className="text-neutral-300 mb-4">
                As your XP grows, you unlock exclusive perks and recognition that enhance your ProofLocker experience.
              </p>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">1,000 XP</span>
                    <span className="text-xs text-purple-400 font-semibold">Special Profile Badge</span>
                  </div>
                  <p className="text-xs text-neutral-400">Display your dedication with a unique badge</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">5,000 XP</span>
                    <span className="text-xs text-blue-400 font-semibold">Priority Claim Visibility</span>
                  </div>
                  <p className="text-xs text-neutral-400">Your claims appear higher in feeds</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">10,000 XP</span>
                    <span className="text-xs text-green-400 font-semibold">Custom Profile Theme + Contest Entry</span>
                  </div>
                  <p className="text-xs text-neutral-400">Personalize your profile and enter exclusive contests</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">25,000 XP</span>
                    <span className="text-xs text-yellow-400 font-semibold">Veteran Predictor Title</span>
                  </div>
                  <p className="text-xs text-neutral-400">Earn a prestigious title visible across the platform</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">50,000+ XP</span>
                    <span className="text-xs text-orange-400 font-semibold">Leaderboard Recognition + Premium Rewards</span>
                  </div>
                  <p className="text-xs text-neutral-400">Permanent top-tier status and exclusive benefits</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Evidence Grading System */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Evidence Grade (A-D)</h2>
            <p className="text-neutral-300 mb-6">
              Evidence quality is graded on a simple A-D scale. When resolving claims, the grade of your resolution evidence determines how much your Reliability Score changes. Initial evidence at lock time only affects XP, not Reliability.
            </p>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-green-500/5 rounded-lg p-5 border border-green-500/20">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-2xl mb-3">
                  A
                </div>
                <div className="text-green-400 font-bold mb-1">Authoritative</div>
                <p className="text-xs text-neutral-400 mb-3">
                  Official documents, court records, on-chain transactions, government data, verified primary sources
                </p>
                <div className="text-xs text-green-400 font-semibold">Highest trust</div>
              </div>

              <div className="bg-blue-500/5 rounded-lg p-5 border border-blue-500/20">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-2xl mb-3">
                  B
                </div>
                <div className="text-blue-400 font-bold mb-1">High-Quality</div>
                <p className="text-xs text-neutral-400 mb-3">
                  Reputable news outlets, multiple credible sources, expert analysis, verified data from known institutions
                </p>
                <div className="text-xs text-blue-400 font-semibold">Strong trust</div>
              </div>

              <div className="bg-yellow-500/5 rounded-lg p-5 border border-yellow-500/20">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-2xl mb-3">
                  C
                </div>
                <div className="text-yellow-400 font-bold mb-1">Weak/Indirect</div>
                <p className="text-xs text-neutral-400 mb-3">
                  Screenshots, single-source claims, social media posts, anecdotal evidence, reasonable but subjective
                </p>
                <div className="text-xs text-yellow-400 font-semibold">Moderate trust</div>
              </div>

              <div className="bg-orange-500/5 rounded-lg p-5 border border-orange-500/20">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-2xl mb-3">
                  D
                </div>
                <div className="text-orange-400 font-bold mb-1">No Evidence</div>
                <p className="text-xs text-neutral-400 mb-3">
                  Minimal or no supporting evidence provided, personal opinion, vibes-based assessment, unverifiable claims
                </p>
                <div className="text-xs text-orange-400 font-semibold">Low trust</div>
              </div>
            </div>

            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm text-neutral-300">
                <strong className="text-white">Important:</strong> Resolution evidence grade determines your Reliability Score changes. Initial evidence at lock time only grants XP bonuses and does not affect Reliability.
              </p>
            </div>
          </div>
        </section>

        {/* Claim Timeframes */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Claim Timeframes & Extensions</h2>
            <p className="text-neutral-300 mb-6">
              When locking a claim, you must select an expected resolution timeframe. This helps set clear expectations and enables the overdue penalty system that encourages timely resolution.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-bold text-white mb-2">Short-Term</div>
                <div className="text-2xl font-bold text-blue-400 mb-2">&lt; 6 months</div>
                <p className="text-xs text-neutral-400">Claims expected to resolve quickly</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-bold text-white mb-2">Medium-Term</div>
                <div className="text-2xl font-bold text-purple-400 mb-2">6-24 months</div>
                <p className="text-xs text-neutral-400">Standard timeframe for most claims</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-bold text-white mb-2">Long-Term</div>
                <div className="text-2xl font-bold text-yellow-400 mb-2">&gt; 24 months</div>
                <p className="text-xs text-neutral-400">Multi-year predictions with extension option</p>
              </div>
            </div>

            <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-sm font-bold text-white mb-2">Extensions</h3>
              <p className="text-sm text-neutral-300">
                You may extend a long-term claim once by providing a brief justification. This prevents overdue penalties when circumstances change or resolution takes longer than expected. Extensions must be requested before the claim becomes overdue.
              </p>
            </div>
          </div>
        </section>

        {/* Contested Resolutions */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Contested Resolutions</h2>
            <p className="text-neutral-300 mb-6">
              After a claim is resolved, the community has seven days to review and vote on the resolution. This community verification process ensures fairness and accuracy.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-base font-bold text-white mb-2">7-Day Dispute Window</h3>
                <p className="text-sm text-neutral-300">
                  After resolution, any user with Reliability Score of 200 or higher may vote on whether the resolution is accurate. Each user gets one vote.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-base font-bold text-white mb-3">Simple Majority Voting</h3>
                <p className="text-sm text-neutral-300 mb-3">
                  Votes are counted as upvotes (agree with resolution) or downvotes (disagree). After 7 days, the outcome is determined by simple majority.
                </p>
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-neutral-400 space-y-1">
                    <div>• More upvotes than downvotes: Resolution stands (finalized)</div>
                    <div>• More downvotes than upvotes: Resolution is overruled (contested)</div>
                    <div>• Tie: Resolution stands by default</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-base font-bold text-white mb-3">Reputation Impact</h3>
                <p className="text-sm text-neutral-300 mb-3">
                  Only finalized resolutions count toward your Reliability Score and accuracy rate.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-neutral-300"><strong className="text-green-400">Finalized Correct:</strong> Full points and reputation boost</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-sm text-neutral-300"><strong className="text-red-400">Finalized Incorrect:</strong> Standard incorrect penalty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-neutral-300"><strong className="text-yellow-400">Contested (not finalized):</strong> No impact until finalized</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-sm text-neutral-300"><strong className="text-orange-400">Overruled:</strong> Additional -20 penalty if resolution is flipped</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Scoring Examples</h2>

            {/* Example 1 */}
            <div className="mb-6 bg-green-500/5 rounded-lg p-5 border border-green-500/20">
              <h3 className="text-lg font-bold text-white mb-3">Example 1: Correct Resolution with Strong Evidence</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-neutral-300">Alice locks a claim predicting Bitcoin will reach $100K by Q2 2026. She provides Grade B initial evidence (article from CoinDesk).</p>
                <p className="text-sm text-neutral-300">Three months later, Bitcoin hits $105K. Alice resolves correctly with Grade A evidence (on-chain price data from multiple exchanges).</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Score Changes</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Lock claim + Grade B initial evidence</span>
                    <span className="text-purple-400 font-bold">+25 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Resolve correctly</span>
                    <span className="text-purple-400 font-bold">+150 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">On-time closure bonus</span>
                    <span className="text-purple-400 font-bold">+20 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade A resolution evidence</span>
                    <span className="text-blue-400 font-bold">+40 Reliability</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">+195 XP</div>
                      <div className="text-blue-400 font-bold">+40 Reliability</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="mb-6 bg-red-500/5 rounded-lg p-5 border border-red-500/20">
              <h3 className="text-lg font-bold text-white mb-3">Example 2: Incorrect Resolution with Evidence</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-neutral-300">Bob locks a claim predicting a major tech acquisition won't happen. He provides no initial evidence.</p>
                <p className="text-sm text-neutral-300">The acquisition is announced. Bob resolves incorrectly with Grade B evidence (news article explaining why he got it wrong).</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Score Changes</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Lock claim (no initial evidence)</span>
                    <span className="text-purple-400 font-bold">+10 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Resolve (any outcome earns base XP)</span>
                    <span className="text-purple-400 font-bold">+50 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">On-time closure bonus</span>
                    <span className="text-purple-400 font-bold">+20 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Grade B resolution evidence (incorrect)</span>
                    <span className="text-red-400 font-bold">-35 Reliability</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">+80 XP</div>
                      <div className="text-red-400 font-bold">-35 Reliability</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-neutral-300">
                  <strong className="text-white">Note:</strong> Bob still earns XP for resolving and closing on time. His Reliability drops, but owning his error with evidence reduces the penalty compared to providing no evidence (-42).
                </p>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-orange-500/5 rounded-lg p-5 border border-orange-500/20">
              <h3 className="text-lg font-bold text-white mb-3">Example 3: Overdue Long-Term Claim</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-neutral-300">Carol locks a 3-year claim predicting a major climate policy change. She selects "Long-Term" timeframe and provides Grade C initial evidence.</p>
                <p className="text-sm text-neutral-300">After 3 years, the claim is still unresolved and Carol hasn't requested an extension. The claim becomes overdue.</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Score Changes</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Lock claim + Grade C initial evidence</span>
                    <span className="text-purple-400 font-bold">+20 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">Overdue penalty (after 3 years)</span>
                    <span className="text-red-400 font-bold">-10 Reliability</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-300">No resolution after 6 years (2× timeframe)</span>
                    <span className="text-red-400 font-bold">-20 Reliability (auto-archive)</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">+20 XP</div>
                      <div className="text-red-400 font-bold">-30 Reliability</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-neutral-300">
                  <strong className="text-white">Note:</strong> Carol could have avoided both penalties by requesting a one-time extension with justification, or by resolving the claim within the expected timeframe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Table */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Quick Reference Table</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white font-semibold">Action</th>
                    <th className="text-right py-3 px-4 text-purple-400 font-semibold">XP</th>
                    <th className="text-right py-3 px-4 text-blue-400 font-semibold">Reliability</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Lock claim (no evidence)</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+10</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Lock claim + Grade A initial evidence</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+30</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Lock claim + Grade B initial evidence</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+25</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Lock claim + Grade C initial evidence</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+20</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Resolve any claim (base)</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+50</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Correct resolution bonus</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+100</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">On-time closure bonus</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-bold">+20</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-green-500/5">
                    <td className="py-3 px-4">Correct + Grade A resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-green-400 font-bold">+40</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-green-500/5">
                    <td className="py-3 px-4">Correct + Grade B resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-green-400 font-bold">+32</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-green-500/5">
                    <td className="py-3 px-4">Correct + Grade C resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-green-400 font-bold">+25</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-green-500/5">
                    <td className="py-3 px-4">Correct + Grade D resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-green-400 font-bold">+15</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-red-500/5">
                    <td className="py-3 px-4">Incorrect + Grade A resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-30</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-red-500/5">
                    <td className="py-3 px-4">Incorrect + Grade B resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-35</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-red-500/5">
                    <td className="py-3 px-4">Incorrect + Grade C resolution evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-38</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-red-500/5">
                    <td className="py-3 px-4">Incorrect + Grade D or no evidence</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-42</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-orange-500/5">
                    <td className="py-3 px-4">Resolution overruled by community</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-orange-400 font-bold">-20</td>
                  </tr>
                  <tr className="border-b border-white/5 bg-red-500/5">
                    <td className="py-3 px-4">Claim becomes overdue</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-10</td>
                  </tr>
                  <tr className="bg-red-500/5">
                    <td className="py-3 px-4">Auto-archive (2× timeframe, no extension)</td>
                    <td className="text-right py-3 px-4 text-neutral-500">—</td>
                    <td className="text-right py-3 px-4 text-red-400 font-bold">-20</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm text-neutral-300">
                <strong className="text-white">Maximum overdue penalty per month:</strong> -50 Reliability total across all overdue claims
              </p>
            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Key Principles</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Evidence Quality Matters</h3>
                  <p className="text-sm text-neutral-300">
                    Resolution evidence determines your Reliability changes. Providing strong evidence when you're correct earns maximum rewards. Even when incorrect, good evidence reduces penalties by demonstrating intellectual honesty.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Close Claims On Time</h3>
                  <p className="text-sm text-neutral-300">
                    Resolving claims within their expected timeframe earns bonus XP and avoids overdue penalties. For long-term claims, use the one-time extension option if circumstances change.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">XP Always Grows</h3>
                  <p className="text-sm text-neutral-300">
                    XP rewards engagement and never decreases. You earn XP for locking claims, providing initial evidence, and resolving claims—regardless of whether you're correct or incorrect. Consistent participation unlocks milestones and exclusive perks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Community Verification</h3>
                  <p className="text-sm text-neutral-300">
                    Contested resolutions are decided by simple majority vote from users with Reliability Score of 200 or higher. This community-driven approach ensures fair and transparent outcomes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Balanced Progression</h3>
                  <p className="text-sm text-neutral-300">
                    Consistent users with good evidence reach 800-1000 Reliability after 30-60 resolutions. Poor or inconsistent users drop toward 200-400 and recover slowly. The system rewards accuracy, evidence quality, and accountability.
                  </p>
                </div>
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
