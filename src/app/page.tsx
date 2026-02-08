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
              Your First Prediction Could Change Everything
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-[#F8F9FA]/80 mb-6 md:mb-8 leading-relaxed max-w-3xl mx-auto font-medium px-2">
              Lock a claim. Prove it. Watch your reputation compound.
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
                See The Globe
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
                <span className="text-emerald-400 font-semibold">Sarah</span> just resolved her 10th correct prediction
              </div>
            </div>
          </div>
        </div>

        {/* Constellation DAG Section - Footer */}
        <div className="relative z-10 py-8 md:py-12 px-4 md:px-6 bg-[#0A0A0F]/95 border-t border-slate-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 100 100">
                <circle cx="50" cy="30" r="4" fill="currentColor"/>
                <circle cx="30" cy="50" r="4" fill="currentColor"/>
                <circle cx="70" cy="50" r="4" fill="currentColor"/>
                <circle cx="50" cy="70" r="4" fill="currentColor"/>
                <line x1="50" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <line x1="50" y1="30" x2="70" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <line x1="30" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <line x1="70" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              </svg>
              <span className="text-xs md:text-sm text-slate-400">Secured by Constellation DAG</span>
            </div>
            <p className="text-xs md:text-sm text-slate-500">All predictions are cryptographically timestamped and stored immutably on-chain</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
