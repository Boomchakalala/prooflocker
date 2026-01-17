"use client";

import { useState, useEffect } from "react";
import { Prediction } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminModerationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check session storage on mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      loadPredictions();
    }
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/predictions");
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      } else {
        setError("Failed to load predictions");
      }
    } catch (err) {
      setError("Failed to load predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem("admin_auth", "true");
        setIsAuthenticated(true);
        loadPredictions();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  const handleHide = async (id: string) => {
    const reason = prompt("Enter reason for hiding this prediction:");
    if (!reason) return;

    setActionLoading(id);
    try {
      const response = await fetch("/api/admin/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });

      if (response.ok) {
        await loadPredictions(); // Reload list
      } else {
        const data = await response.json();
        alert(`Failed to hide: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to hide prediction");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (id: string) => {
    if (!confirm("Unhide this prediction and make it public again?")) return;

    setActionLoading(id);
    try {
      const response = await fetch("/api/admin/unhide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await loadPredictions(); // Reload list
      } else {
        const data = await response.json();
        alert(`Failed to unhide: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to unhide prediction");
    } finally {
      setActionLoading(null);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="glass rounded-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Moderation</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400 py-12">
            Loading predictions...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-neutral-400 mb-4">
              Total: {predictions.length} predictions
            </div>

            {predictions.map((pred) => (
              <div
                key={pred.id}
                className={`glass rounded-lg p-4 ${
                  pred.moderationStatus === "hidden"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          pred.moderationStatus === "hidden"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : "bg-green-500/10 border border-green-500/30 text-green-400"
                        }`}
                      >
                        {pred.moderationStatus === "hidden"
                          ? "Hidden"
                          : "Active"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatRelativeTime(pred.timestamp)}
                      </span>
                    </div>

                    {/* Author */}
                    <div className="text-sm text-neutral-400 mb-2">
                      Anon #{pred.authorNumber}
                      {pred.userId && " (Claimed)"}
                    </div>

                    {/* Text preview */}
                    <p className="text-white mb-2 line-clamp-2 w-full min-w-0 leading-snug">{pred.textPreview}</p>

                    {/* Hidden reason */}
                    {pred.moderationStatus === "hidden" &&
                      pred.hiddenReason && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                          <p className="text-xs text-red-400">
                            <strong>Reason:</strong> {pred.hiddenReason}
                          </p>
                          {pred.hiddenAt && (
                            <p className="text-xs text-red-400 mt-1">
                              Hidden {formatRelativeTime(pred.hiddenAt)}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Hash */}
                    <code className="text-xs text-neutral-500 font-mono">
                      {pred.hash.slice(0, 16)}...
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {pred.moderationStatus === "active" ? (
                      <button
                        onClick={() => handleHide(pred.id)}
                        disabled={actionLoading === pred.id}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm rounded transition-colors"
                      >
                        {actionLoading === pred.id ? "..." : "Hide"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnhide(pred.id)}
                        disabled={actionLoading === pred.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded transition-colors"
                      >
                        {actionLoading === pred.id ? "..." : "Unhide"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {predictions.length === 0 && (
              <div className="text-center text-neutral-400 py-12">
                No predictions found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
