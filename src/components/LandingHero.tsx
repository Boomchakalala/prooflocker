"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingHero() {
  const particlesRef = useRef<HTMLDivElement>(null);

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

      {/* Asymmetric Layout: 60/40 on desktop, stacked on mobile */}
      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 items-center">
          {/* Left: Text content (60%) */}
          <div className="text-center lg:text-left">
            {/* Massive gradient headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-[1.1]"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              <span className="block text-[#F8F9FA] text-shadow-cyan font-black">Predictions.</span>
              <span className="block gradient-text font-black">Locked forever.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl font-bold text-[#F8F9FA] mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
              Say it now. Prove it later.
            </p>

            {/* Two big CTAs side-by-side */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(46,92,255,0.4)] hover:scale-[1.05] btn-glow"
              >
                Lock a Prediction
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto px-12 py-4 border-2 border-[#2E5CFF]/40 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm"
              >
                Explore Proofs
              </Link>
            </div>

            {/* Trust line with blue icons */}
            <p className="text-sm md:text-base text-[#9CA3AF] font-medium flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <svg className="w-4 h-4 text-[#2E5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              No signup required
              <span className="text-[#4C1D95]">·</span>
              Lock in ~10 seconds
              <span className="text-[#4C1D95]">·</span>
              Full accountability
            </p>
          </div>

          {/* Right: Visual (40%) - Floating mock card */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Floating proof card mock */}
              <div className="bg-[#1F2937] border border-[#4C1D95] rounded-2xl p-6 shadow-xl hover:shadow-[0_0_15px_rgba(46,92,255,0.3)] transition-all duration-300 max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2E5CFF]/20 flex items-center justify-center border border-[#2E5CFF]/40">
                    <span className="text-[#2E5CFF] font-bold text-sm">42</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Anon #8421</div>
                    <div className="text-[#9CA3AF] text-xs">2 hours ago</div>
                  </div>
                </div>

                <h3 className="text-white text-lg font-bold mb-3 leading-snug">
                  Bitcoin exceeds $250K by Dec 31, 2026
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#9CA3AF]">Status</span>
                  <span className="px-3 py-1 bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 text-[#2E5CFF] text-xs font-bold rounded-full">
                    Locked
                  </span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                  <div className="text-[9px] text-[#9CA3AF] mb-1 uppercase tracking-wider">On-chain Hash</div>
                  <code className="font-mono text-[11px] text-[#9CA3AF] truncate block">
                    481d8d0235169594...ba445f1be3
                  </code>
                </div>
              </div>

              {/* Glow effect behind card */}
              <div className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-gradient-to-br from-[#5B21B6] to-[#2E5CFF] rounded-2xl transform scale-105" />
            </div>
          </div>
        </div>

        {/* Feature badges below (mobile: centered, desktop: left-aligned) */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 flex-wrap max-w-4xl">
          <div className="px-5 py-2.5 rounded-full bg-[#5B21B6]/10 border border-[#5B21B6]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#5B21B6]/15 hover:scale-105 flex items-center gap-2 animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
            <svg className="w-4 h-4 text-[#5B21B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Anonymous by default</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#2E5CFF]/15 hover:scale-105 flex items-center gap-2 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
            <svg className="w-4 h-4 text-[#2E5CFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Locked on-chain</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#5B21B6]/10 border border-[#5B21B6]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#5B21B6]/15 hover:scale-105 flex items-center gap-2 animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
            <svg className="w-4 h-4 text-[#5B21B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Immutable proof</span>
          </div>

          <div className="px-5 py-2.5 rounded-full bg-[#2E5CFF]/10 border border-[#2E5CFF]/30 text-xs md:text-sm text-[#F8F9FA] backdrop-blur-sm transition-all duration-300 hover:bg-[#2E5CFF]/15 hover:scale-105 flex items-center gap-2 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
            <svg className="w-4 h-4 text-[#2E5CFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            <span className="font-bold whitespace-nowrap">Shareable cards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
