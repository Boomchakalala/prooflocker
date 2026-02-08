"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

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

  // Get card styling based on filter and outcome
  const getCardStyle = (pred: ResolvedPrediction) => {
    const isCorrect = pred.outcome === "correct";

    // For "Correct" filter or when showing correct outcomes, use green
    if (selectedFilter === "Correct" || (isCorrect && selectedFilter !== "All")) {
      return {
        background: "from-emerald-600/5 via-emerald-500/5 to-emerald-700/5",
        border: "border-emerald-500/20 hover:border-emerald-500/50",
        shadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
        badgeBg: "bg-emerald-500/20",
        badgeText: "text-emerald-400",
      };
    }

    // For "All" filter, use neutral slate/gray
    if (selectedFilter === "All") {
      return {
        background: "from-slate-700/5 via-slate-600/5 to-slate-700/5",
        border: "border-slate-600/20 hover:border-slate-500/40",
        shadow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]",
        badgeBg: isCorrect ? "bg-emerald-500/20" : pred.outcome === "incorrect" ? "bg-red-500/20" : "bg-slate-500/20",
        badgeText: isCorrect ? "text-emerald-400" : pred.outcome === "incorrect" ? "text-red-400" : "text-slate-400",
      };
    }

    // For category filters, use category-specific colors
    const categoryColors: Record<string, any> = {
      crypto: {
        background: "from-blue-600/5 via-blue-500/5 to-blue-700/5",
        border: "border-blue-500/20 hover:border-blue-500/50",
        shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
        badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-blue-500/20",
        badgeText: isCorrect ? "text-emerald-400" : "text-blue-400",
      },
      politics: {
        background: "from-purple-600/5 via-purple-500/5 to-purple-700/5",
        border: "border-purple-500/20 hover:border-purple-500/50",
        shadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
        badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-purple-500/20",
        badgeText: isCorrect ? "text-emerald-400" : "text-purple-400",
      },
      tech: {
        background: "from-cyan-600/5 via-cyan-500/5 to-cyan-700/5",
        border: "border-cyan-500/20 hover:border-cyan-500/50",
        shadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
        badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-cyan-500/20",
        badgeText: isCorrect ? "text-emerald-400" : "text-cyan-400",
      },
      osint: {
        background: "from-orange-600/5 via-orange-500/5 to-orange-700/5",
        border: "border-orange-500/20 hover:border-orange-500/50",
        shadow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
        badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-orange-500/20",
        badgeText: isCorrect ? "text-emerald-400" : "text-orange-400",
      },
    };

    const categoryKey = pred.category?.toLowerCase() || "crypto";
    return categoryColors[categoryKey] || categoryColors.crypto;
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
            Real Claims. Real Outcomes.
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto px-2">
            Claim makers who put their reputation on the line and delivered results
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
                    className={`group bg-gradient-to-br ${cardStyle.background} border ${cardStyle.border} rounded-xl p-5 md:p-6 transition-all duration-300 ${cardStyle.shadow} hover:-translate-y-1 cursor-pointer flex-shrink-0 w-[82vw] sm:w-[400px] md:w-[380px] snap-center`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold">
                          {pred.authorNumber.toString().slice(-2)}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">Anon #{pred.authorNumber}</div>
                          <div className="text-xs text-slate-500">{formatRelativeTime(pred.timestamp)}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 ${cardStyle.badgeBg} ${cardStyle.badgeText} text-xs font-semibold rounded`}>
                        {pred.outcome === "correct" && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                        {pred.outcome === "incorrect" && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        )}
                        {pred.outcome === "correct" ? "Correct" : pred.outcome === "incorrect" ? "Incorrect" : "Pending"}
                      </div>
                    </div>

                    {/* Category Badge */}
                    {pred.category && (
                      <div className="inline-block px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded mb-3">
                        {pred.category}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className={`text-white text-base font-medium leading-snug mb-4 line-clamp-3 group-hover:${cardStyle.badgeText} transition-colors`}>
                      {pred.textPreview}
                    </h3>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-600/20">
                      {pred.evidence_score !== undefined && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span className="text-slate-400 text-xs">Evidence: </span>
                          <span className="text-cyan-400 font-semibold text-xs">{pred.evidence_score}/100</span>
                        </div>
                      )}
                      {pred.upvotesCount !== undefined && pred.upvotesCount > 0 && (
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="text-xs">{pred.upvotesCount}</span>
                        </div>
                      )}
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
