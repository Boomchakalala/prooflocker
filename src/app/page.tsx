"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import ProofLockerLogo from "@/components/Logo";
import { Prediction } from "@/lib/storage";
import { getOrCreateUserId, isAnonymousUser } from "@/lib/user";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsAnonymous(isAnonymousUser());
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [activeTab, userId]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "all"
          ? "/api/predictions"
          : `/api/predictions?userId=${userId}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ProofLockerLogo className="w-8 h-8" />
              <h1 className="text-xl font-bold gradient-text">ProofLocker</h1>
            </div>
            <Link
              href="/lock"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 btn-glow"
            >
              Lock prediction
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 glass rounded-lg w-fit glow-blue">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-[#888] hover:text-white hover:bg-white/5"
            }`}
          >
            All predictions
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "my"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-[#888] hover:text-white hover:bg-white/5"
            }`}
          >
            My predictions
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
            </div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <div className="inline-block p-6 glass rounded-2xl glow-purple mb-6 float">
              <svg
                className="w-20 h-20 text-blue-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-3">
              {activeTab === "all"
                ? "No predictions yet"
                : "You haven't locked any predictions"}
            </h3>
            <p className="text-[#888] mb-8 text-lg">
              {activeTab === "all"
                ? "Be the first to lock a prediction on the blockchain"
                : "Lock your first prediction to get started"}
            </p>
            <Link
              href="/lock"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 btn-glow"
            >
              Lock your first prediction
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className={`fade-in stagger-${Math.min(index + 1, 4)}`}
              >
                <PredictionCard prediction={prediction} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 glass relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#6b6b6b]">
                Powered by <span className="gradient-text font-semibold">Constellation Network ($DAG)</span>
              </p>
              {isAnonymous && (
                <span className="flex items-center gap-1.5 text-xs text-[#888] glass px-2.5 py-1 rounded-md border border-white/5">
                  <svg
                    className="w-3.5 h-3.5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No login required — tamper-proof fingerprints
                </span>
              )}
            </div>
            <Link
              href="/verify"
              className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1"
            >
              Verify a proof
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
