"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prediction, type PredictionOutcome } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import { getSiteUrl } from "@/lib/config";
import Link from "next/link";
import ResolveModal from "./ResolveModal";
import ResolutionModalWithEvidence from "./ResolutionModalWithEvidence";
import ContestModal from "./ContestModal";
import OutcomeBadge from "./OutcomeBadge";
import EvidenceGradeBadge from "./EvidenceGradeBadge";
import { getTierInfo, type ReliabilityTier } from "@/lib/user-scoring";
import { getTierInfo as getEvidenceTierInfo } from "@/lib/evidence-scoring";

interface PredictionCardProps {
  prediction: Prediction & {
    // Extended fields from new schema (may not exist on all predictions yet)
    lifecycleStatus?: "draft" | "locked" | "resolved" | "contested" | "final";
    finalOutcome?: PredictionOutcome;
    adminOverridden?: boolean;
    adminNote?: string;
    resolvedBy?: string;
    evidence_score?: number; // New evidence score field (0-100)
    author_reliability_tier?: ReliabilityTier; // Author's reliability tier
  };
  currentUserId?: string | null; // Current authenticated user ID
  onOutcomeUpdate?: () => void; // Callback to refresh predictions
  onHide?: (id: string) => void; // Callback to hide prediction
  isPreview?: boolean; // If true, renders as non-clickable mockup for landing page
}

export default function PredictionCard({ prediction, currentUserId, onOutcomeUpdate, onHide, isPreview = false }: PredictionCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

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
    // Always navigate to the full resolve page (consistent with proof page behavior)
    router.push(`/resolve/${prediction.id}`);
  };

  const handleReport = async (reason: string) => {
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: prediction.id,
          reason,
        }),
      });
      setShowMenu(false);
      setShowReportMenu(false);
      alert('Thank you for your report. We will review this prediction.');
    } catch (error) {
      console.error('Error reporting:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleHide = () => {
    if (onHide) {
      onHide(prediction.id);
    }
    setShowMenu(false);
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

  // Helper to get category styling - Original theme with more vibrant colors
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto':
        return 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border-cyan-400/50 text-cyan-300';
      case 'sports':
        return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/50 text-orange-300';
      case 'tech':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-300';
      case 'personal':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 text-purple-300';
      case 'politics':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300';
      case 'markets':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/50 text-emerald-300';
      case 'culture':
        return 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/50 text-pink-300';
      case 'other':
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/50 text-gray-300';
    }
  };

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
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        );
      case 'markets':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        );
      case 'culture':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
        );
    }
  };

  // Get evidence tier info if score exists
  const evidenceTier = prediction.evidence_score ?
    getEvidenceTierInfo(
      prediction.evidence_score >= 76 ? 'strong' :
      prediction.evidence_score >= 51 ? 'solid' :
      prediction.evidence_score >= 26 ? 'basic' : 'unverified'
    ) : null;

  // Get author reliability tier info
  const authorTierInfo = prediction.author_reliability_tier ?
    getTierInfo(prediction.author_reliability_tier) : null;

  // Handler for view button click
  const handleViewClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      return;
    }
    // Navigate to proof page
    router.push(`/proof/${prediction.publicSlug}`);
  };

  // Determine card border style - Professional styling with subtle gradients
  const getCardBorderStyle = () => {
    if (prediction.outcome === 'correct') {
      if (prediction.evidence_score && prediction.evidence_score >= 76) {
        // High quality correct: Premium emerald glow
        return 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]';
      }
      // Correct: Subtle emerald accent
      return 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]';
    }
    if (prediction.outcome === 'incorrect') {
      // Incorrect: Subtle red accent
      return 'border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]';
    }
    // Pending: Subtle purple accent
    return 'border-purple-500/20 bg-purple-500/5 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]';
  };

  // Card content (shared between Link and div versions)
  const cardContent = (
    <>
      {/* Quality indicator bar - top - Emerald for high quality verified predictions */}
      {prediction.evidence_score && prediction.evidence_score >= 76 && isResolved && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
      )}

      {/* 1. HEADER ROW - Author info + Time + Menu */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Author info + Reliability Tier */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/15 to-cyan-500/15 flex items-center justify-center text-sm font-bold text-purple-300 border border-purple-500/30 flex-shrink-0">
              {authorNumber.toString().slice(-2)}
            </div>
            <div className="flex flex-col min-w-0">
              {isPreview ? (
                <span className="text-sm font-semibold text-white truncate">
                  Anon #{authorNumber}
                </span>
              ) : (
                <Link
                  href={`/user/${prediction.userId || prediction.anonId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors truncate"
                >
                  Anon #{authorNumber}
                </Link>
              )}
              {/* Author Reliability Tier Badge */}
              {authorTierInfo && (
                <span className={`text-[10px] font-bold uppercase tracking-wide ${authorTierInfo.color}`}>
                  {authorTierInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Right: Time + Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500">{formatRelativeTime(prediction.timestamp)}</span>
            {/* Three-dot menu - hide in preview mode */}
            {!isPreview && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>

              {/* Dropdown menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] z-50 py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleHide();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Hide this
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowReportMenu(!showReportMenu);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Report
                        </div>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {showReportMenu && (
                        <div className="absolute left-full top-0 ml-1 w-40 bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] py-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReport('spam');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors"
                          >
                            Spam
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReport('low_quality');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors"
                          >
                            Low Quality
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReport('inappropriate');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors"
                          >
                            Inappropriate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              </div>
            )}
          </div>
        </div>

        {/* Category + Status badges row */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {prediction.category && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getCategoryStyle(prediction.category)}`}>
              {getCategoryIcon(prediction.category)}
              {prediction.category}
            </span>
          )}
          {isOnChain() && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/15 border border-purple-400/40 text-purple-300 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              On-Chain
            </span>
          )}
          {isResolutionOnChain() && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      {/* 2. TITLE - Prediction text */}
      <h3 className="text-white text-base font-semibold mb-4 line-clamp-3 leading-snug">
        {displayTitle}
      </h3>

      {/* 3. OUTCOME + EVIDENCE SCORE - Professional styling */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        {/* Outcome Badge - Professional clean colors */}
        {prediction.outcome === 'correct' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Correct
          </span>
        ) : prediction.outcome === 'incorrect' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Incorrect
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
            </svg>
            Pending
          </span>
        )}

        {/* Evidence Score Badge - Prominent when resolved */}
        {prediction.evidence_score !== undefined && isResolved && evidenceTier && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${evidenceTier.bgColor} ${evidenceTier.borderColor}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className={`text-sm font-bold ${evidenceTier.color}`}>
              {prediction.evidence_score}/100
            </span>
          </div>
        )}
      </div>

      {/* 4. HASH - Professional dark display */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-3 mb-4 hover:bg-black/50 hover:border-white/15 transition-all">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-[11px] text-gray-400 truncate leading-tight">
            {prediction.hash.slice(0, 12)}...{prediction.hash.slice(-8)}
          </code>
          {!isPreview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyHash();
              }}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 5. ACTIONS ROW - Professional button styling */}
      <div className={`grid gap-2.5 items-stretch mt-auto ${canResolve ? 'grid-cols-[1.5fr_1fr_auto]' : 'grid-cols-[1fr_auto]'}`}>
        {/* View proof button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleViewClick(e);
          }}
          className={`px-4 py-2.5 text-sm font-semibold text-cyan-300 bg-cyan-500/10 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/15 flex items-center justify-center gap-2 ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>

        {/* Resolve button - only for owner of pending predictions */}
        {canResolve && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResolveClick();
            }}
            className="px-3 py-2.5 text-sm font-semibold rounded-lg transition-all border text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 hover:border-amber-400/50 flex items-center justify-center gap-1.5"
          >
            Resolve
          </button>
        )}

        {/* Share button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copyLink();
          }}
          className="w-11 h-full text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg transition-all border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center hover:bg-purple-500/15"
        >
          {linkCopied ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
        </button>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <ResolutionModalWithEvidence
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
    </>
  );

  // Render as non-clickable div for preview mode (landing page)
  if (isPreview) {
    return (
      <div className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border ${getCardBorderStyle()}`}>
        {cardContent}
      </div>
    );
  }

  // Render as Link for feed page (clickable)
  return (
    <Link
      href={`/proof/${prediction.publicSlug}`}
      className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${getCardBorderStyle()}`}
    >
      {cardContent}
    </Link>
  );
}
