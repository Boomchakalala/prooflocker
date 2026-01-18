"use client";

import { useState, useEffect } from "react";

interface ContestModalProps {
  predictionId: string;
  predictionText: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContestModal({
  predictionId,
  predictionText,
  onClose,
  onSuccess,
}: ContestModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const isValid = reason.trim().length >= 10 && reason.trim().length <= 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Reason must be between 10 and 1000 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictionId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create contest");
      }

      console.log("[ContestModal] Success:", data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[ContestModal] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  const charCount = reason.trim().length;
  const isUnderMin = charCount < 10;
  const isOverMax = charCount > 1000;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 md:p-6 pt-8 md:pt-6"
      onClick={onClose}
    >
      {/* Backdrop - More opaque on mobile */}
      <div className="absolute inset-0 bg-black/85 md:bg-black/70 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl p-6 max-w-md w-full border border-orange-500/20 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto mt-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Contest Resolution
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

        {/* Prediction Preview */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/50 mb-1">Contesting prediction:</p>
          <p className="text-sm text-white/90 font-medium">{predictionText}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Textarea */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-white/80 mb-2">
              Why do you disagree with this resolution? *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the resolution is incorrect. Include evidence or sources if possible."
              rows={5}
              maxLength={1000}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 resize-none transition-colors ${
                isUnderMin && charCount > 0
                  ? "border-red-500/50 focus:ring-red-500"
                  : isOverMax
                  ? "border-red-500/50 focus:ring-red-500"
                  : "border-white/10 focus:ring-orange-500"
              }`}
              required
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {charCount === 0 ? (
                  <p className="text-xs text-white/40">Min 10 characters required</p>
                ) : isUnderMin ? (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Need {10 - charCount} more characters
                  </p>
                ) : isOverMax ? (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {charCount - 1000} characters over limit
                  </p>
                ) : (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Looks good
                  </p>
                )}
              </div>
              <p className={`text-xs ${isOverMax ? "text-red-400 font-medium" : "text-white/40"}`}>
                {charCount}/1000
              </p>
            </div>
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
              disabled={loading || !isValid}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Submit Contest
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
          <p className="text-xs text-orange-400 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Your contest will be public and reviewed by admins. Include clear evidence to support your claim.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
