"use client";

import { useState } from "react";
import { sendMagicLink } from "@/lib/auth";

interface ClaimModalProps {
  onClose: () => void;
}

export default function ClaimModal({ onClose }: ClaimModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await sendMagicLink(email);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "Failed to send email");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-cyan-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
        {!sent ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Claim Your Predictions
                </h2>
                <p className="text-white/70 text-sm">
                  Enter your email to claim ownership and access your predictions across devices
                </p>
              </div>
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-xs text-white/60">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  We'll send a magic link to your email. Click it to claim all predictions made from this browser. No password required.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-white/70 text-sm mb-6">
                We've sent a magic link to <span className="font-semibold text-white">{email}</span>
              </p>
              <p className="text-white/60 text-xs mb-6">
                Click the link in your email to claim your predictions. The link will expire in 15 minutes.
              </p>
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
