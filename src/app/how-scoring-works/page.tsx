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
        {/* Overview Cards - Three boxes at top */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="glass border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Evidence Grade</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">A-D</div>
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
            <p className="text-sm text-neutral-400">Your reputation as an author</p>
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
                <p className="text-sm text-neutral-400">Your reputation as an author</p>
              </div>
            </div>

            {/* Tier Badges Preview */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Reputation Tiers</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-yellow-500/10 text-yellow-400 border-yellow-500/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="font-semibold text-xs">Legend</span>
                  <span className="text-xs opacity-75">800+</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-purple-500/10 text-purple-400 border-purple-500/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="font-semibold text-xs">Master</span>
                  <span className="text-xs opacity-75">650-799</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="font-semibold text-xs">Expert</span>
                  <span className="text-xs opacity-75">500-649</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-green-500/10 text-green-400 border-green-500/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="font-semibold text-xs">Trusted</span>
                  <span className="text-xs opacity-75">300-499</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-500/10 text-gray-400 border-gray-500/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="font-semibold text-xs">Novice</span>
                  <span className="text-xs opacity-75">0-299</span>
                </div>
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
                <p className="text-sm text-neutral-400 ml-11">Get claims right to boost your reputation</p>
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
                <p className="text-sm text-neutral-400 ml-11">Strong proof increases your credibility score</p>
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
                <p className="text-sm text-neutral-400 ml-11">Consistent resolving shows you're reliable</p>
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
                    <div className="text-white font-medium">Lock claim</div>
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
                  <div className="text-red-400 font-bold text-lg">-30</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Score Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Evidence Grade (A-D)</h2>
                <p className="text-sm text-neutral-400">Quality of proof when resolving Claims</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 text-green-400 font-bold text-lg">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="text-green-400 font-semibold">Grade A</div>
                    <div className="text-xs text-neutral-500">Authoritative</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-400">Official docs, court records, on-chain transactions</p>
                <div className="text-xs text-green-400 font-semibold mt-2">1.6x multiplier</div>
              </div>

              <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-lg">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="text-blue-400 font-semibold">Grade B</div>
                    <div className="text-xs text-neutral-500">High-Quality</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-400">Reputable outlets, multiple credible sources</p>
                <div className="text-xs text-blue-400 font-semibold mt-2">1.3x multiplier</div>
              </div>

              <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 text-yellow-400 font-bold text-lg">
                    C
                  </div>
                  <div className="flex-1">
                    <div className="text-yellow-400 font-semibold">Grade C</div>
                    <div className="text-xs text-neutral-500">Weak/Indirect</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-400">Screenshots, single-source, social media posts</p>
                <div className="text-xs text-yellow-400 font-semibold mt-2">0.8x multiplier</div>
              </div>

              <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 text-orange-400 font-bold text-lg">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="text-orange-400 font-semibold">Grade D</div>
                    <div className="text-xs text-neutral-500">No Evidence</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-400">Minimal or no supporting evidence provided</p>
                <div className="text-xs text-orange-400 font-semibold mt-2">0.3x multiplier</div>
              </div>
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-[#2E5CFF]/10 to-[#5B21B6]/10 border border-[#2E5CFF]/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#2E5CFF]/20 border border-[#2E5CFF]/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2E5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Example Calculation</h2>
                <p className="text-sm text-neutral-400">See how the score is calculated</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* User Stats */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">User Profile</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">15</div>
                    <div className="text-xs text-neutral-400">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">80%</div>
                    <div className="text-xs text-neutral-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">72</div>
                    <div className="text-xs text-neutral-400">Avg Evidence</div>
                  </div>
                </div>
              </div>

              {/* Calculation */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Score Breakdown</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-300">Accuracy: 80% × 500</span>
                    </div>
                    <span className="text-blue-400 font-bold">400 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-300">Evidence: 72/100 × 300</span>
                    </div>
                    <span className="text-green-400 font-bold">216 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-300">Activity: 15 resolved</span>
                    </div>
                    <span className="text-purple-400 font-bold">150 pts</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Total Reliability Score</span>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] bg-clip-text text-transparent">766</span>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-purple-500/10 text-purple-400 border-purple-500/30">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                          <span className="font-semibold text-xs">Master</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">What Gets Scored?</h2>
                <p className="text-sm text-neutral-400">Understanding what counts toward your reputation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">Claims ARE Scored</div>
                    <p className="text-sm text-neutral-400">Your Claims (predictions you lock on-chain) are scored based on Reputation, Accuracy, Evidence Grade, and Activity. These directly impact your Reliability Score and Total Points.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">OSINT/News NOT Scored</div>
                    <p className="text-sm text-neutral-400">OSINT and News items are informational sources that can be used as evidence when resolving Claims, but they are not graded or scored. They do not contribute to anyone's reputation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contested Resolutions Section */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Contested Resolutions</h2>
                <p className="text-sm text-neutral-400">Community-verified truth through weighted voting</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">7-Day Dispute Window</div>
                    <p className="text-sm text-neutral-400">After a Claim is resolved, the community has 7 days to vote on whether the resolution is accurate. Only users with Reputation Score ≥ 150 can vote.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">Weighted Voting by Reputation</div>
                    <p className="text-sm text-neutral-400 mb-2">Your vote weight is calculated as: <span className="font-mono text-purple-400">1 + floor(repScore / 250)</span>, capped at 5. Higher reputation = more voting power.</p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <div>• Rep 0-249: 1 vote weight</div>
                      <div>• Rep 250-499: 2 vote weight</div>
                      <div>• Rep 500-749: 3 vote weight</div>
                      <div>• Rep 750-999: 4 vote weight</div>
                      <div>• Rep 1000+: 5 vote weight (max)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">Finalization Thresholds</div>
                    <p className="text-sm text-neutral-400 mb-2">After 7 days:</p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <div>• <span className="text-green-400 font-semibold">Weighted net ≥ +12</span> → Finalized (resolution stands)</div>
                      <div>• <span className="text-red-400 font-semibold">Weighted net ≤ -12</span> → Contested (resolution disputed)</div>
                      <div>• <span className="text-yellow-400 font-semibold">Between -11 and +11</span> → Remains contested, voting continues</div>
                    </div>
                    <p className="text-sm text-neutral-400 mt-2">If voting continues past 14 days without reaching threshold, the resolution finalizes to whichever side has more weighted votes.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">Reputation Impact</div>
                    <p className="text-sm text-neutral-400 mb-2">Only <span className="text-white font-semibold">Finalized</span> outcomes count toward your accuracy and reputation:</p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      <div>• <span className="text-green-400">Finalized Correct</span> → Full points + reputation boost</div>
                      <div>• <span className="text-red-400">Finalized Incorrect</span> → Normal incorrect penalty</div>
                      <div>• <span className="text-yellow-400">Contested (not finalized)</span> → No reputation impact until finalized</div>
                      <div>• <span className="text-orange-400">Overruled Resolution</span> → -25 rep penalty if your resolution is flipped by community vote</div>
                    </div>
                  </div>
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
            Lock Your First Claim
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
