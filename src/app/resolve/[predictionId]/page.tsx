"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PredictionOutcome } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ predictionId: string }>;
};

export default function ResolvePage({ params }: Props) {
  const router = useRouter();
  const [predictionId, setPredictionId] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [outcome, setOutcome] = useState<PredictionOutcome>("pending");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionUrl, setResolutionUrl] = useState("");

  // Unwrap params
  useEffect(() => {
    params.then(p => setPredictionId(p.predictionId));
  }, [params]);

  // Fetch prediction
  useEffect(() => {
    if (!predictionId) return;

    const fetchPrediction = async () => {
      try {
        const { data, error } = await supabase
          .from("predictions")
          .select("*")
          .eq("id", predictionId)
          .single();

        if (error) throw error;

        setPrediction(data);
        setOutcome(data.outcome || "pending");
        setResolutionNote(data.resolutionNote || "");
        setResolutionUrl(data.resolutionUrl || "");
      } catch (err) {
        console.error("Error fetching prediction:", err);
        setError("Failed to load prediction");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [predictionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
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

      console.log("[ResolvePage] Success:", data);

      // Navigate back to app feed
      router.push("/app");
    } catch (err) {
      console.error("[ResolvePage] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve prediction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center glass border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-neutral-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.push("/app")}
            className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all"
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-[#2E5CFF]/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-[#5B21B6]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-4 md:py-8">
        {/* Header with back button */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to feed
          </button>
        </div>

        {/* Main resolve card */}
        <div className="glass border border-white/10 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resolve Prediction
            </h3>
          </div>

          {/* Prediction Preview */}
          {prediction && (
            <div className="p-4 md:p-5 border-b border-white/10 bg-white/[0.02]">
              <p className="text-[10px] md:text-xs text-white/50 mb-2 uppercase tracking-wide">Resolving</p>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">{prediction.textPreview || prediction.text}</p>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-5 space-y-4">
              {/* Outcome Selection */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2.5">
                  What's the outcome?
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Correct */}
                  <button
                    type="button"
                    onClick={() => setOutcome("correct")}
                    className={`w-full h-11 md:h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === "correct"
                        ? "bg-green-500/15 border-green-500/50 text-green-300 ring-1 ring-green-500/30"
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
                    className={`w-full h-11 md:h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === "incorrect"
                        ? "bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30"
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
                    className={`w-full h-11 md:h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === "invalid"
                        ? "bg-gray-500/15 border-gray-500/50 text-gray-300 ring-1 ring-gray-500/30"
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
                    className={`w-full h-11 md:h-12 rounded-lg border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      outcome === "pending"
                        ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-300 ring-1 ring-yellow-500/30"
                        : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                  </button>
                </div>

                <p className="text-[10px] md:text-[11px] text-white/40 mt-2 leading-tight">
                  Use "Invalid" if the prediction can't be verified
                </p>
              </div>

              {/* Resolution Note (Optional) */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-white/90 mb-2">
                  Why? <span className="text-white/50 font-normal">(optional)</span>
                </label>
                <textarea
                  id="note"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Brief explanation of the outcome"
                  maxLength={280}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition-all"
                />
                <div className="flex items-center justify-end mt-1">
                  <p className="text-[10px] md:text-[11px] text-white/40">{resolutionNote.length}/280</p>
                </div>
              </div>

              {/* Evidence URL (Optional) */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-white/90 mb-2">
                  Proof or reference <span className="text-white/50 font-normal">(optional)</span>
                </label>
                <input
                  id="url"
                  type="url"
                  value={resolutionUrl}
                  onChange={(e) => setResolutionUrl(e.target.value)}
                  placeholder="https://example.com/proof"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Footer with Action Buttons */}
            <div className="p-4 md:p-5 border-t border-white/10 bg-[#0a0a0a]/50">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm md:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none mb-2"
              >
                {submitting ? (
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
              <p className="text-[10px] md:text-[11px] text-neutral-500 text-center font-medium mb-2">
                This resolution is public and permanent
              </p>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm rounded-lg transition-all border border-white/10"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
