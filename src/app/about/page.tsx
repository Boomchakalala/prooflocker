"use client";

import Link from "next/link";
import UnifiedHeader from '@/components/UnifiedHeader';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white relative pt-16">
      <UnifiedHeader currentView="about" />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* DAG Network Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dag-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dag-grid)" />
          <line x1="30" y1="30" x2="90" y2="90" stroke="white" strokeWidth="0.5" opacity="0.5"/>
          <line x1="90" y1="30" x2="30" y2="90" stroke="white" strokeWidth="0.5" opacity="0.5"/>
          <line x1="30" y1="30" x2="150" y2="30" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            About ProofLocker
          </h1>
          <p className="text-slate-400 text-lg">
            Proof of Reputational Observation
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-10">
          <div className="bg-slate-900/60 border border-purple-500/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p className="text-lg leading-relaxed">
                ProofLocker exists to restore accountability in an era of endless claims and empty promises. We make it impossible to rewrite history, delete mistakes, or claim credit where none is due.
              </p>
              <p className="leading-relaxed">
                Every day, analysts make bold claims. Researchers uncover critical intelligence. Content creators stake their reputation on calls. Most of it gets forgotten. Some gets quietly deleted. Almost none gets permanently timestamped.
              </p>
              <p className="leading-relaxed">
                We believe words should have weight. Claims should have consequences. And track records should be transparent, permanent, and cryptographically provable.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-10">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What Makes Us Different</h2>
            <div className="space-y-5">
              {/* Anonymous by Default */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Anonymous by Default</h3>
                  <p className="text-slate-400 text-sm">
                    No signup required. Lock bold claims without revealing your identity. Claim them later if you want -- or stay anonymous forever. Your choice.
                  </p>
                </div>
              </div>

              {/* Immutable On-Chain */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Cryptographically Timestamped</h3>
                  <p className="text-slate-400 text-sm">
                    Every claim is hashed and timestamped on Constellation DAG in ~10 seconds. No edits. No deletions. No backdating. What you locked is locked forever with cryptographic proof.
                  </p>
                </div>
              </div>

              {/* Track Record Over Hype */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Track Record That Can't Be Faked</h3>
                  <p className="text-slate-400 text-sm">
                    Build your Reputation Score through consistent accuracy. Climb from Novice to Trusted to Expert to Master to Legend. Your reputation is transparent, verifiable, and earned through results -- not followers or blue checks.
                  </p>
                </div>
              </div>

              {/* OSINT & Evidence Integration */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Intelligence & Evidence Integration</h3>
                  <p className="text-slate-400 text-sm">
                    Link geospatial data, social media signals, and open-source intelligence directly to your claims. Intel signals are a live monitoring layer — only claims are scored.
                  </p>
                </div>
              </div>

              {/* Shareable Proof Cards */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Shareable Proof Cards</h3>
                  <p className="text-slate-400 text-sm">
                    When you're right, prove it. Generate proof cards with your claim, timestamp, and on-chain verification. Perfect for social media, portfolios, or building credibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built On Constellation */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Built on Constellation Network</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                ProofLocker uses <strong className="text-purple-300">Constellation DAG</strong> (Directed Acyclic Graph) for immutable, timestamped proof storage. Unlike traditional blockchains, Constellation's Hypergraph architecture provides:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900/60 rounded-lg p-5 border border-purple-500/20 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">~10s</div>
                  <div className="text-sm text-slate-400">Confirmation time</div>
                  <div className="text-xs text-slate-500 mt-1">Near-instant finality</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-5 border border-purple-500/20 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">$0.00</div>
                  <div className="text-sm text-slate-400">Transaction fees</div>
                  <div className="text-xs text-slate-500 mt-1">Zero-cost proofs</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-5 border border-purple-500/20 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">SHA-256</div>
                  <div className="text-sm text-slate-400">Hash verification</div>
                  <div className="text-xs text-slate-500 mt-1">Tamper-proof integrity</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-900/40 border border-slate-700/30 rounded-lg">
                <div className="text-xs font-mono text-slate-500 mb-2">// How it works</div>
                <div className="text-sm text-slate-400 space-y-1 font-mono">
                  <div><span className="text-purple-400">1.</span> Claim text is hashed using SHA-256</div>
                  <div><span className="text-purple-400">2.</span> Hash + metadata submitted to DAG Metagraph</div>
                  <div><span className="text-purple-400">3.</span> Consensus reached across validator nodes</div>
                  <div><span className="text-purple-400">4.</span> Immutable timestamp recorded on Hypergraph</div>
                  <div><span className="text-purple-400">5.</span> Proof hash returned and stored with claim</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-10">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Who Uses ProofLocker</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* OSINT Researchers */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <h3 className="text-base font-semibold text-white">OSINT Researchers</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Lock geospatial intelligence, verify timestamps on social signals, and build evidence chains. Prove you identified events before mainstream coverage.
                </p>
              </div>

              {/* Content Creators */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-base font-semibold text-white">Content Creators</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Make bold calls on camera. Lock them on-chain. Prove you called it before anyone else. Build undeniable credibility with cryptographic timestamps.
                </p>
              </div>

              {/* Investigative Journalists */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                  <h3 className="text-base font-semibold text-white">Investigative Journalists</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Timestamp breaking stories and investigative leads. Establish priority on discoveries. Protect source timelines with immutable, verifiable proof.
                </p>
              </div>

              {/* Market Analysts */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-base font-semibold text-white">Market Analysts</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Lock price targets, macro calls, and market analysis. Build a verifiable track record independent of your employer or public persona.
                </p>
              </div>

              {/* Security Researchers */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <h3 className="text-base font-semibold text-white">Security Researchers</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Document vulnerability disclosures, threat intelligence, and security advisories. Establish discovery timelines with tamper-proof timestamps.
                </p>
              </div>

              {/* Independent Researchers */}
              <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <h3 className="text-base font-semibold text-white">Independent Researchers</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Lock hypotheses, research findings, and analytical frameworks. Establish intellectual property and priority on discoveries anonymously.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Chain Visual */}
        <section className="mb-10">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">The Evidence Chain</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-emerald-500/50 hidden md:block" />

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-purple-400 font-bold text-sm">1</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold mb-1">Lock</h3>
                    <p className="text-slate-400 text-sm">Write your claim. Attach evidence. Submit for on-chain timestamping via Constellation DAG.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold mb-1">Verify</h3>
                    <p className="text-slate-400 text-sm">SHA-256 hash computed. Submitted to DAG metagraph. Consensus reached. Immutable proof returned.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-cyan-400 font-bold text-sm">3</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold mb-1">Resolve</h3>
                    <p className="text-slate-400 text-sm">When the outcome is known, claims are resolved as correct or incorrect. Evidence quality graded A through D.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-emerald-400 font-bold text-sm">4</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold mb-1">Prove</h3>
                    <p className="text-slate-400 text-sm">Your Reputation Score updates. Tier advances. Proof card generated. The record is permanent and verifiable.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-10">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Our Philosophy</h2>
            <div className="space-y-4 text-slate-300">
              <p className="text-lg leading-relaxed font-semibold text-white">
                We don't care who you are. We care what you said and whether you were right.
              </p>
              <p className="leading-relaxed">
                ProofLocker isn't about building a social network. It's about building a truth layer -- a permanent record where words have consequences and track records matter more than follower counts.
              </p>
              <p className="leading-relaxed">
                In a world of deepfakes, AI-generated content, and endless information warfare, cryptographic timestamps become the ultimate arbiters of truth. When did you say it? Can you prove it? Is there evidence?
              </p>
              <p className="leading-relaxed">
                We believe the best intelligence comes from everywhere -- not just verified accounts or institutional gatekeepers. Anonymous claims, transparent outcomes, and cryptographic proof level the playing field.
              </p>
              <p className="text-lg font-semibold text-white mt-6">
                Lock it now. Prove it later. Own the outcome.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/lock"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105"
          >
            Lock Your First Claim
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            No signup required. Takes 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
