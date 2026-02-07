"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import TopSourcesList from "@/components/TopSourcesList";
import LandingHeader from "@/components/LandingHeader";
import DEStatusBanner from "@/components/DEStatusBanner";
import ClaimModal from "@/components/ClaimModal";
import Footer from "@/components/Footer";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";

type SortOption = "new" | "hot" | "top" | "resolved";

function AppFeedContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "leaderboard">(
    tabParam === "my" ? "my" : tabParam === "leaderboard" ? "leaderboard" : "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [anonId, setAnonId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("new");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [highEvidenceOnly, setHighEvidenceOnly] = useState(false);
  const [resolvedOnly, setResolvedOnly] = useState(false);
  const [hiddenPredictions, setHiddenPredictions] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const categories = ["all", "Crypto", "Politics", "Markets", "Tech", "Sports", "OSINT", "Culture", "Personal", "Other"];

  // Load hidden predictions from localStorage
  useEffect(() => {
    try {
      const hidden = localStorage.getItem("hiddenPredictions");
      if (hidden) {
        setHiddenPredictions(new Set(JSON.parse(hidden)));
      }
    } catch (error) {
      console.error("Error loading hidden predictions:", error);
    }
  }, []);

  useEffect(() => {
    const id = getOrCreateUserId();
    setAnonId(id);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchPredictions();
    }
  }, [activeTab, anonId, user, authLoading]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      let endpoint = "/api/predictions";

      if (activeTab === "my") {
        if (user) {
          endpoint = `/api/predictions?userId=${user.id}`;
        } else {
          endpoint = `/api/predictions?anonId=${anonId}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Fetch timed out after 10 seconds");
        alert("Failed to load predictions - connection timeout. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHidePrediction = (id: string) => {
    const newHidden = new Set(hiddenPredictions);
    newHidden.add(id);
    setHiddenPredictions(newHidden);
    // Save to localStorage
    try {
      localStorage.setItem("hiddenPredictions", JSON.stringify(Array.from(newHidden)));
    } catch (error) {
      console.error("Error saving hidden predictions:", error);
    }
  };

  const handleShowHidden = () => {
    setShowHidden(true);
  };

  const handleClearHidden = () => {
    setHiddenPredictions(new Set());
    setShowHidden(false);
    try {
      localStorage.removeItem("hiddenPredictions");
    } catch (error) {
      console.error("Error clearing hidden predictions:", error);
    }
  };

  // Apply filters and sorting
  const getFilteredAndSortedPredictions = () => {
    let filtered = predictions;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // High evidence filter
    if (highEvidenceOnly) {
      filtered = filtered.filter(p => p.evidence_score && p.evidence_score >= 76);
    }

    // Resolved only filter
    if (resolvedOnly) {
      filtered = filtered.filter(p => p.outcome === "correct" || p.outcome === "incorrect");
    }

    // Hide filter (unless showing hidden)
    if (!showHidden) {
      filtered = filtered.filter(p => !hiddenPredictions.has(p.id));
    }

    // Sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "new":
        sorted.sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());
        break;
      case "hot":
        // Hot = recent + engagement (likes, views, etc.) - for now just recent with slight randomization
        sorted.sort((a, b) => {
          const aTime = new Date(a.createdAt || a.timestamp).getTime();
          const bTime = new Date(b.createdAt || b.timestamp).getTime();
          const aScore = aTime + (Math.random() * 86400000); // Add up to 1 day random
          const bScore = bTime + (Math.random() * 86400000);
          return bScore - aScore;
        });
        break;
      case "top":
        // Top = highest evidence score first
        sorted.sort((a, b) => (b.evidence_score || 0) - (a.evidence_score || 0));
        break;
      case "resolved":
        // Resolved first, then by date
        sorted.sort((a, b) => {
          const aResolved = a.outcome === "correct" || a.outcome === "incorrect";
          const bResolved = b.outcome === "correct" || b.outcome === "incorrect";
          if (aResolved && !bResolved) return -1;
          if (!aResolved && bResolved) return 1;
          return new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime();
        });
        break;
    }

    return sorted;
  };

  const filteredPredictions = getFilteredAndSortedPredictions();
  const hiddenCount = hiddenPredictions.size;

  const syncDEStatus = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/sync-de-status", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setSyncMessage(
          data.updated > 0
            ? `Updated ${data.updated} proof${data.updated > 1 ? "s" : ""}`
            : "All proofs are up to date"
        );
        await fetchPredictions();
      } else {
        setSyncMessage(data.message || "Failed to sync status");
      }
    } catch (error) {
      console.error("Error syncing DE status:", error);
      setSyncMessage("Failed to sync status");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleMyProofsClick = () => {
    if (!user && activeTab === "my") {
      setShowClaimModal(true);
    } else {
      setActiveTab("my");
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs - Purple/Cyan theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-600/6 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-5 md:py-5 relative z-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-0.5 leading-tight">Explore predictions</h1>
            <p className="text-sm text-gray-400 leading-snug">Browse public predictions locked on-chain</p>
          </div>
          {/* Refresh button - Mobile only, icon-only */}
          {activeTab === "all" && (
            <button
              onClick={syncDEStatus}
              disabled={syncing}
              className="md:hidden h-9 w-9 glass text-gray-400 hover:text-white rounded-lg transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              title="Recheck on-chain status for pending proofs"
            >
              <svg
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-2.5 mb-4">
          {/* Tab buttons row - Purple theme */}
          <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Explore predictions
            </button>
            <button
              onClick={handleMyProofsClick}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "my"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              My predictions
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Top Trusted Sources
            </button>
          </div>

          {/* Category Pills + Refresh row */}
          {activeTab === "all" && (
            <div className="flex flex-col gap-2.5">
              {/* Category pills - Purple/Cyan theme */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : "glass border border-purple-500/20 text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/40"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>

              {/* Sort and Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort by dropdown - Dark theme */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 glass border border-purple-500/20 text-sm font-medium text-gray-300 hover:text-white rounded-lg transition-all hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span>
                      {sortBy === "new" && "New"}
                      {sortBy === "hot" && "Hot"}
                      {sortBy === "top" && "Top"}
                      {sortBy === "resolved" && "Resolved"}
                    </span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] z-50 py-1">
                        <button
                          onClick={() => { setSortBy("new"); setShowSortMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center gap-2 ${
                            sortBy === "new" ? "text-purple-300 bg-purple-500/20" : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          New
                        </button>
                        <button
                          onClick={() => { setSortBy("hot"); setShowSortMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center gap-2 ${
                            sortBy === "hot" ? "text-purple-300 bg-purple-500/20" : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          Hot
                        </button>
                        <button
                          onClick={() => { setSortBy("top"); setShowSortMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center gap-2 ${
                            sortBy === "top" ? "text-purple-300 bg-purple-500/20" : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Top
                        </button>
                        <button
                          onClick={() => { setSortBy("resolved"); setShowSortMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center gap-2 ${
                            sortBy === "resolved" ? "text-purple-300 bg-purple-500/20" : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Resolved
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Filter toggles - Purple/Cyan theme */}
                <button
                  onClick={() => setHighEvidenceOnly(!highEvidenceOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all border ${
                    highEvidenceOnly
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "glass border-purple-500/20 text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/40"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  High Evidence
                </button>

                <button
                  onClick={() => setResolvedOnly(!resolvedOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all border ${
                    resolvedOnly
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "glass border-purple-500/20 text-gray-400 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/40"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resolved Only
                </button>

                {/* Refresh button - Desktop */}
                <button
                  onClick={syncDEStatus}
                  disabled={syncing}
                  className="hidden md:flex px-3 py-2 glass text-sm font-medium text-gray-400 hover:text-white rounded-lg transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-1.5 border border-purple-500/20 ml-auto"
                  title="Recheck on-chain status for pending proofs"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>{syncing ? "Checking..." : "Refresh"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification - Purple theme */}
        {syncMessage && (
          <div className="mb-4 p-3 glass rounded-lg border border-purple-500/30 glow-purple fade-in">
            <p className="text-sm text-white">{syncMessage}</p>
          </div>
        )}

        {/* Hidden predictions banner - Dark theme */}
        {!showHidden && hiddenCount > 0 && activeTab === "all" && (
          <div className="mb-4 p-3 glass rounded-lg border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <span className="text-sm text-white">{hiddenCount} prediction{hiddenCount !== 1 ? "s" : ""} hidden</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShowHidden}
                className="px-3 py-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 transition-all"
              >
                Show
              </button>
              <button
                onClick={handleClearHidden}
                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-all"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
            </div>
          </div>
        ) : activeTab === "leaderboard" ? (
          <TopSourcesList category={selectedCategory} />
        ) : activeTab === "my" && !user ? (
          <div className="text-center py-20 fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6 float">
                <svg
                  className="w-20 h-20 text-purple-400 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                You're posting anonymously
              </h3>
              <p className="text-gray-400 mb-6 text-lg">
                {predictions.length > 0 ? (
                  <>You have {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} on this device.</>
                ) : (
                  <>Your predictions are stored locally on this device only.</>
                )}
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-left">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why claim with email?
                </h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Access your predictions from any device
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Keep your predictions safe if you clear browser data
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Prove ownership of your predictions
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Still anonymous - predictions stay on-chain, public, immutable
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-md transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Claim my predictions
              </button>
              <p className="text-xs text-white/50 mt-4">
                Save access across devices
              </p>
            </div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6 float">
              <svg
                className="w-20 h-20 text-purple-400 mx-auto"
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
            <h3 className="text-2xl font-bold text-white mb-3">
              {activeTab === "all"
                ? "No predictions locked yet"
                : "No predictions"}
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              {activeTab === "all"
                ? "No predictions have been locked yet"
                : "Create your first immutable prediction"}
            </p>
            <Link
              href="/lock"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-md transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Lock my first prediction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {filteredPredictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className={`fade-in stagger-${Math.min(index + 1, 4)}`}
              >
                <PredictionCard
                  prediction={prediction}
                  currentUserId={user?.id}
                  onOutcomeUpdate={fetchPredictions}
                  onHide={handleHidePrediction}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Development status banner */}
      <DEStatusBanner />

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          onClose={() => setShowClaimModal(false)}
          onSuccess={fetchPredictions}
        />
      )}
    </div>
  );
}

export default function AppFeed() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
        </div>
      </div>
    }>
      <AppFeedContent />
    </Suspense>
  );
}
