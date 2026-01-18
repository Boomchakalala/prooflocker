"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);

  // Fallback for older predictions without authorNumber
  const authorNumber = prediction.authorNumber || 1000;
  const onChainStatus = prediction.onChainStatus || "pending";
  const isClaimed = !!prediction.userId;
  const isOwner = currentUserId && prediction.userId === currentUserId;
  const isResolved = prediction.outcome === "correct" || prediction.outcome === "incorrect";

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

  const handleResolveClick = () => {
    // On mobile (< 768px), navigate to resolve page
    // On desktop, show modal
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      router.push(`/resolve/${prediction.id}`);
    } else {
      setShowResolveModal(true);
    }
  };

  // Determine on-chain status
  const isOnChain = () => {
    const deStatus = prediction.deStatus?.toUpperCase();
    return deStatus === "CONFIRMED" || onChainStatus === "confirmed";
  };

  // Determine if resolution is on-chain
  const isResolutionOnChain = () => {
    // Show "Resolved on-chain" if prediction is resolved (has resolvedAt timestamp or resolutionDeStatus confirmed)
    if (!isResolved) return false;

    const resolutionDeStatus = prediction.resolutionDeStatus?.toUpperCase();
    const hasResolvedTimestamp = !!prediction.resolvedAt;
    const hasResolvedTx = resolutionDeStatus === "CONFIRMED";

    return hasResolvedTimestamp || hasResolvedTx;
  };

  // Determine if user can resolve (owner and still pending)
  const canResolve = isOwner && prediction.outcome === "pending";
  const isPending = prediction.outcome === "pending";

  // Truncate title to max 150 characters
  const MAX_TITLE_LENGTH = 150;
  const displayTitle = prediction.textPreview.length > MAX_TITLE_LENGTH
    ? prediction.textPreview.slice(0, MAX_TITLE_LENGTH) + "…"
    : prediction.textPreview;

  return (
    <div className="glass rounded-lg p-4 md:p-4 hover:border-white/10 transition-all flex flex-col h-full shadow-lg shadow-purple-500/5">
      {/* 1. HEADER ROW - Author info + badges */}
      <div className="mb-2">
        {/* Top row: Author info (left) + Status badges (right) - Mobile layout */}
        <div className="flex items-center justify-between gap-2 flex-nowrap mb-1">
          {/* Left: Avatar + Author info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400 border border-blue-500/30 flex-shrink-0">
              {authorNumber.toString().slice(-2)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-neutral-400 min-w-0">
              <span className="whitespace-nowrap flex-shrink-0">Anon #{authorNumber}</span>
              <span className="text-neutral-600 flex-shrink-0">•</span>
              <span className="whitespace-nowrap truncate">{formatRelativeTime(prediction.timestamp)}</span>
              {/* Category badge - inline on desktop only */}
              {prediction.category && (
                <>
                  <span className="text-neutral-600 flex-shrink-0 hidden md:inline">•</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/5 border border-white/10 text-neutral-400 whitespace-nowrap hidden md:inline-block">
                    {prediction.category}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Status badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOnChain() && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1 whitespace-nowrap">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </span>
            )}
            {isResolutionOnChain() && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1 whitespace-nowrap">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolved
              </span>
            )}
          </div>
        </div>

        {/* Category row - Mobile only, separate line below */}
        {prediction.category && (
          <div className="md:hidden">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/5 border border-white/10 text-neutral-400 whitespace-nowrap">
              {prediction.category}
            </span>
          </div>
        )}
      </div>

      {/* 3. TITLE - Prediction text */}
      <h3 className="text-white text-base mb-2.5 md:mb-3 font-normal w-full min-w-0 line-clamp-2 leading-snug min-h-[2.75em]">
        {displayTitle}
      </h3>

      {/* 4. OUTCOME ROW */}
      <div className="flex items-center gap-2 mb-2.5 md:mb-3">
        <span className="text-xs md:text-sm uppercase tracking-wide text-white/50 font-medium">Outcome</span>
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

      {/* 5. FINGERPRINT BLOCK */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-2 mb-2.5 md:mb-3 opacity-60 md:opacity-100 scale-95 md:scale-100 origin-left">
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

      {/* 6. ACTIONS ROW - Grid layout with emphasis on View proof */}
      <div className="grid grid-cols-[1.6fr_1fr_44px] gap-3 items-stretch">
        {/* View proof button - PRIMARY ACTION */}
        <Link
          href={`/proof/${prediction.publicSlug}`}
          className="text-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center"
          title="View proof details"
        >
          View proof
        </Link>

        {/* Resolve or Resolved button */}
        {isPending ? (
          <button
            onClick={canResolve ? handleResolveClick : undefined}
            disabled={!canResolve}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all border whitespace-nowrap flex items-center justify-center gap-1.5 ${
              canResolve
                ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-amber-500/40 hover:border-amber-600/50 cursor-pointer shadow-md shadow-amber-500/15 hover:shadow-lg hover:shadow-amber-500/25"
                : "text-neutral-500 bg-neutral-800/50 border-neutral-700/30 cursor-not-allowed opacity-60"
            }`}
            title={canResolve ? "Resolve this prediction" : "Only the creator can resolve"}
          >
            {canResolve ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            <span className="hidden sm:inline">Resolve</span>
            <span className="sm:hidden text-xs">Resolve</span>
          </button>
        ) : (
          <button
            disabled
            className={`px-3 py-2.5 text-sm font-medium rounded-lg border whitespace-nowrap cursor-not-allowed flex items-center justify-center gap-1.5 ${
              prediction.outcome === "correct"
                ? "text-green-400 bg-green-500/10 border-green-500/30"
                : "text-red-400 bg-red-500/10 border-red-500/30"
            }`}
            title={`Resolved as ${prediction.outcome}`}
          >
            {prediction.outcome === "correct" ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="hidden sm:inline">Resolved</span>
            <span className="sm:hidden text-xs">Resolved</span>
          </button>
        )}

        {/* Share button - Square */}
        <button
          onClick={copyLink}
          className="w-11 h-full text-sm font-medium text-white glass hover:bg-white/10 rounded-lg transition-all border border-white/10 flex items-center justify-center"
          title="Share this prediction"
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
