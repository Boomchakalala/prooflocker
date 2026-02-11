"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingHero() {
  const [stats, setStats] = useState({
    totalClaims: 0,
    resolvedClaims: 0,
    intelArticles: 0,
  });

  // Fetch real stats from API
  useEffect(() => {
    Promise.all([
      fetch('/api/predictions').then(r => r.json()),
      fetch('/api/globe/activity?window=7d').then(r => r.json()),
    ]).then(([predData, activityData]) => {
      const allPredictions = predData?.predictions || [];
      const total = allPredictions.length || predData?.count || 0;
      const resolved = allPredictions.filter((p: any) =>
        p.outcome === 'correct' || p.outcome === 'incorrect'
      ).length || 0;
      // Use globe activity osint count (only geolocated items)
      const intel = activityData?.meta?.counts?.osint || 0;
      setStats({ totalClaims: total, resolvedClaims: resolved, intelArticles: intel });
    }).catch(() => {
      // Keep default values on error
    });
  }, []);

  return (
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center py-24 md:py-32 px-6 md:px-8 overflow-hidden gradient-bg">
      {/* Constellation overlay */}
      <div className="constellation-overlay" />

      {/* Radial glow - purple to blue */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[1200px] h-[1200px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(91, 33, 182, 0.15) 0%, rgba(46, 92, 255, 0.1) 40%, transparent 70%)',
            animation: 'breathe 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Centered Layout */}
      <div className="max-w-5xl mx-auto relative z-10 w-full text-center">
        {/* Massive gradient headline - 3 lines */}
        <h1
          className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black mb-4 tracking-tighter leading-[0.90] animate-fade-in-up px-4"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          <span className="gradient-text-animated font-black inline-block">Build Your</span>
          <br />
          <span className="gradient-text-animated font-black inline-block">Reputation</span>
          <br />
          <span className="text-white font-black inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl mt-1 md:mt-2">One Claim at a Time.</span>
        </h1>

        {/* Subheadline */}
        <div className="mb-4 animate-fade-in-up max-w-[620px] mx-auto px-4" style={{ animationDelay: '0.1s' }}>
          <p className="text-base md:text-xl font-medium text-[#F8F9FA]/85 leading-[1.45]" style={{ fontFamily: 'var(--font-inter)' }}>
            Lock claims on-chain. Resolve with receipts. Your track record is permanent, evidence-graded, and cryptographically provable.
          </p>
        </div>

        {/* Supporting line - Proof of Reputational Observation */}
        <div className="mb-7 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <p className="text-sm md:text-base font-semibold text-purple-400/90 tracking-wide">
            Proof of Reputational Observation — powered by Constellation DAG.
          </p>
        </div>

        {/* Two big CTAs side-by-side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/lock"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(46,92,255,0.4)] hover:scale-[1.05] btn-glow flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock a Claim
          </Link>
          <Link
            href="/globe"
            className="w-full sm:w-auto px-12 py-4 border-2 border-[#2E5CFF]/40 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm hover:scale-[1.05] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Explore Globe
          </Link>
        </div>

        {/* Trust strip - compact under CTAs */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 text-xs md:text-sm text-[#F8F9FA]/70 animate-fade-in-up flex-wrap" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>On-chain timestamped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>Evidence-graded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span>Reputation-scored</span>
          </div>
        </div>

        {/* Stats - 3 mini tiles - more compact */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Claims locked */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-xl md:text-2xl font-bold text-purple-400 mb-0.5">
              {stats.totalClaims || '--'}
            </div>
            <div className="text-xs text-slate-400">Claims Locked</div>
          </div>

          {/* Resolved */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-xl md:text-2xl font-bold text-emerald-400 mb-0.5">
              {stats.resolvedClaims || '--'}
            </div>
            <div className="text-xs text-slate-400">Resolved</div>
          </div>

          {/* Intel Articles */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-xl md:text-2xl font-bold text-red-400 mb-0.5">
              {stats.intelArticles || '--'}
            </div>
            <div className="text-xs text-slate-400">Intel Articles</div>
          </div>
        </div>

        {/* Micro-hook line */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <p className="text-sm text-[#F8F9FA]/65">
            No signup required · Anonymous by default · Receipts forever
          </p>
        </div>
      </div>
    </div>
  );
}
