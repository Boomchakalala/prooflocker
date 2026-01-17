import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LandingHeader from "@/components/LandingHeader";
import LandingHero from "@/components/LandingHero";
import HowItWorks from "@/components/HowItWorks";
import WhyProofLocker from "@/components/WhyProofLocker";
import ProofCardPreview from "@/components/ProofCardPreview";
import DEStatusBanner from "@/components/DEStatusBanner";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <LandingHero />

        {/* Proof Card Preview */}
        <ProofCardPreview />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Why ProofLocker Section */}
        <WhyProofLocker />

        {/* Final CTA Section */}
        <div className="relative z-10 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass border border-white/10 rounded-3xl p-12 md:p-16 glow-purple">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to lock your prediction?
              </h2>
              <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Create your first prediction in 10 seconds.
              </p>
              <Link
                href="/lock"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
              >
                Lock my prediction
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 glass relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 hidden md:block">
              <span className="text-white/70">Powered by Digital Evidence (DAG)</span>
            </p>
            <p className="flex-1 text-center text-sm text-neutral-500">
              Anonymous • Public • Immutable
            </p>
            <div className="hidden md:flex items-center gap-6 w-[200px] justify-end">
              <Link
                href="/app"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Explore predictions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Development status banner */}
      <DEStatusBanner />
    </div>
  );
}
