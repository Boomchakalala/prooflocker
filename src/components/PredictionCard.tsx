"use client";

import { useState } from "react";
import { Prediction, type PredictionOutcome } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import { getSiteUrl } from "@/lib/config";
import Link from "next/link";
import ResolveModal from "./ResolveModal";
import ContestModal from "./ContestModal";
import OutcomeBadge from "./OutcomeBadge";

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

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${getSiteUrl()}/proof/${prediction.publicSlug}`;

    // Try native share on mobile devices
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ProofLocker Prediction',
          text: prediction.textPreview,
          url: url
        });
        return; // Success, don't show copied state
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name === 'AbortError') {
          return; // User cancelled, don't copy
        }
      }
    }

    // Fallback to clipboard copy
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Determine on-chain status
  const isOnChain = () => {
    const deStatus = prediction.deStatus?.toUpperCase();
    return deStatus === "CONFIRMED" || onChainStatus === "confirmed";
  };

  // Determine if resolution is on-chain
  const isResolutionOnChain = () => {
    const resolutionDeStatus = prediction.resolutionDeStatus?.toUpperCase();
    return resolutionDeStatus === "CONFIRMED" && prediction.outcome !== "pending";
  };

  // Determine if user can resolve (owner and still pending)
  const canResolve = isOwner && prediction.outcome === "pending";

  // Determine if user can share (owner and claimed)
  const canShare = isOwner && isClaimed;

  return (
    <div className="glass rounded-lg p-3 md:p-4 hover:border-white/10 transition-all flex flex-col h-full shadow-lg shadow-purple-500/5">
      {/* Header row: Badge + Author + Time + Status Pills */}
      <div className="flex items-start justify-between mb-1.5 md:mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Small circular badge with number */}
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400 border border-blue-500/30">
            {authorNumber.toString().slice(-2)}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-neutral-400">Anon #{authorNumber}</span>
            <span className="text-xs text-neutral-600">•</span>
            <span className="text-xs text-neutral-500">{formatRelativeTime(prediction.timestamp)}</span>
            {prediction.category && (
              <>
                <span className="text-xs text-neutral-600">•</span>
                <span className="text-xs text-neutral-600">{prediction.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Inline status pills */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {/* Only show Claimed badge if user owns this proof */}
          {isClaimed && isOwner && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              Yours
            </span>
          )}
          {isOnChain() && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {isResolutionOnChain() && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Main content: Prediction text - VISUAL FOCUS */}
      <p className="text-white text-lg leading-snug mb-2 md:mb-3 font-normal flex-grow line-clamp-2">
        {prediction.textPreview}
      </p>

      {/* Status line: Outcome - More prominent */}
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <span className="text-[10px] uppercase tracking-wide text-white/40">Outcome</span>
        <OutcomeBadge
          outcome={prediction.outcome || "pending"}
          size="sm"
          showLabel="short"
        />
        {/* Has note indicator */}
        {prediction.resolutionNote && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/50"
            title="Has resolution note"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </span>
        )}
      </div>

      {/* Resolution URL */}
      {prediction.resolutionUrl && (
        <div className="mb-2 md:mb-3">
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

      {/* Metadata: FINGERPRINT - Reduced visual noise */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-2 mb-2 md:mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-medium text-neutral-700 mb-0.5 uppercase tracking-wider">
              Fingerprint
            </label>
            <code className="font-mono text-[10px] text-neutral-500 truncate block leading-tight">
              {prediction.hash.slice(0, 20)}...{prediction.hash.slice(-12)}
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

      {/* Actions row - Clearer hierarchy */}
      <div className="flex flex-col gap-1.5">
        {/* Primary action row: View Proof + Share */}
        <div className="flex gap-1.5">
          <Link
            href={`/proof/${prediction.publicSlug}`}
            className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            title="View permanent proof page"
          >
            Open proof card
          </Link>

          {/* Share button - Only for claimed predictions owned by current user */}
          {canShare && (
            <button
              onClick={copyLink}
              className="px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
              title="Share prediction"
            >
              {linkCopied ? (
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
              )}
            </button>
          )}
        </div>

        {/* Secondary action: Resolve button */}
        {canResolve && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600/90 hover:bg-green-600 rounded-lg transition-all border border-green-500/30"
          >
            Resolve
          </button>
        )}
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
