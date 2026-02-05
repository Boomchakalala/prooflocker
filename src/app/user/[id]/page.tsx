"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Prediction } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import {
  getReliabilityTier,
  getTierInfo,
  getNextTierMilestone,
  formatPoints,
  getScoreBreakdown,
  type UserStats,
} from "@/lib/user-scoring";
import PredictionCard from "@/components/PredictionCard";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pseudonym, setPseudonym] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      // Fetch predictions for this user
      const response = await fetch(`/api/predictions?userId=${userId}`);
      const data = await response.json();
      const preds = data.predictions || [];

      if (preds.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPredictions(preds);

      // Get pseudonym from first prediction if it exists
      if (preds[0].pseudonym) {
        setPseudonym(preds[0].pseudonym);
      }

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
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
      console.error("Error fetching user data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (pseudonym) return pseudonym;
    // Extract author number from first prediction
    if (predictions.length > 0 && predictions[0].authorNumber) {
      return `Anon #${predictions[0].authorNumber}`;
    }
    return "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5CFF] mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>

          <div className="glass border border-white/10 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
            <p className="text-neutral-400">This user doesn't have any predictions yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const tier = stats ? getTierInfo(stats.tier) : null;
  const nextMilestone = stats ? getNextTierMilestone(stats.reliabilityScore) : null;
  const breakdown = stats ? getScoreBreakdown(stats) : [];

  const correctCount = predictions.filter(p => p.outcome === "correct").length;
  const incorrectCount = predictions.filter(p => p.outcome === "incorrect").length;
  const pendingCount = predictions.filter(p => p.outcome === "pending").length;

  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to ProofLocker
        </Link>

        {/* Profile Header */}
        <div className="glass border border-white/10 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2E5CFF]/20 border-2 border-[#2E5CFF]/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#2E5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{getDisplayName()}</h1>
              <p className="text-neutral-400 text-sm">ProofLocker Member</p>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/user/${userId}`;
                if (navigator.share) {
                  navigator.share({ title: `${getDisplayName()} - ProofLocker`, url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Profile link copied!');
                }
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>

          {/* Reliability Score Hero Section */}
          {stats && tier && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-neutral-300">Reliability Score</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${tier.bgColor} ${tier.color} border ${tier.borderColor}`}>
                  {tier.label}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">{stats.reliabilityScore}</span>
                <span className="text-2xl text-neutral-500">/1000</span>
              </div>

              {/* Progress bar */}
              {nextMilestone && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span>Current: {stats.reliabilityScore}</span>
                    <span>Next: {nextMilestone.tierName} ({nextMilestone.threshold})</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${tier.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(stats.reliabilityScore / 1000) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {nextMilestone.pointsNeeded} points to {nextMilestone.tierName}
                  </p>
                </div>
              )}

              {/* Score breakdown */}
              {breakdown.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-neutral-400 mb-3">Score Breakdown</h3>
                  <div className="space-y-3">
                    {breakdown.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-neutral-300">{item.label}</span>
                          <span className="text-white font-semibold">{item.points} pts</span>
                        </div>
                        <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Points */}
          {stats && (
            <div className="bg-gradient-to-r from-[#2E5CFF]/10 to-[#5B21B6]/10 border border-[#2E5CFF]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Total Points</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] bg-clip-text text-transparent">
                    {formatPoints(stats.totalPoints)}
                  </div>
                </div>
                <svg className="w-10 h-10 text-[#2E5CFF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass border border-white/10 rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-white">{predictions.length}</div>
          </div>
          <div className="glass border border-white/10 rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Correct</div>
            <div className="text-2xl font-bold text-green-400">{correctCount}</div>
          </div>
          <div className="glass border border-white/10 rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Incorrect</div>
            <div className="text-2xl font-bold text-red-400">{incorrectCount}</div>
          </div>
          <div className="glass border border-white/10 rounded-xl p-4">
            <div className="text-sm text-neutral-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          </div>
        </div>

        {/* Predictions List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Predictions</h2>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                currentUserId={null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
