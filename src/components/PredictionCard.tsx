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

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto':
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.89.66 1.96 1.64h1.71c-.08-1.49-1.13-2.79-2.67-3.15V5h-2v1.5c-1.52.37-2.67 1.41-2.67 2.95 0 1.88 1.55 2.81 3.81 3.39 2.02.53 2.41 1.3 2.41 2.14 0 .68-.42 1.43-2.1 1.43-1.69 0-2.31-.72-2.4-1.64H8.41c.1 1.7 1.36 2.66 2.92 3.01V19h2v-1.5c1.52-.37 2.68-1.33 2.68-2.97 0-2.32-1.81-3.13-3.7-3.39z"/>
          </svg>
        );
      case 'sports':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a10 10 0 0 0 0 20M12 2a10 10 0 0 1 0 20M2 12h20"/>
          </svg>
        );
      case 'tech':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        );
      case 'politics':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 21h18M5 21V7l8-4v18M21 21V10l-8-3"/>
          </svg>
        );
      case 'markets':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 3v18h18M7 16l4-4 4 4 6-6"/>
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
    }
  };

  // Mock accountability score based on outcome (for landing page examples)
  const getAccountabilityScore = () => {
    if (prediction.outcome === 'correct') {
      // Use hash to generate consistent score between 85-100
      const hashNum = parseInt(prediction.hash.slice(0, 8), 16);
      return 85 + (hashNum % 16);
    }
    return null;
  };

  const accountabilityScore = getAccountabilityScore();

  return (
    <Link
      href={`/proof/${prediction.publicSlug}`}
      className={`group relative rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col h-full shadow-xl overflow-hidden border cursor-pointer ${
        prediction.outcome === 'correct'
          ? 'border-[#22C55E]/20 hover:border-[#22C55E]/40 bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-[#22C55E]/10'
          : 'border-purple-500/20 hover:border-purple-500/40 bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10'
      } backdrop-blur-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(167,139,250,0.3),0_0_20px_rgba(0,212,255,0.2)]`}
    >
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
                  <span className="px-2 py-1 text-[10px] font-medium rounded bg-white/5 border border-white/10 text-neutral-400 whitespace-nowrap hidden md:inline-flex items-center gap-1">
                    {getCategoryIcon(prediction.category)}
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
                Locked
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            )}
            {isResolutionOnChain() && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1 whitespace-nowrap">
                Resolved
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Category row - Mobile only, separate line below */}
        {prediction.category && (
          <div className="md:hidden">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-white/5 border border-white/10 text-neutral-400 whitespace-nowrap">
              {getCategoryIcon(prediction.category)}
              {prediction.category}
            </span>
          </div>
        )}
      </div>

      {/* 3. TITLE - Prediction text */}
      <h3 className="text-white text-base md:text-lg mb-3 font-medium w-full min-w-0 line-clamp-2 leading-snug min-h-[3em]">
        {displayTitle}
      </h3>

      {/* 4. OUTCOME ROW with Accountability */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs tracking-normal text-white/40 font-normal">Outcome</span>
          {/* Enhanced Outcome Badge */}
          {prediction.outcome === 'correct' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E] text-white text-sm font-bold shadow-lg shadow-green-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Correct
            </span>
          ) : prediction.outcome === 'incorrect' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Incorrect
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B] text-white text-sm font-bold shadow-lg shadow-amber-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              Pending
            </span>
          )}
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
        {/* Accountability Score - Right aligned */}
        {accountabilityScore && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold whitespace-nowrap">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {accountabilityScore}%
          </span>
        )}
      </div>

      {/* 5. FINGERPRINT BLOCK */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-2.5 mb-3 group/fingerprint hover:bg-black/40 hover:border-white/10 transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-medium text-neutral-600 mb-1 uppercase tracking-wider">
              On-chain Hash
            </label>
            <code
              className="font-mono text-[11px] text-neutral-400 truncate block leading-tight group-hover/fingerprint:text-neutral-300 transition-colors"
              title="Immutable proof - cryptographic hash on Constellation DAG"
            >
              {prediction.hash.slice(0, 16)}...{prediction.hash.slice(-10)}
            </code>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyHash();
            }}
            className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors group/copy"
            title="Copy full hash"
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
                className="w-4 h-4 text-neutral-500 group-hover/copy:text-neutral-300"
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

      {/* 6. ACTIONS ROW - Grid layout adapts based on resolve button presence */}
      <div className={`grid gap-3 items-stretch ${canResolve ? 'grid-cols-[1.6fr_1fr_40px]' : 'grid-cols-[1fr_40px]'}`}>
        {/* View proof button - Enhanced with gradient hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Navigation is handled by parent Link
          }}
          className="text-center px-4 py-2.5 text-sm font-semibold text-white glass rounded-lg transition-all border border-white/10 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:shadow-[0_0_20px_rgba(147,112,219,0.3)] flex items-center justify-center gap-2"
          title="View immutable proof"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View proof
        </button>

        {/* Resolve button - only for owner of pending predictions */}
        {canResolve && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResolveClick();
            }}
            className="px-3 py-2.5 text-sm font-semibold rounded-lg transition-all border whitespace-nowrap flex items-center justify-center gap-1.5 text-amber-400 bg-amber-500/[0.05] hover:bg-amber-500/[0.1] border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
            title="Resolve this prediction"
          >
            <span className="hidden sm:inline">Resolve</span>
            <span className="sm:hidden text-xs">Resolve</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        {/* Share button - Square with tooltip */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copyLink();
          }}
          className="w-11 h-full text-sm font-semibold text-white glass rounded-lg transition-all border border-white/10 hover:border-[#00ff00]/50 flex items-center justify-center hover:bg-white/10 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          title="Share immutable card"
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
    </Link>
  );
}
