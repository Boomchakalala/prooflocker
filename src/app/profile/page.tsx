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
import { getPublicHandle } from '@/lib/public-handle';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<InsightScoreResponse | null>(null);
  const [pseudonym, setPseudonymState] = useState<string>("");
  const [isEditingPseudonym, setIsEditingPseudonym] = useState(false);
  const [pseudonymInput, setPseudonymInput] = useState<string>("");
  const [pseudonymError, setPseudonymError] = useState<string | null>(null);
  const [pseudonymSuccess, setPseudonymSuccess] = useState(false);
  const [settingPseudonym, setSettingPseudonym] = useState(false);
  const [defaultHandle, setDefaultHandle] = useState<string>("");

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
      // Set default handle
      const handle = getPublicHandle(user);
      setDefaultHandle(handle);

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
        body: JSON.stringify({ pseudonym: pseudonymInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPseudonymError(data.error || "Failed to set pseudonym");
        return;
      }

      setPseudonymState(data.pseudonym);
      setPseudonymSuccess(true);
      setPseudonymInput("");

      // Close the editor after a short delay
      setTimeout(() => {
        setIsEditingPseudonym(false);
        setPseudonymSuccess(false);
      }, 1500);

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
  const displayName = pseudonym || defaultHandle || "Anonymous";

  // Calculate real stats from predictions
  const totalLocked = predictions.length;
  const resolvedPredictions = predictions.filter(p => p.outcome === 'correct' || p.outcome === 'incorrect');
  const pendingPredictions = predictions.filter(p => p.outcome === 'pending');
  const correctResolved = predictions.filter(p => p.outcome === 'correct').length;
  const incorrectResolved = predictions.filter(p => p.outcome === 'incorrect').length;
  const totalResolved = resolvedPredictions.length;
  const accuracyRate = totalResolved > 0 ? Math.round((correctResolved / totalResolved) * 100) : 0;

  // Calculate member since date
  const memberSince = predictions.length > 0
    ? new Date(predictions[predictions.length - 1].timestamp)
    : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white relative">
      <UnifiedHeader currentView="other" />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-purple-500/20 rounded-2xl p-8 mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-lg shadow-purple-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              {score && (
                <div className="absolute -bottom-2 -right-2 bg-purple-600 border-4 border-slate-900 rounded-full px-3 py-1 text-xs font-bold">
                  {scoreData.milestone.name}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {displayName}
                </h1>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>

              {/* Pseudonym Editor */}
              {!pseudonym ? (
                <div className="inline-block">
                  {!isEditingPseudonym ? (
                    <button
                      onClick={() => setIsEditingPseudonym(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-sm font-medium rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                      Set Custom Pseudonym
                    </button>
                  ) : (
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 max-w-md">
                      <p className="text-sm text-slate-300 mb-3">
                        Choose a unique pseudonym to represent you publicly. Once set, it cannot be changed.
                      </p>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pseudonymInput}
                          onChange={(e) => setPseudonymInput(e.target.value)}
                          placeholder="Enter pseudonym (2-30 chars)"
                          disabled={settingPseudonym}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                          maxLength={30}
                        />
                        <button
                          onClick={handleSetPseudonym}
                          disabled={settingPseudonym || !pseudonymInput.trim()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingPseudonym ? "Setting..." : "Set"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPseudonym(false);
                            setPseudonymInput("");
                            setPseudonymError(null);
                          }}
                          disabled={settingPseudonym}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      {pseudonymError && (
                        <p className="text-xs text-red-400">{pseudonymError}</p>
                      )}
                      {pseudonymSuccess && (
                        <p className="text-xs text-green-400">Pseudonym set successfully!</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm text-green-300 font-medium">Custom pseudonym set</span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mt-4 text-sm flex-wrap">
                <div>
                  <span className="text-slate-400">Reputation:</span>
                  <span className="ml-2 text-purple-400 font-bold">{score?.totalPoints?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Accuracy:</span>
                  <span className={`ml-2 font-bold ${
                    accuracyRate >= 75 ? "text-emerald-400" : accuracyRate >= 60 ? "text-amber-400" : accuracyRate >= 50 ? "text-orange-400" : "text-red-400"
                  }`}>
                    {accuracyRate}%
                  </span>
                  <span className="ml-1 text-slate-500 text-xs">({correctResolved}/{totalResolved})</span>
                </div>
                <div>
                  <span className="text-slate-400">Member Since:</span>
                  <span className="ml-2 text-cyan-400 font-bold">
                    {memberSince.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-purple-500/10 border-2 border-purple-500 rounded-xl p-3 mb-4 text-center">
          <p className="text-purple-300 font-bold text-sm">✨ NEW PROFILE LAYOUT - Stats are now calculated in real-time from your predictions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Locked */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 text-center group hover:border-purple-500/40 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalLocked}</div>
            <div className="text-sm text-slate-400">Claims Locked</div>
          </div>

          {/* Resolved */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 text-center group hover:border-blue-500/40 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">{totalResolved}</div>
            <div className="text-sm text-slate-400">Resolved</div>
          </div>

          {/* Pending */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 text-center group hover:border-amber-500/40 transition-colors">
            <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{pendingPredictions.length}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>

          {/* Accuracy Rate */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-5 text-center group hover:border-emerald-500/40 transition-colors">
            <div className={`text-3xl md:text-4xl font-bold mb-1 ${
              accuracyRate >= 75 ? "text-emerald-400" : accuracyRate >= 60 ? "text-amber-400" : accuracyRate >= 50 ? "text-orange-400" : "text-red-400"
            }`}>
              {accuracyRate}%
            </div>
            <div className="text-sm text-slate-400">Accuracy</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Resolution Breakdown */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Resolution Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Correct</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${totalResolved > 0 ? (correctResolved / totalResolved) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-emerald-400 font-bold text-lg w-12 text-right">{correctResolved}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Incorrect</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${totalResolved > 0 ? (incorrectResolved / totalResolved) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-red-400 font-bold text-lg w-12 text-right">{incorrectResolved}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${totalLocked > 0 ? (pendingPredictions.length / totalLocked) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-amber-400 font-bold text-lg w-12 text-right">{pendingPredictions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Performance */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              Overall Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Correct vs Locked</span>
                <span className="text-white font-bold text-lg">
                  {totalLocked > 0 ? Math.round((correctResolved / totalLocked) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Resolution Rate</span>
                <span className="text-white font-bold text-lg">
                  {totalLocked > 0 ? Math.round((totalResolved / totalLocked) * 100) : 0}%
                </span>
              </div>
              {score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Reputation Score</span>
                  <span className="text-purple-400 font-bold text-lg">{score.totalPoints}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {score && score.badges.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {score.badges.map((badgeId) => {
                const badge = BADGES[badgeId as BadgeId];
                if (!badge) return null;
                return (
                  <div
                    key={badgeId}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/15 transition-colors"
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

        {/* Recent Claims */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Claims</h2>
            <Link
              href="/app?tab=my"
              className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 mb-2 font-medium">No claims locked yet</p>
              <p className="text-slate-500 text-sm mb-6">Start building your reputation by locking your first claim.</p>
              <Link
                href="/lock"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg"
              >
                Lock Your First Claim
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.slice(0, 5).map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/proof/${prediction.publicSlug}`}
                  className="block bg-slate-800/40 border border-slate-700/40 hover:border-purple-500/40 hover:bg-slate-800/60 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors">{prediction.text}</p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-slate-500">
                          {new Date(prediction.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {prediction.category && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 text-center"
          >
            View Full Dashboard
          </Link>
          <Link
            href="/app"
            className="flex-1 px-6 py-3 border-2 border-slate-700 hover:bg-slate-800/50 text-white font-bold rounded-xl transition-all text-center"
          >
            Browse Feed
          </Link>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 border-2 border-red-900/50 hover:bg-red-900/20 text-red-400 font-bold rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

