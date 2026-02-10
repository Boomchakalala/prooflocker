"use client";

import Link from "next/link";
import UnifiedHeader from '@/components/UnifiedHeader';
import TopSourcesList from '@/components/TopSourcesList';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-600/6 rounded-full blur-3xl" />
      </div>

      <UnifiedHeader currentView="leaderboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:py-24 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Reputation Registry
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Ranked by accuracy, evidence quality, and resolved claims. Reputation earned through outcomes.
          </p>
        </div>

        {/* Leaderboard Component */}
        <TopSourcesList category="all" />

        {/* Bottom CTAs */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/app?tab=my"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] text-center"
          >
            View My Claims
          </Link>
          <Link
            href="/lock"
            className="px-8 py-4 border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-white font-bold rounded-xl transition-all text-center"
          >
            Lock New Claim
          </Link>
        </div>
      </main>
    </div>
  );
}
