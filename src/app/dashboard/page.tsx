"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { InsightScoreResponse } from "@/lib/insight-types";
import { BADGES, BadgeId } from "@/lib/insight-score";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<InsightScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get anon ID from localStorage
  const getAnonId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("anonId");
  };

  useEffect(() => {
    async function fetchScore() {
      setLoading(true);
      setError(null);

      try {
        const anonId = getAnonId();
        if (!anonId && !user) {
          setError("No user identifier found. Lock a prediction to get started!");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (anonId) {
          params.append("anonId", anonId);
        }

        const headers: HeadersInit = {};
        if (user) {
          const {
            data: { session },
          } = await (await import("@/lib/supabase")).supabase.auth.getSession();
          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }
        }

        const response = await fetch(`/api/insight/current?${params.toString()}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch insight score");
        }

        const data: InsightScoreResponse = await response.json();
        setScoreData(data);
      } catch (err) {
        console.error("Error fetching insight score:", err);
        setError("Failed to load insight score");
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00bfff] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your Insight Score...</p>
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Insight Score Yet</h2>
          <p className="text-gray-400 mb-6">
            {error || "Lock your first prediction to start building your Insight Score!"}
          </p>
          <Link
            href="/lock"
            className="inline-block px-8 py-3 bg-[#00bfff] hover:bg-[#00a8e6] text-white font-semibold rounded-md transition-all"
          >
            Lock My First Prediction
          </Link>
        </div>
      </div>
    );
  }

  const { score, rank, totalUsers, accuracy, milestone } = scoreData;
  const hasPoints = score.totalPoints > 0;

  // Calculate trend (placeholder - could compare to previous day/week)
  const trend = 0; // For now

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Your Insight Score
          </h1>
          {user && (
            <p className="text-[#00bfff]">
              ✓ Sync enabled — scores saved across devices
            </p>
          )}
        </div>

        {/* Main Score Card */}
        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a0033] border border-[#9370db] rounded-xl shadow-2xl p-12 mb-8 text-center">
          <div className="mb-6">
            <div className="text-7xl font-bold text-[#00bfff] mb-2">
              {score.totalPoints.toLocaleString()}
            </div>
            <div className="text-2xl text-[#9370db] font-semibold mb-4">
              {milestone.name}
            </div>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div>
                Accuracy:{" "}
                <span
                  className={`font-bold ${
                    accuracy >= 75 ? "text-green-400" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
                  }`}
                >
                  {accuracy}%
                </span>{" "}
                <span className="text-gray-500">
                  ({score.correctResolves}/{score.totalResolves})
                </span>
              </div>
              {trend !== 0 && (
                <div className="flex items-center gap-1">
                  {trend > 0 ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  <span className={trend > 0 ? "text-green-400" : "text-red-400"}>
                    {Math.abs(trend)} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Locked</div>
            <div className="text-3xl font-bold text-white">{score.locksCount}</div>
          </div>
          {user && (
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Claimed</div>
              <div className="text-3xl font-bold text-[#00bfff]">{score.claimsCount}</div>
            </div>
          )}
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Resolved</div>
            <div className="text-3xl font-bold">
              <span className="text-green-400">{score.correctResolves}</span>
              <span className="text-gray-600">/</span>
              <span className="text-red-400">{score.incorrectResolves}</span>
            </div>
          </div>
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Streak</div>
            <div className="text-3xl font-bold text-[#9370db]">
              {score.currentStreak} 🔥
            </div>
          </div>
        </div>

        {/* Rank Display */}
        {hasPoints && (
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 mb-8 text-center">
            {rank ? (
              <div>
                <span className="text-gray-400">Your rank: </span>
                <span className="text-3xl font-bold text-[#00bfff]">
                  #{rank}
                </span>
                <span className="text-gray-500"> of {totalUsers} active users</span>
              </div>
            ) : (
              <div className="text-gray-400">Keep building your score to rank!</div>
            )}
          </div>
        )}

        {!hasPoints && (
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-400">Lock more predictions to earn your rank!</p>
          </div>
        )}

        {/* Badges */}
        {score.badges.length > 0 && (
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Badges Earned</h2>
            <div className="flex flex-wrap gap-4">
              {score.badges.map((badgeId) => {
                const badge = BADGES[badgeId as BadgeId];
                if (!badge) return null;
                return (
                  <div
                    key={badgeId}
                    className="bg-[#9370db]/10 border border-[#9370db] rounded-lg p-4 min-w-[200px]"
                    title={badge.description}
                  >
                    <div className="text-xl mb-1">{badge.name}</div>
                    <div className="text-sm text-gray-400">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Stats */}
        {Object.keys(score.categoryStats).length > 0 && (
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Category Performance</h2>
            <div className="space-y-4">
              {Object.entries(score.categoryStats).map(([category, stats]) => {
                const catAccuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{category}</span>
                      <span className="text-gray-400">
                        {stats.correct}/{stats.total} ({catAccuracy}%) • {stats.points} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-[#00bfff] h-2 rounded-full transition-all"
                        style={{ width: `${catAccuracy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/lock"
            className="px-8 py-4 bg-[#00bfff] hover:bg-[#00a8e6] text-white font-bold rounded-md transition-all text-center"
          >
            Lock New Prediction (+10 pts)
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 border-2 border-[#9370db] hover:bg-[#9370db]/10 text-white font-bold rounded-md transition-all text-center"
          >
            View Leaderboard
          </Link>
          <Link
            href="/app"
            className="px-8 py-4 border-2 border-gray-700 hover:bg-gray-800 text-white font-bold rounded-md transition-all text-center"
          >
            Browse Predictions
          </Link>
        </div>
      </div>
    </div>
  );
}
