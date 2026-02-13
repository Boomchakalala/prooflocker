"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { updatePassword } from "@/lib/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase implicit flow: the session is extracted from the URL hash automatically
    // Wait for Supabase to detect the recovery token
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for auth event in case it takes longer
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
            setSessionReady(true);
            subscription.unsubscribe();
          }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          setSessionReady(true); // Let them try anyway
        }, 5000);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const result = await updatePassword(password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/app");
      }, 2000);
    } else {
      setError(result.error || "Failed to update password. The reset link may have expired.");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Password updated</h3>
            <p className="text-slate-300 mb-2">Your password has been changed successfully.</p>
            <p className="text-slate-500 text-sm">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Set New Password</h2>
          <p className="text-slate-400 text-sm">Choose a new password for your account</p>
        </div>

        {!sessionReady ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Verifying reset link...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                New Password
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
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
                minLength={6}
                autoComplete="new-password"
              />
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
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
