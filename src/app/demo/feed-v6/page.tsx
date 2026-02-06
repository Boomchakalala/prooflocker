"use client";

export default function FeedDemoV6() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "Legend",
      time: "2 hours ago",
      category: "OSINT",
      title: "Bitcoin will hit $100K by end of Q1 2025 based on on-chain metrics showing accumulation patterns",
      outcome: "correct",
      evidenceScore: 94,
      hash: "0x7a9f...3d2c",
      votes: 47,
      verified: true,
    },
    {
      id: 2,
      author: "5678",
      tier: "Master",
      time: "5 hours ago",
      category: "Politics",
      title: "Election turnout will exceed 75% based on early voting data and historical trends",
      outcome: "pending",
      evidenceScore: null,
      hash: "0x1a2b...1e0d",
      votes: 23,
      verified: false,
    },
    {
      id: 3,
      author: "9012",
      tier: "Expert",
      time: "1 day ago",
      category: "Tech",
      title: "GPT-5 will be released before June 2025 according to leaked internal roadmaps",
      outcome: "incorrect",
      evidenceScore: 67,
      hash: "0x9e8d...0f9e",
      votes: 12,
      verified: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #F5F1ED, #EDE8E3)" }}>
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-stone-900">Warm Neutral Earth</h1>
              <p className="text-sm text-stone-600 mt-0.5">Cozy • Natural • Professional</p>
            </div>
            <a href="/demo/feed-v4" className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-sm font-medium transition-colors">
              ← Back to V4
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {mockPredictions.map((pred) => (
            <div
              key={pred.id}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-stone-200/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #D4A574 0%, #BC8A5F 100%)" }}
                  >
                    {pred.author.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-stone-900 font-medium">Anon #{pred.author}</span>
                      {pred.verified && (
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-medium">
                        {pred.tier}
                      </span>
                      <span>•</span>
                      <span>{pred.time}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg">
                  {pred.category}
                </span>
              </div>

              {/* Title */}
              <p className="text-stone-800 text-base leading-relaxed mb-4">
                {pred.title}
              </p>

              {/* Status & Evidence */}
              <div className="flex items-center gap-3 mb-4">
                {pred.outcome === "correct" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Correct
                  </div>
                ) : pred.outcome === "incorrect" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Incorrect
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Pending
                  </div>
                )}

                {pred.evidenceScore && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pred.evidenceScore}%`,
                          background: "linear-gradient(90deg, #D4A574 0%, #BC8A5F 100%)",
                        }}
                      />
                    </div>
                    <span className="text-sm text-stone-600 font-medium">{pred.evidenceScore}%</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {pred.votes}
                  </button>
                  <button className="px-4 py-1.5 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
                <code className="text-xs text-stone-400 font-mono">{pred.hash}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
