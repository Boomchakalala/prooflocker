"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeaderboardEntry } from "@/lib/insight-types";

export default function LeaderboardPreview() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard?page=1&limit=10");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setTotalUsers(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getTierStyle = (points: number) => {
    if (points >= 800) return { label: "Legend", color: "text-purple-400", bg: "bg-purple-500/10" };
    if (points >= 650) return { label: "Master", color: "text-blue-400", bg: "bg-blue-500/10" };
    if (points >= 500) return { label: "Expert", color: "text-green-400", bg: "bg-green-500/10" };
    if (points >= 300) return { label: "Trusted", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    return { label: "Novice", color: "text-neutral-400", bg: "bg-neutral-500/10" };
  };

  const oracleTierCount = entries.filter((e) => e.totalPoints >= 800).length;

  return (
    <div className="relative z-10 py-20 md:py-28 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#1a0033] to-[#0a0a0a]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
        <div
          className="w-[1000px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(91, 33, 182, 0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#9370db] to-[#00bfff] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(147, 112, 219, 0.3))' }}>
            Live Leaderboard
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-2">
            Top 10 Claim Makers
          </p>
          <p className="text-base text-slate-400">
            Real-time rankings updated with every resolution. Early days—top spot is wide open. Be the legend before everyone else shows up.
          </p>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading rankings...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700 rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/70 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">User</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Points</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400 hidden md:table-cell">Accuracy</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400 hidden lg:table-cell">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => {
                    const medal = getMedalEmoji(entry.rank);
                    const tier = getTierStyle(entry.totalPoints);
                    const isTopThree = entry.rank <= 3;

                    return (
                      <tr
                        key={entry.rank}
                        className={`border-t border-slate-800 hover:bg-slate-800/30 transition-colors ${
                          isTopThree ? "bg-gradient-to-r from-purple-900/10 to-transparent" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {medal && (
                              <span className="text-2xl animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                                {medal}
                              </span>
                            )}
                            <span className={`font-bold ${isTopThree ? "text-yellow-400" : "text-white"}`}>
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/user/${entry.userId || entry.anonId}`}
                            className="font-semibold text-white hover:text-purple-400 transition-colors flex items-center gap-2"
                          >
                            <span>{entry.displayName}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${tier.bg} ${tier.color}`}>
                              {tier.label}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold text-lg ${isTopThree ? "text-purple-400" : "text-cyan-400"}`}>
                            {entry.totalPoints.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span
                            className={`font-semibold ${
                              entry.accuracy >= 75
                                ? "text-green-400"
                                : entry.accuracy >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {entry.accuracy}%
                          </span>
                          <span className="text-slate-600 text-xs ml-1">
                            ({entry.correctResolves}/{entry.totalResolves})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden lg:table-cell">
                          {entry.currentStreak > 0 ? (
                            <span className="text-orange-400 font-semibold flex items-center justify-end gap-1">
                              {entry.currentStreak}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Below */}
        <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">{totalUsers.toLocaleString()}</div>
            <div className="text-sm text-slate-400">claim makers competing</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">{oracleTierCount}</div>
            <div className="text-sm text-slate-400">Legend-tier users</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/leaderboard"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-[1.05]"
          >
            View Full Leaderboard
          </Link>
          <Link
            href="/lock"
            className="px-8 py-4 border-2 border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 font-bold rounded-lg transition-all"
          >
            Join the Race
          </Link>
        </div>

        {/* "You could be here" callout */}
        <div className="mt-12 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl">
            <p className="text-lg text-white font-semibold">
              You could be here. Start building your track record today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
