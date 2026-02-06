"use client";

export default function FeedDemoV3() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "Legend",
      tierIcon: "⭐",
      time: "2 hours ago",
      category: "OSINT",
      title: "Bitcoin will reach $100K by year-end according to on-chain accumulation metrics showing institutional buying patterns",
      outcome: "correct",
      evidenceGrade: "A+",
      evidenceScore: 94,
      hash: "0x7a9f...3d2c",
      votes: 47,
      tags: ["On-Chain", "Verified"],
    },
    {
      id: 2,
      author: "5678",
      tier: "Master",
      tierIcon: "👑",
      time: "5 hours ago",
      category: "Politics",
      title: "The upcoming election will see voter turnout exceed 75% based on early voting data and historical trends",
      outcome: "pending",
      evidenceGrade: null,
      evidenceScore: null,
      hash: "0x1a2b...1e0d",
      votes: 23,
      tags: ["On-Chain"],
    },
    {
      id: 3,
      author: "9012",
      tier: "Expert",
      tierIcon: "💎",
      time: "1 day ago",
      category: "Tech",
      title: "GPT-5 will be released before June 2025 according to leaked internal roadmaps from OpenAI sources",
      outcome: "incorrect",
      evidenceGrade: "B",
      evidenceScore: 67,
      hash: "0x9e8d...0f9e",
      votes: 12,
      tags: [],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FAFAFA, #FFFFFF)" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Version 3: Clean Minimal Light 🌅
            </h1>
            <a href="/demo/feed-v1" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              ← Back to V1
            </a>
          </div>
          <p className="text-gray-600 text-sm mt-2">Soft pastels • Warm neutrals • Calm & professional</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {mockPredictions.map((pred, index) => (
            <div
              key={pred.id}
              className="bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-gray-200"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                animation: `fadeInUp 0.6s ease-out ${index * 150}ms forwards`,
                opacity: 0,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-lg font-bold text-purple-700 border-2 border-purple-200">
                    {pred.author.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-semibold">Anon #{pred.author}</span>
                      <span className="text-xl">{pred.tierIcon}</span>
                      <span className="text-sm text-purple-600 font-medium">{pred.tier}</span>
                    </div>
                    <span className="text-sm text-gray-500">• {pred.time}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-200">
                  {pred.category}
                </span>
                {pred.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-sm font-medium rounded-full border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />

              {/* Title */}
              <h3 className="text-gray-900 text-xl font-serif leading-relaxed mb-4">
                {pred.title}
              </h3>

              {/* Outcome */}
              <div className="flex items-center gap-4 mb-4">
                {pred.outcome === "correct" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-emerald-700 font-semibold">Correct</span>
                    </div>
                    {pred.evidenceGrade && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Evidence</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded border border-emerald-200">
                          {pred.evidenceGrade}
                        </span>
                        <span className="text-gray-500">({pred.evidenceScore})</span>
                      </div>
                    )}
                  </>
                ) : pred.outcome === "incorrect" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <span className="text-red-700 font-semibold">Incorrect</span>
                    </div>
                    {pred.evidenceGrade && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Evidence</span>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-bold rounded border border-orange-200">
                          {pred.evidenceGrade}
                        </span>
                        <span className="text-gray-500">({pred.evidenceScore})</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                    </svg>
                    <span className="text-amber-700 font-semibold">Pending Resolution</span>
                  </div>
                )}
              </div>

              {/* Hash */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Hash:</span>
                    <code className="font-mono">{pred.hash}</code>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors font-medium text-sm border border-purple-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  {pred.votes} votes
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm shadow-sm">
                  View Details
                </button>
                <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors border border-gray-300 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
