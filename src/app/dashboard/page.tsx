"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import UnifiedHeader from '@/components/UnifiedHeader';

interface Prediction {
  id: string;
  claim: string;
  category: string;
  outcome: 'correct' | 'incorrect' | 'pending';
  timestamp: string;
  evidenceGrade?: string;
  xp?: number;
  resolved_at?: string;
}

// Reputation tier thresholds
const TIERS = [
  { name: 'Novice', min: 0, max: 299, color: 'slate' },
  { name: 'Trusted', min: 300, max: 499, color: 'cyan' },
  { name: 'Expert', min: 500, max: 649, color: 'blue' },
  { name: 'Master', min: 650, max: 799, color: 'purple' },
  { name: 'Legend', min: 800, max: 1000, color: 'amber' },
];

function getTier(points: number) {
  return TIERS.find(tier => points >= tier.min && points <= tier.max) || TIERS[0];
}

function getNextTier(points: number) {
  return TIERS.find(tier => points < tier.min);
}

// Calculate reputation score (not XP)
function calculateReputationScore(predictions: Prediction[]) {
  const resolved = predictions.filter(p => p.outcome !== 'pending');
  const correct = predictions.filter(p => p.outcome === 'correct').length;
  const total = resolved.length;

  if (total === 0) return 0;

  // Accuracy component (50%)
  const accuracyRate = correct / total;
  const accuracyScore = accuracyRate * 500;

  // Evidence quality component (30%)
  const gradePoints: Record<string, number> = {
    'A': 100, 'B': 80, 'C': 60, 'D': 40, 'F': 20
  };
  const avgEvidence = resolved.reduce((sum, p) => {
    const grade = p.evidenceGrade || 'F';
    return sum + (gradePoints[grade] || 20);
  }, 0) / total;
  const evidenceScore = (avgEvidence / 100) * 300;

  // Activity component (20%) - max 200 points at 20 resolutions
  const activityScore = Math.min(total * 10, 200);

  return Math.round(accuracyScore + evidenceScore + activityScore);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchPredictions() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (user?.id) {
          params.append('userId', user.id);
        }

        const response = await fetch(`/api/predictions?${params.toString()}`);
        if (!response.ok) {
          console.error("Failed to fetch predictions");
          setPredictions([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPredictions(data.predictions || []);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPredictions();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white flex items-center justify-center">
        <UnifiedHeader currentView="other" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your stats...</p>
        </div>
      </div>
    );
  }

  // Calculate real-time stats
  const totalLocked = predictions.length;
  const resolvedPredictions = predictions.filter(p => p.outcome !== 'pending');
  const pendingPredictions = predictions.filter(p => p.outcome === 'pending');
  const correctResolved = predictions.filter(p => p.outcome === 'correct').length;
  const incorrectResolved = predictions.filter(p => p.outcome === 'incorrect').length;
  const totalResolved = resolvedPredictions.length;
  const accuracyRate = totalResolved > 0 ? Math.round((correctResolved / totalResolved) * 100) : 0;

  // Calculate total XP earned
  const totalXP = predictions.reduce((sum, p) => sum + (p.xp || 0), 0);

  // Calculate reputation score
  const reputationScore = calculateReputationScore(predictions);
  const currentTier = getTier(reputationScore);
  const nextTier = getNextTier(reputationScore);

  // Calculate category stats
  const categoryStats: Record<string, { correct: number; total: number; points: number }> = {};
  predictions.forEach(p => {
    if (p.outcome === 'pending') return;
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { correct: 0, total: 0, points: 0 };
    }
    categoryStats[p.category].total++;
    if (p.outcome === 'correct') {
      categoryStats[p.category].correct++;
    }
    categoryStats[p.category].points += (p.xp || 0);
  });

  if (totalLocked === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white flex items-center justify-center p-6">
        <UnifiedHeader currentView="other" />
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">No Stats Yet</h2>
          <p className="text-slate-400 mb-6">
            Lock your first claim to start building your stats and reputation.
          </p>
          <Link
            href="/lock"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Lock My First Claim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white pt-16 py-12 px-6">
      <UnifiedHeader currentView="other" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-300 via-white to-slate-300 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-montserrat)" }}>
            My Stats
          </h1>
          {user && (
            <p className="text-purple-400 text-sm">
              Sync enabled -- scores saved across devices
            </p>
          )}
        </div>

        {/* Main Score Card */}
        <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl shadow-2xl p-10 mb-8 text-center">
          <div className="mb-6">
            <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Reputation Score</div>
            <div className="text-6xl font-bold text-purple-400 mb-2">
              {reputationScore.toLocaleString()}
            </div>
            <div className="text-xl text-slate-300 font-semibold mb-4">
              {currentTier.name}
            </div>
            <div className="flex items-center justify-center gap-6 text-base">
              <div>
                Accuracy:{" "}
                <span
                  className={`font-bold ${
                    accuracyRate >= 75 ? "text-emerald-400" : accuracyRate >= 60 ? "text-amber-400" : "text-red-400"
                  }`}
                >
                  {accuracyRate}%
                </span>{" "}
                <span className="text-slate-500">
                  ({correctResolved}/{totalResolved})
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">Total XP Earned</div>
              <div className="text-2xl font-bold text-cyan-400">{totalXP.toLocaleString()} XP</div>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Progress to Next Tier
              </span>
            </h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current: {currentTier.name}</span>
                <span className="text-sm text-yellow-400 font-semibold">Next: {nextTier.name} ({nextTier.min} pts)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((reputationScore / nextTier.min) * 100, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400">
                {nextTier.min - reputationScore} points to go
              </p>
            </div>
          </div>
        )}

        {!nextTier && (
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/40 rounded-xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Legend Tier Achieved</h2>
            <p className="text-slate-400">You've reached the highest tier. Keep building your legacy!</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2 font-medium">Claims Locked</div>
            <div className="text-4xl font-bold text-white">{totalLocked}</div>
            <div className="text-xs text-slate-500 mt-2">Total predictions made</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2 font-medium">Resolved</div>
            <div className="text-4xl font-bold text-white">{totalResolved}</div>
            <div className="text-xs text-slate-500 mt-2">
              <span className="text-emerald-400">{correctResolved} correct</span>
              <span className="text-slate-600"> • </span>
              <span className="text-red-400">{incorrectResolved} incorrect</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2 font-medium">Pending</div>
            <div className="text-4xl font-bold text-amber-400">{pendingPredictions.length}</div>
            <div className="text-xs text-slate-500 mt-2">Awaiting resolution</div>
          </div>
        </div>

        {/* Category Stats */}
        {Object.keys(categoryStats).length > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Category Performance</h2>
            <div className="space-y-3">
              {Object.entries(categoryStats)
                .sort((a, b) => b[1].points - a[1].points)
                .map(([category, stats]) => {
                  const catAccuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-medium text-sm text-white">{category}</span>
                        <span className="text-xs text-slate-400">
                          {stats.correct}/{stats.total} ({catAccuracy}%) -- {stats.points} XP
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${catAccuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Next Achievements */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">Next Achievements</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {totalResolved < 25 && (
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4">
                <div className="text-white font-semibold mb-1">25 Resolves</div>
                <div className="text-xs text-slate-400">
                  Resolve {25 - totalResolved} more claim{25 - totalResolved !== 1 ? 's' : ''}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(totalResolved / 25) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {Object.keys(categoryStats).length < 3 && (
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4">
                <div className="text-white font-semibold mb-1">Multi-Category</div>
                <div className="text-xs text-slate-400">
                  Lock claims in {3 - Object.keys(categoryStats).length} more categor{3 - Object.keys(categoryStats).length === 1 ? 'y' : 'ies'}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(Object.keys(categoryStats).length / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {accuracyRate >= 75 && totalResolved >= 10 && (
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4">
                <div className="text-white font-semibold mb-1">High Accuracy</div>
                <div className="text-xs text-slate-400">
                  Maintain {accuracyRate}% accuracy (75%+ target)
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((accuracyRate / 75) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {reputationScore >= 300 && totalResolved >= 25 && Object.keys(categoryStats).length >= 3 && (
              <div className="col-span-2 text-center py-6">
                <p className="text-lg text-white font-bold mb-1">Major milestones achieved</p>
                <p className="text-sm text-slate-400">Keep building your reputation to reach legendary status</p>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/lock"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-center"
          >
            Lock New Claim
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-3 border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-white font-bold rounded-xl transition-all text-center"
          >
            View Leaderboard
          </Link>
          <Link
            href="/app"
            className="px-8 py-3 border-2 border-slate-700 hover:bg-slate-800/50 text-white font-bold rounded-xl transition-all text-center"
          >
            Browse Claims
          </Link>
        </div>
      </div>
    </div>
  );
}
