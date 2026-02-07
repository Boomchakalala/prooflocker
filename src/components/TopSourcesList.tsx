"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTierInfo, type ReliabilityTier } from "@/lib/user-scoring";

interface TopSource {
  userId: string;
  displayName: string;
  reliabilityScore: number;
  tier: ReliabilityTier;
  winRate: number;
  resolvedCount: number;
  avgEvidenceScore: number;
}

interface TopSourcesListProps {
  category?: string;
}

export default function TopSourcesList({ category = 'all' }: TopSourcesListProps) {
  const [sources, setSources] = useState<TopSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopSources();
  }, [category]);

  const fetchTopSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = category && category !== 'all'
        ? `/api/top-sources?category=${encodeURIComponent(category)}`
        : '/api/top-sources';

      const response = await fetch(url, {
        cache: 'no-store',
      });

      if (!response.ok) {
        // If API fails, show a helpful message instead of erroring
        console.warn('Top sources API unavailable, showing placeholder');
        setSources([]);
        setError(null); // Don't show error, just empty state
        return;
      }

      const data = await response.json();
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error fetching top sources:', err);
      // Show empty state instead of error
      setSources([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6">
          <svg
            className="w-20 h-20 text-red-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{error}</h3>
        <button
          onClick={fetchTopSources}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-md transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6">
            <svg
              className="w-20 h-20 text-purple-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Leaderboard Coming Soon</h3>
          <p className="text-gray-400 text-lg mb-8">
            Start making predictions to climb the ranks and earn your spot among top predictors
          </p>

          {/* Mock Leaderboard Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="glass border border-purple-500/30 rounded-xl p-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    rank === 1 ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500/50' :
                    rank === 2 ? 'bg-slate-400/20 text-slate-300 ring-2 ring-slate-400/50' :
                    'bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/50'
                  }`}>
                    #{rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">Anon #{1000 + rank}</div>
                    <div className="text-xs text-slate-400">0 predictions</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Points:</span>
                    <span className="text-purple-400 font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-white">--%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/lock"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            Make Your First Prediction
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {sources.map((source, index) => {
        const tierInfo = getTierInfo(source.tier);
        const evidenceQualityPercent = source.avgEvidenceScore;

        return (
          <Link
            key={source.userId}
            href={`/user/${source.userId}`}
            className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border border-purple-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-purple-500/40 fade-in stagger-${Math.min(index + 1, 4)}`}
          >
            {/* Rank badge - top-left corner */}
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
              #{index + 1}
            </div>

            {/* User info - centered */}
            <div className="flex flex-col items-center mt-6 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/15 to-cyan-500/15 flex items-center justify-center text-xl font-bold text-purple-300 border border-purple-500/30 mb-3">
                {source.displayName.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-white text-lg font-semibold mb-2 text-center">{source.displayName}</h3>

              {/* Tier Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${tierInfo.bgColor} border ${tierInfo.color.replace('text-', 'border-')}/30 mb-3`}>
                <span className="text-xs">
                  {source.tier === 'legend' && '⭐'}
                  {source.tier === 'master' && '👑'}
                  {source.tier === 'expert' && '💎'}
                  {source.tier === 'trusted' && '✓'}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wide ${tierInfo.color}`}>
                  {tierInfo.label}
                </span>
              </div>

              {/* Reliability Score - Large */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">{source.reliabilityScore}</div>
                <div className="text-xs text-gray-400">Reliability Score</div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Win Rate */}
              <div className="text-center p-3 bg-black/20 border border-white/10 rounded-lg">
                <div className="text-lg font-bold text-emerald-400">{source.winRate}%</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Win Rate</div>
              </div>

              {/* Resolved Count */}
              <div className="text-center p-3 bg-black/20 border border-white/10 rounded-lg">
                <div className="text-lg font-bold text-cyan-400">{source.resolvedCount}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Resolved</div>
              </div>
            </div>

            {/* Evidence Quality Bar */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Evidence Quality</span>
                <span className="text-xs font-semibold text-white">{source.avgEvidenceScore}/100</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    evidenceQualityPercent >= 76
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : evidenceQualityPercent >= 51
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : evidenceQualityPercent >= 26
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}
                  style={{ width: `${evidenceQualityPercent}%` }}
                />
              </div>
            </div>

            {/* Hover effect indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
      })}
    </div>
  );
}
