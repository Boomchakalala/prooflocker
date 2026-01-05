"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LockPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("prooflocker-user-id");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleLock = async () => {
    if (!text.trim() || !userId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/lock-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        alert("Failed to lock prediction. Please try again.");
      }
    } catch (error) {
      console.error("Error locking prediction:", error);
      alert("Failed to lock prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1f1f1f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#888] hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-white">ProofLocker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Lock your prediction
          </h1>
          <p className="text-[#888] text-lg">
            Create an immutable, timestamped proof of your statement or prediction
          </p>
        </div>

        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <div className="mb-6">
            <label
              htmlFor="prediction-text"
              className="block text-sm font-medium text-[#e0e0e0] mb-3"
            >
              Your prediction or statement
            </label>
            <textarea
              id="prediction-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., I predict that Bitcoin will reach $100,000 by December 31, 2026"
              className="w-full h-48 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-[#6b6b6b]">
                {text.length} characters
              </span>
              {text.length > 200 && (
                <span className="text-xs text-yellow-500">
                  Preview will be truncated in feed
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-[#e0e0e0] mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              How it works
            </h3>
            <ol className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex gap-2">
                <span className="text-[#6b6b6b] flex-shrink-0">1.</span>
                <span>Your text is hashed using SHA-256</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b6b6b] flex-shrink-0">2.</span>
                <span>
                  The hash fingerprint is submitted to Constellation Network
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b6b6b] flex-shrink-0">3.</span>
                <span>You receive a public proof reference</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b6b6b] flex-shrink-0">4.</span>
                <span>
                  Anyone can verify the proof later without revealing the original text
                </span>
              </li>
            </ol>
          </div>

          <button
            onClick={handleLock}
            disabled={!text.trim() || loading}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-[#2a2a2a] disabled:text-[#555] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Locking on DAG...
              </span>
            ) : (
              "Lock prediction"
            )}
          </button>
        </div>

        {/* Privacy notice */}
        <div className="mt-6 p-4 bg-[#141414] border border-[#1f1f1f] rounded-lg">
          <p className="text-sm text-[#888]">
            <span className="text-[#e0e0e0] font-medium">Privacy:</span> Your
            full text is stored locally for display. Only the SHA-256 hash is
            submitted to the Constellation Network blockchain.
          </p>
        </div>
      </main>
    </div>
  );
}
