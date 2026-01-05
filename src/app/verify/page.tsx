"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const [proofId, setProofId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    message: string;
    proofDetails?: {
      hash: string;
      timestamp: string;
      dagTransaction: string;
    };
  } | null>(null);

  const handleVerify = async () => {
    if (!proofId.trim() || !text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofId, text }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error verifying proof:", error);
      alert("Failed to verify proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              href="/"
              className="inline-block mb-4 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Back to ProofLocker
            </Link>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🔍 Verify Proof
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Verify that your statement was locked at a specific time
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {!result ? (
              <>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="proof-id"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Proof ID
                    </label>
                    <input
                      id="proof-id"
                      type="text"
                      value={proofId}
                      onChange={(e) => setProofId(e.target.value)}
                      placeholder="Enter your proof ID"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="text-verify"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Original Text
                    </label>
                    <textarea
                      id="text-verify"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter the original text exactly as you submitted it"
                      className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleVerify}
                    disabled={!proofId.trim() || !text.trim() || loading}
                    className="w-full px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Verifying..." : "Verify Proof"}
                  </button>
                </div>

                <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Verification Process:
                  </h3>
                  <ol className="text-sm text-purple-800 dark:text-purple-400 space-y-1 list-decimal list-inside">
                    <li>Your text is hashed using SHA-256</li>
                    <li>The hash is compared with the one stored on Constellation Network</li>
                    <li>If they match, your proof is verified</li>
                    <li>The original timestamp is retrieved from the blockchain</li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${
                      result.verified
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    } rounded-full mb-4`}
                  >
                    {result.verified ? (
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
                    ) : (
                      <svg
                        className="w-8 h-8 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      result.verified
                        ? "text-green-900 dark:text-green-300"
                        : "text-red-900 dark:text-red-300"
                    }`}
                  >
                    {result.verified ? "Proof Verified!" : "Verification Failed"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {result.message}
                  </p>
                </div>

                {result.verified && result.proofDetails && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        SHA-256 HASH
                      </label>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                        {result.proofDetails.hash}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        DAG TRANSACTION
                      </label>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                        {result.proofDetails.dagTransaction}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        LOCKED ON
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(result.proofDetails.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setProofId("");
                      setText("");
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Verify Another
                  </button>
                  <Link
                    href="/"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Create New Proof
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Powered by{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Constellation Network ($DAG)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
