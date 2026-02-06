"use client";

export default function FeedDemoV2() {
  const mockPredictions = [
    {
      id: 1,
      author: "1234",
      tier: "LEGEND",
      time: "2H",
      category: "OSINT",
      title: "BTC $100K PREDICTION BY Q1 2025",
      outcome: "correct",
      evidenceScore: 94,
      hash: "7A9F...3D2C",
      votes: 47,
      tags: ["CHAIN", "VERIFIED"],
    },
    {
      id: 2,
      author: "5678",
      tier: "MASTER",
      time: "5H",
      category: "POLITICS",
      title: "ELECTION TURNOUT >75% BASED ON DATA",
      outcome: "pending",
      evidenceScore: null,
      hash: "1A2B...1E0D",
      votes: 23,
      tags: ["CHAIN"],
    },
    {
      id: 3,
      author: "9012",
      tier: "EXPERT",
      time: "1D",
      category: "TECH",
      title: "GPT-5 RELEASE BEFORE JUNE 2025",
      outcome: "incorrect",
      evidenceScore: 67,
      hash: "9E8D...0F9E",
      votes: 12,
      tags: [],
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#FF006E 1px, transparent 1px),
            linear-gradient(90deg, #FF006E 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #00F5FF 0px, transparent 2px, transparent 4px)",
          animation: "scan 8s linear infinite",
        }} />
      </div>

      {/* Header */}
      <div className="border-b-2 border-pink-500 bg-black sticky top-0 z-50" style={{ boxShadow: "0 0 20px rgba(255, 0, 110, 0.5)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-300 font-mono">
              VERSION 2: NEON CYBERPUNK 🌃
            </h1>
            <div className="flex gap-3">
              <a href="/demo/feed-v1" className="px-4 py-2 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black rounded text-sm font-bold transition-all" style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }}>
                ← PREV
              </a>
              <a href="/demo/feed-v3" className="px-4 py-2 bg-black border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black rounded text-sm font-bold transition-all" style={{ boxShadow: "0 0 10px rgba(255, 0, 110, 0.5)" }}>
                NEXT →
              </a>
            </div>
          </div>
          <p className="text-cyan-400 text-sm mt-2 font-mono">HOT PINK • ELECTRIC CYAN • TOXIC GREEN • EDGY & HIGH-ENERGY</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockPredictions.map((pred, index) => {
            const borderColor = pred.outcome === "correct"
              ? "#39FF14"
              : pred.outcome === "incorrect"
              ? "#FF006E"
              : "#00F5FF";

            return (
              <div
                key={pred.id}
                className="group relative bg-black p-5 transition-all duration-300 hover:scale-105 cursor-pointer font-mono"
                style={{
                  border: `2px solid ${borderColor}`,
                  boxShadow: `0 0 20px ${borderColor}40, inset 0 0 20px ${borderColor}10`,
                  animation: `glow 2s ease-in-out infinite`,
                  animationDelay: `${index * 300}ms`,
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4" style={{ borderColor }} />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4" style={{ borderColor }} />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4" style={{ borderColor }} />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4" style={{ borderColor }} />

                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-pink-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-500 font-bold text-lg">⚡</span>
                    <span className="text-white font-bold">#{pred.author}</span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-yellow-300 text-black text-xs font-bold">
                      {pred.tier}
                    </span>
                  </div>
                  <span className="text-cyan-400 text-sm">{pred.time}</span>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-1 bg-pink-500/20 border border-pink-500 text-pink-400 text-xs font-bold">
                    {pred.category}
                  </span>
                  {pred.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-400 text-xs font-bold">
                      ◆ {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-white text-sm font-bold mb-3 leading-relaxed uppercase tracking-wide">
                  {pred.title}
                </h3>

                {/* Separator */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-3" />

                {/* Outcome */}
                {pred.outcome === "correct" ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl" style={{ color: "#39FF14" }}>✓</span>
                    <span className="font-bold uppercase text-sm" style={{ color: "#39FF14" }}>CORRECT</span>
                    {pred.evidenceScore && (
                      <>
                        <div className="flex-1 h-2 bg-black border border-green-500/50 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-yellow-300"
                            style={{ width: `${pred.evidenceScore}%`, boxShadow: "0 0 10px #39FF14" }}
                          />
                        </div>
                        <span className="text-green-400 font-bold text-sm">{pred.evidenceScore}%</span>
                      </>
                    )}
                  </div>
                ) : pred.outcome === "incorrect" ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl text-pink-500">✗</span>
                    <span className="font-bold uppercase text-sm text-pink-500">INCORRECT</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl text-yellow-400">◆</span>
                    <span className="font-bold uppercase text-sm text-yellow-400">PENDING</span>
                  </div>
                )}

                {/* Separator */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mb-3" />

                {/* Hash */}
                <div className="flex items-center justify-between mb-4 p-2 bg-black border border-cyan-500/30">
                  <code className="text-cyan-400 text-xs">HASH: {pred.hash}</code>
                  <button className="text-yellow-300 hover:text-yellow-400 transition-colors">⚡</button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-pink-500/20 border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-black font-bold text-xs transition-all"
                    style={{ boxShadow: "0 0 10px rgba(255, 0, 110, 0.3)" }}
                  >
                    ▲{pred.votes}
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold text-xs transition-all"
                    style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.3)" }}
                  >
                    &gt;&gt;VIEW
                  </button>
                  <button
                    className="px-3 py-2 bg-yellow-300/20 border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black font-bold text-xs transition-all"
                    style={{ boxShadow: "0 0 10px rgba(255, 255, 0, 0.3)" }}
                  >
                    ⚡
                  </button>
                </div>

                {/* Glow pulse on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${borderColor}20, transparent)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
