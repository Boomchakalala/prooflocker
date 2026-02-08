"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LandingHero() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    totalClaims: 0,
    resolvedClaims: 0,
    totalUsers: 0,
  });

  // Fetch real stats from API
  useEffect(() => {
    Promise.all([
      fetch('/api/predictions').then(r => r.json()),
      fetch('/api/leaderboard?limit=1').then(r => r.json()),
    ]).then(([predictions, leaderboard]) => {
      const total = predictions?.total || 0;
      const resolved = predictions?.predictions?.filter((p: any) =>
        p.outcome === 'correct' || p.outcome === 'incorrect'
      ).length || 0;
      const users = leaderboard?.total || 0;
      setStats({ totalClaims: total, resolvedClaims: resolved, totalUsers: users });
    }).catch(() => {
      // Keep default values on error
    });
  }, []);

  useEffect(() => {
    // Generate lightweight particles for constellation effect
    if (particlesRef.current) {
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = `dag-particle ${i % 2 === 0 ? "text-[#2E5CFF]" : "text-[#5B21B6]"}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${10 + Math.random() * 8}s`;
        particlesRef.current.appendChild(particle);
      }
    }
  }, []);

  return (
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center py-24 md:py-32 px-6 md:px-8 overflow-hidden gradient-bg">
      {/* Constellation overlay */}
      <div className="constellation-overlay" />

      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 opacity-10 pointer-events-none" />

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
        {/* Massive gradient headline with enhanced animation */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tighter leading-[0.95] animate-fade-in-up px-4"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          <span className="gradient-text-animated font-black inline-block">Undeniable Credibility</span>
        </h1>

        {/* One Claim at a Time subtitle - BIGGER AND WHITE */}
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 animate-fade-in-up px-4 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)', animationDelay: '0.05s' }}>
          One Claim at a Time
        </p>

        {/* Subheadline - 2 lines, better hierarchy */}
        <div className="mb-7 animate-fade-in-up max-w-[560px] mx-auto px-4" style={{ animationDelay: '0.1s' }}>
          <p className="text-lg md:text-xl font-medium text-[#F8F9FA]/95 mb-2 leading-[1.45]" style={{ fontFamily: 'var(--font-inter)' }}>
            Track what people say — in real time.
          </p>
          <p className="text-lg md:text-xl font-medium text-[#F8F9FA]/75 leading-[1.45]" style={{ fontFamily: 'var(--font-inter)' }}>
            Lock the claim on-chain. Settle it with receipts.
          </p>
        </div>

        {/* Two big CTAs side-by-side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/lock"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(46,92,255,0.4)] hover:scale-[1.05] btn-glow"
          >
            Lock Your First Claim
          </Link>
          <Link
            href="/globe"
            className="w-full sm:w-auto px-12 py-4 border-2 border-[#2E5CFF]/40 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm hover:scale-[1.05] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            See The Globe
          </Link>
        </div>

        {/* Trust strip - compact under CTAs */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 text-xs md:text-sm text-[#F8F9FA]/70 animate-fade-in-up flex-wrap" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Timestamped on-chain</span>
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
            <span>Reputation score</span>
          </div>
        </div>

        {/* Stats - 3 mini tiles */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Claims settled */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-emerald-400 mb-0.5">
              {stats.resolvedClaims > 0 ? stats.resolvedClaims : '9'}
            </div>
            <div className="text-xs text-slate-400">Claims settled</div>
          </div>

          {/* Claim makers */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-cyan-400 mb-0.5">
              {stats.totalUsers > 0 ? stats.totalUsers : '2'}
            </div>
            <div className="text-xs text-slate-400">Claim makers</div>
          </div>

          {/* Proofs recorded */}
          <div className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-purple-400 mb-0.5">
              {stats.totalClaims > 0 ? stats.totalClaims : '33'}
            </div>
            <div className="text-xs text-slate-400">Proofs recorded</div>
          </div>
        </div>

        {/* Feature chips - 3 smaller, centered */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap animate-fade-in-up max-w-md mx-auto" style={{ animationDelay: '0.35s' }}>
          <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-[#F8F9FA]/80 backdrop-blur-sm flex items-center gap-1.5">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="whitespace-nowrap">Start in ~10 seconds</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-[#F8F9FA]/80 backdrop-blur-sm flex items-center gap-1.5">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span className="whitespace-nowrap">Proof can't be faked</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-[#F8F9FA]/80 backdrop-blur-sm flex items-center gap-1.5">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span className="whitespace-nowrap">Built for live events</span>
          </div>
        </div>
      </div>
    </div>
  );
}
