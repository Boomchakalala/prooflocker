import Link from "next/link";
import UnifiedHeader from "@/components/UnifiedHeader";
import LandingHero from "@/components/LandingHero";
import HowItWorks from "@/components/HowItWorks";
import ReputationImpact from "@/components/ReputationImpact";
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

        {/* How It Works - Compact 3-step */}
        <HowItWorks />

        {/* Globe Preview */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              The Globe is Live
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              OSINT signals and locked claims mapped in real time. Monitor events as they unfold, lock your claims, and watch the world prove you right.
            </p>
            <Link
              href="/globe"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Open the Globe
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              No signup required · Real-time updates
            </p>
          </div>
        </section>

        {/* Reputation Opens Doors */}
        <ReputationImpact />

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
