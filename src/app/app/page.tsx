"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import TopSourcesList from "@/components/TopSourcesList";
import LandingHeader from "@/components/LandingHeader";
import UnifiedHeader from "@/components/UnifiedHeader";
import DEStatusBanner from "@/components/DEStatusBanner";
import ClaimModal from "@/components/ClaimModal";
import Footer from "@/components/Footer";
import LinkOsintModal from "@/components/LinkOsintModal";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";

type SortOption = "new" | "hot" | "top" | "resolved";
type ContentType = "all" | "claims" | "osint";

// Helper function to get card styling based on outcome and category
function getCardStyle(prediction: Prediction, selectedCategory: string) {
  const isCorrect = prediction.outcome === "correct";
  const isIncorrect = prediction.outcome === "incorrect";

  // For resolved correct predictions in "all" filter, always use green
  if (isCorrect && selectedCategory === "all") {
    return {
      background: "from-emerald-600/8 via-emerald-500/5 to-emerald-700/8",
      border: "border-emerald-500/30 hover:border-emerald-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-400",
      accentColor: "text-emerald-300",
    };
  }

  // For category-specific views or pending
  const categoryColors: Record<string, any> = {
    Crypto: {
      background: "from-blue-600/8 via-blue-500/5 to-blue-700/8",
      border: "border-blue-500/30 hover:border-blue-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-blue-500/20",
      badgeText: isCorrect ? "text-emerald-400" : "text-blue-400",
      accentColor: "text-blue-300",
    },
    Politics: {
      background: "from-purple-600/8 via-purple-500/5 to-purple-700/8",
      border: "border-purple-500/30 hover:border-purple-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-purple-500/20",
      badgeText: isCorrect ? "text-emerald-400" : "text-purple-400",
      accentColor: "text-purple-300",
    },
    Tech: {
      background: "from-cyan-600/8 via-cyan-500/5 to-cyan-700/8",
      border: "border-cyan-500/30 hover:border-cyan-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-cyan-500/20",
      badgeText: isCorrect ? "text-emerald-400" : "text-cyan-400",
      accentColor: "text-cyan-300",
    },
    OSINT: {
      background: "from-orange-600/8 via-orange-500/5 to-orange-700/8",
      border: "border-orange-500/30 hover:border-orange-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-orange-500/20",
      badgeText: isCorrect ? "text-emerald-400" : "text-orange-400",
      accentColor: "text-orange-300",
    },
    Markets: {
      background: "from-green-600/8 via-green-500/5 to-green-700/8",
      border: "border-green-500/30 hover:border-green-500/50",
      shadow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]",
      badgeBg: isCorrect ? "bg-emerald-500/20" : "bg-green-500/20",
      badgeText: isCorrect ? "text-emerald-400" : "text-green-400",
      accentColor: "text-green-300",
    },
  };

  const categoryKey = prediction.category || "Crypto";
  const style = categoryColors[categoryKey] || categoryColors.Crypto;

  // For "all" filter on pending/incorrect, use neutral
  if (selectedCategory === "all" && !isCorrect) {
    return {
      background: "from-slate-700/8 via-slate-600/5 to-slate-700/8",
      border: "border-slate-600/30 hover:border-slate-500/50",
      shadow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]",
      badgeBg: isIncorrect ? "bg-red-500/20" : "bg-slate-500/20",
      badgeText: isIncorrect ? "text-red-400" : "text-slate-400",
      accentColor: "text-slate-300",
    };
  }

  return style;
}


function AppFeedContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "leaderboard">(
    tabParam === "my" ? "my" : tabParam === "leaderboard" ? "leaderboard" : "all"
  );
  const [contentType, setContentType] = useState<ContentType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [osintSignals, setOsintSignals] = useState<any[]>([]);
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
  const [selectedOsint, setSelectedOsint] = useState<any | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);

  const categories = ["all", "Crypto", "Politics", "Markets", "Tech", "Sports", "OSINT", "Culture", "Personal", "Other"];

  // Category icons and colors
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "crypto":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
      case "politics":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>;
      case "markets":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
      case "tech":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
      case "sports":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
      case "osint":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
      case "culture":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>;
      case "personal":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
      case "all":
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>;
      default:
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
    }
  };

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
      if (activeTab === "all") {
        fetchOsintSignals();
      }
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

  const fetchOsintSignals = async () => {
    try {
      // Use mock endpoint for now
      const response = await fetch("/api/osint/mock");
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      setOsintSignals(data || []);
    } catch (error) {
      console.error("Error fetching OSINT signals:", error);
      setOsintSignals([]);
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

    // Content type filter (predictions are user claims)
    if (contentType === "osint") {
      filtered = []; // No predictions if showing OSINT only
    }

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

  const getFilteredOsintSignals = () => {
    let filtered = osintSignals;

    // Content type filter
    if (contentType === "claims") {
      return []; // No OSINT if showing claims only
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    return filtered;
  };

  const filteredPredictions = getFilteredAndSortedPredictions();
  const filteredOsint = getFilteredOsintSignals();
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

      {/* Unified Header */}
      <UnifiedHeader
        currentView="feed"
        onLockClick={() => setShowLockModal(true)}
      />

      {/* Main content - adjusted for unified header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-5 md:py-24 relative z-10">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Real Claims. Real Outcomes.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Predictions locked on-chain with cryptographic proof and timestamped evidence
          </p>
        </div>

        {/* Tabs - Simplified and Clean */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Main navigation tabs */}
          <div className="flex items-center gap-2 p-1 glass rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All
            </button>
            <button
              onClick={handleMyProofsClick}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                activeTab === "my"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              My Predictions
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Filters - only show for "all" tab */}
          {activeTab === "all" && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Claims/OSINT toggle - Clean and simple */}
              <div className="flex items-center gap-1 p-1 glass rounded-lg">
                <button
                  onClick={() => setContentType("claims")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    contentType === "claims"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Claims
                </button>
                <button
                  onClick={() => setContentType("osint")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    contentType === "osint"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  OSINT
                </button>
                <button
                  onClick={() => setContentType("all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    contentType === "all"
                      ? "bg-slate-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All
                </button>
              </div>

              {/* Category pills - simpler */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  let activeClass = "glass border border-slate-700 text-slate-400 hover:text-white";

                  if (isActive) {
                    if (cat === "Crypto") activeClass = "bg-blue-500/20 border border-blue-500/50 text-blue-300";
                    else if (cat === "Politics") activeClass = "bg-purple-500/20 border border-purple-500/50 text-purple-300";
                    else if (cat === "Tech") activeClass = "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300";
                    else if (cat === "OSINT") activeClass = "bg-orange-500/20 border border-orange-500/50 text-orange-300";
                    else if (cat === "Markets") activeClass = "bg-green-500/20 border border-green-500/50 text-green-300";
                    else activeClass = "bg-slate-600/30 border border-slate-500/50 text-slate-200";
                  }

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${activeClass}`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  );
                })}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Render Claims */}
            {filteredPredictions.map((prediction, index) => {
              const cardStyle = getCardStyle(prediction, selectedCategory);
              const showEvidence = prediction.linkedOsint && prediction.linkedOsint.length > 0;

              return (
                <Link
                  key={prediction.id}
                  href={`/proof/${prediction.publicSlug}`}
                  className={`group bg-gradient-to-br ${cardStyle.background} border ${cardStyle.border} rounded-xl p-6 transition-all duration-300 ${cardStyle.shadow} hover:-translate-y-1 cursor-pointer fade-in stagger-${Math.min(index + 1, 4)}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold border border-slate-500/30">
                        {prediction.authorNumber?.toString().slice(-2) || "??"}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">Anon #{prediction.authorNumber}</div>
                        <div className="text-xs flex items-center gap-1">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          <span className="text-purple-300 font-medium">
                            {new Date(prediction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Status Badge - Vibrant with glow */}
                    <div className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 shadow-lg ${
                      prediction.outcome === "correct"
                        ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30"
                        : prediction.outcome === "incorrect"
                        ? "bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/30"
                        : "bg-amber-500/30 border-amber-400/60 text-amber-300 shadow-amber-500/30"
                    }`}>
                      {prediction.outcome === "correct" && (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                          Correct
                        </>
                      )}
                      {prediction.outcome === "incorrect" && (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          Incorrect
                        </>
                      )}
                      {!prediction.outcome || prediction.outcome === "pending" && (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                          Pending
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  {prediction.category && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded mb-3 border border-slate-700/50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      {prediction.category}
                    </div>
                  )}

                  {/* On-chain timestamp - discrete indicator */}
                  {prediction.deId && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/20 border border-purple-500/30 text-purple-300 text-[10px] rounded mb-3 ml-2">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      <span className="font-mono">On-chain: {new Date(prediction.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-white text-base font-medium leading-snug mb-4 line-clamp-3 group-hover:${cardStyle.accentColor} transition-colors`}>
                    {prediction.textPreview}
                  </h3>

                  {/* Timestamped Evidence Section */}
                  {showEvidence && (
                    <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span className="text-xs text-slate-400 font-semibold">Evidence Chain</span>
                      </div>
                      <div className="space-y-1.5">
                        {prediction.linkedOsint.slice(0, 2).map((evidence: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-cyan-400 mt-1.5"></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-cyan-300 truncate">{evidence.title || 'Evidence linked'}</div>
                              <div className="text-slate-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {new Date(evidence.timestamp || evidence.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                        {prediction.linkedOsint.length > 2 && (
                          <div className="text-xs text-slate-500 pl-3">
                            +{prediction.linkedOsint.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
                    <div className="flex items-center gap-3 text-sm">
                      {prediction.evidence_score !== undefined && prediction.evidence_score > 0 && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                          </svg>
                          <span className="text-cyan-400 font-semibold text-xs">{prediction.evidence_score}/100</span>
                        </div>
                      )}
                      {prediction.deId && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                          <span className="text-purple-400 text-xs font-mono">{prediction.deId.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                    {prediction.upvotesCount !== undefined && prediction.upvotesCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="text-xs">{prediction.upvotesCount}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Render OSINT Signals */}
            {filteredOsint.map((signal, index) => (
              <div
                key={signal.id}
                className={`fade-in stagger-${Math.min(index + 1, 4)}`}
              >
                <div className="glass rounded-xl p-5 border border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all">
                  {/* OSINT Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-red-500/10 border border-red-400/30 text-red-300">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                      </svg>
                      OSINT
                    </span>
                    {signal.category && (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-red-900/20 text-red-300">
                        {signal.category}
                      </span>
                    )}
                  </div>

                  {/* Source info */}
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="text-red-300 font-medium">{signal.sourceName}</span>
                    {signal.sourceHandle && (
                      <span className="text-red-400/70">{signal.sourceHandle}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-medium text-red-50 mb-3 line-clamp-2">
                    {signal.title}
                  </h3>

                  {/* Content preview */}
                  {signal.content && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {signal.content}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      {signal.locationName && (
                        <span className="text-xs text-gray-400">{signal.locationName}</span>
                      )}
                      {signal.confidenceScore && (
                        <span className="text-xs text-red-400">{signal.confidenceScore}% confidence</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={signal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                      >
                        Source
                      </a>
                      <button
                        onClick={() => {
                          setSelectedOsint(signal);
                        }}
                        className="px-3 py-1.5 text-xs rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
                      >
                        Use as Evidence
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Quick Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Quick Lock</h3>
              <button
                onClick={() => setShowLockModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mb-4">
              For the full lock experience with evidence upload:
            </p>
            <Link
              href="/lock"
              className="block w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-center hover:from-purple-500 hover:to-blue-500 transition-all"
              onClick={() => setShowLockModal(false)}
            >
              Go to Lock Page
            </Link>
          </div>
        </div>
      )}

      {/* Link OSINT Modal */}
      {selectedOsint && (
        <LinkOsintModal
          osintSignal={{
            id: selectedOsint.id,
            createdAt: selectedOsint.createdAt,
            title: selectedOsint.title,
            content: selectedOsint.content || '',
            sourceName: selectedOsint.sourceName,
            sourceHandle: selectedOsint.sourceHandle,
            sourceUrl: selectedOsint.sourceUrl,
            geotagLat: selectedOsint.geotagLat,
            geotagLng: selectedOsint.geotagLng,
            locationName: selectedOsint.locationName,
            tags: selectedOsint.tags || [],
            publishedAt: selectedOsint.publishedAt,
            ingestedAt: selectedOsint.ingestedAt,
            confidenceScore: selectedOsint.confidenceScore,
          }}
          onClose={() => setSelectedOsint(null)}
          onLinked={() => {
            setSelectedOsint(null);
            fetchPredictions(); // Refresh to show updated evidence scores
          }}
          currentUserId={user?.id}
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
