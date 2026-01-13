"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getOrCreateUserId, isAnonymousUser } from "@/lib/user";
import { getSiteUrl } from "@/lib/config";
import { supabase } from "@/lib/supabase";

export default function LockPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [locked, setLocked] = useState(false);
  const [proofId, setProofId] = useState<string>("");
  const [fingerprint, setFingerprint] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [howItWorksExpanded, setHowItWorksExpanded] = useState(false);

  const categories = ["Crypto", "Politics", "Markets", "Tech", "Sports", "Culture", "Personal", "Other"];

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsAnonymous(isAnonymousUser());
  }, []);

  const handleLock = async () => {
    if (!text.trim() || !userId) return;

    setLoading(true);
    try {
      // Get auth session to pass to API
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token if user is logged in
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/lock-proof", {
        method: "POST",
        headers,
        body: JSON.stringify({ text, userId, category }),
      });

      if (response.ok) {
        const data = await response.json();
        setProofId(data.proofId);
        setFingerprint(data.fingerprint || "");
        setTimestamp(new Date().toISOString());
        setLocked(true);
      } else {
        const errorData = await response.json();

        // Check for duplicate fingerprint error
        if (errorData.error === "DUPLICATE_FINGERPRINT") {
          alert("Already locked — this prediction fingerprint already exists.");
        } else {
          // Show the actual error message from the API (e.g., content filter errors)
          alert(errorData.error || "Failed to lock prediction. Please try again.");
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
    const shareText = `I locked this prediction on-chain with ProofLocker. No edits. No excuses. Verify it yourself: ${getSiteUrl()}/verify?proofId=${proofId}`;
    navigator.clipboard.writeText(shareText);
    alert("Share message copied to clipboard!");
  };

  const copyFingerprint = () => {
    if (fingerprint) {
      navigator.clipboard.writeText(fingerprint);
      alert("Fingerprint copied!");
    }
  };

  const truncateFingerprint = (fp: string) => {
    if (fp.length <= 16) return fp;
    return `${fp.slice(0, 8)}...${fp.slice(-8)}`;
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
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
            <BrandLogo />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 relative z-10">
        {!locked ? (
          <>
            <div className="mb-8 fade-in">
              <h1 className="text-4xl font-bold text-white mb-3">
                Lock your prediction
              </h1>
              <p className="text-neutral-400 text-lg">
                Create a timestamped record you can verify later.
              </p>
            </div>

            {/* 2-column layout on large screens */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column: Input + Primary CTA */}
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
                    {text.length > 0 && (
                      <span className="text-sm text-[#6b6b6b]">
                        {text.length} characters
                        {text.length < 20 && text.length > 0 && (
                          <span className="ml-2 text-xs text-neutral-600">· Concise predictions work best</span>
                        )}
                      </span>
                    )}
                    {text.length === 0 && <span></span>}
                    {text.length > 140 && (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Preview in feed will be truncated to ~140 characters
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleLock}
                  disabled={!text.trim() || loading}
                  className="relative w-full px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-semibold text-base rounded-lg transition-all disabled:from-neutral-900 disabled:to-neutral-900 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
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
                      Locking...
                    </span>
                  ) : (
                    "Lock my prediction"
                  )}
                </button>

                {/* Permanence notice */}
                <p className="text-xs text-neutral-400 text-center mt-3 font-medium">
                  Once submitted, your prediction becomes immutable
                </p>

                {/* Content policy notice */}
                <p className="mt-4 text-xs text-neutral-600 text-center">
                  No hate, harassment, or illegal content
                </p>
              </div>

              {/* Right column: Category + How it works + Privacy */}
              <div className="space-y-6">
                {/* Category selector */}
                <div className="glass rounded-xl p-6">
                  <label
                    htmlFor="category-select"
                    className="block text-sm font-medium text-[#e0e0e0] mb-3"
                  >
                    Category <span className="text-blue-400 font-normal">(recommended)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          category === cat
                            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border border-blue-500/50"
                            : "glass text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10"
                        }`}
                        disabled={loading}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Helps others discover your prediction
                  </p>
                </div>

                {/* How it works - Collapsible */}
                <div className="glass border border-white/5 rounded-lg p-4">
                  <button
                    onClick={() => setHowItWorksExpanded(!howItWorksExpanded)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <h3 className="text-sm font-semibold text-[#e0e0e0] flex items-center gap-2">
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
                      How it works — immutable & on-chain
                    </h3>
                    <svg
                      className={`w-4 h-4 text-neutral-500 transition-transform ${
                        howItWorksExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {howItWorksExpanded && (
                    <ol className="space-y-2 text-sm text-[#a0a0a0] mt-3 pt-3 border-t border-white/5">
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
                  )}
                </div>

                {/* Privacy notice */}
                <div className="glass rounded-lg p-4 border border-white/5">
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
                        No login required. Only the SHA-256 fingerprint is submitted to the blockchain.
                        {isAnonymous && (
                          <span className="block mt-1 text-green-400 font-medium text-xs">
                            ✓ You're using ProofLocker anonymously
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="fade-in">
            {/* Confirmation screen - 2-column on large screens */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column: Main confirmation */}
              <div className="glass rounded-xl p-8 glow-purple">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 bg-blue-500/20 border-4 border-blue-500/40 shadow-2xl shadow-blue-500/30">
                  <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                  Locked on-chain.
                </h1>
                <p className="text-lg text-neutral-400 mb-6">
                  Timestamp recorded via Digital Evidence.
                </p>

                {/* Short bullets instead of long paragraph */}
                <ul className="space-y-2 mb-6 text-sm text-neutral-500">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Immutable fingerprint generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Publicly verifiable record</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No edits — only verification</span>
                  </li>
                </ul>

                {/* Your prediction card - reduced padding */}
                <div className="glass border border-white/5 rounded-lg p-3 mb-6">
                  <label className="block text-[10px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                    Your Prediction
                  </label>
                  <p className="text-neutral-100 text-sm leading-relaxed line-clamp-2">
                    {text}
                  </p>
                </div>

                {/* CTA hierarchy: Primary, Secondary, Tertiary */}
                <div className="space-y-2">
                  {/* Primary CTA */}
                  <Link
                    href="/"
                    className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base rounded-lg transition-all text-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Back to feed
                  </Link>

                  {/* Secondary & Tertiary CTAs */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <Link
                      href={`/verify?proofId=${proofId}`}
                      className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-all border border-white/10 text-center"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right column: Proof summary */}
              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Proof Summary
                </h3>

                <div className="space-y-4">
                  {/* Fingerprint */}
                  {fingerprint && (
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        Fingerprint (SHA-256)
                      </label>
                      <div className="flex items-center gap-2 glass rounded-lg p-2.5 border border-white/5">
                        <code className="text-xs text-neutral-300 flex-1 font-mono">
                          {truncateFingerprint(fingerprint)}
                        </code>
                        <button
                          onClick={copyFingerprint}
                          className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
                          title="Copy fingerprint"
                        >
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  {timestamp && (
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        Timestamp (UTC)
                      </label>
                      <div className="glass rounded-lg p-2.5 border border-white/5">
                        <p className="text-xs text-neutral-300 font-mono">
                          {new Date(timestamp).toUTCString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Network tag */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                      Network
                    </label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-blue-400 font-medium">Constellation (DAG)</span>
                    </div>
                  </div>

                  {/* Proof ID */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                      Proof ID
                    </label>
                    <div className="glass rounded-lg p-2.5 border border-white/5">
                      <p className="text-xs text-neutral-300 font-mono break-all">
                        {proofId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
