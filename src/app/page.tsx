import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import MomentOfTruth from "@/components/MomentOfTruth";
import HowItWorks from "@/components/HowItWorks";
import ReputationImpact from "@/components/ReputationImpact";
import WallOfWins from "@/components/WallOfWins";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import DEStatusBanner from "@/components/DEStatusBanner";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] relative">
      {/* Header */}
      <LandingHeader />

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

        {/* Leaderboard Preview */}
        <LeaderboardPreview />

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
            <p className="text-base md:text-lg lg:text-xl text-[#F8F9FA]/80 mb-6 md:mb-8 leading-relaxed max-w-3xl mx-auto font-medium px-2">
              Lock a claim. Prove it. Watch your credibility compound.
            </p>

            {/* Primary and Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6 md:mb-10">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg md:text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_40px_rgba(46,92,255,0.5)] hover:scale-[1.05] btn-glow"
              >
                Lock Your First Claim
              </Link>
              <Link
                href="/globe"
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 border-2 border-[#2E5CFF]/30 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-base md:text-lg font-bold rounded-xl transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                Explore The Globe
              </Link>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-col items-center gap-3 md:gap-4">
              {/* User avatars with count */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    47
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    92
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    13
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    58
                  </div>
                </div>
                <span className="text-xs md:text-sm text-slate-400">Join <span className="font-semibold text-white">1,247</span> predictors</span>
              </div>

              {/* Recent activity ticker */}
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-xs md:text-sm text-slate-300">
                <span className="text-emerald-400 font-semibold">Sarah</span> just resolved her 10th correct claim
              </div>
            </div>
          </div>
        </div>

        {/* Constellation DAG Section - Trust Anchor */}
        <div className="relative z-10 py-12 md:py-16 px-4 md:px-6 bg-[#0A0A0F]/95 border-t border-slate-800/50">
          <div className="max-w-5xl mx-auto text-center">
            {/* DAG Visual */}
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <svg className="w-32 h-24 md:w-40 md:h-32 text-purple-500/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 200 150">
                {/* Nodes */}
                <circle cx="100" cy="40" r="6" fill="currentColor" className="text-purple-400"/>
                <circle cx="60" cy="75" r="6" fill="currentColor" className="text-cyan-400"/>
                <circle cx="140" cy="75" r="6" fill="currentColor" className="text-blue-400"/>
                <circle cx="100" cy="110" r="6" fill="currentColor" className="text-purple-500"/>
                <circle cx="40" cy="110" r="5" fill="currentColor" className="text-purple-300" opacity="0.6"/>
                <circle cx="160" cy="110" r="5" fill="currentColor" className="text-blue-300" opacity="0.6"/>

                {/* Edges */}
                <line x1="100" y1="40" x2="60" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="text-purple-400"/>
                <line x1="100" y1="40" x2="140" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="text-purple-400"/>
                <line x1="60" y1="75" x2="100" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="text-cyan-400"/>
                <line x1="140" y1="75" x2="100" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="text-blue-400"/>
                <line x1="60" y1="75" x2="40" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.3" className="text-purple-300"/>
                <line x1="140" y1="75" x2="160" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.3" className="text-blue-300"/>

                {/* Glow effects */}
                <circle cx="100" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" className="text-purple-400"/>
                <circle cx="100" cy="110" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" className="text-purple-500"/>
              </svg>
            </div>

            {/* Text */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Secured by Constellation Network
            </h3>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
              All claims are cryptographically timestamped and stored immutably on-chain using Constellation's DAG architecture. Your proof is permanent, verifiable, and tamper-proof.
            </p>

            {/* Tech badges */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8 flex-wrap">
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs md:text-sm text-purple-300 font-semibold">
                DAG Architecture
              </div>
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs md:text-sm text-cyan-300 font-semibold">
                Immutable Timestamps
              </div>
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs md:text-sm text-blue-300 font-semibold">
                Cryptographic Proof
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
