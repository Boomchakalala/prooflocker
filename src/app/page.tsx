"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    hash: string;
    timestamp: string;
    proofId: string;
    dagTransaction: string;
  } | null>(null);

  const handleLockProof = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/lock-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error locking proof:", error);
      alert("Failed to lock proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🔒 ProofLocker
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Lock your statements and predictions in time using Constellation Network
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Create immutable, verifiable proof that your text existed at a specific time
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {!result ? (
              <>
                <label
                  htmlFor="text-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Enter your statement or prediction
                </label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., I predict that Bitcoin will reach $100,000 by December 31, 2026"
                  className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={loading}
                />

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {text.length} characters
                  </p>
                  <button
                    onClick={handleLockProof}
                    disabled={!text.trim() || loading}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Locking..." : "Lock Proof"}
                  </button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    How it works:
                  </h3>
                  <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Your text is hashed using SHA-256</li>
                    <li>The hash fingerprint is submitted to Constellation Network ($DAG)</li>
                    <li>You receive a public proof reference</li>
                    <li>Anyone can verify your proof later without revealing the original text</li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Proof Locked Successfully!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your statement has been secured on the Constellation Network
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      PROOF ID
                    </label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result.proofId}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      SHA-256 HASH
                    </label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result.hash}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      DAG TRANSACTION
                    </label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result.dagTransaction}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      TIMESTAMP
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Important:</strong> Save your Proof ID and original text. You'll need both to verify your proof later.
                  </p>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setText("");
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Create New Proof
                  </button>
                  <a
                    href="/verify"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Verify a Proof
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Powered by{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Constellation Network ($DAG)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
