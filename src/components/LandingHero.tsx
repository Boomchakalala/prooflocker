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
    <div className="relative z-10 min-h-[85vh] flex items-center justify-center py-24 px-6 overflow-hidden gradient-bg">
      {/* DAG Particle Background - reduced opacity */}
      <div ref={particlesRef} className="absolute inset-0 opacity-[0.12] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto relative z-10 px-6 md:px-12 lg:px-16">
        {/* Main headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-[80px] font-bold text-white mb-8 tracking-tight leading-[1.1] text-shadow-blue"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Predictions & Commitments.<br />
          <span className="gradient-text">
            Locked Forever.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-[#E0E0E0] mb-14 max-w-3xl leading-[1.6]" style={{ fontFamily: 'var(--font-inter)' }}>
          Declare it now. Prove it later — immutable on Constellation DAG.
        </p>

        {/* Key benefits with left-aligned bullets - tighter spacing */}
        <div className="max-w-3xl mb-16 space-y-5">
          <div className="flex items-start gap-4">
            <svg className="w-7 h-7 text-[#00bfff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <p className="text-[17px] md:text-[18px] text-white leading-[1.5]">
              <span className="font-semibold">Anonymous by default</span> — no signup, no KYC.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <svg className="w-7 h-7 text-[#00bfff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[17px] md:text-[18px] text-white leading-[1.5]">
              <span className="font-semibold">Lock in ~10 seconds</span> — fast and seamless.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <svg className="w-7 h-7 text-[#00bfff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-[17px] md:text-[18px] text-white leading-[1.5]">
              <span className="font-semibold">Fully on-chain</span> — DAG-powered speed & scalability.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <svg className="w-7 h-7 text-[#00bfff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-[17px] md:text-[18px] text-white leading-[1.5]">
              <span className="font-semibold">Immutable proof</span> — timestamped, tamper-proof, permanent.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <svg className="w-7 h-7 text-[#00bfff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <p className="text-[17px] md:text-[18px] text-white leading-[1.5]">
              <span className="font-semibold">Shareable cards</span> — verifiable evidence of your calls.
            </p>
          </div>
        </div>

        {/* CTA Buttons - cleaner spacing */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Link
            href="/lock"
            className="px-10 py-5 bg-[#9370db] hover:bg-[#7d5fc7] text-white text-[18px] font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center gap-3 btn-glow"
          >
            Lock My First Prediction
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/app"
            className="px-10 py-5 border-2 border-[#00bfff] hover:bg-[#00bfff]/10 text-white text-[18px] font-bold rounded-lg transition-all flex items-center gap-3"
          >
            Explore Locked Proofs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
