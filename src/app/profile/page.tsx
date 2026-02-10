"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Prediction } from "@/lib/storage";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  getReputationTier,
  getTierInfo,
  getNextTierMilestone,
  formatPoints,
  getScoreBreakdown,
  type UserStats,
} from "@/lib/user-scoring";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
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

  useEffect(() => {
    if (user) {
      fetchPredictions();
      // Set page title
      document.title = "Your Profile - ProofLocker";
    }
  }, [user]);

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

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        console.error("Error fetching stats:", statsError);
      }

      // Process stats
      const userStats: UserStats = {
        totalXP: statsData?.total_points || 0,
        totalPredictions: statsData?.total_predictions || 0,
        resolvedPredictions: statsData?.resolved_predictions || 0,
        correctPredictions: statsData?.correct_predictions || 0,
        incorrectPredictions: statsData?.incorrect_predictions || 0,
        avgEvidenceScore: statsData?.avg_evidence_score || 0,
        winRate:
          statsData?.resolved_predictions > 0
            ? statsData.correct_predictions / statsData.resolved_predictions
            : 0,
        reputationScore: statsData?.reputation_score || 0,
        tier: getReputationTier(statsData?.reputation_score || 0),
      };

      setStats(userStats);
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

  // Calculate stats
  const totalPredictions = predictions.length;
  const correctCount = predictions.filter((p) => p.outcome === "correct").length;
  const incorrectCount = predictions.filter((p) => p.outcome === "incorrect").length;
  const invalidCount = predictions.filter((p) => p.outcome === "invalid").length;
  const pendingCount = predictions.filter((p) => p.outcome === "pending").length;
  const resolvedCount = correctCount + incorrectCount;

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
      <div className="min-h-screen gradient-bg text-white relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Header skeleton */}
          <div className="mb-10">
            <div className="h-4 w-32 bg-slate-800 rounded-md animate-pulse mb-8" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-9 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-36 bg-slate-800/60 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-10 w-20 bg-slate-800/60 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-6">
              <div className="h-3 w-24 bg-slate-800 rounded animate-pulse mb-4" />
              <div className="h-5 w-40 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>

          {/* KPI cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
                <div className="h-7 w-16 bg-slate-800 rounded-md animate-pulse mx-auto mb-2" />
                <div className="h-3 w-20 bg-slate-800/60 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>

          {/* Reputation skeleton */}
          <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl animate-pulse" />
                  <div>
                    <div className="h-3 w-24 bg-slate-800/60 rounded animate-pulse mb-2" />
                    <div className="h-10 w-20 bg-slate-800 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-28 bg-slate-800 rounded-lg animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-3 w-20 bg-slate-800/60 rounded animate-pulse mb-2 ml-auto" />
                <div className="h-9 w-24 bg-slate-800 rounded-md animate-pulse ml-auto" />
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full animate-pulse" />
          </div>

          {/* Claims list skeleton */}
          <div className="mb-8">
            <div className="h-6 w-36 bg-slate-800 rounded-md animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-4 w-full bg-slate-800 rounded animate-pulse mb-2" />
                      <div className="h-4 w-2/3 bg-slate-800/60 rounded animate-pulse mb-3" />
                      <div className="h-3 w-32 bg-slate-800/40 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-slate-800 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/60 hover:border-slate-600/60 transition-all text-sm font-medium group backdrop-blur-sm mb-8"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Your Profile</h1>
              <p className="text-neutral-400 text-sm">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                View Stats
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white border border-white/20 hover:border-neutral-600 rounded-md transition-all"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Pseudonym section */}
          <div className="glass border border-white/10 rounded-xl p-6">
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
                  This pseudonym identifies you publicly on all your predictions. It cannot be changed.
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
        </div>

        {/* Reputation Score Hero Section */}
        {stats && (
          <div className="mb-8">
            <div className="glass border border-white/10 rounded-xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                {/* Left: Reputation Score */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider">
                        Reputation Score
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-bold text-white">
                          {stats.reputationScore}
                        </div>
                        <div className="text-lg text-neutral-500">/1000</div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <div className="flex items-center gap-3 mt-4">
                    {(() => {
                      const tierInfo = getTierInfo(stats.tier);
                      const nextMilestone = getNextTierMilestone(stats.reputationScore);
                      return (
                        <>
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${tierInfo.bgColor} ${tierInfo.textColor} border-current`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            <span className="font-semibold">{tierInfo.name}</span>
                          </div>

                          {nextMilestone.nextTier && (
                            <div className="text-sm text-neutral-400">
                              {nextMilestone.pointsNeeded} pts to{" "}
                              {nextMilestone.tierInfo?.name}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: Total Points */}
                <div className="text-center md:text-right">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    Total Points
                  </div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {formatPoints(stats.totalXP)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Lifetime earnings</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(stats.reputationScore / 1000) * 100}%` }}
                />
              </div>

              {/* Score Breakdown */}
              {(() => {
                const breakdown = getScoreBreakdown({
                  correctPredictions: stats.correctPredictions,
                  incorrectPredictions: stats.incorrectPredictions,
                  resolvedPredictions: stats.resolvedPredictions,
                  avgEvidenceScore: stats.avgEvidenceScore,
                });

                return breakdown.length > 0 ? (
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                      Score Breakdown
                    </div>
                    <div className="space-y-3">
                      {breakdown.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-neutral-300">{item.label}</span>
                            <span className="text-white font-semibold">
                              {item.value}/{item.maxValue}
                            </span>
                          </div>
                          <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${(item.value / item.maxValue) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats?.reputationScore || 0}
            </div>
            <div className="text-xs text-slate-400 mt-1">Reputation</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats?.totalPredictions || totalPredictions}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Claims</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats && stats.resolvedPredictions > 0
                ? `${Math.round((stats.correctPredictions / stats.resolvedPredictions) * 100)}%`
                : resolvedCount > 0
                ? `${Math.round((correctCount / resolvedCount) * 100)}%`
                : "--"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Accuracy</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats?.correctPredictions || correctCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Correct Streak</div>
          </div>
        </div>

        {/* Detailed Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-neutral-200 mb-1">
              {stats?.totalPredictions || totalPredictions}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Total</div>
          </div>
          <div className="glass border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {stats?.correctPredictions || correctCount}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Correct</div>
          </div>
          <div className="glass border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {stats?.incorrectPredictions || incorrectCount}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Incorrect</div>
          </div>
          <div className="glass border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-neutral-200 mb-1">
              {stats && stats.resolvedPredictions > 0
                ? `${stats.correctPredictions}/${stats.resolvedPredictions}`
                : resolvedCount > 0
                ? `${correctCount}/${resolvedCount}`
                : "—"}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>

        {/* Additional stats */}
        {(pendingCount > 0 || invalidCount > 0) && (
          <div className="glass border border-white/10 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              {pendingCount > 0 && (
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Pending</div>
                  <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
                </div>
              )}
              {invalidCount > 0 && (
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Invalid</div>
                  <div className="text-2xl font-bold text-neutral-400">{invalidCount}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Predictions list */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Your Locked Claims</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-16 glass border border-white/10 rounded-xl">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/40 flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 mb-1 text-sm font-medium">You haven&apos;t locked any claims yet.</p>
              <p className="text-slate-500 mb-6 text-xs">Lock your first prediction to start building your track record.</p>
              <Link
                href="/lock"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/20"
              >
                Lock my first prediction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/proof/${prediction.publicSlug}`}
                  className="block glass border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all group"
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
      </div>
    </div>
  );
}
