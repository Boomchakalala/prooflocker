"use client";

import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/UnifiedHeader";
import FeedCard from "@/components/FeedCard";
import ClaimModal from "@/components/ClaimModal";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";
import { convertEvidenceScoreToGrade } from "@/lib/reputation-scoring";

type ContentFilter = "all" | "osint" | "claims";
type SortOption = "latest" | "top" | "nearby";

export default function AppFeedPage() {
  const { user } = useAuth();
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
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

  // Filter and sort logic
  const getFilteredAndSortedItems = () => {
    let items: any[] = [];

    // Build unified feed items
    if (contentFilter === "all" || contentFilter === "claims") {
      const claimItems = predictions.map(p => ({
        type: 'claim' as const,
        id: p.id,
        data: p,
        timestamp: new Date(p.createdAt).getTime(),
      }));
      items = [...items, ...claimItems];
    }

    if (contentFilter === "all" || contentFilter === "osint") {
      const osintItems = osintSignals.map(o => ({
        type: 'osint' as const,
        id: o.id,
        data: o,
        timestamp: new Date(o.published_at || o.created_at).getTime(),
      }));
      items = [...items, ...osintItems];
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        if (item.type === 'claim') {
          return item.data.text?.toLowerCase().includes(query) ||
                 item.data.category?.toLowerCase().includes(query);
        } else {
          return item.data.title?.toLowerCase().includes(query) ||
                 item.data.summary?.toLowerCase().includes(query) ||
                 item.data.location?.toLowerCase().includes(query);
        }
      });
    }

    // Sort
    if (sortBy === "latest") {
      items.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === "top") {
      // Sort by engagement (votes, comments, etc.)
      items.sort((a, b) => {
        const aScore = (a.data.upvotes || 0) - (a.data.downvotes || 0);
        const bScore = (b.data.upvotes || 0) - (b.data.downvotes || 0);
        return bScore - aScore;
      });
    }

    return items;
  };

  const filteredItems = getFilteredAndSortedItems();

  // Calculate time ago
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen gradient-bg text-white">
      <UnifiedHeader currentView="feed" />

      {/* Feed Header - Compact, monitoring vibe */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-6">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Monitoring the situation.
          </h1>
          <p className="text-base text-neutral-400">
            OSINT + claims, mapped to the world — credibility backed by evidence.
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Post a claim → lock it → resolve with receipts → reputation updates.
          </p>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap md:flex-nowrap">
            {/* Left: Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setContentFilter("all")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  contentFilter === "all"
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setContentFilter("osint")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  contentFilter === "osint"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                OSINT
              </button>
              <button
                onClick={() => setContentFilter("claims")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  contentFilter === "claims"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10"
                }`}
              >
                Claims
              </button>
            </div>

            {/* Middle: Search */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search locations, topics, sources…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Right: Sort dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="top">Top</option>
                <option value="nearby">Nearby</option>
              </select>

              <button
                onClick={() => setShowClaimModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                + Claim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <svg
                className="w-16 h-16 text-neutral-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
            <p className="text-neutral-400">
              {searchQuery
                ? "Try adjusting your search"
                : "Be the first to post a claim"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              if (item.type === 'claim') {
                const claim = item.data as Prediction;
                return (
                  <FeedCard
                    key={`claim-${item.id}`}
                    variant="claim"
                    id={item.id}
                    title={claim.text || "Untitled claim"}
                    content={claim.description}
                    location={
                      claim.location
                        ? {
                            city: claim.location.split(",")[0]?.trim(),
                            country: claim.location.split(",")[1]?.trim(),
                          }
                        : undefined
                    }
                    timeAgo={getTimeAgo(item.timestamp)}
                    category={claim.category}
                    sourceOrAuthor={{
                      name: claim.pseudonym || "Anonymous",
                      handle: claim.userId ? `user-${claim.userId.slice(0, 8)}` : undefined,
                    }}
                    status={
                      claim.outcome === "correct"
                        ? "resolved_correct"
                        : claim.outcome === "incorrect"
                        ? "resolved_incorrect"
                        : "pending"
                    }
                    reputationScore={claim.author_reputation_tier ? 750 : 100}
                    onPrimaryAction={() => {
                      window.location.href = `/proof/${claim.slug}`;
                    }}
                    onSecondaryAction={() => {
                      navigator.share?.({
                        title: claim.text,
                        url: `${window.location.origin}/proof/${claim.slug}`,
                      });
                    }}
                    votes={{
                      up: claim.upvotes || 0,
                      down: claim.downvotes || 0,
                    }}
                    comments={0}
                  />
                );
              } else {
                const osint = item.data;
                return (
                  <FeedCard
                    key={`osint-${item.id}`}
                    variant="osint"
                    id={item.id}
                    title={osint.title || "Untitled signal"}
                    content={osint.summary}
                    location={
                      osint.location
                        ? {
                            city: osint.location.split(",")[0]?.trim(),
                            country: osint.location.split(",")[1]?.trim(),
                            coordinates: osint.coordinates,
                          }
                        : undefined
                    }
                    timeAgo={getTimeAgo(item.timestamp)}
                    category={osint.category}
                    sourceOrAuthor={{
                      name: osint.source_name || "Unknown",
                      handle: osint.source_handle,
                      platform: osint.platform as any,
                    }}
                    onPrimaryAction={() => {
                      if (osint.url) {
                        window.open(osint.url, "_blank");
                      }
                    }}
                    onSecondaryAction={
                      osint.coordinates
                        ? () => {
                            window.location.href = `/globe?lat=${osint.coordinates.split(",")[0]}&lng=${osint.coordinates.split(",")[1]}`;
                          }
                        : undefined
                    }
                    votes={{
                      up: 0,
                      down: 0,
                    }}
                    comments={0}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  );
}
