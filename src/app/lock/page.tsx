"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProofLockerLogo from "@/components/Logo";
import { getOrCreateUserId, isAnonymousUser } from "@/lib/user";

export default function LockPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [locked, setLocked] = useState(false);
  const [proofId, setProofId] = useState<string>("");

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsAnonymous(isAnonymousUser());
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
        const data = await response.json();
        setProofId(data.proofId);
        setLocked(true);
      } else {
        const errorData = await response.json();

        // Check for duplicate fingerprint error
        if (errorData.error === "DUPLICATE_FINGERPRINT") {
          alert("Already locked — this prediction fingerprint already exists.");
        } else {
          alert("Failed to lock prediction. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error locking prediction:", error);
      alert("Failed to lock prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareText = `I locked this prediction on-chain with ProofLocker. No edits. No excuses. Verify it yourself: ${window.location.origin}/verify?proofId=${proofId}`;
    navigator.clipboard.writeText(shareText);
    alert("Share message copied to clipboard!");
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass border-b border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
            >
              <svg
                className="w-4 h-4"
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
              Back to ProofLocker
            </Link>
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ProofLockerLogo className="w-6 h-6 text-white" />
              <span className="font-semibold text-white">ProofLocker</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {!locked ? (
          <>
            <div className="mb-8 fade-in">
              <h1 className="text-4xl font-bold text-white mb-3">
                Lock your prediction
              </h1>
              <p className="text-neutral-400 text-lg">
                Make it real. Lock it on-chain. Own the outcome.
              </p>
            </div>

            <div className="glass rounded-xl p-6 glow-purple">
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
                  placeholder="e.g., Bitcoin hits $150K by June 2026"
                  className="w-full h-48 px-4 py-3 glass border border-white/10 rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-[#6b6b6b]">
                    {text.length} characters
                  </span>
                  {text.length > 80 && (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Preview in feed will be truncated to 80 characters
                    </span>
                  )}
                </div>
              </div>

              <div className="glass border border-white/5 rounded-lg p-4 mb-6">
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
                    <span className="text-blue-500 flex-shrink-0 font-semibold">1.</span>
                    <span>Your text is hashed using SHA-256 (cryptographic fingerprint)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 flex-shrink-0 font-semibold">2.</span>
                    <span>
                      Fingerprint is submitted on-chain—permanent and immutable
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 flex-shrink-0 font-semibold">3.</span>
                    <span>You get a proof ID to share and verify</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 flex-shrink-0 font-semibold">4.</span>
                    <span>
                      Once locked, it cannot be edited. Ever.
                    </span>
                  </li>
                </ol>
              </div>

              <button
                onClick={handleLock}
                disabled={!text.trim() || loading}
                className="w-full px-6 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-all border border-neutral-700 disabled:border-neutral-800"
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
                    Locking on-chain...
                  </span>
                ) : (
                  "Lock prediction"
                )}
              </button>
            </div>

            {/* Privacy notice */}
            <div className="mt-6 glass rounded-lg p-4 border border-white/5 fade-in">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-[#e0e0e0] font-medium mb-1">
                    Privacy & Anonymity
                  </p>
                  <p className="text-sm text-[#888]">
                    No login required. Your full text is stored locally for display.
                    Only the SHA-256 fingerprint is submitted to the blockchain.
                    {isAnonymous && (
                      <span className="block mt-1 text-green-400 font-medium">
                        ✓ You're using ProofLocker anonymously
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="fade-in">
            {/* Confirmation screen */}
            <div className="glass rounded-xl p-8 text-center glow-purple mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-blue-500/20 border-4 border-blue-500/40 shadow-2xl shadow-blue-500/30">
                <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>

              <h1 className="text-4xl font-black gradient-text mb-4">
                Prediction locked.
              </h1>
              <h2 className="text-2xl font-bold text-white mb-6">
                No take-backs.
              </h2>

              <p className="text-[#a0a0a0] text-lg leading-relaxed max-w-xl mx-auto mb-8">
                Your prediction is now on-chain with a cryptographic fingerprint. It's public, permanent, and cannot be edited. Time to own the outcome.
              </p>

              <div className="glass border border-white/5 rounded-lg p-4 mb-6 max-w-xl mx-auto">
                <label className="block text-[10px] font-semibold text-[#666] mb-2 uppercase tracking-wider">
                  Your Prediction
                </label>
                <p className="text-[#e0e0e0] text-sm leading-relaxed">
                  {text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <button
                  onClick={handleShare}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all btn-glow flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share proof
                </button>
                <Link
                  href={`/verify?proofId=${proofId}`}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10 text-center"
                >
                  Verify now
                </Link>
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10 text-center"
                >
                  Back to feed
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
