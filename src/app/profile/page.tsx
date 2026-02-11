"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Prediction } from "@/lib/storage";
import { signOut, getAccessToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { InsightScoreResponse } from "@/lib/insight-types";
import { BADGES, BadgeId } from "@/lib/insight-score";
import UnifiedHeader from '@/components/UnifiedHeader';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<InsightScoreResponse | null>(null);
  const [pseudonym, setPseudonymState] = useState<string>("");
  const [pseudonymInput, setPseudonymInput] = useState<string>("");
  const [pseudonymError, setPseudonymError] = useState<string | null>(null);
  const [pseudonymSuccess, setPseudonymSuccess] = useState(false);
  const [settingPseudonym, setSettingPseudonym] = useState(false);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Get anon ID from localStorage
  const getAnonId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("anonId");
  };

  useEffect(() => {
    if (user) {
      fetchPredictions();
      fetchScore();
      // Set page title
      document.title = "Your Profile - ProofLocker";
    }
  }, [user]);

  const fetchScore = async () => {
    if (!user) return;

    try {
      const anonId = getAnonId();
      const params = new URLSearchParams();
      if (anonId) {
        params.append("anonId", anonId);
      }

      const token = await getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/insight/current?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        console.error("Insight API returned", response.status);
        return;
      }

      const data: InsightScoreResponse = await response.json();
      setScoreData(data);
    } catch (err) {
      console.error("Error fetching insight score:", err);
    }
  };

  const fetchPredictions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch predictions
      const response = await fetch(`/api/predictions?userId=${user.id}`);
      const data = await response.json();
      const preds = data.predictions || [];
      setPredictions(preds);

      // Get pseudonym from first prediction if it exists
      if (preds.length > 0 && preds[0].pseudonym) {
        setPseudonymState(preds[0].pseudonym);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPseudonym = async () => {
    if (!pseudonymInput.trim()) {
      setPseudonymError("Pseudonym cannot be empty");
      return;
    }

    setSettingPseudonym(true);
    setPseudonymError(null);
    setPseudonymSuccess(false);

    try {
      const response = await fetch("/api/pseudonym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudonym: pseudonymInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPseudonymError(data.error || "Failed to set pseudonym");
        return;
      }

      setPseudonymState(data.pseudonym);
      setPseudonymSuccess(true);
      setPseudonymInput("");

      // Refresh predictions to show pseudonym
      await fetchPredictions();
    } catch (error) {
      console.error("Error setting pseudonym:", error);
      setPseudonymError("Failed to set pseudonym");
    } finally {
      setSettingPseudonym(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case "correct":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "incorrect":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "invalid":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white flex items-center justify-center pt-16">
        <UnifiedHeader currentView="other" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const score = scoreData?.score;
  const hasPoints = (score?.totalPoints || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white relative pt-16 py-12 px-6">
      <UnifiedHeader currentView="other" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-montserrat)" }}>
            My Profile
          </h1>
          <p className="text-neutral-400 text-sm mb-4">{user.email}</p>
          {user && (
            <p className="text-purple-400 text-sm">
              Sync enabled -- scores saved across devices
            </p>
          )}
        </div>

        {/* Main Score Card - Same as Dashboard */}
        {score && (
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl shadow-2xl p-10 mb-8 text-center">
            <div className="mb-6">
              <div className="text-6xl font-bold text-purple-400 mb-2">
                {score.totalPoints.toLocaleString()}
              </div>
              <div className="text-xl text-slate-300 font-semibold mb-4">
                {scoreData.milestone.name}
              </div>
              <div className="flex items-center justify-center gap-6 text-base">
                <div>
                  Accuracy:{" "}
                  <span
                    className={`font-bold ${
                      scoreData.accuracy >= 75 ? "text-emerald-400" : scoreData.accuracy >= 60 ? "text-amber-400" : "text-red-400"
                    }`}
                  >
                    {scoreData.accuracy}%
                  </span>{" "}
                  <span className="text-slate-500">
                    ({score.correctResolves}/{score.totalResolves})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Same as Dashboard */}
        {score && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Locked</div>
              <div className="text-3xl font-bold text-white">{score.locksCount}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Claimed</div>
              <div className="text-3xl font-bold text-purple-400">{score.claimsCount}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Resolved</div>
              <div className="text-3xl font-bold">
                <span className="text-emerald-400">{score.correctResolves}</span>
                <span className="text-slate-600">/</span>
                <span className="text-red-400">{score.incorrectResolves}</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5">
              <div className="text-slate-400 text-sm mb-1">Streak</div>
              <div className="text-3xl font-bold text-purple-400">
                {score.currentStreak}
              </div>
            </div>
          </div>
        )}

        {/* Pseudonym section */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-8">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Public Identity</h3>
          {pseudonym ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-neutral-200 font-medium">{pseudonym}</span>
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  Set
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                This pseudonym identifies you publicly on all your claims. It cannot be changed.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-neutral-400 mb-4">
                Set a pseudonym to identify yourself publicly without revealing your real identity.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pseudonymInput}
                  onChange={(e) => setPseudonymInput(e.target.value)}
                  placeholder="Enter pseudonym (2-30 chars)"
                  disabled={settingPseudonym}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/20 rounded-md text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 disabled:opacity-50"
                  maxLength={30}
                />
                <button
                  onClick={handleSetPseudonym}
                  disabled={settingPseudonym || !pseudonymInput.trim()}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/20 text-neutral-200 font-medium rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingPseudonym ? "Setting..." : "Set"}
                </button>
              </div>
              {pseudonymError && (
                <p className="text-xs text-red-400 mt-2">{pseudonymError}</p>
              )}
              {pseudonymSuccess && (
                <p className="text-xs text-green-400 mt-2">Pseudonym set successfully!</p>
              )}
              <p className="text-xs text-neutral-500 mt-3">
                Note: Once set, your pseudonym is permanent and cannot be changed. Choose carefully.
              </p>
            </div>
          )}
        </div>

        {/* Badges - Same as Dashboard */}
        {score && score.badges.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Badges Earned</h2>
            <div className="flex flex-wrap gap-3">
              {score.badges.map((badgeId) => {
                const badge = BADGES[badgeId as BadgeId];
                if (!badge) return null;
                return (
                  <div
                    key={badgeId}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 min-w-[180px]"
                    title={badge.description}
                  >
                    <div className="text-base font-semibold text-white mb-1">{badge.name}</div>
                    <div className="text-xs text-slate-400">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Predictions list */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Your Locked Claims</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-700/40 rounded-xl">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/40 flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 mb-1 text-sm font-medium">You haven&apos;t locked any claims yet.</p>
              <p className="text-slate-500 mb-6 text-xs">Lock your first claim to start building your track record.</p>
              <Link
                href="/lock"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/20"
              >
                Lock My First Claim
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/proof/${prediction.publicSlug}`}
                  className="block bg-slate-900/60 border border-slate-700/40 hover:border-white/20 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-200 mb-2 line-clamp-2 group-hover:text-white transition-colors">{prediction.text}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-neutral-500">
                          {new Date(prediction.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {prediction.category && (
                          <>
                            <span className="text-xs text-neutral-600">•</span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/30 text-blue-300">
                              {prediction.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${getOutcomeBadgeColor(
                        prediction.outcome
                      )}`}
                    >
                      {getOutcomeLabel(prediction.outcome)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-center"
          >
            View Full Stats
          </Link>
          <button
            onClick={handleSignOut}
            className="px-8 py-3 border-2 border-slate-700 hover:bg-slate-800/50 text-white font-bold rounded-xl transition-all text-center"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
