"use client";

import { useState } from "react";
import { signUpWithPassword, signInWithPassword, resendConfirmationEmail } from "@/lib/auth";
import { getOrCreateUserId } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

interface ClaimModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ClaimModal({ onClose, onSuccess }: ClaimModalProps) {
  const { showScoreToast } = useToast();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [claimedCount, setClaimedCount] = useState(0);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const handleResendConfirmation = async () => {
    setResending(true);
    setError("");

    const result = await resendConfirmationEmail(confirmationEmail);

    if (result.success) {
      setError(""); // Clear any error
      // Show success message in the UI
      alert("Confirmation email sent! Check your inbox.");
    } else {
      setError(result.error || "Failed to resend confirmation email");
    }

    setResending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Sign up or sign in
      const authResult = mode === "signup"
        ? await signUpWithPassword(email, password)
        : await signInWithPassword(email, password);

      if (!authResult.success || !authResult.user) {
        setError(authResult.error || "Authentication failed");
        setLoading(false);
        return;
      }

      // Check if email confirmation is needed (only for signup)
      if (mode === "signup" && authResult.needsEmailConfirmation) {
        console.log("[ClaimModal] Email confirmation required");
        setNeedsEmailConfirmation(true);
        setConfirmationEmail(email);
        setSuccess(true);
        setClaimedCount(0);
        setLoading(false);
        return;
      }

      // Step 2: Immediately claim predictions
      setClaiming(true);
      setLoading(false);

      try {
        const anonId = getOrCreateUserId();

        // Get access token
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          // This shouldn't happen for sign-in, but handle gracefully
          console.error("[ClaimModal] No access token after successful auth");
          setError("Session not ready. Please try signing in again.");
          setClaiming(false);
          return;
        }

        // Call claim API
        const response = await fetch('/api/claim-predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ anonId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to claim predictions');
        }

        const data = await response.json();
        setClaimedCount(data.claimedCount);
        setSuccess(true);

        // Show toast notification for Reputation Score
        if (data.insightPoints) {
          const breakdown = [
            `Migrated anonymous score to account`,
            `Claimed ${data.claimedCount} prediction${data.claimedCount !== 1 ? 's' : ''}`
          ];
          showScoreToast(
            data.insightPoints,
            "Predictions claimed successfully!",
            breakdown
          );
        }

        // Close modal and refresh after 2 seconds
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);

      } catch (claimError) {
        console.error("[ClaimModal] Claim error:", claimError);
        setError(claimError instanceof Error ? claimError.message : "Failed to claim predictions");
        setClaiming(false);
      }

    } catch (authError) {
      console.error("[ClaimModal] Auth error:", authError);
      setError(authError instanceof Error ? authError.message : "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-cyan-900/95 backdrop-blur-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md sm:w-full border-t sm:border border-white/10 shadow-2xl animate-slide-up sm:animate-none max-h-[90vh] overflow-y-auto">
        {!claiming && !success ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Claim my claims
                </h2>
                <p className="text-white/70 text-sm">
                  Save access across devices
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

            {/* Toggle between sign up and sign in */}
            <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === "signin"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {mode === "signup" && (
                  <p className="text-xs text-white/50 mt-1">Minimum 6 characters</p>
                )}
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
                {loading
                  ? (mode === "signup" ? "Creating..." : "Signing in...")
                  : (mode === "signup" ? "Create account" : "Sign in")
                }
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-xs text-white/60">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p>
                  {mode === "signup"
                    ? "Your email is private and never shown publicly. You'll remain Anon in the feed."
                    : "Welcome back. Your predictions are waiting."
                  }
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            {claiming && !success ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-white text-lg">Claiming your predictions...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {needsEmailConfirmation ? (
                  <>
                    <h2 className="text-2xl font-bold text-white">
                      Check your email!
                    </h2>
                    <p className="text-white/70 text-sm text-center px-4">
                      We sent a confirmation link to <span className="font-medium text-white">{confirmationEmail}</span>
                    </p>
                    <p className="text-white/60 text-sm text-center px-4">
                      Click the link to activate your account, then sign in to claim your predictions.
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10 w-full">
                      <button
                        onClick={handleResendConfirmation}
                        disabled={resending}
                        className="w-full px-4 py-2 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resending ? "Sending..." : "Resend confirmation email"}
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2 mt-2 text-sm text-white/60 hover:text-white transition-all"
                      >
                        Close
                      </button>
                    </div>

                    <p className="text-white/40 text-xs text-center mt-2">
                      Don't see it? Check your spam folder.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">
                      Success!
                    </h2>
                    <p className="text-white/70 text-sm">
                      Claimed {claimedCount} prediction{claimedCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-white/50 text-xs">You're signed in. Your predictions are saved.</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
