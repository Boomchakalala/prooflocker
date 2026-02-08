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

  // Mock data for demo purposes
  const mockSources: TopSource[] = sources.length === 0 ? [
    {
      userId: "demo-user-1",
      displayName: "Anon #2847",
      reliabilityScore: 1247,
      tier: 'legend',
      winRate: 94,
      resolvedCount: 47,
      avgEvidenceScore: 92,
    },
    {
      userId: "demo-user-2",
      displayName: "Anon #5192",
      reliabilityScore: 1089,
      tier: 'master',
      winRate: 91,
      resolvedCount: 38,
      avgEvidenceScore: 88,
    },
    {
      userId: "demo-user-3",
      displayName: "Anon #1203",
      reliabilityScore: 943,
      tier: 'master',
      winRate: 87,
      resolvedCount: 34,
      avgEvidenceScore: 85,
    },
    {
      userId: "demo-user-4",
      displayName: "Anon #8741",
      reliabilityScore: 812,
      tier: 'expert',
      winRate: 84,
      resolvedCount: 29,
      avgEvidenceScore: 81,
    },
    {
      userId: "demo-user-5",
      displayName: "Anon #3492",
      reliabilityScore: 756,
      tier: 'expert',
      winRate: 82,
      resolvedCount: 27,
      avgEvidenceScore: 78,
    },
    {
      userId: "demo-user-6",
      displayName: "Anon #9124",
      reliabilityScore: 689,
      tier: 'expert',
      winRate: 79,
      resolvedCount: 24,
      avgEvidenceScore: 74,
    },
    {
      userId: "demo-user-7",
      displayName: "Anon #4567",
      reliabilityScore: 621,
      tier: 'trusted',
      winRate: 76,
      resolvedCount: 21,
      avgEvidenceScore: 71,
    },
    {
      userId: "demo-user-8",
      displayName: "Anon #7823",
      reliabilityScore: 578,
      tier: 'trusted',
      winRate: 73,
      resolvedCount: 19,
      avgEvidenceScore: 68,
    },
  ] : sources;

  const isShowingMockData = sources.length === 0;

  if (isShowingMockData && mockSources.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-6 glass rounded-2xl border border-purple-500/30 mb-6">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Building Reputation History</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            The most trusted sources will appear here. Make accurate claims with strong evidence to build your credibility.
          </p>

          <Link
            href="/lock"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            Start Building Your Reputation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Demo Banner - Only show when using mock data */}
      {isShowingMockData && (
        <div className="mx-auto max-w-3xl mb-8">
          <div className="bg-gradient-to-r from-cyan-600/10 to-purple-600/10 border border-cyan-500/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Preview Mode</span>
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold">Reputation points are real and counting.</span> Leaderboard rankings shown below are example data — coming soon as users resolve claims!
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/40 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white">Most Trusted Sources</h2>
          </div>
        </div>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Ranked by reliability score, accuracy, and evidence quality. Build your reputation through proven claims.
        </p>
      </div>

      {/* Top 3 Podium */}
      {mockSources.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <div className="md:order-1 order-2">
            {renderPodiumCard(mockSources[1], 2)}
          </div>

          {/* 1st Place - Taller */}
          <div className="md:order-2 order-1">
            {renderPodiumCard(mockSources[0], 1)}
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 order-3">
            {renderPodiumCard(mockSources[2], 3)}
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      {mockSources.length > 3 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
            <span className="text-sm text-slate-400 font-semibold">More Trusted Sources</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockSources.slice(3).map((source, index) => {
              const tierInfo = getTierInfo(source.tier);
              const actualRank = index + 4;

              return (
                <Link
                  key={source.userId}
                  href={`/user/${source.userId}`}
                  className={`group bg-slate-900/80 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-1 cursor-pointer fade-in stagger-${Math.min(index + 1, 4)}`}
                >
                  {/* Header with rank and tier */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-xs font-bold text-slate-300">
                        #{actualRank}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{source.displayName}</div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${tierInfo.bgColor} ${tierInfo.color} text-[10px] font-bold uppercase`}>
                          {source.tier === 'legend' && '⭐'}
                          {source.tier === 'master' && '👑'}
                          {source.tier === 'expert' && '💎'}
                          {source.tier === 'trusted' && '✓'}
                          <span>{tierInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{source.reliabilityScore}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{source.winRate}%</div>
                      <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{source.resolvedCount}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Claims</div>
                    </div>
                  </div>

                  {/* Evidence Quality Bar */}
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Evidence Quality</span>
                      <span className="text-xs font-semibold text-slate-400">{source.avgEvidenceScore}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                      <div
                        className={`h-full rounded-full transition-all ${
                          source.avgEvidenceScore >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : source.avgEvidenceScore >= 60
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : source.avgEvidenceScore >= 30
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-slate-500 to-slate-600'
                        }`}
                        style={{ width: `${source.avgEvidenceScore}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Helper function for podium cards
  function renderPodiumCard(source: TopSource, rank: number) {
    const tierInfo = getTierInfo(source.tier);
    const rankColors = {
      1: {
        badge: 'bg-gradient-to-br from-yellow-500 to-yellow-600 ring-4 ring-yellow-500/30',
        text: 'text-yellow-300',
        border: 'border-yellow-500/50',
        glow: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]',
        icon: '👑',
        label: 'Champion'
      },
      2: {
        badge: 'bg-gradient-to-br from-slate-400 to-slate-500 ring-4 ring-slate-400/30',
        text: 'text-slate-300',
        border: 'border-slate-400/50',
        glow: 'shadow-[0_0_30px_rgba(148,163,184,0.2)]',
        icon: '🥈',
        label: 'Elite'
      },
      3: {
        badge: 'bg-gradient-to-br from-orange-600 to-orange-700 ring-4 ring-orange-500/30',
        text: 'text-orange-300',
        border: 'border-orange-500/50',
        glow: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
        icon: '🥉',
        label: 'Proven'
      }
    };

    const colors = rankColors[rank as keyof typeof rankColors];

    return (
      <Link
        href={`/user/${source.userId}`}
        className={`group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 ${colors.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${colors.glow} hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] ${rank === 1 ? 'md:scale-105' : ''}`}
      >
        {/* Rank Badge - Centered Top */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-full ${colors.badge} flex items-center justify-center text-2xl font-bold ${colors.text} shadow-lg`}>
            {rank}
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex justify-center mb-3">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border-2 ${colors.border} flex items-center justify-center text-2xl font-bold text-white shadow-xl`}>
            {source.displayName.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Name and Tier */}
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-bold mb-2">{source.displayName}</h3>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tierInfo.bgColor} border ${tierInfo.color.replace('text-', 'border-')}/40`}>
            <span className="text-sm">
              {source.tier === 'legend' && '⭐'}
              {source.tier === 'master' && '👑'}
              {source.tier === 'expert' && '💎'}
              {source.tier === 'trusted' && '✓'}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wide ${tierInfo.color}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Reliability Score - Prominent */}
        <div className="text-center mb-5 py-4 bg-black/30 border border-white/10 rounded-xl">
          <div className={`text-4xl font-extrabold mb-1 ${colors.text}`}>{source.reliabilityScore}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Reliability Score</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-black/20 border border-white/10 rounded-lg">
            <div className="text-xl font-bold text-emerald-400">{source.winRate}%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Accuracy</div>
          </div>
          <div className="text-center p-3 bg-black/20 border border-white/10 rounded-lg">
            <div className="text-xl font-bold text-cyan-400">{source.resolvedCount}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Resolved</div>
          </div>
        </div>

        {/* Evidence Quality Bar */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Evidence Quality</span>
            <span className="text-xs font-semibold text-white">{source.avgEvidenceScore}/100</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                source.avgEvidenceScore >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : source.avgEvidenceScore >= 60
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  : source.avgEvidenceScore >= 30
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  : 'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}
              style={{ width: `${source.avgEvidenceScore}%` }}
            />
          </div>
        </div>

        {/* Rank Label */}
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg">
          <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">{colors.label}</span>
        </div>
      </Link>
    );
  }
}
