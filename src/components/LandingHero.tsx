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

        {/* Small Muted Line */}
        <p className="text-sm text-gray-500 mb-6">
          No signup required • Takes ~10 seconds
        </p>

        {/* 4 Pill Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            Anonymous by default
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            Locked on-chain
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            Immutable proof
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
            Shareable cards
          </div>
        </div>
      </div>
    </div>
  );
}
