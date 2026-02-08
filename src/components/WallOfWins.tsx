"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import VoteButtons from "@/components/VoteButtons";

// Deterministic vote count generator (stable per prediction ID)
function getStableVoteCounts(predictionId: string, outcome: string) {
  // Simple hash function for deterministic but varied results
  let hash = 0;
  for (let i = 0; i < predictionId.length; i++) {
    hash = ((hash << 5) - hash) + predictionId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const seed = Math.abs(hash);

  if (outcome === "correct") {
    // Resolved bangers: high upvotes
    const upvotes = 200 + (seed % 1000);
    const downvotes = 20 + (seed % 180);
    return { upvotes, downvotes };
  } else if (outcome === "incorrect") {
    // Failed claims: moderate engagement
    const upvotes = 40 + (seed % 80);
    const downvotes = 40 + (seed % 110);
    return { upvotes, downvotes };
  } else {
    // Pending claims: lower engagement
    const upvotes = seed % 13; // 0-12
    const downvotes = seed % 7; // 0-6
    return { upvotes, downvotes };
  }
}

// Evidence grade mapper
function getEvidenceGrade(score?: number): { grade: string; bgColor: string; borderColor: string; textColor: string; shadowColor: string } {
  if (!score || score < 30) {
    return {
      grade: "D",
      bgColor: "bg-slate-600/20",
      borderColor: "border-slate-500/30",
      textColor: "text-slate-400",
      shadowColor: "shadow-slate-600/20"
    };
  } else if (score < 60) {
    return {
      grade: "C",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/40",
      textColor: "text-amber-400",
      shadowColor: "shadow-amber-500/30"
    };
  } else if (score < 80) {
    return {
      grade: "B",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/40",
      textColor: "text-cyan-400",
      shadowColor: "shadow-cyan-500/30"
    };
  } else if (score < 95) {
    return {
      grade: "A",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/40",
      textColor: "text-emerald-400",
      shadowColor: "shadow-emerald-500/30"
    };
  } else {
    return {
      grade: "S",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/40",
      textColor: "text-purple-400",
      shadowColor: "shadow-purple-500/40"
    };
  }
}

// User reliability tier mapper (based on author number for demo)
function getUserTier(authorNumber: number) {
  // Use author number to deterministically assign tiers
  const score = (authorNumber * 17) % 1000; // Deterministic pseudo-random score

  if (score >= 800) return { label: "Legend", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/40" };
  if (score >= 650) return { label: "Master", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/40" };
  if (score >= 500) return { label: "Expert", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/40" };
  if (score >= 300) return { label: "Trusted", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/40" };
  return { label: "Novice", color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/40" };
}

interface ResolvedPrediction {
  id: string;
  publicSlug: string;
  textPreview: string;
  category: string;
  outcome: string;
  timestamp: string;
  authorNumber: number;
  evidence_score?: number;
  upvotesCount?: number;
}

export default function WallOfWins() {
  const [predictions, setPredictions] = useState<ResolvedPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Static mock claims for landing page
  const mockClaims: ResolvedPrediction[] = [
    {
      id: "mock-1",
      publicSlug: "btc-150k-2026",
      textPreview: "BTC breaks $150k by Dec 2026 — supply shock + institutional FOMO finally converge",
      category: "Crypto",
      outcome: "correct",
      timestamp: "2026-01-12T10:00:00Z",
      authorNumber: 2847,
      evidence_score: 92,
      upvotesCount: 184,
    },
    {
      id: "mock-2",
      publicSlug: "solana-tvl-flip",
      textPreview: "Solana TVL flips Ethereum L2s by Q3 2026 — speed + cost = inevitable",
      category: "Crypto",
      outcome: "correct",
      timestamp: "2026-02-01T14:30:00Z",
      authorNumber: 5192,
      evidence_score: 88,
      upvotesCount: 156,
    },
    {
      id: "mock-3",
      publicSlug: "china-taiwan-escalation",
      textPreview: "China-Taiwan escalation visible via satellite troop buildup — conflict escalates within 6 months",
      category: "OSINT",
      outcome: "correct",
      timestamp: "2025-11-18T08:15:00Z",
      authorNumber: 1203,
      evidence_score: 96,
      upvotesCount: 267,
    },
    {
      id: "mock-4",
      publicSlug: "confidential-compute-ai",
      textPreview: "Confidential compute becomes default for AI training by mid-2026 — privacy regulations force the shift",
      category: "Tech",
      outcome: "correct",
      timestamp: "2025-12-05T16:45:00Z",
      authorNumber: 6741,
      evidence_score: 85,
      upvotesCount: 142,
    },
    {
      id: "mock-5",
      publicSlug: "base-arbitrum-users",
      textPreview: "Base surpasses Arbitrum in daily active users by May 2026 — Coinbase distribution too strong",
      category: "Crypto",
      outcome: "pending",
      timestamp: "2026-01-30T12:00:00Z",
      authorNumber: 3928,
      evidence_score: 45,
      upvotesCount: 89,
    },
    {
      id: "mock-6",
      publicSlug: "us-midterms-crypto",
      textPreview: "US midterms flip House control — crypto deregulation bill passes Q1 2026",
      category: "Politics",
      outcome: "correct",
      timestamp: "2025-10-22T09:30:00Z",
      authorNumber: 8174,
      evidence_score: 91,
      upvotesCount: 203,
    },
    {
      id: "mock-7",
      publicSlug: "cyberattack-power-grid",
      textPreview: "Major cyberattack takes down US power grid within 90 days",
      category: "OSINT",
      outcome: "incorrect",
      timestamp: "2025-12-01T11:20:00Z",
      authorNumber: 4512,
      evidence_score: 28,
      upvotesCount: 42,
    },
    {
      id: "mock-8",
      publicSlug: "openai-gpt5-launch",
      textPreview: "OpenAI releases GPT-5 by Feb 2026 — AGI rumors force early launch",
      category: "Tech",
      outcome: "correct",
      timestamp: "2025-11-08T15:10:00Z",
      authorNumber: 9203,
      evidence_score: 82,
      upvotesCount: 178,
    },
  ];

  useEffect(() => {
    // Use mock data for landing page
    setPredictions(mockClaims);
    setLoading(false);
  }, []);

  const filters = ["All", "Correct", "Crypto", "Politics", "Tech", "OSINT"];

  const filteredPredictions = predictions.filter((p) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Correct") return p.outcome === "correct";
    if (selectedFilter === "OSINT") return p.category?.toLowerCase() === "osint";
    return p.category?.toLowerCase() === selectedFilter.toLowerCase();
  });

  // Get card styling - uniform styling to match feed cards
  const getCardStyle = (pred: ResolvedPrediction) => {
    const isCorrect = pred.outcome === "correct";
    const isIncorrect = pred.outcome === "incorrect";

    // Use consistent neutral styling for all cards
    return {
      background: "from-slate-800/40 via-slate-700/30 to-slate-800/40",
      border: "border-slate-700/40 hover:border-slate-600/60",
      shadow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.1)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : isIncorrect ? "bg-red-500/20" : "bg-slate-500/20",
      badgeText: isCorrect ? "text-emerald-400" : isIncorrect ? "text-red-400" : "text-slate-400",
    };
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative z-10 py-12 md:py-20 lg:py-28 px-4 md:px-6 bg-gradient-to-b from-[#0a0a0a] via-[#111118] to-[#0a0a0a] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div
          className="w-[600px] h-[600px] md:w-[1000px] md:h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0, 224, 255, 0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Live Claims. Proof in Action.
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto px-2">
            Make a claim. Lock it on-chain. Earn reputation when you're right.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 md:mb-12 flex-wrap px-2">
          {filters.map((filter) => {
            const isActive = selectedFilter === filter;
            let activeClass = "bg-slate-700/50 border-2 border-slate-600/50 text-white";

            if (isActive) {
              if (filter === "Correct") {
                activeClass = "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300";
              } else if (filter === "Crypto") {
                activeClass = "bg-blue-500/20 border-2 border-blue-500/50 text-blue-300";
              } else if (filter === "Politics") {
                activeClass = "bg-purple-500/20 border-2 border-purple-500/50 text-purple-300";
              } else if (filter === "Tech") {
                activeClass = "bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-300";
              } else if (filter === "OSINT") {
                activeClass = "bg-orange-500/20 border-2 border-orange-500/50 text-orange-300";
              } else {
                activeClass = "bg-slate-600/30 border-2 border-slate-500/50 text-slate-200";
              }
            }

            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                  isActive
                    ? activeClass
                    : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          {/* Left Arrow - Hidden on mobile */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-full text-white transition-all shadow-xl hover:scale-110"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Right Arrow - Hidden on mobile */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-full text-white transition-all shadow-xl hover:scale-110"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Scrollable Content */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading wins...</p>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">No predictions found for this filter.</p>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-2 md:px-0 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredPredictions.map((pred) => {
                const cardStyle = getCardStyle(pred);
                const voteCounts = getStableVoteCounts(pred.id, pred.outcome);
                const evidenceGrade = getEvidenceGrade(pred.evidence_score);
                const evidenceSourceCount = pred.evidence_score ? Math.max(1, Math.floor(pred.evidence_score / 30)) : 0;
                const userTier = getUserTier(pred.authorNumber || 0);

                return (
                  <div
                    key={pred.id}
                    className={`group bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 flex-shrink-0 w-[82vw] sm:w-[400px] md:w-[380px] snap-center`}
                  >
                    {/* User Header - Social Style */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* User Avatar - Bigger */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm font-bold border-2 border-purple-500/40 shadow-lg">
                          {pred.authorNumber?.toString().slice(-2) || "??"}
                        </div>
                        <div>
                          <div className="text-sm text-white font-semibold">Anon #{pred.authorNumber}</div>
                          <div className="text-xs text-slate-500">{formatRelativeTime(pred.timestamp)}</div>
                        </div>
                      </div>

                      {/* Status Badge - Proper with colors */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 shadow-lg ${
                        pred.outcome === "correct"
                          ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30"
                          : pred.outcome === "incorrect"
                          ? "bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/30"
                          : "bg-amber-500/30 border-amber-400/60 text-amber-300 shadow-amber-500/30"
                      }`}>
                        {pred.outcome === "correct" && (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            Correct
                          </>
                        )}
                        {pred.outcome === "incorrect" && (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Incorrect
                          </>
                        )}
                        {(!pred.outcome || pred.outcome === "pending") && (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            Pending
                          </>
                        )}
                      </div>
                    </div>

                    {/* Claim Text - Tweet Style */}
                    <div className="mb-4">
                      <p className="text-white text-[15px] leading-relaxed line-clamp-4">
                        {pred.textPreview}
                      </p>
                    </div>

                    {/* Category & On-Chain Tags */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {pred.category && (
                        <span className="px-2 py-1 bg-slate-800/70 text-slate-400 text-xs rounded border border-slate-700/50">
                          #{pred.category}
                        </span>
                      )}
                      {/* Locked On-Chain Badge */}
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/40 font-semibold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        Locked
                      </span>
                    </div>

                    {/* Engagement Footer - Social Media Style */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mb-3">
                      {/* Left: Interactions */}
                      <div className="flex items-center gap-4">
                        {/* Vote Display with Counts */}
                        <div className="flex items-center gap-3">
                          {/* Upvote */}
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                            </svg>
                            <span className="text-xs font-semibold">{voteCounts.upvotes}</span>
                          </div>
                          {/* Downvote */}
                          <div className="flex items-center gap-1.5 text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                            </svg>
                            <span className="text-xs font-semibold">{voteCounts.downvotes}</span>
                          </div>
                        </div>

                        {/* Evidence Grade - Colorful with Tooltip */}
                        {pred.evidence_score !== undefined && pred.evidence_score > 0 && (
                          <div
                            className={`group/evidence relative flex items-center gap-1.5 px-2 py-1 border rounded-lg transition-all hover:scale-105 ${evidenceGrade.bgColor} ${evidenceGrade.borderColor} ${evidenceGrade.shadowColor}`}
                            title={`Evidence Grade: ${evidenceGrade.grade} (${evidenceSourceCount} sources)`}
                          >
                            <svg className={`w-4 h-4 ${evidenceGrade.textColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            <span className={`text-xs font-bold ${evidenceGrade.textColor}`}>{evidenceGrade.grade}</span>
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover/evidence:opacity-100 transition-opacity pointer-events-none z-20">
                              Evidence Grade: {evidenceGrade.grade} ({evidenceSourceCount} sources)
                            </div>
                          </div>
                        )}

                        {/* Share Icon */}
                        <div className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Right: View Button */}
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold transition-all group-hover:border-purple-400/60">
                        <span>View</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>

                    {/* Timestamp Snippet - Bottom of Card */}
                    <div className="pt-2 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span className="text-[10px] text-purple-300/80 font-mono">
                            {new Date(pred.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm text-slate-400 italic mb-4">
            Your call next? Lock it before the world catches on.
          </p>
          <Link
            href="/app"
            className="inline-block px-6 md:px-8 py-2.5 md:py-3 border-2 border-slate-500/30 hover:border-slate-400/50 hover:bg-slate-500/10 text-slate-300 hover:text-slate-200 font-semibold rounded-lg transition-all text-sm md:text-base"
          >
            View All Predictions
          </Link>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
