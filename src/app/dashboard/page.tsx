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
          <p className="text-gray-400">Loading your Reputation Score...</p>
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Reputation Score Yet</h2>
          <p className="text-gray-400 mb-6">
            {error || "Lock your first prediction to start building your Reputation Score!"}
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
            Your Reputation Score
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

        {/* Progress to Next Tier */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Progress to Next Tier
            </span>
          </h2>

          {score.totalPoints < 300 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current: Novice</span>
                <span className="text-sm text-yellow-400 font-semibold">Next: Trusted (300 pts)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((score.totalPoints / 300) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400">
                {300 - score.totalPoints} points to go
              </p>
            </div>
          ) : score.totalPoints < 500 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-400">Current: Trusted</span>
                <span className="text-sm text-green-400 font-semibold">Next: Expert (500 pts)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-600 to-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((score.totalPoints - 300) / 200) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400">
                {500 - score.totalPoints} points to go
              </p>
            </div>
          ) : score.totalPoints < 650 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-400">Current: Expert</span>
                <span className="text-sm text-blue-400 font-semibold">Next: Master (650 pts)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-600 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((score.totalPoints - 500) / 150) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400">
                {650 - score.totalPoints} points to go
              </p>
            </div>
          ) : score.totalPoints < 800 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-400">Current: Master</span>
                <span className="text-sm text-purple-400 font-semibold">Next: Legend (800 pts)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((score.totalPoints - 650) / 150) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400">
                {800 - score.totalPoints} points to go
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-2">👑</div>
              <p className="text-purple-400 font-bold text-xl mb-2">Legend Tier Achieved!</p>
              <p className="text-sm text-slate-400">You're in the top tier of predictors</p>
            </div>
          )}
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

        {/* Next Badge Goals */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">🎯 Next Achievements</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {score.totalResolves < 25 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-white font-semibold mb-1">&quot;25 Resolves&quot; badge</div>
                <div className="text-sm text-slate-400">
                  Resolve {25 - score.totalResolves} more claim{25 - score.totalResolves !== 1 ? 's' : ''}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(score.totalResolves / 25) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {score.currentStreak < 5 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-white font-semibold mb-1">&quot;5-Streak&quot; badge</div>
                <div className="text-sm text-slate-400">
                  {score.currentStreak === 0 ? 'Start a streak' : `Keep streak for ${5 - score.currentStreak} more`}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(score.currentStreak / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {Object.keys(score.categoryStats).length < 3 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-white font-semibold mb-1">&quot;Multi-Category&quot; badge</div>
                <div className="text-sm text-slate-400">
                  Predict in {3 - Object.keys(score.categoryStats).length} more categor{3 - Object.keys(score.categoryStats).length === 1 ? 'y' : 'ies'}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${(Object.keys(score.categoryStats).length / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {score.totalResolves >= 25 && score.currentStreak >= 5 && Object.keys(score.categoryStats).length >= 3 && (
              <div className="col-span-3 text-center py-8">
                <div className="text-4xl mb-2">🌟</div>
                <p className="text-xl text-white font-bold mb-2">All near-term goals achieved!</p>
                <p className="text-slate-400">Keep building your reputation to unlock legendary status</p>
              </div>
            )}
          </div>
        </div>

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
