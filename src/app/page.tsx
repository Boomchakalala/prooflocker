import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import UnifiedHeader from "@/components/UnifiedHeader";
import LandingHero from "@/components/LandingHero";
import MomentOfTruth from "@/components/MomentOfTruth";
import HowItWorks from "@/components/HowItWorks";
import ReputationImpact from "@/components/ReputationImpact";
import WallOfWins from "@/components/WallOfWins";
import DEStatusBanner from "@/components/DEStatusBanner";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] relative">
      {/* Header */}
      <UnifiedHeader currentView="other" />

      {/* Main content */}
      <main className="space-y-0 relative">
        {/* Hero Section */}
        <LandingHero />

        {/* The Moment of Truth */}
        <MomentOfTruth />

        {/* How It Works - Compact 3-step */}
        <HowItWorks />

        {/* Wall of Wins - Real Claims (Horizontal Scroll) */}
        <WallOfWins />

        {/* Reputation Opens Doors */}
        <ReputationImpact />

        {/* Digital Evidence - Permanent Proof */}
        <div className="relative z-10 py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-[#0A0A0F] via-[#111118]/60 to-[#0A0A0F]">
          {/* Subtle glow background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div
              className="w-[700px] h-[700px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(91, 33, 182, 0.4) 0%, rgba(46, 92, 255, 0.3) 50%, transparent 70%)'
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-5 text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Your Permanent Proof of Record
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-[#F8F9FA]/75 max-w-2xl mx-auto leading-relaxed font-medium px-2">
                Every claim is timestamped on-chain. Can't be edited. Can't be deleted. Just there — forever.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              {/* Privacy First */}
              <div className="bg-gradient-to-br from-purple-600/5 via-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6 md:p-8 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-purple-500/20 border border-purple-500/40 mb-4 md:mb-5">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Privacy First
                </h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Only a cryptographic hash goes on-chain — not your claim text. You control who sees what.
                </p>
              </div>

              {/* Timestamped */}
              <div className="bg-gradient-to-br from-cyan-600/5 via-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl p-6 md:p-8 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/40 mb-4 md:mb-5">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Exact Timestamp
                </h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Proof of when you made the call. Down to the second. No one can backdate or alter it.
                </p>
              </div>

              {/* Verifiable */}
              <div className="bg-gradient-to-br from-blue-600/5 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 md:p-8 hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-blue-500/20 border border-blue-500/40 mb-4 md:mb-5">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Fully Verifiable
                </h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  Anyone can verify your proof independently. The blockchain doesn't lie — and neither can you.
                </p>
              </div>
            </div>

            {/* Visual Certificate Mockup */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-2 border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
                {/* Certificate Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-slate-400 font-medium">ProofLocker Certificate</p>
                      <p className="text-sm md:text-base text-white font-bold">On-Chain Proof Receipt</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                    <span className="text-xs md:text-sm text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-400">Claim ID:</span>
                    <span className="text-xs md:text-sm text-white font-mono">PL-2026-47A3B9</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-400">Locked:</span>
                    <span className="text-xs md:text-sm text-white font-mono">Feb 8, 2026 14:23:17 UTC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-400">Network:</span>
                    <span className="text-xs md:text-sm text-purple-400 font-semibold">Constellation DAG</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs md:text-sm text-slate-400">Hash:</span>
                    <span className="text-xs md:text-sm text-cyan-400 font-mono text-right break-all max-w-[60%]">
                      0x4a7c3f...e92b81
                    </span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 text-center italic">
                    This proof is permanent, verifiable, and tamper-proof.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <p className="text-center text-sm md:text-base text-slate-400 mt-8 md:mt-10 max-w-xl mx-auto leading-relaxed px-2">
              Built on <span className="text-purple-400 font-semibold">Constellation Network</span>. Every claim gets a cryptographic receipt you can verify forever.
            </p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="relative z-10 py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-[#0A0A0F] via-[#111118]/30 to-[#0A0A0F]">
          {/* Enhanced glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div
              className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(91, 33, 182, 0.3) 0%, rgba(46, 92, 255, 0.2) 50%, transparent 70%)'
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Start Building Your Reputation
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[#F8F9FA]/80 mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto font-medium px-2">
              Lock a claim. Prove it. Watch your credibility compound.
            </p>

            {/* Primary and Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg md:text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_40px_rgba(46,92,255,0.5)] hover:scale-[1.05] btn-glow"
              >
                Lock Your First Claim
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 border-2 border-[#2E5CFF]/30 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-base md:text-lg font-bold rounded-xl transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Explore Feed
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
