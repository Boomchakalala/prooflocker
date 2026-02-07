import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import HowItWorks from "@/components/HowItWorks";
import ConstellationSection from "@/components/ConstellationSection";
import AccountabilityScore from "@/components/AccountabilityScore";
import WhyProofLocker from "@/components/WhyProofLocker";
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

        {/* Real Proof Section */}
        <ProofCardPreview />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Accountability Score Section */}
        <AccountabilityScore />

        {/* Why ProofLocker Section */}
        <WhyProofLocker />

        {/* Final CTA Section - Updated for Globe-first */}
        <div className="relative z-10 py-20 md:py-28 px-6 bg-gradient-to-b from-[#0A0A0F] via-[#111118]/30 to-[#0A0A0F]">
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
              Enter the Monitoring Hub
            </h2>
            <p className="text-lg md:text-xl text-[#F8F9FA] mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
              Track claims worldwide. Monitor OSINT signals. Build verifiable reputation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/globe"
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(46,92,255,0.4)] hover:scale-[1.05] btn-glow flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                Launch Globe
              </Link>
              <Link
                href="/lock"
                className="w-full sm:w-auto px-12 py-4 border-2 border-[#2E5CFF]/30 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm"
              >
                Lock Claim
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              Join users monitoring claims in real-time across 6 continents
            </p>
          </div>
        </div>

        {/* Constellation DAG Section - Final Trust Anchor */}
        <ConstellationSection />
      </main>

      <Footer />
    </div>
  );
}
