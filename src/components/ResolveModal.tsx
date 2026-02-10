"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PredictionOutcome } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

interface ResolveModalProps {
  predictionId: string;
  currentOutcome: PredictionOutcome;
  currentNote?: string;
  currentUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResolveModal({
  predictionId,
  currentOutcome,
  currentNote,
  currentUrl,
  onClose,
  onSuccess,
}: ResolveModalProps) {
  const { showScoreToast } = useToast();
  const [outcome, setOutcome] = useState<PredictionOutcome>(currentOutcome || "pending");
  const [resolutionNote, setResolutionNote] = useState(currentNote || "");
  const [resolutionUrl, setResolutionUrl] = useState(currentUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get the current session and access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("You must be logged in to resolve predictions");
      }

      const response = await fetch("/api/resolve-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          predictionId,
          outcome,
          resolutionNote: resolutionNote.trim() || null,
          resolutionUrl: resolutionUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve prediction");
      }

      console.log("[ResolveModal] Success:", data);

      // Show toast notification for Reputation Score
      if (data.insightPoints !== undefined) {
        const breakdown = data.insightBreakdown
          ? Object.entries(data.insightBreakdown)
              .filter(([_, points]) => (points as number) !== 0)
              .map(([key, points]) => {
                const pointsValue = points as number;
                const label = key === 'base' ? 'Base points' :
                             key === 'risk' ? 'High-risk bonus' :
                             key === 'streak' ? `Streak bonus (${data.newStreak || 0}x)` :
                             key === 'mastery' ? 'Category mastery' : key;
                return `${label}: ${pointsValue > 0 ? '+' : ''}${pointsValue} pts`;
              })
          : [];

        const message = outcome === "correct"
          ? "Prediction resolved as correct!"
          : outcome === "incorrect"
          ? "Prediction resolved as incorrect"
          : "Prediction resolution updated";

        showScoreToast(data.insightPoints, message, breakdown);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("[ResolveModal] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve prediction");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[500] bg-black/90 md:bg-black/60 flex items-center justify-center p-4 pb-[calc(16px+env(safe-area-inset-bottom))] overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-[560px] max-h-[85dvh] overflow-y-auto my-auto">
        <div
          className="relative w-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Not sticky, scrolls away */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resolve Claim
          </h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - No special scroll, let outer container handle it */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Impact Preview - Show before outcome selection */}
            {outcome !== "pending" && (
              <div className={`rounded-xl p-4 border ${
                outcome === "correct"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h4 className="text-white font-bold text-sm">Impact Preview</h4>
                </div>

                {outcome === "correct" ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Base points:</span>
                      <span className="text-emerald-400 font-semibold">+50 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Evidence bonus:</span>
                      <span className="text-emerald-400 font-semibold">+30 pts (est.)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Streak bonus:</span>
                      <span className="text-orange-400 font-semibold">+20 pts (current: 2)</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-white font-bold">Total potential:</span>
                      <span className="text-emerald-400 font-bold text-lg">~100 pts</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-slate-400">
                        Tip: Add evidence to increase your bonus multiplier
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Points:</span>
                      <span className="text-rose-400 font-semibold">-30 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Streak:</span>
                      <span className="text-slate-500">Will reset</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-slate-400">
                        Accountability builds trust. Keep building your track record.
                      </p>
                    </div>
                  </div>
                )}

                {/* Next Badge Preview */}
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Next badge:</span>
                    <span className="text-purple-400 font-semibold">1 resolve away from &quot;10 Resolves&quot;</span>
                  </div>
                </div>
              </div>
            )}

            {/* Outcome Selection */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                What's the outcome?
              </label>

              {/* All outcomes in consistent grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Correct */}
                <button
                  type="button"
                  onClick={() => setOutcome("correct")}
                  className={`w-full h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    outcome === "correct"
                      ? "bg-green-500/15 border-green-500/50 text-green-300 ring-1 ring-green-500/30 shadow-md shadow-green-500/10"
                      : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Correct
                </button>

                {/* Incorrect */}
                <button
                  type="button"
                  onClick={() => setOutcome("incorrect")}
                  className={`w-full h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    outcome === "incorrect"
                      ? "bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30 shadow-md shadow-red-500/10"
                      : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Incorrect
                </button>

                {/* Invalid */}
                <button
                  type="button"
                  onClick={() => setOutcome("invalid")}
                  className={`w-full h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    outcome === "invalid"
                      ? "bg-gray-500/15 border-gray-500/50 text-gray-300 ring-1 ring-gray-500/30 shadow-md shadow-gray-500/10"
                      : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Invalid
                </button>

                {/* Pending */}
                <button
                  type="button"
                  onClick={() => setOutcome("pending")}
                  className={`w-full h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    outcome === "pending"
                      ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-300 ring-1 ring-yellow-500/30 shadow-md shadow-yellow-500/10"
                      : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending
                </button>
              </div>

              <p className="text-[11px] text-white/40 mt-1.5 leading-tight">
                Use "Invalid" if the claim can't be verified
              </p>
            </div>

            {/* Resolution Note (Optional) */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-white/90 mb-1.5">
                Why? <span className="text-white/50 font-normal">(optional)</span>
              </label>
              <textarea
                id="note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Brief explanation of the outcome"
                maxLength={280}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition-all"
              />
              <div className="flex items-center justify-end mt-1">
                <p className="text-[11px] text-white/40">{resolutionNote.length}/280</p>
              </div>
            </div>

            {/* Evidence URL (Optional) */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-white/90 mb-1.5">
                Proof or reference <span className="text-white/50 font-normal">(optional)</span>
              </label>
              <input
                id="url"
                type="url"
                value={resolutionUrl}
                onChange={(e) => setResolutionUrl(e.target.value)}
                placeholder="https://example.com/proof"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            </div>

            {/* Footer with Action Buttons */}
            <div className="p-5 border-t border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm">
              <div className="flex flex-col gap-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm resolution
                    </>
                  )}
                </button>

                {/* Permanence warning */}
                <p className="text-[11px] text-neutral-500 text-center font-medium px-2 leading-tight">
                  This resolution is public and permanent
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm rounded-lg transition-all border border-white/10"
                  disabled={loading}
                >
                  Go back
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
