"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UnifiedHeader from "@/components/UnifiedHeader";
import ClaimModal from "@/components/ClaimModal";
import VoteButtons from "@/components/VoteButtons";
import IntelCard from "@/components/IntelCard";
import { Prediction } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { getEvidenceGrade, getEvidenceGradeInfo } from "@/lib/scoring";
import { getReputationTier } from "@/lib/reputation-scoring";
import { formatRelativeTime } from "@/lib/utils";

type ContentFilter = "all" | "osint" | "claims";
type QuickFilter = "all" | "pending" | "verified" | "disproven" | "crypto" | "politics" | "markets" | "tech" | "sports" | "culture" | "osint-cat" | "personal" | "other" | "my-claims";

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
  const [newItems, setNewItems] = useState<{ claims: number; intel: number } | null>(null);
  const [prevCounts, setPrevCounts] = useState<{ claims: number; intel: number }>({ claims: 0, intel: 0 });

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
    try {
      const predRes = await fetch("/api/predictions", { cache: "no-store" });
      const predData = await predRes.json();
      const newPredictions = predData.predictions || [];

      // Fetch new intel items from unified intel API
      const intelRes = await fetch("/api/intel?window=24&limit=100");
      const intelData = await intelRes.json();
      const newIntel = intelData.items || [];

      // Detect new items (skip on first load)
      if (prevCounts.claims > 0 || prevCounts.intel > 0) {
        const newClaimCount = newPredictions.length - prevCounts.claims;
        const newIntelCount = newIntel.length - prevCounts.intel;
        if (newClaimCount > 0 || newIntelCount > 0) {
          setNewItems({
            claims: Math.max(0, newClaimCount),
            intel: Math.max(0, newIntelCount),
          });
        }
      }

      setPrevCounts({ claims: newPredictions.length, intel: newIntel.length });
      setPredictions(newPredictions);
      setOsintSignals(newIntel);
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
        location: signal.place_name || signal.country_code || '',
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

    // My Claims filter - show only user's claims
    if (quickFilter === "my-claims") {
      const anonId = typeof window !== 'undefined' ? localStorage.getItem("anonId") : null;
      const isUserClaim = (user && p.userId === user.id) || (anonId && p.anonId === anonId);
      if (!isUserClaim) return false;
    }

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
             o.place_name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const resolvedCorrect = predictions.filter(p => p.outcome === "correct").length;
  const resolvedIncorrect = predictions.filter(p => p.outcome === "incorrect").length;
  const pendingClaims = predictions.filter(p => !p.outcome || p.outcome === "pending").length;

  // Freshness helpers
  const getMinutesAgo = (dateStr: string) => {
    if (!dateStr) return Infinity;
    return (Date.now() - new Date(dateStr).getTime()) / 60000;
  };
  const getFreshnessBadge = (dateStr: string) => {
    const mins = getMinutesAgo(dateStr);
    if (mins < 5) return { label: 'NEW', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' };
    if (mins < 60) return { label: 'RECENT', className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' };
    return null;
  };
  const getIntelFreshnessClass = (dateStr: string) => {
    const mins = getMinutesAgo(dateStr);
    if (mins < 60) return 'border-red-500/50';
    if (mins < 360) return 'border-orange-500/30';
    return 'border-red-500/20';
  };

  return (
    <>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="min-h-screen gradient-bg text-white">
      <UnifiedHeader currentView="feed" />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Live Feed</h1>
          <p className="text-sm text-slate-400">
            Breaking intelligence and locked claims in real time. Spot it early, lock it on-chain, resolve with receipts.
          </p>
        </div>

        <div className="mb-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-xl overflow-hidden">
          <div className="relative h-9 flex items-center">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-6 px-4">
              {tickerItems.concat(tickerItems).map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide ${
                    item.type === 'INTEL'
                      ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                      : 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-white font-medium">
                    {item.text}
                  </span>
                  {item.location && (
                    <>
                      <span className="text-neutral-500 text-xs">•</span>
                      <span className="text-[10px] text-neutral-400">{item.location}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New items notification pill */}
        {newItems && (newItems.claims > 0 || newItems.intel > 0) && (
          <div className="mb-4 flex justify-center animate-fade-in-up">
            <button
              onClick={() => {
                setNewItems(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/40 rounded-full text-sm font-medium text-purple-300 hover:bg-purple-600/30 hover:border-purple-500/60 transition-all shadow-lg shadow-purple-500/10"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              {newItems.claims > 0 && `${newItems.claims} new claim${newItems.claims > 1 ? 's' : ''}`}
              {newItems.claims > 0 && newItems.intel > 0 && ' · '}
              {newItems.intel > 0 && `${newItems.intel} new intel`}
              <span className="text-purple-400/60">· Dismiss</span>
            </button>
          </div>
        )}

        <div className="mb-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-xl px-4 py-2.5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2" title="Refreshes every 30 seconds">
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

              {/* Quick links */}
              <div className="flex items-center gap-2 ml-auto">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  My Stats
                </Link>
                <button
                  onClick={() => {
                    setContentFilter("claims");
                    setQuickFilter("my-claims");
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    quickFilter === "my-claims"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  My Claims
                </button>
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
                      const repTier = getReputationTier(claim.rep || 0);

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
                          {/* Top row: Author + Reputation | Status + Time */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                                {claim.authorNumber?.toString().slice(-2) || "??"}
                              </div>
                              <span className="text-xs text-slate-400 font-medium">#{claim.authorNumber}</span>
                              <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                                {repTier.name}
                              </span>
                              {(() => {
                                const badge = getFreshnessBadge(claim.createdAt || claim.timestamp);
                                return badge ? (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isCorrect ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" :
                                isIncorrect ? "bg-gradient-to-r from-red-500 to-red-600 text-white" :
                                "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                              }`}>
                                {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatRelativeTime(claim.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Claim Text */}
                          <p className="text-sm text-white leading-snug line-clamp-2 mb-2">
                            {claim.text}
                          </p>

                          {/* Bottom row */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px]">
                              {claim.category && (
                                <span className="text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                                  {claim.category}
                                </span>
                              )}
                              <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">
                                Locked
                              </span>
                              {isResolved && evidenceGradeInfo && (
                                <span className={`px-1.5 py-0.5 rounded font-bold ${evidenceGradeInfo.bgColor} ${evidenceGradeInfo.color}`}>
                                  {evidenceGradeInfo.label}
                                </span>
                              )}
                              {/* Resolve button - ONLY FOR YOUR PENDING CLAIMS */}
                              {isPending && (() => {
                                const anonId = typeof window !== 'undefined' ? localStorage.getItem("anonId") : null;
                                const isYourClaim = (user && claim.userId === user.id) || (anonId && claim.anonId === anonId);
                                return isYourClaim ? (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.location.href = `/resolve/${claim.id}`;
                                    }}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[10px] font-bold rounded transition-all hover:scale-105 active:scale-95"
                                  >
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Resolve
                                  </button>
                                ) : null;
                              })()}
                              <div className="flex items-center gap-2 ml-auto text-slate-500">
                                <span>{claim.upvotesCount || 0} up</span>
                                <span>{claim.downvotesCount || 0} dn</span>
                              </div>
                            </div>
                            {/* Hash snippet */}
                            <div className="flex items-center justify-end">
                              <code className="text-[9px] text-slate-500 font-mono">{claim.hash?.slice(0, 8)}...{claim.hash?.slice(-6)}</code>
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
                  <h2 className="text-lg font-semibold text-white">Intelligence Stream</h2>
                  <div className="flex-1 h-px bg-slate-700/40"></div>
                  <span className="text-xs text-slate-400">{filteredOsint.length} signals</span>
                </div>

                {filteredOsint.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredOsint.map((signal) => (
                      <IntelCard key={signal.id} item={signal} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <svg className="w-10 h-10 text-slate-600 mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                    </svg>
                    <p className="text-slate-500 text-sm">No intel signals found</p>
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
    </>
  );
}
