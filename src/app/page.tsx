"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import { Prediction } from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get or create user ID from localStorage
    let storedUserId = localStorage.getItem("prooflocker-user-id");
    if (!storedUserId) {
      storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("prooflocker-user-id", storedUserId);
    }
    setUserId(storedUserId);
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1f1f1f] bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <h1 className="text-xl font-bold text-white">ProofLocker</h1>
            </div>
            <Link
              href="/lock"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Lock prediction
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-[#141414] border border-[#1f1f1f] rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "all"
                ? "bg-[#1f1f1f] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            All predictions
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "my"
                ? "bg-[#1f1f1f] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            My predictions
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-[#2a2a2a] mx-auto mb-4"
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
            <h3 className="text-lg font-medium text-[#e0e0e0] mb-2">
              {activeTab === "all"
                ? "No predictions yet"
                : "You haven't locked any predictions"}
            </h3>
            <p className="text-[#888] mb-6">
              {activeTab === "all"
                ? "Be the first to lock a prediction on the blockchain"
                : "Lock your first prediction to get started"}
            </p>
            <Link
              href="/lock"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Lock your first prediction
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6b6b6b]">
              Powered by Constellation Network ($DAG)
            </p>
            <Link
              href="/verify"
              className="text-sm text-[#888] hover:text-white transition-colors"
            >
              Verify a proof →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
