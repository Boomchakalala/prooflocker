"use client";

import { useState, useEffect } from "react";
import type { UserStats } from "@/lib/evidence-types";
import { calculatePredictionScore } from "@/lib/evidence-types";

interface CredibilityDisplayProps {
  userId?: string; // If not provided, fetches for current user
}

export default function CredibilityDisplay({ userId }: CredibilityDisplayProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user-stats");
      if (!response.ok) {
        throw new Error("Failed to load stats");
      }
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load credibility stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-white/5 rounded"></div>
        <div className="h-10 bg-white/5 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  if (!stats) {
    return <div className="text-sm text-neutral-500">No stats available</div>;
  }

  const totalEvidence = stats.evidenceACount + stats.evidenceBCount + stats.evidenceCCount + stats.evidenceDCount;

  return (
    <div className="space-y-4">
      {/* Credibility Score */}
      <div className="glass border border-white/10 rounded-xl p-6 text-center">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
          Credibility Score
        </div>
        <div className="text-5xl font-bold text-white mb-2">
          {stats.credibilityScore}
        </div>
        <div className="text-sm text-neutral-400">
          {stats.totalResolved} predictions resolved
        </div>
      </div>

      {/* Accuracy Rate */}
      <div className="glass border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-300">Accuracy Rate</span>
          <span className="text-lg font-bold text-white">{stats.accuracyRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.accuracyRate}%` }}
          />
        </div>
      </div>

      {/* Outcomes Breakdown */}
      <div className="glass border border-white/10 rounded-xl p-4">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Outcomes
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">✓ Correct</span>
            <span className="font-semibold text-white">{stats.totalCorrect}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-400">✗ Incorrect</span>
            <span className="font-semibold text-white">{stats.totalIncorrect}</span>
          </div>
        </div>
      </div>

      {/* Evidence Distribution */}
      <div className="glass border border-white/10 rounded-xl p-4">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Evidence Quality
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-400 w-16">Grade A</span>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: totalEvidence > 0 ? `${(stats.evidenceACount / totalEvidence) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs font-semibold text-white w-8 text-right">{stats.evidenceACount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-400 w-16">Grade B</span>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: totalEvidence > 0 ? `${(stats.evidenceBCount / totalEvidence) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs font-semibold text-white w-8 text-right">{stats.evidenceBCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-amber-400 w-16">Grade C</span>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: totalEvidence > 0 ? `${(stats.evidenceCCount / totalEvidence) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs font-semibold text-white w-8 text-right">{stats.evidenceCCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 w-16">Grade D</span>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                style={{ width: totalEvidence > 0 ? `${(stats.evidenceDCount / totalEvidence) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs font-semibold text-white w-8 text-right">{stats.evidenceDCount}</span>
          </div>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="glass border border-white/10 rounded-xl p-4 bg-blue-500/10">
        <div className="text-xs font-semibold text-blue-400 mb-2">How Scoring Works</div>
        <ul className="text-xs text-neutral-300 space-y-1">
          <li>• Correct + Grade A evidence: +16 pts</li>
          <li>• Correct + Grade B evidence: +13 pts</li>
          <li>• Correct + Grade C evidence: +8 pts</li>
          <li>• Correct + No evidence (D): +3 pts</li>
          <li>• Incorrect: -10 pts</li>
        </ul>
      </div>
    </div>
  );
}
