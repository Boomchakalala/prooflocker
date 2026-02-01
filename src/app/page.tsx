import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import HowItWorks from "@/components/HowItWorks";
import WhyProofLocker from "@/components/WhyProofLocker";
import ProofCardPreview from "@/components/ProofCardPreview";
import DEStatusBanner from "@/components/DEStatusBanner";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <LandingHeader />

      {/* Main content */}
      <main className="space-y-12 md:space-y-16">
        {/* Hero Section */}
        <LandingHero />

        {/* Proof Card Preview */}
        <ProofCardPreview />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Why ProofLocker Section */}
        <WhyProofLocker />

        {/* Final CTA Section */}
        <div className="relative z-10 py-16 md:py-20 px-4 bg-gradient-to-b from-white via-blue-50/30 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Ready to make your mark?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 md:mb-10 max-w-2xl mx-auto">
              Create your first prediction in 10 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link
                href="/lock"
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xl font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Lock My Prediction Now
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto px-10 py-5 text-blue-600 hover:text-blue-700 text-lg font-semibold underline decoration-2 underline-offset-4 hover:decoration-4 transition-all"
              >
                Browse existing predictions
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Development status banner */}
      <DEStatusBanner />
    </div>
  );
}
