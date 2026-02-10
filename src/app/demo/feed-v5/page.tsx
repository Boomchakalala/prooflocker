"use client";

export default function FeedDemoV5() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "Legend",
      time: "2h",
      category: "Intel",
      title: "Bitcoin will hit $100K by end of Q1 2025 based on on-chain metrics showing accumulation patterns",
      outcome: "correct",
      evidenceScore: 94,
      hash: "7a9f8d3c",
      votes: 47,
      verified: true,
    },
    {
      id: 2,
      author: "5678",
      tier: "Master",
      time: "5h",
      category: "Politics",
      title: "Election turnout will exceed 75% based on early voting data and historical trends",
      outcome: "pending",
      evidenceScore: null,
      hash: "1a2b3c4d",
      votes: 23,
      verified: false,
    },
    {
      id: 3,
      author: "9012",
      tier: "Expert",
      time: "1d",
      category: "Tech",
      title: "GPT-5 will be released before June 2025 according to leaked internal roadmaps",
      outcome: "incorrect",
      evidenceScore: 67,
      hash: "9e8d7c6b",
      votes: 12,
      verified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">Slate & Accent</h1>
              <p className="text-sm text-slate-400 mt-0.5">Clean • Professional • Subtle accents</p>
            </div>
            <div className="flex gap-2">
              <a href="/demo/feed-v4" className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors">
                ← Prev
              </a>
              <a href="/demo/feed-v6" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-sm transition-colors">
                Next →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-3">
          {mockPredictions.map((pred) => (
            <div
              key={pred.id}
              className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-lg p-5 transition-all duration-200 hover:bg-slate-900/60"
            >
              {/* Header - compact */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-medium">
                      {pred.author.slice(-2)}
                    </div>
                    <span className="text-slate-300 text-sm font-medium">#{pred.author}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-slate-500 text-xs">{pred.time}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-slate-500 text-xs">{pred.category}</span>
                  {pred.verified && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </div>

                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                  {pred.tier}
                </span>
              </div>

              {/* Title */}
              <p className="text-slate-200 text-sm leading-relaxed mb-3">
                {pred.title}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pred.outcome === "correct" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Correct
                    </span>
                  ) : pred.outcome === "incorrect" ? (
                    <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Incorrect
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      Pending
                    </span>
                  )}

                  {pred.evidenceScore && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-400 text-xs">
                        Evidence: <span className="text-slate-300 font-medium">{pred.evidenceScore}</span>
                      </span>
                    </>
                  )}

                  <span className="w-1 h-1 rounded-full bg-slate-700" />

                  <button className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {pred.votes}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="text-xs text-slate-600 font-mono">{pred.hash}</code>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
