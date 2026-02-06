"use client";

export default function FeedDemoV4() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "Legend",
      time: "2h ago",
      category: "OSINT",
      title: "Bitcoin will hit $100K by end of Q1 2025 based on on-chain metrics showing accumulation patterns",
      outcome: "correct",
      evidenceScore: 94,
      hash: "0x7a9f8d3c2b1e",
      votes: 47,
      verified: true,
    },
    {
      id: 2,
      author: "5678",
      tier: "Master",
      time: "5h ago",
      category: "Politics",
      title: "Election turnout will exceed 75% based on early voting data and historical trends",
      outcome: "pending",
      evidenceScore: null,
      hash: "0x1a2b3c4d5e6f",
      votes: 23,
      verified: false,
    },
    {
      id: 3,
      author: "9012",
      tier: "Expert",
      time: "1d ago",
      category: "Tech",
      title: "GPT-5 will be released before June 2025 according to leaked internal roadmaps",
      outcome: "incorrect",
      evidenceScore: 67,
      hash: "0x9e8d7c6b5a4f",
      votes: 12,
      verified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Modern Gradient Minimalism</h1>
              <p className="text-sm text-slate-500 mt-0.5">Soft gradients • Clean shadows • Professional</p>
            </div>
            <a href="/demo/feed-v5" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors">
              Next →
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {mockPredictions.map((pred) => (
            <div
              key={pred.id}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/60"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                    {pred.author.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-medium">Anon #{pred.author}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-md">
                        {pred.tier}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{pred.time}</span>
                  </div>
                </div>

                {pred.verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md mb-3">
                {pred.category}
              </div>

              {/* Title */}
              <h3 className="text-slate-900 text-base font-medium leading-relaxed mb-4">
                {pred.title}
              </h3>

              {/* Status & Evidence */}
              <div className="flex items-center gap-4 mb-4">
                {pred.outcome === "correct" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Correct
                  </div>
                ) : pred.outcome === "incorrect" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Incorrect
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Pending
                  </div>
                )}

                {pred.evidenceScore && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Evidence</span>
                    <span className="font-semibold text-slate-900">{pred.evidenceScore}/100</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {pred.votes}
                  </button>
                  <button className="px-4 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium">
                    View
                  </button>
                </div>
                <code className="text-xs text-slate-400 font-mono">{pred.hash}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
