"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { Prediction } from "@/lib/storage";

interface ProofResolveActionsProps {
  prediction: Prediction;
  onSuccess?: () => void;
}

export default function ProofResolveActions({ prediction }: ProofResolveActionsProps) {
  const { user } = useAuth();

  // Already resolved - don't show resolve actions
  const isResolved = prediction.outcome === "correct" || prediction.outcome === "incorrect" || prediction.outcome === "invalid";
  if (isResolved) {
    return null;
  }

  // Check if the current user owns this claim
  const isOwner = user && (
    (user.id && prediction.userId === user.id) ||
    (prediction.anonId && localStorage.getItem("anonId") === prediction.anonId)
  );

  if (!isOwner) {
    return null;
  }

  return (
    <div className="glass border border-purple-500/30 rounded-2xl overflow-hidden mb-6 shadow-xl bg-purple-900/10">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Your Claim</h2>
            <p className="text-xs text-neutral-400">Ready to resolve?</p>
          </div>
        </div>

        <div className="border-b border-slate-700/30 mb-4" />

        <p className="text-sm text-neutral-300 mb-4">
          You can resolve this claim when you have evidence of the outcome. Resolving correctly builds your reputation score.
        </p>

        <a
          href={`/resolve/${prediction.id}`}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Resolve This Claim
        </a>
      </div>
    </div>
  );
}
