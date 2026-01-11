"use client";

import { useState } from "react";
import { Prediction, type PredictionOutcome } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import ResolveModal from "./ResolveModal";
import ContestModal from "./ContestModal";

interface PredictionCardProps {
  prediction: Prediction & {
    // Extended fields from new schema (may not exist on all predictions yet)
    lifecycleStatus?: "draft" | "locked" | "resolved" | "contested" | "final";
    finalOutcome?: PredictionOutcome;
    adminOverridden?: boolean;
    adminNote?: string;
    resolvedBy?: string;
  };
  currentUserId?: string | null; // Current authenticated user ID
  onOutcomeUpdate?: () => void; // Callback to refresh predictions
}

export default function PredictionCard({ prediction, currentUserId, onOutcomeUpdate }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);

  // Fallback for older predictions without authorNumber
  const authorNumber = prediction.authorNumber || 1000;
  const onChainStatus = prediction.onChainStatus || "pending";
  const isClaimed = !!prediction.userId;
  const isOwner = currentUserId && prediction.userId === currentUserId;
  const lifecycleStatus = prediction.lifecycleStatus || "locked";
  const displayOutcome = prediction.adminOverridden ? prediction.finalOutcome : prediction.outcome;

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/proof/${prediction.publicSlug}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Determine on-chain status
  const isOnChain = () => {
    const deStatus = prediction.deStatus?.toUpperCase();
    return deStatus === "CONFIRMED" || onChainStatus === "confirmed";
  };

  // Determine if user can resolve (owner and not finalized)
  const canResolve = isOwner && lifecycleStatus !== "final";

  // Get outcome label and styling
  const getOutcomeDisplay = () => {
    const outcome = displayOutcome || "pending";
    if (outcome === "correct") return { label: "True", class: "bg-green-500/10 border-green-500/30 text-green-400" };
    if (outcome === "incorrect") return { label: "False", class: "bg-red-500/10 border-red-500/30 text-red-400" };
    if (outcome === "invalid") return { label: "Invalid", class: "bg-neutral-500/10 border-neutral-500/30 text-neutral-400" };
    return { label: "Pending", class: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" };
  };

  const outcomeDisplay = getOutcomeDisplay();

  return (
    <div className="glass rounded-xl p-5 hover:border-white/10 transition-all flex flex-col h-full shadow-lg shadow-purple-500/5">
      {/* Header row: Badge + Author + Time + Status Pills */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Small circular badge with number */}
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400 border border-blue-500/30">
            {authorNumber.toString().slice(-2)}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-400">Anon #{authorNumber}</span>
            <span className="text-xs text-neutral-600">•</span>
            <span className="text-sm text-neutral-500">{formatRelativeTime(prediction.timestamp)}</span>
            {prediction.category && (
              <>
                <span className="text-xs text-neutral-600">•</span>
                <span className="text-xs text-neutral-600">{prediction.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Inline status pills */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isClaimed && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
              Claimed
            </span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
            Locked
          </span>
          {isOnChain() && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-500/10 border border-green-500/30 text-green-400">
              On-chain
            </span>
          )}
        </div>
      </div>

      {/* Main content: Prediction text - VISUAL FOCUS */}
      <p className="text-white text-xl leading-snug mb-4 font-normal flex-grow">
        {prediction.textPreview}
      </p>

      {/* Status line: Outcome - More prominent */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-xs text-neutral-600 uppercase tracking-wide font-medium">Status</span>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${outcomeDisplay.class}`}>
          {outcomeDisplay.label}
          {prediction.adminOverridden && (
            <svg
              className="w-3 h-3 ml-1.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              title="Admin finalized"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </div>

      {/* Resolution note */}
      {prediction.resolutionNote && (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1.5 font-medium">Resolution note</p>
          <p className="text-sm text-neutral-300 leading-relaxed">{prediction.resolutionNote}</p>
        </div>
      )}

      {/* Resolution URL */}
      {prediction.resolutionUrl && (
        <div className="mb-4">
          <a
            href={prediction.resolutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1.5 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View evidence
          </a>
        </div>
      )}

      {/* Admin note */}
      {prediction.adminOverridden && prediction.adminNote && (
        <div className="mb-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-purple-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Admin note
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed">{prediction.adminNote}</p>
        </div>
      )}

      {/* Metadata: FINGERPRINT - Reduced visual noise */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-2.5 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-medium text-neutral-700 mb-1 uppercase tracking-wider">
              Fingerprint
            </label>
            <code className="font-mono text-[11px] text-neutral-500 truncate block leading-tight">
              {prediction.hash.slice(0, 20)}...{prediction.hash.slice(-12)}
            </code>
          </div>
          <button
            onClick={copyHash}
            className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Copy fingerprint"
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-500"
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
                className="w-4 h-4 text-neutral-600"
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

      {/* Actions row - Clearer hierarchy */}
      <div className="flex flex-col gap-2">
        {/* Primary action: View Proof - DOMINATES */}
        <Link
          href={`/proof/${prediction.publicSlug}`}
          className="w-full text-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          title="View permanent proof page"
        >
          View Proof
        </Link>

        {/* Secondary actions row */}
        <div className="flex gap-2">
          {/* Resolve button - Secondary but actionable */}
          {canResolve && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600/90 hover:bg-green-600 rounded-lg transition-all border border-green-500/30"
            >
              Resolve
            </button>
          )}

          {/* Share button - ghost style, muted */}
          <button
            onClick={copyLink}
            className={`px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-300 hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-2 ${!canResolve ? 'flex-1' : ''}`}
            title="Copy link"
          >
            {linkCopied ? (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
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
                <span className="text-green-500 text-xs">Copied</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <ResolveModal
          predictionId={prediction.id}
          currentOutcome={prediction.outcome}
          currentNote={prediction.resolutionNote}
          currentUrl={prediction.resolutionUrl}
          onClose={() => setShowResolveModal(false)}
          onSuccess={() => {
            setShowResolveModal(false);
            onOutcomeUpdate?.();
          }}
        />
      )}

      {/* Contest Modal */}
      {showContestModal && (
        <ContestModal
          predictionId={prediction.id}
          predictionText={prediction.textPreview}
          onClose={() => setShowContestModal(false)}
          onSuccess={() => {
            setShowContestModal(false);
            onOutcomeUpdate?.();
          }}
        />
      )}
    </div>
  );
}
