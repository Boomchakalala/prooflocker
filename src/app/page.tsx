import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import MomentOfTruth from "@/components/MomentOfTruth";
import HowItWorks from "@/components/HowItWorks";
import ReputationImpact from "@/components/ReputationImpact";
import WallOfWins from "@/components/WallOfWins";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import ProofCardPreview from "@/components/ProofCardPreview";
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

        {/* Real Proof Section */}
        <ProofCardPreview />

        {/* How It Works - Compact 3-step */}
        <HowItWorks />

        {/* Reputation Opens Doors */}
        <ReputationImpact />

        {/* Wall of Wins */}
        <WallOfWins />

        {/* Leaderboard Preview */}
        <LeaderboardPreview />

        {/* Final CTA Section */}
        <div className="relative z-10 py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-[#0A0A0F] via-[#111118]/30 to-[#0A0A0F]">
          {/* Enhanced glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div
              className="w-[800px] h-[800px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(91, 33, 182, 0.3) 0%, rgba(46, 92, 255, 0.2) 50%, transparent 70%)'
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Your First Prediction Could Change Everything
            </h2>
            <p className="text-lg md:text-xl text-[#F8F9FA]/80 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
              Lock a claim. Prove it. Watch your reputation compound. The best predictors started with one.
            </p>

            {/* Primary and Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-14 py-5 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_40px_rgba(46,92,255,0.5)] hover:scale-[1.05] btn-glow"
              >
                Lock Your First Claim
              </Link>
              <Link
                href="/globe"
                className="w-full sm:w-auto px-12 py-5 border-2 border-[#2E5CFF]/30 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                See The Globe
              </Link>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-col items-center gap-4">
              {/* User avatars with count */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    47
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    92
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    13
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                    58
                  </div>
                </div>
                <span className="text-sm text-slate-400">Join <span className="font-semibold text-white">1,247</span> predictors</span>
              </div>

              {/* Recent activity ticker */}
              <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300">
                <span className="text-emerald-400 font-semibold">Sarah</span> just resolved her 10th correct prediction
              </div>

              {/* Streak indicator */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-orange-400 text-lg">🔥</span>
                <span>5 users on 7+ streaks today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Constellation DAG Section - Final Trust Anchor */}
        <ConstellationSection />
      </main>

      <Footer />
    </div>
  );
}
