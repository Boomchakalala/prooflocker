"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const proofIdFromUrl = searchParams.get("proofId");
    if (proofIdFromUrl) {
      setProofId(proofIdFromUrl);
    }
  }, [searchParams]);

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
              Back to feed
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
          <h1 className="text-3xl font-bold text-white mb-3">Verify proof</h1>
          <p className="text-[#888] text-lg">
            Confirm that a prediction was locked at a specific time
          </p>
        </div>

        {!result ? (
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="proof-id"
                  className="block text-sm font-medium text-[#e0e0e0] mb-3"
                >
                  Proof ID
                </label>
                <input
                  id="proof-id"
                  type="text"
                  value={proofId}
                  onChange={(e) => setProofId(e.target.value)}
                  placeholder="Enter the proof ID"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="text-verify"
                  className="block text-sm font-medium text-[#e0e0e0] mb-3"
                >
                  Original text
                </label>
                <textarea
                  id="text-verify"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the exact original text to verify"
                  className="w-full h-48 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 my-6">
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
                Verification process
              </h3>
              <ol className="space-y-2 text-sm text-[#a0a0a0]">
                <li className="flex gap-2">
                  <span className="text-[#6b6b6b] flex-shrink-0">1.</span>
                  <span>Your text is hashed using SHA-256</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#6b6b6b] flex-shrink-0">2.</span>
                  <span>
                    The hash is compared with the one stored on Constellation
                    Network
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#6b6b6b] flex-shrink-0">3.</span>
                  <span>Verification result is returned with timestamp</span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleVerify}
              disabled={!proofId.trim() || !text.trim() || loading}
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
                  Verifying...
                </span>
              ) : (
                "Verify proof"
              )}
            </button>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <div className="text-center mb-6">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  result.verified
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {result.verified ? (
                  <svg
                    className="w-8 h-8 text-green-500"
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
                    className="w-8 h-8 text-red-500"
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
                  result.verified ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.verified ? "Proof verified!" : "Verification failed"}
              </h2>
              <p className="text-[#a0a0a0]">{result.message}</p>
            </div>

            {result.verified && result.proofDetails && (
              <div className="space-y-4 mb-6">
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    SHA-256 HASH
                  </label>
                  <code className="font-mono text-sm text-[#e0e0e0] break-all">
                    {result.proofDetails.hash}
                  </code>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    DAG TRANSACTION
                  </label>
                  <code className="font-mono text-sm text-[#e0e0e0] break-all">
                    {result.proofDetails.dagTransaction}
                  </code>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    LOCKED ON
                  </label>
                  <p className="text-sm text-[#e0e0e0]">
                    {new Date(result.proofDetails.timestamp).toLocaleString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setProofId("");
                  setText("");
                }}
                className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-[#202020] text-white font-semibold rounded-lg transition-colors border border-[#2a2a2a]"
              >
                Verify another
              </button>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Back to feed
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
