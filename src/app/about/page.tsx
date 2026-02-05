"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            About ProofLocker
          </h1>
          <p className="text-neutral-400">
            Making words mean something again
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
            <div className="space-y-4 text-neutral-300">
              <p className="text-lg leading-relaxed">
                ProofLocker exists to restore accountability in an era of endless predictions and empty promises. We make it impossible to rewrite history, delete mistakes, or claim credit where none is due.
              </p>
              <p className="leading-relaxed">
                Every day, experts make bold claims. Influencers predict market moves. Leaders promise outcomes. Most of it is forgotten. Some of it gets quietly deleted. Almost none of it gets tracked.
              </p>
              <p className="leading-relaxed">
                We believe words should have weight. Predictions should have consequences. And track records should be transparent, permanent, and provable.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What Makes Us Different</h2>
            <div className="space-y-6">
              {/* Anonymous by Default */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Anonymous by Default</h3>
                  <p className="text-neutral-400">
                    No signup required. Make bold predictions without revealing your identity. Claim them later if you want — or stay anonymous forever. Your choice.
                  </p>
                </div>
              </div>

              {/* Immutable On-Chain */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Immutable On-Chain Storage</h3>
                  <p className="text-neutral-400">
                    Every prediction is hashed and timestamped on Constellation DAG in ~10 seconds. No edits. No deletions. No excuses. What you locked is locked forever.
                  </p>
                </div>
              </div>

              {/* Track Record Over Hype */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Track Record Over Hype</h3>
                  <p className="text-neutral-400">
                    Build your Insight Score through consistent accuracy. Earn badges. Climb from Novice to Oracle. Your reputation is transparent, verifiable, and earned through results — not followers.
                  </p>
                </div>
              </div>

              {/* Shareable Proof Cards */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Shareable Proof Cards</h3>
                  <p className="text-neutral-400">
                    When you're right, flex it. Generate beautiful proof cards with your prediction, timestamp, and on-chain verification. Perfect for social media or portfolio flex.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Who Uses ProofLocker</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Market Analysts */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-[#2E5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Market Analysts</h3>
                </div>
                <p className="text-neutral-400 text-sm">
                  Lock price targets, macro calls, and market predictions. Build a verifiable track record separate from your employer.
                </p>
              </div>

              {/* Content Creators */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Content Creators</h3>
                </div>
                <p className="text-neutral-400 text-sm">
                  Make bold predictions on camera. Lock them on-chain. Prove you called it before anyone else. Undeniable timestamps.
                </p>
              </div>

              {/* Personal Goals */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Personal Commitments</h3>
                </div>
                <p className="text-neutral-400 text-sm">
                  Lock your goals. Marathon times. Business milestones. Fitness targets. Hold yourself accountable with immutable proof.
                </p>
              </div>

              {/* Business Leaders */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Business Leaders</h3>
                </div>
                <p className="text-neutral-400 text-sm">
                  Lock revenue targets, product launches, and strategic commitments. Public accountability for stakeholders and teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built On */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Built on Constellation Network</h2>
            <div className="space-y-4 text-neutral-300">
              <p className="leading-relaxed">
                ProofLocker uses <strong className="text-white">Constellation DAG</strong> for immutable, timestamped proof storage. Unlike traditional blockchains, Constellation's Hypergraph architecture provides:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-[#2E5CFF] mb-2">~10s</div>
                  <div className="text-sm text-neutral-400">Confirmation time</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">$0.00</div>
                  <div className="text-sm text-neutral-400">Gas fees</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">∞</div>
                  <div className="text-sm text-neutral-400">Permanent storage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team/Philosophy */}
        <section className="mb-12">
          <div className="glass border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Our Philosophy</h2>
            <div className="space-y-4 text-neutral-300">
              <p className="leading-relaxed">
                We don't care who you are. We care what you said and whether you were right.
              </p>
              <p className="leading-relaxed">
                ProofLocker isn't about building a social network. It's about building a truth layer. A permanent record where words have consequences and track records matter more than follower counts.
              </p>
              <p className="leading-relaxed">
                We believe the best ideas come from everywhere — not just verified accounts with blue checks. Anonymous predictions, transparent outcomes, and verifiable proof level the playing field.
              </p>
              <p className="text-lg font-semibold text-white mt-6">
                Say it now. Prove it later. Own the outcome.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(46,92,255,0.5)] hover:scale-105"
          >
            Lock Your First Prediction
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            No signup required. Takes 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
