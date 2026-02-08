"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import EvidenceBundleUploader from "@/components/EvidenceBundleUploader";
import { getOrCreateUserId, isAnonymousUser } from "@/lib/user";
import { getSiteUrl } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import type { OsintSignal } from "@/lib/osint-types";

export default function LockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showScoreToast } = useToast();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [locked, setLocked] = useState(false);
  const [proofId, setProofId] = useState<string>("");
  const [howItWorksExpanded, setHowItWorksExpanded] = useState(false);
  const [prefillOsint, setPrefillOsint] = useState<OsintSignal | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<any[]>([]);

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

      // Prepare geotag data if location selected
      const geotag = null; // Automatic geolocation happens server-side now

      const response = await fetch("/api/lock-proof", {
        method: "POST",
        headers,
        body: JSON.stringify({ text, userId, category }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show toast notification for Reputation Score
        if (data.insightPoints) {
          showScoreToast(
            data.insightPoints,
            "Prediction locked successfully!",
            ["Earned points for locking prediction"]
          );
        }

        // Redirect to proof page instead of showing success screen
        router.push(`/proof/${data.publicSlug || data.proofId}`);
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
    const shareText = `I locked this claim on-chain with ProofLocker. No edits. No excuses. Verify it yourself: ${getSiteUrl()}/verify?proofId=${proofId}`;
    navigator.clipboard.writeText(shareText);
    alert("Share message copied to clipboard!");
  };

  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs - matching other pages */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {!locked ? (
          <>
            {/* Header - matching scoring page style */}
            <div className="mb-10">
              <Link
                href="/app"
                className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to App
              </Link>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Lock your claim
              </h1>
              <p className="text-neutral-400">
                Create a timestamped, immutable record on Constellation DAG
              </p>
            </div>

            {/* Tip Banner */}
            <div className="mb-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">💡 Pro Tip</h4>
                  <p className="text-slate-300 text-sm">
                    Claims resolved within 30 days earn 2x multipliers. Add evidence before locking for bonus credibility points.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form - 2 columns */}
              <div className="lg:col-span-2">
                <div className="glass border border-white/10 rounded-xl p-8">
              <div className="mb-6">
                <label
                  htmlFor="prediction-text"
                  className="block text-sm font-medium text-white mb-3"
                >
                  Your claim or statement
                </label>
                <textarea
                  id="prediction-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., Bitcoin hits $150K by June 2026"
                  className="w-full h-48 px-4 py-3 glass border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#2E5CFF] focus:border-transparent resize-none transition-all"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2">
                  {text.length > 0 && (
                    <span className="text-sm text-neutral-400">
                      {text.length} characters
                      {text.length < 20 && text.length > 0 && (
                        <span className="ml-2 text-xs text-neutral-500">· Concise predictions work best</span>
                      )}
                    </span>
                  )}
                  {text.length === 0 && <span></span>}
                  {text.length > 80 && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Preview in feed will be truncated to 80 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Category selector - improved styling */}
              <div className="mb-8">
                <label
                  htmlFor="category-select"
                  className="block text-sm font-medium text-white mb-3"
                >
                  Category <span className="text-neutral-400 font-normal text-xs">(helps others discover your claim)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                        category === cat
                          ? "bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] text-white border border-[#5B21B6] shadow-lg shadow-purple-500/30"
                          : "glass text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20"
                      }`}
                      disabled={loading}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* How it works - Collapsible */}
              <div className="glass border border-white/10 rounded-lg p-5 mb-6">
                <button
                  onClick={() => setHowItWorksExpanded(!howItWorksExpanded)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[#2E5CFF]"
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
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
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
                  <ol className="space-y-3 text-sm text-neutral-400 mt-4 pt-4 border-t border-white/10">
                    <li className="flex gap-3">
                      <span className="text-[#2E5CFF] flex-shrink-0 font-semibold">1.</span>
                      <span>Your text is hashed using SHA-256 (cryptographic fingerprint)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#2E5CFF] flex-shrink-0 font-semibold">2.</span>
                      <span>
                        Fingerprint is submitted on-chain—permanent and immutable
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#2E5CFF] flex-shrink-0 font-semibold">3.</span>
                      <span>You get a proof ID to share and verify</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#2E5CFF] flex-shrink-0 font-semibold">4.</span>
                      <span>
                        Once locked, it cannot be edited. Ever.
                      </span>
                    </li>
                  </ol>
                )}
              </div>

              {/* Privacy notice */}
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 mb-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
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
                    <p className="text-sm text-white font-medium mb-1">
                      Privacy & Anonymity
                    </p>
                    <p className="text-sm text-neutral-400">
                      No login required. Only the SHA-256 fingerprint is submitted to the blockchain.
                      {isAnonymous && (
                        <span className="block mt-2 text-green-400 font-medium text-xs">
                          ✓ You're using ProofLocker anonymously
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence Bundle Uploader */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Add Evidence (Optional)</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Add links, files, or analysis supporting your claim. Later, you can add OSINT signals as evidence when they confirm your claim.
                </p>
                <EvidenceBundleUploader
                  onUpload={(items) => setEvidenceItems(items)}
                  prefillOsint={null}
                />
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleLock}
                disabled={!text.trim() || loading}
                className="relative w-full px-6 py-5 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-semibold text-base rounded-lg transition-all disabled:from-neutral-800 disabled:to-neutral-800 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none"
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
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock on-chain
                  </span>
                )}
              </button>

              {/* Microcopy */}
              <p className="text-xs text-neutral-500 text-center mt-4">
                Fingerprint + timestamp. Immutable proof forever.
              </p>

              {/* Content policy notice */}
              <p className="mt-3 text-xs text-neutral-600 text-center">
                No hate, harassment, or illegal content
              </p>
            </div>
          </div>

          {/* Sidebar - Stats & Recent Resolutions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Stats */}
            <div className="glass border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Points:</span>
                  <span className="text-lg font-bold text-cyan-400">892</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Streak:</span>
                  <span className="text-lg font-bold text-orange-400">3 🔥</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Next Badge:</span>
                  <span className="text-xs text-purple-400 font-semibold">1 away</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link
                  href="/dashboard"
                  className="text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  View Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Recent Resolutions */}
            <div className="glass border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Recent Wins
              </h3>
              <div className="space-y-3">
                {[
                  { user: 'Anon #2847', points: 120, time: '2m ago' },
                  { user: 'Anon #1923', points: 95, time: '15m ago' },
                  { user: 'Anon #4521', points: 180, time: '1h ago' },
                ].map((res, i) => (
                  <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{res.user}</span>
                      <span className="text-xs text-emerald-400 font-bold">+{res.points} pts</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{res.time}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 text-center">
                  <span className="text-white font-semibold">15 claims</span> resolved today
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="fade-in">
            {/* Confirmation screen - matching other pages */}
            <div className="glass border border-white/10 rounded-xl p-10 text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-gradient-to-br from-[#5B21B6]/20 to-[#2E5CFF]/20 border-4 border-purple-500/40 shadow-2xl shadow-purple-500/30">
                <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2">
                Prediction Locked
              </h1>
              <p className="text-xl text-neutral-300 mb-6">
                Timestamp recorded on-chain
              </p>

              <p className="text-neutral-400 leading-relaxed max-w-xl mx-auto mb-8">
                Your claim is now immutably stored on Constellation DAG with a cryptographic fingerprint. It's public, permanent, and cannot be edited.
              </p>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10 mb-8 max-w-xl mx-auto text-left">
                <label className="block text-[11px] font-semibold text-neutral-500 mb-2 uppercase tracking-wider">
                  Your Claim
                </label>
                <p className="text-white leading-relaxed">
                  {text}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <button
                  onClick={handleShare}
                  className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share proof
                </button>
                <Link
                  href={`/verify?proofId=${proofId}`}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] text-white font-semibold rounded-lg transition-all text-center shadow-lg shadow-purple-500/25"
                >
                  Verify now
                </Link>
                <Link
                  href="/app"
                  className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all border border-white/10 hover:border-white/20 text-center"
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
