"use client";

import { useState } from "react";

export default function ProofCardPreview() {
  const [copied, setCopied] = useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText("481d8d02351695940e4412672a4c4e53d6264d0d291f2ed08342aeba445f1be3");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-500 uppercase tracking-wide mb-2">Example proof</p>
          <h3 className="text-2xl font-bold text-white">See how it looks</h3>
        </div>

        {/* Example proof card */}
        <div className="glass border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all glow-purple">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                #1234
              </div>
              <div>
                <div className="text-sm text-neutral-400">Anon #1234</div>
                <div className="text-xs text-neutral-500">Jan 16, 2026 • Crypto</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolved
              </span>
            </div>
          </div>

          {/* Prediction text */}
          <div className="mb-3">
            <p className="text-white text-lg leading-relaxed">
              Bitcoin will hit $100K before the end of 2024
            </p>
          </div>

          {/* Locked date */}
          <div className="text-xs text-neutral-500 mb-3">
            Locked on Jan 16, 2026
          </div>

          {/* Outcome */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-wide text-white/40">Outcome</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              ✓ Correct
            </span>
          </div>

          {/* Fingerprint */}
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-medium text-neutral-700 mb-0.5 uppercase tracking-wider">
                  Fingerprint
                </label>
                <code className="font-mono text-[10px] text-neutral-500 truncate block leading-tight">
                  481d8d02351695940e44...445f1be3
                </code>
              </div>
              <button
                onClick={copyHash}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy fingerprint"
              >
                {copied ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all">
            Open proof card
          </button>
        </div>
      </div>
    </div>
  );
}
