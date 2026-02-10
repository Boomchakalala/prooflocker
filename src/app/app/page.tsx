"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UnifiedHeader from "@/components/UnifiedHeader";
import ClaimModal from "@/components/ClaimModal";
import VoteButtons from "@/components/VoteButtons";
import { Prediction } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { getEvidenceGrade } from "@/lib/scoring";
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
    const items = [];
    osintSignals.slice(0, 3).forEach(signal => {
      items.push({
        type: 'OSINT',
        text: signal.title || 'Intelligence Signal',
        location: signal.location,
        time: 'Just now'
      });
    });
    predictions.slice(0, 2).forEach(claim => {
      items.push({
        type: 'CLAIM',
        text: claim.text?.slice(0, 80) + '...',
        location: claim.category,
        time: 'Just now'
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

  const getUserTier = (repScore: number) => {
    if (repScore >= 800) return { label: 'Legend', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' };
    if (repScore >= 650) return { label: 'Master', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' };
    if (repScore >= 500) return { label: 'Expert', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
    if (repScore >= 300) return { label: 'Trusted', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
    return { label: 'Novice', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/40' };
  };

  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden">
      <div className="fixed left-0 top-16 bottom-0 w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/30 to-purple-500/0 pointer-events-none" />

      <UnifiedHeader currentView="feed" />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">

        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">ProofLocker Feed</h1>
          <p className="text-neutral-300 leading-tight">
            <span className="font-semibold">Monitoring the situation.</span> Live OSINT signals + locked claims — resolve with receipts, earn reputation.
          </p>
        </div>

        <div className="mb-4 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-lg px-4 py-2.5 shadow-lg overflow-hidden">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
              currentTickerItem.type === 'OSINT'
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

        <div className="mb-4 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Live</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span className="text-sm text-neutral-400">Claims:</span>
                <span className="text-lg font-bold text-white">{predictions.length}</span>
                <span className="text-xs text-purple-400">({pendingClaims} pending)</span>
              </div>

              <div className="w-px h-6 bg-slate-700" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="text-sm text-neutral-400">Correct:</span>
                <span className="text-lg font-bold text-green-400">{resolvedCorrect}</span>
              </div>

              <div className="w-px h-6 bg-slate-700" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span className="text-sm text-neutral-400">Incorrect:</span>
                <span className="text-lg font-bold text-red-400">{resolvedIncorrect}</span>
              </div>

              <div className="w-px h-6 bg-slate-700" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                </svg>
                <span className="text-sm text-neutral-400">OSINT:</span>
                <span className="text-lg font-bold text-red-400">{osintSignals.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Updated {getTimeSinceUpdate()}</span>
            </div>
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
                  OSINT
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
                    placeholder="Search claims, signals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 bg-slate-800/40 border border-slate-700/40 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/40 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowClaimModal(true)}
                className="ml-auto px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-lg shadow-purple-500/20"
              >
                + Lock Claim
              </button>
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
                <div className="flex items-center gap-3 mb-5">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <h2 className="text-xl font-bold text-white">Locked Claims</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/40 to-transparent"></div>
                  <span className="text-sm text-purple-400">{filteredPredictions.length} total</span>
                </div>

                {filteredPredictions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPredictions.map((claim) => {
                      const isCorrect = claim.outcome === "correct";
                      const isIncorrect = claim.outcome === "incorrect";
                      const isPending = !claim.outcome || claim.outcome === "pending";
                      const isResolved = isCorrect || isIncorrect;
                      const userTier = getUserTier(claim.author_reputation_score || 0);
                      const evidenceGrade = getEvidenceGrade(claim.evidence_score);

                      return (
                        <Link
                          key={claim.id}
                          href={`/proof/${claim.publicSlug || claim.id}`}
                          className={`group block bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-200 ${
                            isCorrect
                              ? 'border-l-4 border-l-emerald-500'
                              : isIncorrect
                              ? 'border-l-4 border-l-red-500'
                              : 'border-l-4 border-l-amber-500'
                          }`}
                        >
                          {/* Top row: Avatar + Author + Tier + Timestamp */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                              {claim.authorNumber?.toString().slice(-2) || "??"}
                            </div>
                            <span className="text-sm text-white font-medium">Anon #{claim.authorNumber}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${userTier.bg} ${userTier.color}`}>
                              {userTier.label}
                            </span>
                            <span className="ml-auto text-xs text-slate-500 flex-shrink-0">
                              {formatRelativeTime(claim.createdAt)}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                              isCorrect
                                ? "bg-emerald-500/15 text-emerald-400"
                                : isIncorrect
                                ? "bg-red-500/15 text-red-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}>
                              {isCorrect && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              )}
                              {isIncorrect && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              )}
                              {isPending && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                </svg>
                              )}
                              {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                            </span>
                            {claim.category && (
                              <span className="ml-2 px-2 py-0.5 text-[11px] text-slate-400 bg-slate-800/50 rounded">
                                {claim.category}
                              </span>
                            )}
                          </div>

                          {/* Claim Text */}
                          <p className="text-[15px] font-medium text-white leading-relaxed line-clamp-3 mb-4">
                            {claim.text}
                          </p>

                          {/* Bottom row: On-chain + Evidence Grade + View */}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-700/30">
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                              On-chain
                            </span>
                            {isResolved && claim.evidence_score !== undefined && (
                              <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                                Grade {evidenceGrade.grade}
                              </span>
                            )}

                            <div className="flex items-center gap-3 ml-auto">
                              <div className="flex items-center gap-2 text-slate-500">
                                <span className="flex items-center gap-1 text-xs">
                                  <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                                  </svg>
                                  {claim.upvotesCount || 0}
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                  <svg className="w-3.5 h-3.5 text-red-500/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                  </svg>
                                  {claim.downvotesCount || 0}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                View
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                </svg>
                              </span>
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
                <div className="flex items-center gap-3 mb-5">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                  </svg>
                  <h2 className="text-xl font-bold text-white">OSINT Intelligence</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/40 to-transparent"></div>
                  <span className="text-sm text-red-400">{filteredOsint.length} signals</span>
                </div>

                {filteredOsint.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOsint.map((signal) => {
                      // Build proper source URL
                      const sourceUrl = signal.url || (signal.source_handle ? `https://twitter.com/${signal.source_handle.replace('@', '')}` : '#');

                      return (
                      <div
                        key={signal.id}
                        className="bg-[#0a0a0f] border border-red-500/30 rounded-xl p-5 hover:border-red-500/50 transition-all duration-200"
                      >
                        {/* Header: INTEL badge + Category */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                            INTEL
                          </span>
                          {signal.category && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-red-300/80 bg-red-900/30 rounded uppercase">
                              {signal.category}
                            </span>
                          )}
                          {signal.location && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-orange-400/80">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              {signal.location}
                            </span>
                          )}
                        </div>

                        {/* Source row */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded bg-red-600/60 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                            </svg>
                          </div>
                          <span className="text-sm text-red-400 font-semibold">{signal.source_name || "Unknown Source"}</span>
                          {signal.source_handle && (
                            <span className="text-xs text-slate-500">{signal.source_handle}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-[15px] font-medium text-white leading-relaxed mb-2 line-clamp-2">
                          {signal.title || "Untitled Signal"}
                        </h3>

                        {/* Summary */}
                        {signal.summary && (
                          <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                            {signal.summary}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-2 pt-3 border-t border-red-500/10">
                          {sourceUrl && sourceUrl !== '#' && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                              </svg>
                              Source
                            </a>
                          )}
                          <button
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Add as evidence:', signal.id);
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                            </svg>
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
