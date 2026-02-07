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
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05] animate-fade-in-up"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          <span className="block gradient-text-animated font-black">Undeniable Credibility.</span>
          <span className="block text-[#F8F9FA]/80 font-black mt-2">One Claim at a Time.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl font-medium text-[#F8F9FA]/85 mb-8 leading-relaxed max-w-4xl mx-auto animate-fade-in-up" style={{ fontFamily: 'var(--font-inter)', animationDelay: '0.1s' }}>
          Lock predictions before they happen. Resolve them with evidence. Build a track record that speaks for itself.
        </p>

        {/* Two big CTAs side-by-side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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

        {/* Stats ticker - animated counters */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-8 text-sm md:text-base animate-fade-in-up flex-wrap" style={{ animationDelay: '0.25s' }}>
          {stats.totalClaims > 0 && (
            <>
              <div className="flex items-center gap-2 text-purple-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span className="font-bold">{stats.totalClaims.toLocaleString()}</span>
                <span className="text-gray-400">Claims Locked</span>
              </div>
              <span className="text-[#4C1D95] hidden sm:inline">·</span>
            </>
          )}
          {stats.resolvedClaims > 0 && (
            <>
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="font-bold">{stats.resolvedClaims.toLocaleString()}</span>
                <span className="text-gray-400">Claims Resolved</span>
              </div>
              <span className="text-[#4C1D95] hidden sm:inline">·</span>
            </>
          )}
          {stats.totalUsers > 0 && (
            <div className="flex items-center gap-2 text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span className="font-bold">{stats.totalUsers.toLocaleString()}</span>
              <span className="text-gray-400">Predictors</span>
            </div>
          )}
        </div>

        {/* Feature badges - redesigned in a single centered row */}
        <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="px-5 py-2.5 rounded-full bg-[#5B21B6]/10 border border-[#5B21B6]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#5B21B6]/15 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#5B21B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <span className="font-bold whitespace-nowrap">No signup required</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#2E5CFF]/15 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2E5CFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Locked on-chain</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#5B21B6]/10 border border-[#5B21B6]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#5B21B6]/15 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#5B21B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Immutable proof</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#2E5CFF]/15 hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2E5CFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Lock in ~10 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
