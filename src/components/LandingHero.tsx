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
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
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
        <div className="mt-12 relative">
          {/* Subtle Premium Value Block Container */}
          <div className="max-w-5xl mx-auto p-8 md:p-10 rounded-2xl bg-gradient-to-b from-[#1a1a1a]/40 to-[#0f0f0f]/40 border border-transparent" style={{
            backgroundClip: 'padding-box',
            borderImage: 'linear-gradient(135deg, rgba(0, 255, 0, 0.15), rgba(147, 112, 219, 0.15), rgba(0, 191, 255, 0.15)) 1'
          }}>

            {/* Timing/Benefit Line - Larger & Emphasized */}
            <p className="text-base md:text-lg text-white/90 mb-4 font-semibold tracking-wide" style={{
              textShadow: '0 0 20px rgba(0, 191, 255, 0.3)'
            }}>
              No signup required • Lock your prediction in ~10 seconds
            </p>

            {/* Connective Sentence */}
            <p className="text-sm md:text-base text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Lock bold predictions instantly – no barriers, no regrets, full accountability.
            </p>

            {/* Enhanced 4 Pill Badges with Icons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3">
              {/* Badge 1: Anonymous */}
              <div className="group w-full md:w-auto min-w-[240px] px-5 py-3.5 rounded-full bg-gradient-to-r from-[#9370db]/5 to-[#00bfff]/5 border-2 border-[#9370db]/30 hover:border-[#00ff00]/40 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00bfff]/20 animate-fade-in-left flex items-center gap-3 justify-center" style={{
                animationDelay: '0.1s'
              }}>
                {/* Ghost/Masked Icon */}
                <svg className="w-5 h-5 flex-shrink-0 text-[#9370db] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" opacity="0.3"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12v7a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 001 1h2a1 1 0 001-1v-7c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="text-xs md:text-sm font-medium">Anonymous by default – Lock without revealing identity</span>
              </div>

              {/* Badge 2: On-Chain */}
              <div className="group w-full md:w-auto min-w-[240px] px-5 py-3.5 rounded-full bg-gradient-to-r from-[#9370db]/5 to-[#00bfff]/5 border-2 border-[#9370db]/30 hover:border-[#00ff00]/40 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00bfff]/20 animate-fade-in-left flex items-center gap-3 justify-center" style={{
                animationDelay: '0.2s'
              }}>
                {/* Chain-Link + Blockchain Icon */}
                <svg className="w-5 h-5 flex-shrink-0 text-[#00bfff] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </svg>
                <span className="text-xs md:text-sm font-medium">Locked on-chain – Cryptographic hash + timestamp forever</span>
              </div>

              {/* Badge 3: Immutable */}
              <div className="group w-full md:w-auto min-w-[240px] px-5 py-3.5 rounded-full bg-gradient-to-r from-[#9370db]/5 to-[#00bfff]/5 border-2 border-[#9370db]/30 hover:border-[#00ff00]/40 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00bfff]/20 animate-fade-in-left flex items-center gap-3 justify-center" style={{
                animationDelay: '0.3s'
              }}>
                {/* Locked Shield Icon */}
                <svg className="w-5 h-5 flex-shrink-0 text-[#9370db] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v2m0 4h.01M9 17h6" opacity="0.6"/>
                  <rect x="10" y="10" width="4" height="5" rx="1" fill="currentColor" opacity="0.3"/>
                </svg>
                <span className="text-xs md:text-sm font-medium">Immutable proof – Tamper-proof digital evidence on Constellation DAG</span>
              </div>

              {/* Badge 4: Shareable */}
              <div className="group w-full md:w-auto min-w-[240px] px-5 py-3.5 rounded-full bg-gradient-to-r from-[#9370db]/5 to-[#00bfff]/5 border-2 border-[#9370db]/30 hover:border-[#00ff00]/40 text-sm text-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00bfff]/20 animate-fade-in-left flex items-center gap-3 justify-center" style={{
                animationDelay: '0.4s'
              }}>
                {/* Share Arrow Icon */}
                <svg className="w-5 h-5 flex-shrink-0 text-[#00bfff] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  <rect x="2" y="9" width="6" height="6" rx="1" stroke="currentColor" opacity="0.4"/>
                </svg>
                <span className="text-xs md:text-sm font-medium">Shareable cards – Prove it later with undeniable receipts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
