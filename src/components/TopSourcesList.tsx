"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getReputationTier } from "@/lib/user-scoring";
import { SEED_LEADERBOARD, type SeedLeaderboardEntry } from "@/lib/seed-leaderboard";

interface TopSource {
  userId: string;
  displayName: string;
  reliabilityScore: number;
  tier: string;
  winRate: number;
  resolvedCount: number;
  avgEvidenceScore: number;
  isSeedData?: boolean;
}

interface TopSourcesListProps {
  category?: string;
}

export default function TopSourcesList({ category = 'all' }: TopSourcesListProps) {
  const [sources, setSources] = useState<TopSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSeedData, setUsingSeedData] = useState(false);

  useEffect(() => {
    fetchTopSources();
  }, [category]);

  const fetchTopSources = async () => {
    setLoading(true);
    try {
      const url = category && category !== 'all'
        ? `/api/top-sources?category=${encodeURIComponent(category)}`
        : '/api/top-sources';

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        console.warn('Top sources API unavailable, showing seed data');
        setSources(SEED_LEADERBOARD);
        setUsingSeedData(true);
        return;
      }

      const data = await response.json();
      console.log('[TopSourcesList] Fetched sources:', data.sources?.length || 0);

      // If no real data, use seed data
      if (!data.sources || data.sources.length === 0) {
        setSources(SEED_LEADERBOARD);
        setUsingSeedData(true);
      } else {
        setSources(data.sources);
        setUsingSeedData(false);
      }
    } catch (err) {
      console.error('Error fetching top sources:', err);
      setSources(SEED_LEADERBOARD);
      setUsingSeedData(true);
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

  if (sources.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl mb-6">
            <svg className="w-20 h-20 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">No Reputation Leaders Yet</h3>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Be the first to build your reputation! Lock claims, resolve them with evidence, and watch your score grow.
          </p>
          <Link href="/lock" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            Lock Your First Claim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/40 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white">Reputation Registry</h2>
          </div>
        </div>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Track record of accuracy, evidence quality, and verifiable on-chain claims. Reputation earned through proof.
        </p>
      </div>

      {/* Registry Table - Professional Layout */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/80 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Reputation</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Claims</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sources.map((source, index) => {
                const tierInfo = getReputationTier(source.reliabilityScore);

                return (
                  <tr key={source.userId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/user/${source.userId}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-white">
                          {source.displayName.slice(-2)}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors">{source.displayName}</div>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-md ${tierInfo.bgColor} ${tierInfo.textColor} text-[10px] font-semibold uppercase mt-1`}>
                            {tierInfo.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold text-purple-400">{source.reliabilityScore}</div>
                      <div className="text-[10px] text-slate-500 uppercase">/ 1000</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-lg font-bold ${
                        source.winRate >= 90 ? 'text-emerald-400' :
                        source.winRate >= 80 ? 'text-cyan-400' :
                        source.winRate >= 70 ? 'text-amber-400' : 'text-slate-400'
                      }`}>{source.winRate}%</div>
                      <div className="text-[10px] text-slate-500 uppercase">{source.resolvedCount} Resolved</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold text-cyan-400">{source.resolvedCount}</div>
                      <div className="text-[10px] text-slate-500 uppercase">On-Chain</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400">{getEvidenceLabel(source.avgEvidenceScore)}</span>
                            <span className="text-xs font-semibold text-slate-300">{source.avgEvidenceScore}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                            <div
                              className={getEvidenceBarColor(source.avgEvidenceScore)}
                              style={{ width: `${source.avgEvidenceScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-xs text-slate-500 max-w-2xl mx-auto">
        All claims are timestamped on-chain via Constellation Network. Evidence quality calculated using the ProofLocker grading system (A/B/C/D).
      </div>
    </div>
  );
}

// Helper functions
function getEvidenceLabel(score: number) {
  if (score >= 80) return 'Grade A - Primary';
  if (score >= 60) return 'Grade B - Secondary';
  if (score >= 30) return 'Grade C - Weak';
  return 'Grade D - Minimal';
}

function getEvidenceBarColor(score: number) {
  if (score >= 80) return 'h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500';
  if (score >= 60) return 'h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500';
  if (score >= 30) return 'h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500';
  return 'h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-600';
}
