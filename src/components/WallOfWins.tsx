"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import VoteButtons from "@/components/VoteButtons";

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

  useEffect(() => {
    fetchResolvedPredictions();
  }, []);

  const fetchResolvedPredictions = async () => {
    try {
      // Fetch all recent predictions (not just correct ones)
      const response = await fetch("/api/predictions?limit=24");
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

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
            Live Bold Claims – Proof in Action
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto px-2">
            People are putting skin in the game right now. Crypto, OSINT, tech, geopolitics—all locked on-chain before the outcome is known. Winners compound credibility. Losers reset. Which side are you on?
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
                return (
                  <Link
                    key={pred.id}
                    href={`/proof/${pred.publicSlug}`}
                    className={`group bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 cursor-pointer flex-shrink-0 w-[82vw] sm:w-[400px] md:w-[380px] snap-center`}
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
                        {/* Vote Buttons */}
                        <VoteButtons
                          predictionId={pred.id}
                          initialUpvotes={pred.upvotesCount || 0}
                          initialDownvotes={pred.downvotesCount || 0}
                          compact={true}
                        />

                        {/* Evidence Score */}
                        {pred.evidence_score !== undefined && pred.evidence_score > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            <span className="text-xs font-medium">{pred.evidence_score}</span>
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
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
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
