"use client";

import { useState } from "react";
import { PredictionOutcome } from "@/lib/storage";

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
  const [outcome, setOutcome] = useState<PredictionOutcome>(currentOutcome || "pending");
  const [resolutionNote, setResolutionNote] = useState(currentNote || "");
  const [resolutionUrl, setResolutionUrl] = useState(currentUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resolve-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[ResolveModal] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve prediction");
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeColor = (value: PredictionOutcome) => {
    switch (value) {
      case "correct":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "incorrect":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "invalid":
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
      default:
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resolve Prediction
          </h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              What's the outcome?
            </label>

            {/* Primary outcomes: Correct and Incorrect */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setOutcome("correct")}
                className={`px-5 py-4 rounded-lg border-2 font-semibold text-base transition-all ${
                  outcome === "correct"
                    ? "bg-green-500/20 border-green-500/60 text-green-300 ring-2 ring-green-500/40 shadow-lg shadow-green-500/20"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Correct
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOutcome("incorrect")}
                className={`px-5 py-4 rounded-lg border-2 font-semibold text-base transition-all ${
                  outcome === "incorrect"
                    ? "bg-red-500/20 border-red-500/60 text-red-300 ring-2 ring-red-500/40 shadow-lg shadow-red-500/20"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Incorrect
                </div>
              </button>
            </div>

            {/* Secondary outcomes: Invalid and Pending */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome("invalid")}
                className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                  outcome === "invalid"
                    ? "bg-gray-500/20 border-gray-500/50 text-gray-400"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                Invalid
              </button>
              <button
                type="button"
                onClick={() => setOutcome("pending")}
                className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                  outcome === "pending"
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                Pending
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition-all"
            />
            <div className="flex items-center justify-end mt-1">
              <p className="text-xs text-white/40">{resolutionNote.length}/280</p>
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm resolution
                </>
              )}
            </button>

            {/* Permanence warning */}
            <p className="text-xs text-neutral-400 text-center font-medium -mt-1">
              This resolution is public and permanent
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm rounded-lg transition-all border border-white/10"
              disabled={loading}
            >
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
