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
import VoteButtons from "@/components/VoteButtons";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";
import { getEvidenceGrade } from "@/lib/evidence-grading";

type SortOption = "new" | "hot" | "top" | "resolved";
type ContentType = "all" | "claims" | "osint";
// User reliability tier mapper (based on author number)
function getUserTier(authorNumber: number) {
  const score = (authorNumber * 17) % 1000;
  if (score >= 800) return { label: "Legend", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/40" };
  if (score >= 650) return { label: "Master", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/40" };
  if (score >= 500) return { label: "Expert", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/40" };
  if (score >= 300) return { label: "Trusted", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/40" };
  return { label: "Novice", color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/40" };
}

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
  const [osintCategory, setOsintCategory] = useState<string>("all");

  const categories = ["all", "Crypto", "Politics", "Markets", "Tech", "Sports", "OSINT", "Culture", "Personal", "Other"];
  const osintCategories = ["all", "Politics", "Tech", "Crypto", "Markets", "Sports", "Culture", "Other"];

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

  // Synchronized scrolling for claims and OSINT rows
  useEffect(() => {
    const claimsRow1 = document.getElementById('claims-scroll-row-1');
    const claimsRow2 = document.getElementById('claims-scroll-row-2');
    const osintRow1 = document.getElementById('osint-scroll-row-1');
    const osintRow2 = document.getElementById('osint-scroll-row-2');

    const syncScrollClaims = (e: Event) => {
      if (!claimsRow1 || !claimsRow2) return;
      const source = e.target as HTMLElement;
      const target = source === claimsRow1 ? claimsRow2 : claimsRow1;
      target.scrollLeft = source.scrollLeft;
    };

    const syncScrollOsint = (e: Event) => {
      if (!osintRow1 || !osintRow2) return;
      const source = e.target as HTMLElement;
      const target = source === osintRow1 ? osintRow2 : osintRow1;
      target.scrollLeft = source.scrollLeft;
    };

    claimsRow1?.addEventListener('scroll', syncScrollClaims);
    claimsRow2?.addEventListener('scroll', syncScrollClaims);
    osintRow1?.addEventListener('scroll', syncScrollOsint);
    osintRow2?.addEventListener('scroll', syncScrollOsint);

    return () => {
      claimsRow1?.removeEventListener('scroll', syncScrollClaims);
      claimsRow2?.removeEventListener('scroll', syncScrollClaims);
      osintRow1?.removeEventListener('scroll', syncScrollOsint);
      osintRow2?.removeEventListener('scroll', syncScrollOsint);
    };
  }, [predictions, osintSignals]); // Depend on data, not filtered

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
      // Fetch LIVE OSINT data from database
      const response = await fetch("/api/osint?limit=100");
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
        // Resolved claims FIRST (more interesting), then by date
        sorted.sort((a, b) => {
          const aResolved = a.outcome === "correct" || a.outcome === "incorrect";
          const bResolved = b.outcome === "correct" || b.outcome === "incorrect";

          // Resolved claims come first
          if (aResolved && !bResolved) return -1;
          if (!aResolved && bResolved) return 1;

          // Within same resolution status, sort by date
          return new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime();
        });
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

    // Category filter for OSINT
    if (osintCategory !== "all") {
      filtered = filtered.filter(s => s.category === osintCategory);
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
            Claims locked on-chain with cryptographic proof and timestamped evidence
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
              My Claims
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

          {/* Filters - Mobile-Optimized */}
          {activeTab === "all" && (
            <div className="space-y-3">
              {/* Main Content Type Toggle - Full Width on Mobile */}
              <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-slate-700/50 rounded-xl">
                <button
                  onClick={() => setContentType("claims")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    contentType === "claims"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span className="hidden sm:inline">Claims</span>
                </button>
                <button
                  onClick={() => setContentType("all")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    contentType === "all"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  <span className="hidden sm:inline">All</span>
                </button>
                <button
                  onClick={() => setContentType("osint")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    contentType === "osint"
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span className="hidden sm:inline">OSINT</span>
                </button>
              </div>

              {/* Secondary Filters - Responsive Layout */}
              {contentType === "claims" && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Resolved Filter */}
                  <div className="flex items-center gap-1 p-0.5 bg-slate-900/60 border border-slate-700/50 rounded-lg">
                    <button
                      onClick={() => setResolvedOnly(false)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        !resolvedOnly
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setResolvedOnly(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        resolvedOnly
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Resolved
                    </button>
                  </div>

                  {/* Category Pills - Horizontal Scroll */}
                  <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2">{categories.filter(cat => cat !== 'all').slice(0, 4).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                          selectedCategory === cat
                            ? "bg-purple-500/20 border border-purple-500/60 text-purple-300"
                            : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white"
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        <span className="hidden sm:inline">{cat}</span>
                      </button>
                    ))}</div>
                  </div>
                </div>
              )}
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

        {/* Feed Layout */}
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
                  <>Your claims are stored locally on this device only.</>
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
                    Access your claims from any device
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Keep your claims safe if you clear browser data
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Prove ownership of your claims
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Still anonymous - claims stay on-chain, public, immutable
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
                Claim my claims
              </button>
              <p className="text-xs text-white/50 mt-4">
                Save access across devices
              </p>
            </div>
          </div>
        ) : predictions.length === 0 && filteredOsint.length === 0 ? (
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
                ? "No claims locked yet"
                : "No claims"}
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              {activeTab === "all"
                ? "No claims have been locked yet"
                : "Create your first immutable claim"}
            </p>
            <Link
              href="/lock"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-md transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Lock my first claim
            </Link>
          </div>
        ) : (
          <div>
            {/* CLAIMS SECTION */}
            {contentType !== "osint" && filteredPredictions.length > 0 && (
              <div className="mb-12">
                {/* Section Header - Only show when mixing content or explicitly showing claims */}
                {(contentType === "all" && filteredOsint.length > 0) || contentType === "claims" ? (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/40 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <h2 className="text-xl font-bold text-white">Claims Feed</h2>
                      <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-xs font-bold rounded">
                        {filteredPredictions.length}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded ml-1">
                        {filteredPredictions.filter(p => p.outcome === 'correct' || p.outcome === 'incorrect').length} resolved
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/40 to-transparent"></div>
                  </div>
                ) : null}

                {/* Claims Grid - 2 Rows with Synchronized Scroll */}
                <div className="space-y-4">
                  {/* First Row */}
                  <div className="relative -mx-4 sm:mx-0">
                    <div className="overflow-x-auto overflow-y-hidden pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory" id="claims-scroll-row-1">
                      <div className="flex gap-4 sm:gap-6">
                        {filteredPredictions.slice(0, Math.ceil(filteredPredictions.length / 2)).map((prediction, index) => {
                    const cardStyle = getCardStyle(prediction, selectedCategory);
                    const showEvidence = prediction.linkedOsint && prediction.linkedOsint.length > 0;
                    const isResolved = prediction.outcome === 'correct' || prediction.outcome === 'incorrect';
                    const isCorrect = prediction.outcome === 'correct';

                    return (
                      <Link
                        key={prediction.id}
                        href={`/proof/${prediction.publicSlug}`}
                        className={`group w-[85vw] sm:w-[360px] md:w-[380px] flex-shrink-0 snap-start ${
                          isResolved
                            ? `bg-gradient-to-br ${isCorrect ? 'from-emerald-900/20 to-slate-900/50 border-emerald-500/30 border-l-emerald-500' : 'from-red-900/20 to-slate-900/50 border-red-500/30 border-l-red-500'} border border-l-[3px]`
                            : 'bg-slate-900/80 border border-slate-700/50'
                        } ${
                          isResolved
                            ? isCorrect ? 'hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'hover:border-slate-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                        } rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer fade-in`}
                      >
                        {/* Resolution Banner - Only for resolved claims */}
                        {isResolved && (
                          <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${isCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                            <div className="flex items-center gap-1.5">
                              {isCorrect ? (
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              )}
                              <span className={`${isCorrect ? 'text-emerald-400' : 'text-red-400'} font-bold text-[11px]`}>
                                {isCorrect ? 'RESOLVED CORRECT' : 'RESOLVED INCORRECT'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className={`text-[10px] ${isCorrect ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                              {isCorrect ? '+80 pts' : '-20 pts'}
                            </span>
                          </div>
                        )}

                        {/* User Header - Social Style */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {/* User Avatar - Bigger */}
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm font-bold border-2 border-purple-500/40 shadow-lg">
                              {prediction.authorNumber?.toString().slice(-2) || "??"}
                            </div>
                            <div>
                              <div className="text-sm text-white font-semibold">Anon #{prediction.authorNumber}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(prediction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·
                                <span className="ml-1">{new Date(prediction.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge - Proper with colors */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 shadow-lg ${
                            prediction.outcome === "correct"
                              ? "bg-emerald-500/30 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30"
                              : prediction.outcome === "incorrect"
                              ? "bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/30"
                              : "bg-amber-500/30 border-amber-400/60 text-amber-300 shadow-amber-500/30"
                          }`}>
                            {prediction.outcome === "correct" && (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                                Correct
                              </>
                            )}
                            {prediction.outcome === "incorrect" && (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Incorrect
                              </>
                            )}
                            {!prediction.outcome || prediction.outcome === "pending" && (
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
                            {prediction.textPreview}
                          </p>
                        </div>

                        {/* Category & On-Chain Tags */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {prediction.category && (
                            <span className="px-2 py-1 bg-slate-800/70 text-slate-400 text-xs rounded border border-slate-700/50">
                              #{prediction.category}
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

                        {/* Evidence Preview - Compact */}
                        {showEvidence && (
                          <div className="mb-4 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-cyan-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              <span>{prediction.linkedOsint.length} piece{prediction.linkedOsint.length !== 1 ? 's' : ''} of evidence</span>
                            </div>
                          </div>
                        )}

                        {/* Engagement Footer - Social Media Style */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mb-3">
                          {/* Left: Interactions */}
                          <div className="flex items-center gap-4">
                            {/* Vote Buttons */}
                            <VoteButtons
                              predictionId={prediction.id}
                              initialUpvotes={prediction.upvotesCount || 0}
                              initialDownvotes={prediction.downvotesCount || 0}
                              compact={true}
                            />

                            {/* Evidence Score */}
                            {prediction.evidence_score !== undefined && prediction.evidence_score > 0 && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                                <span className="text-xs font-medium">{prediction.evidence_score}</span>
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
                                {new Date(prediction.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                            {prediction.deId && (
                              <div className="text-[10px] text-purple-400/60 font-mono">
                                {prediction.deId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Second Row */}
            {filteredPredictions.length > Math.ceil(filteredPredictions.length / 2) && (
              <div className="relative -mx-4 sm:mx-0">
                <div className="overflow-x-auto overflow-y-hidden pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory" id="claims-scroll-row-2">
                  <div className="flex gap-4 sm:gap-6">
                    {filteredPredictions.slice(Math.ceil(filteredPredictions.length / 2)).map((prediction, index) => {
                    const cardStyle = getCardStyle(prediction, selectedCategory);
                    const showEvidence = prediction.linkedOsint && prediction.linkedOsint.length > 0;
                    const isResolved = prediction.outcome === 'correct' || prediction.outcome === 'incorrect';
                    const isCorrect = prediction.outcome === 'correct';

                    return (
                      <Link
                        key={prediction.id}
                        href={`/proof/${prediction.publicSlug}`}
                        className={`group w-[85vw] sm:w-[360px] md:w-[380px] flex-shrink-0 snap-start ${
                          isResolved
                            ? `bg-gradient-to-br ${isCorrect ? 'from-emerald-900/20 to-slate-900/50 border-emerald-500/30 border-l-emerald-500' : 'from-red-900/20 to-slate-900/50 border-red-500/30 border-l-red-500'} border border-l-[3px]`
                            : 'bg-slate-900/80 border border-slate-700/50'
                        } ${
                          isResolved
                            ? isCorrect ? 'hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'hover:border-slate-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                        } rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer fade-in`}
                      >
                        {/* Same card content as first row - copy from first row */}
                        {isResolved && (
                          <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${isCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                            <div className="flex items-center gap-1.5">
                              {isCorrect ? (
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              )}
                              <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center border border-purple-500/40">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm text-purple-300 font-semibold">
                                  {prediction.pseudonym ? `@${prediction.pseudonym}` : `Anon #${prediction.authorNumber}`}
                                </div>
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${cardStyle.badgeBg} ${cardStyle.badgeText} font-semibold`}>
                              {!prediction.outcome || prediction.outcome === "pending" ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                  </svg>
                                  Pending
                                </>
                              ) : prediction.outcome === "correct" ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                  </svg>
                                  Correct
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                  Incorrect
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-white text-[15px] leading-relaxed line-clamp-4">
                            {prediction.textPreview}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {prediction.category && (
                            <span className="px-2 py-1 bg-slate-800/70 text-slate-400 text-xs rounded border border-slate-700/50">
                              #{prediction.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/40 font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Locked
                          </span>
                        </div>

                        {showEvidence && (
                          <div className="mb-4 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-cyan-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              <span>{prediction.linkedOsint.length} piece{prediction.linkedOsint.length !== 1 ? 's' : ''} of evidence</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                              </svg>
                              <span className="text-xs font-medium">{prediction.upvotesCount || 0}</span>
                            </div>

                            {prediction.evidence_score !== undefined && prediction.evidence_score > 0 && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                                <span className="text-xs font-medium">{prediction.evidence_score}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                              </svg>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold transition-all group-hover:border-purple-400/60">
                            <span>View</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <span className="text-[10px] text-purple-300/80 font-mono">
                                {new Date(prediction.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  </div>
                </div>
              </div>
            )}
          </div>

              {/* View More */}
              {filteredPredictions.length > 0 && (
                <div className="text-center mt-4 px-4 sm:px-0">
                  <span className="text-xs sm:text-sm text-slate-400">
                    Showing {filteredPredictions.length} claim{filteredPredictions.length !== 1 ? 's' : ''} · Swipe to browse
                  </span>
                </div>
              )}
            </div>
            )}

            {/* OSINT / INTEL SECTION */}
            {contentType !== "claims" && filteredOsint.length > 0 && (
              <div>
                {/* Section Header with Category Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/40 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                      </svg>
                      <h2 className="text-xl font-bold text-white">OSINT Intelligence</h2>
                      <span className="px-2 py-0.5 bg-red-500/30 text-red-200 text-xs font-bold rounded">
                        {filteredOsint.length}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-red-500/40 to-transparent"></div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {osintCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setOsintCategory(cat)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          osintCategory === cat
                            ? "bg-red-600/30 border-2 border-red-500/60 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                            : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-600/50 hover:text-slate-300"
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* OSINT Grid - 2 Rows with Horizontal Scroll */}
                <div className="space-y-4">
                  {/* First Row */}
                  <div className="relative -mx-4 sm:mx-0">
                    <div className="overflow-x-auto overflow-y-hidden pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory" id="osint-scroll-row-1">
                      <div className="flex gap-4 sm:gap-6">
                        {filteredOsint.slice(0, Math.ceil(filteredOsint.length / 2)).map((signal, index) => (
                      <div
                        key={signal.id}
                        className="w-[85vw] sm:w-[360px] md:w-[380px] flex-shrink-0 snap-start bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-4 sm:p-5 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                      >
                        {/* Alert Pulse Animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                        {/* Header - Intel Style */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {/* OSINT Alert Badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                              </svg>
                              Intel
                            </span>
                          </div>

                          {/* Category Tag */}
                          {signal.category && (
                            <span className="px-2 py-1 text-[10px] font-semibold rounded bg-red-900/40 border border-red-700/50 text-red-300 uppercase">
                              {signal.category}
                            </span>
                          )}
                        </div>

                        {/* Source Line - News Style */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
                          <div className="w-6 h-6 rounded bg-red-600/30 flex items-center justify-center border border-red-500/40">
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-red-200 font-semibold">{signal.sourceName}</div>
                            {signal.sourceHandle && (
                              <div className="text-xs text-red-400/70">{signal.sourceHandle}</div>
                            )}
                          </div>
                          {signal.locationName && (
                            <div className="flex items-center gap-1 text-xs text-orange-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span>{signal.locationName}</span>
                            </div>
                          )}
                        </div>

                        {/* Title - Breaking News Style */}
                        <h3 className="text-base font-bold text-red-50 mb-2 leading-tight line-clamp-2">
                          {signal.title}
                        </h3>

                        {/* Content preview */}
                        {signal.content && (
                          <p className="text-sm text-red-100/70 mb-4 line-clamp-2 leading-relaxed">
                            {signal.content}
                          </p>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-red-500/20">
                          <div className="text-xs text-red-400/60 font-mono">
                            ID: {signal.id.slice(0, 8)}
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={signal.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              Source
                            </a>
                            <button
                              onClick={() => {
                                setSelectedOsint(signal);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                              Link as Evidence
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Row */}
              {filteredOsint.length > Math.ceil(filteredOsint.length / 2) && (
                <div className="relative -mx-4 sm:mx-0">
                  <div className="overflow-x-auto overflow-y-hidden pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory" id="osint-scroll-row-2">
                    <div className="flex gap-4 sm:gap-6">
                      {filteredOsint.slice(Math.ceil(filteredOsint.length / 2)).map((signal, index) => (
                        <div
                          key={signal.id}
                          className="w-[85vw] sm:w-[360px] md:w-[380px] flex-shrink-0 snap-start bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-4 sm:p-5 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                        >
                          {/* Alert Pulse Animation */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                          {/* Header - Intel Style */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {/* OSINT Alert Badge */}
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                                </svg>
                                Intel
                              </span>
                            </div>

                            {/* Category Tag */}
                            {signal.category && (
                              <span className="px-2 py-1 text-[10px] font-semibold rounded bg-red-900/40 border border-red-700/50 text-red-300 uppercase">
                                {signal.category}
                              </span>
                            )}
                          </div>

                          {/* Source Line - News Style */}
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
                            <div className="w-6 h-6 rounded bg-red-600/30 flex items-center justify-center border border-red-500/40">
                              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-red-200 font-semibold">{signal.sourceName}</div>
                              {signal.sourceHandle && (
                                <div className="text-xs text-red-400/70">{signal.sourceHandle}</div>
                              )}
                            </div>
                            {signal.locationName && (
                              <div className="flex items-center gap-1 text-xs text-orange-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span>{signal.locationName}</span>
                              </div>
                            )}
                          </div>

                          {/* Title - Breaking News Style */}
                          <h3 className="text-base font-bold text-red-50 mb-2 leading-tight line-clamp-2">
                            {signal.title}
                          </h3>

                          {/* Content preview */}
                          {signal.content && (
                            <p className="text-sm text-red-100/70 mb-4 line-clamp-2 leading-relaxed">
                              {signal.content}
                            </p>
                          )}

                          {/* Footer Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-red-500/20">
                            <div className="text-xs text-red-400/60 font-mono">
                              ID: {signal.id.toString().slice(0, 8)}
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={signal.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Source
                              </a>
                              <button
                                onClick={() => {
                                  setSelectedOsint(signal);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                Link as Evidence
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* View More */}
              {filteredOsint.length > 0 && (
                <div className="text-center mt-4 px-4 sm:px-0">
                  <span className="text-xs sm:text-sm text-slate-400">
                    Showing {filteredOsint.length} intel item{filteredOsint.length !== 1 ? 's' : ''} · Swipe to browse
                  </span>
                </div>
              )}
            </div>
          )}
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
