"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Prediction } from "@/lib/storage";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  getReliabilityTier,
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
        totalPoints: statsData?.total_points || 0,
        totalPredictions: statsData?.total_predictions || 0,
        resolvedPredictions: statsData?.resolved_predictions || 0,
        correctPredictions: statsData?.correct_predictions || 0,
        incorrectPredictions: statsData?.incorrect_predictions || 0,
        avgEvidenceScore: statsData?.avg_evidence_score || 0,
        winRate:
          statsData?.resolved_predictions > 0
            ? statsData.correct_predictions / statsData.resolved_predictions
            : 0,
        reliabilityScore: statsData?.reliability_score || 0,
        tier: getReliabilityTier(statsData?.reliability_score || 0),
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Your Profile</h1>
              <p className="text-neutral-400 text-sm">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-md transition-all"
            >
              Sign out
            </button>
          </div>

          {/* Pseudonym section */}
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
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
                    className="flex-1 px-3 py-2 bg-black/40 border border-neutral-700 rounded-md text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 disabled:opacity-50"
                    maxLength={30}
                  />
                  <button
                    onClick={handleSetPseudonym}
                    disabled={settingPseudonym || !pseudonymInput.trim()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Credibility Score Section */}
        <div className="mb-8">
          <CredibilityDisplay />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-neutral-200 mb-1">{totalPredictions}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">{correctCount}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Correct</div>
          </div>
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">{incorrectCount}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Incorrect</div>
          </div>
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-neutral-200 mb-1">
              {resolvedCount > 0 ? `${correctCount}/${resolvedCount}` : "—"}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>

        {/* Additional stats */}
        {(pendingCount > 0 || invalidCount > 0) && (
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg p-6 mb-8">
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
          <h2 className="text-xl font-semibold text-white mb-4">Your Predictions</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-12 bg-[#0d0d0d] border border-neutral-800 rounded-lg">
              <p className="text-neutral-400 mb-4 text-sm">You haven't claimed any predictions yet.</p>
              <Link
                href="/lock"
                className="inline-block px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-md transition-colors border border-neutral-700"
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
                  className="block bg-[#0d0d0d] border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-200 mb-2 line-clamp-2 group-hover:text-white transition-colors">{prediction.text}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(prediction.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
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
