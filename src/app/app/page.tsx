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

        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-black/90 border-y border-purple-500/20 mb-6 shadow-lg">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContentFilter("all")}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "all"
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setContentFilter("claims")}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "claims"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                      : "text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10"
                  }`}
                >
                  Claims
                </button>
                <button
                  onClick={() => setContentFilter("osint")}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    contentFilter === "osint"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  OSINT
                </button>
              </div>

              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search claims, signals, locations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowClaimModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-md text-sm font-semibold transition-all whitespace-nowrap shadow-lg shadow-purple-500/25"
              >
                + Lock Claim
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500 font-medium">Quick:</span>
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    quickFilter === filter.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-purple-500/10 hover:text-purple-400'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                          className="group bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-0.5"
                        >
                          {/* User Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm font-bold border-2 border-purple-500/40 shadow-lg">
                                {claim.authorNumber?.toString().slice(-2) || "??"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-white font-semibold">Anon #{claim.authorNumber}</span>
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${userTier.bg} ${userTier.border} ${userTier.color}`}>
                                    {userTier.label}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">{formatRelativeTime(claim.createdAt)}</div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 shadow-lg ${
                              isCorrect
                                ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30"
                                : isIncorrect
                                ? "bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/30"
                                : "bg-amber-500/30 border-amber-400/60 text-amber-300 shadow-amber-500/30"
                            }`}>
                              {isCorrect && (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                  Correct
                                </>
                              )}
                              {isIncorrect && (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                  Incorrect
                                </>
                              )}
                              {isPending && (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                  </svg>
                                  Pending
                                </>
                              )}
                            </div>
                          </div>

                          {/* Claim Text */}
                          <div className="mb-4">
                            <p className="text-white text-[15px] leading-relaxed line-clamp-4">
                              {claim.text}
                            </p>
                          </div>

                          {/* Category & Tags */}
                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {claim.category && (
                              <span className="px-2 py-1 bg-slate-800/70 text-slate-400 text-xs rounded border border-slate-700/50">
                                #{claim.category}
                              </span>
                            )}
                            <span className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/40 font-semibold">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                              Locked
                            </span>
                          </div>

                          {/* Engagement Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mb-3">
                            <div className="flex items-center gap-4">
                              {/* Vote Display */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                                  </svg>
                                  <span className="text-xs font-semibold">{claim.upvotesCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-red-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                  </svg>
                                  <span className="text-xs font-semibold">{claim.downvotesCount || 0}</span>
                                </div>
                              </div>

                              {/* Evidence Grade */}
                              {claim.evidence_score !== undefined && claim.evidence_score > 0 && (
                                <div
                                  className={`flex items-center gap-1.5 px-2 py-1 border rounded-lg transition-all hover:scale-105 ${evidenceGrade.bgColor} ${evidenceGrade.borderColor} ${evidenceGrade.shadowColor}`}
                                >
                                  <svg className={`w-4 h-4 ${evidenceGrade.textColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                  </svg>
                                  <span className={`text-xs font-bold ${evidenceGrade.textColor}`}>{evidenceGrade.grade}</span>
                                </div>
                              )}

                              {/* Share Icon */}
                              <div className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                                </svg>
                              </div>
                            </div>

                            {/* View Button */}
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold transition-all group-hover:border-purple-400/60">
                              <span>View</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                              </svg>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <svg className="w-12 h-12 text-neutral-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <p className="text-neutral-400">No claims found</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredOsint.map((signal) => (
                      <div
                        key={signal.id}
                        className="bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-4 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                              </svg>
                              Intel
                            </span>
                          </div>

                          {signal.category && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-900/40 border border-red-700/50 text-red-300 uppercase">
                              {signal.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
                          <div className="w-6 h-6 rounded bg-red-600/30 flex items-center justify-center border border-red-500/40">
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-red-200 font-semibold truncate">{signal.source_name || "Unknown Source"}</div>
                            {signal.source_handle && (
                              <div className="text-xs text-red-400/70 truncate">{signal.source_handle}</div>
                            )}
                          </div>
                          {signal.location && (
                            <div className="flex items-center gap-1 text-xs text-orange-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span className="line-clamp-1">{signal.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <h3 className="text-base font-bold text-red-50 leading-tight line-clamp-2">
                            {signal.title || "Untitled Signal"}
                          </h3>
                        </div>

                        {signal.summary && (
                          <p className="text-sm text-red-100/70 mb-3 line-clamp-2 leading-relaxed">
                            {signal.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-red-500/20">
                          <div className="text-xs text-red-400/60 font-mono">
                            ID: {signal.id.toString().slice(0, 8)}
                          </div>
                          <div className="flex gap-2">
                            {signal.url && (
                              <a
                                href={signal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs font-semibold rounded-md bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Source
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <svg className="w-12 h-12 text-neutral-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                    </svg>
                    <p className="text-neutral-400">No OSINT signals found</p>
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
