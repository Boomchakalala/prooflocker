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
          <h1 className="text-4xl font-bold text-white mb-4">How Reputation Works</h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Your reputation is calculated from accuracy, evidence quality, and consistency. Only claims are scored — intel signals are a monitoring layer, not a scoring input. This is proof of reputational observation: math-backed reputation from outcomes, not opinions.
          </p>
        </div>

        {/* Overview Cards */}
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
                <p className="text-sm text-neutral-400">0-1000, starts at 100</p>
              </div>
            </div>
            <p className="text-neutral-300 mb-4">
              Weighted calculation of accuracy, evidence quality, and activity. Recalculated after each resolution, contest, or overdue event.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Accuracy (50%)</span>
                <span className="text-blue-400 font-semibold">Max 500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Evidence Quality (30%)</span>
                <span className="text-blue-400 font-semibold">Max 300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Activity (20%)</span>
                <span className="text-blue-400 font-semibold">Max 200</span>
              </div>
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
              Total experience earned through locking claims, resolving, being correct, and maintaining streaks. Unlocks milestones and rewards.
            </p>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-neutral-400 mb-1">Max per claim</div>
              <div className="text-2xl font-bold text-purple-400">220 XP</div>
            </div>
          </div>

        </div>

        {/* Reputation Score Breakdown */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reputation Score Calculation</h2>

            <p className="text-neutral-300 mb-6">
              Your Reputation Score is recalculated after every resolution, contest outcome, or overdue event. It's a weighted combination of three factors:
            </p>

            <div className="space-y-6">

              {/* Accuracy */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Accuracy (50% weight)</h3>
                  <span className="text-blue-400 font-semibold">Max 500 points</span>
                </div>
                <p className="text-neutral-300 text-sm mb-3">
                  <strong>Formula:</strong> (Correct resolutions / Total resolved) × 500
                </p>
                <p className="text-neutral-400 text-sm">
                  Your win rate determines half your score. Incorrect resolutions and overruled contests count as incorrect.
                </p>
              </div>

              {/* Evidence Quality */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Evidence Quality (30% weight)</h3>
                  <span className="text-green-400 font-semibold">Max 300 points</span>
                </div>
                <p className="text-neutral-300 text-sm mb-3">
                  <strong>Formula:</strong> (Average evidence score across resolutions) × 3
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                    <div className="text-xs text-green-400 font-semibold">Grade A</div>
                    <div className="text-white text-sm">100 points</div>
                  </div>
                  <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                    <div className="text-xs text-blue-400 font-semibold">Grade B</div>
                    <div className="text-white text-sm">75 points</div>
                  </div>
                  <div className="bg-yellow-500/10 rounded p-2 border border-yellow-500/20">
                    <div className="text-xs text-yellow-400 font-semibold">Grade C</div>
                    <div className="text-white text-sm">50 points</div>
                  </div>
                  <div className="bg-orange-500/10 rounded p-2 border border-orange-500/20">
                    <div className="text-xs text-orange-400 font-semibold">Grade D</div>
                    <div className="text-white text-sm">25 points</div>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm mt-3">
                  For incorrect resolutions, evidence score reflects quality of error acknowledgment (higher if you provide strong proof of the mistake).
                </p>
              </div>

              {/* Activity */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Activity (20% weight)</h3>
                  <span className="text-purple-400 font-semibold">Max 200 points</span>
                </div>
                <p className="text-neutral-300 text-sm mb-3">
                  <strong>Formula:</strong> 10 points per resolved claim, capped at 20 resolutions
                </p>
                <p className="text-neutral-400 text-sm">
                  Rewards consistent engagement. Reaches maximum at 20 resolved claims.
                </p>
              </div>

            </div>

            {/* Example Calculation */}
            <div className="mt-8 bg-blue-500/5 rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Example Calculation</h3>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-300">User has resolved 15 claims: 12 correct, 3 incorrect</p>
                <p className="text-neutral-300">Average evidence grade: B (75 points)</p>
                <div className="border-t border-white/10 my-3 pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-400">Accuracy:</span>
                    <span className="text-white">(12/15) × 500 = <strong className="text-blue-400">400</strong></span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-400">Evidence Quality:</span>
                    <span className="text-white">75 × 3 = <strong className="text-green-400">225</strong></span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-400">Activity:</span>
                    <span className="text-white">15 × 10 = <strong className="text-purple-400">150</strong></span>
                  </div>
                  <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold">
                    <span className="text-white">Total Reputation:</span>
                    <span className="text-blue-400">775</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Reputation Tiers */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reputation Tiers</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-500/10 rounded-lg p-4 border border-gray-500/30 text-center">
                <div className="text-2xl font-bold text-gray-400 mb-1">Novice</div>
                <div className="text-sm text-neutral-400">0-299</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">Trusted</div>
                <div className="text-sm text-neutral-400">300-499</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Expert</div>
                <div className="text-sm text-neutral-400">500-649</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">Master</div>
                <div className="text-sm text-neutral-400">650-799</div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">Legend</div>
                <div className="text-sm text-neutral-400">800-1000</div>
              </div>
            </div>
          </div>
        </section>

        {/* XP System */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">XP System</h2>

            <p className="text-neutral-300 mb-6">
              XP is uncapped and never decreases. It rewards all activity and unlocks milestones as you progress.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-neutral-400 font-semibold">Action</th>
                    <th className="text-right py-3 text-neutral-400 font-semibold">XP Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="py-3 text-neutral-300">Lock claim (base)</td>
                    <td className="text-right text-white font-semibold">+10</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Lock with Grade A evidence</td>
                    <td className="text-right text-green-400 font-semibold">+30 (10+20)</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Lock with Grade B evidence</td>
                    <td className="text-right text-blue-400 font-semibold">+25 (10+15)</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Lock with Grade C evidence</td>
                    <td className="text-right text-yellow-400 font-semibold">+20 (10+10)</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Lock with Grade D evidence</td>
                    <td className="text-right text-orange-400 font-semibold">+10 (10+0)</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Resolve claim (base)</td>
                    <td className="text-right text-white font-semibold">+50</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Correct resolution bonus</td>
                    <td className="text-right text-green-400 font-semibold">+100</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">On-time resolution bonus</td>
                    <td className="text-right text-blue-400 font-semibold">+20</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">High-risk claim bonus</td>
                    <td className="text-right text-purple-400 font-semibold">+40</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-neutral-300">Consecutive correct streak</td>
                    <td className="text-right text-yellow-400 font-semibold">+10 per streak</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
              <p className="text-sm text-neutral-300">
                <strong>Maximum XP per claim:</strong> 220 XP (Lock +30 + Resolve +50 + Correct +100 + On-time +20 + High-risk +40)
              </p>
            </div>
          </div>
        </section>

        {/* Evidence Grades */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Evidence Grades</h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div className="bg-green-500/5 rounded-lg p-5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-green-500/20 border border-green-500/40 flex items-center justify-center font-bold text-green-400">A</div>
                  <div className="text-lg font-bold text-white">Authoritative</div>
                </div>
                <p className="text-sm text-neutral-300 mb-2">Official documents, court records, verified on-chain transactions</p>
                <div className="text-sm text-green-400 font-semibold">100 points for Reputation</div>
              </div>

              <div className="bg-blue-500/5 rounded-lg p-5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400">B</div>
                  <div className="text-lg font-bold text-white">Reputable</div>
                </div>
                <p className="text-sm text-neutral-300 mb-2">Multiple credible sources, reputable news outlets</p>
                <div className="text-sm text-blue-400 font-semibold">75 points for Reputation</div>
              </div>

              <div className="bg-yellow-500/5 rounded-lg p-5 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center font-bold text-yellow-400">C</div>
                  <div className="text-lg font-bold text-white">Reasonable</div>
                </div>
                <p className="text-sm text-neutral-300 mb-2">Screenshots, single credible source, social media posts</p>
                <div className="text-sm text-yellow-400 font-semibold">50 points for Reputation</div>
              </div>

              <div className="bg-orange-500/5 rounded-lg p-5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400">D</div>
                  <div className="text-lg font-bold text-white">Weak/Minimal</div>
                </div>
                <p className="text-sm text-neutral-300 mb-2">Personal opinion, unverified claims, weak sources</p>
                <div className="text-sm text-orange-400 font-semibold">25 points for Reputation</div>
              </div>

            </div>
          </div>
        </section>

        {/* Timeframes and Overdues */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Timeframes, Overdues & Extensions</h2>

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Required Timeframes</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-blue-400 font-bold mb-1">Short-term</div>
                    <div className="text-sm text-neutral-300">&lt; 6 months</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-green-400 font-bold mb-1">Medium-term</div>
                    <div className="text-sm text-neutral-300">6-24 months</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-purple-400 font-bold mb-1">Long-term</div>
                    <div className="text-sm text-neutral-300">&gt; 24 months</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Overdue Penalties</h3>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">▸</span>
                    <span><strong className="text-white">Overdue claim:</strong> -5 activity points per overdue claim (max -25 per month)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">▸</span>
                    <span><strong className="text-white">Auto-archive:</strong> If unresolved after 2× the timeframe, claim is auto-archived with -10 activity points</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Extensions</h3>
                <p className="text-sm text-neutral-300">
                  Long-term claims (&gt;24 months) are eligible for a <strong className="text-white">one-time extension</strong> to avoid overdue penalties if circumstances change or additional time is needed.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Contested Resolutions */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Contested Resolutions</h2>

            <p className="text-neutral-300 mb-6">
              Community members can dispute resolutions they believe are incorrect. Contested outcomes are decided by community vote.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-semibold text-white mb-2">Dispute Window</div>
                <div className="text-neutral-300">7 days after resolution</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-semibold text-white mb-2">Voting Eligibility</div>
                <div className="text-neutral-300">Reputation Score ≥ 200 required to vote</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-semibold text-white mb-2">Vote Weight</div>
                <div className="text-neutral-300">One vote per eligible user (simple majority)</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm font-semibold text-white mb-2">Outcome</div>
                <ul className="text-neutral-300 space-y-1 text-sm">
                  <li>• More upvotes (agree): Resolution finalized as-is</li>
                  <li>• More downvotes (disagree): Resolution overruled</li>
                  <li>• Tie: Original resolution stands</li>
                </ul>
              </div>

              <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                <div className="text-sm font-semibold text-red-400 mb-2">Overruled Penalty</div>
                <div className="text-neutral-300">If community overrules your resolution: counts as incorrect + <strong className="text-red-400">-25 direct subtraction</strong> from Reputation Score</div>
              </div>
            </div>
          </div>
        </section>

        {/* XP Milestones */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">XP Milestones</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-blue-400">1K</div>
                <div className="text-neutral-300">Unlock milestone badge</div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">5K</div>
                <div className="text-neutral-300">Priority claim visibility</div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">10K</div>
                <div className="text-neutral-300">Custom theme & early contest access</div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">25K</div>
                <div className="text-neutral-300">Veteran status</div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-orange-400">50K+</div>
                <div className="text-neutral-300">Top leaderboard & exclusive rewards</div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Examples */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Additional Examples</h2>

            <div className="space-y-6">

              {/* Example 2 - Incorrect with good evidence */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Example: Incorrect Resolution with Strong Error Acknowledgment</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-300">User resolves incorrectly but provides Grade A evidence acknowledging the error</p>
                  <p className="text-neutral-300">Track record: 8 correct, 2 incorrect out of 10 resolutions</p>
                  <div className="border-t border-white/10 my-3 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Accuracy:</span>
                      <span className="text-white">(8/10) × 500 = <strong className="text-blue-400">400</strong></span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Evidence Quality:</span>
                      <span className="text-white">100 × 3 = <strong className="text-green-400">300</strong> (Grade A acknowledgment)</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Activity:</span>
                      <span className="text-white">10 × 10 = <strong className="text-purple-400">100</strong></span>
                    </div>
                    <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold">
                      <span className="text-white">Total Reputation:</span>
                      <span className="text-blue-400">800</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-xs">Strong evidence quality helps maintain high reputation despite incorrect outcome.</p>
                </div>
              </div>

              {/* Example 3 - Overdue impact */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Example: Impact of Overdue Claims</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-300">User has 3 overdue claims this month</p>
                  <p className="text-neutral-300">Previous reputation: 650 (Master tier)</p>
                  <div className="border-t border-white/10 my-3 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Base calculation:</span>
                      <span className="text-white"><strong>650</strong></span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Overdue penalty:</span>
                      <span className="text-red-400">-15 activity (3 claims × -5)</span>
                    </div>
                    <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold">
                      <span className="text-white">New Reputation:</span>
                      <span className="text-blue-400">635</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-xs">Still maintains Master tier (650-799) but score is reduced by activity penalties.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Link
            href="/app"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Building Your Reputation
          </Link>
        </div>

      </div>
    </div>
  );
}
