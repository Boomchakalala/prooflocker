"use client";

export default function FeedDemoV1() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "legend",
      time: "2h ago",
      category: "Intel",
      title: "Bitcoin will hit $100K by end of Q1 2025 based on on-chain metrics showing accumulation patterns",
      outcome: "correct",
      evidenceScore: 94,
      hash: "0x7a9f8d3c2b1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
      votes: 47,
      onChain: true,
      verified: true,
    },
    {
      id: 2,
      author: "5678",
      tier: "master",
      time: "5h ago",
      category: "Politics",
      title: "The upcoming election will see voter turnout exceed 75% based on early voting data",
      outcome: "pending",
      evidenceScore: null,
      hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      votes: 23,
      onChain: true,
      verified: false,
    },
    {
      id: 3,
      author: "9012",
      tier: "expert",
      time: "1d ago",
      category: "Tech",
      title: "GPT-5 will be released before June 2025 according to leaked internal roadmaps",
      outcome: "incorrect",
      evidenceScore: 67,
      hash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e",
      votes: 12,
      onChain: false,
      verified: false,
    },
  ];

  const getTierBadge = (tier: string) => {
    const badges = {
      legend: { icon: "⭐", color: "from-purple-500 to-pink-500", text: "text-purple-200" },
      master: { icon: "👑", color: "from-blue-500 to-cyan-500", text: "text-blue-200" },
      expert: { icon: "💎", color: "from-emerald-500 to-teal-500", text: "text-emerald-200" },
      trusted: { icon: "✓", color: "from-yellow-500 to-amber-500", text: "text-yellow-200" },
    };
    return badges[tier as keyof typeof badges] || badges.expert;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Intel: "from-indigo-500/20 to-violet-500/20 border-indigo-400/50 text-indigo-300",
      Politics: "from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300",
      Tech: "from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-300",
      Crypto: "from-cyan-500/20 to-teal-500/20 border-cyan-400/50 text-cyan-300",
    };
    return colors[category as keyof typeof colors] || colors.Tech;
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #0A0A0F, #050509)" }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Version 1: Premium Dark Glassmorphism 🌌
            </h1>
            <a href="/demo/feed-v2" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              Next Version →
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-2">Deep purples • Electric blues • Emerald greens • Sophisticated & futuristic</p>
        </div>
      </div>

      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockPredictions.map((pred, index) => {
            const tierBadge = getTierBadge(pred.tier);
            const categoryColor = getCategoryColor(pred.category);

            return (
              <div
                key={pred.id}
                className="group relative rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer animate-fade-in"
                style={{
                  background: "rgba(20, 20, 30, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  boxShadow: pred.outcome === "correct"
                    ? "0 0 20px rgba(16, 185, 129, 0.15)"
                    : pred.outcome === "incorrect"
                    ? "0 0 20px rgba(239, 68, 68, 0.15)"
                    : "0 0 15px rgba(139, 92, 246, 0.1)",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Top quality bar for high evidence */}
                {pred.evidenceScore && pred.evidenceScore >= 90 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-t-2xl" />
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-lg font-bold text-purple-300 border border-purple-500/40">
                      {pred.author.slice(-2)}
                    </div>
                    <div>
                      <div className="text-white font-semibold">Anon #{pred.author}</div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tierBadge.color} ${tierBadge.text} text-xs font-bold border border-white/20 mt-1`}>
                        <span>{tierBadge.icon}</span>
                        <span>{pred.tier.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{pred.time}</span>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border bg-gradient-to-r ${categoryColor}`}>
                    {pred.category}
                  </span>
                  {pred.onChain && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/15 border border-purple-400/40 text-purple-300">
                      On-Chain
                    </span>
                  )}
                  {pred.verified && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
                      Verified
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-white text-lg font-bold mb-4 leading-snug">
                  {pred.title}
                </h3>

                {/* Outcome & Evidence */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {pred.outcome === "correct" ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Correct
                    </span>
                  ) : pred.outcome === "incorrect" ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Incorrect
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 text-sm font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                      </svg>
                      Pending
                    </span>
                  )}

                  {pred.evidenceScore && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/40">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-bold text-white">{pred.evidenceScore}/100</span>
                    </div>
                  )}
                </div>

                {/* Hash */}
                <div className="mb-4 p-3 rounded-xl bg-black/40 border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-xs text-gray-400">
                      {pred.hash.slice(0, 16)}...{pred.hash.slice(-12)}
                    </code>
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <svg className="w-4 h-4 text-gray-500 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all font-semibold text-sm">
                    <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {pred.votes}
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-semibold text-sm">
                    View
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
