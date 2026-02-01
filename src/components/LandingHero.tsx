"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingHero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate DAG particles
    if (particlesRef.current) {
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = `dag-particle ${i % 2 === 0 ? "text-[#00bfff]" : "text-[#9370db]"}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${8 + Math.random() * 4}s`;
        particlesRef.current.appendChild(particle);
      }
    }
  }, []);

  return (
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center py-20 md:py-28 px-6 overflow-hidden gradient-bg">
      {/* DAG Particle Background */}
      <div ref={particlesRef} className="absolute inset-0 opacity-[0.12] pointer-events-none" />

      {/* Radial Glow Behind Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#9370db]/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 text-center">
        {/* EXACT Brand Headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          <span className="block text-white">Predictions.</span>
          <span className="block gradient-text">Locked forever.</span>
        </h1>

        {/* Exact Subheadline */}
        <p className="text-2xl md:text-3xl font-semibold text-white/85 mb-14 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
          Say it now. Prove it later.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/lock"
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#00bfff] to-[#9370db] hover:from-[#00a8e6] hover:to-[#7d5fc7] text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] btn-glow"
          >
            Lock my prediction
          </Link>
          <Link
            href="/app"
            className="w-full sm:w-auto px-10 py-4 border-2 border-white/20 hover:border-[#00bfff] hover:bg-white/5 text-white text-lg font-bold rounded-xl transition-all"
          >
            Explore predictions
          </Link>
        </div>

        {/* Enhanced Hero Bottom Section */}
        <div className="mt-12 relative max-w-6xl mx-auto">
          {/* Timing/Benefit Line */}
          <p className="text-base md:text-lg text-white/75 mb-12 font-medium tracking-wide max-w-3xl mx-auto">
            No signup required · Lock your prediction in ~10 seconds · Full accountability.
          </p>

          {/* Clean Open Row of Pill Badges with Icons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-4">
            {/* Badge 1: Anonymous */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-white/[0.02] border border-[#9370db]/30 hover:border-[#00ff00]/50 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,0,0.15),0_0_12px_rgba(147,112,219,0.2)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.1s'
            }}>
              {/* Ghost Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#9370db] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">Anonymous by default</span>
            </div>

            {/* Badge 2: On-Chain */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-white/[0.02] border border-[#00bfff]/30 hover:border-[#00ff00]/50 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,0,0.15),0_0_12px_rgba(0,191,255,0.2)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.2s'
            }}>
              {/* Chain Link Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#00bfff] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">Locked on-chain</span>
            </div>

            {/* Badge 3: Immutable */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-white/[0.02] border border-[#9370db]/30 hover:border-[#00ff00]/50 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,0,0.15),0_0_12px_rgba(147,112,219,0.2)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.3s'
            }}>
              {/* Shield Lock Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#9370db] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">Immutable proof</span>
            </div>

            {/* Badge 4: Shareable */}
            <div className="group w-full md:w-auto px-6 py-3 rounded-full bg-white/[0.02] border border-[#00bfff]/30 hover:border-[#00ff00]/50 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,0,0.15),0_0_12px_rgba(0,191,255,0.2)] animate-fade-in-left flex items-center gap-2.5" style={{
              animationDelay: '0.4s'
            }}>
              {/* Share Icon */}
              <svg className="w-4 h-4 flex-shrink-0 text-[#00bfff] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">Shareable cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
