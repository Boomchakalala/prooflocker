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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/app"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            How Scoring Works
          </h1>
          <p className="text-neutral-400">
            Three metrics track your prediction quality and contribution
          </p>
        </div>

        {/* Overview Cards - Three boxes at top */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Evidence Score</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">0-100</div>
            <p className="text-sm text-neutral-400">Quality of proof when resolving</p>
          </div>

          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#2E5CFF]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Reliability Score</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">0-1000</div>
            <p className="text-sm text-neutral-400">Your reputation as a forecaster</p>
          </div>

          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#5B21B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Points</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">Lifetime</div>
            <p className="text-sm text-neutral-400">Cumulative, never decrease</p>
          </div>
        </div>

        {/* Reliability Score Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2E5CFF]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reliability Score (0-1000)</h2>
                <p className="text-sm text-neutral-400">Your reputation as a forecaster</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Accuracy</span>
                  </div>
                  <span className="text-blue-400 font-semibold">50%</span>
                </div>
                <p className="text-sm text-neutral-400 ml-11">Win rate × 500 points</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Evidence Quality</span>
                  </div>
                  <span className="text-green-400 font-semibold">30%</span>
                </div>
                <p className="text-sm text-neutral-400 ml-11">Average evidence score × 300</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Activity</span>
                  </div>
                  <span className="text-purple-400 font-semibold">20%</span>
                </div>
                <p className="text-sm text-neutral-400 ml-11">Up to 200 points for consistency</p>
              </div>
            </div>
          </div>
        </section>

        {/* Total Points Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5B21B6]/10 border border-[#5B21B6]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#5B21B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Total Points System</h2>
                <p className="text-sm text-neutral-400">Cumulative, never decreases</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {/* Lock Prediction */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Lock prediction</div>
                  </div>
                  <div className="text-purple-400 font-bold text-lg">+10</div>
                </div>
              </div>

              {/* Resolve Correct */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Resolve correct</div>
                  </div>
                  <div className="text-green-400 font-bold text-lg">+80-150</div>
                </div>
              </div>

              {/* High-risk bonus */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">High-risk category</div>
                  </div>
                  <div className="text-blue-400 font-bold text-lg">+40</div>
                </div>
              </div>

              {/* Streak bonus */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Streak bonus</div>
                  </div>
                  <div className="text-orange-400 font-bold text-lg">+10</div>
                </div>
              </div>

              {/* Resolve Incorrect */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Resolve incorrect</div>
                  </div>
                  <div className="text-red-400 font-bold text-lg">-15</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Score Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Evidence Score (0-100)</h2>
            <p className="text-neutral-300 mb-6">
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
        </section>

        {/* Example */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Example</h2>
            <div className="space-y-3 text-neutral-300">
              <p className="text-sm">15 predictions resolved • 12 correct (80%) • Avg evidence: 72/100</p>
              <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                <div>Accuracy: 80% × 500 = <span className="text-blue-400 font-semibold">400 pts</span></div>
                <div>Evidence: 72/100 × 300 = <span className="text-blue-400 font-semibold">216 pts</span></div>
                <div>Activity: 15 resolved = <span className="text-blue-400 font-semibold">150 pts</span></div>
                <div className="pt-2 mt-2 border-t border-white/10">
                  <span className="text-white font-bold">Total Reliability: <span className="text-2xl text-blue-400">766</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(46,92,255,0.5)] hover:scale-105"
          >
            Lock Your First Prediction
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            Start earning points and building your reputation
          </p>
        </div>
      </div>
    </div>
  );
}
