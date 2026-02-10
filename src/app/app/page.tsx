"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UnifiedHeader from "@/components/UnifiedHeader";
import ClaimModal from "@/components/ClaimModal";
import VoteButtons from "@/components/VoteButtons";
import { Prediction } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { getEvidenceGrade, getEvidenceGradeInfo } from "@/lib/scoring";
import { formatRelativeTime } from "@/lib/utils";

type ContentFilter = "all" | "osint" | "claims";
type QuickFilter = "all" | "pending" | "verified" | "disproven" | "crypto" | "politics" | "markets" | "tech" | "sports" | "culture" | "osint-cat" | "personal" | "other";

export default function AppFeedPage() {
  const { user } = useAuth();
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [osintSignals, setOsintSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const predRes = await fetch("/api/predictions", { cache: "no-store" });
      const predData = await predRes.json();
      setPredictions(predData.predictions || []);

      const osintRes = await fetch("/api/osint?limit=100");
      const osintData = await osintRes.json();
      setOsintSignals(osintData || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching feed data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getTickerItems = () => {
    const items: { type: string; text: string; location: string; time: string }[] = [];
    osintSignals.slice(0, 3).forEach(signal => {
      items.push({
        type: 'INTEL',
        text: signal.title || 'Intelligence Signal',
        location: signal.location,
        time: signal.created_at ? formatRelativeTime(signal.created_at) : 'Just now'
      });
    });
    predictions.slice(0, 2).forEach(claim => {
      items.push({
        type: 'CLAIM',
        text: claim.text?.slice(0, 80) + '...',
        location: claim.category,
        time: claim.timestamp ? formatRelativeTime(claim.timestamp) : 'Just now'
      });
    });
    return items.slice(0, 5);
  };

  const tickerItems = getTickerItems();
  const currentTickerItem = tickerItems[tickerIndex] || { type: 'CLAIM', text: 'Loading live updates...', location: '', time: '' };

  const filteredPredictions = predictions.filter(p => {
    if (contentFilter === "osint") return false;
    if (quickFilter === "pending" && p.outcome !== "pending") return false;
    if (quickFilter === "verified" && p.outcome !== "correct") return false;
    if (quickFilter === "disproven" && p.outcome !== "incorrect") return false;
    if (quickFilter === "crypto" && p.category?.toLowerCase() !== "crypto") return false;
    if (quickFilter === "politics" && p.category?.toLowerCase() !== "politics") return false;
    if (quickFilter === "markets" && p.category?.toLowerCase() !== "markets") return false;
    if (quickFilter === "tech" && p.category?.toLowerCase() !== "tech") return false;
    if (quickFilter === "sports" && p.category?.toLowerCase() !== "sports") return false;
    if (quickFilter === "culture" && p.category?.toLowerCase() !== "culture") return false;
    if (quickFilter === "osint-cat" && p.category?.toLowerCase() !== "osint") return false;
    if (quickFilter === "personal" && p.category?.toLowerCase() !== "personal") return false;
    if (quickFilter === "other" && p.category?.toLowerCase() !== "other") return false;
    if (searchQuery) {
      return p.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const filteredOsint = osintSignals.filter(o => {
    if (contentFilter === "claims") return false;
    if (searchQuery) {
      return o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             o.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             o.location?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const resolvedCorrect = predictions.filter(p => p.outcome === "correct").length;
  const resolvedIncorrect = predictions.filter(p => p.outcome === "incorrect").length;
  const pendingClaims = predictions.filter(p => !p.outcome || p.outcome === "pending").length;

  return (
    <div className="min-h-screen gradient-bg text-white">
      <UnifiedHeader currentView="feed" />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-sm text-slate-400">
            Breaking intelligence and locked claims in real time. Spot it early, lock it on-chain, resolve with receipts.
          </p>
        </div>

        <div className="mb-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2.5 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
              currentTickerItem.type === 'INTEL'
                ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                : 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
            }`}>
              {currentTickerItem.type}
            </span>
            <span className="text-sm text-white font-medium flex-1 truncate">
              {currentTickerItem.text}
            </span>
            {currentTickerItem.location && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-neutral-400">{currentTickerItem.location}</span>
              </>
            )}
            <span className="text-xs text-neutral-500">{currentTickerItem.time}</span>
          </div>
        </div>

        <div className="mb-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2.5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Claims:</span>
                <span className="text-sm font-bold text-white">{predictions.length}</span>
                <span className="text-[10px] text-slate-500">({pendingClaims} pending)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Correct:</span>
                <span className="text-sm font-bold text-emerald-400">{resolvedCorrect}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Incorrect:</span>
                <span className="text-sm font-bold text-red-400">{resolvedIncorrect}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Intel:</span>
                <span className="text-sm font-bold text-red-400">{osintSignals.length}</span>
              </div>
            </div>

            <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-purple-400 transition-colors cursor-pointer">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{getTimeSinceUpdate()} · Refresh</span>
            </button>
          </div>
        </div>

        <div className="sticky top-16 z-[100] bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-slate-700/30 -mx-4 px-4 py-3 mb-6">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Content tabs */}
              <div className="flex items-center bg-slate-800/40 rounded-lg p-0.5">
                <button
                  onClick={() => setContentFilter("all")}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "all"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setContentFilter("claims")}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "claims"
                      ? "bg-purple-500/20 text-purple-300 shadow-sm"
                      : "text-neutral-400 hover:text-purple-300"
                  }`}
                >
                  Claims
                </button>
                <button
                  onClick={() => setContentFilter("osint")}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "osint"
                      ? "bg-red-500/20 text-red-300 shadow-sm"
                      : "text-neutral-400 hover:text-red-300"
                  }`}
                >
                  Intel
                </button>
              </div>

              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search claims and intel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/40 transition-colors"
                  />
                </div>
              </div>

            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'verified', label: 'Verified' },
                { id: 'disproven', label: 'Disproven' },
                { id: 'crypto', label: 'Crypto' },
                { id: 'politics', label: 'Politics' },
                { id: 'markets', label: 'Markets' },
                { id: 'tech', label: 'Tech' },
                { id: 'sports', label: 'Sports' },
                { id: 'culture', label: 'Culture' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setQuickFilter(filter.id as QuickFilter)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    quickFilter === filter.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-32 border border-slate-700/20" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">

            {contentFilter !== "osint" && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-white">Locked Claims</h2>
                  <div className="flex-1 h-px bg-slate-700/40"></div>
                  <span className="text-xs text-slate-400">{filteredPredictions.length} total</span>
                </div>

                {filteredPredictions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filteredPredictions.map((claim) => {
                      const isCorrect = claim.outcome === "correct";
                      const isIncorrect = claim.outcome === "incorrect";
                      const isPending = !claim.outcome || claim.outcome === "pending";
                      const isResolved = isCorrect || isIncorrect;
                      const evidenceGradeKey = claim.evidence_score ? getEvidenceGrade(claim.evidence_score) : null;
                      const evidenceGradeInfo = evidenceGradeKey ? getEvidenceGradeInfo(evidenceGradeKey) : null;

                      return (
                        <Link
                          key={claim.id}
                          href={`/proof/${claim.publicSlug || claim.id}`}
                          className={`group block bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 hover:border-purple-500/40 hover:bg-slate-800/40 transition-all duration-200 ${
                            isCorrect
                              ? 'border-l-[3px] border-l-emerald-500'
                              : isIncorrect
                              ? 'border-l-[3px] border-l-red-500'
                              : 'border-l-[3px] border-l-amber-500'
                          }`}
                        >
                          {/* Top row: Author + Status + Time */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                                {claim.authorNumber?.toString().slice(-2) || "??"}
                              </div>
                              <span className="text-xs text-slate-400 font-medium">#{claim.authorNumber}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isCorrect ? "bg-emerald-500/15 text-emerald-400" :
                                isIncorrect ? "bg-red-500/15 text-red-400" :
                                "bg-amber-500/15 text-amber-400"
                              }`}>
                                {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {formatRelativeTime(claim.createdAt)}
                            </span>
                          </div>

                          {/* Claim Text */}
                          <p className="text-sm text-white leading-snug line-clamp-2 mb-2">
                            {claim.text}
                          </p>

                          {/* Bottom row */}
                          <div className="flex items-center gap-2 text-[10px]">
                            {claim.category && (
                              <span className="text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                                {claim.category}
                              </span>
                            )}
                            <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">
                              On-chain
                            </span>
                            {isResolved && evidenceGradeInfo && (
                              <span className={`px-1.5 py-0.5 rounded font-bold ${evidenceGradeInfo.bgColor} ${evidenceGradeInfo.color}`}>
                                {evidenceGradeInfo.label}
                              </span>
                            )}
                            <div className="flex items-center gap-2 ml-auto text-slate-500">
                              <span>{claim.upvotesCount || 0} up</span>
                              <span>{claim.downvotesCount || 0} dn</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <p className="text-slate-500 text-sm">No claims match your filters</p>
                  </div>
                )}
              </section>
            )}

            {contentFilter !== "claims" && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-white">OSINT Intelligence</h2>
                  <div className="flex-1 h-px bg-slate-700/40"></div>
                  <span className="text-xs text-slate-400">{filteredOsint.length} signals</span>
                </div>

                {filteredOsint.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filteredOsint.map((signal) => {
                      const sourceUrl = signal.url || (signal.source_handle ? `https://twitter.com/${signal.source_handle.replace('@', '')}` : '#');

                      return (
                      <div
                        key={signal.id}
                        className="bg-slate-900/60 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-all duration-200"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            Intel
                          </span>
                          <span className="text-xs text-red-400 font-semibold truncate flex-1">{signal.source_name || "Unknown"}</span>
                          {signal.location && (
                            <span className="text-[10px] text-orange-400/70 truncate max-w-[100px]">{signal.location}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm text-white leading-snug mb-2 line-clamp-2">
                          {signal.title || "Untitled Signal"}
                        </h3>

                        {/* Summary */}
                        {signal.summary && (
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                            {signal.summary}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-2 pt-2 border-t border-red-500/10">
                          {sourceUrl && sourceUrl !== '#' && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-[10px] font-medium rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Source
                            </a>
                          )}
                          <button
                            className="px-2.5 py-1 text-[10px] font-medium rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            Link as Evidence
                          </button>
                          <span className="ml-auto text-[10px] text-slate-600 font-mono">
                            {signal.id.toString().slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <svg className="w-10 h-10 text-slate-600 mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                    </svg>
                    <p className="text-slate-500 text-sm">No OSINT signals found</p>
                  </div>
                )}
              </section>
            )}

          </div>
        )}
      </main>

      {showClaimModal && (
        <ClaimModal onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  );
}
