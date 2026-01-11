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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              What's the outcome?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome("correct")}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  outcome === "correct"
                    ? getOutcomeColor("correct") + " ring-2 ring-green-500/30"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                ✓ Correct
              </button>
              <button
                type="button"
                onClick={() => setOutcome("incorrect")}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  outcome === "incorrect"
                    ? getOutcomeColor("incorrect") + " ring-2 ring-red-500/30"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                ✗ Incorrect
              </button>
              <button
                type="button"
                onClick={() => setOutcome("invalid")}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  outcome === "invalid"
                    ? getOutcomeColor("invalid") + " ring-2 ring-gray-500/30"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                ⊘ Invalid
              </button>
              <button
                type="button"
                onClick={() => setOutcome("pending")}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  outcome === "pending"
                    ? getOutcomeColor("pending") + " ring-2 ring-yellow-500/30"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                ⏳ Pending
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">
              Choose "Invalid" if the prediction can't be verified
            </p>
          </div>

          {/* Resolution Note (Optional) */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-white/80 mb-2">
              Resolution note <span className="text-white/40">(optional)</span>
            </label>
            <textarea
              id="note"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Explain why this outcome is correct (e.g., 'Bitcoin hit $100K on Dec 15, 2026 according to CoinMarketCap')"
              maxLength={280}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-white/40">Max 280 characters</p>
              <p className="text-xs text-white/40">{resolutionNote.length}/280</p>
            </div>
          </div>

          {/* Evidence URL (Optional) */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-white/80 mb-2">
              Evidence link <span className="text-white/40">(optional)</span>
            </label>
            <input
              id="url"
              type="url"
              value={resolutionUrl}
              onChange={(e) => setResolutionUrl(e.target.value)}
              placeholder="https://example.com/proof"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-white/40 mt-1">
              Link to evidence (news article, screenshot, etc.)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Resolution
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Your resolution is public and permanent. Other users can contest it if they disagree.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
