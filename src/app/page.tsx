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

        {/* Globe Preview - Enhanced */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          {/* Dramatic background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a1a] to-[#0a0a0a]" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, rgba(46, 92, 255, 0.1) 50%, transparent 70%)' }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-14">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Intelligence</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#00E0FF] via-[#5B8CFF] to-[#C084FC] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
                The World in Real Time
              </h2>
              <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-8">
                Intel signals and locked claims mapped on a live globe. Monitor breaking events. Spot patterns early. Lock your claims before consensus forms.
              </p>
            </div>

            {/* Globe visual placeholder with stats overlay */}
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/60 border border-slate-700/50 rounded-2xl md:rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-cyan-500/5">
              <div className="aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
                {/* Globe illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border border-cyan-500/20 relative" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(0, 224, 255, 0.08) 0%, rgba(91, 33, 182, 0.05) 50%, transparent 70%)' }}>
                    {/* Orbit rings */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-[1.3] rotate-12" />
                    <div className="absolute inset-0 rounded-full border border-purple-500/10 scale-[1.6] -rotate-6" />
                    {/* Pulse dots */}
                    <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <div className="absolute top-[45%] right-[25%] w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-[30%] left-[55%] w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-[60%] left-[20%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                  </div>
                </div>

                {/* Floating stat cards */}
                <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-slate-900/90 border border-red-500/30 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] md:text-xs font-bold text-red-400 uppercase">Breaking</span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 mt-1 max-w-[180px]">New intel signals arriving</p>
                </div>

                <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 bg-slate-900/90 border border-emerald-500/30 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase">Claims</span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 mt-1">Locked & timestamped on-chain</p>
                </div>
              </div>
            </div>

            {/* CTA + micro stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/globe"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(0,224,255,0.2)] hover:shadow-[0_0_40px_rgba(0,224,255,0.4)] hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Open the Globe
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-4 border border-slate-600/50 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white font-semibold rounded-xl text-base transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Live Feed View
              </Link>
            </div>
          </div>
        </section>

        {/* Reputation Opens Doors */}
        <ReputationImpact />

        {/* Digital Evidence Section - Ties blockchain to reputation */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0020] to-[#0a0a0a]" />

          {/* Subtle glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <div className="w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(81, 106, 236, 0.2) 0%, rgba(91, 33, 182, 0.15) 50%, transparent 70%)' }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Section header */}
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                {/* Shield icon */}
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Powered by Digital Evidence</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#516aec] via-[#8594FF] to-[#C084FC] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Proof of Reputational Observation
              </h2>
              <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto">
                Every claim you lock passes through Constellation&apos;s Digital Evidence framework — the same tamper-proof infrastructure trusted by the U.S. Department of Defense. Your reputation isn&apos;t just a number. It&apos;s cryptographically proven.
              </p>
            </div>

            {/* Three-pillar flow */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* Pillar 1: Capture */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-blue-500/20 hover:border-blue-500/40 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(81,106,236,0.15)]">
                <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center mb-5">
                  {/* Fingerprint/hash icon */}
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Cryptographic Capture</h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  Your claim text is SHA-256 hashed at creation. The hash, timestamp, and metadata are signed and submitted to Constellation&apos;s Hypergraph — creating an immutable digital evidence record.
                </p>
              </div>

              {/* Pillar 2: Validate */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-xl flex items-center justify-center mb-5">
                  {/* Chain/link icon */}
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">DAG Validation</h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  Constellation&apos;s DAG-based Hypergraph processes transactions in parallel — no bottlenecks, no single point of failure. Every proof is validated by the network before it&apos;s finalized.
                </p>
              </div>

              {/* Pillar 3: Score */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-5">
                  {/* Chart/score icon */}
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Reputation Layer</h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  When you resolve a claim with evidence, the outcome feeds your weighted reputation score. Accuracy (50%) + Evidence Quality (30%) + Activity (20%) = math-backed reputation.
                </p>
              </div>
            </div>

            {/* Visual flow diagram */}
            <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/40 to-slate-900/80 border border-slate-700/40 rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                {/* Step flow */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-400 font-bold">Claim</div>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  <div className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-400 font-bold">SHA-256</div>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  <div className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-lg text-purple-400 font-bold">DAG</div>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  <div className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold">Reputation</div>
                </div>

                {/* Powered by */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Powered by</span>
                  <a href="https://constellationnetwork.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Constellation Network
                  </a>
                  <span>·</span>
                  <a href="https://digitalevidence.constellationnetwork.io/get-started" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Digital Evidence
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              Lock a claim. Prove it. Watch your reputation compound.
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
