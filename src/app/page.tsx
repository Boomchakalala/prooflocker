import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import HowItWorks from "@/components/HowItWorks";
import WhyProofLocker from "@/components/WhyProofLocker";
import TechFoundation from "@/components/TechFoundation";
import ProofCardPreview from "@/components/ProofCardPreview";
import DEStatusBanner from "@/components/DEStatusBanner";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] relative">
      {/* Header */}
      <LandingHeader />

      {/* Main content */}
      <main className="space-y-0">{/* Hero Section */}
        <LandingHero />

        {/* Proof Card Preview */}
        <ProofCardPreview />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Why ProofLocker Section */}
        <WhyProofLocker />

        {/* Final CTA Section */}
        <div className="relative z-10 py-16 px-4 bg-[#0f172a]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to make your mark?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
              Lock your first prediction in 10 seconds. Anonymous, immutable, shareable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xl font-bold rounded-xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                Lock My Prediction Now
              </Link>
            </div>
            <Link
              href="/app"
              className="inline-block mt-8 text-blue-400 hover:text-blue-300 text-base font-semibold underline hover:no-underline transition-all"
            >
              Browse existing predictions →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
