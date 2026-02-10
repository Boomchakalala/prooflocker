"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      setError("Please type the confirmation phrase exactly");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        setError("Session expired. Please sign in again.");
        setDeleting(false);
        return;
      }

      // Call delete API
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Success - sign out and redirect
      await signOut();
      alert("Your account has been deleted successfully.");
      router.push("/");

    } catch (error) {
      console.error("Error deleting account:", error);
      setError(error instanceof Error ? error.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white">
      <UnifiedHeader />

      <main className="max-w-3xl mx-auto px-4 py-24">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

          {/* Account Info Section */}
          <section className="mb-8 pb-8 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="text-white font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-400">Account ID</div>
                  <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-400">Member Since</div>
                  <div className="text-white font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sign Out Section */}
          <section className="mb-8 pb-8 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Session</h2>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 rounded-lg text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </section>

          {/* Delete Account Section */}
          <section>
            <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-300 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-200 mb-3">
                    Permanently delete your ProofLocker account. This action cannot be undone.
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-xs text-amber-200 mb-4">
                    <strong>Important:</strong> Deleting your account will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Remove your email and authentication data</li>
                      <li>Unlink all claims from your account</li>
                      <li>Delete your reputation statistics</li>
                      <li><strong>NOT delete blockchain records</strong> - claims remain publicly visible</li>
                    </ul>
                  </div>

                  {!showDeleteConfirmation ? (
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all"
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-red-300 mb-2">
                          Type <code className="bg-black/30 px-2 py-1 rounded text-xs">DELETE MY ACCOUNT</code> to confirm
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE MY ACCOUNT"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-red-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting || deleteConfirmText !== "DELETE MY ACCOUNT"}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting ? "Deleting..." : "Confirm Deletion"}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmText("");
                            setError("");
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
