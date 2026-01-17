"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import BrandLogo from "@/components/BrandLogo";
import DEStatusBanner from "@/components/DEStatusBanner";
import ClaimModal from "@/components/ClaimModal";
import Footer from "@/components/Footer";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { getPublicHandle } from "@/lib/public-handle";

function AppFeedContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"all" | "my">(tabParam === "my" ? "my" : "all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [anonId, setAnonId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories = ["all", "Crypto", "Politics", "Markets", "Tech", "Sports", "Culture", "Personal", "Other"];

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

  const filteredPredictions = selectedCategory === "all"
    ? predictions
    : predictions.filter(p => p.category === selectedCategory);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      await fetchPredictions();
    } catch (error) {
      console.error("Error signing out:", error);
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
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 md:h-16 items-center justify-between">
          <Link href="/">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop: Show user info inline */}
            {user && (
              <div className="hidden md:flex flex-col items-end leading-tight">
                <div className="text-sm text-white font-medium">{getPublicHandle(user)}</div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-white/60 hover:text-white/90 hover:underline transition-all flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}

            {/* Mobile: Show user icon with dropdown */}
            {user && (
              <div className="relative md:hidden">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all"
                  aria-label="User menu"
                >
                  <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 glass border border-white/10 rounded-lg shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-xs text-neutral-500 mb-1">Signed in as</p>
                        <p className="text-sm text-white font-medium">{getPublicHandle(user)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Lock CTA */}
            <Link
              href="/lock"
              className="flex px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white text-sm md:text-base font-medium rounded-md transition-all whitespace-nowrap"
            >
              Lock my prediction
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5 md:py-5 relative z-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Explore predictions</h1>
            <p className="text-sm text-neutral-400">Browse public predictions locked on-chain</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Tab buttons row */}
          <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Explore predictions
            </button>
            <button
              onClick={handleMyProofsClick}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "my"
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              My predictions
            </button>
          </div>

          {/* Category Pills + Refresh row */}
          {activeTab === "all" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white border border-blue-500/30"
                        : "glass border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>

              {/* Refresh button */}
              <button
                onClick={syncDEStatus}
                disabled={syncing}
                className="px-3 py-1.5 sm:py-2 glass text-xs sm:text-sm font-medium text-neutral-400 hover:text-white rounded-lg transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0 self-end sm:self-auto"
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
          )}
        </div>

        {/* Toast Notification */}
        {syncMessage && (
          <div className="mb-4 p-3 glass rounded-lg border border-blue-500/20 glow-blue fade-in">
            <p className="text-sm text-white">{syncMessage}</p>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
            </div>
          </div>
        ) : activeTab === "my" && !user ? (
          <div className="text-center py-20 fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6 float">
                <svg
                  className="w-20 h-20 text-blue-500 mx-auto"
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
              <p className="text-[#888] mb-6 text-lg">
                {predictions.length > 0 ? (
                  <>You have {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} on this device.</>
                ) : (
                  <>Your predictions are stored locally on this device only.</>
                )}
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-left">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why claim with email?
                </h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Access your predictions from any device
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Keep your predictions safe if you clear browser data
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Prove ownership of your predictions
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Still anonymous - predictions stay on-chain, public, immutable
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-md transition-all"
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
                className="w-20 h-20 text-blue-500 mx-auto"
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
            <p className="text-neutral-400 mb-8 text-lg">
              {activeTab === "all"
                ? "No predictions have been locked yet"
                : "Create your first immutable prediction"}
            </p>
            <Link
              href="/lock"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-md transition-all"
            >
              Lock my first prediction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredPredictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className={`fade-in stagger-${Math.min(index + 1, 4)}`}
              >
                <PredictionCard
                  prediction={prediction}
                  currentUserId={user?.id}
                  onOutcomeUpdate={fetchPredictions}
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
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
        </div>
      </div>
    }>
      <AppFeedContent />
    </Suspense>
  );
}
