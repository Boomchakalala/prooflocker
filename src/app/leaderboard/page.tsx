"use client";

import { useEffect, useState } from "react";
import { LeaderboardResponse, LeaderboardEntry } from "@/lib/insight-types";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "100");
        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`/api/leaderboard?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data: LeaderboardResponse = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Global Leaderboard
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Top Reputation Scorers
          </p>
          <p className="text-sm text-gray-500">
            Anonymous ranks only. Claim predictions for sync & bonuses. Scores update real-time.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Anon ID (e.g., anon-1234)..."
              className="flex-1 px-4 py-3 bg-[#1e1e1e] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00bfff]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#00bfff] hover:bg-[#00a8e6] text-white font-semibold rounded-lg transition-all"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00bfff] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : error || !leaderboard ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error || "No data available"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#00bfff] hover:bg-[#00a8e6] text-white font-semibold rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Leaderboard Table */}
            <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0a0a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Reputation Score</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Accuracy</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Resolves</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {search ? "No users found matching your search" : "No users with scores yet"}
                        </td>
                      </tr>
                    ) : (
                      leaderboard.entries.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-t border-gray-800 hover:bg-[#0a0a0a]/50 transition-colors ${
                            entry.rank <= 3 ? "bg-[#9370db]/5" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {entry.rank <= 3 && (
                                <span className="text-2xl">
                                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                                </span>
                              )}
                              <span className="font-bold text-white">#{entry.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/user/${entry.userId || entry.anonId}`}
                              className="font-semibold text-white hover:text-[#2E5CFF] transition-colors"
                            >
                              {entry.displayName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[#00bfff] font-bold text-lg">
                              {entry.totalPoints.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
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
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-green-400">{entry.correctResolves}</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-white">{entry.totalResolves}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[#9370db] font-semibold">
                              {entry.currentStreak > 0 ? `${entry.currentStreak} 🔥` : "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {leaderboard.total > leaderboard.limit && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {Math.ceil(leaderboard.total / leaderboard.limit)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(leaderboard.total / leaderboard.limit)}
                  className="px-6 py-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-[#9370db] hover:bg-[#7d5fc7] text-white font-bold rounded-md transition-all text-center"
          >
            View My Dashboard
          </Link>
          <Link
            href="/lock"
            className="px-8 py-4 bg-[#00bfff] hover:bg-[#00a8e6] text-white font-bold rounded-md transition-all text-center"
          >
            Lock New Prediction
          </Link>
        </div>
      </div>
    </div>
  );
}
