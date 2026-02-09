"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UnifiedHeader from "@/components/UnifiedHeader";
import ClaimModal from "@/components/ClaimModal";
import { Prediction } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

type ContentFilter = "all" | "osint" | "claims";

export default function AppFeedPage() {
  const { user } = useAuth();
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [osintSignals, setOsintSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch predictions
      const predRes = await fetch("/api/predictions", { cache: "no-store" });
      const predData = await predRes.json();
      setPredictions(predData.predictions || []);

      // Fetch OSINT signals
      const osintRes = await fetch("/api/osint?limit=100");
      const osintData = await osintRes.json();
      setOsintSignals(osintData || []);
    } catch (error) {
      console.error("Error fetching feed data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredPredictions = predictions.filter(p => {
    if (contentFilter === "osint") return false;
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

  // Merge and sort feed items chronologically
  const unifiedFeed = [
    ...filteredOsint.map(o => ({ type: 'osint' as const, data: o, timestamp: new Date(o.published_at || o.created_at).getTime() })),
    ...filteredPredictions.map(p => ({ type: 'claim' as const, data: p, timestamp: new Date(p.createdAt).getTime() }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen gradient-bg text-white">
      <UnifiedHeader currentView="feed" />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">

        {/* ProofLocker Monitoring Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-white">ProofLocker Feed</h1>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-500/30 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Live</span>
            </div>
          </div>
          <p className="text-neutral-400 leading-relaxed">
            <span className="text-white font-semibold">Monitoring the situation.</span> Real-time OSINT intelligence + verifiable claims, timestamped and backed by evidence. Lock claims, stake reputation, and track resolution with proof.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-black/80 border-y border-white/10 mb-8">
          <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
            {/* Content Type Tabs */}
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
                onClick={() => setContentFilter("osint")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  contentFilter === "osint"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                OSINT
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
            </div>

            {/* Search */}
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
                  placeholder="Search signals, claims, locations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
            >
              + Lock Claim
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* OSINT SIGNALS */}
            {contentFilter !== "claims" && filteredOsint.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/40 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                    </svg>
                    <h2 className="text-xl font-bold text-white">OSINT Signals</h2>
                    <span className="px-2 py-0.5 bg-red-500/30 text-red-200 text-xs font-bold rounded">
                      {filteredOsint.length}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/40 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOsint.map((signal) => (
                    <div
                      key={signal.id}
                      className="bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-5 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                    >
                      {/* Alert Pulse */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                          </svg>
                          OSINT
                        </span>
                        {signal.category && (
                          <span className="px-2 py-1 text-[10px] font-semibold rounded bg-red-900/40 border border-red-700/50 text-red-300 uppercase">
                            {signal.category}
                          </span>
                        )}
                      </div>

                      {/* Source Line */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
                        <div className="w-6 h-6 rounded bg-red-600/30 flex items-center justify-center border border-red-500/40">
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-red-200 font-semibold">{signal.source_name || "Unknown Source"}</div>
                          {signal.source_handle && (
                            <div className="text-xs text-red-400/70">@{signal.source_handle}</div>
                          )}
                        </div>
                        {signal.location && (
                          <div className="flex items-center gap-1 text-xs text-orange-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span>{signal.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-red-50 mb-2 leading-tight line-clamp-2">
                        {signal.title || "Untitled Signal"}
                      </h3>

                      {/* Content */}
                      {signal.summary && (
                        <p className="text-sm text-red-100/70 mb-4 line-clamp-2 leading-relaxed">
                          {signal.summary}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-red-500/20">
                        <div className="text-xs text-red-400/60 font-mono">
                          {new Date(signal.published_at || signal.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {signal.url && (
                            <a
                              href={signal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                              </svg>
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLAIMS */}
            {contentFilter !== "osint" && filteredPredictions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/40 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <h2 className="text-xl font-bold text-white">Verified Claims</h2>
                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-xs font-bold rounded">
                      {filteredPredictions.length}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/40 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPredictions.map((claim) => {
                    const isCorrect = claim.outcome === "correct";
                    const isIncorrect = claim.outcome === "incorrect";
                    const isPending = !claim.outcome || claim.outcome === "pending";

                    return (
                      <Link
                        key={claim.id}
                        href={`/proof/${claim.slug}`}
                        className="bg-gradient-to-br from-purple-950/30 via-purple-900/20 to-purple-950/30 border-2 border-purple-500/40 rounded-xl p-5 hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all relative overflow-hidden cursor-pointer"
                      >
                        {/* Alert Pulse */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>

                        {/* Header with Status & Reputation Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-purple-600/30 border border-purple-500/50 text-purple-200 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            CLAIM
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border ${
                              isCorrect ? "bg-green-500/30 border-green-500/50 text-green-200" :
                              isIncorrect ? "bg-red-500/30 border-red-500/50 text-red-200" :
                              "bg-yellow-500/30 border-yellow-500/50 text-yellow-200"
                            }`}>
                              {isCorrect && (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                  Correct
                                </>
                              )}
                              {isIncorrect && (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                  Incorrect
                                </>
                              )}
                              {isPending && (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  Pending
                                </>
                              )}
                            </span>

                            {/* Reputation Badge */}
                            {claim.author_reputation_tier && (
                              <span className="px-2 py-1 text-[10px] font-semibold rounded bg-blue-500/30 border border-blue-500/50 text-blue-200 uppercase">
                                Rep: 750
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Author Line */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/20">
                          <div className="w-6 h-6 rounded bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
                            <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-purple-200 font-semibold">{claim.pseudonym || "Anonymous"}</div>
                            {claim.userId && (
                              <div className="text-xs text-purple-400/70">@user-{claim.userId.slice(0, 8)}</div>
                            )}
                          </div>
                          {claim.location && (
                            <div className="flex items-center gap-1 text-xs text-purple-300">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span>{claim.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-purple-50 mb-2 leading-tight line-clamp-2">
                          {claim.text || "Untitled Claim"}
                        </h3>

                        {/* Content */}
                        {claim.description && (
                          <p className="text-sm text-purple-100/70 mb-4 line-clamp-2 leading-relaxed">
                            {claim.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
                          <div className="text-xs text-purple-400/60 font-mono">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <div className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              View Evidence
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredPredictions.length === 0 && filteredOsint.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-white/5 rounded-2xl border border-white/10 mb-6">
                  <svg className="w-16 h-16 text-neutral-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No signals found</h3>
                <p className="text-neutral-400">
                  {searchQuery ? "Try adjusting your search" : "Intelligence feed is loading..."}
                </p>
              </div>
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
