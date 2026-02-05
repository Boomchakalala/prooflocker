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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] relative overflow-hidden">
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

        {/* Final CTA Section */}
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
              Ready to Lock In?
            </h2>
            <p className="text-lg md:text-xl text-[#F8F9FA] mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
              Predictions. Goals. Business commitments. Immutable proof starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(46,92,255,0.4)] hover:scale-[1.05] btn-glow"
              >
                Lock Now
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto px-12 py-4 border-2 border-[#2E5CFF]/30 hover:border-[#2E5CFF] hover:bg-[#2E5CFF]/10 text-white text-lg font-bold rounded-xl transition-all backdrop-blur-sm"
              >
                Explore Proofs
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <a href="https://twitter.com/prooflocker" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#2E5CFF] transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://discord.gg/prooflocker" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#5B21B6] transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
              </a>
              <a href="https://t.me/prooflocker" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#2E5CFF] transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.768l-2.91-.908c-.632-.196-.644-.632.133-.936l11.372-4.382c.528-.196.99.123.82.877z"/>
                </svg>
              </a>
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
