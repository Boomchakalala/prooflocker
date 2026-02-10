"use client";

import { useState } from "react";
import { signUpWithPassword, signInWithPassword, resendConfirmationEmail } from "@/lib/auth";

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: "signup" | "signin";
}

export default function AuthModal({ onClose, onSuccess, defaultMode = "signup" }: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [resending, setResending] = useState(false);

  const handleResendConfirmation = async () => {
    setResending(true);
    setError("");

    const result = await resendConfirmationEmail(confirmationEmail);

    if (result.success) {
      setError("");
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
        setNeedsEmailConfirmation(true);
        setConfirmationEmail(email);
        setLoading(false);
        return;
      }

      // Success!
      setLoading(false);
      onSuccess?.();

      // Show success message briefly before closing
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to update auth state
      }, 500);

    } catch (authError) {
      console.error("[AuthModal] Auth error:", authError);
      setError(authError instanceof Error ? authError.message : "Authentication failed");
      setLoading(false);
    }
  };

  if (needsEmailConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
            <p className="text-slate-300 mb-6">
              We sent a confirmation link to <strong className="text-purple-400">{confirmationEmail}</strong>.
              Click the link to activate your account.
            </p>
            <button
              onClick={handleResendConfirmation}
              disabled={resending}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold disabled:opacity-50 mb-4"
            >
              {resending ? "Sending..." : "Resend confirmation email"}
            </button>
            <div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === "signup" ? "Get started with ProofLocker" : "Sign in to your account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle between sign up and sign in */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              mode === "signin"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            {mode === "signup" && (
              <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === "signup" ? "Creating account..." : "Signing in..."}
              </span>
            ) : (
              mode === "signup" ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our{" "}
          <a href="/legal/terms" className="text-purple-400 hover:text-purple-300">Terms</a>
          {" "}and{" "}
          <a href="/legal/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
