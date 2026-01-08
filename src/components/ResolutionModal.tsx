"use client";

import { useState } from "react";
import type { PredictionOutcome } from "@/lib/storage";

interface ResolutionModalProps {
  predictionId: string;
  currentOutcome: PredictionOutcome;
  currentNote?: string;
  currentUrl?: string;
  onClose: () => void;
  onSuccess: (outcome: PredictionOutcome) => void;
}

export default function ResolutionModal({
  predictionId,
  currentOutcome,
  currentNote,
  currentUrl,
  onClose,
  onSuccess,
}: ResolutionModalProps) {
  const [outcome, setOutcome] = useState<"correct" | "incorrect">(
    currentOutcome === "incorrect" ? "incorrect" : "correct"
  );
  const [resolutionNote, setResolutionNote] = useState(currentNote || "");
  const [resolutionUrl, setResolutionUrl] = useState(currentUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = resolutionNote.length;
  const maxChars = 280;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/predictions/${predictionId}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          resolutionNote: resolutionNote.trim() || undefined,
          resolutionUrl: resolutionUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update resolution");
      }

      onSuccess(outcome);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update resolution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full border border-neutral-300 shadow-xl">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-black">Resolve Prediction</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Mark this prediction as resolved. Original text cannot be edited.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Outcome selection */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Outcome
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOutcome("correct")}
                className={`flex-1 px-4 py-3 rounded border transition-all text-sm font-medium ${
                  outcome === "correct"
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400"
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => setOutcome("incorrect")}
                className={`flex-1 px-4 py-3 rounded border transition-all text-sm font-medium ${
                  outcome === "incorrect"
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400"
                }`}
              >
                False
              </button>
            </div>
          </div>

          {/* Resolution note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-black mb-2">
              Resolution Note <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="note"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              maxLength={maxChars}
              rows={3}
              placeholder="Add context about how this prediction resolved..."
              className="w-full px-3 py-2 border border-neutral-300 rounded text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  charCount > maxChars - 20 ? "text-red-600" : "text-neutral-400"
                }`}
              >
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Reference URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-black mb-2">
              Reference URL <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              id="url"
              type="url"
              value={resolutionUrl}
              onChange={(e) => setResolutionUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-neutral-300 rounded text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Link to evidence or source supporting this resolution
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Resolution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
