"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingHero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate enhanced DAG particles
    if (particlesRef.current) {
      const particleCount = 40; // Increased for better constellation effect
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = `dag-particle ${i % 2 === 0 ? "text-[#00D4FF]" : "text-[#A78BFA]"}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${8 + Math.random() * 6}s`;
        particlesRef.current.appendChild(particle);
      }
    }
  }, []);

  return (
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center py-24 md:py-28 px-8 overflow-hidden gradient-bg">
      {/* Enhanced Constellation Overlay */}
      <div className="constellation-overlay" />

      {/* DAG Particle Background */}
      <div ref={particlesRef} className="absolute inset-0 opacity-[0.18] pointer-events-none" />

      {/* Enhanced Radial Glow Behind Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[1200px] h-[1200px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(0, 212, 255, 0.15) 40%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 text-center">
        {/* EXACT Brand Headline - with enhanced gradient */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          <span className="block text-white text-shadow-cyan">Predictions.</span>
          <span className="block gradient-text font-extrabold">Locked forever.</span>
        </h1>

        {/* Exact Subheadline - refined */}
        <p className="text-2xl md:text-3xl font-semibold text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
          Say it now. Prove it later.
        </p>

        {/* CTA Buttons - refined with cyan gradient */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/lock"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#00D4FF] to-[#A78BFA] hover:from-[#00bfff] hover:to-[#9370db] text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.03] btn-glow"
          >
            Lock a Prediction
          </Link>
          <Link
            href="/app"
            className="w-full sm:w-auto px-12 py-4 border-2 border-[#A78BFA]/30 hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm"
          >
            Explore Proofs
          </Link>
        </div>

        {/* Enhanced Hero Bottom Section */}
        <div className="mt-10 relative max-w-6xl mx-auto">
          {/* Timing/Benefit Line - refined wording */}
          <p className="text-base md:text-lg text-white/80 mb-10 font-medium tracking-wide max-w-3xl mx-auto">
            No signup required · Lock in ~10 seconds · Full accountability
          </p>

          {/* Clean Open Row of Pill Badges with Icons - enhanced colors */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-4">
            {/* Badge 1: Anonymous */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-[#A78BFA]/5 border border-[#A78BFA]/25 hover:border-[#00D4FF]/60 hover:bg-[#A78BFA]/10 text-sm text-gray-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(167,139,250,0.25)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.1s'
            }}>
              {/* Ghost Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#A78BFA] group-hover:scale-110 group-hover:text-[#00D4FF] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Anonymous by default</span>
            </div>

            {/* Badge 2: On-Chain */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-[#00D4FF]/5 border border-[#00D4FF]/25 hover:border-[#A78BFA]/60 hover:bg-[#00D4FF]/10 text-sm text-gray-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,212,255,0.25)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.2s'
            }}>
              {/* Chain Link Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#00D4FF] group-hover:scale-110 group-hover:text-[#A78BFA] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Locked on-chain</span>
            </div>

            {/* Badge 3: Immutable */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-[#A78BFA]/5 border border-[#A78BFA]/25 hover:border-[#00D4FF]/60 hover:bg-[#A78BFA]/10 text-sm text-gray-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(167,139,250,0.25)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.3s'
            }}>
              {/* Shield Lock Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#A78BFA] group-hover:scale-110 group-hover:text-[#00D4FF] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Immutable proof</span>
            </div>

            {/* Badge 4: Shareable */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-[#00D4FF]/5 border border-[#00D4FF]/25 hover:border-[#A78BFA]/60 hover:bg-[#00D4FF]/10 text-sm text-gray-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,212,255,0.25)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.4s'
            }}>
              {/* Share Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#00D4FF] group-hover:scale-110 group-hover:text-[#A78BFA] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Shareable cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
