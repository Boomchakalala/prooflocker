"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Prediction } from "@/lib/storage";
import { signOut } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  const fetchPredictions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/predictions?userId=${user.id}`);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Calculate stats
  const totalPredictions = predictions.length;
  const correctCount = predictions.filter((p) => p.outcome === "correct").length;
  const incorrectCount = predictions.filter((p) => p.outcome === "incorrect").length;
  const invalidCount = predictions.filter((p) => p.outcome === "invalid").length;
  const pendingCount = predictions.filter((p) => p.outcome === "pending").length;
  const resolvedCount = correctCount + incorrectCount;
  const accuracy = resolvedCount > 0 ? ((correctCount / resolvedCount) * 100).toFixed(1) : "N/A";

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case "correct":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "incorrect":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "invalid":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
              <p className="text-white/60">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{totalPredictions}</div>
            <div className="text-sm text-white/50">Total</div>
          </div>
          <div className="bg-[#1a1a1a] border border-green-500/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-1">{correctCount}</div>
            <div className="text-sm text-white/50">Correct</div>
          </div>
          <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">{incorrectCount}</div>
            <div className="text-sm text-white/50">Incorrect</div>
          </div>
          <div className="bg-[#1a1a1a] border border-blue-500/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {accuracy !== "N/A" ? `${accuracy}%` : "N/A"}
            </div>
            <div className="text-sm text-white/50">Accuracy</div>
          </div>
        </div>

        {/* Additional stats */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/50 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
            </div>
            <div>
              <div className="text-sm text-white/50 mb-1">Invalid</div>
              <div className="text-2xl font-bold text-gray-400">{invalidCount}</div>
            </div>
          </div>
        </div>

        {/* Predictions list */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Predictions</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
              <p className="text-white/60 mb-4">You haven't claimed any predictions yet.</p>
              <Link
                href="/lock"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Lock your first prediction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/proof/${prediction.publicSlug}`}
                  className="block bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white mb-2 line-clamp-2">{prediction.text}</p>
                      <p className="text-xs text-white/40">
                        {new Date(prediction.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-md border text-sm font-medium whitespace-nowrap ${getOutcomeBadgeColor(
                        prediction.outcome
                      )}`}
                    >
                      {getOutcomeLabel(prediction.outcome)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-white/40 text-sm">
            Want to track outcomes? Set the outcome for each prediction to see your accuracy improve over time.
          </p>
        </div>
      </div>
    </div>
  );
}
