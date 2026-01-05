"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProofLockerLogo from "@/components/Logo";

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
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass border-b border-white/5 relative z-10">
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
            <div className="flex items-center gap-3">
              <ProofLockerLogo className="w-6 h-6" />
              <span className="font-semibold gradient-text">ProofLocker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-3">Verify proof</h1>
          <p className="text-[#888] text-lg">
            Verify that a prediction's fingerprint matches the original text
          </p>
        </div>

        {!result ? (
          <div className="glass rounded-xl p-6 glow-blue">
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
                  className="w-full px-4 py-3 glass border border-white/10 rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
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
                  className="w-full h-48 px-4 py-3 glass border border-white/10 rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="glass border border-white/5 rounded-lg p-4 my-6">
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
                  <span className="text-blue-500 flex-shrink-0 font-semibold">1.</span>
                  <span>Your text is hashed using SHA-256</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0 font-semibold">2.</span>
                  <span>
                    The fingerprint is compared with the stored proof
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0 font-semibold">3.</span>
                  <span>Result shows MATCH or NO MATCH with timestamp</span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleVerify}
              disabled={!proofId.trim() || !text.trim() || loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-[#555] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none btn-glow"
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
          <div className="glass rounded-xl p-6 glow-purple fade-in">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 border-4 ${
                  result.verified
                    ? "bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/20"
                    : "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20"
                }`}
              >
                {result.verified ? (
                  <svg
                    className="w-12 h-12 text-green-500"
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
                    className="w-12 h-12 text-red-500"
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

              <div className={`inline-block px-6 py-2 rounded-full mb-4 font-bold text-2xl ${
                result.verified
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {result.verified ? "MATCH" : "NO MATCH"}
              </div>

              <h2 className={`text-2xl font-bold mb-2`}>
                {result.verified ? (
                  <span className="gradient-text">Fingerprint verified!</span>
                ) : (
                  <span className="text-red-400">Verification failed</span>
                )}
              </h2>
              <p className="text-[#a0a0a0] max-w-md mx-auto">
                {result.verified
                  ? "The fingerprint matches perfectly. This text was locked at the timestamp shown below."
                  : "The fingerprint does not match. The text you entered is different from the original."}
              </p>
            </div>

            {result.verified && result.proofDetails && (
              <div className="space-y-4 mb-6">
                <div className="glass border border-white/5 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    SHA-256 FINGERPRINT
                  </label>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm text-[#e0e0e0] break-all flex-1">
                      {result.proofDetails.hash}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.proofDetails!.hash)}
                      className="ml-3 p-2 hover:bg-white/10 rounded transition-colors"
                      title="Copy fingerprint"
                    >
                      <svg
                        className="w-4 h-4 text-[#888]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="glass border border-white/5 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    TIMESTAMP
                  </label>
                  <p className="text-sm text-[#e0e0e0]">
                    {new Date(result.proofDetails.timestamp).toLocaleString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}
                  </p>
                </div>

                <div className="glass border border-white/5 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-2">
                    DAG TRANSACTION ID
                  </label>
                  <code className="font-mono text-xs text-[#a0a0a0] break-all">
                    {result.proofDetails.dagTransaction}
                  </code>
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
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10"
              >
                Verify another
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10 flex items-center gap-2"
                title="Copy link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all text-center btn-glow"
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
