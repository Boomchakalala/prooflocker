'use client';

import Link from 'next/link';
import UnifiedHeader from '@/components/UnifiedHeader';

export default function HowScoringWorksPage() {
  return (
    <div className="min-h-screen gradient-bg text-white relative">
      <UnifiedHeader currentView="about" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 pt-16">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">How Scoring Works</h1>
          <p className="text-lg text-neutral-300">
            ProofLocker tracks two scores: Reliability Score (0-1000, measures reputation and trust) and XP (uncapped, measures engagement and never decreases).
          </p>
        </div>

        {/* Quick Reference Table */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Reference</h2>
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
            <div className="mt-4 text-xs text-neutral-400">
              Maximum overdue penalty: -50 Reliability total per month across all claims
            </div>
          </div>
        </section>

        {/* Reliability Score */}
        <section className="mb-10">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reliability Score (0-1000, starts at 100)</h2>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white mb-2">Tiers</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• Novice: 0-299</li>
                <li>• Trusted: 300-499</li>
                <li>• Expert: 500-649</li>
                <li>• Master: 650-799</li>
                <li>• Legend: 800-1000</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white mb-2">Correct Resolutions</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• Grade A (official docs, court records, on-chain): +40</li>
                <li>• Grade B (reputable sources, credible data): +32</li>
                <li>• Grade C (reasonable but subjective): +25</li>
                <li>• Grade D (weak or no evidence): +15</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white mb-2">Incorrect Resolutions</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• Grade A (strong evidence accepting error): -30</li>
                <li>• Grade B (reasonable explanation): -35</li>
                <li>• Grade C (weak explanation): -38</li>
                <li>• Grade D or no evidence: -42</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-2">Overdue & Extensions</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• Overdue (no extension): -10 per claim, max -50/month</li>
                <li>• Auto-archive (2× timeframe): -20 additional</li>
                <li>• One-time extension available for long-term claims (prevents penalties)</li>
              </ul>
            </div>

            <div className="mt-4 bg-green-500/5 rounded-lg p-4 border border-green-500/20">
              <p className="text-sm text-neutral-300"><strong className="text-white">Example:</strong> Alice locks a Bitcoin claim with Grade B initial evidence (+25 XP). Three months later, she resolves correctly with Grade A evidence (on-chain data). She earns +150 XP (resolve), +20 XP (on-time), and +40 Reliability. Total: +195 XP, +40 Reliability.</p>
            </div>
          </div>
        </section>

        {/* XP */}
        <section className="mb-10">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">XP (Uncapped, Never Decreases)</h2>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white mb-2">Earning XP</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• Lock claim: +10</li>
                <li>• Lock with Grade A initial evidence: +20 bonus (total +30)</li>
                <li>• Lock with Grade B initial evidence: +15 bonus (total +25)</li>
                <li>• Lock with Grade C initial evidence: +10 bonus (total +20)</li>
                <li>• Resolve any claim: +50</li>
                <li>• Correct resolution: +100 bonus (total +150)</li>
                <li>• On-time closure: +20 bonus</li>
                <li>• Maximum (correct + on-time + Grade A lock): +180 XP</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-2">Milestones</h3>
              <ul className="text-sm text-neutral-300 space-y-1 ml-4">
                <li>• 1,000 XP: Special profile badge</li>
                <li>• 5,000 XP: Priority claim visibility</li>
                <li>• 10,000 XP: Custom profile theme + contest entry</li>
                <li>• 25,000 XP: Veteran Predictor title</li>
                <li>• 50,000+ XP: Leaderboard recognition + premium rewards</li>
              </ul>
            </div>

            <div className="mt-4 bg-red-500/5 rounded-lg p-4 border border-red-500/20">
              <p className="text-sm text-neutral-300"><strong className="text-white">Example:</strong> Bob locks a claim with no initial evidence (+10 XP). He resolves incorrectly but provides Grade B evidence explaining his error (news article). He earns +50 XP (resolve), +20 XP (on-time), and -35 Reliability. Total: +80 XP, -35 Reliability. XP still grows; owning the error with evidence reduces the penalty compared to no evidence (-42).</p>
            </div>
          </div>
        </section>

        {/* Evidence Grades */}
        <section className="mb-10">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Evidence Grade (A-D)</h2>
            <p className="text-sm text-neutral-300 mb-4">Initial evidence affects XP only. Resolution evidence determines Reliability changes.</p>
            <ul className="text-sm text-neutral-300 space-y-2 ml-4">
              <li>• <strong className="text-green-400">Grade A:</strong> Official documents, court records, on-chain transactions, government data</li>
              <li>• <strong className="text-blue-400">Grade B:</strong> Reputable news outlets, multiple credible sources, expert analysis</li>
              <li>• <strong className="text-yellow-400">Grade C:</strong> Screenshots, single-source claims, social media posts, anecdotal evidence</li>
              <li>• <strong className="text-orange-400">Grade D:</strong> Minimal or no evidence, personal opinion, vibes-based assessment</li>
            </ul>
          </div>
        </section>

        {/* Timeframes */}
        <section className="mb-10">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Claim Timeframes & Extensions</h2>
            <ul className="text-sm text-neutral-300 space-y-1 ml-4">
              <li>• Short-term: &lt;6 months</li>
              <li>• Medium-term: 6-24 months</li>
              <li>• Long-term: &gt;24 months</li>
              <li>• One-time extension available for long-term claims (provide brief justification before overdue)</li>
            </ul>
          </div>
        </section>

        {/* Contested Resolutions */}
        <section className="mb-10">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contested Resolutions</h2>
            <ul className="text-sm text-neutral-300 space-y-2 ml-4">
              <li>• 7-day dispute window after resolution</li>
              <li>• Users with Reliability ≥200 can vote (one vote per user)</li>
              <li>• Simple majority determines outcome; ties keep original resolution</li>
              <li>• Only finalized resolutions affect your Reliability and accuracy</li>
              <li>• Overruled resolutions: -20 additional penalty on top of incorrect penalty</li>
            </ul>
          </div>
        </section>

        {/* Key Principles */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Key Principles</h2>
            <ul className="text-sm text-neutral-300 space-y-2 ml-4">
              <li>• <strong className="text-white">Evidence quality matters:</strong> Resolution evidence determines Reliability changes. Strong evidence when correct earns maximum rewards. Good evidence when incorrect reduces penalties.</li>
              <li>• <strong className="text-white">Close claims on time:</strong> On-time resolution earns bonus XP and avoids overdue penalties. Use extensions when needed.</li>
              <li>• <strong className="text-white">XP always grows:</strong> XP rewards engagement and never decreases, unlocking milestones and exclusive perks.</li>
              <li>• <strong className="text-white">Community verifies outcomes:</strong> Simple majority voting ensures fair and transparent resolutions.</li>
            </ul>
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
